import { Material } from "../types";

import {
  SEED_EMBER_FLAG,
  WOOD_FIRE_FLAG,
  explosionRadius,
  isHeat,
  isPlantLike,
  isWaterLike,
  randomInt,
} from "./engine-config";
import type { SandWorld } from "./world";

export const touchesHeat = (world: SandWorld, x: number, y: number) =>
  world.hasNeighbor(world.neighbors(x, y), isHeat);

export function ignite(world: SandWorld, index: number) {
  const material = world.cells[index] as Material;
  if (material === Material.FUSE) {
    if (world.life[index] === 0) world.life[index] = 4;
    world.touch(index);
    return;
  }
  const radius = explosionRadius(material);
  if (radius > 0) {
    const x = index % world.width;
    const y = Math.floor(index / world.width);
    explode(world, x, y, radius);
    return;
  }
  if (material === Material.SEED) {
    world.convert(index, Material.FIRE, SEED_EMBER_FLAG | (58 + randomInt(20)));
    return;
  }
  if (material === Material.WOOD) {
    world.convert(index, Material.FIRE, WOOD_FIRE_FLAG | (105 + randomInt(45)));
    return;
  }
  if (
    isPlantLike(material) ||
    material === Material.OIL ||
    material === Material.COAL
  ) {
    world.convert(index, Material.FIRE, 42 + randomInt(55));
  }
}

export function explode(
  world: SandWorld,
  centerX: number,
  centerY: number,
  radius: number,
) {
  const blasts = [{ x: centerX, y: centerY, radius }];
  const queued = new Set([world.index(centerX, centerY)]);

  for (let blastIndex = 0; blastIndex < blasts.length; blastIndex += 1) {
    const blast = blasts[blastIndex];
    const radiusSquared = blast.radius * blast.radius;
    for (let y = blast.y - blast.radius; y <= blast.y + blast.radius; y += 1) {
      for (
        let x = blast.x - blast.radius;
        x <= blast.x + blast.radius;
        x += 1
      ) {
        if (!world.inBounds(x, y)) continue;
        const dx = x - blast.x;
        const dy = y - blast.y;
        if (dx * dx + dy * dy > radiusSquared) continue;
        const index = world.index(x, y);
        const material = world.cells[index] as Material;
        const chainedRadius = explosionRadius(material);
        if (chainedRadius > 0 && !queued.has(index) && blasts.length < 48) {
          queued.add(index);
          blasts.push({ x, y, radius: chainedRadius });
        }

        const isC4Blast = blast.radius >= 32;
        if (
          material === Material.METAL &&
          Math.random() > (isC4Blast ? 0.22 : 0.03)
        ) {
          continue;
        }
        if (
          material === Material.STONE &&
          Math.random() > (isC4Blast ? 0.82 : blast.radius >= 18 ? 0.55 : 0.18)
        ) {
          continue;
        }
        if (isWaterLike(material) || material === Material.MUD) {
          world.assign(index, Material.STEAM, 80 + randomInt(70));
        } else {
          const outputRoll = Math.random();
          if (blast.radius <= 5) {
            if (outputRoll < 0.38) {
              world.assign(index, Material.FIRE, 10 + randomInt(21));
            } else if (outputRoll < 0.58) {
              world.assign(index, Material.SMOKE, 18 + randomInt(26));
            } else {
              world.erase(index);
            }
          } else if (outputRoll < 0.68) {
            world.assign(index, Material.FIRE, 24 + randomInt(80));
          } else {
            world.assign(index, Material.SMOKE, 70 + randomInt(100));
          }
        }
        world.touch(index);
      }
    }
  }
}
