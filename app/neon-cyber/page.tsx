"use client";

import { useState } from "react";
import { Cpu, Wifi, Settings2 } from "lucide-react";

export default function NeonCyber() {
  const [text, setText] = useState("CYBERPUNK");

  const [caesarShift, setCaesarShift] = useState(3);
  const [binarySep, setBinarySep] = useState(true);
  const [hexCase, setHexCase] = useState<"upper" | "lower">("upper");
  const [base64Iter, setBase64Iter] = useState(1);
  const [atbashMirror, setAtbashMirror] = useState(false);
  const [rotVariant, setRotVariant] = useState<"rot13" | "rot47">("rot13");

  const toBinary = (str: string, separator: boolean) =>
    str
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join(separator ? " " : "");

  const toHex = (str: string, casing: "upper" | "lower") => {
    const hex = str
      .split("")
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(" ");
    return casing === "upper" ? hex.toUpperCase() : hex.toLowerCase();
  };

  const toBase64 = (str: string, iterations: number) => {
    try {
      let result = str;
      for (let i = 0; i < iterations; i++) {
        result = btoa(result);
      }
      return result;
    } catch {
      return "Invalid Input";
    }
  };

  const toCaesar = (str: string, shift: number) => {
    return str.replace(/[a-zA-Z]/g, (char) => {
      const base = char <= "Z" ? 65 : 97;
      return String.fromCharCode(
        ((((char.charCodeAt(0) - base + shift) % 26) + 26) % 26) + base
      );
    });
  };

  const toRot13 = (str: string, variant: "rot13" | "rot47") => {
    if (variant === "rot13") {
      return toCaesar(str, 13);
    } else {
      // ROT47 implementation (ASCII 33-126)
      return str
        .split("")
        .map((char) => {
          const code = char.charCodeAt(0);
          if (code >= 33 && code <= 126) {
            return String.fromCharCode(33 + ((code + 14) % 94));
          }
          return char;
        })
        .join("");
    }
  };

  const toAtbash = (str: string, mirror: boolean) => {
    const result = str.replace(/[a-zA-Z]/g, (char) => {
      const base = char <= "Z" ? 65 : 97;
      return String.fromCharCode(base + (25 - (char.charCodeAt(0) - base)));
    });
    return mirror ? result.split("").reverse().join("") : result;
  };

  return (
    <div className="min-h-screen bg-[#050510] text-[#00ff9d] p-8 font-mono relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,157,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,157,0.05)_1px,transparent_1px)] bg-size-[50px_50px] pointer-events-none" />

      <div className="absolute top-0 left-0 w-full h-32 bg-[#00ff9d]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff00ff]/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 pt-10">
        <div className="space-y-8 border border-[#00ff9d]/20 bg-[#0a0a1f]/50 p-6 rounded-xl backdrop-blur-sm shadow-[0_0_20px_rgba(0,255,157,0.05)]">
          <div className="flex items-center gap-4 text-[#ff00ff]">
            <Cpu className="w-10 h-10 drop-shadow-[0_0_8px_#ff00ff]" />
            <h1 className="text-4xl font-bold tracking-tighter drop-shadow-[0_0_15px_rgba(255,0,255,0.8)]">
              DATA_ENTRY
            </h1>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-[#00ff9d] to-[#ff00ff] opacity-55 blur-xl group-hover:opacity-75 transition duration-500"></div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="relative w-full bg-[#0a0a1f] p-6 text-xl border border-[#00ff9d]/30 focus:border-[#00ff9d] outline-none h-48 font-mono shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] resize-none tracking-wide text-white/90 focus:shadow-[0_0_25px_rgba(0,255,157,0.3)]"
              placeholder="INITIATE TEXT STREAM..."
              spellCheck={false}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 border-b border-[#00ff9d]/30 pb-2">
              <Settings2 className="w-5 h-5 text-[#00ff9d]" />
              <span className="font-bold tracking-widest text-sm text-[#00ff9d]/80 drop-shadow-[0_0_5px_rgba(0,255,157,0.5)]">
                ENCRYPTION_MODULES
              </span>
            </div>

            <div className="bg-[#0a0a1f] border-l-4 border-[#ff00ff] p-4 flex items-center justify-between shadow-[0_0_15px_rgba(255,0,255,0.1)] hover:bg-[#11112b] transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#ff00ff]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div>
                <h3 className="text-[#ff00ff] font-bold text-sm tracking-wider drop-shadow-[0_0_5px_#ff00ff]">
                  BINARY_MODULATOR
                </h3>
                <p className="text-[10px] text-[#ff00ff]/60 font-mono">
                  BIT_STREAM_FORMATTING
                </p>
              </div>
              <div className="z-10 flex items-center gap-3">
                <span className="text-[10px] uppercase text-[#ff00ff]/80">
                  Separator
                </span>
                <button
                  onClick={() => setBinarySep(!binarySep)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                    binarySep
                      ? "bg-[#ff00ff]/20 border border-[#ff00ff]"
                      : "bg-gray-800 border border-gray-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-[#ff00ff] shadow-[0_0_10px_#ff00ff] transition-transform duration-300 ${
                      binarySep ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="bg-[#0a0a1f] border-l-4 border-[#00ffff] p-4 flex items-center justify-between shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:bg-[#11112b] transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#00ffff]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div>
                <h3 className="text-[#00ffff] font-bold text-sm tracking-wider drop-shadow-[0_0_5px_#00ffff]">
                  HEX_PROCESSOR
                </h3>
                <p className="text-[10px] text-[#00ffff]/60 font-mono">
                  CASING_PROTOCOL
                </p>
              </div>
              <div className="z-10 flex bg-black/40 rounded p-1 border border-[#00ffff]/30">
                <button
                  onClick={() => setHexCase("upper")}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                    hexCase === "upper"
                      ? "bg-[#00ffff]/20 text-[#00ffff] shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                      : "text-gray-500 hover:text-[#00ffff]/60"
                  }`}
                >
                  UPPER
                </button>
                <button
                  onClick={() => setHexCase("lower")}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                    hexCase === "lower"
                      ? "bg-[#00ffff]/20 text-[#00ffff] shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                      : "text-gray-500 hover:text-[#00ffff]/60"
                  }`}
                >
                  lower
                </button>
              </div>
            </div>

            <div className="bg-[#0a0a1f] border-l-4 border-[#ffff00] p-4 shadow-[0_0_15px_rgba(255,255,0,0.1)] hover:bg-[#11112b] transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#ffff00]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-[#ffff00] font-bold text-sm tracking-wider drop-shadow-[0_0_5px_#ffff00]">
                    CAESAR_SHIFT_DRIVE
                  </h3>
                  <p className="text-[10px] text-[#ffff00]/60 font-mono">
                    OFFSET_CALIBRATION
                  </p>
                </div>
                <span className="font-mono text-xl text-[#ffff00] font-bold bg-black/40 px-3 py-1 rounded border border-[#ffff00]/30 shadow-[0_0_10px_#ffff00]">
                  {caesarShift > 0 ? "+" : ""}
                  {caesarShift}
                </span>
              </div>
              <input
                type="range"
                min="-26"
                max="26"
                value={caesarShift}
                onChange={(e) => setCaesarShift(parseInt(e.target.value))}
                className="caesar-slider w-full h-2 bg-[#ffff00]/20 rounded-lg appearance-none cursor-pointer z-10 relative"
              />
            </div>

            <div className="bg-[#0a0a1f] border-l-4 border-[#ff9900] p-4 shadow-[0_0_15px_rgba(255,153,0,0.1)] hover:bg-[#11112b] transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#ff9900]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-[#ff9900] font-bold text-sm tracking-wider drop-shadow-[0_0_5px_#ff9900]">
                    BASE64_LOOPER
                  </h3>
                  <p className="text-[10px] text-[#ff9900]/60 font-mono">
                    RECURSION_DEPTH
                  </p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-4 rounded-sm transition-all ${
                        base64Iter >= i
                          ? "bg-[#ff9900] shadow-[0_0_8px_#ff9900]"
                          : "bg-[#ff9900]/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={base64Iter}
                onChange={(e) => setBase64Iter(parseInt(e.target.value))}
                className="base64-slider w-full h-2 bg-[#ff9900]/20 rounded-lg appearance-none cursor-pointer z-10 relative"
              />
              <div className="flex justify-between text-[10px] text-[#ff9900]/50 font-mono mt-1 px-1">
                <span>1x</span>
                <span>5x</span>
              </div>
            </div>

            <div className="bg-[#0a0a1f] border-l-4 border-[#ff0000] p-4 flex items-center justify-between shadow-[0_0_15px_rgba(255,0,0,0.1)] hover:bg-[#11112b] transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#ff0000]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div>
                <h3 className="text-[#ff0000] font-bold text-sm tracking-wider drop-shadow-[0_0_5px_#ff0000]">
                  ATBASH_INVERTER
                </h3>
                <p className="text-[10px] text-[#ff0000]/60 font-mono">
                  MIRROR_PROTOCOL
                </p>
              </div>
              <div className="z-10 flex items-center gap-3">
                <button
                  onClick={() => setAtbashMirror(!atbashMirror)}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all border ${
                    atbashMirror
                      ? "bg-[#ff0000]/20 text-[#ff0000] border-[#ff0000] shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                      : "text-gray-500 border-gray-700 hover:text-[#ff0000]/60"
                  }`}
                >
                  {atbashMirror ? "MIRRORED" : "STANDARD"}
                </button>
              </div>
            </div>

            <div className="bg-[#0a0a1f] border-l-4 border-[#0099ff] p-4 flex items-center justify-between shadow-[0_0_15px_rgba(0,153,255,0.1)] hover:bg-[#11112b] transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#0099ff]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div>
                <h3 className="text-[#0099ff] font-bold text-sm tracking-wider drop-shadow-[0_0_5px_#0099ff]">
                  ROT_VARIANT
                </h3>
                <p className="text-[10px] text-[#0099ff]/60 font-mono">
                  ALGORITHM_SELECT
                </p>
              </div>
              <div className="z-10 flex bg-black/40 rounded p-1 border border-[#0099ff]/30">
                <button
                  onClick={() => setRotVariant("rot13")}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                    rotVariant === "rot13"
                      ? "bg-[#0099ff]/20 text-[#0099ff] shadow-[0_0_10px_rgba(0,153,255,0.5)]"
                      : "text-gray-500 hover:text-[#0099ff]/60"
                  }`}
                >
                  ROT13
                </button>
                <button
                  onClick={() => setRotVariant("rot47")}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                    rotVariant === "rot47"
                      ? "bg-[#0099ff]/20 text-[#0099ff] shadow-[0_0_10px_rgba(0,153,255,0.5)]"
                      : "text-gray-500 hover:text-[#0099ff]/60"
                  }`}
                >
                  ROT47
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto max-h-[85vh] pr-2 scrollbar-thin scrollbar-thumb-[#00ff9d]/30 scrollbar-track-transparent">
          <div className="flex items-center gap-4 text-[#00ff9d] sticky top-0 bg-[#050510]/95 backdrop-blur z-20 py-2 border-b border-[#00ff9d]/20 mb-4">
            <Wifi className="w-6 h-6 animate-pulse drop-shadow-[0_0_8px_#00ff9d]" />
            <h2 className="text-2xl font-bold tracking-widest w-full flex justify-between items-center drop-shadow-[0_0_10px_rgba(0,255,157,0.8)]">
              <span>ENCRYPTED_STREAMS</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00ff9d] animate-ping" />
                <span className="text-xs text-[#00ff9d] opacity-80 font-mono">
                  LIVE
                </span>
              </div>
            </h2>
          </div>

          <div className="grid gap-6">
            <div className="bg-[#0a0a1f]/80 p-4 border-l-4 border-[#ff00ff] hover:bg-[#151530] transition-all group shadow-[0_0_20px_rgba(255,0,255,0.1)] hover:shadow-[0_0_30px_rgba(255,0,255,0.2)]">
              <h3 className="text-[#ff00ff] text-xs mb-3 font-bold flex justify-between tracking-widest border-b border-[#ff00ff]/20 pb-1 drop-shadow-[0_0_5px_#ff00ff]">
                <span>BINARY_STREAM</span>
                <span className="font-mono opacity-50">UTF-8</span>
              </h3>
              <p className="break-all font-mono text-xs text-[#ff00ff] leading-relaxed font-light tracking-wide shadow-none drop-shadow-[0_0_2px_rgba(255,0,255,0.5)]">
                {toBinary(text, binarySep)}
              </p>
            </div>

            <div className="bg-[#0a0a1f]/80 p-4 border-l-4 border-[#00ffff] hover:bg-[#151530] transition-all group shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]">
              <h3 className="text-[#00ffff] text-xs mb-3 font-bold flex justify-between tracking-widest border-b border-[#00ffff]/20 pb-1 drop-shadow-[0_0_5px_#00ffff]">
                <span>HEX_STREAM</span>
                <span className="font-mono opacity-50">BASE16</span>
              </h3>
              <p className="break-all font-mono text-xs text-[#00ffff] leading-relaxed tracking-wider drop-shadow-[0_0_2px_rgba(0,255,255,0.5)]">
                {toHex(text, hexCase)}
              </p>
            </div>

            <div className="bg-[#0a0a1f]/80 p-4 border-l-4 border-[#ffff00] hover:bg-[#151530] transition-all group shadow-[0_0_20px_rgba(255,255,0,0.1)] hover:shadow-[0_0_30px_rgba(255,255,0,0.2)]">
              <h3 className="text-[#ffff00] text-xs mb-3 font-bold flex justify-between tracking-widest border-b border-[#ffff00]/20 pb-1 drop-shadow-[0_0_5px_#ffff00]">
                <span>CAESAR_CIPHER</span>
                <span className="bg-[#ffff00]/10 px-2 rounded text-[10px]">
                  ROT{Math.abs(caesarShift)}
                </span>
              </h3>
              <p className="break-all font-mono text-sm text-[#ffff00] leading-relaxed drop-shadow-[0_0_2px_rgba(255,255,0,0.5)]">
                {toCaesar(text, caesarShift)}
              </p>
            </div>

            <div className="bg-[#0a0a1f]/80 p-4 border-l-4 border-[#ff9900] hover:bg-[#151530] transition-all group shadow-[0_0_20px_rgba(255,153,0,0.1)] hover:shadow-[0_0_30px_rgba(255,153,0,0.2)]">
              <h3 className="text-[#ff9900] text-xs mb-3 font-bold flex justify-between tracking-widest border-b border-[#ff9900]/20 pb-1 drop-shadow-[0_0_5px_#ff9900]">
                <span>BASE64_ENCODING</span>
                <span className="font-mono opacity-50">
                  {base64Iter}X ITERATION
                </span>
              </h3>
              <p className="break-all font-mono text-sm text-[#ff9900] leading-relaxed drop-shadow-[0_0_2px_rgba(255,153,0,0.5)]">
                {toBase64(text, base64Iter)}
              </p>
            </div>

            <div className="bg-[#0a0a1f]/80 p-4 border-l-4 border-[#ff0000] hover:bg-[#151530] transition-all group shadow-[0_0_20px_rgba(255,0,0,0.1)] hover:shadow-[0_0_30px_rgba(255,0,0,0.2)]">
              <h3 className="text-[#ff0000] text-xs mb-3 font-bold flex justify-between tracking-widest border-b border-[#ff0000]/20 pb-1 drop-shadow-[0_0_5px_#ff0000]">
                <span>ATBASH_SUBSTITUTION</span>
                <span className="font-mono opacity-50">
                  {atbashMirror ? "MIRRORED" : "STANDARD"}
                </span>
              </h3>
              <p className="break-all font-mono text-sm text-[#ff0000] leading-relaxed drop-shadow-[0_0_2px_rgba(255,0,0,0.5)]">
                {toAtbash(text, atbashMirror)}
              </p>
            </div>

            <div className="bg-[#0a0a1f]/80 p-4 border-l-4 border-[#0099ff] hover:bg-[#151530] transition-all group shadow-[0_0_20px_rgba(0,153,255,0.1)] hover:shadow-[0_0_30px_rgba(0,153,255,0.2)]">
              <h3 className="text-[#0099ff] text-xs mb-3 font-bold flex justify-between tracking-widest border-b border-[#0099ff]/20 pb-1 drop-shadow-[0_0_5px_#0099ff]">
                <span>ROT_ALGORITHM</span>
                <span className="font-mono opacity-50 uppercase">
                  {rotVariant}
                </span>
              </h3>
              <p className="break-all font-mono text-sm text-[#0099ff] leading-relaxed drop-shadow-[0_0_2px_rgba(0,153,255,0.5)]">
                {toRot13(text, rotVariant)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.1s ease;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: transform 0.1s ease;
        }

        input[type="range"]:hover::-webkit-slider-thumb {
          transform: scale(1.2);
        }

        .caesar-slider::-webkit-slider-thumb {
          background-color: #ffff00;
          box-shadow: 0 0 10px #ffff00;
        }
        .caesar-slider::-moz-range-thumb {
          background-color: #ffff00;
          box-shadow: 0 0 10px #ffff00;
        }

        .base64-slider::-webkit-slider-thumb {
          background-color: #ff9900;
          box-shadow: 0 0 10px #ff9900;
        }
        .base64-slider::-moz-range-thumb {
          background-color: #ff9900;
          box-shadow: 0 0 10px #ff9900;
        }
      `}</style>
    </div>
  );
}
