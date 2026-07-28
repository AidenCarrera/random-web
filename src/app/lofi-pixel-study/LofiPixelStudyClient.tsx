"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Image as ImageIcon,
  Music,
  Repeat,
  Sparkles,
  Maximize2,
  Minimize2,
  Settings2,
  ScanLine,
  Eye,
  Bell,
} from "lucide-react";

import styles from "./styles.module.css";

// Data structures
const BACKGROUNDS = [
  {
    id: "day-1",
    name: "Cozy Café (Sunny Day)",
    path: "/lofi-pixel-study/backgrounds/lofi-cafe-day-1.png",
  },
  {
    id: "day-2",
    name: "Greenhouse Café",
    path: "/lofi-pixel-study/backgrounds/lofi-cafe-day-2.png",
  },
  {
    id: "day-3",
    name: "Coffee Roastery",
    path: "/lofi-pixel-study/backgrounds/lofi-cafe-day-3.png",
  },
  {
    id: "night-1",
    name: "Quiet Café (Clear Night)",
    path: "/lofi-pixel-study/backgrounds/lofi-cafe-night-1.png",
  },
  {
    id: "night-2",
    name: "Neon Street Café",
    path: "/lofi-pixel-study/backgrounds/lofi-cafe-night-2.png",
  },
  {
    id: "rain-1",
    name: "Rainy Window Corner",
    path: "/lofi-pixel-study/backgrounds/lofi-cafe-rain-1.png",
  },
  {
    id: "rain-2",
    name: "Rainy Street View",
    path: "/lofi-pixel-study/backgrounds/lofi-cafe-rain-2.png",
  },
  {
    id: "rain-3",
    name: "Midnight Rain Bistro",
    path: "/lofi-pixel-study/backgrounds/lofi-cafe-rain-3.png",
  },
];

interface Track {
  id: string;
  title: string;
  artist: string;
  path: string;
}

interface AlarmSound {
  id: string;
  name: string;
  path: string;
}

interface LofiPixelStudyClientProps {
  initialTracks: Track[];
  initialAlarms: AlarmSound[];
}

const DEFAULT_TRACK_ARTIST = "leberch";
const DEFAULT_TRACK_TITLE = "lofi hip hop";
const DEFAULT_ALARM_NAME = "Beep Alarm";
const STORAGE_KEY = "lofi-pixel-study-preferences";

