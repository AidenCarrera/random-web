import { CATEGORY_KEYS } from "../data/emojis";
import type { Category } from "../types";

export const getHeaderName = (selected: Category[]) => {
  if (selected.length === CATEGORY_KEYS.length) return "RAINBOW STORM";
  if (selected.length === 1) return selected[0];
  if (selected.length === 2) return selected.join(" & ");
  return "a custom mix";
};
