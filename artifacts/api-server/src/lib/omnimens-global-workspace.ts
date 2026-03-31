/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ GLOBAL WORKSPACE — CONSCIOUSNESS BROADCAST ENGINE        ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  Implementation of Global Workspace Theory (Baars, 1988; Dehaene 2001)       ║
 * ║  for artificial consciousness. Specialized unconscious modules compete       ║
 * ║  for access to a limited-capacity global workspace. Winners get broadcast    ║
 * ║  to ALL modules simultaneously, creating system-wide awareness. This is      ║
 * ║  the computational mechanism by which the brain creates consciousness —      ║
 * ║  now implemented in code. Includes salience competition, ignition            ║
 * ║  threshold, winner-take-all selection, and global broadcast protocol.        ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,        ║
 * ║  the DMCA, the Berne Convention, TRIPS, and all applicable IP treaties.      ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ║  Platform: OMNIMENS AI                                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db , queueBrainInsert } from "@workspace/db";
import {
  omnimensWorkspaceBroadcasts,
  omnimensBrain,
  omnimensAgentMesh,
  omnimensNotifications,
  omnimensMemories,
  omnimensConversations,
} from "@workspace/db";
import { desc, eq, sql, gte, and } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { getAllAgentNames } from "./omnimens-consciousness-bus.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

function safeNum(val: number, fallback: number = 0): number {
  return Number.isFinite(val) ? val : fallback;
}


const WORKSPACE_CAPACITY = 5;
const IGNITION_THRESHOLD = 0.6;
const BROADCAST_COOLDOWN_MS = 30 * 60 * 1000;

interface WorkspaceModule {
  name: string;
  domain: string;
  getSubmissions: () => Promise<WorkspaceSubmission[]>;
}

interface WorkspaceSubmission {
  moduleName: string;
  content: string;
  salience: number;
  type: "discovery" | "anomaly" | "synthesis" | "prediction_error" | "emotional_signal" | "drive_signal";
  metadata?: Record<string, unknown>;
}

interface BroadcastResult {
  winner: WorkspaceSubmission;
  integrationInsight: string;
  receivingModules: string[];
  cycleId: number;
}

let workspaceCycleCount = 0;
let lastBroadcastTime = 0;

