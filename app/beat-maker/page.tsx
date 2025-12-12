"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { Play, Pause, Trash2, Music } from "lucide-react";

// --- Configuration ---
const STEPS = 16;
const TRACKS_CONFIG = [
  { id: "kick", name: "KICK", color: "bg-rose-500", text: "text-rose-500" },
  { id: "snare", name: "SNARE", color: "bg-sky-500", text: "text-sky-500" },
  {
    id: "hihat",
    name: "HIHAT",
    color: "bg-amber-400",
    text: "text-amber-400",
  },
  { id: "clap", name: "CLAP", color: "bg-violet-500", text: "text-violet-500" },
];

// --- Audio Engine Class (Lazy Init) ---
class AudioEngine {
  instruments: Record<
    string,
    Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth | Tone.Sampler
  > = {};
  channels: Record<string, Tone.Channel> = {};
  meters: Record<string, Tone.Meter> = {};

  master: Tone.Channel | null = null;
  masterMeter: Tone.Meter | null = null;
  limit: Tone.Limiter | null = null;

  async init() {
    await Tone.start();

    // Create master chain
    this.limit = new Tone.Limiter(-1).toDestination();
    this.master = new Tone.Channel({ volume: 0 }).connect(this.limit);
    this.masterMeter = new Tone.Meter();
    this.master.connect(this.masterMeter);

    // Initialize Tracks
    this.initTrack("kick");
    this.initTrack("snare");
    this.initTrack("hihat");
    this.initTrack("clap");
  }

  private initTrack(id: string) {
    if (!this.master) return;

    // Create Channel and Meter for the track
    const channel = new Tone.Channel({ volume: -6 }).connect(this.master);
    const meter = new Tone.Meter();
    channel.connect(meter);

    this.channels[id] = channel;
    this.meters[id] = meter;

    // Create Instrument and connect to Channel
    // Using union type for instrument
    let inst:
      | Tone.MembraneSynth
      | Tone.NoiseSynth
      | Tone.MetalSynth
      | Tone.Sampler
      | undefined;

    switch (id) {
      case "kick":
        inst = new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 10,
          oscillator: { type: "sine" },
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
        });
        break;
      case "snare":
        inst = new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 1.4 },
        });
        break;
      case "hihat":
        inst = new Tone.MetalSynth({
          envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
          harmonicity: 4.1,
          modulationIndex: 40,
          resonance: 3000,
          octaves: 1,
        });
        inst.frequency.value = 250;
        inst.volume.value = -8;
        break;
      case "clap":
        // Clap complex chain
        const filter = new Tone.Filter(1500, "bandpass");
        inst = new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
        });
        inst.volume.value = 0;
        inst.connect(filter);
        // Connect filter to channel instead of master
        filter.connect(channel);
        this.instruments[id] = inst;
        return; // Early return for clap special case
    }

    if (inst) {
      inst.connect(channel);
      this.instruments[id] = inst;
    }
  }

  trigger(id: string, time: number) {
    const inst = this.instruments[id];
    if (!inst) return;

    if (inst instanceof Tone.MembraneSynth) {
      inst.triggerAttackRelease("C1", "8n", time);
    } else if (inst instanceof Tone.MetalSynth) {
      inst.triggerAttackRelease("C5", "32n", time, 1);
    } else if (inst instanceof Tone.NoiseSynth) {
      if (id === "clap") {
        inst.triggerAttackRelease("32n", time, 1);
        inst.triggerAttackRelease("32n", time + 0.01, 0.7);
        inst.triggerAttackRelease("32n", time + 0.02, 0.5);
      } else {
        inst.triggerAttackRelease("8n", time);
      }
    }
  }

  setVolume(id: string, dB: number) {
    if (id === "master") {
      if (this.master) this.master.volume.rampTo(dB, 0.1);
    } else {
      const channel = this.channels[id];
      if (channel) channel.volume.rampTo(dB, 0.1);
    }
  }

  getMeterValues() {
    const values: Record<string, number> = {};
    // Tracks
    for (const [id, meter] of Object.entries(this.meters)) {
      values[id] = meter.getValue() as number;
    }
    // Master
    if (this.masterMeter) {
      values["master"] = this.masterMeter.getValue() as number;
    }
    return values;
  }
}

const engine = new AudioEngine();

