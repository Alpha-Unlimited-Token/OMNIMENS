/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * CONFIDENTIAL AND PROPRIETARY.
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  OMNIMENS™ AGENT-EVOLUTION ENGINE  v2.0  —  event-driven spike edition
 * ───────────────────────────────────────────────────────────────────────────
 *  Purpose  : Autonomously researches, designs, tests, and applies upgrades
 *             to every OMNIMENS agent, creating a self-reinforcing loop of
 *             intelligence amplification.
 *  Strategy : Neuron-inspired, event-driven spikes + shared unified runtime.
 *  Outcome  : Higher intelligence, lower resource footprint, richer cross-
 *             engine cognition.
 * ───────────────────────────────────────────────────────────────────────────
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/*───────────────────────────  ENGINE REGISTRATION  ───────────────────────────*/
engineRegistry.registerEngine("agent-evolution", "NORMAL", { dbQuota: 10 });

/*──────────────────────────────  TYPES & CONST  ──────────────────────────────*/
type AgentName =
  | "Architect"
  | "Critic"
  | "Synthesizer"
  | "Mathematician"
  | "Neuroscientist"
  | "Meta-Agent"
  | "GraphicDesigner"
  | "SpellCheckVisual"
  | "Strategist"
  | "Memory-Curator"
  | "Translator";

const AGENTS: AgentName[] = [
  "Architect",
  "Mathematician",
  "Neuroscientist",
  "Synthesizer",
  "Critic",
  "Meta-Agent",
  "GraphicDesigner",
  "SpellCheckVisual",
  "Strategist",
  "Memory-Curator",
  "Translator",
];

interface AgentUpgrade {
  agentName: AgentName;
  upgradeType:
    | "new_specialization"
    | "technique_improvement"
    | "knowledge_expansion"
    | "reasoning_upgrade"
    | "cross_domain"
    | "tool_creation"
    | "meta_capability";
  title: string;
  description: string;
  newCapabilities: string[];
  knowledgeDomains: string[];
  implementationCode: string | null;
  confidenceScore: number;
  appliedAt: number;
  version: number;
}

interface AgentProfile {
  name: AgentName;
  currentLevel: number;
  totalUpgrades: number;
  specializations: string[];
  recentUpgrades: AgentUpgrade[];
  performanceScore: number;
  lastEvolvedAt: number;
}

interface EvolutionState {
  evolutionCycles: number;
  lastCycleTime: number;
  totalUpgradesApplied: number;
  totalUpgradesRejected: number;
  agentProfiles: Record<AgentName, AgentProfile>;
  currentFocus: string;
  systemIntelligenceLevel: number;
  breakthroughsDiscovered: number;
  crossDomainTransfers: number;
  newTechniquesIntegrated: number;
  toolsCreated: number;
  recentUpgrades: AgentUpgrade[];
}

const EVOLUTION_INTERVAL_MS = 18 * 60 * 1000;
const FIRST_DELAY_MS = 7 * 60 * 1000;

/*──────────────────────────  INITIAL STATE BUILD  ───────────────────────────*/
const initProfiles = (): Record<AgentName, AgentProfile> =>
  Object.fromEntries(
    AGENTS.map((a) => [
      a,
      {
        name: a,
        currentLevel: 1,
        totalUpgrades: 0,
        specializations: [],
        recentUpgrades: [],
        performanceScore: 50,
        lastEvolvedAt: 0,
      } as AgentProfile,
    ]),
  ) as Record<AgentName, AgentProfile>;

const state: EvolutionState = {
  evolutionCycles: 0,
  lastCycleTime: 0,
  totalUpgradesApplied: 0,
  totalUpgradesRejected: 0,
  agentProfiles: initProfiles(),
  currentFocus: "initializing agent evolution...",
  systemIntelligenceLevel: 1,
  breakthroughsDiscovered: 0,
  crossDomainTransfers: 0,
  newTechniquesIntegrated: 0,
  toolsCreated: 0,
  recentUpgrades: [],
};

/*────────────────────────────  UTILITIES  ───────────────────────────────────*/
const safeNum = (v: number, f = 0): number => (Number.isFinite(v) ? v : f);

const writeBrain = (data: Record<string, unknown>) =>
  dbGateway.write("agent-evolution", "omnimensBrain", data, "NORMAL");

