import { COLORS } from "../constants";

type PalettePanelProps = {
  onSelectColor: (color: string) => void;
  selectedColor: string;
};

export function PalettePanel({
  onSelectColor,
  selectedColor,
}: PalettePanelProps) {
  return (
    <aside className="pixel-panel min-w-0 bg-white p-2 sm:p-4">
      <div className="mb-2 flex items-center justify-between sm:mb-3">
        <span className="pixel-font text-xs sm:text-sm">PALETTE</span>
        <span className="pixel-label text-[#8f563b]">
          {COLORS.length} colors
        </span>
      </div>

      <div className="grid grid-cols-8 gap-1 sm:grid-cols-8 sm:gap-2 xl:grid-cols-4">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onSelectColor(color)}
            type="button"
            aria-label={`Select ${color}`}
            className={`aspect-square min-w-0 border-2 transition-transform hover:scale-[1.04] ${
              selectedColor === color
                ? "border-[#1d2b53] shadow-[2px_2px_0px_#1d2b53]"
                : "border-[#847e87]"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="mt-3 rounded-none border-2 border-[#1d2b53] bg-white p-2.5 sm:mt-4 sm:p-3">
        <p className="pixel-label mb-1 text-[#8f563b]">Selected color</p>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 shrink-0 border-2 border-[#1d2b53]"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="pixel-font text-xs sm:text-sm">{selectedColor}</span>
        </div>
      </div>
    </aside>
  );
}
