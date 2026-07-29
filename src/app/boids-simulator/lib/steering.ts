/** Mutable 2D vector, written in place so the flock loop stays allocation-free. */
export type Vector = { x: number; y: number };

/** Below this length a vector carries no usable direction. */
const MINIMUM_MAGNITUDE = 0.0001;
const MINIMUM_MAGNITUDE_SQUARED = MINIMUM_MAGNITUDE * MINIMUM_MAGNITUDE;

export function createVector(): Vector {
  return { x: 0, y: 0 };
}

/**
 * Distance comparisons use squared magnitudes. `Math.hypot` is avoided in favor of
 * direct squared math and `Math.sqrt` to prevent variadic call and overflow guard overhead.
 */

export function clampMagnitude(
  x: number,
  y: number,
  maximum: number,
  out: Vector,
) {
  const magnitudeSquared = x * x + y * y;
  if (magnitudeSquared <= maximum * maximum) {
    out.x = x;
    out.y = y;
    return;
  }
  const scale = maximum / Math.sqrt(magnitudeSquared);
  out.x = x * scale;
  out.y = y * scale;
}

/** Keeps a velocity inside the speed band, restarting stalled boids along `fallbackAngle`. */
export function clampSpeed(
  x: number,
  y: number,
  minimum: number,
  maximum: number,
  fallbackAngle: number,
  out: Vector,
) {
  const magnitudeSquared = x * x + y * y;
  if (magnitudeSquared < MINIMUM_MAGNITUDE_SQUARED) {
    out.x = Math.cos(fallbackAngle) * minimum;
    out.y = Math.sin(fallbackAngle) * minimum;
    return;
  }
  if (magnitudeSquared < minimum * minimum) {
    const scale = minimum / Math.sqrt(magnitudeSquared);
    out.x = x * scale;
    out.y = y * scale;
    return;
  }
  clampMagnitude(x, y, maximum, out);
}

/** Calculates Reynolds steering force toward target (x, y), capped by steeringForce. */
export function steerToward(
  x: number,
  y: number,
  velocityX: number,
  velocityY: number,
  maximumSpeed: number,
  steeringForce: number,
  out: Vector,
) {
  const magnitudeSquared = x * x + y * y;
  if (magnitudeSquared < MINIMUM_MAGNITUDE_SQUARED) {
    out.x = 0;
    out.y = 0;
    return;
  }
  const scale = maximumSpeed / Math.sqrt(magnitudeSquared);
  const desiredX = x * scale;
  const desiredY = y * scale;
  clampMagnitude(
    desiredX - velocityX,
    desiredY - velocityY,
    steeringForce,
    out,
  );
}
