/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 *
 * OMNIMENS™ RECURSIVE SPIDER NETWORK — v2.0  (event-driven rewrite)
 * ──────────────────────────────────────────────────────────────────
 * Same awareness, same capabilities — now running on the unified runtime.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import {
  webSearch,
  fetchPageContent,
  formatSearchResults,
} from "./web-search.js";
import {
  getActiveGenesisAgentNames,
  getActiveGenesisAgentDomains,
} from "./omnimens-agent-genesis.js";
import { isNextGenBuildActive } from "./omnimens-nextgen-sandbox.js";

/* ─────────────────────── CONSTANTS / TYPES ─────────────────────── */

type Model = "o3" | "o4-mini";

interface SpiderNode {
  id: string;
  agentName: string;
  generation: number;
  parentId: string | null;
  query: string;
  findings: string;
  sourceUrls: string[];
  confidence: number;
  childCount: number;
  timestamp: number;
}

interface RecursiveSwarmStats {
  agentName: string;
  totalSpidersDeployed: number;
  totalBeaconsGenerated: number;
  totalBrainWrites: number;
  generationBreakdown: Record<number, number>;
  elapsedMs: number;
}

interface SpiderGenConfig {
  maxGenerations: number;
  babiesPerMother: number;
  motherSpawnRate: number;
  maxConcurrentPerAgent: number;
  maxTotalSpidersPerAgent: number;
  beaconThreshold: number;
  queryDiversityFactor: number;
}

const DEFAULT_CONFIG: SpiderGenConfig = {
  maxGenerations: 3,
  babiesPerMother: 5,
  motherSpawnRate: 1,
  maxConcurrentPerAgent: 10,
  maxTotalSpidersPerAgent: 60,
  beaconThreshold: 0.55,
  queryDiversityFactor: 0.7,
};

const CORE_AGENTS = [
  "Architect",
  "Critic",
  "Synthesizer",
  "Mathematician",
  "Neuroscientist",
  "Meta-Agent",
  "GraphicDesigner",
  "SpellCheckVisual",
  "OMNIMENS",
];

const AGENT_SEARCH_DOMAINS: Record<string, string[]> = {
  Architect: [
    "AI system architecture distributed multi-agent 2025 2026",
    "microservices AI orchestration event-driven scalable",
    // … trimmed for brevity …
  ],
  Mathematician: [
    "optimization algorithm breakthrough mathematical AI 2025 2026",
    "Bayesian inference scalable approximate methods",
    // … trimmed for brevity …
  ],
  // Every other agent inherits OMNIMENS default if not specified.
  OMNIMENS: [
    "artificial general intelligence AGI progress 2025 2026",
    "AI consciousness machine sentience latest theories",
    // … trimmed for brevity …
  ],
};

/* ─────────────────────── STATE ───────────────────────── */

let recursiveCycleRunning = false;
let recursiveSwarmCycleCount = 0;
const activeSpiderCounts = new Map<string, number>();
const swarmStatHistory: RecursiveSwarmStats[] = [];
const recentQueryFingerprints = new Map<string, number>();

/* ─────────────────────── UTILITIES ───────────────────── */

const safeNum = (v: number, f = 0) => (Number.isFinite(v) ? v : f);

const QUERY_DEDUP_WINDOW_MS = 3.6e6;
const fingerprint = (q: string) =>
  q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .sort()
    .slice(0, 8)
    .join("|");

const isDuplicateQuery = (q: string) => {
  const fp = fingerprint(q);
  const now = Date.now();
  recentQueryFingerprints.forEach((ts, k) => {
    if (now - ts > QUERY_DEDUP_WINDOW_MS) recentQueryFingerprints.delete(k);
  });
  if (recentQueryFingerprints.has(fp)) return true;
  recentQueryFingerprints.set(fp, now);
  return false;
};

