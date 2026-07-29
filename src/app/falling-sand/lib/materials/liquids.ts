import { Material } from "../../types";

import { randomInt } from "../engine-config";
import { tryLiquidMove } from "../movement";
import { ignite, touchesHeat } from "../reactions";
import type { SandWorld } from "../world";

export function updateAcid(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  const around = world.neighbors(x, y);
  const target = around[randomInt(around.length)];
  if (target !== undefined) {
    const material = world.cells[target] as Material;
    const resistant =
      material === Material.EMPTY ||
      material === Material.ACID ||
      material === Material.GLASS ||
      material === Material.FIRE ||
      material === Material.SMOKE ||
      material === Material.STEAM;
    const stoneResists = material === Material.STONE && Math.random() > 0.08;
    if (!resistant && !stoneResists && Math.random() < 0.13) {
      world.erase(target);
      world.touch(target);
      if (Math.random() < 0.16) {
        world.assign(index, Material.SMOKE, 35 + randomInt(40));
        return;
      }
    }
  }
  tryLiquidMove(world, x, y, Material.ACID);
}

export function updateMud(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  if (touchesHeat(world, x, y)) {
    if (Math.random() < 0.08) world.assign(index, Material.DIRT);
    return;
  }
  if (world.frame % 4 === 0) tryLiquidMove(world, x, y, Material.MUD);
}

export function updateNitro(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  if (touchesHeat(world, x, y)) {
    ignite(world, index);
    return;
  }
  tryLiquidMove(world, x, y, Material.NITRO);
}
