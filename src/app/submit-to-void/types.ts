export type Phase = "TYPING" | "SUCKING" | "DIGESTING";

export interface Particle {
  id: number;
  char: string;
  startX: number;
  startY: number;
  startRotation: number;
}

/** Look of a single star, shared by the live field and the GIF exporter. */
export type StarStyle = {
  size: number;
  /** Drift rate per frame; also drives trail opacity. */
  baseSpeed: number;
  hasTrail: boolean;
  opacity: number;
};

/**
 * A positioned star. The live field stores pixels, the GIF exporter stores
 * normalized 0-1 coordinates it scales up per frame.
 */
export type Star = StarStyle & {
  x: number;
  y: number;
};

export type GifGlyph = {
  char: string;
  x: number;
  y: number;
};
