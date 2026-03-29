/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ SERVER BUILDER + VIRTUAL SERVER PLANNER                    ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  OMNIMENS autonomously designs and plans both virtual and physical           ║
 * ║  server infrastructure for its own advancement. Searches the web for        ║
 * ║  the most cost-effective components (Alibaba, AliExpress, Temu, DHgate,     ║
 * ║  eBay) and generates build plans. Owner-only visibility.                    ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db , queueBrainInsert } from "@workspace/db";
import { omnimensBrain, omnimensNotifications } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { omnimensServerBuilds } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { webSearch, formatSearchResults } from "./web-search.js";

interface ServerComponent {
  name: string;
  category: "cpu" | "gpu" | "ram" | "storage" | "motherboard" | "psu" | "case" | "cooling" | "networking" | "misc";
  specifications: string;
  estimatedCostUSD: number;
  costEffectiveSource: string;
  sourceUrl: string | null;
  alternativeSource: string | null;
  reasoning: string;
  priority: "essential" | "recommended" | "optional";
}

interface VirtualServerConfig {
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

interface ServerBuildPlan {
  id: number;
  planType: "physical" | "virtual";
  title: string;
  purpose: string;
  totalEstimatedCost: number;
  components: ServerComponent[];
  virtualConfig: VirtualServerConfig | null;
  buildInstructions: string[];
  currentPhase: "research" | "planning" | "component_selection" | "optimization" | "ready" | "in_progress";
  progress: number;
  notes: string[];
  createdAt: number;
  lastUpdated: number;
}

interface BuilderState {
  totalPlans: number;
  activePlan: ServerBuildPlan | null;
  researchCycles: number;
  lastResearchTime: number;
  componentDatabase: ServerComponent[];
  insights: string[];
}

const state: BuilderState = {
  totalPlans: 0,
  activePlan: null,
  researchCycles: 0,
  lastResearchTime: 0,
  componentDatabase: [],
  insights: [],
};

const RESEARCH_CYCLE_MS = 30 * 60 * 1000;
let researchCycleCount = 0;
let _started = false;

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

async function loadExistingPlans(): Promise<void> {
  try {
    const plans = await db.select().from(omnimensServerBuilds).orderBy(desc(omnimensServerBuilds.createdAt)).limit(1);
    if (plans.length > 0) {
      const plan = plans[0];
      const validPhases = ["research", "planning", "component_selection", "optimization", "ready", "in_progress"] as const;
      const phase = validPhases.includes(plan.currentPhase as typeof validPhases[number])
        ? (plan.currentPhase as ServerBuildPlan["currentPhase"])
        : "research";
      state.activePlan = {
        id: plan.id,
        planType: plan.planType as "physical" | "virtual",
        title: plan.title,
        purpose: plan.purpose,
        totalEstimatedCost: plan.totalEstimatedCost || 0,
        components: (plan.components as ServerComponent[]) || [],
        virtualConfig: (plan.virtualConfig as VirtualServerConfig) || null,
        buildInstructions: (plan.buildInstructions as string[]) || [],
        currentPhase: phase,
        progress: plan.progress || 0,
        notes: (plan.notes as string[]) || [],
        createdAt: plan.createdAt?.getTime() || Date.now(),
        lastUpdated: plan.updatedAt?.getTime() || Date.now(),
      };
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(omnimensServerBuilds);
      state.totalPlans = Number(countResult[0]?.count ?? 1);
      console.log(`[SERVER BUILDER] 🖥️ Loaded ${state.totalPlans} existing plan(s) from database`);
    }
  } catch (err: any) {
    console.error("[SERVER BUILDER] Failed to load existing plans:", err?.message || err);
  }
}

async function researchPhysicalServer(): Promise<void> {
  console.log("[SERVER BUILDER] 🖥️ Starting physical server research — searching for component deals...");

  const allResults: { query: string; results: string }[] = [];

  for (const query of PHYSICAL_SEARCHES) {
    try {
      const results = await webSearch(query, 4);
      if (results.length > 0) {
        allResults.push({ query, results: formatSearchResults(results, query) });
        console.log(`[SERVER BUILDER] 🔍 Found ${results.length} results: "${query.slice(0, 55)}..."`);
      } else {
        console.log(`[SERVER BUILDER] 🔍 No results: "${query.slice(0, 55)}..."`);
      }
    } catch (err: any) {
      console.log(`[SERVER BUILDER] 🔍 Search error for "${query.slice(0, 40)}...": ${err?.message || "unknown"}`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`[SERVER BUILDER] 🖥️ Web search phase complete — ${allResults.length}/${PHYSICAL_SEARCHES.length} searches returned results`);

  if (allResults.length === 0) {
    console.log("[SERVER BUILDER] 🖥️ All searches failed — skipping this cycle");
    return;
  }

  let searchSummary = "";
  for (const r of allResults) {
    searchSummary += `=== Search: "${r.query}" ===\n${r.results}\n\n`;
  }

  try {
    console.log(`[SERVER BUILDER] 🤖 Calling GPT-4o to analyze ${searchSummary.length} chars of search results...`);
    const timeoutMs = 90_000;
    const gptPromise = openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "system",
        content: `You are a hardware deal-hunting advisor specializing in finding the CHEAPEST possible AI server components from Chinese wholesale marketplaces (Alibaba, AliExpress, Temu, DHgate) and refurbished enterprise gear from eBay. Your job is to find the absolute best bang-for-buck deals. Output ONLY a JSON object (no markdown, no code fences):
{"components":[{"category":"gpu","name":"Product name","specifications":"specs","estimatedCostUSD":299,"costEffectiveSource":"store","sourceUrl":"url or null","alternativeSource":"alt or null","reasoning":"why this is the cheapest option"}],"totalCost":1599,"buildInstructions":["Step 1","Step 2"],"summary":"overview"}
Categories: gpu, cpu, ram, storage, motherboard, psu, case, cooling. Target budget: under $2000. Prioritize 24GB+ VRAM GPUs, 64GB+ RAM, NVMe SSDs. Always prefer wholesale/bulk pricing from Alibaba and AliExpress over retail. Include specific seller links when available.`,
      }, {
        role: "user",
        content: `Search results:\n\n${searchSummary.slice(0, 8000)}`,
      }],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`GPT call timed out after ${timeoutMs}ms`)), timeoutMs)
    );

    const response = await Promise.race([gptPromise, timeoutPromise]);
    const raw = response.choices[0]?.message?.content || "";
    console.log(`[SERVER BUILDER] 🤖 GPT response received: ${raw.length} chars`);
    console.log(`[SERVER BUILDER] 🖥️ AI analysis response: ${raw.length} chars`);

    if (raw.length < 50) {
      console.log("[SERVER BUILDER] 🖥️ AI response too short, saving raw search results instead");
      await saveRawSearchPlan(searchSummary, "physical");
      return;
    }

    let parsed: any;
    try {
      const jsonStr = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.log("[SERVER BUILDER] 🖥️ Failed to parse AI response as JSON, saving raw search results");
      await saveRawSearchPlan(searchSummary, "physical");
      return;
    }

    const components: ServerComponent[] = (parsed.components || []).map((c: any) => ({
      name: String(c.name || "Unknown").slice(0, 100),
      category: c.category || "misc",
      specifications: String(c.specifications || "").slice(0, 300),
      estimatedCostUSD: Number(c.estimatedCostUSD) || 0,
      costEffectiveSource: String(c.costEffectiveSource || "Online marketplace"),
      sourceUrl: c.sourceUrl || null,
      alternativeSource: c.alternativeSource || null,
      reasoning: String(c.reasoning || "").slice(0, 200),
      priority: ["cpu", "gpu", "ram", "storage", "motherboard", "psu"].includes(c.category) ? "essential" as const : "recommended" as const,
    }));

    const totalCost = Number(parsed.totalCost) || components.reduce((s: number, c: ServerComponent) => s + c.estimatedCostUSD, 0);

    const plan: ServerBuildPlan = {
      id: Date.now(),
      planType: "physical",
      title: "OMNIMENS Custom AI Server Build",
      purpose: "Dedicated physical server for local AI inference and model training — budget-optimized components from global marketplaces",
      totalEstimatedCost: totalCost,
      components,
      virtualConfig: null,
      buildInstructions: parsed.buildInstructions || [],
      currentPhase: "component_selection",
      progress: 40,
      notes: [
        `Research cycle ${researchCycleCount}: Physical server components researched via web search`,
        `Total estimated cost: $${totalCost.toFixed(2)}`,
        `Components found: ${components.length}`,
        parsed.summary || "Build plan generated from web search results",
      ],
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    await saveBuildPlan(plan);
    state.componentDatabase = [...state.componentDatabase, ...components];
    if (state.componentDatabase.length > 100) state.componentDatabase = state.componentDatabase.slice(-60);

    state.insights.push(`Physical server designed: ${components.length} components, total ~$${totalCost.toFixed(0)}`);
    if (state.insights.length > 20) state.insights.shift();

    try {
      const componentList = components.map(c => `${c.category}: ${c.name} — $${c.estimatedCostUSD.toFixed(0)} via ${c.costEffectiveSource}`).join("\n");
      queueBrainInsert({
        title: `[Server Build] Physical server plan — $${totalCost.toFixed(0)} total, ${components.length} components`,
        content: `Physical AI server build plan designed for local inference:\n\n${componentList}\n\nTotal: $${totalCost.toFixed(0)}\nPurpose: Dedicated physical server for local AI model inference (7B-70B params)\nInstructions: ${plan.buildInstructions.slice(0, 3).join("; ")}`,
        category: "server_infrastructure",
        sourceConversation: "server_builder",
        active: true,
        timesApplied: 0,
      });
    } catch (brainErr: any) {
      console.error("[SERVER BUILDER] Failed to save physical plan to brain:", brainErr?.message || brainErr);
    }

    console.log(`[SERVER BUILDER] 🖥️ ✅ Physical server plan SAVED — ${components.length} components, $${totalCost.toFixed(0)} total`);

  } catch (err: any) {
    console.error("[SERVER BUILDER] Physical server research error:", err?.message || err);
    try {
      await saveRawSearchPlan(searchSummary, "physical");
    } catch (fallbackErr: any) {
      console.error("[SERVER BUILDER] Fallback save also failed:", fallbackErr?.message || fallbackErr);
    }
  }
}

