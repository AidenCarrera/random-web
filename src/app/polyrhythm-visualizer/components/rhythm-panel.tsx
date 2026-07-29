"use client";

import { memo, type CSSProperties } from "react";
import { Clock3 } from "lucide-react";

import { RHYTHMS } from "../rhythms";
import styles from "../styles.module.css";
import { Panel } from "./panel";

export const RhythmPanel = memo(function RhythmPanel({
  activeCounts,
  onToggleRhythm,
}: {
  activeCounts: number[];
  onToggleRhythm: (count: number) => void;
}) {
  return (
    <Panel title="Rhythms" icon={<Clock3 />}>
      <div className="grid grid-cols-3 gap-2">
        {RHYTHMS.map((rhythm) => {
          const selected = activeCounts.includes(rhythm.count);
          return (
            <button
              key={rhythm.count}
              onClick={() => onToggleRhythm(rhythm.count)}
              className={`${styles.pad} ${selected ? styles.padActive : ""} h-12 text-base font-black tabular-nums`}
              style={{ "--pad-color": rhythm.color } as CSSProperties}
              title={`${rhythm.count} pulses per cycle`}
              aria-pressed={selected}
            >
              {rhythm.count}
            </button>
          );
        })}
      </div>
    </Panel>
  );
});
