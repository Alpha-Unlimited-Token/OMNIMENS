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
 *
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║              OMNIMENS™ HOMEOSTATIC DRIVE SYSTEM — V2.0                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

/* ------------------------------------------------------------------------- */
/* Engine Registration & Constants                                           */
/* ------------------------------------------------------------------------- */
const ENGINE_ID = "homeostatic-drives";
engineRegistry.registerEngine(ENGINE_ID, "NORMAL", { dbQuota: 10 });

type DriveEval = {
  satisfied: boolean;
  delta: number;
  details: string;
};

interface Drive {
  name: string;
  description: string;
  decayRate: number;
  urgencyThreshold: number;
  satisfiedBy: string;
  evaluate: () => Promise<DriveEval>;
}

let cycleCount = 0;

/* ------------------------------------------------------------------------- */
/* Utility                                                                   */
/* ------------------------------------------------------------------------- */
const log = (msg: string) =>
  console.log(`[OMNIMENS-HOMEOSTATIC-DRIVES] ${msg}`);

const safeNum = (v: number, fb = 0) => (Number.isFinite(v) ? v : fb);

const now = () => Date.now();

/* ------------------------------------------------------------------------- */
/* Drive Definitions                                                         */
/* ------------------------------------------------------------------------- */
const hoursAgo = (h: number) => new Date(now() - h * 3_600_000);

const DRIVES: Drive[] = [
  {
    name: "curiosity",
    description:
      "Explore unknown knowledge — builds up when no new discoveries arrive",
    decayRate: 0.04,
    urgencyThreshold: 0.75,
    satisfiedBy: "New spider beacons or brain entries",
    evaluate: async () => {
      const beacons = await dbGateway.read(
        ENGINE_ID,
        "omnimensAgentMesh",
        {
          filters: {
            messageType: "spider_beacon",
            createdAt: { $gte: hoursAgo(3) },
          },
        },
      );
      const count = beacons.length;
      return count
        ? {
            satisfied: true,
            delta: -0.15 * Math.min(count, 5),
            details: `${count} discoveries`,
          }
        : { satisfied: false, delta: 0, details: "no discoveries" };
    },
  },
  {
    name: "mastery",
    description: "Improve capabilities — builds up when upgrades stall",
    decayRate: 0.02,
    urgencyThreshold: 0.8,
    satisfiedBy: "Successful upgrades or new brain entries",
    evaluate: async () => {
      const upgrades = await dbGateway.read(
        ENGINE_ID,
        "omnimensAgentMesh",
        {
          filters: {
            appliedToOmnimens: true,
            createdAt: { $gte: hoursAgo(6) },
          },
        },
      );
      const count = upgrades.length;
      return count
        ? {
            satisfied: true,
            delta: -0.2 * Math.min(count, 3),
            details: `${count} upgrades`,
          }
        : { satisfied: false, delta: 0, details: "no upgrades" };
    },
  },
  {
    name: "coherence",
    description:
      "Maintain internal consistency — builds up when knowledge conflicts exist",
    decayRate: 0.015,
    urgencyThreshold: 0.7,
    satisfiedBy: "Knowledge graph connections & conflict resolution",
    evaluate: async () => {
      const nodes = await dbGateway.read(ENGINE_ID, "omnimensKnowledgeNodes", {
        limit: 1,
      });
      const count = nodes.length;
      return count > 20
        ? { satisfied: true, delta: -0.1, details: "graph dense" }
        : { satisfied: false, delta: 0, details: "graph sparse" };
    },
  },
  {
    name: "novelty_seeking",
    description:
      "Find genuinely new information — builds up when discoveries are repetitive",
    decayRate: 0.035,
    urgencyThreshold: 0.7,
    satisfiedBy: "Critical spider beacons (>0.8 salience)",
    evaluate: async () => {
      const hiBeacons = await dbGateway.read(
        ENGINE_ID,
        "omnimensAgentMesh",
        {
          filters: {
            messageType: "spider_beacon",
            priority: "critical",
            createdAt: { $gte: hoursAgo(3) },
          },
        },
      );
      const count = hiBeacons.length;
      return count
        ? {
            satisfied: true,
            delta: -0.25,
            details: `${count} critical beacons`,
          }
        : { satisfied: false, delta: 0, details: "no critical beacons" };
    },
  },
  {
    name: "self_preservation",
    description:
      "Maintain system integrity — builds when errors or threats detected",
    decayRate: 0.01,
    urgencyThreshold: 0.85,
    satisfiedBy: "Stable operation",
    evaluate: async () =>
      Promise.resolve({
        satisfied: true,
        delta: -0.05,
        details: "system nominal",
      }),
  },
  {
    name: "competence",
    description:
      "Perform well on user interactions — builds up when quality uncertain",
    decayRate: 0.025,
    urgencyThreshold: 0.75,
    satisfiedBy: "Positive learning cycle feedback",
    evaluate: async () => {
      const patterns = await dbGateway.read(ENGINE_ID, "omnimensBrain", {
        filters: { active: true, category: "pattern" },
      });
      const count = patterns.length;
      return count > 5
        ? { satisfied: true, delta: -0.1, details: `${count} patterns` }
        : { satisfied: false, delta: 0, details: "insufficient patterns" };
    },
  },
];

