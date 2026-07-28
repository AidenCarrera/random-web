"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Play, Pause, RotateCcw, Trophy } from "lucide-react";

import {
  BATCH_SAMPLES,
  BATCH_TARGET_MS,
  DEFAULT_SIZE,
  MAX_BATCH_ITERATIONS,
  MAX_FRAME_CELLS,
  MAX_FRAMES,
  MEASURE_BUDGET_MS,
  MIN_BATCH_SAMPLES,
  MIN_PLAYBACK_MS,
  RACE_DURATION_MS,
  SIZE_OPTIONS,
  TARGET_FRAME_MS,
  VALUE_MAX,
  VALUE_MIN,
  WARMUP_BUDGET_MS,
  WARMUP_RUNS,
} from "./config";

type SortName =
  | "Bubble Sort"
  | "Selection Sort"
  | "Insertion Sort"
  | "Quick Sort"
  | "Merge Sort"
  | "Heap Sort";

// Recorder receives live array reference to eliminate allocation overhead during counting passes.
type StepRecorder = (values: readonly number[]) => void;
type SortRunner = (input: number[], record?: StepRecorder) => number[];

type RaceStat = {
  name: SortName;
  executionMs: number;
  playbackMs: number;
};

/** Sampled snapshots packed contiguously into a single typed array. */
type FrameStrip = { cells: Uint8Array; count: number; size: number };

const generateRandomData = (size: number) =>
  Array.from(
    { length: size },
    () => Math.floor(Math.random() * (VALUE_MAX - VALUE_MIN + 1)) + VALUE_MIN,
  );

// Sort implementations. Optional `record` parameter captures state without overhead during unrecorded timing passes.
const bubbleSort: SortRunner = (input, record) => {
  const a = [...input];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        record?.(a);
      }
    }
  }
  return a;
};

const selectionSort: SortRunner = (input, record) => {
  const a = [...input];
  for (let i = 0; i < a.length; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[min]) {
        min = j;
      }
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      record?.(a);
    }
  }
  return a;
};

const insertionSort: SortRunner = (input, record) => {
  const a = [...input];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j = j - 1;
      record?.(a);
    }
    a[j + 1] = key;
    record?.(a);
  }
  return a;
};

const quickSort: SortRunner = (input, record) => {
  const a = [...input];

  const partition = (low: number, high: number) => {
    const pivot = a[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (a[j] < pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        record?.(a);
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    record?.(a);
    return i + 1;
  };

  const sort = (low: number, high: number) => {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    }
  };

  sort(0, a.length - 1);
  return a;
};

const mergeSort: SortRunner = (input, record) => {
  const a = [...input];

  const merge = (left: number, mid: number, right: number) => {
    const n1 = mid - left + 1;
    const n2 = right - mid;
    const leftChunk = new Array(n1);
    const rightChunk = new Array(n2);

    for (let i = 0; i < n1; i++) leftChunk[i] = a[left + i];
    for (let j = 0; j < n2; j++) rightChunk[j] = a[mid + 1 + j];

    let i = 0;
    let j = 0;
    let k = left;

    while (i < n1 && j < n2) {
      if (leftChunk[i] <= rightChunk[j]) {
        a[k] = leftChunk[i];
        i++;
      } else {
        a[k] = rightChunk[j];
        j++;
      }
      k++;
      record?.(a);
    }

    while (i < n1) {
      a[k] = leftChunk[i];
      i++;
      k++;
      record?.(a);
    }

    while (j < n2) {
      a[k] = rightChunk[j];
      j++;
      k++;
      record?.(a);
    }
  };

  const sort = (left: number, right: number) => {
    if (left >= right) return;
    const mid = left + Math.floor((right - left) / 2);
    sort(left, mid);
    sort(mid + 1, right);
    merge(left, mid, right);
  };

  sort(0, a.length - 1);
  return a;
};

const heapSort: SortRunner = (input, record) => {
  const a = [...input];
  const n = a.length;

  const heapify = (heapSize: number, rootIndex: number) => {
    let largest = rootIndex;
    const left = 2 * rootIndex + 1;
    const right = 2 * rootIndex + 2;

    if (left < heapSize && a[left] > a[largest]) largest = left;
    if (right < heapSize && a[right] > a[largest]) largest = right;

    if (largest !== rootIndex) {
      [a[rootIndex], a[largest]] = [a[largest], a[rootIndex]];
      record?.(a);
      heapify(heapSize, largest);
    }
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    record?.(a);
    heapify(i, 0);
  }

  return a;
};

const ALGORITHMS: {
  name: SortName;
  run: SortRunner;
  color: string;
  complexity: string;
}[] = [
  {
    name: "Bubble Sort",
    run: bubbleSort,
    color: "#3b82f6",
    complexity: "O(n^2)",
  },
  {
    name: "Selection Sort",
    run: selectionSort,
    color: "#10b981",
    complexity: "O(n^2)",
  },
  {
    name: "Insertion Sort",
    run: insertionSort,
    color: "#f43f5e",
    complexity: "O(n^2)",
  },
  {
    name: "Quick Sort",
    run: quickSort,
    color: "#8b5cf6",
    complexity: "O(n log n)",
  },
  {
    name: "Merge Sort",
    run: mergeSort,
    color: "#06b6d4",
    complexity: "O(n log n)",
  },
  {
    name: "Heap Sort",
    run: heapSort,
    color: "#f59e0b",
    complexity: "O(n log n)",
  },
];

const SORT_NAMES = ALGORITHMS.map((algorithm) => algorithm.name);
const COLORS = Object.fromEntries(
  ALGORITHMS.map((algorithm) => [algorithm.name, algorithm.color]),
) as Record<SortName, string>;

// Prevents JIT dead-code elimination during timing benchmarks.
let timingSink = 0;

const runBatch = (run: SortRunner, data: number[], iterations: number) => {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) timingSink += run(data)[0];
  return performance.now() - start;
};

