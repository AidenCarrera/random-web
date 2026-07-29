export type PointerMode = "attract" | "repel";

export type BoidsSettings = {
  count: number;
  movementAccuracy: number;
  boidVision: number;
  alignmentForce: number;
  cohesionForce: number;
  separationForce: number;
  steeringForce: number;
  minSpeed: number;
  maxSpeed: number;
};

export type BoidsPresetName = "Relaxed" | "Balanced" | "Frenzy";

/**
 * Stores the flock in parallel typed arrays for memory locality during neighbor scans.
 * Buffers are allocated up to `capacity`; only the first `count` elements are active.
 */
export type Flock = {
  count: number;
  capacity: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  /** Heading used to restart a boid that has stalled. */
  phase: Float32Array;
  size: Float32Array;
  wander: Float32Array;
  /** Interned palette index; see `lib/palette`. */
  color: Uint16Array;
  /** Ring buffer of `TRAIL_CAPACITY` xy pairs per boid. */
  trail: Float32Array;
  trailStart: Uint8Array;
  trailLength: Uint8Array;
};

/** Polymorphic canvas renderer interface implemented by WebGL2 and 2D fallbacks. */
export type FlockRenderer = {
  /** `width`/`height` are CSS pixels; `ratio` is the device pixel ratio. */
  resize: (width: number, height: number, ratio: number) => void;
  draw: (flock: Flock, trails: boolean) => void;
  dispose: () => void;
};

/** Single averaged influence point derived from every pointer on the canvas. */
export type PointerState = {
  x: number;
  y: number;
  active: boolean;
  pressed: boolean;
  mode: PointerMode;
};

export type BoidsMetrics = {
  fps: number;
  neighbors: number;
};

export type BoidsSnapshot = {
  blob: Blob;
  fileName: string;
  imageSrc: string;
};

export type BoidsCanvasHandle = {
  reseed: () => void;
  scatter: () => void;
  snapshot: () => Promise<BoidsSnapshot | null>;
};
