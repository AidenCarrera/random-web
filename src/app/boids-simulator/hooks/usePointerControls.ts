import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useCallback, useMemo, useRef } from "react";

import type { PointerMode, PointerState } from "../types";

type TrackedPointer = {
  x: number;
  y: number;
  mode: PointerMode;
};

/** Reduces multi-pointer input to a single influence point (1 touch attracts/repels, 2+ repels). */
export function usePointerControls() {
  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    active: false,
    pressed: false,
    mode: "attract",
  });
  const trackedRef = useRef(new Map<number, TrackedPointer>());

  // Cached so a drag does not force a layout read on every pointermove.
  const boundsRef = useRef({ left: 0, top: 0 });

  const refreshBounds = useCallback((canvas: HTMLCanvasElement) => {
    const bounds = canvas.getBoundingClientRect();
    boundsRef.current.left = bounds.left;
    boundsRef.current.top = bounds.top;
  }, []);

  const pointerHandlers = useMemo(() => {
    const syncPointerState = () => {
      const tracked = trackedRef.current;
      const pointer = pointerRef.current;
      if (tracked.size === 0) {
        pointer.active = false;
        pointer.pressed = false;
        return;
      }

      let totalX = 0;
      let totalY = 0;
      let firstMode: PointerMode | null = null;
      for (const contact of tracked.values()) {
        firstMode ??= contact.mode;
        totalX += contact.x;
        totalY += contact.y;
      }

      pointer.x = totalX / tracked.size;
      pointer.y = totalY / tracked.size;
      pointer.active = true;
      pointer.pressed = true;
      pointer.mode = tracked.size >= 2 ? "repel" : (firstMode ?? pointer.mode);
    };

    const trackPointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const bounds = boundsRef.current;
      const tracked = trackedRef.current.get(event.pointerId);
      trackedRef.current.set(event.pointerId, {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        // The button is only known on pointer down, so the mode sticks.
        mode: tracked?.mode ?? (event.button === 2 ? "repel" : "attract"),
      });
      syncPointerState();
    };

    const releasePointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      trackedRef.current.delete(event.pointerId);
      syncPointerState();
    };

    return {
      onPointerDown: (event: ReactPointerEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        // One layout read per gesture; the canvas cannot move mid-drag.
        refreshBounds(event.currentTarget);
        trackPointer(event);
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove: (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (trackedRef.current.has(event.pointerId)) trackPointer(event);
      },
      onPointerUp: (event: ReactPointerEvent<HTMLCanvasElement>) => {
        releasePointer(event);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      },
      onPointerCancel: releasePointer,
      onPointerLeave: () => {
        if (trackedRef.current.size === 0) pointerRef.current.active = false;
      },
      // Right-click repels, so the context menu must stay out of the way.
      onContextMenu: (event: ReactMouseEvent<HTMLCanvasElement>) =>
        event.preventDefault(),
    };
  }, [refreshBounds]);

  return { pointerHandlers, pointerRef, refreshBounds };
}
