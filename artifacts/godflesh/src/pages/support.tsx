/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, User, Brain, CreditCard, Bug, Code2, Lightbulb,
  HelpCircle, CheckCircle2, AlertCircle, Send, ChevronRight,
  Loader2, MessageSquare, Zap, Shield, RefreshCw,
} from "lucide-react";
import { SEO, seoData } from "@/components/seo";

const API_BASE = "/api";

type Category = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
  prompts: string[];
};

const CATEGORIES: Category[] = [
  {
    id: "account",
    label: "Account Issue",
    icon: <User className="w-6 h-6" />,
    color: "text-sky-400",
    borderColor: "border-sky-400/30",
    bgColor: "bg-sky-400/6",
    description: "Login problems, profile, Google OAuth, password reset, or account access",
    prompts: [
      "I can't log in to my account",
      "My Google sign-in isn't working",
      "I need to change my email or username",
      "My account was locked or suspended",
      "I can't access my previous conversations",
    ],
  },
  {
    id: "ai",
    label: "AI / OMNIMENS Issue",
    icon: <Brain className="w-6 h-6" />,
    color: "text-violet-400",
    borderColor: "border-violet-400/30",
    bgColor: "bg-violet-400/6",
    description: "Wrong or harmful responses, persona not working, COGNISYNC™, memory, or context issues",
    prompts: [
      "OMNIMENS gave me an incorrect or harmful response",
      "The AI persona I selected isn't behaving correctly",
      "OMNIMENS isn't remembering things it should",
      "Responses are very slow or timing out",
      "The AI keeps repeating itself or losing context",
    ],
  },
  {
    id: "billing",
    label: "Billing & Credits",
    icon: <CreditCard className="w-6 h-6" />,
    color: "text-yellow-400",
    borderColor: "border-yellow-400/30",
    bgColor: "bg-yellow-400/6",
    description: "Payment failures, missing credits, overcharges, refund requests, or auto top-up",
    prompts: [
      "I was charged but my credits weren't added",
      "I need a refund for a purchase",
      "My card was declined but I was still charged",
      "I want to cancel auto top-up",
      "My free monthly credits weren't added",
    ],
  },
  {
    id: "bug",
    label: "Website Bug",
    icon: <Bug className="w-6 h-6" />,
    color: "text-red-400",
    borderColor: "border-red-400/30",
    bgColor: "bg-red-400/6",
    description: "Broken pages, UI glitches, errors, missing features, or anything not working right",
    prompts: [
      "A page is showing an error or blank screen",
      "A button or feature isn't responding",
      "The chat stopped working mid-conversation",
      "File upload or download isn't working",
      "The site looks broken or misaligned",
    ],
  },
  {
    id: "api",
    label: "API & Developer",
    icon: <Code2 className="w-6 h-6" />,
    color: "text-primary",
    borderColor: "border-primary/30",
    bgColor: "bg-primary/6",
    description: "API key problems, endpoint errors, rate limits, SDK issues, or developer portal bugs",
    prompts: [
      "My API key isn't working",
      "I'm getting unexpected errors from the API",
      "I hit my rate limit but it shouldn't be exhausted",
      "The API response format changed unexpectedly",
      "I need a higher rate limit or monthly quota",
    ],
  },
  {
    id: "feature",
    label: "Feature Request",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "text-orange-400",
    borderColor: "border-orange-400/30",
    bgColor: "bg-orange-400/6",
    description: "Suggest new features, improvements, or integrations you'd like to see in OMNIMENS",
    prompts: [
      "I'd like to see a new OMNIMENS persona",
      "Please add integration with [tool/service]",
      "I want a way to export my conversation history",
      "It would help to have [specific feature]",
      "The mobile experience could be improved by...",
    ],
  },
  {
    id: "other",
    label: "Other",
    icon: <HelpCircle className="w-6 h-6" />,
    color: "text-white/50",
    borderColor: "border-white/15",
    bgColor: "bg-white/3",
    description: "Anything else — privacy questions, legal inquiries, or issues that don't fit the above",
    prompts: [
      "I have a privacy or data question",
      "I'd like to report inappropriate content",
      "I have a partnership or business inquiry",
      "I need help with something not listed above",
    ],
  },
];

