import {
  GIF_DELAY_MS,
  GIF_FRAMES,
  GIF_MOBILE_FRAMES,
  GIF_MOBILE_SIZE,
  GIF_SIZE,
  GIF_YIELD_EVERY_FRAMES,
} from "../config";
import {
  createGifGlyphs,
  drawGifPhraseFrame,
  drawVoidGifFrame,
} from "./gif-frame";
import { createGifStars } from "./stars";
import { createVoidSvgMarkup, loadSvgImage } from "./void-svg";

/**
 * Encodes the looping black hole GIF. Phones render a smaller, shorter clip,
 * and the loop yields to the main thread periodically so the page stays
 * responsive while encoding.
 */
export async function renderVoidGif({
  text,
  mass,
  isMobile,
}: {
  text: string;
  mass: number;
  isMobile: boolean;
}): Promise<Blob> {
  const { GIFEncoder, applyPalette, quantize } = await import("gifenc");
  const exportSize = isMobile ? GIF_MOBILE_SIZE : GIF_SIZE;
  const frameCount = isMobile ? GIF_MOBILE_FRAMES : GIF_FRAMES;
  const frameDelay = Math.round((GIF_DELAY_MS * GIF_FRAMES) / frameCount);

  const canvas = document.createElement("canvas");
  canvas.width = exportSize;
  canvas.height = exportSize;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    throw new Error("Unable to start GIF renderer.");
  }

  const gif = GIFEncoder();
  const stars = createGifStars();
  ctx.setTransform(exportSize / GIF_SIZE, 0, 0, exportSize / GIF_SIZE, 0, 0);
  // The phrase layout never changes between frames, so measure it once.
  const glyphs = createGifGlyphs(ctx, text);

  for (let frame = 0; frame < frameCount; frame += 1) {
    const sourceFrame = Math.round(
      (frame / Math.max(1, frameCount - 1)) * (GIF_FRAMES - 1),
    );
    const voidImage = await loadSvgImage(
      createVoidSvgMarkup(sourceFrame, mass),
    );
    drawVoidGifFrame(ctx, voidImage, stars, sourceFrame);
    drawGifPhraseFrame(ctx, glyphs, sourceFrame);

    const rgba = ctx.getImageData(0, 0, exportSize, exportSize).data;
    const palette = quantize(rgba, 256, { format: "rgb444" });
    const index = applyPalette(rgba, palette, "rgb444");
    gif.writeFrame(index, exportSize, exportSize, {
      palette,
      delay: frameDelay,
      repeat: 0,
    });

    if (frame % GIF_YIELD_EVERY_FRAMES === 0) {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    }
  }

  gif.finish();
  const bytes = gif.bytes();
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);

  return new Blob([buffer], { type: "image/gif" });
}