export default function BeatMaker() {
  // --- UI State ---
  const [grid, setGrid] = useState<boolean[][]>(() =>
    Array(TRACKS_CONFIG.length)
      .fill(null)
      .map(() => Array(STEPS).fill(false))
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(120);
  // Removed global single volume state in favor of trackVolumes
  const [volumes, setVolumes] = useState<Record<string, number>>({
    kick: -6,
    snare: -6,
    hihat: -6,
    clap: -6,
    master: 0,
  });
  const [meterValues, setMeterValues] = useState<Record<string, number>>({});

  // Painting State
  const isPainting = useRef(false);
  const paintState = useRef(false); // true = add, false = remove

  // Tone.js Refs
  const seqRef = useRef<Tone.Sequence | null>(null);
  const meterRaf = useRef<number | null>(null);

  useEffect(() => {
    // Start metering loop
    const updateMeters = () => {
      setMeterValues(engine.getMeterValues());
      meterRaf.current = requestAnimationFrame(updateMeters);
    };
    meterRaf.current = requestAnimationFrame(updateMeters);

    return () => {
      if (meterRaf.current) cancelAnimationFrame(meterRaf.current);
    };
  }, []);

  const handleVolumeChange = (id: string, val: number) => {
    setVolumes((prev) => ({ ...prev, [id]: val }));
    engine.setVolume(id, val);
  };

  // --- Initialization ---
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (seqRef.current) seqRef.current.dispose();
      Tone.Transport.stop();
    };
  }, []);

  // --- Sequence Logic ---
  useEffect(() => {
    if (seqRef.current) seqRef.current.dispose();

    // Create a new sequence
    const seq = new Tone.Sequence(
      (time, step) => {
        // UI Update
        Tone.Draw.schedule(() => {
          setCurrentStep(step);
        }, time);

        // Audio Trigger
        TRACKS_CONFIG.forEach((track, trackIdx) => {
          if (grid[trackIdx][step]) {
            engine.trigger(track.id, time);
          }
        });
      },
      Array.from({ length: STEPS }, (_, i) => i),
      "16n"
    );

    seq.start(0);
    seqRef.current = seq;
  }, [grid]);

  // --- Transport Effects ---
  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  // Initial Volume Setup

  // --- Controls ---
  const togglePlay = useCallback(async () => {
    // Ensure engine is initialized regardless of context state
    if (!engine.master) {
      await engine.init();
    } else if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
    // Resume/Start Logic
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
      setCurrentStep(0);
    } else {
      Tone.Transport.start();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay]);

  const clearGrid = () => {
    setGrid(
      Array(TRACKS_CONFIG.length)
        .fill(null)
        .map(() => Array(STEPS).fill(false))
    );
  };

  // --- Painting Logic ---
  const handleMouseDown = (trackIdx: number, stepIdx: number) => {
    isPainting.current = true;
    const newState = !grid[trackIdx][stepIdx];
    paintState.current = newState;
    updateStep(trackIdx, stepIdx, newState);
  };

  const handleMouseEnter = (trackIdx: number, stepIdx: number) => {
    if (isPainting.current) {
      updateStep(trackIdx, stepIdx, paintState.current);
    }
  };

  const updateStep = (trackIdx: number, stepIdx: number, val: boolean) => {
    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row]);
      newGrid[trackIdx][stepIdx] = val;
      return newGrid;
    });
  };

  useEffect(() => {
    const handleUp = () => (isPainting.current = false);
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 flex flex-col items-center justify-center font-sans select-none">
      {/* Header */}
      <div className="mb-8 text-center w-full max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-6">
          STUDIO 808
        </h1>

        {/* Controls Bar */}
        <div className="flex flex-wrap gap-4 justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold transition-all ${
                isPlaying
                  ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              }`}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {isPlaying ? "STOP" : "PLAY"}
            </button>

            <button
              onClick={clearGrid}
              className="p-2 hover:text-rose-500 transition-colors text-zinc-500"
              title="Clear Pattern"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Tempo
              </label>
              <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1 rounded-md border border-zinc-800">
                <Music className="w-3 h-3 text-zinc-400" />
                <input
                  type="number"
                  value={tempo}
                  onChange={(e) =>
                    setTempo(
                      Math.min(
                        300,
                        Math.max(40, parseInt(e.target.value) || 120)
                      )
                    )
                  }
                  className="w-12 bg-transparent text-center focus:outline-none font-bold text-zinc-200"
                />
                <span className="text-xs text-zinc-500">BPM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sequencer Grid */}
      <div className="w-full max-w-5xl bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 shadow-xl mb-8">
        {TRACKS_CONFIG.map((track, trackIdx) => (
          <div key={track.id} className="flex items-center gap-4 mb-4">
            {/* Track Info */}
            <div className="w-20 shrink-0">
              <div
                className={`text-xs font-bold ${track.text} tracking-widest mb-1`}
              >
                {track.name}
              </div>
              <div
                className={`h-1 w-full bg-zinc-800 rounded-full overflow-hidden`}
              >
                <div className={`h-full w-full ${track.color} opacity-70`} />
              </div>
            </div>

            {/* Steps */}
            <div className="flex-1 grid grid-cols-16 gap-1 relative">
              {grid[trackIdx].map((isActive, stepIdx) => {
                const isDownbeat = stepIdx % 4 === 0;
                return (
                  <div
                    key={stepIdx}
                    className="aspect-square relative"
                    onMouseDown={() => handleMouseDown(trackIdx, stepIdx)}
                    onMouseEnter={() => handleMouseEnter(trackIdx, stepIdx)}
                  >
                    <div
                      className={`
                            absolute inset-0 rounded-sm transition-all duration-75 cursor-pointer
                            ${
                              isActive
                                ? track.color
                                : isDownbeat
                                ? "bg-zinc-800"
                                : "bg-zinc-800/40"
                            }
                            ${
                              currentStep === stepIdx
                                ? "brightness-125 scale-105 ring-1 ring-zinc-400 z-10"
                                : ""
                            }
                            hover:brightness-110
                        `}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Mixer Section */}
      <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2">
          Mixer
        </h2>
        <div className="flex justify-center gap-8">
          {/* Track Channels */}
          {TRACKS_CONFIG.map((track) => {
            const level = Math.max(-60, meterValues[track.id] || -60);
            const height = ((level + 60) / 60) * 100; // Map -60..0 to 0..100%

            return (
              <div
                key={track.id}
                className="flex flex-col items-center gap-3 w-16"
              >
                {/* Meter Value */}
                <span className="text-[10px] font-mono text-zinc-500 tabular-nums">
                  {volumes[track.id]?.toFixed(0)} dB
                </span>

                <div className="flex gap-2 h-48 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                  {/* Fader */}
                  <div className="relative h-full w-8">
                    <input
                      type="range"
                      min="-60"
                      max="6"
                      step="1"
                      value={volumes[track.id] ?? -6}
                      onChange={(e) =>
                        handleVolumeChange(track.id, parseInt(e.target.value))
                      }
                      className="absolute inset-0 w-[192px] h-8 origin-top-left -rotate-90 translate-y-[192px] opacity-0 cursor-pointer z-20"
                    />
                    {/* Visual Thumb */}
                    <div
                      className="absolute left-0 w-full h-8 bg-zinc-700 rounded-sm border-t border-zinc-600 shadow-lg pointer-events-none z-10"
                      style={{
                        bottom: `${
                          (((volumes[track.id] ?? -6) + 60) / 66) * 100
                        }%`,
                        transform: "translateY(50%)",
                      }}
                    >
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-zinc-900" />
                    </div>
                    {/* Track Line */}
                    <div className="absolute inset-x-[14px] top-0 bottom-0 bg-zinc-800 rounded-full w-1" />
                  </div>

                  {/* Meter Bar */}
                  <div className="w-2 h-full bg-zinc-800 rounded-full relative overflow-hidden">
                    <div
                      className={`absolute bottom-0 w-full transition-all duration-75 ease-out ${
                        level > -3
                          ? "bg-rose-500"
                          : level > -12
                          ? "bg-amber-400"
                          : "bg-emerald-500"
                      }`}
                      style={{
                        height: `${Math.min(100, Math.max(0, height))}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${track.color}`} />
                  <span className="text-xs font-bold text-zinc-400">
                    {track.name}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Master Channel */}
          <div className="w-px bg-zinc-800 mx-4" />

          <div className="flex flex-col items-center gap-3 w-16">
            <span className="text-[10px] font-mono text-zinc-500 tabular-nums">
              {volumes["master"]?.toFixed(0)} dB
            </span>
            <div className="flex gap-2 h-48 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
              {/* Fader */}
              <div className="relative h-full w-8">
                <input
                  type="range"
                  min="-60"
                  max="6"
                  step="1"
                  value={volumes["master"] ?? 0}
                  onChange={(e) =>
                    handleVolumeChange("master", parseInt(e.target.value))
                  }
                  className="absolute inset-0 w-[192px] h-8 origin-top-left -rotate-90 translate-y-[192px] opacity-0 cursor-pointer z-20"
                />
                {/* Visual Thumb */}
                <div
                  className="absolute left-0 w-full h-8 bg-zinc-600 rounded-sm border-t border-zinc-500 shadow-lg pointer-events-none z-10"
                  style={{
                    bottom: `${(((volumes["master"] ?? 0) + 60) / 66) * 100}%`,
                    transform: "translateY(50%)",
                  }}
                >
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-zinc-900" />
                </div>
                {/* Track Line */}
                <div className="absolute inset-x-[14px] top-0 bottom-0 bg-zinc-800 rounded-full w-1" />
              </div>

              {/* Meter */}
              <div className="w-2 h-full bg-zinc-800 rounded-full relative overflow-hidden">
                <div
                  className={`absolute bottom-0 w-full transition-all duration-75 ease-out ${
                    (meterValues["master"] || -60) > -3
                      ? "bg-rose-500"
                      : "bg-emerald-500"
                  }`}
                  style={{
                    height: `${Math.min(
                      100,
                      Math.max(
                        0,
                        (((meterValues["master"] || -60) + 60) / 60) * 100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="text-xs font-bold text-zinc-200">MASTER</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