const SEVERITY_OPTIONS = [
  { id: "low", label: "Low", desc: "Minor annoyance, not blocking me", color: "text-green-400", dot: "bg-green-400" },
  { id: "medium", label: "Medium", desc: "Affecting my experience but I can work around it", color: "text-yellow-400", dot: "bg-yellow-400" },
  { id: "high", label: "High", desc: "Blocking me from using core features", color: "text-orange-400", dot: "bg-orange-400" },
  { id: "critical", label: "Critical", desc: "Data loss, security issue, or completely broken", color: "text-red-400", dot: "bg-red-400" },
];

type Step = "category" | "detail" | "success";

export default function SupportPage() {
  const [step, setStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [contactEmail, setContactEmail] = useState("");
  const [usedPrompt, setUsedPrompt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState("");

  const selectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setDescription("");
    setUsedPrompt(false);
    setError("");
    setStep("detail");
  };

  const usePrompt = (prompt: string) => {
    setDescription(prompt + " — ");
    setUsedPrompt(true);
  };

  const submit = async () => {
    if (!description.trim() || description.trim().length < 10) {
      setError("Please describe the issue in at least 10 characters.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const r = await fetch(`${API_BASE}/omnimens/support/report`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          category: selectedCategory?.id || "other",
          severity,
          contactEmail: contactEmail.trim() || undefined,
          context: window.location.href,
        }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || "Submission failed. Please try again."); return; }
      setTicketId(data.ticketId);
      setStep("success");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep("category");
    setSelectedCategory(null);
    setDescription("");
    setSeverity("medium");
    setContactEmail("");
    setUsedPrompt(false);
    setError("");
    setTicketId("");
  };

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <SEO {...seoData.support} />

      {/* Top bar */}
      <div className="border-b border-white/8 sticky top-0 z-30 bg-black/95 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href={`${window.location.origin}/chat`}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </a>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-semibold text-white tracking-tight">Support</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-white/20">
            <Shield className="w-3 h-3" /> Reports are reviewed by the OMNIMENS team
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Category Selection ── */}
          {step === "category" && (
            <motion.div key="category" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-5">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Report a Problem</h1>
                <p className="text-white/45 text-base max-w-md mx-auto leading-relaxed">
                  Tell us what's going on. Select the category that best describes your issue and we'll help you resolve it.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => selectCategory(cat)}
                    className={`group text-left rounded-2xl border p-5 transition-all hover:shadow-lg ${cat.borderColor} ${cat.bgColor} hover:brightness-110`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 ${cat.color}`}>{cat.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold text-sm ${cat.color}`}>{cat.label}</h3>
                          <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/35 transition-colors shrink-0" />
                        </div>
                        <p className="text-white/40 text-xs leading-relaxed">{cat.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Info strip */}
              <div className="mt-8 rounded-xl border border-white/6 bg-white/2 p-4 flex items-start gap-3">
                <Zap className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" />
                <p className="text-white/35 text-xs leading-relaxed">
                  All reports are stored securely and reviewed by the Alpha Unlimited Technologies team. For billing emergencies or account security issues, mark severity as <strong className="text-red-400">Critical</strong> and we'll prioritize your case.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Detail Form ── */}
          {step === "detail" && selectedCategory && (
            <motion.div key="detail" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-7">

              {/* Back + header */}
              <div>
                <button onClick={() => setStep("category")}
                  className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-5 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Change category
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <div className={`${selectedCategory.color}`}>{selectedCategory.icon}</div>
                  <h2 className="text-2xl font-bold text-white">{selectedCategory.label}</h2>
                </div>
                <p className="text-white/40 text-sm">{selectedCategory.description}</p>
              </div>

              {/* Quick prompts */}
              <div>
                <p className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">Common issues — tap to pre-fill</p>
                <div className="flex flex-col gap-2">
                  {selectedCategory.prompts.map((prompt, i) => (
                    <button key={i} onClick={() => usePrompt(prompt)}
                      className={`text-left rounded-xl px-4 py-3 border text-sm transition-all ${
                        description.startsWith(prompt)
                          ? `${selectedCategory.borderColor} ${selectedCategory.bgColor} ${selectedCategory.color}`
                          : "border-white/8 bg-white/2 text-white/50 hover:text-white/80 hover:border-white/15 hover:bg-white/4"
                      }`}>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />
                        {prompt}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-white/50 text-sm font-medium block mb-2">
                  Describe the issue <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Please describe what happened, what you expected, and any steps that led to the issue..."
                  className="w-full rounded-xl bg-white/3 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-primary/40 resize-none placeholder:text-white/20 transition-colors"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-white/20 text-xs">The more detail you provide, the faster we can help.</p>
                  <span className={`text-xs font-mono ${description.trim().length < 10 ? "text-white/20" : "text-white/40"}`}>
                    {description.trim().length} chars
                  </span>
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="text-white/50 text-sm font-medium block mb-3">How severe is this issue?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SEVERITY_OPTIONS.map(sev => (
                    <button key={sev.id} onClick={() => setSeverity(sev.id)}
                      className={`rounded-xl p-3 border text-left transition-all ${
                        severity === sev.id
                          ? `border-white/20 bg-white/6`
                          : "border-white/6 bg-white/2 hover:border-white/12 hover:bg-white/4"
                      }`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${sev.dot} ${severity !== sev.id ? "opacity-40" : ""}`} />
                        <span className={`text-xs font-semibold ${severity === sev.id ? sev.color : "text-white/40"}`}>{sev.label}</span>
                      </div>
                      <p className="text-white/25 text-[10px] leading-relaxed">{sev.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional email */}
              <div>
                <label className="text-white/50 text-sm font-medium block mb-2">
                  Contact email <span className="text-white/25 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="your@email.com — we'll follow up here if needed"
                  className="w-full rounded-xl bg-white/3 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-primary/40 placeholder:text-white/20 transition-colors"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={submit}
                disabled={submitting || description.trim().length < 10}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting report...</>
                  : <><Send className="w-4 h-4" /> Submit Report</>}
              </button>

              <p className="text-center text-white/20 text-xs">
                By submitting you agree that Alpha Unlimited Technologies LLC may use this report to improve OMNIMENS.
              </p>
            </motion.div>
          )}

          {/* ── Step 3: Success ── */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-400/10 border border-green-400/25 mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
              <p className="text-white/45 text-base mb-6">Thank you for letting us know. We'll look into this right away.</p>

              <div className="inline-flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4 mb-8">
                <div>
                  <p className="text-white/40 text-xs font-mono mb-0.5">TICKET ID</p>
                  <p className="text-primary font-mono font-bold text-xl tracking-widest">{ticketId}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/2 p-5 text-left mb-8 max-w-sm mx-auto space-y-3">
                <p className="text-white/50 text-sm font-medium">What happens next?</p>
                {[
                  "Your report has been securely stored and logged.",
                  "The OMNIMENS team will review it, typically within 24–48 hours.",
                  "If you provided an email, we'll follow up directly.",
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-mono shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-white/35 text-xs leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button onClick={reset}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white/80 hover:border-white/20 transition-all">
                  <RefreshCw className="w-3.5 h-3.5" /> Submit another
                </button>
                <a href={`${window.location.origin}/chat`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-semibold hover:bg-primary/90 transition-all">
                  Return to OMNIMENS
                </a>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/6 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-xs font-mono">© 2026 Alpha Unlimited Technologies LLC</p>
            <div className="flex items-center gap-5 text-xs text-white/25">
              <a href={`${window.location.origin}/`} className="hover:text-white/50 transition-colors">Home</a>
              <a href={`${window.location.origin}/faq`} className="hover:text-white/50 transition-colors">FAQ</a>
              <a href={`${window.location.origin}/pricing`} className="hover:text-white/50 transition-colors">Pricing</a>
              <a href={`${window.location.origin}/dev`} className="hover:text-white/50 transition-colors">Developer</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