const calibrateBatch = (run: SortRunner, data: number[]) => {
  let iterations = 1;
  for (;;) {
    const elapsed = runBatch(run, data, iterations);
    if (elapsed >= BATCH_TARGET_MS || iterations >= MAX_BATCH_ITERATIONS) {
      return iterations;
    }
    // Exponential fallback ensures batch growth when initial time measures as zero.
    const growth = elapsed > 0 ? (BATCH_TARGET_MS / elapsed) * 1.2 : 8;
    iterations = Math.min(
      MAX_BATCH_ITERATIONS,
      Math.ceil(iterations * Math.max(2, growth)),
    );
  }
};

const measureExecutionMs = (run: SortRunner, data: number[]) => {
  const measureStart = performance.now();

  for (let i = 0; i < WARMUP_RUNS; i++) {
    timingSink += run(data)[0];
    if (performance.now() - measureStart >= WARMUP_BUDGET_MS) break;
  }

  const iterations = calibrateBatch(run, data);

  let fastest = Number.POSITIVE_INFINITY;
  for (let sample = 0; sample < BATCH_SAMPLES; sample++) {
    fastest = Math.min(fastest, runBatch(run, data, iterations) / iterations);
    if (
      sample + 1 >= MIN_BATCH_SAMPLES &&
      performance.now() - measureStart >= MEASURE_BUDGET_MS
    ) {
      break;
    }
  }

  // The only read of timingSink: keeps the timed calls observable to the
  // optimizer, and stops the accumulator drifting. Do not remove.
  if (!Number.isFinite(timingSink)) timingSink = 0;

  // Prevents zero return values when clock resolution cannot capture batch time.
  return Math.max(fastest, Number.EPSILON);
};

const frameBudgetFor = (playbackMs: number, size: number) =>
  Math.max(
    2,
    Math.min(
      MAX_FRAMES,
      Math.ceil(playbackMs / TARGET_FRAME_MS),
      Math.floor(MAX_FRAME_CELLS / size),
    ),
  );

/**
 * Samples sort snapshots using a two-pass stride algorithm to pre-allocate
 * buffer memory and prevent heap exhaustion.
 */
const captureFrames = (
  run: SortRunner,
  data: number[],
  budget: number,
): FrameStrip => {
  const size = data.length;

  let mutations = 0;
  run(data, () => {
    mutations++;
  });

  const stride = Math.max(1, Math.ceil(mutations / budget));
  const capacity = Math.min(budget, Math.ceil(mutations / stride)) + 2;
  const cells = new Uint8Array(capacity * size);

  let count = 0;
  const push = (values: readonly number[]) => {
    cells.set(values as number[], count * size);
    count++;
  };

  push(data);
  let step = 0;
  const sorted = run(data, (values) => {
    if (step % stride === 0 && count < capacity - 1) push(values);
    step++;
  });
  push(sorted);

  return { cells, count, size };
};

const frameAt = (strip: FrameStrip, index: number) =>
  strip.cells.subarray(index * strip.size, (index + 1) * strip.size);

const formatDuration = (ms: number) => {
  if (ms >= 1) return `${ms.toFixed(2)}ms`;
  const us = ms * 1000;
  if (us >= 1) return `${us.toFixed(2)}µs`;
  return `${(us * 1000).toFixed(0)}ns`;
};

const buildRecord = <T,>(make: (name: SortName) => T) => {
  const record = {} as Record<SortName, T>;
  for (const name of SORT_NAMES) record[name] = make(name);
  return record;
};

