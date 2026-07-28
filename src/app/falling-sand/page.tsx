"use client";

import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { ExportPreviewModal } from "@/components/ExportPreviewModal";

import { Toolbox } from "./components/Toolbox";
import { WorldPanel } from "./components/WorldPanel";
import { DRAWABLE_MATERIALS } from "./data/materials";
import { useBrowserState } from "./hooks/useBrowserState";
import { useCanvasHint } from "./hooks/useCanvasHint";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { useSnapshotExport } from "./hooks/useSnapshotExport";
import { useToast } from "./hooks/useToast";
import { useWorldStorage } from "./hooks/useWorldStorage";
import styles from "./styles.module.css";
import {
  MATERIAL_COUNT,
  Material,
  type FallingSandCanvasHandle,
  type PanelTab,
  type SandWorldStats,
} from "./types";

export default function FallingSandPage() {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<FallingSandCanvasHandle>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [material, setMaterial] = useState(Material.SAND);
  const [brushSize, setBrushSize] = useState(5);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>("elements");
  const [panelMinimizedOverride, setPanelMinimizedOverride] = useState<
    boolean | null
  >(null);
  const [ready, setReady] = useState(false);
  const [showCanvasHint, setShowCanvasHint] = useCanvasHint();
  const [displayFrameRate, setDisplayFrameRate] = useState(false);
  const [rightClickErases, setRightClickErases] = useState(true);
  const [pauseWhileDrawing, setPauseWhileDrawing] = useState(false);
  const [autoPauseWhenHidden, setAutoPauseWhenHidden] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [stats, setStats] = useState<SandWorldStats>({
    cells: 0,
    active: 0,
    fps: 0,
    materialCounts: Array<number>(MATERIAL_COUNT).fill(0),
  });

  const { isMobileViewport, isTouchDevice, shareUrl } = useBrowserState();
  const { showToast, toast } = useToast();
  const { loadWorld, saveWorld } = useWorldStorage(
    canvasRef,
    autoSave,
    ready,
    showToast,
  );
  const { closeSnapshot, exportWorld, saveSnapshot, snapshot } =
    useSnapshotExport(canvasRef, showToast);
  const togglePaused = useCallback(() => setPaused((current) => !current), []);
  useKeyboardControls(setMaterial, togglePaused);

  const simulationPaused = paused || Boolean(reduceMotion);
  const panelMinimized = panelMinimizedOverride ?? isMobileViewport;
  const selectedMaterial =
    DRAWABLE_MATERIALS.find((item) => item.id === material) ??
    DRAWABLE_MATERIALS[0];

  return (
    <>
      <main className={styles.root}>
        <div className={styles.workspace} ref={workspaceRef}>
          <WorldPanel
            autoPauseWhenHidden={autoPauseWhenHidden}
            brushSize={brushSize}
            canvasRef={canvasRef}
            displayFrameRate={displayFrameRate}
            material={material}
            onBrushSizeChange={setBrushSize}
            onClear={() => canvasRef.current?.clear()}
            onExport={exportWorld}
            onHintDismiss={() => setShowCanvasHint(false)}
            onLoad={loadWorld}
            onPausedToggle={togglePaused}
            onReady={() => setReady(true)}
            onReset={() => canvasRef.current?.reset()}
            onSave={saveWorld}
            onSpeedChange={setSpeed}
            onStats={setStats}
            pauseWhileDrawing={pauseWhileDrawing}
            paused={simulationPaused}
            ready={ready}
            rightClickErases={rightClickErases}
            showCanvasHint={showCanvasHint}
            speed={speed}
            stats={stats}
          />
          <Toolbox
            activeTab={activeTab}
            autoPauseWhenHidden={autoPauseWhenHidden}
            autoSave={autoSave}
            brushSize={brushSize}
            displayFrameRate={displayFrameRate}
            isTouchDevice={isTouchDevice}
            material={material}
            minimized={panelMinimized}
            onActiveTabChange={setActiveTab}
            onAutoPauseWhenHiddenChange={setAutoPauseWhenHidden}
            onAutoSaveChange={setAutoSave}
            onBrushSizeChange={setBrushSize}
            onDisplayFrameRateChange={setDisplayFrameRate}
            onMaterialChange={setMaterial}
            onMinimizedChange={setPanelMinimizedOverride}
            onPauseWhileDrawingChange={setPauseWhileDrawing}
            onRightClickErasesChange={setRightClickErases}
            onShowCanvasHintChange={setShowCanvasHint}
            pauseWhileDrawing={pauseWhileDrawing}
            rightClickErases={rightClickErases}
            selectedMaterial={selectedMaterial}
            showCanvasHint={showCanvasHint}
            speed={speed}
            stats={stats}
            workspaceRef={workspaceRef}
          />
        </div>

        {toast ? (
          <div
            className={`${styles.toast} ${toast.tone === "error" ? styles.toastError : ""}`}
            role={toast.tone === "error" ? "alert" : "status"}
          >
            {toast.message}
          </div>
        ) : null}
      </main>

      {snapshot ? (
        <ExportPreviewModal
          description={
            isTouchDevice
              ? "Save the PNG to your device or share the simulator with friends."
              : "Preview your world, then download the PNG or share the simulator."
          }
          emailBody="I made this world in the Falling Sand simulator:"
          emailSubject="My Falling Sand creation"
          facebookHashtag="#FallingSand"
          fileName={snapshot.fileName}
          imageAlt="Preview of a Falling Sand simulator creation"
          imageSrc={snapshot.imageSrc}
          isTouchDevice={isTouchDevice}
          onClose={closeSnapshot}
          onSaveImage={saveSnapshot}
          pixelatedPreview
          shareHeading="Share your world"
          shareUrl={shareUrl}
          socialTitle="I made this world in the Falling Sand simulator."
          title="Your pocket world"
        />
      ) : null}
    </>
  );
}
