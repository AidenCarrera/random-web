import { Material } from "../../types";

import { isGas, randomInt } from "../engine-config";
import { tryGasMove } from "../movement";
import { ignite, touchesHeat } from "../reactions";
import type { SandWorld } from "../world";

const gasLife = () => 80 + randomInt(100);

export function updateSmoke(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  if (world.life[index] === 0) world.life[index] = gasLife();
  world.life[index] -= 1;
  if (world.life[index] === 0) {
    world.erase(index);
    return;
  }
  tryGasMove(world, x, y);
}

export function updateSteam(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  if (world.life[index] === 0) world.life[index] = gasLife();
  const materialAbove = world.materialAt(x, y - 1);
  const methaneAbove = materialAbove === Material.METHANE;
  const hitCeiling =
    y === 0 || (materialAbove !== Material.EMPTY && !isGas(materialAbove));
  const touchingIce =
    world.findNeighborOf(world.neighbors(x, y), Material.ICE) !== undefined;
  if ((methaneAbove || hitCeiling || touchingIce) && Math.random() < 0.006) {
    const condensation = methaneAbove
      ? Material.ACID
      : touchingIce
        ? Material.SNOW
        : Material.WATER;
    if (methaneAbove) world.erase(world.index(x, y - 1));
    world.assign(index, condensation);
    return;
  }
  if (world.frame % 2 === 0) {
    world.life[index] -= 1;
    if (world.life[index] === 0) {
      world.erase(index);
      return;
    }
  }
  tryGasMove(world, x, y);
}

export function updateMethane(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  if (touchesHeat(world, x, y)) {
    ignite(world, index);
    return;
  }
  tryGasMove(world, x, y);
}
