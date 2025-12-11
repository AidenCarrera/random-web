"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal } from "lucide-react";

export default function RetroTerminal() {
  const [history, setHistory] = useState<string[]>([
    "Welcome to RETRO-TERM v1.0",
    "Type 'help' for available commands.",
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history]);

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    const args = cmd.trim().split(" ").slice(1).join(" ");
    let response = "";

    switch (cleanCmd.split(" ")[0]) {
      case "help":
        response =
          "Available commands: help, date, clear, echo [text], whoami, exit";
        break;
      case "date":
        response = new Date().toString();
        break;
      case "clear":
        setHistory([]);
        return;
      case "echo":
        response = args || "";
        break;
      case "whoami":
        response = "guest@random-web";
        break;
      case "exit":
        response = "There is no escape.";
        break;
      default:
        response = `Command not found: ${cleanCmd}`;
    }

    setHistory((prev) => [...prev, `> ${cmd}`, response]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 font-mono text-green-500 selection:bg-green-900 selection:text-white">
      <div className="mx-auto max-w-4xl border-2 border-green-800 bg-black p-6 shadow-[0_0_20px_rgba(0,255,0,0.2)] rounded-lg">
        <div className="mb-4 flex items-center gap-2 border-b border-green-900 pb-2">
          <Terminal className="h-6 w-6" />
          <span className="text-xl font-bold tracking-wider">
            TERMINAL_RELAY
          </span>
        </div>

        <div className="h-[70vh] overflow-y-auto space-y-1 mb-4 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-black pr-2">
          {history.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap wrap-break-word">
              {line}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="flex items-center gap-2">
          <span className="animate-pulse">{">"}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-green-500 placeholder-green-900"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
