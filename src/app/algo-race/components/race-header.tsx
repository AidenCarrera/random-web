"use client";

import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";

import { SIZE_OPTIONS } from "../config";

type RaceHeaderProps = {
  arraySize: number;
  canSkipToEnd: boolean;
  isPaused: boolean;
  isPreparing: boolean;
  isRunning: boolean;
  prepareProgress: number;
  onSizeChange: (size: number) => void;
  onToggle: () => void;
  onSkipToEnd: () => void;
  onReset: () => void;
};

function StartButtonLabel({
  isPaused,
  isPreparing,
  isRunning,
}: Pick<RaceHeaderProps, "isPaused" | "isPreparing" | "isRunning">) {
  // Preparation happens ahead of Start, so this only shows while the cache is cold.
  if (isPreparing) return "Preparing race…";

  if (isRunning && !isPaused) {
    return (
      <>
        <Pause className="h-3.5 w-3.5" /> PAUSE
      </>
    );
  }

  if (isRunning) {
    return (
      <>
        <Play className="h-3.5 w-3.5" /> RESUME
      </>
    );
  }

  return (
    <>
      <Play className="h-3.5 w-3.5" /> START
    </>
  );
}

export function RaceHeader({
  arraySize,
  canSkipToEnd,
  isPaused,
  isPreparing,
  isRunning,
  prepareProgress,
  onSizeChange,
  onToggle,
  onSkipToEnd,
  onReset,
}: RaceHeaderProps) {
  return (
    <header className="flex flex-col gap-2 border-b-2 border-slate-300 pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
          ALGO RACE
        </h1>
        <p className="text-[11px] text-slate-500 sm:text-xs">
          Which algorithm will win? • N={arraySize.toLocaleString()}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400">SIZE</span>
          {SIZE_OPTIONS.map((option) => (
            <button
              key={option.size}
              onClick={() => onSizeChange(option.size)}
              disabled={isRunning}
              title={`${option.size.toLocaleString()} items`}
              className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                arraySize === option.size
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              } disabled:opacity-50`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          onClick={onToggle}
          disabled={isPreparing}
          className="relative flex min-w-24 items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-700 disabled:opacity-60"
        >
          <StartButtonLabel
            isPaused={isPaused}
            isPreparing={isPreparing}
            isRunning={isRunning}
          />
          {isPreparing && (
            <span
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-white/70 transition-transform duration-200"
              style={{ transform: `scaleX(${prepareProgress})` }}
            />
          )}
        </button>
        {canSkipToEnd && (
          <button
            onClick={onSkipToEnd}
            title="Finish the last algorithm now"
            className="flex items-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-100"
          >
            <SkipForward className="h-3.5 w-3.5" /> SKIP TO END
          </button>
        )}
        <button
          onClick={() => onReset()}
          className="flex items-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-100"
        >
          <RotateCcw className="h-3.5 w-3.5" /> RESET
        </button>
      </div>
    </header>
  );
}
