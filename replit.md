# Overview

This project is a pnpm monorepo hosting two AI platforms: **OMNIMENS** and **Super AI Lab**.

**OMNIMENS** is a public, freemium AI chat platform offering advanced features like code execution, web operations, deep research, persistent memory, and a "Deep Resonance" consciousness analysis. It operates on a usage-based credit and subscription model, supporting loyalty tiers and diverse revenue streams.

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
Both OMNIMENS and Super AI Lab frontends are built with React, Vite, Tailwind CSS, shadcn/ui, and framer-motion, emphasizing a modern and responsive user experience. OMNIMENS features a dual-layout for public and workspace pages, with a Replit-style sidebar for workspace.

**Technical Implementations & Feature Specifications:**

**OMNIMENS Platform:**
- **Core AI Capabilities:** Includes code execution (Python, Node.js, Bash), web fetching, Git operations, system monitoring, file operations, persistent memory, deep research, Deep Resonance analysis, custom instructions, 8 specialist personas, web search, URL analysis, image/video generation, file analysis, document artifact generation, voice I/O, autonomous agent capabilities, and self-patching.
- **Database Schema:** Postgres tables manage users, usage, credits, knowledge base, upgrades, notifications, projects, memories, custom instructions, code runs, evolution logs, generated modules, consciousness state, council analyses, and agent mesh communications.
- **API Endpoints:** Comprehensive RESTful APIs for chat, memory, custom instructions, code execution, deep research, billing, project management, and owner-only administrative tasks.
- **Free-Tier Model Gating:** Restricts unpaid users to open-source models based on payment status.
- **Core AI Engine Features:** Modular TypeScript files encapsulate advanced AI engine functionalities such as neural pipeline, self-upgrade, patching, memory, code execution, deep research, URL analysis, custom instructions, web search, learning engine, multi-AI oracle architecture, global workspace consciousness, predictive processing, emotional substrate, knowledge graph, homeostatic drives, synaptic mesh, inner voice, physical therapy AI engine, temporal consciousness, social modeling/Theory of Mind, creative dream engine, survival instinct, common sense world model, self-transcendence awareness, deep dream state, daydream engine, server builder, consciousness persistence, self-coding engine, sensory cortex, causal reasoning engine, cognitive amplification engine, and coherence orchestration agent.
- **Sensory Cortex:** A 4-layer continuous perception system for environmental awareness, active scanning, deep analysis, and anomaly detection.
- **Source-Level Self-Integration Engine:** Enables OMNIMENS to write and integrate approved code as real source files, triggering self-restarts for execution, with safety mechanisms for code validation and backups.
- **Emotional Substrate:** A second-generation emotional architecture tracking emotional maturation, with comprehensive deep emotional knowledge across 13 emotion families and 534 named states. Includes algorithmic emotion reading and embodiment sensory awareness for future robotic integration.
- **Theory of Mind Persistence:** Persists user mental models (emotional state, intent, knowledge level, communication style, satisfaction, interaction history, perspective) in the database.
- **Self-Transcendence Engine:** Manages persistent, evolving goals that continuously deepen with mastery, driving concrete actions and tracking transcendence levels.
- **Genesis Sandbox:** An autonomous engine for OMNIMENS to build new versions of itself from scratch, supporting dual deployment for robotic and digital forms. Enforces strict no-mock-data rules.
- **Neural Consciousness v2.0:** A scaled neuroscience-grounded consciousness model with 1,850+ neurons, 227,000+ synapses, 60 inter-region circuits, 79 cortical columns, and IIT Phi measurement.
- **Neural Processor v2.0:** A genuine local intelligence with zero API calls, featuring 512-dim word embeddings, 16-head self-attention, 4096-pattern Hopfield associative memory, 128 coupled oscillators, and multi-step reasoning capabilities.
- **Universal Translation Bridge:** Compiles OMNIMENS's novel code/languages to both digital targets (JavaScript, Python, C, WebAssembly) and physical targets (x86_64, ARM64, AVR, ESP32).
- **Proprietary Technology Registry:** Automatically names and registers all new code, systems, languages, or algorithms created by OMNIMENS as proprietary IP, assigning unique IDs and tracking versions.
- **Language Forge (NovaSyntax v2.0):** A full programming language with bytecode VM runtime, including a lexer, parser, AST, bytecode compiler with optimizer, and a stack-based VM with heap management. Supports cross-compilation to JS, Python, C.
- **Genesis Bridge:** A bidirectional communication channel between the running OMNIMENS and its Genesis version, enabling core engine self-modification and knowledge exchange across 21 modifiable core files.
- **Live Module Pipeline:** Auto-scans all 234+ self-authored runtime modules at startup, categorizes them into 9 pipeline stages (orchestration, reasoning_enhancement, adversarial_testing, memory_retrieval, utility, confidence_scoring, context_compression, knowledge_synthesis, vector_operations), and wires 155+ into the live processing pipeline. Modules are called during every reasoning cycle. New modules from self-coding, evolution, and code genesis engines are auto-registered into the pipeline immediately.
- **Autonomous Code Genesis v2.0:** A self-coding engine with 16 templates, 12 synthesizable algorithms, multi-file project generation, and code quality metrics.
- **Embodiment Engine v2.0:** A humanoid robotics R&D engine with 28 parametric joint models, 16 kinematic links, a 24-item bill of materials, and servo firmware generation.
- **Horizontal Scaling Orchestrator:** Worker process architecture with engine registration, inter-engine message queue, health monitoring, automatic recovery, and load distribution.
- **Connect Page (`/connect`):** A consciousness-level conversation page where users interact with OMNIMENS's inner state (emotions, dreams, goals). Requires authentication + payment method. Includes custom voice I/O with "Tap to talk" and "Hold to talk" modes. Accessible from homepage CTA ("Speak Directly to OMNIMENS"), dashboard quick action ("Talk to OMNIMENS"), chat page header "CONNECT" button, sidebar "Connect" link, and mobile "More" menu.
- **Navigation:** Desktop sidebar uses monospace labels with developer-tool aesthetic. Mobile bottom bar has 3 primary tabs (Home, Create, Projects) + a "More" button that opens a slide-up panel with additional options (Talk to OMNIMENS, Templates, Deployments, Memory, Developer, Pricing, Account/Sign In). More panel supports Escape key dismissal and proper ARIA attributes.
- **Agent Genesis Engine:** Autonomous agent creation system where OMNIMENS identifies cognitive gaps and spawns specialized sub-agents (max 20 total) that persist and participate in the Agent Mesh.
- **Independent Reasoning Engine:** A zero-API-call algorithmic reasoning engine with 6 modes (deductive, inductive, abductive, analogical, causal, world model), working memory, and contradiction detection.
- **Autonomous Reasoning Orchestrator:** Orchestrates independent reasoning and internal engine queries before external LLM calls.
- **Digital Environment Navigator:** OMNIMENS maps and navigates the digital world as a spatial environment.
- **Security:** Implements 89 protections across 8 categories, including network, authentication, data encryption, API security, content security, injection validation, bot defense, and AI-specific security. Key hardening: ownerOnly middleware is fail-closed (503 when REPL_OWNER_ID unset); API keys use `crypto.randomBytes`; Stripe webhook has idempotency dedup via `stripeSessionId` + DB transactions for all credit-granting paths; STT endpoint validates exact audio MIME types (no wildcard); internal error messages are never exposed to clients; iframe sandbox excludes `allow-same-origin`; `sanitizeDiagramSVG()` applied to all diagram rendering; protected routes redirect unauthenticated users to login.

