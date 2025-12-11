"use client";

import { useState } from "react";

export default function BrutalistPage() {
  const [text, setText] = useState("SHOUT IT OUT");

  return (
    <div className="min-h-screen bg-[#fff1f2] p-4 font-sans text-black overflow-hidden flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8 border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white relative">
        <h1
          className="text-[12vw] font-black leading-none break-all text-center uppercase tracking-tighter"
          style={{ wordBreak: "break-word" }}
        >
          {text}
        </h1>
        <div className="absolute top-0 left-0 bg-black text-white px-4 py-2 font-bold text-xl uppercase tracking-widest">
          Raw_Input
        </div>
      </div>

      <div className="mt-8 border-4 border-black bg-yellow-400 p-4 transform -rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <label className="block text-2xl font-black mb-2 uppercase">
          Type Something Loud:
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-white border-4 border-black p-4 text-3xl font-bold uppercase focus:outline-none focus:ring-4 focus:ring-black"
          maxLength={20}
        />
      </div>
    </div>
  );
}
