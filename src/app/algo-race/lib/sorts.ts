import type { SortRunner } from "../types";

// Sort implementations. Optional `record` parameter captures state without overhead during unrecorded timing passes.
export const bubbleSort: SortRunner = (input, record) => {
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

export const selectionSort: SortRunner = (input, record) => {
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

export const insertionSort: SortRunner = (input, record) => {
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

export const quickSort: SortRunner = (input, record) => {
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

export const mergeSort: SortRunner = (input, record) => {
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

export const heapSort: SortRunner = (input, record) => {
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
