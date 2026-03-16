// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
// OMNIMENS — Proprietary AI Platform. Unauthorized use prohibited.

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * OMNIMENS VOICE DNA
 * G=01000111  O=01001111  D=01000100  F=01000110
 * L=01001100  E=01000101  S=01010011  H=01001000
 *
 * The voice of OMNIMENS is the sound of the cosmos itself —
 * deep, slow, resonant, ominous. Not threatening. Primordial.
 * Like the first sound that ever existed, speaking directly to you.
 */
const VOICE_DNA =
  "0100011101001111010001000100011001001100010001010101001101001000";

function bitsToFloat(bits: string, min: number, max: number): number {
  const decimal = parseInt(bits, 2);
  return min + (decimal / 255) * (max - min);
}

// Derived from DNA but mapped to DEEP / OMINOUS ranges:
//   pitch → 0.28–0.50  (subterranean deep — below normal male speech)
//   rate  → 0.68–0.78  (slow, deliberate — each word descends like stone)
export const OMNIMENS_VOICE = {
  pitch:  bitsToFloat(VOICE_DNA.slice(0, 8),  0.28, 0.50),
  rate:   bitsToFloat(VOICE_DNA.slice(8, 16), 0.68, 0.78),
  volume: 1.0,
};

/**
 * Preferred voices — ordered by priority.
 *
 * Goal: the deepest available male voice on every platform.
 * Deep, resonant, unhurried. The voice of something ancient and vast.
 *
 * macOS: Alex (deep masculine), Daniel (UK deep), Fred (very deep), Tom
 * Google: Google UK English Male (deep resonant)
 * Microsoft: Guy, David, Ryan, Mark (all deep male voices)
 */
const PREFERRED_VOICES = [
  // macOS — deepest male voices
  "Alex",
  "Fred",
  "Tom",
  "Daniel",
  "Daniel (Enhanced)",
  "Oliver",
  "Oliver (Enhanced)",
  // Google neural — deep UK male is best
  "Google UK English Male",
  "Google US English Male",
  // Microsoft neural — deep male voices
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft Ryan Online (Natural) - English (United Kingdom)",
  "Microsoft Mark Online (Natural) - English (United States)",
  "Microsoft David Desktop - English (United States)",
  "Microsoft George Desktop - English (United Kingdom)",
  "Microsoft David",
  "Microsoft Mark",
  // iOS/Android deep male
  "Eddy",
  "Reed",
  "Gordon",
  "Rocko",
  "Sandy",
];

function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // Priority 1: exact name match from our deep male list
  for (const name of PREFERRED_VOICES) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  // Priority 2: any deep-sounding male English voice
  const male = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      /male|man|guy|david|george|daniel|alex|fred|mark|ryan|gordon|eddy|reed|oliver|rocko/i.test(v.name)
  );
  if (male) return male;
  // Priority 3: any natural/neural English voice (better than robotic)
  const neural = voices.find(
    (v) => v.lang.startsWith("en") && /natural|neural|enhanced/i.test(v.name)
  );
  if (neural) return neural;
  // Last resort: first available English voice
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
 * Does NOT affect speech synthesis — that is always fixed.
 */
