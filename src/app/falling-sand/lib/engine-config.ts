import { Material } from "../types";

export const PALETTES: ReadonlyArray<
  ReadonlyArray<readonly [number, number, number]>
> = [
  [[18, 18, 16]],
  [
    [230, 184, 90],
    [213, 160, 66],
    [242, 203, 117],
    [197, 144, 58],
  ],
  [
    [76, 155, 216],
    [55, 128, 191],
    [93, 171, 225],
  ],
  [
    [239, 122, 53],
    [249, 174, 55],
    [229, 70, 37],
    [255, 211, 93],
  ],
  [
    [232, 78, 44],
    [244, 111, 40],
    [197, 43, 31],
    [250, 153, 52],
  ],
  [
    [103, 168, 79],
    [77, 139, 62],
    [128, 188, 91],
  ],
  [
    [166, 199, 68],
    [130, 175, 48],
    [193, 216, 78],
  ],
  [
    [119, 115, 111],
    [93, 91, 89],
    [143, 137, 130],
    [108, 105, 102],
  ],
  [
    [156, 103, 67],
    [126, 78, 51],
    [174, 119, 76],
  ],
  [
    [109, 86, 67],
    [79, 66, 56],
    [130, 104, 78],
  ],
  [
    [215, 215, 207],
    [240, 238, 225],
    [190, 192, 187],
  ],
  [
    [73, 70, 65],
    [55, 53, 49],
    [93, 87, 77],
  ],
  [
    [159, 215, 229],
    [125, 190, 211],
    [190, 232, 239],
  ],
  [
    [91, 88, 82],
    [116, 111, 102],
    [72, 71, 68],
  ],
  [
    [170, 195, 202],
    [197, 216, 218],
    [137, 170, 180],
  ],
  [
    [143, 105, 69],
    [119, 85, 57],
    [166, 125, 82],
  ],
  [
    [105, 83, 61],
    [82, 65, 49],
    [124, 98, 70],
  ],
  [
    [52, 51, 50],
    [35, 35, 34],
    [69, 66, 62],
  ],
  [
    [157, 164, 166],
    [127, 135, 139],
    [186, 192, 192],
  ],
  [
    [143, 198, 197],
    [113, 170, 174],
    [181, 220, 216],
  ],
  [
    [231, 243, 242],
    [207, 227, 232],
    [248, 251, 247],
  ],
  [
    [138, 145, 184],
    [108, 116, 158],
    [164, 167, 199],
  ],
  [
    [207, 63, 50],
    [165, 43, 37],
    [232, 83, 60],
  ],
  [
    [226, 170, 56],
    [191, 132, 36],
    [242, 201, 91],
  ],
  [
    [216, 211, 184],
    [183, 184, 157],
    [235, 228, 202],
  ],
  [
    [181, 126, 70],
    [145, 91, 48],
    [204, 153, 82],
    [245, 143, 43],
  ],
  [
    [155, 102, 209],
    [124, 77, 180],
    [184, 133, 225],
  ],
  [
    [236, 103, 140],
    [181, 105, 214],
    [241, 185, 70],
    [106, 181, 229],
    [238, 126, 79],
  ],
  [
    [116, 188, 91],
    [83, 155, 68],
    [145, 207, 105],
  ],
];

export const LIQUID_DENSITY: Partial<Record<Material, number>> = {
  [Material.OIL]: 1,
  [Material.WATER]: 2,
  [Material.ACID]: 3,
  [Material.NITRO]: 3.5,
  [Material.LAVA]: 4,
  [Material.MUD]: 5,
};

export const LIQUID_SPREAD: Partial<Record<Material, number>> = {
  [Material.OIL]: 8,
  [Material.LAVA]: 3,
  [Material.MUD]: 2,
};

export const DEFAULT_LIQUID_SPREAD = 6;

export const isLiquid = (material: Material) => material in LIQUID_DENSITY;

export const isGas = (material: Material) =>
  material === Material.FIRE ||
  material === Material.SMOKE ||
  material === Material.STEAM ||
  material === Material.METHANE;

export const isHeat = (material: Material) =>
  material === Material.FIRE || material === Material.LAVA;

export const isPlantLike = (material: Material) =>
  material === Material.PLANT ||
  material === Material.FLOWER ||
  material === Material.SPROUT;

/** Water in any of its solid or liquid forms. */
export const isWaterLike = (material: Material) =>
  material === Material.WATER ||
  material === Material.ICE ||
  material === Material.SNOW;

export const GROWTH_COOLDOWN = 12;
export const GROWTH_SHIFT = 4;
export const SEED_EMBER_FLAG = 1 << 15;
export const SEED_EMBER_RELEASE_LIFE = 42;
export const WOOD_FIRE_FLAG = 1 << 14;
export const FIRE_STATE_FLAGS = SEED_EMBER_FLAG | WOOD_FIRE_FLAG;

export const explosionRadius = (material: Material) => {
  switch (material) {
    case Material.GUNPOWDER:
      return 5;
    case Material.METHANE:
      return 9;
    case Material.NITRO:
      return 11;
    case Material.TNT:
      return 14;
    case Material.C4:
      return 32;
    default:
      return 0;
  }
};

/** Materials a nearby heat source can set alight. */
export const isFlammable = (material: Material) =>
  isPlantLike(material) ||
  material === Material.SEED ||
  material === Material.OIL ||
  material === Material.COAL ||
  material === Material.FUSE ||
  explosionRadius(material) > 0;

export const randomInt = (maximum: number) =>
  Math.floor(Math.random() * maximum);

export function encodeBytes(bytes: Uint8Array): string {
  let encoded = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    encoded += String.fromCharCode(
      ...bytes.subarray(offset, offset + chunkSize),
    );
  }
  return btoa(encoded);
}

export function decodeBytes(encoded: string): Uint8Array {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
