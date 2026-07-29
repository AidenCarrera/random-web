import { ChevronDown, ChevronRight } from "lucide-react";

import styles from "../styles.module.css";
import type { BoidsPresetName, BoidsSettings } from "../types";
import { DisplayToggles } from "./DisplayToggles";
import { ParameterSliders } from "./ParameterSliders";
import { PresetPicker } from "./PresetPicker";
import { SimulationActions } from "./SimulationActions";

type ControlPanelProps = {
  activePreset: BoidsPresetName | null;
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapsedToggle: () => void;
  onDownload: () => void;
  onMobileOpenToggle: () => void;
  onPausedToggle: () => void;
  onPresetSelect: (preset: BoidsPresetName) => void;
  onReset: () => void;
  onRestoreDefaults: () => void;
  onScatter: () => void;
  onSettingChange: (key: keyof BoidsSettings, value: number) => void;
  onShowStatsToggle: () => void;
  onTrailsToggle: () => void;
  paused: boolean;
  populationMaximum: number;
  reduceMotion: boolean;
  settings: BoidsSettings;
  showStats: boolean;
  trails: boolean;
  usesTouchControls: boolean;
};

/** Control panel rendered as a side drawer on desktop and a bottom sheet on mobile. */
export function ControlPanel({
  activePreset,
  collapsed,
  mobileOpen,
  onCollapsedToggle,
  onDownload,
  onMobileOpenToggle,
  onPausedToggle,
  onPresetSelect,
  onReset,
  onRestoreDefaults,
  onScatter,
  onSettingChange,
  onShowStatsToggle,
  onTrailsToggle,
  paused,
  populationMaximum,
  reduceMotion,
  settings,
  showStats,
  trails,
  usesTouchControls,
}: ControlPanelProps) {
  return (
    <aside
      className={`${styles.panel} ${mobileOpen ? styles.panelOpen : ""} ${
        collapsed ? styles.panelCollapsed : ""
      }`}
      aria-label="Boids Simulator controls"
    >
      <button
        type="button"
        className={styles.panelToggle}
        onClick={onCollapsedToggle}
        aria-label={collapsed ? "Expand controls" : "Collapse controls"}
        aria-expanded={!collapsed}
      >
        <ChevronRight aria-hidden="true" size={19} strokeWidth={1.8} />
      </button>

      <button
        type="button"
        className={styles.panelHandle}
        onClick={onMobileOpenToggle}
        aria-expanded={mobileOpen}
      >
        <span>Boids Simulator</span>
        <ChevronDown aria-hidden="true" size={18} strokeWidth={1.8} />
      </button>

      <div className={styles.panelBody}>
        <div className={styles.panelTitle}>
          <h1>Boids Simulator</h1>
        </div>

        <SimulationActions
          onDownload={onDownload}
          onPausedToggle={onPausedToggle}
          onReset={onReset}
          onScatter={onScatter}
          paused={paused}
          usesTouchControls={usesTouchControls}
        />

        <PresetPicker
          activePreset={activePreset}
          onSelect={onPresetSelect}
          reduceMotion={reduceMotion}
        />

        <ParameterSliders
          onRestoreDefaults={onRestoreDefaults}
          onSettingChange={onSettingChange}
          populationMaximum={populationMaximum}
          settings={settings}
        />

        <DisplayToggles
          onShowStatsToggle={onShowStatsToggle}
          onTrailsToggle={onTrailsToggle}
          showStats={showStats}
          trails={trails}
        />
      </div>
    </aside>
  );
}
