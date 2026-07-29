import type { FlockRenderer } from "../types";
import { TRAIL_CAPACITY } from "./flock";
import { BODY_SHAPE, TRAIL_WIDTH } from "./geometry";
import { BACKGROUND, BODY_STYLES, TRAIL_STYLES } from "./palette";

const [TIP, LEFT, NOTCH, RIGHT] = BODY_SHAPE;

/** 2D canvas fallback. Rotates arrowheads via complex multiplication to bypass canvas state stack overhead. */
export function createCanvasFlockRenderer(
  canvas: HTMLCanvasElement,
): FlockRenderer | null {
  const context = canvas.getContext("2d", {
    alpha: false,
    desynchronized: true,
  });
  if (!context) return null;

  let viewWidth = 1;
  let viewHeight = 1;

  const clear = () => {
    context.fillStyle = BACKGROUND;
    context.fillRect(0, 0, viewWidth, viewHeight);
  };

  return {
    resize(width, height, ratio) {
      viewWidth = width;
      viewHeight = height;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      clear();
    },

    draw(flock, trails) {
      clear();
      const { color, size, trail, trailLength, trailStart, vx, vy, x, y } =
        flock;
      context.lineWidth = TRAIL_WIDTH;

      for (let index = 0; index < flock.count; index += 1) {
        const boidX = x[index];
        const boidY = y[index];
        const length = trailLength[index];

        if (trails && length > 1) {
          const base = index * TRAIL_CAPACITY * 2;
          const start = trailStart[index];
          context.strokeStyle = TRAIL_STYLES[color[index]];
          context.beginPath();
          for (let point = 0; point < length; point += 1) {
            const slot = base + (((start + point) % TRAIL_CAPACITY) << 1);
            if (point === 0) context.moveTo(trail[slot], trail[slot + 1]);
            else context.lineTo(trail[slot], trail[slot + 1]);
          }
          context.stroke();
        }

        // Unit heading, so the rotation below is a plain complex multiply.
        const speed = Math.sqrt(vx[index] * vx[index] + vy[index] * vy[index]);
        const cos = speed > 0 ? vx[index] / speed : 1;
        const sin = speed > 0 ? vy[index] / speed : 0;
        const scale = size[index];
        const scaledCos = cos * scale;
        const scaledSin = sin * scale;

        context.beginPath();
        context.moveTo(
          boidX + TIP[0] * scaledCos - TIP[1] * scaledSin,
          boidY + TIP[0] * scaledSin + TIP[1] * scaledCos,
        );
        context.lineTo(
          boidX + LEFT[0] * scaledCos - LEFT[1] * scaledSin,
          boidY + LEFT[0] * scaledSin + LEFT[1] * scaledCos,
        );
        context.lineTo(
          boidX + NOTCH[0] * scaledCos - NOTCH[1] * scaledSin,
          boidY + NOTCH[0] * scaledSin + NOTCH[1] * scaledCos,
        );
        context.lineTo(
          boidX + RIGHT[0] * scaledCos - RIGHT[1] * scaledSin,
          boidY + RIGHT[0] * scaledSin + RIGHT[1] * scaledCos,
        );
        context.closePath();
        context.fillStyle = BODY_STYLES[color[index]];
        context.fill();
      }
    },

    dispose() {},
  };
}
