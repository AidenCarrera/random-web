"use client";

import { useState, useEffect, useRef } from "react";
import { Info, Pause, Play } from "lucide-react";

// Planet Data
const PLANETS = [
  {
    id: "p1",
    name: "Vulcan",
    color: "#ff4500",
    size: 12, // px
    orbitSize: 140, // px diameter
    duration: 8, // seconds per orbit
    type: "Rocky",
    temp: "800 K",
    desc: "A small, scorched world orbiting dangerously close to the star.",
  },
  {
    id: "p2",
    name: "Terra",
    color: "#4169e1",
    size: 16,
    orbitSize: 220,
    duration: 12,
    type: "Habitable",
    temp: "288 K",
    desc: "A lush blue marble teeming with unknown lifeforms.",
  },
  {
    id: "p3",
    name: "Ares",
    color: "#cd5c5c",
    size: 14,
    orbitSize: 320,
    duration: 18,
    type: "Rocky",
    temp: "210 K",
    desc: "Dusty red surface containing iron oxide and ancient riverbeds.",
  },
  {
    id: "p4",
    name: "Zeus",
    color: "#c7a575",
    size: 40,
    orbitSize: 500,
    duration: 35,
    type: "Gas Giant",
    temp: "165 K",
    desc: "A colossal storm giant guarding the outer system.",
  },
  {
    id: "p5",
    name: "Cronus",
    color: "#e0cda7",
    size: 32,
    orbitSize: 700,
    duration: 60,
    type: "Gas Giant",
    temp: "135 K",
    desc: "Famous for its spectacular ring system composed of ice and rock.",
    hasRings: true,
  },
];

