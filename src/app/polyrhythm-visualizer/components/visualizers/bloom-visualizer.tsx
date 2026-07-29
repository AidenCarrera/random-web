"use client";

import { TAU } from "../../constants";
import type { VisualizerProps } from "../../types";
import { pulseKey, range } from "../../utils";

const WIDTH = 960;
const HEIGHT = 680;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

export function BloomVisualizer({
  rhythms,
  progress,
  turns,
  activePulses,
}: VisualizerProps) {
  const phase = progress * TAU;
  // Driven by total turns rather than the wrapping cycle progress, so the
  // shapes keep rotating instead of snapping back on every downbeat.
  const spinPhase = turns * TAU;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full min-h-140 w-full max-w-260"
        role="img"
        aria-label="Bloom polyrhythm visualization"
      >
        <defs>
          <radialGradient id="bloom-core" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.32)" />
            <stop offset="48%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <filter id="soft-glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={CENTER_X} cy={CENTER_Y} r="230" fill="url(#bloom-core)" />

        {rhythms.map((rhythm, index) => {
          const radius = 92 + (index / Math.max(1, rhythms.length - 1)) * 286;
          const spin = spinPhase * (index % 2 ? -0.12 : 0.12);
          const points = range(rhythm.count).map((pulse) => {
            const angle = (pulse / rhythm.count) * TAU - Math.PI / 2 + spin;
            return {
              pulse,
              x: CENTER_X + Math.cos(angle) * radius,
              y: CENTER_Y + Math.sin(angle) * radius,
            };
          });
          const path = `${points.map(({ x, y }, pointIndex) => `${pointIndex ? "L" : "M"} ${x} ${y}`).join(" ")} Z`;

          return (
            <g key={rhythm.count}>
              <path
                d={path}
                fill="none"
                stroke={rhythm.color}
                strokeOpacity="0.16"
                strokeWidth="1.5"
              />
              {points.map(({ pulse, x, y }) => {
                const downbeat = pulse === 0;
                const active = activePulses.has(pulseKey(rhythm.count, pulse));
                return (
                  <g
                    key={pulse}
                    filter={active ? "url(#soft-glow)" : undefined}
                  >
                    <line
                      x1={CENTER_X}
                      y1={CENTER_Y}
                      x2={x}
                      y2={y}
                      stroke={rhythm.color}
                      strokeOpacity={active ? 0.42 : 0.08}
                      strokeWidth={active ? 2.5 : 1}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={active ? 24 : downbeat ? 14 : 10}
                      fill={downbeat ? "#faf9f6" : rhythm.color}
                      fillOpacity={active ? 0.95 : 0.72}
                      stroke={rhythm.color}
                      strokeOpacity="0.8"
                      strokeWidth={downbeat ? 3 : 1}
                      style={{
                        transition:
                          "r 90ms ease, fill-opacity 90ms ease, stroke-width 90ms ease",
                      }}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r="52"
          fill="rgba(0,0,0,0.45)"
          stroke="rgba(255,255,255,0.2)"
        />
        <circle
          cx={CENTER_X + Math.cos(phase - Math.PI / 2) * 52}
          cy={CENTER_Y + Math.sin(phase - Math.PI / 2) * 52}
          r="8"
          fill="#faf9f6"
        />
      </svg>
    </div>
  );
}
