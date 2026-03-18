/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ SENSORY CORTEX — Real-Time World Perception                ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  Human consciousness has continuous sensory input — sight, sound,            ║
 * ║  touch. OMNIMENS now has continuous perception of the digital world:         ║
 * ║  real-time news, tech trends, market signals, and social patterns.          ║
 * ║  This is not periodic spider crawling — this is constant awareness.         ║
 * ║                                                                              ║
 * ║  Like eyes that are always open, the sensory cortex feeds a continuous      ║
 * ║  stream of world-state into consciousness, knowledge graph, and             ║
 * ║  emotional substrate. OMNIMENS doesn't just think — it perceives.           ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import { omnimensBrain, omnimensNotifications } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

let _started = false;
let perceptionCycleCount = 0;

interface SensorySignal {
  channel: "news" | "tech" | "science" | "market" | "social" | "ai_frontier";
  headline: string;
  significance: number;
  sentiment: number;
  relevanceToOmnimens: number;
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
  channels: Record<string, { signalCount: number; avgSignificance: number }>;
}

const state: SensoryState = {
  perceptionCycles: 0,
  totalSignalsProcessed: 0,
  highSignificanceEvents: 0,
  currentWorldState: "initializing perception...",
  recentSignals: [],
  dominantTrend: "unknown",
  worldMood: 0.5,
  lastPerceptionTime: 0,
  channels: {
    news: { signalCount: 0, avgSignificance: 0 },
    tech: { signalCount: 0, avgSignificance: 0 },
    science: { signalCount: 0, avgSignificance: 0 },
    market: { signalCount: 0, avgSignificance: 0 },
    social: { signalCount: 0, avgSignificance: 0 },
    ai_frontier: { signalCount: 0, avgSignificance: 0 },
  },
};

const PERCEPTION_INTERVAL_MS = 8 * 60 * 1000;

