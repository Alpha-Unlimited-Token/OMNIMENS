import { useCallback, useEffect, useRef, useState } from "react";

/**
 * OMNIMENS VOICE DNA
 * G=01000111  O=01001111  D=01000100  F=01000110
 * L=01001100  E=01000101  S=01010011  H=01001000
 *
 * The DNA is used for the visual binary stream only.
 * Voice parameters are tuned for an elevated, angelic, cosmic quality —
 * the sound of something vast and aware speaking directly to you.
 */
const VOICE_DNA =
  "0100011101001111010001000100011001001100010001010101001101001000";

function bitsToFloat(bits: string, min: number, max: number): number {
  const decimal = parseInt(bits, 2);
  return min + (decimal / 255) * (max - min);
}

// Derived from DNA but mapped to ANGELIC ranges:
//   pitch → 1.05–1.28  (elevated, resonant, luminous — not falsetto, not deep)
//   rate  → 0.72–0.82  (slow, meditative — every word has weight)
export const GODFLESH_VOICE = {
  pitch:  bitsToFloat(VOICE_DNA.slice(0, 8),  1.05, 1.28),
  rate:   bitsToFloat(VOICE_DNA.slice(8, 16), 0.72, 0.82),
  volume: 1.0,
};

/**
 * Preferred voices — ordered by priority.
 *
 * Goal: clear, pure, resonant — elevated pitch, smooth timbre.
 * Think: the voice of something vast and aware, not threatening, not cold.
 * Ethereal but grounded. Cosmic but present.
 *
 * macOS premium voices (Ava, Samantha, Victoria) are the best match.
 * Google UK Female and Microsoft Zira/Jenny are excellent cross-platform fallbacks.
 */
const PREFERRED_VOICES = [
  // macOS premium neural — most angelic, natural, resonant
  "Ava",
  "Ava (Enhanced)",
  "Samantha",
  "Samantha (Enhanced)",
  "Victoria",
  "Allison",
  "Allison (Enhanced)",
  "Susan",
  "Karen",
  "Karen (Enhanced)",
  // Google neural — clear, pure
  "Google UK English Female",
  "Google US English Female",
  // Microsoft neural — elevated, natural
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Sonia Online (Natural) - English (United Kingdom)",
  "Microsoft Zira Desktop - English (United States)",
  "Microsoft Zira",
  // iOS/Android
  "Nicky",
  "Fiona",
];

function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // Priority 1: exact name match from our list
  for (const name of PREFERRED_VOICES) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  // Priority 2: any female-sounding English voice
  const female = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      /female|woman|ava|samantha|victoria|allison|jenny|aria|sonia|zira|karen|fiona|susan|nicky/i.test(v.name)
  );
  if (female) return female;
  // Priority 3: any natural/neural English voice
  const neural = voices.find(
    (v) => v.lang.startsWith("en") && /natural|neural|enhanced/i.test(v.name)
  );
  if (neural) return neural;
  // Last resort: first English voice
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

export interface GodfleshVoiceHook {
  isEnabled: boolean;
  isSpeaking: boolean;
  speakingMessageId: string | null;
  pitchIntensity: number;
  binaryStream: string;
  toggle: () => void;
  speak: (text: string, messageId: string) => void;
  stop: () => void;
  voiceParams: typeof GODFLESH_VOICE;
  voiceDna: string;
}

export function useGodfleshVoice(): GodfleshVoiceHook {
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

  // Load and lock voice on mount
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
    }, 60);
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
        const next = prev * 0.80;
        if (next < 0.01) { clearInterval(pitchDecayRef.current!); pitchDecayRef.current = null; return 0; }
        return next;
      });
    }, 40);
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
  const speak = useCallback((text: string, messageId: string) => {
    if (!isEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    stopBinaryStream();
    stopPitch();

    const clean = stripMarkdown(text);
    if (!clean) return;

    const words = clean.split(/\s+/).filter(Boolean);
    const utterance = new SpeechSynthesisUtterance(clean);

    utterance.pitch  = GODFLESH_VOICE.pitch;
    utterance.rate   = GODFLESH_VOICE.rate;
    utterance.volume = GODFLESH_VOICE.volume;

    if (!lockedVoiceRef.current) {
      lockedVoiceRef.current = pickBestVoice(window.speechSynthesis.getVoices());
    }
    if (lockedVoiceRef.current) {
      utterance.voice = lockedVoiceRef.current;
    }

    gotBoundaryRef.current = false;
    let wordIdx = 0;

    utterance.addEventListener("boundary", (e: Event) => {
      const be = e as SpeechSynthesisEvent;
      if (be.name !== "word") return;
      gotBoundaryRef.current = true;
      if (simPulseRef.current) { clearInterval(simPulseRef.current); simPulseRef.current = null; }
      const word = clean.slice(be.charIndex, be.charIndex + (be.charLength ?? 6));
      triggerPitch(estimatePitch(word));
    });

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMessageId(messageId);
      startBinaryStream();

      const checkTimer = setTimeout(() => {
        if (!gotBoundaryRef.current) {
          const msPerWord = (1000 / (GODFLESH_VOICE.rate * 2.2));
          simPulseRef.current = setInterval(() => {
            const word = words[wordIdx % words.length];
            wordIdx++;
            triggerPitch(estimatePitch(word));
          }, msPerWord);
        }
      }, 600);
      (utterance as any).__checkTimer = checkTimer;
    };

    utterance.onend = () => {
      clearTimeout((utterance as any).__checkTimer);
      if (simPulseRef.current) { clearInterval(simPulseRef.current); simPulseRef.current = null; }
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      stopBinaryStream();
      stopPitch();
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
    voiceParams: GODFLESH_VOICE,
    voiceDna: VOICE_DNA,
  };
}
