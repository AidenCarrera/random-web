import { Material } from "../../types";

import {
  GROWTH_COOLDOWN,
  GROWTH_SHIFT,
  isPlantLike,
  randomInt,
} from "../engine-config";
import { tryPowderMove } from "../movement";
import type { SandWorld } from "../world";

/** Clears loose seeds around a sprouting cell so stems stay single-stranded. */
function removeNearbySeeds(
  world: SandWorld,
  centerX: number,
  centerY: number,
  radius: number,
  except?: number,
) {
  const radiusSquared = radius * radius;
  for (let y = centerY - radius; y <= centerY + radius; y += 1) {
    for (let x = centerX - radius; x <= centerX + radius; x += 1) {
      if (!world.inBounds(x, y)) continue;
      const dx = x - centerX;
      const dy = y - centerY;
      if (dx * dx + dy * dy > radiusSquared) continue;
      const target = world.index(x, y);
      if (target === except || world.cells[target] !== Material.SEED) continue;
      world.erase(target);
      world.touch(target);
    }
  }
}

export function updatePlant(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  const around = world.neighbors(x, y);
  const water = world.findNeighborOf(around, Material.WATER);
  const hasDirt = world.findNeighborOf(around, Material.DIRT) !== undefined;
  if (water === undefined || Math.random() > (hasDirt ? 0.038 : 0.022)) return;

  const candidates = [
    [x, y - 1],
    [x - 1, y - 1],
    [x + 1, y - 1],
    [x - 1, y],
    [x + 1, y],
  ] as const;
  const [targetX, targetY] = candidates[randomInt(candidates.length)];
  if (!world.inBounds(targetX, targetY)) return;
  const target = world.index(targetX, targetY);
  if (
    world.cells[target] === Material.EMPTY ||
    world.cells[target] === Material.DIRT
  ) {
    world.convert(target, Material.PLANT);
  }
  if (Math.random() < 0.08) world.erase(water);
  world.touch(index);
}

export function updateSeed(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  const soil = world.materialAt(x, y + 1);
  const water = world.findNearby(x, y, 1, Material.WATER);
  const touchingPlant = world.hasNeighbor(world.neighbors(x, y), isPlantLike);
  const germinationTicks = touchingPlant
    ? 28
    : soil === Material.MUD
      ? 28
      : soil === Material.DIRT
        ? 55
        : water !== undefined
          ? 110
          : 0;

  if (germinationTicks === 0) {
    world.life[index] = 0;
    tryPowderMove(world, x, y);
    return;
  }

  world.life[index] += 1;
  if (world.life[index] < germinationTicks) {
    if (!touchingPlant && soil !== Material.MUD && soil !== Material.DIRT) {
      tryPowderMove(world, x, y);
    }
    return;
  }

  if (touchingPlant) {
    const extraHeight = 10 + randomInt(9);
    removeNearbySeeds(world, x, y, 1, index);
    world.convert(
      index,
      Material.SPROUT,
      (extraHeight << GROWTH_SHIFT) | GROWTH_COOLDOWN,
    );
    return;
  }

  const firstStemY = y - 1;
  if (!world.inBounds(x, firstStemY)) return;
  if (world.cells[world.index(x, firstStemY)] !== Material.EMPTY) return;

  const targetHeight = 10 + randomInt(9);
  const tip = world.index(x, firstStemY);
  removeNearbySeeds(world, x, y, 2, index);
  world.convert(index, Material.PLANT);
  world.convert(
    tip,
    Material.SPROUT,
    ((targetHeight - 1) << GROWTH_SHIFT) | GROWTH_COOLDOWN,
  );
  if (water !== undefined && Math.random() < 0.22) world.erase(water);
}

export function updateSprout(
  world: SandWorld,
  x: number,
  y: number,
  index: number,
) {
  const remaining = world.life[index] >> GROWTH_SHIFT;
  const cooldown = world.life[index] & 0x0f;
  if (cooldown > 0) {
    world.life[index] -= 1;
    return;
  }

  if (remaining === 0) {
    world.assign(index, Material.FLOWER);
    return;
  }

  const targetY = y - 1;
  if (!world.inBounds(x, targetY)) {
    world.assign(index, Material.FLOWER);
    return;
  }

  let nextX = x;
  if (remaining % 3 === 0) {
    const drift = Math.random() < 0.5 ? -1 : 1;
    const driftX = x + drift;
    if (
      world.inBounds(driftX, targetY) &&
      world.cells[world.index(driftX, targetY)] === Material.EMPTY
    ) {
      nextX = driftX;
    }
  }

  let target = world.index(nextX, targetY);
  if (world.cells[target] === Material.SEED) world.erase(target);
  if (world.cells[target] !== Material.EMPTY && nextX !== x) {
    nextX = x;
    target = world.index(nextX, targetY);
    if (world.cells[target] === Material.SEED) world.erase(target);
  }
  if (world.cells[target] !== Material.EMPTY) {
    world.assign(index, Material.FLOWER);
    return;
  }

  world.convert(index, Material.PLANT);
  world.convert(
    target,
    Material.SPROUT,
    ((remaining - 1) << GROWTH_SHIFT) | GROWTH_COOLDOWN,
  );
  removeNearbySeeds(world, nextX, targetY, 1);

  if (remaining > 2 && remaining % 3 === 0) {
    growBranch(world, nextX, targetY, remaining);
  }
}

function growBranch(world: SandWorld, x: number, y: number, remaining: number) {
  const direction = remaining % 2 === 0 ? -1 : 1;
  const length = 2 + randomInt(3);
  let tip: number | undefined;
  for (let step = 1; step <= length; step += 1) {
    const branchX = x + direction * step;
    const branchY = y + Math.floor(step / 2);
    if (!world.inBounds(branchX, branchY)) break;
    const branch = world.index(branchX, branchY);
    if (world.cells[branch] !== Material.EMPTY) break;
    world.convert(branch, Material.PLANT);
    tip = branch;
  }
  if (tip !== undefined) world.convert(tip, Material.FLOWER);
}
