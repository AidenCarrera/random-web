export type ViewMode = "circle" | "timeline" | "bloom" | "orbit3d";

/** Identifies one pulse as `${rhythm count}-${pulse index}`. */
export type PulseKey = `${number}-${number}`;

export type Rhythm = {
  count: number;
  color: string;
  glow: string;
  tone: string;
};

export type VisualizerProps = {
  rhythms: Rhythm[];
  progress: number;
  /** Cycles completed since the last reset, fractional and never wrapping. */
  turns: number;
  activePulses: Set<PulseKey>;
};
