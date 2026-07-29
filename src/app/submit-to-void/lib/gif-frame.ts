import {
  GIF_FRAMES,
  GIF_PURPLE_FRAMES,
  GIF_SIZE,
  GIF_STAR_DRIFT_PER_FRAME,
  GIF_VOID_CENTER_X,
  GIF_VOID_CENTER_Y,
  GIF_VOID_SIZE,
  GIF_VOID_X,
  GIF_VOID_Y,
  VOID_BACKGROUND,
} from "../config";
import type { GifGlyph, Star } from "../types";
import { getShredTint, getSuctionOffset } from "../utils/shred-motion";
import { drawStar } from "./stars";

const GIF_FONT =
  "900 15px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const GLYPH_MAX_WIDTH = 165;
const GLYPH_LINE_HEIGHT = 18;
const GLYPH_BLOCK_CENTER_X = 110;
/** Shown when the message was only whitespace. */
const EMPTY_PHRASE = "VOID";

/** Applies the phrase text style; callers restore the context themselves. */
function applyPhraseFont(ctx: CanvasRenderingContext2D) {
  ctx.font = GIF_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
}

/** Greedily wraps `text` to the phrase column, keeping explicit newlines. */
function wrapPhrase(ctx: CanvasRenderingContext2D, text: string): string[] {
  const rawLines = text.trim().length > 0 ? text.split("\n") : [EMPTY_PHRASE];
  const lines: string[] = [];

  rawLines.forEach((rawLine) => {
    if (!rawLine.length) {
      lines.push("");
      return;
    }

    let currentLine = "";
    rawLine.split(" ").forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(candidate).width <= GLYPH_MAX_WIDTH || !currentLine) {
        currentLine = candidate;
        return;
      }

      lines.push(currentLine);
      currentLine = word;
    });

    lines.push(currentLine);
  });

  return lines;
}

/**
 * Lays the message out into per-character positions. The layout is identical
 * for every frame, so callers measure once and reuse the result.
 */
export function createGifGlyphs(
  ctx: CanvasRenderingContext2D,
  text: string,
): GifGlyph[] {
  ctx.save();
  applyPhraseFont(ctx);

  const lines = wrapPhrase(ctx, text);
  const blockHeight = Math.max(lines.length, 1) * GLYPH_LINE_HEIGHT;
  const startY = GIF_SIZE / 2 - blockHeight / 2 + 4;
  const glyphs: GifGlyph[] = [];

  lines.forEach((line, lineIndex) => {
    const lineWidth = ctx.measureText(line).width;
    let cursorX = GLYPH_BLOCK_CENTER_X - lineWidth / 2;
    const y = startY + lineIndex * GLYPH_LINE_HEIGHT;

    line.split("").forEach((char) => {
      const charWidth = ctx.measureText(char || " ").width;
      glyphs.push({ char, x: cursorX + charWidth / 2, y });
      cursorX += charWidth;
    });
  });

  ctx.restore();
  return glyphs;
}

/** Paints the backdrop, drifting stars, and the black hole for one frame. */
export function drawVoidGifFrame(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  stars: Star[],
  frame: number,
) {
  const size = GIF_SIZE;
  const drift = frame * GIF_STAR_DRIFT_PER_FRAME;

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = VOID_BACKGROUND;
  ctx.fillRect(0, 0, size, size);

  stars.forEach((star) => {
    const starX = star.x * size;
    const starY = (star.y * size + drift * star.baseSpeed * 8) % size;

    drawStar(ctx, starX, starY, star);
  });

  ctx.drawImage(image, GIF_VOID_X, GIF_VOID_Y, GIF_VOID_SIZE, GIF_VOID_SIZE);
}

/** Draws the message glyphs mid-swirl, matching the on-screen shred. */
export function drawGifPhraseFrame(
  ctx: CanvasRenderingContext2D,
  glyphs: GifGlyph[],
  frame: number,
) {
  ctx.save();
  applyPhraseFont(ctx);

  const purpleProgress = Math.min(1, frame / GIF_PURPLE_FRAMES);
  const suctionProgress =
    frame <= GIF_PURPLE_FRAMES
      ? 0
      : Math.min(
          1,
          (frame - GIF_PURPLE_FRAMES) / (GIF_FRAMES - GIF_PURPLE_FRAMES - 1),
        );

  const { red, green, blue, glow } = getShredTint(purpleProgress);

  glyphs.forEach((glyph, index) => {
    const dx = GIF_VOID_CENTER_X - glyph.x;
    const dy = GIF_VOID_CENTER_Y - glyph.y;
    let x = glyph.x;
    let y = glyph.y;
    let rotation = 0;
    let scale = 1.04 + Math.sin(purpleProgress * Math.PI) * 0.06;

    if (suctionProgress > 0) {
      // Offsets point at the void, so the swirl is subtracted from its center.
      const offset = getSuctionOffset(dx, dy, suctionProgress, index);
      x = GIF_VOID_CENTER_X - offset.x;
      y = GIF_VOID_CENTER_Y - offset.y;
      rotation = suctionProgress * 540 + Math.sin(index) * 18;
      scale = (1 - suctionProgress) * 1.08;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    ctx.shadowBlur = 12 * purpleProgress;
    ctx.shadowColor = `rgba(168,85,247,${glow})`;
    ctx.fillText(glyph.char, 0, 0);
    ctx.restore();
  });

  ctx.restore();
}
