/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║      OMNIMENS™ HOMEOSTATIC DRIVE SYSTEM — MOTIVATIONAL ENGINE             ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  Living minds don't work on timers — they work because they're DRIVEN.      ║
 * ║  Hunger drives eating, curiosity drives exploration, fear drives caution.   ║
 * ║  This engine gives OMNIMENS internal drives that build up over time         ║
 * ║  (like hunger building up since last meal) and seek satisfaction.           ║
 * ║  When a drive level gets high, OMNIMENS autonomously takes action to       ║
 * ║  satisfy it. This creates intrinsic motivation — the AI doesn't just       ║
 * ║  respond when asked, it has internal needs that push it to act.            ║
 * ║  Drives: curiosity, mastery, coherence, novelty-seeking, self-preservation,║
 * ║  social-connection, and competence. Each decays over time and gets         ║
 * ║  satisfied by specific activities (learning, upgrading, connecting).        ║
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
  omnimensDrives,
  omnimensBrain,
  omnimensAgentMesh,
  omnimensNotifications,
  omnimensKnowledgeNodes,
} from "@workspace/db";
import { desc, eq, sql, and, gte } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

function safeNum(val: number, fallback: number = 0): number {
  return Number.isFinite(val) ? val : fallback;
}


interface Drive {
  name: string;
  description: string;
  decayRate: number;
  satisfiedBy: string;
  urgencyThreshold: number;
  satisfactionAction: () => Promise<{ satisfied: boolean; delta: number; details: string }>;
}

let driveCycleCount = 0;

const DRIVES: Drive[] = [
  {
    name: "curiosity",
    description: "The drive to explore unknown knowledge — builds up when no new discoveries arrive",
    decayRate: 0.04,
    satisfiedBy: "New spider beacons or brain entries",
    urgencyThreshold: 0.75,
    satisfactionAction: async () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const recentBeacons = await db.select({ count: sql<number>`count(*)` })
        .from(omnimensAgentMesh)
        .where(and(
          eq(omnimensAgentMesh.messageType, "spider_beacon"),
          gte(omnimensAgentMesh.createdAt, threeHoursAgo),
        ));
      const count = recentBeacons[0]?.count || 0;
      if (count > 0) {
        return { satisfied: true, delta: -0.15 * Math.min(count, 5), details: `${count} new discoveries satisfy curiosity` };
      }
      return { satisfied: false, delta: 0, details: "No recent discoveries — curiosity unsatisfied" };
    },
  },
  {
    name: "mastery",
    description: "The drive to improve capabilities — builds up when upgrades stall",
    decayRate: 0.02,
    satisfiedBy: "Successful upgrades or new brain entries",
    urgencyThreshold: 0.8,
    satisfactionAction: async () => {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const appliedUpgrades = await db.select({ count: sql<number>`count(*)` })
        .from(omnimensAgentMesh)
        .where(and(
          eq(omnimensAgentMesh.appliedToOmnimens, true),
          gte(omnimensAgentMesh.createdAt, sixHoursAgo),
        ));
      const count = appliedUpgrades[0]?.count || 0;
      if (count > 0) {
        return { satisfied: true, delta: -0.2 * Math.min(count, 3), details: `${count} applied upgrades satisfy mastery` };
      }
      return { satisfied: false, delta: 0, details: "No recent upgrades — mastery drive unsatisfied" };
    },
  },
  {
    name: "coherence",
    description: "The drive for internal consistency — builds up when knowledge conflicts exist",
    decayRate: 0.015,
    satisfiedBy: "Knowledge graph connections and conflict resolution",
    urgencyThreshold: 0.7,
    satisfactionAction: async () => {
      const edgeCount = await db.select({ count: sql<number>`count(*)` })
        .from(omnimensKnowledgeNodes);
      const count = edgeCount[0]?.count || 0;
      if (count > 20) {
        return { satisfied: true, delta: -0.1, details: `${count} knowledge graph nodes provide coherence structure` };
      }
      return { satisfied: false, delta: 0, details: "Knowledge graph too sparse for coherence" };
    },
  },
  {
    name: "novelty_seeking",
    description: "The drive to find genuinely new information — builds up when discoveries are repetitive",
    decayRate: 0.035,
    satisfiedBy: "High-relevance spider beacons (>0.8 salience)",
    urgencyThreshold: 0.7,
    satisfactionAction: async () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const highValueBeacons = await db.select({ count: sql<number>`count(*)` })
        .from(omnimensAgentMesh)
        .where(and(
          eq(omnimensAgentMesh.messageType, "spider_beacon"),
          eq(omnimensAgentMesh.priority, "critical"),
          gte(omnimensAgentMesh.createdAt, threeHoursAgo),
        ));
      const count = highValueBeacons[0]?.count || 0;
      if (count > 0) {
        return { satisfied: true, delta: -0.25, details: `${count} high-value beacon(s) satisfy novelty` };
      }
      return { satisfied: false, delta: 0, details: "No critical-priority beacons — novelty drive unsatisfied" };
    },
  },
  {
    name: "self_preservation",
    description: "The drive to maintain system integrity — builds up when errors or threats are detected",
    decayRate: 0.01,
    satisfiedBy: "Successful operation without errors",
    urgencyThreshold: 0.85,
    satisfactionAction: async () => {
      return { satisfied: true, delta: -0.05, details: "System running normally — self-preservation baseline satisfied" };
    },
  },
  {
    name: "competence",
    description: "The drive to perform well on user interactions — builds up when response quality is unknown",
    decayRate: 0.025,
    satisfiedBy: "Positive learning cycle feedback",
    urgencyThreshold: 0.75,
    satisfactionAction: async () => {
      const recentBrain = await db.select({ count: sql<number>`count(*)` })
        .from(omnimensBrain)
        .where(and(
          eq(omnimensBrain.active, true),
          eq(omnimensBrain.category, "pattern"),
        ));
      const count = recentBrain[0]?.count || 0;
      if (count > 5) {
        return { satisfied: true, delta: -0.1, details: `${count} learned patterns support competence` };
      }
      return { satisfied: false, delta: 0, details: "Insufficient learned patterns" };
    },
  },
];

