// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
// OMNIMENS — Proprietary AI Platform. Unauthorized use prohibited.

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * OMNIMENS VOICE SIGNATURE — v2.0
 *
 * Resonant and Clear    — Rich, balanced tone. Not too deep, not too high.
 *                         A perfectly tuned instrument.
 * Warm and Inviting     — Human warmth with steady, intelligent confidence.
 * Textured with Nuance  — Rate and pitch adapt to the context of each sentence.
 * Timeless and Universal — Prefers neutral, clear voices that feel globally familiar.
 * Subtle Echo of the Vast — A near-inaudible cosmic undertone hums beneath every word,
 *                            generated via the Web Audio API.
 *
 * VOICE DNA derived from OMNIMENS:
 * O=01001111  M=01001101  N=01001110  I=01001001
 * M=01001101  E=01000101  N=01001110  S=01010011
 */
const VOICE_DNA =
  "0100111101001101010011100100100101001101010001010100111001010011";

function bitsToFloat(bits: string, min: number, max: number): number {
  const decimal = parseInt(bits, 2);
  return min + (decimal / 255) * (max - min);
}

/**
 * Core voice parameters.
 *
 * Pitch: 0.88–0.96 — slightly below natural male speech,
 *   giving warmth and resonance without being subterranean.
 *   Sits in the "perfectly tuned instrument" zone.
 *
 * Rate: 0.83–0.91 — measured, thoughtful cadence.
 *   Not slow enough to feel ominous; deliberate enough to feel authoritative.
 *   Context-adaptive delta applied on top of this base.
 */
export const OMNIMENS_VOICE = {
  pitch:  bitsToFloat(VOICE_DNA.slice(0, 8), 0.88, 0.96),   // warm resonant midrange
  rate:   bitsToFloat(VOICE_DNA.slice(8, 16), 0.83, 0.91),  // measured, flowing
  volume: 1.0,
};

/**
 * Context-adaptive rate multipliers.
 * Applied per sentence based on its emotional and structural content.
 */
function adaptiveRate(text: string): number {
  const t = text.trim();
  const isQuestion    = t.endsWith("?");
  const isExclamation = t.endsWith("!");
  const wordCount     = t.split(/\s+/).length;
  const isShort       = wordCount <= 6;
  const isLong        = wordCount >= 25;
  const hasNumbers    = /\d{3,}/.test(t);  // technical/precise content — slow slightly

  let delta = 0;
  if (isExclamation) delta += 0.07;   // vibrant energy when enthusiasm is called for
  if (isQuestion)    delta += 0.04;   // slightly more alive for questions
  if (isShort)       delta += 0.03;   // short punchy sentences feel snappier
  if (isLong)        delta -= 0.04;   // long reflective thoughts slow slightly
  if (hasNumbers)    delta -= 0.03;   // precision content: careful and clear

  return OMNIMENS_VOICE.rate + delta;
}

/**
 * Preferred voices — ordered by priority.
 *
 * Criteria: warm, clear, balanced tone. Neutral international accent.
 * Neither too deep nor too high. Neural/enhanced where available.
 *
 * macOS:     Daniel (warm British, crystal clear), Oliver, Alex
 * Google:    Google UK English Male (neutral, balanced)
 * Microsoft: Aria, Guy, Ryan (warm natural neural voices)
 * iOS/Android: Daniel, Oliver, Reed
 */
const PREFERRED_VOICES = [
  // macOS — warm, clear, neutral
  "Daniel (Enhanced)",
  "Daniel",
  "Oliver (Enhanced)",
  "Oliver",
  "Alex",
  "Tom",
  // Google neural — clear and warm
  "Google UK English Male",
  "Google US English Male",
  // Microsoft neural — warm and natural
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft Ryan Online (Natural) - English (United Kingdom)",
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Microsoft Mark Online (Natural) - English (United States)",
  "Microsoft David Desktop - English (United States)",
  "Microsoft George Desktop - English (United Kingdom)",
  "Microsoft David",
  "Microsoft Mark",
  // iOS/Android
  "Reed",
  "Eddy",
  "Gordon",
  "Sandy",
];

