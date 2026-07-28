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

/** Manages preparation and background prefetching for race datasets. */
export function useRacePreparation(initialSize: number) {
  const [input, setInput] = useState<RaceInput>(() => createInput(initialSize));
  const [prepared, setPrepared] = useState<PreparedRace | null>(null);
  const [completedSteps, setCompletedSteps] = useState(0);

  // Skip rebuild when input is already prepared by prefetch.
  const readyIdRef = useRef(-1);

  // Token invalidates stale background prefetches when superseded.
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

  /** Swaps dataset, adopting prefetched race if size matches. */
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

  /** Prefetches next race dataset in the background. */
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
