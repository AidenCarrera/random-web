"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function PastelDream() {
  const [speed, setSpeed] = useState(4); // seconds per cycle
  const [isInhale, setIsInhale] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsInhale((prev) => !prev);
    }, speed * 1000);
    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-8 transition-all duration-1000">
      <div className="relative flex items-center justify-center w-96 h-96">
        <motion.div
          animate={{
            scale: isInhale ? 1.5 : 1,
            opacity: isInhale ? 0.8 : 0.4,
            filter: isInhale ? "blur(20px)" : "blur(40px)",
          }}
          transition={{ duration: speed, ease: "easeInOut" }}
          className="absolute inset-0 bg-linear-to-tr from-blue-300 to-pink-300 rounded-full"
        />
        <motion.div
          animate={{
            scale: isInhale ? 1.2 : 0.8,
          }}
          transition={{ duration: speed, ease: "easeInOut" }}
          className="z-10 text-4xl font-light text-slate-600 tracking-[0.5em] uppercase"
        >
          {isInhale ? "Inhale" : "Exhale"}
        </motion.div>
      </div>

      <div className="mt-12 bg-white/30 backdrop-blur-md p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 w-80">
        <label className="text-slate-600 font-medium tracking-wide">
          Breath Duration: {speed}s
        </label>
        <input
          type="range"
          min="2"
          max="8"
          step="0.5"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-full accent-pink-300 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between w-full text-xs text-slate-400">
          <span>Fast (2s)</span>
          <span>Slow (8s)</span>
        </div>
      </div>
    </div>
  );
}
