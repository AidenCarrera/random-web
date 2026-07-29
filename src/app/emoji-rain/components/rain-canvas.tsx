"use client";

import { useCanvasRain } from "../hooks/use-canvas-rain";
import type { Category } from "../types";

export function RainCanvas({
  intensity,
  speed,
  selected,
}: {
  intensity: number;
  speed: number;
  selected: Category[];
}) {
  const canvasRef = useCanvasRain(intensity, speed, selected);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10"
    />
  );
}
