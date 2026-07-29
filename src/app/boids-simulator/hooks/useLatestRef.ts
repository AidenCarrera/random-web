import { useEffect, useRef } from "react";

/** Mirrors a prop into a ref so long-lived loops can read it without restarting. */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
