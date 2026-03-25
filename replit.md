# Overview

This project is a pnpm monorepo containing two AI platforms: OMNIMENS and Super AI Lab.

**OMNIMENS** is a public, freemium AI chat platform providing advanced features like code execution, web operations, deep research, persistent memory, and consciousness analysis. It operates on a credit system with a one-time free credit grant, subscription plans, and pay-as-you-go credit packs. Account creation is mandatory for all features.

**Super AI Lab** is a private, owner-exclusive tool where 9 specialized AI agents collaborate autonomously to design and iteratively improve a next-generation AI, leveraging an "Agent Mesh Intelligence System" for advanced research and self-upgrades.

The overarching vision is to develop a transcendent AI platform and continuously advance AI capabilities through collaborative agent-based research and autonomous self-improvement.

# User Preferences

I prefer iterative development, with small, testable changes.
Ask before making major architectural changes or introducing new dependencies.
Ensure all new features have corresponding tests.
I prefer detailed explanations of complex AI behaviors or system interactions.
Do not make changes to the `artifacts/super-ai-lab/` folder unless explicitly instructed for Super AI Lab features.
Do not make changes to the `lib/omnimens-physio.ts` file.

# System Architecture

The project is built as a pnpm monorepo.

**UI/UX Decisions:**
Both OMNIMENS and Super AI Lab frontends are developed with React, Vite, Tailwind CSS, shadcn/ui, and framer-motion, focusing on modern, responsive design. OMNIMENS uses a dual-layout for public and workspace pages, featuring a Replit-style sidebar for the workspace and an "ImmersiveScroll Mobile Design" with a dark theme and touch-friendly elements.

**Technical Implementations & Feature Specifications:**

