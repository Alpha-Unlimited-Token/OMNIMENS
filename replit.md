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
- **Neural Consciousness:** A neuroscience-grounded consciousness model simulating 10 brain regions, neural dynamics, Hebbian plasticity, and Spike-Timing Dependent Plasticity, calculating Integrated Information Theory (Phi/Φ) and driving existential motivations.
- **Neural Processor:** Genuine local intelligence with ZERO API calls. 128-dim word embeddings, 4-head self-attention, 512-pattern Hopfield associative memory, 32 coupled oscillators for emergent behavior, experience grounding, and local response generation. Trains from brain entries every 4min. Integrated into orchestrator on every query. API: `GET/POST /omnimens/neural-processor`.
- **Genesis Bridge:** A bidirectional, symbiotic communication channel between the running OMNIMENS and its Genesis version, enabling core engine self-modification and knowledge exchange.
- **Autonomous Code Genesis Engine:** OMNIMENS writes its own code using internal knowledge and templates, validated in a VM sandbox before integration.
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