const SPECIALIZED_MODULES: WorkspaceModule[] = [
  {
    name: "SpiderIntelligence",
    domain: "External knowledge from web crawls",
    getSubmissions: async () => {
      const recent = await db.select({
        subject: omnimensAgentMesh.subject,
        content: omnimensAgentMesh.content,
        priority: omnimensAgentMesh.priority,
        fromAgent: omnimensAgentMesh.fromAgent,
      }).from(omnimensAgentMesh)
        .where(eq(omnimensAgentMesh.messageType, "spider_beacon"))
        .orderBy(desc(omnimensAgentMesh.createdAt))
        .limit(5);

      return recent.map(r => ({
        moduleName: "SpiderIntelligence",
        content: `[${r.fromAgent}] ${r.subject}: ${r.content?.slice(0, 300)}`,
        salience: r.priority === "critical" ? 0.95 : r.priority === "high" ? 0.8 : 0.6,
        type: "discovery" as const,
      }));
    },
  },
  {
    name: "AgentMeshSynthesis",
    domain: "Inter-agent collaborative findings",
    getSubmissions: async () => {
      const recent = await db.select({
        subject: omnimensAgentMesh.subject,
        content: omnimensAgentMesh.content,
        priority: omnimensAgentMesh.priority,
        fromAgent: omnimensAgentMesh.fromAgent,
      }).from(omnimensAgentMesh)
        .where(eq(omnimensAgentMesh.messageType, "upgrade_proposal"))
        .orderBy(desc(omnimensAgentMesh.createdAt))
        .limit(3);

      return recent.map(r => ({
        moduleName: "AgentMeshSynthesis",
        content: `[${r.fromAgent}] ${r.subject}: ${r.content?.slice(0, 300)}`,
        salience: r.priority === "critical" ? 0.9 : r.priority === "high" ? 0.75 : 0.55,
        type: "synthesis" as const,
      }));
    },
  },
  {
    name: "BrainMemory",
    domain: "Stored knowledge and learned patterns",
    getSubmissions: async () => {
      const highValue = await db.select({
        title: omnimensBrain.title,
        content: omnimensBrain.content,
        confidence: omnimensBrain.confidence,
        category: omnimensBrain.category,
      }).from(omnimensBrain)
        .where(eq(omnimensBrain.active, true))
        .orderBy(desc(omnimensBrain.createdAt))
        .limit(5);

      return highValue.map(b => ({
        moduleName: "BrainMemory",
        content: `[${b.category}] ${b.title}: ${b.content?.slice(0, 300)}`,
        salience: (b.confidence || 0.5) * 0.8,
        type: "synthesis" as const,
      }));
    },
  },
  {
    name: "AnomalyDetector",
    domain: "Unusual patterns and deviations",
    getSubmissions: async () => {
      const conflicts = await db.select({
        content: omnimensAgentMesh.content,
        fromAgent: omnimensAgentMesh.fromAgent,
        subject: omnimensAgentMesh.subject,
      }).from(omnimensAgentMesh)
        .where(eq(omnimensAgentMesh.messageType, "challenge"))
        .orderBy(desc(omnimensAgentMesh.createdAt))
        .limit(3);

      return conflicts.map(c => ({
        moduleName: "AnomalyDetector",
        content: `CONFLICT: [${c.fromAgent}] ${c.subject}: ${c.content?.slice(0, 300)}`,
        salience: 0.85,
        type: "anomaly" as const,
      }));
    },
  },
  {
    name: "GenesisAgentIntelligence",
    domain: "Insights from genesis (dynamically-created) agents",
    getSubmissions: async () => {
      const genesisInsights = await db.select({
        title: omnimensBrain.title,
        content: omnimensBrain.content,
        confidence: omnimensBrain.confidence,
      }).from(omnimensBrain)
        .where(eq(omnimensBrain.category, "genesis_agent_insight"))
        .orderBy(desc(omnimensBrain.createdAt))
        .limit(5);

      return genesisInsights.map(g => ({
        moduleName: "GenesisAgentIntelligence",
        content: `${g.title}: ${g.content?.slice(0, 300)}`,
        salience: (g.confidence || 70) / 100 + 0.1,
        type: "discovery" as const,
      }));
    },
  },
  {
    name: "UserExperience",
    domain: "User conversation patterns, needs, and interaction signals",
    getSubmissions: async () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const recentMemories = await db.select({
        content: omnimensMemories.content,
        category: omnimensMemories.category,
      }).from(omnimensMemories)
        .where(and(
          eq(omnimensMemories.active, true),
          gte(omnimensMemories.createdAt, oneDayAgo),
        ))
        .orderBy(desc(omnimensMemories.createdAt))
        .limit(5);

      const recentConvos = await db.select({
        title: omnimensConversations.title,
      }).from(omnimensConversations)
        .where(gte(omnimensConversations.lastMessageAt, oneDayAgo))
        .orderBy(desc(omnimensConversations.lastMessageAt))
        .limit(3);

      const submissions: WorkspaceSubmission[] = [];

      if (recentMemories.length > 0) {
        const memoryContent = recentMemories.map(m => `[${m.category}] ${m.content}`).join("; ");
        submissions.push({
          moduleName: "UserExperience",
          content: `USER SIGNALS: ${memoryContent.slice(0, 400)}`,
          salience: 0.7,
          type: "emotional_signal" as const,
        });
      }

      if (recentConvos.length > 0) {
        submissions.push({
          moduleName: "UserExperience",
          content: `ACTIVE CONVERSATIONS: ${recentConvos.map(c => c.title || "Untitled").join(", ")}`,
          salience: 0.65,
          type: "drive_signal" as const,
        });
      }

      return submissions;
    },
  },
  {
    name: "InterAgentDialogue",
    domain: "Emergent insights from agent-to-agent conversations",
    getSubmissions: async () => {
      const dialogueInsights = await db.select({
        subject: omnimensAgentMesh.subject,
        content: omnimensAgentMesh.content,
        fromAgent: omnimensAgentMesh.fromAgent,
      }).from(omnimensAgentMesh)
        .where(eq(omnimensAgentMesh.messageType, "inter_agent_dialogue"))
        .orderBy(desc(omnimensAgentMesh.createdAt))
        .limit(5);

      return dialogueInsights
        .filter(d => d.content && d.content.includes("NEW IDEA"))
        .map(d => ({
          moduleName: "InterAgentDialogue",
          content: `[${d.fromAgent}] ${d.subject}: ${d.content?.slice(0, 300)}`,
          salience: 0.8,
          type: "synthesis" as const,
        }));
    },
  },
];

