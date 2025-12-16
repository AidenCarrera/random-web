"use client";

import { useState, useEffect } from "react";
import { MousePointer2, RefreshCw } from "lucide-react";

export default function DarkDashboard() {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cps, setCps] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const startTest = () => {
    setClicks(0);
    setTimeLeft(5);
    setIsActive(true);
    setCps(0);
  };

  const handleClick = () => {
    if (!isActive && timeLeft === 0) {
      startTest();
      setClicks(1);
    } else if (isActive) {
      setClicks((c) => c + 1);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      setTimeout(() => {
        setIsActive(false);
        const newCps = clicks / 5;
        setCps(newCps);
        if (newCps > highScore) setHighScore(newCps);
      }, 0);
    }
  }, [timeLeft, isActive, clicks, highScore]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-8 flex flex-col gap-8">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <MousePointer2 className="w-5 h-5" />
          </div>
          Click Speed Test
        </h1>
        <div className="text-sm text-slate-500">v2.4.0-stable</div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700 relative overflow-hidden">
          <div className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
            Current CPS
          </div>
          <div className="text-4xl font-bold text-blue-400">
            {isActive
              ? (clicks / (5 - timeLeft + 0.1)).toFixed(1)
              : cps.toFixed(1)}
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <MousePointer2 className="w-24 h-24 -mr-4 -mb-4" />
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700">
          <div className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
            Time Remaining
          </div>
          <div
            className={`text-4xl font-bold ${
              timeLeft <= 2 && isActive ? "text-red-500" : "text-slate-200"
            }`}
          >
            {timeLeft}s
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700">
          <div className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
            Session High Score
          </div>
          <div className="text-4xl font-bold text-emerald-400">
            {highScore.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className="flex-1 bg-[#1e293b] rounded-2xl border border-slate-700 p-8 flex flex-col items-center justify-center relative">
        <button
          onClick={handleClick}
          className={`w-64 h-64 rounded-full border-8 transition-all active:scale-95 flex flex-col items-center justify-center gap-2 select-none ${
            isActive
              ? "bg-blue-600 border-blue-400 shadow-[0_0_50px_rgba(37,99,235,0.5)]"
              : "bg-slate-800 border-slate-600 hover:border-slate-500"
          }`}
        >
          <span className="text-5xl font-black">
            {isActive ? "CLICK!" : "START"}
          </span>
          <span className="text-sm opacity-70">
            {isActive ? clicks : "5 Second Test"}
          </span>
        </button>

        {!isActive && cps > 0 && (
          <div className="mt-8 text-center animate-in slide-in-from-bottom-5">
            <p className="text-slate-400 mb-2">Result</p>
            <div className="text-3xl font-bold text-white">
              {cps.toFixed(2)} CPS
            </div>
            <button
              onClick={() => {
                setCps(0);
                setClicks(0);
              }}
              className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 mx-auto"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
