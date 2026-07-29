import * as Tone from "tone";

import { MASTER_GAIN } from "../constants";
import type { Rhythm } from "../types";
import { clamp } from "../utils";

/** Note names resolve to a fixed pitch, so parse each one only once. */
const frequencyCache = new Map<string, number>();

function toFrequency(note: string) {
  const cached = frequencyCache.get(note);
  if (cached !== undefined) return cached;

  const frequency = Tone.Frequency(note).toFrequency();
  frequencyCache.set(note, frequency);
  return frequency;
}

/**
 * Plays the short percussive clicks that mark each pulse. Notes are scheduled
 * straight on the Web Audio context rather than through Tone's transport, so
 * the visual loop stays the single source of timing truth.
 */
export class ClickEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private sources = new Set<OscillatorNode>();
  private gains = new Set<GainNode>();

  async init() {
    await Tone.start();
    if (this.context && this.master) return;

    this.context = Tone.getContext().rawContext as AudioContext;
    this.master = this.context.createGain();
    this.master.gain.value = MASTER_GAIN;
    this.master.connect(this.context.destination);
  }

  play(rhythm: Rhythm, downbeat: boolean) {
    if (!this.context || !this.master) return;

    const now = this.context.currentTime;
    const duration = downbeat ? 0.055 : 0.035;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const frequency = toFrequency(rhythm.tone);

    oscillator.type = downbeat ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(
      downbeat ? frequency * 0.72 : frequency,
      now,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(downbeat ? 0.5 : 0.26, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain).connect(this.master);
    this.sources.add(oscillator);
    this.gains.add(gain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      this.sources.delete(oscillator);
      this.gains.delete(gain);
    };
  }

  get time() {
    return this.context?.currentTime ?? 0;
  }

  get latency() {
    if (!this.context) return 0;
    return clamp(
      this.context.baseLatency + (this.context.outputLatency ?? 0),
      0,
      0.12,
    );
  }

  setMuted(muted: boolean) {
    this.master?.gain.setTargetAtTime(
      muted ? 0 : MASTER_GAIN,
      this.context?.currentTime ?? 0,
      0.01,
    );
  }

  silence() {
    const now = this.time;
    this.gains.forEach((gain) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0.0001, now, 0.005);
    });
    this.sources.forEach((source) => {
      try {
        source.stop(now + 0.01);
      } catch {
        // A source may already have stopped naturally.
      }
    });
  }

  dispose() {
    this.silence();
    this.master?.disconnect();
    this.master = null;
    this.context = null;
    this.sources.clear();
    this.gains.clear();
  }
}
