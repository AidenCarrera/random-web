"use client";

import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import { useState } from "react";

const PAGES = [
  // Phase 1
  "/olo-shell",
  "/brutalist",
  "/neon-cyber",
  "/pastel-dream",
  "/paper-editorial",
  "/dark-dashboard",
  "/pixel-art",
  "/nature-zen",
  "/glitch-chaos",
  "/minimal-mono",
  // Phase 2
  "/matrix-system",
  "/gravity-box",
  "/beat-maker",
  "/confetti-cannon",
  "/sticky-notes",
  "/hypno-spiral",
  "/submit-to-nothing",
  "/text-scramble",
  "/emoji-rain",
  "/glass-morphism",
];

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const visitRandomWorld = () => {
    setLoading(true);
    const randomPage = PAGES[Math.floor(Math.random() * PAGES.length)];
    // Add artificial delay for effect
    setTimeout(() => {
      router.push(randomPage);
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500 rounded-full blur-[100px]" />
      </div>

      <main className="flex flex-col items-center justify-center z-10 text-center px-4">
        <button
          onClick={visitRandomWorld}
          disabled={loading}
          className="group relative flex items-center gap-4 px-8 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full text-xl font-bold tracking-wide transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100 shadow-xl hover:shadow-2xl"
        >
          {loading ? (
            <span className="animate-pulse">Teleporting...</span>
          ) : (
            <>
              <Shuffle className="w-6 h-6 transition-transform group-hover:rotate-180 duration-500" />
              <span>EXPLORE RANDOM WEBSITE</span>
            </>
          )}
        </button>
      </main>
    </div>
  );
}
