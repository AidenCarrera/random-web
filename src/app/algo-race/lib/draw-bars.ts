import { VALUE_MAX } from "../config";

/**
 * Renders array bars to canvas. When element count exceeds horizontal pixels,
 * aggregates peak values per pixel column.
 */
export const drawBars = (
  canvas: HTMLCanvasElement,
  values: ArrayLike<number>,
  color: string,
) => {
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;

  const n = values.length;
  const slot = width / n;

  if (slot >= 3) {
    const gap = Math.max(1, Math.round(dpr));
    const barWidth = Math.max(1, Math.round(slot) - gap);
    for (let i = 0; i < n; i++) {
      const barHeight = (values[i] / VALUE_MAX) * height;
      ctx.fillRect(
        Math.round(i * slot),
        height - barHeight,
        barWidth,
        barHeight,
      );
    }
  } else {
    for (let x = 0; x < width; x++) {
      const from = Math.floor((x * n) / width);
      const to = Math.max(from + 1, Math.floor(((x + 1) * n) / width));
      let peak = 0;
      for (let i = from; i < to && i < n; i++) {
        if (values[i] > peak) peak = values[i];
      }
      const barHeight = (peak / VALUE_MAX) * height;
      ctx.fillRect(x, height - barHeight, 1, barHeight);
    }
  }

  ctx.globalAlpha = 1;
};
