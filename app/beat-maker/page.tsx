"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Trash2 } from "lucide-react";

const STEPS = 16;
const TRACKS = [
  { name: "KICK", color: "bg-pink-500", sound: "kick" },
  { name: "SNARE", color: "bg-cyan-500", sound: "snare" },
  { name: "HIHAT", color: "bg-yellow-400", sound: "hihat" },
  { name: "CLAP", color: "bg-purple-500", sound: "clap" },
];

export default function BeatMaker() {
  const [grid, setGrid] = useState<boolean[][]>(
    Array(TRACKS.length)
      .fill(null)
      .map(() => Array(STEPS).fill(false))
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(120);

  // Simple web audio synth as fallback/implementation
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext)();
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const playSound = (type: string) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "kick") {
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    } else if (type === "snare") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(100, now);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    } else if (type === "hihat") {
      osc.type = "square";
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, now);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    }

    osc.start(now);
    osc.stop(now + 0.5);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      const stepTime = (60 / tempo / 4) * 1000;
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % STEPS;

          // Play sounds for the NEXT step (or current if we want immediate)
          // Actually inside interval we prefer playing the step we just moved TO.
          TRACKS.forEach((track, trackIndex) => {
            if (grid[trackIndex][next]) {
              playSound(track.sound);
            }
          });

          return next;
        });
      }, stepTime);
    }
    return () => clearInterval(interval);
  }, [isPlaying, tempo, grid]);

  const toggleStep = (trackIdx: number, stepIdx: number) => {
    const newGrid = [...grid];
    newGrid[trackIdx][stepIdx] = !newGrid[trackIdx][stepIdx];
    setGrid(newGrid);
  };

  return (
    <div className="min-h-screen bg-[#120024] text-white p-4 flex flex-col items-center justify-center font-mono">
      <div className="mb-8 text-center glow-text-purple">
        <h1 className="text-4xl font-black italic tracking-tighter text-[#ff00ff] drop-shadow-[4px_4px_0px_#00ffff]">
          NEON_BEATS_808
        </h1>
        <div className="flex gap-4 justify-center mt-4 items-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${
              isPlaying
                ? "bg-[#ff00ff] shadow-[0_0_20px_#ff00ff]"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            {isPlaying ? "STOP" : "PLAY"}
          </button>
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-full px-4 py-2">
            <span className="text-xs text-gray-400">BPM</span>
            <input
              type="number"
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value))}
              className="w-12 bg-transparent text-center focus:outline-none"
            />
          </div>
          <button
            onClick={() =>
              setGrid(
                Array(TRACKS.length)
                  .fill(null)
                  .map(() => Array(STEPS).fill(false))
              )
            }
            className="p-2 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-5xl bg-black/40 p-6 rounded-xl border border-[#00ffff]/30 backdrop-blur-md">
        {TRACKS.map((track, trackIdx) => (
          <div key={track.name} className="flex items-center gap-4 mb-4">
            <div
              className={`w-16 text-xs font-bold ${track.color.replace(
                "bg-",
                "text-"
              )} tracking-widest`}
            >
              {track.name}
            </div>
            <div className="flex-1 grid grid-cols-16 gap-1">
              {grid[trackIdx].map((isActive, stepIdx) => (
                <button
                  key={stepIdx}
                  onClick={() => toggleStep(trackIdx, stepIdx)}
                  className={`
                                aspect-square rounded-sm transition-all duration-75 relative
                                ${isActive ? track.color : "bg-gray-800/50"}
                                ${
                                  currentStep === stepIdx
                                    ? "ring-2 ring-white z-10 scale-110 brightness-150"
                                    : ""
                                }
                                hover:brightness-125
                            `}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
