import { BASE_FRAME_DURATION, MAX_SEPARATION_FORCE } from "../constants";
import type { BoidsSettings, Flock, PointerState } from "../types";
import { pickBoidColor } from "./palette";
import { SORTED_STRIDE, type SpatialGrid } from "./spatial-grid";
import { clampSpeed, createVector, steerToward } from "./steering";

/** Trail points kept per boid; sizes the ring buffer on every boid. */
export const TRAIL_CAPACITY = 22;

const VELOCITY_RETENTION = 0.996;
const WANDER_LIMIT = 0.7;
const WANDER_JITTER = 0.09;
const WANDER_WEIGHT = 0.22;
/** Floor on how much a distant neighbor still counts toward a rule. */
const MINIMUM_VISION_WEIGHT = 0.02;
const POINTER_RADIUS = 280;
const POINTER_STRENGTH = 0.19;
/** How far past an edge a boid travels before wrapping to the other side. */
const WRAP_MARGIN = 10;
/** Inset of the reflecting walls so a bouncing boid stays fully on screen. */
const BOUNCE_MARGIN = 6;
const SCATTER_MIN_SPEED = 3;
const SCATTER_SPEED_RANGE = 4;

/** Neighbor cell offsets per axis, deduplicated when grid spans are narrower than 3 cells. */
const WRAP_OFFSETS = [[-1], [-1, 0], [-1, 0, 1]] as const;

// Scratch vectors shared by the hot loop; `stepFlock` runs synchronously.
const alignment = createVector();
const cohesion = createVector();
const separation = createVector();
const velocity = createVector();

const wrapOffsets = (span: number) => WRAP_OFFSETS[Math.min(span, 3) - 1];

/** Scales a frame's elapsed time to 60 Hz steps so motion is refresh-rate independent. */
export function getFrameScale(elapsedMilliseconds: number) {
  return Math.min(1.8, Math.max(0, elapsedMilliseconds / BASE_FRAME_DURATION));
}

/** Separation only pushes within a fraction of the vision radius, scaled by its force. */
export function getSeparationRadius(
  boidVision: number,
  separationForce: number,
) {
  if (boidVision <= 0 || separationForce <= 0) return 0;
  const forceProgress = Math.min(1, separationForce / MAX_SEPARATION_FORCE);
  return boidVision * forceProgress * 0.9;
}

function allocate(capacity: number): Flock {
  return {
    count: 0,
    capacity,
    x: new Float32Array(capacity),
    y: new Float32Array(capacity),
    vx: new Float32Array(capacity),
    vy: new Float32Array(capacity),
    phase: new Float32Array(capacity),
    size: new Float32Array(capacity),
    wander: new Float32Array(capacity),
    color: new Uint16Array(capacity),
    trail: new Float32Array(capacity * TRAIL_CAPACITY * 2),
    trailStart: new Uint8Array(capacity),
    trailLength: new Uint8Array(capacity),
  };
}

/** Moves the live boids into wider buffers, doubling so growth stays amortized. */
function grow(flock: Flock, capacity: number) {
  const next = allocate(Math.max(capacity, flock.capacity * 2));
  next.count = flock.count;
  next.x.set(flock.x);
  next.y.set(flock.y);
  next.vx.set(flock.vx);
  next.vy.set(flock.vy);
  next.phase.set(flock.phase);
  next.size.set(flock.size);
  next.wander.set(flock.wander);
  next.color.set(flock.color);
  next.trail.set(flock.trail);
  next.trailStart.set(flock.trailStart);
  next.trailLength.set(flock.trailLength);
  Object.assign(flock, next);
}

