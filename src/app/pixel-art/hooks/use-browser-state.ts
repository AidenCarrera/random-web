import { useSyncExternalStore } from "react";

const COARSE_POINTER_QUERY = "(pointer: coarse)";

export const isCoarsePointer = () =>
  window.matchMedia(COARSE_POINTER_QUERY).matches ||
  navigator.maxTouchPoints > 0;

function subscribeToPointerType(onChange: () => void) {
  const query = window.matchMedia(COARSE_POINTER_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

const getLocationSnapshot = () => window.location.href;
const getFalseSnapshot = () => false;
const getEmptySnapshot = () => "";

/** Browser-only facts, resolved after hydration so the server render stays inert. */
export function useBrowserState() {
  return {
    isTouchDevice: useSyncExternalStore(
      subscribeToPointerType,
      isCoarsePointer,
      getFalseSnapshot,
    ),
    shareUrl: useSyncExternalStore(
      subscribeToLocation,
      getLocationSnapshot,
      getEmptySnapshot,
    ),
  };
}
