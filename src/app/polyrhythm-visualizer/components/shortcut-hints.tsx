"use client";

import { memo, type ReactNode } from "react";

const SHORTCUTS: { keyLabel: string; action: string }[] = [
  { keyLabel: "Space", action: "play" },
  { keyLabel: "M", action: "mute" },
  { keyLabel: "R", action: "reset" },
];

export const ShortcutHints = memo(function ShortcutHints() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-[#faf9f6]/10 bg-[#141219] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d8cabc]/55">
      {SHORTCUTS.map(({ keyLabel, action }) => (
        <span key={keyLabel} className="flex items-center gap-1.5">
          <Kbd>{keyLabel}</Kbd>
          {action}
        </span>
      ))}
    </div>
  );
});

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border border-[#faf9f6]/22 bg-[#1b1823] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-normal text-[#faf9f6]">
      {children}
    </kbd>
  );
}
