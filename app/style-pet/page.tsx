"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

// --- Types ---
type HatType = "NONE" | "CAP" | "PARTY" | "CROWN" | "BOW" | "GLASSES";
type FaceType = "NORMAL" | "HAPPY" | "COOL" | "SLEEPY" | "SHOCKED";

interface PetState {
  hat: HatType;
  face: FaceType;
  animation: "IDLE" | "JUMP" | "SPIN" | "WIGGLE";
}

// --- Pixel Art Assets ---

const PetBase = ({ face }: { face: FaceType }) => (
  <div className="relative w-32 h-32">
    {/* Body */}
    <div className="w-24 h-24 bg-black absolute top-4 left-4 rounded-[4px]" />
    {/* Ears */}
    <div className="w-4 h-4 bg-black absolute top-0 left-4" />
    <div className="w-4 h-4 bg-black absolute top-0 left-24" />

    {/* Face Rendering */}
    {face === "NORMAL" && (
      <>
        <div className="w-4 h-4 bg-[#9ea791] absolute top-10 left-8" />
        <div className="w-4 h-4 bg-[#9ea791] absolute top-10 left-20" />
        <div className="w-8 h-2 bg-[#9ea791] absolute top-20 left-12" />
      </>
    )}
    {face === "HAPPY" && (
      <>
        <div className="w-4 h-2 bg-[#9ea791] absolute top-10 left-8 rounded-t-full" />
        <div className="w-4 h-2 bg-[#9ea791] absolute top-10 left-20 rounded-t-full" />
        <div className="w-10 h-4 bg-[#9ea791] absolute top-18 left-11 rounded-b-full" />
      </>
    )}
    {face === "COOL" && (
      <>
        <div className="w-20 h-6 bg-black border-2 border-[#9ea791] absolute top-10 left-6" />
        <div className="w-6 h-2 bg-[#9ea791] absolute top-20 left-18 transform -rotate-12" />
      </>
    )}
    {face === "SLEEPY" && (
      <>
        <div className="w-6 h-1 bg-[#9ea791] absolute top-12 left-7" />
        <div className="w-6 h-1 bg-[#9ea791] absolute top-12 left-19" />
        <div className="w-2 h-2 bg-[#9ea791] rounded-full absolute top-20 left-15" />
      </>
    )}
    {face === "SHOCKED" && (
      <>
        <div className="w-2 h-2 bg-[#9ea791] absolute top-8 left-8" />
        <div className="w-2 h-2 bg-[#9ea791] absolute top-8 left-20" />
        <div className="w-8 h-8 bg-[#9ea791] absolute top-16 left-12 rounded-full" />
      </>
    )}
  </div>
);

const HatOverlay = ({ type }: { type: HatType }) => {
  if (type === "NONE") return null;
  return (
    <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none z-20">
      {type === "CAP" && (
        <div className="absolute top-[-10px] left-6">
          <div className="w-20 h-6 bg-red-500 rounded-t-lg" />
          <div className="w-24 h-2 bg-red-500 absolute top-4 -left-2" />
        </div>
      )}
      {type === "PARTY" && (
        <div className="absolute top-[-30px] left-12 w-0 h-0 border-l-15 border-l-transparent border-r-15 border-r-transparent border-b-40 border-b-yellow-400" />
      )}
      {type === "CROWN" && (
        <div className="absolute top-[-15px] left-10 flex gap-1">
          <div className="w-4 h-8 bg-yellow-500" />
          <div className="w-4 h-10 bg-yellow-500" />
          <div className="w-4 h-8 bg-yellow-500" />
          <div className="w-16 h-2 bg-yellow-500 absolute bottom-0 -left-2" />
        </div>
      )}
      {type === "BOW" && (
        <div className="absolute top-[-5px] left-12">
          <div className="w-4 h-4 bg-pink-400 rounded-full" />
          <div className="w-6 h-6 bg-pink-400 absolute top-0 -left-4 rounded-full -z-10" />
          <div className="w-6 h-6 bg-pink-400 absolute top-0 left-2 rounded-full -z-10" />
        </div>
      )}
      {type === "GLASSES" && (
        <div className="absolute top-8 left-4 flex items-center gap-2">
          <div className="w-8 h-8 border-4 border-white rounded-full" />
          <div className="w-4 h-1 bg-white" />
          <div className="w-8 h-8 border-4 border-white rounded-full" />
        </div>
      )}
    </div>
  );
};

