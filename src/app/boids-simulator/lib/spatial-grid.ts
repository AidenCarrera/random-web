import type { Boid } from "../types";

/**
 * Buckets boids into vision-sized cells so a boid only tests the flock around
 * it instead of all of it. Buckets are counting-sorted into flat typed arrays
 * that are reused between frames, and boids stay in ascending index order
 * within a cell so neighbor scans are deterministic.
 */
export class SpatialGrid {
  columns = 1;
  rows = 1;
  /** First `entries` slot of each cell, plus a trailing total. */
  cellStart = new Int32Array(2);
  /** Boid indices grouped by cell. */
  entries = new Int32Array(0);
  /** Cell each boid landed in, reused by the neighbor scan. */
  cellOfBoid = new Int32Array(0);
  /** Per-cell counter, reused as the write cursor while filling buckets. */
  private cursor = new Int32Array(1);

  build(boids: Boid[], width: number, height: number, cellSize: number) {
    const columns = Math.max(1, Math.floor(width / cellSize));
    const rows = Math.max(1, Math.floor(height / cellSize));
    const cells = columns * rows;
    const cellWidth = width / columns;
    const cellHeight = height / rows;
    this.columns = columns;
    this.rows = rows;

    if (this.cursor.length < cells) {
      this.cursor = new Int32Array(cells);
      this.cellStart = new Int32Array(cells + 1);
    } else {
      this.cursor.fill(0, 0, cells);
    }
    if (this.entries.length < boids.length) {
      this.entries = new Int32Array(boids.length);
      this.cellOfBoid = new Int32Array(boids.length);
    }

    for (let index = 0; index < boids.length; index += 1) {
      const boid = boids[index];
      // Positions wrap, so a boid outside the canvas still maps onto a cell.
      const normalizedX = ((boid.x % width) + width) % width;
      const normalizedY = ((boid.y % height) + height) % height;
      const column = Math.min(columns - 1, Math.floor(normalizedX / cellWidth));
      const row = Math.min(rows - 1, Math.floor(normalizedY / cellHeight));
      const cell = row * columns + column;
      this.cellOfBoid[index] = cell;
      this.cursor[cell] += 1;
    }

    // Turn the counts into bucket offsets, then fill the buckets.
    let offset = 0;
    for (let cell = 0; cell < cells; cell += 1) {
      const count = this.cursor[cell];
      this.cellStart[cell] = offset;
      this.cursor[cell] = offset;
      offset += count;
    }
    this.cellStart[cells] = offset;

    for (let index = 0; index < boids.length; index += 1) {
      const cell = this.cellOfBoid[index];
      this.entries[this.cursor[cell]] = index;
      this.cursor[cell] += 1;
    }
  }
}
