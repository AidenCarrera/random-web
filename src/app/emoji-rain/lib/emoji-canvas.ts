import { EMOJI_SIZE } from "../config";

const emojiCache = new Map<string, HTMLCanvasElement>();

/**
 * Rasterizes an emoji once into an offscreen canvas so the animation loop can
 * blit it instead of paying for text layout on every frame.
 */
export const getEmojiCanvas = (emoji: string) => {
  const cached = emojiCache.get(emoji);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = EMOJI_SIZE;
  canvas.height = EMOJI_SIZE;

  const context = canvas.getContext("2d");
  if (!context) return null;

  context.font = "32px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(emoji, EMOJI_SIZE / 2, EMOJI_SIZE / 2);
  emojiCache.set(emoji, canvas);
  return canvas;
};
