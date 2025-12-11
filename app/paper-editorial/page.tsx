"use client";

import { useState } from "react";
import { Quote } from "lucide-react";

const QUOTES = [
  "The only true wisdom is in knowing you know nothing.",
  "What you seek is seeking you.",
  "Be the change that you wish to see in the world.",
  "In the middle of difficulty lies opportunity.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Everything you can imagine is real.",
  "Simplicity is the ultimate sophistication.",
];

export default function PaperEditorial() {
  const [fortune, setFortune] = useState<string | null>(null);

  const revealFortune = () => {
    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setFortune(random);
  };

  return (
    <div
      className="min-h-screen bg-[#f4f1ea] text-[#2c2925] p-8 md:p-16 flex justify-center items-center"
      style={{
        backgroundImage:
          'url("https://www.transparenttextures.com/patterns/cardboard-flat.png")',
      }}
    >
      <div className="max-w-2xl w-full bg-[#fdfbf7] p-12 shadow-[rgba(0,0,0,0.1)_10px_10px_20px] border border-[#e3dacd] relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#2c2925]" />

        <header className="border-b-2 border-[#2c2925] pb-6 mb-8 text-center">
          <h1 className="font-serif text-5xl italic font-bold">
            The Daily Oracle
          </h1>
          <p className="mt-2 text-sm uppercase tracking-widest font-sans text-gray-500">
            Vol. CCLXXIV — {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="flex justify-center mb-10">
          <button
            onClick={revealFortune}
            className="group relative px-8 py-4 font-serif text-xl border border-[#2c2925] hover:bg-[#2c2925] hover:text-[#f4f1ea] transition-all duration-300"
          >
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#2c2925] group-hover:bg-[#f4f1ea]" />
            <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#2c2925] group-hover:bg-[#f4f1ea]" />
            Consult the Oracle
          </button>
        </div>

        {fortune && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
            <Quote className="w-8 h-8 text-[#2c2925] mx-auto mb-4 opacity-50 rotate-180" />
            <p className="font-serif text-3xl leading-relaxed font-medium">
              &quot;{fortune}&quot;
            </p>
            <Quote className="w-8 h-8 text-[#2c2925] mx-auto mt-4 opacity-50" />
          </div>
        )}

        <div className="mt-16 pt-4 border-t border-[#e3dacd] flex justify-between text-xs font-sans text-gray-400 uppercase tracking-wider">
          <span>Pg. 7</span>
          <span>Est. 1924</span>
        </div>
      </div>
    </div>
  );
}
