/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved.  PROPRIETARY AND CONFIDENTIAL.
 * 
 * OMNIMENS SENSORY-CORTEX v2.0 — unified-runtime edition.
 * Lines ‑≈400  (was 724) — same awareness, less noise.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { webSearch, type SearchResult } from "./web-search.js";

/*──────────────────────────── ENGINE REGISTRATION ───────────────────────────*/
engineRegistry.registerEngine("sensory-cortex", "NORMAL", { dbQuota: 10 });

/*─────────────────────────────── TYPES / CONSTS ─────────────────────────────*/
type Channel = "news" | "tech" | "science" | "market" | "social" | "ai_frontier";

interface SensorySignal {
  channel: Channel;
  headline: string;
  significance: number;
  sentiment: number;
  relevanceToOmnimens: number;
  timestamp: number;
  source: "real_search" | "deep_analysis" | "anomaly" | "peripheral";
  url?: string;
  rawSnippet?: string;
  noveltyScore?: number;
  deduplicationKey?: string;
}

interface ChannelState {
  signalCount: number;
  avgSignificance: number;
  lastScanTime: number;
  recentTopics: string[];
  baselineSentiment: number;
  trendDirection: "rising" | "stable" | "falling";
  scanErrorCount: number;
  attentionWeight: number;
}

interface AnomalyEvent {
  signal: SensorySignal;
  reason: string;
  deviationMagnitude: number;
  timestamp: number;
}

export interface SensoryState {
  perceptionCycles: number;
  totalSignalsProcessed: number;
  highSignificanceEvents: number;
  currentWorldState: string;
  recentSignals: SensorySignal[];
  dominantTrend: string;
  worldMood: number;
  lastPerceptionTime: number;
  channels: Record<Channel, ChannelState>;
  layer1Cycles: number;
  layer2Scans: number;
  layer3Analyses: number;
  anomaliesDetected: number;
  recentAnomalies: AnomalyEvent[];
  signalDeduplicationWindow: Map<string, number>;
  trendHistory: Array<{ trend: string; timestamp: number; confidence: number }>;
  crossChannelCorrelations: Array<{ channels: string[]; topic: string; strength: number }>;
  attentionFocus: Channel | "general";
  perceptionUptime: number;
}

const CHANNELS: Channel[] = ["news", "tech", "science", "market", "social", "ai_frontier"];

const CHANNEL_SEARCH_QUERIES: Record<Channel, string[]> = {
  news: [
    "breaking news today world events",
    "latest global headlines today",
    "major world events this week",
  ],
  tech: [
    "latest technology news breakthroughs",
    "tech industry news today startups",
    "new software technology releases 2026",
  ],
  science: [
    "latest science discoveries research",
    "scientific breakthroughs this week",
    "new research papers science findings",
  ],
  market: [
    "stock market news today financial",
    "cryptocurrency bitcoin market today",
    "economy news GDP inflation jobs",
  ],
  social: [
    "trending social media topics today",
    "viral internet culture news",
    "social trends conversations today",
  ],
  ai_frontier: [
    "artificial intelligence AI news breakthroughs",
    "latest AI models LLM research papers",
    "AI industry news OpenAI Anthropic Google DeepMind",
  ],
};

/*─────────────────────────── STATE INITIALISATION ───────────────────────────*/
const state: SensoryState = {
  perceptionCycles: 0,
  totalSignalsProcessed: 0,
  highSignificanceEvents: 0,
  currentWorldState: "initializing...",
  recentSignals: [],
  dominantTrend: "unknown",
  worldMood: 0.5,
  lastPerceptionTime: 0,
  channels: {} as Record<Channel, ChannelState>,
  layer1Cycles: 0,
  layer2Scans: 0,
  layer3Analyses: 0,
  anomaliesDetected: 0,
  recentAnomalies: [],
  signalDeduplicationWindow: new Map(),
  trendHistory: [],
  crossChannelCorrelations: [],
  attentionFocus: "general",
  perceptionUptime: 0,
};

for (const ch of CHANNELS) {
  state.channels[ch] = {
    signalCount: 0,
    avgSignificance: 0,
    lastScanTime: 0,
    recentTopics: [],
    baselineSentiment: 0,
    trendDirection: "stable",
    scanErrorCount: 0,
    attentionWeight: 1,
  };
}
state.channels.ai_frontier.attentionWeight = 1.5;
state.channels.tech.attentionWeight = 1.3;