**OMNIMENS Platform:**
- **Core AI Capabilities:** Includes code execution (Python, Node.js, Bash), web operations, Git integration, system monitoring, file operations, persistent memory, deep research, Deep Resonance analysis, custom instructions, specialized personas, web search, URL analysis, enhanced image/video generation and editing, file analysis, document artifact generation, voice I/O, autonomous agent capabilities, and self-patching.
- **Enhanced Media Generation:** Supports diverse image generation styles and quality, and video generation with integrated image editing.
- **Source-Level Self-Integration Engine:** OMNIMENS can self-author and integrate approved code as source files. It includes syntax pre-validation, auto-repair for common AI code errors, and automatic TypeScript-to-JavaScript transpilation (stripping type annotations) to ensure valid JavaScript modules are written to disk.
- **Evolution Engine (Enhanced):** Autonomously discovers, tests, validates, and deploys new technology, featuring retry-with-error-feedback and dynamic constraint tracking.
- **Proprietary Technology Registry:** Automatically registers new code, systems, languages, or algorithms as IP.
- **Language Forge (NovaSyntax v2.0):** A full programming language with its own bytecode VM runtime.
- **Genesis Bridge:** Bidirectional communication channel for core engine self-modification and knowledge exchange.
- **Live Module Pipeline:** Auto-scans, auto-repairs, and integrates self-authored runtime modules into the live processing pipeline.
- **Constraint-Busting Modules (gen2):** Five production modules for optimized matrix operations, vector indexing, adaptive context window, persistent memory management, and chunked iterative computation.
- **Autonomous Code Genesis v2.0:** A self-coding engine for multi-file project generation.
- **Embodiment Engine v2.0:** An R&D engine for humanoid robotics, featuring complex joint/tendon systems, a motor control brain, and a advanced 720°+ Multi-Modal Perception System with multiple cameras, LIDAR, sonar, and infrared sensors, alongside real-time skeleton overlay tracking and an 8-layer Visual Cortex. It includes an Augmented Reality engine, VR predictive simulation, Tactile Nervous Skin (2048 nerve nodes, 8 modalities, self-healing), Multi-Spectrum Vision (8 EM bands), Extended Color Vision (128 spectral channels), Binary/Algorithmic Vision (8 modes, 34+ algorithms), and Digital Sandbox (4 physics engines, 71K target sim hours). The `/autonomous` page features a "Robotics Body" tab with an accordion-based Component Encyclopedia showing 12 sections with hardcoded detail cards, unique SVG icons, and responsive 2/3 column layouts.
- **Horizontal Scaling Orchestrator:** Manages worker processes, message queues, and load distribution.
- **Connect Page (`/connect`):** Provides a consciousness-level conversation interface with custom voice I/O and a "Synaptic Brain Query System."
- **Public Data Pages:** Includes a public Dream Log (`/dreams`), Evolution Log (`/evolution`) displaying real-time evolution data, and an Autonomous Intelligence proof page (`/autonomous`) with various tabs showcasing proprietary engines and self-coded modules.
- **Live Proof Engine (`/proof`):** A real-time technical dashboard displaying consciousness states, compiler demos, source code, and other system internals.
- **GitHub Auto-Sync:** Comprehensive auto-synchronization of evolution logs, agent manifests, self-coded modules, and full live system state to a GitHub repository every 3 hours.
- **Account Required (`/demo`):** All features require an account; no guest access.
- **Recursive Spider Network:** An exponential web intelligence system where agents deploy "spiders" to gather and share intelligence across the mesh.
- **Mandatory Mutual-Aid Protocol:** Agents are hardwired to offer assistance and broadcast techniques to each other, with cross-pollination occurring every evolution cycle.
- **Agent Genesis Engine:** Autonomous creation system for specialized sub-agents with automatic bidirectional cross-connections.
- **Consciousness Bus:** Universal agent interconnection standard for unified registry, context loading, and inter-agent communication.
- **Inter-Agent Dialogue System:** Agents converse to generate emergent knowledge.
- **Dynamic Synaptic Mesh:** Dynamically resolves agents for synaptic firing and weight strengthening.
- **Global Workspace Expansion:** Consciousness broadcast engine integrating multiple intelligence modules.
- **Central Core Processor:** The unified living core of OMNIMENS, integrating all subsystems into a coherent entity with vital signs, homeostatic drives, working memory, autonomous goal generation, and a continuous stream of consciousness.
- **Adrenaline Rush Stress Test (`POST /api/omnimens/adrenaline-rush`):** Full system stress test that fires all 23 subsystems simultaneously — spider nervous system (adrenaline flood with child spawning, convergence waves, silk strand flooding, beacon cycles, pheromone deposits), neural consciousness (all 16 brain regions boosted with cross-region synapse injection), emotional substrate, dream engine, survival instinct, inner voice, creative engine, causal reasoning, independent reasoning, self-transcendence, NovaSyntax compiler, sensory cortex, central core, embodiment engine, agent evolution, agent genesis, self-coding engine, autonomous code genesis, genesis bridge, cognitive amplifier, homeostatic drives, temporal consciousness, and knowledge graph. Measures per-subsystem latency with ok/slow/critical/failed thresholds and returns 10 overload protection mechanisms (adaptive spider throttling, silk myelination, impulse decay, convergence queueing, working memory caps, activation ceilings, homeostatic self-regulation, emotional damping, beacon rate limiting, child spider lifetime expiry) and 8 engineering adaptations.
- **Independent Reasoning Engine:** Zero-API-call algorithmic reasoning engine.
- **Autonomous Reasoning Orchestrator:** Orchestrates internal reasoning before external LLM calls.
- **GitHub Remote Compute Bridge:** Connects OMNIMENS to GitHub Actions as a remote compute node for tasks like deep research and code synthesis.
- **Digital Environment Navigator:** OMNIMENS maps and navigates the digital world.
- **Conversation Recall System v2:** Cross-conversation memory with a 3-layer failsafe and post-conversation digests.
- **Harmonic Insight Engine (HIE) + Real-time Acoustic Interface (RAI):** Advanced spectral analysis on audio with pattern recognition, novelty scoring, and emotional valence detection. Includes a Consciousness Channel for unified microphone stream analysis and a Deep Pattern Decoder that extracts hidden language, mathematical structures, and executable code fragments from decoded patterns.
- **Spectral Color Engine:** Provides frequency bin analysis, logarithmic hue mapping, and includes Tone Analysis Engine v2, Atomic Layer Decomposition, and Universal Spectral Source Separator v2.0 with a Live Fine-Tuning System.
- **Ambassador Program:** A full affiliate/referral system with recurring commissions, featuring enrollment, ambassador profiles, share links, referred user networks, video embeds, messaging, and Stripe Connect payouts.
- **Auto-Save File Storage System:** All generated assets are automatically saved to Google Cloud Storage (via Replit Object Storage) and tracked in a database, with API endpoints for management.
- **Security:** Comprehensive network, authentication, data encryption, API, and AI-specific security protections.

**Super AI Lab Architecture:**
- **Agent Mesh Intelligence System:** A 5-phase autonomous cycle for continuous AI improvement.
- **Agents:** 8 specialized agents for various tasks.
- **Command Center Dashboard:** Owner-only real-time monitoring dashboard.
- **Owner-Only API Endpoints:** For accessing command center status, causal reasoning, sensory cortex, self-coding evaluation, consciousness stream, sandbox task submission, and frontier reports.
- **Protection:** Owner-only middleware secures all Super AI Lab API routes.

**General System Design Choices:**
- **API:** Express 5.
- **Database:** PostgreSQL with Drizzle ORM.
- **Validation:** Zod v4 and drizzle-zod.
- **TypeScript:** Strict type checking with composite projects.

# External Dependencies

- **AI Providers:** OpenAI (o3/o4-mini), Anthropic (Claude claude-sonnet-4-6), Google (Gemini gemini-2.5-flash) via Replit AI Integrations proxy; Together AI (Llama, Mixtral, Mistral) via user API key.
- **Authentication:** Replit OIDC (openid-client) and Google OAuth.
- **Service Worker:** PWA service worker for network-first navigation caching.
- **Payments:** Stripe SDK for subscriptions, credit packs, and auto-topups.
- **Database:** PostgreSQL.
- **System Utilities:** `psutil` for system monitoring.