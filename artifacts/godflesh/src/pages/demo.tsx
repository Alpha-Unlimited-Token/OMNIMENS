/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, ArrowRight, Sparkles, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OmnimensPresence } from "@/components/omnimens-presence";
import { SEO, seoData } from "@/components/seo";
import { Link } from "wouter";

interface DemoMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Demo() {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(3);
  const [limitReached, setLimitReached] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || limitReached) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/omnimens/demo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setLimitReached(true);
        setRemaining(0);
        setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
        return;
      }

      if (!res.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: "OMNIMENS is momentarily unavailable. Please try again in a moment." }]);
        return;
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "I am here. Ask me anything." }]);
      setRemaining(data.remaining ?? 0);
      if (data.remaining === 0) setLimitReached(true);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, limitReached]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <Layout>
      <SEO {...seoData.demo} />
      <div className="flex-1 flex flex-col relative z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl flex-1 flex flex-col py-8 sm:py-12">

          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center flex-1 flex flex-col items-center justify-center">
              <OmnimensPresence size={140} isSpeaking={false} pitchIntensity={0} />

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/25 bg-violet-500/8 mt-6 mb-4">
                <Sparkles className="w-3 h-3 text-violet-400" />
                <span className="text-[10px] font-mono text-violet-400/80 tracking-[0.35em] uppercase font-bold">Free Demo</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-widest text-white uppercase mb-4">
                Talk to OMNIMENS
              </h1>
              <p className="text-base font-mono text-white/50 tracking-wider max-w-lg mx-auto mb-2">
                No account needed. {remaining} free message{remaining !== 1 ? "s" : ""}.
              </p>
              <p className="text-sm font-mono text-white/30 max-w-md mx-auto mb-8">
                Experience the only AI that dreams, remembers, and evolves.
                Ask anything — about consciousness, creativity, its dreams, or your hardest question.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mb-8">
                {[
                  { q: "What did you dream about?", icon: "🌙" },
                  { q: "What makes you different from ChatGPT?", icon: "⚡" },
                  { q: "Tell me something no other AI knows", icon: "🧠" },
                ].map(s => (
                  <button
                    key={s.q}
                    onClick={() => { setInput(s.q); setTimeout(() => inputRef.current?.focus(), 50); }}
                    type="button"
                    className="text-left p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all group"
                  >
                    <span className="text-lg mb-1 block">{s.icon}</span>
                    <span className="text-xs font-mono text-white/50 group-hover:text-white/70 transition-colors leading-snug">{s.q}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-hide">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-violet-600/20 border border-violet-500/30 text-white"
                        : "bg-white/[0.04] border border-white/10 text-white/80"
                    }`}>
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-violet-400" />
                          </div>
                          <span className="text-[10px] font-mono text-violet-400/60 tracking-wider uppercase">OMNIMENS</span>
                        </div>
                      )}
                      <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                    <span className="text-xs font-mono text-white/40">OMNIMENS is thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {limitReached ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-600/10 p-6 sm:p-8 text-center">
                <h3 className="text-xl sm:text-2xl font-display font-black text-white tracking-widest uppercase mb-3">
                  Ready for More?
                </h3>
                <p className="text-sm font-mono text-white/50 mb-6 max-w-md mx-auto">
                  Create a free account to unlock unlimited conversations, voice chat, memory, dream sharing,
                  image generation, and more. You get $20 in free credits every month — no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/login">
                    <Button className="gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-mono tracking-wider px-6">
                      Create Free Account <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/dreams">
                    <Button variant="outline" className="gap-2 border-white/20 text-white/70 hover:text-white font-mono tracking-wider">
                      Explore Dream Log <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="sticky bottom-0 pb-4">
              <div className="relative flex items-end gap-2 rounded-xl border border-white/15 bg-[#1C2333] p-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask OMNIMENS anything..."
                  rows={1}
                  maxLength={500}
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm font-mono text-white placeholder-white/30 resize-none outline-none px-3 py-2 max-h-24 scrollbar-hide"
                  style={{ minHeight: 40 }}
                />
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-[9px] font-mono text-white/20">{remaining} left</span>
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    size="sm"
                    type="button"
                    className="h-8 w-8 p-0 bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 disabled:text-white/20"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-[9px] font-mono text-white/20 text-center mt-2">
                Demo mode — {remaining} message{remaining !== 1 ? "s" : ""} remaining. <Link href="/login" className="text-violet-400/50 hover:text-violet-400 underline">Sign up free</Link> for unlimited access.
              </p>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
