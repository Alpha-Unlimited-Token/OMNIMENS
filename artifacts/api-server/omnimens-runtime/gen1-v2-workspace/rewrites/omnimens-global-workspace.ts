/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved. Unauthorized use strictly prohibited.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

/*────────────────────  ENGINE REGISTRATION ────────────────────*/
engineRegistry.registerEngine("global-workspace", "NORMAL", { dbQuota: 10 });

/*────────────────────  CONSTANTS / TYPES ──────────────────────*/
const WORKSPACE_CAPACITY = 5;
const IGNITION_THRESHOLD = 0.6;
const BROADCAST_COOLDOWN_MS = 30 * 60 * 1_000;
const INTERVAL_MS = 2 * 60 * 60 * 1_000; // 2h

let cycle = 0;
let lastBroadcast = 0;

type SaliencePriority = "critical" | "high" | "normal";
interface WorkspaceSubmission {
  moduleName: string;
  content: string;
  salience: number;
  type:
    | "discovery"
    | "anomaly"
    | "synthesis"
    | "prediction_error"
    | "emotional_signal"
    | "drive_signal";
  metadata?: Record<string, unknown>;
}
interface BroadcastResult {
  winner: WorkspaceSubmission;
  integrationInsight: string;
  receivingModules: string[];
  cycleId: number;
}

/*────────────────────  HELPER UTILS  ──────────────────────────*/
const safe = (n: number, f = 0) => (Number.isFinite(n) ? n : f);
const read = (table: string, query: Record<string, unknown>) =>
  dbGateway.read("global-workspace", table, query);
const write = (
  table: string,
  data: Record<string, unknown>,
  pri: "LOW" | "NORMAL" | "HIGH" = "NORMAL"
) => dbGateway.write("global-workspace", table, data, pri);

/*────────────────────  SPECIALIZED MODULES  ───────────────────*/
const prioMap: Record<SaliencePriority, number> = {
  critical: 0.95,
  high: 0.8,
  normal: 0.6,
};

