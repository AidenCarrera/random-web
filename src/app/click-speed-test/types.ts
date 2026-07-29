import type { DURATIONS } from "./constants";

export type Duration = (typeof DURATIONS)[number];

export type RecordEntry = {
  clicks: number;
  cps: number;
};

export type Records = Record<Duration, RecordEntry>;

export type RunResult = {
  id: string;
  clicks: number;
  cps: number;
  duration: Duration;
  /** Clicks landed in each second of the run. */
  pace: number[];
  timestamp: string;
};

export type SavedProgress = {
  duration: Duration;
  records: Records;
  history: RunResult[];
};

export type Milestone = {
  label: string;
  target: number;
  color: string;
};

/** What the arena shows: the live run, the run that just ended, or the last one. */
export type Readout = {
  title: string;
  clicks: number;
  cps: number;
  pace: number[];
};
