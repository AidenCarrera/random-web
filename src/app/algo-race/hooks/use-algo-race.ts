"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DEFAULT_SIZE, MIN_PLAYBACK_MS, RACE_DURATION_MS } from "../config";
import { ALGORITHMS, SORT_NAMES, createSortRecord } from "../lib/algorithms";
import { measureExecutionMs } from "../lib/benchmark";
import { captureFrames, frameAt, frameBudgetFor } from "../lib/frames";
import type { FrameStrip, RaceStat, SortName } from "../types";
import { generateRandomData } from "../utils/dataset";
import { useSortCanvases } from "./use-sort-canvases";

const nextFrame = () =>
  new Promise((r) => requestAnimationFrame(() => r(null)));

/** Drives measurement, frame capture and scaled replay for the whole grid. */
export function useAlgoRace() {
  const [arraySize, setArraySize] = useState(DEFAULT_SIZE);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [prepared, setPrepared] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [raceStats, setRaceStats] = useState<RaceStat[]>([]);
  const [seedVersion, setSeedVersion] = useState(0);

  const { registerCanvas, paint, repaintAll } = useSortCanvases();

  const baseDataRef = useRef<number[]>([]);
  const framesRef = useRef<Record<SortName, FrameStrip | null>>(
    createSortRecord(() => null),
  );
  const executionRef = useRef<Record<SortName, number>>(
    createSortRecord(() => 0),
  );
  const playbackRef = useRef<Record<SortName, number>>(
    createSortRecord(() => 0),
  );
  const playbackOrderRef = useRef<SortName[]>([...SORT_NAMES]);

  const pausedRef = useRef(false);
  const raceIdRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const pausedAtRef = useRef(0);
  const finishedSortsRef = useRef(new Set<SortName>());
  const hasSeededInitialDataRef = useRef(false);

  const seedArrays = useCallback((size: number) => {
    baseDataRef.current = generateRandomData(size);
    framesRef.current = createSortRecord(() => null);
    setSeedVersion((version) => version + 1);
  }, []);

  const stopPlayback = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (hasSeededInitialDataRef.current) return;
    hasSeededInitialDataRef.current = true;
    seedArrays(arraySize);
  }, [arraySize, seedArrays]);

  // Redraws the canvases whenever a fresh dataset is seeded.
  useEffect(() => {
    if (seedVersion === 0) return;
    for (const name of SORT_NAMES) paint(name, baseDataRef.current);
  }, [seedVersion, paint]);

  useEffect(() => stopPlayback, [stopPlayback]);

  const reset = useCallback(
    (size = arraySize) => {
      raceIdRef.current += 1;
      stopPlayback();
      pausedRef.current = false;
      setIsRunning(false);
      setIsPaused(false);
      setIsPreparing(false);
      setPrepared(0);
      setRaceStats([]);
      finishedSortsRef.current.clear();
      seedArrays(size);
    },
    [arraySize, seedArrays, stopPlayback],
  );

  const changeArraySize = (size: number) => {
    if (size === arraySize) return;
    setArraySize(size);
    reset(size);
  };

  const registerFinish = useCallback((name: SortName) => {
    const finishedSorts = finishedSortsRef.current;
    if (finishedSorts.has(name)) return;

    finishedSorts.add(name);
    setRaceStats((prev) => [
      ...prev,
      {
        name,
        executionMs: executionRef.current[name],
        playbackMs: playbackRef.current[name],
      },
    ]);
  }, []);

  const startRace = useCallback(async () => {
    const raceId = raceIdRef.current + 1;
    raceIdRef.current = raceId;
    stopPlayback();
    pausedRef.current = false;
    finishedSortsRef.current.clear();
    setIsRunning(true);
    setIsPaused(false);
    setIsPreparing(true);
    setPrepared(0);
    setRaceStats([]);

    const data = baseDataRef.current;
    // Yields to event loop so React can render the preparing UI state before benchmark loops begin.
    await nextFrame();

    // Timings must run before frame capture to calculate proportional playback frame budgets.
    for (const algorithm of ALGORITHMS) {
      if (raceId !== raceIdRef.current) return;
      executionRef.current[algorithm.name] = measureExecutionMs(
        algorithm.run,
        data,
      );
      setPrepared((done) => done + 1);
      await nextFrame();
    }

    const slowestMs = Math.max(
      ...SORT_NAMES.map((name) => executionRef.current[name]),
    );
    for (const name of SORT_NAMES) {
      playbackRef.current[name] = Math.max(
        MIN_PLAYBACK_MS,
        (RACE_DURATION_MS * executionRef.current[name]) / slowestMs,
      );
    }
    playbackOrderRef.current = [...SORT_NAMES].sort(
      (a, b) => playbackRef.current[a] - playbackRef.current[b],
    );

    for (const algorithm of ALGORITHMS) {
      if (raceId !== raceIdRef.current) return;
      framesRef.current[algorithm.name] = captureFrames(
        algorithm.run,
        data,
        frameBudgetFor(playbackRef.current[algorithm.name], data.length),
      );
      setPrepared((done) => done + 1);
      await nextFrame();
    }

    if (raceId !== raceIdRef.current) return;

    setIsPreparing(false);
    startedAtRef.current = performance.now();

    const tick = () => {
      if (raceId !== raceIdRef.current) return;

      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = performance.now() - startedAtRef.current;
      let allDone = true;

      // Evaluates fastest algorithms first so finish state is registered accurately during dropped frames.
      for (const name of playbackOrderRef.current) {
        const strip = framesRef.current[name];
        if (!strip) continue;
        const progress = Math.min(1, elapsed / playbackRef.current[name]);
        const index = Math.min(
          strip.count - 1,
          Math.floor(progress * strip.count),
        );
        paint(name, frameAt(strip, index));
        if (progress >= 1) registerFinish(name);
        else allDone = false;
      }

      if (allDone) {
        rafRef.current = null;
        setIsRunning(false);
        setIsPaused(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [paint, registerFinish, stopPlayback]);

  const toggleRace = () => {
    if (isPreparing) return;

    if (isRunning) {
      const paused = !pausedRef.current;
      if (paused) {
        pausedAtRef.current = performance.now();
      } else {
        startedAtRef.current += performance.now() - pausedAtRef.current;
      }
      pausedRef.current = paused;
      setIsPaused(paused);
      return;
    }

    void startRace();
  };

  // Stats are appended in finish order, so position doubles as the podium rank.
  const getRank = (name: SortName) => {
    const idx = raceStats.findIndex((entry) => entry.name === name);
    return idx === -1 ? null : idx + 1;
  };

  const raceComplete = raceStats.length === SORT_NAMES.length;

  // Redraws canvases to fit updated dimensions after results panel opens.
  useEffect(() => {
    const handle = requestAnimationFrame(repaintAll);
    return () => cancelAnimationFrame(handle);
  }, [raceComplete, repaintAll]);

  return {
    arraySize,
    changeArraySize,
    isPaused,
    isPreparing,
    isRunning,
    prepared,
    raceComplete,
    raceStats,
    registerCanvas,
    reset,
    getRank,
    toggleRace,
  };
}
