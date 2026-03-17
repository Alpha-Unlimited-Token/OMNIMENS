# Workspace

## Project Summary

pnpm monorepo with two products:
1. **Super AI Lab** — private owner-only tool where 6 AI agents collaborate to design a superior AI
2. **OMNIMENS** (formerly GODFLESH) — public freemium AI platform with Replit Auth and usage-based credit billing

---

## OMNIMENS Platform

A transcendent sci-fi AI chat platform matching and surpassing the capabilities of all top AI systems (ChatGPT, Claude, Perplexity, Replit, Base44, Gemini, Cursor, etc.)

**Frontend:** `artifacts/godflesh/` — React + Vite app at `/godflesh/`  
**API Routes:** `artifacts/api-server/src/routes/omnimens.ts`  
**Business model:** Wallet-based auto-topup. $20 free monthly (2,000 credits). Auto-charges saved Stripe card when free credits run out. Monthly loyalty bonuses based on prior month's paid spend (10% cashback, up to $500 free). 3× markup on OpenAI costs = ~67% gross margin, 10% loyalty = ~3.3% cost = always profitable.

**Loyalty Tiers:** BASE ($0 spend → $20 free), SPARK ($10→$20), RISE ($50→$22), SURGE ($100→$25), APEX ($250→$35), ELITE ($500→$50), PRIME ($1K→$100), APEX+ ($2K→$200), LEGEND ($5K→$500).

### Platform Capabilities

| Feature | Equivalent | Implementation |
|---|---|---|
| **Code Execution** | ChatGPT Code Interpreter | Python 3.11 + Node.js 24 + Bash; `[RUN_CODE:]` marker; format/lint support |
| **Web Fetch & API Testing** | Postman / curl | `[FETCH_WEB:]` marker; scrape URLs, make HTTP API calls with headers/auth |
| **Git Operations** | GitHub Copilot | `[GIT_OP:]` clone/diff/log/blame any public repo |
| **System Monitor** | htop / top | `[SYS_INFO:]` real-time CPU/mem/disk/process/network via psutil |
| **File Operations** | VS Code diff | `[FILE_OP:]` text diff, ZIP create/list, JSON↔YAML↔TOML, JSON schema validation |
| **Persistent Memory** | ChatGPT Memory | Auto-extract facts from conversations; inject as context; manage in account |
| **Deep Research** | Perplexity Pro Research | 5 parallel sub-queries → synthesis with citations; 30-credit cost |
| **Custom Instructions** | ChatGPT Custom Instructions | Per-user "About Me" + "Response Style" injected every request |
| **8 Specialist Personas** | Multiple platforms | GENERAL/CODER/RESEARCHER/WRITER/ANALYST/CREATIVE/TUTOR/STRATEGIST |
| **Web Search** | Perplexity | Auto-triggered; formats results with source attribution |
| **URL Analysis** | Claude URL attachments | Auto-fetch + analyze any URLs in user messages |
| **Image Generation** | DALL-E / Midjourney | gpt-image-1; `[GENERATE_IMAGE: prompt]` trigger |
| **File Analysis** | All major platforms | PDFs, images (vision), CSVs, code files |
| **Document Artifacts** | Notion AI | Generate downloadable HTML, SVG, code files |
| **Voice I/O** | ChatGPT Voice | Browser TTS + WebSpeech recognition |
| **Autonomous Agent** | Claude, Cursor | Multi-step planning + execution for complex tasks |
| **Self-Patching** | Unique | OMNIMENS writes behavioral patches to itself after learning cycles |
| **Real-cost billing** | Unique | Actual OpenAI token costs × 3x markup = credits charged |

### DB Tables (all prefixed `godflesh_` in Postgres)
- `godflesh_users` — credits, stripeCustomerId, totalCreditsEarned
- `godflesh_usage` — per-day message counts + compute seconds
- `godflesh_credit_transactions` — purchase/spend ledger with descriptions
- `godflesh_brain` — OMNIMENS's self-learned knowledge base
- `godflesh_upgrades` — upgrade cycle log
- `godflesh_notifications` — user-facing upgrade announcements
- `godflesh_projects` — user projects (published, slug, customDomain, domainStatus, buildLog, folder, starred, visibility, thumbnail)
- `godflesh_project_files` — project file storage (filename, content, language)
- `godflesh_memories` — per-user persistent memories (auto-extracted + manual)
- `godflesh_custom_instructions` — per-user persona + aboutUser + responseStyle
- `godflesh_code_runs` — code execution history

