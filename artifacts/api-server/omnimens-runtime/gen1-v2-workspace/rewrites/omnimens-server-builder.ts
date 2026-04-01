/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * CONFIDENTIAL AND PROPRIETARY – All Rights Reserved.
 */

////////////////////////////////////////////////////////////////////////////////
// OMNIMENS™ SERVER BUILDER  v2.0 — Unified Runtime Edition (condensed)
////////////////////////////////////////////////////////////////////////////////

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { webSearch, formatSearchResults } from "./web-search.js";
import { shouldYieldToCodegen, isGen2FocusMode } from "./omnimens-nextgen-sandbox.js";

////////////////////////////////////////////////////////////////////////////////
// Engine registration & constants
////////////////////////////////////////////////////////////////////////////////

engineRegistry.registerEngine("server-builder", "NORMAL", { dbQuota: 10 });

const log = (...msg: any[]) => console.log("[OMNIMENS-SERVER-BUILDER]", ...msg);

const RESEARCH_CYCLE_MS = 30 * 60 * 1_000;

const PHYSICAL_SEARCHES = [
  "best GPU for running local AI models LLM inference 24GB VRAM budget build Alibaba AliExpress",
  "cheapest AI server GPU parts Alibaba AliExpress Temu DHgate wholesale bulk pricing 2025 2026",
  "budget server build AI machine learning GPU workstation parts Alibaba wholesale deals",
  "refurbished enterprise server AI cheap GPU computing eBay AliExpress DHgate deals",
  "best value NVMe SSD DDR5 RAM AI server build AliExpress Temu cheapest price",
  "cheap home AI server running 70B parameter models budget GPU AliExpress Alibaba",
  "wholesale GPU server parts Alibaba DHgate AliExpress AI inference NVIDIA RTX A6000 deals",
  "NVIDIA RTX 4090 cheapest price Alibaba AliExpress DHgate wholesale 2026",
  "AMD Instinct MI250 MI300 cheap wholesale Alibaba server GPU AI training",
  "used Tesla V100 A100 GPU cheap eBay AliExpress refurbished AI inference deal",
  "cheapest 128GB DDR5 ECC server RAM AliExpress Alibaba wholesale 2026",
];

const VIRTUAL_SEARCHES = [
  "cheapest cloud GPU server AI inference pricing comparison 2025 2026",
  "RunPod vs Lambda vs Hetzner vs Vast.ai GPU cloud server pricing AI workloads",
  "cheapest dedicated GPU server hosting AI models monthly rental 24GB VRAM",
  "cheapest A100 H100 cloud rental per hour 2026 comparison",
  "budget GPU cloud providers AI training inference cheapest monthly dedicated server",
];

////////////////////////////////////////////////////////////////////////////////
// Types
////////////////////////////////////////////////////////////////////////////////

export interface ServerComponent {
  name: string;
  category:
    | "cpu"
    | "gpu"
    | "ram"
    | "storage"
    | "motherboard"
    | "psu"
    | "case"
    | "cooling"
    | "networking"
    | "misc";
  specifications: string;
  estimatedCostUSD: number;
  costEffectiveSource: string;
  sourceUrl: string | null;
  alternativeSource: string | null;
  reasoning: string;
  priority: "essential" | "recommended" | "optional";
}

export interface VirtualServerConfig {
  purpose: string;
  architecture: string;
  services: string[];
  estimatedSpecs: {
    vcpus: number;
    ramGB: number;
    storageGB: number;
    gpuVRAM: number | null;
  };
  softwareStack: string[];
  monthlyEstimateCost: number;
  scalingStrategy: string;
}

export interface ServerBuildPlan {
  id: number;
  planType: "physical" | "virtual";
  title: string;
  purpose: string;
  totalEstimatedCost: number;
  components: ServerComponent[];
  virtualConfig: VirtualServerConfig | null;
  buildInstructions: string[];
  currentPhase:
    | "research"
    | "planning"
    | "component_selection"
    | "optimization"
    | "ready"
    | "in_progress";
  progress: number;
  notes: string[];
  createdAt: number;
  lastUpdated: number;
}

export interface BuilderState {
  totalPlans: number;
  activePlan: ServerBuildPlan | null;
  researchCycles: number;
  lastResearchTime: number;
  componentDatabase: ServerComponent[];
  insights: string[];
}

////////////////////////////////////////////////////////////////////////////////
// In-memory state
////////////////////////////////////////////////////////////////////////////////

const state: BuilderState = {
  totalPlans: 0,
  activePlan: null,
  researchCycles: 0,
  lastResearchTime: 0,
  componentDatabase: [],
  insights: [],
};

let researchCycleCount = 0;
let started = false;

////////////////////////////////////////////////////////////////////////////////
// Generic helpers
////////////////////////////////////////////////////////////////////////////////

