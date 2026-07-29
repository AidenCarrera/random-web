import { DEFAULT_COLOR } from "../constants";
import type { PixelGrid } from "../types";

/**
 * Grid operations return `null` when nothing changed so callers can keep the
 * previous array and skip a render.
 */

export const createEmptyGrid = (size: number): PixelGrid =>
  Array<string>(size * size).fill(DEFAULT_COLOR);

export const isDefaultColor = (color: string) =>
  color.toLowerCase() === DEFAULT_COLOR.toLowerCase();

export const gridsEqual = (a: PixelGrid, b: PixelGrid) =>
  a.length === b.length && a.every((color, index) => color === b[index]);

export function paintCell(
  grid: PixelGrid,
  index: number,
  color: string,
): PixelGrid | null {
  if (grid[index] === color) {
    return null;
  }

  const next = [...grid];
  next[index] = color;

  return next;
}

/**
 * Bresenham line between two cells, so a fast drag does not leave gaps between
 * the positions the pointer was actually sampled at.
 */
export function paintLine(
  grid: PixelGrid,
  size: number,
  fromIndex: number,
  toIndex: number,
  color: string,
): PixelGrid | null {
  let x = fromIndex % size;
  let y = Math.floor(fromIndex / size);
  const endX = toIndex % size;
  const endY = Math.floor(toIndex / size);
  const deltaX = Math.abs(endX - x);
  const deltaY = Math.abs(endY - y);
  const stepX = x < endX ? 1 : -1;
  const stepY = y < endY ? 1 : -1;
  let error = deltaX - deltaY;
  let next: PixelGrid | null = null;

  for (;;) {
    const index = y * size + x;
    if (grid[index] !== color) {
      next ??= [...grid];
      next[index] = color;
    }

    if (x === endX && y === endY) {
      return next;
    }

    const doubleError = error * 2;
    if (doubleError > -deltaY) {
      error -= deltaY;
      x += stepX;
    }
    if (doubleError < deltaX) {
      error += deltaX;
      y += stepY;
    }
  }
}

/** Four-way flood fill of the region of matching cells around `startIndex`. */
export function floodFill(
  grid: PixelGrid,
  size: number,
  startIndex: number,
  color: string,
): PixelGrid | null {
  const targetColor = grid[startIndex];
  if (targetColor === color) {
    return null;
  }

  const next = [...grid];
  const queue = [startIndex];
  const queued = new Set(queue);

  const enqueue = (index: number) => {
    if (queued.has(index) || next[index] !== targetColor) {
      return;
    }

    queued.add(index);
    queue.push(index);
  };

  // Walks the queue with a cursor rather than shift() to stay linear.
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const index = queue[cursor];
    next[index] = color;

    const x = index % size;
    const y = Math.floor(index / size);

    if (x > 0) enqueue(index - 1);
    if (x < size - 1) enqueue(index + 1);
    if (y > 0) enqueue(index - size);
    if (y < size - 1) enqueue(index + size);
  }

  return next;
}