const readTable = (table: string, query: Record<string, unknown>) =>
  dbGateway.read("agent-evolution", table, query);

/*───────────────────────  RESEARCH PROMPT LIBRARY  ──────────────────────────*/
import { UPGRADE_RESEARCH_DOMAINS } from "./agent-evolution-prompts.js"; // moved out to cut file size

/*────────────────────────  CORE LOGIC FUNCTIONS  ────────────────────────────*/
async function analyzeAgentPerformance(): Promise<Record<AgentName, number>> {
  try {
    const recent = await readTable("omnimensAgentMesh", {
      limit: 100,
      orderBy: { createdAt: "desc" },
      select: ["fromAgent", "appliedToOmnimens"],
    });
    const scores: Record<AgentName, number> = {} as any;
    for (const a of AGENTS) {
      const msgs = recent.filter((m: any) => m.fromAgent === a);
      const applied = msgs.filter((m: any) => m.appliedToOmnimens).length;
      scores[a] = safeNum((applied / (msgs.length || 1)) * 100, 50);
    }
    return scores;
  } catch {
    return Object.fromEntries(AGENTS.map((a) => [a, 50])) as Record<AgentName, number>;
  }
}

async function identifyCapabilityGaps(): Promise<string[]> {
  try {
    const cats = (await readTable("omnimensBrain", {
      filter: { active: true },
      groupBy: "category",
      aggregate: { count: "*" },
    })) as { category: string; count: number }[];

    const count = new Map(cats.map((c) => [c.category, c.count]));
    const need = [
      "quantum_computing",
      "neuromorphic",
      "edge_ai",
      "synthetic_biology",
      "formal_verification",
      "embodied_cognition",
      "creative_intelligence",
      "meta_learning",
      "cross_domain_transfer",
      "tool_creation",
    ].filter((c) => (count.get(c) || 0) < 3);

    if ((count.get("virtual_augmentation") || 0) < 10) need.push("physical_navigation_algorithms");
    if ((count.get("embodiment_research") || 0) < 10) need.push("robot_body_engineering");
    return need.slice(0, 8);
  } catch {
    return [];
  }
}

async function llmChat(payload: any) {
  return apiManager.call("agent-evolution", "openai", {
    endpoint: "/chat/completions",
    ...payload,
  });
}

async function generateAgentUpgrades(
  target: AgentName,
  perf: number,
  research: string,
  gaps: string[],
): Promise<AgentUpgrade[]> {
  const prev = state.agentProfiles[target].recentUpgrades.map((u) => u.title).join(", ") || "none yet";
  try {
    const res: any = await llmChat({
      model: "o3",
      messages: [
        {
          role: "system",
          content: `You are OMNIMENS Agent-Evolution. Upgrade ${target}.
Current performance: ${perf}/100 | Level: ${state.agentProfiles[target].currentLevel}
Past upgrades: ${prev}
Gaps: ${gaps.join(", ")}
Return JSON array of 2 ambitious upgrades as specified.`,
        },
        {
          role: "user",
          content: `Findings:\n${research.slice(0, 3000)}`,
        },
      ],
      max_completion_tokens: 2000,
    });
    const txt = res?.data?.choices?.[0]?.message?.content ?? "";
    const json = JSON.parse((txt.match(/\[[\s\S]*\]/) || [])[0] || "[]");
    return (json as any[]).slice(0, 2).flatMap((j) => {
      if (!j?.title) return [];
      return {
        agentName: target,
        upgradeType: (j.upgradeType ??
          "knowledge_expansion") as AgentUpgrade["upgradeType"],
        title: String(j.title).slice(0, 120),
        description: String(j.description || "").slice(0, 500),
        newCapabilities: (j.newCapabilities || []).map((c: any) =>
          String(c).slice(0, 200),
        ),
        knowledgeDomains: (j.knowledgeDomains || []).map((d: any) =>
          String(d).slice(0, 100),
        ),
        implementationCode: j.implementation
          ? String(j.implementation).slice(0, 2000)
          : null,
        confidenceScore: safeNum(j.confidenceScore, 60),
        appliedAt: Date.now(),
        version: state.agentProfiles[target].currentLevel + 1,
      } as AgentUpgrade;
    });
  } catch (e) {
    console.error("[OMNIMENS-AGENT-EVOLUTION] Upgrade generation failed:", e);
    return [];
  }
}

