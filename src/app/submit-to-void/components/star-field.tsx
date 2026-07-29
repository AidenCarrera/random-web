"use client";

import { useStarField } from "../hooks/use-star-field";

export function StarField() {
  const canvasRef = useStarField();

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 h-full w-full pointer-events-none"
    />
  );
}
