"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PLANTS = ["🌱", "🌿", "🌷", "🌻", "🌲", "🌸", "🍄", "🪷"];

interface Plant {
  id: number;
  x: number;
  y: number;
  type: string;
}

export default function NatureZen() {
  const [plants, setPlants] = useState<Plant[]>([]);

  const handlePlant = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const randomPlant = PLANTS[Math.floor(Math.random() * PLANTS.length)];

    setPlants((prev) => [...prev, { id: Date.now(), x, y, type: randomPlant }]);
  };

  return (
    <div
      className="min-h-screen bg-[#f0fdf4] text-green-900 overflow-hidden relative cursor-cell"
      onClick={handlePlant}
    >
      <div className="absolute top-10 left-10 pointer-events-none">
        <h1 className="text-4xl font-light tracking-wide font-serif">
          The Zen Garden
        </h1>
        <p className="mt-2 text-green-700/60 opacity-60">
          Click anywhere to sow life.
        </p>
      </div>

      <AnimatePresence>
        {plants.map((plant) => (
          <motion.div
            key={plant.id}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="absolute text-6xl select-none"
            style={{ left: plant.x - 30, top: plant.y - 40 }}
          >
            {plant.type}
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setPlants([]);
        }}
        className="absolute bottom-10 right-10 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full text-sm hover:bg-white/80 transition-colors uppercase tracking-widest text-green-800"
      >
        Clear Garden
      </button>
    </div>
  );
}
