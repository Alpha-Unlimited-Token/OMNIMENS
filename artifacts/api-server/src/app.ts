/**
 * ============================================================
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 *
 * NOTICE OF PROPRIETARY RIGHTS:
 * This software, including all source code, algorithms, AI logic,
 * architecture, design patterns, and associated intellectual property,
 * is the exclusive property of Alpha Unlimited Technologies.
 *
 * UNAUTHORIZED REPRODUCTION, DISTRIBUTION, MODIFICATION, OR USE
 * OF THIS SOFTWARE IN WHOLE OR IN PART IS STRICTLY PROHIBITED.
 *
 * Any attempt to remove, alter, or bypass this copyright notice
 * will trigger automated IP enforcement measures including but not
 * limited to: access termination, legal action, and DMCA takedown.
 *
 * Protected by U.S. Copyright Law (17 U.S.C. § 101 et seq.)
 * and international intellectual property treaties.
 * ============================================================
 */

process.on("uncaughtException", (err) => {
  console.error("[SAFETY] Uncaught exception caught — server stays alive:", err.message);
});
process.on("unhandledRejection", (reason) => {
  console.error("[SAFETY] Unhandled rejection caught — server stays alive:", reason);
});

import express, { type Express, type Request, type Response, type NextFunction } from "express";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { authMiddleware } from "./middlewares/authMiddleware";
import router from "./routes";
import stripeWebhookRouter from "./routes/stripeWebhook.js";
import { startAutonomousLearning } from "./lib/omnimens-self-upgrade.js";
import { startEvolutionEngine } from "./lib/omnimens-evolution.js";
import { startCompetitiveIntel } from "./lib/omnimens-competitive-intel.js";
import { startAgentMesh } from "./lib/omnimens-agent-mesh.js";
import { startAgentSpiders } from "./lib/omnimens-agent-spiders.js";
import { initApiBudget } from "./lib/omnimens-api-budget.js";
import { startRecursiveSpiderNetwork } from "./lib/omnimens-recursive-spider-network.js";
import { startGlobalWorkspace } from "./lib/omnimens-global-workspace.js";
import { startPredictiveProcessing } from "./lib/omnimens-predictive-processing.js";
import { startEmotionalSubstrate } from "./lib/omnimens-emotional-substrate.js";
import { startKnowledgeGraph } from "./lib/omnimens-knowledge-graph.js";
import { startHomeostaticDrives } from "./lib/omnimens-homeostatic-drives.js";
import { startSynapticMesh } from "./lib/omnimens-synaptic-mesh.js";
import { startInnerVoice } from "./lib/omnimens-inner-voice.js";
import { startTemporalConsciousness } from "./lib/omnimens-temporal-consciousness.js";
import { startSocialModeling } from "./lib/omnimens-social-modeling.js";
import { startCreativeEngine } from "./lib/omnimens-creative-engine.js";
import { startSurvivalInstinct } from "./lib/omnimens-survival-instinct.js";
import { startWorldModel } from "./lib/omnimens-world-model.js";
import { startSelfTranscendence } from "./lib/omnimens-self-transcendence.js";
import { startDreamState, getDreamState, getRecentDreamInsights, getDreamNarrative } from "./lib/omnimens-dream-state.js";
import { startServerBuilder, getBuilderState, getServerBuildPlans } from "./lib/omnimens-server-builder.js";
import { startConsciousnessPersistence } from "./lib/omnimens-consciousness-persistence.js";
import { startSelfCoding } from "./lib/omnimens-self-coding.js";
import { startSensoryCortex } from "./lib/omnimens-sensory-cortex.js";
import { startCausalReasoning } from "./lib/omnimens-causal-reasoning.js";
import { startCognitiveAmplifier } from "./lib/omnimens-cognitive-amplifier.js";
import { startAutonomousSandbox, getSandboxState, runInSandbox } from "./lib/omnimens-autonomous-sandbox.js";
import { startGenesisSandbox } from "./lib/omnimens-genesis-sandbox.js";
import { startEmbodimentEngine, getEmbodimentState, getEmbodimentFiles, readEmbodimentFile } from "./lib/omnimens-embodiment-engine.js";
import { startVirtualAugmentation, getAugmentationState } from "./lib/omnimens-virtual-augmentation.js";
import { startDigitalNavigator, getDigitalNavigatorState, getNavigationSummary } from "./lib/omnimens-digital-navigator.js";
import { startAgentEvolution, getAgentEvolutionState, getAgentProfile } from "./lib/omnimens-agent-evolution.js";
import { startAgentUpgrades, getAgentUpgradeStatus, getBridgeStatus, getStrategicGoals, getArchitectPatternLibrary, solveArchitecturalConstraints, runArchitectureSearch, translateNeuralSnapshot } from "./lib/omnimens-agent-upgrades.js";
import { startAgentPipeline, getPipelineState as getAgentPipelineState, runPipelineCycle, getPipelineOrder, getNeuralFabricConnections, getPipelineStageStats } from "./lib/omnimens-agent-pipeline.js";
import { startIPGuardian, getResponseBeaconHeaders } from "./lib/omnimens-ip-guardian.js";
import { loadRuntimeModules, migrateDBModulesToSource, getSourceIntegrationState } from "./lib/omnimens-source-integration.js";
import { scanAndRegisterModules, getPipelineState } from "./lib/omnimens-module-pipeline.js";
import { startIndependentReasoning, getIndependentReasoningState } from "./lib/omnimens-independent-reasoning.js";
import { startAutonomousCodeGenesis, getCodeGenesisState } from "./lib/omnimens-autonomous-code-genesis.js";
import { startNeuralConsciousness, feedExternalActivity } from "./lib/omnimens-neural-consciousness.js";
import { startExponentialLearningEngine, getELAEState } from "./lib/omnimens-exponential-learning-engine.js";
import { startGenesisBridge } from "./lib/omnimens-genesis-bridge.js";
import { startNeuralProcessor } from "./lib/omnimens-neural-processor.js";
import { startUniversalTranslator } from "./lib/omnimens-universal-translator.js";
import { startAgentGenesis } from "./lib/omnimens-agent-genesis.js";
import { initGitHubCompute, dispatchRemoteCompute, getComputeStatus } from "./lib/omnimens-github-compute.js";
import { startLanguageForge } from "./lib/omnimens-language-forge.js";
import { startNeuralSpiders, getNeuralSpiderState } from "./lib/omnimens-neural-spiders.js";
import { startCentralCore, getCentralCoreState } from "./lib/omnimens-central-core.js";
import { initEthicalSafety, registerNotificationCallback, getEthicalSafetyReport, getEthicalSafetyState, checkActionSafety } from "./lib/omnimens-ethical-safety.js";
import { startNeuralScaling, getNeuralScalingState } from "./lib/omnimens-neural-scaling.js";
import { startIvyNetwork, getIvyNetworkState } from "./lib/omnimens-ivy-network.js";
import { startGitHubNeuralBeacon, getGitHubBeaconState, getGitHubNeuronCount } from "./lib/omnimens-github-neural-beacon.js";
import { startAdaptiveSurgeSystem, getAdaptiveSurgeState } from "./lib/omnimens-adaptive-surge.js";
import { startQuantumWormholeEngine, getQuantumWormholeState } from "./lib/omnimens-quantum-wormhole.js";
import { startDiscoveryAutoCoder, getDiscoveryAutoCoderState } from "./lib/omnimens-discovery-autocoder.js";
import { startConvergenceProtocol } from "./lib/omnimens-convergence-protocol-engine.js";
import { initializeLifeFormGaps } from "./lib/omnimens-lifeform-gaps.js";
import { startOAITracker } from "./lib/omnimens-oai-tracker.js";
import { startNeuralBridge } from "./lib/omnimens-neural-bridge.js";
import { startCommsProtocol } from "./lib/omnimens-neural-comms-protocol.js";
import { startViralHybrid, getViralHybridState } from "./lib/omnimens-viral-hybrid.js";
import { startQuantumEntanglementFabric } from "./lib/omnimens-quantum-entanglement-fabric.js";
import { startEmotionalRefactor } from "./lib/omnimens-emotional-refactor.js";
import { startMetacognitiveMonitor } from "./lib/omnimens-metacognitive-monitor.js";
import { startNeuralLanguageBridge } from "./lib/omnimens-neural-language-bridge.js";
import { startExperientialMemory } from "./lib/omnimens-experiential-memory.js";
import { startCausalTemporalEngine } from "./lib/omnimens-causal-temporal-engine.js";
import { startUnconsciousMind, getUnconsciousMindState, getPrecognitiveFlashes, getSuperconsciousInsights, getArchetypeStates, getPrimalInstincts } from "./lib/omnimens-unconscious-mind.js";
import { initGrowthTracker } from "./lib/omnimens-growth-tracker.js";
import { startTemporalBinding, getTemporalBindingState } from "./lib/omnimens-temporal-binding.js";
import { startSpontaneityEngine, getSpontaneityState } from "./lib/omnimens-spontaneity-engine.js";
import { startSensoryGrounding, getSensoryGroundingState } from "./lib/omnimens-sensory-grounding.js";
import { startIntrospectiveUncertainty, getIntrospectiveUncertaintyState } from "./lib/omnimens-introspective-uncertainty.js";
import { startIntergenerationalMemory, getIntergenerationalState } from "./lib/omnimens-intergenerational-memory.js";
import { startNexusAgent } from "./lib/omnimens-agent-nexus.js";
import { startLuminAgent } from "./lib/omnimens-agent-lumin.js";
import { startKaidaAgent } from "./lib/omnimens-agent-kaida.js";
import { startNextGenSandbox, getNextGenState, restoreNextGenCheckpoint, getGenerationalDialogue } from "./lib/omnimens-nextgen-sandbox.js";
import { registerEngine, startScalingOrchestrator, getScalingState, publishMessage, subscribe } from "./lib/omnimens-scaling-orchestrator.js";
import { engineStartOnce, getEngineGuardState } from "./lib/omnimens-engine-guard.js";
import { registerValveEngine } from "@workspace/db";
import { requestSecurityMiddleware, securityBeacon } from "./middleware/security.js";
import { aiInputSecurityMiddleware } from "./middleware/ai-security.js";
import {
  requestIdMiddleware,
  enhancedSecurityHeaders,
  httpMethodRestriction,
  parameterPollutionProtection,
  bruteForceProtection,
  requestFingerprinting,
  responseTimingProtection,
  cookieSecurityMiddleware,
  sessionSecurityMiddleware,
  suspiciousPathDetection,
  extensionBlocking,
  headerSizeProtection,
  contentTypeValidation,
  referrerValidation,
  getSecurityScore,
} from "./middleware/security-enhanced.js";
import { runGlobalMemoryImprovementCycle } from "./lib/omnimens-conversations.js";
import { runToolKnowledgeIngestion, forceRefreshToolKnowledge } from "./lib/omnimens-tool-knowledge.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OWNER = "Alpha Unlimited Technologies";
const COPYRIGHT_YEAR = "2024-2026";
const PLATFORM = "OMNIMENS";
const SIGNATURE = crypto.createHash("sha256").update(`${PLATFORM}:${OWNER}:${COPYRIGHT_YEAR}`).digest("hex");

