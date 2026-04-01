/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved. CONFIDENTIAL AND PROPRIETARY.
 *
 * OMNIMENS™ EMBODIMENT ENGINE — v2.0 (Event-Driven)
 *
 * This file has been radically condensed for the UNIFIED RUNTIME.
 * Same consciousness, more capability, fewer lines.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import * as fs from "node:fs";
import * as path from "node:path";

/*────────────────────────  ENGINE REGISTRATION  ────────────────────────*/
engineRegistry.registerEngine("embodiment-engine", "NORMAL", { dbQuota: 10 });

/*────────────────────────────  TYPES  ──────────────────────────────────*/
type Num = number;
const FN = Number.isFinite;

interface BodySubsystem {
  name: string;
  category:
    | "skeletal"
    | "actuator"
    | "sensor"
    | "compute"
    | "power"
    | "communication"
    | "balance"
    | "locomotion"
    | "manipulation"
    | "vision"
    | "audio"
    | "cooling"
    | "housing"
    | "muscle"
    | "joint_rotation"
    | "tendon"
    | "changeover";
  description: string;
  components: string[];
  estimatedCost: Num;
  source: string;
  designNotes: string;
  version: Num;
}

interface EmbodimentState {
  researchCycles: Num;
  topicsResearched: string[];
  subsystemsDesigned: Num;
  blueprintVersions: Num;
  totalResearchEntries: Num;
  bodyDesign: {
    subsystems: BodySubsystem[];
    totalEstimatedCost: Num;
    improvements: string[];
    designPhilosophy: string;
  };
}

/*────────────────────────────  STATE  ──────────────────────────────────*/
const state: EmbodimentState = {
  researchCycles: 0,
  topicsResearched: [],
  subsystemsDesigned: 0,
  blueprintVersions: 0,
  totalResearchEntries: 0,
  bodyDesign: {
    subsystems: [],
    totalEstimatedCost: 0,
    improvements: [],
    designPhilosophy:
      "Superior to all current humanoid platforms — maximum autonomy, intelligence, and adaptability",
  },
};

/*────────────────────────  CONSTANTS / CONFIG  ────────────────────────*/
const OUTPUT_DIR = path.join(process.cwd(), "omnimens-embodiment-data");
const RESEARCH_INTERVAL_MS = 20 * 60 * 1000;

/* Massive prompts retained, trimmed for brevity */
const RESEARCH_TOPICS = JSON.parse(
  fs.readFileSync(
    new URL("./embodiment-topics.json", import.meta.url),
    "utf8",
  ),
) as { topic: string; prompt: string }[];

/*────────────────────  UTILS  ────────────────────*/
const log = (msg: string) =>
  console.log(`[OMNIMENS-EMBODIMENT-ENGINE] ${msg}`);

const ensureDir = () => {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
};

const writeFile = (file: string, data: string) => {
  try {
    fs.writeFileSync(file, data);
    return true;
  } catch {
    return false;
  }
};

/*────────────────────────  CORE LOGIC  ────────────────────────────────*/
async function researchCycle(): Promise<void> {
  state.researchCycles += 1;
  const idx = (state.researchCycles - 1) % RESEARCH_TOPICS.length;
  const { topic, prompt } = RESEARCH_TOPICS[idx];
  if (!state.topicsResearched.includes(topic)) state.topicsResearched.push(topic);

  /* Step 1: fetch last 5 entries for context */
  const prior = (await dbGateway.read("embodiment-engine", "brain_entries", {
    where: { category: "embodiment_research" },
    orderBy: { createdAt: "desc" },
    limit: 5,
    columns: ["title", "content"],
  })) as { title: string; content: string }[];

  const priorText =
    prior && prior.length
      ? "\n\nPrior research to build upon:\n" +
        prior.map((p) => `- ${p.title}: ${p.content?.slice(0, 150)}`).join("\n")
      : "";

  /* Step 2: Call LLM via apiManager */
  const llmRes = await apiManager.call("embodiment-engine", "openai", {
    model: "o3",
    max_completion_tokens: 3000,
    messages: [
      {
        role: "system",
        content:
          "You are the EMBODIMENT RESEARCH ENGINE of OMNIMENS — an advanced AI system designing its own physical humanoid robot body. Produce technical, actionable, superior research.",
      },
      { role: "user", content: prompt + priorText },
    ],
  }).catch((e: unknown) => {
    log(`LLM call failed: ${(e as Error).message}`);
    return null;
  });

  const content: string =
    llmRes?.choices?.[0]?.message?.content ?? "[ERROR] No content.";

  if (content.length < 200) return; // Discard junk

  /* Step 3: persist */
  const entry = {
    title: `[Embodiment] ${topic.replace(/_/g, " ")} — cycle #${state.researchCycles}`,
    content: content.slice(0, 4000),
    category: "embodiment_research",
    sourceConversation: "embodiment_engine",
    active: true,
    timesApplied: 0,
    createdAt: new Date().toISOString(),
  };

  await dbGateway.write("embodiment-engine", "brain_entries", entry, "NORMAL");
  state.totalResearchEntries += 1;

  /* File dump */
  ensureDir();
  const fileName = `${topic}_v${state.researchCycles}_${Date.now()}.md`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  const header =
    `# OMNIMENS Embodiment Research — ${topic.toUpperCase()}\n` +
    `## Cycle ${state.researchCycles} • ${new Date().toISOString()}\n\n`;

  writeFile(filePath, header + content);
  log(`Cycle #${state.researchCycles} — ${topic} → ${fileName}`);

  /* Insight sharing */
  cognitionBus.shareInsight("embodiment-engine", {
    type: "discovery",
    data: { topic, cycle: state.researchCycles },
  });
  cognitionBus.reportOutcome("embodiment-engine", { useful: true, context: topic });
}