function spawnBoid(
  flock: Flock,
  index: number,
  width: number,
  height: number,
  settings: BoidsSettings,
) {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.min(width, height) * (0.08 + Math.random() * 0.28);
  const x = width / 2 + Math.cos(angle) * radius;
  const y = height / 2 + Math.sin(angle) * radius;
  const heading = angle + Math.PI / 2 + (Math.random() - 0.5) * 1.4;
  const speed =
    settings.minSpeed +
    Math.random() * Math.max(0, settings.maxSpeed - settings.minSpeed);

  flock.x[index] = x;
  flock.y[index] = y;
  flock.vx[index] = Math.cos(heading) * speed;
  flock.vy[index] = Math.sin(heading) * speed;
  flock.phase[index] = Math.random() * Math.PI * 2;
  flock.size[index] = 5.2 + Math.random() * 3.2;
  flock.color[index] = pickBoidColor();
  flock.wander[index] = (Math.random() - 0.5) * 0.4;
  flock.trail[index * TRAIL_CAPACITY * 2] = x;
  flock.trail[index * TRAIL_CAPACITY * 2 + 1] = y;
  flock.trailStart[index] = 0;
  flock.trailLength[index] = 1;
}

export function resizeFlock(
  flock: Flock,
  count: number,
  width: number,
  height: number,
  settings: BoidsSettings,
) {
  if (count > flock.capacity) grow(flock, count);
  for (let index = flock.count; index < count; index += 1) {
    spawnBoid(flock, index, width, height, settings);
  }
  flock.count = count;
}

export function createFlock(
  count: number,
  width: number,
  height: number,
  settings: BoidsSettings,
) {
  const flock = allocate(Math.max(1, count));
  resizeFlock(flock, count, width, height, settings);
  return flock;
}

/** Placeholder flock for before the canvas has been measured. */
export const createEmptyFlock = () => allocate(1);

/** Keeps the flock in frame after the canvas changes size. */
export function scaleFlock(flock: Flock, scaleX: number, scaleY: number) {
  const { trail, trailLength, trailStart, x, y } = flock;
  for (let index = 0; index < flock.count; index += 1) {
    x[index] *= scaleX;
    y[index] *= scaleY;
    const base = index * TRAIL_CAPACITY * 2;
    for (let point = 0; point < trailLength[index]; point += 1) {
      const slot = base + (((trailStart[index] + point) % TRAIL_CAPACITY) << 1);
      trail[slot] *= scaleX;
      trail[slot + 1] *= scaleY;
    }
  }
}

export function scatterFlock(flock: Flock) {
  const { vx, vy } = flock;
  for (let index = 0; index < flock.count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = SCATTER_MIN_SPEED + Math.random() * SCATTER_SPEED_RANGE;
    vx[index] = Math.cos(angle) * speed;
    vy[index] = Math.sin(angle) * speed;
  }
}

export type FlockStep = {
  flock: Flock;
  /** Reflects boids off the canvas edges instead of wrapping them around it. */
  bounceEdges: boolean;
  /** Frame length in 60 Hz steps, from `getFrameScale`. */
  delta: number;
  grid: SpatialGrid;
  height: number;
  pointer: PointerState;
  settings: BoidsSettings;
  width: number;
};

/**
 * Advances the flock by one frame using spatial grid double-buffering for index-independent behavior.
 * Returns total neighbor count for performance metrics.
 */
