/**
 * Motion shared by the on-screen shred and the exported GIF, so both stay in
 * sync. Each caller still owns its own scale and rotation curves.
 */

/** Zinc-to-violet tint the text takes on before it is pulled in. */
export function getShredTint(purpleProgress: number) {
  return {
    red: Math.round(212 - purpleProgress * 44),
    green: Math.round(212 - purpleProgress * 127),
    blue: Math.round(216 + purpleProgress * 38),
    glow: 0.2 + purpleProgress * 0.65,
  };
}

/**
 * Spirals a character from its starting offset into the void. Offsets are
 * relative to the void center; `seed` jitters each character's swirl.
 */
export function getSuctionOffset(
  offsetX: number,
  offsetY: number,
  progress: number,
  seed: number,
) {
  const startDist = Math.hypot(offsetX, offsetY);
  const startAngle = Math.atan2(offsetY, offsetX);
  const currentDist = startDist * Math.pow(1 - progress, 2.1);
  const currentAngle =
    startAngle + progress * (Math.PI * 4) + Math.sin(seed * 1.7) * 0.22;

  return {
    x: Math.cos(currentAngle) * currentDist,
    y: Math.sin(currentAngle) * currentDist,
  };
}
