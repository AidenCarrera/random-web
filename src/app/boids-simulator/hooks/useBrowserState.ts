import { useSyncExternalStore } from "react";

import { MOBILE_VIEWPORT_QUERY } from "../constants";

const TOUCH_QUERY = "(pointer: coarse)";

function subscribeToTouchCapability(onChange: () => void) {
  const query = window.matchMedia(TOUCH_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function subscribeToMobileViewport(onChange: () => void) {
  const query = window.matchMedia(MOBILE_VIEWPORT_QUERY);
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

const getTouchSnapshot = () =>
  window.matchMedia(TOUCH_QUERY).matches || navigator.maxTouchPoints > 0;
const getMobileSnapshot = () =>
  window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
const getLocationSnapshot = () => window.location.href;
const getFalseSnapshot = () => false;
const getEmptySnapshot = () => "";

export function useBrowserState() {
  return {
    isTouchDevice: useSyncExternalStore(
      subscribeToTouchCapability,
      getTouchSnapshot,
      getFalseSnapshot,
    ),
    isMobileViewport: useSyncExternalStore(
      subscribeToMobileViewport,
      getMobileSnapshot,
      getFalseSnapshot,
    ),
    shareUrl: useSyncExternalStore(
      subscribeToLocation,
      getLocationSnapshot,
      getEmptySnapshot,
    ),
  };
}
