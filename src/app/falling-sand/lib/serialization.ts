import { MATERIAL_COUNT, type SerializedWorld } from "../types";

import { decodeBytes, encodeBytes } from "./engine-config";
import type { SandWorld, WorldGrid } from "./world";

export const MINIMUM_WORLD_SIZE = 48;
const MAXIMUM_WORLD_CELLS = 120_000;

export function serializeWorld(world: SandWorld) {
  const payload: SerializedWorld = {
    version: 1,
    width: world.width,
    height: world.height,
    cells: encodeBytes(world.cells),
    life: encodeBytes(new Uint8Array(world.life.buffer)),
    shade: encodeBytes(world.shade),
  };
  return JSON.stringify(payload);
}

export function parseWorld(serialized: string): WorldGrid {
  const parsed = JSON.parse(serialized) as Partial<SerializedWorld>;
  if (
    parsed.version !== 1 ||
    typeof parsed.width !== "number" ||
    typeof parsed.height !== "number" ||
    typeof parsed.cells !== "string" ||
    typeof parsed.life !== "string" ||
    typeof parsed.shade !== "string"
  ) {
    throw new Error("This save file is not a supported Falling Sand world.");
  }

  const width = Math.round(parsed.width);
  const height = Math.round(parsed.height);
  if (
    width < MINIMUM_WORLD_SIZE ||
    height < MINIMUM_WORLD_SIZE ||
    width * height > MAXIMUM_WORLD_CELLS
  ) {
    throw new Error("This save file has an invalid world size.");
  }

  const cells = decodeBytes(parsed.cells);
  const lifeBytes = decodeBytes(parsed.life);
  const shade = decodeBytes(parsed.shade);
  const length = width * height;
  if (
    cells.length !== length ||
    lifeBytes.length !== length * 2 ||
    shade.length !== length
  ) {
    throw new Error("This save file is incomplete.");
  }
  for (const material of cells) {
    if (material >= MATERIAL_COUNT) {
      throw new Error("This save file contains an unknown material.");
    }
  }

  return {
    width,
    height,
    cells,
    life: new Uint16Array(lifeBytes.buffer),
    shade,
  };
}
