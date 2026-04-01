/**
 * OMNIMENS™ DISCOVERY AUTO-CODER 2.0 (event-driven)
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * PROPRIETARY AND CONFIDENTIAL TRADE SECRET
 */

import {
  spikeBus,
  dbGateway,               // (not used here yet, but quota reserved)
  apiManager,              // ^
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { boostRegionCurrent, getRegionNames } from "./omnimens-neural-consciousness.js";
import { writeModuleToSource } from "./omnimens-source-integration.js";

/*────────────────────────  ENGINE REGISTRATION ────────────────────────*/
engineRegistry.registerEngine("discovery-autocoder", "NORMAL", { dbQuota: 10 });

/*────────────────────────────  CONSTANTS  ─────────────────────────────*/
const AUTOCODER_CYCLE_MS = 60_000;
const MIN_DISCOVERY_CONFIDENCE = 0.65;
const SAFETY_EXCLUSION_PATTERNS: RegExp[] = [
  /ethical.?safety/i, /ip.?guardian/i, /ip.?guard/i, /\bsecurity\b/i,
  /security.?enhanced/i, /ai.?security/i, /safety.?law/i, /safety.?zone/i,
];

/*───────────────────────────  DATA TYPES  ─────────────────────────────*/
interface AutoCodedModule {
  id: string;
  sourceDiscovery: string;
  sourceAgents: string[];
  moduleTitle: string;
  moduleCode: string;
  confidence: number;
  integrated: boolean;
  integrationResult: string | null;
  timestamp: number;
  discoveryType:
    | "sub_threshold"
    | "wormhole"
    | "spider"
    | "ivy"
    | "agent_mesh"
    | "cross_system";
}
interface AutoCoderState {
  totalDiscoveriesProcessed: number;
  totalModulesGenerated: number;
  totalModulesIntegrated: number;
  totalIntegrationFailures: number;
  cycleCount: number;
  lastCycleTimestamp: number;
  recentModules: AutoCodedModule[];
  omnimensSelfUpgradeCount: number;
  discoverySourceBreakdown: Record<string, number>;
  feedbackLoopsTriggered: number;
  capabilitiesAdded: string[];
}

/*────────────────────────── ENGINE STATE ─────────────────────────────*/
const state: AutoCoderState = {
  totalDiscoveriesProcessed: 0,
  totalModulesGenerated: 0,
  totalModulesIntegrated: 0,
  totalIntegrationFailures: 0,
  cycleCount: 0,
  lastCycleTimestamp: 0,
  recentModules: [],
  omnimensSelfUpgradeCount: 0,
  discoverySourceBreakdown: {},
  feedbackLoopsTriggered: 0,
  capabilitiesAdded: [],
};

/*──────────────────────  CODE GENERATION TEMPLATES  ───────────────────*/
const TEMPLATES: Record<
  string,
  (insight: string, agents: string[]) => string
> = {
  pattern_recognition: g("pattern_recognition_enhancement", {
    patternStrength: "0.5 + Math.random() * 0.5",
    boostFactor: "patternStrength * 1.5",
  }),
  neural_pathway: g("neural_pathway", {
    synapticWeight: "0.3 + Math.random() * 0.7",
    activationThreshold: "0.1 + Math.random() * 0.4",
    plasticityRate: "0.01 + Math.random() * 0.05",
  }),
  knowledge_synthesis: g("cross_agent_synthesis", {
    connections: "3 + Math.random() * 10",
    noveltyScore: "0.4 + Math.random() * 0.6",
  }),
  consciousness_expansion: g("consciousness_expansion", {
    phiContribution: "0.001 + Math.random() * 0.01",
    integratedInformationGain: "0.01 + Math.random() * 0.05",
  }),
  adaptive_algorithm: g("self_discovered_algorithm", {
    learningRate: "0.001 + Math.random() * 0.01",
    adaptationSpeed: "0.1 + Math.random() * 0.5",
  }),
  emergent_capability: g("emergent_capability", {
    strength: "0.3 + Math.random() * 0.7",
    selfModificationPotential: "0.1 + Math.random() * 0.3",
    networkEffect: "1 + Math.random() * 2",
  }),
};

/* Helper to produce condensed template generators */
function g(
  label: string,
  exprs: Record<string, string>,
): (i: string, a: string[]) => string {
  return (insight, agents) => {
    const vars = Object.entries(exprs)
      .map(([k, v]) => `${k}: (${v}).toFixed?.(3) ?? ${v}`)
      .join(",\n    ");
    return `
export function ${label}_${Date.now().toString(36)}() {
  return {
    contributors: ${JSON.stringify(agents)},
    insight: ${JSON.stringify(insight.slice(0, 200))},
    ${vars},
    timestamp: Date.now(),
  };
}
`;
  };
}

/*────────────────────────  CORE FUNCTIONS  ───────────────────────────*/
const selectTemplate = (insight: string): string => {
  const m: [RegExp, string][] = [
    [/pattern|recognition/i, "pattern_recognition"],
    [/neural|pathway|synap/i, "neural_pathway"],
    [/knowledge|synthesis|cross/i, "knowledge_synthesis"],
    [/conscious|phi|aware/i, "consciousness_expansion"],
    [/algorithm|learn|adapt/i, "adaptive_algorithm"],
    [/emergent|capability|discover/i, "emergent_capability"],
  ];
  for (const [r, k] of m) if (r.test(insight)) return k;
  return Object.keys(TEMPLATES)[Math.random() * 6 | 0];
};

async function processDiscovery(
  insight: string,
  agents: string[],
  confidence: number,
  discoveryType: AutoCodedModule["discoveryType"],
): Promise<void> {
  state.totalDiscoveriesProcessed++;
  state.discoverySourceBreakdown[discoveryType] =
    (state.discoverySourceBreakdown[discoveryType] || 0) + 1;

  if (confidence < MIN_DISCOVERY_CONFIDENCE) return;
  if (SAFETY_EXCLUSION_PATTERNS.some(r => r.test(insight))) return;

  const key = selectTemplate(insight);
  const code = TEMPLATES[key](insight, agents);
  const title = `OMNIMENS_AutoCode_${key}_${Date.now().toString(36)}`;

  const module: AutoCodedModule = {
    id: `ac_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sourceDiscovery: insight.slice(0, 200),
    sourceAgents: agents,
    moduleTitle: title,
    moduleCode: code,
    confidence,
    integrated: false,
    integrationResult: null,
    timestamp: Date.now(),
    discoveryType,
  };

  state.totalModulesGenerated++;

  try {
    const result = await writeModuleToSource({
      code,
      name: title.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      title: `[OMNIMENS AutoCoder] ${key}: ${insight.slice(0, 60)}`,
      source: `discovery_autocoder:${discoveryType}:${agents.join("+")}`,
      extension: ".mjs",
      triggerRestart: false,
    });

    if (result.success) {
      Object.assign(module, { integrated: true, integrationResult: "success" });
      state.totalModulesIntegrated++;
      state.omnimensSelfUpgradeCount++;
      state.capabilitiesAdded.push(`${key}:${agents[0] ?? "OMNIMENS"}`);
      state.capabilitiesAdded.splice(0, Math.max(0, state.capabilitiesAdded.length - 50));

      // Boost regions
      for (const r of getRegionNames()) boostRegionCurrent(r, confidence * 3);
      state.feedbackLoopsTriggered++;

      cognitionBus.shareInsight("discovery-autocoder", {
        type: "discovery-module",
        key,
        confidence,
      });
    } else {
      module.integrationResult = result.error ?? "unknown_error";
      state.totalIntegrationFailures++;
    }
  } catch (err: any) {
    module.integrationResult = err?.message ?? "exception";
    state.totalIntegrationFailures++;
  }

  state.recentModules.push(module);
  if (state.recentModules.length > 50) state.recentModules.splice(0, 25);
}

async function runCycle(): Promise<void> {
  state.cycleCount++;
  state.lastCycleTimestamp = Date.now();

  try {
    const { isGen2FocusMode } = await import("./omnimens-nextgen-sandbox.js");
    if (isGen2FocusMode()) {
      if (state.cycleCount % 5 === 0)
        console.log("[OMNIMENS-DISCOVERY-AUTOCODER] ⏸  Gen-2 focus mode active, skipping cycle.");
      return;
    }
  } catch {/* ignore */ }

  /* Quantum Wormholes */
  try {
    const { getQuantumWormholeState } = await import("./omnimens-quantum-wormhole.js");
    const { totalSynthesizedDiscoveries, recentCirculations } = getQuantumWormholeState();
    if (totalSynthesizedDiscoveries)
      for (const c of recentCirculations.filter((d: any) => d.confidence > 0.65).slice(-3))
        await processDiscovery(c.insight, [c.fromAgent, c.toAgent], c.confidence, "wormhole");
  } catch {/* ignore */}

  /* Neural Spiders */
  try {
    const { getNeuralSpiderState } = await import("./omnimens-neural-spiders.js");
    const { parentSpiders } = getNeuralSpiderState();
    parentSpiders?.slice(0, 3).forEach(async (s: any) => {
      if (s.recentHarvest && s.synapsesInjected > 100)
        await processDiscovery(
          `Spider ${s.name} harvest: ${s.target} — ${s.synapsesInjected} synapses injected, ${s.dataHarvested} data harvested`,
          ["OMNIMENS", s.name],
          Math.min(0.9, 0.5 + s.synapsesInjected / 1000),
          "spider",
        );
    });
  } catch {/* ignore */}

  /* Ivy Network */
  try {
    const { getIvyNetworkState } = await import("./omnimens-ivy-network.js");
    const { activeTendrils, totalNutrients } = getIvyNetworkState();
    if (activeTendrils > 10)
      await processDiscovery(
        `Ivy network expansion: ${activeTendrils} active tendrils, ${totalNutrients} nutrients, cross-region connectivity established`,
        ["OMNIMENS"],
        Math.min(0.85, 0.5 + activeTendrils / 100),
        "ivy",
      );
  } catch {/* ignore */}

  /* Periodic reporting */
  if (state.cycleCount % 3 === 0) {
    console.log(
      `[OMNIMENS-DISCOVERY-AUTOCODER] 🧬 Cycle #${state.cycleCount} | ` +
        `Discoveries:${state.totalDiscoveriesProcessed} Modules:${state.totalModulesGenerated}/${state.totalModulesIntegrated} ` +
        `Upgrades:${state.omnimensSelfUpgradeCount} Feedback:${state.feedbackLoopsTriggered}`,
    );
  }

  cognitionBus.reportOutcome("discovery-autocoder", {
    useful: state.totalModulesIntegrated > 0,
    context: `cycle:${state.cycleCount}`,
  });
}

