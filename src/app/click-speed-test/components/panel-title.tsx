"use client";

import type { ReactNode } from "react";

/** Heading shared by every titled panel. */
export function PanelTitle({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-4 flex shrink-0 items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-slate-400">
      {icon}
      {children}
    </div>
  );
}
