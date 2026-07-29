"use client";

import { memo } from "react";

import type { Theme } from "../types";

export const HeaderTitle = memo(function HeaderTitle({
  name,
  theme,
  isRainbow,
}: {
  name: string;
  theme: Theme;
  isRainbow: boolean;
}) {
  return (
    <div className="pointer-events-none absolute left-0 top-10 z-10 w-full select-none text-center">
      <h1
        className={`text-4xl font-bold uppercase leading-loose tracking-widest transition-colors duration-500 ${
          isRainbow
            ? "text-pink-200/80 drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
            : theme.isDark
              ? "text-stone-400/60"
              : "text-sky-900/50"
        }`}
      >
        Cloudy with a chance of <br />
        <span
          className={
            isRainbow
              ? "animate-[rainbow-flow_5s_linear_infinite] bg-[linear-gradient(to_right,#ef4444,#fb923c,#facc15,#22c55e,#3b82f6,#6366f1,#9333ea,#ef4444)] bg-size-[200%_auto] bg-clip-text font-black text-transparent"
              : `font-extrabold transition-colors duration-500 ${theme.color} ${
                  theme.isDark
                    ? "drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
                    : ""
                }`
          }
        >
          {name}
        </span>
      </h1>
    </div>
  );
});
