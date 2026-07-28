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

/** One unsorted dataset. `id` changes whenever a new array is generated. */
export type RaceInput = { id: number; size: number; data: number[] };

/**
 * A fully benchmarked and recorded race, ready to replay with no further work.
 * Timings and frames are always derived from the same `data`.
 */
export type PreparedRace = RaceInput & {
  executionMs: Record<SortName, number>;
  playbackMs: Record<SortName, number>;
  frames: Record<SortName, FrameStrip>;
  /** Fastest playback first, so finishes register accurately during dropped frames. */
  playbackOrder: SortName[];
};
