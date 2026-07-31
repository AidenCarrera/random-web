"use client";

import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { canvasToBlob } from "@/lib/canvasExport";

import { useLatestRef } from "./hooks/useLatestRef";
import { usePointerControls } from "./hooks/usePointerControls";
import {
  createEmptyFlock,
  createFlock,
  getFrameScale,
  resizeFlock,
  scaleFlock,
  scatterFlock,
  stepFlock,
  type FlockStep,
} from "./lib/flock";
import { createFlockRenderer } from "./lib/renderer";
import { SpatialGrid } from "./lib/spatial-grid";
import type { BoidsCanvasHandle, BoidsMetrics, BoidsSettings } from "./types";

type BoidsCanvasProps = {
  /** Reflects boids off the canvas edges instead of wrapping them around it. */
  bounceEdges: boolean;
  onMetrics: (metrics: BoidsMetrics) => void;
  paused: boolean;
  settings: BoidsSettings;
  /** Metrics are only reported while the readout is on screen. */
  showStats: boolean;
  trails: boolean;
};

/** How often frame rate and neighbor averages are reported, in milliseconds. */
const METRICS_INTERVAL = 600;
const MAX_PIXEL_RATIO = 2;

const pixelRatio = () =>
  Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);

export const BoidsCanvas = memo(
  forwardRef<BoidsCanvasHandle, BoidsCanvasProps>(function BoidsCanvas(
    { bounceEdges, onMetrics, paused, settings, showStats, trails },
    forwardedRef,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const flockRef = useRef(createEmptyFlock());
    const reseedRef = useRef(true);
    const bounceEdgesRef = useLatestRef(bounceEdges);
    const settingsRef = useLatestRef(settings);
    const pausedRef = useLatestRef(paused);
    const showStatsRef = useLatestRef(showStats);
    const trailsRef = useLatestRef(trails);
    const { pointerHandlers, pointerRef, refreshBounds } = usePointerControls();

    useImperativeHandle(
      forwardedRef,
      () => ({
        reseed: () => {
          reseedRef.current = true;
        },
        scatter: () => scatterFlock(flockRef.current),
        snapshot: async () => {
          const canvas = canvasRef.current;
          if (!canvas) return null;
          const blob = await canvasToBlob(canvas);
          return {
            blob,
            fileName: `boids-simulator-${Date.now()}.png`,
            imageSrc: URL.createObjectURL(blob),
          };
        },
      }),
      [],
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      const parent = canvas?.parentElement;
      if (!canvas || !parent) return;

      const renderer = createFlockRenderer(canvas);
      if (!renderer) return;

      const grid = new SpatialGrid();
      // Reused every frame so the loop allocates nothing.
      const step: FlockStep = {
        flock: flockRef.current,
        bounceEdges: bounceEdgesRef.current,
        delta: 1,
        grid,
        height: 1,
        pointer: pointerRef.current,
        settings: settingsRef.current,
        width: 1,
      };

      let width = 1;
      let height = 1;
      let ratio = pixelRatio();

      const applySize = (nextWidth: number, nextHeight: number) => {
        const previousWidth = width;
        const previousHeight = height;
        width = Math.max(1, nextWidth);
        height = Math.max(1, nextHeight);
        ratio = pixelRatio();

        renderer.resize(width, height, ratio);
        refreshBounds(canvas);
        if (
          flockRef.current.count > 0 &&
          previousWidth > 1 &&
          previousHeight > 1
        ) {
          scaleFlock(
            flockRef.current,
            width / previousWidth,
            height / previousHeight,
          );
        }
      };

      const bounds = parent.getBoundingClientRect();
      applySize(bounds.width, bounds.height);

      // `contentRect` is already measured, so reading it costs no extra layout.
      const observer = new ResizeObserver((entries) => {
        const entry = entries[entries.length - 1];
        applySize(entry.contentRect.width, entry.contentRect.height);
      });
      observer.observe(parent);

      let previousTime = performance.now();
      let metricsTime = previousTime;
      let frames = 0;
      let neighborSamples = 0;

      const render = (time: number) => {
        frame = requestAnimationFrame(render);
        const currentSettings = settingsRef.current;
        const delta = getFrameScale(time - previousTime);
        previousTime = time;

        if (reseedRef.current) {
          flockRef.current = createFlock(
            currentSettings.count,
            width,
            height,
            currentSettings,
          );
          reseedRef.current = false;
        } else {
          resizeFlock(
            flockRef.current,
            currentSettings.count,
            width,
            height,
            currentSettings,
          );
        }

        const flock = flockRef.current;
        step.flock = flock;
        step.bounceEdges = bounceEdgesRef.current;
        step.delta = delta;
        step.height = height;
        step.settings = currentSettings;
        step.width = width;

        const paused = pausedRef.current;
        const totalNeighbors = paused ? 0 : stepFlock(step);
        // A paused frame advances no time, so trails hold instead of decaying in place.
        renderer.draw(flock, trailsRef.current, paused ? 0 : delta);

        frames += 1;
        neighborSamples += totalNeighbors / Math.max(1, flock.count);
        if (time - metricsTime >= METRICS_INTERVAL) {
          // Avoid re-rendering state when metrics overlay is hidden.
          if (showStatsRef.current) {
            onMetrics({
              fps: Math.round((frames * 1000) / (time - metricsTime)),
              neighbors: Math.round(neighborSamples / Math.max(1, frames)),
            });
          }
          frames = 0;
          neighborSamples = 0;
          metricsTime = time;
        }
      };

      let frame = requestAnimationFrame(render);
      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
        renderer.dispose();
      };
    }, [
      bounceEdgesRef,
      onMetrics,
      pausedRef,
      pointerRef,
      refreshBounds,
      settingsRef,
      showStatsRef,
      trailsRef,
    ]);

    return (
      <canvas
        ref={canvasRef}
        aria-label="Interactive Boids Simulator"
        {...pointerHandlers}
      />
    );
  }),
);
