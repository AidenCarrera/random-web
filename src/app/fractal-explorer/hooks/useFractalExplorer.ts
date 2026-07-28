"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { MouseEvent, PointerEvent, WheelEvent } from "react";
import { canvasToBlob } from "@/lib/canvasExport";
import { MAX_RENDER_ITERATIONS, MAX_ZOOM } from "../constants";
import type {
  ComplexPoint,
  Coordinates,
  FractalMode,
  Landmark,
  PaletteName,
} from "../types";
import { useFractalAudio } from "./useFractalAudio";
import { useFractalRenderer } from "./useFractalRenderer";

type ExportSnapshot = {
  blob: Blob;
  fileName: string;
  imageSrc: string;
};

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

const getServerTouchCapabilitySnapshot = () => false;

function subscribeToLocation(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener("hashchange", onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener("hashchange", onStoreChange);
  };
}

const getShareUrlSnapshot = () => window.location.href;
const getServerShareUrlSnapshot = () => "";

export function useFractalExplorer() {
  // React State for Control Panels and Indicators
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [currentIterations, setCurrentIterations] = useState<number>(200);
  const [currentPalette, setCurrentPalette] = useState<PaletteName>("Neon");
  const [currentMode, setCurrentMode] = useState<FractalMode>("mandelbrot");

  // Display coordinates for UI tracking
  const [uiCoords, setUiCoords] = useState<Coordinates>({
    r: -0.7,
    i: 0.0,
  });
  const [juliaCDisplay, setJuliaCDisplay] = useState<ComplexPoint>([
    -0.7, 0.27015,
  ]);
  const [juliaCLocked, setJuliaCLocked] = useState<ComplexPoint>([
    -0.7, 0.27015,
  ]);
  const [isJuliaFrozen, setIsJuliaFrozen] = useState<boolean>(false);

  // Layout Panels Visibility
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
  const [showWelcomePrompt, setShowWelcomePrompt] = useState<boolean>(true);
  const [activeLandmarkIndex, setActiveLandmarkIndex] = useState<number>(-1);
  const [exportSnapshot, setExportSnapshot] =
    useState<ExportSnapshot | null>(null);
  const isTouchDevice = useSyncExternalStore(
    subscribeToTouchCapability,
    getTouchCapabilitySnapshot,
    getServerTouchCapabilitySnapshot,
  );
  const shareUrl = useSyncExternalStore(
    subscribeToLocation,
    getShareUrlSnapshot,
    getServerShareUrlSnapshot,
  );

  // Interactive interaction states
  const isDraggingRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);
  const mouseDownStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startDragMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeTouchPointersRef = useRef<Map<number, { x: number; y: number }>>(
    new Map(),
  );
  const pinchRef = useRef<{
    distance: number;
    zoom: number;
    focusX: number;
    focusY: number;
  } | null>(null);
  const DRAG_THRESHOLD_PX = 5;
  const isAnimatingRef = useRef<boolean>(false);
  const recentTouchInteractionRef = useRef<boolean>(false);
  const touchResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exportObjectUrlRef = useRef<string | null>(null);

  const renderer = useFractalRenderer({ isAnimatingRef });
  const {
    canvasRef,
    centerXRef,
    centerYRef,
    cpuCanvasRef,
    drawFastPreview,
    isCpuRenderActive,
    iterationsRef,
    juliaCRef,
    miniCanvasRef,
    modeRef,
    paletteRef,
    renderAnimationFrame,
    scheduleProgressiveRender,
    triggerProgressiveRender,
    updateMiniJuliaPreview,
    zoomRef,
  } = renderer;

  const audio = useFractalAudio({ iterationsRef, paletteRef });
  const {
    audioLoadingProgress,
    initAudioEngine,
    isAudioEnabled,
    isAudioLoading,
    isAudioReady,
    setIsAudioEnabled,
    sonifyCoordinate,
    toggleAudio,
    updateSynthForPalette,
  } = audio;

  // -------------------------------------------------------------
  // Preset Landmark Fly-through Animation
  // -------------------------------------------------------------

  const flyToLandmark = (landmark: Landmark, index: number) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setActiveLandmarkIndex(index);

    const startX = centerXRef.current;
    const startY = centerYRef.current;
    const startZoom = zoomRef.current;

    const duration = 1500; // 1.5 seconds cinematic zoom
    let startTime: number | null = null;

    const animate = (time: number) => {
      startTime ??= time;
      const elapsed = time - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      centerXRef.current = startX + (landmark.cx - startX) * ease;
      centerYRef.current = startY + (landmark.cy - startY) * ease;

      zoomRef.current = Math.exp(
        Math.log(startZoom) +
          (Math.log(landmark.zoom) - Math.log(startZoom)) * ease,
      );

      // Full-resolution GPU render on every frame â€” no need for a low-res
      renderAnimationFrame(6);

      setUiCoords({ r: centerXRef.current, i: centerYRef.current });
      setZoomLevel(zoomRef.current);

      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        isAnimatingRef.current = false;
        triggerProgressiveRender();
      }
    };

    requestAnimationFrame(animate);
  };

  // -------------------------------------------------------------
  // Event Listeners: Zooming and Panning
  // -------------------------------------------------------------

  const markRecentTouchInteraction = () => {
    recentTouchInteractionRef.current = true;
    if (touchResetTimerRef.current) clearTimeout(touchResetTimerRef.current);
    touchResetTimerRef.current = setTimeout(() => {
      recentTouchInteractionRef.current = false;
    }, 500);
  };

  const getCanvasPointerPosition = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      canvas,
      rect,
      px: (clientX - rect.left) * scaleX,
      py: (clientY - rect.top) * scaleY,
      widthInComplex: 3.0 / zoomRef.current,
      heightInComplex: (3.0 / zoomRef.current) * (canvas.height / canvas.width),
    };
  };

  const beginPinchGesture = () => {
    const [firstTouch, secondTouch] = Array.from(
      activeTouchPointersRef.current.values(),
    );
    if (!firstTouch || !secondTouch) return;

    const midpointX = (firstTouch.x + secondTouch.x) / 2;
    const midpointY = (firstTouch.y + secondTouch.y) / 2;
    const pointer = getCanvasPointerPosition(midpointX, midpointY);
    if (!pointer) return;

    const { canvas, px, py, widthInComplex, heightInComplex } = pointer;
    pinchRef.current = {
      distance: Math.hypot(
        secondTouch.x - firstTouch.x,
        secondTouch.y - firstTouch.y,
      ),
      zoom: zoomRef.current,
      focusX:
        centerXRef.current +
        (px - canvas.width / 2) * (widthInComplex / canvas.width),
      focusY:
        centerYRef.current +
        (py - canvas.height / 2) * (heightInComplex / canvas.height),
    };
    isDraggingRef.current = false;
    hasDraggedRef.current = true;
  };

  const updatePinchGesture = () => {
    const pinch = pinchRef.current;
    const [firstTouch, secondTouch] = Array.from(
      activeTouchPointersRef.current.values(),
    );
    if (!pinch || !firstTouch || !secondTouch || pinch.distance === 0) {
      return false;
    }

    const midpointX = (firstTouch.x + secondTouch.x) / 2;
    const midpointY = (firstTouch.y + secondTouch.y) / 2;
    const pointer = getCanvasPointerPosition(midpointX, midpointY);
    if (!pointer) return false;

    const distance = Math.hypot(
      secondTouch.x - firstTouch.x,
      secondTouch.y - firstTouch.y,
    );
    const newZoom = Math.max(
      0.1,
      Math.min(MAX_ZOOM, pinch.zoom * (distance / pinch.distance)),
    );
    const newWidthInComplex = 3.0 / newZoom;
    const newHeightInComplex =
      newWidthInComplex * (pointer.canvas.height / pointer.canvas.width);

    centerXRef.current =
      pinch.focusX -
      (pointer.px - pointer.canvas.width / 2) *
        (newWidthInComplex / pointer.canvas.width);
    centerYRef.current =
      pinch.focusY -
      (pointer.py - pointer.canvas.height / 2) *
        (newHeightInComplex / pointer.canvas.height);
    zoomRef.current = newZoom;

    setZoomLevel(newZoom);
    setUiCoords({ r: centerXRef.current, i: centerYRef.current });
    drawFastPreview();
    return true;
  };

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (isAnimatingRef.current) return;

    if (e.pointerType === "touch") {
      markRecentTouchInteraction();
      e.currentTarget.setPointerCapture(e.pointerId);
      activeTouchPointersRef.current.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
      });

      if (activeTouchPointersRef.current.size >= 2) {
        beginPinchGesture();
        return;
      }
    } else if (!e.isPrimary) {
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    mouseDownStartRef.current = { x: e.clientX, y: e.clientY };
    startDragMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === "touch") {
      activeTouchPointersRef.current.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
      });

      if (activeTouchPointersRef.current.size >= 2) {
        e.preventDefault();
        updatePinchGesture();
        return;
      }
    } else if (!e.isPrimary) {
      return;
    }

    const pointer = getCanvasPointerPosition(e.clientX, e.clientY);
    if (!pointer) return;

    const { canvas, px, py, rect, widthInComplex, heightInComplex } = pointer;

    const mouseX =
      centerXRef.current +
      (px - canvas.width / 2) * (widthInComplex / canvas.width);
    const mouseY =
      centerYRef.current +
      (py - canvas.height / 2) * (heightInComplex / canvas.height);

    if (modeRef.current === "mandelbrot" && !isJuliaFrozen) {
      updateMiniJuliaPreview(mouseX, mouseY);
      setJuliaCDisplay([mouseX, mouseY]);
    }

    if (isDraggingRef.current) {
      const totalDx = e.clientX - mouseDownStartRef.current.x;
      const totalDy = e.clientY - mouseDownStartRef.current.y;
      if (
        totalDx * totalDx + totalDy * totalDy >
        DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX
      ) {
        hasDraggedRef.current = true;
      }

      const dx = e.clientX - startDragMouseRef.current.x;
      const dy = e.clientY - startDragMouseRef.current.y;
      startDragMouseRef.current = { x: e.clientX, y: e.clientY };

      centerXRef.current -= dx * (widthInComplex / rect.width);
      centerYRef.current -= dy * (heightInComplex / rect.height);

      setUiCoords({ r: centerXRef.current, i: centerYRef.current });
      drawFastPreview();
    } else if (e.pointerType === "mouse") {
      let iter = 0;
      let zr = 0.0;
      let zi = 0.0;
      let zr2 = 0.0;
      let zi2 = 0.0;
      const maxIter = iterationsRef.current;

      if (modeRef.current === "mandelbrot") {
        while (zr2 + zi2 <= 4.0 && iter < maxIter) {
          zi = 2.0 * zr * zi + mouseY;
          zr = zr2 - zi2 + mouseX;
          zr2 = zr * zr;
          zi2 = zi * zi;
          iter++;
        }
      } else {
        const jc = juliaCRef.current;
        zr = mouseX;
        zi = mouseY;
        zr2 = zr * zr;
        zi2 = zi * zi;
        while (zr2 + zi2 <= 4.0 && iter < maxIter) {
          zi = 2.0 * zr * zi + jc[1];
          zr = zr2 - zi2 + jc[0];
          zr2 = zr * zr;
          zi2 = zi * zi;
          iter++;
        }
      }

      if (isAudioEnabled && !isAudioReady && !isAudioLoading) {
        initAudioEngine();
      }
      sonifyCoordinate(mouseX, mouseY, iter);
    }
  };

  const handlePointerUpOrCancel = (e: PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === "touch") {
      markRecentTouchInteraction();
      activeTouchPointersRef.current.delete(e.pointerId);
      pinchRef.current = null;

      const remainingTouch = Array.from(
        activeTouchPointersRef.current.values(),
      )[0];
      if (remainingTouch) {
        isDraggingRef.current = true;
        hasDraggedRef.current = true;
        mouseDownStartRef.current = remainingTouch;
        startDragMouseRef.current = remainingTouch;
      } else if (isDraggingRef.current) {
        isDraggingRef.current = false;
        triggerProgressiveRender();
      }

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      return;
    }

    if (!e.isPrimary) return;

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      triggerProgressiveRender();
    }
  };

  // Zoom logic based on scroll/wheel
  const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    if (isAnimatingRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mousePx = e.clientX - rect.left;
    const mousePy = e.clientY - rect.top;

    const widthInComplex = 3.0 / zoomRef.current;
    const heightInComplex = widthInComplex * (canvas.height / canvas.width);

    const mouseCX =
      centerXRef.current +
      (mousePx - canvas.width / 2) * (widthInComplex / canvas.width);
    const mouseCY =
      centerYRef.current +
      (mousePy - canvas.height / 2) * (heightInComplex / canvas.height);

    const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
    const newZoom = Math.max(0.1, Math.min(MAX_ZOOM, zoomRef.current * factor));

    const newWidthInComplex = 3.0 / newZoom;
    const newHeightInComplex =
      newWidthInComplex * (canvas.height / canvas.width);

    centerXRef.current =
      mouseCX -
      (mousePx - canvas.width / 2) * (newWidthInComplex / canvas.width);
    centerYRef.current =
      mouseCY -
      (mousePy - canvas.height / 2) * (newHeightInComplex / canvas.height);
    zoomRef.current = newZoom;

    setZoomLevel(newZoom);
    setUiCoords({ r: centerXRef.current, i: centerYRef.current });
    drawFastPreview();
    scheduleProgressiveRender(150);
  };

  // Double click zooms into the clicked point (desktop only)
  const handleDoubleClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isAnimatingRef.current || recentTouchInteractionRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const widthInComplex = 3.0 / zoomRef.current;
    const heightInComplex = widthInComplex * (canvas.height / canvas.width);

    const mouseCX =
      centerXRef.current +
      (px - canvas.width / 2) * (widthInComplex / canvas.width);
    const mouseCY =
      centerYRef.current +
      (py - canvas.height / 2) * (heightInComplex / canvas.height);

    const newZoom = Math.min(MAX_ZOOM, zoomRef.current * 2.2);
    const newWidthInComplex = 3.0 / newZoom;
    const newHeightInComplex =
      newWidthInComplex * (canvas.height / canvas.width);

    centerXRef.current =
      mouseCX - (px - canvas.width / 2) * (newWidthInComplex / canvas.width);
    centerYRef.current =
      mouseCY - (py - canvas.height / 2) * (newHeightInComplex / canvas.height);
    zoomRef.current = newZoom;

    setZoomLevel(newZoom);
    setUiCoords({ r: centerXRef.current, i: centerYRef.current });
    drawFastPreview();
    triggerProgressiveRender();
  };

  // Click on main canvas Mandelbrot to freeze Julia constant (not when dragging)
  const handleCanvasClick = () => {
    if (modeRef.current === "mandelbrot" && !hasDraggedRef.current) {
      setIsJuliaFrozen((f) => !f);
    }
  };

  // Enter Julia Mode using selected seed coordinate
  const enterJuliaModeWithSeed = () => {
    const lockedSeed: ComplexPoint = [juliaCDisplay[0], juliaCDisplay[1]];

    modeRef.current = "julia";
    juliaCRef.current = lockedSeed;
    setJuliaCLocked(lockedSeed);

    centerXRef.current = 0.0;
    centerYRef.current = 0.0;
    zoomRef.current = 1.0;

    setCurrentMode("julia");
    setZoomLevel(1.0);
    setUiCoords({ r: 0.0, i: 0.0 });

    triggerProgressiveRender();
  };

  const resetJuliaSeedToLocked = () => {
    juliaCRef.current = [juliaCLocked[0], juliaCLocked[1]];
    setJuliaCDisplay([juliaCLocked[0], juliaCLocked[1]]);
    triggerProgressiveRender();
  };

  // Return to Mandelbrot set
  const enterMandelbrotMode = () => {
    modeRef.current = "mandelbrot";
    centerXRef.current = -0.7;
    centerYRef.current = 0.0;
    zoomRef.current = 1.0;

    setCurrentMode("mandelbrot");
    setZoomLevel(1.0);
    setUiCoords({ r: -0.7, i: 0.0 });

    triggerProgressiveRender();
  };

  // Prepare a high-resolution PNG for the shared export preview.
  const downloadFractalImage = async () => {
    const cpuCanvas = cpuCanvasRef.current;
    const canvas =
      cpuCanvas?.style.opacity === "1" ? cpuCanvas : canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await canvasToBlob(canvas);
      if (exportObjectUrlRef.current) {
        URL.revokeObjectURL(exportObjectUrlRef.current);
      }

      const imageSrc = URL.createObjectURL(blob);
      exportObjectUrlRef.current = imageSrc;
      setExportSnapshot({
        blob,
        fileName: `fractal-${currentMode}-${currentPalette}-${Date.now()}.png`,
        imageSrc,
      });
    } catch (error) {
      console.error("Failed to prepare fractal export preview:", error);
    }
  };

  const closeExportPreview = () => {
    if (exportObjectUrlRef.current) {
      URL.revokeObjectURL(exportObjectUrlRef.current);
      exportObjectUrlRef.current = null;
    }
    setExportSnapshot(null);
  };

  const saveExportImage = async () => {
    if (!exportSnapshot) return;

    try {
      const pngFile = new File(
        [exportSnapshot.blob],
        exportSnapshot.fileName,
        { type: "image/png" },
      );
      const canShareFile =
        "share" in navigator &&
        "canShare" in navigator &&
        navigator.canShare({ files: [pngFile] });

      if (canShareFile) {
        await navigator.share({
          files: [pngFile],
          title: "Fractal Explorer",
          text: "Save this Fractal Explorer snapshot.",
        });
        return;
      }

      window.open(exportSnapshot.imageSrc, "_blank", "noopener,noreferrer");
    } catch {}
  };

  // Adjust parameters when slider inputs change
  const handleIterationChange = (newVal: number) => {
    const nextIterations = Math.min(MAX_RENDER_ITERATIONS, newVal);
    iterationsRef.current = nextIterations;
    setCurrentIterations(nextIterations);
    triggerProgressiveRender();
  };

  const handlePaletteChange = (palette: PaletteName) => {
    paletteRef.current = palette;
    setCurrentPalette(palette);
    updateSynthForPalette(palette);

    if (modeRef.current === "mandelbrot") {
      updateMiniJuliaPreview(juliaCDisplay[0], juliaCDisplay[1]);
    }
    triggerProgressiveRender();
  };

  // Update slider variables for manual Julia Constant adjusting
  const handleJuliaCSlider = (val: number, isImaginary: boolean) => {
    const updated: ComplexPoint = isImaginary
      ? [juliaCRef.current[0], val]
      : [val, juliaCRef.current[1]];

    juliaCRef.current = updated;
    setJuliaCDisplay(updated);
    triggerProgressiveRender();
  };

  useEffect(
    () => () => {
      if (touchResetTimerRef.current) clearTimeout(touchResetTimerRef.current);
      if (exportObjectUrlRef.current) {
        URL.revokeObjectURL(exportObjectUrlRef.current);
      }
    },
    [],
  );

  return {
    activeLandmarkIndex,
    audioLoadingProgress,
    canvasRef,
    closeExportPreview,
    cpuCanvasRef,
    currentIterations,
    currentMode,
    currentPalette,
    downloadFractalImage,
    enterJuliaModeWithSeed,
    enterMandelbrotMode,
    flyToLandmark,
    handleCanvasClick,
    handleDoubleClick,
    handleIterationChange,
    handleJuliaCSlider,
    handlePaletteChange,
    handlePointerDown,
    handlePointerMove,
    handlePointerUpOrCancel,
    handleWheel,
    initAudioEngine,
    isAudioEnabled,
    isAudioLoading,
    isCpuRenderActive,
    isTouchDevice,
    isJuliaFrozen,
    isSettingsOpen,
    juliaCDisplay,
    juliaCLocked,
    miniCanvasRef,
    resetJuliaSeedToLocked,
    saveExportImage,
    setIsAudioEnabled,
    setIsJuliaFrozen,
    setIsSettingsOpen,
    setShowCoordinates,
    setShowWelcomePrompt,
    shareUrl,
    showCoordinates,
    showWelcomePrompt,
    exportSnapshot,
    toggleAudio,
    uiCoords,
    zoomLevel,
  };
}

export type FractalExplorerController = ReturnType<typeof useFractalExplorer>;
