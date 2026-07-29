/** Mutable 2D vector, written in place so the flock loop stays allocation-free. */
export type Vector = { x: number; y: number };

/** Below this length a vector carries no usable direction. */
const MINIMUM_MAGNITUDE = 0.0001;

export function createVector(): Vector {
  return { x: 0, y: 0 };
}

/** Caps `(x, y)` at `maximum` length. */
export function clampMagnitude(
  x: number,
  y: number,
  maximum: number,
  out: Vector,
) {
  const magnitude = Math.hypot(x, y);
  const scale =
    magnitude <= maximum || magnitude === 0 ? 1 : maximum / magnitude;
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
  const magnitude = Math.hypot(x, y);
  if (magnitude < MINIMUM_MAGNITUDE) {
    out.x = Math.cos(fallbackAngle) * minimum;
    out.y = Math.sin(fallbackAngle) * minimum;
    return;
  }
  if (magnitude < minimum) {
    const scale = minimum / magnitude;
    out.x = x * scale;
    out.y = y * scale;
    return;
  }
  clampMagnitude(x, y, maximum, out);
}

/**
 * Force that turns a velocity toward `(x, y)`: the difference between the
 * desired full-speed heading and the current one, capped by `steeringForce`.
 */
export function steerToward(
  x: number,
  y: number,
  velocityX: number,
  velocityY: number,
  maximumSpeed: number,
  steeringForce: number,
  out: Vector,
) {
  const magnitude = Math.hypot(x, y);
  if (magnitude < MINIMUM_MAGNITUDE) {
    out.x = 0;
    out.y = 0;
    return;
  }
  const desiredX = (x / magnitude) * maximumSpeed;
  const desiredY = (y / magnitude) * maximumSpeed;
  clampMagnitude(
    desiredX - velocityX,
    desiredY - velocityY,
    steeringForce,
    out,
  );
}
