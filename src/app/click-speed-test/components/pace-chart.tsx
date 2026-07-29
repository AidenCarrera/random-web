"use client";

import { useMemo } from "react";
import { Zap } from "lucide-react";

import { scaleValues } from "../utils";

/** Bar per second of the run; long runs drop the per-bar labels to stay legible. */
export function PaceChart({ pace }: { pace: number[] }) {
  const heights = useMemo(() => scaleValues(pace, 15, 100), [pace]);

  if (!pace.length) return null;

  const isDense = pace.length > 10;

  return (
    <div className="mx-auto mt-4 w-full max-w-md overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-left">
      <div className="mb-2 flex items-center gap-1 text-xs font-medium text-slate-400">
        <Zap className="size-3.5 text-blue-400" /> Click Speed Flow (clicks per
        second)
      </div>
      <div
        className={`grid h-20 min-w-0 items-end overflow-hidden px-1 pt-2 ${
          isDense ? "gap-px sm:gap-0.5" : "gap-1.5"
        }`}
        style={{
          gridTemplateColumns: `repeat(${pace.length}, minmax(0, 1fr))`,
        }}
      >
        {pace.map((value, index) => {
          const second = index + 1;
          const showTick = !isDense || second === 1 || second % 5 === 0;

          return (
            <div
              key={index}
              className="flex h-full min-w-0 flex-col items-center justify-end"
              title={`Second ${second}: ${value} clicks`}
            >
              <span
                className={`mb-1 h-2.5 w-full truncate text-center text-[8px] font-bold leading-none text-slate-300 ${
                  isDense ? "invisible" : ""
                }`}
                aria-hidden={isDense}
              >
                {value}
              </span>
              <div
                className="w-full min-w-0 rounded-t-sm bg-blue-500 transition-all duration-300 hover:bg-blue-400"
                style={{ height: `${Math.max(8, heights[index])}%` }}
                role="img"
                aria-label={`Second ${second}: ${value} clicks`}
              />
              <span
                className={`mt-1 h-2.5 w-full truncate text-center text-[7px] leading-none text-slate-500 ${
                  showTick ? "" : "invisible"
                }`}
                aria-hidden={!showTick}
              >
                {isDense ? second : `${second}s`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
