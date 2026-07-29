"use client";

import { memo } from "react";
import { Calendar } from "lucide-react";

import { PANEL } from "../constants";
import type { RunResult } from "../types";
import { scaleValues } from "../utils";
import { PanelTitle } from "./panel-title";

export const SessionHistory = memo(function SessionHistory({
  history,
}: {
  history: RunResult[];
}) {
  return (
    <section className={`${PANEL} flex flex-1 flex-col p-6`}>
      <PanelTitle icon={<Calendar className="size-4 text-blue-400" />}>
        Session History
      </PanelTitle>
      <div className="flex max-h-137.5 flex-1 flex-col gap-3 overflow-y-auto pr-1 lg:max-h-none">
        {history.length ? (
          history.map((run) => <HistoryCard key={run.id} run={run} />)
        ) : (
          <div className="my-auto py-12 text-center text-sm text-slate-500">
            No runs recorded yet.
          </div>
        )}
      </div>
    </section>
  );
});

function HistoryCard({ run }: { run: RunResult }) {
  // Opacity stands in for bar height in this condensed strip.
  const intensities = scaleValues(run.pace, 0.15, 1);

  return (
    <div className="flex shrink-0 flex-col gap-1.5 rounded-lg border border-slate-800 bg-slate-900/30 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">
          {run.clicks} clicks ({run.cps.toFixed(1)} CPS)
        </span>
        <span className="text-slate-500">{run.timestamp}</span>
      </div>
      <div className="flex h-3 items-center gap-1">
        {run.pace.map((value, index) => (
          <div
            key={index}
            className="h-full flex-1 rounded-sm bg-blue-500/80"
            style={{ opacity: intensities[index] }}
            title={`Sec ${index + 1}: ${value} clicks`}
          />
        ))}
      </div>
      <div className="text-right text-[10px] text-slate-500">
        {run.duration}s duration
      </div>
    </div>
  );
}