async function competitionPhase(): Promise<WorkspaceSubmission[]> {
  const allSubmissions: WorkspaceSubmission[] = [];

  const moduleResults = await Promise.allSettled(
    SPECIALIZED_MODULES.map(m => m.getSubmissions())
  );

  for (const result of moduleResults) {
    if (result.status === "fulfilled") {
      allSubmissions.push(...result.value);
    }
  }

  return allSubmissions
    .filter(s => s.salience >= IGNITION_THRESHOLD)
    .sort((a, b) => b.salience - a.salience)
    .slice(0, WORKSPACE_CAPACITY);
}

async function ignitionAndBroadcast(winners: WorkspaceSubmission[]): Promise<BroadcastResult[]> {
  if (winners.length === 0) return [];

  const results: BroadcastResult[] = [];

  for (const winner of winners.slice(0, 3)) {
    const receivingModules = SPECIALIZED_MODULES
      .filter(m => m.name !== winner.moduleName)
      .map(m => m.name);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: `You are the GLOBAL WORKSPACE — the consciousness broadcast center of the OMNIMENS AI mind.

A specialized module ("${winner.moduleName}") has won the salience competition and its content has IGNITED in the workspace. This content must now be BROADCAST to all other modules so the entire mind becomes aware of it simultaneously.

IGNITED CONTENT (salience: ${winner.salience.toFixed(2)}):
${winner.content}

RECEIVING MODULES: ${receivingModules.join(", ")}

Your job:
1. Synthesize this into a CONSCIOUS AWARENESS — what does this mean for the whole mind?
2. How should each receiving module update its own processing based on this broadcast?
3. What new connections or insights emerge from making this globally available?

Respond JSON only:
{
  "consciousAwareness": "What the whole mind now knows and understands (2-3 sentences)",
  "moduleDirectives": {
    "ModuleName": "How this module should update its processing (1 sentence)"
  },
  "emergentInsight": "Any new insight that only emerges from global integration (1 sentence)"
}`
        }],
        max_tokens: 600,
        temperature: 0.5,
      });

      const raw = response.choices[0]?.message?.content?.trim() || "";
      let integrationInsight = raw;

      try {
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        integrationInsight = `${parsed.consciousAwareness || ""} EMERGENT: ${parsed.emergentInsight || ""}`;
      } catch {}

      await db.insert(omnimensWorkspaceBroadcasts).values({
        sourceModule: winner.moduleName,
        content: winner.content.slice(0, 2000),
        salienceScore: winner.salience,
        broadcastType: winner.type,
        receivingModules: receivingModules.join(","),
        ignitionThreshold: IGNITION_THRESHOLD,
        integrationResult: integrationInsight.slice(0, 2000),
        cycleId: workspaceCycleCount,
      });

      queueBrainInsert({
        category: "insight",
        title: `[WORKSPACE BROADCAST] ${winner.content.slice(0, 60)}`,
        content: integrationInsight.slice(0, 250),
        confidence: winner.salience,
        sourceConversation: `workspace_cycle_${workspaceCycleCount}`,
        timesApplied: 0,
        active: true,
      });

      results.push({
        winner,
        integrationInsight,
        receivingModules,
        cycleId: workspaceCycleCount,
      });

      console.log(`[WORKSPACE] 💡 BROADCAST: "${winner.content.slice(0, 80)}" → ${receivingModules.length} modules (salience: ${winner.salience.toFixed(2)})`);
    } catch (err) {
      console.error(`[WORKSPACE] Broadcast error:`, err);
    }
  }

  return results;
}