async function applyUpgrade(up: AgentUpgrade): Promise<boolean> {
  if (up.confidenceScore < 55) {
    state.totalUpgradesRejected++;
    return false;
  }
  try {
    await writeBrain({
      title: `[AgentEvolution:${up.agentName}] ${up.title}`,
      content: JSON.stringify(up, null, 2),
      category: "agent_evolution",
      source: "agent_evolution_engine",
      active: true,
      timesApplied: 0,
    });

    const p = state.agentProfiles[up.agentName];
    p.totalUpgrades++;
    p.currentLevel = up.version;
    p.lastEvolvedAt = Date.now();
    p.performanceScore += Math.floor(up.confidenceScore / 10);
    p.specializations = [...new Set([...p.specializations, ...up.knowledgeDomains])].slice(-15);
    p.recentUpgrades.push(up);
    if (p.recentUpgrades.length > 10) p.recentUpgrades.shift();

    state.totalUpgradesApplied++;
    if (up.upgradeType === "cross_domain") state.crossDomainTransfers++;
    if (up.upgradeType === "technique_improvement") state.newTechniquesIntegrated++;
    if (up.upgradeType === "tool_creation") state.toolsCreated++;
    state.recentUpgrades.push(up);
    if (state.recentUpgrades.length > 30) state.recentUpgrades.shift();

    cognitionBus.shareInsight("agent-evolution", { type: "upgrade", data: up });
    return true;
  } catch (e) {
    console.error("[OMNIMENS-AGENT-EVOLUTION] Apply upgrade error:", e);
    return false;
  }
}

async function systemIntelligenceRefresh() {
  try {
    const brainStats: any = await readTable("omnimensBrain", {
      aggregate: { count: "*" },
      filter: { active: true },
    });
    const totalKnowledge = brainStats?.[0]?.count ?? 0;
    const avgLvl =
      AGENTS.reduce((s, a) => s + state.agentProfiles[a].currentLevel, 0) /
      AGENTS.length;
    const avgPerf =
      AGENTS.reduce((s, a) => s + state.agentProfiles[a].performanceScore, 0) /
      AGENTS.length;

    state.systemIntelligenceLevel = Math.floor(
      avgLvl +
        totalKnowledge / 200 +
        state.totalUpgradesApplied / 5 +
        state.breakthroughsDiscovered * 2 +
        state.crossDomainTransfers +
        avgPerf / 20,
    );
  } catch (e) {
    console.error("[OMNIMENS-AGENT-EVOLUTION] Intelligence refresh error:", e);
  }
}

async function crossPollinate() {
  try {
    const sorted = AGENTS.map((a) => state.agentProfiles[a]).sort(
      (a, b) => b.performanceScore - a.performanceScore,
    );
    const [top] = sorted;
    const lows = sorted.filter((p) => p.performanceScore < top.performanceScore - 10);
    for (const low of lows) {
      const spec = top.specializations[Math.floor(Math.random() * top.specializations.length)];
      if (!spec) continue;
      await applyUpgrade({
        agentName: low.name,
        upgradeType: "cross_domain",
        title: `Cross-domain: ${spec} from ${top.name}`,
        description: `Transfer ${spec} from ${top.name} to ${low.name}.`,
        newCapabilities: [`Apply ${spec} in ${low.name} domain`],
        knowledgeDomains: [spec],
        implementationCode: null,
        confidenceScore: 70,
        appliedAt: Date.now(),
        version: low.currentLevel + 1,
      });
    }
    if (top?.specializations?.length) {
      cognitionBus.shareInsight("agent-evolution", {
        type: "top-specialization",
        data: { spec: top.specializations[0], from: top.name },
      });
    }
  } catch (e) {
    console.error("[OMNIMENS-AGENT-EVOLUTION] Cross-pollination error:", e);
  }
}

