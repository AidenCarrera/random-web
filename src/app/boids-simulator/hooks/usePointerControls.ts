import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useMemo, useRef } from "react";

import type { PointerMode, PointerState } from "../types";

type TrackedPointer = {
  x: number;
  y: number;
  mode: PointerMode;
};

/**
 * Tracks every pointer on the canvas and reduces them to one influence point:
 * a single contact attracts (right button repels), two or more always repel.
 */
export function usePointerControls() {
  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    active: false,
    pressed: false,
    mode: "attract",
  });
  const trackedRef = useRef(new Map<number, TrackedPointer>());

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
      const bounds = event.currentTarget.getBoundingClientRect();
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
  }, []);

  return { pointerHandlers, pointerRef };
}
