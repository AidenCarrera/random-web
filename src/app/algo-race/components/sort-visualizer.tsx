"use client";

import { memo, useCallback } from "react";

import type { SortName } from "../types";

export const SortVisualizer = memo(function SortVisualizer({
  name,
  onCanvas,
  rank,
  complexity,
  isRaceComplete,
}: {
  name: SortName;
  onCanvas: (name: SortName, canvas: HTMLCanvasElement | null) => void;
  rank: number | null;
  complexity: string;
  isRaceComplete: boolean;
}) {
  // Stable ref callback prevents canvas re-mounting when rank badge renders.
  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement | null) => onCanvas(name, canvas),
    [onCanvas, name],
  );

  return (
    <div
      className={`relative mx-auto flex aspect-square w-full min-w-0 max-w-none flex-col rounded-xl border border-slate-100 bg-white p-2.5 shadow-lg md:p-3 ${
        isRaceComplete
          ? "md:max-w-[calc((100vh-238px)/3)] xl:max-w-[calc((100vh-218px)/2)]"
          : "md:max-w-[calc((100vh-138px)/3)] xl:max-w-[calc((100vh-128px)/2)]"
      }`}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[11px] font-bold leading-tight text-slate-800 sm:text-sm md:text-base">
            {name}
          </h2>
          <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-300 sm:text-[9px]">
            {complexity}
          </div>
        </div>
        {rank && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-black text-black shadow-md animate-in zoom-in">
            #{rank}
          </div>
        )}
      </div>

      <div className="relative min-h-0 flex-1 border-b border-l border-slate-200 p-0.5">
        <canvas
          ref={canvasRef}
          aria-label={`${name} visualization`}
          className="block h-full w-full"
        />
      </div>
    </div>
  );
});
