import type { Duration, Milestone, RecordEntry, Records } from "./types";

export const DURATIONS = [5, 10, 30] as const;

export const DEFAULT_DURATION: Duration = 10;

export const STORAGE_KEY = "click-speed-test-progress";

/** How long a finished run stays on screen before a new one can start. */
export const RESULT_BUFFER_MS = 2500;

export const HISTORY_LIMIT = 5;

/** Shared card shell so every panel matches. */
export const PANEL = "rounded-xl border border-slate-700 bg-[#1e293b]";

export const EMPTY_RECORD: RecordEntry = { clicks: 0, cps: 0 };

export const EMPTY_RECORDS: Records = {
  5: EMPTY_RECORD,
  10: EMPTY_RECORD,
  30: EMPTY_RECORD,
};

const MILESTONE_TIERS = [
  {
    label: "Bronze Clicker",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  {
    label: "Silver Clicker",
    color: "text-slate-400 bg-slate-400/10 border-slate-400/30",
  },
  {
    label: "Gold Clicker",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  },
  {
    label: "Platinum Clicker",
    color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  },
  {
    label: "Diamond Clicker",
    color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
  },
  {
    label: "Click Legend",
    color: "text-rose-400 bg-rose-400/10 border-rose-400/30",
  },
] as const;

/** Pairs each tier with its click target, so the ladder stays in tier order. */
const withTargets = (targets: number[]): Milestone[] =>
  MILESTONE_TIERS.map((tier, index) => ({ ...tier, target: targets[index] }));

export const MILESTONES: Record<Duration, Milestone[]> = {
  5: withTargets([15, 25, 35, 45, 55, 65]),
  10: withTargets([30, 50, 70, 90, 110, 130]),
  30: withTargets([75, 120, 180, 240, 300, 360]),
};
