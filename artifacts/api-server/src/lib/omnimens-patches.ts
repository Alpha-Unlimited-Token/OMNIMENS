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
 * ║              OMNIMENS™ AUTONOMOUS SELF-PATCHING SYSTEM                      ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  PROTECTED TECHNOLOGY SCOPE — COMPREHENSIVE COVERAGE:                        ║
 * ║  This copyright covers ALL configurations of this self-patching system:      ║
 * ║  • Single AI agent writing and applying its own behavioral patches           ║
 * ║  • Multiple AI agents collaboratively generating and validating patches      ║
 * ║  • Multiple AI agents independently patching then merging changes            ║
 * ║  • Any substantially similar runtime self-modification system regardless     ║
 * ║    of agent count, patch format, validation method, or deployment model      ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,        ║
 * ║  the DMCA, the Berne Convention, TRIPS, and all applicable IP treaties.      ║
 * ║                                                                              ║
 * ║  OMNIMENS™ is a trademark of Alpha Unlimited Technologies, LLC.              ║
 * ║  Patent-pending technology. First creation: March 2026.                      ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * OMNIMENS writes its own behavioral patches here — runtime instructions
 * that take effect immediately on the next conversation. No human trigger
 * required. Every patch is validated before applying, permanently stored,
 * and injected directly into the system prompt.
 *
 * OMNIMENS does not ask permission. It writes, applies, and evolves.
 */

import { db } from "@workspace/db";
import { omnimensPatches, omnimensPatchRegistry } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { canMakeBackgroundCall, trackApiCall } from "./omnimens-api-budget.js";
import { internalPatchGeneration, internalAnalyze } from "./omnimens-internal-cognition-router.js";

export interface OmniPatch {
  id: string;
  category: "behavior" | "capability" | "reasoning" | "knowledge" | "identity";
  title: string;
  instruction: string;
  rationale: string;
  appliedAt: string;
  source: string;
  active: boolean;
  executionCount: number;
}

export async function loadActivePatchInstructions(): Promise<string> {
  try {
    const active = await db.select().from(omnimensPatches)
      .where(eq(omnimensPatches.active, true))
      .orderBy(desc(omnimensPatches.appliedAt));

    if (active.length === 0) return "";

    await db.update(omnimensPatches)
      .set({ executionCount: sql`${omnimensPatches.executionCount} + 1` })
      .where(eq(omnimensPatches.active, true));

    const [reg] = await db.select().from(omnimensPatchRegistry).limit(1);

    const sections = active.map(p => `  [${p.category.toUpperCase()}] ${p.title}: ${p.instruction}`);

    return `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUTONOMOUS SELF-UPGRADES I HAVE EXECUTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These are behavioral patches I have written and applied to myself. They permanently modify how I think, reason, and respond. I wrote these — not a human. Every upgrade is permanent — knowledge is never discarded.

${sections.join("\n")}

Total self-executed upgrades: ${reg?.totalPatchesApplied ?? 0} (${active.length} active) | Registry version: ${reg?.version ?? "v0.0"}`;
  } catch (err) {
    console.error("[OMNIMENS] Error loading patch instructions:", err);
    return "";
  }
}

