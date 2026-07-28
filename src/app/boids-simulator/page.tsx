"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Pause,
  Play,
  RefreshCw,
  Shuffle,
} from "lucide-react";

import { ExportPreviewModal } from "@/components/ExportPreviewModal";
import {
  BoidsCanvas,
  type BoidsCanvasHandle,
  type BoidsMetrics,
  type BoidsSnapshot,
} from "./BoidsCanvas";
import {
  BOIDS_PRESET_DESCRIPTIONS,
  BOIDS_PRESETS,
  DEFAULT_BOIDS_SETTINGS,
  MAX_SEPARATION_FORCE,
  type BoidsPresetName,
  type BoidsSettings,
} from "./simulator";
import styles from "./boids-simulator.module.css";

type SliderControl = {
  key: keyof BoidsSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
};

const CONTROLS: SliderControl[] = [
  {
    key: "count",
    label: "Population",
    min: 100,
    max: 3000,
    step: 100,
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    key: "movementAccuracy",
    label: "Movement accuracy",
    min: 16,
    max: 160,
    step: 8,
    format: (value) => value.toFixed(0),
  },
  {
    key: "boidVision",
    label: "Boid vision",
    min: 24,
    max: 140,
    step: 2,
    format: (value) => `${value}px`,
  },
  {
    key: "alignmentForce",
    label: "Alignment force",
    min: 0,
    max: 2.5,
    step: 0.05,
    format: (value) => value.toFixed(2),
  },
  {
    key: "cohesionForce",
    label: "Cohesion force",
    min: 0,
    max: 2,
    step: 0.05,
    format: (value) => value.toFixed(2),
  },
  {
    key: "separationForce",
    label: "Separation force",
    min: 0,
    max: MAX_SEPARATION_FORCE,
    step: 0.05,
    format: (value) => value.toFixed(2),
  },
  {
    key: "steeringForce",
    label: "Steering force",
    min: 0.01,
    max: 0.12,
    step: 0.002,
    format: (value) => value.toFixed(3),
  },
  {
    key: "minSpeed",
    label: "Min speed",
    min: 0.2,
    max: 10,
    step: 0.05,
    format: (value) => value.toFixed(2),
  },
  {
    key: "maxSpeed",
    label: "Max speed",
    min: 0.5,
    max: 10,
    step: 0.05,
    format: (value) => value.toFixed(2),
  },
];

function subscribeToTouchCapability(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(pointer: coarse)");
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getTouchCapabilitySnapshot() {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0
  );
}

function subscribeToLocation(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  window.addEventListener("popstate", onStoreChange);
  return () => {
    window.removeEventListener("hashchange", onStoreChange);
    window.removeEventListener("popstate", onStoreChange);
  };
}

const getShareUrlSnapshot = () => window.location.href;
const getServerShareUrlSnapshot = () => "";
const getServerTouchCapabilitySnapshot = () => false;