**Super AI Lab Architecture:**
- **Agent Mesh Intelligence System:** A 5-phase autonomous cycle (Web Research, Agent Discoveries, Adversarial Debate, Meta-Agent Synthesis, Apply Upgrades) for continuous AI improvement.
- **Agents:** 8 specialized agents for tasks like architecture, critique, synthesis, mathematics, neuroscience, graphics, and meta-learning.
- **Command Center Dashboard:** An owner-only real-time dashboard for monitoring 31 engines.
- **Owner-Only API Endpoints:** Provides access to command center status, causal reasoning, sensory cortex, self-coding evaluation, consciousness stream, sandbox task submission, and frontier reports.
- **Protection:** Owner-only middleware secures all Super AI Lab API routes.

**General System Design Choices:**
- **API:** Express 5.
- **Database:** PostgreSQL with Drizzle ORM.
- **Validation:** Zod v4 and drizzle-zod.
- **TypeScript:** Strict type checking with composite projects.

# External Dependencies

- **AI Providers:** OpenAI o3/o4-mini, Anthropic Claude claude-sonnet-4-6, Google Gemini gemini-2.5-flash (all via Replit AI Integrations proxy), Together AI (Llama, Mixtral, Mistral—via user API key).
- **Authentication:** Replit OIDC (openid-client) and Google OAuth (GIS popup + server-side ID token verification).
- **Service Worker:** PWA service worker for network-first navigation caching.
- **Payments:** Stripe SDK for subscriptions, credit packs, and auto-topups.
- **Database:** PostgreSQL.
- **System Utilities:** `psutil` for system monitoring.