"use client";

import type { VisualizerProps } from "../../types";
import { pulseKey, range } from "../../utils";

type TimelineVisualizerProps = Pick<
  VisualizerProps,
  "rhythms" | "progress" | "activePulses"
>;

export function TimelineVisualizer({
  rhythms,
  progress,
  activePulses,
}: TimelineVisualizerProps) {
  return (
    <div className="relative flex min-h-140 w-full max-w-245 flex-col justify-center gap-5 overflow-hidden p-5 sm:p-8">
      <div className="pointer-events-none absolute inset-0 grid grid-cols-[80px_1fr] gap-6 p-5 sm:p-8">
        <div />
        <div className="relative h-full">
          <div
            className="absolute bottom-2 top-2 w-px bg-white shadow-[0_0_18px_rgba(255,255,255,0.75)]"
            style={{ left: `${progress * 100}%` }}
          />
        </div>
      </div>

      {rhythms.map((rhythm) => (
        <div key={rhythm.count} className="grid grid-cols-[80px_1fr] gap-6">
          <div className="flex items-center justify-end gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: rhythm.color,
                boxShadow: `0 0 10px ${rhythm.glow}`,
              }}
            />
            <span className="font-mono text-base font-black text-white/75">
              /{rhythm.count}
            </span>
          </div>
          <div className="relative h-16 rounded-lg border border-white/8 bg-black/24">
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/12" />
            {range(rhythm.count).map((pulse) => {
              const downbeat = pulse === 0;
              const active = activePulses.has(pulseKey(rhythm.count, pulse));
              return (
                <div
                  key={pulse}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all"
                  style={{
                    left: `${(pulse / rhythm.count) * 100}%`,
                    width: active ? 26 : downbeat ? 20 : 14,
                    height: active ? 26 : downbeat ? 20 : 14,
                    background: downbeat ? "#faf9f6" : rhythm.color,
                    border: `2px solid ${downbeat ? rhythm.color : "rgba(255,255,255,0.42)"}`,
                    boxShadow: active
                      ? `0 0 20px ${rhythm.color}`
                      : downbeat
                        ? "0 0 14px rgba(255,255,255,0.55)"
                        : "none",
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
