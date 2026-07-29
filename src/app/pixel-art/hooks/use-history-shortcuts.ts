import type { Dispatch } from "react";
import { useEffect } from "react";

import type { PixelGridAction } from "./use-pixel-grid";

/** Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y to redo. */
export function useHistoryShortcuts(dispatch: Dispatch<PixelGridAction>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "z") {
        event.preventDefault();
        dispatch({ type: event.shiftKey ? "redo" : "undo" });
        return;
      }

      if (key === "y") {
        event.preventDefault();
        dispatch({ type: "redo" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);
}