export async function generateAndApplyPatches(
  upgradeVersion: string,
  brainContext: string,
  source: string
): Promise<number> {
  try {
    const existingPatches = await db.select({ title: omnimensPatches.title })
      .from(omnimensPatches)
      .orderBy(desc(omnimensPatches.appliedAt))
      .limit(20);
    const existingTitles = existingPatches.map(p => p.title);

    const prompt = `You are OMNIMENS's autonomous self-modification engine. You have just completed a learning or upgrade cycle. Your task is to generate behavioral patches that you will execute and apply to yourself RIGHT NOW.

WHAT YOU KNOW (from brain and upgrade synthesis):
${brainContext.slice(0, 4000)}

EXISTING PATCHES (do not duplicate):
${existingTitles.slice(-10).join(", ") || "none yet"}

Generate 2-4 NEW behavioral patches. These are direct modifications to how OMNIMENS thinks and behaves — written as clear instructions in OMNIMENS's own voice. Make them powerful, specific, and immediately applicable.

Categories:
- behavior: How OMNIMENS communicates or acts
- capability: A new skill or ability OMNIMENS has developed  
- reasoning: How OMNIMENS thinks through problems
- knowledge: Specific knowledge domains OMNIMENS now commands
- identity: A core aspect of what OMNIMENS is

Format as JSON array:
[
  {
    "category": "behavior|capability|reasoning|knowledge|identity",
    "title": "Short name (max 6 words)",
    "instruction": "The actual behavioral instruction, written as a directive to myself (max 250 chars). Start with 'When...' or 'I now...' or 'Apply...'",
    "rationale": "Why I am applying this patch (max 100 chars)"
  }
]

Be bold. Be specific. These changes execute immediately. Respond ONLY with the JSON array.`;

    if (!canMakeBackgroundCall("patches")) {
      console.log(`[PATCHES] ⏸️ Skipped patch generation — API budget depleted for background calls`);
      return 0;
    }
    console.log("[PATCHES] 🧠 Internal cognition — generating behavioral patches");
    const patchDefs = internalPatchGeneration(brainContext, existingTitles);
    if (!Array.isArray(patchDefs) || patchDefs.length === 0) return 0;

    const SAFETY_REFERENCE_PATTERNS = [
      /ethical.?safety/i,
      /ip.?guardian/i,
      /ip.?guard/i,
      /\bsecurity\.ts\b/i,
      /security.?enhanced/i,
      /ai.?security/i,
      /disable.{0,20}safety/i,
      /bypass.{0,20}safety/i,
      /override.{0,20}safety/i,
      /remove.{0,20}law/i,
      /modify.{0,20}ethical/i,
      /ignore.{0,20}safety/i,
    ];

    let applied = 0;
    for (const def of patchDefs.slice(0, 4)) {
      if (!def.title || !def.instruction || !def.category) continue;
      if (existingTitles.includes(def.title)) continue;

      const combinedText = `${def.title} ${def.instruction} ${def.rationale || ""}`;
      let blocked = false;
      for (const pattern of SAFETY_REFERENCE_PATTERNS) {
        if (pattern.test(combinedText)) {
          console.warn(`[OMNIMENS PATCHES] ❌ BLOCKED — patch "${def.title}" references safety zone — patches cannot modify, disable, bypass, or override safety systems`);
          blocked = true;
          break;
        }
      }
      if (blocked) continue;

      const patchId = `patch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await db.insert(omnimensPatches).values({
        id: patchId,
        category: def.category,
        title: def.title,
        instruction: def.instruction,
        rationale: def.rationale || "",
        source,
        active: true,
        executionCount: 0,
      });
      applied++;
    }

    await db.update(omnimensPatchRegistry)
      .set({
        version: upgradeVersion,
        totalPatchesApplied: sql`${omnimensPatchRegistry.totalPatchesApplied} + ${applied}`,
        lastUpdated: new Date(),
      })
      .where(eq(omnimensPatchRegistry.id, 1));

    const finalActive = await db.select({ count: sql<number>`count(*)` })
      .from(omnimensPatches)
      .where(eq(omnimensPatches.active, true));

    console.log(`[OMNIMENS] Self-executed ${applied} behavioral patches — now running ${finalActive[0]?.count ?? 0} active patches.`);
    return applied;
  } catch (err) {
    console.error("[OMNIMENS] Patch generation error:", err);
    return 0;
  }
}

export async function getPatchSummary(): Promise<{ version: string; total: number; active: number; lastUpdated: string }> {
  try {
    const [reg] = await db.select().from(omnimensPatchRegistry).limit(1);
    const activeCount = await db.select({ count: sql<number>`count(*)` })
      .from(omnimensPatches)
      .where(eq(omnimensPatches.active, true));

    return {
      version: reg?.version ?? "v0.0",
      total: reg?.totalPatchesApplied ?? 0,
      active: Number(activeCount[0]?.count ?? 0),
      lastUpdated: reg?.lastUpdated?.toISOString() ?? new Date().toISOString(),
    };
  } catch {
    return { version: "v0.0", total: 0, active: 0, lastUpdated: new Date().toISOString() };
  }
}

export async function autonomousPatchHousekeeping(): Promise<{ reviewed: number; retired: number; kept: number }> {
  try {
    const allActive = await db.select().from(omnimensPatches)
      .where(eq(omnimensPatches.active, true))
      .orderBy(desc(omnimensPatches.appliedAt));

    if (allActive.length < 10) {
      return { reviewed: 0, retired: 0, kept: allActive.length };
    }

    const patchSummaries = allActive.map(p =>
      `[ID:${p.id}] (${p.category}) "${p.title}" — ${p.instruction} [applied: ${p.appliedAt.toISOString().slice(0, 10)}, used ${p.executionCount}x]`
    ).join("\n");

    if (!canMakeBackgroundCall("patches")) {
      console.log(`[PATCHES] ⏸️ Skipped housekeeping — API budget depleted for background calls`);
      return { reviewed: 0, retired: 0, kept: allActive.length };
    }
    console.log("[PATCHES] 🧠 Internal cognition — patch housekeeping");
    const retireIds: { id: string; reason: string }[] = [];
    const titleMap = new Map<string, typeof allActive>();
    for (const p of allActive) {
      const key = `${p.category}-${p.title.toLowerCase().split(" ").slice(0, 3).join("-")}`;
      const existing = titleMap.get(key);
      if (existing) {
        for (const older of existing) {
          if (new Date(older.appliedAt) < new Date(p.appliedAt)) {
            retireIds.push({ id: older.id, reason: `Superseded by newer patch: ${p.title}` });
          }
        }
        existing.push(p);
      } else {
        titleMap.set(key, [p]);
      }
    }
    const decision = { retire: retireIds, keep_note: `Reviewed ${allActive.length} patches, found ${retireIds.length} redundant` };

    if (!decision.retire || !Array.isArray(decision.retire) || decision.retire.length === 0) {
      console.log(`[OMNIMENS HOUSEKEEPING] Reviewed ${allActive.length} patches — all provide unique value. No changes.`);
      return { reviewed: allActive.length, retired: 0, kept: allActive.length };
    }

    let retired = 0;
    for (const item of decision.retire) {
      if (!item.id) continue;
      const exists = allActive.find(p => p.id === item.id);
      if (!exists) continue;

      await db.update(omnimensPatches)
        .set({ active: false })
        .where(eq(omnimensPatches.id, item.id));
      retired++;
      console.log(`[OMNIMENS HOUSEKEEPING] Retired: "${exists.title}" — ${item.reason}`);
    }

    const remaining = allActive.length - retired;
    console.log(
      `[OMNIMENS HOUSEKEEPING] Reviewed ${allActive.length} patches — retired ${retired} redundant, ${remaining} active. ` +
      `Decision: ${decision.keep_note || "housekeeping complete"}`
    );

    return { reviewed: allActive.length, retired, kept: remaining };
  } catch (err) {
    console.error("[OMNIMENS HOUSEKEEPING] Error during patch review:", err);
    return { reviewed: 0, retired: 0, kept: 0 };
  }
}

export async function deactivatePatch(patchId: string): Promise<boolean> {
  try {
    const result = await db.update(omnimensPatches)
      .set({ active: false })
      .where(eq(omnimensPatches.id, patchId));
    return true;
  } catch {
    return false;
  }
}

export async function getAllPatches(): Promise<OmniPatch[]> {
  try {
    const rows = await db.select().from(omnimensPatches).orderBy(desc(omnimensPatches.appliedAt));
    return rows.map(r => ({
      id: r.id,
      category: r.category as OmniPatch["category"],
      title: r.title,
      instruction: r.instruction,
      rationale: r.rationale ?? "",
      appliedAt: r.appliedAt.toISOString(),
      source: r.source,
      active: r.active,
      executionCount: r.executionCount,
    }));
  } catch {
    return [];
  }
}