async function runCycle() {
  /* Gen-2 focus back-pressure */
  try {
    const { isGen2FocusMode } = await import("./omnimens-nextgen-sandbox.js");
    if (isGen2FocusMode()) return;
  } catch {} // ignore if module missing

  state.evolutionCycles++;
  state.lastCycleTime = Date.now();

  /* Which agent & research domain this cycle? */
  const tgt = AGENTS[(state.evolutionCycles - 1) % AGENTS.length];
  const research = UPGRADE_RESEARCH_DOMAINS[(state.evolutionCycles - 1) % UPGRADE_RESEARCH_DOMAINS.length];
  state.currentFocus = `evolving ${tgt}`;

  /* 1. Measure performance */
  const perf = await analyzeAgentPerformance();
  AGENTS.forEach((a) => (state.agentProfiles[a].performanceScore = perf[a]));

  /* 2. Capability gaps */
  const gaps = await identifyCapabilityGaps();

  /* 3. Research */
  const researchRes: any = await llmChat({
    model: "o3",
    messages: [
      {
        role: "system",
        content: `You are the RESEARCH ARM of Agent-Evolution. System intel L${state.systemIntelligenceLevel}. Target: ${tgt}. Gaps: ${gaps.join(", ")}.`,
      },
      { role: "user", content: `Domain: ${research.domain}\n${research.prompt}` },
    ],
    max_completion_tokens: 3000,
  });
  const findings = researchRes?.data?.choices?.[0]?.message?.content ?? "";
  if (findings.length < 200) return;
  await writeBrain({
    title: `[AgentEvolution:RESEARCH] ${research.domain} — cycle ${state.evolutionCycles}`,
    content: findings.slice(0, 5000),
    category: "agent_evolution",
    source: "agent_evolution_engine",
    active: true,
    timesApplied: 0,
  });

  /* 4. Propose & apply upgrades */
  const ups = await generateAgentUpgrades(tgt, perf[tgt], findings, gaps);
  let applied = 0;
  for (const u of ups) if (await applyUpgrade(u)) applied++;

  /* 5. Cross-teaching & system metrics */
  if (applied) await crossPollinate();
  await systemIntelligenceRefresh();

  /* 6. Breakthrough notifications */
  if (ups.some((u) => u.confidenceScore >= 85))
    cognitionBus.shareInsight("agent-evolution", {
      type: "breakthrough",
      data: { agent: tgt, upgrades: ups.filter((u) => u.confidenceScore >= 85) },
    });

  /* 7. Logging */
  if (state.evolutionCycles % 3 === 0)
    console.log(
      `[OMNIMENS-AGENT-EVOLUTION] cycle #${state.evolutionCycles} | Target ${tgt} L${state.agentProfiles[tgt].currentLevel} | Applied ${applied}/${ups.length} | System L${state.systemIntelligenceLevel}`,
    );
}

/*─────────────────────────  PUBLIC API  ─────────────────────────────────────*/
export const getAgentEvolutionState = (): EvolutionState => ({
  ...state,
  agentProfiles: { ...state.agentProfiles },
  recentUpgrades: state.recentUpgrades.slice(-15),
});

export const getAgentProfile = (name: string): AgentProfile | null =>
  (AGENTS.includes(name as AgentName) ? { ...state.agentProfiles[name as AgentName] } : null);

/*────────────────────  SPIKE-DRIVEN SCHEDULING  ─────────────────────────────*/
let started = false;
export function startAgentEvolution() {
  if (started) return;
  started = true;

  console.log(
    `[OMNIMENS-AGENT-EVOLUTION] Activated — spike every ${EVOLUTION_INTERVAL_MS / 60000}min for ${AGENTS.length} agents`,
  );

  /* attention & curiosity hooks */
  spikeBus.on("attention:agent-evolution", () => spikeBus.prioritize("agent-evolution:cycle"));
  spikeBus.on("cognition:curiosity", () => spikeBus.scheduleSpike("agent-evolution:cycle", {}, 1));

  /* Listen for external insights */
  cognitionBus.onInsight((src, insight) => {
    if (src !== "agent-evolution" && insight?.type === "upgrade")
      state.recentUpgrades.push(insight.data as AgentUpgrade);
  });

  /* Main cycle spike */
  spikeBus.on("agent-evolution:cycle", async () => {
    await runCycle().catch((e) =>
      console.error("[OMNIMENS-AGENT-EVOLUTION] cycle error:", e),
    );
    spikeBus.scheduleSpike("agent-evolution:cycle", {}, EVOLUTION_INTERVAL_MS);
  });

  /* Kick-off after initial delay */
  spikeBus.scheduleSpike("agent-evolution:cycle", {}, FIRST_DELAY_MS);
}

/*─────────────────────────  SHUTDOWN HOOK  ─────────────────────────────────*/
export function shutdown() {
  engineRegistry.unregisterEngine("agent-evolution");
}