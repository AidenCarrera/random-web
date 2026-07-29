"use client";

import { useCallback, useState } from "react";

import { downloadBlob } from "@/lib/canvasExport";
import { GIF_FALLBACK_TEXT, GIF_FILE_NAME } from "../config";
import { renderVoidGif } from "../lib/gif-export";
import { logVoid } from "../utils/log";

/**
 * Renders and downloads the void GIF. The export outlives the prompt that
 * starts it, so its pending flag is owned here rather than by the prompt.
 */
export function useGifExport(text: string, mass: number, isMobile: boolean) {
  const [isMakingGif, setIsMakingGif] = useState(false);

  const exportGif = useCallback(async () => {
    if (isMakingGif) return;

    setIsMakingGif(true);
    logVoid("rendering void gif...");

    try {
      const blob = await renderVoidGif({
        text: text.trim() || GIF_FALLBACK_TEXT,
        mass,
        isMobile,
      });
      downloadBlob(blob, GIF_FILE_NAME);
      logVoid("gif export complete.");
    } catch (error) {
      console.error(error);
      logVoid("gif export failed.");
    } finally {
      setIsMakingGif(false);
    }
  }, [isMakingGif, text, mass, isMobile]);

  return { isMakingGif, exportGif };
}
