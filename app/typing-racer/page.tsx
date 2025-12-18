"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Zap,
  Trophy,
  RefreshCcw,
  Terminal,
  Minimize,
  X,
  Maximize,
} from "lucide-react";

// --- EXPANDED DATASETS ---
const WORD_BANKS = {
  easy: [
    "neon",
    "flux",
    "byte",
    "code",
    "data",
    "link",
    "node",
    "root",
    "user",
    "void",
    "warp",
    "zero",
    "acid",
    "base",
    "core",
    "disk",
    "echo",
    "file",
    "grid",
    "hack",
    "icon",
    "java",
    "keys",
    "load",
    "mode",
    "nano",
    "opus",
    "path",
    "quad",
    "ram",
    "scan",
    "tech",
    "unit",
    "view",
    "wire",
    "xray",
    "yott",
    "zone",
    "beta",
    "chip",
    "doom",
    "edge",
    "flow",
    "gear",
    "host",
    "item",
    "jump",
    "kill",
    "loop",
    "main",
    "null",
    "open",
    "ping",
    "quit",
    "read",
    "save",
    "task",
    "undo",
    "volt",
    "wave",
  ],
  medium: [
    "android",
    "binary",
    "cipher",
    "daemon",
    "energy",
    "fusion",
    "glitch",
    "hybrid",
    "input",
    "kernel",
    "laser",
    "matrix",
    "neural",
    "output",
    "pixel",
    "quantum",
    "robot",
    "signal",
    "turbo",
    "ultra",
    "vector",
    "widget",
    "xenon",
    "yield",
    "zombie",
    "access",
    "backup",
    "cache",
    "debug",
    "enter",
    "format",
    "global",
    "hacker",
    "inline",
    "jitter",
    "kilo",
    "logic",
    "macro",
    "network",
    "object",
    "packet",
    "query",
    "router",
    "server",
    "token",
    "upload",
    "virtual",
    "window",
    "syntax",
    "system",
    "proxy",
    "module",
    "legacy",
    "import",
    "export",
    "driver",
    "device",
    "config",
    "client",
    "buffer",
    "browse",
    "avatar",
    "applet",
    "action",
  ],
  hard: [
    "algorithm",
    "bandwidth",
    "cyberpunk",
    "database",
    "encryption",
    "firewall",
    "gigabyte",
    "hardware",
    "interface",
    "javascript",
    "keyboard",
    "mainframe",
    "nanotech",
    "overclock",
    "protocol",
    "rendering",
    "software",
    "terminal",
    "username",
    "viewport",
    "wireless",
    "xmlhttpreq",
    "yottabyte",
    "zeppelin",
    "architecture",
    "bootstrap",
    "compilation",
    "dependency",
    "environment",
    "framework",
    "generator",
    "heuristic",
    "injection",
    "journaling",
    "kubernetes",
    "localhost",
    "middleware",
    "namespace",
    "optimizer",
    "parameter",
    "quaternion",
    "recursion",
    "serialize",
    "throughput",
    "undefined",
    "validation",
    "websocket",
    "xenomorph",
    "yesterday",
    "zookeepers",
    "blockchain",
    "component",
    "dashboard",
  ],
};

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_SETTINGS = {
  easy: { name: "BASIC", duration: 30, multiplier: 1 },
  medium: { name: "STANDARD", duration: 45, multiplier: 1.5 },
  hard: { name: "EXTENDED", duration: 60, multiplier: 2 },
};