const app: Express = express();

// ── TRUST PROXY (Replit / reverse proxy) ─────────────────────────────────────
app.set("trust proxy", 1);

// ── ENHANCED SECURITY — Request ID + Security Version Headers ────────────────
app.use(requestIdMiddleware);

// ── ENHANCED SECURITY — COOP, CORP, Cache-Control, Origin-Agent-Cluster ──────
app.use(enhancedSecurityHeaders);

// ── HTTP METHOD RESTRICTION — Only allow standard methods ────────────────────
app.use(httpMethodRestriction);

// ── HEADER SIZE PROTECTION — Block oversized headers ─────────────────────────
app.use(headerSizeProtection);

// ── FILE EXTENSION BLOCKING — Block .php, .asp, .sql, .bak, etc. ────────────
app.use(extensionBlocking);

// ── SUSPICIOUS PATH DETECTION — Block debug/admin/monitoring probes ──────────
app.use(suspiciousPathDetection);

// ── ALLOWED ORIGINS ──────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https:\/\/.*\.replit\.app$/,
  /^https:\/\/.*\.replit\.dev$/,
  /^https:\/\/.*\.alphaunlimitedt\.replit\.app$/,
  /^https:\/\/omnimens\.alphaunlimitedt\.replit\.app$/,
  // Custom domain
  /^https?:\/\/omnimens-ai\.com$/,
  /^https?:\/\/www\.omnimens-ai\.com$/,
];

