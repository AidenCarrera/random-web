import styles from "../styles.module.css";

type ToggleSwitchProps = {
  checked: boolean;
  label: string;
  onToggle: () => void;
};

export function ToggleSwitch({ checked, label, onToggle }: ToggleSwitchProps) {
  return (
    <div className={styles.switchRow}>
      <span>{label}</span>
      <button
        type="button"
        className={checked ? styles.switchActive : ""}
        onClick={onToggle}
        aria-pressed={checked}
        aria-label={`Toggle ${label.toLowerCase()}`}
      >
        <span />
      </button>
    </div>
  );
}
