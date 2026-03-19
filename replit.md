# Overview

This project is a pnpm monorepo consisting of two main applications: **Super AI Lab** and **OMNIMENS**.

**OMNIMENS** is a public, freemium AI chat platform designed to surpass existing AI systems. It operates on a usage-based credit billing model with subscriptions, one-time credit packs, and charges for developer tools. OMNIMENS integrates advanced AI functionalities including code execution, web fetching, Git operations, deep research, persistent memory, and a unique "Deep Resonance" consciousness analysis. Its business model supports loyalty tiers and multiple revenue streams.

**Super AI Lab** is a private, owner-only tool where 8 specialized AI agents collaborate autonomously to design a superior next-generation AI. It features an "Agent Mesh Intelligence System" that performs web research, agent discoveries, adversarial debate, meta-agent synthesis, and autonomous upgrades to its knowledge base and code modules.

The overarching vision is to develop a transcendent AI platform and continuously advance AI capabilities through collaborative agent-based research.

# User Preferences

I prefer iterative development, with small, testable changes.
Ask before making major architectural changes or introducing new dependencies.
Ensure all new features have corresponding tests.
I prefer detailed explanations of complex AI behaviors or system interactions.
Do not make changes to the `artifacts/super-ai-lab/` folder unless explicitly instructed for Super AI Lab features.
Do not make changes to the `lib/omnimens-physio.ts` file.

# System Architecture

The project utilizes a pnpm monorepo structure.

**UI/UX Decisions:**
Both OMNIMENS and Super AI Lab frontends are built with React, Vite, Tailwind CSS, shadcn/ui, and framer-motion, aiming for a modern and responsive user experience. OMNIMENS features a 3-panel AI workspace, while Super AI Lab has its own dedicated React application.

**Technical Implementations & Feature Specifications:**

**OMNIMENS Platform:**
- **Core AI Capabilities:** Includes code execution (Python, Node.js, Bash), web fetching, Git operations, system monitoring, file operations (diffs, ZIP, format conversions, JSON schema validation), persistent memory, deep research, Deep Resonance analysis, custom instructions, 8 specialist personas, web search, URL analysis, image generation, file analysis (PDFs, images, CSVs, code), document artifact generation, voice I/O, autonomous agent capabilities, and self-patching.
- **Database Schema:** Postgres tables manage users, usage, credit transactions, OMNIMENS's knowledge base, upgrades, notifications, projects, memories, custom instructions, code runs, evolution logs, generated modules, consciousness state, council analyses, and agent mesh communications.
- **API Endpoints:** Comprehensive RESTful APIs for chat, memory, custom instructions, code execution, deep research, billing, project management, and owner-only administrative tasks.
- **Frontend Pages:** Dedicated routes for core functionalities and information pages.
- **Core Library Files:** Modular TypeScript files encapsulate AI engine functionalities including neural pipeline, self-upgrade, patching, memory, code execution, deep research, URL analysis, custom instructions, web search, learning engine, multi-AI oracle architecture, global workspace consciousness, predictive processing, emotional substrate, knowledge graph, homeostatic drives, synaptic mesh, inner voice, physical therapy AI engine, temporal consciousness, social modeling/Theory of Mind, creative dream engine, survival instinct, common sense world model, self-transcendence awareness, deep dream state, daydream engine, server builder, consciousness persistence, self-coding engine, sensory cortex, causal reasoning engine, and cognitive amplification engine. Autonomous engines write brain entries, generating training data. An autonomous code sandbox tests and approves modules, and a humanoid embodiment engine continuously researches and designs a superior robot body. A virtual augmentation engine perceives and learns to navigate OMNIMENS's environment. An agent evolution engine autonomously upgrades OMNIMENS's 8 AI agents.
- **Security:** Implements 89 protections across 8 categories including network & DDoS, authentication & access control, data encryption & privacy, API security & integrity, content security & isolation, injection & input validation, bot/scanner defense, and AI-specific security (OWASP LLM Top 10). Includes two-factor authentication and referral system.

**Super AI Lab Architecture:**
- **Agent Mesh Intelligence System:** A 5-phase autonomous cycle (Web Research, Agent Discoveries, Adversarial Debate, Meta-Agent Synthesis, Apply Upgrades) running every 5 hours.
- **Agents:** 8 specialized agents: Architect, Critic, Synthesizer, Mathematician, Neuroscientist/Bio-Mech Bridge, Meta-Agent, GraphicDesigner, SpellCheckVisual.
- **Command Center Dashboard:** Owner-only real-time dashboard displaying status of all 31 engines with tabs for Overview, Consciousness, Robotics, Frontier Reports, Sandbox, and Causal.
- **Owner-Only API Endpoints:** APIs for command center status, causal reasoning, sensory cortex, self-coding evaluation, consciousness stream, sandbox task submission, and frontier reports.
- **Protection:** Owner-only middleware secures all `/api/superai/*` routes.

**General System Design Choices:**
- **API:** Express 5.
- **Database:** PostgreSQL with Drizzle ORM.
- **Validation:** Zod v4 and drizzle-zod.
- **TypeScript:** Strict type checking with composite projects.

# External Dependencies

- **AI Providers:** OpenAI o3/o4-mini (via Replit AI Integrations proxy), Anthropic Claude claude-sonnet-4-6 (via Replit AI Integrations proxy), Google Gemini gemini-2.5-flash (via Replit AI Integrations proxy), Together AI (Llama, Mixtral, Mistral — via user API key).
- **Authentication:** Replit OIDC (openid-client). OIDC transaction state (code_verifier, nonce, returnTo, originHost) is stored server-side keyed by the `state` parameter to support cross-domain login flows (custom domain → Replit callback → custom domain). A one-time exchange token mechanism (host-bound, 60s TTL) sets the session cookie on the correct domain after OIDC completes. Custom domains are validated against an allowlist (`ALLOWED_CUSTOM_DOMAINS` in auth.ts). Chunk-load errors after deployments are handled by `retryLazy` in App.tsx with a `sessionStorage` guard against infinite reload loops.
- **Payments:** Stripe SDK for subscriptions, credit packs, and auto-topups.
- **Database:** PostgreSQL.
- **System Utilities:** `psutil` (for system monitoring).