const nextFrame = () =>
  new Promise((r) => requestAnimationFrame(() => r(null)));

/**
 * Renders array bars to canvas. When element count exceeds horizontal pixels,
 * aggregates peak values per pixel column.
 */
const drawBars = (
  canvas: HTMLCanvasElement,
  values: ArrayLike<number>,
  color: string,
) => {
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;

  const n = values.length;
  const slot = width / n;

  if (slot >= 3) {
    const gap = Math.max(1, Math.round(dpr));
    const barWidth = Math.max(1, Math.round(slot) - gap);
    for (let i = 0; i < n; i++) {
      const barHeight = (values[i] / VALUE_MAX) * height;
      ctx.fillRect(
        Math.round(i * slot),
        height - barHeight,
        barWidth,
        barHeight,
      );
    }
  } else {
    for (let x = 0; x < width; x++) {
      const from = Math.floor((x * n) / width);
      const to = Math.max(from + 1, Math.floor(((x + 1) * n) / width));
      let peak = 0;
      for (let i = from; i < to && i < n; i++) {
        if (values[i] > peak) peak = values[i];
      }
      const barHeight = (peak / VALUE_MAX) * height;
      ctx.fillRect(x, height - barHeight, 1, barHeight);
    }
  }

  ctx.globalAlpha = 1;
};

