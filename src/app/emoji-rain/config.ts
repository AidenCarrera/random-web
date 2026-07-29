import type { Category } from "./types";

export const DEFAULT_CATEGORY: Category = "money";

/** Drops spawned per frame at 100% intensity. */
export const MAX_SPAWN_RATE = 3;
export const DEFAULT_INTENSITY = 15;

export const SPEED_MIN = 0.1;
export const SPEED_MAX = 2;
export const SPEED_STEP = 0.1;
export const DEFAULT_SPEED = 1;

/** Pointer hold duration that mixes a category instead of selecting it. */
export const HOLD_DELAY = 325;

/** Side length of the offscreen canvas each emoji is rasterized into. */
export const EMOJI_SIZE = 48;

/** Below this width the controls start out minimized. */
export const COMPACT_MEDIA_QUERY = "(max-width: 640px)";
