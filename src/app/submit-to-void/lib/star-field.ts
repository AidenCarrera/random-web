import {
  BACKGROUND_RESIZE_DELAY_MS,
  BACKGROUND_STARS,
  MOBILE_MEDIA_QUERY,
  REDUCED_MOTION_MEDIA_QUERY,
  VOID_BACKGROUND,
} from "../config";
import type { Star } from "../types";
import { createBackgroundStars, drawStar } from "./stars";

/**
 * Runs the drifting background star field on `canvas` until the returned stop
 * function is called. Reduced motion renders a single static frame.
 */
export function startStarField(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return () => {};

  let raf = 0;
  let resizeTimer: number | undefined;
  let lastFrameTime = 0;
  let stars: Star[] = [];

  const preset = window.matchMedia(MOBILE_MEDIA_QUERY).matches
    ? BACKGROUND_STARS.mobile
    : BACKGROUND_STARS.desktop;
  const frameInterval = 1000 / preset.fps;

  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = createBackgroundStars(
      canvas.width,
      canvas.height,
      preset.total,
      preset.foreground,
    );
  };
  handleResize();

  const queueResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(handleResize, BACKGROUND_RESIZE_DELAY_MS);
  };
  window.addEventListener("resize", queueResize, { passive: true });

  const draw = (time: number) => {
    if (time - lastFrameTime < frameInterval) {
      raf = requestAnimationFrame(draw);
      return;
    }
    lastFrameTime = time;

    ctx.fillStyle = VOID_BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach((star) => {
      star.y += star.baseSpeed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }

      drawStar(ctx, star.x, star.y, star);
    });

    raf = requestAnimationFrame(draw);
  };

  if (window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches) {
    draw(frameInterval);
    cancelAnimationFrame(raf);
  } else {
    raf = requestAnimationFrame(draw);
  }

  return () => {
    window.removeEventListener("resize", queueResize);
    window.clearTimeout(resizeTimer);
    cancelAnimationFrame(raf);
  };
}
