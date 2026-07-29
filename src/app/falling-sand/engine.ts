import { MATERIAL_COUNT, Material } from "./types";

export { MATERIAL_COUNT, Material } from "./types";

import { PALETTES } from "./lib/engine-config";
import { updateIce, updateSnow } from "./lib/materials/frozen";
import { updateMethane, updateSmoke, updateSteam } from "./lib/materials/gases";
import { updatePlant, updateSeed, updateSprout } from "./lib/materials/growth";
import {
  updateFire,
  updateFuse,
  updateLava,
  updateMetal,
} from "./lib/materials/heat";
import { updateAcid, updateMud, updateNitro } from "./lib/materials/liquids";
import { updateCoal, updateDirt, updateSalt } from "./lib/materials/powders";
import { tryLiquidMove, tryPowderMove } from "./lib/movement";
import {
  MINIMUM_WORLD_SIZE,
  parseWorld,
  serializeWorld,
} from "./lib/serialization";
import { SandWorld } from "./lib/world";
import { paintCircle, paintStroke, seedDemoWorld } from "./lib/world-edit";

const worldSize = (value: number) =>
  Math.max(MINIMUM_WORLD_SIZE, Math.round(value));

export class FallingSandEngine {
  private world: SandWorld;
  private imageData: ImageData | null = null;

  constructor(width: number, height: number) {
    this.world = new SandWorld(worldSize(width), worldSize(height));
  }

  get width() {
    return this.world.width;
  }

  get height() {
    return this.world.height;
  }

  step(iterations = 1) {
    const world = this.world;
    for (let iteration = 0; iteration < iterations; iteration += 1) {
      world.beginFrame();
      const { cells, updated, width, height, frame } = world;
      const leftToRight = frame % 2 === 0;

      for (let y = height - 1; y >= 0; y -= 1) {
        for (let offset = 0; offset < width; offset += 1) {
          const x = leftToRight ? offset : width - 1 - offset;
          const index = y * width + x;
          if (updated[index] === frame) continue;
          const material = cells[index] as Material;
          if (material === Material.EMPTY) continue;

          updated[index] = frame;
          switch (material) {
            case Material.SAND:
            case Material.GUNPOWDER:
              tryPowderMove(world, x, y);
              break;
            case Material.DIRT:
              updateDirt(world, x, y, index);
              break;
            case Material.COAL:
              updateCoal(world, x, y, index);
              break;
            case Material.SNOW:
              updateSnow(world, x, y, index);
              break;
            case Material.SEED:
              updateSeed(world, x, y, index);
              break;
            case Material.SPROUT:
              updateSprout(world, x, y, index);
              break;
            case Material.FUSE:
              updateFuse(world, x, y, index);
              break;
            case Material.SALT:
              updateSalt(world, x, y, index);
              break;
            case Material.WATER:
            case Material.OIL:
              tryLiquidMove(world, x, y, material);
              break;
            case Material.MUD:
              updateMud(world, x, y, index);
              break;
            case Material.NITRO:
              updateNitro(world, x, y, index);
              break;
            case Material.FIRE:
              updateFire(world, x, y, index);
              break;
            case Material.LAVA:
              updateLava(world, x, y, index);
              break;
            case Material.ACID:
              updateAcid(world, x, y, index);
              break;
            case Material.PLANT:
              updatePlant(world, x, y, index);
              break;
            case Material.ICE:
              updateIce(world, x, y, index);
              break;
            case Material.METAL:
              updateMetal(world, x, y, index);
              break;
            case Material.METHANE:
              updateMethane(world, x, y, index);
              break;
            case Material.SMOKE:
              updateSmoke(world, x, y, index);
              break;
            case Material.STEAM:
              updateSteam(world, x, y, index);
              break;
            default:
              break;
          }
        }
      }
    }
  }

  paint(centerX: number, centerY: number, radius: number, material: Material) {
    paintCircle(this.world, centerX, centerY, radius, material);
  }

  paintLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    radius: number,
    material: Material,
  ) {
    paintStroke(this.world, startX, startY, endX, endY, radius, material);
  }

  clear() {
    this.world.clear();
  }

  seedDemo() {
    seedDemoWorld(this.world);
  }

  resize(width: number, height: number) {
    const nextWidth = worldSize(width);
    const nextHeight = worldSize(height);
    if (nextWidth === this.world.width && nextHeight === this.world.height) {
      return;
    }
    this.world.resize(nextWidth, nextHeight);
    this.imageData = null;
  }

  render(context: CanvasRenderingContext2D) {
    const { cells, life, shade, frame, width, height } = this.world;
    if (
      !this.imageData ||
      this.imageData.width !== width ||
      this.imageData.height !== height
    ) {
      this.imageData = context.createImageData(width, height);
    }
    const pixels = this.imageData.data;
    for (let index = 0; index < cells.length; index += 1) {
      const material = cells[index] as Material;
      const palette = PALETTES[material];
      let paletteShade = shade[index] % palette.length;
      if (material === Material.FUSE && life[index] > 0) {
        paletteShade = (frame + index) % 4 === 0 ? 2 : 3;
      } else if (
        (material === Material.FIRE ||
          material === Material.LAVA ||
          (material === Material.METAL && life[index] > 0)) &&
        (frame + index) % 7 === 0
      ) {
        paletteShade = (paletteShade + 1) % palette.length;
      }
      const [red, green, blue] = palette[paletteShade];
      const pixel = index * 4;
      pixels[pixel] = red;
      pixels[pixel + 1] = green;
      pixels[pixel + 2] = blue;
      pixels[pixel + 3] = 255;
    }
    context.putImageData(this.imageData, 0, 0);
  }

  getMaterialCounts() {
    const counts = Array<number>(MATERIAL_COUNT).fill(0);
    for (const material of this.world.cells) counts[material] += 1;
    return counts;
  }

  serialize() {
    return serializeWorld(this.world);
  }

  load(serialized: string) {
    this.world.adopt(parseWorld(serialized));
    this.imageData = null;
  }
}
