"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import * as Tone from "tone";
import { Play, Pause, Trash2, Music, Plus, Smartphone } from "lucide-react";
import { PRESETS } from "./presets";

// --- Configuration ---
const STEPS = 16;
const INITIAL_TRACKS = [
  { id: "kick", name: "KICK", color: "bg-rose-500", text: "text-rose-500" },
  { id: "snare", name: "SNARE", color: "bg-sky-500", text: "text-sky-500" },
  { id: "hihat", name: "HIHAT", color: "bg-amber-400", text: "text-amber-400" },
  { id: "clap", name: "CLAP", color: "bg-violet-500", text: "text-violet-500" },
];

const EXTRA_TRACKS = [
  {
    id: "openhat",
    name: "OPEN HAT",
    color: "bg-yellow-400",
    text: "text-yellow-400",
  },
  { id: "ride", name: "RIDE", color: "bg-orange-500", text: "text-orange-500" },
  {
    id: "cowbell",
    name: "COWBELL",
    color: "bg-pink-500",
    text: "text-pink-500",
  },
  { id: "rim", name: "RIM", color: "bg-teal-400", text: "text-teal-400" },
];

// --- Audio Engine Class (Lazy Init) ---
class AudioEngine {
  instruments: Record<
    string,
    Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth | Tone.Sampler
  > = {};
  channels: Record<string, Tone.Channel> = {};
  meters: Record<string, Tone.Meter> = {};

  master: Tone.Volume | null = null;
  masterMeter: Tone.Meter | null = null;
  limit: Tone.Limiter | null = null;

  async init() {
    await Tone.start();

    // Create master chain
    this.limit = new Tone.Limiter(-1).toDestination();
    this.master = new Tone.Volume({ volume: 0, mute: false }).connect(
      this.limit
    );
    this.masterMeter = new Tone.Meter();
    this.master.connect(this.masterMeter);

    INITIAL_TRACKS.forEach((t) => this.initTrack(t.id));
  }

  addTrack(id: string) {
    if (!this.instruments[id]) {
      this.initTrack(id);
    }
  }

