"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function SubmitToNothing() {
  const [complaint, setComplaint] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "voided">("idle");

  const handleSubmit = () => {
    if (!complaint) return;

    // Instant submission to void
    setStatus("voided");
    setComplaint("");
    setName("");

    // Reset after showing the "voided" message
    setTimeout(() => {
      setStatus("idle");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#ffff00] p-8 font-sans flex items-center justify-center overflow-hidden">
      <div className="max-w-xl w-full bg-[#bd93f9] border-8 border-black shadow-[20px_20px_0px_0px_#000000] p-12 relative transition-transform duration-100">
        <div className="absolute -top-6 -right-6 bg-[#ff79c6] border-4 border-black px-4 py-2 font-black text-xl rotate-12 shadow-[5px_5px_0px_0px_#000000]">
          USELESS FORM
        </div>

        <h1 className="text-6xl font-black mb-12 uppercase leading-none drop-shadow-[5px_5px_0px_#fff]">
          SUBMIT TO NOTHING
        </h1>

        {status === "voided" ? (
          <div className="bg-black text-white p-8 border-4 border-white text-center animate-bounce">
            <h2 className="text-4xl font-bold mb-4">COMPLAINT IGNORED</h2>
            <p className="text-xl uppercase font-bold">
              Your data has been successfully not recieved.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-xl uppercase bg-black text-white inline-block w-fit px-2">
                YOUR NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border-4 border-black p-4 text-2xl text-black font-bold focus:shadow-[10px_10px_0px_0px_#000000] focus:translate-x-[-5px] focus:translate-y-[-5px] transition-all outline-none placeholder:text-gray-400 uppercase"
                placeholder="JOHN DOE"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-xl uppercase bg-black text-white inline-block w-fit px-2">
                YOUR COMPLAINT
              </label>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                rows={4}
                className="w-full bg-white border-4 border-black p-4 text-2xl text-black font-bold focus:shadow-[10px_10px_0px_0px_#000000] focus:translate-x-[-5px] focus:translate-y-[-5px] transition-all outline-none placeholder:text-gray-400 uppercase resize-none"
                placeholder="TYPE YOUR POINTLESS THOUGHTS HERE..."
              />
            </div>

            <div className="flex gap-4 items-center">
              <input
                type="checkbox"
                className="w-12 h-12 border-4 border-black appearance-none checked:bg-black checked:after:content-['✓'] checked:after:text-white checked:after:flex checked:after:justify-center checked:after:items-center checked:after:text-4xl checked:after:font-bold cursor-pointer bg-white transition-colors"
              />
              <span className="font-bold text-xl uppercase leading-tight">
                I AGREE THAT NOBODY WILL SEE THIS
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!complaint}
              className="w-full mt-12 bg-[#ff5555] border-4 border-black p-6 text-4xl font-black uppercase hover:bg-white hover:shadow-[10px_10px_0px_0px_#000000] active:translate-y-[5px] active:translate-x-[5px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-4"
            >
              <span>SUBMIT</span>
              <Send className="w-10 h-10" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
