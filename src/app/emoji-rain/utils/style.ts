import { MAX_SPAWN_RATE } from "../config";

const RAINBOW_GRADIENT =
  "linear-gradient(to right, #ff3366, #ff9933, #ffff33, #33cc66, #3399ff, #9933ff)";

/** Heavier rain fades the backdrop in, staying readable at both extremes. */
export const getBackgroundOpacity = (
  intensity: number,
  isDark: boolean,
  isRainbow: boolean,
) => {
  const ratio = intensity / MAX_SPAWN_RATE;
  if (isRainbow) return Math.min(0.25 + ratio * 0.45, 0.9);
  return isDark
    ? Math.min(0.6 + ratio * 0.38, 0.98)
    : Math.min(0.04 + ratio * 0.76, 0.8);
};

export const getSliderBackground = (
  percent: number,
  accent: string,
  isRainbow: boolean,
) =>
  isRainbow
    ? RAINBOW_GRADIENT
    : `linear-gradient(to right, ${accent} 0%, ${accent} ${percent}%, #e2e8f0 ${percent}%, #e2e8f0 100%)`;