### API Endpoints
- `GET /api/omnimens/status` — credits, owner flag, tier
- `POST /api/omnimens/chat` — SSE streaming chat with all capabilities
- `GET /api/omnimens/memories` — list user memories
- `POST /api/omnimens/memories` — add manual memory
- `DELETE /api/omnimens/memories/:id` — delete memory
- `GET /api/omnimens/custom-instructions` — get user's custom instructions + persona
- `PUT /api/omnimens/custom-instructions` — save custom instructions
- `GET /api/omnimens/personas` — list all 8 persona definitions
- `POST /api/omnimens/execute-code` — run JavaScript in sandboxed subprocess
- `POST /api/omnimens/deep-research` — SSE multi-step research with synthesis
- `POST /api/omnimens/analyze-url` — fetch + extract content from URL
- `GET /api/omnimens/pricing` — billing model info + loyalty tiers
- `GET /api/omnimens/billing` — user's billing summary (wallet, spend, next bonus)
- `POST /api/omnimens/setup-wallet` — create Stripe hosted card-save session
- `POST /api/omnimens/confirm-wallet` — confirm wallet after Stripe setup
- `POST /api/omnimens/remove-wallet` — remove saved payment method
- `POST /api/omnimens/topup` — manual topup (charge saved card, amountCents)
- `POST /api/omnimens/update-topup-settings` — toggle auto-topup / change amount
- `GET /api/omnimens/patches` — (owner only) behavioral patches
- `DELETE /api/omnimens/patches/:id` — deactivate patch
- `POST /api/omnimens/seed-products` — (owner only) create Stripe products
- `GET /api/omnimens/projects` — list user projects
- `POST /api/omnimens/projects` — create project
- `GET /api/omnimens/projects/:id` — get project + files
- `PUT /api/omnimens/projects/:id` — update metadata
- `DELETE /api/omnimens/projects/:id` — delete project + files (cascade)
- `POST /api/omnimens/projects/:id/build` — SSE streaming GPT-4o build (parses ===FILE: name===...===END=== blocks)
- `PUT /api/omnimens/projects/:id/files/:fileId` — edit individual file
- `POST /api/omnimens/projects/:id/publish` — publish/unpublish project (generates slug)
- `POST /api/omnimens/projects/:id/domain` — connect custom domain (status: pending)
- `DELETE /api/omnimens/projects/:id/domain` — remove custom domain
- `PATCH /api/omnimens/projects/:id/star` — toggle starred/unstarred
- `GET /p/:slug` — public project serving (no auth; inlines CSS+JS into index.html)

### Frontend Pages
- `/` — home (OMNIMENS landing page)
- `/chat` — 3-panel AI workspace (personas, chat, gallery/artifacts)
- `/projects` — project management (create, AI build, preview, publish, custom domain)
- `/pricing` — loyalty tiers + wallet connection
- `/account` — user account + billing

### Library Files
- `lib/omnimens-engine.ts` — neural pipeline runner (OMNIMENS cognitive state)
- `lib/omnimens-self-upgrade.ts` — autonomous brain growth cycles
- `lib/omnimens-patches.ts` — self-written behavioral patch system
- `lib/omnimens-memory.ts` — ChatGPT-style persistent user memory
- `lib/omnimens-code-executor.ts` — JS code interpreter (subprocess sandbox)
- `lib/omnimens-deep-research.ts` — Perplexity-style multi-step research
- `lib/omnimens-url-analyzer.ts` — URL fetch + content extraction
- `lib/omnimens-custom-instructions.ts` — 9 personas (incl. GAME_BUILDER) + custom context injection
- `lib/web-search.ts` — web search integration
- `lib/omnimens-learning.ts` — Learning AI engine: Critic evaluator, learning element, emotional intelligence analyzer, self-reflection, proactive anticipation, learning memory store, full per-user learning cycle (DeepMind SIMA / AWS Learning Agent / Emotional Intelligence architectures)
- `lib/omnimens-physio.ts` — Physical Therapy AI engine: red flag screening, psychosocial scoring (PHQ-2/TSK/PCS), phase-based exercise library (lower back/knee/shoulder/cervical/hip/ankle), adaptive program generation, PROMIS-PF/DASH/KOOS/LEFS/NDI/PSFS/NPRS/GROC outcome measures, integrative recovery recommendations, pain science education library