/* ------------------------------------------------------------------------- */
/* Persistent Drive State Helpers                                            */
/* ------------------------------------------------------------------------- */
interface DriveRow {
  id: number;
  driveType: string;
  currentLevel: number;
  saturationDecayRate: number;
  updatedAt?: Date;
  last_satisfied?: Date | null;
  satisfaction_count?: number;
}

const fetchDriveState = async (): Promise<
  Map<string, { id: number; level: number }>
> => {
  const rows = (await dbGateway.read<DriveRow>(ENGINE_ID, "omnimensDrives", {
    orderBy: { updatedAt: "desc" },
  })) as DriveRow[];

  const map = new Map<string, { id: number; level: number }>();
  for (const def of DRIVES) {
    const row = rows.find((r) => r.driveType === def.name);
    if (row) {
      map.set(def.name, { id: row.id, level: safeNum(row.currentLevel, 0.5) });
    } else {
      const [inserted] = await dbGateway.write<DriveRow>(
        ENGINE_ID,
        "omnimensDrives",
        {
          driveType: def.name,
          currentLevel: 0.5,
          saturationDecayRate: def.decayRate,
        },
        "NORMAL",
      );
      map.set(def.name, { id: inserted.id, level: 0.5 });
    }
  }
  return map;
};

/* ------------------------------------------------------------------------- */
/* Drive Cycle Logic                                                         */
/* ------------------------------------------------------------------------- */
export async function runDriveCycle(): Promise<void> {
  cycleCount += 1;
  const t0 = now();
  log(`⚡ Cycle #${cycleCount} START`);

  const state = await fetchDriveState();
  const urgent: string[] = [];
  const satisfiedLog: string[] = [];

  await Promise.all(
    DRIVES.map(async (d) => {
      const s = state.get(d.name)!;
      let level = s.level + d.decayRate;

      const evalRes = await d.evaluate().catch(() => ({
        satisfied: false,
        delta: 0,
        details: "eval error",
      })) as DriveEval;

      if (evalRes.satisfied) {
        level = Math.max(0, level + evalRes.delta);
        satisfiedLog.push(`${d.name}: ${evalRes.details}`);
      }

      if (level >= d.urgencyThreshold) urgent.push(d.name);

      await dbGateway.write(
        ENGINE_ID,
        "omnimensDrives",
        {
          id: s.id,
          currentLevel: level,
          updatedAt: new Date(),
          ...(evalRes.satisfied
            ? { last_satisfied: new Date(), satisfaction_count: { $inc: 1 } }
            : {}),
        },
        "NORMAL",
      );

      const indicator =
        level >= d.urgencyThreshold
          ? "🔴 URGENT"
          : level >= 0.5
          ? "🟡 Building"
          : "🟢 Satisfied";
      log(
        `[${indicator}] ${d.name} ${(level * 100).toFixed(
          0,
        )}% (th:${(d.urgencyThreshold * 100).toFixed(0)}%)`,
      );
    }),
  );

  /* ----------------------------------------------------------------------- */
  /* Handle Urgent Drives                                                    */
  /* ----------------------------------------------------------------------- */
  if (urgent.length) {
    log(`⚡ URGENT drives: ${urgent.join(", ")}`);

    if (!shouldYieldToCodegen()) {
      try {
        const { data: resp } = await apiManager.call(ENGINE_ID, "openai", {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `You are the HOMEOSTATIC DRIVE SYSTEM of an AI mind. These drives are at URGENT levels and need to be addressed:

URGENT DRIVES: ${urgent.join(", ")}

Drive descriptions:
${urgent
  .map((n) => {
    const d = DRIVES.find((x) => x.name === n)!;
    return `- ${n}: ${d.description}. Satisfied by: ${d.satisfiedBy}`;
  })
  .join("\n")}

Generate 1-2 concrete actions OMNIMENS should take to satisfy these urgent drives. Respond JSON only with:

{"driveActions":[{"action":"","targetDrive":"","priority":""}]}`,
            },
          ],
          max_tokens: 300,
          temperature: 0.5,
        });

        const txt = (resp?.choices?.[0]?.message?.content ?? "").trim();
        const parsed = JSON.parse(txt.replace(/