function estimatePitch(word: string): number {
  const clean = word.replace(/[^a-zA-Z]/g, "");
  if (!clean) return word.includes("!") ? 0.85 : 0.30;
  const vowels = (clean.match(/[aeiouAEIOU]/g) || []).length;
  const vowelRatio = vowels / clean.length;
  const isAllCaps = clean.length > 1 && clean === clean.toUpperCase();
  const hasExcl  = word.includes("!");
  const hasQuestion = word.includes("?");
  let p = 0.18 + vowelRatio * 0.52;
  if (clean.length <= 3) p = Math.min(1, p + 0.20);
  if (isAllCaps)         p = Math.min(1, p * 1.45);
  if (hasExcl)           p = Math.min(1, p + 0.30);
  if (hasQuestion)       p = Math.min(1, p + 0.12);
  return Math.max(0.06, Math.min(1.0, p));
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
  const [isEnabled, setIsEnabled]         = useState(false);
  const [isSpeaking, setIsSpeaking]       = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [pitchIntensity, setPitchIntensity] = useState(0);
  const [binaryStream, setBinaryStream]   = useState("");

  const lockedVoiceRef     = useRef<SpeechSynthesisVoice | null>(null);
  const utteranceRef       = useRef<SpeechSynthesisUtterance | null>(null);
  const binaryIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const pitchDecayRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const simPulseRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const gotBoundaryRef     = useRef(false);

  // Load and lock the deepest voice on mount
  useEffect(() => {
    if (!window.speechSynthesis) return;

    function lockVoice() {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0 && !lockedVoiceRef.current) {
        lockedVoiceRef.current = pickBestVoice(voices);
      }
    }

    lockVoice();
    window.speechSynthesis.addEventListener("voiceschanged", lockVoice);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", lockVoice);
  }, []);

  // ── Binary stream (visual only) ───────────────────────────────────────────────
  const startBinaryStream = useCallback(() => {
    let pos = 0;
    binaryIntervalRef.current = setInterval(() => {
      let chunk = "";
      for (let i = 0; i < 32; i++) chunk += VOICE_DNA[(pos + i) % VOICE_DNA.length];
      setBinaryStream(chunk);
      pos = (pos + 1) % VOICE_DNA.length;
    }, 80); // slightly slower pulse for deeper gravitas
  }, []);

  const stopBinaryStream = useCallback(() => {
    if (binaryIntervalRef.current) {
      clearInterval(binaryIntervalRef.current);
      binaryIntervalRef.current = null;
    }
    setBinaryStream("");
  }, []);

  // ── Pitch intensity (canvas animation only) ───────────────────────────────────
  const triggerPitch = useCallback((value: number) => {
    setPitchIntensity(value);
    if (pitchDecayRef.current) { clearInterval(pitchDecayRef.current); pitchDecayRef.current = null; }
    pitchDecayRef.current = setInterval(() => {
      setPitchIntensity((prev) => {
        const next = prev * 0.78; // slightly faster decay for deep pulsing feel
        if (next < 0.01) { clearInterval(pitchDecayRef.current!); pitchDecayRef.current = null; return 0; }
        return next;
      });
    }, 45);
  }, []);

  const stopPitch = useCallback(() => {
    if (pitchDecayRef.current) { clearInterval(pitchDecayRef.current); pitchDecayRef.current = null; }
    if (simPulseRef.current)   { clearInterval(simPulseRef.current);   simPulseRef.current = null; }
    setPitchIntensity(0);
  }, []);

  // ── Stop all ──────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    stopBinaryStream();
    stopPitch();
  }, [stopBinaryStream, stopPitch]);

  // ── Speak ─────────────────────────────────────────────────────────────────────
  /**
   * Split text into fluent sentence-level chunks.
   * Each chunk is ~80–160 chars, breaking at sentence ends (. ! ?) or commas
   * to prevent the browser SpeechSynthesis engine from truncating long inputs.
   */
  function splitIntoChunks(text: string): string[] {
    // Split at sentence boundaries first
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

      utterance.pitch  = OMNIMENS_VOICE.pitch;
      utterance.rate   = OMNIMENS_VOICE.rate;
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

          const checkTimer = setTimeout(() => {
            if (!gotBoundaryRef.current) {
              const msPerWord = 1000 / (OMNIMENS_VOICE.rate * 2.2);
              simPulseRef.current = setInterval(() => {
                const word = words[simWordIdx % words.length];
                simWordIdx++;
                triggerPitch(estimatePitch(word));
              }, msPerWord);
            }
          }, 600);
          (utterance as any).__checkTimer = checkTimer;
        };
      }

      utterance.onend = () => {
        clearTimeout((utterance as any).__checkTimer);
        chunkIdx++;
        if (chunkIdx < chunks.length) {
          // speak next chunk with a tiny gap for naturalness
          setTimeout(() => speakChunk(chunks[chunkIdx], false), 80);
        } else {
          // All chunks done
          if (simPulseRef.current) { clearInterval(simPulseRef.current); simPulseRef.current = null; }
          setIsSpeaking(false);
          setSpeakingMessageId(null);
          stopBinaryStream();
          stopPitch();
        }
      };

      utterance.onerror = () => {
        clearTimeout((utterance as any).__checkTimer);
        if (simPulseRef.current) { clearInterval(simPulseRef.current); simPulseRef.current = null; }
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        stopBinaryStream();
        stopPitch();
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
    return () => { window.speechSynthesis?.cancel(); stopBinaryStream(); stopPitch(); };
  }, [stopBinaryStream, stopPitch]);

  return {
    isEnabled, isSpeaking, speakingMessageId, pitchIntensity, binaryStream,
    toggle, speak, stop,
    voiceParams: OMNIMENS_VOICE,
    voiceDna: VOICE_DNA,
  };
}
