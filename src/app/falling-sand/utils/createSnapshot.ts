import { canvasToBlob } from "@/lib/canvasExport";

import type { FallingSandEngine } from "../engine";
import type { FallingSandSnapshot } from "../types";

const TARGET_WIDTH = 1200;

export async function createSnapshot(
  engine: FallingSandEngine,
): Promise<FallingSandSnapshot> {
  const worldCanvas = document.createElement("canvas");
  worldCanvas.width = engine.width;
  worldCanvas.height = engine.height;
  const worldContext = worldCanvas.getContext("2d");
  if (!worldContext) throw new Error("Unable to render the current world.");
  engine.render(worldContext);

  // Integer scale keeps every cell a crisp square block.
  const scale = Math.max(1, Math.round(TARGET_WIDTH / engine.width));
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = engine.width * scale;
  exportCanvas.height = engine.height * scale;
  const exportContext = exportCanvas.getContext("2d");
  if (!exportContext) throw new Error("Unable to prepare the PNG export.");

  exportContext.imageSmoothingEnabled = false;
  exportContext.drawImage(
    worldCanvas,
    0,
    0,
    engine.width,
    engine.height,
    0,
    0,
    exportCanvas.width,
    exportCanvas.height,
  );

  const blob = await canvasToBlob(exportCanvas);
  const date = new Date().toISOString().slice(0, 10);
  return {
    blob,
    fileName: `falling-sand-${date}.png`,
    imageSrc: URL.createObjectURL(blob),
  };
}
