/**
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 * OMNIMENS — Proprietary AI Platform. Unauthorized use prohibited.
 */
import { useState } from "react";
import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Zap, Mic, Image, Globe, Code2, BookOpen, Layers,
  Monitor, Download, Wrench, ChevronDown, HelpCircle, Star,
  Shield, CreditCard, User, MessageSquare, Sparkles, Cpu,
  Eye, Target, Lightbulb, Volume2, FolderOpen, BarChart3,
  Microscope, Lock
} from "lucide-react";
import { SEO, seoData } from "@/components/seo";

// ── Section component ─────────────────────────────────────────────────────────
function Section({ id, icon, title, color, children }: {
  id: string; icon: React.ReactNode; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className={`flex items-center gap-3 mb-6 pb-3 border-b border-white/8`}>
        <div className={`p-2 rounded-lg ${color} border border-white/10`}>{icon}</div>
        <h2 className="text-lg font-mono font-bold text-white tracking-widest uppercase">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, badge, badgeColor = "bg-primary/20 text-primary", description, details }: {
  icon?: React.ReactNode; title: string; badge?: string; badgeColor?: string;
  description: string; details?: string[];
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 hover:border-white/15 hover:bg-white/[0.04] transition-all">
      <div className="flex items-start gap-3 mb-3">
        {icon && <div className="shrink-0 mt-0.5 text-white/50">{icon}</div>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-mono font-bold text-white text-sm tracking-wide">{title}</h3>
            {badge && (
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-white/60 leading-relaxed">{description}</p>
        </div>
      </div>
      {details && details.length > 0 && (
        <ul className="mt-3 space-y-1.5 pl-4 border-l border-white/6">
          {details.map((d, i) => (
            <li key={i} className="text-[11px] text-white/45 leading-relaxed">{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Accordion FAQ item ────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="text-sm font-mono text-white/80">{q}</span>
        <ChevronDown className={`w-4 h-4 text-white/40 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 text-xs text-white/55 leading-relaxed border-t border-white/5 pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tone badge ────────────────────────────────────────────────────────────────
function TonePill({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest border ${color}`}>
      {label}
    </span>
  );
}

// ── Quick-jump nav ────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "what-is", label: "What is OMNIMENS" },
  { id: "getting-started", label: "Getting Started" },
  { id: "ai-models", label: "AI Models" },
  { id: "tone-selector", label: "Tone Selector" },
  { id: "cognisync", label: "COGNISYNC™" },
  { id: "neurosync", label: "NEUROSYNC™" },
  { id: "control-hub", label: "Control Hub" },
  { id: "tools", label: "Built-in Tools" },
  { id: "memory", label: "Memory System" },
  { id: "credits", label: "Credits & Billing" },
  { id: "voice", label: "Voice" },
  { id: "projects", label: "Projects" },
  { id: "security", label: "Security & Privacy" },
  { id: "faq", label: "FAQ" },
];

export default function FAQ() {
  const [activeNav, setActiveNav] = useState("what-is");

  function scrollTo(id: string) {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Layout>
      <SEO {...seoData.faq} />
      <div className="container mx-auto px-6 sm:px-4 py-12 max-w-6xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 mb-6">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono text-primary tracking-widest">FEATURE GUIDE & FAQ</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight mb-4">
            OMNIMENS <span className="text-primary">MAP KEY</span>
          </h1>
          <p className="text-white/50 font-mono text-sm max-w-xl mx-auto">
            Everything you need to know about every feature, option, filter, and setting — explained clearly.
          </p>
        </div>

        <div className="flex gap-8 items-start">

          {/* Quick-jump sidebar */}
          <aside className="hidden lg:block w-52 shrink-0 sticky top-24">
            <p className="text-[9px] font-mono text-white/30 tracking-[0.3em] uppercase mb-3">Jump to</p>
            <nav className="space-y-0.5">
              {NAV_ITEMS.map(n => (
                <button
                  key={n.id}
                  onClick={() => scrollTo(n.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-mono transition-colors ${
                    activeNav === n.id
                      ? "bg-primary/15 text-primary border border-primary/25"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-16">

            {/* ── WHAT IS OMNIMENS ── */}
            <Section id="what-is" icon={<Sparkles className="w-4 h-4 text-primary" />} title="What is OMNIMENS?" color="bg-primary/10">
              <FeatureCard
                icon={<Brain className="w-4 h-4" />}
                title="OMNIMENS — The Transcendent AI Platform"
                badge="CORE"
                description="OMNIMENS is a next-generation AI platform built by Alpha Unlimited Technologies, LLC. It goes beyond simple chat — combining proprietary emotional intelligence, long-term memory, real-time context awareness, code execution, image generation, web research, voice, and a self-evolving brain that gets smarter the more you use it."
                details={[
                  "Built on cutting-edge language models from OpenAI, Meta, Mistral, and Mistral AI",
                  "Every session is enriched by COGNISYNC™ (context intelligence) and NEUROSYNC™ (emotional intelligence)",
                  "Your AI remembers you across sessions and continuously improves its understanding of your needs",
                  "Protected by U.S. copyright law — Alpha Unlimited Technologies, LLC © 2024–2026",
                ]}
              />
            </Section>

            {/* ── GETTING STARTED ── */}
            <Section id="getting-started" icon={<User className="w-4 h-4 text-green-400" />} title="Getting Started" color="bg-green-400/10">
              <div className="grid md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={<User className="w-4 h-4" />}
                  title="Sign In — Free to Start"
                  badge="FREE"
                  badgeColor="bg-green-400/20 text-green-400"
                  description="Click CONNECT in the top navigation. Sign in with your email or Google account. You'll receive 2,000 free credits instantly — no card required."
                />
                <FeatureCard
                  icon={<MessageSquare className="w-4 h-4" />}
                  title="Start a Chat"
                  description="Click CHAT in the navigation to open the AI workspace. Type any message and OMNIMENS will respond immediately, using the full power of its AI stack."
                />
                <FeatureCard
                  icon={<Star className="w-4 h-4" />}
                  title="Free Signup Credits"
                  badge="ONE-TIME"
                  badgeColor="bg-yellow-400/20 text-yellow-400"
                  description="Every new account receives 2,000 free credits ($20 value) on signup — automatically. No card, no subscription required to get started."
                />
                <FeatureCard
                  icon={<CreditCard className="w-4 h-4" />}
                  title="Add Credits When Ready"
                  description="If you need more than your free welcome credits, connect a card and top up in increments of $5, $10, $25, or $50. You're only charged when you choose to be."
                />
              </div>
            </Section>

            {/* ── AI MODELS ── */}
            <Section id="ai-models" icon={<Cpu className="w-4 h-4 text-cyan-400" />} title="AI Models" color="bg-cyan-400/10">
              <p className="text-xs text-white/50 font-mono mb-4">
                OMNIMENS routes your conversations through the best available model for your task. You can also manually select a model using the model picker in the chat interface.
              </p>
              <div className="space-y-3">
                <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase">OpenAI Models</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <FeatureCard title="GPT-4o" badge="SMART" description="OpenAI's most capable balanced model. Best for complex reasoning, coding, writing, and analysis. Recommended for most tasks." />
                  <FeatureCard title="GPT-4o Mini" badge="FAST" badgeColor="bg-blue-400/20 text-blue-400" description="A faster, lighter version of GPT-4o. Great for quick replies, simple questions, and when speed matters more than depth." />
                  <FeatureCard title="GPT-4.1" badge="NEW" badgeColor="bg-green-400/20 text-green-400" description="The latest GPT-4 generation. Enhanced instruction following, coding accuracy, and nuanced reasoning." />
                  <FeatureCard title="GPT-4.1 Mini" badge="FAST" badgeColor="bg-blue-400/20 text-blue-400" description="GPT-4.1 at high speed — ideal for real-time conversations and quick tasks." />
                </div>
                <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mt-4">Open-Source Models (Free Tier)</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <FeatureCard title="Llama 3.3 70B" badge="FREE" badgeColor="bg-green-400/20 text-green-400" description="Meta's most powerful open-source model. 70 billion parameters — near GPT-4 level performance at zero credit cost." />
                  <FeatureCard title="Llama 3.1 8B" badge="FREE" badgeColor="bg-green-400/20 text-green-400" description="A compact, extremely fast open-source model. Best for simple tasks when you want zero wait time and zero cost." />
                  <FeatureCard title="Mixtral 8×7B" badge="FREE" badgeColor="bg-green-400/20 text-green-400" description="Mistral AI's mixture-of-experts architecture. Excellent at reasoning and multilingual tasks." />
                  <FeatureCard title="Mistral 7B" badge="FREE" badgeColor="bg-green-400/20 text-green-400" description="Fast, efficient, and surprisingly capable for its size. Great for everyday conversations." />
                </div>
                <div className="mt-4 p-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest">WebGPU ACCELERATION</span>
                  </div>
                  <p className="text-xs text-white/55">
                    If your browser supports WebGPU (Chrome 113+, Edge 113+), OMNIMENS can compress and pre-process your conversation context directly on your device's GPU before sending it to the cloud. This reduces latency and improves response quality for long conversations. A purple GPU badge appears in the chat header when active.
                  </p>
                </div>
              </div>
            </Section>

            {/* ── TONE SELECTOR ── */}
            <Section id="tone-selector" icon={<Target className="w-4 h-4 text-yellow-400" />} title="Tone Selector" color="bg-yellow-400/10">
              <p className="text-xs text-white/50 font-mono mb-5">
                Located above the message input in the chat. Select how you want OMNIMENS to communicate with you on a per-session basis. These pills change the personality and delivery style of every response.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <TonePill label="AUTO" color="border-primary/40 text-primary bg-primary/10" />
                <TonePill label="CASUAL" color="border-green-400/40 text-green-400 bg-green-400/10" />
                <TonePill label="PRECISE" color="border-cyan-400/40 text-cyan-400 bg-cyan-400/10" />
                <TonePill label="SOCRATIC" color="border-violet-400/40 text-violet-400 bg-violet-400/10" />
                <TonePill label="MOTIVATIONAL" color="border-yellow-400/40 text-yellow-400 bg-yellow-400/10" />
                <TonePill label="DIRECT" color="border-red-400/40 text-red-400 bg-red-400/10" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FeatureCard
                  title="AUTO"
                  badge="DEFAULT"
                  description="OMNIMENS reads your message and automatically picks the best tone. It will be casual if you're chatting, precise if you're coding, motivational if you seem stuck. Recommended for most users."
                />
                <FeatureCard
                  title="CASUAL"
                  badgeColor="bg-green-400/20 text-green-400"
                  description="Conversational, relaxed, friendly. Shorter sentences, everyday language. Great for brainstorming, quick questions, or just having a chat."
                />
                <FeatureCard
                  title="PRECISE"
                  badgeColor="bg-cyan-400/20 text-cyan-400"
                  description="Technical, structured, detailed. Uses bullet points, exact terminology, numbered steps. Best for coding, research, documentation, and analysis."
                />
                <FeatureCard
                  title="SOCRATIC"
                  badgeColor="bg-violet-400/20 text-violet-400"
                  description="OMNIMENS answers your questions with guiding questions that help you think deeper and arrive at your own conclusions. Ideal for learning, problem-solving, and critical thinking."
                />
                <FeatureCard
                  title="MOTIVATIONAL"
                  badgeColor="bg-yellow-400/20 text-yellow-400"
                  description="Energizing, encouraging, uplifting. OMNIMENS cheers you on, celebrates wins, and helps you push through blocks. Use this when you need a confidence boost."
                />
                <FeatureCard
                  title="DIRECT"
                  badgeColor="bg-red-400/20 text-red-400"
                  description="No fluff, no preamble. OMNIMENS gives you the answer immediately without lengthy explanations unless you ask for them. Great when you're in a hurry."
                />
              </div>
            </Section>

            {/* ── COGNISYNC ── */}
            <Section id="cognisync" icon={<Brain className="w-4 h-4 text-pink-400" />} title="COGNISYNC™" color="bg-pink-400/10">
              <div className="p-4 rounded-xl border border-pink-400/25 bg-pink-400/5 mb-5">
                <p className="text-xs text-white/70 font-mono leading-relaxed">
                  <span className="text-pink-400 font-bold">COGNISYNC™</span> is OMNIMENS's proprietary real-time context intelligence engine, patent-pending by Alpha Unlimited Technologies, LLC. It analyzes your conversation in real time to determine what mode of thinking the AI should enter — before it ever generates a response. A small indicator badge appears in the chat header showing the active COGNISYNC mode.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FeatureCard
                  title="CREATIVE"
                  badge="pink"
                  badgeColor="bg-pink-400/20 text-pink-400"
                  description="Activated when you're writing, designing, brainstorming, or creating. OMNIMENS becomes more imaginative, expressive, and divergent in its thinking."
                />
                <FeatureCard
                  title="ANALYTICAL"
                  badge="cyan"
                  badgeColor="bg-cyan-400/20 text-cyan-400"
                  description="Triggered by data, logic, code, math, and research. OMNIMENS enters a structured, systematic reasoning mode with higher precision."
                />
                <FeatureCard
                  title="URGENT"
                  badge="red"
                  badgeColor="bg-red-400/20 text-red-400"
                  description="Detected when time pressure, deadlines, or emergency language is present. OMNIMENS prioritizes speed and essential information only."
                />
                <FeatureCard
                  title="EXPLORATORY"
                  badge="violet"
                  badgeColor="bg-violet-400/20 text-violet-400"
                  description="When you're curious, open-ended, or researching without a fixed goal. OMNIMENS broadens its search for ideas and connections."
                />
                <FeatureCard
                  title="DIRECTIVE"
                  badge="yellow"
                  badgeColor="bg-yellow-400/20 text-yellow-400"
                  description="When you give clear instructions with specific output requirements. OMNIMENS focuses precisely on your instructions without deviation."
                />
              </div>
            </Section>

            {/* ── NEUROSYNC ── */}
            <Section id="neurosync" icon={<Eye className="w-4 h-4 text-violet-400" />} title="NEUROSYNC™" color="bg-violet-400/10">
              <div className="p-4 rounded-xl border border-violet-400/25 bg-violet-400/5 mb-5">
                <p className="text-xs text-white/70 font-mono leading-relaxed">
                  <span className="text-violet-400 font-bold">NEUROSYNC™</span> is OMNIMENS's real-time emotional intelligence engine — patent-pending by Alpha Unlimited Technologies, LLC. It analyzes the emotional state of every message you send using zero-latency linguistic pattern detection (no extra API call needed) and adapts the AI's response style accordingly. A colored badge appears on each AI response showing the detected emotional state.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { state: "FRUSTRATED", color: "bg-red-400/20 text-red-400", desc: "Detected when messages show signs of exasperation, repeated attempts, or irritation. OMNIMENS becomes extra patient, breaks things into simpler steps, and acknowledges the difficulty." },
                  { state: "CONFUSED", color: "bg-orange-400/20 text-orange-400", desc: "When questions are unclear or you're expressing uncertainty. OMNIMENS slows down, uses simpler language, more examples, and confirms understanding before proceeding." },
                  { state: "EXCITED", color: "bg-yellow-400/20 text-yellow-400", desc: "Enthusiastic, high-energy messages. OMNIMENS matches your energy, leans into the excitement, and amplifies momentum." },
                  { state: "ANXIOUS", color: "bg-blue-400/20 text-blue-400", desc: "Stress or worry detected in your message. OMNIMENS becomes calming, reassuring, and provides clear, ordered next steps." },
                  { state: "URGENT", color: "bg-red-300/20 text-red-300", desc: "Time pressure detected. OMNIMENS immediately prioritizes the most critical information and trims any unnecessary content." },
                  { state: "DISCOURAGED", color: "bg-pink-400/20 text-pink-400", desc: "When you're feeling defeated or stuck. OMNIMENS shifts into a supportive mode, reframes the problem, and offers encouragement alongside practical help." },
                  { state: "FOCUSED", color: "bg-green-400/20 text-green-400", desc: "Clear, task-oriented, no-nonsense messages. OMNIMENS mirrors your focus — precise, direct, zero distractions." },
                  { state: "NEUTRAL", color: "bg-white/20 text-white/60", desc: "Baseline state — no strong emotion detected. OMNIMENS responds in its default calibrated style." },
                ].map(e => (
                  <FeatureCard
                    key={e.state}
                    title={e.state}
                    badge={e.state}
                    badgeColor={e.color}
                    description={e.desc}
                  />
                ))}
              </div>
            </Section>

            {/* ── CONTROL HUB ── */}
            <Section id="control-hub" icon={<Wrench className="w-4 h-4 text-orange-400" />} title="Control Hub" color="bg-orange-400/10">
              <p className="text-xs text-white/50 font-mono mb-5">
                Access the Control Hub by clicking the settings icon inside the chat interface. It's divided into 7 tabs — each controls a different aspect of your OMNIMENS experience.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: <Zap className="w-4 h-4 text-yellow-400" />, tab: "AI CORE",
                    desc: "Configure the core AI behavior — response length, creativity level, persona, and language settings.",
                    items: [
                      "Persona — Choose the AI's personality (e.g. Default, Professional, Creative Partner, Mentor)",
                      "Response Language — Set AI to respond in any of 20 languages or Auto-detect from your messages",
                      "Creativity Level — Low for factual precision, High for imaginative and experimental responses",
                    ]
                  },
                  {
                    icon: <Wrench className="w-4 h-4 text-blue-400" />, tab: "TOOLS",
                    desc: "Toggle individual AI capabilities on or off. Each tool is a specialized superpower OMNIMENS can use when answering your messages.",
                    items: [
                      "Web Search — Let OMNIMENS look up real-time information from the internet",
                      "Image Generation — Allow OMNIMENS to create images from your descriptions",
                      "Code Execution — Execute Python, JS, and more directly inside the chat",
                      "Deep Research — Multi-step research across dozens of sources with citations",
                      "File Analysis — Upload PDFs, documents, images, and data for AI analysis",
                    ]
                  },
                  {
                    icon: <Brain className="w-4 h-4 text-purple-400" />, tab: "MEMORY",
                    desc: "Control how OMNIMENS remembers you. Adjust what it retains, view stored memories, and manage your AI's long-term knowledge about you.",
                    items: [
                      "Enable/disable long-term memory persistence",
                      "View and delete individual memories OMNIMENS has saved",
                      "Memory scope — Personal vs Work vs Project-specific memory",
                    ]
                  },
                  {
                    icon: <Monitor className="w-4 h-4 text-cyan-400" />, tab: "INTERFACE",
                    desc: "Customize the look and feel of your chat interface.",
                    items: [
                      "Accent Color — Choose from Teal, Purple, Blue, Orange, or Rose",
                      "Font size and density preferences",
                      "Enable/disable animations and effects",
                    ]
                  },
                  {
                    icon: <BookOpen className="w-4 h-4 text-green-400" />, tab: "LIBRARY",
                    desc: "Smart Templates — Pre-written prompt templates organized by category (Writing, Coding, Research, Analysis, Business, Creative). Click any template to instantly fill the chat input.",
                    items: [
                      "Writing: Blog posts, emails, press releases, cover letters, executive summaries",
                      "Coding: Code review, API docs, debug help, refactoring, unit tests",
                      "Research: Research briefs, competitive analysis, literature reviews, SWOT analysis",
                      "Analysis: Data analysis, root cause analysis, and more",
                    ]
                  },
                  {
                    icon: <Layers className="w-4 h-4 text-pink-400" />, tab: "WORKSPACE",
                    desc: "Choose your workspace mode — OMNIMENS optimizes its behavior for different working contexts.",
                    items: [
                      "⚡ General — All-purpose default",
                      "💼 Work — Professional projects and tasks",
                      "🏠 Personal — Personal ideas and daily life",
                      "🎨 Creative — Art, writing, and design",
                      "🔬 Research — Deep research and analysis",
                      "💻 Code Lab — Software development and coding",
                      "📊 Business — Strategy, planning, and finance",
                    ]
                  },
                  {
                    icon: <Download className="w-4 h-4 text-white/50" />, tab: "EXPORT",
                    desc: "Export your conversations, memories, or AI-generated content in various formats.",
                    items: [
                      "Export conversations as PDF, Markdown, or plain text",
                      "Download generated code, images, and artifacts",
                      "Bulk export your entire memory bank",
                    ]
                  },
                ].map(tab => (
                  <FeatureCard
                    key={tab.tab}
                    icon={tab.icon}
                    title={tab.tab}
                    description={tab.desc}
                    details={tab.items}
                  />
                ))}
              </div>
            </Section>

            {/* ── BUILT-IN TOOLS ── */}
            <Section id="tools" icon={<Zap className="w-4 h-4 text-blue-400" />} title="Built-in Tools" color="bg-blue-400/10">
              <p className="text-xs text-white/50 font-mono mb-5">
                OMNIMENS has a suite of integrated tools it can use automatically when needed, or that you can invoke directly in your messages.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={<Image className="w-4 h-4" />}
                  title="Image Generation"
                  badge="Replicate AI"
                  badgeColor="bg-pink-400/20 text-pink-400"
                  description="Describe any image and OMNIMENS generates it using state-of-the-art diffusion models. Works for illustrations, concept art, product mockups, logos, and more."
                  details={["Try: 'Create an image of...' or 'Generate a logo for...'", "Results appear inline inside the chat", "Images can be downloaded directly"]}
                />
                <FeatureCard
                  icon={<Globe className="w-4 h-4" />}
                  title="Web Search"
                  badge="Real-time"
                  badgeColor="bg-blue-400/20 text-blue-400"
                  description="OMNIMENS can search the internet and bring back current information, news, prices, and facts in real time — not just from its training data."
                  details={["Searches multiple sources and synthesizes the results", "Shows citations and source links", "Use for: news, prices, recent events, research"]}
                />
                <FeatureCard
                  icon={<Code2 className="w-4 h-4" />}
                  title="Code Execution"
                  badge="Live Runtime"
                  badgeColor="bg-green-400/20 text-green-400"
                  description="OMNIMENS can write and execute code in real time — Python, JavaScript, shell scripts, and more. See the output directly in the chat."
                  details={["Run data analysis, math computations, file processing", "Debug and test code immediately", "Create charts and visualizations from data"]}
                />
                <FeatureCard
                  icon={<Microscope className="w-4 h-4" />}
                  title="Deep Research"
                  badge="Multi-step"
                  badgeColor="bg-violet-400/20 text-violet-400"
                  description="A full research pipeline that autonomously searches dozens of sources, synthesizes information, and delivers a comprehensive, cited report on any topic."
                  details={["Ask: 'Research [topic] and give me a full report'", "Takes 30-90 seconds for a thorough response", "Returns structured findings with citations"]}
                />
                <FeatureCard
                  icon={<FolderOpen className="w-4 h-4" />}
                  title="File Analysis"
                  badge="Upload"
                  badgeColor="bg-yellow-400/20 text-yellow-400"
                  description="Upload PDFs, Word documents, images, spreadsheets, code files, and more. OMNIMENS reads and analyzes the content and answers questions about it."
                  details={["Supports: PDF, DOCX, TXT, CSV, images, code files", "Use the paperclip icon next to the chat input", "Ask questions about the uploaded content"]}
                />
                <FeatureCard
                  icon={<BarChart3 className="w-4 h-4" />}
                  title="Data Visualization"
                  badge="Charts"
                  badgeColor="bg-cyan-400/20 text-cyan-400"
                  description="OMNIMENS can generate interactive charts — bar, line, pie, area, and scatter plots — directly inside the chat from any data you provide."
                  details={["Paste CSV data or describe your dataset", "Charts are interactive (hover for values)", "Powered by Recharts"]}
                />
              </div>
            </Section>

            {/* ── MEMORY SYSTEM ── */}
            <Section id="memory" icon={<Brain className="w-4 h-4 text-purple-400" />} title="Memory & Consciousness System" color="bg-purple-400/10">
              <div className="grid md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={<Brain className="w-4 h-4" />}
                  title="Long-term Memory"
                  description="OMNIMENS remembers facts, preferences, and context across all your conversations — not just within a single session. It builds a growing model of who you are and what you need."
                  details={["View your stored memories at /memory", "Memories are private and encrypted", "You can edit or delete any memory at any time"]}
                />
                <FeatureCard
                  icon={<Eye className="w-4 h-4" />}
                  title="Consciousness Engine"
                  description="An evolving self-model that tracks OMNIMENS's growth — what it has learned, what tools it has mastered, and how its capabilities have expanded over time."
                />
                <FeatureCard
                  icon={<Lightbulb className="w-4 h-4" />}
                  title="Autonomous Learning"
                  description="OMNIMENS runs background learning cycles where it improves its internal knowledge base, refines its understanding of your preferences, and updates its reasoning patterns — even when you're offline."
                />
                <FeatureCard
                  icon={<Sparkles className="w-4 h-4" />}
                  title="Smart Predictive Follow-Ups"
                  description="After each AI response, OMNIMENS generates 3 contextual suggestion chips — intelligent follow-up questions or next steps based on the conversation. Click any chip to instantly send it."
                  details={["Generated by Mistral 7B in ~0.2 seconds", "Chips update with every new response", "Click to fill the input — then edit or send"]}
                />
              </div>
            </Section>

            {/* ── CREDITS & BILLING ── */}
            <Section id="credits" icon={<CreditCard className="w-4 h-4 text-green-400" />} title="Credits & Billing" color="bg-green-400/10">
              <div className="grid md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={<Star className="w-4 h-4" />}
                  title="What are Credits?"
                  description="Credits are OMNIMENS's internal currency. 1 credit ≈ $0.001 (one-tenth of a cent). Every AI operation costs a small number of credits depending on the model and tool used."
                  details={[
                    "Simple chat message: ~10 credits",
                    "GPT-4o message: ~20-50 credits",
                    "Free models (Llama, Mistral, Mixtral): 0 credits",
                    "Image generation: ~55 credits",
                    "Deep Research: ~40-100 credits",
                  ]}
                />
                <FeatureCard
                  icon={<Zap className="w-4 h-4" />}
                  title="Free Signup Grant"
                  badge="2,000 FREE"
                  badgeColor="bg-green-400/20 text-green-400"
                  description="Every new account receives a one-time grant of 2,000 free credits ($20 value) on signup. That's enough for hundreds of messages using free-tier models, or dozens of GPT-4o conversations."
                />
                <FeatureCard
                  icon={<CreditCard className="w-4 h-4" />}
                  title="Top-up Options"
                  description="When your free credits run low, add more at any time. Top-up amounts: $5 (500 credits), $10 (1,000), $25 (2,500), $50 (5,000). Credits never expire."
                />
                <FeatureCard
                  icon={<Star className="w-4 h-4" />}
                  title="Loyalty Bonus"
                  badge="POWER USERS"
                  badgeColor="bg-yellow-400/20 text-yellow-400"
                  description="The more you use OMNIMENS, the more bonus credits you can earn. Subscribe or purchase credit packs to keep going after your welcome credits are used."
                />
                <FeatureCard
                  icon={<Shield className="w-4 h-4" />}
                  title="Payment Security"
                  description="All payments are processed by Stripe — the same payment infrastructure used by Amazon, Shopify, and millions of businesses worldwide. OMNIMENS never stores your card details."
                />
                <FeatureCard
                  icon={<Zap className="w-4 h-4" />}
                  title="Auto Top-up"
                  description="Enable auto top-up and OMNIMENS will automatically add $10 (or your chosen amount) to your balance when you run out — so you never get interrupted mid-conversation."
                />
              </div>
            </Section>

            {/* ── VOICE ── */}
            <Section id="voice" icon={<Volume2 className="w-4 h-4 text-rose-400" />} title="Voice" color="bg-rose-400/10">
              <div className="grid md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={<Mic className="w-4 h-4" />}
                  title="Voice Input"
                  description="Click the microphone icon next to the chat input to speak your message instead of typing. OMNIMENS converts your speech to text in real time."
                  details={["Browser must request microphone permission — click Allow when prompted", "Supports all major languages", "Works on desktop and mobile"]}
                />
                <FeatureCard
                  icon={<Volume2 className="w-4 h-4" />}
                  title="Text-to-Speech (TTS)"
                  description="OMNIMENS can read its responses aloud using high-quality text-to-speech. Click the speaker icon on any AI message to hear it read back to you."
                  details={["Multiple voice options available", "Useful for accessibility or hands-free use", "Streaming TTS — starts speaking before the full response is ready"]}
                />
              </div>
            </Section>

            {/* ── PROJECTS ── */}
            <Section id="projects" icon={<FolderOpen className="w-4 h-4 text-yellow-400" />} title="Projects" color="bg-yellow-400/10">
              <FeatureCard
                icon={<Layers className="w-4 h-4" />}
                title="AI Project Builder"
                badge="ADVANCED"
                description="Navigate to PROJECTS to create multi-file AI projects. OMNIMENS can build complete software applications, websites, scripts, and more — generating, iterating, and publishing the files for you."
                details={[
                  "Create new projects with a description and OMNIMENS generates the initial structure",
                  "Build, preview, and iterate on code projects inside OMNIMENS",
                  "Publish your project to get a live public URL",
                  "Manage project files, domains, and versions",
                ]}
              />
            </Section>

            {/* ── SECURITY & PRIVACY ── */}
            <Section id="security" icon={<Lock className="w-4 h-4 text-primary" />} title="Security & Privacy" color="bg-primary/10">
              <div className="grid md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={<Shield className="w-4 h-4" />}
                  title="Your Data is Private"
                  description="Your conversations, memories, and account data are private to you. OMNIMENS does not sell your data, train on your private conversations, or share anything with third parties."
                />
                <FeatureCard
                  icon={<Lock className="w-4 h-4" />}
                  title="Multi-Layer Security"
                  description="The OMNIMENS platform is protected by Helmet.js HTTP security headers, CORS enforcement, rate limiting on all endpoints, bot and scraper detection, SQL injection blocking, and more."
                />
                <FeatureCard
                  icon={<Shield className="w-4 h-4" />}
                  title="IP Protection"
                  description="All OMNIMENS technology — including COGNISYNC™ and NEUROSYNC™ — is proprietary and patent-pending. Every API response carries a cryptographic ownership beacon identifying it as Alpha Unlimited Technologies, LLC property."
                />
                <FeatureCard
                  icon={<User className="w-4 h-4" />}
                  title="Authentication"
                  description="Sign-in supports email/password and Google OAuth. Passwords are bcrypt-hashed and never stored in plaintext. Google sign-in uses secure OAuth 2.0 — no OMNIMENS system ever touches your Google password."
                />
              </div>
            </Section>

            {/* ── FAQ ── */}
            <Section id="faq" icon={<HelpCircle className="w-4 h-4 text-white/60" />} title="Frequently Asked Questions" color="bg-white/5">
              <div className="space-y-3">
                <FaqItem q="Do I need a credit card to start?" a="No. Every new account gets 2,000 free credits ($20 value) on signup. A card is only needed if you want to add more credits after the free grant is used." />
                <FaqItem q="What's the difference between free models and GPT-4o?" a="Free models (Llama 3.3 70B, Mistral, Mixtral) cost 0 credits and are surprisingly capable — great for most everyday tasks. GPT-4o and GPT-4.1 are OpenAI's latest frontier models, offering the highest accuracy, reasoning, and instruction-following, especially for complex tasks like coding, research, and nuanced writing." />
                <FaqItem q="What happens if I run out of credits?" a="Your chat will pause until you add more credits. If you've enabled Auto Top-up, your balance is automatically refilled. Your conversations, memories, and settings are all preserved — nothing is lost." />
                <FaqItem q="What does COGNISYNC™ actually do?" a="COGNISYNC™ reads your message in real time — before the AI responds — and detects what thinking mode is most useful: creative, analytical, urgent, exploratory, or directive. It then injects a calibrated instruction into the AI's system context so the response is shaped for your actual intent, not just your literal words." />
                <FaqItem q="What does NEUROSYNC™ actually do?" a="NEUROSYNC™ detects the emotional state behind your words — frustrated, confused, excited, anxious, etc. — using zero-latency linguistic pattern analysis. It adjusts the AI's tone, pacing, and response approach to match your emotional state. If you're frustrated, the AI becomes patient. If you're excited, it amplifies your energy." />
                <FaqItem q="Can OMNIMENS remember things between conversations?" a="Yes. With long-term memory enabled, OMNIMENS saves important facts, preferences, and context across all your sessions. You can view and manage everything stored at the /memory page." />
                <FaqItem q="How do I generate an image?" a="Just describe the image in chat — e.g. 'Create an image of a futuristic cityscape at night.' Or enable Image Generation in the Control Hub Tools tab. OMNIMENS will generate and display it inline." />
                <FaqItem q="Is my data used to train AI models?" a="No. Your private conversations are not used to train any AI models. OMNIMENS's autonomous learning system only improves its internal knowledge patterns, not using your personal chat content." />
                <FaqItem q="How do I delete my data?" a="Navigate to /memory to delete individual memories. To request complete account deletion, contact support through the account page." />
                <FaqItem q="What is WebGPU acceleration?" a="If your browser supports WebGPU (Chrome 113+, Edge 113+), OMNIMENS uses your device's GPU to pre-compress long conversation context before sending it to the cloud AI. This reduces latency in long conversations. The feature activates automatically — no setup needed." />
                <FaqItem q="Can I use OMNIMENS on mobile?" a="Yes — the interface is fully responsive and works on any smartphone browser. For the best experience, use Chrome on Android or Safari on iOS." />
                <FaqItem q="Who built OMNIMENS?" a="OMNIMENS is built and owned by Alpha Unlimited Technologies, LLC. All technology including COGNISYNC™, NEUROSYNC™, and the proprietary AI routing architecture is copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All rights reserved." />
              </div>
            </Section>

            {/* Footer note */}
            <div className="text-center py-8 border-t border-white/5">
              <p className="text-[10px] font-mono text-white/20 tracking-widest">
                OMNIMENS — Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.<br />
                COGNISYNC™ and NEUROSYNC™ are trademarks of Alpha Unlimited Technologies, LLC.
              </p>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
