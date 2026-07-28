"use client";

import { useCallback, useEffect, useRef } from "react";

import { COLORS, SORT_NAMES, createSortRecord } from "../lib/algorithms";
import { drawBars } from "../lib/draw-bars";
import type { SortName } from "../types";

/** Owns the per-algorithm canvas elements and the last frame painted to each. */
export function useSortCanvases() {
  const canvasesRef = useRef<Record<SortName, HTMLCanvasElement | null>>(
    createSortRecord(() => null),
  );
  const lastFrameRef = useRef<Record<SortName, ArrayLike<number>>>(
    createSortRecord(() => [] as ArrayLike<number>),
  );

  const registerCanvas = useCallback(
    (name: SortName, canvas: HTMLCanvasElement | null) => {
      canvasesRef.current[name] = canvas;
    },
    [],
  );

  const paint = useCallback((name: SortName, values: ArrayLike<number>) => {
    lastFrameRef.current[name] = values;
    const canvas = canvasesRef.current[name];
    if (canvas) drawBars(canvas, values, COLORS[name]);
  }, []);

  const repaintAll = useCallback(() => {
    for (const name of SORT_NAMES) paint(name, lastFrameRef.current[name]);
  }, [paint]);

  useEffect(() => {
    window.addEventListener("resize", repaintAll);
    return () => window.removeEventListener("resize", repaintAll);
  }, [repaintAll]);

  return { registerCanvas, paint, repaintAll };
}
