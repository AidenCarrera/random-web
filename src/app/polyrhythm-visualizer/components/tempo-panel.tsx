"use client";

import { memo, type CSSProperties } from "react";
import { Gauge } from "lucide-react";

import { BPM_MAX, BPM_MIN } from "../constants";
import styles from "../styles.module.css";
import { cycleSeconds } from "../utils";
import { Panel } from "./panel";

export const TempoPanel = memo(function TempoPanel({
  bpm,
  bpmInput,
  onBpmInputChange,
  onBpmInputCommit,
  onBpmChange,
}: {
  bpm: number;
  bpmInput: string;
  onBpmInputChange: (value: string) => void;
  onBpmInputCommit: () => void;
  onBpmChange: (bpm: number) => void;
}) {
  const fill = ((bpm - BPM_MIN) / (BPM_MAX - BPM_MIN)) * 100;

  return (
    <Panel
      title="Tempo"
      icon={<Gauge />}
      aside={
        <span className="font-mono text-[11px] tabular-nums text-[#d8cabc]/60">
          {cycleSeconds(bpm).toFixed(2)}s / cycle
        </span>
      }
    >
      <div className="flex items-baseline gap-2">
        <input
          value={bpmInput}
          onChange={(event) => onBpmInputChange(event.target.value)}
          onBlur={onBpmInputCommit}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            onBpmInputCommit();
            event.currentTarget.blur();
          }}
          className="w-[3.4ch] border-b-2 border-transparent bg-transparent text-4xl font-black leading-none tabular-nums text-[#faf9f6] outline-none transition-colors focus:border-[#55c991]"
          inputMode="numeric"
          aria-label="BPM value"
        />
        <span className="text-[11px] font-black uppercase tracking-[0.24em] text-[#d8cabc]/70">
          bpm
        </span>
      </div>
      <input
        type="range"
        min={BPM_MIN}
        max={BPM_MAX}
        value={bpm}
        onChange={(event) => onBpmChange(Number(event.target.value))}
        className={`${styles.slider} mt-4 w-full`}
        style={{ "--fill": `${fill}%` } as CSSProperties}
        aria-label="BPM"
      />
      <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums text-[#faf9f6]/35">
        <span>{BPM_MIN}</span>
        <span>{BPM_MAX}</span>
      </div>
    </Panel>
  );
});
