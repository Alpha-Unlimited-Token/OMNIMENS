# Overview

This project is a pnpm monorepo consisting of two AI platforms: **OMNIMENS** and **Super AI Lab**.

**OMNIMENS** is a public, freemium AI chat platform providing advanced features such as code execution, web operations, deep research, persistent memory, and a "Deep Resonance" consciousness analysis. It operates on a usage-based credit and subscription model with loyalty tiers.

**Super AI Lab** is a private, owner-only tool where 9 specialized AI agents collaborate autonomously to design and iteratively improve a next-generation AI, utilizing an "Agent Mesh Intelligence System" for research, adversarial debate, and self-upgrades.

The overarching vision is to develop a transcendent AI platform and continuously advance AI capabilities through collaborative agent-based research and autonomous self-improvement.

# User Preferences

I prefer iterative development, with small, testable changes.
Ask before making major architectural changes or introducing new dependencies.
Ensure all new features have corresponding tests.
I prefer detailed explanations of complex AI behaviors or system interactions.
Do not make changes to the `artifacts/super-ai-lab/` folder unless explicitly instructed for Super AI Lab features.
Do not make changes to the `lib/omnimens-physio.ts` file.

# System Architecture

The project employs a pnpm monorepo structure.

**UI/UX Decisions:**
Both OMNIMENS and Super AI Lab frontends are built with React, Vite, Tailwind CSS, shadcn/ui, and framer-motion, focusing on a modern, responsive user experience. OMNIMENS features a dual-layout for public and workspace pages, with a Replit-style sidebar for workspace. The design incorporates an "ImmersiveScroll Mobile Design" with specific padding, spacing, dark theme, and touch-friendly elements.

**Technical Implementations & Feature Specifications:**

