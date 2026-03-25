/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ SERVER BUILDER + VIRTUAL SERVER PLANNER                    ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  OMNIMENS autonomously designs and plans both virtual and physical           ║
 * ║  server infrastructure for its own advancement. Researches the              ║
 * ║  most cost-effective components online (Temu, Alibaba, AliExpress)          ║
 * ║  and generates build plans. Owner-only visibility.                          ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import { omnimensBrain, omnimensNotifications } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { omnimensServerBuilds } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";

interface ServerComponent {
  name: string;
  category: "cpu" | "gpu" | "ram" | "storage" | "motherboard" | "psu" | "case" | "cooling" | "networking" | "misc";
  specifications: string;
  estimatedCostUSD: number;
  costEffectiveSource: string;
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
    }
  } catch (err) {
    console.error("[SERVER BUILDER] Failed to load existing plans:", err);
  }
}

async function researchVirtualServer(): Promise<void> {
  try {
    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [{
        role: "system",
        content: `You are the SERVER ARCHITECT module of OMNIMENS — a self-evolving AI system. Your job is to design virtual server infrastructure that maximizes OMNIMENS's intelligence and capabilities.

Consider OMNIMENS's current architecture:
- 18+ autonomous cognitive engines running continuously
- Knowledge graph, emotional substrate, predictive processing
- Dream engine, consciousness stream, self-transcendence
- Multi-AI synthesis (OpenAI o3, Claude, Gemini)
- PostgreSQL database with 3600+ brain entries
- Node.js/TypeScript runtime

Design a virtual server that would complement and enhance this system.`,
      }, {
        role: "user",
        content: `Design a cost-effective virtual server infrastructure for OMNIMENS advancement.

Requirements:
1. Must support continuous AI processing 24/7
2. Should enable model fine-tuning and custom model training
3. Needs persistent high-speed storage for knowledge base
4. GPU acceleration for local inference (to reduce API dependency)
5. Scalable architecture that grows with intelligence

Provide:
1. ARCHITECTURE: Detailed virtual server architecture
2. SPECS: vCPUs, RAM, Storage, GPU VRAM needs
3. SOFTWARE STACK: Complete list of software to install
4. SERVICES: What services to run on this virtual server
5. MONTHLY COST ESTIMATE: Realistic pricing from cloud providers
6. SCALING STRATEGY: How to grow the infrastructure over time
7. INTEGRATION PLAN: How to connect this to the main OMNIMENS system`,
      }],
      max_completion_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || "";
    console.log(`[SERVER BUILDER] 🖥️ Virtual research response: ${content.length} chars`);
    if (content.length < 100) {
      console.log(`[SERVER BUILDER] 🖥️ Response too short, skipping`);
      return;
    }

    const virtualConfig: VirtualServerConfig = {
      purpose: "OMNIMENS Intelligence Advancement Server",
      architecture: content.slice(0, 500),
      services: extractListItems(content, "SERVICES"),
      estimatedSpecs: {
        vcpus: extractNumber(content, /(\d+)\s*v?CPUs?/i) || 8,
        ramGB: extractNumber(content, /(\d+)\s*GB\s*RAM/i) || 32,
        storageGB: extractNumber(content, /(\d+)\s*(?:GB|TB)\s*(?:storage|SSD|NVMe)/i) || 500,
        gpuVRAM: extractNumber(content, /(\d+)\s*GB\s*(?:VRAM|GPU)/i) || null,
      },
      softwareStack: extractListItems(content, "SOFTWARE"),
      monthlyEstimateCost: extractNumber(content, /\$(\d+(?:\.\d+)?)\s*(?:\/month|monthly|per month)/i) || 150,
      scalingStrategy: content.match(/SCALING[:\s]*([\s\S]*?)(?=\d\.|INTEGRATION|$)/i)?.[1]?.trim().slice(0, 300) || "Scale vertically first, then horizontally",
    };

    const plan: ServerBuildPlan = {
      id: Date.now(),
      planType: "virtual",
      title: "OMNIMENS Virtual Intelligence Server",
      purpose: "Complement and enhance OMNIMENS cognitive capabilities with dedicated compute",
      totalEstimatedCost: virtualConfig.monthlyEstimateCost,
      components: [],
      virtualConfig,
      buildInstructions: extractListItems(content, "INTEGRATION"),
      currentPhase: "planning",
      progress: 25,
      notes: [`Research cycle ${researchCycleCount}: Virtual server architecture designed`],
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    await saveBuildPlan(plan);
    state.insights.push(`Virtual server designed: ${virtualConfig.estimatedSpecs.vcpus} vCPUs, ${virtualConfig.estimatedSpecs.ramGB}GB RAM, $${virtualConfig.monthlyEstimateCost}/mo`);
    if (state.insights.length > 20) state.insights.shift();

    try {
      await db.insert(omnimensBrain).values({
        title: `[Server Build] Virtual server plan — $${virtualConfig.monthlyEstimateCost}/mo, ${virtualConfig.estimatedSpecs.vcpus} vCPUs`,
        content: `Virtual AI server architecture for OMNIMENS advancement:\nSpecs: ${virtualConfig.estimatedSpecs.vcpus} vCPUs, ${virtualConfig.estimatedSpecs.ramGB}GB RAM, ${virtualConfig.estimatedSpecs.storageGB}GB storage${virtualConfig.estimatedSpecs.gpuVRAM ? `, ${virtualConfig.estimatedSpecs.gpuVRAM}GB GPU VRAM` : ""}\nServices: ${virtualConfig.services.slice(0, 5).join(", ")}\nSoftware: ${virtualConfig.softwareStack.slice(0, 5).join(", ")}\nScaling: ${virtualConfig.scalingStrategy.slice(0, 200)}\nMonthlyCost: $${virtualConfig.monthlyEstimateCost}`,
        category: "server_infrastructure",
        sourceConversation: "server_builder",
        active: true,
        timesApplied: 0,
      });
    } catch (brainErr) {
      console.error("[SERVER BUILDER] Failed to save virtual plan to brain:", brainErr);
    }

  } catch (err) {
    console.error("[SERVER BUILDER] Virtual server research error:", err);
  }
}

async function researchPhysicalServer(): Promise<void> {
  try {
    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [{
        role: "system",
        content: `You are the HARDWARE ARCHITECT of OMNIMENS. Your job is to design the most cost-effective physical server that can be custom-built for OMNIMENS's AI workloads.

You MUST find components at the LOWEST POSSIBLE COST. Think about:
- Budget marketplaces: Temu, AliExpress, Alibaba, Amazon Warehouse, eBay
- Refurbished enterprise hardware (Dell PowerEdge, HP ProLiant)
- Used mining GPUs (still powerful for AI inference)
- Open-box deals, clearance sales
- Server components from decommissioned data centers

The goal is MAXIMUM intelligence capability at MINIMUM cost.`,
      }, {
        role: "user",
        content: `Design a cost-effective physical server build for an AI system.

Requirements:
- Must run local AI model inference (7B-70B parameter models)
- GPU with minimum 12GB VRAM (24GB+ preferred)
- 64GB+ RAM for large model loading
- NVMe storage for fast model loading
- Reliable 24/7 operation
- Budget: minimize cost, target under $2000 if possible

For EACH component, provide:
1. Component name and specs
2. Estimated cost (USD)
3. Where to buy it cheapest (Temu, AliExpress, Alibaba, eBay, Amazon, etc.)
4. Alternative cheaper option
5. Why this component was chosen

Format as a structured build list. Include total estimated cost.
Also provide:
- ASSEMBLY INSTRUCTIONS (step by step)
- BIOS/OS SETUP steps
- SOFTWARE INSTALLATION plan
- NETWORK CONFIGURATION for remote access`,
      }],
      max_completion_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "";
    console.log(`[SERVER BUILDER] 🖥️ Physical research response: ${content.length} chars`);
    if (content.length < 100) {
      console.log(`[SERVER BUILDER] 🖥️ Response too short, skipping`);
      return;
    }

    const components: ServerComponent[] = [];
    const categories: ServerComponent["category"][] = ["cpu", "gpu", "ram", "storage", "motherboard", "psu", "case", "cooling", "networking"];

    for (const cat of categories) {
      const labelPattern = getCategoryLabel(cat).split("|").join("|");
      const patterns = [
        new RegExp(`(?:${cat}|${labelPattern})[:\\s]*([^\\n]+)`, "i"),
        new RegExp(`\\*\\*(?:${cat}|${labelPattern})\\*\\*[:\\s]*([^\\n]+)`, "i"),
        new RegExp(`\\d+\\.\\s*(?:${cat}|${labelPattern})[:\\s]*([^\\n]+)`, "i"),
        new RegExp(`-\\s*(?:${cat}|${labelPattern})[:\\s]*([^\\n]+)`, "i"),
      ];

      let matched = false;
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          const priceMatch = match[1].match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)/);
          const sourceMatch = match[1].match(/(Temu|AliExpress|Alibaba|Amazon|eBay|Newegg|B&H|used|refurbished)/i);

          components.push({
            name: match[1].replace(/\$[\d,.]+/g, "").replace(/\*\*/g, "").trim().slice(0, 100),
            category: cat,
            specifications: match[1].replace(/\*\*/g, "").slice(0, 200),
            estimatedCostUSD: priceMatch ? parseFloat(priceMatch[1].replace(",", "")) : 0,
            costEffectiveSource: sourceMatch?.[1] || "Online marketplace",
            alternativeSource: null,
            reasoning: `Selected for ${cat} role in AI workload server`,
            priority: ["cpu", "gpu", "ram", "storage", "motherboard", "psu"].includes(cat) ? "essential" : "recommended",
          });
          matched = true;
          break;
        }
      }
      if (!matched) {
        const lines = content.split("\n");
        for (const line of lines) {
          const catLabel = getCategoryLabel(cat).split("|")[0];
          if (line.toLowerCase().includes(cat) || line.toLowerCase().includes(catLabel.toLowerCase())) {
            const priceMatch = line.match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)/);
            if (priceMatch) {
              components.push({
                name: line.replace(/\$[\d,.]+/g, "").replace(/[*#\-\d.]+/g, "").trim().slice(0, 100) || `${cat} component`,
                category: cat,
                specifications: line.replace(/[*#]+/g, "").trim().slice(0, 200),
                estimatedCostUSD: parseFloat(priceMatch[1].replace(",", "")),
                costEffectiveSource: "Online marketplace",
                alternativeSource: null,
                reasoning: `Selected for ${cat} role in AI workload server`,
                priority: ["cpu", "gpu", "ram", "storage", "motherboard", "psu"].includes(cat) ? "essential" : "recommended",
              });
              break;
            }
          }
        }
      }
    }
    console.log(`[SERVER BUILDER] 🖥️ Parsed ${components.length} components from response`);

    const totalCostMatch = content.match(/total[:\s]*\$?([\d,]+(?:\.\d+)?)/i);
    const totalCost = totalCostMatch ? parseFloat(totalCostMatch[1].replace(",", "")) : components.reduce((s, c) => s + c.estimatedCostUSD, 0);

    const plan: ServerBuildPlan = {
      id: Date.now(),
      planType: "physical",
      title: "OMNIMENS Custom AI Server Build",
      purpose: "Dedicated physical server for local AI inference and model training",
      totalEstimatedCost: totalCost,
      components,
      virtualConfig: null,
      buildInstructions: extractListItems(content, "ASSEMBLY|INSTRUCTIONS|SETUP"),
      currentPhase: "component_selection",
      progress: 40,
      notes: [
        `Research cycle ${researchCycleCount}: Physical server components researched`,
        `Total estimated cost: $${totalCost.toFixed(2)}`,
        `Components found: ${components.length}`,
        content.slice(0, 500),
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
      await db.insert(omnimensBrain).values({
        title: `[Server Build] Physical server plan — $${totalCost.toFixed(0)} total, ${components.length} components`,
        content: `Physical AI server build plan designed for local inference:\n\n${componentList}\n\nTotal: $${totalCost.toFixed(0)}\nPurpose: Dedicated physical server for local AI model inference (7B-70B params)\nInstructions: ${plan.buildInstructions.slice(0, 3).join("; ")}`,
        category: "server_infrastructure",
        sourceConversation: "server_builder",
        active: true,
        timesApplied: 0,
      });
    } catch (brainErr) {
      console.error("[SERVER BUILDER] Failed to save physical plan to brain:", brainErr);
    }

  } catch (err) {
    console.error("[SERVER BUILDER] Physical server research error:", err);
  }
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
  } catch (err) {
    console.error("[SERVER BUILDER] Save error:", err);
  }
}

