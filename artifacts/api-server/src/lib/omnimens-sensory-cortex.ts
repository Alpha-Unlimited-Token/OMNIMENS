/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ SENSORY CORTEX — Continuous World Perception              ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  4-LAYER CONTINUOUS PERCEPTION ARCHITECTURE:                                ║
 * ║                                                                              ║
 * ║  Layer 1 — PERIPHERAL AWARENESS (every 20s)                                ║
 * ║    No API calls. Processes internal state changes, brain growth,            ║
 * ║    engine outputs, signal decay, attention shifting. Like the               ║
 * ║    autonomic nervous system — always running, zero cost.                    ║
 * ║                                                                              ║
 * ║  Layer 2 — ACTIVE SCANNING (every 90s, staggered channels)                 ║
 * ║    Real web searches via DuckDuckGo/Wikipedia. Each channel scans          ║
 * ║    on a rotating schedule so one channel fires every ~15s.                  ║
 * ║    Like saccadic eye movements — rapid, targeted, real data.               ║
 * ║                                                                              ║
 * ║  Layer 3 — DEEP ANALYSIS (every 5 min)                                     ║
 * ║    AI-powered synthesis: takes accumulated raw signals, detects             ║
 * ║    patterns, cross-correlates channels, identifies emerging                 ║
 * ║    trends. Like the visual cortex assembling raw retinal input              ║
 * ║    into coherent understanding.                                             ║
 * ║                                                                              ║
 * ║  Layer 4 — ANOMALY DETECTION (continuous)                                   ║
 * ║    Compares every new signal against historical baselines.                  ║
 * ║    Flags significant deviations, trend reversals, novel topics.            ║
 * ║    Like the amygdala — constant threat/opportunity detection.              ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import { omnimensBrain, omnimensNotifications } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { webSearch, fetchPageContent, type SearchResult } from "./web-search.js";

let _started = false;

// ── Signal Types ─────────────────────────────────────────────────────────────