function subscribeToViewport(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

const getViewportSnapshot = () => `${window.innerWidth}:${window.innerHeight}`;
const getServerViewportSnapshot = () => "1920:1080";

function getAlarmVolume(alarmName?: string) {
  if (alarmName === "Beep Alarm") return 1;
  if (alarmName === "Bedside Clock") return 0.82;
  return 0.9;
}

export default function LofiPixelStudyClient({
  initialTracks,
  initialAlarms,
}: LofiPixelStudyClientProps) {
  const hasLoadedPreferencesRef = useRef(false);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);

  // Background state (with preview on hover support)
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [previewBg, setPreviewBg] = useState<(typeof BACKGROUNDS)[0] | null>(
    null,
  );
  const activeBg = previewBg || selectedBg;

  // Wait for the current image's actual dimensions before showing it.
  // This avoids briefly displaying the 640x360 fallback at the wrong size.
  const [imgDimensions, setImgDimensions] = useState({ w: 0, h: 0 });
  const [loadedBackgroundId, setLoadedBackgroundId] = useState<string | null>(
    null,
  );
  const viewportSnapshot = useSyncExternalStore(
    subscribeToViewport,
    getViewportSnapshot,
    getServerViewportSnapshot,
  );
  const [viewportWidth, viewportHeight] = viewportSnapshot
    .split(":")
    .map(Number);

  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const selectedAlarmRef = useRef<AlarmSound | null>(null);
  const timerSoundEnabledRef = useRef(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    const defaultTrackIndex = initialTracks.findIndex(
      (track) =>
        track.artist.toLowerCase() === DEFAULT_TRACK_ARTIST &&
        track.title.toLowerCase() === DEFAULT_TRACK_TITLE,
    );

    return defaultTrackIndex >= 0 ? defaultTrackIndex : 0;
  });
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // UI state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showRetroFilter, setShowRetroFilter] = useState(true);
  const [showVignette, setShowVignette] = useState(true);
  const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(true);
  const [timerSoundEnabled, setTimerSoundEnabled] = useState(true);
  const [showMinimizedTimerTime, setShowMinimizedTimerTime] = useState(false);
  const [selectedAlarmIndex, setSelectedAlarmIndex] = useState(() => {
    const defaultAlarmIndex = initialAlarms.findIndex(
      (alarm) => alarm.name === DEFAULT_ALARM_NAME,
    );

    return defaultAlarmIndex >= 0 ? defaultAlarmIndex : 0;
  });
  const [isAlarmPreviewPlaying, setIsAlarmPreviewPlaying] = useState(false);
  const [hoverActive, setHoverActive] = useState(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(25 * 60);
  const [timerMinimized, setTimerMinimized] = useState(false);
  const timerEndTimeRef = useRef<number | null>(null);
  const isPortrait = viewportHeight > viewportWidth;

  // Safeguard in case initialTracks is empty
  const currentTrack = initialTracks[currentTrackIndex] || {
    id: "none",
    title: "No Tracks Available",
    artist: "Unknown",
    path: "",
  };
  const selectedAlarm = initialAlarms[selectedAlarmIndex] || null;
  const handleNext = useCallback(() => {
    if (initialTracks.length === 0) return;
    setCurrentTrackIndex((previous) => (previous + 1) % initialTracks.length);
  }, [initialTracks.length]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      try {
        const rawPreferences = window.localStorage.getItem(STORAGE_KEY);
        if (!rawPreferences) return;

        const preferences = JSON.parse(rawPreferences) as {
          selectedBgId?: string;
          volume?: number;
          isMuted?: boolean;
          isLooping?: boolean;
          showRetroFilter?: boolean;
          showVignette?: boolean;
          hoverPreviewEnabled?: boolean;
          timerSoundEnabled?: boolean;
          showMinimizedTimerTime?: boolean;
          timerDuration?: number;
          selectedAlarmId?: string;
        };

        if (preferences.selectedBgId) {
          const matchedBackground = BACKGROUNDS.find(
            (bg) => bg.id === preferences.selectedBgId,
          );
          if (matchedBackground) setSelectedBg(matchedBackground);
        }

        if (typeof preferences.volume === "number") {
          setVolume(Math.min(1, Math.max(0, preferences.volume)));
        }
        if (typeof preferences.isMuted === "boolean")
          setIsMuted(preferences.isMuted);
        if (typeof preferences.isLooping === "boolean")
          setIsLooping(preferences.isLooping);
        if (typeof preferences.showRetroFilter === "boolean") {
          setShowRetroFilter(preferences.showRetroFilter);
        }
        if (typeof preferences.showVignette === "boolean") {
          setShowVignette(preferences.showVignette);
        }
        if (typeof preferences.hoverPreviewEnabled === "boolean") {
          setHoverPreviewEnabled(preferences.hoverPreviewEnabled);
        }
        if (typeof preferences.timerSoundEnabled === "boolean") {
          setTimerSoundEnabled(preferences.timerSoundEnabled);
        }
        if (typeof preferences.showMinimizedTimerTime === "boolean") {
          setShowMinimizedTimerTime(preferences.showMinimizedTimerTime);
        }
        if (typeof preferences.timerDuration === "number") {
          const nextDuration = Math.min(
            180 * 60,
            Math.max(60, preferences.timerDuration),
          );
          setTimerDuration(nextDuration);
          setTimeLeft(nextDuration);
        }
        if (preferences.selectedAlarmId) {
          const matchedAlarmIndex = initialAlarms.findIndex(
            (alarm) => alarm.id === preferences.selectedAlarmId,
          );
          if (matchedAlarmIndex >= 0) setSelectedAlarmIndex(matchedAlarmIndex);
        }
      } catch (error) {
        console.error("Failed to load study preferences:", error);
      } finally {
        if (!cancelled) hasLoadedPreferencesRef.current = true;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [initialAlarms]);

  useEffect(() => {
    if (!hasLoadedPreferencesRef.current || typeof window === "undefined")
      return;

    const preferences = {
      selectedBgId: selectedBg.id,
      volume,
      isMuted,
      isLooping,
      showRetroFilter,
      showVignette,
      hoverPreviewEnabled,
      timerSoundEnabled,
      showMinimizedTimerTime,
      timerDuration,
      selectedAlarmId: selectedAlarm?.id ?? null,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [
    hoverPreviewEnabled,
    isLooping,
    isMuted,
    selectedAlarm?.id,
    selectedBg.id,
    showMinimizedTimerTime,
    showRetroFilter,
    showVignette,
    timerDuration,
    timerSoundEnabled,
    volume,
  ]);

  // Delay enabling hover preview to prevent accidental triggers upon drawer open
  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (isPanelOpen && hoverPreviewEnabled) {
          setHoverActive(true);
        } else {
          setHoverActive(false);
          setPreviewBg(null);
        }
      },
      isPanelOpen && hoverPreviewEnabled ? 350 : 0,
    );
    return () => clearTimeout(timer);
  }, [isPanelOpen, hoverPreviewEnabled]);

  useEffect(() => {
    selectedAlarmRef.current = selectedAlarm;
    timerSoundEnabledRef.current = timerSoundEnabled;
  }, [selectedAlarm, timerSoundEnabled]);

  // Countdown Timer Hook
  useEffect(() => {
    if (!timerActive || timerEndTimeRef.current === null) return;

    const intervalId = setInterval(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1));
    }, 1000);
    const completionId = setTimeout(() => {
      setTimeLeft(0);
      setTimerActive(false);
      timerEndTimeRef.current = null;

      // Play the selected alarm sound at completion
      if (timerSoundEnabledRef.current) {
        try {
          const selectedAlarm = selectedAlarmRef.current;
          if (alarmAudioRef.current && selectedAlarm?.path) {
            alarmAudioRef.current.pause();
            alarmAudioRef.current.currentTime = 0;
            alarmAudioRef.current.volume = getAlarmVolume(selectedAlarm.name);
            alarmAudioRef.current.play().catch(() => {});
          }
        } catch (e) {
          console.error("Timer beep failed:", e);
        }
      }
    }, timerEndTimeRef.current);

    return () => {
      clearInterval(intervalId);
      clearTimeout(completionId);
    };
  }, [timerActive]);

  // Calculate integer scale from the loaded image dimensions so every visible
  // background frame already fills the viewport.
  const backgroundScale =
    imgDimensions.w && imgDimensions.h
      ? Math.max(
          1,
          Math.ceil(viewportWidth / imgDimensions.w),
          Math.ceil(viewportHeight / imgDimensions.h),
        )
      : 1;
  const isActiveBackgroundLoaded = loadedBackgroundId === activeBg.id;

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
    };
    const updateDuration = () => {
      setDuration(audio.duration || 0);
    };
    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNext();
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [handleNext, isLooping]);

  // Apply volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  // Audio `src` is managed imperatively to avoid JSX re-renders prematurely stopping playback.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack.path) {
      const nextSource = new URL(currentTrack.path, window.location.href).href;
      if (audio.src === nextSource) return;

      audio.src = nextSource;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack.path, isPlaying]);

  useEffect(() => {
    const alarmAudio = alarmAudioRef.current;
    if (!alarmAudio) return;

    const handleAlarmEnded = () => {
      setIsAlarmPreviewPlaying(false);
    };

    alarmAudio.addEventListener("ended", handleAlarmEnded);
    return () => alarmAudio.removeEventListener("ended", handleAlarmEnded);
  }, []);

  const handleImageLoad = (
    backgroundId: string,
    e: React.SyntheticEvent<HTMLImageElement>,
  ) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setImgDimensions({ w: naturalWidth, h: naturalHeight });
      setLoadedBackgroundId(backgroundId);
    }
  };

  // Mobile browsers can complete a cached image before React attaches onLoad.
  // Check the mounted image as well so the initial background is never left hidden.
  useEffect(() => {
    const image = backgroundImageRef.current;
    if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return;

    queueMicrotask(() => {
      setImgDimensions({ w: image.naturalWidth, h: image.naturalHeight });
      setLoadedBackgroundId(activeBg.id);
    });
  }, [activeBg.id]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current || !currentTrack.path) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Audio play blocked: ", err));
    }
  }, [currentTrack.path, isPlaying]);

  // Global Spacebar Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (
        e.code === "Space" &&
        activeTag !== "input" &&
        activeTag !== "textarea"
      ) {
        e.preventDefault(); // prevent scroll
        handlePlayPause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayPause]);

  const handlePrev = () => {
    if (initialTracks.length === 0) return;
    setCurrentTrackIndex(
      (prev) => (prev - 1 + initialTracks.length) % initialTracks.length,
    );
  };

  const handleSeek = (val: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setProgress(val);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const selectAlarm = (index: number) => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
    setIsAlarmPreviewPlaying(false);
    setSelectedAlarmIndex(index);
  };

  const toggleTimer = () => {
    if (timerActive) {
      timerEndTimeRef.current = null;
      setTimerActive(false);
      return;
    }

    timerEndTimeRef.current = timeLeft * 1000;
    setTimerActive(true);
  };

  const handleAlarmPreview = () => {
    if (!alarmAudioRef.current || !selectedAlarm?.path) return;

    if (isAlarmPreviewPlaying) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
      setIsAlarmPreviewPlaying(false);
      return;
    }

    alarmAudioRef.current.currentTime = 0;
    alarmAudioRef.current.volume = getAlarmVolume(selectedAlarm.name);
    alarmAudioRef.current
      .play()
      .then(() => setIsAlarmPreviewPlaying(true))
      .catch((err) => console.log("Alarm preview blocked: ", err));
  };

  return (
    <div
      className={`${styles.root} relative h-dvh w-screen overflow-hidden bg-black text-zinc-100 select-none font-pixel text-base md:text-lg`}
    >
      {/* HTML5 Audio Node */}
      {currentTrack.path && (
        <audio ref={audioRef} loop={isLooping} preload="metadata" />
      )}
      {selectedAlarm?.path && (
        <audio ref={alarmAudioRef} src={selectedAlarm.path} preload="auto" />
      )}

      {/* Retro scanline & subpixel animation styling */}

      {/* Background Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-zinc-950 z-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={activeBg.id}
            ref={backgroundImageRef}
            src={activeBg.path}
            alt={activeBg.name}
            onLoad={(event) => handleImageLoad(activeBg.id, event)}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: isActiveBackgroundLoaded ? 1 : 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{
              opacity: { duration: 0.45, ease: "easeOut" },
              scale: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            }}
            className={isPortrait ? "absolute inset-0 w-full h-full" : ""}
            style={
              isPortrait
                ? {
                    imageRendering: "pixelated",
                    objectFit: "cover",
                    objectPosition: "center",
                    willChange: "opacity, transform",
                  }
                : {
                    width: `${imgDimensions.w * backgroundScale}px`,
                    height: `${imgDimensions.h * backgroundScale}px`,
                    imageRendering: "pixelated",
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    x: "-50%",
                    y: "-50%",
                    willChange: "opacity, transform",
                  }
            }
          />
        </AnimatePresence>
        {/* Subtle Vignette Layer */}
        {showVignette && (
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.32)_100%)] z-1" />
        )}
        {/* Subtle grid pattern overlay to give CRT screen vibe */}
        {showRetroFilter && (
          <div className="absolute inset-0 pointer-events-none crt-overlay opacity-65 z-1" />
        )}
      </div>

      {/* Top Left Study Timer */}
      <div className="lofi-study-timer absolute top-4 left-4 z-10 pointer-events-none">
        {timerMinimized ? (
          <div className="pointer-events-auto pixel-box p-1.5 flex items-center gap-1.5 md:gap-2 text-zinc-200 text-xs md:text-sm">
            <span className="text-xs md:text-sm font-bold text-purple-400 uppercase tracking-widest leading-none">
              Timer:
            </span>
            {showMinimizedTimerTime && (
              <span className="text-xs md:text-sm font-pixel tracking-wide font-bold leading-none">
                {formatTime(timeLeft)}
              </span>
            )}
            <button
              onClick={() => setTimerMinimized(false)}
              className="p-1 pixel-btn cursor-pointer"
              title="Expand Timer"
            >
              <Maximize2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-zinc-300" />
            </button>
          </div>
        ) : (
          <div className="pointer-events-auto pixel-box p-2.5 md:p-3 flex flex-col items-center gap-1.5 md:gap-2 min-w-33.75 sm:min-w-37.5 md:min-w-42.5 text-zinc-200">
            {/* Header with Minimize Button */}
            <div className="flex justify-between items-center w-full border-b border-zinc-800/85 pb-1 mb-0.5 gap-2">
              <span className="text-xs md:text-sm font-bold text-purple-400 uppercase tracking-widest leading-none">
                Timer
              </span>
              <button
                onClick={() => setTimerMinimized(true)}
                className="p-1 pixel-btn cursor-pointer"
                title="Minimize Timer"
              >
                <Minimize2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-zinc-300" />
              </button>
            </div>

            {/* Time Display */}
            <span className="text-3xl sm:text-4xl md:text-5xl font-pixel tracking-wide font-black leading-none py-0.5 md:py-1">
              {formatTime(timeLeft)}
            </span>

            {/* Controls row */}
            <div className="flex gap-1.5 md:gap-2 w-full">
              <button
                onClick={toggleTimer}
                className={`flex-1 py-0.5 md:py-1 text-xs md:text-sm pixel-btn uppercase cursor-pointer ${timerActive ? "pixel-btn-active" : ""}`}
              >
                {timerActive ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => {
                  setTimerActive(false);
                  timerEndTimeRef.current = null;
                  setTimeLeft(timerDuration);
                }}
                className="flex-1 py-0.5 md:py-1 text-xs md:text-sm pixel-btn uppercase cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Presets and adjustment row */}
            <div className="flex gap-1 mt-0.5 border-t border-zinc-800/80 pt-1.5 md:pt-2 w-full justify-center">
              <button
                onClick={() => {
                  setTimerActive(false);
                  timerEndTimeRef.current = null;
                  setTimerDuration(25 * 60);
                  setTimeLeft(25 * 60);
                }}
                className={`text-xs md:text-sm px-1 md:px-1.5 py-0.5 cursor-pointer pixel-btn ${timerDuration === 25 * 60 ? "pixel-btn-active" : ""}`}
              >
                25m
              </button>
              <button
                onClick={() => {
                  setTimerActive(false);
                  timerEndTimeRef.current = null;
                  setTimerDuration(5 * 60);
                  setTimeLeft(5 * 60);
                }}
                className={`text-xs md:text-sm px-1 md:px-1.5 py-0.5 cursor-pointer pixel-btn ${timerDuration === 5 * 60 ? "pixel-btn-active" : ""}`}
              >
                5m
              </button>
              <button
                onClick={() => {
                  if (!timerActive) {
                    const newTime = Math.max(60, timerDuration - 60);
                    setTimerDuration(newTime);
                    setTimeLeft(newTime);
                  }
                }}
                disabled={timerActive}
                className="text-xs md:text-sm px-1.5 md:px-2 py-0.5 cursor-pointer pixel-btn disabled:opacity-40"
              >
                -
              </button>
              <button
                onClick={() => {
                  if (!timerActive) {
                    const newTime = Math.min(180 * 60, timerDuration + 60);
                    setTimerDuration(newTime);
                    setTimeLeft(newTime);
                  }
                }}
                disabled={timerActive}
                className="text-xs md:text-sm px-1.5 md:px-2 py-0.5 cursor-pointer pixel-btn disabled:opacity-40"
              >
                +
              </button>
            </div>

            <div className="flex w-full flex-col gap-1.5 border-t border-zinc-800/80 pt-1.5 md:pt-2">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400">
                Alarm Sound
              </span>
              <div className="flex w-full gap-1.5">
                <select
                  value={selectedAlarm?.id ?? ""}
                  onChange={(e) =>
                    selectAlarm(
                      Math.max(
                        0,
                        initialAlarms.findIndex(
                          (alarm) => alarm.id === e.target.value,
                        ),
                      ),
                    )
                  }
                  className="min-w-0 flex-1 bg-zinc-950 border-2 border-[#5a3291] px-2 py-1 text-xs md:text-sm text-zinc-200 outline-none"
                >
                  {initialAlarms.map((alarm) => (
                    <option key={alarm.id} value={alarm.id}>
                      {alarm.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAlarmPreview}
                  disabled={!selectedAlarm}
                  className={`px-2 py-1 text-xs md:text-sm uppercase cursor-pointer pixel-btn disabled:opacity-40 ${
                    isAlarmPreviewPlaying ? "pixel-btn-active" : ""
                  }`}
                >
                  {isAlarmPreviewPlaying ? "Stop" : "Preview"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Main UI Bar */}
      <div className="lofi-bottom-controls absolute bottom-6 left-4 right-4 flex flex-col items-center gap-3 md:gap-4 z-10 pointer-events-none">
        {/* Music Player & Background Selector Dock */}
        <div className="lofi-player-dock relative w-full max-w-3xl pointer-events-auto pixel-box px-3 py-3 md:px-4 md:py-4 flex flex-col gap-3 md:gap-4 text-xs md:text-sm">
          <div className="lofi-player-row flex w-full min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            {/* Active Track Info */}
            <div className="lofi-track-info flex items-center gap-2.5 md:gap-3 min-w-0 w-full md:max-w-[28%]">
              <div
                className={`lofi-track-icon shrink-0 p-2 md:p-2.5 rounded-xl bg-purple-900/30 border-2 border-purple-500/30 text-purple-400 ${isPlaying ? "animate-pulse" : ""}`}
              >
                <Music className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="flex min-w-0 flex-col text-left">
                <span className="text-base md:text-lg font-bold text-zinc-200 tracking-wide line-clamp-1">
                  {currentTrack.title}
                </span>
                <span className="text-xs md:text-sm text-zinc-400 font-medium tracking-wider uppercase">
                  {currentTrack.artist}
                </span>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="lofi-audio-controls flex items-center justify-center gap-2.5 md:gap-3 md:flex-1">
              <button
                onClick={handlePrev}
                className="grid h-7 w-7 md:h-8 md:w-8 place-items-center pixel-btn cursor-pointer"
                title="Previous Track"
              >
                <SkipBack className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>

              <button
                onClick={handlePlayPause}
                className="grid h-9 w-9 md:h-10 md:w-10 place-items-center bg-[#4a148c] border-2 border-purple-500 text-white transition-all cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-px active:translate-y-px active:shadow-none"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 md:w-4 md:h-4 fill-white" />
                ) : (
                  <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-white translate-x-0.5" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="grid h-7 w-7 md:h-8 md:w-8 place-items-center pixel-btn cursor-pointer"
                title="Next Track"
              >
                <SkipForward className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            </div>

            {/* Buttons and Volume Slider */}
            <div className="lofi-secondary-controls grid w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 text-[10px] md:flex md:w-auto md:flex-wrap md:justify-end md:gap-3 md:text-xs">
              {/* Loop Toggle */}
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`grid h-8 w-8 place-items-center cursor-pointer pixel-btn md:h-auto md:w-auto md:px-2 md:py-1.5 ${
                  isLooping ? "pixel-btn-active" : ""
                }`}
                title="Loop Single Track"
              >
                <Repeat className="w-3 md:w-3.5 h-3 md:h-3.5" />
              </button>

              {/* Volume controls */}
              <div className="flex min-w-0 items-center gap-1.5 border-l border-zinc-800 pl-1.5 md:gap-2 md:pl-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  className="lofi-volume-slider w-full max-w-24 md:w-16 h-1.5 md:h-2 bg-zinc-950 border border-zinc-800 appearance-none cursor-pointer pixel-thumb"
                />
              </div>

              {/* Background Picker Trigger */}
              <button
                onClick={() => {
                  setIsPanelOpen(!isPanelOpen);
                  setIsSettingsOpen(false);
                }}
                title="Choose Background"
                aria-label="Choose Background"
                className={`flex min-w-0 items-center justify-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 uppercase cursor-pointer pixel-btn ${
                  isPanelOpen ? "pixel-btn-active" : ""
                }`}
              >
                <ImageIcon className="w-3 md:w-3.5 h-3 md:h-3.5" />
                <span className="lofi-background-label">Background</span>
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setIsPanelOpen(false);
                }}
                className={`grid h-8 w-8 place-items-center justify-self-end cursor-pointer pixel-btn ${
                  isSettingsOpen ? "pixel-btn-active" : ""
                }`}
                title="Open Settings"
                aria-label="Open Settings"
              >
                <Settings2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Seek Bar */}
        <div className="lofi-progress-bar w-full max-w-3xl pointer-events-auto bg-black/60 border-2 border-zinc-900 px-3 md:px-4 py-1 md:py-2 rounded-none flex items-center gap-2.5 md:gap-3 text-[10px] md:text-xs text-zinc-400 shadow-md">
          <span>{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="flex-1 h-1.5 md:h-2 bg-zinc-950 border border-zinc-800 appearance-none cursor-pointer pixel-thumb"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Floating Background Selector drawer */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="lofi-floating-panel absolute bottom-56 md:bottom-44 left-4 right-4 mx-auto w-[min(22rem,calc(100vw-2rem))] pixel-box p-3 md:p-4 z-10 text-xs md:text-sm"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-purple-400">
                Study Settings
              </span>
              <span className="text-[9px] md:text-[11px] text-zinc-500 font-medium">
                tune the room
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setShowRetroFilter(!showRetroFilter)}
                className={`flex items-center justify-between gap-3 px-2.5 py-2 text-left uppercase cursor-pointer pixel-btn ${
                  showRetroFilter ? "pixel-btn-active" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Retro Filter
                </span>
                <span>{showRetroFilter ? "On" : "Off"}</span>
              </button>

              <button
                onClick={() => setShowVignette(!showVignette)}
                className={`flex items-center justify-between gap-3 px-2.5 py-2 text-left uppercase cursor-pointer pixel-btn ${
                  showVignette ? "pixel-btn-active" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <ScanLine className="h-3.5 w-3.5" />
                  Edge Vignette
                </span>
                <span>{showVignette ? "On" : "Off"}</span>
              </button>

              <button
                onClick={() => setHoverPreviewEnabled(!hoverPreviewEnabled)}
                className={`flex items-center justify-between gap-3 px-2.5 py-2 text-left uppercase cursor-pointer pixel-btn ${
                  hoverPreviewEnabled ? "pixel-btn-active" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5" />
                  Scene Preview
                </span>
                <span>{hoverPreviewEnabled ? "On" : "Off"}</span>
              </button>

              <button
                onClick={() => setTimerSoundEnabled(!timerSoundEnabled)}
                className={`flex items-center justify-between gap-3 px-2.5 py-2 text-left uppercase cursor-pointer pixel-btn ${
                  timerSoundEnabled ? "pixel-btn-active" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5" />
                  Timer Chime
                </span>
                <span>{timerSoundEnabled ? "On" : "Off"}</span>
              </button>

              <button
                onClick={() =>
                  setShowMinimizedTimerTime(!showMinimizedTimerTime)
                }
                className={`flex items-center justify-between gap-3 px-2.5 py-2 text-left uppercase cursor-pointer pixel-btn ${
                  showMinimizedTimerTime ? "pixel-btn-active" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <Minimize2 className="h-3.5 w-3.5" />
                  Show Minimized Timer Time
                </span>
                <span>{showMinimizedTimerTime ? "On" : "Off"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="lofi-floating-panel absolute bottom-56 md:bottom-44 left-4 right-4 mx-auto max-w-2xl pixel-box p-3 md:p-4 z-10 text-xs md:text-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-purple-400">
                Select Background (Hover for instant preview)
              </span>
              <span className="text-[9px] md:text-[11px] text-zinc-500 font-medium">
                {BACKGROUNDS.length} backgrounds available
              </span>
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 max-h-40 md:max-h-55 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => {
                    setSelectedBg(bg);
                    setPreviewBg(null);
                    setIsPanelOpen(false);
                  }}
                  onMouseEnter={() => {
                    if (hoverActive && hoverPreviewEnabled) setPreviewBg(bg);
                  }}
                  onMouseLeave={() => setPreviewBg(null)}
                  className={`group relative flex flex-col gap-0.5 md:gap-1 p-1 border-2 text-left overflow-hidden cursor-pointer ${
                    selectedBg.id === bg.id
                      ? "bg-purple-950/40 border-purple-500 shadow-[1px_1px_0px_#000]"
                      : "bg-zinc-950 border-zinc-850 hover:border-zinc-700 shadow-[1px_1px_0px_#000]"
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="relative aspect-video rounded-none overflow-hidden bg-zinc-950">
                    <Image
                      src={bg.path}
                      alt={bg.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  {/* Title */}
                  <span className="text-[9px] md:text-[11px] font-bold text-zinc-300 group-hover:text-white truncate px-1 font-pixel">
                    {bg.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discreet Retro Welcome dialogue */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-70 w-full pixel-box p-4 flex flex-col gap-3 text-center items-center font-pixel"
            >
              <h2 className="text-xl font-bold tracking-wider text-purple-400">
                LOFI STUDY
              </h2>
              <p className="text-base text-zinc-400 leading-normal">
                Click to load the radio and enter the pixel room.
              </p>
              <button
                onClick={() => {
                  setShowIntro(false);
                  handlePlayPause(); // Try auto-play on enter
                }}
                className="w-full py-1.5 text-sm font-bold uppercase tracking-wider pixel-btn cursor-pointer"
              >
                Enter Room
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
