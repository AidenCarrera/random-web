"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PREPARE_STEPS, prepareRace } from "../lib/prepare-race";
import type { PreparedRace, RaceInput } from "../types";
import { generateRandomData } from "../utils/dataset";

let nextInputId = 0;

const createInput = (size: number): RaceInput => ({
  id: ++nextInputId,
  size,
  data: generateRandomData(size),
});

/**
 * Holds one prepared race for the visible dataset and, optionally, a prefetched
 * one for the next. Preparation is a pure effect of the current input, so any
 * change of size or dataset invalidates the cache and rebuilds it.
 */
export function useRacePreparation(initialSize: number) {
  const [input, setInput] = useState<RaceInput>(() => createInput(initialSize));
  const [prepared, setPrepared] = useState<PreparedRace | null>(null);
  const [completedSteps, setCompletedSteps] = useState(0);

  // Set when an input arrives already prepared, so the effect below skips rework.
  const readyIdRef = useRef(-1);

  // `race: null` means a prefetch is still in flight. The token discards results
  // from prefetches that were superseded before they resolved.
  const prefetchRef = useRef<{
    token: number;
    race: PreparedRace | null;
  } | null>(null);
  const prefetchTokenRef = useRef(0);

  useEffect(() => {
    if (readyIdRef.current === input.id) return;

    let cancelled = false;
    setPrepared(null);
    setCompletedSteps(0);

    void prepareRace(input, {
      onProgress: setCompletedSteps,
      isCancelled: () => cancelled,
    }).then((race) => {
      if (!cancelled && race) setPrepared(race);
    });

    return () => {
      cancelled = true;
    };
  }, [input]);

  const discardPrefetch = useCallback(() => {
    prefetchTokenRef.current += 1;
    prefetchRef.current = null;
  }, []);

  /**
   * Swaps in a fresh dataset. Adopts the prefetched race when one is ready for
   * this size, making Reset and Race Again instant.
   */
  const refresh = useCallback(
    (size: number) => {
      const cached = prefetchRef.current?.race;
      discardPrefetch();

      if (cached && cached.size === size) {
        readyIdRef.current = cached.id;
        setInput(cached);
        setPrepared(cached);
        setCompletedSteps(PREPARE_STEPS);
        return;
      }

      setInput(createInput(size));
    },
    [discardPrefetch],
  );

  /** Builds the race the user is most likely to ask for next, in the background. */
  const prefetch = useCallback((size: number, isBlocked?: () => boolean) => {
    if (prefetchRef.current) return;

    const token = ++prefetchTokenRef.current;
    prefetchRef.current = { token, race: null };

    void prepareRace(createInput(size), {
      isBlocked,
      isCancelled: () => prefetchRef.current?.token !== token,
    }).then((race) => {
      if (prefetchRef.current?.token !== token) return;
      prefetchRef.current = race ? { token, race } : null;
    });
  }, []);

  useEffect(() => discardPrefetch, [discardPrefetch]);

  return {
    input,
    prepared,
    isPreparing: prepared === null,
    progress: completedSteps / PREPARE_STEPS,
    refresh,
    prefetch,
  };
}
