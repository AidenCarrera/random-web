import type { RefObject } from "react";
import { useCallback, useEffect, useState } from "react";

import type {
  FallingSandCanvasHandle,
  FallingSandSnapshot,
  ToastState,
} from "../types";

type ShowToast = (message: string, tone: ToastState["tone"]) => void;

export function useSnapshotExport(
  canvasRef: RefObject<FallingSandCanvasHandle | null>,
  showToast: ShowToast,
) {
  const [snapshot, setSnapshot] = useState<FallingSandSnapshot | null>(null);

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

  const exportWorld = useCallback(async () => {
    try {
      const nextSnapshot = await canvasRef.current?.snapshot();
      if (!nextSnapshot) throw new Error("The sandbox is not ready yet.");
      setSnapshot((current) => {
        if (current) URL.revokeObjectURL(current.imageSrc);
        return nextSnapshot;
      });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to export this world.",
        "error",
      );
    }
  }, [canvasRef, showToast]);

  const saveSnapshot = useCallback(async () => {
    if (!snapshot) return;
    try {
      const file = new File([snapshot.blob], snapshot.fileName, {
        type: "image/png",
      });
      if (
        "share" in navigator &&
        "canShare" in navigator &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Falling Sand",
          text: "A world I made in Falling Sand.",
        });
        return;
      }
      window.open(snapshot.imageSrc, "_blank", "noopener,noreferrer");
    } catch {}
  }, [snapshot]);

  return { closeSnapshot, exportWorld, saveSnapshot, snapshot };
}
