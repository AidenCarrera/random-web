import { DURATIONS } from "./constants";
import type { Duration } from "./types";

export function isDuration(value: unknown): value is Duration {
  return DURATIONS.includes(value as Duration);
}

/** Maps values onto the given output range so charts read well at any scale. */
export function scaleValues(
  values: number[] | undefined | null,
  minOutput: number,
  maxOutput: number,
): number[] {
  if (!values || values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values, 1);
  const range = max - min;

  return values.map((value) =>
    range
      ? ((value - min) / range) * (maxOutput - minOutput) + minOutput
      : maxOutput,
  );
}

/**
 * Second of the run a click belongs to, clamped to the window. Clicks can land
 * a few milliseconds past the nominal end because the run clock starts on the
 * first click, and clamping keeps them counted rather than dropped.
 */
export function secondIndex(time: number, startTime: number, duration: number) {
  return Math.min(
    duration - 1,
    Math.max(0, Math.floor((time - startTime) / 1000)),
  );
}

/** Clicks per second of the run, used for both the live and final charts. */
export function bucketClicksBySecond(
  times: number[],
  startTime: number,
  duration: number,
): number[] {
  const pace = Array<number>(duration).fill(0);
  for (const time of times) pace[secondIndex(time, startTime, duration)] += 1;
  return pace;
}

export function formatClockTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function createRunId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
}
