"use client";

import { useState, useRef } from "react";
import * as Tone from "tone";
import { Zap } from "lucide-react";

const MORSE_CODE: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  "0": "-----",
  " ": "/",
} as const;

const REVERSE_MORSE_CODE: Record<string, string> = Object.entries(
  MORSE_CODE
).reduce((acc, [char, code]) => ({ ...acc, [code]: char }), {});

export default function MorseTelegraph() {
  const [input, setInput] = useState("");
  // Derived state instead of useEffect
  const encoded = input
    .toUpperCase()
    .split("")
    .map((char) => MORSE_CODE[char] || "?")
    .join(" ");
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [lightOn, setLightOn] = useState(false);

  const oscRef = useRef<Tone.Synth | null>(null);
  const stopSignalRef = useRef<(() => void) | null>(null);

  const initAudio = async () => {
    await Tone.start();
    if (!oscRef.current) {
      // Create a vintage sounding synth (instant attack/release for telegraph feel)
      const synth = new Tone.Synth({
        oscillator: {
          type: "sine",
        },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 1,
          release: 0.005,
        },
      }).toDestination();
      synth.volume.value = -10;
      oscRef.current = synth;
    }
  };

  const transmit = async () => {
    if (isTransmitting || !encoded) return;
    await initAudio();
    setIsTransmitting(true);

    // Parse Morse Code
    const dotDuration = 100;

    const sequence = encoded.split("");

    // Since Tone.Transport is better for precise timing, but setTimeout is easier for visual sync (light bulb)
    // We'll use a recursive visual/audio player

    const playSignal = async (index: number) => {
      if (index >= sequence.length || stopSignalRef.current === null) {
        // If stopSignalRef became null (force stop), we shouldn't be here if we check below.
        // But checking index is valid.
        // Also check if we were stopped externally.
        if (index >= sequence.length) {
          setIsTransmitting(false);
          setLightOn(false);
          stopSignalRef.current = null;
        }
        return;
      }

      const char = sequence[index];
      let duration = 0;
      let pause = dotDuration; // gap between elements

      if (char === ".") {
        oscRef.current?.triggerAttack(600);
        setLightOn(true);
        duration = dotDuration;
      } else if (char === "-") {
        oscRef.current?.triggerAttack(600);
        setLightOn(true);
        duration = dotDuration * 3;
      } else if (char === " " || char === "/") {
        duration = 0;
        pause = dotDuration * 3; // gap between letters
        if (char === "/") pause = dotDuration * 7; // gap between words
      }

      // Stop mechanism check
      // We set the stop handler to this scope's cleanup
      stopSignalRef.current = () => {
        oscRef.current?.triggerRelease();
        setLightOn(false);
        setIsTransmitting(false);
        // Clear self to indicate stop
        stopSignalRef.current = null;
      };

      setTimeout(() => {
        // Stop audio if it was a beep
        if (duration > 0) {
          oscRef.current?.triggerRelease();
          setLightOn(false);
        }

        // If we were stopped during the beep, return
        if (!stopSignalRef.current) return;

        setTimeout(() => {
          if (!stopSignalRef.current) return;
          playSignal(index + 1);
        }, pause);
      }, duration);
    };

    // Initialize stop ref
    stopSignalRef.current = () => {};
    playSignal(0);
  };

  // Manual Input Logic
  const tapStartTime = useRef<number>(0);
  const currentSignal = useRef<string>("");
  const decodeTimeout = useRef<NodeJS.Timeout | null>(null);

  const manualTapStart = async () => {
    // Clear any pending decode, we are continuing the sequence
    if (decodeTimeout.current) {
      clearTimeout(decodeTimeout.current);
      decodeTimeout.current = null;
    }

    tapStartTime.current = Date.now();
    await initAudio();
    oscRef.current?.triggerAttack(600);
    setLightOn(true);
  };

  const manualTapEnd = () => {
    oscRef.current?.triggerRelease();
    setLightOn(false);

    const now = Date.now();
    const duration = now - tapStartTime.current;

    // Determine Dot or Dash
    // > 200ms is a Dash, otherwise Dot
    const symbol = duration > 200 ? "-" : ".";
    currentSignal.current += symbol;

    // Verify visually or wait for gap
    // Set timeout to decide letter is done (e.g. 600ms gap)
    decodeTimeout.current = setTimeout(() => {
      const char = REVERSE_MORSE_CODE[currentSignal.current];
      if (char) {
        setInput((prev) => prev + char);
      } else {
        // Invalid sequence
      }
      currentSignal.current = "";
    }, 600); // 600ms gap = end of character
  };

  const stopTransmission = () => {
    if (stopSignalRef.current) stopSignalRef.current();
  };

  return (
    <div className="min-h-screen bg-[#2a2320] text-[#d4b483] font-mono flex items-center justify-center p-4">
      {/* Inject Vintage Font */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap");
      `}</style>

      <div
        className="max-w-3xl w-full bg-[#1e1815] border-8 border-[#8b5a2b] p-8 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col gap-8 md:scale-[1.2]"
        style={{ fontFamily: '"Courier Prime", monospace' }}
      >
        {/* Screw Details */}
        <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-[#5c4033] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)] flex items-center justify-center text-black/50 text-[8px] transform rotate-45">
          +
        </div>
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#5c4033] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)] flex items-center justify-center text-black/50 text-[8px] transform -rotate-12">
          +
        </div>
        <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-[#5c4033] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)] flex items-center justify-center text-black/50 text-[8px] transform rotate-90">
          +
        </div>
        <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-[#5c4033] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)] flex items-center justify-center text-black/50 text-[8px] transform rotate-180">
          +
        </div>

        <div className="text-center border-b-2 border-[#8b5a2b]/30 pb-4">
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest text-[#c0a080] drop-shadow-[2px_2px_0px_#000]">
            Telegraph V.1
          </h1>
          <p className="text-sm opacity-50 mt-2 italic">
            Morse Transmission Unit
          </p>
        </div>

        {/* Display Panel */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-bold uppercase tracking-wider text-[#8b5a2b]">
              Input Message
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="TYPE MESSAGE HERE..."
              className="flex-1 min-h-[150px] bg-[#e6dcc3] text-[#2a2320] p-4 text-xl font-bold uppercase border-4 border-[#8b5a2b] shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] focus:outline-none resize-none placeholder-[#2a2320]/30"
            />
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-sm font-bold uppercase tracking-wider text-[#8b5a2b]">
              Encoded Signal
            </label>
            <div className="flex-1 min-h-[150px] bg-[#1a1512] text-[#ff8c00] p-4 text-2xl font-bold border-4 border-[#3e3228] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-y-auto w-full break-all tracking-widest leading-loose">
              {encoded || "AWAITING INPUT..."}
            </div>
          </div>
        </div>

        {/* Control Desk */}
        <div className="bg-[#2a2321] p-6 rounded border-t-2 border-[#8b5a2b]/30 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* The Bulb */}
          <div className="relative group">
            <div
              className={`w-24 h-24 rounded-full border-4 border-[#2f2f2f] bg-[#1a1512] relative transition-all duration-100 ${
                lightOn
                  ? "shadow-[0_0_60px_#ffae00] bg-[#ffecb3]"
                  : "shadow-none"
              }`}
            >
              {/* Filament */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <Zap
                  className={`w-12 h-12 transition-colors ${
                    lightOn ? "text-[#ff8c00]" : "text-[#4a3b32]"
                  }`}
                />
              </div>
            </div>
            {/* Base */}
            <div className="w-16 h-8 bg-linear-to-b from-[#5c4033] to-[#3e2b22] mx-auto mt-[-4px] border-x-2 border-[#1a1512]" />
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 w-full md:w-auto">
            {isTransmitting ? (
              <button
                onClick={stopTransmission}
                className="px-8 py-4 bg-[#8b0000] text-white font-bold text-xl uppercase tracking-widest border-b-4 border-[#4a0000] active:border-b-0 active:translate-y-1 transition-all shadow-lg rounded"
              >
                STOP SIGNAL
              </button>
            ) : (
              <button
                onClick={transmit}
                disabled={!encoded}
                className="px-8 py-4 bg-[#8b5a2b] text-[#ffeebb] font-bold text-xl uppercase tracking-widest border-b-4 border-[#5c3a1b] active:border-b-0 active:translate-y-1 transition-all shadow-lg hover:bg-[#9c6b3c] disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                TRANSMIT
              </button>
            )}
          </div>

          {/* Manual Key */}
          <div className="flex flex-col gap-2 items-center">
            <button
              onMouseDown={manualTapStart}
              onMouseUp={manualTapEnd}
              onMouseLeave={manualTapEnd}
              onTouchStart={() => {
                manualTapStart();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                manualTapEnd();
              }}
              className="w-32 h-32 rounded-full bg-linear-to-b from-[#d4af37] to-[#8b7500] shadow-[0_10px_0_#5c4d00,0_15px_20px_rgba(0,0,0,0.5)] active:shadow-[0_2px_0_#5c4d00,0_5px_10px_rgba(0,0,0,0.5)] active:translate-y-2 transition-all border-4 border-[#ffdf80] flex items-center justify-center touch-none"
            >
              <span className="text-[#3e2b22] font-bold text-lg opacity-50">
                TAP
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