const HATS: HatType[] = ["NONE", "CAP", "PARTY", "CROWN", "BOW", "GLASSES"];
const FACES: FaceType[] = ["NORMAL", "HAPPY", "COOL", "SLEEPY", "SHOCKED"];

export default function DressUpPet() {
  const [hat, setHat] = useState<HatType>("NONE");
  const [face, setFace] = useState<FaceType>("NORMAL");
  const [anim, setAnim] = useState<PetState["animation"]>("IDLE");

  const cycleHat = (direction: 1 | -1) => {
    const idx = HATS.indexOf(hat);
    const next = (idx + direction + HATS.length) % HATS.length;
    setHat(HATS[next]);
    triggerAnim("WIGGLE");
  };

  const cycleFace = (direction: 1 | -1) => {
    const idx = FACES.indexOf(face);
    const next = (idx + direction + FACES.length) % FACES.length;
    setFace(FACES[next]);
    triggerAnim("SPIN");
  };

  const randomize = () => {
    // eslint-disable-next-line
    setHat(HATS[Math.floor(Math.random() * HATS.length)]);
    // eslint-disable-next-line
    setFace(FACES[Math.floor(Math.random() * FACES.length)]);
    triggerAnim("JUMP");
  };

  const triggerAnim = (a: PetState["animation"]) => {
    setAnim(a);
    setTimeout(() => setAnim("IDLE"), 500);
  };

  return (
    <div className="min-h-screen bg-[#8b9bb4] flex items-center justify-center p-4">
      {/* Device Case */}
      <div className="bg-[#f0f0f0] p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_-10px_20px_rgba(0,0,0,0.1)] max-w-sm w-full border-4 border-[#dcdcdc] relative scale-125 md:scale-150 transition-transform duration-300">
        {/* Screen Area */}
        <div className="bg-[#9ea791] p-6 rounded-xl border-8 border-[#8b9185] shadow-[inset_0_5px_10px_rgba(0,0,0,0.2)] h-64 flex flex-col justify-between relative overflow-hidden">
          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-size-[4px_4px] pointer-events-none z-0" />

          {/* Header */}
          <div className="flex justify-between items-center text-[#1a1a1a] z-10 font-bold opacity-60 text-xs text-center w-full">
            <span>DRESS-UP MODE</span>
          </div>

          {/* Main Display */}
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div
              className={`relative transition-transform duration-300 ${
                anim === "JUMP"
                  ? "animate-bounce"
                  : anim === "SPIN"
                  ? "animate-spin"
                  : anim === "WIGGLE"
                  ? "animate-pulse"
                  : ""
              }`}
              onClick={() => triggerAnim("JUMP")}
            >
              <PetBase face={face} />
              <HatOverlay type={hat} />
            </div>
          </div>

          {/* Controls Label */}
          <div className="h-6 flex justify-between items-center z-10 font-bold text-[#1a1a1a] text-[10px] uppercase">
            <span className="w-1/2 text-center">Face</span>
            <span className="w-1/2 text-center">Hat</span>
          </div>
        </div>

        {/* Brand */}
        <div className="text-center mt-2 mb-4">
          <span className="text-slate-400 font-bold tracking-widest text-sm uppercase">
            Style-Pet
          </span>
        </div>

        {/* Buttons Controls */}
        <div className="flex justify-center gap-4 px-2">
          {/* Face Controls */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => cycleFace(-1)}
                className="w-8 h-8 rounded bg-[#4fd1c5] shadow-[0_2px_0_#319795] active:translate-y-[2px] active:shadow-none flex items-center justify-center"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => cycleFace(1)}
                className="w-8 h-8 rounded bg-[#4fd1c5] shadow-[0_2px_0_#319795] active:translate-y-[2px] active:shadow-none flex items-center justify-center"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Random Button (Middle) */}
          <div className="flex flex-col items-center justify-start -mt-2">
            <button
              onClick={randomize}
              className="w-12 h-12 rounded-full bg-[#ffcc00] shadow-[0_4px_0_#c29b00] active:translate-y-[4px] active:shadow-none flex items-center justify-center"
            >
              <Shuffle className="text-black/50" />
            </button>
          </div>

          {/* Hat Controls */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => cycleHat(-1)}
                className="w-8 h-8 rounded bg-[#ff5555] shadow-[0_2px_0_#cc0000] active:translate-y-[2px] active:shadow-none flex items-center justify-center"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => cycleHat(1)}
                className="w-8 h-8 rounded bg-[#ff5555] shadow-[0_2px_0_#cc0000] active:translate-y-[2px] active:shadow-none flex items-center justify-center"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
