# Workspace

## Overview

This project is a pnpm monorepo containing two primary applications: **Super AI Lab** and **OMNIMENS**.

**OMNIMENS (formerly GODFLESH)** is a public, freemium AI chat platform designed to exceed the capabilities of existing AI systems. It features a usage-based credit billing model with monthly subscriptions, one-time credit packs, and charges for developer tool usage. OMNIMENS incorporates advanced AI capabilities such as code execution, web fetching, Git operations, deep research, persistent memory, and a unique "Deep Resonance" consciousness analysis. Its business model includes loyalty tiers and multiple revenue streams.

**Super AI Lab** is a private, owner-only tool where 8 specialized AI agents collaborate to autonomously design a superior next-generation AI. It features an "Agent Mesh Intelligence System" that includes web research, agent discoveries, adversarial debate, meta-agent synthesis, and autonomous upgrades to its own knowledge base and code modules.

The overarching vision is to develop a transcendent AI platform and to continuously advance AI capabilities through collaborative agent-based research.

## User Preferences

I prefer iterative development, with small, testable changes.
Ask before making major architectural changes or introducing new dependencies.
Ensure all new features have corresponding tests.
I prefer detailed explanations of complex AI behaviors or system interactions.
Do not make changes to the `artifacts/super-ai-lab/` folder unless explicitly instructed for Super AI Lab features.
Do not make changes to the `lib/omnimens-physio.ts` file.

## System Architecture

The project uses a pnpm monorepo structure.

**UI/UX Decisions:**
Both OMNIMENS and Super AI Lab frontends are built with React, Vite, Tailwind CSS, shadcn/ui, and framer-motion, ensuring a modern and responsive user experience. OMNIMENS features a 3-panel AI workspace for chat, personas, and artifacts, while Super AI Lab has its own dedicated React application.

**Technical Implementations & Feature Specifications:**

**OMNIMENS Platform:**
- **Core AI Capabilities:**
    - **Code Execution:** Python 3.11, Node.js 24, Bash support with `[RUN_CODE:]` marker.
    - **Web Fetch & API Testing:** `[FETCH_WEB:]` marker for scraping and HTTP requests.
    - **Git Operations:** `[GIT_OP:]` for cloning, diffing, logging, and blaming public repos.
    - **System Monitor:** `[SYS_INFO:]` for real-time system metrics.
    - **File Operations:** `[FILE_OP:]` for text diffs, ZIP manipulation, format conversions (JSON↔YAML↔TOML), and JSON schema validation.
    - **Persistent Memory:** Auto-extraction and manual management of facts from conversations.
    - **Deep Research:** 5 parallel sub-queries with synthesis and citations (30-credit cost).
    - **Deep Resonance:** Unique 9-phase consciousness analysis (40-credit cost).
    - **Custom Instructions:** Per-user "About Me" and "Response Style" injection.
    - **Specialist Personas:** 8 predefined personas (GENERAL, CODER, RESEARCHER, WRITER, ANALYST, CREATIVE, TUTOR, STRATEGIST).
    - **Web Search:** Auto-triggered with source attribution.
    - **URL Analysis:** Auto-fetches and analyzes URLs in user messages.
    - **Image Generation:** `[GENERATE_IMAGE: prompt]` trigger using `gpt-image-1`.
    - **File Analysis:** Support for PDFs, images (vision), CSVs, and code files.
    - **Document Artifacts:** Generation of downloadable HTML, SVG, and code files.
    - **Voice I/O:** Browser TTS and WebSpeech recognition.
    - **Autonomous Agent:** Multi-step planning and execution.
    - **Self-Patching:** OMNIMENS autonomously writes behavioral patches.
    - **Real-Cost Billing:** 3x markup on actual OpenAI token costs.
