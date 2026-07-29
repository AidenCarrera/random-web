import { Material } from "../../types";

import { PALETTES, randomInt } from "../engine-config";
import { tryPowderMove } from "../movement";
import { ignite, touchesHeat } from "../reactions";
import type { SandWorld } from "../world";

export function updateDirt(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  const water = world.findNeighborOf(world.neighbors(x, y), Material.WATER);
  if (water !== undefined && Math.random() < 0.075) {
    world.assign(index, Material.MUD);
    if (Math.random() < 0.28) world.erase(water);
    return;
  }
  tryPowderMove(world, x, y);
}

export function updateSalt(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  const water = world.findNeighborOf(world.neighbors(x, y), Material.WATER);
  if (water !== undefined && Math.random() < 0.12) {
    world.erase(index);
    world.shade[water] = randomInt(PALETTES[Material.WATER].length);
    return;
  }
  tryPowderMove(world, x, y);
}

export function updateCoal(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  if (touchesHeat(world, x, y) && Math.random() < 0.1) {
    ignite(world, index);
    return;
  }
  tryPowderMove(world, x, y);
}