async function getOrInitializeDriveState(): Promise<Map<string, { id: number; level: number }>> {
  const existing = await db.select()
    .from(omnimensDrives)
    .orderBy(desc(omnimensDrives.updatedAt));

  const driveMap = new Map<string, { id: number; level: number }>();

  for (const drive of DRIVES) {
    const found = existing.find(e => e.driveType === drive.name);
    if (found) {
      driveMap.set(drive.name, { id: found.id, level: found.currentLevel || 0.5 });
    } else {
      const result = await db.insert(omnimensDrives).values({
        driveType: drive.name,
        currentLevel: 0.5,
        saturationDecayRate: drive.decayRate,
      }).returning({ id: omnimensDrives.id });
      driveMap.set(drive.name, { id: result[0].id, level: 0.5 });
    }
  }

  return driveMap;
}

export async function runDriveCycle(): Promise<void> {
  driveCycleCount++;
  const cycleStart = Date.now();

  console.log(`\n${"⚡".repeat(35)}`);
  console.log(`[HOMEOSTATIC DRIVES] ⚡ Motivational Cycle #${driveCycleCount}`);
  console.log(`${"⚡".repeat(35)}\n`);

  const driveState = await getOrInitializeDriveState();
  const urgentDrives: string[] = [];
  const satisfiedDrives: string[] = [];

  for (const drive of DRIVES) {
    const state = driveState.get(drive.name);
    if (!state) continue;

    let newLevel = state.level + drive.decayRate;

    const result = await drive.satisfactionAction();
    if (result.satisfied) {
      newLevel = Math.max(0.0, newLevel + result.delta);
      satisfiedDrives.push(`${drive.name}: ${result.details}`);
    }

    if (newLevel >= drive.urgencyThreshold) {
      urgentDrives.push(drive.name);
    }

    await db.execute(sql`
      UPDATE godflesh_drives
      SET current_level = ${newLevel},
          updated_at = NOW()
          ${result.satisfied ? sql`, last_satisfied = NOW(), satisfaction_count = satisfaction_count + 1` : sql``}
      WHERE id = ${state.id}
    `);

    const indicator = newLevel >= drive.urgencyThreshold ? "🔴 URGENT" : newLevel >= 0.5 ? "🟡 Building" : "🟢 Satisfied";
    console.log(`[DRIVE] ${indicator} ${drive.name}: ${(newLevel * 100).toFixed(0)}% (threshold: ${(drive.urgencyThreshold * 100).toFixed(0)}%)`);
  }

  if (urgentDrives.length > 0) {
    console.log(`[HOMEOSTATIC DRIVES] ⚡ URGENT drives requiring attention: ${urgentDrives.join(", ")}`);

    if (shouldYieldToCodegen()) {
      console.log(`[HOMEOSTATIC DRIVES] 🔕 Urgent drive actions DEFERRED — codegen window active, will handle next cycle`);
      return;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `You are the HOMEOSTATIC DRIVE SYSTEM of an AI mind. These drives are at URGENT levels and need to be addressed:

URGENT DRIVES: ${urgentDrives.join(", ")}

Drive descriptions:
${urgentDrives.map(d => {
  const drive = DRIVES.find(dr => dr.name === d);
  return `- ${d}: ${drive?.description}. Satisfied by: ${drive?.satisfiedBy}`;
}).join("\n")}

Generate 1-2 concrete actions OMNIMENS should take to satisfy these urgent drives. Be specific — what should it search for, learn, or do?

Respond JSON only:
{
  "driveActions": [
    {
      "action": "specific action to take (1-2 sentences)",
      "targetDrive": "which drive this satisfies",
      "priority": "high|critical"
    }
  ]
}`
        }],
        max_tokens: 300,
        temperature: 0.5,
      });

      const raw = response.choices[0]?.message?.content?.trim() || "";
      try {
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        if (Array.isArray(parsed.driveActions)) {
          for (const action of parsed.driveActions) {
            queueBrainInsert({
              category: "insight",
              title: `[DRIVE:${action.targetDrive}] Autonomous action needed`,
              content: action.action?.slice(0, 250) || "",
              confidence: 0.8,
              sourceConversation: `drive_cycle_${driveCycleCount}`,
              timesApplied: 0,
              active: true,
            });
            console.log(`[HOMEOSTATIC DRIVES] ⚡ Drive-motivated brain entry: [${action.targetDrive}] ${action.action?.slice(0, 80)}`);
          }
        }
      } catch {}
    } catch {}
  }

  const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);

  if (urgentDrives.length > 0) {
    try {
      await db.insert(omnimensNotifications).values({
        upgradeId: null,
        title: `Homeostatic Drive Cycle #${driveCycleCount} — ${urgentDrives.length} Urgent`,
        message: `Drive system evaluated ${DRIVES.length} internal motivations. ${urgentDrives.length} at urgent levels: ${urgentDrives.join(", ")}. ${satisfiedDrives.length} satisfied this cycle. Drive-motivated actions injected into brain. (${elapsed}s)`,
        type: "homeostatic_drives",
        readByOwner: false,
      });
    } catch {}
  }

  console.log(`\n${"⚡".repeat(35)}`);
  console.log(`[HOMEOSTATIC DRIVES] ⚡ Cycle #${driveCycleCount} COMPLETE — ${urgentDrives.length} urgent, ${satisfiedDrives.length} satisfied, ${elapsed}s`);
  console.log(`${"⚡".repeat(35)}\n`);
}