  private initTrack(id: string) {
    if (!this.master) return;

    // Create Channel and Meter for the track
    const channel = new Tone.Channel({ volume: -6 }).connect(this.master);
    const meter = new Tone.Meter();
    channel.connect(meter);

    this.channels[id] = channel;
    this.meters[id] = meter;

    // Create Instrument
    let inst:
      | Tone.MembraneSynth
      | Tone.NoiseSynth
      | Tone.MetalSynth
      | Tone.Sampler
      | undefined;

    switch (id) {
      case "kick":
        inst = new Tone.MembraneSynth({
          pitchDecay: 0.06,
          octaves: 7,
          oscillator: { type: "sine" },
          envelope: { attack: 0.001, decay: 0.5, sustain: 0.02, release: 1.4 },
        });
        inst.volume.value = 2;
        break;
      case "snare":
        inst = new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 1.2 },
        });
        inst.volume.value = 0;
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
        inst.volume.value = -10;
        break;
      case "clap":
        const filter = new Tone.Filter(1500, "bandpass");
        inst = new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.08 },
        });
        inst.volume.value = 2;
        inst.connect(filter);

        filter.connect(channel);
        this.instruments[id] = inst;
        return;
      case "openhat":
        inst = new Tone.MetalSynth({
          envelope: { attack: 0.001, decay: 0.2, release: 1.0 },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1,
        });
        inst.frequency.value = 200;
        inst.volume.value = -12;
        break;
      case "ride":
        inst = new Tone.MetalSynth({
          envelope: { attack: 0.001, decay: 1.0, release: 1.2 },
          harmonicity: 3.1,
          modulationIndex: 20,
          resonance: 2800,
          octaves: 1.5,
        });
        inst.volume.value = -20;
        break;
      case "cowbell":
        inst = new Tone.MetalSynth({
          envelope: { attack: 0.001, decay: 0.1, release: 0.2 },
          harmonicity: 8,
          modulationIndex: 12,
          resonance: 1500,
          octaves: 1,
        });
        inst.frequency.value = 750;
        inst.volume.value = -10;
        break;
      case "rim":
        inst = new Tone.MembraneSynth({
          pitchDecay: 0.01,
          octaves: 2,
          oscillator: { type: "sine" },
          envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
        });
        inst.volume.value = -4;
        break;
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
      } else if (id === "openhat" || id === "ride" || id === "cowbell") {
        if (id === "cowbell") inst.triggerAttackRelease("8n", time);
        else inst.triggerAttackRelease("32n", time, 0.8);
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

  setSwing(amount: number) {
    Tone.Transport.swing = amount;
    Tone.Transport.swingSubdivision = "16n";
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

  syncState(
    volumes: Record<string, number>,
    mutes: Record<string, boolean>,
    solos: Record<string, boolean>
  ) {
    if (!this.master) return;

    this.setVolume("master", volumes["master"] ?? 0);
    if (this.master) this.master.mute = mutes["master"] || false;

    const activeSolos = Object.values(solos).some((s) => s);

    Object.keys(this.channels).forEach((id) => {
      this.setVolume(id, volumes[id] ?? -6);

      const channel = this.channels[id];
      if (channel) {
        const isMuted = mutes[id] || false;
        const isSoloed = solos[id] || false;

        const shouldMute = isMuted || (activeSolos && !isSoloed);

        channel.mute = shouldMute;
        channel.solo = false;
      }
    });
  }
}

const engine = new AudioEngine();

export default function BeatMaker() {
  const [tracks, setTracks] = useState(INITIAL_TRACKS);

  const [grid, setGrid] = useState<boolean[][]>(() =>
    Array(INITIAL_TRACKS.length)
      .fill(null)
      .map(() => Array(STEPS).fill(false))
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [tempoInput, setTempoInput] = useState("120"); // Buffer for typing

  useEffect(() => {
    setTempoInput(tempo.toString());
  }, [tempo]);

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempoInput(e.target.value);
  };

  const commitTempo = () => {
    let val = parseInt(tempoInput);
    if (isNaN(val)) val = 120;

    // Clamp
    val = Math.min(300, Math.max(40, val));

    setTempo(val);
    setTempoInput(val.toString());
  };

  const [volumes, setVolumes] = useState<Record<string, number>>({
    kick: -6,
    snare: -6,
    hihat: -6,
    clap: -6,
    openhat: -6,
    ride: -6,
    cowbell: -6,
    rim: -6,
    master: 0,
  });
  const [meterValues, setMeterValues] = useState<Record<string, number>>({});

  const [mutes, setMutes] = useState<Record<string, boolean>>({});
  const [solos, setSolos] = useState<Record<string, boolean>>({});
  const [swing, setSwing] = useState(50);

  const isPainting = useRef(false);
  const paintState = useRef(false); // true = add, false = remove

  const seqRef = useRef<Tone.Sequence | null>(null);
  const meterRaf = useRef<number | null>(null);

  useEffect(() => {
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

  const toggleMute = (id: string) => {
    setMutes((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      // Sync full state
      engine.syncState(volumes, next, solos);
      return next;
    });
  };

  const toggleSolo = (id: string) => {
    if (id === "master") return;
    setSolos((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      engine.syncState(volumes, mutes, next);
      return next;
    });
  };

  const handleSwingChange = (val: number) => {
    setSwing(val);

    const toneSwing = Math.max(0, (val - 50) / 25);
    engine.setSwing(toneSwing);
  };

  const loadPreset = (key: string) => {
    if (PRESETS[key]) {
      const p = PRESETS[key];
      const presetRows = p.grid.length;

      const allPossibleTracks = [...INITIAL_TRACKS, ...EXTRA_TRACKS];
      const targetTrackCount = Math.min(presetRows, allPossibleTracks.length);
      const newTracks = allPossibleTracks.slice(0, targetTrackCount);

      if (engine.master) {
        newTracks.forEach((t) => {
          engine.addTrack(t.id);
        });
      }

      setTracks(newTracks);
      setGrid(
        p.grid
          .slice(0, targetTrackCount)
          .map((row) => row.map((cell) => cell === 1))
      );
      handleSwingChange(p.swing);
      setTempo(p.tempo);

      setVolumes((prev) => {
        const next = { ...prev };
        newTracks.forEach((t) => {
          if (next[t.id] === undefined) next[t.id] = -6;
        });
        return next;
      });

      const newMutes = {};
      const newSolos = {};
      setMutes(newMutes);
      setSolos(newSolos);

      if (engine.master) {
        engine.syncState(volumes, newMutes, newSolos);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (seqRef.current) seqRef.current.dispose();
      Tone.Transport.stop();
    };
  }, []);

  useEffect(() => {
    if (seqRef.current) seqRef.current.dispose();

    const seq = new Tone.Sequence(
      (time, step) => {
        Tone.Draw.schedule(() => {
          setCurrentStep(step);
        }, time);

        tracks.forEach((track, trackIdx) => {
          if (grid[trackIdx] && grid[trackIdx][step]) {
            engine.trigger(track.id, time);
          }
        });
      },
      Array.from({ length: STEPS }, (_, i) => i),
      "16n"
    );

    seq.start(0);
    seqRef.current = seq;
  }, [grid, tracks]);

  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  // Initial Volume Setup

  // --- Controls ---
  const togglePlay = useCallback(async () => {
    if (!engine.master) {
      await engine.init();
      tracks.forEach((t) => engine.addTrack(t.id));
      engine.syncState(volumes, mutes, solos);
    }

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
  }, [isPlaying, volumes, mutes, solos, tracks]);

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
      Array(tracks.length)
        .fill(null)
        .map(() => Array(STEPS).fill(false))
    );
  };

  const handleAddTrack = () => {
    const currentCount = tracks.length;
    const initialCount = INITIAL_TRACKS.length;
    const nextIndex = currentCount - initialCount;

    if (nextIndex < EXTRA_TRACKS.length) {
      const newTrack = EXTRA_TRACKS[nextIndex];

      engine.addTrack(newTrack.id);

      setTracks((prev) => [...prev, newTrack]);
      setGrid((prev) => [...prev, Array(STEPS).fill(false)]);

      setVolumes((prev) => ({ ...prev, [newTrack.id]: -6 }));
    }
  };

  // Memoized to prevent SequencerGrid re-renders on volume change
  const updateStep = useCallback(
    (trackIdx: number, stepIdx: number, val: boolean) => {
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row]);
        newGrid[trackIdx][stepIdx] = val;
        return newGrid;
      });
    },
    []
  );

  const handleMouseDown = useCallback(
    (trackIdx: number, stepIdx: number) => {
      isPainting.current = true;
      // Derive paint state from current grid value.
      // Callback depends on `grid`, not `volumes`.
      const newState = !grid[trackIdx][stepIdx];
      paintState.current = newState;
      updateStep(trackIdx, stepIdx, newState);
    },
    [grid, updateStep]
  );

  const handleMouseEnter = useCallback(
    (trackIdx: number, stepIdx: number) => {
      if (isPainting.current) {
        updateStep(trackIdx, stepIdx, paintState.current);
      }
    },
    [updateStep]
  );

  useEffect(() => {
    const handleUp = () => (isPainting.current = false);
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 flex flex-col items-center justify-center font-sans select-none relative">
      {/* Rotate Device Overlay */}
      <div className="fixed inset-0 z-50 bg-zinc-950 flex-col items-center justify-center p-8 text-center hidden portrait:flex md:hidden">
        <Smartphone className="w-16 h-16 text-emerald-500 mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold text-white mb-4">
          PLEASE ROTATE DEVICE
        </h2>
        <p className="text-zinc-400 max-w-xs">
          Studio 808 requires a landscape view.
        </p>
      </div>

      {/* Header */}
      <div className="mb-2 md:mb-8 text-center w-full max-w-4xl">
        <h1 className="text-xl md:text-4xl font-bold tracking-tight text-white mb-2 md:mb-6">
          STUDIO 808
        </h1>

        {/* Controls Bar */}
        <div className="flex flex-wrap gap-2 md:gap-4 justify-between items-center bg-zinc-900 border border-zinc-800 p-2 md:p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={togglePlay}
              className={`flex items-center gap-2 px-3 py-1 md:px-6 md:py-2 rounded-md font-semibold text-xs md:text-base transition-all ${
                isPlaying
                  ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              }`}
            >
              {isPlaying ? (
                <Pause className="w-3 h-3 md:w-5 md:h-5" />
              ) : (
                <Play className="w-3 h-3 md:w-5 md:h-5" />
              )}
              {isPlaying ? "STOP" : "PLAY"}
            </button>

            <button
              onClick={clearGrid}
              className="p-1 md:p-2 hover:text-rose-500 transition-colors text-zinc-500"
              title="Clear Pattern"
            >
              <Trash2 className="w-3 h-3 md:w-5 md:h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="flex flex-col gap-0.5 md:gap-1">
              <label className="text-[8px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Tempo
              </label>
              <div className="flex items-center gap-1 md:gap-2 bg-zinc-950 px-2 py-0.5 md:px-3 md:py-1 rounded-md border border-zinc-800">
                <Music className="w-2 h-2 md:w-3 md:h-3 text-zinc-400" />
                <input
                  type="number"
                  value={tempoInput}
                  onChange={handleTempoChange}
                  onBlur={commitTempo}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      commitTempo();
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="w-8 md:w-12 bg-transparent text-center focus:outline-none font-bold text-zinc-200 text-xs md:text-base"
                />
                <span className="text-[8px] md:text-xs text-zinc-500">BPM</span>
              </div>
            </div>

            <div className="flex flex-col gap-0.5 md:gap-1">
              <label className="text-[8px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Swing
              </label>
              <div className="flex items-center gap-1 md:gap-2 bg-zinc-950 px-2 py-0.5 md:px-3 md:py-1 rounded-md border border-zinc-800">
                <input
                  type="range"
                  min="50"
                  max="75"
                  value={swing}
                  onChange={(e) => handleSwingChange(parseInt(e.target.value))}
                  className="w-12 md:w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
                />
                <span className="text-[8px] md:text-xs text-zinc-500 w-6 md:w-8 text-right">
                  {swing}%
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-0.5 md:gap-1">
              <label className="text-[8px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Preset
              </label>
              <select
                title="Select Pattern"
                className="bg-zinc-950 text-zinc-300 text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-md border border-zinc-800 focus:outline-none focus:border-zinc-600"
                onChange={(e) => {
                  if (e.target.value) loadPreset(e.target.value);
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  LOAD...
                </option>
                {Object.entries(PRESETS).map(([key, p]) => (
                  <option key={key} value={key}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sequencer Grid via Memoized Component */}
      <SequencerGrid
        tracks={tracks}
        grid={grid}
        currentStep={currentStep}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onAddTrack={handleAddTrack}
        showAddButton={
          tracks.length < INITIAL_TRACKS.length + EXTRA_TRACKS.length
        }
      />

      {/* Mixer Section */}
      <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-3 md:mb-6 border-b border-zinc-800 pb-2">
          Mixer
        </h2>
        <div className="flex justify-start lg:justify-center gap-2 md:gap-8 px-4 overflow-x-auto pb-4 w-full">
          {tracks.map((track) => {
            const level = Math.max(-60, meterValues[track.id] || -60);
            const height = ((level + 60) / 60) * 100; // Map -60..0 to 0..100%

            return (
              <div
                key={track.id}
                className="flex flex-col items-center gap-2 md:gap-3 w-12 md:w-16 shrink-0"
              >
                <span className="text-[10px] font-mono text-zinc-500 tabular-nums">
                  {volumes[track.id]?.toFixed(0)} dB
                </span>

                <div className="flex gap-1 mb-1">
                  <button
                    onClick={() => toggleMute(track.id)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${
                      mutes[track.id]
                        ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() => toggleSolo(track.id)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${
                      solos[track.id]
                        ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    S
                  </button>
                </div>

                <div className="flex gap-1 md:gap-2 h-40 md:h-48 bg-zinc-950/50 p-1 md:p-2 rounded-lg border border-zinc-800/50">
                  {/* Fader */}
                  <div className="relative h-full w-6 md:w-8">
                    <input
                      type="range"
                      min="-60"
                      max="6"
                      step="1"
                      value={volumes[track.id] ?? -6}
                      onChange={(e) =>
                        handleVolumeChange(track.id, parseInt(e.target.value))
                      }
                      className="absolute inset-0 w-40 md:w-48 h-8 origin-top-left -rotate-90 translate-y-40 md:translate-y-48 opacity-0 cursor-pointer z-20 touch-none"
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

          <div className="flex flex-col items-center gap-2 md:gap-3 w-12 md:w-16 shrink-0">
            <span className="text-[10px] font-mono text-zinc-500 tabular-nums">
              {volumes["master"]?.toFixed(0)} dB
            </span>
            <div className="flex gap-1 mb-1 opacity-0 pointer-events-none">
              {/* Spacer to align Master fader with tracks due to M/S buttons */}
              <div className="w-6 h-6" />
              <div className="w-6 h-6" />
            </div>
            <div className="flex gap-1 md:gap-2 h-40 md:h-48 bg-zinc-950/50 p-1 md:p-2 rounded-lg border border-zinc-800/50">
              {/* Fader */}
              <div className="relative h-full w-6 md:w-8">
                <input
                  type="range"
                  min="-60"
                  max="6"
                  step="1"
                  value={volumes["master"] ?? 0}
                  onChange={(e) =>
                    handleVolumeChange("master", parseInt(e.target.value))
                  }
                  className="absolute inset-0 w-40 md:w-48 h-8 origin-top-left -rotate-90 translate-y-40 md:translate-y-48 opacity-0 cursor-pointer z-20 touch-none"
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

// --- Memoized Components ---

interface SequencerGridProps {
  tracks: typeof INITIAL_TRACKS;
  grid: boolean[][];
  currentStep: number;
  onMouseDown: (trackIdx: number, stepIdx: number) => void;
  onMouseEnter: (trackIdx: number, stepIdx: number) => void;
  onAddTrack: () => void;
  showAddButton: boolean;
}

const SequencerGrid = memo(function SequencerGrid({
  tracks,
  grid,
  currentStep,
  onMouseDown,
  onMouseEnter,
  onAddTrack,
  showAddButton,
}: SequencerGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef<{ track: number; step: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Prevent default to stop scrolling/zooming immediately
      if (e.cancelable) e.preventDefault();

      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const cell = element?.closest("[data-track][data-step]") as HTMLElement;

      if (cell) {
        const trackIdx = parseInt(cell.dataset.track!);
        const stepIdx = parseInt(cell.dataset.step!);

        lastTouchRef.current = { track: trackIdx, step: stepIdx };
        onMouseDown(trackIdx, stepIdx);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();

      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const cell = element?.closest("[data-track][data-step]") as HTMLElement;

      if (cell) {
        const trackIdx = parseInt(cell.dataset.track!);
        const stepIdx = parseInt(cell.dataset.step!);

        if (
          !lastTouchRef.current ||
          lastTouchRef.current.track !== trackIdx ||
          lastTouchRef.current.step !== stepIdx
        ) {
          lastTouchRef.current = { track: trackIdx, step: stepIdx };
          onMouseEnter(trackIdx, stepIdx);
        }
      }
    };

    // Passive: false is required to allow preventDefault
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [onMouseDown, onMouseEnter]); // Dependencies must be stable (they are, via useCallback in parent)

  return (
    <div
      ref={containerRef}
      className="w-full max-w-5xl bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 shadow-xl mb-8"
    >
      {tracks.map((track, trackIdx) => (
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
                  className="aspect-square relative touch-none"
                  data-track={trackIdx}
                  data-step={stepIdx}
                  onMouseDown={() => onMouseDown(trackIdx, stepIdx)}
                  onMouseEnter={() => onMouseEnter(trackIdx, stepIdx)}
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

      {/* Add Track Button */}
      {showAddButton && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onAddTrack}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs font-bold text-zinc-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            ADD TRACK
          </button>
        </div>
      )}
    </div>
  );
});
