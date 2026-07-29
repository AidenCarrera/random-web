"use client";

import { VIEW_MODES } from "../constants";
import type { ViewMode, VisualizerProps } from "../types";
import { BloomVisualizer } from "./visualizers/bloom-visualizer";
import { CircularVisualizer } from "./visualizers/circular-visualizer";
import { Orbit3DVisualizer } from "./visualizers/orbit-3d-visualizer";
import { TimelineVisualizer } from "./visualizers/timeline-visualizer";

/**
 * Stage that frames the active visualization, showing the mode, tempo and cycle
 * position above it. Each visualizer receives only the values it draws with, so
 * the ones that ignore cycle progress can skip re-rendering.
 */
export function VisualizerStage({
  mode,
  bpm,
  rhythms,
  progress,
  turns,
  activePulses,
}: VisualizerProps & { mode: ViewMode; bpm: number }) {
  const activeMode = VIEW_MODES.find((entry) => entry.value === mode);
  const ActiveIcon = activeMode?.Icon;

  return (
    <section className="flex min-h-175 flex-col overflow-hidden rounded-2xl border border-[#faf9f6]/14 bg-[#141219] shadow-[inset_0_1px_0_rgba(250,249,246,0.08),0_24px_50px_-30px_rgba(0,0,0,0.95)]">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#faf9f6]/80">
          <span className="[&>svg]:h-3.5 [&>svg]:w-3.5 text-[#55c991]">
            {ActiveIcon && <ActiveIcon />}
          </span>
          {activeMode?.label}
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] tabular-nums text-[#d8cabc]/55">
          <span>{bpm} BPM</span>
          <span className="text-[#faf9f6]">{(progress * 100).toFixed(1)}%</span>
        </div>
      </div>
      <div className="relative h-0.5 w-full bg-[#faf9f6]/10">
        <div
          className="absolute inset-y-0 left-0 bg-[#55c991]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="flex flex-1 items-center justify-center px-2 py-4 sm:px-4">
        {mode === "circle" && (
          <CircularVisualizer
            rhythms={rhythms}
            progress={progress}
            activePulses={activePulses}
          />
        )}
        {mode === "timeline" && (
          <TimelineVisualizer
            rhythms={rhythms}
            progress={progress}
            activePulses={activePulses}
          />
        )}
        {mode === "bloom" && (
          <BloomVisualizer
            rhythms={rhythms}
            progress={progress}
            turns={turns}
            activePulses={activePulses}
          />
        )}
        {mode === "orbit3d" && (
          <Orbit3DVisualizer rhythms={rhythms} activePulses={activePulses} />
        )}
      </div>
    </section>
  );
}
