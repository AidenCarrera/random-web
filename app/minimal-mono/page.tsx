"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function MinimalMono() {
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && time > 0) {
      interval = setInterval(() => setTime((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center font-sans">
      <div className="text-[20vw] leading-none font-bold tracking-tighter tabular-nums">
        {formatTime(time)}
      </div>

      <div className="flex gap-8 mt-12">
        <button
          onClick={() => setIsActive(!isActive)}
          className="w-24 h-24 border-4 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors"
        >
          {isActive ? (
            <Pause className="w-10 h-10" />
          ) : (
            <Play className="w-10 h-10 ml-1" />
          )}
        </button>

        <button
          onClick={() => {
            setIsActive(false);
            setTime(25 * 60);
          }}
          className="w-24 h-24 border-4 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors"
        >
          <RotateCcw className="w-8 h-8" />
        </button>
      </div>

      <div className="mt-16 uppercase tracking-widest text-sm text-gray-400">
        Focus Timer • Mono Design
      </div>
    </div>
  );
}
