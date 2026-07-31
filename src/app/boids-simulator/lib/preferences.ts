import { PARAMETER_CONTROLS } from "../data/parameters";
import { BOIDS_PRESETS, DEFAULT_BOIDS_SETTINGS } from "../data/presets";
import type { BoidsPresetName, BoidsSettings } from "../types";

export const FLOCK_STORAGE_KEY = "boids-simulator:flock";
export const DISPLAY_STORAGE_KEY = "boids-simulator:display";

export type FlockPreferences = {
  settings: BoidsSettings;
  preset: BoidsPresetName | null;
  /** Whether the population slider has been used; touch devices stay light until it is. */
  chosePopulation: boolean;
};

export type DisplayPreferences = {
  trails: boolean;
  showStats: boolean;
};

export const DEFAULT_FLOCK_PREFERENCES: FlockPreferences = {
  settings: DEFAULT_BOIDS_SETTINGS,
  preset: "Balanced",
  chosePopulation: false,
};

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  trails: false,
  showStats: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Stored values come from a previous release's schema, so every field is clamped
 * back into its slider's range rather than trusted.
 */
function parseSettings(raw: unknown): BoidsSettings | null {
  if (!isRecord(raw)) return null;

  const settings = { ...DEFAULT_BOIDS_SETTINGS };
  for (const { key, min, max } of PARAMETER_CONTROLS) {
    const value = raw[key];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    settings[key] = Math.min(max, Math.max(min, value));
  }
  // The speed band cannot invert, however the stored pair was written.
  if (settings.minSpeed > settings.maxSpeed)
    settings.minSpeed = settings.maxSpeed;
  return settings;
}

export function parseFlockPreferences(raw: unknown): FlockPreferences | null {
  if (!isRecord(raw)) return null;

  const settings = parseSettings(raw.settings);
  if (!settings) return null;

  const preset = raw.preset;
  return {
    settings,
    preset:
      typeof preset === "string" && preset in BOIDS_PRESETS
        ? (preset as BoidsPresetName)
        : null,
    chosePopulation: raw.chosePopulation === true,
  };
}

export function parseDisplayPreferences(
  raw: unknown,
): DisplayPreferences | null {
  if (!isRecord(raw)) return null;
  return {
    trails: raw.trails === true,
    showStats: raw.showStats === true,
  };
}
