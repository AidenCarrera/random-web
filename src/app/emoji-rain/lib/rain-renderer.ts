import { EMOJI_SIZE } from "../config";
import type { Drop } from "../types";
import { getEmojiCanvas } from "./emoji-canvas";

export type RainSettings = {
  /** Drops spawned per frame; fractional values spawn probabilistically. */
  intensity: number;
  speed: number;
  pools: readonly (readonly string[])[];
};

/**
 * Runs the falling emoji animation on `canvas` until the returned stop function
 * is called. Settings are read per frame so changes apply without a restart.
 */
export function startRain(
  canvas: HTMLCanvasElement,
  getSettings: () => RainSettings,
) {
  const context = canvas.getContext("2d");
  if (!context) return () => {};

  let frameId = 0;
  let resizeFrame: number | null = null;
  let drops: Drop[] = [];
  let nextDrops: Drop[] = [];
  const recycled: Drop[] = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const scheduleResize = () => {
    if (resizeFrame !== null) return;
    resizeFrame = requestAnimationFrame(() => {
      resize();
      resizeFrame = null;
    });
  };

  const createDrop = (): Drop => {
    const pools = getSettings().pools;
    const pool = pools[Math.floor(Math.random() * pools.length)];
    const emoji = pool[Math.floor(Math.random() * pool.length)];
    const drop = recycled.pop() ?? { x: 0, y: 0, speed: 0, emoji };

    drop.x = Math.random() * canvas.width;
    drop.y = -EMOJI_SIZE;
    drop.speed = Math.random() * 4 + 2;
    drop.emoji = emoji;
    return drop;
  };

  const draw = () => {
    const { intensity: rate, speed: multiplier } = getSettings();
    context.clearRect(0, 0, canvas.width, canvas.height);
    nextDrops.length = 0;

    // Fractional rates spawn one extra drop probabilistically.
    const spawnCount = Math.floor(rate) + (Math.random() < rate % 1 ? 1 : 0);
    for (let i = 0; i < spawnCount; i++) nextDrops.push(createDrop());

    for (const drop of drops) {
      drop.y += drop.speed * multiplier;
      const emojiCanvas = getEmojiCanvas(drop.emoji);
      if (emojiCanvas) {
        context.drawImage(
          emojiCanvas,
          drop.x - EMOJI_SIZE / 2,
          drop.y - EMOJI_SIZE / 2,
        );
      }

      if (drop.y <= canvas.height + EMOJI_SIZE) nextDrops.push(drop);
      else recycled.push(drop);
    }

    [drops, nextDrops] = [nextDrops, drops];
    frameId = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", scheduleResize);
  draw();

  return () => {
    cancelAnimationFrame(frameId);
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    window.removeEventListener("resize", scheduleResize);
  };
}
