import {
  GIF_STAR_COUNT,
  GIF_STAR_FOREGROUND_COUNT,
  LIVE_STAR_SPEED_MULTIPLIER,
} from "../config";
import type { Star, StarStyle } from "../types";

/** Length of the streak drawn above a trailing star. */
const TRAIL_LENGTH = 6;

export function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  star: StarStyle,
) {
  if (star.hasTrail) {
    ctx.beginPath();
    ctx.moveTo(x, y - TRAIL_LENGTH);
    ctx.lineTo(x, y);
    ctx.strokeStyle = `rgba(168, 85, 247, ${star.baseSpeed * 0.45})`;
    ctx.lineWidth = star.size * 0.9;
    ctx.stroke();
  }

  ctx.fillStyle = star.hasTrail
    ? "rgba(216, 180, 254, 0.8)"
    : `rgba(255, 255, 255, ${star.opacity})`;
  ctx.beginPath();
  ctx.arc(x, y, star.size, 0, Math.PI * 2);
  ctx.fill();
}

/** Random star field sized to the viewport, respawned on every resize. */
export function createBackgroundStars(
  width: number,
  height: number,
  total: number,
  foregroundCount: number,
): Star[] {
  return Array.from({ length: total }, (_, idx) => {
    const isDeepBackground = idx >= foregroundCount;
    const hasTrail = !isDeepBackground && Math.random() < 0.08;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: isDeepBackground ? 0.7 : Math.random() * 1.5 + 0.5,
      baseSpeed: isDeepBackground
        ? (Math.random() * 0.01 + 0.002) * LIVE_STAR_SPEED_MULTIPLIER
        : (Math.random() * (hasTrail ? 0.9 : 0.15) + 0.04) *
          LIVE_STAR_SPEED_MULTIPLIER,
      hasTrail,
      opacity: isDeepBackground
        ? Math.random() * 0.2 + 0.08
        : Math.random() * 0.4 + 0.3,
    };
  });
}

/**
 * Deterministic star field for GIF export, so a re-render of the same message
 * produces the same sky. Coordinates are normalized to 0-1.
 */
export function createGifStars(): Star[] {
  return Array.from({ length: GIF_STAR_COUNT }, (_, idx) => {
    const isDeepBackground = idx >= GIF_STAR_FOREGROUND_COUNT;
    const hasTrail = !isDeepBackground && idx % 13 === 0;

    return {
      x: (((Math.sin(idx * 91.7) * 10000) % 1) + 1) % 1,
      y: (((Math.sin(idx * 47.3 + 1.7) * 10000) % 1) + 1) % 1,
      size: isDeepBackground ? 0.7 : ((idx * 17) % 10) / 10 + 0.7,
      baseSpeed: isDeepBackground
        ? 0.0014 + (((idx * 19) % 10) / 10) * 0.005
        : 0.015 + (((idx * 23) % 10) / 10) * (hasTrail ? 0.22 : 0.055),
      hasTrail,
      opacity: isDeepBackground
        ? 0.08 + (((idx * 29) % 10) / 10) * 0.2
        : 0.3 + (((idx * 31) % 10) / 10) * 0.4,
    };
  });
}