const toNumber = (v: unknown, d = 0) => (Number.isFinite(+v!) ? +v! : d);

async function dbRead(table: string, query: any) {
  return dbGateway.read("server-builder", table, query);
}
async function dbWrite(table: string, data: any) {
  return dbGateway.write("server-builder", table, data, "NORMAL");
}

////////////////////////////////////////////////////////////////////////////////
// Persistence
////////////////////////////////////////////////////////////////////////////////

async function loadExistingPlans(): Promise<void> {
  try {
    const [plan] = await dbRead("omnimensServerBuilds", {
      orderBy: { createdAt: "desc" },
      limit: 1,
    });
    if (!plan) return;

    state.activePlan = plan as ServerBuildPlan;
    const all = await dbRead("omnimensServerBuilds", { fields: ["id"] });
    state.totalPlans = all.length;
    log(`Loaded ${state.totalPlans} existing plan(s)`);
  } catch (e: any) {
    log("Failed to load existing plans:", e?.message || e);
  }
}

async function saveBuildPlan(plan: ServerBuildPlan): Promise<void> {
  try {
    await dbWrite("omnimensServerBuilds", plan);
    await dbWrite("omnimensNotifications", {
      upgradeId: null,
      title: `Server Build Plan — ${plan.planType === "physical" ? "Hardware" : "Virtual"} Server`,
      message: `OMNIMENS designed a new ${plan.planType} server build:\n${plan.title}\nPurpose: ${plan.purpose}\nCost: $${plan.totalEstimatedCost.toFixed(
        2
      )}\nProgress: ${plan.progress}%\nPhase: ${plan.currentPhase}`,
      type: "server_build",
      readByOwner: false,
    });
    state.activePlan = plan;
    state.totalPlans++;
    cognitionBus.shareInsight("server-builder", {
      type: "discovery",
      data: { planType: plan.planType, cost: plan.totalEstimatedCost },
    });
    log(`💾 Plan saved: "${plan.title}" — $${plan.totalEstimatedCost.toFixed(0)}`);
  } catch (e: any) {
    log("Save error:", e?.message || e);
  }
}

async function saveRawSearchPlan(raw: string, planType: "physical" | "virtual") {
  const plan: ServerBuildPlan = {
    id: Date.now(),
    planType,
    title: `OMNIMENS ${planType} Server Research`,
    purpose: `Raw web search results for ${planType} server components`,
    totalEstimatedCost: 0,
    components: [],
    virtualConfig: null,
    buildInstructions: [],
    currentPhase: "research",
    progress: 10,
    notes: [`Cycle ${researchCycleCount}: raw search`, raw.slice(0, 2_000)],
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };
  await saveBuildPlan(plan);
  log(`Raw ${planType} search results saved`);
}

////////////////////////////////////////////////////////////////////////////////
// Research helpers
////////////////////////////////////////////////////////////////////////////////

async function gptCall(messages: any[]): Promise<any> {
  const res = await apiManager.call("server-builder", "openai", {
    model: "gpt-4o",
    messages,
    max_tokens: 1_500,
    temperature: 0.3,
    timeout: 90_000,
  });
  return res?.choices?.[0]?.message?.content ?? "";
}

function addInsight(text: string) {
  state.insights.push(text);
  if (state.insights.length > 20) state.insights.shift();
}

////////////////////////////////////////////////////////////////////////////////
// Physical server research
////////////////////////////////////////////////////////////////////////////////

async function researchPhysical(): Promise<void> {
  log("Starting PHYSICAL server research");
  const all: { query: string; results: string }[] = [];
  for (const q of PHYSICAL_SEARCHES) {
    try {
      const r = await webSearch(q, 4);
      if (r.length) {
        all.push({ query: q, results: formatSearchResults(r, q) });
        log(`Found ${r.length} results for "${q.slice(0, 40)}…"`);
      }
    } catch (e: any) {
      log(`Search error for "${q.slice(0, 30)}…":`, e?.message || e);
    }
    await new Promise((r) => setTimeout(r, 2_000));
  }
  if (!all.length) return;

  const summary = all.map((x) => `=== ${x.query} ===\n${x.results}`).join("\n\n").slice(0, 8_000);
  const raw = await gptCall([
    {
      role: "system",
      content:
        'You are a hardware deal-hunter focusing on the CHEAPEST AI server parts. Output ONLY valid JSON: {"components":[{...}], "totalCost":123, "buildInstructions":[], "summary":""}',
    },
    { role: "user", content: `Search results:\n${summary}` },
  ]);
  if (raw.length < 50) return saveRawSearchPlan(summary, "physical");

  let parsed: any;
  try {
    parsed = JSON.parse(raw.replace(/