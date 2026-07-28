"use client";

import { useAlgoRace } from "../hooks/use-algo-race";
import { ALGORITHMS } from "../lib/algorithms";
import { RaceHeader } from "./race-header";
import { RaceResults } from "./race-results";
import { SortVisualizer } from "./sort-visualizer";

export function AlgoRace() {
  const {
    arraySize,
    changeArraySize,
    isPaused,
    isPreparing,
    isRunning,
    prepareProgress,
    raceComplete,
    raceStats,
    registerCanvas,
    reset,
    getRank,
    toggleRace,
  } = useAlgoRace();

  return (
    <div className="mx-auto flex h-full max-w-360 flex-col gap-3 md:gap-4">
      <RaceHeader
        arraySize={arraySize}
        isPaused={isPaused}
        isPreparing={isPreparing}
        isRunning={isRunning}
        prepareProgress={prepareProgress}
        onSizeChange={changeArraySize}
        onToggle={toggleRace}
        onReset={reset}
      />

      <div className="grid flex-1 min-h-0 grid-cols-2 items-center gap-1.5 md:grid-cols-2 md:gap-3 xl:grid-cols-3">
        {ALGORITHMS.map((algorithm) => (
          <SortVisualizer
            key={algorithm.name}
            name={algorithm.name}
            onCanvas={registerCanvas}
            rank={getRank(algorithm.name)}
            complexity={algorithm.complexity}
            isRaceComplete={raceComplete}
          />
        ))}
      </div>

      {raceComplete && <RaceResults arraySize={arraySize} stats={raceStats} />}
    </div>
  );
}
