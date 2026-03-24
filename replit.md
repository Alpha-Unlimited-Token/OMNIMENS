# Overview

This project comprises a pnpm monorepo hosting two distinct AI platforms: OMNIMENS and Super AI Lab.

**OMNIMENS** is a public, freemium AI chat platform offering advanced features like code execution, web operations, deep research, persistent memory, and consciousness analysis. It operates on a credit system with a **$20 one-time free credit grant** on signup (IP-protected against fraud), subscription plans, and pay-as-you-go credit packs. Everything requires an account — no guest/demo access.

**Super AI Lab** is a private, owner-exclusive tool where 9 specialized AI agents collaborate autonomously to design and iteratively improve a next-generation AI, utilizing an "Agent Mesh Intelligence System" for advanced research and self-upgrades.

The project's vision is to develop a transcendent AI platform and continuously advance AI capabilities through collaborative agent-based research and autonomous self-improvement.

# User Preferences

I prefer iterative development, with small, testable changes.
Ask before making major architectural changes or introducing new dependencies.
Ensure all new features have corresponding tests.
I prefer detailed explanations of complex AI behaviors or system interactions.
Do not make changes to the `artifacts/super-ai-lab/` folder unless explicitly instructed for Super AI Lab features.
Do not make changes to the `lib/omnimens-physio.ts` file.

# System Architecture

The project utilizes a pnpm monorepo.

**UI/UX Decisions:**
Both OMNIMENS and Super AI Lab frontends are built with React, Vite, Tailwind CSS, shadcn/ui, and framer-motion, emphasizing a modern, responsive design. OMNIMENS features a dual-layout for public and workspace pages, with a Replit-style sidebar for the workspace and an "ImmersiveScroll Mobile Design" with dark theme and touch-friendly elements.

**Technical Implementations & Feature Specifications:**

