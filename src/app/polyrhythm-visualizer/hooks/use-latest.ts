"use client";

import { useEffect, useRef } from "react";

/**
 * Mirrors a value into a ref so animation frames and long-lived listeners can
 * read the current value without being re-created on every change.
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