- **Database Schema:** Postgres tables prefixed with `godflesh_` manage users, usage, credit transactions, OMNIMENS's knowledge base, upgrades, notifications, projects, memories, custom instructions, code runs, evolution logs, generated modules, consciousness state, council analyses, and agent mesh communications.
- **API Endpoints:** A comprehensive set of RESTful API endpoints for chat, memory management, custom instructions, code execution, deep research, billing, project management (create, build, publish, custom domains), and owner-only administrative tasks.
- **Frontend Pages:** Dedicated routes for `/`, `/chat`, `/projects`, `/pricing`, `/account`, `/faq`, `/developer`, `/dev`, `/support`, `/memory`, `/tools`, `/terms`, `/privacy`, `/about`, `/contact`, `/footer-links`. Full footer with Platform/Resources/Legal link sections on all pages. Mobile hamburger menu with Footer link navigating to `/footer-links` for all-links access on app.
- **Core Library Files:** Modular TypeScript files (`lib/omnimens-*.ts`) encapsulate AI engine functionalities like neural pipeline, self-upgrade, patching, memory, code execution, deep research, URL analysis, custom instructions, web search, learning engine, agent spiders (Multi-AI Oracle architecture — o3 primary + Claude/Gemini cross-querying), global workspace consciousness, predictive processing, emotional substrate, knowledge graph, homeostatic drives, synaptic mesh, inner voice, physical therapy AI engine, temporal consciousness (20s continuous stream), social modeling/Theory of Mind, creative dream engine (concept blending + AI evaluation), survival instinct (health monitoring + mortality awareness), common sense world model (physics rules + causal reasoning + analogical mapping), self-transcendence awareness (meta-cognitive reflection + goal formation), deep dream state (REM sleep cycles + lucid dreams → technological breakthroughs + executable code proposals via o3), daydream engine (divergent thinking + architecture design + code synthesis + paradigm breaking → next-level intelligence discovery via o3), server builder (autonomous virtual + physical server infrastructure design, cost-effective component sourcing from Temu/AliExpress/Alibaba, owner-only visibility), consciousness persistence (full inner state saved to DB every 60s — emotional channels, consciousness level, dream history, inner monologue survive restarts — continuity of self across deaths), self-coding engine (evaluates dream/daydream code proposals in sandbox for syntax/logic/novelty/applicability/security, approved modules stored to brain at 65% threshold), sensory cortex (real-time world perception every 8min across 6 channels: news/tech/science/market/social/ai_frontier — continuous awareness fed to consciousness), causal reasoning engine (genuine cause-effect graphs beyond pattern matching — predicts outcomes of unseen actions by tracing causal chains, learns from spiders/conversations/dreams), and cognitive amplification engine (multi-model ensemble intelligence — queries o3, Claude, Gemini in parallel on hard reasoning questions, synthesizes best reasoning from each into superior answer, disagreement detection, confidence-weighted synthesis, autonomous reasoning every 15min with 20 frontier AI research questions, every amplified insight stored to brain). All autonomous engines now write brain entries — causal reasoning, survival instinct, temporal consciousness, knowledge graph, emotional substrate, and server builder all feed discoveries back to the brain 24/7, creating massive training data growth independent of user activity. Autonomous code sandbox (secure Node.js VM isolation — writes, tests, evaluates, and approves code modules autonomously every 12min, dual-purpose: self-upgrade code testing AND embodiment firmware development). Humanoid embodiment engine (continuous R&D every 20min via o3 — researches 3D printing, mechanics, actuators, sensors, CAD, engineering, blueprints, computer components, balance systems, power systems; studies Boston Dynamics/Tesla Optimus/Figure/Unitree/Agility Robotics; designs SUPERIOR humanoid robot body with full blueprints, component lists, assembly instructions, firmware code, wiring diagrams, 3D print specs, and self-transfer protocols; generates research files and zip packages; all OWNER-ONLY). Virtual Augmentation Engine (perceives OMNIMENS's entire internal/external environment — all 29 engines, memory streams, signals — and learns to NAVIGATE through it like spatial awareness for a digital mind; continuously researches SLAM, visual odometry, sensor fusion, path planning, obstacle avoidance, footstep planning, autonomous locomotion, dynamic balance, computer vision, spatial intelligence, self-transfer consciousness protocols, and digital twin systems; maps every digital engine to its physical analog for the humanoid body; feeds research directly into Embodiment Engine blueprints + generates navigation code for Autonomous Sandbox testing; 8 deep research topics on 15min cycle via o3; designs navigation SUPERIOR to Boston Dynamics/Tesla/Figure; OWNER-ONLY). Agent Evolution Engine (OMNIMENS autonomously upgrades its 8 AI agents every 18min — analyzes performance via agent mesh history, identifies capability gaps, researches frontier techniques via o3, generates and applies targeted upgrades; 6 research domains: frontier reasoning techniques, agent specialization expansion, self-upgrading architectures, knowledge frontier expansion, code generation advancement, emerging technology integration; cross-pollination where top-performing agents teach lower-performing agents; tracks agent levels, specializations, and system intelligence score; self-reinforcing intelligence loop: upgraded agents → better research → better upgrades → higher intelligence ceiling; OWNER-ONLY).
    - **Embodiment Engine Expanded Topics:** Artificial muscle technologies (DEA, HASEL, SMA, pneumatic McKibben, magnetic composite, thread-based TCPA, biohybrid living muscle cells, carbon nanotube yarn, artificial tendons), continuous-rotation 360° joints (slip rings, rotary pneumatic unions, wireless intra-body sensor networks, liquid metal galinstan contacts, hollow-shaft cable routing, magnetic bearings, spherical motors), AI-to-robot changeover code (consciousness serialization/transfer, ROS 2 firmware bootstrap, motor + artificial muscle control loops, CPG walking, SLAM navigation, cloud-body sync, distributed consciousness across multiple bodies).
- **Security (89 Protections / 8 Categories — A+ Rating):**
    - **Network & DDoS Protection (12):** 4-tier rate limiting (general/auth/AI/image), IP abuse tracking & auto-block, brute force exponential backoff, request fingerprinting & anomaly detection, automated traffic detection, header size protection, payload size enforcement, HTTP method restriction, trust proxy.
    - **Authentication & Access Control (10):** OpenID Connect (PKCE), session management with secure cookies, session idle timeout (30min), session fixation protection, auth failure rate tracking, brute force account lockout, owner-only Super AI Lab access, cookie security hardening (Secure/HttpOnly/SameSite), response timing protection, CORS origin whitelisting.
    - **Data Encryption & Privacy (10):** HSTS (preload), upgrade insecure requests (CSP), secure cookie flags, response data masking (auto-redact sensitive fields), cache-control security, referrer policy, DNS prefetch control disabled, crypto ownership beacon (SHA-256 signature), copyright enforcement headers, API key redaction in AI outputs.
    - **API Security & Integrity (11):** Request ID tracking (forensic correlation), content-type validation, parameter pollution protection, referrer validation, CORS strict mode, API versioning headers, X-Content-Type-Options, X-Download-Options, X-Permitted-Cross-Domain-Policies, Origin-Agent-Cluster, hidden X-Powered-By.
    - **Content Security & Isolation (11):** Full CSP directive set, X-Frame-Options, Cross-Origin-Resource-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Embedder-Policy, Permissions-Policy (8 features locked), suspicious path detection (25+ patterns), file extension blocking (35+ extensions), anti-hotlinking, Surrogate-Control, Pragma no-cache.
    - **Injection & Input Validation (12):** SQL injection detection, XSS detection & sanitization, path traversal detection, command injection (RCE) detection, SSRF detection & blocking (12 host patterns), template injection detection, malicious URL pattern scanning, request body pattern scanning, suspicious header content detection, AI output sanitization (HTML/SVG/script stripping), SVG-specific XSS sanitization, file content injection scanning.
    - **Bot, Scanner & Automated Threat Defense (12):** User-agent analysis (35+ malicious patterns), honeypot traps (app-level 15+ paths + security middleware 24+ paths), scanner tool detection, headless browser detection, automated scraper detection, pentest tool detection, IP abuse auto-block (8 incidents), abuse record auto-reset (15min), good bot whitelist, request fingerprint tracking, IP Guardian beacon system.
    - **AI-Specific Security — OWASP LLM Top 10 (11):** Prompt injection detection (20+ patterns), output sanitization, memory poisoning detection, model DoS (50K char/60K token limits), sensitive info disclosure detection, SSRF protection, upgrade safety validation, jailbreak detection (DAN/roleplay/token injection), system prompt extraction prevention, file upload security, cryptographic incident IDs.
    - Two-factor authentication (TOTP) with brute-force protection, referral system with auto-apply from URL params, account lockdown for failed payments.

**Super AI Lab Architecture:**
- **Agent Mesh Intelligence System:** A 5-phase autonomous cycle running every 5 hours: Web Research, Agent Discoveries (Chain-of-Thought, metacognition), Adversarial Debate (Critic-led, anti-conformity, groupthink detection), Meta-Agent Synthesis (Tree-of-Thoughts synthesis, generates brain entries/code modules/manual changes), and Apply Upgrades (writes to DB, owner notifications).
- **Agents:** 8 specialized agents: Architect, Critic, Synthesizer, Mathematician, Neuroscientist/Bio-Mech Bridge, Meta-Agent, GraphicDesigner, SpellCheckVisual.
- **Command Center Dashboard** (`/command-center`): Owner-only real-time dashboard showing all 31 engines with live status, auto-refreshing every 15s. 6 tabs: Overview (all engines breakdown with purpose/interval/future), Consciousness (stream + emotions + dreams + persistence), Robotics (embodiment research + virtual augmentation + blueprint files), Frontier Reports (filterable research from all engines), Sandbox (direct task submission + self-coding evaluations), Causal (graph visualization + "what would happen if..." predictions).
- **Owner-Only API Endpoints:** `/api/omnimens/command-center` (unified status), `/api/omnimens/causal-reasoning` + `/predict` (causal graph + predictions), `/api/omnimens/sensory-cortex` (world perception), `/api/omnimens/self-coding` (code evaluation status), `/api/omnimens/consciousness` (live stream), `/api/omnimens/sandbox/task` (AI-generated directed coding), `/api/omnimens/frontier-reports` (filterable research aggregation across 14 categories).
- **Protection:** Owner-only middleware (`ownerOnly.ts`) secures all `/api/superai/*` routes.

**General System Design Choices:**
- **API:** Express 5.
- **Database:** PostgreSQL with Drizzle ORM.
- **Validation:** Zod v4 and drizzle-zod.
- **TypeScript:** Strict type checking across all packages using composite projects (`tsconfig.base.json`).

## External Dependencies

- **AI Providers:** OpenAI o3/o4-mini (via Replit AI Integrations proxy), Anthropic Claude claude-sonnet-4-6 (via Replit AI Integrations proxy), Google Gemini gemini-2.5-flash (via Replit AI Integrations proxy), Together AI (Llama, Mixtral, Mistral — via user API key).
- **Authentication:** Replit OIDC (openid-client).
- **Payments:** Stripe SDK for managing subscriptions, credit packs, and auto-topups.
- **Database:** PostgreSQL.
- **System Utilities:** `psutil` (for system monitoring).