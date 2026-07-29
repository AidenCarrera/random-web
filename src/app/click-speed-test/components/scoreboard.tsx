"use client";

import type { ReactNode } from "react";
import { MousePointer2, Trophy } from "lucide-react";

import { PANEL } from "../constants";
import type { Duration, RecordEntry } from "../types";

/** Run stats: three cards from md up, one compact strip below it. */
export function Scoreboard({
  liveCps,
  timeLeft,
  isActive,
  record,
  duration,
}: {
  liveCps: number;
  timeLeft: number;
  isActive: boolean;
  record: RecordEntry;
  duration: Duration;
}) {
  const timeClass =
    timeLeft <= 2 && isActive ? "text-red-500" : "text-slate-200";

  return (
    <>
      <div className="grid shrink-0 grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard label="Current CPS">
          <div className="text-4xl font-bold text-blue-400">
            {liveCps.toFixed(1)}
          </div>
          <MousePointer2 className="absolute -bottom-4 -right-4 size-24 opacity-10" />
        </StatCard>

        <StatCard className="hidden md:block" label="Time Remaining">
          <div className={`text-4xl font-bold ${timeClass}`}>{timeLeft}s</div>
        </StatCard>

        <StatCard
          className="hidden md:block"
          icon={<Trophy className="size-4 text-emerald-400" />}
          label={`Session Record (${duration}s)`}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-emerald-400">
              {record.clicks}
            </span>
            <span className="text-sm font-medium text-slate-400">clicks</span>
            {record.clicks > 0 && (
              <span className="ml-1 text-xs font-semibold text-emerald-500/80">
                ({record.cps.toFixed(1)} CPS)
              </span>
            )}
          </div>
        </StatCard>
      </div>

      <div className={`${PANEL} shrink-0 overflow-hidden md:hidden`}>
        <div className="grid grid-cols-2 divide-x divide-slate-700">
          <CompactStat label="Time Remaining">
            <div className={`text-2xl font-bold ${timeClass}`}>{timeLeft}s</div>
          </CompactStat>

          <CompactStat
            icon={<Trophy className="size-3.5 text-emerald-400" />}
            label="Record"
          >
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-400">
                {record.clicks}
              </span>
              <span className="text-xs text-slate-400">clicks</span>
            </div>
            {record.clicks > 0 && (
              <div className="text-[11px] font-semibold text-emerald-500/80">
                {record.cps.toFixed(1)} CPS
              </div>
            )}
          </CompactStat>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  icon,
  className = "",
  children,
}: {
  label: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`${PANEL} relative overflow-hidden p-6 ${className}`}>
      <div
        className={`mb-1 text-sm font-medium uppercase tracking-wider text-slate-400 ${
          icon ? "flex items-center gap-1.5" : ""
        }`}
      >
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function CompactStat({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="p-4">
      <div
        className={`mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400 ${
          icon ? "flex items-center gap-1.5" : ""
        }`}
      >
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}
