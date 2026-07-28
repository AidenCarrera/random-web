"use client";

import { Trophy } from "lucide-react";

import type { RaceStat } from "../types";
import { formatDuration } from "../utils/format";

type RaceResultsProps = {
  arraySize: number;
  stats: RaceStat[];
};

export function RaceResults({ arraySize, stats }: RaceResultsProps) {
  const orderedStats = [...stats].sort((a, b) => a.executionMs - b.executionMs);
  const averageTime =
    orderedStats.reduce((sum, entry) => sum + entry.executionMs, 0) /
    (orderedStats.length || 1);
  const winnerTime = orderedStats[0]?.executionMs ?? 0;
  const slowestTime = orderedStats.at(-1)?.executionMs ?? 0;
  const spread = slowestTime - winnerTime;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg md:p-3">
      <div className="grid gap-2 md:grid-cols-[minmax(15rem,0.85fr)_1fr] md:items-stretch">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            Post-Race Results
          </div>
          <div className="text-sm font-black text-slate-800 md:text-base">
            {orderedStats[0]?.name} wins
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Avg {formatDuration(averageTime)} &bull; Spread{" "}
            {formatDuration(spread)} &bull; Best{" "}
            {formatDuration(winnerTime / arraySize)}/item
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
          {orderedStats.map((entry, index) => (
            <div
              key={entry.name}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-black text-white">
                  {index + 1}
                </span>
                <div className="min-w-0 text-right">
                  <div className="truncate text-[11px] font-bold text-slate-700">
                    {entry.name.replace(" Sort", "")}
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    {formatDuration(entry.executionMs)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {(entry.playbackMs / 1000).toFixed(1)}s on screen
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
