"use client";

import { useEffect, useRef } from "react";

import { EMOJIS } from "../data/emojis";
import { startRain, type RainSettings } from "../lib/rain-renderer";
import type { Category } from "../types";

/**
 * Drives the rain animation for the returned canvas ref. Settings live in a ref
 * so slider and category changes never restart the animation loop.
 */
export function useCanvasRain(
  intensity: number,
  speed: number,
  selected: Category[],
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef<RainSettings>({
    intensity,
    speed,
    pools: selected.map((category) => EMOJIS[category]),
  });

  useEffect(() => {
    settingsRef.current = {
      intensity,
      speed,
      pools: selected.map((category) => EMOJIS[category]),
    };
  }, [intensity, speed, selected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    return startRain(canvas, () => settingsRef.current);
  }, []);

  return canvasRef;
}
