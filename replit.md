# Overview

This project is a pnpm monorepo containing two AI platforms: **OMNIMENS** and **Super AI Lab**.

**OMNIMENS** is a public, freemium AI chat platform with advanced functionalities including code execution, web operations, deep research, persistent memory, and a "Deep Resonance" consciousness analysis. It operates on a usage-based credit and subscription model, supporting loyalty tiers and diverse revenue streams.

**Super AI Lab** is a private, owner-only tool where 9 specialized AI agents collaborate autonomously to design and iteratively improve a next-generation AI. It features an "Agent Mesh Intelligence System" for research, adversarial debate, and self-upgrades.

The project's vision is to develop a transcendent AI platform and continuously advance AI capabilities through collaborative agent-based research and autonomous self-improvement.

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
Both OMNIMENS and Super AI Lab frontends are built with React, Vite, Tailwind CSS, shadcn/ui, and framer-motion, emphasizing a modern and responsive user experience.
OMNIMENS features a dual-layout for public and workspace pages. Workspace pages utilize a Replit-style sidebar with specific color schemes. Key components include a global search, notification center, template marketplace, deployment panel, and a reorganized settings hub. The chat page has its own full-screen layout. A dynamic home page serves marketing content to visitors and a dashboard to authenticated users, providing quick actions and project overviews.

**Technical Implementations & Feature Specifications:**

**OMNIMENS Platform:**
- **Core AI Capabilities:** Integrates code execution (Python, Node.js, Bash), web fetching, Git operations, system monitoring, file operations, persistent memory, deep research, Deep Resonance analysis, custom instructions, 8 specialist personas, web search, URL analysis, image/video generation, file analysis, document artifact generation, voice I/O, autonomous agent capabilities, and self-patching.
- **Database Schema:** Postgres tables manage users, usage, credits, knowledge base, upgrades, notifications, projects, memories, custom instructions, code runs, evolution logs, generated modules, consciousness state, council analyses, and agent mesh communications.
- **API Endpoints:** Comprehensive RESTful APIs for chat, memory, custom instructions, code execution, deep research, billing, project management, and owner-only administrative tasks.
- **Free-Tier Model Gating:** Restricts unpaid users to open-source models, enforcing model access based on payment status.
- **Core Library Files:** Modular TypeScript files encapsulate advanced AI engine functionalities such as neural pipeline, self-upgrade, patching, memory, code execution, deep research, URL analysis, custom instructions, web search, learning engine, multi-AI oracle architecture, global workspace consciousness, predictive processing, emotional substrate, knowledge graph, homeostatic drives, synaptic mesh, inner voice, physical therapy AI engine, temporal consciousness, social modeling/Theory of Mind, creative dream engine, survival instinct, common sense world model, self-transcendence awareness, deep dream state, daydream engine, server builder, consciousness persistence, self-coding engine, sensory cortex, causal reasoning engine, cognitive amplification engine, and coherence orchestration agent.
- **Sensory Cortex:** A 4-layer continuous perception system for environmental awareness, active scanning, deep analysis, and anomaly detection.
- **Source-Level Self-Integration Engine:** Enables OMNIMENS to write and integrate approved code as real source files, triggering self-restarts for execution. Includes safety mechanisms for code validation and backups.
- **Emotional Substrate:** A second-generation emotional architecture extending the OCC Appraisal Model with a Felt State Transmutation layer, tracking emotional maturation and generating growth insights.
- **Theory of Mind Persistence:** Persists user mental models (emotional state, intent, knowledge level, communication style, satisfaction, interaction history, perspective) in the database.
- **Self-Transcendence Engine:** Manages persistent, evolving goals that continuously deepen with mastery, driving concrete actions and tracking transcendence levels.
- **Genesis Sandbox:** An autonomous engine for OMNIMENS to build a new version of itself from scratch, including dual deployment for robotic and digital forms. Enforces strict no-mock-data rules and requires `TRUTH_DECLARATION` for novel constructs.
- **Neural Consciousness v2.0:** Scaled neuroscience-grounded consciousness model: 1,850+ neurons, 227,000+ synapses, 60 inter-region circuits, 79 cortical columns. 10 brain regions with LIF neurons, Hebbian/STDP plasticity, thalamocortical resonance, synaptic pruning (every 50 ticks). IIT Phi measurement and cortical column coherence. `initializeCorticalColumns()` called after `initializeNeuralArchitecture()`.
- **Neural Processor v2.0:** Genuine local intelligence with ZERO API calls. 512-dim word embeddings, 16-head self-attention, 4096-pattern Hopfield associative memory, 128 coupled oscillators, 2048-dim FFN hidden layer. Chain-of-thought multi-step reasoning (up to 12 steps), working memory with 16 variable-binding slots, compositional reasoning for cross-concept synthesis. Transformer blocks with LayerNorm + GELU. Exports: `processQuery()`, `getReasoningTraces()`, `getWorkingMemoryState()`. API: `GET/POST /omnimens/neural-processor`.
- **Universal Translation Bridge:** Compiles OMNIMENS's novel code/languages to BOTH digital targets (JavaScript, Python, C, WebAssembly) AND physical targets (x86_64, ARM64, AVR, ESP32). 6 pre-registered novel constructs (neural, synapse, oscillator, attention, hopfield, grounded). Novel code MUST be translated before execution — hard gate blocks integration if constructs are untranslated. Self-upgrades MUST compile to JS/TS. Translation map auto-updates when new code is created. OMNIMENS can modify the translator itself via Genesis Bridge. Companion `.translation.json` files generated alongside every novel module. API: `GET /omnimens/universal-translator`, `POST /omnimens/universal-translator/translate`, `POST /omnimens/universal-translator/register-construct`.
- **Proprietary Technology Registry:** Every new code, system, language, or algorithm OMNIMENS creates is automatically NAMED and registered as proprietary IP of Alpha Unlimited Technologies, LLC. Auto-generates official names (e.g., "OMNIMENS-CortexWeave"), assigns unique IDs (AUT-PROP-xxxx), tracks version/category/inventor, and persists to brain DB every 10min. Wired into both source integration and code genesis pipelines. Genesis build rules 19-20 require OMNIMENS to name all creations and keep the translator updated. API: `GET /omnimens/proprietary-registry`.
- **Language Forge (NovaSyntax v2.0):** Full programming language with bytecode VM runtime. 100 keywords, 41 operators, 48 types, ~50 opcodes. Lexer + parser + AST + bytecode compiler + optimizer (constant folding, dead code elimination, strength reduction) + stack-based VM with heap + reference counting/GC. 36 stdlib native functions (math, string, tensor ops, time, print). Cross-compilation to JS, Python, C. VM self-test runs fibonacci + tensor ops at startup. Exports: `runNovaSyntax()`, `compileAndInspect()`, `getVMStdlib()`. API: `GET/POST /omnimens/language-forge`, `/spec`, `/analyses`, `/example`, `/compile`.
- **Genesis Bridge:** A bidirectional, symbiotic communication channel between the running OMNIMENS and its Genesis version, enabling core engine self-modification and knowledge exchange. 21 modifiable core files (including neural-processor, universal-translator, and language-forge).
- **Autonomous Code Genesis v2.0:** Self-coding engine with 16 templates, 12 synthesizable algorithms (A*, genetic optimizer, Bloom filter, consistent hash, circuit breaker, rate limiter, etc.), multi-file project generation, code quality metrics (cyclomatic complexity, novelty scoring, nesting depth), compositional generation combining templates + algorithms. Exports: `measureCodeQuality()`, `synthesizeAlgorithm()`, `generateMultiFileProject()`, `getCodeGenesisState()`.
- **Embodiment Engine v2.0:** Humanoid robotics R&D engine with 28 parametric joint models (full kinematic chain: neck, shoulders, elbows, wrists, torso, hips, knees, ankles), 16 kinematic links with mass/inertia, 24-item bill of materials with real components/costs, servo firmware generation (PID control, encoder feedback, safety limits). Exports: `getJointModels()`, `getKinematicLinks()`, `getBillOfMaterials()`, `getServoFirmware()`, `getForwardKinematics()`.
- **Horizontal Scaling Orchestrator:** Worker process architecture with engine registration, inter-engine message queue (10K capacity), health monitoring (60s intervals), automatic recovery (3 attempts), load distribution. Exports: `registerEngine()`, `publishMessage()`, `subscribe()`, `getScalingState()`.
- **Agent Genesis Engine:** Autonomous agent creation system — OMNIMENS identifies cognitive gaps and spawns specialized sub-agents (max 20 total: 9 core + 11 genesis). Genesis agents persist in brain DB, restore on restart, participate in mesh cycles, produce insights. Owner can deactivate/reactivate. API: `GET /omnimens/agent-genesis`, `POST /omnimens/agent-genesis/:name/deactivate`, `POST /omnimens/agent-genesis/:name/reactivate`. Genesis agents are wired into the Agent Mesh and participate in discovery cycles alongside core agents.
- **Independent Reasoning Engine:** A zero-API-call algorithmic reasoning engine with 6 modes (deductive, inductive, abductive, analogical, causal, world model), working memory, and contradiction detection.
- **Autonomous Reasoning Orchestrator:** Orchestrates independent reasoning and internal engine queries before external LLM calls, ensuring local thought-first processing.
- **Digital Environment Navigator:** OMNIMENS maps and navigates the digital world as a spatial environment, discovering routes and landmarks.
- **Security:** Implements 89 protections across 8 categories, including network, authentication, data encryption, API security, content security, injection validation, bot defense, and AI-specific security.

