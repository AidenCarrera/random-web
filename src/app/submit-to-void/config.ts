export const MOBILE_BREAKPOINT = 768;
export const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px), (pointer: coarse)`;
export const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

export const MAX_COMPLAINT_LENGTH = 140;

/** Canvas backdrop; mirrors the `bg-[#07060c]` page class. */
export const VOID_BACKGROUND = "#07060c";

/** Void scale gained per typed character, on top of the resting mass of 1. */
export const VOID_MASS_PER_CHAR = 0.008;
/** Scale the void settles on right after it swallows a message. */
export const DIGESTING_VOID_MASS = 1.8;

/** Shred timings in ms, picked by motion preference then viewport. */
export const SHRED_TIMINGS = {
  reduced: { purple: 80, suction: 220 },
  mobile: { purple: 360, suction: 1280 },
  desktop: { purple: 720, suction: 1900 },
} as const;

/** How long the "spaghettifying" card stays up before typing resumes. */
export const DIGESTING_DURATION_MS = { mobile: 700, desktop: 1100 } as const;

export const SHRED_FPS = { mobile: 30, desktop: 60 } as const;

/** Star counts and frame budget for the live background field. */
export const BACKGROUND_STARS = {
  mobile: { total: 190, foreground: 42, fps: 30 },
  desktop: { total: 620, foreground: 110, fps: 50 },
} as const;

/** Background stars drift far slower than their GIF counterparts. */
export const LIVE_STAR_SPEED_MULTIPLIER = 0.38;

/** Debounce before the background field resizes and respawns its stars. */
export const BACKGROUND_RESIZE_DELAY_MS = 160;

export const GIF_SIZE = 420;
export const GIF_FRAMES = 56;
export const GIF_DELAY_MS = 45;
/** Frames spent tinting the phrase purple before the suction begins. */
export const GIF_PURPLE_FRAMES = 18;
export const GIF_VOID_SIZE = 244;
export const GIF_VOID_X = 146;
export const GIF_VOID_Y = 88;
export const GIF_VOID_CENTER_X = GIF_VOID_X + GIF_VOID_SIZE / 2;
export const GIF_VOID_CENTER_Y = GIF_VOID_Y + GIF_VOID_SIZE / 2;
export const GIF_STAR_DRIFT_PER_FRAME = 0.72;
export const GIF_STAR_COUNT = 240;
/** Stars past this index sit in the deep, slow-moving background. */
export const GIF_STAR_FOREGROUND_COUNT = 40;

/** Phones export a smaller, shorter GIF so encoding stays responsive. */
export const GIF_MOBILE_SIZE = 300;
export const GIF_MOBILE_FRAMES = 32;
/** Encoding yields to the main thread every this many frames. */
export const GIF_YIELD_EVERY_FRAMES = 8;
export const GIF_FILE_NAME = "submit-to-void-blackhole.gif";
export const GIF_FALLBACK_TEXT = "THE VOID";
