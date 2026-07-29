import { DEFAULT_COLOR, PREVIEW_MAX_SIZE } from "../constants";
import type { PixelGrid } from "../types";
import { isDefaultColor } from "./pixel-grid";

export const createFileName = (size: number) => `pixel-art-${size}x${size}.png`;

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  return context ? { canvas, context } : null;
}

function paintGrid(
  context: CanvasRenderingContext2D,
  grid: PixelGrid,
  size: number,
  scale: number,
  includeBackground: boolean,
) {
  if (includeBackground) {
    context.fillStyle = DEFAULT_COLOR;
    context.fillRect(0, 0, size * scale, size * scale);
  }

  for (let index = 0; index < grid.length; index += 1) {
    const color = grid[index];
    // Untouched and white cells are left unpainted so the PNG keeps them transparent.
    if (
      !includeBackground &&
      (color.toLowerCase() === "#ffffff" || isDefaultColor(color))
    ) {
      continue;
    }

    context.fillStyle = color;
    context.fillRect(
      (index % size) * scale,
      Math.floor(index / size) * scale,
      scale,
      scale,
    );
  }
}

/** One canvas pixel per cell, with a transparent background — this is the download. */
export function createExportCanvas(grid: PixelGrid, size: number) {
  const target = createCanvas(size, size);
  if (!target) {
    return null;
  }

  paintGrid(target.context, grid, size, 1, false);

  return target.canvas;
}

/** Upscaled opaque copy, large enough to stay crisp in the preview modal. */
export function createPreviewCanvas(grid: PixelGrid, size: number) {
  const scale = Math.max(1, Math.floor(PREVIEW_MAX_SIZE / size));
  const target = createCanvas(size * scale, size * scale);
  if (!target) {
    return null;
  }

  target.context.imageSmoothingEnabled = false;
  paintGrid(target.context, grid, size, scale, true);

  return target.canvas;
}
