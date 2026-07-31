"use client";

import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { ExportPreviewModal } from "@/components/ExportPreviewModal";

import { BoidsCanvas } from "./BoidsCanvas";
import { ControlPanel } from "./components/ControlPanel";
import { MetricsOverlay } from "./components/MetricsOverlay";
import { useBrowserState } from "./hooks/useBrowserState";
import { useFlockSettings } from "./hooks/useFlockSettings";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { usePersistentState } from "./hooks/usePersistentState";
import { useSnapshotExport } from "./hooks/useSnapshotExport";
import {
  DEFAULT_DISPLAY_PREFERENCES,
  DISPLAY_STORAGE_KEY,
  parseDisplayPreferences,
} from "./lib/preferences";
import styles from "./styles.module.css";
import type { BoidsCanvasHandle, BoidsMetrics, BoidsPresetName } from "./types";

export default function BoidsSimulatorPage() {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<BoidsCanvasHandle>(null);
  const [paused, setPaused] = useState(() => Boolean(reduceMotion));
  const [display, setDisplay] = usePersistentState(
    DISPLAY_STORAGE_KEY,
    DEFAULT_DISPLAY_PREFERENCES,
    parseDisplayPreferences,
  );
  const { showStats, trails } = display;
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [metrics, setMetrics] = useState<BoidsMetrics>({
    fps: 60,
    neighbors: 0,
  });

  const { isMobileViewport, isTouchDevice, shareUrl } = useBrowserState();
  const usesTouchControls = isMobileViewport || isTouchDevice;
  const {
    activePreset,
    bounceEdges,
    effectiveSettings,
    populationMaximum,
    restoreDefaults,
    selectPreset,
    toggleBounceEdges,
    updateSetting,
  } = useFlockSettings(usesTouchControls);
  const { captureSnapshot, closeSnapshot, saveSnapshot, snapshot } =
    useSnapshotExport(canvasRef);

  const togglePaused = useCallback(() => setPaused((current) => !current), []);
  const toggleTrails = useCallback(
    () => setDisplay((current) => ({ ...current, trails: !current.trails })),
    [setDisplay],
  );
  const toggleStats = useCallback(
    () =>
      setDisplay((current) => ({ ...current, showStats: !current.showStats })),
    [setDisplay],
  );
  const reseed = useCallback(() => canvasRef.current?.reseed(), []);
  useKeyboardControls(togglePaused, reseed);

  // A new preset is a new flock, so it reseeds rather than morphing the old one.
  const choosePreset = useCallback(
    (preset: BoidsPresetName) => {
      selectPreset(preset);
      reseed();
    },
    [reseed, selectPreset],
  );

  return (
    <>
      <main className={styles.root}>
        <section className={styles.canvasShell} aria-label="Boids Simulator">
          <BoidsCanvas
            ref={canvasRef}
            bounceEdges={bounceEdges}
            settings={effectiveSettings}
            paused={paused}
            showStats={showStats}
            trails={trails}
            onMetrics={setMetrics}
          />

          {showStats ? (
            <MetricsOverlay
              fps={metrics.fps}
              neighbors={metrics.neighbors}
              population={effectiveSettings.count}
            />
          ) : null}
        </section>

        <ControlPanel
          activePreset={activePreset}
          bounceEdges={bounceEdges}
          collapsed={panelCollapsed}
          mobileOpen={mobilePanelOpen}
          onBounceEdgesToggle={toggleBounceEdges}
          onCollapsedToggle={() => setPanelCollapsed((current) => !current)}
          onDownload={() => void captureSnapshot()}
          onMobileOpenToggle={() => setMobilePanelOpen((current) => !current)}
          onPausedToggle={togglePaused}
          onPresetSelect={choosePreset}
          onReset={reseed}
          onRestoreDefaults={restoreDefaults}
          onScatter={() => canvasRef.current?.scatter()}
          onSettingChange={updateSetting}
          onShowStatsToggle={toggleStats}
          onTrailsToggle={toggleTrails}
          paused={paused}
          populationMaximum={populationMaximum}
          reduceMotion={Boolean(reduceMotion)}
          settings={effectiveSettings}
          showStats={showStats}
          trails={trails}
          usesTouchControls={usesTouchControls}
        />
      </main>

      {snapshot ? (
        <ExportPreviewModal
          description={
            isTouchDevice
              ? "Save your flock image or share the simulator with others."
              : "Preview your flock, then download the PNG or share the simulator."
          }
          emailBody="Create your own living flock with the Boids Simulator:"
          emailSubject="Boids Simulator snapshot"
          facebookHashtag="#BoidsSimulator"
          fileName={snapshot.fileName}
          imageAlt="Boids Simulator snapshot"
          imageSrc={snapshot.imageSrc}
          isTouchDevice={isTouchDevice}
          onClose={closeSnapshot}
          onSaveImage={saveSnapshot}
          shareHeading="Share your flock"
          shareUrl={shareUrl}
          socialTitle="Create a living flock with the Boids Simulator."
          title="Boids snapshot"
        />
      ) : null}
    </>
  );
}
