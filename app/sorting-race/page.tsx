"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

// Algorithms
const bubbleSort = async (
  arr: number[],
  update: (arr: number[]) => void,
  checkStop: () => boolean,
  checkPause: () => Promise<void>,
  delay: number
) => {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (checkStop()) return;
      await checkPause();
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        update([...a]);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  return a;
};

const selectionSort = async (
  arr: number[],
  update: (arr: number[]) => void,
  checkStop: () => boolean,
  checkPause: () => Promise<void>,
  delay: number
) => {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      if (checkStop()) return;
      await checkPause();
      if (a[j] < a[min]) {
        min = j;
      }
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      update([...a]);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return a;
};

const insertionSort = async (
  arr: number[],
  update: (arr: number[]) => void,
  checkStop: () => boolean,
  checkPause: () => Promise<void>,
  delay: number
) => {
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      if (checkStop()) return;
      await checkPause();
      a[j + 1] = a[j];
      j = j - 1;
      update([...a]); // Visualization update
      await new Promise((r) => setTimeout(r, delay));
    }
    a[j + 1] = key;
    update([...a]);
  }
  return a;
};

const quickSort = async (
  arr: number[],
  update: (arr: number[]) => void,
  checkStop: () => boolean,
  checkPause: () => Promise<void>,
  delay: number
) => {
  const a = [...arr];

  const partition = async (low: number, high: number) => {
    if (checkStop()) return -1;
    await checkPause();
    const pivot = a[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (checkStop()) return -1;
      await checkPause();
      if (a[j] < pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        update([...a]);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    update([...a]);
    await new Promise((r) => setTimeout(r, delay));
    return i + 1;
  };

  const sort = async (low: number, high: number) => {
    if (checkStop()) return;
    await checkPause();
    if (low < high) {
      const pi = await partition(low, high);
      if (pi === -1) return; // Stopped
      await sort(low, pi - 1);
      await sort(pi + 1, high);
    }
  };

  await sort(0, a.length - 1);
  return a;
};

const mergeSort = async (
  arr: number[],
  update: (arr: number[]) => void,
  checkStop: () => boolean,
  checkPause: () => Promise<void>,
  delay: number
) => {
  const a = [...arr];

  // In-place merge sort is complex, assume auxiliary arrays but update main
  const merge = async (left: number, mid: number, right: number) => {
    if (checkStop()) return;
    await checkPause();
    const n1 = mid - left + 1;
    const n2 = right - mid;
    const L = new Array(n1);
    const R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = a[left + i];
    for (let j = 0; j < n2; j++) R[j] = a[mid + 1 + j];

    let i = 0,
      j = 0,
      k = left;

    while (i < n1 && j < n2) {
      if (checkStop()) return;
      await checkPause();
      if (L[i] <= R[j]) {
        a[k] = L[i];
        i++;
      } else {
        a[k] = R[j];
        j++;
      }
      k++;
      update([...a]);
      await new Promise((r) => setTimeout(r, delay));
    }

    while (i < n1) {
      if (checkStop()) return;
      await checkPause();
      a[k] = L[i];
      i++;
      k++;
      update([...a]);
      await new Promise((r) => setTimeout(r, delay));
    }

    while (j < n2) {
      if (checkStop()) return;
      await checkPause();
      a[k] = R[j];
      j++;
      k++;
      update([...a]);
      await new Promise((r) => setTimeout(r, delay));
    }
  };

  const sort = async (l: number, r: number) => {
    if (checkStop()) return;
    await checkPause();
    if (l >= r) return;
    const m = l + Math.floor((r - l) / 2);
    await sort(l, m);
    await sort(m + 1, r);
    await merge(l, m, r);
  };

  await sort(0, a.length - 1);
  return a;
};

const heapSort = async (
  arr: number[],
  update: (arr: number[]) => void,
  checkStop: () => boolean,
  checkPause: () => Promise<void>,
  delay: number
) => {
  const a = [...arr];
  const n = a.length;

  const heapify = async (n: number, i: number) => {
    if (checkStop()) return;
    await checkPause();
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    if (l < n && a[l] > a[largest]) largest = l;
    if (r < n && a[r] > a[largest]) largest = r;

    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      update([...a]);
      await new Promise((r) => setTimeout(r, delay));
      await heapify(n, largest);
    }
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    if (checkStop()) return;
    await checkPause();
    [a[0], a[i]] = [a[i], a[0]];
    update([...a]);
    await new Promise((r) => setTimeout(r, delay));
    await heapify(i, 0);
  }

  return a;
};

// Component
export default function SortingRace() {
  // Config
  const [arraySize, setArraySize] = useState(60);
  // Dynamic delay: Slower for small arrays to see details, fast for large arrays
  const delay = arraySize <= 20 ? 150 : arraySize > 60 ? 5 : 20;

  // States
  const [bubbleArr, setBubbleArr] = useState<number[]>([]);
  const [selectArr, setSelectArr] = useState<number[]>([]);
  const [insertArr, setInsertArr] = useState<number[]>([]);
  const [quickArr, setQuickArr] = useState<number[]>([]);
  const [mergeArr, setMergeArr] = useState<number[]>([]);
  const [heapArr, setHeapArr] = useState<number[]>([]);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [winners, setWinners] = useState<string[]>([]);
  const stopRef = useRef(false);
  const pausedRef = useRef(false);

  const generateRandomData = useCallback((size: number) => {
    return Array.from(
      { length: size },
      () => Math.floor(Math.random() * 100) + 5
    );
  }, []);

  const reset = useCallback(() => {
    stopRef.current = true;
    pausedRef.current = false;
    setIsRunning(false);
    setIsPaused(false);
    setWinners([]);
    // Async reset to clear loops
    setTimeout(() => {
      stopRef.current = false;
      const newArr = generateRandomData(arraySize);
      setBubbleArr([...newArr]);
      setSelectArr([...newArr]);
      setInsertArr([...newArr]);
      setQuickArr([...newArr]);
      setMergeArr([...newArr]);
      setHeapArr([...newArr]);
    }, 100);
  }, [arraySize, generateRandomData]);

  useEffect(() => {
    // Initial Load
    const timer = setTimeout(() => {
      const newArr = generateRandomData(60);
      setBubbleArr([...newArr]);
      setSelectArr([...newArr]);
      setInsertArr([...newArr]);
      setQuickArr([...newArr]);
      setMergeArr([...newArr]);
      setHeapArr([...newArr]);
    }, 0);
    return () => clearTimeout(timer);
  }, [generateRandomData]);

  // When size changes, we want to reset
  useEffect(() => {
    const t = setTimeout(() => reset(), 0);
    return () => clearTimeout(t);
  }, [reset]);

  const toggleRace = () => {
    if (isRunning) {
      // Toggle Pause
      pausedRef.current = !pausedRef.current;
      setIsPaused(pausedRef.current);
      return;
    }

    // Start
    setIsRunning(true);
    setIsPaused(false);
    setWinners([]);
    stopRef.current = false;
    pausedRef.current = false;

    const checkStop = () => stopRef.current;
    const checkPause = async () => {
      while (pausedRef.current) {
        if (stopRef.current) return;
        await new Promise((r) => setTimeout(r, 100));
      }
    };

    // Run all
    bubbleSort(bubbleArr, setBubbleArr, checkStop, checkPause, delay).then(
      () => {
        if (!stopRef.current) setWinners((prev) => [...prev, "Bubble Sort"]);
      }
    );
    selectionSort(selectArr, setSelectArr, checkStop, checkPause, delay).then(
      () => {
        if (!stopRef.current) setWinners((prev) => [...prev, "Selection Sort"]);
      }
    );
    insertionSort(insertArr, setInsertArr, checkStop, checkPause, delay).then(
      () => {
        if (!stopRef.current) setWinners((prev) => [...prev, "Insertion Sort"]);
      }
    );

    quickSort(quickArr, setQuickArr, checkStop, checkPause, delay).then(() => {
      if (!stopRef.current) setWinners((prev) => [...prev, "Quick Sort"]);
    });
    mergeSort(mergeArr, setMergeArr, checkStop, checkPause, delay).then(() => {
      if (!stopRef.current) setWinners((prev) => [...prev, "Merge Sort"]);
    });
    heapSort(heapArr, setHeapArr, checkStop, checkPause, delay).then(() => {
      if (!stopRef.current) setWinners((prev) => [...prev, "Heap Sort"]);
    });
  };

  const getRank = (name: string) => {
    const idx = winners.indexOf(name);
    if (idx === -1) return null;
    return idx + 1;
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#333] font-mono p-4 md:px-32 xl:px-48 py-8 flex flex-col">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center md:items-end border-b-2 border-slate-300 pb-4 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tight text-slate-800">
            ALGO_RACE
          </h1>
          <p className="text-slate-500">Visualizing Efficiency</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow-sm border border-slate-200">
            <span className="text-xs font-bold text-slate-400">SIZE:</span>
            {[10, 60, 120].map((size) => (
              <button
                key={size}
                onClick={() => setArraySize(size)}
                disabled={isRunning}
                className={`text-sm font-bold px-2 py-1 rounded ${
                  arraySize === size
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                } disabled:opacity-50`}
              >
                {size === 10 ? "S" : size === 60 ? "M" : "L"}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={toggleRace}
              className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white font-bold hover:bg-slate-700 disabled:opacity-50 transition-all shadow-lg min-w-[130px] justify-center"
            >
              {isRunning && !isPaused ? (
                <>
                  <Pause className="w-4 h-4" /> PAUSE
                </>
              ) : isRunning && isPaused ? (
                <>
                  <Play className="w-4 h-4" /> RESUME
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> START
                </>
              )}
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-6 py-2 bg-white border-2 border-slate-300 text-slate-800 font-bold hover:bg-slate-100 transition-all shadow-sm"
            >
              <RotateCcw className="w-4 h-4" /> RESET
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 flex-1">
        <SortVisualizer
          name="Bubble Sort"
          data={bubbleArr}
          rank={getRank("Bubble Sort")}
          color="bg-blue-500"
          complexity="O(n²)"
        />
        <SortVisualizer
          name="Selection Sort"
          data={selectArr}
          rank={getRank("Selection Sort")}
          color="bg-emerald-500"
          complexity="O(n²)"
        />
        <SortVisualizer
          name="Insertion Sort"
          data={insertArr}
          rank={getRank("Insertion Sort")}
          color="bg-rose-500"
          complexity="O(n²)"
        />
        <SortVisualizer
          name="Quick Sort"
          data={quickArr}
          rank={getRank("Quick Sort")}
          color="bg-violet-500"
          complexity="O(n log n)"
        />
        <SortVisualizer
          name="Merge Sort"
          data={mergeArr}
          rank={getRank("Merge Sort")}
          color="bg-cyan-500"
          complexity="O(n log n)"
        />
        <SortVisualizer
          name="Heap Sort"
          data={heapArr}
          rank={getRank("Heap Sort")}
          color="bg-amber-500"
          complexity="O(n log n)"
        />
      </div>

      <div className="mt-8 text-xs text-center text-slate-400">
        N={arraySize} • Delay={delay}ms
      </div>
    </div>
  );
}

function SortVisualizer({
  name,
  data,
  rank,
  color,
  complexity,
}: {
  name: string;
  data: number[];
  rank: number | null;
  color: string;
  complexity: string;
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-xl flex flex-col aspect-square w-full max-w-160 mx-auto relative border border-slate-100">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">{name}</h2>
        {rank && (
          <div className="bg-yellow-400 text-black font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in text-xs">
            #{rank}
          </div>
        )}
      </div>

      <div className="flex-1 flex items-end gap-px w-full border-b border-l border-slate-200 p-1 relative">
        {data.map((val, i) => (
          <div
            key={i}
            style={{ height: `${val}%` }}
            className={`flex-1 rounded-t-[1px] transition-all duration-75 ${color} opacity-80 hover:opacity-100`}
          />
        ))}
      </div>

      {/* Complexity Tag */}
      <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-300 opacity-50 group-hover:opacity-100">
        {complexity}
      </div>
    </div>
  );
}
