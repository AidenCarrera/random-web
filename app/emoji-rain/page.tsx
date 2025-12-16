"use client";

import { useEffect, useRef, useState } from "react";

const EMOJIS = {
  rain: ["💧", "🌧️", "☔", "⛈️", "🌊"],
  money: ["💸", "💰", "🤑", "💵", "💎"],
  love: ["❤️", "💖", "🥰", "💌", "💘"],
  food: ["🍔", "🍕", "🍟", "🥤", "🌮"],
  space: ["🚀", "🛸", "🌌", "⭐", "🌙"],
  music: ["🎵", "🎸", "🎹", "🎧", "🎷"],
  tech: ["💻", "🤖", "💾", "📱", "🔋"],
  spooky: ["👻", "🎃", "🦇", "🕸️", "💀"],
  ocean: ["🐠", "🐳", "🐙", "🦀", "🦈"],
  animals: ["🐶", "🐱", "🦊", "🐼", "🦁"],
  nature: ["🌸", "🌲", "🌵", "🍀", "🌻"],
  party: ["🎉", "🎈", "🥳", "🥂", "🎂"],
  sports: ["⚽", "🏀", "🏈", "⚾", "🎾"],
  fruit: ["🍎", "🍌", "🍇", "🍓", "🍒"],
  vehicles: ["🚗", "✈️", "🚂", "🚤", "🚜"],
  time: ["⌚", "⏰", "⏳", "🌙", "☀️"],
  tools: ["🔨", "🔧", "🪛", "⛏️", "⚙️"],
  magic: ["✨", "🧙‍♂️", "🔮", "🦄", "🌟"],
  faces: ["😀", "😂", "😎", "🤔", "😴"],
  fire: ["🔥", "💥", "🧨", "🌋", "🚒"],
};

export default function EmojiRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<keyof typeof EMOJIS>("money");
  const dropsRef = useRef<
    { x: number; y: number; speed: number; text: string }[]
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const createDrop = () => {
      const list = EMOJIS[mode];
      return {
        x: Math.random() * canvas.width,
        y: -50,
        speed: Math.random() * 5 + 2,
        text: list[Math.floor(Math.random() * list.length)],
      };
    };

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.2) {
        dropsRef.current.push(createDrop());
      }

      for (let i = dropsRef.current.length - 1; i >= 0; i--) {
        const drop = dropsRef.current[i];
        drop.y += drop.speed;

        ctx.font = "30px sans-serif";
        ctx.fillText(drop.text, drop.x, drop.y);

        if (drop.y > canvas.height + 50) {
          dropsRef.current.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [mode]);

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-200 to-white overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl flex flex-wrap justify-center gap-3 max-w-4xl w-[90%] max-h-[30vh] overflow-y-auto">
        {Object.keys(EMOJIS).map((key) => (
          <button
            key={key}
            onClick={() => setMode(key as keyof typeof EMOJIS)}
            className={`px-4 py-2 rounded-full capitalize font-bold text-sm transition-all whitespace-nowrap ${
              mode === key
                ? "bg-sky-500 text-white shadow-lg scale-105"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="absolute top-10 left-0 w-full text-center">
        <h1 className="text-4xl font-bold text-sky-900/50 uppercase tracking-widest leading-loose">
          Cloudy with a chance of <br />
          <span className="text-sky-600 opacity-100">{mode}</span>
        </h1>
      </div>
    </div>
  );
}
