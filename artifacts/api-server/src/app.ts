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

import express, { type Express, type Request, type Response, type NextFunction } from "express";
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
import { requestSecurityMiddleware, securityBeacon } from "./middleware/security.js";
import { aiInputSecurityMiddleware } from "./middleware/ai-security.js";
import { runGlobalMemoryImprovementCycle } from "./lib/omnimens-conversations.js";
import { runToolKnowledgeIngestion } from "./lib/omnimens-tool-knowledge.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OWNER = "Alpha Unlimited Technologies";
const COPYRIGHT_YEAR = "2024-2026";
const PLATFORM = "OMNIMENS";
const SIGNATURE = crypto.createHash("sha256").update(`${PLATFORM}:${OWNER}:${COPYRIGHT_YEAR}`).digest("hex");

const app: Express = express();

// ── TRUST PROXY (Replit / reverse proxy) ─────────────────────────────────────
app.set("trust proxy", 1);

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

// General API limiter — 300 req / 15 min per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

// Auth endpoints — strict: 20 req / 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
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

// ── PRE-BODY REQUEST SECURITY (URL, headers, UA) ─────────────────────────────
app.use(requestSecurityMiddleware);

// ── COOKIE PARSER ─────────────────────────────────────────────────────────────
app.use(cookieParser());

// ── STRIPE WEBHOOK (raw body — scoped ONLY to the webhook path) ───────────────
// express.raw MUST only run on the webhook path, not all /api routes.
// Applying it broadly would consume the request body before express.json() runs.
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use("/api", stripeWebhookRouter);

// ── BODY PARSERS ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── POST-BODY REQUEST SECURITY (scans request body for malicious patterns) ────
app.use(requestSecurityMiddleware);

// ── AI INPUT SECURITY — OWASP Top 10 for LLMs protection ─────────────────────
// Applied globally to all API routes — filters prompt injection, jailbreaks,
// excessive input length, and sensitive data extraction attempts.
app.use("/api/omnimens/chat", aiInputSecurityMiddleware);

// ── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", platform: "OMNIMENS", timestamp: new Date().toISOString() });
});

// ── GOOGLE SEARCH CONSOLE VERIFICATION ───────────────────────────────────────
app.get("/googleb0b7c87dcdf2b2bb.html", (_req, res) => {
  res.set("Content-Type", "text/html");
  res.send("google-site-verification: googleb0b7c87dcdf2b2bb.html");
});

// ── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────
app.use(authMiddleware);

// ── API ROUTES ────────────────────────────────────────────────────────────────
app.use("/api", router);
// Also handle requests prefixed with /godflesh/api (from the godflesh frontend in production)
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

// ── AUTONOMOUS SYSTEMS ────────────────────────────────────────────────────────
startAutonomousLearning();
startEvolutionEngine();

setTimeout(async () => {
  await runGlobalMemoryImprovementCycle();
  setInterval(() => runGlobalMemoryImprovementCycle(), 6 * 60 * 60 * 1000);
}, 10 * 60 * 1000);

setTimeout(async () => {
  console.log("[OMNIMENS] Starting tool knowledge ingestion — learning all installed tools...");
  await runToolKnowledgeIngestion();
  setInterval(() => runToolKnowledgeIngestion(), 12 * 60 * 60 * 1000);
}, 30 * 1000);

// ── PRODUCTION STATIC SERVE ───────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const omnimensDist = path.resolve(__dirname, "../../omnimens/dist/public");
  app.use("/omnimens", express.static(omnimensDist));
  app.get("/omnimens/*splat", (_req, res) => {
    res.sendFile(path.join(omnimensDist, "index.html"));
  });
  app.get("/", (_req, res) => res.redirect("/omnimens"));
}

export default app;
