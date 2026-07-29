"use client";

import { useEffect, useRef } from "react";

import { startStarField } from "../lib/star-field";

/** Drives the background star field for the returned canvas ref. */
export function useStarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    return startStarField(canvas);
  }, []);

  return canvasRef;
}