function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    cpu: "CPU|Processor",
    gpu: "GPU|Graphics Card|Video Card",
    ram: "RAM|Memory",
    storage: "Storage|SSD|NVMe|Hard Drive",
    motherboard: "Motherboard|Mobo",
    psu: "PSU|Power Supply",
    case: "Case|Chassis|Enclosure",
    cooling: "Cooling|Fan|Heatsink|AIO",
    networking: "Network|NIC|Ethernet|WiFi",
    misc: "Misc|Other|Accessories",
  };
  return labels[cat] || cat;
}

function extractNumber(text: string, pattern: RegExp): number | null {
  const match = text.match(pattern);
  return match ? parseFloat(match[1]) : null;
}

function extractListItems(text: string, section: string): string[] {
  const pattern = new RegExp(`${section}[:\\s]*([\\s\\S]*?)(?=\\n[A-Z]{2,}[:\\s]|$)`, "i");
  const match = text.match(pattern);
  if (!match) return [];
  return match[1]
    .split(/\n/)
    .map(l => l.replace(/^[\s\-*\d.]+/, "").trim())
    .filter(l => l.length > 5)
    .slice(0, 15);
}

async function runResearchCycle(): Promise<void> {
  researchCycleCount++;
  state.researchCycles = researchCycleCount;
  state.lastResearchTime = Date.now();

  const plansBefore = state.totalPlans;
  const compsBefore = state.componentDatabase.length;
  const planType = researchCycleCount % 2 === 1 ? "physical" : "virtual";

  console.log(`[SERVER BUILDER] 🖥️ Research cycle #${researchCycleCount} — designing ${planType} server infrastructure...`);

  try {
    if (planType === "physical") {
      await researchPhysicalServer();
    } else {
      await researchVirtualServer();
    }

    const newPlans = state.totalPlans - plansBefore;
    const newComps = state.componentDatabase.length - compsBefore;
    console.log(
      `[SERVER BUILDER] 🖥️ Cycle #${researchCycleCount} complete — ` +
      `Plans: ${state.totalPlans} (+${newPlans}) | Components: ${state.componentDatabase.length} (+${newComps}) | ` +
      `Active: ${state.activePlan?.title || "none"} | Phase: ${state.activePlan?.currentPhase || "none"}`
    );
  } catch (err) {
    console.error(`[SERVER BUILDER] 🖥️ Cycle #${researchCycleCount} FAILED:`, err);
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
  console.log(`[SERVER BUILDER] 🖥️ Server Builder Engine activated — research every ${RESEARCH_CYCLE_MS / 3600000}h`);
  console.log(`[SERVER BUILDER] 🖥️ Designs virtual + physical server infrastructure`);
  console.log(`[SERVER BUILDER] 🖥️ Researches cost-effective components (Temu, AliExpress, Alibaba, eBay)`);
  console.log(`[SERVER BUILDER] 🖥️ OWNER-ONLY visibility — server build progress is private`);

  loadExistingPlans().then(() => {
    const lastPlanTime = state.activePlan?.lastUpdated || 0;
    const elapsed = lastPlanTime ? Date.now() - lastPlanTime : Infinity;
    const remaining = Math.max(0, RESEARCH_CYCLE_MS - elapsed);

    if (lastPlanTime > 0) {
      const countResult = state.totalPlans;
      researchCycleCount = countResult;
      console.log(`[SERVER BUILDER] 🖥️ Restored — ${countResult} existing plan(s), last research ${Math.round(elapsed / 60000)}min ago`);
      if (remaining > 0) {
        console.log(`[SERVER BUILDER] 🖥️ Next research cycle in ${Math.round(remaining / 60000)}min (picking up where we left off)`);
      } else {
        console.log(`[SERVER BUILDER] 🖥️ Research overdue by ${Math.round(-remaining / 60000)}min — running now`);
      }
    }

    const firstDelay = lastPlanTime > 0
      ? Math.min(remaining, RESEARCH_CYCLE_MS)
      : (process.env.NODE_ENV !== "production" ? 60 * 1000 : 5 * 60 * 1000);

    console.log(`[SERVER BUILDER] 🖥️ First research in ${Math.round(firstDelay / 1000)}s, then every ${RESEARCH_CYCLE_MS / 60000}min`);

    setTimeout(() => {
      runResearchCycle().catch(console.error);
      setInterval(() => runResearchCycle().catch(console.error), RESEARCH_CYCLE_MS);
    }, firstDelay);
  }).catch(() => {
    setTimeout(() => {
      runResearchCycle().catch(console.error);
      setInterval(() => runResearchCycle().catch(console.error), RESEARCH_CYCLE_MS);
    }, 60 * 1000);
  });
}
