import { useCallback, useMemo } from "react";

import {
  MAX_POPULATION,
  TOUCH_DEFAULT_POPULATION,
  TOUCH_MAX_POPULATION,
} from "../constants";
import { BOIDS_PRESETS } from "../data/presets";
import {
  DEFAULT_FLOCK_PREFERENCES,
  FLOCK_STORAGE_KEY,
  parseFlockPreferences,
} from "../lib/preferences";
import type { BoidsPresetName, BoidsSettings } from "../types";
import { usePersistentState } from "./usePersistentState";

/** Manages flocking settings and enforces device-specific population caps. */
export function useFlockSettings(usesTouchControls: boolean) {
  const [preferences, setPreferences] = usePersistentState(
    FLOCK_STORAGE_KEY,
    DEFAULT_FLOCK_PREFERENCES,
    parseFlockPreferences,
  );
  const {
    bounceEdges,
    chosePopulation,
    preset: activePreset,
    settings,
  } = preferences;

  const populationMaximum = usesTouchControls
    ? TOUCH_MAX_POPULATION
    : MAX_POPULATION;
  const population =
    usesTouchControls && !chosePopulation
      ? TOUCH_DEFAULT_POPULATION
      : Math.min(settings.count, populationMaximum);
  const effectiveSettings = useMemo(
    () =>
      settings.count === population
        ? settings
        : { ...settings, count: population },
    [population, settings],
  );

  // Edge behavior is picked separately from the parameters, so presets leave it alone.
  const selectPreset = useCallback(
    (preset: BoidsPresetName) => {
      setPreferences((current) => ({
        ...current,
        settings: {
          ...BOIDS_PRESETS[preset],
          count: Math.min(BOIDS_PRESETS[preset].count, populationMaximum),
        },
        preset,
        chosePopulation: true,
      }));
    },
    [populationMaximum, setPreferences],
  );

  const updateSetting = useCallback(
    (key: keyof BoidsSettings, value: number) => {
      setPreferences((current) => {
        const next = {
          ...current.settings,
          count: Math.min(current.settings.count, populationMaximum),
          [key]: key === "count" ? Math.min(value, populationMaximum) : value,
        };
        // The speed band cannot invert, so the opposite end follows along.
        if (key === "minSpeed" && value > current.settings.maxSpeed)
          next.maxSpeed = value;
        if (key === "maxSpeed" && value < current.settings.minSpeed)
          next.minSpeed = value;
        return {
          ...current,
          settings: next,
          preset: null,
          chosePopulation: current.chosePopulation || key === "count",
        };
      });
    },
    [populationMaximum, setPreferences],
  );

  const toggleBounceEdges = useCallback(
    () =>
      setPreferences((current) => ({
        ...current,
        bounceEdges: !current.bounceEdges,
      })),
    [setPreferences],
  );

  const restoreDefaults = useCallback(
    () =>
      setPreferences((current) => ({
        ...DEFAULT_FLOCK_PREFERENCES,
        bounceEdges: current.bounceEdges,
      })),
    [setPreferences],
  );

  return {
    activePreset,
    bounceEdges,
    effectiveSettings,
    populationMaximum,
    restoreDefaults,
    selectPreset,
    toggleBounceEdges,
    updateSetting,
  };
}
