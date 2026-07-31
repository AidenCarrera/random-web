import styles from "../styles.module.css";
import { ToggleSwitch } from "./ToggleSwitch";

type PanelTogglesProps = {
  bounceEdges: boolean;
  onBounceEdgesToggle: () => void;
  onShowStatsToggle: () => void;
  onTrailsToggle: () => void;
  showStats: boolean;
  trails: boolean;
};

/** Switches for the on/off settings, sitting directly under the parameter sliders. */
export function PanelToggles({
  bounceEdges,
  onBounceEdgesToggle,
  onShowStatsToggle,
  onTrailsToggle,
  showStats,
  trails,
}: PanelTogglesProps) {
  return (
    <section>
      <div className={styles.sectionHeading}>
        <h2>Settings</h2>
      </div>
      <div className={styles.switchGroup}>
        <ToggleSwitch
          checked={bounceEdges}
          label="Bounce off edges"
          onToggle={onBounceEdgesToggle}
        />
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