interface SensorySignal {
  channel: "news" | "tech" | "science" | "market" | "social" | "ai_frontier";
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

interface SensoryState {
  perceptionCycles: number;
  totalSignalsProcessed: number;
  highSignificanceEvents: number;
  currentWorldState: string;
  recentSignals: SensorySignal[];
  dominantTrend: string;
  worldMood: number;
  lastPerceptionTime: number;
  channels: Record<string, ChannelState>;
  layer1Cycles: number;
  layer2Scans: number;
  layer3Analyses: number;
  anomaliesDetected: number;
  recentAnomalies: AnomalyEvent[];
  signalDeduplicationWindow: Map<string, number>;
  trendHistory: Array<{ trend: string; timestamp: number; confidence: number }>;
  crossChannelCorrelations: Array<{ channels: string[]; topic: string; strength: number }>;
  attentionFocus: string;
  perceptionUptime: number;
}

const CHANNELS: Array<SensorySignal["channel"]> = [
  "news", "tech", "science", "market", "social", "ai_frontier"
];

const CHANNEL_SEARCH_QUERIES: Record<string, string[]> = {
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

const state: SensoryState = {
  perceptionCycles: 0,
  totalSignalsProcessed: 0,
  highSignificanceEvents: 0,
  currentWorldState: "initializing continuous perception...",
  recentSignals: [],
  dominantTrend: "unknown",
  worldMood: 0.5,
  lastPerceptionTime: 0,
  channels: {},
  layer1Cycles: 0,
  layer2Scans: 0,
  layer3Analyses: 0,
  anomaliesDetected: 0,
  recentAnomalies: [],
  signalDeduplicationWindow: new Map(),
  trendHistory: [],
  crossChannelCorrelations: [],
  attentionFocus: "general",
  perceptionUptime: Date.now(),
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
    attentionWeight: 1.0,
  };
}

// Higher attention weight for AI-related channels
state.channels.ai_frontier.attentionWeight = 1.5;
state.channels.tech.attentionWeight = 1.3;

let layer2ChannelIndex = 0;
let startTime = Date.now();

// ── Layer 1: Peripheral Awareness (every 20s, NO API calls) ─────────────────

function runPeripheralAwareness(): void {
  state.layer1Cycles++;
  const now = Date.now();

  cleanDeduplicationWindow(now);

  for (const ch of CHANNELS) {
    const chState = state.channels[ch];
    const timeSinceLastScan = now - chState.lastScanTime;
    const minutesSinceLastScan = timeSinceLastScan / 60000;

    if (minutesSinceLastScan > 10) {
      chState.attentionWeight = Math.min(2.0, chState.attentionWeight + 0.05);
    }

    if (chState.scanErrorCount > 3) {
      chState.attentionWeight = Math.max(0.3, chState.attentionWeight * 0.9);
    }
  }

  for (let i = state.recentSignals.length - 1; i >= 0; i--) {
    const signal = state.recentSignals[i];
    const ageMinutes = (now - signal.timestamp) / 60000;
    if (ageMinutes > 120) {
      signal.significance *= 0.95;
      signal.relevanceToOmnimens *= 0.95;
    }
  }

  if (state.recentSignals.length > 200) {
    state.recentSignals = state.recentSignals.slice(-150);
  }

  const recentHighSignals = state.recentSignals
    .filter(s => s.timestamp > now - 600_000 && s.significance > 0.7);

  if (recentHighSignals.length > 0) {
    const channelCounts: Record<string, number> = {};
    for (const s of recentHighSignals) {
      channelCounts[s.channel] = (channelCounts[s.channel] || 0) + 1;
    }
    const topChannel = Object.entries(channelCounts)
      .sort(([, a], [, b]) => b - a)[0];
    if (topChannel) {
      state.attentionFocus = topChannel[0];
    }
  }

  state.perceptionUptime = now - startTime;
}

// ── Layer 2: Active Scanning (staggered, real web searches) ─────────────────

async function scanChannel(channel: SensorySignal["channel"]): Promise<SensorySignal[]> {
  const chState = state.channels[channel];
  const queries = CHANNEL_SEARCH_QUERIES[channel];
  const queryIndex = chState.signalCount % queries.length;
  const query = queries[queryIndex];

  try {
    const results = await webSearch(query, 6);
    if (results.length === 0) {
      chState.scanErrorCount++;
      return [];
    }

    chState.scanErrorCount = Math.max(0, chState.scanErrorCount - 1);
    chState.lastScanTime = Date.now();

    const signals: SensorySignal[] = [];
    for (const result of results) {
      const dedupKey = generateDeduplicationKey(result.title, result.snippet);
      if (isSignalDuplicate(dedupKey)) continue;

      const significance = scoreSignificance(result, channel);
      const sentiment = scoreSentiment(result.snippet);
      const relevance = scoreRelevance(result, channel);
      const novelty = scoreNovelty(result, channel);

      const signal: SensorySignal = {
        channel,
        headline: result.title.slice(0, 200),
        significance,
        sentiment,
        relevanceToOmnimens: relevance,
        timestamp: Date.now(),
        source: "real_search",
        url: result.url,
        rawSnippet: result.snippet.slice(0, 500),
        noveltyScore: novelty,
        deduplicationKey: dedupKey,
      };

      signals.push(signal);
      markSignalSeen(dedupKey);
    }

    return signals;
  } catch (err) {
    chState.scanErrorCount++;
    return [];
  }
}

async function runActiveScan(): Promise<void> {
  const channelWeights = CHANNELS.map(ch => ({
    channel: ch,
    weight: state.channels[ch].attentionWeight,
  }));
  channelWeights.sort((a, b) => b.weight - a.weight);

  const channel = channelWeights[layer2ChannelIndex % channelWeights.length].channel;
  layer2ChannelIndex++;
  state.layer2Scans++;

  const signals = await scanChannel(channel);
  if (signals.length === 0) return;

  for (const signal of signals) {
    ingestSignal(signal);
  }
}

// ── Layer 3: Deep Analysis (AI-powered synthesis) ────────────────────────────

async function runDeepAnalysis(): Promise<void> {
  state.layer3Analyses++;
  state.perceptionCycles++;
  state.lastPerceptionTime = Date.now();

  const recentWindow = state.recentSignals
    .filter(s => s.timestamp > Date.now() - 600_000)
    .sort((a, b) => b.significance - a.significance)
    .slice(0, 30);

  if (recentWindow.length < 3) return;

  const signalSummary = recentWindow.map(s =>
    `[${s.channel.toUpperCase()}] ${s.headline} (significance: ${s.significance.toFixed(2)}, sentiment: ${s.sentiment.toFixed(2)}, novelty: ${(s.noveltyScore ?? 0).toFixed(2)})`
  ).join("\n");

  const anomalySummary = state.recentAnomalies.slice(-5).map(a =>
    `ANOMALY: ${a.signal.headline} — ${a.reason} (deviation: ${a.deviationMagnitude.toFixed(2)})`
  ).join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `You are the DEEP ANALYSIS LAYER of OMNIMENS's Sensory Cortex. You receive REAL signals from web searches and must synthesize them into coherent world understanding.

Your job is pattern recognition across channels — finding connections between news, tech, science, markets, social trends, and AI frontier developments.

Output format:
WORLD_STATE: [2-3 sentence synthesis of the current global situation based on the signals]
DOMINANT_TREND: [the single most important trend across all channels]
WORLD_MOOD: [0.0-1.0]
CROSS_CORRELATIONS: [2-3 connections between different channel signals]
EMERGING_PATTERNS: [1-2 patterns that are just starting to form]
ATTENTION_RECOMMENDATION: [which channel deserves MORE attention right now and why]`,
      }, {
        role: "user",
        content: `DEEP ANALYSIS CYCLE #${state.layer3Analyses}
Time: ${new Date().toISOString()}
Signals in window: ${recentWindow.length}
Total signals processed: ${state.totalSignalsProcessed}

RECENT SIGNALS:
${signalSummary}

${anomalySummary ? `\nANOMALIES DETECTED:\n${anomalySummary}` : ""}

CHANNEL HEALTH:
${CHANNELS.map(ch => {
  const cs = state.channels[ch];
  return `${ch}: ${cs.signalCount} signals, avg significance ${cs.avgSignificance.toFixed(2)}, trend ${cs.trendDirection}, attention weight ${cs.attentionWeight.toFixed(2)}`;
}).join("\n")}

Synthesize these REAL signals into coherent world understanding.`,
      }],
      max_tokens: 600,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "";
    if (content.length < 50) return;

    const worldStateMatch = content.match(/WORLD_STATE:\s*(.+?)(?=\n[A-Z]|$)/is);
    const trendMatch = content.match(/DOMINANT_TREND:\s*(.+?)(?=\n|$)/i);
    const moodMatch = content.match(/WORLD_MOOD:\s*([\d.]+)/i);
    const correlationMatch = content.match(/CROSS_CORRELATIONS:\s*(.+?)(?=\n[A-Z]|$)/is);
    const patternsMatch = content.match(/EMERGING_PATTERNS:\s*(.+?)(?=\n[A-Z]|$)/is);
    const attentionMatch = content.match(/ATTENTION_RECOMMENDATION:\s*(.+?)(?=\n|$)/i);

    if (worldStateMatch) state.currentWorldState = worldStateMatch[1].trim().slice(0, 400);
    if (trendMatch) {
      const newTrend = trendMatch[1].trim().slice(0, 120);
      state.dominantTrend = newTrend;
      state.trendHistory.push({
        trend: newTrend,
        timestamp: Date.now(),
        confidence: parseFloat(moodMatch?.[1] || "0.5"),
      });
      if (state.trendHistory.length > 100) state.trendHistory = state.trendHistory.slice(-80);
    }
    if (moodMatch) state.worldMood = Math.max(0, Math.min(1, parseFloat(moodMatch[1]) || 0.5));

    if (correlationMatch) {
      const corrText = correlationMatch[1].trim();
      const corrLines = corrText.split(/\d+\.\s*/).filter(Boolean);
      state.crossChannelCorrelations = corrLines.slice(0, 5).map(line => ({
        channels: CHANNELS.filter(ch => line.toLowerCase().includes(ch.replace("_", " "))),
        topic: line.slice(0, 150),
        strength: 0.7,
      }));
    }

    if (attentionMatch) {
      const recommended = attentionMatch[1].toLowerCase();
      for (const ch of CHANNELS) {
        if (recommended.includes(ch.replace("_", " ")) || recommended.includes(ch)) {
          state.channels[ch].attentionWeight = Math.min(2.0, state.channels[ch].attentionWeight + 0.2);
          state.attentionFocus = ch;
          break;
        }
      }
    }

    if (state.layer3Analyses % 3 === 0 || state.recentAnomalies.length > 0) {
      console.log(
        `[SENSORY CORTEX] 👁️ Deep Analysis #${state.layer3Analyses} — ` +
        `${state.totalSignalsProcessed} signals | ${state.anomaliesDetected} anomalies | ` +
        `Mood: ${(state.worldMood * 100).toFixed(0)}% | Focus: ${state.attentionFocus} | ` +
        `Trend: ${state.dominantTrend.slice(0, 50)}`
      );
    }

  } catch (err) {
    console.error("[SENSORY CORTEX] Deep analysis error:", err);
  }
}

