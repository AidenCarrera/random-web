"use client";

import { PANEL } from "../constants";
import type { Duration, Readout } from "../types";
import { PaceChart } from "./pace-chart";

/** The click target itself, plus the readout for the current or last run. */
export function ClickArena({
  clicks,
  duration,
  isActive,
  canRestart,
  readout,
  onClick,
  onReset,
}: {
  clicks: number;
  duration: Duration;
  isActive: boolean;
  canRestart: boolean;
  readout: Readout;
  onClick: (clickTime: number) => void;
  onReset: () => void;
}) {
  return (
    <div
      className={`${PANEL} relative flex min-h-105 flex-1 flex-col items-center justify-center rounded-2xl p-8`}
    >
      {isActive && (
        <button
          onClick={() => onReset()}
          className="absolute right-4 top-4 rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800"
        >
          Reset Test
        </button>
      )}

      <button
        // The event timestamp is the moment of the input, so the pace chart is
        // not skewed by how long React took to reach this handler.
        onClick={(event) => onClick(event.timeStamp)}
        disabled={!isActive && !canRestart}
        className={`flex size-64 select-none flex-col items-center justify-center gap-2 rounded-full border-8 transition-all active:scale-95 shrink-0 ${
          isActive
            ? "border-blue-400 bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.5)]"
            : canRestart
              ? "border-slate-600 bg-slate-800 hover:border-slate-500"
              : "cursor-not-allowed border-slate-700 bg-slate-800/80"
        }`}
      >
        <span className="text-5xl font-black">
          {isActive ? "CLICK!" : "START"}
        </span>
        <span className="text-sm opacity-70">
          {isActive ? clicks : `${duration} Second Test`}
        </span>
      </button>

      <RunReadout readout={readout} />
    </div>
  );
}

function RunReadout({ readout }: { readout: Readout }) {
  return (
    <div className="mt-8 min-w-0 w-full text-center transition-all duration-300 animate-in fade-in">
      {/* Holds its line even when empty, so the arena does not jump between states. */}
      <p className="mb-2 flex min-h-4 items-center justify-center gap-1.5 text-slate-400 font-semibold tracking-wider text-xs uppercase">
        {readout.title}
      </p>
      <div className="mb-2 text-3xl font-bold text-white">
        {readout.clicks} Clicks{" "}
        <span className="text-xl text-slate-500">
          ({readout.cps.toFixed(2)} CPS)
        </span>
      </div>
      <PaceChart pace={readout.pace} />
    </div>
  );
}