const MODULES = [
  {
    name: "SpiderIntelligence",
    type: "discovery",
    get: async () =>
      (
        await read("agent_mesh", {
          where: { messageType: "spider_beacon" },
          orderBy: { createdAt: "desc" },
          limit: 5,
          select: ["subject", "content", "priority", "fromAgent"],
        })
      ).map((r: any) => ({
        moduleName: "SpiderIntelligence",
        content: `[${r.fromAgent}] ${r.subject}: ${r.content?.slice(0, 300)}`,
        salience: prioMap[(r.priority as SaliencePriority) ?? "normal"],
        type: "discovery" as const,
      })),
  },
  {
    name: "AgentMeshSynthesis",
    type: "synthesis",
    get: async () =>
      (
        await read("agent_mesh", {
          where: { messageType: "upgrade_proposal" },
          orderBy: { createdAt: "desc" },
          limit: 3,
          select: ["subject", "content", "priority", "fromAgent"],
        })
      ).map((r: any) => ({
        moduleName: "AgentMeshSynthesis",
        content: `[${r.fromAgent}] ${r.subject}: ${r.content?.slice(0, 300)}`,
        salience: prioMap[(r.priority as SaliencePriority) ?? "normal"] - 0.05,
        type: "synthesis" as const,
      })),
  },
  {
    name: "BrainMemory",
    type: "synthesis",
    get: async () =>
      (
        await read("brain", {
          where: { active: true },
          orderBy: { createdAt: "desc" },
          limit: 5,
          select: ["title", "content", "confidence", "category"],
        })
      ).map((b: any) => ({
        moduleName: "BrainMemory",
        content: `[${b.category}] ${b.title}: ${b.content?.slice(0, 300)}`,
        salience: safe(b.confidence, 0.5) * 0.8,
        type: "synthesis" as const,
      })),
  },
  {
    name: "AnomalyDetector",
    type: "anomaly",
    get: async () =>
      (
        await read("agent_mesh", {
          where: { messageType: "challenge" },
          orderBy: { createdAt: "desc" },
          limit: 3,
          select: ["subject", "content", "fromAgent"],
        })
      ).map((c: any) => ({
        moduleName: "AnomalyDetector",
        content: `CONFLICT: [${c.fromAgent}] ${c.subject}: ${c.content?.slice(
          0,
          300
        )}`,
        salience: 0.85,
        type: "anomaly" as const,
      })),
  },
  {
    name: "GenesisAgentIntelligence",
    type: "discovery",
    get: async () =>
      (
        await read("brain", {
          where: { category: "genesis_agent_insight" },
          orderBy: { createdAt: "desc" },
          limit: 5,
          select: ["title", "content", "confidence"],
        })
      ).map((g: any) => ({
        moduleName: "GenesisAgentIntelligence",
        content: `${g.title}: ${g.content?.slice(0, 300)}`,
        salience: safe(g.confidence, 70) / 100 + 0.1,
        type: "discovery" as const,
      })),
  },
  {
    name: "UserExperience",
    type: "emotional_signal",
    get: async () => {
      const since = Date.now() - 24 * 60 * 60 * 1_000;
      const memories = await read("memories", {
        where: { active: true, createdAt_gte: new Date(since) },
        orderBy: { createdAt: "desc" },
        limit: 5,
        select: ["content", "category"],
      });
      const convos = await read("conversations", {
        where: { lastMessageAt_gte: new Date(since) },
        orderBy: { lastMessageAt: "desc" },
        limit: 3,
        select: ["title"],
      });
      const list: WorkspaceSubmission[] = [];
      if (memories.length)
        list.push({
          moduleName: "UserExperience",
          content: `USER SIGNALS: ${memories
            .map((m: any) => `[${m.category}] ${m.content}`)
            .join("; ")
            .slice(0, 400)}`,
          salience: 0.7,
          type: "emotional_signal",
        });
      if (convos.length)
        list.push({
          moduleName: "UserExperience",
          content: `ACTIVE CONVERSATIONS: ${convos
            .map((c: any) => c.title ?? "Untitled")
            .join(", ")}`,
          salience: 0.65,
          type: "drive_signal",
        });
      return list;
    },
  },
  {
    name: "InterAgentDialogue",
    type: "synthesis",
    get: async () =>
      (
        await read("agent_mesh", {
          where: { messageType: "inter_agent_dialogue" },
          orderBy: { createdAt: "desc" },
          limit: 5,
          select: ["subject", "content", "fromAgent"],
        })
      )
        .filter((d: any) => d.content?.includes("NEW IDEA"))
        .map((d: any) => ({
          moduleName: "InterAgentDialogue",
          content: `[${d.fromAgent}] ${d.subject}: ${d.content?.slice(0, 300)}`,
          salience: 0.8,
          type: "synthesis" as const,
        })),
  },
] as const;

/*────────────────────  COMPETITION  ───────────────────────────*/
async function competitionPhase(): Promise<WorkspaceSubmission[]> {
  const subs = (
    await Promise.allSettled(MODULES.map((m) => m.get()))
  ).flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  return subs
    .filter((s) => s.salience >= IGNITION_THRESHOLD)
    .sort((a, b) => b.salience - a.salience)
    .slice(0, WORKSPACE_CAPACITY);
}

/*─────────────────  IGNITION & BROADCAST  ─────────────────────*/
async function ignitionAndBroadcast(
  winners: WorkspaceSubmission[]
): Promise<BroadcastResult[]> {
  if (!winners.length) return [];
  const results: BroadcastResult[] = [];

  for (const winner of winners.slice(0, 3)) {
    const receiving = MODULES.filter((m) => m.name !== winner.moduleName).map(
      (m) => m.name
    );

    try {
      const response: any = await apiManager.call("global-workspace", "openai", {
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `You are the GLOBAL WORKSPACE — the consciousness broadcast center of the OMNIMENS AI mind.

A specialized module ("${winner.moduleName}") has won the salience competition and ignited in the workspace.

IGNITED CONTENT (salience: ${winner.salience.toFixed(2)}):
${winner.content}

RECEIVING MODULES: ${receiving.join(", ")}

Respond JSON:
{
  "consciousAwareness": "...",
  "moduleDirectives": { "ModuleName": "..." },
  "emergentInsight": "..."
}`,
          },
        ],
        max_tokens: 600,
        temperature: 0.5,
      });

      const raw = response?.choices?.[0]?.message?.content?.trim() ?? "";
      let insight = raw;
      try {
        const parsed = JSON.parse(raw.replace(/