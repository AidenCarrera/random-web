"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor } from "lucide-react";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const dropsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*";
    const fontSize = 16;
    let animationId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Initialize drops if empty or resized largely
      const columns = Math.ceil(canvas.width / fontSize);
      if (dropsRef.current.length !== columns) {
        const newDrops = [];
        for (let i = 0; i < columns; i++) {
          newDrops[i] = Math.random() * -100;
        }
        dropsRef.current = newDrops;
      }
    };

    if (dropsRef.current.length === 0) {
      resizeCanvas();
    }

    window.addEventListener("resize", resizeCanvas);

    // Animation Loop with throttling
    let lastTime = 0;
    const fps = 60;
    const interval = 1000 / fps;

    const draw = (timestamp: number) => {
      if (!isPlaying) return;

      animationId = requestAnimationFrame(draw);

      const deltaTime = timestamp - lastTime;
      if (deltaTime < interval) return;

      lastTime = timestamp - (deltaTime % interval);

      // Translucent black background to create trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0F0";
      ctx.font = `${fontSize}px monospace`;

      const drops = dropsRef.current;
      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        // Randomly send drop back to top after it crosses screen
        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    if (isPlaying) {
      animationId = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-mono">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="absolute top-8 left-8 z-10 select-none">
        <h1 className="text-4xl font-bold text-[#0F0] tracking-widest drop-shadow-[0_0_10px_#0F0] animate-pulse">
          MATRIX_SYSTEM
        </h1>
        <div className="flex items-center gap-2 text-[#0F0]/70 mt-2 text-xs">
          <Monitor className="w-4 h-4" />
          <span>CONNECTED: 127.0.0.1</span>
        </div>
      </div>

      <div className="absolute bottom-10 w-full text-center z-10 pointer-events-none">
        <p className="text-[#0F0]/50 text-sm tracking-[0.5em] animate-pulse">
          CODE RAIN
        </p>
      </div>

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute bottom-8 right-8 z-20 px-6 py-2 border border-[#0F0] text-[#0F0] hover:bg-[#0F0] hover:text-black transition-colors rounded uppercase text-sm font-bold tracking-wider"
      >
        {isPlaying ? "Freeze" : "Resume"}
      </button>
    </div>
  );
}
