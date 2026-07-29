"use client";

import { useEffect, useState } from "react";

import { MOBILE_MEDIA_QUERY } from "../config";

/** Tracks small or touch-first viewports, which get cheaper animations. */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MEDIA_QUERY);
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}
