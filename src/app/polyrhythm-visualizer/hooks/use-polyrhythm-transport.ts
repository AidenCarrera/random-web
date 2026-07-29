"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BPM_MAX, BPM_MIN, DEFAULT_BPM, DEFAULT_RHYTHMS } from "../constants";
import { ClickEngine } from "../lib/click-engine";
import { RHYTHM_BY_COUNT } from "../rhythms";
import type { PulseKey, Rhythm } from "../types";
import { clamp, cycleSeconds, pulseKey } from "../utils";
import { useLatest } from "./use-latest";

/** How long a pulse stays lit, in milliseconds. */
const DOWNBEAT_FLASH = 170;
const PULSE_FLASH = 130;

/** Input types that swallow keystrokes, so shortcuts must not steal them. */
const TEXT_INPUT_TYPES = new Set([
  "email",
  "number",
  "password",
  "search",
  "tel",
  "text",
  "url",
]);

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target.tagName === "TEXTAREA") return true;
  return (
    target instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(target.type)
  );
}

/**
 * Owns the audio engine, the animation clock and every piece of playback state.
 * The clock runs off the audio context rather than wall time so pulses stay in
 * step with the sound, and tempo changes rebase it instead of restarting it.
 */
export function usePolyrhythmTransport() {
  const [activeCounts, setActiveCounts] = useState(DEFAULT_RHYTHMS);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [bpmInput, setBpmInput] = useState(String(DEFAULT_BPM));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [turns, setTurns] = useState(0);
  const [activePulses, setActivePulses] = useState<Set<PulseKey>>(new Set());

  const engineRef = useRef<ClickEngine | null>(null);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef(new Set<number>());
  const startTimeRef = useRef(0);
  const cyclePositionRef = useRef(0);
  const progressRef = useRef(0);
  const turnsRef = useRef(0);
  const lastElapsedRef = useRef(0);

  const countsRef = useLatest(activeCounts);
  const bpmRef = useLatest(bpm);
  const mutedRef = useLatest(isMuted);
  const playingRef = useLatest(isPlaying);

  const rhythms = useMemo(
    () =>
      activeCounts
        .map((count) => RHYTHM_BY_COUNT.get(count))
        .filter((rhythm): rhythm is Rhythm => rhythm !== undefined),
    [activeCounts],
  );

  const stopLoop = useCallback(() => {
    if (rafRef.current === null) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const clearPulseState = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
    setActivePulses(new Set());
  }, []);

  const flash = useCallback(
    (count: number, pulse: number, downbeat: boolean) => {
      const keys = downbeat
        ? countsRef.current.map((rhythm) => pulseKey(rhythm, 0))
        : [pulseKey(count, pulse)];

      setActivePulses((current) => new Set([...current, ...keys]));

      // Tracked in a set so each timer drops itself once it fires; a plain list
      // would keep growing for as long as playback runs.
      const timer = window.setTimeout(
        () => {
          timersRef.current.delete(timer);
          setActivePulses((current) => {
            const next = new Set(current);
            keys.forEach((key) => next.delete(key));
            return next;
          });
        },
        downbeat ? DOWNBEAT_FLASH : PULSE_FLASH,
      );
      timersRef.current.add(timer);
    },
    [countsRef],
  );

  const triggerPulses = useCallback(
    (from: number, to: number) => {
      const engine = engineRef.current;
      if (!engine || to < from) return;

      const duration = cycleSeconds(bpmRef.current);
      countsRef.current.forEach((count) => {
        const rhythm = RHYTHM_BY_COUNT.get(count);
        if (!rhythm) return;

        const interval = duration / count;
        const first = Math.floor(from / interval) + 1;
        const last = Math.floor(to / interval);

        for (let index = first; index <= last; index++) {
          const pulse = ((index % count) + count) % count;
          const downbeat = pulse === 0;
          if (!mutedRef.current) engine.play(rhythm, downbeat);
          flash(count, pulse, downbeat);
        }
      });
    },
    [bpmRef, countsRef, flash, mutedRef],
  );

  const startLoop = useCallback(() => {
    stopLoop();

    const tick = () => {
      rafRef.current = null;
      if (document.hidden) return;

      const engine = engineRef.current;
      if (!engine) return;

      const duration = cycleSeconds(bpmRef.current);
      const elapsed = Math.max(0, engine.time - startTimeRef.current);
      const visualElapsed = Math.max(0, elapsed - engine.latency);
      const nextProgress = (visualElapsed % duration) / duration;

      // Accumulate cycles instead of deriving them from elapsed time: tempo
      // changes rebase the clock, and visuals that spin must not jump with it.
      const step = nextProgress - progressRef.current;
      turnsRef.current += step < 0 ? step + 1 : step;

      triggerPulses(lastElapsedRef.current, elapsed);
      lastElapsedRef.current = elapsed;
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      setTurns(turnsRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [bpmRef, stopLoop, triggerPulses]);

  const togglePlay = useCallback(async () => {
    const engine = (engineRef.current ??= new ClickEngine());
    await engine.init();
    engine.setMuted(mutedRef.current);

    if (playingRef.current) {
      cyclePositionRef.current =
        progressRef.current * cycleSeconds(bpmRef.current);
      lastElapsedRef.current = cyclePositionRef.current;
      engine.silence();
      clearPulseState();
      stopLoop();
      setIsPlaying(false);
      return;
    }

    startTimeRef.current = engine.time - cyclePositionRef.current;
    lastElapsedRef.current = cyclePositionRef.current || -0.001;
    setIsPlaying(true);
    startLoop();
  }, [bpmRef, clearPulseState, mutedRef, playingRef, startLoop, stopLoop]);

  const reset = useCallback(() => {
    const engine = engineRef.current;
    cyclePositionRef.current = 0;
    lastElapsedRef.current = playingRef.current ? -0.001 : 0;
    progressRef.current = 0;
    turnsRef.current = 0;
    setProgress(0);
    setTurns(0);
    clearPulseState();
    engine?.silence();

    if (playingRef.current) {
      startTimeRef.current = engine?.time ?? 0;
      startLoop();
    }
  }, [clearPulseState, playingRef, startLoop]);

  const toggleMute = useCallback(() => setIsMuted((value) => !value), []);

  const toggleRhythm = useCallback((count: number) => {
    setActiveCounts((current) =>
      current.includes(count)
        ? current.length === 1
          ? current
          : current.filter((value) => value !== count)
        : [...current, count].sort((a, b) => a - b),
    );
  }, []);

  const changeBpm = useCallback((next: number) => {
    setBpm(next);
    setBpmInput(String(next));
  }, []);

  const commitBpm = useCallback(() => {
    const parsed = Number.parseInt(bpmInput, 10);
    const next = clamp(
      Number.isNaN(parsed) ? DEFAULT_BPM : parsed,
      BPM_MIN,
      BPM_MAX,
    );
    setBpm(next);
    setBpmInput(String(next));
  }, [bpmInput]);

  useEffect(() => {
    const position = progressRef.current * cycleSeconds(bpm);
    cyclePositionRef.current = position;
    lastElapsedRef.current = position;
    if (playingRef.current && engineRef.current) {
      startTimeRef.current = engineRef.current.time - position;
    }
  }, [bpm, playingRef]);

  useEffect(() => {
    engineRef.current?.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const engine = engineRef.current;

      if (document.hidden) {
        if (playingRef.current) {
          // Keep the musical position, but discard pulses that occur while the
          // browser throttles this tab. Playing those pulses together on return
          // creates an audible pop.
          cyclePositionRef.current =
            progressRef.current * cycleSeconds(bpmRef.current);
          lastElapsedRef.current = cyclePositionRef.current;
          engine?.silence();
          clearPulseState();
          stopLoop();
        }
        return;
      }

      if (playingRef.current && engine) {
        startTimeRef.current = engine.time - cyclePositionRef.current;
        lastElapsedRef.current = cyclePositionRef.current;
        startLoop();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [bpmRef, clearPulseState, playingRef, startLoop, stopLoop]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey)
        return;
      // The tempo field is a text input: leave its keystrokes alone.
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      if (event.code === "Space") {
        event.preventDefault();
        void togglePlay();
      } else if (key === "m") {
        event.preventDefault();
        toggleMute();
      } else if (key === "r") {
        event.preventDefault();
        reset();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [reset, toggleMute, togglePlay]);

  useEffect(
    () => () => {
      stopLoop();
      clearPulseState();
      engineRef.current?.dispose();
    },
    [clearPulseState, stopLoop],
  );

  return {
    activeCounts,
    rhythms,
    bpm,
    bpmInput,
    isPlaying,
    isMuted,
    progress,
    turns,
    activePulses,
    togglePlay,
    reset,
    toggleMute,
    toggleRhythm,
    changeBpm,
    editBpmInput: setBpmInput,
    commitBpm,
  };
}
