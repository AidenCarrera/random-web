import { useCallback, useMemo, useState } from "react";

import {
  MAX_POPULATION,
  TOUCH_DEFAULT_POPULATION,
  TOUCH_MAX_POPULATION,
} from "../constants";
import { BOIDS_PRESETS, DEFAULT_BOIDS_SETTINGS } from "../data/presets";
import type { BoidsPresetName, BoidsSettings } from "../types";

/**
 * Owns the flocking parameters and keeps the population within what the
 * current device can comfortably animate.
 */
export function useFlockSettings(usesTouchControls: boolean) {
  const [settings, setSettings] = useState(DEFAULT_BOIDS_SETTINGS);
  const [activePreset, setActivePreset] = useState<BoidsPresetName | null>(
    "Balanced",
  );
  const [hasChosenPopulation, setHasChosenPopulation] = useState(false);

  const populationMaximum = usesTouchControls
    ? TOUCH_MAX_POPULATION
    : MAX_POPULATION;
  const population =
    usesTouchControls && !hasChosenPopulation
      ? TOUCH_DEFAULT_POPULATION
      : Math.min(settings.count, populationMaximum);
  const effectiveSettings = useMemo(
    () =>
      settings.count === population
        ? settings
        : { ...settings, count: population },
    [population, settings],
  );

  const selectPreset = useCallback(
    (preset: BoidsPresetName) => {
      setActivePreset(preset);
      setHasChosenPopulation(true);
      setSettings({
        ...BOIDS_PRESETS[preset],
        count: Math.min(BOIDS_PRESETS[preset].count, populationMaximum),
      });
    },
    [populationMaximum],
  );

  const updateSetting = useCallback(
    (key: keyof BoidsSettings, value: number) => {
      setActivePreset(null);
      if (key === "count") setHasChosenPopulation(true);
      setSettings((current) => {
        const next = {
          ...current,
          count: Math.min(current.count, populationMaximum),
          [key]: key === "count" ? Math.min(value, populationMaximum) : value,
        };
        // The speed band cannot invert, so the opposite end follows along.
        if (key === "minSpeed" && value > current.maxSpeed)
          next.maxSpeed = value;
        if (key === "maxSpeed" && value < current.minSpeed)
          next.minSpeed = value;
        return next;
      });
    },
    [populationMaximum],
  );

  const restoreDefaults = useCallback(() => {
    setSettings(DEFAULT_BOIDS_SETTINGS);
    setActivePreset("Balanced");
    setHasChosenPopulation(false);
  }, []);

  return {
    activePreset,
    effectiveSettings,
    populationMaximum,
    restoreDefaults,
    selectPreset,
    updateSetting,
  };
}
