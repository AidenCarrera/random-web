import type { CSSProperties, Dispatch } from "react";
import { memo } from "react";

import { usePixelDrawing } from "../hooks/use-pixel-drawing";
import type { PixelGridAction } from "../hooks/use-pixel-grid";
import type { PixelGrid, Tool } from "../types";

const CANVAS_STYLE: CSSProperties = {
  width: "min(calc(100vw - 2.5rem), 42rem)",
  maxWidth: "100%",
  aspectRatio: "1 / 1",
  touchAction: "none",
  boxSizing: "border-box",
};

// Memoized so a stroke only re-renders the cells whose color actually changed —
// a 32x32 canvas is 1024 of these, repainted on every pointer move.
const PixelCell = memo(function PixelCell({
  color,
  cursorClassName,
}: {
  color: string;
  cursorClassName: string;
}) {
  return (
    <div
      className={`h-full w-full select-none ${cursorClassName}`}
      draggable={false}
      style={{ backgroundColor: color }}
    />
  );
});

type PixelCanvasProps = {
  activeTool: Tool;
  dispatch: Dispatch<PixelGridAction>;
  grid: PixelGrid;
  onPickColor: (color: string) => void;
  selectedColor: string;
  showGrid: boolean;
  size: number;
};

export function PixelCanvas({
  activeTool,
  dispatch,
  grid,
  onPickColor,
  selectedColor,
  showGrid,
  size,
}: PixelCanvasProps) {
  const { containerRef, handlePointerDown, handlePointerMove } =
    usePixelDrawing({
      activeTool,
      dispatch,
      grid,
      onPickColor,
      selectedColor,
      size,
    });

  const cursorClassName =
    activeTool === "picker" ? "cursor-copy" : "cursor-crosshair";

  return (
    <main className="pixel-panel min-w-0 bg-white p-2 sm:p-4">
      <div className="flex justify-center overflow-hidden rounded-none bg-[#c2c3c7] p-1.5 sm:p-3">
        <div
          ref={containerRef}
          className={`grid ${showGrid ? "gap-px border border-[#847e87] bg-[#847e87]" : ""}`}
          onContextMenu={(event) => event.preventDefault()}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          style={{
            ...CANVAS_STYLE,
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((color, index) => (
            <PixelCell
              key={index}
              color={color}
              cursorClassName={cursorClassName}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
