import { Material } from "../types";

import {
  DEFAULT_LIQUID_SPREAD,
  LIQUID_DENSITY,
  LIQUID_SPREAD,
  isGas,
  isLiquid,
} from "./engine-config";
import type { SandWorld } from "./world";

const canPowderDisplace = (target: Material) =>
  target === Material.EMPTY || isGas(target) || isLiquid(target);

export function tryPowderMove(world: SandWorld, x: number, y: number) {
  const from = world.index(x, y);
  const direction = Math.random() < 0.5 ? -1 : 1;
  const targets = [
    [x, y + 1],
    [x + direction, y + 1],
    [x - direction, y + 1],
  ] as const;

  for (const [targetX, targetY] of targets) {
    if (!world.inBounds(targetX, targetY)) continue;
    const to = world.index(targetX, targetY);
    const target = world.cells[to] as Material;
    if (!canPowderDisplace(target)) continue;

    if (target === Material.EMPTY || isGas(target)) {
      world.move(from, to);
    } else {
      world.swap(from, to);
    }
    return true;
  }
  return false;
}

export function tryLiquidMove(
  world: SandWorld,
  x: number,
  y: number,
  material: Material,
) {
  const from = world.index(x, y);
  const density = LIQUID_DENSITY[material] ?? 0;
  const direction = Math.random() < 0.5 ? -1 : 1;
  const below = y + 1;

  for (const targetX of [x, x + direction, x - direction]) {
    if (!world.inBounds(targetX, below)) continue;
    const to = world.index(targetX, below);
    const target = world.cells[to] as Material;
    const targetDensity = LIQUID_DENSITY[target] ?? Number.POSITIVE_INFINITY;
    if (target === Material.EMPTY || isGas(target)) {
      world.move(from, to);
      return true;
    }
    if (isLiquid(target) && density > targetDensity) {
      world.swap(from, to);
      return true;
    }
  }

  const spread = LIQUID_SPREAD[material] ?? DEFAULT_LIQUID_SPREAD;
  for (let distance = spread; distance >= 1; distance -= 1) {
    for (const sign of [direction, -direction]) {
      const targetX = x + sign * distance;
      if (!world.inBounds(targetX, y)) continue;
      let clearPath = true;
      for (let step = 1; step <= distance; step += 1) {
        const pathMaterial = world.cells[
          world.index(x + sign * step, y)
        ] as Material;
        if (pathMaterial !== Material.EMPTY && !isGas(pathMaterial)) {
          clearPath = false;
          break;
        }
      }
      if (!clearPath) continue;
      world.move(from, world.index(targetX, y));
      return true;
    }
  }
  return false;
}

export function tryGasMove(world: SandWorld, x: number, y: number) {
  const from = world.index(x, y);
  const direction = Math.random() < 0.5 ? -1 : 1;
  const targets = [
    [x, y - 1],
    [x + direction, y - 1],
    [x - direction, y - 1],
    [x + direction, y],
    [x - direction, y],
  ] as const;

  for (const [targetX, targetY] of targets) {
    if (!world.inBounds(targetX, targetY)) continue;
    const to = world.index(targetX, targetY);
    if (world.cells[to] === Material.EMPTY) {
      world.move(from, to);
      return true;
    }
  }
  return false;
}
