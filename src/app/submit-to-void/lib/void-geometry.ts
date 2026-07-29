/**
 * Shared black hole geometry. `<BlackHole />` renders it as animated JSX and
 * the GIF exporter renders the same data as an SVG string, so the download
 * always matches what is on screen.
 */

/** All coordinates live in this square viewBox. */
export const VOID_VIEW_BOX = 400;
export const VOID_CENTER = VOID_VIEW_BOX / 2;

export type VoidFilter = {
  id: string;
  blur: number;
};

export const VOID_FILTERS: readonly VoidFilter[] = [
  { id: "bh-glow-heavy", blur: 25 },
  { id: "bh-glow-mid", blur: 10 },
  { id: "bh-glow-fine", blur: 3 },
];

export type VoidGradient = {
  id: string;
  stops: readonly { offset: string; color: string; opacity: string }[];
};

export const VOID_GRADIENTS: readonly VoidGradient[] = [
  {
    id: "outer-shroud",
    stops: [
      { offset: "0%", color: "#1e0b36", opacity: "0.75" },
      { offset: "45%", color: "#2e1065", opacity: "0.45" },
      { offset: "80%", color: "#172554", opacity: "0.2" },
      { offset: "100%", color: "#07060c", opacity: "0" },
    ],
  },
  {
    id: "mid-vortex",
    stops: [
      { offset: "25%", color: "#db2777", opacity: "0" },
      { offset: "45%", color: "#a855f7", opacity: "0.5" },
      { offset: "65%", color: "#6d28d9", opacity: "0.35" },
      { offset: "90%", color: "#1e3a8a", opacity: "0.1" },
      { offset: "100%", color: "#07060c", opacity: "0" },
    ],
  },
  {
    id: "inner-vortex",
    stops: [
      { offset: "35%", color: "#c084fc", opacity: "0" },
      { offset: "50%", color: "#7c3aed", opacity: "0.75" },
      { offset: "70%", color: "#4338ca", opacity: "0.4" },
      { offset: "90%", color: "#1e3a8a", opacity: "0.15" },
      { offset: "100%", color: "#07060c", opacity: "0" },
    ],
  },
  {
    id: "core-glow",
    stops: [
      { offset: "0%", color: "#000", opacity: "1" },
      { offset: "90%", color: "#000", opacity: "1" },
      { offset: "96%", color: "#6d28d9", opacity: "0.6" },
      { offset: "100%", color: "#1e3a8a", opacity: "0" },
    ],
  },
];

export type VoidLayer = {
  /** Which accretion band this is, outermost first. */
  name: string;
  filterId: string;
  gradientId: string;
  radius: number;
  strokeWidth: number;
  arms: readonly { d: string; stroke: string }[];
  /** Degrees swept by one live rotation; the sign sets the direction. */
  spin: number;
  /** Seconds per live rotation. */
  spinDuration: number;
  /** Signed GIF frames per rotation; the sign sets the direction. */
  gifFramesPerTurn: number;
};

export const VOID_LAYERS: readonly VoidLayer[] = [
  {
    name: "Outer sapphire swirling disk",
    filterId: "bh-glow-heavy",
    gradientId: "outer-shroud",
    radius: 170,
    strokeWidth: 35,
    arms: [
      {
        d: "M 200 200 Q 280 120 330 200 T 200 350",
        stroke: "rgba(91, 33, 182, 0.2)",
      },
      {
        d: "M 200 200 Q 120 280 70 200 T 200 50",
        stroke: "rgba(30, 58, 138, 0.15)",
      },
    ],
    spin: -360,
    spinDuration: 32,
    gifFramesPerTurn: -42,
  },
  {
    name: "Middle purple/magenta vortex",
    filterId: "bh-glow-mid",
    gradientId: "mid-vortex",
    radius: 130,
    strokeWidth: 16,
    arms: [
      {
        d: "M 200 200 Q 250 140 280 200 T 200 310",
        stroke: "rgba(219, 39, 119, 0.25)",
      },
      {
        d: "M 200 200 Q 150 260 120 200 T 200 90",
        stroke: "rgba(109, 40, 217, 0.3)",
      },
    ],
    spin: 360,
    spinDuration: 18,
    gifFramesPerTurn: 24,
  },
  {
    name: "Inner accretion swirls",
    filterId: "bh-glow-fine",
    gradientId: "inner-vortex",
    radius: 95,
    strokeWidth: 7,
    arms: [
      {
        d: "M 200 200 Q 230 160 250 200 T 200 270",
        stroke: "rgba(124, 58, 237, 0.65)",
      },
      {
        d: "M 200 200 Q 170 240 150 200 T 200 130",
        stroke: "rgba(29, 78, 216, 0.45)",
      },
    ],
    spin: -360,
    spinDuration: 9,
    gifFramesPerTurn: -12,
  },
];

/** Singularity event horizon: a glowing rim over a pitch black disk. */
export const VOID_CORE = {
  gradientId: "core-glow",
  glowRadius: 55,
  radius: 53,
  color: "#000000",
} as const;

/** Rotation of a layer at the given GIF frame, in degrees. */
export function getLayerGifRotation(layer: VoidLayer, frame: number) {
  return (360 * frame) / layer.gifFramesPerTurn;
}
