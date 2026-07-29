import type { Rhythm } from "./types";
import { hexToRgba } from "./utils";

/** Opacity every swatch glow is derived at, so colors stay in one place. */
const GLOW_ALPHA = 0.34;

/** Pulses per cycle, swatch color and click pitch for each selectable rhythm. */
const RHYTHM_TABLE: [count: number, color: string, tone: string][] = [
  [1, "#faf9f6", "B4"],
  [2, "#fc8c74", "C5"],
  [3, "#f59851", "D5"],
  [4, "#e6cb53", "E5"],
  [5, "#90cb67", "F5"],
  [6, "#55c991", "G5"],
  [7, "#40c4bb", "A5"],
  [8, "#4bbdd9", "B5"],
  [9, "#5c9fe6", "C6"],
  [10, "#7e7aeb", "D6"],
  [11, "#c270de", "E6"],
  [12, "#e66e9c", "F6"],
];

export const RHYTHMS: Rhythm[] = RHYTHM_TABLE.map(([count, color, tone]) => ({
  count,
  color,
  glow: hexToRgba(color, GLOW_ALPHA),
  tone,
}));

export const RHYTHM_BY_COUNT = new Map(
  RHYTHMS.map((rhythm) => [rhythm.count, rhythm]),
);
