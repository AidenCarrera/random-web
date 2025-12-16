"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Eraser,
  PaintBucket,
  Pipette,
  Pencil,
  Trash2,
  Undo,
  Redo,
  Grid3X3,
} from "lucide-react";

const GRID_SIZE = 32;
const DEFAULT_COLOR = "#fff1e8";
const COLORS = [
  "#000000",
  "#222034",
  "#45283c",
  "#663931", // Darks
  "#8f563b",
  "#df7126",
  "#d9a066",
  "#eec39a", // Earth/Skin
  "#fbf236",
  "#99e550",
  "#6abe30",
  "#37946e", // Greens
  "#4b692f",
  "#524b24",
  "#323c39",
  "#3f3f74", // Nature/Desaturated
  "#306082",
  "#5b6ee1",
  "#639bff",
  "#5fcde4", // Blues
  "#cbdbfc",
  "#ffffff",
  "#9badb7",
  "#847e87", // White/Grays
  "#696a6a",
  "#595652",
  "#76428a",
  "#ac3232", // Grays/Purples/Red
  "#d95763",
  "#d77bba",
  "#8f974a",
  "#8a6f30", // Accents
];

type Tool = "pencil" | "eraser" | "fill" | "picker";

export default function PixelArt() {
  const [grid, setGrid] = useState<string[]>(
    Array(GRID_SIZE * GRID_SIZE).fill(DEFAULT_COLOR)
  );
  // History Management
  const [history, setHistory] = useState<string[][]>([
    Array(GRID_SIZE * GRID_SIZE).fill(DEFAULT_COLOR),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // Helper to update grid with history
  const updateGrid = (newGrid: string[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newGrid);
    // Limit history stack
    if (newHistory.length > 50) newHistory.shift();

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setGrid(newGrid);
  };

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setGrid(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setGrid(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "Z"))
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // BFS Flood Fill Algorithm
  const floodFill = (
    index: number,
    targetColor: string,
    replacementColor: string
  ) => {
    if (targetColor === replacementColor) return;

    const newGrid = [...grid];
    const queue: number[] = [index];
    const visited = new Set([index]);

    while (queue.length > 0) {
      const curIndex = queue.shift()!;
      newGrid[curIndex] = replacementColor;

      const x = curIndex % GRID_SIZE;
      const y = Math.floor(curIndex / GRID_SIZE);

      const neighbors = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
      ];

      for (const { dx, dy } of neighbors) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
          const nIndex = ny * GRID_SIZE + nx;
          if (!visited.has(nIndex) && newGrid[nIndex] === targetColor) {
            visited.add(nIndex);
            queue.push(nIndex);
          }
        }
      }
    }
    updateGrid(newGrid);
  };

  const handleInteraction = (index: number, isClick: boolean) => {
    if (activeTool === "fill" && isClick) {
      floodFill(index, grid[index], selectedColor);
    } else if (activeTool === "picker" && isClick) {
      setSelectedColor(grid[index]);
      setActiveTool("pencil");
    } else if (activeTool === "pencil" || activeTool === "eraser") {
      const newGrid = [...grid];
      const newColor = activeTool === "eraser" ? DEFAULT_COLOR : selectedColor;
      if (newGrid[index] !== newColor) {
        newGrid[index] = newColor;
        setGrid(newGrid);
      }
    }
  };

  const onMouseDown = (index: number) => {
    setIsDrawing(true);
    handleInteraction(index, true);
  };

  const onMouseEnter = (index: number) => {
    if (isDrawing) {
      handleInteraction(index, false);
    }
  };

  const onMouseUpGlobal = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Determine if grid changed compared to last history to push new state
      const currentHistoryGrid = history[historyIndex];
      if (JSON.stringify(grid) !== JSON.stringify(currentHistoryGrid)) {
        updateGrid(grid);
      }
    }
  };

  const handleTouch = (e: React.TouchEvent) => {
    // Prevent default to stop scrolling
    // e.preventDefault(); // Moved to touch-action CSS for better performance, but strict prevention might be needed for some browsers.
    // Actually, explicit preventDefault is often safer for drawing apps.
    // However, passive listeners are default in React. capturing event might be needed.
    // For now, relies on touch-action: none.

    const touch = e.touches[0];
    if (!touch) return;

    const element = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    ) as HTMLElement;
    if (element && element.dataset.index) {
      const index = parseInt(element.dataset.index, 10);
      if (!isNaN(index)) {
        if (e.type === "touchstart") {
          setIsDrawing(true);
          handleInteraction(index, true);
        } else if (e.type === "touchmove" && isDrawing) {
          handleInteraction(index, false);
        }
      }
    }
  };

  const onTouchEndGlobal = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const currentHistoryGrid = history[historyIndex];
      if (JSON.stringify(grid) !== JSON.stringify(currentHistoryGrid)) {
        updateGrid(grid);
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-[#c2c3c7] flex flex-col items-center justify-center p-4 select-none font-mono"
      onMouseUp={onMouseUpGlobal}
    >
      <h1 className="text-xl md:text-4xl text-[#1d2b53] mb-4 md:mb-8 font-bold tracking-tighter pixel-font text-center px-2">
        PIXEL_STUDIO_32
      </h1>

      <div className="flex flex-col md:flex-row gap-4 items-center md:items-start md:justify-center w-full max-w-[100vw] overflow-hidden p-2">
        {/* Toolbar */}
        <div className="flex flex-wrap md:flex-col justify-center gap-2 bg-[#1d2b53] p-2 rounded-lg shadow-lg w-full md:w-auto shrink-0 touch-pan-x">
          <div className="flex md:grid md:grid-cols-2 gap-2 mb-2">
            <ToolButton
              active={false}
              onClick={undo}
              disabled={historyIndex === 0}
              icon={<Undo className="w-5 h-5" />}
              label="Undo (Ctrl+Z)"
            />
            <ToolButton
              active={false}
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              icon={<Redo className="w-5 h-5" />}
              label="Redo (Ctrl+Y)"
            />
          </div>

          <div className="w-px h-full md:w-auto md:h-px bg-white/20 mx-1 md:mx-0 md:mb-2" />

          <ToolButton
            active={activeTool === "pencil"}
            onClick={() => setActiveTool("pencil")}
            icon={<Pencil className="w-5 h-5" />}
            label="Pencil"
          />
          <ToolButton
            active={activeTool === "eraser"}
            onClick={() => setActiveTool("eraser")}
            icon={<Eraser className="w-5 h-5" />}
            label="Eraser"
          />
          <ToolButton
            active={activeTool === "fill"}
            onClick={() => setActiveTool("fill")}
            icon={<PaintBucket className="w-5 h-5" />}
            label="Fill"
          />
          <ToolButton
            active={activeTool === "picker"}
            onClick={() => setActiveTool("picker")}
            icon={<Pipette className="w-5 h-5" />}
            label="Picker"
          />

          <div className="w-px h-full md:w-auto md:h-px bg-white/20 mx-1 md:mx-0 md:my-1" />
          <ToolButton
            active={showGrid}
            onClick={() => setShowGrid(!showGrid)}
            icon={<Grid3X3 className="w-5 h-5" />}
            label="Toggle Grid"
          />

          <div className="w-px h-full md:w-auto md:h-px bg-white/20 mx-1 md:mx-0 md:my-1" />

          <button
            onClick={() =>
              updateGrid(Array(GRID_SIZE * GRID_SIZE).fill(DEFAULT_COLOR))
            }
            className="p-3 rounded bg-[#ff004d] text-white hover:opacity-90 transition-all font-bold group relative flex justify-center"
            title="Clear Canvas"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Container */}
        <div className="bg-white p-2 shadow-[8px_8px_0px_#1d2b53] cursor-crosshair max-w-full overflow-hidden">
          <div
            className={`grid ${
              showGrid ? "gap-px bg-[#c2c3c7] border border-[#c2c3c7]" : ""
            }`}
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              width: "min(90vw, 800px)",
              aspectRatio: "1/1",
              touchAction: "none", // Critical for modifying browser gestures
            }}
            onTouchStart={handleTouch}
            onTouchMove={handleTouch}
            onTouchEnd={onTouchEndGlobal}
          >
            {grid.map((color, i) => (
              <div
                key={i}
                data-index={i}
                onMouseDown={() => onMouseDown(i)}
                onMouseEnter={() => onMouseEnter(i)}
                className={`w-full h-full transition-colors ${
                  activeTool === "picker"
                    ? "cursor-copy hover:ring-2 ring-black z-10"
                    : ""
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Palette */}
        <div className="grid grid-cols-8 md:grid-cols-4 gap-1 bg-[#fff1e8] p-2 rounded-lg shadow-lg border-2 border-[#1d2b53] shrink-0">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-6 h-6 rounded-sm shadow-sm transition-transform hover:scale-110 border-2 ${
                selectedColor === color
                  ? "border-black scale-110 z-10"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-[#5f574f] text-sm font-bold">
        {GRID_SIZE}x{GRID_SIZE} • {activeTool.toUpperCase()} •{" "}
        {historyIndex + 1}/{history.length}
      </p>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");
        .pixel-font {
          font-family: "Press Start 2P", cursive;
        }
      `}</style>
    </div>
  );
}

const ToolButton = ({
  active,
  onClick,
  icon,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={`p-3 rounded transition-all flex justify-center items-center ${
      active
        ? "bg-[#29adff] text-white shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)] translate-y-px"
        : "bg-[#c2c3c7] text-[#1d2b53] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#c2c3c7]"
    }`}
  >
    {icon}
  </button>
);
