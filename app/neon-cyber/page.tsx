"use client";

import { useState } from "react";
import { Cpu, Wifi } from "lucide-react";

export default function NeonCyber() {
  const [text, setText] = useState("CYBERPUNK");

  const toBinary = (str: string) =>
    str
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join(" ");
  const toHex = (str: string) =>
    str
      .split("")
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(" ")
      .toUpperCase();

  return (
    <div className="min-h-screen bg-[#050510] text-[#00ff9d] p-8 family-mono relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,157,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,157,0.05)_1px,transparent_1px)] bg-size-[50px_50px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 pt-20">
        {/* Input Sector */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-[#ff00ff]">
            <Cpu className="w-12 h-12" />
            <h1 className="text-5xl font-bold tracking-tighter glow-text drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">
              DATA_ENTRY
            </h1>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-[#00ff9d] to-[#ff00ff] opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="relative w-full bg-[#0a0a1f] p-6 text-2xl border border-[#00ff9d]/30 focus:border-[#00ff9d] outline-none h-64 font-mono shadow-[0_0_30px_rgba(0,255,157,0.1)] resize-none"
              placeholder="INITIATE SEQUENCE..."
            />
          </div>
        </div>

        {/* Output Sector */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 text-[#00ff9d]">
            <Wifi className="w-8 h-8 animate-pulse" />
            <h2 className="text-3xl font-bold tracking-widest border-b border-[#00ff9d] pb-2 w-full">
              ENCRYPTED_STREAM
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0a0a1f]/80 p-4 border-l-4 border-[#ff00ff]">
              <h3 className="text-[#ff00ff] text-sm mb-2 font-bold">
                MODE: BINARY
              </h3>
              <p className="break-all font-mono text-xs opacity-80 leading-relaxed">
                {toBinary(text)}
              </p>
            </div>

            <div className="bg-[#0a0a1f]/80 p-4 border-l-4 border-[#00ffff]">
              <h3 className="text-[#00ffff] text-sm mb-2 font-bold">
                MODE: HEXADECIMAL
              </h3>
              <p className="break-all font-mono text-sm opacity-80 leading-relaxed">
                {toHex(text)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glow-text {
          text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff;
        }
      `}</style>
    </div>
  );
}
