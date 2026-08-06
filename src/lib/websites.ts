export type WebsiteEntry = {
  path: string;
  lastModified: string;
  title: string;
  blurb: string;
  accent: string;
  metadata: {
    title: string;
    description: string;
  };
};

export const WEBSITES: WebsiteEntry[] = [
  {
    path: "/algo-race",
    lastModified: "2026-07-28",
    title: "Algo Race",
    blurb: "Algorithms race to the finish.",
    accent: "from-cyan-200/80 via-sky-300/70 to-blue-500/70",
    metadata: {
      title: "Algo Race - Sorting Algorithm Visualizer",
      description:
        "Watch sorting algorithms compete side by side while comparing speed and overall efficiency.",
    },
  },
  {
    path: "/arcana-tarot",
    lastModified: "2026-07-14",
    title: "Arcana Tarot",
    blurb: "Draw the cards.",
    accent: "from-amber-300/80 via-orange-400/70 to-rose-500/75",
    metadata: {
      title: "Arcana Tarot - Virtual Tarot Readings",
      description:
        "Shuffle the deck, draw tarot cards, and explore detailed meanings with a modern interactive tarot experience.",
    },
  },
  {
    path: "/ascii-vision",
    lastModified: "2026-07-28",
    title: "ASCII Vision",
    blurb: "Video in text.",
    accent: "from-lime-300/80 via-emerald-400/70 to-teal-500/70",
    metadata: {
      title: "ASCII Vision - Image to ASCII Art",
      description:
        "Upload any image and instantly transform it into detailed ASCII art. Adjust characters, colors, contrast, and resolution to create your own text-based artwork.",
    },
  },
  {
    path: "/beat-maker",
    lastModified: "2026-07-15",
    title: "Beat Maker",
    blurb: "A rhythm sequencer.",
    accent: "from-fuchsia-300/75 via-pink-400/70 to-rose-500/70",
    metadata: {
      title: "Beat Maker - Browser Beat Sequencer",
      description:
        "Build beats with an intuitive step sequencer, swappable drum sounds, an 808 bass editor, and mixer controls. No download required.",
    },
  },
  {
    path: "/boids-simulator",
    lastModified: "2026-07-29",
    title: "Boids Simulator",
    blurb: "Emergent boid movement.",
    accent: "from-lime-200/80 via-green-300/70 to-emerald-500/70",
    metadata: {
      title: "Boids Simulator - Interactive Flocking Lab",
      description:
        "Shape a living field of boids with your pointer, then tune vision, movement accuracy, forces, speed, drag, and population in real time.",
    },
  },
  {
    path: "/click-speed-test",
    lastModified: "2026-07-29",
    title: "Click Speed Test",
    blurb: "A clicks per second test.",
    accent: "from-yellow-200/80 via-orange-300/70 to-red-400/70",
    metadata: {
      title: "Click Speed Test - Measure CPS",
      description:
        "How fast can you click? Test your CPS (clicks per second) with different time limits, track your scores, and improve your clicking speed.",
    },
  },
  {
    path: "/dont-click-me",
    lastModified: "2026-07-15",
    title: "Don't Click Me",
    blurb: "Do not click.",
    accent: "from-red-300/80 via-rose-400/70 to-orange-500/70",
    metadata: {
      title: "Don't Click Me - Interactive Button Game",
      description:
        "An interactive game where you are told not to click the button. Can you resist the temptation? See what happens if you click!",
    },
  },
  {
    path: "/emoji-rain",
    lastModified: "2026-07-28",
    title: "Emoji Rain",
    blurb: "Falling icons.",
    accent: "from-sky-200/80 via-cyan-300/70 to-blue-500/70",
    metadata: {
      title: "Emoji Rain - Falling Emoji Animation",
      description:
        "Fill your screen with falling emojis. Mix categories, adjust the look and behavior, and create colorful animated emoji showers.",
    },
  },
  {
    path: "/encoded-message",
    lastModified: "2026-07-15",
    title: "Encoded Message",
    blurb: "Decode the message.",
    accent: "from-blue-200/80 via-indigo-300/70 to-slate-500/70",
    metadata: {
      title: "Encoded Message - Decrypt the Story",
      description:
        "Hover over the encrypted transmission to decrypt the message and unveil the secret story.",
    },
  },
  {
    path: "/falling-sand",
    lastModified: "2026-07-29",
    title: "Falling Sand",
    blurb: "A reactive particle sandbox.",
    accent: "from-amber-200/80 via-orange-300/70 to-red-500/70",
    metadata: {
      title: "Falling Sand - Interactive Particle Sandbox",
      description:
        "Draw with sand, water, fire, lava, plants, acid, and reactive materials in a real-time physics sandbox, then save, load, export, and share your world.",
    },
  },
  {
    path: "/focus-timer",
    lastModified: "2026-07-15",
    title: "Focus Timer",
    blurb: "A countdown for deep work.",
    accent: "from-emerald-200/80 via-green-300/70 to-teal-500/70",
    metadata: {
      title: "Focus Timer - Pomodoro Timer",
      description:
        "Boost your productivity with a clean, customizable Pomodoro focus timer. Designed to help you stay on task and manage your study/work sessions.",
    },
  },
  {
    path: "/fluid-simulation",
    lastModified: "2026-07-28",
    title: "Fluid Simulation",
    blurb: "Stir a field of glowing particles.",
    accent: "from-fuchsia-300/80 via-violet-400/70 to-cyan-400/75",
    metadata: {
      title: "Fluid Simulation - Interactive WebGL 2 Particles",
      description:
        "Swirl through a colorful WebGL 2 fluid simulation, shape glowing particles with your pointer, and save your favorite moment.",
    },
  },
  {
    path: "/fractal-explorer",
    lastModified: "2026-07-28",
    title: "Fractal Explorer",
    blurb: "Infinite geometric patterns.",
    accent: "from-violet-300/80 via-indigo-400/70 to-sky-500/70",
    metadata: {
      title: "Fractal Explorer - Mandelbrot Viewer",
      description:
        "Explore the Mandelbrot set with smooth zooming, customizable colors, and an optional audio-reactive mode that brings fractals to life.",
    },
  },
  {
    path: "/gravity-box",
    lastModified: "2026-07-16",
    title: "Gravity Box",
    blurb: "A physics sandbox.",
    accent: "from-stone-200/80 via-slate-300/70 to-zinc-500/70",
    metadata: {
      title: "Gravity Box - Physics Sandbox",
      description:
        "Experiment with gravity, collisions, and object physics in a playful sandbox where every setting changes the simulation.",
    },
  },
  {
    path: "/hypno-spiral",
    lastModified: "2026-07-16",
    title: "Hypno Spiral",
    blurb: "An optical illusion.",
    accent: "from-purple-300/80 via-fuchsia-400/70 to-indigo-500/70",
    metadata: {
      title: "Hypno Spiral - Interactive Hypnotic Spiral",
      description:
        "Move your mouse to shape a mesmerizing hypnotic spiral as it shifts and evolves in real time, creating endlessly unique visual patterns.",
    },
  },
  {
    path: "/lava-lamp",
    lastModified: "2026-07-16",
    title: "Lava Lamp",
    blurb: "A simulated lava lamp.",
    accent: "from-amber-200/80 via-orange-300/70 to-red-500/70",
    metadata: {
      title: "Lava Lamp - Interactive Lava Simulation",
      description:
        "Relax with a virtual lava lamp. Customize the colors of the bubbles and liquid to create your own calming combinations.",
    },
  },
  {
    path: "/lofi-pixel-study",
    lastModified: "2026-07-28",
    title: "Lofi Pixel Study",
    blurb: "Music and pixels.",
    accent: "from-cyan-200/80 via-blue-300/70 to-indigo-500/70",
    metadata: {
      title: "Lofi Pixel Study",
      description:
        "Relax, study, or work in a cozy pixel art room with dynamic lofi music tracks and customizable backgrounds.",
    },
  },
  {
    path: "/magic-8-ball",
    lastModified: "2026-07-15",
    title: "Magic 8 Ball",
    blurb: "Ask a question.",
    accent: "from-slate-200/80 via-slate-400/70 to-indigo-500/70",
    metadata: {
      title: "Magic 8 Ball - Decision Maker",
      description:
        "Ask a question, shake the Magic 8 Ball, and reveal a random answer. A simple browser version of the fortune-telling toy.",
    },
  },
  {
    path: "/mandala-maker",
    lastModified: "2026-07-16",
    title: "Mandala Maker",
    blurb: "Symmetrical drawing.",
    accent: "from-teal-200/80 via-cyan-300/70 to-emerald-500/70",
    metadata: {
      title: "Mandala Maker - Symmetrical Drawing Tool",
      description:
        "Draw beautiful radial artwork with brushes and colors, then export your finished mandalas as images.",
    },
  },
  {
    path: "/matrix-rain",
    lastModified: "2026-07-15",
    title: "Matrix Rain",
    blurb: "Falling code.",
    accent: "from-green-200/80 via-lime-400/70 to-emerald-600/70",
    metadata: {
      title: "Matrix Rain - Hacker Terminal",
      description:
        "Type like you're in a hacker movie as code appears across the screen with a Matrix-inspired digital rain effect in the background.",
    },
  },
  {
    path: "/mindful-breathe",
    lastModified: "2026-07-15",
    title: "Mindful Breathe",
    blurb: "A breathing guide.",
    accent: "from-blue-200/80 via-sky-300/70 to-cyan-500/70",
    metadata: {
      title: "Mindful Breathe - Breathing Visualizer",
      description:
        "Follow a calming breathing cycle with a gently pulsing orb, relaxing ambient music, and customizable timing to help you slow down and unwind.",
    },
  },
  {
    path: "/morse-code",
    lastModified: "2026-07-15",
    title: "Morse Code",
    blurb: "Translate taps.",
    accent: "from-amber-200/80 via-yellow-300/70 to-orange-500/70",
    metadata: {
      title: "Morse Code - Translate and Encode",
      description:
        "Translate text to Morse code or tap your own messages with an interactive key. Practice, listen to the tones, and learn with a built-in Morse code cheat sheet.",
    },
  },
  {
    path: "/olo-terminal",
    lastModified: "2026-07-15",
    title: "Olo Terminal",
    blurb: "A command line interface.",
    accent: "from-zinc-200/80 via-slate-400/70 to-teal-500/70",
    metadata: {
      title: "Olo Terminal - Web Command Line",
      description:
        "Explore a Linux-inspired browser terminal filled with playful interactions, hidden surprises, and entertaining utilities waiting to be discovered.",
    },
  },
  {
    path: "/pad-synth",
    lastModified: "2026-07-16",
    title: "Pad Synth",
    blurb: "An atmospheric synthesizer.",
    accent: "from-indigo-200/80 via-violet-300/70 to-fuchsia-500/70",
    metadata: {
      title: "Pad Synth - Browser Synth",
      description:
        "Play notes across major, minor, pentatonic, and blues scales with selectable waveforms, volume, reverb, and echo controls in a soft tactile interface.",
    },
  },
  {
    path: "/particle-collider",
    lastModified: "2026-07-15",
    title: "Particle Collider",
    blurb: "Simulating collisions.",
    accent: "from-orange-200/80 via-amber-300/70 to-pink-500/70",
    metadata: {
      title: "Particle Collider - Attract & Repel Particles",
      description:
        "Shape a glowing particle field with your mouse. Switch between attraction and repulsion, then tune force strength and particle count in real time.",
    },
  },
  {
    path: "/party-mode",
    lastModified: "2026-07-15",
    title: "Party Mode",
    blurb: "Flashing lights and colors.",
    accent: "from-pink-200/80 via-fuchsia-400/70 to-yellow-400/70",
    metadata: {
      title: "Party Mode - Celebration Button",
      description:
        "Trigger a colorful confetti celebration with, floating party emojis, a dancing headline, and a colorful animated backdrop.",
    },
  },
  {
    path: "/pixel-art",
    lastModified: "2026-07-29",
    title: "Pixel Art",
    blurb: "A small canvas.",
    accent: "from-rose-200/80 via-orange-300/70 to-amber-500/70",
    metadata: {
      title: "Pixel Art - Simple Sprite Maker",
      description:
        "Draw pixel art on a resizable grid with a 32-color palette, pencil, eraser, fill, and eyedropper tools, undo/redo, and PNG export.",
    },
  },
  {
    path: "/polyrhythm-visualizer",
    lastModified: "2026-07-29",
    title: "Polyrhythm Visualizer",
    blurb: "Overlapping time signatures.",
    accent: "from-purple-200/80 via-indigo-300/70 to-cyan-500/70",
    metadata: {
      title: "Polyrhythm Visualizer - Layered Rhythms",
      description:
        "Hear layered rhythms at adjustable tempo while switching between circle, timeline, bloom, and 3D visualizations with playback controls.",
    },
  },
  {
    path: "/repo-visualizer",
    lastModified: "2026-07-16",
    title: "Repo Visualizer",
    blurb: "Visualize repository structure.",
    accent: "from-zinc-300/80 via-slate-400/70 to-neutral-500/70",
    metadata: {
      title: "Repo Visualizer - GitHub History Visualizer",
      description:
        "Load a GitHub repository, local git log, or demo history and watch commits animate through a file-tree graph with authors, change statuses, stats, and playback controls.",
    },
  },
  {
    path: "/solar-system",
    lastModified: "2026-07-16",
    title: "Solar System",
    blurb: "Orbital mechanics.",
    accent: "from-sky-200/80 via-indigo-300/70 to-violet-500/70",
    metadata: {
      title: "Solar System - Custom Planet Sandbox",
      description:
        "Build a custom solar system with textured planets and adjustable sizes, orbits, speeds, moons, rings, and starfield themes, then export a PNG snapshot.",
    },
  },
  {
    path: "/sticky-notes",
    lastModified: "2026-07-15",
    title: "Sticky Notes",
    blurb: "Pin your thoughts.",
    accent: "from-yellow-100/90 via-amber-200/80 to-orange-300/80",
    metadata: {
      title: "Sticky Notes - Draggable Note Board",
      description:
        "Create and arrange colorful sticky notes on a paper-like board with double-click or quick add, autosave, delete/reset controls, and Markdown export.",
    },
  },
  {
    path: "/style-pet",
    lastModified: "2026-07-16",
    title: "Style Pet",
    blurb: "Dress a digital pet.",
    accent: "from-pink-200/80 via-rose-300/70 to-purple-400/70",
    metadata: {
      title: "Style Pet - Virtual Pet Simulator",
      description:
        "Care for a handheld-style virtual pet by feeding, petting, cleaning, and managing sleep, then customize its skin, hats, and accessories as it grows.",
    },
  },
  {
    path: "/submit-to-void",
    lastModified: "2026-07-28",
    title: "Submit to Void",
    blurb: "Throw text away.",
    accent: "from-slate-300/80 via-zinc-500/70 to-black/70",
    metadata: {
      title: "Submit to Void - Black Hole Message Shredder",
      description:
        "Type a short message and watch every character shred into a black hole, surrounded by stars, and optional GIF export.",
    },
  },
  {
    path: "/text-converter",
    lastModified: "2026-07-15",
    title: "Text Converter",
    blurb: "Convert text formats.",
    accent: "from-teal-200/80 via-emerald-300/70 to-cyan-500/70",
    metadata: {
      title: "Text Converter - Create secret messages",
      description:
        "Convert text between common encodings and explore classic ciphers. Designed for learning and experimentation.",
    },
  },
  {
    path: "/typing-racer",
    lastModified: "2026-07-15",
    title: "Typing Racer",
    blurb: "A typing speed test.",
    accent: "from-orange-200/80 via-red-300/70 to-pink-500/70",
    metadata: {
      title: "Typing Racer - Typing WPM Race",
      description:
        "Race CPU opponents through neon typing passages in Rookie, Pro, or Cyber mode while tracking live WPM, accuracy, time, rank, and your high score.",
    },
  },
  {
    path: "/zen-garden",
    lastModified: "2026-07-28",
    title: "Zen Garden",
    blurb: "Grow your garden.",
    accent: "from-stone-100/90 via-emerald-200/80 to-teal-400/70",
    metadata: {
      title: "Zen Garden - Landscape Sandbox",
      description:
        "Design a calming digital sandscape with plants and decorations, water, multiple sand themes, and image or layout export.",
    },
  },
];

export const RANDOM_WEBSITE_PATHS = WEBSITES.map((website) => website.path);

// Prefers unseen websites so discovery never repeats until everything is found.
export function pickRandomWebsitePath(visitedPaths: Iterable<string> = []) {
  const visited = new Set(visitedPaths);
  const unvisited = RANDOM_WEBSITE_PATHS.filter((path) => !visited.has(path));
  const candidates = unvisited.length > 0 ? unvisited : RANDOM_WEBSITE_PATHS;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

export const SITE_LAST_MODIFIED = "2026-07-26";
