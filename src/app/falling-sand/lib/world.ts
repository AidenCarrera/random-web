import { Material } from "../types";

import { PALETTES, randomInt } from "./engine-config";

export type MaterialPredicate = (material: Material) => boolean;

export type WorldGrid = {
  width: number;
  height: number;
  cells: Uint8Array;
  life: Uint16Array;
  shade: Uint8Array;
};

/** Cell grid plus the primitives every simulation rule is built from. */
export class SandWorld {
  width: number;
  height: number;
  cells: Uint8Array;
  life: Uint16Array;
  shade: Uint8Array;
  updated: Uint32Array;
  frame = 1;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    const length = width * height;
    this.cells = new Uint8Array(length);
    this.life = new Uint16Array(length);
    this.shade = new Uint8Array(length);
    this.updated = new Uint32Array(length);
  }

  index(x: number, y: number) {
    return y * this.width + x;
  }

  inBounds(x: number, y: number) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /** Material at a coordinate, treating everything off-grid as empty space. */
  materialAt(x: number, y: number): Material {
    return this.inBounds(x, y)
      ? (this.cells[this.index(x, y)] as Material)
      : Material.EMPTY;
  }

  assign(index: number, material: Material, life = 0) {
    this.cells[index] = material;
    this.life[index] = life;
    this.shade[index] = randomInt(PALETTES[material].length);
  }

  erase(index: number) {
    this.cells[index] = Material.EMPTY;
    this.life[index] = 0;
    this.shade[index] = 0;
  }

  /** Consumes a cell's turn so it is skipped for the rest of the frame. */
  touch(index: number) {
    this.updated[index] = this.frame;
  }

  /** Assigns a cell and consumes its turn. */
  convert(index: number, material: Material, life = 0) {
    this.assign(index, material, life);
    this.updated[index] = this.frame;
  }

  swap(first: number, second: number) {
    const firstCell = this.cells[first];
    const firstLife = this.life[first];
    const firstShade = this.shade[first];
    this.cells[first] = this.cells[second];
    this.life[first] = this.life[second];
    this.shade[first] = this.shade[second];
    this.cells[second] = firstCell;
    this.life[second] = firstLife;
    this.shade[second] = firstShade;
    this.updated[first] = this.frame;
    this.updated[second] = this.frame;
  }

  move(first: number, second: number) {
    this.cells[second] = this.cells[first];
    this.life[second] = this.life[first];
    this.shade[second] = this.shade[first];
    this.erase(first);
    this.updated[first] = this.frame;
    this.updated[second] = this.frame;
  }

  neighbors(x: number, y: number) {
    const result: number[] = [];
    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        if (offsetX === 0 && offsetY === 0) continue;
        const targetX = x + offsetX;
        const targetY = y + offsetY;
        if (this.inBounds(targetX, targetY)) {
          result.push(this.index(targetX, targetY));
        }
      }
    }
    return result;
  }

  hasNeighbor(around: readonly number[], predicate: MaterialPredicate) {
    return around.some((neighbor) =>
      predicate(this.cells[neighbor] as Material),
    );
  }

  findNeighbor(around: readonly number[], predicate: MaterialPredicate) {
    return around.find((neighbor) =>
      predicate(this.cells[neighbor] as Material),
    );
  }

  findNeighborOf(around: readonly number[], material: Material) {
    return around.find((neighbor) => this.cells[neighbor] === material);
  }

  /** First cell of a material inside a square area centred on a coordinate. */
  findNearby(
    centerX: number,
    centerY: number,
    radius: number,
    material: Material,
  ) {
    for (let y = centerY - radius; y <= centerY + radius; y += 1) {
      for (let x = centerX - radius; x <= centerX + radius; x += 1) {
        if (!this.inBounds(x, y)) continue;
        const index = this.index(x, y);
        if (this.cells[index] === material) return index;
      }
    }
    return undefined;
  }

  beginFrame() {
    this.frame += 1;
    if (this.frame === 0xffffffff) {
      this.updated.fill(0);
      this.frame = 1;
    }
  }

  clear() {
    this.cells.fill(Material.EMPTY);
    this.life.fill(0);
    this.shade.fill(0);
  }

  /** Rescales the grid, sampling the previous contents into the new one. */
  resize(width: number, height: number) {
    const nextCells = new Uint8Array(width * height);
    const nextLife = new Uint16Array(width * height);
    const nextShade = new Uint8Array(width * height);
    for (let y = 0; y < height; y += 1) {
      const sourceY = Math.min(
        this.height - 1,
        Math.floor((y / height) * this.height),
      );
      for (let x = 0; x < width; x += 1) {
        const sourceX = Math.min(
          this.width - 1,
          Math.floor((x / width) * this.width),
        );
        const source = this.index(sourceX, sourceY);
        const target = y * width + x;
        nextCells[target] = this.cells[source];
        nextLife[target] = this.life[source];
        nextShade[target] = this.shade[source];
      }
    }

    this.adopt({
      width,
      height,
      cells: nextCells,
      life: nextLife,
      shade: nextShade,
    });
  }

  adopt(grid: WorldGrid) {
    this.width = grid.width;
    this.height = grid.height;
    this.cells = grid.cells;
    this.life = grid.life;
    this.shade = grid.shade;
    this.updated = new Uint32Array(grid.width * grid.height);
  }
}
