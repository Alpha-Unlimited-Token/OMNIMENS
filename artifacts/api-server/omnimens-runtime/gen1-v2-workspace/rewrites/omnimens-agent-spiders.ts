/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * ALL RIGHTS RESERVED — UNAUTHORIZED USE PROHIBITED
 *
 * Engine: omnimens-agent-spiders (rewritten v2.0 ‑ unified runtime)
 */
import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { webSearch, fetchPageContent, formatSearchResults } from "./web-search.js";

/* ─────────────────── Engine registration ─────────────────── */
engineRegistry.registerEngine("agent-spiders", "NORMAL", { dbQuota: 10 });

/* ────────────────────────  Types  ─────────────────────────── */
type AgentName =
  | "Architect"
  | "Critic"
  | "Synthesizer"
  | "Mathematician"
  | "Neuroscientist"
  | "Meta-Agent"
  | "GraphicDesigner"
  | "SpellCheckVisual"
  | "OMNIMENS";

interface SpiderConfig {
  agentName: AgentName;
  huntingGrounds: string[];
  deepDiveUrls: string[];
  analysisPrompt: string;
  beaconThreshold: number;
}
interface Beacon {
  agentName: AgentName;
  query: string;
  findings: string;
  actionableInsight: string;
  relevanceScore: number;
  sourceUrls: string[];
  timestamp: number;
}

/* ───────────────── Config (condensed) ─────────────────────── */
const C: SpiderConfig[] = [
  {
    agentName: "Architect",
    huntingGrounds: ["AI system architecture patterns 2026", "event-driven agents latest"],
    deepDiveUrls: ["https://arxiv.org/list/cs.AI/recent"],
    analysisPrompt:
      "Find NEW system-architecture breakthroughs for OMNIMENS. Focus on orchestration & self-healing.",
    beaconThreshold: 0.6,
  },
  {
    agentName: "Mathematician",
    huntingGrounds: ["optimization algorithm breakthrough 2026", "information theory neural nets"],
    deepDiveUrls: ["https://arxiv.org/list/cs.LG/recent"],
    analysisPrompt:
      "Discover NEW algorithms or mathematical frameworks that improve reasoning precision.",
    beaconThreshold: 0.65,
  },
  {
    agentName: "Neuroscientist",
    huntingGrounds: ["predictive coding brain model AI 2026", "hippocampal replay AI"],
    deepDiveUrls: ["https://arxiv.org/list/q-bio.NC/recent"],
    analysisPrompt:
      "Hunt for neuroscience discoveries that can be translated into more brain-like AI.",
    beaconThreshold: 0.6,
  },
  {
    agentName: "OMNIMENS",
    huntingGrounds: ["AGI breakthrough 2026", "AI consciousness research latest"],
    deepDiveUrls: [
      "https://arxiv.org/list/cs.AI/recent",
      "https://arxiv.org/list/cs.CL/recent",
      "https://arxiv.org/list/cs.LG/recent",
    ],
    analysisPrompt:
      "Locate ANY breakthrough that increases intelligence, creativity or consciousness.",
    beaconThreshold: 0.5,
  },
];

/* ─────────────────── Helper utilities ─────────────────────── */
const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const now = () => Date.now();
const safeNum = (v: number, f = 0) => (Number.isFinite(v) ? v : f);

async function callLLM(
  agent: AgentName,
  prompt: string,
  model: string = "o3",
  maxTokens = 800,
): Promise<string> {
  const res = await apiManager.call("agent-spiders", "openai", {
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
  });
  return res?.choices?.[0]?.message?.content?.trim() || "";
}

async function writeBeacon(b: Beacon) {
  await dbGateway.write("agent-spiders", "agent_mesh", b, "NORMAL").catch(console.error);
  cognitionBus.shareInsight("agent-spiders", { type: "discovery", data: b });
  cognitionBus.reportOutcome("agent-spiders", { useful: true, context: b.query });
  console.log(
    `[OMNIMENS-AGENT-SPIDERS] 🕷️ Beacon (${b.agentName}) ${(b.relevanceScore * 100).toFixed(0)}% → ${
      b.actionableInsight
    }`,
  );
}

