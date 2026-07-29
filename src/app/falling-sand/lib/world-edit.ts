import { Material } from "../types";

import { randomInt } from "./engine-config";
import type { SandWorld } from "./world";

export function paintCircle(
  world: SandWorld,
  centerX: number,
  centerY: number,
  radius: number,
  material: Material,
) {
  const brushRadius = Math.max(1, Math.round(radius));
  const radiusSquared = brushRadius * brushRadius;
  for (let y = centerY - brushRadius; y <= centerY + brushRadius; y += 1) {
    for (let x = centerX - brushRadius; x <= centerX + brushRadius; x += 1) {
      if (!world.inBounds(x, y)) continue;
      const dx = x - centerX;
      const dy = y - centerY;
      if (dx * dx + dy * dy > radiusSquared) continue;
      if (material !== Material.EMPTY && Math.random() < 0.08) continue;
      const index = world.index(x, y);
      if (material === Material.FIRE && world.cells[index] !== Material.EMPTY) {
        continue;
      }
      const life =
        material === Material.FIRE
          ? 40 + randomInt(65)
          : material === Material.SMOKE || material === Material.STEAM
            ? 80 + randomInt(90)
            : 0;
      world.assign(index, material, life);
    }
  }
}

export function paintStroke(
  world: SandWorld,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  radius: number,
  material: Material,
) {
  const distance = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
  const steps = Math.max(1, distance);
  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    paintCircle(
      world,
      Math.round(startX + (endX - startX) * progress),
      Math.round(startY + (endY - startY) * progress),
      radius,
      material,
    );
  }
}

/** Stone floor, a wooden basin of water, and a sand dune to play with. */
export function seedDemoWorld(world: SandWorld) {
  world.clear();
  const floorY = Math.floor(world.height * 0.9);
  const ledgeY = Math.floor(world.height * 0.62);

  for (let x = 0; x < world.width; x += 1) {
    for (let y = floorY; y < world.height; y += 1) {
      world.assign(world.index(x, y), Material.STONE);
    }
  }

  for (let x = Math.floor(world.width * 0.08); x < world.width * 0.42; x += 1) {
    world.assign(world.index(x, ledgeY), Material.WOOD);
  }
  for (let y = ledgeY; y < floorY; y += 1) {
    world.assign(world.index(Math.floor(world.width * 0.08), y), Material.WOOD);
    world.assign(world.index(Math.floor(world.width * 0.42), y), Material.WOOD);
  }

  const waterTop = Math.floor(world.height * 0.7);
  for (let y = waterTop; y < floorY; y += 1) {
    for (let x = Math.floor(world.width * 0.1); x < world.width * 0.4; x += 1) {
      if (Math.random() < 0.9) {
        world.assign(world.index(x, y), Material.WATER);
      }
    }
  }

  for (let x = Math.floor(world.width * 0.56); x < world.width * 0.9; x += 1) {
    const mound = Math.abs(x - world.width * 0.73) * 0.34;
    const top = Math.floor(world.height * 0.72 + mound);
    for (let y = top; y < floorY; y += 1) {
      world.assign(world.index(x, y), Material.SAND);
    }
  }
}