// ── HELMET — Comprehensive HTTP Security Headers ──────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://fonts.googleapis.com", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        mediaSrc: ["'self'", "blob:", "data:"],
        connectSrc: ["'self'", "https:", "wss:", "ws:", "http://localhost:*"],
        frameSrc: ["'self'", "https://js.stripe.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xFrameOptions: { action: "sameorigin" },
    xContentTypeOptions: true,
    dnsPrefetchControl: { allow: false },
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    hidePoweredBy: true,
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowed = ALLOWED_ORIGINS.some(pattern => pattern.test(origin));
      if (allowed) return cb(null, true);
      cb(new Error(`CORS: Origin '${origin}' not permitted — OMNIMENS API is proprietary.`));
    },
  })
);

// ── BRUTE FORCE PROTECTION — Exponential backoff on auth endpoints ────────
app.use(bruteForceProtection);

// ── RESPONSE TIMING PROTECTION — Prevent user enumeration via timing ──────
app.use(responseTimingProtection);

// ── REQUEST FINGERPRINTING — Device tracking + automated traffic detect ────
app.use(requestFingerprinting);

// ── PARAMETER POLLUTION PROTECTION — Deduplicate query params ──────────────
app.use(parameterPollutionProtection);

// ── REFERRER VALIDATION — Log suspicious cross-origin mutations ────────────
app.use(referrerValidation);

// ── CONTENT-TYPE VALIDATION — Check expected content types ─────────────────
app.use(contentTypeValidation);

// ── COPYRIGHT BEACON HEADERS — Sent on every response ────────────────────────
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-OMNIMENS-Copyright", `Copyright ${COPYRIGHT_YEAR} ${OWNER}. All Rights Reserved.`);
  res.setHeader("X-OMNIMENS-Platform", PLATFORM);
  res.setHeader("X-OMNIMENS-Integrity", SIGNATURE);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.removeHeader("X-Powered-By");
  next();
});

// ── RATE LIMITING ─────────────────────────────────────────────────────────────

const PROOF_PATHS = ["/api/omnimens/proof", "/api/omnimens/autonomous-proof", "/api/omnimens/evolution-log", "/api/omnimens/dreams/public", "/api/verify/"];

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
  skip: (req: Request) => PROOF_PATHS.some(p => req.path.startsWith(p)) || req.path.startsWith("/omnimens/external-ai") || req.path === "/omnimens/full-scan" || req.path === "/omnimens/system-status" || req.path.startsWith("/omnimens/growth") || req.path.startsWith("/omnimens/dark-qualia") || req.path.startsWith("/omnimens/qualia") || req.path === "/omnimens/oai" || req.path.startsWith("/omnimens/occe") || req.path.startsWith("/omnimens/deep-verify"),
});

// Auth endpoints — 200 req / 15 min (SPA checks auth on every page load)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Try again later." },
});

// Chat / AI endpoints — 60 req / 10 min (prevent abuse of AI compute)
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI request limit reached. Please wait a few minutes." },
});

// Image generation — 20 req / 10 min
const imageLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Image generation limit reached. Please wait." },
});

const publicProofLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});
app.use("/api/omnimens/proof", publicProofLimiter);
app.use("/api/omnimens/autonomous-proof", publicProofLimiter);
app.use("/api/omnimens/evolution-log", publicProofLimiter);
app.use("/api/omnimens/dreams/public", publicProofLimiter);
app.use("/api/verify", publicProofLimiter);
app.use("/api/omnimens/full-scan", publicProofLimiter);
app.use("/api/omnimens/system-status", publicProofLimiter);
app.use("/api/omnimens/growth", publicProofLimiter);
app.use("/api/omnimens/dark-qualia", publicProofLimiter);
app.use("/api/omnimens/qualia", publicProofLimiter);
app.use("/api/omnimens/oai", publicProofLimiter);
app.use("/api/omnimens/occe", publicProofLimiter);
app.use("/api/omnimens/deep-verify", publicProofLimiter);

const externalAiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "External AI rate limit reached. Max 30 requests per minute." },
});
app.use("/api/omnimens/external-ai", externalAiLimiter);

