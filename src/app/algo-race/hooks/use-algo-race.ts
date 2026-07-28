"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DEFAULT_SIZE } from "../config";
import { SORT_NAMES } from "../lib/algorithms";
import { frameAt } from "../lib/frames";
import type { PreparedRace, RaceStat, SortName } from "../types";
import { useRacePreparation } from "./use-race-preparation";
import { useSortCanvases } from "./use-sort-canvases";

/**
 * Replays a race that was benchmarked and recorded ahead of time. All the work
 * happens in {@link useRacePreparation}, so Start begins painting immediately.
 */
export function useAlgoRace() {
  const [arraySize, setArraySize] = useState(DEFAULT_SIZE);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [raceStats, setRaceStats] = useState<RaceStat[]>([]);

  const { registerCanvas, paint, repaintAll } = useSortCanvases();
  const { input, prepared, isPreparing, progress, refresh, prefetch } =
    useRacePreparation(DEFAULT_SIZE);

  const activeRaceRef = useRef<PreparedRace | null>(null);
  const pausedRef = useRef(false);
  const raceIdRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const pausedAtRef = useRef(0);
  const finishedSortsRef = useRef(new Set<SortName>());

  const stopPlayback = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    for (const name of SORT_NAMES) paint(name, input.data);
  }, [input, paint]);

  useEffect(() => stopPlayback, [stopPlayback]);

  const reset = useCallback(
    (size = arraySize) => {
      raceIdRef.current += 1;
      stopPlayback();
      pausedRef.current = false;
      activeRaceRef.current = null;
      setIsRunning(false);
      setIsPaused(false);
      setRaceStats([]);
      finishedSortsRef.current.clear();
      refresh(size);
    },
    [arraySize, refresh, stopPlayback],
  );

  const changeArraySize = (size: number) => {
    if (size === arraySize) return;
    setArraySize(size);
    reset(size);
  };

  const registerFinish = useCallback((name: SortName) => {
    const race = activeRaceRef.current;
    const finishedSorts = finishedSortsRef.current;
    if (!race || finishedSorts.has(name)) return;

    finishedSorts.add(name);
    setRaceStats((prev) => [
      ...prev,
      {
        name,
        executionMs: race.executionMs[name],
        playbackMs: race.playbackMs[name],
      },
    ]);
  }, []);

  const startRace = useCallback(
    (race: PreparedRace) => {
      const raceId = raceIdRef.current + 1;
      raceIdRef.current = raceId;
      stopPlayback();
      pausedRef.current = false;
      activeRaceRef.current = race;
      finishedSortsRef.current.clear();
      setIsRunning(true);
      setIsPaused(false);
      setRaceStats([]);

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
        for (const name of race.playbackOrder) {
          const strip = race.frames[name];
          const progressRatio = Math.min(1, elapsed / race.playbackMs[name]);
          const index = Math.min(
            strip.count - 1,
            Math.floor(progressRatio * strip.count),
          );
          paint(name, frameAt(strip, index));
          if (progressRatio >= 1) registerFinish(name);
          else allDone = false;
        }

        if (allDone) {
          rafRef.current = null;
          setIsRunning(false);
          setIsPaused(false);
          // Reset can then start instantly. Pauses itself if a replay restarts.
          prefetch(race.size, () => rafRef.current !== null);
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [paint, prefetch, registerFinish, stopPlayback],
  );

  /**
   * Rewinds the clock past the longest playback so the normal tick paints the
   * final frames and registers the straggler's finish in the usual order.
   */
  const skipToEnd = useCallback(() => {
    const race = activeRaceRef.current;
    if (!race || rafRef.current === null) return;

    const longestMs = Math.max(
      ...SORT_NAMES.map((name) => race.playbackMs[name]),
    );
    startedAtRef.current = performance.now() - longestMs;
    pausedRef.current = false;
    setIsPaused(false);
  }, []);

  const toggleRace = () => {
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

    if (!prepared) return;
    startRace(prepared);
  };

  // Stats are appended in finish order, so position doubles as the podium rank.
  const getRank = (name: SortName) => {
    const idx = raceStats.findIndex((entry) => entry.name === name);
    return idx === -1 ? null : idx + 1;
  };

  const raceComplete = raceStats.length === SORT_NAMES.length;
  // Offered once a single straggler is left, when the rest of the grid sits idle.
  const canSkipToEnd = isRunning && raceStats.length === SORT_NAMES.length - 1;

  // Redraws canvases to fit updated dimensions after results panel opens.
  useEffect(() => {
    const handle = requestAnimationFrame(repaintAll);
    return () => cancelAnimationFrame(handle);
  }, [raceComplete, repaintAll]);

  return {
    arraySize,
    canSkipToEnd,
    changeArraySize,
    isPaused,
    isPreparing,
    isRunning,
    prepareProgress: progress,
    raceComplete,
    raceStats,
    registerCanvas,
    reset,
    getRank,
    skipToEnd,
    toggleRace,
  };
}
