"use client";

import { memo } from "react";

import { DURATIONS, PANEL } from "../constants";
import type { Duration } from "../types";
import { PanelTitle } from "./panel-title";

export const DurationPicker = memo(function DurationPicker({
  duration,
  disabled,
  onChange,
}: {
  duration: Duration;
  disabled: boolean;
  onChange: (duration: Duration) => void;
}) {
  return (
    <section className={`${PANEL} shrink-0 p-6`}>
      <PanelTitle>Test Duration</PanelTitle>
      <div className="grid grid-cols-3 gap-2">
        {DURATIONS.map((value) => (
          <button
            key={value}
            disabled={disabled}
            onClick={() => onChange(value)}
            className={`rounded-lg border px-3 py-2 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              duration === value
                ? "border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
            }`}
          >
            {value}s
          </button>
        ))}
      </div>
    </section>
  );
});