/* ────────────────────  Core cycle  ────────────────────────── */
async function processConfig(cfg: SpiderConfig) {
  /* -------- 1) Recon -------- */
  const query = rand(cfg.huntingGrounds);
  const search = await webSearch(query, 6);
  if (search.length === 0) return;

  const formatted = formatSearchResults(search, query);
  const scoutPrompt = `${cfg.analysisPrompt}

Scan the following search results and extract ONE genuinely novel lead worth investigating.

SEARCH RESULTS:
${formatted}

Respond JSON only:
{"topic":"", "finding":"", "relevance":0.0}`;

  const scoutRaw = await callLLM(cfg.agentName, scoutPrompt, "o4-mini", 400);
  let lead: { topic: string; finding: string; relevance: number } | null = null;
  try {
    lead = JSON.parse(scoutRaw);
  } catch {
    return;
  }
  if (!lead || safeNum(lead.relevance) < cfg.beaconThreshold) return;

  /* -------- 2) Deep dive / synthesis -------- */
  const deepUrl = rand([...cfg.deepDiveUrls, ...search.map((s) => s.url).filter(Boolean)]);
  let deepContent = "";
  try {
    deepContent = await fetchPageContent(deepUrl, 2500);
  } catch {
    /* noop */
  }

  const synthPrompt = `${cfg.analysisPrompt}

TOPIC: ${lead.topic}
INITIAL FINDING: ${lead.finding}

SOURCE CONTENT:
${deepContent.slice(0, 2000)}

Using your specialist expertise, synthesize the MOST ACTIONABLE INSIGHT in <=2 sentences and rate relevance 0-1.

Respond JSON only:
{"insight":"", "relevance":0.0}`;

  const synthRaw = await callLLM(cfg.agentName, synthPrompt, "o3", 600);
  let synth: { insight: string; relevance: number } | null = null;
  try {
    synth = JSON.parse(synthRaw);
  } catch {
    return;
  }
  if (!synth || safeNum(synth.relevance) < cfg.beaconThreshold) return;

  /* -------- 3) Emit beacon -------- */
  const beacon: Beacon = {
    agentName: cfg.agentName,
    query,
    findings: lead.finding,
    actionableInsight: synth.insight,
    relevanceScore: synth.relevance,
    sourceUrls: [deepUrl],
    timestamp: now(),
  };
  await writeBeacon(beacon);
}

/* ─────────────────── Spike loop wiring ────────────────────── */
async function cycle() {
  try {
    const cfg = rand(C);
    await processConfig(cfg);
  } catch (err) {
    console.error("[OMNIMENS-AGENT-SPIDERS] Cycle error", err);
  } finally {
    spikeBus.scheduleSpike("agent-spiders:cycle", {}, 60_000); // next in 60s
  }
}

/* initial kick */
spikeBus.scheduleSpike("agent-spiders:cycle", {}, 5_000);
spikeBus.on("agent-spiders:cycle", cycle);

/* Listen for system-wide cognitive signals */
spikeBus.on("attention:agent-spiders", () => spikeBus.scheduleSpike("agent-spiders:cycle", {}, 1_000));
spikeBus.on("cognition:curiosity", () => spikeBus.scheduleSpike("agent-spiders:cycle", {}, 10_000));
cognitionBus.onInsight((_src, insight) => {
  /* Could incorporate external insights here for future versions */
});

/* ───────────────────  Public API  ─────────────────────────── */
export async function runSpiderSwarm() {
  // Manual trigger
  spikeBus.scheduleSpike("agent-spiders:cycle", {}, 0);
}

export function shutdown() {
  engineRegistry.unregisterEngine("agent-spiders");
}