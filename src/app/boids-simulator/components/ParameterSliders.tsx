import { PARAMETER_CONTROLS } from "../data/parameters";
import styles from "../styles.module.css";
import type { BoidsSettings } from "../types";

type ParameterSlidersProps = {
  onRestoreDefaults: () => void;
  onSettingChange: (key: keyof BoidsSettings, value: number) => void;
  populationMaximum: number;
  settings: BoidsSettings;
};

export function ParameterSliders({
  onRestoreDefaults,
  onSettingChange,
  populationMaximum,
  settings,
}: ParameterSlidersProps) {
  return (
    <section>
      <div className={styles.sectionHeading}>
        <h2>Parameters</h2>
        <button
          type="button"
          className={styles.textButton}
          onClick={onRestoreDefaults}
        >
          Defaults
        </button>
      </div>
      <div className={styles.controlGrid}>
        {PARAMETER_CONTROLS.map((control) => {
          const value = settings[control.key];
          return (
            <label className={styles.sliderControl} key={control.key}>
              <span>{control.label}</span>
              <input
                type="range"
                min={control.min}
                max={control.key === "count" ? populationMaximum : control.max}
                step={control.step}
                value={value}
                onChange={(event) =>
                  onSettingChange(control.key, Number(event.target.value))
                }
                aria-label={control.label}
              />
              <output>{control.format(value)}</output>
            </label>
          );
        })}
      </div>
    </section>
  );
}
