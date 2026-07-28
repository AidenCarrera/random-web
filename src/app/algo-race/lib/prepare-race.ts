import { MIN_PLAYBACK_MS, RACE_DURATION_MS } from "../config";
import type { FrameStrip, PreparedRace, RaceInput, SortName } from "../types";
import { ALGORITHMS, SORT_NAMES, createSortRecord } from "./algorithms";
import { measureExecutionMs } from "./benchmark";
import { captureFrames, frameBudgetFor } from "./frames";

/** Preparation walks every algorithm twice: once to time it, once to record it. */
export const PREPARE_STEPS = SORT_NAMES.length * 2;

type PrepareOptions = {
  onProgress?: (completedSteps: number) => void;
  isCancelled?: () => boolean;
  /** Holds preparation off while something latency-sensitive owns the main thread. */
  isBlocked?: () => boolean;
};

// rAF keeps the yield aligned with paints, but stalls in hidden tabs; the timeout
// keeps background preparation progressing. Whichever fires first resolves.
const yieldToBrowser = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
    setTimeout(resolve, 32);
  });

/**
 * Benchmarks and records every algorithm against a single dataset, yielding
 * between algorithms so the main thread stays responsive. Resolves to `null`
 * when cancelled, which happens as soon as the input it was building for is
 * superseded.
 */
export async function prepareRace(
  input: RaceInput,
  { onProgress, isCancelled, isBlocked }: PrepareOptions = {},
): Promise<PreparedRace | null> {
  const { data } = input;
  const executionMs = createSortRecord(() => 0);
  let completed = 0;

  // Idles until the thread is free again, so a benchmark chunk never lands
  // mid-replay and drops frames.
  const yieldUntilReady = async () => {
    do {
      await yieldToBrowser();
    } while (!isCancelled?.() && isBlocked?.());
  };

  // Sorts copy their input, so the same array feeds both passes unchanged.
  await yieldUntilReady();

  // Timings must run before frame capture to calculate proportional playback frame budgets.
  for (const algorithm of ALGORITHMS) {
    if (isCancelled?.()) return null;
    executionMs[algorithm.name] = measureExecutionMs(algorithm.run, data);
    onProgress?.(++completed);
    await yieldUntilReady();
  }

  const slowestMs = Math.max(...SORT_NAMES.map((name) => executionMs[name]));
  const playbackMs = createSortRecord((name) =>
    Math.max(
      MIN_PLAYBACK_MS,
      (RACE_DURATION_MS * executionMs[name]) / slowestMs,
    ),
  );

  const frames = createSortRecord(() => null as FrameStrip | null);
  for (const algorithm of ALGORITHMS) {
    if (isCancelled?.()) return null;
    frames[algorithm.name] = captureFrames(
      algorithm.run,
      data,
      frameBudgetFor(playbackMs[algorithm.name], data.length),
    );
    onProgress?.(++completed);
    await yieldUntilReady();
  }

  if (isCancelled?.()) return null;

  return {
    ...input,
    executionMs,
    playbackMs,
    frames: frames as Record<SortName, FrameStrip>,
    playbackOrder: [...SORT_NAMES].sort(
      (a, b) => playbackMs[a] - playbackMs[b],
    ),
  };
}
