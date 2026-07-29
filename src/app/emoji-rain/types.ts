export type Category =
  | "rain"
  | "money"
  | "love"
  | "food"
  | "space"
  | "music"
  | "tech"
  | "ocean"
  | "animals"
  | "nature"
  | "party"
  | "sports"
  | "magic"
  | "spooky"
  | "fire"
  | "faces";

export type Theme = {
  from: string;
  to: string;
  isDark: boolean;
  /** Tailwind text color class for the headline. */
  color: string;
  /** Hex accent used by selected buttons and slider fills. */
  accent: string;
};

export type Drop = {
  x: number;
  y: number;
  speed: number;
  emoji: string;
};
