import { CYCLE_BEATS } from "./constants";
import type { PulseKey } from "./types";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Seconds one full cycle lasts at the given tempo. */
export const cycleSeconds = (bpm: number) => (60 / bpm) * CYCLE_BEATS;

export const pulseKey = (rhythm: number, pulse: number): PulseKey =>
  `${rhythm}-${pulse}`;

export const range = (length: number) =>
  Array.from({ length }, (_, index) => index);

/** Expands a `#rrggbb` swatch into an `rgba()` string at the given alpha. */
export const hexToRgba = (hex: string, alpha: number) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
};