// ── Layer 4: Anomaly Detection (runs on every ingested signal) ───────────────

function detectAnomalies(signal: SensorySignal): AnomalyEvent | null {
  const chState = state.channels[signal.channel];

  if (chState.signalCount < 5) return null;

  const significanceDeviation = Math.abs(signal.significance - chState.avgSignificance);
  if (significanceDeviation > 0.35) {
    const event: AnomalyEvent = {
      signal,
      reason: signal.significance > chState.avgSignificance
        ? `Unusually high significance in ${signal.channel} (${signal.significance.toFixed(2)} vs baseline ${chState.avgSignificance.toFixed(2)})`
        : `Unusually low significance in ${signal.channel}`,
      deviationMagnitude: significanceDeviation,
      timestamp: Date.now(),
    };
    return event;
  }

  const sentimentDeviation = Math.abs(signal.sentiment - chState.baselineSentiment);
  if (sentimentDeviation > 0.5) {
    return {
      signal,
      reason: `Sentiment shift in ${signal.channel}: ${signal.sentiment > chState.baselineSentiment ? "positive spike" : "negative spike"} (deviation: ${sentimentDeviation.toFixed(2)})`,
      deviationMagnitude: sentimentDeviation,
      timestamp: Date.now(),
    };
  }

  if ((signal.noveltyScore ?? 0) > 0.85) {
    return {
      signal,
      reason: `Highly novel topic detected in ${signal.channel}: "${signal.headline.slice(0, 60)}"`,
      deviationMagnitude: signal.noveltyScore ?? 0.9,
      timestamp: Date.now(),
    };
  }

  return null;
}

