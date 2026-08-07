"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DEFAULT_DURATION,
  EMPTY_RECORDS,
  HISTORY_LIMIT,
  RESULT_BUFFER_MS,
} from "../constants";
import { loadProgress, saveProgress } from "../lib/progress-storage";
import type { Duration, Readout, Records, RunResult } from "../types";
import {
  bucketClicksBySecond,
  createRunId,
  formatClockTime,
  secondIndex,
} from "../utils";

/**
 * Owns a single test run plus the saved records and history it feeds. Click
 * times are kept in a ref so the count and the pace chart are both derived from
 * one authoritative list rather than from state that lags behind fast clicking.
 */
export function useClickSpeedTest() {
  const [duration, setDuration] = useState<Duration>(DEFAULT_DURATION);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_DURATION);
  const [clicks, setClicks] = useState(0);
  const [resultCps, setResultCps] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [canRestart, setCanRestart] = useState(true);
  const [pace, setPace] = useState<number[]>([]);
  const [records, setRecords] = useState<Records>(EMPTY_RECORDS);
  const [history, setHistory] = useState<RunResult[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const clickTimesRef = useRef<number[]>([]);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const record = records[duration];

  // Whole seconds ticked so far, floored at one so the opening second reports
  // the clicks landed in it instead of a spike from dividing by a fraction.
  const liveCps = isActive
    ? clicks / Math.max(duration - timeLeft, 1)
    : resultCps;

  const readout = useMemo<Readout>(() => {
    if (isActive) return { title: "", clicks, cps: liveCps, pace };
    if (resultCps > 0 || clicks > 0)
      return { title: "", clicks, cps: resultCps, pace };

    const [latest] = history;
    if (latest)
      return {
        title: "Latest Result",
        clicks: latest.clicks,
        cps: latest.cps,
        pace: latest.pace,
      };

    // Idle stand-in, so the arena is the same height before the first run.
    return {
      title: "Ready",
      clicks: 0,
      cps: 0,
      pace: Array<number>(duration).fill(0),
    };
  }, [clicks, duration, history, isActive, liveCps, pace, resultCps]);

  // Read after mount so stored progress cannot desync the server-rendered markup.
  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      const saved = loadProgress();
      if (saved.duration !== undefined) {
        setDuration(saved.duration);
        setTimeLeft(saved.duration);
      }
      if (saved.records) setRecords(saved.records);
      if (saved.history) setHistory(saved.history);
      setHasLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    saveProgress({ duration, records, history });
  }, [duration, hasLoaded, history, records]);

  const finishRun = useCallback(() => {
    const clickTimes = clickTimesRef.current;
    const finalClicks = clickTimes.length;
    const cps = finalClicks / duration;
    const finalPace = bucketClicksBySecond(
      clickTimes,
      startTimeRef.current ?? 0,
      duration,
    );

    setTimeLeft(0);
    setIsActive(false);
    setCanRestart(false);
    setResultCps(cps);
    setPace(finalPace);

    setRecords((current) =>
      finalClicks > current[duration].clicks
        ? { ...current, [duration]: { clicks: finalClicks, cps } }
        : current,
    );

    setHistory((runs) =>
      [
        {
          id: createRunId(),
          clicks: finalClicks,
          cps,
          duration,
          pace: finalPace,
          timestamp: formatClockTime(),
        },
        ...runs,
      ].slice(0, HISTORY_LIMIT),
    );

    // Hold the result on screen before the button accepts a new run.
    restartTimeoutRef.current = setTimeout(() => {
      setCanRestart(true);
      restartTimeoutRef.current = null;
    }, RESULT_BUFFER_MS);
  }, [duration]);

  // The interval only drives the countdown display; the timeout ends the run so
  // a throttled tick cannot stretch it.
  useEffect(() => {
    if (!isActive) return;

    const countdown = setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);
    const completion = setTimeout(finishRun, duration * 1000);

    return () => {
      clearInterval(countdown);
      clearTimeout(completion);
    };
  }, [duration, finishRun, isActive]);

  useEffect(
    () => () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    },
    [],
  );

  const clearRun = useCallback(
    (nextDuration: Duration = duration) => {
      setIsActive(false);
      setClicks(0);
      setTimeLeft(nextDuration);
      setResultCps(0);
      setPace([]);
      setCanRestart(true);
      clickTimesRef.current = [];
      startTimeRef.current = null;

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
    },
    [duration],
  );

  const registerClick = useCallback(
    (clickTime: number) => {
      if (!isActive) {
        if (!canRestart) return;
        clearRun();
        startTimeRef.current = clickTime;
        setIsActive(true);
      }

      clickTimesRef.current.push(clickTime);
      setClicks(clickTimesRef.current.length);
      setPace((current) => {
        const next =
          current.length === duration
            ? [...current]
            : Array<number>(duration).fill(0);
        const startTime = startTimeRef.current ?? clickTime;
        next[secondIndex(clickTime, startTime, duration)] += 1;
        return next;
      });
    },
    [canRestart, clearRun, duration, isActive],
  );

  const changeDuration = useCallback(
    (nextDuration: Duration) => {
      setDuration(nextDuration);
      clearRun(nextDuration);
    },
    [clearRun],
  );

  // Exposed without arguments so an event handler cannot pass one by accident.
  const resetRun = useCallback(() => clearRun(), [clearRun]);

  return {
    duration,
    timeLeft,
    clicks,
    isActive,
    canRestart,
    liveCps,
    record,
    /** Best count the milestone ladder has seen for this duration. */
    bestClicks: Math.max(clicks, record.clicks),
    history,
    readout,
    changeDuration,
    registerClick,
    resetRun,
  };
}
