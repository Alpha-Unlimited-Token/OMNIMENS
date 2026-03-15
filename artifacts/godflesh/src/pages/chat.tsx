import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { useGetGodfleshStatus } from "@workspace/api-client-react";
import { useGodfleshChat } from "@/hooks/use-godflesh-chat";
import { Button } from "@/components/ui/button";
import { Send, StopCircle, Zap, ShieldAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

export default function Chat() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const { data: status, isLoading: statusLoading } = useGetGodfleshStatus();
  
  const { messages, sendMessage, isTyping, error, stopGeneration } = useGodfleshChat(() => {
    setShowLimitModal(true);
  });

  // Protect route
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    // Optimistic limit check for free users
    if (status && !status.isPro && status.messagesUsedToday >= status.dailyLimit) {
      setShowLimitModal(true);
      return;
    }

    sendMessage(input);
    setInput("");
  };

  if (isLoading || !isAuthenticated) return <Layout><div className="flex-1 flex items-center justify-center"><div className="animate-pulse text-primary font-mono tracking-widest">ESTABLISHING LINK...</div></div></Layout>;

  const progressPercentage = status ? Math.min(100, (status.messagesUsedToday / status.dailyLimit) * 100) : 0;

  return (
    <Layout>
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 h-[calc(100vh-4rem)]">
        
        {/* Status Bar */}
        <div className="shrink-0 mb-4 bg-secondary/50 border border-white/5 rounded-lg p-3 flex items-center justify-between font-mono text-xs text-white/60">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status?.isPro ? 'bg-accent glow-text-gold' : 'bg-primary animate-pulse'}`} />
            <span>LINK ACTIVE</span>
          </div>
          
          {statusLoading ? (
            <span>READING TELEMETRY...</span>
          ) : status?.isPro ? (
            <span className="text-accent font-bold tracking-widest">TRANSCENDENCE LEVEL: UNLIMITED</span>
          ) : (
            <div className="flex items-center gap-3">
              <span>{status?.messagesUsedToday} / {status?.dailyLimit} QUERIES</span>
              <div className="w-24 h-1.5 bg-black rounded-full overflow-hidden border border-white/10">
                <div 
                  className={`h-full ${progressPercentage >= 100 ? 'bg-destructive' : 'bg-primary'}`} 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto godflesh-scrollbar bg-black/40 border border-white/5 rounded-xl p-4 md:p-6 mb-4 relative shadow-inner">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
              <Zap className="w-16 h-16 text-primary mb-4" />
              <h2 className="font-display text-2xl tracking-[0.3em]">GODFLESH AWAITS</h2>
              <p className="font-mono text-sm mt-2">Speak your intent.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] ${
                    msg.role === "user" 
                      ? "bg-white/10 border border-white/20 text-white rounded-2xl rounded-tr-sm px-5 py-3 font-sans"
                      : "bg-primary/5 border border-primary/20 text-white/90 rounded-2xl rounded-tl-sm px-5 py-4 font-mono shadow-[0_0_15px_rgba(204,0,0,0.05)]"
                  }`}>
                    {msg.role === "godflesh" && (
                      <div className="flex items-center gap-2 mb-2 text-primary font-bold text-[10px] tracking-widest uppercase">
                        <Zap className="w-3 h-3" />
                        GODFLESH
                      </div>
                    )}
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="markdown-body text-sm md:text-base">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content || "..."}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl rounded-tl-sm px-5 py-4">
                     <div className="flex items-center gap-2 mb-2 text-primary font-bold text-[10px] tracking-widest uppercase">
                        <Zap className="w-3 h-3" />
                        GODFLESH
                      </div>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="text-destructive font-mono text-sm flex items-center justify-center gap-2 p-4 border border-destructive/30 rounded-lg bg-destructive/10">
                  <ShieldAlert className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="shrink-0 relative">
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Query the intelligence..."
              className="w-full bg-black border border-white/20 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-4 pr-24 text-white font-mono text-sm resize-none h-[60px] godflesh-scrollbar outline-none transition-all placeholder:text-white/20"
              disabled={isTyping}
            />
            <div className="absolute right-2 flex items-center">
              {isTyping ? (
                <Button type="button" onClick={stopGeneration} size="icon" variant="ghost" className="text-white/50 hover:text-white">
                  <StopCircle className="w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="default"
                  disabled={!input.trim()}
                  className="rounded-lg w-10 h-10 shadow-none border-none"
                >
                  <Send className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Limit Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-black border border-primary/50 p-8 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(204,0,0,0.2)] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              
              <ShieldAlert className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-white tracking-widest mb-2 uppercase">Limits Reached</h2>
              <p className="text-white/60 font-mono text-sm mb-8">
                The mortal coil cannot sustain further connection today. Transcend your limits to unlock eternal access.
              </p>
              
              <div className="flex flex-col gap-3">
                <Button onClick={() => setLocation("/pricing")} size="lg" className="w-full">
                  ASCEND NOW — $9.99/mo
                </Button>
                <Button onClick={() => setShowLimitModal(false)} variant="ghost" className="w-full text-white/40">
                  Return to Silence
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
