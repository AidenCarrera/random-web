"use client";

import { useState } from "react";

import { usePolyrhythmTransport } from "../hooks/use-polyrhythm-transport";
import type { ViewMode } from "../types";
import { AmbientBackdrop } from "./ambient-backdrop";
import { RhythmPanel } from "./rhythm-panel";
import { ShortcutHints } from "./shortcut-hints";
import { TempoPanel } from "./tempo-panel";
import { TransportHeader } from "./transport-header";
import { ViewModePanel } from "./view-mode-panel";
import { VisualizerStage } from "./visualizer-stage";

export function PolyrhythmVisualizer() {
  const [mode, setMode] = useState<ViewMode>("circle");
  const transport = usePolyrhythmTransport();

  return (
    <div className="min-h-screen overflow-hidden bg-[#0d0c12] font-sans text-[#faf9f6]">
      <AmbientBackdrop />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <TransportHeader
          isPlaying={transport.isPlaying}
          isMuted={transport.isMuted}
          onTogglePlay={transport.togglePlay}
          onReset={transport.reset}
          onToggleMute={transport.toggleMute}
        />

        <section className="grid flex-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-5">
            <TempoPanel
              bpm={transport.bpm}
              bpmInput={transport.bpmInput}
              onBpmInputChange={transport.editBpmInput}
              onBpmInputCommit={transport.commitBpm}
              onBpmChange={transport.changeBpm}
            />
            <RhythmPanel
              activeCounts={transport.activeCounts}
              onToggleRhythm={transport.toggleRhythm}
            />
            <ViewModePanel mode={mode} onModeChange={setMode} />
            <ShortcutHints />
          </aside>

          <VisualizerStage
            mode={mode}
            bpm={transport.bpm}
            rhythms={transport.rhythms}
            progress={transport.progress}
            turns={transport.turns}
            activePulses={transport.activePulses}
          />
        </section>
      </main>
    </div>
  );
}
