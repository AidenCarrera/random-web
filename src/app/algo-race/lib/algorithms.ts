import type { Algorithm, SortName } from "../types";
import {
  bubbleSort,
  heapSort,
  insertionSort,
  mergeSort,
  quickSort,
  selectionSort,
} from "./sorts";

export const ALGORITHMS: Algorithm[] = [
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

export const SORT_NAMES = ALGORITHMS.map((algorithm) => algorithm.name);

export const COLORS = Object.fromEntries(
  ALGORITHMS.map((algorithm) => [algorithm.name, algorithm.color]),
) as Record<SortName, string>;

/** Builds a lookup pre-populated with an entry for every racing algorithm. */
export const createSortRecord = <T>(make: (name: SortName) => T) => {
  const record = {} as Record<SortName, T>;
  for (const name of SORT_NAMES) record[name] = make(name);
  return record;
};
