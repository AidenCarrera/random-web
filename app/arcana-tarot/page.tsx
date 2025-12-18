"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Eye } from "lucide-react";

// Simplified Tarot Data
const TAROT_CARDS = [
  { name: "The Fool", meaning: "New beginnings, optimism, trust in life" },
  { name: "The Magician", meaning: "Action, the power to manifest" },
  {
    name: "The High Priestess",
    meaning: "Inaction, going within, the subconscious",
  },
  {
    name: "The Empress",
    meaning: "Abundance, nurturing, fertility, life in bloom!",
  },
  { name: "The Emperor", meaning: "Structure, stability, rules and power" },
  {
    name: "The Hierophant",
    meaning: "Institutions, tradition, society and its rules",
  },
  { name: "The Lovers", meaning: "Sexuality, passion, choice, uniting" },
  { name: "The Chariot", meaning: "Movement, progress, integration" },
  {
    name: "Strength",
    meaning: "Courage, subtle power, integration of animal self",
  },
  { name: "The Hermit", meaning: "Meditation, solitude, consciousness" },
  { name: "Wheel of Fortune", meaning: "Cycles, change, ups and downs" },
  { name: "Justice", meaning: "Fairness, equality, balance" },
  {
    name: "The Hanged Man",
    meaning: "Surrender, new perspective, enlightenment",
  },
  { name: "Death", meaning: "End of cycle, beginnings, change, metamorphosis" },
  { name: "Temperance", meaning: "Balance, moderation, being sensible" },
  { name: "The Devil", meaning: "Addiction, materialism, playfulness" },
  { name: "The Tower", meaning: "Sudden upheaval, broken pride, disaster" },
  { name: "The Star", meaning: "Hope, faith, rejuvenation" },
  { name: "The Moon", meaning: "Unconscious, illusions, intuition" },
  { name: "The Sun", meaning: "Joy, success, celebration, positivity" },
  { name: "Judgement", meaning: "Reflection, reckoning, awakening" },
  { name: "The World", meaning: "Fulfillment, harmony, completion" },
];

interface DrawnCard {
  card: (typeof TAROT_CARDS)[0];
  position: "Past" | "Present" | "Future";
  revealed: boolean;
}

import { Cinzel_Decorative } from "next/font/google";

const cinzel = Cinzel_Decorative({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

// ... (existing simplified card data)

export default function TarotSpread() {
  const [spread, setSpread] = useState<DrawnCard[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  const startReading = () => {
    setIsShuffling(true);
    setSpread([]);

    // Simulate shuffle delay
    setTimeout(() => {
      const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
      const newSpread = [
        { card: shuffled[0], position: "Past", revealed: false },
        { card: shuffled[1], position: "Present", revealed: false },
        { card: shuffled[2], position: "Future", revealed: false },
      ] as DrawnCard[];

      setSpread(newSpread);
      setIsShuffling(false);
    }, 1500);
  };

  const revealCard = (index: number) => {
    setSpread((prev) =>
      prev.map((c, i) => (i === index ? { ...c, revealed: true } : c))
    );
  };

  return (
    <div
      className={`min-h-screen bg-[#1a0b2e] text-[#e0b0ff] font-serif flex flex-col items-center md:justify-center py-12 px-4 overflow-x-hidden ${cinzel.className}`}
    >
      <header className="mb-12 text-center relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-900/40 rounded-full blur-[80px] -z-10" />
        <h1 className="text-5xl md:text-7xl font-bold text-[#ffd700] mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
          Arcana
        </h1>
        <p className="text-lg text-purple-200/60 italic tracking-widest font-serif">
          Reveal your fate
        </p>
      </header>

      <div className="max-w-6xl w-full flex flex-col items-center">
        {spread.length === 0 && !isShuffling ? (
          <button
            onClick={startReading}
            className="group relative px-12 py-6 bg-transparent border-2 border-[#ffd700] text-[#ffd700] text-2xl font-bold uppercase tracking-[0.2em] transition-all hover:bg-[#ffd700] hover:text-[#1a0b2e] overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-4">
              <Sparkles className="w-6 h-6" />
              Consult the Cards
            </span>
            <div className="absolute inset-0 bg-[#ffd700] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 z-0" />
          </button>
        ) : isShuffling ? (
          <div className="flex flex-col items-center gap-6 animate-pulse">
            <div className="w-32 h-48 border-4 border-[#ffd700]/30 rounded-xl bg-[#2d1b4e] rotate-12" />
            <p className="text-xl tracking-widest text-[#ffd700]/70">
              SHUFFLING...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full perspective-1000">
            {spread.map((slot, index) => (
              <div
                key={slot.position}
                className="flex flex-col items-center gap-6"
              >
                <p className="text-xl font-bold uppercase text-purple-300/50 tracking-widest border-b border-purple-300/20 pb-2 w-full text-center">
                  {slot.position}
                </p>

                {/* Card Container with Flip */}
                <div
                  onClick={() => !slot.revealed && revealCard(index)}
                  className={`relative w-64 h-96 cursor-pointer transform-style-3d transition-transform duration-700 ${
                    slot.revealed ? "rotate-y-180" : "hover:scale-105"
                  }`}
                >
                  {/* Card Back */}
                  <div className="absolute inset-0 backface-hidden w-full h-full rounded-xl border-4 border-[#ffd700]/50 bg-[#2d1b4e] flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]">
                    <div className="border-2 border-[#ffd700]/20 w-[90%] h-[90%] flex items-center justify-center">
                      <Eye className="w-16 h-16 text-[#ffd700]/40" />
                    </div>
                  </div>

                  {/* Card Front */}
                  <div className="absolute inset-0 backface-hidden w-full h-full rounded-xl border-4 border-[#ffd700] bg-[#150a26] flex flex-col items-center justify-between p-6 shadow-[0_0_50px_rgba(255,215,0,0.2)] rotate-y-180 bg-linear-to-b from-[#150a26] to-[#2d1b4e]">
                    <div className="text-center">
                      <span className="text-2xl opacity-50 block mb-2">✦</span>
                      <h3 className="text-2xl font-bold text-[#ffd700] leading-tight mb-4">
                        {slot.card.name}
                      </h3>
                      <div className="w-full h-px bg-linear-to-r from-transparent via-[#ffd700]/50 to-transparent my-4" />
                    </div>

                    <p className="text-center text-sm md:text-base leading-relaxed italic text-purple-100/90 font-serif">
                      &quot;{slot.card.meaning}&quot;
                    </p>

                    <span className="text-2xl opacity-50 block mt-2">✦</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {spread.length > 0 &&
          !isShuffling &&
          spread.every((c) => c.revealed) && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={startReading}
              className="mt-16 flex items-center gap-2 text-[#ffd700]/70 hover:text-[#ffd700] uppercase tracking-widest text-sm font-bold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Draw Again
            </motion.button>
          )}
      </div>

      {/* Global Style for 3D Transform Class utilities since Tailwind sometimes strips transform-style-3d */}
      <style jsx global>{`
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
