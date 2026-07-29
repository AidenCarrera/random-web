"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

import { SHRED_FPS, SHRED_TIMINGS } from "../config";
import type { Particle } from "../types";
import { getShredTint, getSuctionOffset } from "../utils/shred-motion";

/**
 * Spirals the shredded characters into the void, writing styles straight to
 * the DOM so React never reconciles the page on an animation frame. Returns a
 * ref callback each particle span registers itself with.
 */
export function useShredAnimation(
  particles: Particle[],
  isMobile: boolean,
  onComplete: () => void,
) {
  const elementsRef = useRef(new Map<number, HTMLSpanElement>());
  const reduceMotion = useReducedMotion();
  // Read through a ref so a new callback identity cannot restart the run.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const registerParticle = useCallback(
    (id: number, element: HTMLSpanElement | null) => {
      if (element) {
        elementsRef.current.set(id, element);
      } else {
        elementsRef.current.delete(id);
      }
    },
    [],
  );

  useEffect(() => {
    if (particles.length === 0) return;

    let raf = 0;
    let lastFrameTime = 0;
    const startedAt = performance.now();
    const timings = reduceMotion
      ? SHRED_TIMINGS.reduced
      : isMobile
        ? SHRED_TIMINGS.mobile
        : SHRED_TIMINGS.desktop;
    const totalDuration = timings.purple + timings.suction;
    const frameInterval =
      1000 / (isMobile ? SHRED_FPS.mobile : SHRED_FPS.desktop);
    const maxGlow = isMobile ? 9 : 16;

    const step = (time: number) => {
      if (time - lastFrameTime < frameInterval) {
        raf = requestAnimationFrame(step);
        return;
      }
      lastFrameTime = time;

      const elapsed = time - startedAt;
      const purpleProgress = Math.min(1, elapsed / timings.purple);
      const suctionProgress = Math.max(
        0,
        Math.min(1, (elapsed - timings.purple) / timings.suction),
      );
      const { red, green, blue, glow } = getShredTint(purpleProgress);
      const color = `rgb(${red}, ${green}, ${blue})`;
      const textShadow = `0 0 ${Math.round(purpleProgress * maxGlow)}px rgba(168,85,247,${glow})`;

      particles.forEach((particle) => {
        const element = elementsRef.current.get(particle.id);
        if (!element) return;

        let x = particle.startX;
        let y = particle.startY;
        let scale = 1.06 + Math.sin(purpleProgress * Math.PI) * 0.08;
        let rotation = 0;

        if (suctionProgress > 0) {
          const offset = getSuctionOffset(
            particle.startX,
            particle.startY,
            suctionProgress,
            particle.id,
          );
          x = offset.x;
          y = offset.y;
          scale = (1 - suctionProgress) * 1.1;
          rotation = particle.startRotation + suctionProgress * 540;
        }

        element.style.color = color;
        element.style.textShadow = textShadow;
        element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
      });

      if (elapsed >= totalDuration) {
        onCompleteRef.current();
        return;
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [particles, isMobile, reduceMotion]);

  return registerParticle;
}