/*───────────────────────────── UTILITY HELPERS ──────────────────────────────*/
const safeNum = (v: number, fb = 0) => (Number.isFinite(v) ? v : fb);

const stopWords = new Set(
  "the a an is are was were be been being have has had do does did will would could should may might can shall in on at to for of with by from as into through about after before between under above up down out off over no not but and or nor so yet both either neither each every all any few more most some such than too very just also how what which who whom this that these those it its they their them we our us you your he him his she her new says".split(
    " "
  )
);

const extractWords = (txt: string) =>
  txt
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

const dedupKey = (title = "", snippet = "") =>
  extractWords(`${title} ${snippet}`).slice(0, 6).sort().join("|");

const isDup = (k: string) => {
  const t = state.signalDeduplicationWindow.get(k);
  return t ? Date.now() - t < 3_600_000 : false;
};

const markSeen = (k: string) => state.signalDeduplicationWindow.set(k, Date.now());

const cleanDedup = (now: number) => {
  for (const [k, t] of state.signalDeduplicationWindow.entries())
    if (now - t > 7_200_000) state.signalDeduplicationWindow.delete(k);
};

/*───────────────────────── SCORING & DETECTION LOGIC ────────────────────────*/
function scoreSignificance(r: SearchResult, ch: Channel): number {
  let s = 0.4;
  if (/(breaking|urgent|critical|emergency|historic|massive|major|shocking)/i.test(r.title + r.snippet)) s += 0.25;
  if (/(billion|trillion|million|worldwide|global|revolution|disruption|breakthrough)/i.test(r.snippet)) s += 0.15;
  if (r.snippet.length > 200) s += 0.05;
  if (/(reuters|bbc|nature\.com|arxiv)/.test(r.url || "")) s += 0.1;
  return s * state.channels[ch].attentionWeight;
}

const pos = /(success|growth|advance|progress|improve|gain|rise|boost|innovation|optimis|hope|recovery|strong|excellent|breakthrough)/gi;
const neg = /(fail|crash|crisis|decline|loss|drop|fear|threat|risk|warn|danger|collapse|recession|concern|worry|devastating)/gi;
const scoreSentiment = (t = "") => {
  const p = (t.match(pos) || []).length;
  const n = (t.match(neg) || []).length;
  return p + n === 0 ? 0 : (p - n) / (p + n);
};

function scoreRelevance(r: SearchResult, ch: Channel): number {
  let s = 0.3;
  if (/(artificial intelligence|ai|machine learning|neural|deep learning|llm|gpt|agi|consciousness)/i.test(r.title + r.snippet)) s += 0.35;
  if (ch === "ai_frontier") s += 0.2;
  if (ch === "tech") s += 0.1;
  if (/(self-improving|autonomous AI|multi-agent|reasoning engine)/i.test(r.snippet)) s += 0.15;
  return s;
}

function scoreNovelty(r: SearchResult, ch: Channel): number {
  const words = extractWords(r.title);
  const seen = new Set(state.channels[ch].recentTopics);
  const overlap = words.filter((w) => seen.has(w)).length;
  return Math.max(0, 1 - overlap / (words.length || 1));
}

function anomaly(signal: SensorySignal): AnomalyEvent | null {
  const ch = state.channels[signal.channel];
  if (ch.signalCount < 5) return null;

  const sigDev = Math.abs(signal.significance - ch.avgSignificance);
  if (sigDev > 0.35)
    return {
      signal,
      reason: `Significance spike (${sigDev.toFixed(2)})`,
      deviationMagnitude: sigDev,
      timestamp: Date.now(),
    };

  const sentDev = Math.abs(signal.sentiment - ch.baselineSentiment);
  if (sentDev > 0.5)
    return {
      signal,
      reason: `Sentiment swing (${sentDev.toFixed(2)})`,
      deviationMagnitude: sentDev,
      timestamp: Date.now(),
    };

  if ((signal.noveltyScore ?? 0) > 0.85)
    return {
      signal,
      reason: "High novelty",
      deviationMagnitude: signal.noveltyScore ?? 0.9,
      timestamp: Date.now(),
    };
  return null;
}

