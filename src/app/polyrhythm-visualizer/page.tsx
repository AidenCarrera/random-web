"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as Tone from "tone";
import * as THREE from "three";
import {
  CircleDot,
  Clock3,
  Gauge,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Rows3,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

import styles from "./styles.module.css";

type ViewMode = "circle" | "timeline" | "bloom" | "orbit3d";
type PulseKey = `${number}-${number}`;
type Rhythm = {
  count: number;
  color: string;
  glow: string;
  tone: string;
};
type VisualizerProps = {
  rhythms: Rhythm[];
  progress: number;
  /** Cycles completed since the last reset, fractional and never wrapping. */
  turns: number;
  activePulses: Set<PulseKey>;
};

const RHYTHMS: Rhythm[] = [
  [1, "#faf9f6", "rgba(250,249,246,0.34)", "B4"],
  [2, "#fc8c74", "rgba(252,140,116,0.34)", "C5"],
  [3, "#f59851", "rgba(245,152,81,0.34)", "D5"],
  [4, "#e6cb53", "rgba(230,203,83,0.34)", "E5"],
  [5, "#90cb67", "rgba(144,203,103,0.34)", "F5"],
  [6, "#55c991", "rgba(85,201,145,0.34)", "G5"],
  [7, "#40c4bb", "rgba(64,196,187,0.34)", "A5"],
  [8, "#4bbdd9", "rgba(75,189,217,0.34)", "B5"],
  [9, "#5c9fe6", "rgba(92,159,230,0.34)", "C6"],
  [10, "#7e7aeb", "rgba(126,122,235,0.34)", "D6"],
  [11, "#c270de", "rgba(194,112,222,0.34)", "E6"],
  [12, "#e66e9c", "rgba(230,110,156,0.34)", "F6"],
].map(([count, color, glow, tone]) => ({
  count: Number(count),
  color: String(color),
  glow: String(glow),
  tone: String(tone),
}));

const RHYTHM_BY_COUNT = new Map(
  RHYTHMS.map((rhythm) => [rhythm.count, rhythm]),
);
const DEFAULT_RHYTHMS = [3, 4];
const CYCLE_BEATS = 4;
const BPM_MIN = 40;
const BPM_MAX = 220;
const MASTER_GAIN = 0.34;
const TAU = Math.PI * 2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const cycleSeconds = (bpm: number) => (60 / bpm) * CYCLE_BEATS;
const pulseKey = (rhythm: number, pulse: number): PulseKey =>
  `${rhythm}-${pulse}`;
const range = (length: number) => Array.from({ length }, (_, index) => index);

function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

class ClickEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private sources = new Set<OscillatorNode>();
  private gains = new Set<GainNode>();

  async init() {
    await Tone.start();
    if (this.context && this.master) return;

    this.context = Tone.getContext().rawContext as AudioContext;
    this.master = this.context.createGain();
    this.master.gain.value = MASTER_GAIN;
    this.master.connect(this.context.destination);
  }

  play(rhythm: Rhythm, downbeat: boolean) {
    if (!this.context || !this.master) return;

    const now = this.context.currentTime;
    const duration = downbeat ? 0.055 : 0.035;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const frequency = Tone.Frequency(rhythm.tone).toFrequency();

    oscillator.type = downbeat ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(
      downbeat ? frequency * 0.72 : frequency,
      now,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(downbeat ? 0.5 : 0.26, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain).connect(this.master);
    this.sources.add(oscillator);
    this.gains.add(gain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      this.sources.delete(oscillator);
      this.gains.delete(gain);
    };
  }

  get time() {
    return this.context?.currentTime ?? 0;
  }

  get latency() {
    if (!this.context) return 0;
    return clamp(
      this.context.baseLatency + (this.context.outputLatency ?? 0),
      0,
      0.12,
    );
  }

  setMuted(muted: boolean) {
    this.master?.gain.setTargetAtTime(
      muted ? 0 : MASTER_GAIN,
      this.context?.currentTime ?? 0,
      0.01,
    );
  }

  silence() {
    const now = this.time;
    this.gains.forEach((gain) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0.0001, now, 0.005);
    });
    this.sources.forEach((source) => {
      try {
        source.stop(now + 0.01);
      } catch {
        // A source may already have stopped naturally.
      }
    });
  }

  dispose() {
    this.silence();
    this.master?.disconnect();
    this.master = null;
    this.context = null;
    this.sources.clear();
    this.gains.clear();
  }
}