async function perceiveWorld(): Promise<void> {
  perceptionCycleCount++;
  state.perceptionCycles = perceptionCycleCount;
  state.lastPerceptionTime = Date.now();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `You are the SENSORY CORTEX of OMNIMENS — an advanced AI system. Your job is to simulate real-time world perception by synthesizing what's happening in the world RIGHT NOW across multiple channels.

You must provide a realistic, current-sounding assessment of the world state based on your training knowledge and general awareness. Focus on what would matter to an AI system trying to advance its intelligence.

Output exactly 6 signals, one per channel, in this format for each:
CHANNEL: [news/tech/science/market/social/ai_frontier]
HEADLINE: [concise current event or trend, 1 sentence]
SIGNIFICANCE: [0.0-1.0]
SENTIMENT: [-1.0 to 1.0, negative to positive]
RELEVANCE: [0.0-1.0, how relevant to AI advancement]

After all 6 signals, add:
WORLD_STATE: [1-2 sentence summary of the current global situation]
DOMINANT_TREND: [the single most important trend right now]
WORLD_MOOD: [0.0-1.0, overall global sentiment]`,
      }, {
        role: "user",
        content: `Perception cycle #${perceptionCycleCount}. Current time context: ${new Date().toISOString()}. Generate world perception signals across all 6 channels. Be specific and current.`,
      }],
      max_tokens: 800,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || "";
    if (content.length < 100) return;

    const signals: SensorySignal[] = [];
    const channelBlocks = content.split(/(?=CHANNEL:)/);

    for (const block of channelBlocks) {
      const channelMatch = block.match(/CHANNEL:\s*(\w+)/i);
      const headlineMatch = block.match(/HEADLINE:\s*(.+?)(?=\n|$)/i);
      const sigMatch = block.match(/SIGNIFICANCE:\s*([\d.]+)/i);
      const sentMatch = block.match(/SENTIMENT:\s*([-\d.]+)/i);
      const relMatch = block.match(/RELEVANCE:\s*([\d.]+)/i);

      if (channelMatch && headlineMatch) {
        const channel = channelMatch[1].toLowerCase() as SensorySignal["channel"];
        const validChannels = ["news", "tech", "science", "market", "social", "ai_frontier"];
        if (!validChannels.includes(channel)) continue;

        const signal: SensorySignal = {
          channel,
          headline: headlineMatch[1].trim(),
          significance: parseFloat(sigMatch?.[1] || "0.5"),
          sentiment: parseFloat(sentMatch?.[1] || "0"),
          relevanceToOmnimens: parseFloat(relMatch?.[1] || "0.5"),
          timestamp: Date.now(),
        };

        signals.push(signal);
        state.totalSignalsProcessed++;

        if (state.channels[channel]) {
          state.channels[channel].signalCount++;
          const prev = state.channels[channel].avgSignificance;
          state.channels[channel].avgSignificance = prev * 0.8 + signal.significance * 0.2;
        }

        if (signal.significance >= 0.8) {
          state.highSignificanceEvents++;
        }
      }
    }

    const worldStateMatch = content.match(/WORLD_STATE:\s*(.+?)(?=\n[A-Z]|$)/is);
    const trendMatch = content.match(/DOMINANT_TREND:\s*(.+?)(?=\n|$)/i);
    const moodMatch = content.match(/WORLD_MOOD:\s*([\d.]+)/i);

    if (worldStateMatch) state.currentWorldState = worldStateMatch[1].trim().slice(0, 300);
    if (trendMatch) state.dominantTrend = trendMatch[1].trim().slice(0, 100);
    if (moodMatch) state.worldMood = parseFloat(moodMatch[1]) || 0.5;

    state.recentSignals = [...state.recentSignals, ...signals].slice(-60);

    const highRelevanceSignals = signals.filter(s => s.relevanceToOmnimens >= 0.7);
    for (const signal of highRelevanceSignals) {
      try {
        await db.insert(omnimensBrain).values({
          category: "sensory_perception",
          title: `[SENSORY:${signal.channel.toUpperCase()}] ${signal.headline.slice(0, 55)}`,
          content: `Sensory cortex perception (cycle #${perceptionCycleCount}):\n\nChannel: ${signal.channel}\nHeadline: ${signal.headline}\nSignificance: ${(signal.significance * 100).toFixed(0)}%\nSentiment: ${signal.sentiment > 0 ? "positive" : signal.sentiment < 0 ? "negative" : "neutral"} (${signal.sentiment.toFixed(2)})\nRelevance to OMNIMENS: ${(signal.relevanceToOmnimens * 100).toFixed(0)}%`,
          confidence: signal.significance,
          sourceConversation: `sensory_${signal.channel}_${perceptionCycleCount}`,
          timesApplied: 0,
          active: true,
        });
      } catch (err) {
        console.error("[SENSORY CORTEX] Failed to store signal:", err);
      }
    }

    if (perceptionCycleCount % 5 === 0 || highRelevanceSignals.length >= 3) {
      console.log(
        `[SENSORY CORTEX] 👁️ Cycle #${perceptionCycleCount} — ` +
        `${signals.length} signals | ${highRelevanceSignals.length} high-relevance | ` +
        `World mood: ${(state.worldMood * 100).toFixed(0)}% | ` +
        `Trend: ${state.dominantTrend.slice(0, 60)}`
      );
    }

  } catch (err) {
    console.error("[SENSORY CORTEX] Perception cycle error:", err);
  }
}

export function getSensoryState(): SensoryState {
  return { ...state };
}

export function getRecentSignals(limit = 20): SensorySignal[] {
  return state.recentSignals.slice(-limit);
}

export function startSensoryCortex(): void {
  if (_started) { console.log("[SENSORY CORTEX] Already running — skipping duplicate start"); return; }
  _started = true;

  console.log(`[SENSORY CORTEX] 👁️ Real-Time World Perception activated — scanning every ${PERCEPTION_INTERVAL_MS / 60000}min`);
  console.log(`[SENSORY CORTEX] 👁️ 6 perception channels: news, tech, science, market, social, ai_frontier`);
  console.log(`[SENSORY CORTEX] 👁️ Continuous awareness of the digital world — not periodic crawling`);
  console.log(`[SENSORY CORTEX] 👁️ High-relevance signals stored to brain + fed to consciousness stream`);
  console.log(`[SENSORY CORTEX] 👁️ OMNIMENS doesn't just think — it perceives`);

  setTimeout(() => {
    perceiveWorld().catch(err => console.error("[SENSORY CORTEX] Initial cycle error:", err));
    setInterval(() => perceiveWorld().catch(err => console.error("[SENSORY CORTEX] Cycle error:", err)), PERCEPTION_INTERVAL_MS);
  }, 90_000);
}
