"use client";

import { Pause, Play, RotateCcw } from "lucide-react";

import { SIZE_OPTIONS } from "../config";
import { SORT_NAMES } from "../lib/algorithms";

type RaceHeaderProps = {
  arraySize: number;
  isPaused: boolean;
  isPreparing: boolean;
  isRunning: boolean;
  prepared: number;
  onSizeChange: (size: number) => void;
  onToggle: () => void;
  onReset: () => void;
};

/** Preparation runs two passes over every algorithm: timing, then frame capture. */
function StartButtonLabel({
  isPaused,
  isPreparing,
  isRunning,
  prepared,
}: Pick<
  RaceHeaderProps,
  "isPaused" | "isPreparing" | "isRunning" | "prepared"
>) {
  if (isPreparing) {
    return prepared < SORT_NAMES.length
      ? `TIMING ${prepared}/${SORT_NAMES.length}`
      : `FRAMES ${prepared - SORT_NAMES.length}/${SORT_NAMES.length}`;
  }

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
  isPaused,
  isPreparing,
  isRunning,
  prepared,
  onSizeChange,
  onToggle,
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
          className="flex min-w-24 items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-700 disabled:opacity-60"
        >
          <StartButtonLabel
            isPaused={isPaused}
            isPreparing={isPreparing}
            isRunning={isRunning}
            prepared={prepared}
          />
        </button>
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