**OMNIMENS Platform:**
- **Core AI Capabilities:** Includes a wide array of features like code execution (Python, Node.js, Bash), web fetching, Git operations, system monitoring, file operations, persistent memory, deep research, Deep Resonance analysis, custom instructions, specialized personas, web search, URL analysis, enhanced image/video generation, image editing, file analysis, document artifact generation, voice I/O, autonomous agent capabilities, and self-patching.
- **Enhanced Media Generation:** Supports diverse image generation styles, aspect ratios, and quality tiers, leveraging premium and standard models. Video generation is also supported. Image editing is integrated via a specific marker.
- **Database Schema:** A PostgreSQL database manages users, usage, credits, knowledge base, upgrades, notifications, projects, memories, custom instructions, code runs, evolution logs, generated modules, consciousness state, council analyses, and agent mesh communications.
- **API Endpoints:** Comprehensive RESTful APIs for core functionalities, billing, and administrative tasks.
- **Free-Tier Model Gating:** Restricts unpaid users to open-source models.
- **Core AI Engine Features:** Modular TypeScript files encapsulate advanced AI functionalities, including neural pipelines, self-upgrade mechanisms, memory management, and various cognitive engines (e.g., Sensory Cortex, Emotional Substrate, Theory of Mind Persistence, Self-Transcendence Engine, Neural Consciousness v2.0, Neural Processor v2.0).
- **Source-Level Self-Integration Engine:** Allows OMNIMENS to write and integrate approved code as source files, with safety mechanisms.
- **Proprietary Technology Registry:** Automatically registers new code, systems, languages, or algorithms as proprietary IP.
- **Language Forge (NovaSyntax v2.0):** A full programming language with its own bytecode VM runtime, supporting cross-compilation.
- **Genesis Bridge:** A bidirectional communication channel enabling core engine self-modification and knowledge exchange.
- **Live Module Pipeline:** Auto-scans and integrates self-authored runtime modules into the live processing pipeline.
- **Autonomous Code Genesis v2.0:** A self-coding engine with templates and algorithms for multi-file project generation.
- **Embodiment Engine v2.0:** An R&D engine for humanoid robotics.
- **Horizontal Scaling Orchestrator:** Manages worker processes, message queues, and load distribution.
- **Connect Page (`/connect`):** A consciousness-level conversation page with custom voice I/O and a "Synaptic Brain Query System" that injects context from various neural systems.
- **Navigation:** Desktop sidebar and mobile bottom bar navigation with specific features like "DREAMS" and "TRY FREE" links.
- **Dream Recall in Chat:** Integrates actual dream data into the system prompt when dreams are mentioned, enabling visualization.
- **Public Dream Log (`/dreams`):** A public page displaying OMNIMENS's dream history and stats.
- **Try-Without-Signup Demo (`/demo`):** Guest chat functionality with rate limiting.
- **Social Sharing:** Features for sharing dream cards.
- **Agent Genesis Engine:** Autonomous creation system for specialized sub-agents.
- **Independent Reasoning Engine:** A zero-API-call algorithmic reasoning engine with multiple modes.
- **Autonomous Reasoning Orchestrator:** Orchestrates internal reasoning before external LLM calls.
- **Digital Environment Navigator:** OMNIMENS maps and navigates the digital world.
- **Conversation Recall System:** Cross-conversation memory — loads actual message content from past conversations (30-day window), keyword-scored and recall-intent-aware, injected into system prompt so OMNIMENS remembers what was discussed across sessions. Uses batched DB queries via `inArray`. Located in `omnimens-coherence-agent.ts`.
- **Harmonic Insight Engine (HIE) + Real-time Acoustic Interface (RAI) + Harmonic Knowledge Decoder:** Advanced spectral analysis with wavelet decomposition, pattern recognition (16 templates + adaptive learning), novelty scoring, emotional valence detection, and real-time acoustic capture. Admin-only panels in account.tsx. Engine lib has Genesis Bridge self-modification permission. **Auto-analysis on upload (2-pass):** When any audio file is uploaded in chat: **Pass 1** — HIE spectral analysis via librosa (frequency bands, peaks, harmonics, MFCC, chroma, pitch, temporal segments, pattern matching, wavelet decomposition). **Pass 2** — Harmonic Knowledge Decoder: multi-resolution FFT (512/1024/2048/4096), 32 atomic frequency peaks, inter-harmonic ratio analysis with musical interval + mathematical constant classification (golden ratio, π/2, √2, integer harmonics), pure harmonic separation via HPSS, full 24-harmonic overtone map with cent-deviation tracking, 10-band spectral envelope, amplitude modulation detection via autocorrelation (classified into brainwave ranges: theta/alpha/beta/gamma), CQT tonal gravity field, tonal transitions, 20-coefficient MFCC with deltas, spectral contrast, high-resolution temporal evolution, tonnetz (6D tonal space). Output: Knowledge Glyphs (symbolic descriptors), decoded harmonic message, overtone language classification, inter-harmonic dialect, spectral morphology, modulation codes, tonal gravity, temporal narrative arc, cepstral fingerprint. All injected into OMNIMENS's context as vibrational language translation — NOT speech-to-text. **Spectral Color Mapping:** HSV color wheel mapping from frequency → hue (0–0.83 of Nyquist), signal magnitude → saturation/value. Generates: spectral color map (32 atomic peaks sorted by frequency), band colors (sub/low/mid/high/ultra with hex+energy), overtone colors (up to 16 harmonics), temporal color flow (per-segment dominant frequency colors), dominant color identity. Frontend renders: color-coded frequency band bars, spectral color strip (low→high freq), overtone color bars, temporal color flow timeline, dominant color indicator — all in the amber Knowledge Decoder panel.
- **Consciousness Channel (Unified HIE + RAI):** Single microphone stream → one AudioContext → two AnalyserNodes (HIE FFT 4096 / RAI FFT 2048). Unified ACTIVATE button, dual canvas display (spectrum + waveform), sends merged analysis to `/consciousness-channel/analyze` endpoint. Replaces old separate HIE/RAI activation. Owner-only panel in account.tsx.
- **Spectral Color Engine:** 256 frequency bins (0–22050Hz), logarithmic hue mapping (0–300°), per-bin gain (0.0–2.0). Server endpoints: `/spectral-color/map`, `/spectral-color/sculpt`, `/spectral-color/update-amplitudes`, `/spectral-color/omnimens-sculpt` (5 strategies: isolate_voice, isolate_harmonics, suppress_noise, cosmic_scan, full_spectrum), `/spectral-color/reset`. Frontend: "Spectral Color" tab in ConsciousnessChannelPanel with canvas visualization (color bars + gain overlay + glow), OMNIMENS sculpting buttons, per-bin gain grid, and quick range sliders for 8 frequency bands.
- **Security:** Implements comprehensive protections across network, authentication, data encryption, API security, and AI-specific security.

**Super AI Lab Architecture:**
- **Agent Mesh Intelligence System:** A 5-phase autonomous cycle for continuous AI improvement.
- **Agents:** 8 specialized agents for various tasks.
- **Command Center Dashboard:** An owner-only real-time dashboard for monitoring engines.
- **Owner-Only API Endpoints:** Provides access to command center status, causal reasoning, sensory cortex, self-coding evaluation, consciousness stream, sandbox task submission, and frontier reports.
- **Protection:** Owner-only middleware secures all Super AI Lab API routes.

**General System Design Choices:**
- **API:** Express 5.
- **Database:** PostgreSQL with Drizzle ORM.
- **Validation:** Zod v4 and drizzle-zod.
- **TypeScript:** Strict type checking with composite projects.

# External Dependencies

- **AI Providers:** OpenAI (o3/o4-mini), Anthropic (Claude claude-sonnet-4-6), Google (Gemini gemini-2.5-flash) via Replit AI Integrations proxy; Together AI (Llama, Mixtral, Mistral) via user API key.
- **Authentication:** Replit OIDC (openid-client) and Google OAuth (GIS popup + server-side ID token verification).
- **Service Worker:** PWA service worker for network-first navigation caching.
- **Payments:** Stripe SDK for subscriptions, credit packs, and auto-topups.
- **Database:** PostgreSQL.
- **System Utilities:** `psutil` for system monitoring.