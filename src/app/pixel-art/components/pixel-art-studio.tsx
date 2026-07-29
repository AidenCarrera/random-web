"use client";

import { useEffect, useState } from "react";

import { ExportPreviewModal } from "@/components/ExportPreviewModal";

import { COLORS, DEFAULT_SIZE, MOBILE_DEFAULT_SIZE } from "../constants";
import { isCoarsePointer, useBrowserState } from "../hooks/use-browser-state";
import { useHistoryShortcuts } from "../hooks/use-history-shortcuts";
import { usePixelExport } from "../hooks/use-pixel-export";
import { usePixelGrid } from "../hooks/use-pixel-grid";
import { isDefaultColor } from "../lib/pixel-grid";
import styles from "../styles.module.css";
import type { Tool } from "../types";
import { PalettePanel } from "./palette-panel";
import { PixelCanvas } from "./pixel-canvas";
import { StudioHeader } from "./studio-header";
import { ToolPanel } from "./tool-panel";

export function PixelArtStudio() {
  const { canRedo, canUndo, dispatch, grid, size } = usePixelGrid(DEFAULT_SIZE);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  const [showGrid, setShowGrid] = useState(true);
  const { isTouchDevice, shareUrl } = useBrowserState();
  const { closePreview, isSaving, openPreview, preview, saveImage } =
    usePixelExport(grid, size);

  useHistoryShortcuts(dispatch);

  // Touch devices start smaller: 32x32 cells are too fine to tap accurately.
  // Read once on mount rather than tracking the media query, so a pointer-type
  // change mid-session can never wipe the drawing.
  useEffect(() => {
    if (isCoarsePointer()) {
      dispatch({ type: "resize", size: MOBILE_DEFAULT_SIZE });
    }
  }, [dispatch]);

  const handleSizeChange = (nextSize: number) => {
    if (nextSize === size) {
      return;
    }

    const hasDrawing = grid.some((color) => !isDefaultColor(color));
    if (
      hasDrawing &&
      !window.confirm(
        "Changing grid size will clear your current drawing. Continue?",
      )
    ) {
      return;
    }

    dispatch({ type: "resize", size: nextSize });
  };

  const handlePickColor = (color: string) => {
    setSelectedColor(color);
    setActiveTool("pencil");
  };

  return (
    <div
      className={`${styles.root} min-h-screen overflow-x-hidden bg-[#c2c3c7] px-3 py-3 text-[#1d2b53] sm:px-4 sm:py-8 lg:flex lg:items-center lg:justify-center`}
    >
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-3 sm:gap-4 lg:my-auto">
        <StudioHeader
          isSaving={isSaving}
          onClear={() => dispatch({ type: "clear" })}
          onSave={openPreview}
          onSizeChange={handleSizeChange}
          onToggleGrid={() => setShowGrid((value) => !value)}
          showGrid={showGrid}
          size={size}
        />

        <div className="grid min-w-0 gap-3 sm:gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_16rem]">
          <ToolPanel
            activeTool={activeTool}
            canRedo={canRedo}
            canUndo={canUndo}
            isSaving={isSaving}
            onClear={() => dispatch({ type: "clear" })}
            onRedo={() => dispatch({ type: "redo" })}
            onSave={openPreview}
            onToggleGrid={() => setShowGrid((value) => !value)}
            onToolChange={setActiveTool}
            onUndo={() => dispatch({ type: "undo" })}
            showGrid={showGrid}
          />

          <PixelCanvas
            activeTool={activeTool}
            dispatch={dispatch}
            grid={grid}
            onPickColor={handlePickColor}
            selectedColor={selectedColor}
            showGrid={showGrid}
            size={size}
          />

          <PalettePanel
            onSelectColor={setSelectedColor}
            selectedColor={selectedColor}
          />
        </div>
      </div>

      {preview ? (
        <ExportPreviewModal
          title="Pixel Art Snapshot"
          description="Download the current pixel art as an image or share it directly."
          fileName={preview.fileName}
          imageAlt="Pixel art export preview"
          imageSrc={preview.imageSrc}
          isTouchDevice={isTouchDevice}
          onClose={closePreview}
          onSaveImage={saveImage}
          pixelatedPreview
          shareHeading="Share with friends"
          shareUrl={shareUrl}
        />
      ) : null}
    </div>
  );
}
