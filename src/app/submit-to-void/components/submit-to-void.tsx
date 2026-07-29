"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";

import {
  DIGESTING_DURATION_MS,
  DIGESTING_VOID_MASS,
  VOID_MASS_PER_CHAR,
} from "../config";
import { useGifExport } from "../hooks/use-gif-export";
import { useIsMobile } from "../hooks/use-is-mobile";
import type { Particle, Phase } from "../types";
import { logVoid } from "../utils/log";
import { createShredParticles } from "../utils/particles";
import { BlackHole } from "./black-hole";
import { ComplaintPanel } from "./complaint-panel";
import { GifPrompt } from "./gif-prompt";
import { ShreddedText } from "./shredded-text";
import { StarField } from "./star-field";

export function SubmitToVoid() {
  const [phase, setPhase] = useState<Phase>("TYPING");
  const [voidMass, setVoidMass] = useState(1);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lastShreddedText, setLastShreddedText] = useState("");
  const [showGifPrompt, setShowGifPrompt] = useState(false);

  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const voidCenterRef = useRef<HTMLDivElement>(null);
  const { isMakingGif, exportGif } = useGifExport(
    lastShreddedText,
    voidMass,
    isMobile,
  );

  // The void swells while a message is being typed at it.
  const handleDraftChange = useCallback((draft: string) => {
    setVoidMass(1 + draft.length * VOID_MASS_PER_CHAR);
  }, []);

  const handleShred = useCallback((text: string) => {
    setShowGifPrompt(false);
    setPhase("SUCKING");
    logVoid("commencing shred protocol...");
    logVoid(`spaghettifying ${text.length} characters...`);
    setLastShreddedText(text);
    setParticles(
      createShredParticles(text, textareaRef.current, voidCenterRef.current),
    );
  }, []);

  const handleShredComplete = useCallback(() => {
    setParticles([]);
    setPhase("DIGESTING");
    setVoidMass(DIGESTING_VOID_MASS);
    setShowGifPrompt(true);
    logVoid("swallow sequence complete.");
    logVoid("the void remains satisfied.");
  }, []);

  const handleSaveGif = useCallback(() => {
    setShowGifPrompt(false);
    void exportGif();
  }, [exportGif]);

  useEffect(() => {
    if (phase !== "DIGESTING") return;

    const timer = window.setTimeout(
      () => {
        setVoidMass(1);
        setPhase("TYPING");
      },
      isMobile ? DIGESTING_DURATION_MS.mobile : DIGESTING_DURATION_MS.desktop,
    );

    return () => window.clearTimeout(timer);
  }, [phase, isMobile]);

  return (
    <div className="relative flex min-h-dvh flex-col justify-center overflow-hidden bg-[#07060c] font-mono text-white select-none">
      <StarField />

      <main className="z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-0 px-4 py-5 lg:flex-row lg:gap-12 lg:p-6">
        <ComplaintPanel
          phase={phase}
          textareaRef={textareaRef}
          onDraftChange={handleDraftChange}
          onShred={handleShred}
        />

        <div className="relative flex min-h-72 w-full items-center justify-center lg:min-h-100 lg:w-[48%] lg:translate-x-20">
          {phase === "SUCKING" && (
            <ShreddedText
              particles={particles}
              isMobile={isMobile}
              onComplete={handleShredComplete}
            />
          )}

          <BlackHole
            mass={voidMass}
            isMobile={isMobile}
            centerRef={voidCenterRef}
          />
        </div>
      </main>

      <AnimatePresence>
        {showGifPrompt && (
          <GifPrompt
            isMakingGif={isMakingGif}
            onSave={handleSaveGif}
            onDismiss={() => setShowGifPrompt(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
