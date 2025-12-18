"use client";

import { useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import { Music, Activity } from "lucide-react";

const SCALES = {
  Major: [
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
    "D5",
    "E5",
    "F5",
    "G5",
    "A5",
    "B5",
    "C6",
    "D6",
  ],
  Minor: [
    "C4",
    "D4",
    "Eb4",
    "F4",
    "G4",
    "Ab4",
    "Bb4",
    "C5",
    "D5",
    "Eb5",
    "F5",
    "G5",
    "Ab5",
    "Bb5",
    "C6",
    "D6",
  ],
  Pentatonic: [
    "C4",
    "D4",
    "E4",
    "G4",
    "A4",
    "C5",
    "D5",
    "E5",
    "G5",
    "A5",
    "C6",
    "D6",
    "E6",
    "G6",
    "A6",
    "C7",
  ],
  Blues: [
    "C4",
    "Eb4",
    "F4",
    "Gb4",
    "G4",
    "Bb4",
    "C5",
    "Eb5",
    "F5",
    "Gb5",
    "G5",
    "Bb5",
    "C6",
    "Eb6",
    "F6",
    "Gb6",
  ],
};

export default function PadSynth() {
  const [isReady, setIsReady] = useState(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [volume, setVolume] = useState(-10);
  const [oscType, setOscType] = useState<
    "sine" | "triangle" | "square" | "sawtooth"
  >("triangle");
  const [currentScale, setCurrentScale] =
    useState<keyof typeof SCALES>("Major");
  const [reverbAmt, setReverbAmt] = useState(0.15);
  // Delay State
  const [delayAmt, setDelayAmt] = useState(0);
  const [delayTime, setDelayTime] = useState<"16n" | "8n" | "4n">("8n");

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);

  // Drag State
  const isMouseDown = useRef(false);
  const lastPlayedNote = useRef<string | null>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      isMouseDown.current = false;
      lastPlayedNote.current = null;
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      synthRef.current?.dispose();
      reverbRef.current?.dispose();
      delayRef.current?.dispose();
    };
  }, []);

  const initAudio = async () => {
    await Tone.start();

    const reverb = new Tone.Reverb(3).toDestination();
    reverb.wet.value = reverbAmt;
    reverbRef.current = reverb;

    const delay = new Tone.FeedbackDelay(delayTime, 0.5);
    delay.wet.value = delayAmt;
    delayRef.current = delay;

    // Connect Delay -> Reverb -> Dest
    delay.connect(reverb);

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: oscType,
      },
      envelope: {
        attack: 0.05,
        decay: 0.2,
        sustain: 0.3,
        release: 1,
      },
    }).connect(delay); // Connect Synth -> Delay

    const volOffset =
      oscType === "sine"
        ? 3
        : oscType === "triangle"
        ? 5
        : oscType === "square"
        ? -2
        : 0;
    synth.volume.value = volume + volOffset;
    synthRef.current = synth;
    setIsReady(true);
  };

  const playNote = (note: string) => {
    if (!isReady) initAudio();
    if (synthRef.current) {
      // Don't re-trigger same note if dragging
      if (lastPlayedNote.current === note) return;

      synthRef.current.triggerAttackRelease(note, "8n");
      setActiveNote(note);
      lastPlayedNote.current = note;
      setTimeout(() => {
        setActiveNote((prev) => (prev === note ? null : prev));
      }, 200);
    }
  };

  // Touch Drag Handler
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const note = element?.getAttribute("data-note");
    if (note) {
      playNote(note);
    } else {
      lastPlayedNote.current = null; // Reset if off a key to allow re-entry
    }
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (synthRef.current) {
      const offset =
        oscType === "sine"
          ? 3
          : oscType === "triangle"
          ? 5
          : oscType === "square"
          ? -2
          : 0;
      synthRef.current.volume.value = val + offset;
    }
  };

  const handleOscChange = (
    type: "sine" | "triangle" | "square" | "sawtooth"
  ) => {
    setOscType(type);
    if (synthRef.current) {
      synthRef.current.set({ oscillator: { type } });
      const offset =
        type === "sine"
          ? 3
          : type === "triangle"
          ? 5
          : type === "square"
          ? -2
          : 0;
      synthRef.current.volume.value = volume + offset;
    }
  };

  const handleReverbChange = (val: number) => {
    setReverbAmt(val);
    if (reverbRef.current) {
      reverbRef.current.wet.value = val;
    }
  };

  const handleDelayChange = (val: number) => {
    setDelayAmt(val);
    if (delayRef.current) {
      delayRef.current.wet.value = val;
    }
  };

  const toggleDelayTime = () => {
    const options: ("16n" | "8n" | "4n")[] = ["16n", "8n", "4n"];
    const currentIndex = options.indexOf(delayTime);
    const nextIndex = (currentIndex + 1) % options.length;
    const nextTime = options[nextIndex];

    setDelayTime(nextTime);
    if (delayRef.current) {
      delayRef.current.delayTime.value = nextTime;
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e5ec] text-slate-600 font-sans flex items-center justify-center p-6 select-none transition-colors duration-500">
      {/* Main Board */}
      <div className="bg-[#e0e5ec] rounded-[3rem] p-8 md:p-12 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] max-w-4xl w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#e0e5ec] shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] flex items-center justify-center text-blue-400">
              <Music className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-700">
                PAD SYNTH
              </h1>
              <p className="text-sm font-medium text-slate-400">
                Soft Tactile Interface
              </p>
            </div>
          </div>

          {/* Master Controls */}
          <div className="flex gap-4">
            <button
              onClick={() => setIsReady(!isReady)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                isReady
                  ? "shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] text-blue-500"
                  : "shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] text-slate-400 hover:text-blue-400"
              }`}
              title="Power Toggle"
            >
              <Activity className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Scale Selector */}
          <div className="bg-[#e0e5ec] p-4 rounded-2xl shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff]">
            <label className="text-xs font-bold uppercase tracking-wider mb-3 block text-center text-slate-500">
              Scale Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(SCALES).map((s) => (
                <button
                  key={s}
                  onClick={() => setCurrentScale(s as keyof typeof SCALES)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    currentScale === s
                      ? "shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] text-blue-500"
                      : "shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] hover:translate-y-[-2px]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Waveform Selector */}
          <div className="bg-[#e0e5ec] p-4 rounded-2xl shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff]">
            <label className="text-xs font-bold uppercase tracking-wider mb-3 block text-center text-slate-500">
              Waveform
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["sine", "triangle", "square", "sawtooth"].map((type) => {
                const activeClasses =
                  {
                    sine: "bg-blue-500 text-white shadow-[inset_3px_3px_6px_#2563eb,inset_-3px_-3px_6px_#60a5fa]",
                    triangle:
                      "bg-emerald-500 text-white shadow-[inset_3px_3px_6px_#059669,inset_-3px_-3px_6px_#34d399]",
                    square:
                      "bg-amber-500 text-white shadow-[inset_3px_3px_6px_#d97706,inset_-3px_-3px_6px_#fbbf24]",
                    sawtooth:
                      "bg-red-500 text-white shadow-[inset_3px_3px_6px_#dc2626,inset_-3px_-3px_6px_#f87171]",
                  }[type] || "";

                return (
                  <button
                    key={type}
                    onClick={() =>
                      handleOscChange(
                        type as "sine" | "triangle" | "square" | "sawtooth"
                      )
                    }
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${
                      oscType === type
                        ? activeClasses
                        : "shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] hover:translate-y-[-2px]"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Knobs */}
          <div className="bg-[#e0e5ec] p-4 rounded-2xl shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] flex flex-col justify-center gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>VOLUME</span>
                <span>{Math.round((volume + 30) / 0.3)}%</span>
              </div>
              <input
                type="range"
                min="-30"
                max="0"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-[#e0e5ec] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>REVERB</span>
                <span>{Math.round(reverbAmt * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={reverbAmt}
                onChange={(e) => handleReverbChange(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-[#e0e5ec] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500 items-center">
                <span className="flex items-center gap-2">
                  ECHO
                  <button
                    onClick={toggleDelayTime}
                    className="bg-[#e0e5ec] shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] px-2 py-0.5 rounded text-[10px] hover:text-blue-500 transition-all font-mono"
                    title="Toggle Delay Time"
                  >
                    {delayTime === "16n"
                      ? "1/16"
                      : delayTime === "8n"
                      ? "1/8"
                      : "1/4"}
                  </button>
                </span>
                <span>{Math.round(delayAmt * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                value={delayAmt}
                onChange={(e) => handleDelayChange(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-[#e0e5ec] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff]"
              />
            </div>
          </div>
        </div>

        {/* Note Grid */}
        <div
          className="grid grid-cols-4 gap-4 md:gap-6 touch-none"
          onTouchMove={handleTouchMove}
        >
          {SCALES[currentScale].map((note) => {
            const colorClasses = {
              sine: "text-blue-500 hover:text-blue-400",
              triangle: "text-emerald-500 hover:text-emerald-400",
              square: "text-amber-500 hover:text-amber-400",
              sawtooth: "text-red-500 hover:text-red-400",
            }[oscType];

            // Split active vs inactive color application
            const activeColor = colorClasses.split(" ")[0]; // e.g., text-blue-500

            return (
              <button
                key={note}
                data-note={note}
                onMouseDown={() => {
                  isMouseDown.current = true;
                  playNote(note);
                }}
                onMouseEnter={() => {
                  if (isMouseDown.current) playNote(note);
                }}
                onTouchStart={() => {
                  playNote(note);
                }}
                className={`
                        aspect-square rounded-2xl md:rounded-3xl flex items-center justify-center
                        text-lg font-bold transition-all duration-150 touch-none select-none
                        ${
                          activeNote === note
                            ? `shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] ${activeColor} scale-95`
                            : `shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] text-slate-500 ${
                                colorClasses.split(" ")[1]
                              } active:scale-95`
                        }
                    `}
              >
                {note}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