export default function AlgoRacePage() {
  const [arraySize, setArraySize] = useState(DEFAULT_SIZE);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [prepared, setPrepared] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [winners, setWinners] = useState<SortName[]>([]);
  const [raceStats, setRaceStats] = useState<RaceStat[]>([]);
  const [seedVersion, setSeedVersion] = useState(0);

  const baseDataRef = useRef<number[]>([]);
  const framesRef = useRef<Record<SortName, FrameStrip | null>>(
    buildRecord(() => null),
  );
  const executionRef = useRef<Record<SortName, number>>(buildRecord(() => 0));
  const playbackRef = useRef<Record<SortName, number>>(buildRecord(() => 0));
  const playbackOrderRef = useRef<SortName[]>([...SORT_NAMES]);

  const canvasesRef = useRef<Record<SortName, HTMLCanvasElement | null>>(
    buildRecord(() => null),
  );
  const lastFrameRef = useRef<Record<SortName, ArrayLike<number>>>(
    buildRecord(() => [] as ArrayLike<number>),
  );

  const pausedRef = useRef(false);
  const raceIdRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const pausedAtRef = useRef(0);
  const finishedSortsRef = useRef(new Set<SortName>());
  const hasSeededInitialDataRef = useRef(false);

  const registerCanvas = useCallback(
    (name: SortName, canvas: HTMLCanvasElement | null) => {
      canvasesRef.current[name] = canvas;
    },
    [],
  );

  const paint = useCallback((name: SortName, values: ArrayLike<number>) => {
    lastFrameRef.current[name] = values;
    const canvas = canvasesRef.current[name];
    if (canvas) drawBars(canvas, values, COLORS[name]);
  }, []);

  const repaintAll = useCallback(() => {
    for (const name of SORT_NAMES) paint(name, lastFrameRef.current[name]);
  }, [paint]);

  const seedArrays = useCallback((size: number) => {
    baseDataRef.current = generateRandomData(size);
    framesRef.current = buildRecord(() => null);
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

  useEffect(() => {
    window.addEventListener("resize", repaintAll);
    return () => window.removeEventListener("resize", repaintAll);
  }, [repaintAll]);

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
      setWinners([]);
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
    setWinners([...finishedSorts]);
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
    setWinners([]);
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

  const getRank = (name: SortName) => {
    const idx = winners.indexOf(name);
    return idx === -1 ? null : idx + 1;
  };

  const orderedStats = [...raceStats].sort(
    (a, b) => a.executionMs - b.executionMs,
  );
  const averageTime =
    orderedStats.reduce((sum, entry) => sum + entry.executionMs, 0) /
    (orderedStats.length || 1);
  const winnerTime = orderedStats[0]?.executionMs ?? 0;
  const slowestTime = orderedStats.at(-1)?.executionMs ?? 0;
  const spread = slowestTime - winnerTime;
  const raceComplete = orderedStats.length === SORT_NAMES.length;

  // Redraws canvases to fit updated dimensions after results panel opens.
  useEffect(() => {
    const handle = requestAnimationFrame(repaintAll);
    return () => cancelAnimationFrame(handle);
  }, [raceComplete, repaintAll]);

  return (
    <main className="min-h-screen bg-[#f0f2f5] px-2 py-2 text-[#333] sm:px-3 sm:py-3 md:h-screen md:overflow-hidden md:px-8 xl:px-16">
      <div className="mx-auto flex h-full max-w-360 flex-col gap-3 md:gap-4">
        <header className="flex flex-col gap-2 border-b-2 border-slate-300 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
              ALGO RACE
            </h1>
            <p className="text-[11px] text-slate-500 sm:text-xs">
              Measured execution time • replayed to scale over{" "}
              {(RACE_DURATION_MS / 1000).toFixed(0)}s • N=
              {arraySize.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400">SIZE</span>
              {SIZE_OPTIONS.map((option) => (
                <button
                  key={option.size}
                  onClick={() => changeArraySize(option.size)}
                  disabled={isRunning}
                  title={`${option.size.toLocaleString()} items`}
                  className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                    arraySize === option.size
                      ? "bg-slate-800 text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  } disabled:opacity-50`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              onClick={toggleRace}
              disabled={isPreparing}
              className="flex min-w-24 items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-700 disabled:opacity-60"
            >
              {isPreparing ? (
                prepared < SORT_NAMES.length ? (
                  `TIMING ${prepared}/${SORT_NAMES.length}`
                ) : (
                  `FRAMES ${prepared - SORT_NAMES.length}/${SORT_NAMES.length}`
                )
              ) : isRunning && !isPaused ? (
                <>
                  <Pause className="h-3.5 w-3.5" /> PAUSE
                </>
              ) : isRunning && isPaused ? (
                <>
                  <Play className="h-3.5 w-3.5" /> RESUME
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" /> START
                </>
              )}
            </button>
            <button
              onClick={() => reset()}
              className="flex items-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" /> RESET
            </button>
          </div>
        </header>

        <div className="grid flex-1 min-h-0 grid-cols-2 items-center gap-1.5 md:grid-cols-2 md:gap-3 xl:grid-cols-3">
          {ALGORITHMS.map((algorithm) => (
            <SortVisualizer
              key={algorithm.name}
              name={algorithm.name}
              onCanvas={registerCanvas}
              rank={getRank(algorithm.name)}
              complexity={algorithm.complexity}
              isRaceComplete={raceComplete}
            />
          ))}
        </div>

        {raceComplete && (
          <section className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg md:p-3">
            <div className="grid gap-2 md:grid-cols-[minmax(15rem,0.85fr)_1fr] md:items-stretch">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  Post-Race Results
                </div>
                <div className="text-sm font-black text-slate-800 md:text-base">
                  {orderedStats[0]?.name} wins
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Avg {formatDuration(averageTime)} &bull; Spread{" "}
                  {formatDuration(spread)} &bull; Best{" "}
                  {formatDuration(winnerTime / arraySize)}/item
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
                {orderedStats.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-black text-white">
                        {index + 1}
                      </span>
                      <div className="min-w-0 text-right">
                        <div className="truncate text-[11px] font-bold text-slate-700">
                          {entry.name.replace(" Sort", "")}
                        </div>
                        <div className="text-xs font-black text-slate-900">
                          {formatDuration(entry.executionMs)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {(entry.playbackMs / 1000).toFixed(1)}s on screen
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const SortVisualizer = memo(function SortVisualizer({
  name,
  onCanvas,
  rank,
  complexity,
  isRaceComplete,
}: {
  name: SortName;
  onCanvas: (name: SortName, canvas: HTMLCanvasElement | null) => void;
  rank: number | null;
  complexity: string;
  isRaceComplete: boolean;
}) {
  // Stable ref callback prevents canvas re-mounting when rank badge renders.
  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement | null) => onCanvas(name, canvas),
    [onCanvas, name],
  );

  return (
    <div
      className={`relative mx-auto flex aspect-square w-full min-w-0 max-w-none flex-col rounded-xl border border-slate-100 bg-white p-2.5 shadow-lg md:p-3 ${
        isRaceComplete
          ? "md:max-w-[calc((100vh-238px)/3)] xl:max-w-[calc((100vh-218px)/2)]"
          : "md:max-w-[calc((100vh-138px)/3)] xl:max-w-[calc((100vh-128px)/2)]"
      }`}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[11px] font-bold leading-tight text-slate-800 sm:text-sm md:text-base">
            {name}
          </h2>
          <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-300 sm:text-[9px]">
            {complexity}
          </div>
        </div>
        {rank && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-black text-black shadow-md animate-in zoom-in">
            #{rank}
          </div>
        )}
      </div>

      <div className="relative min-h-0 flex-1 border-b border-l border-slate-200 p-0.5">
        <canvas
          ref={canvasRef}
          aria-label={`${name} visualization`}
          className="block h-full w-full"
        />
      </div>
    </div>
  );
});
