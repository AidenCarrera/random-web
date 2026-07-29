"use client";

import { memo } from "react";

export const RangeControl = memo(function RangeControl({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  fill,
  onChange,
}: {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  fill: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="flex justify-between text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span>{displayValue}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
        className="custom-slider cursor-pointer"
        style={{ background: fill }}
      />
    </label>
  );
});