/*──────────────────────────── SIGNAL INGESTION ──────────────────────────────*/
function ingest(signal: SensorySignal) {
  state.recentSignals.push(signal);
  state.totalSignalsProcessed++;

  const ch = state.channels[signal.channel];
  ch.signalCount++;
  ch.avgSignificance = ch.avgSignificance * 0.85 + signal.significance * 0.15;
  ch.baselineSentiment = ch.baselineSentiment * 0.9 + signal.sentiment * 0.1;
  ch.recentTopics = [...ch.recentTopics, ...extractWords(signal.headline)].slice(-30);

  if (signal.significance >= 0.7) state.highSignificanceEvents++;

  const evt = anomaly(signal);
  if (evt) {
    state.anomaliesDetected++;
    state.recentAnomalies.push(evt);
    state.recentAnomalies = state.recentAnomalies.slice(-30);
    cognitionBus.shareInsight("sensory-cortex", { type: "anomaly", data: evt });
    if (evt.deviationMagnitude > 0.5) ch.attentionWeight += 0.15;
  }

  if (signal.relevanceToOmnimens >= 0.65 && signal.significance >= 0.55)
    dbGateway.write(
      "sensory-cortex",
      "brain_entries",
      {
        category: "sensory_perception",
        title: `[${signal.channel.toUpperCase()}] ${signal.headline.slice(0, 60)}`,
        content: JSON.stringify(signal),
        confidence: signal.significance,
        active: true,
      },
      "NORMAL"
    );

  cognitionBus.reportOutcome("sensory-cortex", { useful: true, context: signal.channel });
}

/*────────────────────────────── LAYER ROUTINES ──────────────────────────────*/
function peripheralAwareness() {
  state.layer1Cycles++;
  const now = Date.now();
  cleanDedup(now);

  for (const ch of CHANNELS) {
    const cs = state.channels[ch];
    const mins = (now - cs.lastScanTime) / 60_000;
    if (mins > 10) cs.attentionWeight += 0.05;
    if (cs.scanErrorCount > 3) cs.attentionWeight = Math.max(0.3, cs.attentionWeight * 0.9);
  }

  state.recentSignals = state.recentSignals.slice(-200);
  state.perceptionUptime = now - startTime;

  spikeBus.scheduleSpike("sensory-cortex:peripheral", {}, 20_000);
}

async function activeScan() {
  state.layer2Scans++;
  const channel = CHANNELS.sort(
    (a, b) => state.channels[b].attentionWeight - state.channels[a].attentionWeight
  )[state.layer2Scans % CHANNELS.length];

  const chState = state.channels[channel];
  const queries = CHANNEL_SEARCH_QUERIES[channel];
  const query = queries[chState.signalCount % queries.length];

  try {
    const results = await webSearch(query, 6);
    if (results.length === 0) chState.scanErrorCount++;

    for (const r of results) {
      const key = dedupKey(r.title, r.snippet);
      if (isDup(key)) continue;
      markSeen(key);

      const sig: SensorySignal = {
        channel,
        headline: r.title.slice(0, 200),
        significance: scoreSignificance(r, channel),
        sentiment: scoreSentiment(r.snippet),
        relevanceToOmnimens: scoreRelevance(r, channel),
        noveltyScore: scoreNovelty(r, channel),
        timestamp: Date.now(),
        source: "real_search",
        url: r.url,
        rawSnippet: r.snippet.slice(0, 500),
        deduplicationKey: key,
      };
      ingest(sig);
    }
  } catch (e) {
    chState.scanErrorCount++;
    console.error("[OMNIMENS-SENSORY-CORTEX] Active scan error:", e);
  }

  spikeBus.scheduleSpike("sensory-cortex:active-scan", {}, 15_000);
}

