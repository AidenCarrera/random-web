"use client";

import { useCallback, useState } from "react";

import {
  DEFAULT_CATEGORY,
  DEFAULT_INTENSITY,
  DEFAULT_SPEED,
  MAX_SPAWN_RATE,
} from "../config";
import { CATEGORY_KEYS } from "../data/emojis";
import { THEMES } from "../data/themes";
import styles from "../styles.module.css";
import type { Category } from "../types";
import { getHeaderName } from "../utils/format";
import { getBackgroundOpacity } from "../utils/style";
import { ControlPanel } from "./control-panel";
import { HeaderTitle } from "./header-title";
import { RainCanvas } from "./rain-canvas";

export function EmojiRain() {
  const [selected, setSelected] = useState<Category[]>([DEFAULT_CATEGORY]);
  // The theme follows the most recently added category, not the whole mix.
  const [mode, setMode] = useState<Category>(DEFAULT_CATEGORY);
  const [intensityPercent, setIntensityPercent] = useState(DEFAULT_INTENSITY);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);

  const intensity = (intensityPercent / 100) * MAX_SPAWN_RATE;
  const theme = THEMES[mode];
  const isRainbow = selected.length === CATEGORY_KEYS.length;
  const backgroundOpacity = getBackgroundOpacity(
    intensity,
    theme.isDark,
    isRainbow,
  );

  const handleCategoryPress = useCallback(
    (category: Category, mix: boolean) => {
      if (!mix) {
        setSelected([category]);
        setMode(category);
        return;
      }

      setSelected((current) => {
        if (!current.includes(category)) {
          setMode(category);
          return [...current, category];
        }

        if (current.length === 1) return current;

        const next = current.filter((item) => item !== category);
        setMode((active) =>
          active === category ? next[next.length - 1] : active,
        );
        return next;
      });
    },
    [],
  );

  return (
    <main
      className={`${styles.root} relative min-h-screen overflow-hidden transition-colors duration-1000`}
      style={{
        backgroundColor: isRainbow
          ? "#09050d"
          : theme.isDark
            ? "#06060a"
            : "#f5f5f7",
      }}
    >
      <div
        className={`pointer-events-none absolute inset-0 z-0 transition-all duration-300 ${
          isRainbow ? "animate-rainbow" : ""
        }`}
        style={{
          opacity: backgroundOpacity,
          background: isRainbow
            ? undefined
            : `linear-gradient(to bottom, ${theme.from}, ${theme.to})`,
        }}
      />

      <RainCanvas intensity={intensity} speed={speed} selected={selected} />

      <HeaderTitle
        name={getHeaderName(selected)}
        theme={theme}
        isRainbow={isRainbow}
      />

      <ControlPanel
        intensityPercent={intensityPercent}
        speed={speed}
        selected={selected}
        accent={theme.accent}
        isRainbow={isRainbow}
        onIntensityChange={setIntensityPercent}
        onSpeedChange={setSpeed}
        onCategoryPress={handleCategoryPress}
      />
    </main>
  );
}
