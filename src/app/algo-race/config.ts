export type SizeOption = {
  label: string;
  size: number;
  default?: boolean;
};

export const SIZE_OPTIONS: SizeOption[] = [
  { label: "S", size: 10 },
  { label: "M", size: 60, default: true },
  { label: "L", size: 250 },
  { label: "XL", size: 1000 },
];

export const DEFAULT_SIZE = (
  SIZE_OPTIONS.find((option) => option.default) ?? SIZE_OPTIONS[0]
).size;

/** VALUE_MAX must remain under 256 to fit inside Uint8Array frame buffers without wrapping. */
export const VALUE_MIN = 5;
export const VALUE_MAX = 104;

// Replay scaling: slowest sort takes RACE_DURATION_MS; MIN_PLAYBACK_MS prevents instantaneous animation.
export const RACE_DURATION_MS = 20000;
export const MIN_PLAYBACK_MS = 300;

// Frame budget limits memory allocation during snapshot sampling at large N.
export const TARGET_FRAME_MS = 16;
export const MAX_FRAMES = 1600;
export const MAX_FRAME_CELLS = 8_000_000;

// Harness constants to overcome browser timer coarsening (~100µs precision limits).
export const BATCH_TARGET_MS = 12;
export const BATCH_SAMPLES = 5;
export const MIN_BATCH_SAMPLES = 2;
export const MAX_BATCH_ITERATIONS = 200_000;
export const WARMUP_RUNS = 5;

// Time budget caps measurement duration to prevent blocking the main UI thread at large N.
export const MEASURE_BUDGET_MS = 120;
export const WARMUP_BUDGET_MS = 30;
