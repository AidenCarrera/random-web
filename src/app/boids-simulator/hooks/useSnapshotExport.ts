import type { RefObject } from "react";
import { useCallback, useEffect, useState } from "react";

import type { BoidsCanvasHandle, BoidsSnapshot } from "../types";

/** Captures the canvas as a PNG and keeps its object URL alive until dismissed. */
export function useSnapshotExport(
  canvasRef: RefObject<BoidsCanvasHandle | null>,
) {
  const [snapshot, setSnapshot] = useState<BoidsSnapshot | null>(null);

  const closeSnapshot = useCallback(() => {
    setSnapshot((current) => {
      if (current) URL.revokeObjectURL(current.imageSrc);
      return null;
    });
  }, []);

  useEffect(
    () => () => {
      if (snapshot) URL.revokeObjectURL(snapshot.imageSrc);
    },
    [snapshot],
  );

  const captureSnapshot = useCallback(async () => {
    const nextSnapshot = await canvasRef.current?.snapshot();
    if (!nextSnapshot) return;
    setSnapshot((current) => {
      if (current) URL.revokeObjectURL(current.imageSrc);
      return nextSnapshot;
    });
  }, [canvasRef]);

  const saveSnapshot = useCallback(async () => {
    if (!snapshot) return;

    try {
      const pngFile = new File([snapshot.blob], snapshot.fileName, {
        type: "image/png",
      });
      const canShareFile =
        "share" in navigator &&
        "canShare" in navigator &&
        navigator.canShare({ files: [pngFile] });

      if (canShareFile) {
        await navigator.share({
          files: [pngFile],
          title: "Boids Simulator",
          text: "Save this Boids Simulator snapshot.",
        });
        return;
      }

      window.open(snapshot.imageSrc, "_blank", "noopener,noreferrer");
    } catch {}
  }, [snapshot]);

  return { captureSnapshot, closeSnapshot, saveSnapshot, snapshot };
}