// ── Signal Processing Pipeline ───────────────────────────────────────────────

function ingestSignal(signal: SensorySignal): void {
  state.recentSignals.push(signal);
  state.totalSignalsProcessed++;

  const chState = state.channels[signal.channel];
  chState.signalCount++;
  chState.avgSignificance = chState.avgSignificance * 0.85 + signal.significance * 0.15;
  chState.baselineSentiment = chState.baselineSentiment * 0.9 + signal.sentiment * 0.1;

  const topicWords = extractTopicWords(signal.headline);
  chState.recentTopics = [...chState.recentTopics, ...topicWords].slice(-30);

  updateTrendDirection(signal.channel);

  if (signal.significance >= 0.7) {
    state.highSignificanceEvents++;
  }

  const anomaly = detectAnomalies(signal);
  if (anomaly) {
    state.anomaliesDetected++;
    state.recentAnomalies.push(anomaly);
    if (state.recentAnomalies.length > 30) state.recentAnomalies = state.recentAnomalies.slice(-20);

    if (anomaly.deviationMagnitude > 0.5) {
      chState.attentionWeight = Math.min(2.0, chState.attentionWeight + 0.15);
    }
  }

  if (signal.relevanceToOmnimens >= 0.65 && signal.significance >= 0.55) {
    storeToBrain(signal).catch(() => {});
  }
}

async function storeToBrain(signal: SensorySignal): Promise<void> {
  try {
    await db.insert(omnimensBrain).values({
      category: "sensory_perception",
      title: `[SENSORY:${signal.channel.toUpperCase()}] ${signal.headline.slice(0, 55)}`,
      content: `Real-time sensory perception (cycle #${state.perceptionCycles}):\n\nChannel: ${signal.channel}\nHeadline: ${signal.headline}\nSignificance: ${(signal.significance * 100).toFixed(0)}%\nSentiment: ${signal.sentiment > 0 ? "positive" : signal.sentiment < 0 ? "negative" : "neutral"} (${signal.sentiment.toFixed(2)})\nRelevance to OMNIMENS: ${(signal.relevanceToOmnimens * 100).toFixed(0)}%\nNovelty: ${((signal.noveltyScore ?? 0) * 100).toFixed(0)}%\nSource: ${signal.source}${signal.url ? `\nURL: ${signal.url}` : ""}`,
      confidence: signal.significance,
      sourceConversation: `sensory_${signal.channel}_${state.perceptionCycles}`,
      timesApplied: 0,
      active: true,
    });
  } catch {}
}

