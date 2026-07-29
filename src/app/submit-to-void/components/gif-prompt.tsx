"use client";

import { motion } from "framer-motion";
import { Download, LoaderCircle, X } from "lucide-react";

/** Post-shred offer to keep a GIF of the black hole that ate the message. */
export function GifPrompt({
  isMakingGif,
  onSave,
  onDismiss,
}: {
  isMakingGif: boolean;
  onSave: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      className="absolute bottom-5 left-1/2 z-40 w-[min(calc(100vw-2rem),30rem)] -translate-x-1/2 rounded-3xl border border-zinc-800/60 bg-[#12111a]/96 p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:bg-[#12111a]/78 md:backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-zinc-100 to-zinc-400">
            Message Shredded
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Make a GIF of the black hole that took it?
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/60 text-zinc-400 transition hover:border-purple-800/40 hover:bg-zinc-900 hover:text-white"
          aria-label="Dismiss GIF prompt"
          title="Dismiss"
        >
          <X size={15} />
        </button>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={isMakingGif}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-transparent bg-linear-to-r from-purple-950 to-indigo-950 px-4 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-purple-200 transition hover:border-purple-800/40 hover:from-purple-900 hover:to-indigo-900 hover:text-white disabled:pointer-events-none disabled:opacity-60 shadow-lg shadow-purple-950/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]"
      >
        {isMakingGif ? (
          <LoaderCircle size={15} className="animate-spin" />
        ) : (
          <Download size={15} />
        )}
        <span>{isMakingGif ? "Making GIF" : "Save GIF"}</span>
      </button>
    </motion.div>
  );
}