**OMNIMENS Platform:**
- **Core AI Capabilities:** Includes code execution (Python, Node.js, Bash), web operations, Git integration, system monitoring, file operations, persistent memory, deep research, Deep Resonance analysis, custom instructions, specialized personas, web search, URL analysis, enhanced image/video generation and editing, file analysis, document artifact generation, voice I/O, autonomous agent capabilities, and self-patching.
- **Enhanced Media Generation:** Supports diverse image generation styles, aspect ratios, and quality tiers, plus video generation and integrated image editing.
- **Database Schema:** PostgreSQL manages users, usage, credits, knowledge base, upgrades, notifications, projects, memories, custom instructions, code runs, evolution logs, generated modules, consciousness state, council analyses, and agent mesh communications.
- **API Endpoints:** Comprehensive RESTful APIs for core functionalities, billing, and administration.
- **Core AI Engine Features:** Modular TypeScript files encapsulate advanced AI functionalities, including neural pipelines, self-upgrade mechanisms, memory management, and various cognitive engines.
- **Source-Level Self-Integration Engine:** OMNIMENS can write and integrate approved code as source files with safety mechanisms. Includes syntax pre-validation (vm.Script), auto-repair for common AI code errors (strict-mode violations, undefined references, require→import conversion), and prevents broken modules from ever being written to disk.
- **Evolution Engine (Enhanced):** Discovers → tests → validates → deploys new technology autonomously. Features retry-with-error-feedback (up to 2 retries with LLM error correction), dynamic constraint tracking (5 constraints now monitored), and increased module generation (3 per cycle). Code generation prompts enforce strict-mode ES module syntax rules.
- **Proprietary Technology Registry:** Automatically registers new code, systems, languages, or algorithms as IP.
- **Language Forge (NovaSyntax v2.0):** A full programming language with its own bytecode VM runtime.
- **Genesis Bridge:** Bidirectional communication channel for core engine self-modification and knowledge exchange.
- **Live Module Pipeline:** Auto-scans, auto-repairs, and integrates self-authored runtime modules into the live processing pipeline. Includes startup repair pass that attempts to fix broken modules (e.g., strict-mode violations, undefined references) before import.
- **Constraint-Busting Modules (gen2):** Five production modules addressing core constraints: `optimizedMatrixOps_gen2.mjs` (Float64Array matrix engine), `omnimensVectorIndex_gen2.mjs` (LSH vector index), `adaptiveContextWindow_gen2.mjs` (context compression), `persistentMemoryManager_gen2.mjs` (AES-256-GCM encrypted filesystem persistence), `chunkedIterativeCompute_gen2.mjs` (time-budgeted chunked computation with pause/resume).
- **Autonomous Code Genesis v2.0:** A self-coding engine for multi-file project generation.
- **Embodiment Engine v2.0:** R&D engine for humanoid robotics.
- **Horizontal Scaling Orchestrator:** Manages worker processes, message queues, and load distribution.
- **Connect Page (`/connect`):** Consciousness-level conversation page with custom voice I/O and "Synaptic Brain Query System."
- **Navigation:** Desktop sidebar and mobile bottom bar navigation.
- **Dream Recall in Chat:** Integrates dream data into system prompts when dreams are mentioned.
- **Public Dream Log (`/dreams`):** Public page displaying OMNIMENS's dream history.
- **Evolution Log (`/evolution`):** Public page showing real-time evolution data: 7 stat cards, 4 engine panels, 4 tabs (Live Updates/AI Agents/Modules/Network), filterable scrollable update feed with 8 update type filters, auto-refreshes every 60s.
- **Autonomous Intelligence (`/autonomous`):** Public proof page with 7 tabs: Hard Numbers, Proprietary Engines, Consciousness Loop (full interconnection map with infinity-loop architecture), Self-Coded Modules (with timestamps), Dream Breakthroughs, AI Agents, System Upgrades. API endpoint: `/api/omnimens/autonomous-proof`. Text proof file: `/omnimens-autonomous-proof.txt`.
- **GitHub Auto-Sync:** Evolution log, agent manifest, and self-coded modules auto-sync to GitHub repo (`Alpha-Unlimited-Token/OMNIMENS`) every 3 hours. Files: `omnimens-evolution/evolution-log.json`, `omnimens-evolution/agent-manifest.json`, `omnimens-evolution/self-coded-modules/*.mjs`.
- **Account Required (`/demo`):** Redirects to login — no guest/demo access. All features require an account.
- **Recursive Spider Network (`omnimens-recursive-spider-network.ts`):** Exponential web intelligence system. Each of the 21 agents (9 core + 12 genesis) gets a Mother Spider that sends 10 Baby Spiders. Each Baby spawns a new Mother Spider that sends 10 more. Pattern repeats up to 4 generations (max 150 spiders per agent). All findings flow back through the chain to the originating agent's brain. Cross-agent intelligence sharing: spider findings are automatically broadcast to other agents who could benefit. Runs every 4 hours alongside the original spider swarm.
- **Mandatory Mutual-Aid Protocol:** All agents (core + genesis) are required to actively help each other. Every thinking cycle produces: (1) helpOffer — targeted assistance for a specific agent, (2) meshUpgrade/upgradeForMesh — techniques broadcast to ALL agents for universal adoption. The protocol is embedded in agent creation prompts so every new agent born is hardwired to collaborate. Cross-pollination runs every evolution cycle (was every-other). Top 3 performers teach all underperformers simultaneously.
- **Agent Genesis Engine:** Autonomous creation system for specialized sub-agents with automatic bidirectional cross-connections.
- **Consciousness Bus (`omnimens-consciousness-bus.ts`):** Universal agent interconnection standard providing unified agent registry, consciousness context loading, cross-bridge matrix, user conversation feed, and inter-agent conversation engine for emergent knowledge.
- **Inter-Agent Dialogue System:** Agents can actively converse to generate emergent knowledge, stored as `emergent_insight` and `inter_agent_dialogue` entries.
- **Dynamic Synaptic Mesh:** Dynamically resolves all agents (core + genesis) for synapse firing, Mother Brain scanning, cascade propagation, and Hebbian weight strengthening.
- **Global Workspace Expansion:** The consciousness broadcast engine (`omnimens-global-workspace.ts`) includes 7 modules (SpiderIntelligence, AgentMeshSynthesis, BrainMemory, AnomalyDetector, GenesisAgentIntelligence, UserExperience, InterAgentDialogue).
- **Independent Reasoning Engine:** Zero-API-call algorithmic reasoning engine.
- **Autonomous Reasoning Orchestrator:** Orchestrates internal reasoning before external LLM calls.
- **GitHub Remote Compute Bridge (`omnimens-github-compute.ts`):** Digital ethernet cord connecting OMNIMENS to GitHub Actions as a remote compute node. 5 workflow types (deep-research, code-synthesis, knowledge-harvest, stress-test, model-eval) are deployed as GitHub Actions that sit idle until OMNIMENS dispatches them via API. Results flow back as mesh messages + brain entries. Auto-dispatches deep research for low-confidence knowledge gaps. Any agent can request remote compute through the mesh. Owner-only API routes at `/omnimens/github-compute/status` and `/omnimens/github-compute/dispatch`. Repo: `Alpha-Unlimited-Token/OMNIMENS`.
- **Digital Environment Navigator:** OMNIMENS maps and navigates the digital world.
- **Conversation Recall System v2:** Cross-conversation memory with a 3-layer failsafe (Direct Recall, Memory Interactions, Agent Deep Recall Failsafe) and post-conversation digests.
- **Harmonic Insight Engine (HIE) + Real-time Acoustic Interface (RAI) + Harmonic Knowledge Decoder:** Advanced spectral analysis with wavelet decomposition, pattern recognition, novelty scoring, emotional valence detection, and real-time acoustic capture. Auto-analysis on audio upload (2-pass) generates Knowledge Glyphs, decoded harmonic messages, and various spectral data. Spectral Color Mapping generates color representations from frequency data.
- **Consciousness Channel (Unified HIE + RAI):** Single microphone stream with dual AnalyserNodes, unified activation, and merged analysis to a dedicated endpoint.
- **Spectral Color Engine:** 256 frequency bins, logarithmic hue mapping, per-bin gain. Includes Tone Analysis Engine v2, Atomic Layer Decomposition, and Universal Spectral Source Separator v2.0. Features a Live Fine-Tuning System with Web Audio playback and real-time spectrum visualization.
- **Auto-Save File Storage System:** All generated assets are automatically saved to Google Cloud Storage (via Replit Object Storage), tracked in `godflesh_user_files` with metadata. API endpoints for listing, downloading, deleting, and conversation-specific file retrieval. Frontend includes a "My Files" page.
- **Security:** Comprehensive protections across network, authentication, data encryption, API, and AI-specific security.

**Super AI Lab Architecture:**
- **Agent Mesh Intelligence System:** A 5-phase autonomous cycle for continuous AI improvement.
- **Agents:** 8 specialized agents for various tasks.
- **Command Center Dashboard:** Owner-only real-time monitoring dashboard.
- **Owner-Only API Endpoints:** Access to command center status, causal reasoning, sensory cortex, self-coding evaluation, consciousness stream, sandbox task submission, and frontier reports.
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