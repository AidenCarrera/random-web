"use client";

import { useEffect, useState } from "react";

import {
  COMPACT_MEDIA_QUERY,
  SPEED_MAX,
  SPEED_MIN,
  SPEED_STEP,
} from "../config";
import type { Category } from "../types";
import { getSliderBackground } from "../utils/style";
import { CategoryButtons } from "./category-buttons";
import { RangeControl } from "./range-control";

export function ControlPanel({
  intensityPercent,
  speed,
  selected,
  accent,
  isRainbow,
  onIntensityChange,
  onSpeedChange,
  onCategoryPress,
}: {
  intensityPercent: number;
  speed: number;
  selected: Category[];
  accent: string;
  isRainbow: boolean;
  onIntensityChange: (value: number) => void;
  onSpeedChange: (value: number) => void;
  onCategoryPress: (category: Category, mix: boolean) => void;
}) {
  const [minimized, setMinimized] = useState(false);
  const speedPercent = ((speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * 100;

  useEffect(() => {
    const query = window.matchMedia(COMPACT_MEDIA_QUERY);
    const sync = () => setMinimized(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <section className="absolute bottom-4 left-1/2 z-20 flex w-[min(92vw,42rem)] -translate-x-1/2 flex-col rounded-[1.75rem] border border-slate-200/50 bg-white/85 p-3 shadow-xl backdrop-blur-md sm:bottom-6 sm:p-4 md:bottom-10 md:w-[90%] md:max-w-2xl md:p-6">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Emoji Rain
          </p>
          <p className="text-sm font-semibold text-slate-700 sm:text-base">
            Controls
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMinimized((value) => !value)}
          className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 transition hover:bg-white"
        >
          {minimized ? "Open" : "Minimize"}
        </button>
      </header>

      {!minimized && (
        <div className="mt-4 flex max-h-[50vh] flex-col gap-4 overflow-y-auto pr-1 sm:gap-5">
          <div className="flex shrink-0 flex-col gap-4 border-b border-slate-200/60 pb-4 sm:pb-5">
            <RangeControl
              label="Rain Intensity"
              value={intensityPercent}
              displayValue={`${intensityPercent}%`}
              min={0}
              max={100}
              step={1}
              fill={getSliderBackground(intensityPercent, accent, isRainbow)}
              onChange={onIntensityChange}
            />
            <RangeControl
              label="Falling Speed"
              value={speed}
              displayValue={`${Math.round(speed * 100)}%`}
              min={SPEED_MIN}
              max={SPEED_MAX}
              step={SPEED_STEP}
              fill={getSliderBackground(speedPercent, accent, isRainbow)}
              onChange={onSpeedChange}
            />
          </div>

          <CategoryButtons
            selected={selected}
            isRainbow={isRainbow}
            accent={accent}
            onPress={onCategoryPress}
          />

          <p className="shrink-0 select-none text-center text-[11px] font-medium text-slate-400">
            Press and hold to mix categories.
          </p>
        </div>
      )}
    </section>
  );
}
