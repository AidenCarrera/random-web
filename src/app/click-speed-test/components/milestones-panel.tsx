"use client";

import { Award } from "lucide-react";

import { MILESTONES, PANEL } from "../constants";
import type { Duration } from "../types";
import { PanelTitle } from "./panel-title";

/** Milestone ladder for the selected duration, unlocked by the best click count. */
export function MilestonesPanel({
  duration,
  bestClicks,
}: {
  duration: Duration;
  bestClicks: number;
}) {
  return (
    <section className={`${PANEL} flex flex-1 flex-col justify-between p-6`}>
      <PanelTitle icon={<Award className="size-4 text-yellow-500" />}>
        Milestones ({duration}s mode)
      </PanelTitle>
      <div className="flex flex-1 flex-col justify-between gap-2.5">
        {MILESTONES[duration].map((milestone) => {
          const achieved = bestClicks >= milestone.target;

          return (
            <div
              key={milestone.label}
              className={`flex flex-1 items-center justify-between rounded-lg border p-2.5 transition-all ${
                achieved
                  ? `${milestone.color} shadow-sm`
                  : "border-slate-800 bg-slate-900/30 text-slate-500"
              }`}
            >
              <div>
                <div className="text-xs font-bold leading-snug">
                  {milestone.label}
                </div>
                <div className="text-[10px] opacity-80">
                  {milestone.target} clicks target
                </div>
              </div>
              <span
                className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                  achieved
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-800 text-slate-600"
                }`}
              >
                {achieved ? "Unlocked" : "Locked"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
