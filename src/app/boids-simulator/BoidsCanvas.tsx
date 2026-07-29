"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { canvasToBlob } from "@/lib/canvasExport";

import { useLatestRef } from "./hooks/useLatestRef";
import { usePointerControls } from "./hooks/usePointerControls";
import {
  createFlock,
  getFrameScale,
  resizeFlock,
  scaleFlock,
  scatterFlock,
  stepFlock,
} from "./lib/flock";
import { drawFlock, paintBackground } from "./lib/render";
import { SpatialGrid } from "./lib/spatial-grid";
import type {
  Boid,
  BoidsCanvasHandle,
  BoidsMetrics,
  BoidsSettings,
} from "./types";

type BoidsCanvasProps = {
  onMetrics: (metrics: BoidsMetrics) => void;
  paused: boolean;
  settings: BoidsSettings;
  trails: boolean;
};

/** How often frame rate and neighbor averages are reported, in milliseconds. */
const METRICS_INTERVAL = 600;
const MAX_PIXEL_RATIO = 2;

function fitCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  canvas.width = Math.max(1, Math.floor(width * ratio));
  canvas.height = Math.max(1, Math.floor(height * ratio));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

export const BoidsCanvas = forwardRef<BoidsCanvasHandle, BoidsCanvasProps>(
  function BoidsCanvas({ onMetrics, paused, settings, trails }, forwardedRef) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const boidsRef = useRef<Boid[]>([]);
    const sizeRef = useRef({ width: 1, height: 1 });
    const reseedRef = useRef(true);
    const settingsRef = useLatestRef(settings);
    const pausedRef = useLatestRef(paused);
    const trailsRef = useLatestRef(trails);
    const { pointerHandlers, pointerRef } = usePointerControls();

    useImperativeHandle(
      forwardedRef,
      () => ({
        reseed: () => {
          reseedRef.current = true;
        },
        scatter: () => scatterFlock(boidsRef.current),
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

      const context = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      });
      if (!context) return;

      const syncSize = () => {
        const bounds = parent.getBoundingClientRect();
        const previous = sizeRef.current;
        const width = Math.max(1, bounds.width);
        const height = Math.max(1, bounds.height);

        sizeRef.current = { width, height };
        fitCanvas(canvas, context, width, height);
        paintBackground(context, width, height);
        if (
          boidsRef.current.length > 0 &&
          previous.width > 1 &&
          previous.height > 1
        ) {
          scaleFlock(
            boidsRef.current,
            width / previous.width,
            height / previous.height,
          );
        }
      };

      syncSize();
      const observer = new ResizeObserver(syncSize);
      observer.observe(parent);

      const grid = new SpatialGrid();
      let previousTime = performance.now();
      let metricsTime = previousTime;
      let frames = 0;
      let neighborSamples = 0;

      const render = (time: number) => {
        const { width, height } = sizeRef.current;
        const currentSettings = settingsRef.current;
        const delta = getFrameScale(time - previousTime);
        previousTime = time;

        if (reseedRef.current) {
          boidsRef.current = createFlock(
            currentSettings.count,
            width,
            height,
            currentSettings,
          );
          reseedRef.current = false;
        } else {
          resizeFlock(
            boidsRef.current,
            currentSettings.count,
            width,
            height,
            currentSettings,
          );
        }

        const boids = boidsRef.current;
        const totalNeighbors = pausedRef.current
          ? 0
          : stepFlock({
              boids,
              delta,
              grid,
              height,
              pointer: pointerRef.current,
              settings: currentSettings,
              width,
            });

        paintBackground(context, width, height);
        drawFlock(context, boids, trailsRef.current);

        frames += 1;
        neighborSamples += totalNeighbors / Math.max(1, boids.length);
        if (time - metricsTime >= METRICS_INTERVAL) {
          onMetrics({
            fps: Math.round((frames * 1000) / (time - metricsTime)),
            neighbors: Math.round(neighborSamples / Math.max(1, frames)),
          });
          frames = 0;
          neighborSamples = 0;
          metricsTime = time;
        }

        frame = requestAnimationFrame(render);
      };

      let frame = requestAnimationFrame(render);
      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
      };
    }, [onMetrics, pausedRef, pointerRef, settingsRef, trailsRef]);

    return (
      <canvas
        ref={canvasRef}
        aria-label="Interactive Boids Simulator"
        {...pointerHandlers}
      />
    );
  },
);
