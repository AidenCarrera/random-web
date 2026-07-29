import { Material } from "../../types";

import {
  FIRE_STATE_FLAGS,
  SEED_EMBER_FLAG,
  SEED_EMBER_RELEASE_LIFE,
  WOOD_FIRE_FLAG,
  explosionRadius,
  isFlammable,
  isHeat,
  isPlantLike,
  isWaterLike,
  randomInt,
} from "../engine-config";
import { tryGasMove, tryLiquidMove } from "../movement";
import { ignite } from "../reactions";
import type { SandWorld } from "../world";

export function updateFire(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  const around = world.neighbors(x, y);
  for (const neighbor of around) {
    const material = world.cells[neighbor] as Material;
    if (isWaterLike(material)) {
      world.convert(neighbor, Material.STEAM, 90 + randomInt(80));
      world.assign(index, Material.SMOKE, 35 + randomInt(40));
      return;
    }
    if (
      ((isPlantLike(material) || material === Material.SEED) &&
        Math.random() < 0.21) ||
      (material === Material.WOOD && Math.random() < 0.05) ||
      (material === Material.OIL && Math.random() < 0.38) ||
      (material === Material.COAL && Math.random() < 0.07) ||
      material === Material.FUSE ||
      explosionRadius(material) > 0
    ) {
      ignite(world, neighbor);
    }
  }

  let seedEmber = (world.life[index] & SEED_EMBER_FLAG) !== 0;
  const woodFire = (world.life[index] & WOOD_FIRE_FLAG) !== 0;
  let fireLife = world.life[index] & ~FIRE_STATE_FLAGS;
  if (fireLife === 0) fireLife = 35 + randomInt(65);
  fireLife -= 1;
  if (seedEmber && fireLife <= SEED_EMBER_RELEASE_LIFE) seedEmber = false;
  world.life[index] =
    fireLife |
    (seedEmber ? SEED_EMBER_FLAG : 0) |
    (woodFire ? WOOD_FIRE_FLAG : 0);
  if (fireLife === 0 || Math.random() < (woodFire ? 0.003 : 0.012)) {
    if (Math.random() < 0.72) {
      world.assign(index, Material.SMOKE, 45 + randomInt(90));
    } else {
      world.erase(index);
    }
    return;
  }
  if (!seedEmber && !woodFire) tryGasMove(world, x, y);
}

export function updateLava(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  let cooled = false;
  for (const neighbor of world.neighbors(x, y)) {
    const material = world.cells[neighbor] as Material;
    if (isWaterLike(material)) {
      world.convert(neighbor, Material.STEAM, 100 + randomInt(80));
      world.assign(index, Material.STONE);
      cooled = true;
      break;
    }
    if (material === Material.WOOD || isFlammable(material)) {
      ignite(world, neighbor);
    }
    if (material === Material.SAND && Math.random() < 0.04) {
      world.convert(neighbor, Material.GLASS);
    }
  }
  if (!cooled && world.frame % 3 === 0) {
    tryLiquidMove(world, x, y, Material.LAVA);
  }
}

/** Metal stores heat in its life value and passes it along to nearby metal. */
export function updateMetal(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  const around = world.neighbors(x, y);
  const touchingHeat = world.hasNeighbor(around, isHeat);
  const touchingHotMetal = around.some(
    (neighbor) =>
      world.cells[neighbor] === Material.METAL && world.life[neighbor] > 18,
  );
  if (touchingHeat) world.life[index] = 70;
  else if (touchingHotMetal && world.life[index] < 42) world.life[index] = 42;
  else if (world.life[index] > 0) world.life[index] -= 1;

  if (world.life[index] > 24) {
    const fuel = world.findNeighbor(around, isFlammable);
    if (fuel !== undefined && Math.random() < 0.1) ignite(world, fuel);
  }
}

export function updateFuse(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  const around = world.neighbors(x, y);
  if (world.life[index] > 0) {
    const charge = world.findNeighbor(
      around,
      (material) => explosionRadius(material) > 0,
    );
    if (charge !== undefined) {
      ignite(world, charge);
      return;
    }

    for (const neighbor of around) {
      if (
        world.cells[neighbor] === Material.FUSE &&
        world.life[neighbor] === 0
      ) {
        world.life[neighbor] = 4;
        world.touch(neighbor);
      }
    }

    world.life[index] -= 1;
    if (world.life[index] === 0) world.erase(index);
    return;
  }

  if (world.hasNeighbor(around, isHeat)) ignite(world, index);
}