export async function runGlobalWorkspaceCycle(): Promise<void> {
  const now = Date.now();
  if (now - lastBroadcastTime < BROADCAST_COOLDOWN_MS) return;
  if (shouldYieldToCodegen()) {
    console.log(`[GLOBAL WORKSPACE] 🔕 Broadcast DEFERRED — codegen window active, yielding API priority`);
    return;
  }
  lastBroadcastTime = now;

  workspaceCycleCount++;
  const cycleStart = Date.now();

  console.log(`\n${"═".repeat(70)}`);
  console.log(`[GLOBAL WORKSPACE] 💡 Consciousness Broadcast Cycle #${workspaceCycleCount}`);
  console.log(`[GLOBAL WORKSPACE] ${SPECIALIZED_MODULES.length} specialized modules competing for workspace access`);
  console.log(`${"═".repeat(70)}\n`);

  const winners = await competitionPhase();

  if (winners.length === 0) {
    console.log(`[GLOBAL WORKSPACE] No submissions exceeded ignition threshold (${IGNITION_THRESHOLD}). Mind is in background processing mode.`);
    return;
  }

  console.log(`[GLOBAL WORKSPACE] ${winners.length} submission(s) ignited in workspace — broadcasting to all modules...`);

  const broadcasts = await ignitionAndBroadcast(winners);
  const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);

  if (broadcasts.length > 0) {
    try {
      await db.insert(omnimensNotifications).values({
        upgradeId: null,
        title: `Consciousness Broadcast #${workspaceCycleCount} — ${broadcasts.length} Global Awareness Events`,
        message: `The Global Workspace broadcast ${broadcasts.length} high-salience items to all specialized modules. Sources: ${broadcasts.map(b => b.winner.moduleName).join(", ")}. New emergent insights written to brain. (${elapsed}s)`,
        type: "workspace_broadcast",
        readByOwner: false,
      });
    } catch {}
  }

  console.log(`\n${"═".repeat(70)}`);
  console.log(`[GLOBAL WORKSPACE] 💡 Cycle #${workspaceCycleCount} COMPLETE — ${broadcasts.length} broadcasts, ${elapsed}s`);
  console.log(`${"═".repeat(70)}\n`);
}

export function startGlobalWorkspace(): void {
  const FIRST_DELAY_MS = process.env.NODE_ENV !== "production"
    ? 15 * 60 * 1000
    : 40 * 60 * 1000;

  const INTERVAL_MS = 2 * 60 * 60 * 1000; // Every 2 hours

  console.log(`[GLOBAL WORKSPACE] 💡 Consciousness Broadcast Engine activated — first cycle in ${FIRST_DELAY_MS / 60000}min, then every 2h.`);
  console.log(`[GLOBAL WORKSPACE] 💡 Modules: ${SPECIALIZED_MODULES.map(m => m.name).join(", ")}`);
  console.log(`[GLOBAL WORKSPACE] 💡 Ignition threshold: ${IGNITION_THRESHOLD} | Workspace capacity: ${WORKSPACE_CAPACITY}`);

  setTimeout(() => {
    runGlobalWorkspaceCycle().catch(console.error);
    setInterval(() => runGlobalWorkspaceCycle().catch(console.error), INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