export default function SolarSystem() {
  const [paused, setPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<
    (typeof PLANETS)[0] | null
  >(null);

  // Refs for animation state
  const planetRotations = useRef<number[]>(PLANETS.map(() => 0));
  const planetElements = useRef<(HTMLDivElement | null)[]>([]);
  const lastTime = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const isInitialized = useRef(false);

  // Toggle pause
  const togglePause = () => setPaused(!paused);

  useEffect(() => {
    // 1. Initialize random positions only once on mount
    if (!isInitialized.current) {
      planetRotations.current = PLANETS.map(() => Math.random() * 360);

      // Apply initial positions immediately to avoid "pop"
      PLANETS.forEach((_, index) => {
        const element = planetElements.current[index];
        if (element) {
          element.style.transform = `rotate(${planetRotations.current[index]}deg)`;
        }
      });
      isInitialized.current = true;
    }

    // 2. Reset lastTime so we don't have a huge delta "jump" when unpausing
    lastTime.current = 0;

    const animate = (time: number) => {
      // If lastTime is 0, it means we just started/resumed.
      // Skip this frame's update to establish a baseline time.
      if (lastTime.current !== 0 && !paused) {
        const deltaTime = (time - lastTime.current) / 1000; // seconds

        PLANETS.forEach((planet, index) => {
          const element = planetElements.current[index];
          if (element) {
            // Calculate speed: 360 degrees / duration
            const speed = 360 / planet.duration;
            // Update rotation based on delta time and time scale
            planetRotations.current[index] += speed * timeScale * deltaTime;
            // Apply rotation
            element.style.transform = `rotate(${planetRotations.current[index]}deg)`;
          }
        });
      }

      lastTime.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [paused, timeScale]);

  return (
    <div className="min-h-screen text-white font-sans overflow-hidden flex items-center justify-center relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10101a_0%,#000000_100%)] -z-20" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-60 -z-10" />

      {/* UI: Header */}
      <div className="absolute top-8 left-8 z-50 pointer-events-none">
        <h1 className="text-4xl font-light tracking-[0.25em] uppercase text-white/90">
          Helios_System
        </h1>
        <p className="text-xs text-white/40 mt-2 font-mono flex items-center gap-2">
          STATUS: {paused ? "PAUSED" : "ACTIVE"}
          <span
            className={`w-2 h-2 rounded-full ${
              paused ? "bg-red-500" : "bg-green-500 animate-pulse"
            }`}
          />
        </p>
      </div>

      {/* UI: Time Scale Slider */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 group bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
        <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest group-hover:text-white/80 transition-colors">
          Time Scale: {timeScale.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={timeScale}
          onChange={(e) => setTimeScale(parseFloat(e.target.value))}
          className="w-48 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:scale-125"
        />
      </div>

      {/* UI: Controls */}
      <button
        onClick={togglePause}
        className="absolute bottom-8 right-8 z-50 p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all backdrop-blur-sm group"
      >
        {paused ? (
          <Play className="w-6 h-6 text-white/70 group-hover:text-white" />
        ) : (
          <Pause className="w-6 h-6 text-white/70 group-hover:text-white" />
        )}
      </button>

      {/* System Container - Perfectly Centered */}
      <div className="relative w-[800px] h-[800px] flex items-center justify-center">
        {/* The Sun */}
        <div className="absolute w-24 h-24 bg-[#fdb813] rounded-full shadow-[0_0_100px_#fdb813,0_0_40px_rgba(253,184,19,0.5)] z-20 flex items-center justify-center">
          <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8),transparent)] rounded-full opacity-50" />
        </div>

        {/* Orbits and Planets */}
        {PLANETS.map((planet, index) => (
          <div
            key={planet.id}
            ref={(el) => {
              planetElements.current[index] = el;
            }}
            className="absolute rounded-full border border-white/10 flex items-center justify-center pointer-events-none"
            style={{
              width: `${planet.orbitSize}px`,
              height: `${planet.orbitSize}px`,
              // FIX: Removed 'transform' referencing ref.current during render.
              // Initial position is now handled in useEffect, avoiding the lint error.
            }}
          >
            {/* Planet Container - Positioned at top center of the ring */}
            <div
              className="absolute left-1/2 flex items-center justify-center cursor-pointer group pointer-events-auto"
              style={{
                // Resetting transformation to correctly position on the ring's edge
                transform: `translate(-50%, -50%)`,
                top: 0,
                width: `${planet.size * 2}px`, // Larger hit area
                height: `${planet.size * 2}px`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPlanet(planet);
              }}
            >
              {/* The Planet Visual */}
              <div
                className="rounded-full shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.5)] relative transition-transform duration-300 group-hover:scale-125"
                style={{
                  width: `${planet.size}px`,
                  height: `${planet.size}px`,
                  backgroundColor: planet.color,
                  boxShadow: `0 0 10px ${planet.color}40`,
                }}
              >
                {/* Rings (if applicable) */}
                {planet.hasRings && (
                  <div
                    className="absolute top-1/2 left-1/2 rounded-full border-[3px] border-[#e0cda7]/40"
                    style={{
                      width: "160%",
                      height: "160%",
                      transform: "translate(-50%, -50%) rotateX(70deg)",
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card Overlay */}
      {selectedPlanet && (
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-80 bg-black/80 backdrop-blur-xl border border-white/10 p-6 z-50 text-left shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl animate-in slide-in-from-right-10 fade-in duration-300">
          <button
            onClick={() => {
              setSelectedPlanet(null);
            }}
            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
          >
            CLOSE
          </button>

          <div
            className="w-16 h-16 rounded-full mb-6 shadow-2xl"
            style={{ backgroundColor: selectedPlanet.color }}
          />

          <h2 className="text-3xl font-light uppercase tracking-widest mb-1 text-white">
            {selectedPlanet.name}
          </h2>
          <div className="text-xs font-mono text-white/40 mb-6 uppercase tracking-wider">
            {selectedPlanet.type} Planet
          </div>

          <div className="space-y-4 font-mono text-sm text-white/70">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/30">AVG TEMP</span>
              <span>{selectedPlanet.temp}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/30">ORBIT</span>
              <span>{selectedPlanet.duration}s</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/30">SIZE</span>
              <span>{selectedPlanet.size}km x 10³</span>
            </div>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-white/50 border-l-2 border-white/10 pl-3">
            {selectedPlanet.desc}
          </p>

          <div className="mt-6 flex gap-2 items-center text-[10px] text-white/20 uppercase tracking-widest justify-center">
            <Info className="w-3 h-3" />
            Classified Data // Level 5
          </div>
        </div>
      )}
    </div>
  );
}
