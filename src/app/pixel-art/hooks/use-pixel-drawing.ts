import type { Dispatch, PointerEvent } from "react";
import { useEffect, useRef } from "react";

import { DEFAULT_COLOR } from "../constants";
import type { PixelGrid, Tool } from "../types";
import type { PixelGridAction } from "./use-pixel-grid";

type UsePixelDrawingOptions = {
  activeTool: Tool;
  dispatch: Dispatch<PixelGridAction>;
  grid: PixelGrid;
  onPickColor: (color: string) => void;
  selectedColor: string;
  size: number;
};

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

/**
 * Maps a pointer position to a cell index, clamped to the grid so a drag that
 * leaves the canvas keeps painting along its edge.
 */
function getCellIndexAt(
  container: HTMLDivElement,
  clientX: number,
  clientY: number,
  size: number,
) {
  const rect = container.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  const column = clamp(
    Math.floor(((clientX - rect.left) / rect.width) * size),
    size - 1,
  );
  const row = clamp(
    Math.floor(((clientY - rect.top) / rect.height) * size),
    size - 1,
  );

  return row * size + column;
}

export function usePixelDrawing({
  activeTool,
  dispatch,
  grid,
  onPickColor,
  selectedColor,
  size,
}: UsePixelDrawingOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastIndexRef = useRef<number | null>(null);
  const strokeToolRef = useRef<Tool>("pencil");

  // Listens on the window so a stroke is still committed when the pointer is
  // released outside the canvas.
  useEffect(() => {
    const endStroke = () => {
      if (!isDrawingRef.current) {
        return;
      }

      isDrawingRef.current = false;
      lastIndexRef.current = null;
      dispatch({ type: "commitStroke" });
    };

    window.addEventListener("pointerup", endStroke);
    window.addEventListener("pointercancel", endStroke);

    return () => {
      window.removeEventListener("pointerup", endStroke);
      window.removeEventListener("pointercancel", endStroke);
    };
  }, [dispatch]);

  const cellIndexAt = (event: PointerEvent<HTMLDivElement>) =>
    containerRef.current
      ? getCellIndexAt(containerRef.current, event.clientX, event.clientY, size)
      : null;

  const colorFor = (tool: Tool) =>
    tool === "eraser" ? DEFAULT_COLOR : selectedColor;

  // Fill and pick act on a press only; dragging them does nothing.
  const applyTool = (index: number, tool: Tool, isPress: boolean) => {
    if (isPress && tool === "fill") {
      dispatch({ type: "fill", color: selectedColor, index });
      return;
    }

    if (isPress && tool === "picker") {
      onPickColor(grid[index]);
      return;
    }

    if (tool === "pencil" || tool === "eraser") {
      dispatch({ type: "paint", color: colorFor(tool), index });
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    const index = cellIndexAt(event);
    if (index === null) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    lastIndexRef.current = index;
    // The right button erases regardless of the selected tool.
    strokeToolRef.current = event.button === 2 ? "eraser" : activeTool;
    applyTool(index, strokeToolRef.current, true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current) {
      return;
    }

    event.preventDefault();
    const index = cellIndexAt(event);
    if (index === null) {
      return;
    }

    const tool =
      event.buttons === 2 || event.buttons === 3
        ? "eraser"
        : strokeToolRef.current;
    strokeToolRef.current = tool;

    const lastIndex = lastIndexRef.current;
    if (
      lastIndex !== null &&
      lastIndex !== index &&
      (tool === "pencil" || tool === "eraser")
    ) {
      dispatch({
        type: "paintLine",
        color: colorFor(tool),
        from: lastIndex,
        to: index,
      });
    } else {
      applyTool(index, tool, false);
    }

    lastIndexRef.current = index;
  };

  return { containerRef, handlePointerDown, handlePointerMove };
}
