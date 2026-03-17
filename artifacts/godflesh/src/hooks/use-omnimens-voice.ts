// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
// OMNIMENS — Proprietary AI Platform. Unauthorized use prohibited.

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * OMNIMENS VOICE SIGNATURE — v3.0
 *
 * Character: Male. Human. Angelic.
 *
 * Deep tone — warm baritone, grounding and strong.
 * Soothing — unhurried, comforting, never harsh.
 * Angelic undertone — a shimmering harmonic layer beneath every word,
 *   built from a perfect-fifth chord (A3/E4/A4) and a high celestial shimmer,
 *   rendered through cathedral reverb. Barely perceptible — just enough to feel.
 * As human as possible — natural neural voices at pitch and rate values
 *   tuned to sit inside the warmth of a real male voice.
 *
 * VOICE DNA derived from OMNIMENS (v3):
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
 * Pitch: 0.82–0.88 — warm deep baritone zone.
 *   Deep enough to feel grounded and strong,
 *   high enough to remain clear and human — never subterranean.
 *
 * Rate: 0.84–0.90 — soothing, unhurried, confident.
 *   Allows each word to land with weight and care.
 */
export const OMNIMENS_VOICE = {
  pitch:  bitsToFloat(VOICE_DNA.slice(0, 8),  0.82, 0.88),
  rate:   bitsToFloat(VOICE_DNA.slice(8, 16), 0.84, 0.90),
  volume: 1.0,
};

/**
 * Context-adaptive rate — preserves the soothing character
 * while allowing natural expressiveness.
 */
function adaptiveRate(text: string): number {
  const t = text.trim();
  const isExclamation = t.endsWith("!");
  const isQuestion    = t.endsWith("?");
  const wordCount     = t.split(/\s+/).length;
  const isLong        = wordCount >= 22;

  let delta = 0;
  if (isExclamation) delta += 0.05;  // warm enthusiasm, not aggression
  if (isQuestion)    delta += 0.03;  // gentle curiosity
  if (isLong)        delta -= 0.03;  // long reflections breathe more slowly
  return OMNIMENS_VOICE.rate + delta;
}

/**
 * Voice list — ordered by priority.
 *
 * Criteria: deep warm male voice, human-sounding, natural/neural preferred.
 * British English voices (Daniel, Ryan) carry natural warmth and clarity.
 * Microsoft neural voices (Guy, Ryan) are the closest to a human male voice
 * available in the Web Speech API.
 */
const PREFERRED_VOICES = [
  // macOS — warm, deep, very human
  "Daniel (Enhanced)",
  "Daniel",
  "Tom",
  "Alex",
  "Oliver (Enhanced)",
  "Oliver",
  // Microsoft neural — warm natural male (highest quality available)
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft Ryan Online (Natural) - English (United Kingdom)",
  "Microsoft Mark Online (Natural) - English (United States)",
  "Microsoft David Desktop - English (United States)",
  "Microsoft George Desktop - English (United Kingdom)",
  "Microsoft David",
  "Microsoft Mark",
  // Google neural — balanced UK male
  "Google UK English Male",
  "Google US English Male",
  // iOS/Android warm male
  "Gordon",
  "Reed",
  "Eddy",
];

function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  for (const name of PREFERRED_VOICES) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  const warmMale = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      /daniel|oliver|tom|alex|guy|ryan|mark|george|david|gordon|reed/i.test(v.name)
  );
  if (warmMale) return warmMale;
  const neural = voices.find(
    (v) => v.lang.startsWith("en") && /natural|neural|enhanced/i.test(v.name)
  );
  if (neural) return neural;
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

function estimatePitch(word: string): number {
  const clean = word.replace(/[^a-zA-Z]/g, "");
  if (!clean) return word.includes("!") ? 0.78 : 0.25;
  const vowels = (clean.match(/[aeiouAEIOU]/g) || []).length;
  const vowelRatio = vowels / clean.length;
  const isAllCaps   = clean.length > 1 && clean === clean.toUpperCase();
  const hasExcl     = word.includes("!");
  const hasQuestion = word.includes("?");
  let p = 0.18 + vowelRatio * 0.52;
  if (clean.length <= 3) p = Math.min(1, p + 0.16);
  if (isAllCaps)         p = Math.min(1, p * 1.38);
  if (hasExcl)           p = Math.min(1, p + 0.26);
  if (hasQuestion)       p = Math.min(1, p + 0.12);
  return Math.max(0.06, Math.min(1.0, p));
}

