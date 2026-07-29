import type { EmojiCategory, Theme } from "./types";

// prettier-ignore
export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: "flora",
    name: "Plants",
    icon: "🌱",
    emojis: ["🌱", "🌿", "🍀", "🌵", "🌴", "🌲", "🌳", "🍁", "🍂", "🍃", "🌻", "🌹", "🌷", "🌼", "🌸", "🌺", "🪷", "🍄", "🌾", "🎋"],
  },
  {
    id: "stones",
    name: "Stones and Decorations",
    icon: "🪨",
    emojis: ["🪨", "🪵", "💎", "🔮", "🧱", "🏮", "⛩️", "⛲", "🗿", "🔔"],
  },
  {
    id: "fauna",
    name: "Animals",
    icon: "🦋",
    emojis: ["🦋", "🐞", "🐌", "🐝", "🦚", "🐸", "🐢", "🐟", "🐠", "🦆", "🐦", "🐉"],
  },
  {
    id: "zen",
    name: "Misc",
    icon: "🧘",
    emojis: ["🧘", "📿", "🕯️", "🏺", "🎐", "🍵", "⛅", "🌙", "⭐", "🌈"],
  },
];

export const THEMES: Theme[] = [
  {
    id: "shirakawa",
    name: "White Sand",
    bg: "#f3efe6",
    grooveColor: "rgba(180, 168, 145, 0.45)",
    shadowColor: "rgba(100, 90, 80, 0.12)",
    highlightColor: "rgba(255, 255, 255, 0.9)",
    grainOpacity: 0.08,
    textColor: "text-zinc-800",
  },
  {
    id: "dune",
    name: "Golden Sand",
    bg: "#f3d298",
    grooveColor: "rgba(145, 105, 55, 0.45)",
    shadowColor: "rgba(80, 50, 20, 0.12)",
    highlightColor: "rgba(255, 253, 240, 0.85)",
    grainOpacity: 0.09,
    textColor: "text-amber-950",
  },
  {
    id: "moss",
    name: "Grass Green",
    bg: "#3b873e",
    grooveColor: "rgba(20, 60, 20, 0.45)",
    shadowColor: "rgba(10, 35, 10, 0.22)",
    highlightColor: "rgba(255, 255, 255, 0.26)",
    grainOpacity: 0.12,
    textColor: "text-emerald-50",
  },
  {
    id: "obsidian",
    name: "Black Sand",
    bg: "#16161c",
    grooveColor: "rgba(0, 0, 0, 0.6)",
    shadowColor: "rgba(0, 0, 0, 0.8)",
    highlightColor: "rgba(255, 255, 255, 0.07)",
    grainOpacity: 0.05,
    textColor: "text-zinc-200",
  },
  {
    id: "clay",
    name: "Red Clay",
    bg: "#c88566",
    grooveColor: "rgba(140, 70, 40, 0.45)",
    shadowColor: "rgba(80, 30, 10, 0.15)",
    highlightColor: "rgba(255, 220, 200, 0.7)",
    grainOpacity: 0.1,
    textColor: "text-orange-950",
  },
];
