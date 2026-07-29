import type { Particle } from "../types";

type Origin = { x: number; y: number };

/** Used when the textarea or void has not been measured yet. */
const OFFSCREEN_ORIGIN: Origin = { x: -450, y: 0 };

/**
 * Replays the textarea's own line wrapping to find where every character sits
 * on screen, expressed as an offset from the center of the void.
 */
function getTextParticleOrigins(
  text: string,
  textarea: HTMLTextAreaElement | null,
  voidCenter: HTMLElement | null,
): Origin[] {
  if (!textarea || !voidCenter) {
    return text.split("").map(() => OFFSCREEN_ORIGIN);
  }

  const textRect = textarea.getBoundingClientRect();
  const voidRect = voidCenter.getBoundingClientRect();
  const style = window.getComputedStyle(textarea);
  const measureCanvas = document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d");
  const fontSize = parseFloat(style.fontSize) || 14;
  const lineHeight =
    parseFloat(style.lineHeight) || Math.round(fontSize * 1.45);
  const paddingLeft = parseFloat(style.paddingLeft) || 0;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const contentWidth =
    textarea.clientWidth - paddingLeft - (parseFloat(style.paddingRight) || 0);
  const voidCenterX = voidRect.left + voidRect.width / 2;
  const voidCenterY = voidRect.top + voidRect.height / 2;
  const origins: Origin[] = [];

  if (ctx) {
    ctx.font = style.font;
  }

  let cursorX = 0;
  let cursorY = 0;

  text.split("").forEach((char) => {
    const charWidth = ctx
      ? ctx.measureText(char || " ").width
      : fontSize * 0.62;

    if (char === "\n") {
      origins.push({
        x: textRect.left + paddingLeft + cursorX - voidCenterX,
        y: textRect.top + paddingTop + cursorY + lineHeight * 0.5 - voidCenterY,
      });
      cursorX = 0;
      cursorY += lineHeight;
      return;
    }

    if (cursorX + charWidth > contentWidth && cursorX > 0) {
      cursorX = 0;
      cursorY += lineHeight;
    }

    origins.push({
      x: textRect.left + paddingLeft + cursorX + charWidth * 0.5 - voidCenterX,
      y: textRect.top + paddingTop + cursorY + lineHeight * 0.5 - voidCenterY,
    });
    cursorX += charWidth;
  });

  return origins;
}

/** Turns a submitted message into one particle per character. */
export function createShredParticles(
  text: string,
  textarea: HTMLTextAreaElement | null,
  voidCenter: HTMLElement | null,
): Particle[] {
  const origins = getTextParticleOrigins(text, textarea, voidCenter);

  return text.split("").map((char, index) => {
    const origin = origins[index] ?? OFFSCREEN_ORIGIN;

    return {
      id: index,
      char,
      startX: origin.x,
      startY: origin.y,
      startRotation: Math.random() * 360,
    };
  });
}