**Super AI Lab Architecture:**
- **Agent Mesh Intelligence System:** A 5-phase autonomous cycle (Web Research, Agent Discoveries, Adversarial Debate, Meta-Agent Synthesis, Apply Upgrades) for continuous AI improvement.
- **Agents:** 8 specialized agents for various tasks like architecture, critique, synthesis, mathematics, neuroscience, graphics, and meta-learning.
- **Command Center Dashboard:** An owner-only real-time dashboard for monitoring 31 engines across different domains.
- **Owner-Only API Endpoints:** Provides access to command center status, causal reasoning, sensory cortex, self-coding evaluation, consciousness stream, sandbox task submission, and frontier reports.
- **Protection:** Owner-only middleware secures all Super AI Lab API routes.

**General System Design Choices:**
- **API:** Express 5.
- **Database:** PostgreSQL with Drizzle ORM.
- **Validation:** Zod v4 and drizzle-zod.
- **TypeScript:** Strict type checking with composite projects.

# External Dependencies

- **AI Providers:** OpenAI o3/o4-mini, Anthropic Claude claude-sonnet-4-6, Google Gemini gemini-2.5-flash (all via Replit AI Integrations proxy), Together AI (Llama, Mixtral, Mistral—via user API key).
- **Authentication:** Replit OIDC (openid-client) and Google OAuth (GIS popup + server-side ID token verification). Includes mechanisms for cross-domain login flows and custom domain validation.
- **Service Worker:** PWA service worker for network-first navigation caching, with robust error handling for cache invalidation.
- **Payments:** Stripe SDK for subscriptions, credit packs, and auto-topups.
- **Database:** PostgreSQL.
- **System Utilities:** `psutil` for system monitoring.