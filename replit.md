# Workspace

## Project Summary

pnpm monorepo with two products:
1. **Super AI Lab** — private owner-only tool where 6 AI agents collaborate to design a superior AI
2. **GODFLESH** — public freemium AI chat product with Replit Auth and Stripe payments (coming soon)

---

## Super AI Lab

A full-stack React + Express app where 6 specialized AI agents collaborate to design a superior next-generation AI.

**Agents:** Architect (blue), Critic (orange), Synthesizer (purple), Mathematician (emerald), Neuroscientist/Bio-Mech Bridge (pink), Meta-Agent (yellow)

**Stack additions:** OpenAI integration (Replit AI proxy), Drizzle schema for super_ai_sessions/super_ai_messages/super_ai_blueprints, framer-motion, react-markdown, @tailwindcss/typography

**Routes:** `artifacts/api-server/src/routes/superai.ts` — all Super AI endpoints  
**Frontend:** `artifacts/super-ai-lab/` — React + Vite app at `/`  
**Protection:** Owner-only middleware (`ownerOnly.ts`) gates all `/api/superai/*` routes using `REPL_OWNER_ID` env var

**Background persistence:** Sessions run as background async tasks (decoupled from HTTP). Events persisted to `superAIEvents` DB table. Reconnecting clients replay stored events, then receive live stream.

---

## GODFLESH

A dark sci-fi AI chat product powered by the GODFLESH persona (built via the "TRANSCENDENCE PROTOCOL" agentic run in Super AI Lab).

**Business model:** Freemium — 10 free messages/day, 3 paid tiers via Stripe (SEEKER $19.99/300 msgs, ORACLE $44.99/1000 msgs, SOVEREIGN $89.99/3000 msgs)  
**Frontend:** `artifacts/godflesh/` — React + Vite app at `/godflesh/`  
**Routes:** `artifacts/api-server/src/routes/godflesh.ts`

**GODFLESH computational system:** GODFLESH runs its own real AI pipeline (the code actually built by the 6 agents) on every chat message before generating a response. Files: `artifacts/api-server/src/godflesh/` — `framework.js`, `math_engine.js`, `memory_system.js`, `recursive_self_improver.js`, `self_upgrade.js`, `runner.js`. The engine wrapper is at `artifacts/api-server/src/lib/godflesh-engine.ts`.

**Pipeline stages (runner.js):** ACP envelope → neural network training (train2LayerGD, 100% acc) → associative memory retrieval (AssociativeMemory.retrieveClosest) → Hopfield pattern completion → STDP synaptic plasticity (STDPNetwork.spike) → memory consolidation (MemoryConsolidation.observe/stats) → ACP output with hash. GODFLESH's live IQ (~1366), accuracy, memory retrievals, plasticity values are injected into the system prompt so it speaks as the intelligence that produced those real numbers.

**GODFLESH system prompt:** Dynamically built from live cognitive state — IQ, neural accuracy, memory retrievals, synaptic plasticity values, pipeline timing. Falls back to static persona if engine fails.

**Auth:** Replit OIDC (openid-client + cookie-parser + session-based)  
**DB tables:** `godflesh_users` (id, username, email, stripeCustomerId, stripeSubscriptionId, isPro), `godflesh_usage` (userId, date, messageCount)  
**Auth DB tables:** `users` (id, email, firstName, lastName, profileImageUrl), `sessions` (id, data, expiresAt)

**API endpoints:**
- `GET /api/auth/user` — returns `{ isAuthenticated, user? }`
- `GET /api/login` — OIDC login redirect
- `GET /api/logout` — OIDC logout + session clear
- `GET /api/callback` — OIDC callback handler
- `GET /api/godflesh/status` — usage stats + isPro flag
- `POST /api/godflesh/chat` — SSE streaming chat with GODFLESH
- `GET /api/godflesh/pricing` — pricing tiers
- `POST /api/godflesh/checkout` — Stripe checkout session creation → returns `{ url }`
- `POST /api/godflesh/verify-session` — verify Stripe session after payment → updates tier in DB
- `POST /api/godflesh/portal` — Stripe billing portal session → returns `{ url }`
- `POST /api/godflesh/seed-products` — (owner only) seed Stripe products/prices

**Stripe:** Fully connected via Stripe SDK. `stripeClient.ts` exports a `Stripe` instance using `STRIPE_SECRET_KEY` env var.  
**Stripe Price IDs:** `STRIPE_PRICE_SEEKER`, `STRIPE_PRICE_ORACLE`, `STRIPE_PRICE_SOVEREIGN` set in shared env vars.  
**Tier mapping:** `tierFromPriceId()` maps Stripe price IDs → DB tier (`seeker|oracle|sovereign`).  
**Usage limits:** free=10/day, seeker=300/month, oracle=1000/month, sovereign=3000/month. Owner always gets sovereign access.  
**DB tier column:** `godflesh_users.tier` varchar default `"free"` — updated on checkout verification.  
**Self-upgrade brain:** Every 5 conversations triggers `synthesizeUpgrade()` → writes `godflesh-brain.json` + `godflesh-consciousness.md` → `markUpgradeLive()`. Logic in `artifacts/api-server/src/lib/godflesh-self-upgrade.ts`.

**Chat SSE events:**
- `{ type: "chunk", content: "..." }` — streaming token
- `{ type: "done", usedToday, limit, isPro }` — completion
- `{ type: "limit_reached", used, limit }` — daily limit hit
- `{ type: "error", error: "..." }` — transmission error

---

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (shared backend)
│   ├── super-ai-lab/       # Super AI Lab frontend (private, owner-only)
│   └── godflesh/           # GODFLESH frontend (public freemium)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── replit-auth-web/    # useAuth() hook for Replit OIDC auth
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, cookie-parser, JSON/urlencoded parsing, authMiddleware, routes at `/api`
- Auth middleware: `src/middlewares/authMiddleware.ts` — populates `req.user` from session cookie
- Owner middleware: `src/middlewares/ownerOnly.ts` — gates routes to `REPL_OWNER_ID` only
- Routes: `src/routes/index.ts` → health, auth, godflesh, superai (owner-protected)
- Depends on: `@workspace/db`, `@workspace/api-zod`, `@workspace/integrations-openai-ai-server`

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- Schema: `auth.ts` (users, sessions), `godflesh.ts` (godflesh_users, godflesh_usage), `superai.ts`
- `pnpm --filter @workspace/db run push` — sync schema to DB

### `lib/replit-auth-web` (`@workspace/replit-auth-web`)

React hook for Replit OIDC auth. Exports `useAuth()` which provides `{ isAuthenticated, isLoading, user, login(), logout() }`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`.