export default function VaporwaveRacer() {
  // Game State
  const [gameState, setGameState] = useState<"menu" | "playing" | "finished">(
    "menu"
  );
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  // Gameplay State
  const [currentWord, setCurrentWord] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [wpm, setWpm] = useState(0);
  const [progress, setProgress] = useState(0); // 0-100
  const [totalCharsTyped, setTotalCharsTyped] = useState(0);

  // Advanced Mechanics
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [highScores, setHighScores] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load High Scores on Mount
  useEffect(() => {
    const saved = localStorage.getItem("vaporwave_racer_scores");
    if (saved) {
      // eslint-disable-next-line
      setHighScores(JSON.parse(saved));
    }
  }, []);

  // Utility: Get random word based on difficulty
  const generateWord = () => {
    const bank = WORD_BANKS[difficulty];
    const word = bank[Math.floor(Math.random() * bank.length)];
    setCurrentWord(word);
    setInputValue("");
  };

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setErrors(0);
    setTotalCharsTyped(0);
    setProgress(0);
    setTimeLeft(DIFFICULTY_SETTINGS[difficulty].duration);
    setGameState("playing");
    generateWord();

    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const endGame = useCallback(() => {
    setGameState("finished");
    if (timerRef.current) clearInterval(timerRef.current);

    if (score > highScores[difficulty]) {
      const newScores = { ...highScores, [difficulty]: score };
      setHighScores(newScores);
      localStorage.setItem("vaporwave_racer_scores", JSON.stringify(newScores));
    }
  }, [score, highScores, difficulty]);

  // Timer Logic
  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });

        setTotalCharsTyped((prev) => {
          const timeElapsed =
            DIFFICULTY_SETTINGS[difficulty].duration - (timeLeft - 1);
          const calculatedWpm = Math.round(prev / 5 / (timeElapsed / 60));
          if (timeElapsed > 0) setWpm(calculatedWpm);
          return prev;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft, difficulty, endGame]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const isMatchingSoFar = currentWord.startsWith(val);

    if (!isMatchingSoFar) {
      setCombo(0);
      setErrors((prev) => prev + 1);
      triggerShake();
    }

    setInputValue(val);

    if (val === currentWord) {
      const wordPoints = currentWord.length * 10;
      const comboMultiplier = 1 + Math.floor(combo / 5) * 0.5;
      const finalPoints = Math.round(
        wordPoints *
          comboMultiplier *
          DIFFICULTY_SETTINGS[difficulty].multiplier
      );

      setScore((s) => s + finalPoints);
      setCombo((c) => {
        const newCombo = c + 1;
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        return newCombo;
      });
      setTotalCharsTyped((prev) => prev + currentWord.length + 1);
      setProgress((p) => (p + 8) % 100);
      generateWord();
    }
  };

  // Render individual characters with styling
  const renderWord = () => {
    return currentWord.split("").map((char, i) => {
      let color = "text-black/40";
      let style = "";

      if (i < inputValue.length) {
        if (inputValue[i] === char) {
          color = "text-[#00d8ff]"; // Vapor Teal
        } else {
          color = "text-[#ff7eb6]"; // Vapor Pink
          style = "line-through";
        }
      } else if (i === inputValue.length) {
        color = "text-black";
        style =
          "underline decoration-2 underline-offset-4 decoration-[#a575ff]"; // Vapor Purple underline
      }

      return (
        <span
          key={i}
          className={`${color} ${style} transition-all duration-75`}
        >
          {char}
        </span>
      );
    });
  };

  const accuracy =
    totalCharsTyped > 0
      ? Math.max(
          0,
          Math.round(((totalCharsTyped - errors) / totalCharsTyped) * 100)
        )
      : 100;

  // --- CUSTOM STYLES FOR VAPORWAVE/WIN95 LOOK ---
  const win95Border =
    "border-t-white border-l-white border-r-gray-800 border-b-gray-800 border-[3px]";
  const win95BorderInset =
    "border-t-gray-800 border-l-gray-800 border-r-white border-b-white border-[3px]";
  const win95Bg = "bg-[#c0c0c0]";
  const vaporGradient =
    "bg-gradient-to-r from-[#ff7eb6] via-[#a575ff] to-[#00d8ff]";
  const titleBar = `w-full h-8 ${vaporGradient} flex items-center justify-between px-2 text-white font-bold select-none`;

  return (
    // Main container - Pastel sky background
    <div
      className={`min-h-screen bg-linear-to-b from-[#ffc4d6] to-[#a8edea] text-black font-['VT323',monospace] overflow-hidden relative flex flex-col justify-center ${
        isShaking ? "animate-shake" : ""
      }`}
    >
      {/* Global Styles & Fonts */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=VT323&display=swap");

        .animate-shake {
          animation: shake 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        @keyframes shake {
          10%,
          90% {
            transform: translate3d(-2px, 0, 0);
          }
          20%,
          80% {
            transform: translate3d(4px, 0, 0);
          }
          30%,
          50%,
          70% {
            transform: translate3d(-6px, 0, 0);
          }
          40%,
          60% {
            transform: translate3d(6px, 0, 0);
          }
        }
        .bg-checkerboard {
          background-image: linear-gradient(45deg, #ff7eb6 25%, transparent 25%),
            linear-gradient(-45deg, #ff7eb6 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ff7eb6 75%),
            linear-gradient(-45deg, transparent 75%, #ff7eb6 75%);
          background-size: 60px 60px;
          background-color: #00d8ff;
          opacity: 0.3;
        }
        /* Classic Scrollbar */
        ::-webkit-scrollbar {
          width: 16px;
          height: 16px;
        }
        ::-webkit-scrollbar-track {
          background: #c0c0c0;
          border: 2px solid;
          border-color: #808080 #fff #fff #808080;
        }
        ::-webkit-scrollbar-thumb {
          background: #c0c0c0;
          border: 2px solid;
          border-color: #fff #808080 #808080 #fff;
        }
      `}</style>

      {/* --- SCENERY --- */}
      <div className="absolute inset-0 perspective-1000 overflow-hidden pointer-events-none z-0">
        {/* Wireframe Sun */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full border-4 border-[#ff7eb6] bg-linear-to-b from-[#ff7eb6]/50 to-transparent z-10 grid place-items-center">
          <div className="w-full h-4 bg-[#ff7eb6]/40 absolute top-1/4"></div>
          <div className="w-full h-4 bg-[#ff7eb6]/40 absolute top-2/4"></div>
          <div className="w-full h-4 bg-[#ff7eb6]/40 absolute top-3/4"></div>
        </div>

        {/* Wireframe Mountains */}
        <div className="absolute top-[50vh] left-0 w-full flex justify-center items-end opacity-40">
          <svg
            className="w-full h-32"
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
          >
            <polygon
              points="0,20 20,5 40,20"
              fill="none"
              stroke="#a575ff"
              strokeWidth="0.2"
            />
            <polygon
              points="30,20 50,2 70,20"
              fill="none"
              stroke="#00d8ff"
              strokeWidth="0.2"
            />
            <polygon
              points="60,20 80,8 100,20"
              fill="none"
              stroke="#ff7eb6"
              strokeWidth="0.2"
            />
          </svg>
        </div>

        {/* Checkerboard Floor */}
        <div
          className="absolute bottom-0 left-0 w-full h-[50vh] bg-checkerboard perspective-origin-bottom transform-gpu"
          style={{
            transform: "perspective(400px) rotateX(70deg) scale(2)",
            backgroundPosition: `0 ${progress * 8}px`,
          }}
        />
      </div>

      {/* Old Monitor Scanline & Vignette */}
      <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.2)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_50%,transparent_50%)] bg-size-[100%_4px] pointer-events-none z-40 opacity-30" />

      {/* --- UI LAYER --- */}
      <div className="relative z-30 flex-1 flex flex-col items-center justify-center p-4">
        {/* Main Application Window Frame */}
        <main
          className={`w-full max-w-5xl relative ${win95Bg} ${win95Border} shadow-[10px_10px_0px_rgba(0,0,0,0.2)]`}
        >
          {/* Window Title Bar */}
          <div className={titleBar}>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span className="tracking-widest text-lg">VAPOR_TYPER.EXE</span>
            </div>
            <div className="flex gap-1">
              <button
                className={`p-0.5 ${win95Bg} ${win95Border} active:${win95BorderInset}`}
              >
                <Minimize className="w-3 h-3 text-black" />
              </button>
              <button
                className={`p-0.5 ${win95Bg} ${win95Border} active:${win95BorderInset}`}
              >
                <Maximize className="w-3 h-3 text-black" />
              </button>
              <button
                className={`p-0.5 ${win95Bg} ${win95Border} active:${win95BorderInset} bg-[#ff7eb6]`}
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {/* MENU STATE */}
            {gameState === "menu" && (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <h1 className="text-6xl mb-6 font-bold text-transparent bg-clip-text bg-linear-to-r from-[#ff7eb6] via-[#a575ff] to-[#00d8ff] drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                  A E S T H E T I C<br />R A C E R
                </h1>

                <div className={`mb-8 p-4 ${win95BorderInset} bg-white`}>
                  <h2 className="text-gray-500 tracking-widest text-xl mb-4 border-b-2 border-[#c0c0c0] inline-block">
                    SELECT DIFFICULTY
                  </h2>
                  <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
                    {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map(
                      (level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={`relative px-6 py-3 ${
                            difficulty === level
                              ? win95BorderInset + " bg-gray-200"
                              : win95Border + " bg-[#c0c0c0]"
                          } active:${win95BorderInset} transition-all outline-none`}
                        >
                          <div className="text-2xl font-bold tracking-wider">
                            {DIFFICULTY_SETTINGS[level].name}
                          </div>
                          <div className="text-sm font-mono opacity-70">
                            {DIFFICULTY_SETTINGS[level].duration}s | x
                            {DIFFICULTY_SETTINGS[level].multiplier}
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                  <div
                    className={`p-3 ${win95BorderInset} bg-white flex items-center gap-2`}
                  >
                    <Trophy className="w-6 h-6 text-[#ff7eb6]" />
                    <div className="text-left">
                      <div className="text-xs text-gray-500 uppercase">
                        High Score
                      </div>
                      <div className="text-2xl font-bold">
                        {highScores[difficulty].toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className={`group relative px-12 py-4 ${win95Border} bg-[#c0c0c0] active:${win95BorderInset} text-3xl font-bold uppercase tracking-[0.2em] hover:bg-[#dcdcdc] outline-none`}
                >
                  <span className="flex items-center gap-4">
                    <Image
                      src="https://win98icons.alexmeub.com/icons/png/computer_explorer-4.png"
                      className="w-8 h-8"
                      alt="start"
                      width={32}
                      height={32}
                      unoptimized
                    />
                    START_SYSTEM
                  </span>
                </button>
              </div>
            )}

            {/* PLAYING STATE */}
            {gameState === "playing" && (
              <div className="relative">
                {/* Stats HUD - Looks like separate windows */}
                <div className="flex justify-between items-start mb-12">
                  <div
                    className={`${win95Border} p-2 ${win95Bg} flex items-center gap-3 text-3xl font-bold`}
                  >
                    <Zap className="fill-[#ff7eb6] text-[#ff7eb6]" />
                    {score}
                  </div>

                  {/* Combo Bar */}
                  <div
                    className={`${win95BorderInset} p-1 bg-white flex flex-col items-center`}
                  >
                    <div className="text-xs text-gray-500 tracking-widest uppercase mb-1">
                      Flow Streak
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-6 border-r border-gray-300 ${
                            i < combo % 10 || combo >= 10
                              ? "bg-linear-to-b from-[#ff7eb6] to-[#a575ff]"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm mt-1 font-bold">
                      x{1 + Math.floor(combo / 5) * 0.5} Mult
                    </div>
                  </div>

                  {/* Timer */}
                  <div
                    className={`${win95Border} p-2 ${win95Bg} text-4xl font-bold ${
                      timeLeft < 5
                        ? "text-[#ff0000] animate-pulse"
                        : "text-black"
                    }`}
                  >
                    TIME: {timeLeft}
                  </div>
                </div>

                {/* The Word Display Area */}
                <div
                  className={`${win95BorderInset} bg-white p-8 text-center mb-8 relative min-h-32 flex items-center justify-center overflow-hidden`}
                >
                  <div className="text-6xl md:text-8xl font-bold tracking-widest relative z-10">
                    {renderWord()}
                  </div>
                </div>

                {/* Input Area - Looks like a terminal input */}
                <div
                  className={`relative max-w-lg mx-auto ${win95BorderInset} bg-black p-1`}
                >
                  <div className="flex items-center">
                    <span className="text-[#00d8ff] mr-2">$</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={handleInput}
                      onBlur={() => inputRef.current?.focus()}
                      className="w-full bg-transparent text-[#00d8ff] text-3xl p-2 focus:outline-none font-bold uppercase"
                      autoFocus
                      spellCheck={false}
                    />
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600 mt-2 font-mono uppercase">
                  Awaiting Input...
                </div>
              </div>
            )}

            {/* FINISHED STATE */}
            {gameState === "finished" && (
              <div className="text-center animate-in zoom-in-95 duration-300">
                <Image
                  src="https://win98icons.alexmeub.com/icons/png/certificate_seal-0.png"
                  className="w-20 h-20 mx-auto mb-4"
                  alt="trophy"
                  width={80}
                  height={80}
                  unoptimized
                />

                <h2 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-linear-to-r from-[#ff7eb6] to-[#a575ff]">
                  RUN COMPLETE
                </h2>
                <p className="text-gray-600 tracking-widest mb-8 text-xl">
                  Log file saved.
                </p>

                <div
                  className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 ${win95BorderInset} bg-white p-4`}
                >
                  <div className="p-2">
                    <div className="text-xs text-gray-500 uppercase mb-1">
                      Final Score
                    </div>
                    <div className="text-3xl font-bold text-[#a575ff]">
                      {score}
                    </div>
                  </div>
                  <div className="p-2 border-l-2 border-gray-200">
                    <div className="text-xs text-gray-500 uppercase mb-1">
                      Max Combo
                    </div>
                    <div className="text-3xl font-bold">{maxCombo}</div>
                  </div>
                  <div className="p-2 border-l-2 border-gray-200">
                    <div className="text-xs text-gray-500 uppercase mb-1">
                      WPM
                    </div>
                    <div className="text-3xl font-bold">{wpm}</div>
                  </div>
                  <div className="p-2 border-l-2 border-gray-200">
                    <div className="text-xs text-gray-500 uppercase mb-1">
                      Accuracy
                    </div>
                    <div
                      className={`text-3xl font-bold ${
                        accuracy > 90 ? "text-[#00d8ff]" : "text-black"
                      }`}
                    >
                      {accuracy}%
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setGameState("menu")}
                  className={`flex items-center justify-center gap-2 w-full py-4 ${win95Border} bg-[#c0c0c0] active:${win95BorderInset} hover:bg-[#dcdcdc] text-xl font-bold uppercase tracking-widest transition-all outline-none`}
                >
                  <RefreshCcw className="w-6 h-6" /> REBOOT SYSTEM
                </button>
              </div>
            )}
          </div>{" "}
          {/* End window content p-6 */}
        </main>
      </div>

      {/* --- PROGRESS BAR BOTTOM --- */}
      <div className="absolute bottom-4 left-0 w-full px-8 z-30">
        <div className="max-w-3xl mx-auto ${win95Bg} ${win95Border} p-2 pb-4">
          <div className="flex justify-between text-sm font-bold mb-1 px-2 uppercase">
            <span>A:</span>
            <span>B: {Math.round(totalCharsTyped / 5)}kb transferred</span>
          </div>
          {/* Chunky Progress Bar Container */}
          <div
            className={`h-8 ${win95BorderInset} bg-white relative overflow-hidden`}
          >
            {/* Progress Fill - Gradient Bar */}
            <div
              className="absolute top-0 left-0 h-full bg-linear-to-r from-[#ff7eb6] to-[#00d8ff] transition-all duration-300 border-r-2 border-black"
              style={{ width: `${progress}%` }}
            />

            {/* Grid lines over progress bar */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.1)_2px,transparent_2px)] bg-size-[20px_100%] pointer-events-none z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