function subscribeToMobileLayout(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(max-width: 720px)");
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

const getMobileLayoutSnapshot = () =>
  window.matchMedia("(max-width: 720px)").matches;
const getServerMobileLayoutSnapshot = () => false;
const MOBILE_DEFAULT_POPULATION = 600;

export default function BoidsSimulatorPage() {
  const reduceMotion = useReducedMotion();
  const canvasHandle = useRef<BoidsCanvasHandle>(null);
  const [settings, setSettings] = useState(DEFAULT_BOIDS_SETTINGS);
  const [activePreset, setActivePreset] = useState<BoidsPresetName | null>(
    "Balanced",
  );
  const [paused, setPaused] = useState(() => Boolean(reduceMotion));
  const [trails, setTrails] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [hasChosenPopulation, setHasChosenPopulation] = useState(false);
  const [snapshot, setSnapshot] = useState<BoidsSnapshot | null>(null);
  const isTouchDevice = useSyncExternalStore(
    subscribeToTouchCapability,
    getTouchCapabilitySnapshot,
    getServerTouchCapabilitySnapshot,
  );
  const isMobileLayout = useSyncExternalStore(
    subscribeToMobileLayout,
    getMobileLayoutSnapshot,
    getServerMobileLayoutSnapshot,
  );
  const usesTouchControls = isMobileLayout || isTouchDevice;
  const populationMaximum = usesTouchControls ? 1500 : 3000;
  const effectivePopulation =
    usesTouchControls && !hasChosenPopulation
      ? MOBILE_DEFAULT_POPULATION
      : Math.min(settings.count, populationMaximum);
  const effectiveSettings =
    settings.count !== effectivePopulation
      ? { ...settings, count: effectivePopulation }
      : settings;
  const shareUrl = useSyncExternalStore(
    subscribeToLocation,
    getShareUrlSnapshot,
    getServerShareUrlSnapshot,
  );
  const [metrics, setMetrics] = useState<BoidsMetrics>({
    fps: 60,
    neighbors: 0,
  });

  const handleMetrics = useCallback((nextMetrics: BoidsMetrics) => {
    setMetrics(nextMetrics);
  }, []);

  const choosePreset = (preset: BoidsPresetName) => {
    setActivePreset(preset);
    setHasChosenPopulation(true);
    setSettings({
      ...BOIDS_PRESETS[preset],
      count: Math.min(BOIDS_PRESETS[preset].count, populationMaximum),
    });
    canvasHandle.current?.reseed();
  };

  const updateSetting = (key: keyof BoidsSettings, value: number) => {
    setActivePreset(null);
    if (key === "count") setHasChosenPopulation(true);
    setSettings((current) => {
      const next = {
        ...current,
        count: Math.min(current.count, populationMaximum),
        [key]: key === "count" ? Math.min(value, populationMaximum) : value,
      };
      if (key === "minSpeed" && value > current.maxSpeed) {
        next.maxSpeed = value;
      }
      if (key === "maxSpeed" && value < current.minSpeed) {
        next.minSpeed = value;
      }
      return next;
    });
  };

  const handleSnapshot = async () => {
    const nextSnapshot = await canvasHandle.current?.snapshot();
    if (!nextSnapshot) return;

    setSnapshot(nextSnapshot);
  };

  const saveSnapshot = async () => {
    if (!snapshot) return;

    try {
      const pngFile = new File([snapshot.blob], snapshot.fileName, {
        type: "image/png",
      });
      const canShareFile =
        "share" in navigator &&
        "canShare" in navigator &&
        navigator.canShare({ files: [pngFile] });

      if (canShareFile) {
        await navigator.share({
          files: [pngFile],
          title: "Boids Simulator",
          text: "Save this Boids Simulator snapshot.",
        });
        return;
      }

      window.open(snapshot.imageSrc, "_blank", "noopener,noreferrer");
    } catch {}
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.code === "Space") {
        event.preventDefault();
        setPaused((current) => !current);
      }
      if (event.key.toLowerCase() === "r") {
        canvasHandle.current?.reseed();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <main className={styles.root}>
        <section className={styles.canvasShell} aria-label="Boids Simulator">
          <BoidsCanvas
            ref={canvasHandle}
            settings={effectiveSettings}
            paused={paused}
            trails={trails}
            onMetrics={handleMetrics}
          />

          {showStats ? (
            <div className={styles.metrics} aria-label="Simulation metrics">
              <div>
                <span>Boids</span>
                <strong>
                  {effectiveSettings.count.toLocaleString("en-US")}
                </strong>
              </div>
              <div>
                <span>Neighbors</span>
                <strong>{metrics.neighbors}</strong>
              </div>
              <div>
                <span>Frame rate</span>
                <strong>{metrics.fps}</strong>
              </div>
            </div>
          ) : null}
        </section>

        <aside
          className={`${styles.panel} ${
            mobilePanelOpen ? styles.panelOpen : ""
          } ${panelCollapsed ? styles.panelCollapsed : ""}`}
          aria-label="Boids Simulator controls"
        >
          <button
            type="button"
            className={styles.panelToggle}
            onClick={() => setPanelCollapsed((current) => !current)}
            aria-label={
              panelCollapsed ? "Expand controls" : "Collapse controls"
            }
            aria-expanded={!panelCollapsed}
          >
            <ChevronRight aria-hidden="true" size={19} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            className={styles.panelHandle}
            onClick={() => setMobilePanelOpen((current) => !current)}
            aria-expanded={mobilePanelOpen}
          >
            <span>Boids Simulator</span>
            <ChevronDown aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>

          <div className={styles.panelBody}>
            <div className={styles.panelTitle}>
              <h1>Boids Simulator</h1>
            </div>

            <section className={styles.actions}>
              <div className={styles.sectionHeading}>
                <h2>Controls</h2>
              </div>
              <p className={styles.interactionHint}>
                {usesTouchControls
                  ? "Tap to attract boids. Use two fingers to repel boids."
                  : "Left click to attract boids. Right click to repel boids. Space to pause."}
              </p>
              <button
                type="button"
                onClick={() => setPaused((current) => !current)}
              >
                {paused ? (
                  <Play aria-hidden="true" size={15} fill="currentColor" />
                ) : (
                  <Pause aria-hidden="true" size={15} fill="currentColor" />
                )}
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                type="button"
                onClick={() => canvasHandle.current?.scatter()}
              >
                <Shuffle aria-hidden="true" size={15} strokeWidth={1.8} />
                Scatter
              </button>
              <button
                type="button"
                onClick={() => canvasHandle.current?.reseed()}
              >
                <RefreshCw aria-hidden="true" size={15} strokeWidth={1.8} />
                Reset
              </button>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={() => void handleSnapshot()}
              >
                <Download aria-hidden="true" size={15} strokeWidth={1.8} />
                Download PNG
              </button>
            </section>

            <section className={styles.presetSection}>
              <div className={styles.sectionHeading}>
                <h2>Presets</h2>
              </div>
              <div className={styles.presetRail}>
                {(Object.keys(BOIDS_PRESETS) as BoidsPresetName[]).map(
                  (preset) => {
                    const selected = activePreset === preset;
                    return (
                      <button
                        type="button"
                        key={preset}
                        className={selected ? styles.presetActive : ""}
                        onClick={() => choosePreset(preset)}
                        aria-pressed={selected}
                      >
                        <span>{preset}</span>
                      </button>
                    );
                  },
                )}
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

            <section className={styles.rulesSection}>
              <div className={styles.sectionHeading}>
                <h2>Parameters</h2>
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => {
                    setSettings(DEFAULT_BOIDS_SETTINGS);
                    setActivePreset("Balanced");
                    setHasChosenPopulation(false);
                  }}
                >
                  Defaults
                </button>
              </div>
              <div className={styles.controlGrid}>
                {CONTROLS.map((control) => (
                  <label className={styles.sliderControl} key={control.key}>
                    <span>{control.label}</span>
                    <input
                      type="range"
                      min={control.min}
                      max={
                        control.key === "count"
                          ? populationMaximum
                          : control.max
                      }
                      step={control.step}
                      value={
                        control.key === "count"
                          ? effectiveSettings.count
                          : settings[control.key]
                      }
                      onChange={(event) =>
                        updateSetting(control.key, Number(event.target.value))
                      }
                      aria-label={control.label}
                    />
                    <output>
                      {control.format(
                        control.key === "count"
                          ? effectiveSettings.count
                          : settings[control.key],
                      )}
                    </output>
                  </label>
                ))}
              </div>
            </section>

            <section className={styles.renderingSection}>
              <div className={styles.sectionHeading}>
                <h2>Display</h2>
              </div>
              <div className={styles.switchGroup}>
                <div className={styles.switchRow}>
                  <span>Boid trails</span>
                  <button
                    type="button"
                    className={trails ? styles.switchActive : ""}
                    onClick={() => setTrails((current) => !current)}
                    aria-pressed={trails}
                    aria-label="Toggle boid trails"
                  >
                    <span />
                  </button>
                </div>
                <div className={styles.switchRow}>
                  <span>Corner stats</span>
                  <button
                    type="button"
                    className={showStats ? styles.switchActive : ""}
                    onClick={() => setShowStats((current) => !current)}
                    aria-pressed={showStats}
                    aria-label="Toggle corner stats"
                  >
                    <span />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </aside>
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
          onClose={() => setSnapshot(null)}
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
