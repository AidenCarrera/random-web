import type { BoidsPresetName, BoidsSettings } from "../types";

export const DEFAULT_BOIDS_SETTINGS: BoidsSettings = {
  count: 1000,
  movementAccuracy: 96,
  boidVision: 72,
  alignmentForce: 1.05,
  cohesionForce: 0.72,
  separationForce: 1.35,
  steeringForce: 0.052,
  minSpeed: 1.6,
  maxSpeed: 3.4,
};

export const BOIDS_PRESETS: Record<BoidsPresetName, BoidsSettings> = {
  Relaxed: {
    count: 800,
    movementAccuracy: 112,
    boidVision: 92,
    alignmentForce: 1.55,
    cohesionForce: 0.52,
    separationForce: 1.5,
    steeringForce: 0.045,
    minSpeed: 1.4,
    maxSpeed: 2.8,
  },
  Balanced: DEFAULT_BOIDS_SETTINGS,
  Frenzy: {
    count: 1500,
    movementAccuracy: 64,
    boidVision: 48,
    alignmentForce: 0.55,
    cohesionForce: 0.38,
    separationForce: 2.1,
    steeringForce: 0.1,
    minSpeed: 2.4,
    maxSpeed: 5,
  },
};

export const BOIDS_PRESET_DESCRIPTIONS: Record<BoidsPresetName, string> = {
  Relaxed: "Slower movement with wide, smooth turns.",
  Balanced: "A balanced mix of speed and flocking behavior.",
  Frenzy: "Fast movement with less predictable flocking.",
};
