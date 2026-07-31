import type { FlockRenderer } from "../types";
import { TRAIL_CAPACITY } from "./flock";
import { BODY_SHAPE, TRAIL_WIDTH } from "./geometry";
import { BACKGROUND, BODY_STYLES, TRAIL_STYLES } from "./palette";

const [TIP, LEFT, NOTCH, RIGHT] = BODY_SHAPE;

// With trails on, the canvas itself carries the long history, so only the freshest
// points are restroked as a bright head.
const TRAIL_HEAD_POINTS = 8;

// Background painted over the previous frame per 60 Hz step, standing in for the WebGL
// phosphor buffer. 8-bit rounding stalls the fade a couple of counts short of the
// background, which is invisible against a dark backdrop.
const PHOSPHOR_FADE = 0.14;

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

  // Veils the previous frame instead of erasing it, leaving a long exposure behind.
  const fade = (delta: number) => {
    if (delta <= 0) return;
    context.globalAlpha = 1 - Math.pow(1 - PHOSPHOR_FADE, delta);
    context.fillStyle = BACKGROUND;
    context.fillRect(0, 0, viewWidth, viewHeight);
    context.globalAlpha = 1;
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

    draw(flock, trails, delta) {
      if (trails) fade(delta);
      else clear();
      const { color, size, trail, trailLength, trailStart, vx, vy, x, y } =
        flock;
      context.lineCap = "round";
      context.lineJoin = "round";

      /** Strokes trail points `first` through `length` of the boid based at `base`. */
      const strokeTrail = (
        base: number,
        start: number,
        first: number,
        length: number,
      ) => {
        context.beginPath();
        for (let point = first; point < length; point += 1) {
          const slot = base + (((start + point) % TRAIL_CAPACITY) << 1);
          if (point === first) context.moveTo(trail[slot], trail[slot + 1]);
          else context.lineTo(trail[slot], trail[slot + 1]);
        }
        context.stroke();
      };

      for (let index = 0; index < flock.count; index += 1) {
        const boidX = x[index];
        const boidY = y[index];
        const length = trailLength[index];

        if (trails && length > 1) {
          const base = index * TRAIL_CAPACITY * 2;
          const start = trailStart[index];
          const head = Math.max(0, length - TRAIL_HEAD_POINTS);

          if (length - head > 1) {
            context.strokeStyle = TRAIL_STYLES[color[index]];
            context.lineWidth = TRAIL_WIDTH;
            strokeTrail(base, start, head, length);
          }
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