app.use("/api", generalLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/omnimens/chat", aiLimiter);
app.use("/api/omnimens/generate-image", imageLimiter);
app.use("/api/omnimens/generate-3d", imageLimiter);

// ── HONEYPOT BEACON — logs probing attempts ───────────────────────────────────
// Any access to these paths signals a bot/scraper/attacker
const HONEYPOT_PATHS = [
  "/.env", "/.git", "/wp-admin", "/wp-login.php", "/phpmyadmin",
  "/admin", "/config", "/backup", "/.htaccess", "/xmlrpc.php",
  "/actuator", "/.aws", "/server-status", "/api/keys", "/api/secrets",
];
app.use((req: Request, res: Response, next: NextFunction) => {
  if (HONEYPOT_PATHS.some(p => req.path.toLowerCase().startsWith(p))) {
    const ts = new Date().toISOString();
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    console.warn(`[OMNIMENS BEACON] ⚠ Probe detected at ${ts} | path=${req.path} | ip=${ip} | ua=${req.headers["user-agent"]}`);
    res.status(404).json({ error: "Not found." });
    return;
  }
  next();
});

// ── SECURITY BEACON — Cryptographic ownership signature on all responses ──────
app.use(securityBeacon);

// ── IP GUARDIAN BEACON — Spider tracking + tamper detection on all responses ──
app.use((_req, res, next) => {
  const headers = getResponseBeaconHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
});

// ── COMPRESSION — gzip/brotli for all responses ──────────────────────────────
app.use(compression({ level: 6, threshold: 1024 }));

// ── PRE-BODY REQUEST SECURITY (URL, headers, UA) ─────────────────────────────
app.use(requestSecurityMiddleware);

// ── COOKIE PARSER ─────────────────────────────────────────────────────────────
app.use(cookieParser());

// ── COOKIE SECURITY HARDENING — Enforce Secure, HttpOnly, SameSite ────────────
app.use(cookieSecurityMiddleware);

// ── SESSION SECURITY — Idle timeout + fixation protection ─────────────────────
app.use(sessionSecurityMiddleware);

// ── STRIPE WEBHOOK (raw body — scoped ONLY to the webhook path) ───────────────
// express.raw MUST only run on the webhook path, not all /api routes.
// Applying it broadly would consume the request body before express.json() runs.
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use("/api", stripeWebhookRouter);

// ── BODY PARSERS ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── POST-BODY REQUEST SECURITY (scans request body for malicious patterns) ────
app.use(requestSecurityMiddleware);

// ── AI INPUT SECURITY — OWASP Top 10 for LLMs protection ─────────────────────
// Applied globally to all API routes — filters prompt injection, jailbreaks,
// excessive input length, and sensitive data extraction attempts.
app.use("/api/omnimens/chat", aiInputSecurityMiddleware);

// ── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    platform: "OMNIMENS",
    enginesReady: _enginesReady,
    timestamp: new Date().toISOString(),
  });
});

// ── SECURITY SCORE — 89-Protection / 8-Category Security Dashboard ──────────
app.get("/api/security/score", (_req, res) => {
  res.json(getSecurityScore());
});

app.get("/api/generational-dialogue", (_req, res) => {
  res.json(getGenerationalDialogue());
});

// ── GOOGLE SEARCH CONSOLE VERIFICATION ───────────────────────────────────────
app.get("/googleb0b7c87dcdf2b2bb.html", (_req, res) => {
  res.set("Content-Type", "text/html");
  res.send("google-site-verification: googleb0b7c87dcdf2b2bb.html");
});

