export const BACKGROUND = "#10140f";

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
 * Interns discrete RGB colors to 16-bit indices so boids avoid string allocations
 * and renderers can look up color representations in constant time.
 */
const colorIds = new Map<number, number>();

/** CSS colors for the 2D renderer, indexed by interned color. */
export const BODY_STYLES: string[] = [];
export const TRAIL_STYLES: string[] = [];
/**
 * Packed `0xAABBGGRR` 32-bit words indexed by interned color for single-store
 * vertex buffer uploads in WebGL.
 */
export const BODY_COLOR_WORDS: number[] = [];
export const TRAIL_COLOR_WORDS: number[] = [];

const colorWord = (red: number, green: number, blue: number, alpha: number) =>
  ((alpha << 24) | (blue << 16) | (green << 8) | red) >>> 0;

function internColor(red: number, green: number, blue: number) {
  const packed = (red << 16) | (green << 8) | blue;
  const existing = colorIds.get(packed);
  if (existing !== undefined) return existing;

  const id = BODY_STYLES.length;
  colorIds.set(packed, id);
  BODY_STYLES.push(`rgba(${red}, ${green}, ${blue}, 1)`);
  TRAIL_STYLES.push(`rgba(${red}, ${green}, ${blue}, ${TRAIL_ALPHA})`);
  BODY_COLOR_WORDS.push(colorWord(red, green, blue, 255));
  TRAIL_COLOR_WORDS.push(
    colorWord(red, green, blue, Math.round(TRAIL_ALPHA * 255)),
  );
  return id;
}

export function pickBoidColor() {
  const tone = (Math.random() - 0.5) * TONE_RANGE;
  const palette =
    COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
  return internColor(
    channel(palette[0] + tone * 0.2),
    channel(palette[1] + tone * 0.3),
    channel(palette[2] - tone * 0.1),
  );
}

/** `BACKGROUND` color converted to normalized [0, 1] RGB for `gl.clearColor`. */
export const BACKGROUND_RGB = [0x10 / 255, 0x14 / 255, 0x0f / 255] as const;
