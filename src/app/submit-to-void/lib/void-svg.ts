import { GIF_FRAMES } from "../config";
import {
  getLayerGifRotation,
  VOID_CENTER,
  VOID_CORE,
  VOID_FILTERS,
  VOID_GRADIENTS,
  VOID_LAYERS,
  VOID_VIEW_BOX,
} from "./void-geometry";

/**
 * Standalone SVG markup for one frame of the black hole, used by the GIF
 * exporter. `mass` matches the live core scale so the download reflects how
 * much the void had just eaten.
 */
export function createVoidSvgMarkup(frame: number, mass = 1) {
  const pulse = mass + Math.sin((frame / GIF_FRAMES) * Math.PI * 2) * 0.04;

  const filters = VOID_FILTERS.map(
    (filter) => `
        <filter id="${filter.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="${filter.blur}" />
        </filter>`,
  ).join("");

  const gradients = VOID_GRADIENTS.map(
    (gradient) => `
        <radialGradient id="${gradient.id}" cx="50%" cy="50%" r="50%">
          ${gradient.stops
            .map(
              (stop) =>
                `<stop offset="${stop.offset}" stop-color="${stop.color}" stop-opacity="${stop.opacity}" />`,
            )
            .join("")}
        </radialGradient>`,
  ).join("");

  const layers = VOID_LAYERS.map(
    (layer) => `
      <g transform="rotate(${getLayerGifRotation(layer, frame)} ${VOID_CENTER} ${VOID_CENTER})">
        <circle cx="${VOID_CENTER}" cy="${VOID_CENTER}" r="${layer.radius}" fill="url(#${layer.gradientId})" filter="url(#${layer.filterId})" />
        ${layer.arms
          .map(
            (arm) =>
              `<path d="${arm.d}" fill="none" stroke="${arm.stroke}" stroke-width="${layer.strokeWidth}" stroke-linecap="round" filter="url(#${layer.filterId})" />`,
          )
          .join("")}
      </g>`,
  ).join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VOID_VIEW_BOX} ${VOID_VIEW_BOX}">
      <defs>${filters}${gradients}
      </defs>
      ${layers}
      <g transform="translate(${VOID_CENTER} ${VOID_CENTER}) scale(${pulse}) translate(-${VOID_CENTER} -${VOID_CENTER})">
        <circle cx="${VOID_CENTER}" cy="${VOID_CENTER}" r="${VOID_CORE.glowRadius}" fill="url(#${VOID_CORE.gradientId})" />
        <circle cx="${VOID_CENTER}" cy="${VOID_CENTER}" r="${VOID_CORE.radius}" fill="${VOID_CORE.color}" />
      </g>
    </svg>
  `;
}

export function loadSvgImage(svgMarkup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgMarkup], {
      type: "image/svg+xml;charset=utf-8",
    });
    const objectUrl = URL.createObjectURL(svgBlob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to render black hole SVG frame."));
    };
    img.src = objectUrl;
  });
}
