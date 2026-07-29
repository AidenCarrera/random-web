"use client";

import { useCallback, useEffect, useRef, type MouseEvent } from "react";

import { HOLD_DELAY } from "../config";

/**
 * Separates a tap from a press-and-hold on the same element. Holding reports
 * `held` immediately and swallows the click that follows; tapping reports the
 * shift key instead, so both gestures reach the same handler.
 */
export function useHoldPress<T>(onPress: (item: T, held: boolean) => void) {
  const timerRef = useRef<number | null>(null);
  const heldRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  return useCallback(
    (item: T) => ({
      onPointerDown: () => {
        clearTimer();
        heldRef.current = false;
        timerRef.current = window.setTimeout(() => {
          heldRef.current = true;
          onPress(item, true);
        }, HOLD_DELAY);
      },
      onPointerUp: clearTimer,
      onPointerLeave: clearTimer,
      onPointerCancel: clearTimer,
      onClick: (event: MouseEvent) => {
        clearTimer();
        if (heldRef.current) {
          heldRef.current = false;
          event.preventDefault();
          return;
        }
        onPress(item, event.shiftKey);
      },
    }),
    [clearTimer, onPress],
  );
}
