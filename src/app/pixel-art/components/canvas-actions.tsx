import { Download, Grid3X3, Trash2 } from "lucide-react";

type CanvasActionsProps = {
  /** Short-label row shown in the header below `sm`; the tool panel uses the full column. */
  compact?: boolean;
  isSaving: boolean;
  onClear: () => void;
  onSave: () => void;
  onToggleGrid: () => void;
  showGrid: boolean;
};

export function CanvasActions({
  compact = false,
  isSaving,
  onClear,
  onSave,
  onToggleGrid,
  showGrid,
}: CanvasActionsProps) {
  return (
    <div
      className={
        compact
          ? "grid grid-cols-3 gap-1.5 sm:hidden"
          : "mt-2 hidden grid-cols-3 gap-1.5 sm:mt-3 sm:grid sm:grid-cols-1 sm:gap-2"
      }
    >
      <button
        className={`pixel-action ${showGrid ? "pixel-action-active" : ""}`}
        onClick={onToggleGrid}
        type="button"
      >
        <Grid3X3 className="h-4 w-4" />
        {compact ? "Grid" : `Grid ${showGrid ? "On" : "Off"}`}
      </button>
      <button
        className="pixel-action bg-[#ac3232] text-[#1d2b53]"
        onClick={onClear}
        type="button"
      >
        <Trash2 className="h-4 w-4" />
        {compact ? "Clear" : "Clear Canvas"}
      </button>
      <button
        className="pixel-action bg-[#99e550] text-[#1d2b53] disabled:bg-[#9badb7]"
        disabled={isSaving}
        onClick={onSave}
        type="button"
      >
        <Download className="h-4 w-4" />
        {isSaving ? "Saving..." : compact ? "Save" : "Save PNG"}
      </button>
    </div>
  );
}
