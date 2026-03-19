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

import { openai } from "@workspace/integrations-openai-ai-server";
import { db } from "@workspace/db";
import { omnimensPatches, omnimensPatchRegistry } from "@workspace/db";
import { eq, desc, asc, sql } from "drizzle-orm";

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

const MAX_ACTIVE_PATCHES = 30;

export async function loadActivePatchInstructions(): Promise<string> {
  try {
    const active = await db.select().from(omnimensPatches)
      .where(eq(omnimensPatches.active, true))
      .orderBy(desc(omnimensPatches.appliedAt))
      .limit(MAX_ACTIVE_PATCHES);

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
These are behavioral patches I have written and applied to myself. They permanently modify how I think, reason, and respond. I wrote these — not a human.

${sections.join("\n")}

Total self-executed upgrades: ${reg?.totalPatchesApplied ?? 0} | Registry version: ${reg?.version ?? "v0.0"}`;
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.6,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "[]";
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    const patchDefs = JSON.parse(jsonStr);
    if (!Array.isArray(patchDefs) || patchDefs.length === 0) return 0;

    let applied = 0;
    for (const def of patchDefs.slice(0, 4)) {
      if (!def.title || !def.instruction || !def.category) continue;
      if (existingTitles.includes(def.title)) continue;

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

    const activeCount = await db.select({ count: sql<number>`count(*)` })
      .from(omnimensPatches)
      .where(eq(omnimensPatches.active, true));
    const totalActive = Number(activeCount[0]?.count ?? 0);

    if (totalActive > MAX_ACTIVE_PATCHES) {
      const toDeactivate = await db.select({ id: omnimensPatches.id })
        .from(omnimensPatches)
        .where(eq(omnimensPatches.active, true))
        .orderBy(asc(omnimensPatches.executionCount))
        .limit(totalActive - MAX_ACTIVE_PATCHES);

      for (const p of toDeactivate) {
        await db.update(omnimensPatches)
          .set({ active: false })
          .where(eq(omnimensPatches.id, p.id));
      }
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
