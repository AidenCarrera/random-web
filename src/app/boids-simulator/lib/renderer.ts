import type { FlockRenderer } from "../types";
import { createCanvasFlockRenderer } from "./canvas-renderer";
import { createWebglFlockRenderer } from "./webgl-renderer";

/**
 * Instantiates the WebGL2 renderer, falling back to 2D context if unavailable.
 * Must run before other operations access the canvas context.
 */
export function createFlockRenderer(
  canvas: HTMLCanvasElement,
): FlockRenderer | null {
  return createWebglFlockRenderer(canvas) ?? createCanvasFlockRenderer(canvas);
}
