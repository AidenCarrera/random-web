export const BACKGROUND = "#10140f";

/** Alpha applied to a boid's trail stroke. */
export const TRAIL_ALPHA = 0.28;

const COLOR_PALETTE = [
  [92, 220, 255],
  [100, 255, 190],
  [218, 255, 92],
  [255, 181, 83],
  [255, 112, 154],
  [196, 142, 255],
] as const;

/** Per-boid shading spread around its palette entry. */
const TONE_RANGE = 10;

const channel = (value: number) =>
  Math.max(0, Math.min(255, Math.round(value)));

/**
 * Picks a palette entry, shifts it by a random tone, and pre-renders the body
 * and trail colors so the render loop never builds color strings.
 */
export function createBoidColors() {
  const tone = (Math.random() - 0.5) * TONE_RANGE;
  const palette =
    COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
  const red = channel(palette[0] + tone * 0.2);
  const green = channel(palette[1] + tone * 0.3);
  const blue = channel(palette[2] - tone * 0.1);

  return {
    bodyColor: `rgba(${red}, ${green}, ${blue}, 1)`,
    trailColor: `rgba(${red}, ${green}, ${blue}, ${TRAIL_ALPHA})`,
  };
}
