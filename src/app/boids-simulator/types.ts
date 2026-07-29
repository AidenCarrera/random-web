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
 * Colors are baked in at birth and trail points live in a fixed ring buffer so
 * the simulation and render loops never allocate per frame.
 */
export type Boid = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Heading used to restart a boid that has stalled. */
  phase: number;
  size: number;
  wander: number;
  bodyColor: string;
  trailColor: string;
  trail: Float32Array;
  trailStart: number;
  trailLength: number;
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
