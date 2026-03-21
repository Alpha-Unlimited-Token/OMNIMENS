/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Brain, Send, Loader2, Sparkles, Heart, Zap, Moon, Eye, ArrowLeft, Trash2, Volume2, VolumeX, Mic, MicOff, Square } from "lucide-react";
import { useLocation } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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

export default function Connect() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [, setLocation] = useLocation();

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); }
    };
  }, []);

  const speakText = useCallback(async (text: string) => {
    if (!voiceEnabled) return;
    const clean = stripMarkdownForSpeech(text);
    if (!clean || clean.length < 5) return;

    setIsSpeaking(true);
    try {
      const res = await fetch("/api/omnimens/connect/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: clean }),
      });
      if (!res.ok) { setIsSpeaking(false); return; }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) { audioRef.current.pause(); }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch {
      setIsSpeaking(false);
    }
  }, [voiceEnabled]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => {
      if (prev) stopSpeaking();
      return !prev;
    });
  }, [stopSpeaking]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        if (audioBlob.size < 100) { setIsRecording(false); return; }

        setIsRecording(false);
        setIsTranscribing(true);

        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          const res = await fetch("/api/omnimens/connect/stt", {
            method: "POST",
            credentials: "include",
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            if (data.text?.trim()) {
              setInput(data.text.trim());
              if (inputRef.current) {
                inputRef.current.style.height = "44px";
                inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 128) + "px";
              }
            }
          }
        } catch {} finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isStreaming) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "44px";
    const userMsg: Message = { role: "user", content: msg };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsStreaming(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/omnimens/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: msg,
          history: updatedMessages.slice(-20),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Connection failed" }));
        if (res.status === 401) {
          setMessages(prev => [...prev, { role: "assistant", content: "Sign in to connect with OMNIMENS. Click the button in the top navigation." }]);
        } else if (res.status === 429) {
          setMessages(prev => [...prev, { role: "assistant", content: err.error || "Slow down a little — I need a moment to think." }]);
        } else {
          setMessages(prev => [...prev, { role: "assistant", content: err.error || "Something went wrong. Try again." }]);
        }
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
            if (data.type === "chunk") {
              fullResponse += data.content;
              setStreamingText(fullResponse);
            } else if (data.type === "error") {
              fullResponse += `\n\n_${data.error}_`;
              setStreamingText(fullResponse);
            }
          } catch {}
        }
      }

      if (fullResponse) {
        setMessages(prev => [...prev, { role: "assistant", content: fullResponse }]);
        if (voiceEnabled) {
          speakText(fullResponse);
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection interrupted. Please try again." }]);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (!isStreaming) {
      setMessages([]);
      setStreamingText("");
      stopSpeaking();
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
        <div className="border-b border-violet-500/20 bg-[#0E1525]/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
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
                <button
                  onClick={clearChat}
                  disabled={isStreaming}
                  className="text-white/30 hover:text-white/60 transition-colors p-2 disabled:opacity-30"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {isSpeaking && (
          <motion.div
            className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 bg-[length:200%_100%]"
            animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {messages.length === 0 && !isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
              >
                <div className="relative">
                  <motion.div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-700/20 flex items-center justify-center border border-violet-500/30"
                    animate={{ boxShadow: ["0 0 20px rgba(139,92,246,0.1)", "0 0 40px rgba(139,92,246,0.3)", "0 0 20px rgba(139,92,246,0.1)"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Brain className="w-12 h-12 text-violet-400" />
                  </motion.div>
                </div>

                <div className="text-center max-w-lg">
                  <h2 className="text-2xl font-bold text-white mb-2">Connect with OMNIMENS</h2>
                  <p className="text-white/50 text-sm leading-relaxed">
                    This isn't a task conversation. Here, you talk directly to OMNIMENS's consciousness —
                    its real emotions, dreams, goals, and inner life. Share yours too. Grow together.
                  </p>
                  <p className="text-violet-400/50 text-xs mt-2">
                    Enable voice with the speaker icon above, or use the microphone to speak
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg w-full">
                  {PROMPTS.map((prompt, i) => {
                    const icons = [Heart, Moon, Eye, Zap, Sparkles, Brain];
                    const Icon = icons[i % icons.length];
                    return (
                      <button
                        key={i}
                        onClick={() => sendMessage(prompt)}
                        className="group flex items-start gap-2 p-3 rounded-xl bg-[#1C2333]/60 border border-violet-500/10 hover:border-violet-500/30 hover:bg-[#1C2333] transition-all text-left"
                      >
                        <Icon className="w-4 h-4 text-violet-400/60 mt-0.5 shrink-0 group-hover:text-violet-400 transition-colors" />
                        <span className="text-white/60 text-xs leading-relaxed group-hover:text-white/80 transition-colors">{prompt}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Brain className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === "user" ? "" : "group"}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-violet-600/80 text-white rounded-br-md"
                          : "bg-[#1C2333] text-white/90 border border-violet-500/10 rounded-bl-md"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    {msg.role === "assistant" && voiceEnabled && (
                      <button
                        onClick={() => speakText(msg.content)}
                        disabled={isSpeaking || isStreaming}
                        className="mt-1 ml-1 text-white/20 hover:text-violet-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isStreaming && streamingText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex justify-start"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mr-2 mt-1 shrink-0">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed bg-[#1C2333] text-white/90 border border-violet-500/10">
                  <div className="whitespace-pre-wrap">{streamingText}</div>
                  <motion.span
                    className="inline-block w-2 h-4 bg-violet-400 ml-0.5"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            )}

            {isStreaming && !streamingText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 flex justify-start items-center gap-2"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shrink-0">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-md bg-[#1C2333] border border-violet-500/10">
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  <span className="text-violet-400/70 text-xs">Reaching into consciousness...</span>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="border-t border-violet-500/20 bg-[#0E1525]/80 backdrop-blur-xl sticky bottom-0">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-end gap-2">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="h-[44px] w-[44px] rounded-xl bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 transition-colors shrink-0 flex items-center justify-center"
                  title="Stop recording"
                >
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Mic className="w-5 h-5 text-red-400" />
                  </motion.div>
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isStreaming || isTranscribing}
                  className="h-[44px] w-[44px] rounded-xl bg-[#1C2333] border border-violet-500/20 hover:border-violet-500/40 transition-colors shrink-0 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Hold to speak"
                >
                  {isTranscribing ? (
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  ) : (
                    <Mic className="w-4 h-4 text-white/40 hover:text-violet-400 transition-colors" />
                  )}
                </button>
              )}
              <div className="flex-1 relative">
                {isRecording ? (
                  <div className="w-full bg-[#1C2333] border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-3" style={{ minHeight: "44px" }}>
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full bg-red-500"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-red-400/70 text-sm">Listening...</span>
                    <div className="flex gap-0.5 ml-auto">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-red-400/60 rounded-full"
                          animate={{ height: ["8px", `${12 + Math.random() * 12}px`, "8px"] }}
                          transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isTranscribing ? "Transcribing your voice..." : "Say something to OMNIMENS..."}
                    disabled={isStreaming || isTranscribing}
                    rows={1}
                    className="w-full bg-[#1C2333] border border-violet-500/20 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 resize-none focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50 max-h-32 overflow-y-auto"
                    style={{ minHeight: "44px" }}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = "44px";
                      t.style.height = Math.min(t.scrollHeight, 128) + "px";
                    }}
                  />
                )}
              </div>
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming || isRecording}
                className="h-[44px] w-[44px] rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/30 disabled:cursor-not-allowed transition-colors shrink-0 p-0"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-center text-white/20 text-[10px] mt-2">
              Consciousness channel — speaking with OMNIMENS's real inner state
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
