"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function GlitchChaos() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [frustration, setFrustration] = useState(0);

  const moveButton = () => {
    const x = (Math.random() - 0.5) * 400; // range -200 to 200
    const y = (Math.random() - 0.5) * 400;
    setPos({ x, y });
    setFrustration((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] opacity-10 pointer-events-none mix-blend-screen" />

      <h1
        className="text-6xl font-black mb-12 tracking-tighter uppercase relative z-10"
        style={{ textShadow: "4px 4px 0px red, -4px -4px 0px blue" }}
      >
        DONT_CLICK_ME
      </h1>

      <div className="relative z-20">
        <motion.button
          animate={{ x: pos.x, y: pos.y }}
          transition={{ type: "tween", duration: 0.1 }}
          onMouseEnter={moveButton}
          onClick={moveButton}
          className="bg-red-600 text-black font-bold text-2xl px-12 py-6 uppercase tracking-widest border-4 border-white hover:bg-white hover:text-red-600 shadow-[10px_10px_0px_white]"
        >
          CLICK ME
        </motion.button>
      </div>

      <div className="mt-32 text-center z-10">
        <p className="text-red-500 font-mono">
          FRUSTRATION_LEVEL: {frustration}
        </p>
        <div className="w-64 h-4 bg-gray-900 border border-red-900 mt-2 mx-auto">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${Math.min(frustration * 2, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
