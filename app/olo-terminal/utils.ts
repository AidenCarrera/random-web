
export const FILESYSTEM = {
  "~": {
    type: "dir",
    children: {
      "projects": {
        type: "dir",
        children: {
          "secret_project.txt": { type: "file", content: "Project: CHAOS\nStatus: [REDACTED]\nNext Step: Run 'matrix' command." },
          "notes.txt": { type: "file", content: "To-do:\n1. Become employed\n2. Get a cat\n3. Learn Rust" },
        }
      },
      "readme.txt": { type: "file", content: "Welcome to OloOS v1.0\nUse 'help' to see available commands." },
      "config": {
        type: "dir",
        children: {
          "settings.json": { type: "file", content: "{ \"theme\": \"olo_green\", \"matrix_mode\": true }" }
        }
      }
    }
  }
};

export const ASCII_ART = {
  cow: `
   ^__^
   (oo)\\_______
   (__)\\       )\\/\\
       ||----w |
       ||     ||
  `,
  ghost: `
   .-.
  (o o) (scary)
  | O \\
   \\   \\
    \`~~~'
  `,
};

export const SYSTEM_INFO = {
  os: "OloOS v1.0.4 x86_64",
  host: "Browser Simulation",
  kernel: "5.15.0-fake-generic",
  uptime: "Forever.",
  packages: "idk (npm)",
  shell: "Olo-Shell v1.0",
  resolution: "8192x10267 (Tall-Format GigaResolution)",
  terminal: "OloTerm",
  cpu: 'AMD Ryzen-Core Threadripper i9-14999KX V-Cache "Raptor Lake" Extreme Edition',
  gpu: "CSS-4D Accelerated Ray Tracing Quantum-Entangled Display",
  ascii: `
       /\\
      /  \\
     / /\\ \\
    / /  \\ \\
   / /    \\ \\
  / /      \\ \\
 / /        \\ \\
/_/          \\_\\
  `
};

export const JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
  "I would tell you a UDP joke, but you might not get it.",
  "There are 2 types of people in the world: those who understand binary, and those who don't.",
  "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
  "Why do Java programmers wear glasses? Because they don't C#.",
  "In order to understand recursion, you must first understand recursion.",
  "Why did the developer go broke? Because he used up all his cache."
];
