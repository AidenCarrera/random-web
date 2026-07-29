import { useEffect } from "react";

export function useKeyboardControls(
  togglePaused: () => void,
  reseed: () => void,
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.code === "Space") {
        event.preventDefault();
        togglePaused();
      }
      if (event.key.toLowerCase() === "r") reseed();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reseed, togglePaused]);
}