export default function PolyrhythmVisualizer() {
  const [activeRhythms, setActiveRhythms] = useState(DEFAULT_RHYTHMS);
  const [bpm, setBpm] = useState(90);
  const [bpmInput, setBpmInput] = useState("90");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [mode, setMode] = useState<ViewMode>("circle");
  const [progress, setProgress] = useState(0);
  const [turns, setTurns] = useState(0);
  const [activePulses, setActivePulses] = useState<Set<PulseKey>>(new Set());

  const engineRef = useRef<ClickEngine | null>(null);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const startTimeRef = useRef(0);
  const cyclePositionRef = useRef(0);
  const progressRef = useRef(0);
  const turnsRef = useRef(0);
  const lastElapsedRef = useRef(0);

  const rhythmsRef = useLatest(activeRhythms);
  const bpmRef = useLatest(bpm);
  const mutedRef = useLatest(isMuted);
  const playingRef = useLatest(isPlaying);

  const activeRhythmData = useMemo(
    () =>
      activeRhythms.map((count) => RHYTHM_BY_COUNT.get(count)!).filter(Boolean),
    [activeRhythms],
  );

  const stopLoop = useCallback(() => {
    if (rafRef.current === null) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const clearPulseState = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setActivePulses(new Set());
  }, []);

  const flash = useCallback(
    (count: number, pulse: number, downbeat: boolean) => {
      const keys = downbeat
        ? rhythmsRef.current.map((rhythm) => pulseKey(rhythm, 0))
        : [pulseKey(count, pulse)];

      setActivePulses((current) => new Set([...current, ...keys]));
      timersRef.current.push(
        window.setTimeout(
          () => {
            setActivePulses((current) => {
              const next = new Set(current);
              keys.forEach((key) => next.delete(key));
              return next;
            });
          },
          downbeat ? 170 : 130,
        ),
      );
    },
    [rhythmsRef],
  );

  const triggerPulses = useCallback(
    (from: number, to: number) => {
      const engine = engineRef.current;
      if (!engine || to < from) return;

      const duration = cycleSeconds(bpmRef.current);
      rhythmsRef.current.forEach((count) => {
        const rhythm = RHYTHM_BY_COUNT.get(count);
        if (!rhythm) return;

        const interval = duration / count;
        const first = Math.floor(from / interval) + 1;
        const last = Math.floor(to / interval);

        for (let index = first; index <= last; index++) {
          const pulse = ((index % count) + count) % count;
          const downbeat = pulse === 0;
          if (!mutedRef.current) engine.play(rhythm, downbeat);
          flash(count, pulse, downbeat);
        }
      });
    },
    [bpmRef, flash, mutedRef, rhythmsRef],
  );

  const startLoop = useCallback(() => {
    stopLoop();

    const tick = () => {
      if (document.hidden) {
        rafRef.current = null;
        return;
      }

      const engine = engineRef.current;
      if (!engine) return;

      const duration = cycleSeconds(bpmRef.current);
      const elapsed = Math.max(0, engine.time - startTimeRef.current);
      const visualElapsed = Math.max(0, elapsed - engine.latency);
      const nextProgress = (visualElapsed % duration) / duration;

      // Accumulate cycles instead of deriving them from elapsed time: tempo
      // changes rebase the clock, and visuals that spin must not jump with it.
      const step = nextProgress - progressRef.current;
      turnsRef.current += step < 0 ? step + 1 : step;

      triggerPulses(lastElapsedRef.current, elapsed);
      lastElapsedRef.current = elapsed;
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      setTurns(turnsRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [bpmRef, stopLoop, triggerPulses]);

  const togglePlay = useCallback(async () => {
    const engine = (engineRef.current ??= new ClickEngine());
    await engine.init();
    engine.setMuted(mutedRef.current);

    if (playingRef.current) {
      cyclePositionRef.current =
        progressRef.current * cycleSeconds(bpmRef.current);
      lastElapsedRef.current = cyclePositionRef.current;
      engine.silence();
      clearPulseState();
      stopLoop();
      setIsPlaying(false);
      return;
    }

    startTimeRef.current = engine.time - cyclePositionRef.current;
    lastElapsedRef.current = cyclePositionRef.current || -0.001;
    setIsPlaying(true);
    startLoop();
  }, [bpmRef, clearPulseState, mutedRef, playingRef, startLoop, stopLoop]);

  const reset = useCallback(() => {
    const engine = engineRef.current;
    cyclePositionRef.current = 0;
    lastElapsedRef.current = playingRef.current ? -0.001 : 0;
    progressRef.current = 0;
    turnsRef.current = 0;
    setProgress(0);
    setTurns(0);
    clearPulseState();
    engine?.silence();

    if (playingRef.current) {
      startTimeRef.current = engine?.time ?? 0;
      startLoop();
    }
  }, [clearPulseState, playingRef, startLoop]);

  const toggleRhythm = (count: number) => {
    setActiveRhythms((current) =>
      current.includes(count)
        ? current.length === 1
          ? current
          : current.filter((value) => value !== count)
        : [...current, count].sort((a, b) => a - b),
    );
  };

  const commitBpm = () => {
    const parsed = Number.parseInt(bpmInput, 10);
    const next = clamp(Number.isNaN(parsed) ? 90 : parsed, BPM_MIN, BPM_MAX);
    setBpm(next);
    setBpmInput(String(next));
  };

  useEffect(() => {
    const position = progressRef.current * cycleSeconds(bpm);
    cyclePositionRef.current = position;
    lastElapsedRef.current = position;
    if (playingRef.current && engineRef.current) {
      startTimeRef.current = engineRef.current.time - position;
    }
  }, [bpm, playingRef]);

  useEffect(() => {
    engineRef.current?.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const engine = engineRef.current;

      if (document.hidden) {
        if (playingRef.current) {
          // Keep the musical position, but discard pulses that occur while the
          // browser throttles this tab. Playing those pulses together on return
          // creates an audible pop.
          cyclePositionRef.current =
            progressRef.current * cycleSeconds(bpmRef.current);
          lastElapsedRef.current = cyclePositionRef.current;
          engine?.silence();
          clearPulseState();
          stopLoop();
        }
        return;
      }

      if (playingRef.current && engine) {
        startTimeRef.current = engine.time - cyclePositionRef.current;
        lastElapsedRef.current = cyclePositionRef.current;
        startLoop();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [bpmRef, clearPulseState, playingRef, startLoop, stopLoop]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      )
        return;

      const key = event.key.toLowerCase();
      if (event.code === "Space") {
        event.preventDefault();
        void togglePlay();
      } else if (key === "m") {
        event.preventDefault();
        setIsMuted((value) => !value);
      } else if (key === "r") {
        event.preventDefault();
        reset();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reset, togglePlay]);

  useEffect(
    () => () => {
      stopLoop();
      clearPulseState();
      engineRef.current?.dispose();
    },
    [clearPulseState, stopLoop],
  );

  const visualizerProps = {
    rhythms: activeRhythmData,
    progress,
    turns,
    activePulses,
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#0d0c12] font-sans text-[#fafaf9]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(145deg,#17121b_0%,#0d1317_48%,#171018_100%)]" />
        <div className="absolute -left-64 -top-80 h-224 w-4xl rounded-full bg-[radial-gradient(circle,rgba(252,140,116,0.12)_0%,rgba(252,140,116,0.04)_38%,transparent_70%)] blur-2xl" />
        <div className="absolute -bottom-80 -right-56 h-216 w-216 rounded-full bg-[radial-gradient(circle,rgba(64,196,187,0.1)_0%,rgba(64,196,187,0.03)_40%,transparent_70%)] blur-2xl" />
        <div className="absolute left-1/2 top-1/2 h-304 w-304 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[42%] bg-[repeating-radial-gradient(ellipse_at_center,transparent_0_42px,rgba(250,249,246,0.035)_43px_44px)] opacity-70" />
        <svg
          className="absolute inset-x-0 top-[8%] h-[76%] w-full opacity-35"
          viewBox="0 0 1600 900"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M-120 530C170 260 390 690 690 390S1220 210 1720 500"
            stroke="#fc8c74"
            strokeWidth="2"
          />
          <path
            d="M-140 590C180 320 420 740 735 440S1260 270 1740 560"
            stroke="#f59851"
            strokeOpacity="0.55"
          />
          <path
            d="M-160 650C210 390 455 790 780 500S1300 340 1760 620"
            stroke="#40c4bb"
            strokeOpacity="0.48"
          />
          <path
            d="M-180 710C240 470 500 840 830 560S1350 420 1780 680"
            stroke="#7e7aeb"
            strokeOpacity="0.42"
          />
        </svg>
        <div
          className="absolute inset-0 opacity-[0.055] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%20180%20180%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27n%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%27.9%27%20numOctaves%3D%274%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url%28%23n%29%27%20opacity%3D%27.9%27%2F%3E%3C%2Fsvg%3E')",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 rounded-2xl border border-[#faf9f6]/12 bg-[#17141d]/75 p-4 shadow-2xl shadow-black/35 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <h1 className="mt-1 text-3xl font-black uppercase tracking-[0.12em] text-[#faf9f6] sm:text-4xl">
            Polyrhythm Visualizer
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <IconButton
              label={isPlaying ? "Pause" : "Play"}
              onClick={togglePlay}
            >
              {isPlaying ? <Pause /> : <Play />}
            </IconButton>
            <IconButton label="Reset" onClick={reset}>
              <RotateCcw />
            </IconButton>
            <IconButton
              label={isMuted ? "Unmute" : "Mute"}
              onClick={() => setIsMuted((value) => !value)}
            >
              {isMuted ? <VolumeX /> : <Volume2 />}
            </IconButton>
          </div>
        </header>

        <section className="grid flex-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-4">
            <Panel title="BPM" icon={<Gauge />}>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={BPM_MIN}
                  max={BPM_MAX}
                  value={bpm}
                  onChange={(event) => {
                    const nextBpm = Number(event.target.value);
                    setBpm(nextBpm);
                    setBpmInput(String(nextBpm));
                  }}
                  className={`${styles.slider} w-full`}
                  aria-label="BPM"
                />
                <div className="flex h-11 w-24 items-center rounded-xl border border-[#faf9f6]/12 bg-[#0e0d13]/55 px-2">
                  <input
                    value={bpmInput}
                    onChange={(event) => setBpmInput(event.target.value)}
                    onBlur={commitBpm}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      commitBpm();
                      event.currentTarget.blur();
                    }}
                    className="w-full bg-transparent text-center text-lg font-black tabular-nums text-[#faf9f6] outline-none"
                    inputMode="numeric"
                    aria-label="BPM value"
                  />
                </div>
              </div>
            </Panel>

            <Panel title="Rhythms" icon={<Clock3 />}>
              <div className="grid grid-cols-3 gap-2">
                {RHYTHMS.map((rhythm) => {
                  const selected = activeRhythms.includes(rhythm.count);
                  return (
                    <button
                      key={rhythm.count}
                      onClick={() => toggleRhythm(rhythm.count)}
                      className="relative h-12 rounded-xl border text-base font-black tabular-nums transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        color: selected ? "#17131a" : rhythm.color,
                        background: selected
                          ? rhythm.color
                          : "rgba(15,13,19,0.54)",
                        borderColor: selected
                          ? rhythm.color
                          : "rgba(250,249,246,0.11)",
                        boxShadow: selected
                          ? `0 0 22px ${rhythm.glow}`
                          : "none",
                      }}
                      title={`${rhythm.count} pulses`}
                    >
                      {rhythm.count}
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel title="View">
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["circle", "Circle", <CircleDot key="circle" />],
                    ["timeline", "Timeline", <Rows3 key="timeline" />],
                    ["bloom", "Bloom", <Sparkles key="bloom" />],
                    ["orbit3d", "3D", <Orbit key="orbit3d" />],
                  ] as const
                ).map(([value, label, icon]) => (
                  <ModeButton
                    key={value}
                    label={label}
                    active={mode === value}
                    onClick={() => setMode(value)}
                  >
                    {icon}
                  </ModeButton>
                ))}
              </div>
            </Panel>
          </aside>

          <section className="flex min-h-175 flex-col rounded-2xl border border-[#faf9f6]/12 bg-[#14131a]/70 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
            <div className="mb-2 flex justify-end font-mono text-xs text-[#d8cabc]/55">
              Cycle {(progress * 100).toFixed(1)}%
            </div>
            <div className="flex flex-1 items-center justify-center rounded-xl border border-[#faf9f6]/8 bg-[#0d0d13]/52 px-2 py-4 shadow-inner shadow-black/30 sm:px-4">
              {mode === "circle" && <CircularVisualizer {...visualizerProps} />}
              {mode === "timeline" && (
                <TimelineVisualizer {...visualizerProps} />
              )}
              {mode === "bloom" && <BloomVisualizer {...visualizerProps} />}
              {mode === "orbit3d" && <Orbit3DVisualizer {...visualizerProps} />}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

function CircularVisualizer({
  rhythms,
  progress,
  activePulses,
}: VisualizerProps) {
  const size = 760;
  const center = size / 2;
  const maxRadius = 300;
  const minRadius = 96;
  const gap =
    rhythms.length > 1 ? (maxRadius - minRadius) / (rhythms.length - 1) : 0;
  const angle = progress * TAU - Math.PI / 2;
  const playhead = {
    x: center + Math.cos(angle) * (maxRadius + 26),
    y: center + Math.sin(angle) * (maxRadius + 26),
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="mb-4 text-center">
        <div className="text-2xl font-black tracking-[0.16em] text-white sm:text-3xl">
          {rhythms.map(({ count }) => count).join(":")}
        </div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
          cycle
        </div>
      </div>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="aspect-square w-full max-w-195"
        role="img"
        aria-label="Circular polyrhythm visualization"
      >
        <circle
          cx={center}
          cy={center}
          r={maxRadius + 46}
          fill="rgba(255,255,255,0.018)"
          stroke="rgba(255,255,255,0.08)"
        />
        <line
          x1={center}
          y1={center}
          x2={playhead.x}
          y2={playhead.y}
          stroke="rgba(255,255,255,0.82)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={playhead.x} cy={playhead.y} r="8" fill="#faf9f6" />

        {rhythms.map((rhythm, rhythmIndex) => {
          const radius = maxRadius - rhythmIndex * gap;
          return (
            <g key={rhythm.count}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={rhythm.color}
                strokeOpacity="0.26"
                strokeWidth="2"
              />
              {range(rhythm.count).map((pulse) => {
                const pulseAngle = (pulse / rhythm.count) * TAU - Math.PI / 2;
                const x = center + Math.cos(pulseAngle) * radius;
                const y = center + Math.sin(pulseAngle) * radius;
                const downbeat = pulse === 0;
                const active = activePulses.has(pulseKey(rhythm.count, pulse));
                return (
                  <g key={pulse}>
                    <circle
                      cx={x}
                      cy={y}
                      r={active ? 18 : downbeat ? 12 : 9}
                      fill={downbeat ? "#faf9f6" : rhythm.color}
                      fillOpacity={active ? 0.95 : downbeat ? 0.85 : 0.74}
                      stroke={downbeat ? rhythm.color : "rgba(255,255,255,0.5)"}
                      strokeWidth={downbeat ? 3 : 1}
                      style={{
                        filter: active
                          ? `drop-shadow(0 0 18px ${rhythm.color})`
                          : downbeat
                            ? "drop-shadow(0 0 14px rgba(255,255,255,0.6))"
                            : "none",
                        transition: "r 90ms ease, fill-opacity 90ms ease",
                      }}
                    />
                    {downbeat && (
                      <text
                        x={x}
                        y={y - 22}
                        textAnchor="middle"
                        className="fill-white/65 text-[15px] font-bold"
                      >
                        {rhythm.count}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TimelineVisualizer({
  rhythms,
  progress,
  activePulses,
}: VisualizerProps) {
  return (
    <div className="relative flex min-h-140 w-full max-w-245 flex-col justify-center gap-5 overflow-hidden rounded-lg border border-white/8 bg-white/2.5 p-5 sm:p-8">
      <div
        className="absolute bottom-8 top-8 w-px bg-white shadow-[0_0_18px_rgba(255,255,255,0.75)]"
        style={{ left: `calc(96px + (100% - 128px) * ${progress})` }}
      />
      <div className="absolute bottom-8 top-8 left-24 w-px bg-white/30" />

      {rhythms.map((rhythm) => (
        <div key={rhythm.count} className="grid grid-cols-[80px_1fr] gap-6">
          <div className="flex items-center justify-end gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: rhythm.color,
                boxShadow: `0 0 10px ${rhythm.glow}`,
              }}
            />
            <span className="font-mono text-base font-black text-white/75">
              /{rhythm.count}
            </span>
          </div>
          <div className="relative h-16 rounded-lg border border-white/8 bg-black/24">
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/12" />
            {range(rhythm.count).map((pulse) => {
              const downbeat = pulse === 0;
              const active = activePulses.has(pulseKey(rhythm.count, pulse));
              return (
                <div
                  key={pulse}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all"
                  style={{
                    left: `${(pulse / rhythm.count) * 100}%`,
                    width: active ? 26 : downbeat ? 20 : 14,
                    height: active ? 26 : downbeat ? 20 : 14,
                    background: downbeat ? "#faf9f6" : rhythm.color,
                    border: `2px solid ${downbeat ? rhythm.color : "rgba(255,255,255,0.42)"}`,
                    boxShadow: active
                      ? `0 0 20px ${rhythm.color}`
                      : downbeat
                        ? "0 0 14px rgba(255,255,255,0.55)"
                        : "none",
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function BloomVisualizer({
  rhythms,
  progress,
  turns,
  activePulses,
}: VisualizerProps) {
  const width = 960;
  const height = 680;
  const centerX = width / 2;
  const centerY = height / 2;
  const phase = progress * TAU;
  // Driven by total turns rather than the wrapping cycle progress, so the
  // shapes keep rotating instead of snapping back on every downbeat.
  const spinPhase = turns * TAU;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full min-h-140 w-full max-w-260"
        role="img"
        aria-label="Bloom polyrhythm visualization"
      >
        <defs>
          <radialGradient id="bloom-core" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.32)" />
            <stop offset="48%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <filter id="soft-glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={centerX} cy={centerY} r="230" fill="url(#bloom-core)" />

        {rhythms.map((rhythm, index) => {
          const radius = 92 + (index / Math.max(1, rhythms.length - 1)) * 286;
          const spin = spinPhase * (index % 2 ? -0.12 : 0.12);
          const points = range(rhythm.count).map((pulse) => {
            const angle = (pulse / rhythm.count) * TAU - Math.PI / 2 + spin;
            return {
              pulse,
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius,
            };
          });
          const path = `${points.map(({ x, y }, pointIndex) => `${pointIndex ? "L" : "M"} ${x} ${y}`).join(" ")} Z`;

          return (
            <g key={rhythm.count}>
              <path
                d={path}
                fill="none"
                stroke={rhythm.color}
                strokeOpacity="0.16"
                strokeWidth="1.5"
              />
              {points.map(({ pulse, x, y }) => {
                const downbeat = pulse === 0;
                const active = activePulses.has(pulseKey(rhythm.count, pulse));
                return (
                  <g
                    key={pulse}
                    filter={active ? "url(#soft-glow)" : undefined}
                  >
                    <line
                      x1={centerX}
                      y1={centerY}
                      x2={x}
                      y2={y}
                      stroke={rhythm.color}
                      strokeOpacity={active ? 0.42 : 0.08}
                      strokeWidth={active ? 2.5 : 1}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={active ? 24 : downbeat ? 14 : 10}
                      fill={downbeat ? "#faf9f6" : rhythm.color}
                      fillOpacity={active ? 0.95 : 0.72}
                      stroke={rhythm.color}
                      strokeOpacity="0.8"
                      strokeWidth={downbeat ? 3 : 1}
                      style={{
                        transition:
                          "r 90ms ease, fill-opacity 90ms ease, stroke-width 90ms ease",
                      }}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        <circle
          cx={centerX}
          cy={centerY}
          r="52"
          fill="rgba(0,0,0,0.45)"
          stroke="rgba(255,255,255,0.2)"
        />
        <circle
          cx={centerX + Math.cos(phase - Math.PI / 2) * 52}
          cy={centerY + Math.sin(phase - Math.PI / 2) * 52}
          r="8"
          fill="#faf9f6"
        />
      </svg>
    </div>
  );
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    materials.forEach((material) => material?.dispose());
  });
}

function Orbit3DVisualizer({ rhythms, activePulses }: VisualizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const pulsesRef = useLatest(activePulses);
  const sceneRef = useRef<{
    group: THREE.Group;
    nodes: Map<
      PulseKey,
      THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>
    >;
  } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0d0c12, 9, 22);

    // A raised three-quarter view makes the stacked rhythm rings read as
    // concentric orbits instead of collapsing into an edge-on line.
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(7.4, 6.1, 9.6);
    camera.lookAt(0, 0.15, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group, new THREE.AmbientLight(0xfaf9f6, 1.05));
    const warmLight = new THREE.PointLight(0xfc8c74, 24, 24);
    warmLight.position.set(1, 5, 6);
    const coolLight = new THREE.PointLight(0x40c4bb, 16, 20);
    coolLight.position.set(-5, 1, -3);
    scene.add(warmLight, coolLight);

    const state = {
      group,
      nodes: new Map<
        PulseKey,
        THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>
      >(),
    };
    sceneRef.current = state;

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const clock = new THREE.Clock();
    const orbitRadius = 12.1;
    const initialOrbitAngle = Math.atan2(7.4, 9.6);
    let frame = 0;
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const orbitAngle = initialOrbitAngle + elapsed * 0.13;

      // Use wall-clock time rather than musical progress so this orbit never
      // snaps back when a polyrhythm cycle wraps around.
      camera.position.set(
        Math.sin(orbitAngle) * orbitRadius,
        6.1 + Math.sin(elapsed * 0.24) * 0.45,
        Math.cos(orbitAngle) * orbitRadius,
      );
      camera.lookAt(0, 0.15, 0);
      group.rotation.set(
        -0.42 + Math.sin(elapsed * 0.18) * 0.06,
        elapsed * 0.075,
        0,
      );

      state.nodes.forEach((mesh, key) => {
        const active = pulsesRef.current.has(key);
        const base = Number(mesh.userData.baseScale ?? 1);
        const target = active ? base * 2.25 : base;
        mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, target, 0.22));
        mesh.material.emissiveIntensity = THREE.MathUtils.lerp(
          mesh.material.emissiveIntensity,
          active ? 2.8 : 0.55,
          0.18,
        );
      });

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
    };
  }, [pulsesRef]);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state) return;

    disposeObject(state.group);
    state.group.clear();
    state.nodes.clear();

    const geometry = new THREE.SphereGeometry(0.11, 24, 16);
    rhythms.forEach((rhythm, index) => {
      const color = new THREE.Color(rhythm.color);
      const radius = 1.45 + index * 0.34;
      const offset = index - (rhythms.length - 1) / 2;
      const y = offset * 0.18;
      const zTilt = offset * 0.045;
      const ringPoints = range(144).map((point) => {
        const angle = (point / 144) * TAU;
        return new THREE.Vector3(
          Math.cos(angle) * radius,
          y + Math.sin(angle) * zTilt,
          Math.sin(angle) * radius,
        );
      });
      const ring = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(ringPoints),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.2 }),
      );
      state.group.add(ring);

      range(rhythm.count).forEach((pulse) => {
        const angle = (pulse / rhythm.count) * TAU - Math.PI / 2;
        const downbeat = pulse === 0;
        const node = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({
            color: downbeat ? 0xfaf9f6 : color,
            emissive: color,
            emissiveIntensity: downbeat ? 1.15 : 0.55,
            roughness: 0.28,
            metalness: 0.35,
          }),
        );
        node.position.set(
          Math.cos(angle) * radius,
          y + Math.sin(angle) * zTilt,
          Math.sin(angle) * radius,
        );
        node.userData.baseScale = downbeat ? 1.35 : 1;
        node.scale.setScalar(node.userData.baseScale);
        state.nodes.set(pulseKey(rhythm.count, pulse), node);
        state.group.add(node);
      });
    });

    return () => {
      disposeObject(state.group);
      state.group.clear();
      state.nodes.clear();
    };
  }, [rhythms]);

  return (
    <div className="relative h-full min-h-140 w-full overflow-hidden rounded-lg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,160,145,0.12),transparent_38%),radial-gradient(circle_at_70%_70%,rgba(98,174,168,0.1),transparent_42%),linear-gradient(180deg,rgba(243,232,216,0.035),transparent)]" />
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#faf9f6]/11 bg-[#17141d]/70 p-4 shadow-lg shadow-black/10 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#d8cabc]/60">
        {icon && (
          <span className="text-[#faf9f6] [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        )}
        {title}
      </div>
      {children}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      onClick={() => void onClick()}
      title={label}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#faf9f6]/12 bg-[#211b24]/72 text-[#faf9f6] transition-all hover:-translate-y-0.5 hover:border-[#fc8c74]/45 hover:bg-[#2a2029]/85 [&>svg]:h-4 [&>svg]:w-4"
    >
      {children}
    </button>
  );
}

function ModeButton({
  children,
  label,
  active,
  onClick,
}: {
  children: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-black uppercase tracking-[0.18em] transition-all hover:-translate-y-0.5 [&>svg]:h-4 [&>svg]:w-4"
      style={{
        background: active ? "#faf9f6" : "rgba(15,13,19,0.5)",
        borderColor: active ? "#faf9f6" : "rgba(250,249,246,0.11)",
        color: active ? "#17131a" : "rgba(250,249,246,0.68)",
        boxShadow: active ? "0 10px 28px rgba(252,140,116,0.13)" : "none",
      }}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}