### Credit System
- 1 credit = $0.01 USD
- Cost = real OpenAI token cost × 3x markup, floored at MIN_CREDITS
- GPT-4o: $2.50/1M input, $10/1M output
- Images: $0.07 each
- MIN_CREDITS_MESSAGE = 5, MIN_CREDITS_IMAGE = 20
- Deep research = 30 credits, code execution = 2 credits
- Owner (`REPL_OWNER_ID=50777126`) bypasses all credit checks

### Stripe
- Mode: `"setup"` for wallet save, manual PaymentIntent for topup charges
- `createSetupSession()` → Stripe hosted setup page → saves card as payment method
- `attemptAutoTopup()` → PaymentIntent with `off_session: true` using saved payment method
- Auto-topup triggered in chat route when credits < MIN_CREDITS_MESSAGE and wallet connected

### SSE Chat Events
- `{ type: "chunk", content }` — streaming token
- `{ type: "searching_web", query }` — web search started
- `{ type: "search_complete", resultCount }` — web search done
- `{ type: "analyzing_urls", count }` — URL fetch started
- `{ type: "url_analysis_complete", count }` — URL fetch done
- `{ type: "image_generating" }` — image gen started
- `{ type: "image_generated", url, prompt, index }` — image ready
- `{ type: "artifact_generated", ... }` — downloadable file ready
- `{ type: "done", elapsedSeconds, credits, creditCost, costBreakdown }` — complete
- `{ type: "out_of_credits", needed }` — insufficient credits
- `{ type: "error", error }` — fatal error

---

## Super AI Lab

A full-stack React + Express app where 6 specialized AI agents collaborate to design a superior next-generation AI.

**Agents:** Architect (blue), Critic (orange), Synthesizer (purple), Mathematician (emerald), Neuroscientist/Bio-Mech Bridge (pink), Meta-Agent (yellow)  
**Routes:** `artifacts/api-server/src/routes/superai.ts`  
**Frontend:** `artifacts/super-ai-lab/` — React + Vite app at `/`  
**Protection:** Owner-only middleware (`ownerOnly.ts`) gates all `/api/superai/*` routes

---

## Stack

- **Monorepo:** pnpm workspaces
- **Node.js:** 24
- **TypeScript:** 5.9
- **API:** Express 5
- **Database:** PostgreSQL + Drizzle ORM
- **Validation:** Zod v4, drizzle-zod
- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui + framer-motion
- **Auth:** Replit OIDC (openid-client)
- **Payments:** Stripe SDK
- **AI:** OpenAI via Replit AI Integrations proxy

## Structure

```
artifacts/
├── api-server/     # Express API (shared backend)
├── super-ai-lab/   # Super AI Lab frontend
├── godflesh/       # OMNIMENS frontend (public)
└── mockup-sandbox/ # Component preview dev server
lib/
├── db/             # Drizzle schema + DB connection
├── api-spec/       # OpenAPI spec + Orval codegen
├── api-client-react/ # Generated React Query hooks
├── api-zod/        # Generated Zod schemas
└── replit-auth-web/ # useAuth() hook
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` (composite: true). Always typecheck from root: `pnpm run typecheck`.

## Key Owner Config
- `REPL_OWNER_ID=50777126` — bypasses all credit + rate limits
- `STRIPE_SECRET_KEY` — Stripe secret
- `STRIPE_PRICE_SPARK/SURGE/APEX` — one-time price IDs
