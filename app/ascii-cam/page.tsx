"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor } from "lucide-react";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Configuration
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*";
    const fontSize = 16;
    let columns = Math.ceil(canvas.width / fontSize);
    let drops: number[] = [];

    // Initialize drops
    const reset = () => {
      columns = Math.ceil(canvas.width / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100; // Start above screen
      }
    };
    reset();

    let animationId: number;

    const draw = () => {
      // Translucent black background to create trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0F0"; // Green text
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Draw the character
        ctx.fillText(text, x, y);

        // Randomly send drop back to top after it crosses screen
        // Adding Math.random() > 0.975 makes the drops fall not all at once
        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Increment Y coordinate
        drops[i]++;
      }

      if (isPlaying) {
        animationId = requestAnimationFrame(draw);
      }
    };

    if (isPlaying) {
      draw();
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-mono">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Overlay UI */}
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
          THE CODE IS RAINING
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
