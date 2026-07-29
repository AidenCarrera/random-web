import { BASE_FRAME_DURATION, MAX_SEPARATION_FORCE } from "../constants";
import type { Boid, BoidsSettings, PointerState } from "../types";
import { createBoidColors } from "./palette";
import type { SpatialGrid } from "./spatial-grid";
import { clampSpeed, createVector, steerToward } from "./steering";

/** Trail points kept per boid; sizes the ring buffer on every boid. */
export const TRAIL_CAPACITY = 10;

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
const SCATTER_MIN_SPEED = 3;
const SCATTER_SPEED_RANGE = 4;

/**
 * Neighbor cell offsets per axis. Grids narrower than three cells wrap onto
 * themselves, so duplicate offsets are dropped in first-visited order.
 */
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

function createBoid(width: number, height: number, settings: BoidsSettings) {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.min(width, height) * (0.08 + Math.random() * 0.28);
  const x = width / 2 + Math.cos(angle) * radius;
  const y = height / 2 + Math.sin(angle) * radius;
  const heading = angle + Math.PI / 2 + (Math.random() - 0.5) * 1.4;
  const speed =
    settings.minSpeed +
    Math.random() * Math.max(0, settings.maxSpeed - settings.minSpeed);
  const trail = new Float32Array(TRAIL_CAPACITY * 2);
  trail[0] = x;
  trail[1] = y;

  const boid: Boid = {
    x,
    y,
    vx: Math.cos(heading) * speed,
    vy: Math.sin(heading) * speed,
    phase: Math.random() * Math.PI * 2,
    size: 5.2 + Math.random() * 3.2,
    ...createBoidColors(),
    wander: (Math.random() - 0.5) * 0.4,
    trail,
    trailStart: 0,
    trailLength: 1,
  };
  return boid;
}

/** Grows or trims the flock in place so it matches `count`. */
export function resizeFlock(
  boids: Boid[],
  count: number,
  width: number,
  height: number,
  settings: BoidsSettings,
) {
  while (boids.length < count) {
    boids.push(createBoid(width, height, settings));
  }
  if (boids.length > count) boids.length = count;
}

export function createFlock(
  count: number,
  width: number,
  height: number,
  settings: BoidsSettings,
) {
  const boids: Boid[] = [];
  resizeFlock(boids, count, width, height, settings);
  return boids;
}

/** Keeps the flock in frame after the canvas changes size. */
export function scaleFlock(boids: Boid[], scaleX: number, scaleY: number) {
  for (const boid of boids) {
    boid.x *= scaleX;
    boid.y *= scaleY;
    for (let point = 0; point < boid.trailLength; point += 1) {
      const slot = ((boid.trailStart + point) % TRAIL_CAPACITY) * 2;
      boid.trail[slot] *= scaleX;
      boid.trail[slot + 1] *= scaleY;
    }
  }
}

/** Fires every boid off in a random direction. */
export function scatterFlock(boids: Boid[]) {
  for (const boid of boids) {
    const angle = Math.random() * Math.PI * 2;
    const speed = SCATTER_MIN_SPEED + Math.random() * SCATTER_SPEED_RANGE;
    boid.vx = Math.cos(angle) * speed;
    boid.vy = Math.sin(angle) * speed;
  }
}

function pushTrailPoint(boid: Boid) {
  const slot = (boid.trailStart + boid.trailLength) % TRAIL_CAPACITY;
  boid.trail[slot * 2] = boid.x;
  boid.trail[slot * 2 + 1] = boid.y;
  if (boid.trailLength < TRAIL_CAPACITY) boid.trailLength += 1;
  else boid.trailStart = (boid.trailStart + 1) % TRAIL_CAPACITY;
}

/** Wraps a boid around the canvas edges, reporting whether it jumped. */
function wrapBoid(boid: Boid, width: number, height: number) {
  let wrapped = false;
  if (boid.x < -WRAP_MARGIN) {
    boid.x = width + WRAP_MARGIN;
    wrapped = true;
  }
  if (boid.x > width + WRAP_MARGIN) {
    boid.x = -WRAP_MARGIN;
    wrapped = true;
  }
  if (boid.y < -WRAP_MARGIN) {
    boid.y = height + WRAP_MARGIN;
    wrapped = true;
  }
  if (boid.y > height + WRAP_MARGIN) {
    boid.y = -WRAP_MARGIN;
    wrapped = true;
  }
  return wrapped;
}

export type FlockStep = {
  boids: Boid[];
  /** Frame length in 60 Hz steps, from `getFrameScale`. */
  delta: number;
  grid: SpatialGrid;
  height: number;
  pointer: PointerState;
  settings: BoidsSettings;
  width: number;
};

/**
 * Advances the flock by one frame and returns how many neighbors were seen in
 * total, which the canvas averages into its metrics readout.
 */
