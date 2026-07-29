import { EMPTY_RECORD, HISTORY_LIMIT, STORAGE_KEY } from "../constants";
import type {
  Duration,
  RecordEntry,
  Records,
  RunResult,
  SavedProgress,
} from "../types";
import { createRunId, isDuration } from "../utils";

/** Only the fields that survived validation are applied on load. */
export type LoadedProgress = {
  duration?: Duration;
  records?: Records;
  history?: RunResult[];
};

const toCount = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

function parseRecord(value: unknown): RecordEntry {
  if (!value || typeof value !== "object") return EMPTY_RECORD;
  const { clicks, cps } = value as Partial<RecordEntry>;
  return { clicks: toCount(clicks), cps: toCount(cps) };
}

function parseRun(value: unknown): RunResult | null {
  if (!value || typeof value !== "object") return null;
  const run = value as Partial<RunResult>;
  if (!isDuration(run.duration) || !Array.isArray(run.pace)) return null;

  return {
    id: typeof run.id === "string" ? run.id : createRunId(),
    clicks: toCount(run.clicks),
    cps: toCount(run.cps),
    duration: run.duration,
    pace: run.pace.map(toCount),
    timestamp: typeof run.timestamp === "string" ? run.timestamp : "",
  };
}

/**
 * Reads saved progress, dropping anything that no longer matches the schema.
 * The store is editable by hand, so a bad entry must not reach the render.
 */
export function loadProgress(): LoadedProgress {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage is blocked, so there is nothing to restore.
  }
  if (!raw) return {};

  try {
    const saved = JSON.parse(raw) as Partial<SavedProgress>;
    const records = saved.records;

    return {
      duration: isDuration(saved.duration) ? saved.duration : undefined,
      records: records
        ? {
            5: parseRecord(records[5]),
            10: parseRecord(records[10]),
            30: parseRecord(records[30]),
          }
        : undefined,
      history: Array.isArray(saved.history)
        ? saved.history
            .slice(0, HISTORY_LIMIT)
            .map(parseRun)
            .filter((run): run is RunResult => run !== null)
        : undefined,
    };
  } catch {
    // Unreadable data: the next save replaces it with a clean record.
    return {};
  }
}

export function saveProgress(progress: SavedProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Progress is a convenience: a full or blocked store must not break a run.
  }
}
