import { Download, Pause, Play, RefreshCw, Shuffle } from "lucide-react";

import styles from "../styles.module.css";

type SimulationActionsProps = {
  onDownload: () => void;
  onPausedToggle: () => void;
  onReset: () => void;
  onScatter: () => void;
  paused: boolean;
  usesTouchControls: boolean;
};

export function SimulationActions({
  onDownload,
  onPausedToggle,
  onReset,
  onScatter,
  paused,
  usesTouchControls,
}: SimulationActionsProps) {
  return (
    <section className={styles.actions}>
      <div className={styles.sectionHeading}>
        <h2>Controls</h2>
      </div>
      <p className={styles.interactionHint}>
        {usesTouchControls
          ? "Tap to attract boids. Use two fingers to repel boids."
          : "Left click to attract boids. Right click to repel boids. Space to pause."}
      </p>
      <button type="button" onClick={onPausedToggle}>
        {paused ? (
          <Play aria-hidden="true" size={15} fill="currentColor" />
        ) : (
          <Pause aria-hidden="true" size={15} fill="currentColor" />
        )}
        {paused ? "Resume" : "Pause"}
      </button>
      <button type="button" onClick={onScatter}>
        <Shuffle aria-hidden="true" size={15} strokeWidth={1.8} />
        Scatter
      </button>
      <button type="button" onClick={onReset}>
        <RefreshCw aria-hidden="true" size={15} strokeWidth={1.8} />
        Reset
      </button>
      <button
        type="button"
        className={styles.primaryAction}
        onClick={onDownload}
      >
        <Download aria-hidden="true" size={15} strokeWidth={1.8} />
        Download PNG
      </button>
    </section>
  );
}
