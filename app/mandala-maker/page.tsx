"use client";

import { useRef, useEffect, useState } from "react";
import { Download, Trash2, Palette } from "lucide-react";

export default function MandalaMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#00ffea");
  const [segments, setSegments] = useState(12);
  const [lineWidth, setLineWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rainbowMode, setRainbowMode] = useState(false);

  // For rainbow cycle
  const hueRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Set initial background
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const handleResize = () => {
      // Resizing clears canvas
      const temp = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (temp) ctx.putImageData(temp, 0, 0);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Drawing Implementation with Ref for coordinates
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const startDrawing = (e: React.PointerEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const drawMove = (e: React.PointerEvent) => {
    if (!isDrawing || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw all segments
    const angleStep = (Math.PI * 2) / segments;

    ctx.save();
    ctx.translate(centerX, centerY);

    for (let i = 0; i < segments; i++) {
      ctx.rotate(angleStep);

      // Draw the segment line relative to center
      ctx.beginPath();
      // Move to PREV pos relative to center
      ctx.moveTo(lastPos.current.x - centerX, lastPos.current.y - centerY);
      // Line to CURRENT pos relative to center
      ctx.lineTo(currentX - centerX, currentY - centerY);

      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.strokeStyle = rainbowMode
        ? `hsl(${hueRef.current}, 100%, 50%)`
        : color;
      ctx.stroke();
    }

    ctx.restore();

    if (rainbowMode) hueRef.current = (hueRef.current + 1) % 360;

    lastPos.current = { x: currentX, y: currentY };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const download = () => {
    const link = document.createElement("a");
    link.download = "mandala.png";
    link.href = canvasRef.current?.toDataURL() || "";
    link.click();
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden font-sans relative touch-none">
      <canvas
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={drawMove}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        className="absolute inset-0 cursor-crosshair"
      />

      {/* Controls */}
      <div className="absolute top-0 left-0 w-full p-4 flex flex-wrap justify-center items-start gap-4 pointer-events-none">
        <div className="bg-gray-900/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl flex flex-wrap items-center gap-6 pointer-events-auto">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50 font-bold uppercase">
              Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setRainbowMode(false);
                }}
                className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-none appearance-none"
              />
              <button
                onClick={() => setRainbowMode(!rainbowMode)}
                className={`p-2 rounded-lg transition-colors ${
                  rainbowMode
                    ? "bg-linear-to-r from-red-500 via-green-500 to-blue-500 text-white"
                    : "bg-white/10 text-white/50"
                }`}
                title="Rainbow Mode"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-32">
            <label className="text-xs text-white/50 font-bold uppercase">
              Segments: {segments}
            </label>
            <input
              type="range"
              min="2"
              max="32"
              step="1"
              value={segments}
              onChange={(e) => setSegments(parseInt(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-white/10 rounded-full appearance-none"
            />
          </div>

          <div className="flex flex-col gap-2 w-32">
            <label className="text-xs text-white/50 font-bold uppercase">
              Size: {lineWidth}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-white/10 rounded-full appearance-none"
            />
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="flex gap-2">
            <button
              onClick={clearCanvas}
              className="p-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
              title="Clear"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={download}
              className="p-3 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-xl transition-all"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 w-full text-center pointer-events-none">
        <h1 className="text-white/20 text-4xl font-black uppercase tracking-[1em]">
          Mandala
        </h1>
      </div>
    </div>
  );
}
