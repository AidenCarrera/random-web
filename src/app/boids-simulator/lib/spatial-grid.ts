import type { Flock } from "../types";

/** Floats per boid in `SpatialGrid.sorted`: x, y, vx, vy. */
export const SORTED_STRIDE = 4;

/**
 * Spatial grid that partitions boids into vision-sized cells via counting sort.
 * Interleaves positions and velocities in cell order for cache-friendly neighbor scans.
 */
export class SpatialGrid {
  columns = 1;
  rows = 1;
  /** First slot of each cell, plus a trailing total. */
  cellStart = new Int32Array(2);
  /** Cell each boid landed in, reused by the neighbor scan. */
  cellOfBoid = new Int32Array(0);
  /** Interleaved [x, y, vx, vy] data in cell order for single cache-line access per boid. */
  sorted = new Float32Array(0);
  /** Per-cell counter, reused as the write cursor while filling buckets. */
  private cursor = new Int32Array(1);

  private reserve(count: number, cells: number) {
    if (this.cursor.length < cells) {
      this.cursor = new Int32Array(cells);
      this.cellStart = new Int32Array(cells + 1);
    } else {
      this.cursor.fill(0, 0, cells);
    }
    if (this.cellOfBoid.length < count) {
      this.cellOfBoid = new Int32Array(count);
      this.sorted = new Float32Array(count * SORTED_STRIDE);
    }
  }

  build(flock: Flock, width: number, height: number, cellSize: number) {
    const count = flock.count;
    const columns = Math.max(1, Math.floor(width / cellSize));
    const rows = Math.max(1, Math.floor(height / cellSize));
    const cells = columns * rows;
    const columnsPerPixel = columns / width;
    const rowsPerPixel = rows / height;
    this.columns = columns;
    this.rows = rows;
    this.reserve(count, cells);

    const { cellOfBoid, cellStart, cursor, sorted } = this;
    const { vx, vy, x, y } = flock;

    for (let index = 0; index < count; index += 1) {
      // Positions wrap, so a boid outside the canvas still maps onto a cell.
      const normalizedX = x[index] - Math.floor(x[index] / width) * width;
      const normalizedY = y[index] - Math.floor(y[index] / height) * height;
      const column = Math.min(columns - 1, (normalizedX * columnsPerPixel) | 0);
      const row = Math.min(rows - 1, (normalizedY * rowsPerPixel) | 0);
      const cell = row * columns + column;
      cellOfBoid[index] = cell;
      cursor[cell] += 1;
    }

    // Compute cell offsets via prefix sum before populating buckets.
    let offset = 0;
    for (let cell = 0; cell < cells; cell += 1) {
      const total = cursor[cell];
      cellStart[cell] = offset;
      cursor[cell] = offset;
      offset += total;
    }
    cellStart[cells] = offset;

    for (let index = 0; index < count; index += 1) {
      const cell = cellOfBoid[index];
      const slot = cursor[cell];
      cursor[cell] = slot + 1;
      const target = slot * SORTED_STRIDE;
      sorted[target] = x[index];
      sorted[target + 1] = y[index];
      sorted[target + 2] = vx[index];
      sorted[target + 3] = vy[index];
    }
  }
}
