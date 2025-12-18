"use client";

import { useEffect, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

/**
 * ASCII Density strings from dark to light
 */
const DENSITY = "Ñ@#W$9876543210?!abc;:+=-,._ ";

export default function AsciiCamera() {
  const [asciiArt, setAsciiArt] = useState<string>("");
  const [resolution, setResolution] = useState(120); // Width in chars
  const [contrast, setContrast] = useState(1);
  const [colorMode, setColorMode] = useState<"green" | "amber" | "white">(
    "green"
  );
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = resolution;
      const height = Math.floor((img.height / img.width) * width * 0.55);

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      let asciiFrame = "";
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offset = (y * width + x) * 4;
          const r = data[offset];
          const g = data[offset + 1];
          const b = data[offset + 2];
          let avg = (r + g + b) / 3;
          avg = Math.pow(avg / 255, contrast) * 255;
          const len = DENSITY.length;
          const charIndex = Math.floor(((255 - avg) / 255) * len);
          const char = DENSITY[Math.min(Math.max(charIndex, 0), len - 1)];
          asciiFrame += char;
        }
        asciiFrame += "\n";
      }
      setAsciiArt(asciiFrame);
    };
  }, [imageSrc, resolution, contrast]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Color Styles
  const getColorClass = () => {
    switch (colorMode) {
      case "green":
        return "text-[#00ff00] shadow-[0_0_10px_#00ff00]";
      case "amber":
        return "text-[#ffb000] shadow-[0_0_10px_#ffb000]";
      case "white":
        return "text-white shadow-[0_0_10px_white]";
      default:
        return "text-[#00ff00]";
    }
  };

  const getBorderClass = () => {
    switch (colorMode) {
      case "green":
        return "border-[#00ff00]";
      case "amber":
        return "border-[#ffb000]";
      case "white":
        return "border-white";
      default:
        return "border-[#00ff00]";
    }
  };

  return (
    <div className="min-h-screen bg-black font-mono flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      {/* Main Container TV Frame */}
      <div
        className={`relative max-w-full w-fit p-8 border-4 rounded-3xl bg-[#111] shadow-2xl transition-colors duration-500 ${getBorderClass()} shadow-[0_0_30px_rgba(0,0,0,0.8)]`}
      >
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,4px_100%] rounded-2xl" />

        {/* Screen Glare */}
        <div className="absolute top-4 right-4 w-1/3 h-1/3 bg-linear-to-bl from-white/10 to-transparent rounded-tr-xl pointer-events-none z-20" />

        <div className="relative z-10">
          {/* Header */}
          <div
            className={`flex justify-between items-center mb-4 pb-2 border-b border-opacity-30 ${getBorderClass()} ${
              getColorClass().split(" ")[0]
            }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-6 h-6 animate-pulse" />
              <h1 className="text-xl font-bold tracking-widest">
                ASCII_VISION
              </h1>
            </div>
            <div className="text-xs opacity-70">
              {resolution}x :: IMG {imageSrc ? "LOADED" : "WAITING"}
            </div>
          </div>

          {/* ASCII Output */}
          <div className="bg-black p-4 rounded-xl border border-white/5 min-h-[50vh] min-w-[50vw] flex items-center justify-center overflow-hidden">
            {!imageSrc ? (
              <div className="text-center space-y-4">
                <label
                  className={`cursor-pointer px-8 py-3 border-2 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all inline-flex items-center gap-2 ${getBorderClass()} ${
                    getColorClass().split(" ")[0]
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs opacity-50 font-mono">
                  Supports JPG, PNG, WEBP
                </p>
              </div>
            ) : (
              <pre
                className={`text-[6px] md:text-[8px] leading-[4px] md:leading-[6px] font-bold text-center whitespace-pre ${getColorClass()}`}
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                {asciiArt}
              </pre>
            )}
          </div>

          {/* Controls Rack */}
          {imageSrc && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label
                  className={`text-xs font-bold uppercase ${
                    getColorClass().split(" ")[0]
                  }`}
                >
                  Density (Res)
                </label>
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={resolution}
                  onChange={(e) => setResolution(Number(e.target.value))}
                  className="w-full accent-current h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <label
                  className={`text-xs font-bold uppercase ${
                    getColorClass().split(" ")[0]
                  }`}
                >
                  Contrast
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-current h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-between items-end gap-2">
                <button
                  onClick={() => setColorMode("green")}
                  className={`h-8 w-8 rounded bg-[#00ff00] ${
                    colorMode === "green" ? "ring-2 ring-white" : "opacity-50"
                  }`}
                />
                <button
                  onClick={() => setColorMode("amber")}
                  className={`h-8 w-8 rounded bg-[#ffb000] ${
                    colorMode === "amber" ? "ring-2 ring-white" : "opacity-50"
                  }`}
                />
                <button
                  onClick={() => setColorMode("white")}
                  className={`h-8 w-8 rounded bg-white ${
                    colorMode === "white"
                      ? "ring-2 ring-gray-400"
                      : "opacity-50"
                  }`}
                />
                <label
                  className="ml-auto p-2 border border-current hover:bg-white/10 rounded transition-colors cursor-pointer"
                  title="Upload New Image"
                >
                  <Upload className="w-5 h-5 text-current" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        input[type="range"] {
          color: ${colorMode === "green"
            ? "#00ff00"
            : colorMode === "amber"
            ? "#ffb000"
            : "white"};
        }
      `}</style>
    </div>
  );
}
