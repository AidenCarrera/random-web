import { Material } from "../../types";

import { isHeat } from "../engine-config";
import { tryPowderMove } from "../movement";
import type { SandWorld } from "../world";

/**
 * Melts the cell when it touches a heat source, otherwise it may freeze one
 * neighbouring water cell. Returns whether the cell melted.
 */
function meltOrFreeze(
  world: SandWorld,
  around: readonly number[],
  index: number,
  freezeChance: number,
) {
  if (world.hasNeighbor(around, isHeat)) {
    world.assign(index, Material.WATER);
    return true;
  }
  if (Math.random() < freezeChance) {
    const water = world.findNeighborOf(around, Material.WATER);
    if (water !== undefined) world.convert(water, Material.ICE);
  }
  return false;
}

export function updateIce(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  meltOrFreeze(world, world.neighbors(x, y), index, 0.005);
}

export function updateSnow(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  if (meltOrFreeze(world, world.neighbors(x, y), index, 0.014)) return;
  tryPowderMove(world, x, y);
}
