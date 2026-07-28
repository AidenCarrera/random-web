export type SortName =
  | "Bubble Sort"
  | "Selection Sort"
  | "Insertion Sort"
  | "Quick Sort"
  | "Merge Sort"
  | "Heap Sort";

// Recorder receives live array reference to eliminate allocation overhead during counting passes.
export type StepRecorder = (values: readonly number[]) => void;
export type SortRunner = (input: number[], record?: StepRecorder) => number[];

export type Algorithm = {
  name: SortName;
  run: SortRunner;
  color: string;
  complexity: string;
};

export type RaceStat = {
  name: SortName;
  executionMs: number;
  playbackMs: number;
};

/** Sampled snapshots packed contiguously into a single typed array. */
export type FrameStrip = { cells: Uint8Array; count: number; size: number };
