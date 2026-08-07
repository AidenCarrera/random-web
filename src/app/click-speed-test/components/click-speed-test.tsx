"use client";

import { MousePointer2 } from "lucide-react";

import { useClickSpeedTest } from "../hooks/use-click-speed-test";
import { ClickArena } from "./click-arena";
import { DurationPicker } from "./duration-picker";
import { MilestonesPanel } from "./milestones-panel";
import { Scoreboard } from "./scoreboard";
import { SessionHistory } from "./session-history";

export function ClickSpeedTest() {
  const test = useClickSpeedTest();

  return (
    <main className="flex min-h-screen flex-col gap-6 bg-[#0f172a] p-4 font-sans text-slate-200 md:gap-8 md:p-8">
      <header className="flex shrink-0 items-center justify-center border-b border-slate-800 pb-4">
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-100 md:text-3xl">
          <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600">
            <MousePointer2 className="size-6" />
          </span>
          Click Speed Test
        </h1>
      </header>

      {/* Columns share the outer grid's rows so the panels line up across them. */}
      <div className="grid flex-1 grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
        <aside className="order-2 flex flex-col gap-6 lg:order-1 lg:col-span-3 lg:row-span-2 lg:grid lg:grid-rows-subgrid">
          <DurationPicker
            duration={test.duration}
            disabled={test.isActive}
            onChange={test.changeDuration}
          />
          <MilestonesPanel
            duration={test.duration}
            bestClicks={test.bestClicks}
          />
        </aside>

        <section className="order-1 flex min-w-0 flex-col gap-6 lg:order-2 lg:col-span-6 lg:row-span-2 lg:grid lg:grid-rows-subgrid">
          <Scoreboard
            liveCps={test.liveCps}
            timeLeft={test.timeLeft}
            isActive={test.isActive}
            record={test.record}
            duration={test.duration}
          />
          <ClickArena
            clicks={test.clicks}
            duration={test.duration}
            isActive={test.isActive}
            canRestart={test.canRestart}
            readout={test.readout}
            onClick={test.registerClick}
            onReset={test.resetRun}
          />
        </section>

        <aside className="order-3 flex flex-col lg:col-span-3 lg:row-span-2">
          <SessionHistory history={test.history} />
        </aside>
      </div>
    </main>
  );
}