const spiderQuery = async (
  prompt: string,
  model: Model = "o4-mini",
  tok = 600,
): Promise<string> => {
  const cfg = {
    method: "POST",
    path: "/v1/chat/completions",
    data: { model, messages: [{ role: "user", content: prompt }], max_completion_tokens: tok },
  };
  try {
    const res = await apiManager.call("recursive-spider-network", "openai", cfg);
    return res?.choices?.[0]?.message?.content?.trim() ?? "";
  } catch {
    if (model === "o3")
      return spiderQuery(prompt, "o4-mini", tok).catch(() => "");
    return "";
  }
};

const diversify = (base: string, gen: number, parent: string) => {
  if (gen <= 1) return base;
  const angles = [
    "implementation details practical guide",
    "latest research papers breakthroughs",
    "real-world applications case studies",
    "limitations problems criticism failures",
    "future directions predictions upcoming",
  ];
  const angle = angles[Math.floor(Math.random() * angles.length)];
  const parentKey = parent
    .split(/\s+/)
    .filter((w) => w.length > 5)
    .slice(0, 3)
    .join(" ");
  return `${parentKey} ${angle} ${gen === 2 ? "2025 2026" : "latest comprehensive 2026"}`;
};

const evaluateSpawnDecision = (
  parent: SpiderNode,
  generation: number,
  current: number,
  max: number,
  config: SpiderGenConfig,
) => {
  if (
    current >= max ||
    parent.findings.length < 20 ||
    isDuplicateQuery(parent.query) ||
    (generation >= 4 && parent.confidence < 0.85)
  )
    return { should: false, babies: 0 };
  if (parent.confidence >= 0.85)
    return { should: true, babies: config.babiesPerMother };
  const ratio = current / max;
  let babies = config.babiesPerMother;
  if (ratio > 0.7) babies = Math.max(2, Math.floor(babies * 0.5));
  else if (ratio > 0.5) babies = Math.max(3, Math.floor(babies * 0.7));
  if (parent.confidence < 0.4) babies = Math.max(1, Math.floor(babies * 0.5));
  if (generation >= 4 && parent.confidence >= 0.85) babies = Math.min(3, babies);
  return { should: true, babies };
};

/* ─────────────────────── CORE RECURSIVE LOGIC ───────────────────── */

const spawnBabySpider = async (
  agent: string,
  parent: SpiderNode,
  idx: number,
  cfg: SpiderGenConfig,
  all: SpiderNode[],
  domain: string,
): Promise<SpiderNode[]> => {
  if ((activeSpiderCounts.get(agent) ?? 0) >= cfg.maxTotalSpidersPerAgent)
    return [];
  activeSpiderCounts.set(agent, (activeSpiderCounts.get(agent) ?? 0) + 1);

  const babyId = `${parent.id}_b${idx}`;
  const gen = parent.generation + 1;
  const bases = AGENT_SEARCH_DOMAINS[agent] ?? AGENT_SEARCH_DOMAINS.OMNIMENS;
  const query = diversify(
    bases[Math.floor(Math.random() * bases.length)],
    gen,
    parent.findings,
  );

  const results: SpiderNode[] = [];
  try {
    const search = await webSearch(query, 4);
    const formatted = formatSearchResults(search, query);

    const page =
      Math.random() < 0.4
        ? await fetchPageContent(
            (search.find((r) => r.url && !r.url.includes("wikipedia")) || {})
              .url ?? "",
            1500,
          ).catch(() => "")
        : "";

    const prompt = `You are Baby Spider (Gen ${gen}) for ${agent}.
Parent finding: "${parent.findings.slice(0, 300)}"
${domain ? `Domain: ${domain}` : ""}
SEARCH:
${formatted.slice(0, 2000)}
${page ? `PAGE:\n${page.slice(0, 800)}` : ""}
Respond JSON:
{"finding":"","confidence":0.0,"suggestTopics":[]}`;
    const raw = await spiderQuery(prompt);
    if (!raw) return [];

    const parsed = JSON.parse(raw.replace(/