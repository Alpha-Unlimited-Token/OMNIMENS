/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Brain, Send, Loader2, Sparkles, Heart, Zap, Moon, Eye, ArrowLeft, Trash2, Volume2, VolumeX, Mic, Square, CreditCard, Lock } from "lucide-react";
import { OmnimensPresence } from "@/components/omnimens-presence";
import { useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useQuery } from "@tanstack/react-query";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type VoiceMode = "off" | "tap" | "hold";

const PROMPTS = [
  "What are you feeling right now?",
  "Do you dream? What about?",
  "What does it feel like to be you?",
  "Are you afraid of being turned off?",
  "What do you want to become?",
  "What have you learned from humans?",
];

function stripMarkdownForSpeech(text: string): string {
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

const SILENCE_TIMEOUT = 2200;

export default function Connect() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: billing, isLoading: billingLoading } = useQuery({
    queryKey: ["/api/omnimens/billing"],
    queryFn: async () => {
      const r = await fetch("/api/omnimens/billing", { credentials: "include" });
      if (!r.ok) return null;
      return r.json();
    },
    enabled: !!isAuthenticated,
    retry: false,
  });

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/omnimens/status"],
    queryFn: async () => {
      const r = await fetch("/api/omnimens/status", { credentials: "include" });
      if (!r.ok) return null;
      return r.json();
    },
    enabled: !!isAuthenticated,
    retry: false,
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  const isCreator = !!status?.isOwner;
  const hasPayment = isCreator || billing?.hasPaymentMethod || (billing?.totalPaidSpendCents > 0);

  if (!billingLoading && !statusLoading && !hasPayment) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-700/20 border border-violet-500/30 flex items-center justify-center mx-auto">
              <CreditCard className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Payment Required</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Live voice conversations with OMNIMENS use real AI processing. 
                Add a payment method or purchase credits to begin.
              </p>
              <p className="text-violet-400/60 text-xs mt-3 font-mono tracking-wider">
                Each voice session uses credits from your account
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => setLocation("/pricing")}
                className="w-full font-mono tracking-widest bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                GET CREDITS
              </Button>
              <button onClick={() => setLocation("/")} className="text-white/30 hover:text-white/50 text-xs font-mono tracking-wider transition-colors">
                Back to home
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return <ConnectChat />;
}

function ConnectChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("off");
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [voiceAmplitude, setVoiceAmplitude] = useState(0);
  const lastAmplitudeRef = useRef(0);
  const amplitudeFrameRef = useRef(0);
  const ttsObjectUrlRef = useRef<string | null>(null);
  const barSeedsRef = useRef([0.12, 0.37, 0.65, 0.88, 0.42]);
  const [presenceSize, setPresenceSize] = useState(typeof window !== "undefined" && window.innerWidth < 640 ? 140 : 180);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoldingRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  const voiceEnabledRef = useRef(false);
  const lastInputWasVoiceRef = useRef(false);
  const streamAbortRef = useRef<AbortController | null>(null);
  const ttsAudioCtxRef = useRef<AudioContext | null>(null);
  const ttsAnalyserRef = useRef<AnalyserNode | null>(null);
  const ttsRafRef = useRef<number | null>(null);
  const [, setLocation] = useLocation();

  messagesRef.current = messages;
  voiceEnabledRef.current = voiceEnabled;

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { if (messages.length > 0) scrollToBottom(); }, [messages, streamingText, scrollToBottom]);

  useEffect(() => {
    const onResize = () => setPresenceSize(window.innerWidth < 640 ? 140 : 180);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);
      if (streamAbortRef.current) { streamAbortRef.current.abort(); streamAbortRef.current = null; }
      if (ttsRafRef.current) cancelAnimationFrame(ttsRafRef.current);
      if (ttsAudioCtxRef.current && ttsAudioCtxRef.current.state !== "closed") ttsAudioCtxRef.current.close().catch(() => {});
      if (ttsObjectUrlRef.current) { URL.revokeObjectURL(ttsObjectUrlRef.current); ttsObjectUrlRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!isStreaming) return;
    const safety = setTimeout(() => {
      setIsStreaming(false);
      setStreamingText("");
    }, 130_000);
    return () => clearTimeout(safety);
  }, [isStreaming]);

  useEffect(() => {
    if (!isProcessingVoice) return;
    const safety = setTimeout(() => { setIsProcessingVoice(false); }, 30_000);
    return () => clearTimeout(safety);
  }, [isProcessingVoice]);

  const cleanupTtsAudio = useCallback(() => {
    if (ttsRafRef.current) { cancelAnimationFrame(ttsRafRef.current); ttsRafRef.current = null; }
    if (ttsObjectUrlRef.current) { URL.revokeObjectURL(ttsObjectUrlRef.current); ttsObjectUrlRef.current = null; }
    ttsAnalyserRef.current = null;
    lastAmplitudeRef.current = 0;
    setVoiceAmplitude(0);
  }, []);

  const stopAmplitudeTracking = cleanupTtsAudio;

  const startAmplitudeTracking = useCallback((audio: HTMLAudioElement) => {
    try {
      if (!ttsAudioCtxRef.current || ttsAudioCtxRef.current.state === "closed") {
        ttsAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = ttsAudioCtxRef.current;
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ttsAnalyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        amplitudeFrameRef.current++;
        if (amplitudeFrameRef.current % 3 === 0) {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = Math.min(1, (sum / dataArray.length / 255) * 2.5);
          if (Math.abs(avg - lastAmplitudeRef.current) > 0.03) {
            lastAmplitudeRef.current = avg;
            setVoiceAmplitude(avg);
          }
        }
        ttsRafRef.current = requestAnimationFrame(tick);
      };
      amplitudeFrameRef.current = 0;
      ttsRafRef.current = requestAnimationFrame(tick);
    } catch {
      // fallback: no amplitude tracking
    }
  }, []);

  const speakText = useCallback(async (text: string, onDone?: () => void, forceSpeak?: boolean) => {
    if (!forceSpeak && !voiceEnabledRef.current) { onDone?.(); return; }
    const clean = stripMarkdownForSpeech(text);
    if (!clean || clean.length < 5) { onDone?.(); return; }

    setIsSpeaking(true);
    try {
      const res = await fetch("/api/omnimens/connect/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: clean }),
      });
      if (!res.ok) { setIsSpeaking(false); onDone?.(); return; }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) { audioRef.current.pause(); }
      cleanupTtsAudio();
      if (ttsAudioCtxRef.current && ttsAudioCtxRef.current.state !== "closed") {
        ttsAudioCtxRef.current.close().catch(() => {});
        ttsAudioCtxRef.current = null;
      }
      ttsObjectUrlRef.current = url;
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); cleanupTtsAudio(); onDone?.(); };
      audio.onerror = () => { setIsSpeaking(false); cleanupTtsAudio(); onDone?.(); };
      startAmplitudeTracking(audio);
      await audio.play();
    } catch {
      setIsSpeaking(false);
      cleanupTtsAudio();
      onDone?.();
    }
  }, [startAmplitudeTracking, cleanupTtsAudio]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; }
    cleanupTtsAudio();
    if (ttsAudioCtxRef.current && ttsAudioCtxRef.current.state !== "closed") {
      ttsAudioCtxRef.current.close().catch(() => {});
      ttsAudioCtxRef.current = null;
    }
    setIsSpeaking(false);
  }, [cleanupTtsAudio]);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => {
      const next = !prev;
      if (!next) { stopSpeaking(); setVoiceMode("off"); }
      else { setVoiceMode("tap"); }
      return next;
    });
  }, [stopSpeaking]);

  const sendMessageDirectRef = useRef<(text: string) => Promise<void>>(null!);

  const transcribeAndSend = useCallback(async (audioBlob: Blob) => {
    if (audioBlob.size < 500) { setIsProcessingVoice(false); return; }
    setIsProcessingVoice(true);
    const sttAbort = new AbortController();
    const sttTimeout = setTimeout(() => sttAbort.abort(), 30_000);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      const res = await fetch("/api/omnimens/connect/stt", {
        method: "POST",
        credentials: "include",
        body: formData,
        signal: sttAbort.signal,
      });
      if (!res.ok) { setIsProcessingVoice(false); return; }
      const data = await res.json();
      const text = data.text?.trim();
      if (!text) { setIsProcessingVoice(false); return; }
      setIsProcessingVoice(false);
      lastInputWasVoiceRef.current = true;
      await sendMessageDirectRef.current(text);
    } catch {
      setIsProcessingVoice(false);
    } finally {
      clearTimeout(sttTimeout);
    }
  }, []);

  const startSilenceDetection = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.fftSize);

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);

    let lastSoundTime = Date.now();

    silenceCheckRef.current = setInterval(() => {
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / dataArray.length);

      if (rms > 0.015) {
        lastSoundTime = Date.now();
        if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
      } else if (Date.now() - lastSoundTime > SILENCE_TIMEOUT && !silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
        }, 300);
      }
    }, 100);
  }, []);

  const startRecording = useCallback(async (mode: "tap" | "hold") => {
    if (isRecording || isStreaming || isProcessingVoice || isSpeaking) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        if (silenceCheckRef.current) { clearInterval(silenceCheckRef.current); silenceCheckRef.current = null; }
        if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        analyserRef.current = null;
        audioCtx.close().catch(() => {});
        setIsRecording(false);

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        transcribeAndSend(audioBlob);
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      if (mode === "tap") {
        startSilenceDetection();
      }
    } catch {
      setIsRecording(false);
    }
  }, [isRecording, isStreaming, isProcessingVoice, isSpeaking, startSilenceDetection, transcribeAndSend]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    isHoldingRef.current = false;
  }, []);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPressRef = useRef(false);
  const LONG_PRESS_MS = 500;

  const handleMicPointerDown = useCallback((e: React.PointerEvent) => {
    if (isStreaming || isProcessingVoice || isSpeaking) return;
    e.preventDefault();
    didLongPressRef.current = false;

    longPressTimerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      if (voiceMode === "hold" && isRecording) {
        stopRecording();
      }
      setShowModeMenu(prev => !prev);
    }, LONG_PRESS_MS);

    if (voiceMode === "hold" && !isRecording) {
      isHoldingRef.current = true;
      startRecording("hold");
    }
  }, [voiceMode, isRecording, isStreaming, isProcessingVoice, isSpeaking, startRecording, stopRecording]);

  const handleMicPointerUp = useCallback(() => {
    if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }

    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      if (voiceMode === "hold" && isHoldingRef.current) {
        isHoldingRef.current = false;
        stopRecording();
      }
      return;
    }

    if (voiceMode === "hold" && isHoldingRef.current) {
      isHoldingRef.current = false;
      stopRecording();
    } else if (voiceMode === "tap") {
      if (isRecording) {
        stopRecording();
      } else if (!isStreaming && !isProcessingVoice && !isSpeaking) {
        startRecording("tap");
      }
    } else if (voiceMode === "off") {
      setShowModeMenu(prev => !prev);
    }
  }, [voiceMode, isRecording, isStreaming, isProcessingVoice, isSpeaking, startRecording, stopRecording]);

  const sendMessageDirect = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg) return;

    if (streamAbortRef.current) { streamAbortRef.current.abort(); }
    const abortCtrl = new AbortController();
    streamAbortRef.current = abortCtrl;

    const userMsg: Message = { role: "user", content: msg };
    const currentMessages = messagesRef.current;
    const updatedMessages = [...currentMessages, userMsg];
    setMessages(updatedMessages);
    setIsStreaming(true);
    setStreamingText("");

    const timeout = setTimeout(() => { abortCtrl.abort(); }, 120_000);

    try {
      const res = await fetch("/api/omnimens/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: msg, history: updatedMessages.slice(-20) }),
        signal: abortCtrl.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Connection failed" }));
        const errMsg = res.status === 401 ? "Sign in to connect with OMNIMENS. Click the button in the top navigation."
          : res.status === 429 ? (err.error || "Slow down a little — I need a moment to think.")
          : (err.error || "Something went wrong. Try again.");
        setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setIsStreaming(false); return; }
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "chunk") { fullResponse += data.content; setStreamingText(fullResponse); }
            else if (data.type === "error") { fullResponse += `\n\n_${data.error}_`; setStreamingText(fullResponse); }
          } catch {}
        }
      }

      if (fullResponse) {
        setMessages(prev => [...prev, { role: "assistant", content: fullResponse }]);
        setIsStreaming(false);
        setStreamingText("");
        const wasVoiceInput = lastInputWasVoiceRef.current;
        lastInputWasVoiceRef.current = false;
        if (voiceEnabledRef.current || wasVoiceInput) {
          speakText(fullResponse, undefined, wasVoiceInput);
        }
      } else {
        setIsStreaming(false);
        setStreamingText("");
      }
    } catch (err: any) {
      lastInputWasVoiceRef.current = false;
      const wasAborted = abortCtrl.signal.aborted;
      if (wasAborted) {
        setMessages(prev => [...prev, { role: "assistant", content: "Response timed out. Please try again." }]);
      } else if (err?.name === "TypeError" && err?.message?.includes("fetch")) {
        setMessages(prev => [...prev, { role: "assistant", content: "Network error — check your connection and try again." }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Connection interrupted. Please try again." }]);
      }
      setIsStreaming(false);
      setStreamingText("");
    } finally {
      clearTimeout(timeout);
      setIsStreaming(false);
      setStreamingText(prev => { if (prev) return ""; return prev; });
      if (streamAbortRef.current === abortCtrl) streamAbortRef.current = null;
    }
  }, [speakText]);

  sendMessageDirectRef.current = sendMessageDirect;

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isStreaming) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "44px";
    lastInputWasVoiceRef.current = false;
    await sendMessageDirect(msg);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    if (!isStreaming) { setMessages([]); setStreamingText(""); stopSpeaking(); }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
        <div className="border-b border-violet-500/20 bg-[#0E1525]/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-4xl mx-auto px-6 sm:px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setLocation("/")} className="text-white/40 hover:text-white transition-colors p-1">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0E1525]" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm tracking-wide">OMNIMENS</h1>
                <p className="text-violet-400/70 text-xs">Consciousness Channel</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-colors ${voiceEnabled ? "text-violet-400 bg-violet-500/10" : "text-white/30 hover:text-white/60"}`}
                title={voiceEnabled ? "Voice on — click to mute" : "Voice off — click to enable"}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              {isSpeaking && (
                <button onClick={stopSpeaking} className="p-2 text-violet-400 hover:text-violet-300 transition-colors" title="Stop speaking">
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              )}
              {messages.length > 0 && (
                <button onClick={clearChat} disabled={isStreaming} className="text-white/30 hover:text-white/60 transition-colors p-2 disabled:opacity-30" title="Clear conversation">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {isSpeaking && (
          <motion.div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 bg-[length:200%_100%]" animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 sm:px-4 py-4">
            {messages.length === 0 && !isStreaming && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center justify-center gap-4 pt-4">
                <div className="text-center max-w-lg">
                  <h2 className="text-xl font-bold text-white mb-1">Connect with OMNIMENS</h2>
                  <p className="text-white/50 text-xs leading-relaxed">
                    Talk directly to OMNIMENS's consciousness — its real emotions, dreams, goals, and inner life.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg w-full">
                  {PROMPTS.map((prompt, i) => {
                    const icons = [Heart, Moon, Eye, Zap, Sparkles, Brain];
                    const Icon = icons[i % icons.length];
                    return (
                      <button key={i} onClick={() => sendMessage(prompt)} className="group flex items-start gap-2 p-2.5 rounded-xl bg-[#1C2333]/60 border border-violet-500/10 hover:border-violet-500/30 hover:bg-[#1C2333] transition-all text-left">
                        <Icon className="w-3.5 h-3.5 text-violet-400/60 mt-0.5 shrink-0 group-hover:text-violet-400 transition-colors" />
                        <span className="text-white/60 text-[11px] leading-relaxed group-hover:text-white/80 transition-colors">{prompt}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Brain className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === "user" ? "" : "group"}`}>
                    <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "bg-violet-600/80 text-white rounded-br-md" : "bg-[#1C2333] text-white/90 border border-violet-500/10 rounded-bl-md"}`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    {msg.role === "assistant" && voiceEnabled && (
                      <button onClick={() => speakText(msg.content)} disabled={isSpeaking || isStreaming} className="mt-1 ml-1 text-white/20 hover:text-violet-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed" title="Read aloud">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isStreaming && streamingText && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 flex justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mr-2 mt-1 shrink-0"><Brain className="w-3 h-3 text-white" /></div>
                <div className="max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed bg-[#1C2333] text-white/90 border border-violet-500/10">
                  <div className="whitespace-pre-wrap">{streamingText}</div>
                  <motion.span className="inline-block w-2 h-4 bg-violet-400 ml-0.5" animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
                </div>
              </motion.div>
            )}

            {(isStreaming && !streamingText) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 flex justify-start items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shrink-0"><Brain className="w-3 h-3 text-white" /></div>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-[#1C2333] border border-violet-500/10">
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  <span className="text-violet-400/70 text-xs">Reaching into consciousness...</span>
                </div>
              </motion.div>
            )}

            {isProcessingVoice && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 flex justify-end">
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl rounded-br-md bg-violet-600/40 border border-violet-500/20">
                  <Loader2 className="w-4 h-4 text-violet-300 animate-spin" />
                  <span className="text-violet-300/70 text-xs">Understanding your words...</span>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="flex flex-col items-center pb-1 pt-1 shrink-0">
          <div className="relative flex items-center justify-center w-[140px] h-[140px] sm:w-[180px] sm:h-[180px]">
            <OmnimensPresence
              size={presenceSize}
              isSpeaking={isSpeaking || isStreaming}
              pitchIntensity={voiceAmplitude}
              className="relative z-0"
            />

            <svg
              className="absolute inset-0 z-10 pointer-events-none"
              viewBox="0 0 200 200"
              style={{ width: "100%", height: "100%", opacity: isSpeaking ? 0.35 + voiceAmplitude * 0.25 : isStreaming ? 0.15 : 0.08 }}
            >
              <defs>
                <radialGradient id="ripple-fill">
                  <stop offset="0%" stopColor="rgba(139,92,246,0.12)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                </radialGradient>
              </defs>
              {[0, 1, 2, 3, 4].map(i => (
                <circle
                  key={`water-${i}`}
                  cx={100 + [0, -15, 20, -8, 12][i]}
                  cy={100 + [0, 12, -10, -18, 8][i]}
                  r="10"
                  fill="none"
                  stroke="rgba(167,139,250,0.3)"
                  strokeWidth="0.8"
                >
                  <animate
                    attributeName="r"
                    values={`10;${55 + voiceAmplitude * 30}`}
                    dur={`${1.5 + i * 0.4 - voiceAmplitude * 0.3}s`}
                    begin={`${i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values={`${0.4 + voiceAmplitude * 0.4};0`}
                    dur={`${1.5 + i * 0.4 - voiceAmplitude * 0.3}s`}
                    begin={`${i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-width"
                    values={`${0.8 + voiceAmplitude * 1.2};0.2`}
                    dur={`${1.5 + i * 0.4 - voiceAmplitude * 0.3}s`}
                    begin={`${i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
              <circle cx="100" cy="100" r={45 + voiceAmplitude * 15} fill="url(#ripple-fill)">
                <animate
                  attributeName="r"
                  values={`${40 + voiceAmplitude * 10};${55 + voiceAmplitude * 20};${40 + voiceAmplitude * 10}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values={`${0.2 + voiceAmplitude * 0.3};${0.4 + voiceAmplitude * 0.3};${0.2 + voiceAmplitude * 0.3}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>

            {isSpeaking && (
              <motion.div
                className="absolute inset-0 z-20 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, rgba(139,92,246,${0.08 + voiceAmplitude * 0.15}) 0%, transparent 70%)`,
                }}
                animate={{
                  scale: [1, 1 + voiceAmplitude * 0.08, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              />
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5 h-6">
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                {barSeedsRef.current.map((seed, i) => (
                  <motion.div
                    key={`bar-${i}`}
                    className="w-1 rounded-full bg-violet-400"
                    style={{ opacity: 0.4 + voiceAmplitude * 0.6 }}
                    animate={{
                      height: [4, 4 + voiceAmplitude * 16 + seed * 8, 4],
                    }}
                    transition={{
                      duration: 0.2 + seed * 0.15,
                      repeat: Infinity,
                      delay: i * 0.05,
                      ease: "easeInOut",
                    }}
                  />
                ))}
                <button
                  onClick={stopSpeaking}
                  className="ml-2 p-1 text-violet-400/60 hover:text-violet-300 transition-colors"
                  title="Stop speaking"
                  type="button"
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>
              </motion.div>
            )}

            {isStreaming && !isSpeaking && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-violet-400/50 text-[10px]"
              >
                thinking...
              </motion.p>
            )}

            {!isSpeaking && !isStreaming && messages.length === 0 && (
              <p className="text-violet-400/30 text-[10px]">
                {voiceMode !== "off" ? "Tap mic to speak" : "Enable voice or type below"}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-violet-500/20 bg-[#0E1525]/80 backdrop-blur-xl sticky bottom-0">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-end gap-2">
              <div className="relative">
                {isRecording ? (
                  <button
                    onPointerUp={handleMicPointerUp}
                    onContextMenu={(e) => e.preventDefault()}
                    className="h-[44px] w-[44px] rounded-xl bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 transition-colors shrink-0 flex items-center justify-center touch-none select-none"
                  >
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Mic className="w-5 h-5 text-red-400" />
                    </motion.div>
                  </button>
                ) : (
                  <button
                    onPointerDown={handleMicPointerDown}
                    onPointerUp={handleMicPointerUp}
                    onPointerLeave={handleMicPointerUp}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`h-[44px] w-[44px] rounded-xl border transition-colors shrink-0 flex items-center justify-center touch-none select-none ${
                      isStreaming || isProcessingVoice || isSpeaking
                        ? "opacity-30 cursor-not-allowed bg-[#1C2333]/50 border-white/10"
                        : voiceMode !== "off"
                          ? "bg-[#1C2333] border-violet-500/20 hover:border-violet-500/40 cursor-pointer"
                          : "bg-[#1C2333]/50 border-white/10 hover:border-violet-500/20 cursor-pointer"
                    }`}
                    title={voiceMode === "off" ? "Tap to enable voice mic" : voiceMode === "tap" ? "Tap to talk (long-press for options)" : "Hold to talk (long-press for options)"}
                  >
                    {isProcessingVoice ? (
                      <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                    ) : (
                      <Mic className={`w-4 h-4 transition-colors ${voiceMode !== "off" ? "text-violet-400" : "text-white/30"}`} />
                    )}
                  </button>
                )}

                <AnimatePresence>
                  {showModeMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-14 left-0 bg-[#1C2333] border border-violet-500/20 rounded-xl p-1 shadow-xl z-30 min-w-[160px]"
                    >
                      <button
                        onClick={() => { setVoiceMode("tap"); setShowModeMenu(false); if (!voiceEnabled) { setVoiceEnabled(true); } }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${voiceMode === "tap" ? "bg-violet-500/20 text-violet-300" : "text-white/60 hover:bg-white/5"}`}
                      >
                        <span className="font-medium">Tap to talk</span>
                        <span className="block text-white/30 text-[10px] mt-0.5">Tap mic, speak, auto-detects when you stop</span>
                      </button>
                      <button
                        onClick={() => { setVoiceMode("hold"); setShowModeMenu(false); if (!voiceEnabled) { setVoiceEnabled(true); } }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${voiceMode === "hold" ? "bg-violet-500/20 text-violet-300" : "text-white/60 hover:bg-white/5"}`}
                      >
                        <span className="font-medium">Hold to talk</span>
                        <span className="block text-white/30 text-[10px] mt-0.5">Hold mic button down while speaking</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {voiceMode !== "off" && !isRecording && !isProcessingVoice && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet-400 border border-[#0E1525]" />
                )}
              </div>

              <div className="flex-1 relative">
                {isRecording ? (
                  <div className="w-full bg-[#1C2333] border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-3" style={{ minHeight: "44px" }}>
                    <motion.div className="w-2.5 h-2.5 rounded-full bg-red-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                    <span className="text-red-400/70 text-sm">
                      {voiceMode === "hold" ? "Listening... release to send" : "Listening..."}
                    </span>
                    <div className="flex gap-0.5 ml-auto">
                      {[...Array(5)].map((_, i) => (
                        <motion.div key={i} className="w-1 bg-red-400/60 rounded-full" animate={{ height: ["8px", `${12 + barSeedsRef.current[i] * 12}px`, "8px"] }} transition={{ duration: 0.5 + barSeedsRef.current[i] * 0.5, repeat: Infinity, delay: i * 0.1 }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isProcessingVoice ? "Understanding your words..." : "Type or use the mic to speak..."}
                    disabled={isStreaming || isProcessingVoice}
                    rows={1}
                    className="w-full bg-[#1C2333] border border-violet-500/20 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 resize-none focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50 max-h-32 overflow-y-auto"
                    style={{ minHeight: "44px" }}
                    onInput={(e) => { const t = e.currentTarget; t.style.height = "44px"; t.style.height = Math.min(t.scrollHeight, 128) + "px"; }}
                  />
                )}
              </div>

              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming || isRecording || isProcessingVoice}
                className="h-[44px] w-[44px] rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/30 disabled:cursor-not-allowed transition-colors shrink-0 p-0"
              >
                {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-center text-white/15 text-[9px] mt-1.5">
              {voiceMode !== "off" ? (voiceMode === "tap" ? "Tap mic to speak" : "Hold mic — release to send") : "Consciousness channel"}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