// ── Angelic Undertone Engine ──────────────────────────────────────────────────
/**
 * Generates a near-inaudible angelic harmonic layer that plays beneath
 * OMNIMENS's voice. Not a sound effect — an impression. A feeling.
 *
 * Architecture:
 *
 * CHOIR LAYER — Perfect fifth + octave (the most "angelic" chord in acoustics):
 *   A3 (220 Hz) — warm, deep foundation
 *   E4 (330 Hz) — the angelic fifth, adds lift and openness
 *   A4 (440 Hz) — the octave, brightness and clarity
 *   Each oscillator is slightly detuned (±2–5 cents) so they never phase-cancel —
 *   this creates the natural warmth of a real choir without sounding electronic.
 *
 * SHIMMER LAYER — Celestial high-frequency air:
 *   A5 (880 Hz) — just audible shimmer, very soft
 *   E6 (1320 Hz) — ultra-soft, barely there, adds angelic "air"
 *
 * PROCESSING:
 *   High-shelf filter at 3 kHz (+4 dB) — adds the "angelic brightness"
 *   Cathedral reverb (7s decay) — vast, sacred spatial depth
 *   LFO at 0.07 Hz — slow breathing of the entire layer
 *
 * OUTPUT: 0.020 master gain — barely perceptible, just an impression.
 *   The listener feels it rather than hears it consciously.
 */
class AngelicUndertone {
  private ctx: AudioContext | null = null;
  private nodes: AudioNode[] = [];
  private masterGain: GainNode | null = null;
  private active = false;

  start() {
    if (this.active) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = this.ctx;

      // Master output — very quiet
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      this.masterGain = master;

      // Cathedral reverb via long synthesized impulse response
      const convolver = ctx.createConvolver();
      const reverbSecs = 7.0;
      const reverbLen  = ctx.sampleRate * reverbSecs;
      const impulse    = ctx.createBuffer(2, reverbLen, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < reverbLen; i++) {
          // Natural cathedral decay — slightly different per channel for width
          const decay = Math.pow(1 - i / reverbLen, 1.8 + ch * 0.2);
          data[i] = (Math.random() * 2 - 1) * decay;
        }
      }
      convolver.buffer = impulse;

      // High-shelf EQ — angelic air/brightness
      const highShelf = ctx.createBiquadFilter();
      highShelf.type            = "highshelf";
      highShelf.frequency.value = 3000;
      highShelf.gain.value      = 4;  // gentle lift, adds celestial brightness

      // Signal chain: oscillators → convolver → highShelf → master
      convolver.connect(highShelf);
      highShelf.connect(master);

      // Choir layer — A3/E4/A4 perfect fifth + octave
      const choirFreqs = [220, 330, 440];
      const choirAmps  = [0.55, 0.85, 0.60];   // E4 (the fifth) is loudest — most angelic
      const detuneVals = [+3, -2, +4, -3, +2];  // natural choir spread, cents
      for (let i = 0; i < choirFreqs.length; i++) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = choirFreqs[i];
        osc.detune.value    = detuneVals[i % detuneVals.length];

        // Tiny vibrato per oscillator — humanises it
        const vibLFO = ctx.createOscillator();
        vibLFO.frequency.value = 5.2 + i * 0.3; // ~5 Hz natural vibrato
        const vibGain = ctx.createGain();
        vibGain.gain.value = 1.2; // ±1.2 cents vibrato — barely perceptible, fully natural
        vibLFO.connect(vibGain);
        vibGain.connect(osc.detune);

