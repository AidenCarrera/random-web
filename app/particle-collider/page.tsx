"use client";

import { useRef, useEffect, useState } from "react";
import { MousePointer2, Circle } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export default function ParticleCollider() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"attract" | "repel">("attract");
  const particleCount = 200;
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>(null);

  const [forcePower, setForcePower] = useState(500);
  const forcePowerRef = useRef(500);

  // Sync ref with state for animation loop
  useEffect(() => {
    forcePowerRef.current = forcePower;
  }, [forcePower]);

  // Initialize Particles
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const colors = ["#00ffff", "#ff00ff", "#ffff00", "#ffffff"];

    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    particlesRef.current = newParticles;
  }, [particleCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Physics Loop
      particlesRef.current.forEach((p) => {
        // Mouse Interaction
        if (isMouseDown) {
          const dx = mousePos.x - p.x;
          const dy = mousePos.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Force calculation
          if (dist < 400 && dist > 5) {
            // Avoid division by zero and infinite acceleration
            const force = forcePowerRef.current / (dist * dist);
            const angle = Math.atan2(dy, dx);

            if (mode === "attract") {
              p.vx += Math.cos(angle) * force;
              p.vy += Math.sin(angle) * force;
            } else {
              p.vx -= Math.cos(angle) * force;
              p.vy -= Math.sin(angle) * force;
            }
          }
        }

        // Drag / Friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Update Position
        p.x += p.vx;
        p.y += p.vy;

        // Wall Bounce
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Clamp position
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMouseDown, mousePos, mode]);

  const handlePointer = (e: React.PointerEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    setIsMouseDown(
      e.type === "pointerdown" || (e.type === "pointermove" && e.buttons === 1)
    );
    if (e.type === "pointerup") setIsMouseDown(false);
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a14] overflow-hidden cursor-crosshair touch-none">
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.1s ease;
          margin-top: -6px;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(255, 255, 255, 1);
        }
        input[type="range"]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        input[type="range"]::-moz-range-thumb {
          border: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.1s ease;
        }
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(255, 255, 255, 1);
        }
      `}</style>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        onPointerUp={handlePointer}
      />

      {/* UI Overlay */}
      <div className="absolute top-6 left-6 text-white pointer-events-none select-none">
        <h1 className="text-3xl font-bold tracking-tighter mix-blend-difference">
          PARTICLE COLLIDER
        </h1>
        <p className="text-xs opacity-50 font-mono">
          Quantum Simulation Environment
        </p>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-xl z-10">
        <button
          onClick={() => setMode("attract")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${
            mode === "attract"
              ? "bg-white text-black shadow-[0_0_20px_white]"
              : "text-white hover:bg-white/10"
          }`}
        >
          <Circle className="w-4 h-4 fill-current" />
          ATTRACT
        </button>
        <button
          onClick={() => setMode("repel")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${
            mode === "repel"
              ? "bg-[#ff00ff] text-white shadow-[0_0_20px_#ff00ff]"
              : "text-white hover:bg-white/10"
          }`}
        >
          <MousePointer2 className="w-4 h-4" />
          REPEL
        </button>
      </div>

      {/* Force Control */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-xl z-10 w-80">
        <span className="text-white text-xs font-bold whitespace-nowrap">
          FORCE STRENGTH
        </span>
        <input
          type="range"
          min="100"
          max="10000"
          step="50"
          value={forcePower}
          onChange={(e) => setForcePower(Number(e.target.value))}
          className="w-full appearance-none bg-transparent cursor-pointer focus:outline-none"
        />
        <span className="text-white text-xs font-mono w-8 text-right">
          {forcePower}
        </span>
      </div>

      <div className="absolute top-6 right-6 text-right pointer-events-none opacity-50">
        <p className="text-xs font-mono">Count: {particleCount}</p>
        <p className="text-xs font-mono text-[#0ff]">Hold click to interact</p>
      </div>
    </div>
  );
}