export function stepFlock({
  boids,
  delta,
  grid,
  height,
  pointer,
  settings,
  width,
}: FlockStep) {
  const perceptionSquared = settings.boidVision ** 2;
  const separationRadius = getSeparationRadius(
    settings.boidVision,
    settings.separationForce,
  );
  const separationRadiusSquared = separationRadius ** 2;

  grid.build(boids, width, height, settings.boidVision);
  const { cellOfBoid, cellStart, columns, entries, rows } = grid;
  const columnOffsets = wrapOffsets(columns);
  const rowOffsets = wrapOffsets(rows);
  let totalNeighbors = 0;

  for (let index = 0; index < boids.length; index += 1) {
    const boid = boids[index];
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

    neighborSearch: for (let r = 0; r < rowOffsets.length; r += 1) {
      const neighborRow = (row + rowOffsets[r] + rows) % rows;
      for (let c = 0; c < columnOffsets.length; c += 1) {
        const neighborColumn = (column + columnOffsets[c] + columns) % columns;
        const neighborCell = neighborRow * columns + neighborColumn;
        const cellEnd = cellStart[neighborCell + 1];

        for (let slot = cellStart[neighborCell]; slot < cellEnd; slot += 1) {
          const otherIndex = entries[slot];
          if (otherIndex === index) continue;
          const other = boids[otherIndex];
          let dx = other.x - boid.x;
          let dy = other.y - boid.y;

          // Measure across the wrap seam whenever that is the shorter way.
          if (Math.abs(dx) > width / 2) dx -= Math.sign(dx) * width;
          if (Math.abs(dy) > height / 2) dy -= Math.sign(dy) * height;

          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared === 0 || distanceSquared > perceptionSquared) {
            continue;
          }

          const distance = Math.sqrt(distanceSquared);
          const visionWeight = Math.max(
            MINIMUM_VISION_WEIGHT,
            1 - distance / settings.boidVision,
          );
          alignmentX += other.vx * visionWeight;
          alignmentY += other.vy * visionWeight;
          cohesionX += dx * visionWeight;
          cohesionY += dy * visionWeight;
          neighborWeight += visionWeight;

          if (
            separationRadius > 0 &&
            distanceSquared < separationRadiusSquared
          ) {
            const proximity = 1 - distance / separationRadius;
            const separationWeight = proximity * proximity;
            separationX -= (dx / distance) * separationWeight;
            separationY -= (dy / distance) * separationWeight;
            separationNeighbors += 1;
          }

          neighbors += 1;
          if (neighbors >= settings.movementAccuracy) break neighborSearch;
        }
      }
    }

    totalNeighbors += neighbors;
    boid.wander = Math.max(
      -WANDER_LIMIT,
      Math.min(
        WANDER_LIMIT,
        boid.wander + (Math.random() - 0.5) * WANDER_JITTER,
      ),
    );
    const wanderHeading = Math.atan2(boid.vy, boid.vx) + boid.wander;
    let accelerationX =
      Math.cos(wanderHeading) * settings.steeringForce * WANDER_WEIGHT;
    let accelerationY =
      Math.sin(wanderHeading) * settings.steeringForce * WANDER_WEIGHT;

    if (neighbors > 0 && neighborWeight > 0) {
      steerToward(
        alignmentX / neighborWeight,
        alignmentY / neighborWeight,
        boid.vx,
        boid.vy,
        settings.maxSpeed,
        settings.steeringForce,
        alignment,
      );
      steerToward(
        cohesionX / neighborWeight,
        cohesionY / neighborWeight,
        boid.vx,
        boid.vy,
        settings.maxSpeed,
        settings.steeringForce,
        cohesion,
      );
      if (separationNeighbors > 0) {
        steerToward(
          separationX,
          separationY,
          boid.vx,
          boid.vy,
          settings.maxSpeed,
          settings.steeringForce,
          separation,
        );
      } else {
        separation.x = 0;
        separation.y = 0;
      }

      accelerationX +=
        alignment.x * settings.alignmentForce +
        cohesion.x * settings.cohesionForce +
        separation.x * settings.separationForce;
      accelerationY +=
        alignment.y * settings.alignmentForce +
        cohesion.y * settings.cohesionForce +
        separation.y * settings.separationForce;
    }

    if (pointer.active && pointer.pressed) {
      const dx = pointer.x - boid.x;
      const dy = pointer.y - boid.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 1 && distance < POINTER_RADIUS) {
        const direction = pointer.mode === "attract" ? 1 : -1;
        const influence = (1 - distance / POINTER_RADIUS) * POINTER_STRENGTH;
        accelerationX += (dx / distance) * influence * direction;
        accelerationY += (dy / distance) * influence * direction;
      }
    }

    boid.vx = (boid.vx + accelerationX * delta) * VELOCITY_RETENTION;
    boid.vy = (boid.vy + accelerationY * delta) * VELOCITY_RETENTION;
    clampSpeed(
      boid.vx,
      boid.vy,
      settings.minSpeed,
      settings.maxSpeed,
      boid.phase,
      velocity,
    );
    boid.vx = velocity.x;
    boid.vy = velocity.y;
    boid.x += boid.vx * delta;
    boid.y += boid.vy * delta;

    if (wrapBoid(boid, width, height)) {
      boid.trailStart = 0;
      boid.trailLength = 0;
    }
    pushTrailPoint(boid);
  }

  return totalNeighbors;
}