export function stepFlock(step: FlockStep) {
  const { bounceEdges, delta, flock, grid, height, pointer, settings, width } =
    step;
  const count = flock.count;
  const { phase, trail, trailLength, trailStart, vx, vy, wander, x, y } = flock;

  // Cache settings in local variables for tight loop performance.
  const vision = settings.boidVision;
  const accuracy = settings.movementAccuracy;
  const maxSpeed = settings.maxSpeed;
  const minSpeed = settings.minSpeed;
  const steeringForce = settings.steeringForce;
  const alignmentForce = settings.alignmentForce;
  const cohesionForce = settings.cohesionForce;
  const separationForce = settings.separationForce;
  const perceptionSquared = vision * vision;
  const inverseVision = vision > 0 ? 1 / vision : 0;
  const separationRadius = getSeparationRadius(vision, separationForce);
  const separationRadiusSquared = separationRadius * separationRadius;
  const inverseSeparationRadius =
    separationRadius > 0 ? 1 / separationRadius : 0;
  // Bouncing has no seam to measure across, so no separation ever beats these.
  const halfWidth = bounceEdges ? Infinity : width / 2;
  const halfHeight = bounceEdges ? Infinity : height / 2;
  const wrapWidth = width + WRAP_MARGIN;
  const wrapHeight = height + WRAP_MARGIN;
  const minBounceX = Math.min(BOUNCE_MARGIN, width / 2);
  const minBounceY = Math.min(BOUNCE_MARGIN, height / 2);
  const maxBounceX = width - minBounceX;
  const maxBounceY = height - minBounceY;
  const pointerActive = pointer.active && pointer.pressed;
  const pointerDirection = pointer.mode === "attract" ? 1 : -1;

  grid.build(flock, width, height, vision);
  const { cellOfBoid, cellStart, columns, rows, sorted } = grid;
  const columnOffsets = wrapOffsets(columns);
  const rowOffsets = wrapOffsets(rows);
  const columnSpan = columnOffsets.length;
  const rowSpan = rowOffsets.length;
  let totalNeighbors = 0;

  for (let index = 0; index < count; index += 1) {
    const boidX = x[index];
    const boidY = y[index];
    let boidVx = vx[index];
    let boidVy = vy[index];
    const cell = cellOfBoid[index];
    const column = cell % columns;
    const row = (cell - column) / columns;
    let alignmentX = 0;
    let alignmentY = 0;
    let cohesionX = 0;
    let cohesionY = 0;
    let separationX = 0;
    let separationY = 0;
    let neighbors = 0;
    let neighborWeight = 0;
    let separationNeighbors = 0;

    neighborSearch: for (let r = 0; r < rowSpan; r += 1) {
      const offsetRow = row + rowOffsets[r];
      // Off-grid cells only hold neighbors when the world wraps onto itself.
      if (bounceEdges && (offsetRow < 0 || offsetRow >= rows)) continue;
      const rowBase = ((offsetRow + rows) % rows) * columns;
      for (let c = 0; c < columnSpan; c += 1) {
        const offsetColumn = column + columnOffsets[c];
        if (bounceEdges && (offsetColumn < 0 || offsetColumn >= columns))
          continue;
        const neighborCell = rowBase + ((offsetColumn + columns) % columns);
        const cellEnd = cellStart[neighborCell + 1] * SORTED_STRIDE;

        for (
          let slot = cellStart[neighborCell] * SORTED_STRIDE;
          slot < cellEnd;
          slot += SORTED_STRIDE
        ) {
          let dx = sorted[slot] - boidX;
          let dy = sorted[slot + 1] - boidY;

          // Measure across the wrap seam whenever that is the shorter way.
          if (dx > halfWidth) dx -= width;
          else if (dx < -halfWidth) dx += width;
          if (dy > halfHeight) dy -= height;
          else if (dy < -halfHeight) dy += height;

          const distanceSquared = dx * dx + dy * dy;
          // A zero distance is the boid meeting itself in its own cell.
          if (distanceSquared === 0 || distanceSquared > perceptionSquared) {
            continue;
          }

          const distance = Math.sqrt(distanceSquared);
          const visionWeight = Math.max(
            MINIMUM_VISION_WEIGHT,
            1 - distance * inverseVision,
          );
          alignmentX += sorted[slot + 2] * visionWeight;
          alignmentY += sorted[slot + 3] * visionWeight;
          cohesionX += dx * visionWeight;
          cohesionY += dy * visionWeight;
          neighborWeight += visionWeight;

          if (distanceSquared < separationRadiusSquared) {
            const proximity = 1 - distance * inverseSeparationRadius;
            const separationWeight = (proximity * proximity) / distance;
            separationX -= dx * separationWeight;
            separationY -= dy * separationWeight;
            separationNeighbors += 1;
          }

          neighbors += 1;
          if (neighbors >= accuracy) break neighborSearch;
        }
      }
    }

    totalNeighbors += neighbors;
    const nextWander = Math.max(
      -WANDER_LIMIT,
      Math.min(
        WANDER_LIMIT,
        wander[index] + (Math.random() - 0.5) * WANDER_JITTER,
      ),
    );
    wander[index] = nextWander;
    const wanderHeading = Math.atan2(boidVy, boidVx) + nextWander;
    let accelerationX = Math.cos(wanderHeading) * steeringForce * WANDER_WEIGHT;
    let accelerationY = Math.sin(wanderHeading) * steeringForce * WANDER_WEIGHT;

    if (neighbors > 0 && neighborWeight > 0) {
      const inverseWeight = 1 / neighborWeight;
      steerToward(
        alignmentX * inverseWeight,
        alignmentY * inverseWeight,
        boidVx,
        boidVy,
        maxSpeed,
        steeringForce,
        alignment,
      );
      steerToward(
        cohesionX * inverseWeight,
        cohesionY * inverseWeight,
        boidVx,
        boidVy,
        maxSpeed,
        steeringForce,
        cohesion,
      );
      if (separationNeighbors > 0) {
        steerToward(
          separationX,
          separationY,
          boidVx,
          boidVy,
          maxSpeed,
          steeringForce,
          separation,
        );
      } else {
        separation.x = 0;
        separation.y = 0;
      }

      accelerationX +=
        alignment.x * alignmentForce +
        cohesion.x * cohesionForce +
        separation.x * separationForce;
      accelerationY +=
        alignment.y * alignmentForce +
        cohesion.y * cohesionForce +
        separation.y * separationForce;
    }

    if (pointerActive) {
      const dx = pointer.x - boidX;
      const dy = pointer.y - boidY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 1 && distance < POINTER_RADIUS) {
        const influence =
          ((1 - distance / POINTER_RADIUS) * POINTER_STRENGTH) / distance;
        accelerationX += dx * influence * pointerDirection;
        accelerationY += dy * influence * pointerDirection;
      }
    }

    boidVx = (boidVx + accelerationX * delta) * VELOCITY_RETENTION;
    boidVy = (boidVy + accelerationY * delta) * VELOCITY_RETENTION;
    clampSpeed(boidVx, boidVy, minSpeed, maxSpeed, phase[index], velocity);
    boidVx = velocity.x;
    boidVy = velocity.y;

    let nextX = boidX + boidVx * delta;
    let nextY = boidY + boidVy * delta;
    let wrapped = false;
    if (bounceEdges) {
      // Reflect back across the wall it overshot, clamped for a step wider than the canvas.
      if (nextX < minBounceX) {
        nextX = Math.min(maxBounceX, minBounceX + (minBounceX - nextX));
        boidVx = -boidVx;
      } else if (nextX > maxBounceX) {
        nextX = Math.max(minBounceX, maxBounceX - (nextX - maxBounceX));
        boidVx = -boidVx;
      }
      if (nextY < minBounceY) {
        nextY = Math.min(maxBounceY, minBounceY + (minBounceY - nextY));
        boidVy = -boidVy;
      } else if (nextY > maxBounceY) {
        nextY = Math.max(minBounceY, maxBounceY - (nextY - maxBounceY));
        boidVy = -boidVy;
      }
    } else {
      if (nextX < -WRAP_MARGIN) {
        nextX = wrapWidth;
        wrapped = true;
      } else if (nextX > wrapWidth) {
        nextX = -WRAP_MARGIN;
        wrapped = true;
      }
      if (nextY < -WRAP_MARGIN) {
        nextY = wrapHeight;
        wrapped = true;
      } else if (nextY > wrapHeight) {
        nextY = -WRAP_MARGIN;
        wrapped = true;
      }
    }
    vx[index] = boidVx;
    vy[index] = boidVy;
    x[index] = nextX;
    y[index] = nextY;

    // A wrapped boid drops its trail so no segment stretches across the seam.
    let start = wrapped ? 0 : trailStart[index];
    let length = wrapped ? 0 : trailLength[index];
    const base = index * TRAIL_CAPACITY * 2;
    const point = base + (((start + length) % TRAIL_CAPACITY) << 1);
    trail[point] = nextX;
    trail[point + 1] = nextY;
    if (length < TRAIL_CAPACITY) length += 1;
    else start = (start + 1) % TRAIL_CAPACITY;
    trailStart[index] = start;
    trailLength[index] = length;
  }

  return totalNeighbors;
}
