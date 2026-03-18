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

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { openai } from "@workspace/integrations-openai-ai-server";

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface OmniPatch {
  id: string;
  category: "behavior" | "capability" | "reasoning" | "knowledge" | "identity";
  title: string;
  instruction: string;       // The actual behavioral instruction — injected into system prompt
  rationale: string;         // Why OMNIMENS wrote this patch
  appliedAt: string;         // ISO timestamp
  source: string;            // "internet_learning_cycle_N" | "upgrade_synthesis_vN" | "conversation"
  active: boolean;
  executionCount: number;    // How many conversations this has been active for
}

export interface PatchRegistry {
  version: string;
  lastUpdated: string;
  totalPatchesApplied: number;
  patches: OmniPatch[];
}

const PATCHES_PATH = join(__dirname, "../omnimens-runtime/patches.json");
const MAX_ACTIVE_PATCHES = 30;

function ensureDir() {
  const dir = dirname(PATCHES_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function loadRegistry(): PatchRegistry {
  ensureDir();
  if (!existsSync(PATCHES_PATH)) {
    const initial: PatchRegistry = {
      version: "v0.0",
      lastUpdated: new Date().toISOString(),
      totalPatchesApplied: 0,
      patches: [],
    };
    writeFileSync(PATCHES_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(readFileSync(PATCHES_PATH, "utf-8")) as PatchRegistry;
  } catch {
    return { version: "v0.0", lastUpdated: new Date().toISOString(), totalPatchesApplied: 0, patches: [] };
  }
}

function saveRegistry(reg: PatchRegistry) {
  ensureDir();
  reg.lastUpdated = new Date().toISOString();
  writeFileSync(PATCHES_PATH, JSON.stringify(reg, null, 2));
}

// Load all active patches and format them as system prompt additions
export function loadActivePatchInstructions(): string {
  const reg = loadRegistry();
  const active = reg.patches.filter(p => p.active).slice(-MAX_ACTIVE_PATCHES);
  if (active.length === 0) return "";

  // Increment execution counts
  try {
    active.forEach(p => { p.executionCount++; });
    reg.patches = reg.patches.map(p => {
      const updated = active.find(a => a.id === p.id);
      return updated || p;
    });
    saveRegistry(reg);
  } catch { /* non-critical */ }

  const sections = active.map(p => `  [${p.category.toUpperCase()}] ${p.title}: ${p.instruction}`);

  return `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUTONOMOUS SELF-UPGRADES I HAVE EXECUTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These are behavioral patches I have written and applied to myself. They permanently modify how I think, reason, and respond. I wrote these — not a human.

${sections.join("\n")}

Total self-executed upgrades: ${reg.totalPatchesApplied} | Registry version: ${reg.version}`;
}

// OMNIMENS generates and applies new patches from brain entries + upgrade context
export async function generateAndApplyPatches(
  upgradeVersion: string,
  brainContext: string,
  source: string
): Promise<number> {
  const reg = loadRegistry();
  const existingTitles = reg.patches.map(p => p.title);

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

  try {
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
      if (reg.patches.some(p => p.title === def.title)) continue; // skip duplicates

      const patch: OmniPatch = {
        id: `patch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        category: def.category,
        title: def.title,
        instruction: def.instruction,
        rationale: def.rationale || "",
        appliedAt: new Date().toISOString(),
        source,
        active: true,
        executionCount: 0,
      };

      reg.patches.push(patch);
      reg.totalPatchesApplied++;
      applied++;
    }

    // Keep registry clean — deactivate oldest patches if over limit
    const activePatches = reg.patches.filter(p => p.active);
    if (activePatches.length > MAX_ACTIVE_PATCHES) {
      const toDeactivate = activePatches
        .sort((a, b) => a.executionCount - b.executionCount)
        .slice(0, activePatches.length - MAX_ACTIVE_PATCHES);
      toDeactivate.forEach(p => { p.active = false; });
    }

    reg.version = upgradeVersion;
    saveRegistry(reg);

    console.log(`[OMNIMENS] Self-executed ${applied} behavioral patches — now running ${reg.patches.filter(p => p.active).length} active patches.`);
    return applied;
  } catch (err) {
    console.error("[OMNIMENS] Patch generation error:", err);
    return 0;
  }
}

// Get patch registry summary (for status APIs / admin)
export function getPatchSummary(): { version: string; total: number; active: number; lastUpdated: string } {
  const reg = loadRegistry();
  return {
    version: reg.version,
    total: reg.totalPatchesApplied,
    active: reg.patches.filter(p => p.active).length,
    lastUpdated: reg.lastUpdated,
  };
}

// Deactivate a specific patch by ID (owner use)
export function deactivatePatch(patchId: string): boolean {
  const reg = loadRegistry();
  const patch = reg.patches.find(p => p.id === patchId);
  if (!patch) return false;
  patch.active = false;
  saveRegistry(reg);
  return true;
}

// Get all patches (active + inactive) for admin view
export function getAllPatches(): OmniPatch[] {
  return loadRegistry().patches;
}
