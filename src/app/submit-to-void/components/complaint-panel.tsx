"use client";

import { useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";

import { MAX_COMPLAINT_LENGTH } from "../config";
import type { Phase } from "../types";

/**
 * The message the user is about to lose. The draft lives here because nothing
 * outside this card reads it; the void only needs its length and, once, its
 * final text.
 */
export function ComplaintPanel({
  phase,
  textareaRef,
  onDraftChange,
  onShred,
}: {
  phase: Phase;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onDraftChange: (draft: string) => void;
  onShred: (text: string) => void;
}) {
  const [complaint, setComplaint] = useState("");

  const handleChange = (value: string) => {
    setComplaint(value);
    onDraftChange(value);
  };

  const handleShred = () => {
    if (!complaint || phase !== "TYPING") return;

    onShred(complaint);
    setComplaint("");
  };

  return (
    <div className="w-full lg:w-[48%] flex flex-col items-center justify-center relative">
      <AnimatePresence mode="wait">
        {phase !== "DIGESTING" ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full rounded-3xl border border-zinc-800/60 bg-[#12111a]/94 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.42)] md:bg-[#12111a]/70 md:p-8 md:backdrop-blur-xl md:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <h1 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-linear-to-r from-zinc-100 to-zinc-400">
              SEND TO THE VOID
            </h1>
            <p className="text-zinc-500 text-xs mb-6">
              Shred your frustrations, anger, and other thoughts. Submissions
              are sent to the void and deleted forever.
            </p>

            <div className="flex flex-col gap-1.5 relative mb-6">
              <textarea
                ref={textareaRef}
                value={complaint}
                onChange={(e) => handleChange(e.target.value)}
                disabled={phase !== "TYPING"}
                maxLength={MAX_COMPLAINT_LENGTH}
                className="h-24 w-full resize-none rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 font-mono text-sm text-zinc-200 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-600 focus:border-purple-900/60 focus:ring-1 focus:ring-purple-900/60 focus:outline-none disabled:text-zinc-700 md:h-32"
                placeholder="ENTER YOUR FRUSTRATION..."
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-zinc-600">
                {complaint.length}/{MAX_COMPLAINT_LENGTH}
              </div>
            </div>

            <button
              onClick={handleShred}
              disabled={!complaint.trim() || phase !== "TYPING"}
              className="w-full py-4 bg-linear-to-r from-purple-950 to-indigo-950 border border-transparent hover:border-purple-800/40 hover:from-purple-900 hover:to-indigo-900 text-purple-300 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 active:scale-[0.98] shadow-lg shadow-purple-950/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              <span>
                {phase === "SUCKING" ? "SHREDDING..." : "SHRED FOREVER"}
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full rounded-3xl border border-zinc-900/40 bg-zinc-950/90 p-6 text-center md:bg-zinc-950/30 md:p-8 md:backdrop-blur-md"
          >
            <div className="text-sm font-bold text-zinc-400 animate-pulse">
              SPAGETTHIFIYING TEXT...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
