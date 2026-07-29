"use client";

import { memo, type ReactNode } from "react";
import { Orbit } from "lucide-react";

import { VIEW_MODES } from "../constants";
import styles from "../styles.module.css";
import type { ViewMode } from "../types";
import { Panel } from "./panel";

export const ViewModePanel = memo(function ViewModePanel({
  mode,
  onModeChange,
}: {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}) {
  return (
    <Panel title="View" icon={<Orbit />}>
      <div className="grid grid-cols-2 gap-2">
        {VIEW_MODES.map(({ value, label, Icon }) => (
          <ModeButton
            key={value}
            label={label}
            active={mode === value}
            onClick={() => onModeChange(value)}
          >
            <Icon />
          </ModeButton>
        ))}
      </div>
    </Panel>
  );
});

function ModeButton({
  children,
  label,
  active,
  onClick,
}: {
  children: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`${styles.mode} ${active ? styles.modeActive : styles.modeIdle} flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-[11px] font-black uppercase tracking-[0.16em] [&>svg]:h-4 [&>svg]:w-4`}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}
