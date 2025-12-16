"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles } from "lucide-react";

export default function ConfettiCannon() {
  const [isPartying, setIsPartying] = useState(false);
  const [partyKey, setPartyKey] = useState(0);

  const fireConfetti = () => {
    setIsPartying(true);
    setPartyKey((prev) => prev + 1);
    // Reset party state after confetti ends (5s + buffer)
    setTimeout(() => setIsPartying(false), 5500);

    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const bigBang = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-t from-yellow-300 to-orange-400 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/confetti.png')] opacity-20 pointer-events-none" />

      <h1
        key={partyKey}
        className={`text-4xl md:text-6xl font-black text-center text-white drop-shadow-md mb-12 -rotate-2 origin-center transition-all duration-300 ${
          isPartying ? "animate-dance scale-110" : ""
        }`}
      >
        PARTY MODE
      </h1>

      <button
        onClick={() => {
          bigBang();
          fireConfetti();
        }}
        className="group relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium rounded-lg group bg-linear-to-br from-pink-500 to-orange-400 hover:text-white focus:ring-4 focus:outline-none focus:ring-pink-200"
      >
        <span className="relative flex items-center gap-4 px-12 py-6 transition-all ease-in duration-75 bg-white rounded-md text-2xl font-bold uppercase text-orange-500">
          <Sparkles className="w-8 h-8 animate-spin-slow" />
          CELEBRATE
        </span>
      </button>

      <p className="mt-8 text-white font-bold opacity-80 animate-bounce">
        Click for a party!
      </p>
    </div>
  );
}
