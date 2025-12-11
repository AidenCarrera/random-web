"use client";

import { useEffect, useRef } from "react";

export default function HypnoSpiral() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / width,
        y: e.clientY / height,
      };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    const draw = () => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

      const normalizedY = Math.abs(mouseRef.current.y - 0.5) * 2; // 0 at center, 1 at edges
      const frequency = 0.02 + mouseRef.current.x * 0.08; // X controls wave frequency

      offsetRef.current -= 0.02 + mouseRef.current.x * 0.05; // Speed control

      ctx.lineWidth = 2 + normalizedY * 12.5; // Thickness control (reduced intensity)

      for (let r = 0; r < maxRadius; r += 10) {
        ctx.beginPath();
        const hue = (r * 0.5 + offsetRef.current * 5) % 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;

        const distortion =
          Math.sin(r * frequency - offsetRef.current) * 12.5 * normalizedY;

        ctx.arc(centerX, centerY, Math.max(0, r + distortion), 0, Math.PI * 2);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 cursor-none">
      <canvas ref={canvasRef} className="block" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white font-mono mix-blend-difference pointer-events-none text-center text-sm md:text-base opacity-80">
        MOVE MOUSE TO WARP REALITY
      </div>
    </div>
  );
}
