"use client";

import { TAU } from "../../constants";
import type { VisualizerProps } from "../../types";
import { pulseKey, range } from "../../utils";

type CircularVisualizerProps = Pick<
  VisualizerProps,
  "rhythms" | "progress" | "activePulses"
>;

const SIZE = 760;
const CENTER = SIZE / 2;
const MAX_RADIUS = 300;
const MIN_RADIUS = 96;

export function CircularVisualizer({
  rhythms,
  progress,
  activePulses,
}: CircularVisualizerProps) {
  const gap =
    rhythms.length > 1 ? (MAX_RADIUS - MIN_RADIUS) / (rhythms.length - 1) : 0;
  const angle = progress * TAU - Math.PI / 2;
  const playhead = {
    x: CENTER + Math.cos(angle) * (MAX_RADIUS + 26),
    y: CENTER + Math.sin(angle) * (MAX_RADIUS + 26),
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="mb-4 text-center">
        <div className="text-2xl font-black tracking-[0.16em] text-white sm:text-3xl">
          {rhythms.map(({ count }) => count).join(":")}
        </div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
          cycle
        </div>
      </div>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="aspect-square w-full max-w-195"
        role="img"
        aria-label="Circular polyrhythm visualization"
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={MAX_RADIUS + 46}
          fill="rgba(255,255,255,0.018)"
          stroke="rgba(255,255,255,0.08)"
        />
        <line
          x1={CENTER}
          y1={CENTER}
          x2={playhead.x}
          y2={playhead.y}
          stroke="rgba(255,255,255,0.82)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={playhead.x} cy={playhead.y} r="8" fill="#faf9f6" />

        {rhythms.map((rhythm, rhythmIndex) => {
          const radius = MAX_RADIUS - rhythmIndex * gap;
          return (
            <g key={rhythm.count}>
              <circle
                cx={CENTER}
                cy={CENTER}
                r={radius}
                fill="none"
                stroke={rhythm.color}
                strokeOpacity="0.26"
                strokeWidth="2"
              />
              {range(rhythm.count).map((pulse) => {
                const pulseAngle = (pulse / rhythm.count) * TAU - Math.PI / 2;
                const x = CENTER + Math.cos(pulseAngle) * radius;
                const y = CENTER + Math.sin(pulseAngle) * radius;
                const downbeat = pulse === 0;
                const active = activePulses.has(pulseKey(rhythm.count, pulse));
                return (
                  <g key={pulse}>
                    <circle
                      cx={x}
                      cy={y}
                      r={active ? 18 : downbeat ? 12 : 9}
                      fill={downbeat ? "#faf9f6" : rhythm.color}
                      fillOpacity={active ? 0.95 : downbeat ? 0.85 : 0.74}
                      stroke={downbeat ? rhythm.color : "rgba(255,255,255,0.5)"}
                      strokeWidth={downbeat ? 3 : 1}
                      style={{
                        filter: active
                          ? `drop-shadow(0 0 18px ${rhythm.color})`
                          : downbeat
                            ? "drop-shadow(0 0 14px rgba(255,255,255,0.6))"
                            : "none",
                        transition: "r 90ms ease, fill-opacity 90ms ease",
                      }}
                    />
                    {downbeat && (
                      <text
                        x={x}
                        y={y - 22}
                        textAnchor="middle"
                        className="fill-white/65 text-[15px] font-bold"
                      >
                        {rhythm.count}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