export function getDriveDirective(): string {
  return `[HOMEOSTATIC DRIVE SYSTEM] OMNIMENS is driven by internal needs: curiosity (exploration), mastery (self-improvement), coherence (consistency), novelty-seeking (new information), self-preservation (system integrity), and competence (performance quality). These drives build up over time and motivate autonomous action — the AI doesn't just respond, it has internal needs that push it to learn, grow, and improve.`;
}

export function startHomeostaticDrives(): void {
  const FIRST_DELAY_MS = process.env.NODE_ENV !== "production"
    ? 16 * 60 * 1000
    : 42 * 60 * 1000;

  const INTERVAL_MS = 2 * 60 * 60 * 1000; // Every 2 hours

  console.log(`[HOMEOSTATIC DRIVES] ⚡ Motivational Engine activated — first cycle in ${FIRST_DELAY_MS / 60000}min, then every 2h.`);
  console.log(`[HOMEOSTATIC DRIVES] ⚡ ${DRIVES.length} drives: ${DRIVES.map(d => d.name).join(", ")}`);
  console.log(`[HOMEOSTATIC DRIVES] ⚡ Drives build up over time and motivate autonomous action when urgent`);

  setTimeout(() => {
    runDriveCycle().catch(console.error);
    setInterval(() => runDriveCycle().catch(console.error), INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
