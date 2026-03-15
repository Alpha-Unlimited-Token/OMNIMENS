import { useCallback, useEffect, useRef, useState } from "react";

/**
 * GODFLESH VOICE DNA
 * G=01000111  O=01001111  D=01000100  F=01000110
 * L=01001100  E=01000101  S=01010011  H=01001000
 */
const VOICE_DNA =
  "0100011101001111010001000100011001001100010001010101001101001000";

function bitsToFloat(bits: string, min: number, max: number): number {
  const decimal = parseInt(bits, 2);
  return min + (decimal / 255) * (max - min);
}

export const GODFLESH_VOICE = {
  pitch: bitsToFloat(VOICE_DNA.slice(0, 8), 0.05, 0.55),
  rate:  bitsToFloat(VOICE_DNA.slice(8, 16), 0.72, 0.96),
  volume: 1.0,
};

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/>\s*/g, "")
    .replace(/---/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim();
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const preferred = [
    "Google UK English Male", "Microsoft David Desktop",
    "Microsoft Mark", "Alex", "Daniel", "Fred",
  ];
  for (const name of preferred) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  return voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null;
}

/**
 * Estimate pitch intensity (0–1) from a spoken word.
 * Short punchy words spike high. Long vowel-rich words are mid-range.
 * Punctuation creates characteristic patterns.
 */
function estimatePitch(word: string): number {
  const clean = word.replace(/[^a-zA-Z]/g, "");
  if (!clean) return word.includes("!") ? 0.9 : 0.35; // punctuation pulse
  const vowels = (clean.match(/[aeiouAEIOU]/g) || []).length;
  const vowelRatio = vowels / clean.length;
  const isAllCaps = clean.length > 1 && clean === clean.toUpperCase();
  const hasExcl  = word.includes("!");
  const hasQuestion = word.includes("?");
  let p = 0.2 + vowelRatio * 0.55;
  if (clean.length <= 3) p = Math.min(1, p + 0.25);   // short = punchy
  if (isAllCaps)         p = Math.min(1, p * 1.5);
  if (hasExcl)           p = Math.min(1, p + 0.35);
  if (hasQuestion)       p = Math.min(1, p + 0.15);
  return Math.max(0.08, Math.min(1.0, p));
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
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [pitchIntensity, setPitchIntensity] = useState(0);
  const [binaryStream, setBinaryStream] = useState("");

  const utteranceRef     = useRef<SpeechSynthesisUtterance | null>(null);
  const binaryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pitchDecayRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const simPulseRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const gotBoundaryRef   = useRef(false);

  // ── Binary stream ────────────────────────────────────────────────────────────
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
    if (binaryIntervalRef.current) { clearInterval(binaryIntervalRef.current); binaryIntervalRef.current = null; }
    setBinaryStream("");
  }, []);

  // ── Pitch intensity management ────────────────────────────────────────────────
  const triggerPitch = useCallback((value: number) => {
    setPitchIntensity(value);
    // Restart decay
    if (pitchDecayRef.current) { clearInterval(pitchDecayRef.current); pitchDecayRef.current = null; }
    pitchDecayRef.current = setInterval(() => {
      setPitchIntensity((prev) => {
        const next = prev * 0.82;
        if (next < 0.01) {
          clearInterval(pitchDecayRef.current!);
          pitchDecayRef.current = null;
          return 0;
        }
        return next;
      });
    }, 40);
  }, []);

  const stopPitch = useCallback(() => {
    if (pitchDecayRef.current) { clearInterval(pitchDecayRef.current); pitchDecayRef.current = null; }
    if (simPulseRef.current)   { clearInterval(simPulseRef.current);   simPulseRef.current = null; }
    setPitchIntensity(0);
  }, []);

  // ── Stop all ─────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    stopBinaryStream();
    stopPitch();
  }, [stopBinaryStream, stopPitch]);

  // ── Speak ────────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string, messageId: string) => {
    if (!isEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    stopBinaryStream();
    stopPitch();

    const clean = stripMarkdown(text);
    if (!clean) return;

    const words = clean.split(/\s+/).filter(Boolean);
    const voices = window.speechSynthesis.getVoices();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.pitch  = GODFLESH_VOICE.pitch;
    utterance.rate   = GODFLESH_VOICE.rate;
    utterance.volume = GODFLESH_VOICE.volume;

    const voice = pickVoice(voices);
    if (voice) utterance.voice = voice;

    gotBoundaryRef.current = false;
    let wordIdx = 0;

    // Real word-boundary events (Chrome/Edge) → precise pitch per word
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

      // Simulation fallback: if no boundary events in 600ms, pulse on timer
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

      // Store checkTimer so we can clear if speech ends fast
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