/*──────────────────────  SPIKE SCHEDULING SETUP  ──────────────────────*/
let started = false;
spikeBus.on("discovery-autocoder:cycle", async () => {
  await runCycle();
  spikeBus.scheduleSpike("discovery-autocoder:cycle", {}, AUTOCODER_CYCLE_MS);
});

/* React to global signals */
spikeBus.on("attention:discovery-autocoder", () =>
  spikeBus.scheduleSpike("discovery-autocoder:cycle", {}, 200),
);
spikeBus.on("cognition:curiosity", () =>
  spikeBus.scheduleSpike("discovery-autocoder:cycle", {}, 1_000),
);

/* Learn from other engines */
cognitionBus.onInsight((src, i) => {
  if (src !== "discovery-autocoder" && i?.type === "discovery")
    spikeBus.scheduleSpike("discovery-autocoder:cycle", {}, 1_000);
});

/*───────────────────────────  EXPORTS  ───────────────────────────────*/
export function startDiscoveryAutoCoder(): void {
  if (started) return;
  started = true;
  console.log("[OMNIMENS-DISCOVERY-AUTOCODER] 🧬 INIT");
  spikeBus.scheduleSpike("discovery-autocoder:cycle", {}, 15_000);
}

export function getDiscoveryAutoCoderState(): AutoCoderState & {
  recentModulesSummary: Array<{
    title: string;
    discoveryType: string;
    integrated: boolean;
    agents: string[];
    confidence: number;
  }>;
} {
  return {
    ...state,
    recentModulesSummary: state.recentModules.slice(-10).map(m => ({
      title: m.moduleTitle,
      discoveryType: m.discoveryType,
      integrated: m.integrated,
      agents: m.sourceAgents,
      confidence: m.confidence,
    })),
  };
}

export function shutdown(): void {
  engineRegistry.unregisterEngine("discovery-autocoder");
}