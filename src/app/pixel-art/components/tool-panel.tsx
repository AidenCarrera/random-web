import {
  Eraser,
  PaintBucket,
  Pencil,
  Pipette,
  Redo,
  Undo,
  type LucideIcon,
} from "lucide-react";

import type { Tool } from "../types";
import { CanvasActions } from "./canvas-actions";
import { ToolButton } from "./tool-button";

const TOOLS: { icon: LucideIcon; label: string; tool: Tool }[] = [
  { icon: Pencil, label: "Draw", tool: "pencil" },
  { icon: Eraser, label: "Erase", tool: "eraser" },
  { icon: PaintBucket, label: "Fill", tool: "fill" },
  { icon: Pipette, label: "Pick", tool: "picker" },
];

type ToolPanelProps = {
  activeTool: Tool;
  canRedo: boolean;
  canUndo: boolean;
  isSaving: boolean;
  onClear: () => void;
  onRedo: () => void;
  onSave: () => void;
  onToggleGrid: () => void;
  onToolChange: (tool: Tool) => void;
  onUndo: () => void;
  showGrid: boolean;
};

export function ToolPanel({
  activeTool,
  canRedo,
  canUndo,
  isSaving,
  onClear,
  onRedo,
  onSave,
  onToggleGrid,
  onToolChange,
  onUndo,
  showGrid,
}: ToolPanelProps) {
  return (
    <aside className="pixel-panel min-w-0 bg-[#2b395e] p-2 text-[#fff1e8] sm:p-4">
      <div className="mb-2 flex items-center justify-between sm:mb-3">
        <span className="pixel-font text-xs sm:text-sm">TOOLS</span>
        <span className="pixel-label text-[#ffcd75]">{activeTool}</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-2 sm:gap-2">
        {TOOLS.map(({ icon: Icon, label, tool }) => (
          <ToolButton
            key={tool}
            active={activeTool === tool}
            icon={<Icon className="h-4 w-4" />}
            label={label}
            onClick={() => onToolChange(tool)}
          />
        ))}
      </div>

      <div className="my-2 h-1 bg-[#1d2b53] sm:my-3" />

      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        <ToolButton
          active={false}
          disabled={!canUndo}
          icon={<Undo className="h-4 w-4" />}
          label="Undo"
          onClick={onUndo}
        />
        <ToolButton
          active={false}
          disabled={!canRedo}
          icon={<Redo className="h-4 w-4" />}
          label="Redo"
          onClick={onRedo}
        />
      </div>

      <CanvasActions
        isSaving={isSaving}
        onClear={onClear}
        onSave={onSave}
        onToggleGrid={onToggleGrid}
        showGrid={showGrid}
      />
    </aside>
  );
}
