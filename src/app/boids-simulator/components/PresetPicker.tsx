import { AnimatePresence, motion } from "framer-motion";

import { BOIDS_PRESETS, BOIDS_PRESET_DESCRIPTIONS } from "../data/presets";
import styles from "../styles.module.css";
import type { BoidsPresetName } from "../types";

type PresetPickerProps = {
  activePreset: BoidsPresetName | null;
  onSelect: (preset: BoidsPresetName) => void;
  reduceMotion: boolean;
};

const PRESET_NAMES = Object.keys(BOIDS_PRESETS) as BoidsPresetName[];

export function PresetPicker({
  activePreset,
  onSelect,
  reduceMotion,
}: PresetPickerProps) {
  return (
    <section className={styles.presetSection}>
      <div className={styles.sectionHeading}>
        <h2>Presets</h2>
      </div>
      <div className={styles.presetRail}>
        {PRESET_NAMES.map((preset) => {
          const selected = activePreset === preset;
          return (
            <button
              type="button"
              key={preset}
              className={selected ? styles.presetActive : ""}
              onClick={() => onSelect(preset)}
              aria-pressed={selected}
            >
              <span>{preset}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={activePreset ?? "Custom"}
          className={styles.presetDescription}
          initial={reduceMotion ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.2 }}
        >
          {activePreset
            ? BOIDS_PRESET_DESCRIPTIONS[activePreset]
            : "A custom balance shaped by your parameter adjustments."}
        </motion.p>
      </AnimatePresence>
    </section>
  );
}