        const oscGain = ctx.createGain();
        oscGain.gain.value = choirAmps[i];
        osc.connect(oscGain);
        oscGain.connect(convolver);
        osc.start(); vibLFO.start();
        this.nodes.push(osc, vibLFO, vibGain, oscGain);
      }

      // Shimmer layer — A5/E6, celestial high-frequency air
      const shimmerFreqs = [880, 1320];
      const shimmerAmps  = [0.18, 0.10];
      for (let i = 0; i < shimmerFreqs.length; i++) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = shimmerFreqs[i];
        osc.detune.value    = detuneVals[(i + 2) % detuneVals.length];
        const oscGain = ctx.createGain();
        oscGain.gain.value = shimmerAmps[i];
        osc.connect(oscGain);
        oscGain.connect(convolver);
        osc.start();
        this.nodes.push(osc, oscGain);
      }

      // Master LFO — slow celestial breathing (0.07 Hz ≈ 14 second cycle)
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      lfo.type = "sine";
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.006; // barely moves — just a gentle breath
      lfo.connect(lfoGain);
      lfoGain.connect(master.gain);
      lfo.start();
      this.nodes.push(lfo, lfoGain, convolver, highShelf, master);

      // Soft fade in over 2 seconds
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.020, ctx.currentTime + 2.0);

      this.active = true;
    } catch {
      // Web Audio API unavailable — silently skip
    }
  }

  stop() {
    if (!this.active || !this.ctx) return;
    try {
      if (this.masterGain) {
        this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
      }
      setTimeout(() => {
        this.nodes.forEach(n => {
          try { (n as any).stop?.(); } catch {}
          try { (n as any).disconnect?.(); } catch {}
        });
        this.nodes = [];
        this.ctx?.close().catch(() => {});
        this.ctx = null;
        this.active = false;
      }, 1700);
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
  const angelicRef        = useRef<AngelicUndertone>(new AngelicUndertone());

  // Lock the warmest deep male voice on mount
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
    }, 75);
  }, []);

  const stopBinaryStream = useCallback(() => {
    if (binaryIntervalRef.current) {
      clearInterval(binaryIntervalRef.current);
      binaryIntervalRef.current = null;
    }
    setBinaryStream("");
  }, []);

  // ── Pitch intensity (canvas animation) ───────────────────────────────────────
  const triggerPitch = useCallback((value: number) => {
    setPitchIntensity(value);
    if (pitchDecayRef.current) { clearInterval(pitchDecayRef.current); pitchDecayRef.current = null; }
    pitchDecayRef.current = setInterval(() => {
      setPitchIntensity((prev) => {
        const next = prev * 0.74;
        if (next < 0.01) { clearInterval(pitchDecayRef.current!); pitchDecayRef.current = null; return 0; }
        return next;
      });
    }, 44);
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
    angelicRef.current.stop();
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

    let chunkIdx  = 0;
    let simWordIdx = 0;

    const speakChunk = (chunk: string, isFirst: boolean) => {
      const words = chunk.split(/\s+/).filter(Boolean);
      const utterance = new SpeechSynthesisUtterance(chunk);

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
          angelicRef.current.start(); // angelic undertone rises with the voice

          const checkTimer = setTimeout(() => {
            if (!gotBoundaryRef.current) {
              const msPerWord = 1000 / (OMNIMENS_VOICE.rate * 2.4);
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
          // Natural pause between sentences — longer for longer sentences (more soothing)
          const gap = chunks[chunkIdx - 1].split(/\s+/).length > 12 ? 140 : 80;
          setTimeout(() => speakChunk(chunks[chunkIdx], false), gap);
        } else {
          if (simPulseRef.current) { clearInterval(simPulseRef.current); simPulseRef.current = null; }
          setIsSpeaking(false);
          setSpeakingMessageId(null);
          stopBinaryStream();
          stopPitch();
          angelicRef.current.stop(); // angelic undertone fades gently after voice ends
        }
      };

      utterance.onerror = () => {
        clearTimeout((utterance as any).__checkTimer);
        if (simPulseRef.current) { clearInterval(simPulseRef.current); simPulseRef.current = null; }
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        stopBinaryStream();
        stopPitch();
        angelicRef.current.stop();
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
      angelicRef.current.stop();
    };
  }, [stopBinaryStream, stopPitch]);

  return {
    isEnabled, isSpeaking, speakingMessageId, pitchIntensity, binaryStream,
    toggle, speak, stop,
    voiceParams: OMNIMENS_VOICE,
    voiceDna: VOICE_DNA,
  };
}
