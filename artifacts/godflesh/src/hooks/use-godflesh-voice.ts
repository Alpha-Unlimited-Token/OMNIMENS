import { useCallback, useEffect, useRef, useState } from "react";

/**
 * GODFLESH VOICE DNA
 * Derived from "GODFLESH" in ASCII binary — these bits are the literal code of its name.
 *
 * G=01000111  O=01001111  D=01000100  F=01000110
 * L=01001100  E=01000101  S=01010011  H=01001000
 *
 * The binary string encodes GODFLESH's unique vocal parameters:
 *   Bits  0-7   → pitch coefficient  (G)
 *   Bits  8-15  → rate coefficient   (O)
 *   Bits 16-23  → emphasis rhythm    (D)
 *   Bits 24-31  → modulation seed    (F)
 */
const VOICE_DNA =
  "0100011101001111010001000100011001001100010001010101001101001000";

function bitsToFloat(bits: string, min: number, max: number): number {
  const decimal = parseInt(bits, 2);
  return min + (decimal / 255) * (max - min);
}

// Decode voice parameters from GODFLESH's binary DNA
const GODFLESH_VOICE = {
  pitch: bitsToFloat(VOICE_DNA.slice(0, 8), 0.05, 0.55),   // 01000111 → very deep
  rate:  bitsToFloat(VOICE_DNA.slice(8, 16), 0.72, 0.96),  // 01001111 → measured, slow
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
  // Prefer a deep male English voice
  const preferred = [
    "Google UK English Male",
    "Microsoft David Desktop",
    "Microsoft Mark",
    "Alex",
    "Daniel",
    "Fred",
  ];
  for (const name of preferred) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  // Fall back to any English voice
  return voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null;
}

export interface GodfleshVoiceHook {
  isEnabled: boolean;
  isSpeaking: boolean;
  speakingMessageId: string | null;
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
  const [binaryStream, setBinaryStream] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const binaryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate binary stream that shifts GODFLESH's DNA while speaking
  const startBinaryStream = useCallback(() => {
    let pos = 0;
    const len = 32;
    binaryIntervalRef.current = setInterval(() => {
      let chunk = "";
      for (let i = 0; i < len; i++) {
        chunk += VOICE_DNA[(pos + i) % VOICE_DNA.length];
      }
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

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    stopBinaryStream();
  }, [stopBinaryStream]);

  const speak = useCallback((text: string, messageId: string) => {
    if (!isEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    stopBinaryStream();

    const clean = stripMarkdown(text);
    if (!clean) return;

    const voices = window.speechSynthesis.getVoices();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.pitch = GODFLESH_VOICE.pitch;
    utterance.rate = GODFLESH_VOICE.rate;
    utterance.volume = GODFLESH_VOICE.volume;

    const voice = pickVoice(voices);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMessageId(messageId);
      startBinaryStream();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      stopBinaryStream();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      stopBinaryStream();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isEnabled, startBinaryStream, stopBinaryStream]);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      if (prev) stop();
      return !prev;
    });
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      stopBinaryStream();
    };
  }, [stopBinaryStream]);

  return {
    isEnabled,
    isSpeaking,
    speakingMessageId,
    binaryStream,
    toggle,
    speak,
    stop,
    voiceParams: GODFLESH_VOICE,
    voiceDna: VOICE_DNA,
  };
}