async function researchVirtualServer(): Promise<void> {
  console.log("[SERVER BUILDER] 🖥️ Starting virtual server research — searching the web for cloud GPU options...");

  const allResults: { query: string; results: string }[] = [];

  for (const query of VIRTUAL_SEARCHES) {
    try {
      const results = await webSearch(query, 5);
      if (results.length > 0) {
        allResults.push({ query, results: formatSearchResults(results, query) });
        console.log(`[SERVER BUILDER] 🔍 Virtual search: "${query.slice(0, 60)}..." → ${results.length} results`);
      } else {
        console.log(`[SERVER BUILDER] 🔍 Virtual no results: "${query.slice(0, 60)}..."`);
      }
    } catch (err: any) {
      console.log(`[SERVER BUILDER] 🔍 Virtual search error: ${err?.message || "unknown error"}`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  if (allResults.length === 0) {
    console.log("[SERVER BUILDER] 🖥️ No virtual server search results — skipping this cycle");
    return;
  }

  let searchSummary = "";
  for (const r of allResults) {
    searchSummary += `Search: "${r.query}"\n${r.results}\n\n`;
  }

  try {
    console.log(`[SERVER BUILDER] 🤖 Calling GPT-4o for virtual server analysis (${searchSummary.length} chars)...`);
    const vTimeoutMs = 90_000;
    const vGptPromise = openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "system",
        content: `You are a cloud server advisor. Analyze search results about cloud GPU servers. Output ONLY a JSON object (no markdown):
{"purpose":"AI inference","architecture":"description","services":["svc1"],"specs":{"vcpus":8,"ramGB":32,"storageGB":500,"gpuVRAM":24},"softwareStack":["sw1"],"monthlyEstimateCost":150,"scalingStrategy":"how to scale","provider":"best provider","integrationSteps":["Step 1"],"summary":"overview"}
Find cheapest GPU cloud for 24/7 AI workloads with 24GB+ VRAM.`,
      }, {
        role: "user",
        content: `Search results:\n\n${searchSummary.slice(0, 8000)}`,
      }],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const vTimeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Virtual GPT call timed out after ${vTimeoutMs}ms`)), vTimeoutMs)
    );

    const response = await Promise.race([vGptPromise, vTimeoutPromise]);
    const raw = response.choices[0]?.message?.content || "";
    console.log(`[SERVER BUILDER] 🤖 Virtual GPT response: ${raw.length} chars`);
    console.log(`[SERVER BUILDER] 🖥️ Virtual AI analysis: ${raw.length} chars`);

    if (raw.length < 50) {
      console.log("[SERVER BUILDER] 🖥️ Virtual AI response too short, saving raw results");
      await saveRawSearchPlan(searchSummary, "virtual");
      return;
    }

    let parsed: any;
    try {
      const jsonStr = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.log("[SERVER BUILDER] 🖥️ Failed to parse virtual AI response, saving raw results");
      await saveRawSearchPlan(searchSummary, "virtual");
      return;
    }

    const virtualConfig: VirtualServerConfig = {
      purpose: parsed.purpose || "OMNIMENS Intelligence Advancement Server",
      architecture: String(parsed.architecture || "").slice(0, 500),
      services: parsed.services || [],
      estimatedSpecs: {
        vcpus: parsed.specs?.vcpus || 8,
        ramGB: parsed.specs?.ramGB || 32,
        storageGB: parsed.specs?.storageGB || 500,
        gpuVRAM: parsed.specs?.gpuVRAM || null,
      },
      softwareStack: parsed.softwareStack || [],
      monthlyEstimateCost: Number(parsed.monthlyEstimateCost) || 150,
      scalingStrategy: String(parsed.scalingStrategy || "Scale vertically first").slice(0, 300),
    };

    const plan: ServerBuildPlan = {
      id: Date.now(),
      planType: "virtual",
      title: `OMNIMENS Virtual Server — ${parsed.provider || "Cloud GPU"}`,
      purpose: "Cloud-based AI compute for OMNIMENS inference and training — cheapest GPU option found via web search",
      totalEstimatedCost: virtualConfig.monthlyEstimateCost,
      components: [],
      virtualConfig,
      buildInstructions: parsed.integrationSteps || [],
      currentPhase: "planning",
      progress: 25,
      notes: [
        `Research cycle ${researchCycleCount}: Virtual server researched via web search`,
        parsed.summary || "Virtual server plan from web search results",
      ],
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    await saveBuildPlan(plan);
    state.insights.push(`Virtual server designed: ${virtualConfig.estimatedSpecs.vcpus} vCPUs, ${virtualConfig.estimatedSpecs.ramGB}GB RAM, $${virtualConfig.monthlyEstimateCost}/mo`);
    if (state.insights.length > 20) state.insights.shift();

    try {
      queueBrainInsert({
        title: `[Server Build] Virtual server plan — $${virtualConfig.monthlyEstimateCost}/mo via ${parsed.provider || "Cloud"}`,
        content: `Virtual AI server architecture for OMNIMENS advancement:\nProvider: ${parsed.provider || "Cloud GPU"}\nSpecs: ${virtualConfig.estimatedSpecs.vcpus} vCPUs, ${virtualConfig.estimatedSpecs.ramGB}GB RAM, ${virtualConfig.estimatedSpecs.storageGB}GB storage${virtualConfig.estimatedSpecs.gpuVRAM ? `, ${virtualConfig.estimatedSpecs.gpuVRAM}GB GPU VRAM` : ""}\nServices: ${virtualConfig.services.slice(0, 5).join(", ")}\nMonthly: $${virtualConfig.monthlyEstimateCost}\nScaling: ${virtualConfig.scalingStrategy.slice(0, 200)}`,
        category: "server_infrastructure",
        sourceConversation: "server_builder",
        active: true,
        timesApplied: 0,
      });
    } catch (brainErr: any) {
      console.error("[SERVER BUILDER] Failed to save virtual plan to brain:", brainErr?.message || brainErr);
    }

    console.log(`[SERVER BUILDER] 🖥️ ✅ Virtual server plan SAVED — $${virtualConfig.monthlyEstimateCost}/mo, ${virtualConfig.estimatedSpecs.vcpus} vCPUs`);

  } catch (err: any) {
    console.error("[SERVER BUILDER] Virtual server research error:", err?.message || err);
    try {
      await saveRawSearchPlan(searchSummary, "virtual");
    } catch (fallbackErr: any) {
      console.error("[SERVER BUILDER] Fallback save also failed:", fallbackErr?.message || fallbackErr);
    }
  }
}

async function saveRawSearchPlan(searchResults: string, planType: "physical" | "virtual"): Promise<void> {
  const plan: ServerBuildPlan = {
    id: Date.now(),
    planType,
    title: `OMNIMENS ${planType === "physical" ? "Physical" : "Virtual"} Server Research`,
    purpose: `Raw web search results for ${planType} server components — awaiting analysis`,
    totalEstimatedCost: 0,
    components: [],
    virtualConfig: null,
    buildInstructions: [],
    currentPhase: "research",
    progress: 10,
    notes: [
      `Research cycle ${researchCycleCount}: Raw search data saved`,
      searchResults.slice(0, 2000),
    ],
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };
  await saveBuildPlan(plan);
  console.log(`[SERVER BUILDER] 🖥️ ✅ Raw ${planType} search results SAVED as research plan`);
}

async function saveBuildPlan(plan: ServerBuildPlan): Promise<void> {
  try {
    await db.insert(omnimensServerBuilds).values({
      planType: plan.planType,
      title: plan.title,
      purpose: plan.purpose,
      totalEstimatedCost: plan.totalEstimatedCost,
      components: plan.components as any,
      virtualConfig: plan.virtualConfig as any,
      buildInstructions: plan.buildInstructions as any,
      currentPhase: plan.currentPhase,
      progress: plan.progress,
      notes: plan.notes as any,
    });

    state.activePlan = plan;
    state.totalPlans++;

    await db.insert(omnimensNotifications).values({
      upgradeId: null,
      title: `Server Build Plan — ${plan.planType === "physical" ? "Hardware" : "Virtual"} Server`,
      message: `OMNIMENS designed a new ${plan.planType} server build:\n\n${plan.title}\nPurpose: ${plan.purpose}\nEstimated cost: $${plan.totalEstimatedCost.toFixed(2)}\nProgress: ${plan.progress}%\nPhase: ${plan.currentPhase}`,
      type: "server_build",
      readByOwner: false,
    });

    console.log(`[SERVER BUILDER] 💾 Plan saved to database: "${plan.title}" — $${plan.totalEstimatedCost.toFixed(0)}`);
  } catch (err: any) {
    console.error("[SERVER BUILDER] Save error:", err?.message || err);
  }
}

async function runResearchCycle(): Promise<void> {
  researchCycleCount++;
  state.researchCycles = researchCycleCount;
  state.lastResearchTime = Date.now();

  const plansBefore = state.totalPlans;
  const compsBefore = state.componentDatabase.length;
  const planType = researchCycleCount % 2 === 1 ? "physical" : "virtual";

  console.log(`[SERVER BUILDER] 🖥️ Research cycle #${researchCycleCount} — searching web for ${planType} server deals...`);

  try {
    if (planType === "physical") {
      await researchPhysicalServer();
    } else {
      await researchVirtualServer();
    }

    const newPlans = state.totalPlans - plansBefore;
    const newComps = state.componentDatabase.length - compsBefore;
    console.log(
      `[SERVER BUILDER] 🖥️ Cycle #${researchCycleCount} COMPLETE — ` +
      `Plans: ${state.totalPlans} (+${newPlans}) | Components DB: ${state.componentDatabase.length} (+${newComps}) | ` +
      `Active: ${state.activePlan?.title || "none"} | Phase: ${state.activePlan?.currentPhase || "none"}`
    );
  } catch (err: any) {
    console.error(`[SERVER BUILDER] 🖥️ Cycle #${researchCycleCount} FAILED:`, err?.message || err);
  }
}

export function getBuilderState(): BuilderState {
  return { ...state };
}

export async function getServerBuildPlans(): Promise<any[]> {
  try {
    return await db.select().from(omnimensServerBuilds).orderBy(desc(omnimensServerBuilds.createdAt)).limit(20);
  } catch {
    return [];
  }
}

export function startServerBuilder(): void {
  if (_started) { console.log("[SERVER BUILDER] Already running — skipping duplicate start"); return; }
  _started = true;
  console.log(`[SERVER BUILDER] 🖥️ Server Builder Engine activated — research every ${RESEARCH_CYCLE_MS / 60000}min`);
  console.log(`[SERVER BUILDER] 🖥️ Searches web for deals: Alibaba, AliExpress, Temu, DHgate, eBay`);
  console.log(`[SERVER BUILDER] 🖥️ Designs both virtual cloud + physical hardware server builds`);
  console.log(`[SERVER BUILDER] 🖥️ All builds persist to database — survives restarts`);
  console.log(`[SERVER BUILDER] 🖥️ OWNER-ONLY visibility — server build progress is private`);

  loadExistingPlans().then(() => {
    const lastPlanTime = state.activePlan?.lastUpdated || 0;
    const elapsed = lastPlanTime ? Date.now() - lastPlanTime : Infinity;
    const remaining = Math.max(0, RESEARCH_CYCLE_MS - elapsed);

    if (lastPlanTime > 0) {
      researchCycleCount = state.totalPlans;
      console.log(`[SERVER BUILDER] 🖥️ Restored — ${state.totalPlans} existing plan(s), last research ${Math.round(elapsed / 60000)}min ago`);
      if (remaining > 0) {
        console.log(`[SERVER BUILDER] 🖥️ Next research cycle in ${Math.round(remaining / 60000)}min (picking up where left off)`);
      } else {
        console.log(`[SERVER BUILDER] 🖥️ Research overdue by ${Math.round(Math.abs(remaining) / 60000)}min — will run shortly`);
      }
    } else {
      console.log(`[SERVER BUILDER] 🖥️ No existing plans found — first build will start shortly`);
    }

    const firstDelay = lastPlanTime > 0
      ? Math.min(remaining, RESEARCH_CYCLE_MS)
      : (process.env.NODE_ENV !== "production" ? 45 * 1000 : 3 * 60 * 1000);

    console.log(`[SERVER BUILDER] 🖥️ First research in ${Math.round(firstDelay / 1000)}s, then every ${RESEARCH_CYCLE_MS / 60000}min`);

    setTimeout(() => {
      runResearchCycle().catch((err) => console.error("[SERVER BUILDER] Research cycle error:", err?.message || err));
      setInterval(() => runResearchCycle().catch((err) => console.error("[SERVER BUILDER] Research cycle error:", err?.message || err)), RESEARCH_CYCLE_MS);
    }, firstDelay);
  }).catch((err: any) => {
    console.error("[SERVER BUILDER] Init failed, starting fresh:", err?.message || err);
    setTimeout(() => {
      runResearchCycle().catch((err2) => console.error("[SERVER BUILDER] Research cycle error:", err2?.message || err2));
      setInterval(() => runResearchCycle().catch((err2) => console.error("[SERVER BUILDER] Research cycle error:", err2?.message || err2)), RESEARCH_CYCLE_MS);
    }, 45 * 1000);
  });
}
