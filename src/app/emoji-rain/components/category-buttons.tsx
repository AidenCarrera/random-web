"use client";

import { memo } from "react";

import { CATEGORY_KEYS, EMOJIS } from "../data/emojis";
import { useHoldPress } from "../hooks/use-hold-press";
import type { Category } from "../types";

export const CategoryButtons = memo(function CategoryButtons({
  selected,
  isRainbow,
  accent,
  onPress,
}: {
  selected: Category[];
  isRainbow: boolean;
  accent: string;
  onPress: (category: Category, mix: boolean) => void;
}) {
  const getHoldHandlers = useHoldPress(onPress);

  return (
    <div className="flex shrink-0 flex-wrap justify-center gap-1.5 sm:gap-2.5">
      {CATEGORY_KEYS.map((category) => {
        const isSelected = selected.includes(category);

        return (
          <button
            key={category}
            type="button"
            {...getHoldHandlers(category)}
            className={`cursor-pointer touch-manipulation select-none whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-bold capitalize transition-all hover:scale-105 active:scale-95 sm:px-3.5 sm:py-2 sm:text-sm ${
              isSelected
                ? `text-white shadow-lg ${
                    isRainbow ? "animate-button-glow border-transparent" : ""
                  }`
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
            style={
              isSelected
                ? {
                    backgroundColor: isRainbow
                      ? "rgba(255,255,255,.2)"
                      : accent,
                    backgroundImage: isRainbow
                      ? "linear-gradient(45deg, #ff3366, #ff9933, #33cc66, #3399ff, #9933ff)"
                      : undefined,
                  }
                : undefined
            }
          >
            {EMOJIS[category][0]} {category}
          </button>
        );
      })}
    </div>
  );
});