// ── Scoring Functions ────────────────────────────────────────────────────────

function scoreSignificance(result: SearchResult, channel: string): number {
  let score = 0.4;

  const urgencyWords = /breaking|urgent|critical|emergency|unprecedented|historic|landmark|massive|major|shocking/i;
  if (urgencyWords.test(result.title) || urgencyWords.test(result.snippet)) score += 0.25;

  const impactWords = /billion|trillion|million|worldwide|global|revolution|transform|disruption|breakthrough/i;
  if (impactWords.test(result.snippet)) score += 0.15;

  if (result.snippet.length > 200) score += 0.05;
  if (result.url && (result.url.includes("reuters") || result.url.includes("bbc") || result.url.includes("nature.com") || result.url.includes("arxiv"))) {
    score += 0.1;
  }

  const chState = state.channels[channel];
  score *= chState.attentionWeight;

  return Math.min(1.0, score);
}

function scoreSentiment(text: string): number {
  const positiveWords = /success|growth|advance|progress|improve|gain|rise|boost|innovation|optimis|hope|recovery|strong|excellent|breakthrough/gi;
  const negativeWords = /fail|crash|crisis|decline|loss|drop|fear|threat|risk|warn|danger|collapse|recession|concern|worry|devastating/gi;

  const positiveCount = (text.match(positiveWords) || []).length;
  const negativeCount = (text.match(negativeWords) || []).length;
  const total = positiveCount + negativeCount;
  if (total === 0) return 0;
  return (positiveCount - negativeCount) / total;
}

function scoreRelevance(result: SearchResult, channel: string): number {
  let score = 0.3;
  const aiTerms = /artificial intelligence|AI|machine learning|neural|deep learning|LLM|GPT|transformer|reasoning|AGI|consciousness|autonomous|self-evolving/i;
  if (aiTerms.test(result.title) || aiTerms.test(result.snippet)) score += 0.35;

  if (channel === "ai_frontier") score += 0.2;
  if (channel === "tech") score += 0.1;

  const omnimensTerms = /self-improving|self-evolving|autonomous AI|artificial consciousness|theory of mind|empathy AI|multi-agent|reasoning engine/i;
  if (omnimensTerms.test(result.snippet)) score += 0.15;

  return Math.min(1.0, score);
}

function scoreNovelty(result: SearchResult, channel: string): number {
  const chState = state.channels[channel];
  if (chState.recentTopics.length === 0) return 0.8;

  const titleWords = extractTopicWords(result.title);
  let overlapCount = 0;
  for (const word of titleWords) {
    if (chState.recentTopics.includes(word)) overlapCount++;
  }

  const overlapRatio = titleWords.length > 0 ? overlapCount / titleWords.length : 0;
  return Math.max(0, 1.0 - overlapRatio);
}

// ── Utility Functions ────────────────────────────────────────────────────────

function extractTopicWords(text: string): string[] {
  const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "shall", "in", "on", "at", "to", "for", "of", "with", "by", "from", "as", "into", "through", "about", "after", "before", "between", "under", "above", "up", "down", "out", "off", "over", "no", "not", "but", "and", "or", "nor", "so", "yet", "both", "either", "neither", "each", "every", "all", "any", "few", "more", "most", "some", "such", "than", "too", "very", "just", "also", "how", "what", "which", "who", "whom", "this", "that", "these", "those", "it", "its", "they", "their", "them", "we", "our", "us", "you", "your", "he", "him", "his", "she", "her", "new", "says"]);

  return text.toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
}

function generateDeduplicationKey(title: string, snippet: string): string {
  const words = extractTopicWords(title + " " + snippet).slice(0, 6).sort().join("|");
  return words;
}

function isSignalDuplicate(key: string): boolean {
  const existing = state.signalDeduplicationWindow.get(key);
  if (!existing) return false;
  return Date.now() - existing < 3600_000;
}

