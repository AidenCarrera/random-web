"use client";

import { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { Play, Pause, Trash2, Volume2, Music } from "lucide-react";

// --- Configuration ---
const STEPS = 16;
const TRACKS_CONFIG = [
  { id: "kick", name: "KICK", color: "bg-pink-500", text: "text-pink-500" },
  { id: "snare", name: "SNARE", color: "bg-cyan-500", text: "text-cyan-500" },
  {
    id: "hihat",
    name: "HIHAT",
    color: "bg-yellow-400",
    text: "text-yellow-400",
  },
  { id: "clap", name: "CLAP", color: "bg-purple-500", text: "text-purple-500" },
];

// --- Audio Engine Class (Lazy Init) ---
class AudioEngine {
  instruments: Record<
    string,
    Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth | Tone.Sampler
  > = {};
  master: Tone.Channel | null = null;
  limit: Tone.Limiter | null = null;

  async init() {
    await Tone.start();

    // Create master chain
    this.limit = new Tone.Limiter(-1).toDestination();
    this.master = new Tone.Channel({ volume: 0 }).connect(this.limit);

    // Initialize Synths
    this.createKick("kick");
    this.createSnare("snare");
    this.createHiHat("hihat");
    this.createClap("clap");
  }

  private createKick(id: string) {
    if (!this.master) return;
    this.instruments[id] = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
    }).connect(this.master);
  }

  private createSnare(id: string) {
    if (!this.master) return;
    this.instruments[id] = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 1.4 },
    }).connect(this.master);
  }

  private createHiHat(id: string) {
    if (!this.master) return;
    const hat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
      harmonicity: 4.1,
      modulationIndex: 40,
      resonance: 3000,
      octaves: 1,
    }).connect(this.master);
    hat.frequency.value = 250;
    hat.volume.value = -8;
    this.instruments[id] = hat;
  }

  private createClap(id: string) {
    if (!this.master) return;

    // Clap needs a filter to sound realistic (Bandpass ~1kHz-2kHz)
    const filter = new Tone.Filter(1500, "bandpass").connect(this.master);

    const clap = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    }).connect(filter);

    clap.volume.value = 0;
    this.instruments[id] = clap;
  }

  trigger(id: string, time: number) {
    const inst = this.instruments[id];
    if (!inst) return;

    if (inst instanceof Tone.MembraneSynth) {
      inst.triggerAttackRelease("C1", "8n", time);
    } else if (inst instanceof Tone.MetalSynth) {
      // Fix: First arg must be frequency/note.
      // "32n" was duration passed as note.
      // Use high frequency for hihat.
      inst.triggerAttackRelease("C5", "32n", time, 1);
    } else if (inst instanceof Tone.NoiseSynth) {
      if (id === "clap") {
        // Simulate "Flam" (multiple impacts) for clap
        inst.triggerAttackRelease("32n", time, 1);
        inst.triggerAttackRelease("32n", time + 0.01, 0.7);
        inst.triggerAttackRelease("32n", time + 0.02, 0.5);
      } else {
        inst.triggerAttackRelease("8n", time);
      }
    }
  }

  setVolume(dB: number) {
    if (this.master) this.master.volume.rampTo(dB, 0.1);
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
  const [volume, setVolume] = useState(0);

  // Painting State
  const isPainting = useRef(false);
  const paintState = useRef(false); // true = add, false = remove

  // Tone.js Refs
  const seqRef = useRef<Tone.Sequence | null>(null);

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
    engine.setVolume(volume);
  }, [volume]);

  // --- Controls ---
  const togglePlay = async () => {
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
  };

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
    <div className="min-h-screen bg-[#120024] text-white p-4 flex flex-col items-center justify-center font-mono select-none">
      {/* Header */}
      <div className="mb-8 text-center glow-text-purple w-full max-w-4xl">
        <h1 className="text-4xl font-black italic tracking-tighter text-[#ff00ff] drop-shadow-[4px_4px_0px_#00ffff] mb-6">
          NEON_BEATS_808
        </h1>

        {/* Controls Bar */}
        <div className="flex flex-wrap gap-4 justify-between items-center bg-[#1e0030]/50 p-4 rounded-xl border border-[#ff00ff]/20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${
                isPlaying
                  ? "bg-[#ff00ff] shadow-[0_0_20px_#ff00ff] text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300"
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
              className="p-2 hover:text-red-500 transition-colors text-gray-500"
              title="Clear Pattern"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Tempo
              </label>
              <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg border border-gray-700">
                <Music className="w-3 h-3 text-[#00ffff]" />
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
                  className="w-12 bg-transparent text-center focus:outline-none font-bold text-[#00ffff]"
                />
                <span className="text-xs text-gray-500">BPM</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> Master
              </label>
              <input
                type="range"
                min="-60"
                max="0"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-32 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#ff00ff]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sequencer Grid */}
      <div className="w-full max-w-5xl bg-black/40 p-8 rounded-xl border border-[#00ffff]/30 backdrop-blur-md shadow-2xl">
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
                className={`h-1 w-full bg-gray-800 rounded-full overflow-hidden`}
              >
                <div className={`h-full w-full ${track.color} opacity-50`} />
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
                                ? "bg-gray-700/50"
                                : "bg-gray-800/30"
                            }
                            ${
                              currentStep === stepIdx
                                ? "ring-2 ring-white z-10 brightness-150 scale-110"
                                : ""
                            }
                            hover:brightness-125
                        `}
                      style={{
                        boxShadow: isActive
                          ? `0 0 10px ${track.color}`
                          : "none",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
