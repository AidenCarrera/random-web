"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function MinimalMono() {
  const [duration, setDuration] = useState(25 * 60);
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("25");
  const endTimeRef = useRef<number | null>(null);
  const requestIdRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFrameTimeRef = useRef<number>(0);

  useEffect(() => {
    const tick = (frameTime: number) => {
      if (!endTimeRef.current || !containerRef.current) return;

      // Cap at ~120fps (8.33ms per frame)
      if (frameTime - lastFrameTimeRef.current < 8) {
        requestIdRef.current = requestAnimationFrame(tick);
        return;
      }
      lastFrameTimeRef.current = frameTime;

      const now = Date.now();
      const remaining = Math.max(0, (endTimeRef.current - now) / 1000);

      // Update DOM directly for smooth background (High Frequency)
      const elapsed = duration - remaining;
      const progress = duration > 0 ? (elapsed / duration) * 360 : 0;
      const showGradient = progress > 0.1;

      containerRef.current.style.background = showGradient
        ? `conic-gradient(from 0deg, black 0deg, black ${progress}deg, white ${
            progress + 0.3
          }deg, white 360deg)`
        : "white";

      // Update React State only if integer second changes (Low Frequency)
      setTime((prevTime) => {
        const flooredFn = Math.ceil(remaining);
        return Math.ceil(prevTime) !== flooredFn ? remaining : prevTime;
      });

      if (remaining <= 0) {
        setIsActive(false);
        setTime(0);
        endTimeRef.current = null;
        containerRef.current.style.background = `conic-gradient(from 0deg, black 0deg, black 360deg, white 360deg, white 360deg)`;
      } else {
        requestIdRef.current = requestAnimationFrame(tick);
      }
    };

    if (isActive) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + time * 1000;
        lastFrameTimeRef.current = performance.now();
      }
      requestIdRef.current = requestAnimationFrame(tick);
    } else {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
      endTimeRef.current = null;
    }

    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, duration]);

  const handleTimeEdit = () => {
    const newMinutes = parseInt(editValue);
    if (!isNaN(newMinutes) && newMinutes > 0) {
      const newSeconds = newMinutes * 60;
      setDuration(newSeconds);
      setTime(newSeconds);
      setIsActive(false);
      endTimeRef.current = null;
      if (containerRef.current) {
        containerRef.current.style.background = "white";
      }
    }
    setIsEditing(false);
  };

  const formatTime = (seconds: number) => {
    const totalSeconds = Math.ceil(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center font-mono relative overflow-hidden transition-colors will-change-[background]"
      style={{}}
    >
      <div className="flex flex-col items-center z-10 mix-blend-difference text-white">
        {isEditing ? (
          <div className="flex items-center gap-2 text-[20vw] leading-none font-bold tracking-tighter tabular-nums selection:bg-transparent">
            <input
              type="number"
              min="1"
              max="99"
              value={editValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length <= 2) {
                  setEditValue(val);
                }
              }}
              onBlur={handleTimeEdit}
              onKeyDown={(e) => e.key === "Enter" && handleTimeEdit()}
              autoFocus
              className="w-[2ch] bg-transparent text-center outline-none border-none caret-white"
            />
            <span>:00</span>
          </div>
        ) : (
          <div
            onClick={() => {
              if (!isActive) {
                setEditValue(Math.floor(duration / 60).toString());
                setIsEditing(true);
              }
            }}
            className={`text-[20vw] leading-none font-bold tracking-tighter tabular-nums ${
              !isActive ? "cursor-pointer hover:opacity-80" : ""
            }`}
            title={!isActive ? "Click to edit duration" : ""}
          >
            {formatTime(time)}
          </div>
        )}

        <div className="flex gap-8 mt-12">
          <button
            onClick={() => setIsActive(!isActive)}
            className="w-24 h-24 border-4 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors"
          >
            {isActive ? (
              <Pause className="w-10 h-10" />
            ) : (
              <Play className="w-10 h-10 ml-1" />
            )}
          </button>

          <button
            onClick={() => {
              setIsActive(false);
              setTime(duration);
              if (containerRef.current) {
                containerRef.current.style.background = "white";
              }
            }}
            className="w-24 h-24 border-4 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors"
          >
            <RotateCcw className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