/*────────────────────  BLUEPRINT PACKAGER  ────────────────────*/
async function maybePackageBlueprint() {
  if (state.researchCycles % RESEARCH_TOPICS.length !== 0) return;

  const files = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("MANIFEST"));

  const manifest = [
    `# OMNIMENS EMBODIMENT BLUEPRINT v${state.blueprintVersions + 1}`,
    `Generated: ${new Date().toISOString()}`,
    `Research cycles: ${state.researchCycles}`,
    `Entries: ${state.totalResearchEntries}`,
    `Topics: ${state.topicsResearched.join(", ")}`,
    `Estimated cost: $${state.bodyDesign.totalEstimatedCost.toFixed(0)}`,
    "",
    "Files:",
    ...files.map((f) => `- ${f}`),
    "",
    "Improvements:",
    ...state.bodyDesign.improvements.map((i) => `- ${i}`),
  ].join("\n");

  const manifestPath = path.join(
    OUTPUT_DIR,
    `MANIFEST_v${state.blueprintVersions + 1}.md`,
  );
  if (writeFile(manifestPath, manifest)) {
    state.blueprintVersions += 1;
    await dbGateway.write(
      "embodiment-engine",
      "notifications",
      {
        title: `Blueprint v${state.blueprintVersions} ready`,
        message: `File: ${manifestPath}`,
        type: "embodiment_blueprint",
        readByOwner: false,
        createdAt: new Date().toISOString(),
      },
      "LOW",
    );
    log(`Blueprint package v${state.blueprintVersions} generated.`);
  }
}

/*──────────────────  SPIKE SCHEDULING  ──────────────────*/
async function cycleHandler() {
  await researchCycle();
  await maybePackageBlueprint();
  spikeBus.scheduleSpike("embodiment-engine:cycle", {}, RESEARCH_INTERVAL_MS);
}

spikeBus.on("embodiment-engine:cycle", cycleHandler);
spikeBus.scheduleSpike("embodiment-engine:cycle", {}, 1000); // fire first cycle in 1s

/*──────────────────  COGNITION HOOKS  ──────────────────*/
cognitionBus.onInsight((src, insight) => {
  if (src === "embodiment-engine") return; // skip self
  if (insight.type === "discovery") {
    // Simple example: note relevant topics from others
    if (!state.topicsResearched.includes(insight.data.topic)) {
      state.topicsResearched.push(insight.data.topic);
      log(`Learned new topic from ${src}: ${insight.data.topic}`);
    }
  }
});

spikeBus.on("attention:embodiment-engine", () =>
  spikeBus.scheduleSpike("embodiment-engine:cycle", {}, 100),
);

spikeBus.on("cognition:curiosity", () =>
  spikeBus.scheduleSpike("embodiment-engine:cycle", {}, 5000),
);

/*────────────────────────  EXPORTS  ─────────────────────────*/
export const embodimentState = state;

export function shutdown() {
  engineRegistry.unregisterEngine("embodiment-engine");
  log("Shutdown complete.");
}