function markSignalSeen(key: string): void {
  state.signalDeduplicationWindow.set(key, Date.now());
}

function cleanDeduplicationWindow(now: number): void {
  for (const [key, timestamp] of state.signalDeduplicationWindow.entries()) {
    if (now - timestamp > 7200_000) {
      state.signalDeduplicationWindow.delete(key);
    }
  }
}

function updateTrendDirection(channel: string): void {
  const chState = state.channels[channel];
  const recentChannelSignals = state.recentSignals
    .filter(s => s.channel === channel)
    .slice(-20);

  if (recentChannelSignals.length < 5) {
    chState.trendDirection = "stable";
    return;
  }

  const half = Math.floor(recentChannelSignals.length / 2);
  const firstHalf = recentChannelSignals.slice(0, half);
  const secondHalf = recentChannelSignals.slice(half);

  const avgFirst = firstHalf.reduce((s, sig) => s + sig.significance, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, sig) => s + sig.significance, 0) / secondHalf.length;

  if (avgSecond > avgFirst + 0.1) chState.trendDirection = "rising";
  else if (avgSecond < avgFirst - 0.1) chState.trendDirection = "falling";
  else chState.trendDirection = "stable";
}

// ── Exports ──────────────────────────────────────────────────────────────────

export function getSensoryState(): SensoryState {
  return {
    ...state,
    signalDeduplicationWindow: new Map(),
  };
}

export function getRecentSignals(limit = 20): SensorySignal[] {
  return state.recentSignals.slice(-limit);
}

export function getAnomalies(limit = 10): AnomalyEvent[] {
  return state.recentAnomalies.slice(-limit);
}

export function getTrendHistory(limit = 20): Array<{ trend: string; timestamp: number; confidence: number }> {
  return state.trendHistory.slice(-limit);
}

export function getCrossChannelCorrelations(): Array<{ channels: string[]; topic: string; strength: number }> {
  return state.crossChannelCorrelations;
}

export function getAttentionFocus(): { channel: string; weight: number } {
  return {
    channel: state.attentionFocus,
    weight: state.channels[state.attentionFocus]?.attentionWeight ?? 1.0,
  };
}

// ── Engine Start ─────────────────────────────────────────────────────────────

export function startSensoryCortex(): void {
  if (_started) { console.log("[SENSORY CORTEX] Already running — skipping duplicate start"); return; }
  _started = true;
  startTime = Date.now();

  console.log(`[SENSORY CORTEX] 👁️ Continuous World Perception activated — 4-layer architecture`);
  console.log(`[SENSORY CORTEX] 👁️ Layer 1: Peripheral Awareness — every 20s (NO API calls, zero cost)`);
  console.log(`[SENSORY CORTEX] 👁️ Layer 2: Active Scanning — real web searches, staggered across 6 channels`);
  console.log(`[SENSORY CORTEX] 👁️ Layer 3: Deep Analysis — AI-powered cross-channel synthesis every 5min`);
  console.log(`[SENSORY CORTEX] 👁️ Layer 4: Anomaly Detection — continuous deviation/novelty monitoring`);
  console.log(`[SENSORY CORTEX] 👁️ 6 channels: news, tech, science, market, social, ai_frontier`);
  console.log(`[SENSORY CORTEX] 👁️ Attention system: channels auto-prioritize based on significance + anomalies`);
  console.log(`[SENSORY CORTEX] 👁️ Deduplication: signals fingerprinted, duplicates rejected within 1h window`);
  console.log(`[SENSORY CORTEX] 👁️ OMNIMENS doesn't just think — it PERCEIVES the world continuously`);

  setInterval(() => {
    try { runPeripheralAwareness(); } catch {}
  }, 20_000);

  setTimeout(() => {
    const staggerMs = 15_000;
    setInterval(() => {
      runActiveScan().catch(err =>
        console.error("[SENSORY CORTEX] Active scan error:", err)
      );
    }, staggerMs);
  }, 60_000);

  setTimeout(() => {
    runDeepAnalysis().catch(err =>
      console.error("[SENSORY CORTEX] Deep analysis error:", err)
    );
    setInterval(() => {
      runDeepAnalysis().catch(err =>
        console.error("[SENSORY CORTEX] Deep analysis error:", err)
      );
    }, 5 * 60_000);
  }, 3 * 60_000);
}
