"use client";

import { useState } from "react";

const GRID_SIZE = 16;
const COLORS = [
  "#000000",
  "#1d2b53",
  "#7e2553",
  "#008751",
  "#ab5236",
  "#5f574f",
  "#c2c3c7",
  "#fff1e8",
  "#ff004d",
  "#ffa300",
  "#ffec27",
  "#00e436",
  "#29adff",
  "#83769c",
  "#ff77a8",
  "#ffccaa",
];

export default function PixelArt() {
  const [grid, setGrid] = useState<string[]>(
    Array(GRID_SIZE * GRID_SIZE).fill("#fff1e8")
  );
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isDrawing, setIsDrawing] = useState(false);

  const handlePixelClick = (index: number) => {
    const newGrid = [...grid];
    newGrid[index] = selectedColor;
    setGrid(newGrid);
  };

  const handleMouseEnter = (index: number) => {
    if (isDrawing) {
      handlePixelClick(index);
    }
  };

  return (
    <div className="min-h-screen bg-[#c2c3c7] flex flex-col items-center justify-center p-4 select-none font-mono">
      <h1 className="text-4xl text-[#1d2b53] mb-8 font-bold tracking-tighter pixel-font">
        PIXEL_STUDIO_16
      </h1>

      <div
        className="bg-white p-2 shadow-[8px_8px_0px_#1d2b53] mb-8 cursor-crosshair"
        onMouseDown={() => setIsDrawing(true)}
        onMouseUp={() => setIsDrawing(false)}
        onMouseLeave={() => setIsDrawing(false)}
      >
        <div
          className="grid gap-px bg-[#c2c3c7] border border-[#c2c3c7]"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)` }}
        >
          {grid.map((color, i) => (
            <div
              key={i}
              onMouseDown={() => handlePixelClick(i)}
              onMouseEnter={() => handleMouseEnter(i)}
              className="w-5 h-5 hover:opacity-80 transition-opacity"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2 bg-[#fff1e8] p-4 rounded-lg shadow-lg">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`w-8 h-8 rounded-sm shadow-sm transition-transform hover:scale-110 border-2 ${
              selectedColor === color
                ? "border-black scale-110 z-10"
                : "border-transparent"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <button
        onClick={() => setGrid(Array(GRID_SIZE * GRID_SIZE).fill("#fff1e8"))}
        className="mt-8 bg-[#ff004d] text-white px-6 py-2 shadow-[4px_4px_0px_#7e2553] active:translate-y-[4px] active:shadow-none font-bold"
      >
        CLEAR CANVAS
      </button>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");
        .pixel-font {
          font-family: "Press Start 2P", cursive;
        }
      `}</style>
    </div>
  );
}