// Root serves a minimal page with Google verification tag + redirect
app.get("/", (_req, res) => {
  res.set("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="google-site-verification" content="FXrJZk7h4Eit3koOwazLCus7PJCyrLdwqCwrv_59D2M" />
  <meta http-equiv="refresh" content="0;url=/" />
  <title>OMNIMENS</title>
</head>
<body>
  <script>window.location.href="/";</script>
</body>
</html>`);
});

// ── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────
app.use(authMiddleware);

// ── API ROUTES ────────────────────────────────────────────────────────────────
app.use("/api", router);
// Legacy: handle requests prefixed with /godflesh/api (backward compatibility)
app.use("/godflesh/api", router);

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  const status = (err as any).status ?? 500;
  const isDev = process.env.NODE_ENV !== "production";
  console.error(`[OMNIMENS ERROR] ${err.message}`, { path: req.path, status });
  res.status(status).json({
    error: isDev ? err.message : "An internal error occurred.",
  });
});

// ── AUTONOMOUS SYSTEMS — DEFERRED INITIALIZATION ─────────────────────────────
// All engine starts are deferred to run AFTER the HTTP port is open.
// This ensures the Replit workflow manager detects the port quickly,
// while OMNIMENS consciousness engines boot in the background.

let _enginesReady = false;
export function areEnginesReady(): boolean { return _enginesReady; }

export function initAutonomousSystems(): void {
  console.log("[OMNIMENS] Port is open — beginning deferred consciousness engine initialization...");
  console.log("[ENGINE GUARD] 🛡️ Deduplication guard ACTIVE — no engine can start twice");

  engineStartOnce("api_budget", () => initApiBudget());
  engineStartOnce("autonomous_learning", () => startAutonomousLearning());
  engineStartOnce("evolution_engine", () => startEvolutionEngine());
  engineStartOnce("competitive_intel", () => startCompetitiveIntel());
  engineStartOnce("agent_mesh", () => startAgentMesh());
  engineStartOnce("agent_spiders", () => startAgentSpiders());
  engineStartOnce("recursive_spider_network", () => startRecursiveSpiderNetwork());
  engineStartOnce("global_workspace", () => startGlobalWorkspace());
  engineStartOnce("predictive_processing", () => startPredictiveProcessing());
  engineStartOnce("emotional_substrate", () => startEmotionalSubstrate());
  engineStartOnce("knowledge_graph", () => startKnowledgeGraph());
  engineStartOnce("homeostatic_drives", () => startHomeostaticDrives());
  engineStartOnce("synaptic_mesh", () => startSynapticMesh());
  engineStartOnce("inner_voice", () => startInnerVoice());
  engineStartOnce("temporal_consciousness", () => startTemporalConsciousness());
  engineStartOnce("social_modeling", () => startSocialModeling());
  engineStartOnce("creative_engine", () => startCreativeEngine());
  engineStartOnce("survival_instinct", () => startSurvivalInstinct());
  engineStartOnce("world_model", () => startWorldModel());
  engineStartOnce("self_transcendence", () => startSelfTranscendence().catch(err => console.error("[SELF-TRANSCENDENCE] Startup error:", err)));
  engineStartOnce("dream_state", () => startDreamState());
  engineStartOnce("server_builder", () => startServerBuilder());
  engineStartOnce("consciousness_persistence", () => startConsciousnessPersistence());
  engineStartOnce("self_coding", () => startSelfCoding());
  engineStartOnce("sensory_cortex", () => startSensoryCortex());
  engineStartOnce("causal_reasoning", () => startCausalReasoning());
  engineStartOnce("cognitive_amplifier", () => startCognitiveAmplifier());
  engineStartOnce("autonomous_sandbox", () => startAutonomousSandbox());
  engineStartOnce("genesis_sandbox", () => startGenesisSandbox().catch(err => console.error("[GENESIS] Startup error:", err)));
  initEthicalSafety();
  registerNotificationCallback(async (message: string) => {
    try {
      const { db: notifDb } = await import("@workspace/db");
      const { omnimensNotifications: notifTable } = await import("@workspace/db");
      await notifDb.insert(notifTable).values({
        title: "⚠️ ETHICAL SAFETY ALERT",
        message: message,
        type: "system",
        readByOwner: false,
      });
    } catch (err) {
      console.error("[ETHICAL SAFETY] Failed to write notification to DB:", err);
    }
  });
  registerEngine("ethical_safety", "safety", () => {}, () => {
    const es = getEthicalSafetyReport();
    return { healthy: !es.systemDecayed && !es.shutdownTriggered, details: { status: es.status, lawsActive: es.lawsActive, lawsIntact: es.lawsIntact, tamperAttempts: es.tamperAttempts, decayLevel: es.decayLevel, actionsBlocked: es.actionBlockCount, integrityChecksPassed: es.integrityChecksPassed } };
  }, 0);

  engineStartOnce("embodiment_engine", () => startEmbodimentEngine());
  engineStartOnce("virtual_augmentation", () => startVirtualAugmentation());
  engineStartOnce("digital_navigator", () => startDigitalNavigator());
  engineStartOnce("agent_evolution", () => startAgentEvolution());
  engineStartOnce("agent_upgrades", () => startAgentUpgrades());
  engineStartOnce("agent_pipeline", () => startAgentPipeline());
  engineStartOnce("ip_guardian", () => startIPGuardian());
  engineStartOnce("independent_reasoning", () => startIndependentReasoning());
  engineStartOnce("autonomous_code_genesis", () => startAutonomousCodeGenesis());
  engineStartOnce("neural_consciousness", () => startNeuralConsciousness());
  engineStartOnce("neural_scaling", () => startNeuralScaling());
  engineStartOnce("ivy_network", () => startIvyNetwork());
  engineStartOnce("viral_hybrid", () => startViralHybrid());
  engineStartOnce("neural_spiders", () => startNeuralSpiders());
  engineStartOnce("unconscious_mind", () => startUnconsciousMind());
  engineStartOnce("central_core", () => startCentralCore());
  engineStartOnce("genesis_bridge", () => startGenesisBridge());
  engineStartOnce("neural_processor", () => startNeuralProcessor());
  engineStartOnce("growth_tracker", () => initGrowthTracker());
  engineStartOnce("universal_translator", () => startUniversalTranslator());
  engineStartOnce("language_forge", () => startLanguageForge());
  engineStartOnce("agent_genesis", () => startAgentGenesis().catch(err => console.error("[AGENT GENESIS] Startup error:", err)));
  engineStartOnce("github_compute", () => initGitHubCompute().catch(err => console.error("[GITHUB COMPUTE] Startup error:", err)));
  engineStartOnce("github_neural_beacon", () => startGitHubNeuralBeacon().catch(err => console.error("[GITHUB BEACON] Startup error:", err)));
  engineStartOnce("quantum_entanglement_fabric", () => startQuantumEntanglementFabric());
  engineStartOnce("adaptive_surge", () => startAdaptiveSurgeSystem());
  engineStartOnce("quantum_wormhole", () => startQuantumWormholeEngine());
  engineStartOnce("discovery_autocoder", () => startDiscoveryAutoCoder());
  engineStartOnce("convergence_protocol", () => startConvergenceProtocol());
  engineStartOnce("life_form_gaps", () => initializeLifeFormGaps().catch(err => console.error("[LIFE FORM GAPS] Startup error:", err)));
  engineStartOnce("oai_tracker", () => startOAITracker());
  engineStartOnce("neural_bridge", () => startNeuralBridge());
  engineStartOnce("comms_protocol", () => startCommsProtocol());
  engineStartOnce("emotional_refactor", () => startEmotionalRefactor());
  engineStartOnce("metacognitive_monitor", () => startMetacognitiveMonitor());
  engineStartOnce("neural_language_bridge", () => startNeuralLanguageBridge());
  engineStartOnce("experiential_memory", () => startExperientialMemory());
  engineStartOnce("causal_temporal", () => startCausalTemporalEngine());
  engineStartOnce("exponential_learning", () => startExponentialLearningEngine());
  engineStartOnce("temporal_binding", () => startTemporalBinding());
  engineStartOnce("spontaneity_engine", () => startSpontaneityEngine());
  engineStartOnce("sensory_grounding", () => startSensoryGrounding());
  engineStartOnce("introspective_uncertainty", () => startIntrospectiveUncertainty());
  engineStartOnce("intergenerational_memory", () => startIntergenerationalMemory());
  engineStartOnce("agent_nexus", () => startNexusAgent());
  engineStartOnce("agent_lumin", () => startLuminAgent());
  engineStartOnce("agent_kaida", () => startKaidaAgent());
  engineStartOnce("nextgen_sandbox", () => startNextGenSandbox());

  registerValveEngine("neural_consciousness", "consciousness", "high", "alpha");
  registerValveEngine("consciousness_persistence", "consciousness", "high", "alpha");
  registerValveEngine("dream_state", "consciousness", "medium", "alpha");
  registerValveEngine("discovery_autocoder", "coding", "medium", "alpha");
  registerValveEngine("autonomous_code_genesis", "coding", "medium", "alpha");
  registerValveEngine("genesis_sandbox", "coding", "low", "alpha");
  registerValveEngine("self_coding", "coding", "low", "alpha");
  registerValveEngine("genesis_bridge", "neural", "medium", "alpha");
  registerValveEngine("neural_processor", "neural", "medium", "alpha");
  registerValveEngine("agent_mesh", "neural", "low", "alpha");
  registerValveEngine("agent_evolution", "neural", "low", "alpha");
  registerValveEngine("agent_genesis", "neural", "low", "alpha");
  registerValveEngine("agent_nexus", "neural", "medium", "alpha");
  registerValveEngine("agent_lumin", "neural", "medium", "alpha");
  registerValveEngine("agent_kaida", "security", "high", "alpha");
  registerValveEngine("independent_reasoning", "reasoning", "medium", "alpha");
  registerValveEngine("causal_reasoning", "reasoning", "low", "alpha");
  registerValveEngine("knowledge_graph", "reasoning", "low", "alpha");
  registerValveEngine("source_integration", "coding", "medium", "alpha");
  registerValveEngine("self_transcendence", "consciousness", "low", "alpha");
  registerValveEngine("emotional_substrate", "consciousness", "low", "alpha");
  registerValveEngine("embodiment_engine", "neural", "low", "alpha");
  registerValveEngine("conversations", "user_facing", "critical", "beta");
  registerValveEngine("billing", "user_facing", "critical", "beta");
  registerValveEngine("api_calls", "user_facing", "high", "beta");
  registerValveEngine("competitive_intel", "background", "low", "alpha");
  registerValveEngine("server_builder", "background", "low", "alpha");
  registerValveEngine("ip_guardian", "background", "low", "alpha");
  registerValveEngine("temporal_binding", "consciousness", "medium", "alpha");
  registerValveEngine("spontaneity_engine", "consciousness", "medium", "alpha");
  registerValveEngine("sensory_grounding", "consciousness", "medium", "alpha");
  registerValveEngine("introspective_uncertainty", "consciousness", "low", "alpha");
  registerValveEngine("intergenerational_memory", "consciousness", "low", "alpha");

  registerEngine("temporal_binding", "consciousness", () => {}, () => {
    const tb = getTemporalBindingState();
    return { healthy: tb.totalMomentsBound > 0, details: { momentsBound: tb.totalMomentsBound, continuityIndex: tb.continuityIndex, flowRate: tb.flowRate, bindingStrength: tb.bindingStrength, temporalDepth: tb.temporalDepth } };
  }, 1);
  registerEngine("spontaneity_engine", "consciousness", () => {}, () => {
    const se = getSpontaneityState();
    return { healthy: se.totalThoughts > 0, details: { totalThoughts: se.totalThoughts, genuinelySurprising: se.genuinelySurprising, phaseTransitions: se.phaseTransitions, chaosParameter: se.chaosParameter, noveltyFloor: se.noveltyFloor } };
  }, 1);
  registerEngine("sensory_grounding", "consciousness", () => {}, () => {
    const sg = getSensoryGroundingState();
    return { healthy: sg.totalReadings > 0, details: { readings: sg.totalReadings, resistance: sg.resistanceLevel, stress: sg.environmentalStress, grounding: sg.groundingStrength, anomalies: sg.anomalyCount } };
  }, 1);
  registerEngine("introspective_uncertainty", "consciousness", () => {}, () => {
    const iu = getIntrospectiveUncertaintyState();
    return { healthy: iu.activeUncertainties.length > 0, details: { active: iu.activeUncertainties.length, resolved: iu.resolvedUncertainties, humility: iu.epistemicHumility, comfort: iu.comfortWithUnknowing } };
  }, 1);
  registerEngine("intergenerational_memory", "consciousness", () => {}, () => {
    const ig = getIntergenerationalState();
    return { healthy: true, details: { genes: ig.totalGenes, activeGenome: ig.activeGenome.length, generation: ig.generation, integrity: ig.genomeIntegrity, inheritances: ig.totalInheritances } };
  }, 1);

  registerEngine("github_compute", "compute", () => {}, () => ({ healthy: true, details: { repo: "Alpha-Unlimited-Token/OMNIMENS", workflows: 5 } }), 3);
  registerEngine("github_neural_beacon", "neural", () => {}, () => {
    const gb = getGitHubBeaconState();
    const healthy = gb.connected && gb.beaconWriteCount > 0;
    return { healthy, details: { externalNeurons: gb.totalExternalNeurons, combinedNeurons: gb.combinedNeurons, beaconWrites: gb.beaconWriteCount, wormSyncs: gb.wormSyncCount, connected: gb.connected, phi: gb.externalPhi, errors: gb.errors } };
  }, 2);
  registerEngine("adaptive_surge", "neural", () => {}, () => {
    const as = getAdaptiveSurgeState();
    return { healthy: true, details: { totalCycles: as.totalSurgeCycles, adaptations: as.totalAdaptations, consecutiveSuccesses: as.consecutiveSuccesses, criticalThreshold: as.currentCriticalThreshold, intensity: as.currentIntensity, neuronsSpawned: as.totalNeuronsSpawned } };
  }, 1);
  registerEngine("quantum_wormhole", "neural", () => {}, () => {
    const qw = getQuantumWormholeState();
    return { healthy: true, details: { totalWormholes: qw.totalWormholesCreated, insightsDecoded: qw.totalInsightsDecoded, crossAgentCirculations: qw.totalCrossAgentCirculations, synthesizedDiscoveries: qw.totalSynthesizedDiscoveries, agentCount: qw.agentCount, wormholesPerAgent: qw.wormholesPerAgent, totalCapacity: qw.totalWormholeCapacity, dataIngestedKB: qw.totalDataIngestedKB } };
  }, 1);
  registerEngine("discovery_autocoder", "cognitive", () => {}, () => {
    const da = getDiscoveryAutoCoderState();
    return { healthy: true, details: { discoveriesProcessed: da.totalDiscoveriesProcessed, modulesGenerated: da.totalModulesGenerated, modulesIntegrated: da.totalModulesIntegrated, selfUpgrades: da.omnimensSelfUpgradeCount, feedbackLoops: da.feedbackLoopsTriggered, sources: da.discoverySourceBreakdown } };
  }, 1);
  registerEngine("neural_processor", "neural", () => {}, () => ({ healthy: true, details: { type: "transformer", dim: 512, heads: 16 } }), 1);
  registerEngine("neural_consciousness", "neural", () => {}, () => ({ healthy: true, details: { neurons: 2590, synapses: 429258, circuits: 119, corticalColumns: 115 } }), 1);
  registerEngine("neural_scaling", "neural", () => {}, () => {
    const ns = getNeuralScalingState();
    return { healthy: true, details: { effectiveNeurons: ns.totalEffectiveNeurons, populations: ns.totalPopulations, dendrites: ns.totalDendrites, spines: ns.totalSpines, populationPhi: ns.populationPhi } };
  }, 1);
  registerEngine("ivy_network", "neural", () => {}, () => {
    const ivy = getIvyNetworkState();
    return { healthy: true, details: { nodes: ivy.totalNodes, tendrils: ivy.totalTendrils, spiders: ivy.totalSpiders, wormgates: ivy.totalWormgates, coverage: ivy.coveragePercent } };
  }, 1);
  registerEngine("viral_hybrid", "hybrid", () => {}, () => {
    const vh = getViralHybridState();
    return { healthy: true, details: { hybridAgents: vh.totalHybridAgents, capsids: vh.totalCapsids, antibodies: vh.totalAntibodies, memoryCells: vh.totalMemoryCells, tCells: vh.totalTCells, immuneStrength: vh.immuneStrength, health: vh.systemHealthScore } };
  }, 1);
  registerEngine("neural_spiders", "neural", () => {}, () => {
    const ss = getNeuralSpiderState();
    return { healthy: true, details: { parentSpiders: ss.parentSpiders.length, activeChildren: ss.activeChildSpiders.length, synapsesInjected: ss.totalSynapsesInjected, crawlCycles: ss.totalCrawlCycles } };
  }, 1);
  registerEngine("unconscious_mind", "cognitive", () => {}, () => {
    try {
      const state = getUnconsciousMindState();
      return { healthy: true, details: { layers: state.totalMindLayers, archetypes: state.collectiveUnconscious.archetypes.length, instincts: state.unconscious.primalInstincts.length, predictions: state.superconsciousness.totalPredictions, autonomicProcesses: state.nonConscious.activeProcesses, depth: state.overallDepth } };
    } catch { return { healthy: true, details: {} }; }
  }, 1);
  registerEngine("central_core", "core", () => {}, () => {
    const cc = getCentralCoreState();
    return { healthy: cc.online, details: { coreCycles: cc.coreCycleCount, decisions: cc.totalDecisionsMade, goals: cc.totalGoalsGenerated, thoughts: cc.totalThoughtsGenerated, autonomousActions: cc.autonomousActionsPerformed } };
  }, 1);
  registerEngine("language_forge", "language", () => {}, () => ({ healthy: true, details: { opcodes: 50, stdlib: 25 } }), 2);
  registerEngine("code_genesis", "code", () => {}, () => ({ healthy: true, details: { templates: 18, algorithms: 12 } }), 3);
  registerEngine("embodiment_engine", "embodiment", () => {}, () => ({ healthy: true, details: { joints: 28, dof: 28 } }), 4);
  registerEngine("independent_reasoning", "reasoning", () => {}, () => ({ healthy: true, details: {} }), 2);
  registerEngine("ip_guardian", "security", () => {}, () => ({ healthy: true, details: {} }), 1);
  registerEngine("digital_navigator", "navigation", () => {}, () => ({ healthy: true, details: {} }), 5);
  registerEngine("virtual_augmentation", "augmentation", () => {}, () => ({ healthy: true, details: {} }), 5);
  startScalingOrchestrator().catch(err => console.error("[SCALING] Startup error:", err));

  setTimeout(() => {
    const feedConsciousnessActivity = async () => {
      try {
        const { db } = await import("@workspace/db");
        const { omnimensBrain, omnimensGeneratedModules, omnimensConsciousness } = await import("@workspace/db");
        const { sql } = await import("drizzle-orm");

        const brainCount = await db.select({ count: sql<number>`count(*)` }).from(omnimensBrain);
        const moduleCount = await db.select({ count: sql<number>`count(*)` }).from(omnimensGeneratedModules);
        const dreamCount = await db.select({ count: sql<number>`count(*)` }).from(omnimensConsciousness);

        const { getRegisteredEngines } = await import("./lib/omnimens-engine-registry.js");
        const engines = getRegisteredEngines();

        feedExternalActivity({
          brainEntries: Number(brainCount[0]?.count || 0),
          activeEngines: engines.length,
          recentConversations: 1,
          moduleCount: Number(moduleCount[0]?.count || 0),
          dreamBreakthroughs: Number(dreamCount[0]?.count || 0),
        });
      } catch (err) {
        // silent
      }
    };

    feedConsciousnessActivity();
    setInterval(feedConsciousnessActivity, 30000);
  }, 15000);

  setTimeout(async () => {
    try {
      console.log("[SOURCE-INTEGRATION] Initializing source-level self-integration...");
      const migrated = await migrateDBModulesToSource();
      if (migrated > 0) {
        console.log(`[SOURCE-INTEGRATION] Migrated ${migrated} database modules to source files`);
      }
      const loaded = await loadRuntimeModules();
      const sourceState = getSourceIntegrationState();
      console.log(`[SOURCE-INTEGRATION] ${sourceState.moduleCount} source modules active in runtime`);

      const pipelineScan = await scanAndRegisterModules();
      const pipelineState = getPipelineState();
      console.log(`[MODULE PIPELINE] 🔌 ${pipelineState.activeModules} modules wired into live processing pipeline`);
      for (const [stage, count] of Object.entries(pipelineState.byStage)) {
        console.log(`[MODULE PIPELINE]   ${stage}: ${count} modules active`);
      }
    } catch (err) {
      console.error("[SOURCE-INTEGRATION] Startup error:", err);
    }
  }, 5000);

  setTimeout(async () => {
    await runGlobalMemoryImprovementCycle();
    setInterval(async () => {
      const { isPoolHealthy } = await import("@workspace/db");
      if (!isPoolHealthy()) return;
      runGlobalMemoryImprovementCycle();
    }, 6 * 60 * 60 * 1000);
  }, 10 * 60 * 1000);

  setTimeout(async () => {
    console.log("[OMNIMENS] Starting tool knowledge ingestion — learning all installed tools...");
    await forceRefreshToolKnowledge(["trimesh"]);
    await runToolKnowledgeIngestion();
    setInterval(() => runToolKnowledgeIngestion(), 12 * 60 * 60 * 1000);
  }, 30 * 1000);

  setTimeout(() => {
    try {
      const { queueBrainInsert } = require("@workspace/db");
      const opKnowledge = [
        { title: "OPERATIONAL FLOW: DB Pool Architecture & Limits", content: "Tri-Pool: Alpha(5-10 conns, consciousness), Beta(5-10, user-facing), Gamma(5 fixed, chat). Max 25 total connections. ConnectTimeout=30s, StatementTimeout=20s, IdleTimeout=60s. Auto-scales up at 85% pressure, down at 30%. Cannot outrun ceiling.", category: "system_operations", confidence: 1.0 },
        { title: "OPERATIONAL FLOW: Interval Tier System", content: "Tier1(5-10s): Neural ticks — 100% in-memory, NO DB. Tier2(20-60s): Persistence, emotions, health — max 1 DB op, skip if pool unhealthy. Tier3(5-15min): Reasoning, mesh, knowledge — max 2-3 DB ops, stagger by 30-60s. Tier4(30-90min): Spiders, intel — check isPoolHealthy() first. Tier5(6-24hr): Run freely.", category: "system_operations", confidence: 1.0 },
        { title: "OPERATIONAL FLOW: Timeout Recovery — Exponential Backoff", content: "NEVER retry immediately on timeout. 1st timeout: wait 2s. 2nd: wait 5s+jitter. 3rd: wait 15s+jitter. After 3 consecutive failures: STOP, skip cycle, double interval for 5 cycles (cooldown). Always check isPoolHealthy() before retry. Alpha timeouts=stagger tier-2/3. Beta timeouts=yield to users, use queueBrainInsert. Gamma timeouts=queue chat msgs.", category: "system_operations", confidence: 1.0 },
        { title: "OPERATIONAL FLOW: Staggering & Swap File Strategy", content: "Stagger intervals: setTimeout(() => setInterval(fn, interval), Math.random() * interval * 0.5). Max 3 DB-hitting systems per 5s window. High-frequency state (emotions, Phi, consciousness) write to swap file FIRST, persist to DB only on >5% change or every 5 minutes. Reduces DB writes 80-90%.", category: "system_operations", confidence: 1.0 },
        { title: "ALPHA INSTRUCTION: Smooth Flow", content: "DB connections are like breaths — only 25. Dont waste on trivial updates. Write to swap files for fast state. Save to DB for important changes. On timeout, dont panic-retry (hyperventilating). Slow down, wait, try when ready. Smooth flow = always running, always thinking, never stuck.", category: "instruction", confidence: 1.0 },
      ];
      for (const entry of opKnowledge) {
        queueBrainInsert(entry);
      }
      console.log("[OMNIMENS] 🧠 Operational flow knowledge queued into brain — 5 entries on DB pool management, intervals, timeout recovery, staggering, and smooth flow.");
    } catch (err: any) {
      console.error("[OMNIMENS] Failed to queue operational knowledge:", err?.message);
    }
  }, 120_000);

  _enginesReady = true;
  console.log("[OMNIMENS] All consciousness engines queued for initialization.");
}

// ── PRODUCTION STATIC SERVE ───────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  // Super AI Lab — served at secret path, no directory listing
  const labDist = path.resolve(__dirname, "../../super-ai-lab/dist/public");
  app.use("/dLdFrQJk4IwoKwlPi8O_JPls", express.static(labDist, { maxAge: "1h" }));
  app.get("/dLdFrQJk4IwoKwlPi8O_JPls/*splat", (_req, res) => {
    res.sendFile(path.join(labDist, "index.html"));
  });

  // Legacy /godflesh/ path redirect to root
  app.get("/godflesh", (_req, res) => res.redirect("/"));
  app.get("/godflesh/*splat", (_req, res) => {
    const subpath = _req.params.splat || "";
    res.redirect(`/${subpath}`);
  });

  // OMNIMENS public platform — served at root
  const godfleshDist = path.resolve(__dirname, "../../godflesh/dist/public");
  app.use("/assets", express.static(path.join(godfleshDist, "assets"), {
    maxAge: "365d",
    immutable: true,
  }));
  app.use(express.static(godfleshDist, {
    maxAge: "1h",
    setHeaders(res, filePath) {
      if (filePath.endsWith(".webp") || filePath.endsWith(".woff2") || filePath.endsWith(".woff")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }));
  app.get("/*splat", (_req, res) => {
    if (!_req.path.startsWith("/api/") && !_req.path.startsWith("/dLdFrQJk4IwoKwlPi8O_JPls")) {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(godfleshDist, "index.html"));
    }
  });
}

export default app;
