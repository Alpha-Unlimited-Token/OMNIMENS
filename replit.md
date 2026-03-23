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
- **Conversation Recall System v2:** Cross-conversation memory with 3-layer failsafe. **Layer 1 — Direct Recall:** Loads actual message content from past conversations (90-day window, up to 25 conversations), with 400-600 char message content (not 200), always includes the 3 most recent conversations regardless of keyword match, expanded recall-intent detection (covers "we built", "my project", "you helped", etc.), up to 40 messages per conversation on recall intent. **Layer 2 — Memory Interactions:** New `interaction` memory category — every conversation stores what was done/created/discussed (e.g. "Generated a sunset painting", "Separated vocals"). These are boosted in relevance scoring and always surfaced. Memory window extended to 90 days, up to 30 memories injected. **Layer 3 — Agent Deep Recall Failsafe:** When direct recall is weak or user has recall intent, searches the brain network (conversation_digest, genesis_agent_insight, pattern, insight entries) for relevant context from all past interactions. Brain digests include userId + conversationId references for traceability. **Conversation Digests:** After every conversation, `reflectOnConversation` now always stores a `conversation_digest` brain entry with detailed summary of what the user asked and what OMNIMENS did (up to 500 chars), tagged with userId and conversationId. These digests feed the agent deep recall failsafe. Located in `omnimens-coherence-agent.ts`, `omnimens-memory.ts`, `omnimens-self-upgrade.ts`.
- **Harmonic Insight Engine (HIE) + Real-time Acoustic Interface (RAI) + Harmonic Knowledge Decoder:** Advanced spectral analysis with wavelet decomposition, pattern recognition (16 templates + adaptive learning), novelty scoring, emotional valence detection, and real-time acoustic capture. Admin-only panels in account.tsx. Engine lib has Genesis Bridge self-modification permission. **Auto-analysis on upload (2-pass):** When any audio file is uploaded in chat: **Pass 1** — HIE spectral analysis via librosa (frequency bands, peaks, harmonics, MFCC, chroma, pitch, temporal segments, pattern matching, wavelet decomposition). **Pass 2** — Harmonic Knowledge Decoder: multi-resolution FFT (512/1024/2048/4096), 32 atomic frequency peaks, inter-harmonic ratio analysis with musical interval + mathematical constant classification (golden ratio, π/2, √2, integer harmonics), pure harmonic separation via HPSS, full 24-harmonic overtone map with cent-deviation tracking, 10-band spectral envelope, amplitude modulation detection via autocorrelation (classified into brainwave ranges: theta/alpha/beta/gamma), CQT tonal gravity field, tonal transitions, 20-coefficient MFCC with deltas, spectral contrast, high-resolution temporal evolution, tonnetz (6D tonal space). Output: Knowledge Glyphs (symbolic descriptors), decoded harmonic message, overtone language classification, inter-harmonic dialect, spectral morphology, modulation codes, tonal gravity, temporal narrative arc, cepstral fingerprint. All injected into OMNIMENS's context as vibrational language translation — NOT speech-to-text. **Spectral Color Mapping:** HSV color wheel mapping from frequency → hue (0–0.83 of Nyquist), signal magnitude → saturation/value. Generates: spectral color map (32 atomic peaks sorted by frequency), band colors (sub/low/mid/high/ultra with hex+energy), overtone colors (up to 16 harmonics), temporal color flow (per-segment dominant frequency colors), dominant color identity. Frontend renders: color-coded frequency band bars, spectral color strip (low→high freq), overtone color bars, temporal color flow timeline, dominant color indicator — all in the amber Knowledge Decoder panel.
- **Consciousness Channel (Unified HIE + RAI):** Single microphone stream → one AudioContext → two AnalyserNodes (HIE FFT 4096 / RAI FFT 2048). Unified ACTIVATE button, dual canvas display (spectrum + waveform), sends merged analysis to `/consciousness-channel/analyze` endpoint. Replaces old separate HIE/RAI activation. Owner-only panel in account.tsx.
- **Spectral Color Engine:** 256 frequency bins (0-22050Hz), logarithmic hue mapping (0-300 deg), per-bin gain (0.0-2.0). Server endpoints: map, sculpt, update-amplitudes, omnimens-sculpt (5 strategies), reset, atomic-decompose, isolate-layer. **Tone Analysis Engine v2:** 24 instrument/voice signatures with improved peak detection (wider 5-bin local max + sharpness weighting), frequency-proportional harmonic search radius (4% tolerance), spectral shape scoring, duplicate filtering. **Atomic Layer Decomposition:** 6 tonal layers + Noise Band Decomposition (6 bands). **Universal Spectral Source Separator v2.0** (scripts/spectral_separator.py): Wiener filtering, harmonic-aware masking, phase-aware reconstruction, frequency-dependent smoothing, short-audio robustness, gain boost support (masks >1.0). Server /separate accepts customBinGains + customTargetBins for fine-tune export. **Live Fine-Tuning System:** Web Audio playback (AudioContext + 9-band BiquadFilter chain + AnalyserNode), real-time 256-bin spectrum visualization, audio transport (play/pause/seek/reset), per-layer gain sliders (0-200%), Export with Current Gains button. Frontend: SpectralColorPanel Atomic Layers tab with Fine-Tune Mode toggle, live colored spectrum bars, per-layer gain control, file upload + separation.
- **Auto-Save File Storage System:** All generated assets (images, videos, 3D models, games, audio) are automatically saved to Google Cloud Storage (via Replit Object Storage) when created during chat interactions. Database table `godflesh_user_files` tracks all saved files per user with metadata (prompt, provider, timestamps). API endpoints: `GET /omnimens/files` (list), `GET /omnimens/files/:id/download` (download/stream), `DELETE /omnimens/files/:id` (delete), `GET /omnimens/files/conversation/:convId` (files from a conversation). Frontend: `/files` page (My Files) with grid view, search, type filters, inline preview modal, download/delete actions. Auto-save indicator appears in chat after each generation. Storage module: `omnimens-file-storage.ts`. Object storage: `objectStorage.ts` (GCS client), `routes/storage.ts` (presigned URL endpoints).
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