"use client";

import { useRef, useState } from "react";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const ScrambleText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const onMouseOver = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return LETTERS[Math.floor(Math.random() * 26)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }

      iteration += 1 / 3;
    }, 30);
  };

  return (
    <h2
      onMouseOver={onMouseOver}
      className={`cursor-default font-mono ${className}`}
    >
      {display}
    </h2>
  );
};

export default function TextScramble() {
  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col gap-0 text-center">
        <p className="text-gray-500 font-mono text-sm mb-8">HOVER TO DECRYPT</p>
        <ScrambleText
          text="ACCESS_GRANTED"
          className="text-5xl md:text-8xl font-bold tracking-tighter text-white"
        />
        <ScrambleText
          text="SYSTEM_SECURE"
          className="text-5xl md:text-8xl font-bold tracking-tighter text-gray-400"
        />
        <ScrambleText
          text="DATA_ENCRYPTED"
          className="text-5xl md:text-8xl font-bold tracking-tighter text-gray-600"
        />
      </div>

      <div className="absolute bottom-10 flex gap-12">
        <ScrambleText text="PROJECT: ALPHA" className="text-xl text-red-500" />
        <ScrambleText
          text="STATUS: UNKNOWN"
          className="text-xl text-blue-500"
        />
      </div>
    </div>
  );
}