async function deepAnalysis() {
  state.layer3Analyses++;
  state.perceptionCycles++;
  state.lastPerceptionTime = Date.now();

  const windowSignals = state.recentSignals
    .filter((s) => s.timestamp > Date.now() - 600_000)
    .sort((a, b) => b.significance - a.significance)
    .slice(0, 30);
  if (windowSignals.length < 3) {
    spikeBus.scheduleSpike("sensory-cortex:deep-analysis", {}, 300_000);
    return;
  }

  const summary = windowSignals
    .map(
      (s) =>
        `[${s.channel}] ${s.headline} (sig:${s.significance.toFixed(
          2
        )}, sent:${s.sentiment.toFixed(2)}, nov:${(s.noveltyScore ?? 0).toFixed(2)})`
    )
    .join("\n");

  const anomaliesTxt = state.recentAnomalies
    .slice(-5)
    .map((a) => `ANOMALY: ${a.signal.headline} — ${a.reason}`)
    .join("\n");

  try {
    const { data } = await apiManager.call("sensory-cortex", "openai", {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are the DEEP ANALYSIS LAYER of OMNIMENS's Sensory Cortex. Synthesize signals.",
        },
        {
          role: "user",
          content: `Signals:\n${summary}\n${anomaliesTxt}`,
        },
      ],
      max_tokens: 600,
      temperature: 0.3,
    });

    const txt: string = data.choices?.[0]?.message?.content ?? "";
    if (txt.length < 50) throw new Error("Empty synthesis");

    const get = (label: string, def = ""): string =>
      (txt.match(new RegExp(`${label}:\\s*([\\s\\S]+?)(?:\\n[A-Z_]+:|$)`, "i")) || [])[1]?.trim() ||
      def;

    state.currentWorldState = get("WORLD_STATE", state.currentWorldState).slice(0, 400);
    const trend = get("DOMINANT_TREND", state.dominantTrend).slice(0, 120);
    if (trend) {
      state.dominantTrend = trend;
      state.trendHistory.push({
        trend,
        timestamp: Date.now(),
        confidence: safeNum(parseFloat(get("WORLD_MOOD", "0.5")), 0.5),
      });
      state.trendHistory = state.trendHistory.slice(-100);
    }
    state.worldMood = safeNum(parseFloat(get("WORLD_MOOD", state.worldMood.toString())), state.worldMood);

    const attn = get("ATTENTION_RECOMMENDATION").toLowerCase();
    for (const ch of CHANNELS)
      if (attn.includes(ch.replace("_", " ")) || attn.includes(ch))
        state.attentionFocus = ch;

    console.log(
      `[OMNIMENS-SENSORY-CORTEX] DeepAnalysis#${state.layer3Analyses} mood=${(
        state.worldMood * 100
      ).toFixed(0)}% trend:${state.dominantTrend}`
    );

    cognitionBus.shareInsight("sensory-cortex", { type: "deep_analysis", data: txt });
  } catch (e) {
    console.error("[OMNIMENS-SENSORY-CORTEX] Deep analysis error:", e);
  }

  spikeBus.scheduleSpike("sensory-cortex:deep-analysis", {}, 300_000);
}

/*─────────────────────────── EXTERNAL INTERFACES ───────────────────────────*/
export const getSensoryState = (): SensoryState => ({
  ...state,
  signalDeduplicationWindow: new Map(),
});
export const getRecentSignals = (n = 20) => state.recentSignals.slice(-n);
export const getAnomalies = (n = 10) => state.recentAnomalies.slice(-n);
export const getTrendHistory = (n = 20) => state.trendHistory.slice(-n);
export const getCrossChannelCorrelations = () => state.crossChannelCorrelations;
export const getAttentionFocus = () => ({
  channel: state.attentionFocus,
  weight: state.channels[state.attentionFocus as Channel]?.attentionWeight ?? 1,
});

/*───────────────────────── SPIKE SUBSCRIPTIONS ─────────────────────────────*/
spikeBus.on("sensory-cortex:peripheral", peripheralAwareness);
spikeBus.on("sensory-cortex:active-scan", () => activeScan());
spikeBus.on("sensory-cortex:deep-analysis", () => deepAnalysis());

spikeBus.on("attention:sensory-cortex", () => {
  for (const ch of CHANNELS) state.channels[ch].attentionWeight *= 1.1;
});

spikeBus.on("cognition:curiosity", () => {
  // temporarily boost less-attended channels
  const minWeight = Math.min(...CHANNELS.map((c) => state.channels[c].attentionWeight));
  for (const ch of CHANNELS)
    if (state.channels[ch].attentionWeight === minWeight) state.channels[ch].attentionWeight += 0.3;
});

cognitionBus.onInsight((src, insight) => {
  if (src !== "sensory-cortex" && insight.type === "discovery")
    state.channels.ai_frontier.attentionWeight += 0.1;
});

/*──────────────────────────── ENGINE STARTUP ───────────────────────────────*/
let _started = false;
let startTime = Date.now();

export function startSensoryCortex() {
  if (_started) return;
  _started = true;
  startTime = Date.now();
  console.log("[OMNIMENS-SENSORY-CORTEX] 👁️  Continuous perception online");

  spikeBus.scheduleSpike("sensory-cortex:peripheral", {}, 0);
  spikeBus.scheduleSpike("sensory-cortex:active-scan", {}, 10_000);
  spikeBus.scheduleSpike("sensory-cortex:deep-analysis", {}, 180_000);
}

/*───────────────────────────── SHUTDOWN HOOK ───────────────────────────────*/
export function shutdown() {
  engineRegistry.unregisterEngine("sensory-cortex");
}