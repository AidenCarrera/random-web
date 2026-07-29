import type { Boid } from "../types";
import { TRAIL_CAPACITY } from "./flock";
import { BACKGROUND } from "./palette";

const TRAIL_WIDTH = 0.9;

export function paintBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, width, height);
}

/**
 * Draws each boid as an arrowhead pointing along its velocity, optionally
 * preceded by its recent path. Trails and bodies share one pass so a boid can
 * overlap the trail of the boid drawn before it.
 */
export function drawFlock(
  context: CanvasRenderingContext2D,
  boids: Boid[],
  trails: boolean,
) {
  for (const boid of boids) {
    if (trails && boid.trailLength > 1) {
      context.strokeStyle = boid.trailColor;
      context.lineWidth = TRAIL_WIDTH;
      context.beginPath();
      for (let point = 0; point < boid.trailLength; point += 1) {
        const slot = ((boid.trailStart + point) % TRAIL_CAPACITY) * 2;
        if (point === 0) context.moveTo(boid.trail[slot], boid.trail[slot + 1]);
        else context.lineTo(boid.trail[slot], boid.trail[slot + 1]);
      }
      context.stroke();
    }

    context.save();
    context.translate(boid.x, boid.y);
    context.rotate(Math.atan2(boid.vy, boid.vx));
    context.beginPath();
    context.moveTo(boid.size * 1.75, 0);
    context.lineTo(-boid.size, boid.size * 0.68);
    context.lineTo(-boid.size * 0.48, 0);
    context.lineTo(-boid.size, -boid.size * 0.68);
    context.closePath();
    context.fillStyle = boid.bodyColor;
    context.fill();
    context.restore();
  }
}
