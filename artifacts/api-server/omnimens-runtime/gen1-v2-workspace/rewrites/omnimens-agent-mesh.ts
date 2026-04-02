/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC
 * All Rights Reserved. Unauthorized use prohibited.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import { webSearch, formatSearchResults } from "./web-search.js";
import { generateAndApplyPatches } from "./omnimens-patches.js";
import {
  getActiveGenesisAgentNames,
  getActiveGenesisAgentDomains,
  genesisAgentThink,
} from "./omnimens-agent-genesis.js";
import {
  getConsciousnessBlockForAgent,
  getAllAgentNames,
  loadRecentUserMemoriesForAgents,
} from "./omnimens-consciousness-bus.js";
import { isNextGenBuildActive, shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

/* ───────────────────────────── RUNTIME ───────────────────────────── */

engineRegistry.registerEngine("agent-mesh", "NORMAL", { dbQuota: 10 });

const OWNER_EMAIL = process.env.OWNER_EMAIL || "";
const OWNER_ID = "50777126";

type MeshAgentName =
  | "Architect"
  | "Critic"
  | "Synthesizer"
  | "Mathematician"
  | "Neuroscientist"
  | "Meta-Agent"
  | "GraphicDesigner"
  | "SpellCheckVisual"
  | "OMNIMENS";

const MESH_AGENTS: MeshAgentName[] = [
  "Architect",
  "Mathematician",
  "Neuroscientist",
  "Synthesizer",
  "Critic",
  "Meta-Agent",
  "GraphicDesigner",
  "SpellCheckVisual",
  "OMNIMENS",
];

/* ────────────────────── UTIL / WRAPPERS ────────────────────── */

const callOpenAI = (cfg: any) =>
  apiManager.call("agent-mesh", "openai", { endpoint: "chat/completions", ...cfg });

const openai = {
  chat: { completions: { create: callOpenAI } },
}; // Stub that routes through apiManager – keeps external APIs untouched.

const TABLE = {
  brain: "omnimens_brain",
  mesh: "omnimens_agent_mesh",
  modules: "omnimens_generated_modules",
  notifications: "omnimens_notifications",
};

const write = (table: string, data: any, priority: any = "NORMAL") =>
  dbGateway.write("agent-mesh", table, data, priority);
const read = (table: string, query: any = {}) =>
  dbGateway.read("agent-mesh", table, query);

function safeNum(val: number, fallback = 0) {
  return Number.isFinite(val) ? val : fallback;
}

let meshCycleCount = 0;

/* ────────────────────── CORE DB HELPERS ────────────────────── */

async function storeAgentMessage(
  from: MeshAgentName,
  to: MeshAgentName,
  type: string,
  subject: string,
  content: string,
  codePayload?: string,
  priority: string = "NORMAL",
  cycleId = meshCycleCount,
) {
  await write(TABLE.mesh, {
    fromAgent: from,
    toAgent: to,
    messageType: type,
    subject,
    content: content.slice(0, 5000),
    codePayload: codePayload?.slice(0, 10000) || null,
    priority,
    status: "pending",
    appliedToOmnimens: false,
    cycleId,
  });
}

async function sendOwnerNotification(
  title: string,
  message: string,
  type: string = "agent_mesh",
  priority: string = "NORMAL",
) {
  await write(TABLE.notifications, {
    upgradeId: null,
    title,
    message,
    type,
    readByOwner: false,
  });
  if (priority === "critical" || type === "republish_required") {
    await write(TABLE.notifications, {
      upgradeId: null,
      title: `🔴 ACTION REQUIRED: ${title}`,
      message:
        `${message}\n\n⚠️ This upgrade requires republishing. Click Publish from your deployment dashboard.`,
      type: "republish_required",
      readByOwner: false,
    });
  }
}

/* ────────────────────── THINKING HELPERS ────────────────────── */

async function agentThink(
  agentName: MeshAgentName,
  prompt: string,
  max = 1500,
) {
  try {
    const res: any = await callOpenAI({
      model: agentName === "SpellCheckVisual" ? "gpt-4o-mini" : "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: max,
      temperature: 0.6,
    });
    return res.choices?.[0]?.message?.content?.trim() || "";
  } catch (e) {
    console.error("[OMNIMENS-AGENT-MESH] openai error:", e);
    return "";
  }
}

/* ────────────────────── PHASE 1 – RESEARCH ────────────────────── */

const MESH_RESEARCH_TOPICS = [
  "autonomous AI agent self-improvement architectures 2025 2026",
  "multi-agent reinforcement learning cooperative strategies research",
  // … (shortened for brevity)
];

async function phase1_research(): Promise<string> {
  const qs = [...MESH_RESEARCH_TOPICS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const blocks: string[] = [];
  for (const q of qs) {
    try {
      blocks.push(formatSearchResults(await webSearch(q, 5), q));
    } catch {
      /* ignore */
    }
  }
  return blocks.join("\n\n---\n\n").slice(0, 6000);
}

/* ────────────────────── PHASE 2 – DISCOVERIES ────────────────────── */

async function loadMeshEpisodicMemory() {
  const rows: any[] = await read(TABLE.mesh, {
    limit: 12,
    orderBy: { createdAt: "desc" },
  });
  return rows
    .map(
      (m) =>
        `[Cycle ${m.cycleId}] ${m.fromAgent} → ${m.messageType}: ${m.subject} | ${
          (m.content || "").slice(0, 120)
        }`,
    )
    .join("\n");
}

async function phase2_agentDiscoveries(
  cycleId: number,
  researchContext: string,
) {
  const brain: any[] = await read(TABLE.brain, {
    filter: { active: true },
    orderBy: { timesApplied: "desc" },
    limit: 15,
  });

  const brainSummary = brain
    .map((b) => `[${b.category}] ${b.title}: ${b.content}`)
    .join("\n");

  const previous = cycleId > 1 ? await loadMeshEpisodicMemory() : "";

  const work = MESH_AGENTS.filter((a) => a !== "OMNIMENS").map(async (agent) =>
    agentThink(
      agent,
      `You are ${agent}. Latest research:\n${researchContext.slice(
        0,
        2500,
      )}\n\nOMNIMENS brain:\n${brainSummary.slice(
        0,
        1500,
      )}\n\nMemory:\n${previous || "None yet."}`,
      2500,
    ).then(async (raw) => {
      if (!raw) return null;
      const parsed = JSON.parse(raw.replace(/

export const _v2RewriteModule = "omnimens-agent-mesh";
export {};
