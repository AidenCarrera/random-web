import { MAX_FRAME_CELLS, MAX_FRAMES, TARGET_FRAME_MS } from "../config";
import type { FrameStrip, SortRunner } from "../types";

export const frameBudgetFor = (playbackMs: number, size: number) =>
  Math.max(
    2,
    Math.min(
      MAX_FRAMES,
      Math.ceil(playbackMs / TARGET_FRAME_MS),
      Math.floor(MAX_FRAME_CELLS / size),
    ),
  );

/**
 * Samples sort snapshots using a two-pass stride algorithm to pre-allocate
 * buffer memory and prevent heap exhaustion.
 */
export const captureFrames = (
  run: SortRunner,
  data: number[],
  budget: number,
): FrameStrip => {
  const size = data.length;

  let mutations = 0;
  run(data, () => {
    mutations++;
  });

  const stride = Math.max(1, Math.ceil(mutations / budget));
  const capacity = Math.min(budget, Math.ceil(mutations / stride)) + 2;
  const cells = new Uint8Array(capacity * size);

  let count = 0;
  const push = (values: readonly number[]) => {
    cells.set(values as number[], count * size);
    count++;
  };

  push(data);
  let step = 0;
  const sorted = run(data, (values) => {
    if (step % stride === 0 && count < capacity - 1) push(values);
    step++;
  });
  push(sorted);

  return { cells, count, size };
};

export const frameAt = (strip: FrameStrip, index: number) =>
  strip.cells.subarray(index * strip.size, (index + 1) * strip.size);
