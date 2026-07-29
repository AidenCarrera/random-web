"use client";

import { memo, type ReactNode } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

export const TransportHeader = memo(function TransportHeader({
  isPlaying,
  isMuted,
  onTogglePlay,
  onReset,
  onToggleMute,
}: {
  isPlaying: boolean;
  isMuted: boolean;
  onTogglePlay: () => void | Promise<void>;
  onReset: () => void;
  onToggleMute: () => void;
}) {
  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-[#faf9f6]/14 bg-[#141219] p-4 shadow-[inset_0_1px_0_rgba(250,249,246,0.08),0_20px_44px_-28px_rgba(0,0,0,0.95)] sm:p-5 md:flex-row md:items-center md:justify-between">
      <h1 className="text-2xl font-black uppercase leading-none tracking-[0.13em] text-[#faf9f6] sm:text-3xl">
        Polyrhythm Visualizer
      </h1>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => void onTogglePlay()}
          title={isPlaying ? "Pause" : "Play"}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-11 items-center gap-2 rounded-xl border border-[#55c991] bg-[#55c991] px-5 text-xs font-black uppercase tracking-[0.2em] text-[#17131a] transition-all hover:-translate-y-0.5 hover:bg-[#70d6a4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55c991]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141219] [&>svg]:h-4 [&>svg]:w-4"
        >
          {isPlaying ? <Pause /> : <Play />}
          <span>{isPlaying ? "Pause" : "Play"}</span>
        </button>
        <IconButton label="Reset" onClick={onReset}>
          <RotateCcw />
        </IconButton>
        <IconButton
          label={isMuted ? "Unmute" : "Mute"}
          active={isMuted}
          onClick={onToggleMute}
        >
          {isMuted ? <VolumeX /> : <Volume2 />}
        </IconButton>
      </div>
    </header>
  );
});

function IconButton({
  children,
  label,
  active = false,
  onClick,
}: {
  children: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      onClick={() => void onClick()}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55c991]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141219] [&>svg]:h-4 [&>svg]:w-4 ${
        active
          ? "border-[#55c991]/60 bg-[#55c991]/16 text-[#55c991]"
          : "border-[#faf9f6]/18 bg-[#221d29] text-[#faf9f6] hover:border-[#faf9f6]/40 hover:bg-[#2d2634]"
      }`}
    >
      {children}
    </button>
  );
}
