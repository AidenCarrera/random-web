"use client";

import { useShredAnimation } from "../hooks/use-shred-animation";
import type { Particle } from "../types";

/**
 * The message mid-shred: one span per character, spiraling into the void.
 * Positions are written straight to the DOM by the animation hook.
 */
export function ShreddedText({
  particles,
  isMobile,
  onComplete,
}: {
  particles: Particle[];
  isMobile: boolean;
  onComplete: () => void;
}) {
  const registerParticle = useShredAnimation(particles, isMobile, onComplete);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      {particles.map((particle) => (
        <span
          key={particle.id}
          ref={(element) => registerParticle(particle.id, element)}
          className="absolute font-black text-sm font-mono"
          style={{
            color: "rgb(212, 212, 216)",
            transform: `translate3d(${particle.startX}px, ${particle.startY}px, 0) scale(1.06)`,
            willChange: "transform",
          }}
          aria-hidden="true"
        >
          {particle.char}
        </span>
      ))}
    </div>
  );
}
