import {
  CircleDot,
  Orbit,
  Rows3,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { ViewMode } from "./types";

export const VIEW_MODES: {
  value: ViewMode;
  label: string;
  Icon: LucideIcon;
}[] = [
  { value: "circle", label: "Circle", Icon: CircleDot },
  { value: "timeline", label: "Timeline", Icon: Rows3 },
  { value: "bloom", label: "Bloom", Icon: Sparkles },
  { value: "orbit3d", label: "3D", Icon: Orbit },
];

export const DEFAULT_RHYTHMS = [3, 4];

/** Beats spanned by one full cycle, so 4 makes a cycle one bar long. */
export const CYCLE_BEATS = 4;

export const BPM_MIN = 40;
export const BPM_MAX = 220;
export const DEFAULT_BPM = 90;

export const MASTER_GAIN = 0.34;

export const TAU = Math.PI * 2;
