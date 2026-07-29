"use client";

import { memo, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  VOID_CENTER,
  VOID_CORE,
  VOID_FILTERS,
  VOID_GRADIENTS,
  VOID_LAYERS,
  VOID_VIEW_BOX,
} from "../lib/void-geometry";

/** Glow filters and accretion gradients; identical on every render. */
const VoidDefs = memo(function VoidDefs() {
  return (
    <defs>
      {VOID_FILTERS.map((filter) => (
        <filter
          key={filter.id}
          id={filter.id}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation={filter.blur} />
        </filter>
      ))}

      {VOID_GRADIENTS.map((gradient) => (
        <radialGradient
          key={gradient.id}
          id={gradient.id}
          cx="50%"
          cy="50%"
          r="50%"
        >
          {gradient.stops.map((stop) => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </radialGradient>
      ))}
    </defs>
  );
});

/**
 * Counter-rotating accretion bands. Memoized so typing, which only resizes the
 * core, never re-renders the expensive swirl layers.
 */
const VoidAccretionBands = memo(function VoidAccretionBands({
  isStatic,
}: {
  isStatic: boolean;
}) {
  return (
    <>
      {VOID_LAYERS.map((layer) => (
        <motion.g
          key={layer.gradientId}
          animate={isStatic ? undefined : { rotate: layer.spin }}
          transition={{
            duration: layer.spinDuration,
            repeat: Infinity,
            ease: "linear",
          }}
          className="origin-center"
        >
          <circle
            cx={VOID_CENTER}
            cy={VOID_CENTER}
            r={layer.radius}
            fill={`url(#${layer.gradientId})`}
            filter={`url(#${layer.filterId})`}
          />
          {layer.arms.map((arm) => (
            <path
              key={arm.d}
              d={arm.d}
              fill="none"
              stroke={arm.stroke}
              strokeWidth={layer.strokeWidth}
              strokeLinecap="round"
              filter={`url(#${layer.filterId})`}
            />
          ))}
        </motion.g>
      ))}
    </>
  );
});

/**
 * The singularity. `mass` grows as the user types and swells once the void has
 * swallowed a message. `centerRef` marks the point particles spiral into.
 */
export function BlackHole({
  mass,
  isMobile,
  centerRef,
}: {
  mass: number;
  isMobile: boolean;
  centerRef: RefObject<HTMLDivElement | null>;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      ref={centerRef}
      className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80 md:h-130 md:w-130 lg:h-145 lg:w-145"
    >
      <svg
        viewBox={`0 0 ${VOID_VIEW_BOX} ${VOID_VIEW_BOX}`}
        className="h-full w-full md:drop-shadow-[0_0_80px_rgba(124,58,237,0.2)]"
      >
        <VoidDefs />

        <VoidAccretionBands isStatic={Boolean(isMobile || reduceMotion)} />

        {/* Event horizon core: a glowing rim over a pitch black disk. */}
        <motion.g
          animate={{ scale: mass }}
          className="origin-center"
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        >
          <circle
            cx={VOID_CENTER}
            cy={VOID_CENTER}
            r={VOID_CORE.glowRadius}
            fill={`url(#${VOID_CORE.gradientId})`}
          />
          <circle
            cx={VOID_CENTER}
            cy={VOID_CENTER}
            r={VOID_CORE.radius}
            fill={VOID_CORE.color}
          />
        </motion.g>
      </svg>
    </div>
  );
}
