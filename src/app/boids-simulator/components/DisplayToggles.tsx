import styles from "../styles.module.css";
import { ToggleSwitch } from "./ToggleSwitch";

type DisplayTogglesProps = {
  onShowStatsToggle: () => void;
  onTrailsToggle: () => void;
  showStats: boolean;
  trails: boolean;
};

export function DisplayToggles({
  onShowStatsToggle,
  onTrailsToggle,
  showStats,
  trails,
}: DisplayTogglesProps) {
  return (
    <section>
      <div className={styles.sectionHeading}>
        <h2>Display</h2>
      </div>
      <div className={styles.switchGroup}>
        <ToggleSwitch
          checked={trails}
          label="Boid trails"
          onToggle={onTrailsToggle}
        />
        <ToggleSwitch
          checked={showStats}
          label="Corner stats"
          onToggle={onShowStatsToggle}
        />
      </div>
    </section>
  );
}