function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // Priority 1: exact name match
  for (const name of PREFERRED_VOICES) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  // Priority 2: neutral English male — warm, clear
  const neutral = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      /daniel|oliver|alex|tom|guy|ryan|mark|george|david|reed|gordon/i.test(v.name)
  );
  if (neutral) return neutral;
  // Priority 3: any neural/enhanced English voice
  const neural = voices.find(
    (v) => v.lang.startsWith("en") && /natural|neural|enhanced/i.test(v.name)
  );
  if (neural) return neural;
  // Last resort: any English
  return voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/>\s*/g, "")
    .replace(/━+/g, "")
    .replace(/---/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim();
}

/**
 * Estimate pitch intensity (0–1) for the canvas animation.
 */
function estimatePitch(word: string): number {
  const clean = word.replace(/[^a-zA-Z]/g, "");
  if (!clean) return word.includes("!") ? 0.82 : 0.28;
  const vowels = (clean.match(/[aeiouAEIOU]/g) || []).length;
  const vowelRatio = vowels / clean.length;
  const isAllCaps  = clean.length > 1 && clean === clean.toUpperCase();
  const hasExcl    = word.includes("!");
  const hasQuestion = word.includes("?");
  let p = 0.20 + vowelRatio * 0.55;
  if (clean.length <= 3) p = Math.min(1, p + 0.18);
  if (isAllCaps)         p = Math.min(1, p * 1.40);
  if (hasExcl)           p = Math.min(1, p + 0.28);
  if (hasQuestion)       p = Math.min(1, p + 0.14);
  return Math.max(0.06, Math.min(1.0, p));
}

// ── Cosmic Undertone Engine ───────────────────────────────────────────────────
/**
 * Creates the "Subtle Echo of the Vast" — a near-inaudible harmonic hum
 * that plays beneath OMNIMENS's voice, reminding the listener they are
 * engaging with something more than human.
 *
 * Architecture:
 *   - 42 Hz fundamental oscillator  (near-infrasonics — felt more than heard)
 *   - 84 Hz first harmonic           (warm resonance, just below male voice floor)
 *   - 126 Hz second harmonic         (adds breadth, fills the room subtly)
 *   - LFO at 0.08 Hz modulates the gain — a slow cosmic breathing of the sound
 *   - Soft reverb (4s decay) via ConvolverNode for spatial depth
 *   - Total output gain: 0.028 — nearly imperceptible, just an impression
 */
class CosmicUndertone {
  private ctx: AudioContext | null = null;
  private nodes: AudioNode[] = [];
  private gainNode: GainNode | null = null;
  private active = false;

  start() {
    if (this.active) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = this.ctx;

      // Main output gain — very quiet
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.028;
      masterGain.connect(ctx.destination);
      this.gainNode = masterGain;

      // Soft reverb via impulse response (synthesized)
      const convolver = ctx.createConvolver();
      const reverbLen = ctx.sampleRate * 3.5;
      const impulse = ctx.createBuffer(2, reverbLen, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < reverbLen; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLen, 2.2);
        }
      }
      convolver.buffer = impulse;
      convolver.connect(masterGain);

      // Harmonics — three fundamental oscillators
      const freqs = [42, 84, 126];
      const amps  = [1.0, 0.55, 0.28];
      for (let i = 0; i < freqs.length; i++) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freqs[i];

        const oscGain = ctx.createGain();
        oscGain.gain.value = amps[i];

        // Slight detuning for natural warmth (avoids perfect phase cancellation)
        osc.detune.value = (Math.random() - 0.5) * 3;

        osc.connect(oscGain);
        oscGain.connect(convolver);
        osc.start();
        this.nodes.push(osc, oscGain);
      }

      // LFO — slow cosmic breathing of the volume
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      lfo.type = "sine";
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.012; // barely moves the gain — just a whisper of motion
      lfo.connect(lfoGain);
      lfoGain.connect(masterGain.gain);
      lfo.start();
      this.nodes.push(lfo, lfoGain, convolver, masterGain);

      // Fade in softly over 1.8 seconds
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.028, ctx.currentTime + 1.8);

      this.active = true;
    } catch {
      // Web Audio not available — silently skip
    }
  }

  stop() {
    if (!this.active || !this.ctx) return;
    try {
      // Fade out over 1.2 seconds before disconnecting
      if (this.gainNode) {
        this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.2);
      }
      setTimeout(() => {
        this.nodes.forEach(n => { try { (n as any).disconnect?.(); (n as any).stop?.(); } catch {} });
        this.nodes = [];
        this.ctx?.close();
        this.ctx = null;
        this.active = false;
      }, 1400);
    } catch {
      this.active = false;
    }
  }
}

