"use client";

import type { ReactNode } from "react";

/** Titled card used by every control group in the sidebar. */
export function Panel({
  title,
  icon,
  aside,
  children,
}: {
  title: string;
  icon?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#faf9f6]/14 bg-[#141219] p-4 shadow-[inset_0_1px_0_rgba(250,249,246,0.07),0_16px_34px_-26px_rgba(0,0,0,0.95)]">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#faf9f6]/10 pb-3">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.26em] text-[#faf9f6]/80">
          {icon && (
            <span className="text-[#55c991] [&>svg]:h-3.5 [&>svg]:w-3.5">
              {icon}
            </span>
          )}
          {title}
        </div>
        {aside}
      </div>
      {children}
    </div>
  );
}
