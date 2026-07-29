import styles from "../styles.module.css";

type MetricsOverlayProps = {
  fps: number;
  neighbors: number;
  population: number;
};

export function MetricsOverlay({
  fps,
  neighbors,
  population,
}: MetricsOverlayProps) {
  return (
    <div className={styles.metrics} aria-label="Simulation metrics">
      <div>
        <span>Boids</span>
        <strong>{population.toLocaleString("en-US")}</strong>
      </div>
      <div>
        <span>Neighbors</span>
        <strong>{neighbors}</strong>
      </div>
      <div>
        <span>Frame rate</span>
        <strong>{fps}</strong>
      </div>
    </div>
  );
}
