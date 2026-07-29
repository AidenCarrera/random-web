import { useReducer } from "react";

import { HISTORY_LIMIT } from "../constants";
import {
  createEmptyGrid,
  floodFill,
  gridsEqual,
  paintCell,
  paintLine,
} from "../lib/pixel-grid";
import type { PixelGrid } from "../types";

type PixelGridState = {
  grid: PixelGrid;
  history: PixelGrid[];
  historyIndex: number;
  size: number;
};

export type PixelGridAction =
  | { type: "paint"; color: string; index: number }
  | { type: "paintLine"; color: string; from: number; to: number }
  | { type: "fill"; color: string; index: number }
  | { type: "commitStroke" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "clear" }
  | { type: "resize"; size: number };

const createInitialState = (size: number): PixelGridState => {
  const grid = createEmptyGrid(size);
  return { grid, history: [grid], historyIndex: 0, size };
};

/** Pushes a snapshot onto the undo stack, dropping any redone future first. */
const commit = (state: PixelGridState, grid: PixelGrid): PixelGridState => {
  const history = state.history.slice(0, state.historyIndex + 1);
  history.push(grid);
  if (history.length > HISTORY_LIMIT) {
    history.shift();
  }

  return { ...state, grid, history, historyIndex: history.length - 1 };
};

const jumpTo = (
  state: PixelGridState,
  historyIndex: number,
): PixelGridState => ({
  ...state,
  grid: state.history[historyIndex],
  historyIndex,
});

function reducer(
  state: PixelGridState,
  action: PixelGridAction,
): PixelGridState {
  switch (action.type) {
    case "paint": {
      const grid = paintCell(state.grid, action.index, action.color);
      return grid ? { ...state, grid } : state;
    }
    case "paintLine": {
      const grid = paintLine(
        state.grid,
        state.size,
        action.from,
        action.to,
        action.color,
      );
      return grid ? { ...state, grid } : state;
    }
    case "fill": {
      const grid = floodFill(
        state.grid,
        state.size,
        action.index,
        action.color,
      );
      return grid ? commit(state, grid) : state;
    }
    // Strokes paint straight onto the live grid; only the finished stroke is
    // recorded, so an undo steps back a whole drag rather than a single cell.
    case "commitStroke":
      return gridsEqual(state.grid, state.history[state.historyIndex])
        ? state
        : commit(state, state.grid);
    case "undo":
      return state.historyIndex > 0
        ? jumpTo(state, state.historyIndex - 1)
        : state;
    case "redo":
      return state.historyIndex < state.history.length - 1
        ? jumpTo(state, state.historyIndex + 1)
        : state;
    case "clear":
      return commit(state, createEmptyGrid(state.size));
    // Resizing starts over: old snapshots no longer match the new cell count.
    case "resize":
      return state.size === action.size
        ? state
        : createInitialState(action.size);
  }
}

export function usePixelGrid(initialSize: number) {
  const [{ grid, history, historyIndex, size }, dispatch] = useReducer(
    reducer,
    initialSize,
    createInitialState,
  );

  return {
    canRedo: historyIndex < history.length - 1,
    canUndo: historyIndex > 0,
    dispatch,
    grid,
    size,
  };
}