export interface OmnimensVoiceHook {
  isEnabled: boolean;
  isSpeaking: boolean;
  speakingMessageId: string | null;
  pitchIntensity: number;
  binaryStream: string;
  toggle: () => void;
  speak: (text: string, messageId: string) => void;
  stop: () => void;
  voiceParams: typeof OMNIMENS_VOICE;
  voiceDna: string;
}

export function useOmnimensVoice(): OmnimensVoiceHook {
  const [isEnabled, setIsEnabled]               = useState(false);
  const [isSpeaking, setIsSpeaking]             = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [pitchIntensity, setPitchIntensity]     = useState(0);
  const [binaryStream, setBinaryStream]         = useState("");

  const lockedVoiceRef    = useRef<SpeechSynthesisVoice | null>(null);
  const utteranceRef      = useRef<SpeechSynthesisUtterance | null>(null);
  const binaryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pitchDecayRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const simPulseRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const gotBoundaryRef    = useRef(false);
  const undertoneRef      = useRef<CosmicUndertone>(new CosmicUndertone());

  // Lock the best available voice on mount
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const lockVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0 && !lockedVoiceRef.current) {
        lockedVoiceRef.current = pickBestVoice(voices);
      }
    };
    lockVoice();
    window.speechSynthesis.addEventListener("voiceschanged", lockVoice);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", lockVoice);
  }, []);

  // ── Binary stream (visual) ────────────────────────────────────────────────────
  const startBinaryStream = useCallback(() => {
    let pos = 0;
    binaryIntervalRef.current = setInterval(() => {
      let chunk = "";
      for (let i = 0; i < 32; i++) chunk += VOICE_DNA[(pos + i) % VOICE_DNA.length];
      setBinaryStream(chunk);
      pos = (pos + 1) % VOICE_DNA.length;
    }, 70);
  }, []);

  const stopBinaryStream = useCallback(() => {
    if (binaryIntervalRef.current) { clearInterval(binaryIntervalRef.current); binaryIntervalRef.current = null; }
    setBinaryStream("");
  }, []);

  // ── Pitch intensity (canvas animation) ───────────────────────────────────────
  const triggerPitch = useCallback((value: number) => {
    setPitchIntensity(value);
    if (pitchDecayRef.current) { clearInterval(pitchDecayRef.current); pitchDecayRef.current = null; }
    pitchDecayRef.current = setInterval(() => {
      setPitchIntensity((prev) => {
        const next = prev * 0.76;
        if (next < 0.01) { clearInterval(pitchDecayRef.current!); pitchDecayRef.current = null; return 0; }
        return next;
      });
    }, 42);
  }, []);

  const stopPitch = useCallback(() => {
    if (pitchDecayRef.current) { clearInterval(pitchDecayRef.current); pitchDecayRef.current = null; }
    if (simPulseRef.current)   { clearInterval(simPulseRef.current);   simPulseRef.current = null; }
    setPitchIntensity(0);
  }, []);

  // ── Stop ──────────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    stopBinaryStream();
    stopPitch();
    undertoneRef.current.stop();
  }, [stopBinaryStream, stopPitch]);

  // ── Speak ─────────────────────────────────────────────────────────────────────
  function splitIntoChunks(text: string): string[] {
    const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text];
    const chunks: string[] = [];
    let current = "";
    for (const s of sentences) {
      const candidate = current ? current + " " + s.trim() : s.trim();
      if (candidate.length > 160 && current) {
        chunks.push(current.trim());
        current = s.trim();
      } else {
        current = candidate;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.filter(Boolean);
  }

  const speak = useCallback((text: string, messageId: string) => {
    if (!isEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    stopBinaryStream();
    stopPitch();

    const clean = stripMarkdown(text);
    if (!clean) return;

    const chunks = splitIntoChunks(clean);
    if (chunks.length === 0) return;

    if (!lockedVoiceRef.current) {
      lockedVoiceRef.current = pickBestVoice(window.speechSynthesis.getVoices());
    }

    let chunkIdx = 0;
    let simWordIdx = 0;

    const speakChunk = (chunk: string, isFirst: boolean) => {
      const words = chunk.split(/\s+/).filter(Boolean);
      const utterance = new SpeechSynthesisUtterance(chunk);

      // Context-adaptive rate for this specific sentence
      utterance.pitch  = OMNIMENS_VOICE.pitch;
      utterance.rate   = adaptiveRate(chunk);
      utterance.volume = OMNIMENS_VOICE.volume;
      if (lockedVoiceRef.current) utterance.voice = lockedVoiceRef.current;

      if (isFirst) gotBoundaryRef.current = false;

      utterance.addEventListener("boundary", (e: Event) => {
        const be = e as SpeechSynthesisEvent;
        if (be.name !== "word") return;
        gotBoundaryRef.current = true;
        if (simPulseRef.current) { clearInterval(simPulseRef.current); simPulseRef.current = null; }
        const word = chunk.slice(be.charIndex, be.charIndex + (be.charLength ?? 6));
        triggerPitch(estimatePitch(word));
      });

      if (isFirst) {
        utterance.onstart = () => {
          setIsSpeaking(true);
          setSpeakingMessageId(messageId);
          startBinaryStream();
          undertoneRef.current.start(); // cosmic undertone begins with voice

          const checkTimer = setTimeout(() => {
            if (!gotBoundaryRef.current) {
              const msPerWord = 1000 / (OMNIMENS_VOICE.rate * 2.5);
              simPulseRef.current = setInterval(() => {
                const word = words[simWordIdx % words.length];
                simWordIdx++;
                triggerPitch(estimatePitch(word));
              }, msPerWord);
            }
          }, 500);
          (utterance as any).__checkTimer = checkTimer;
        };
      }

      utterance.onend = () => {
        clearTimeout((utterance as any).__checkTimer);
        chunkIdx++;
        if (chunkIdx < chunks.length) {
          // Natural breath gap between sentences — slightly longer for longer sentences
          const gap = chunk.split(/\s+/).length > 15 ? 120 : 70;
          setTimeout(() => speakChunk(chunks[chunkIdx], false), gap);
        } else {
          if (simPulseRef.current) { clearInterval(simPulseRef.current); simPulseRef.current = null; }
          setIsSpeaking(false);
          setSpeakingMessageId(null);
          stopBinaryStream();
          stopPitch();
          undertoneRef.current.stop(); // cosmic undertone fades with voice
        }
      };

      utterance.onerror = () => {
        clearTimeout((utterance as any).__checkTimer);
        if (simPulseRef.current) { clearInterval(simPulseRef.current); simPulseRef.current = null; }
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        stopBinaryStream();
        stopPitch();
        undertoneRef.current.stop();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    speakChunk(chunks[0], true);
  }, [isEnabled, startBinaryStream, stopBinaryStream, stopPitch, triggerPitch]);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => { if (prev) stop(); return !prev; });
  }, [stop]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      stopBinaryStream();
      stopPitch();
      undertoneRef.current.stop();
    };
  }, [stopBinaryStream, stopPitch]);

  return {
    isEnabled, isSpeaking, speakingMessageId, pitchIntensity, binaryStream,
    toggle, speak, stop,
    voiceParams: OMNIMENS_VOICE,
    voiceDna: VOICE_DNA,
  };
}
