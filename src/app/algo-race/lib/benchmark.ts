import {
  BATCH_SAMPLES,
  BATCH_TARGET_MS,
  MAX_BATCH_ITERATIONS,
  MEASURE_BUDGET_MS,
  MIN_BATCH_SAMPLES,
  WARMUP_BUDGET_MS,
  WARMUP_RUNS,
} from "../config";
import type { SortRunner } from "../types";

// Prevents JIT dead-code elimination during timing benchmarks.
let timingSink = 0;

const runBatch = (run: SortRunner, data: number[], iterations: number) => {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) timingSink += run(data)[0];
  return performance.now() - start;
};

const calibrateBatch = (run: SortRunner, data: number[]) => {
  let iterations = 1;
  for (;;) {
    const elapsed = runBatch(run, data, iterations);
    if (elapsed >= BATCH_TARGET_MS || iterations >= MAX_BATCH_ITERATIONS) {
      return iterations;
    }
    // Exponential fallback ensures batch growth when initial time measures as zero.
    const growth = elapsed > 0 ? (BATCH_TARGET_MS / elapsed) * 1.2 : 8;
    iterations = Math.min(
      MAX_BATCH_ITERATIONS,
      Math.ceil(iterations * Math.max(2, growth)),
    );
  }
};

export const measureExecutionMs = (run: SortRunner, data: number[]) => {
  const measureStart = performance.now();

  for (let i = 0; i < WARMUP_RUNS; i++) {
    timingSink += run(data)[0];
    if (performance.now() - measureStart >= WARMUP_BUDGET_MS) break;
  }

  const iterations = calibrateBatch(run, data);

  let fastest = Number.POSITIVE_INFINITY;
  for (let sample = 0; sample < BATCH_SAMPLES; sample++) {
    fastest = Math.min(fastest, runBatch(run, data, iterations) / iterations);
    if (
      sample + 1 >= MIN_BATCH_SAMPLES &&
      performance.now() - measureStart >= MEASURE_BUDGET_MS
    ) {
      break;
    }
  }

  // The only read of timingSink: keeps the timed calls observable to the
  // optimizer, and stops the accumulator drifting. Do not remove.
  if (!Number.isFinite(timingSink)) timingSink = 0;

  // Prevents zero return values when clock resolution cannot capture batch time.
  return Math.max(fastest, Number.EPSILON);
};
