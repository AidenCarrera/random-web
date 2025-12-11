"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal, Maximize2, X, Minus } from "lucide-react";
import { FILESYSTEM, ASCII_ART, JOKES, SYSTEM_INFO } from "./utils";

type FileSystemNode = {
  type: "file" | "dir";
  children?: Record<string, FileSystemNode>;
  content?: string;
};

export default function OloTerminal() {
  const [history, setHistory] = useState<string[]>([
    "Welcome to Olo-Shell v2.0",
    "Initializing OloOS environment...",
    "System loaded.",
    "Type 'help' for available commands.",
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState<string>("~");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Matrix Rain State */
  const [raindrops, setRaindrops] = useState<
    { left: string; duration: string; delay: string; char: string }[]
  >([]);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history]);

  // Command History Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(input);
      setCommandHistory((prev) => [...prev, input]);
      setHistoryIndex(-1);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
        if (historyIndex === commandHistory.length - 1) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const getDir = (path: string): FileSystemNode | null => {
    // Cast FILESYSTEM to avoid strict type mismatch with string inference
    const fsData = FILESYSTEM as unknown as Record<string, FileSystemNode>;

    if (path === "~") return fsData["~"];
    // Simplified path resolution for now (only supports relative paths from ~ or absolute ~)
    const parts = path.replace("~/", "").split("/").filter(Boolean);
    let current: FileSystemNode = fsData["~"];

    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    return current;
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const parts = trimmed.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    let output: string | string[] = "";

    switch (command) {
      case "help":
        output = [
          "Available commands:",
          "  help          - Show this help message",
          "  clear         - Clear the screen",
          "  ls            - List directory contents",
          "  cd [dir]      - Change directory",
          "  cat [file]    - Read file content",
          "  whoami        - Display current user",
          "  date          - Show current date/time",
          "  echo [text]   - Print text",
          "  fetch         - System information (neofetch style)",
          "  matrix        - Toggle The Matrix",
          "  joke          - Tell a random joke",
          "  cowsay [text] - Make a cow say something",
          "  ghostsay [text] - Make a ghost say something",
        ].join("\n");
        break;
      case "clear":
        setHistory([]);
        return;
      case "date":
        output = new Date().toLocaleString();
        break;
      case "whoami":
        output = "user@olo-term";
        break;
      case "echo":
        output = args.join(" ");
        break;
      case "ls": {
        const currentDir = getDir(cwd);
        if (currentDir && currentDir.type === "dir" && currentDir.children) {
          output = Object.keys(currentDir.children)
            .map((name) => {
              const isDir = currentDir.children![name].type === "dir";
              return isDir ? `${name}/` : name;
            })
            .join("  ");
        } else {
          output = "";
        }
        break;
      }
      case "cd": {
        const target = args[0];
        if (!target || target === "~") {
          setCwd("~");
        } else if (target === "..") {
          const parts = cwd.split("/");
          if (parts.length > 1) {
            // If we are at ~ (length 1 after split likely gives ["~"]), we stay.
            // But valid path is like ~, ~/projects.
            // cwd is initialized as "~". split is ["~"]. length is 1.
            // If cwd is "~/projects", split is ["~", "projects"]. length 2.

            if (cwd === "~") {
              // Already at home, do nothing or show info?
              // User says: "If the current directory (cwd) is already just "~", do not change the state"
              // My logic parts.length > 1 handles this for "~/projects", but for "~":
              // "~".split("/") -> ["~"]. Length is 1. So it won't enter here.
              // So actually my existing logic might be fine, but I'll make it explicit as requested.
            } else {
              parts.pop();
              setCwd(
                parts.length === 1 && parts[0] === "" ? "~" : parts.join("/")
              );
            }
          }
          // WAIT, let's look at the original code:
          // const parts = cwd.split("/");
          // if (parts.length > 1) {
          //   parts.pop();
          //   setCwd(parts.length === 0 ? "~" : parts.join("/"));
          // }
          // If cwd is "~", split is ["~"]. length is 1. It does NOT enter the block.
          // So it already doesn't go up.
          // BUT, user asked to "Modify the logic...". Maybe they encountered a case where it did?
          // Or maybe they want to ensure it works for "~".
          // Let's rewrite it to be clearer and robust.

          if (cwd !== "~") {
            const newParts = cwd.split("/");
            newParts.pop();
            setCwd(newParts.length === 0 ? "~" : newParts.join("/"));
          }
        } else {
          // Check if directory exists locally
          const currentDir = getDir(cwd);
          if (
            currentDir &&
            currentDir.children &&
            currentDir.children[target] &&
            currentDir.children[target].type === "dir"
          ) {
            setCwd(cwd === "~" ? `~/${target}` : `${cwd}/${target}`);
          } else {
            output = `cd: no such file or directory: ${target}`;
          }
        }
        break;
      }
      case "cat": {
        const target = args[0];
        const currentDir = getDir(cwd);
        if (
          target &&
          currentDir &&
          currentDir.children &&
          currentDir.children[target]
        ) {
          const node = currentDir.children[target];
          if (node.type === "file") {
            output = node.content || "";
          } else {
            output = `cat: ${target}: Is a directory`;
          }
        } else {
          output = `cat: ${target}: No such file or directory`;
        }
        break;
      }
      case "matrix":
        const nextMode = !isMatrixMode;
        setIsMatrixMode(nextMode);
        if (nextMode) {
          const drops = Array.from({ length: 50 }).map((_, i) => ({
            left: `${i * 2}%`,
            duration: `${Math.random() * 2 + 1}s`,
            delay: `${Math.random() * 2}s`,
            char: String.fromCharCode(0x30a0 + Math.random() * 96),
          }));
          setRaindrops(drops);
        } else {
          setRaindrops([]);
        }
        output = nextMode
          ? "Deactivating Matrix protocol..."
          : "Wake up, Neo...";
        break;
      case "fetch":
      case "neofetch": {
        const asciiLines = SYSTEM_INFO.ascii
          .split("\n")
          .filter((l) => l.trim() !== "");
        const info = [
          `OS: ${SYSTEM_INFO.os}`,
          `Host: ${SYSTEM_INFO.host}`,
          `Kernel: ${SYSTEM_INFO.kernel}`,
          `Uptime: ${SYSTEM_INFO.uptime}`,
          `Packages: ${SYSTEM_INFO.packages}`,
          `Shell: ${SYSTEM_INFO.shell}`,
          `Resolution: ${SYSTEM_INFO.resolution}`,
          `Terminal: ${SYSTEM_INFO.terminal}`,
          `CPU: ${SYSTEM_INFO.cpu}`,
          `GPU: ${SYSTEM_INFO.gpu}`,
        ];

        // Format: ASCII line + padding + Info line
        const maxAsciiHeight = asciiLines.length;
        const maxInfoHeight = info.length;
        const maxHeight = Math.max(maxAsciiHeight, maxInfoHeight);

        const lines = [];
        for (let i = 0; i < maxHeight; i++) {
          const asciiLine = asciiLines[i] || " ".repeat(20); // Fallback width approx
          const infoLine = info[i] || "";
          // Adjust padding to align info
          // The original art is roughly 20 chars wide.
          // I'll pad the ascii line to a fixed width, e.g., 25 chars.
          const paddedAscii = asciiLine.padEnd(25, " ");
          lines.push(`${paddedAscii} ${infoLine}`);
        }
        output = lines.join("\n");
        break;
      }
      case "ghostsay":
        const ghostText = args.join(" ") || "boo!";
        output =
          `
    ${"_".repeat(ghostText.length + 2)}
   ( ${ghostText} )
    ${"-".repeat(ghostText.length + 2)}
         ` + ASCII_ART.ghost;
        break;
      case "joke":
        output = JOKES[Math.floor(Math.random() * JOKES.length)];
        break;
      case "cowsay":
        const text = args.join(" ") || "Moo";
        output =
          `
    ${"_".repeat(text.length + 2)}
   < ${text} >
    ${"-".repeat(text.length + 2)}
         ` + ASCII_ART.cow;
        break;
      default:
        output = `Command not found: ${command}`;
    }

    if (output) {
      setHistory((prev) => [
        ...prev,
        `${cwd} $ ${trimmed}`,
        ...(Array.isArray(output) ? output : [output]),
      ]);
    }
  };

  return (
    <div
      className={`min-h-screen p-4 font-mono transition-colors duration-500 ${
        isMatrixMode ? "bg-black text-[#00FF00]" : "bg-[#1a1b26] text-[#a9b1d6]"
      }`}
    >
      {/* Matrix Background Overlay */}
      {isMatrixMode && (
        <div className="fixed inset-0 pointer-events-none opacity-20 z-0 overflow-hidden font-matrix">
          {raindrops.map((drop, i) => (
            <div
              key={i}
              className="absolute -top-full text-2xl animate-matrix-drop"
              style={{
                left: drop.left,
                animationDuration: drop.duration,
                animationDelay: drop.delay,
              }}
            >
              {drop.char}
            </div>
          ))}
        </div>
      )}

      <div
        className={`relative z-10 mx-auto max-w-5xl border-2 ${
          isMatrixMode
            ? "border-[#00FF00] bg-black shadow-[0_0_30px_#00FF00]"
            : "border-[#414868] bg-[#1a1b26] shadow-2xl"
        } p-6 rounded-lg min-h-[80vh] flex flex-col`}
      >
        {/* Header / Window Controls */}
        <div
          className={`mb-4 flex items-center justify-between border-b ${
            isMatrixMode ? "border-[#00FF00]" : "border-[#414868]"
          } pb-2`}
        >
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            <span className="text-sm font-bold tracking-wider">
              {isMatrixMode ? "MATRIX_RELAY_V9" : "OLO_SHELL_V2.0"}
            </span>
          </div>
          <div className="flex gap-2">
            <Minus className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" />
            <Maximize2 className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" />
            <X className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" />
          </div>
        </div>

        {/* Terminal Output */}
        <div
          className="flex-1 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-current scrollbar-track-transparent pr-2 font-bold"
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((line, i) => (
            <div
              key={i}
              className="whitespace-pre-wrap break-all mb-1 leading-relaxed"
            >
              {line}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2 text-lg">
          <span
            className={`${isMatrixMode ? "text-[#00FF00]" : "text-[#7aa2f7]"}`}
          >
            {cwd} $
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 bg-transparent border-none outline-none ${
              isMatrixMode
                ? "text-[#00FF00] placeholder-[#003300]"
                : "text-[#c0caf5] placeholder-[#565f89]"
            }`}
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>

      {/* Global Styles for Matrix Animation */}
      <style jsx global>{`
        @keyframes matrix-drop {
          0% {
            top: -100%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        .animate-matrix-drop {
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          position: absolute;
          white-space: nowrap;
          writing-mode: vertical-rl;
        }
      `}</style>
    </div>
  );
}
