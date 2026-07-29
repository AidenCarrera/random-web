import { useCallback, useState } from "react";

import { canvasToBlob } from "@/lib/canvasExport";

import {
  createExportCanvas,
  createFileName,
  createPreviewCanvas,
} from "../lib/pixel-export";
import type { ExportPreview, PixelGrid } from "../types";

export function usePixelExport(grid: PixelGrid, size: number) {
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState<ExportPreview | null>(null);

  const openPreview = useCallback(() => {
    setIsSaving(true);

    try {
      const canvas = createPreviewCanvas(grid, size);
      if (!canvas) {
        return;
      }

      setPreview({
        fileName: createFileName(size),
        imageSrc: canvas.toDataURL("image/png"),
      });
    } finally {
      setIsSaving(false);
    }
  }, [grid, size]);

  const closePreview = useCallback(() => setPreview(null), []);

  /** Hands the PNG to the share sheet where available, otherwise opens it in a new tab. */
  const saveImage = useCallback(async () => {
    if (!preview) {
      return;
    }

    try {
      const canvas = createExportCanvas(grid, size);
      if (!canvas) {
        return;
      }

      const file = new File([await canvasToBlob(canvas)], preview.fileName, {
        type: "image/png",
      });

      if (
        "share" in navigator &&
        "canShare" in navigator &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `Pixel Studio ${size}`,
          text: "Sharing this pixel art.",
        });
        return;
      }

      window.open(preview.imageSrc, "_blank", "noopener,noreferrer");
    } catch {}
  }, [grid, preview, size]);

  return { closePreview, isSaving, openPreview, preview, saveImage };
}
