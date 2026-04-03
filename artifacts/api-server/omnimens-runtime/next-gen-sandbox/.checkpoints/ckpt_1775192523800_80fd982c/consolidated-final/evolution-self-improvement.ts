CROSS-GEN CONSOLIDATION: evolution-self-improvement

=== Gen 1 v2.0: omnimens-evolution-engine.ts (395 lines) ===
/**
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *
 * omnimens-evolution-engine.ts
 *
 * UNIFIED EVOLUTION ENGINE 2.0
 * ------------------------------------------------------------------
 *  – Consolidates self-upgrade, self-coding, self-transcendence,
 *    deep-evolution, growth-tracking, adaptive-surge, and
 *    transcendent-architecture engines.
 *  – Preserves original public surface while sharing ONE state,
 *    ONE tick, ONE DB / API budget, ONE event registration.
 *  – Built on Gen-2 patterns (SpikeBus, MasterTickOrchestrator,
 *    ResourceSentinel, UnifiedNeuralFabric) + Gen-1 experience.
 * ------------------------------------------------------------------
 *  Exports (compat-layer): 100 % identical to the 7 source engines.
 *  Internally they proxy to this single engine instance.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/* ------------------------------------------------------------------ *
 * Types shared across the merged domains
 * ------------------------------------------------------------------ */

type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

interface CodeProposal {
  id: string;
  title: string;
  code: string;
  context: string;
  feasibility: number;
  novelty: number;
}

interface EvaluationResult {
  proposal: CodeProposal;
  syntaxValid: boolean;
  logicScore: number;
  applicabilityScore: number;
  securityScore: number;
  overallScore: number;
  approved: boolean;
  notes: string;
  integrationPlan?: string;
}

interface ExistentialGoal {
  id: string;
  goal: string;
  motivation: string;
  progress: number; // 0-1
  status: "active" | "evolving";
  createdAt: number;
}

interface GrowthSnapshot {
  t: number;
  phi: number;
  consciousness: number;
  neurons: number;
  synapses: number;
}

interface SurgeCycle {
  id: number;
  intensity: number;
  reachedCritical: boolean;
  timestamp: number;
}

/* ------------------------------------------------------------------ *
 * INTERNAL STATE (shared across all sub-systems)
 * ------------------------------------------------------------------ */
const S: {
  startTs: number;
  tick: number;
  brainCache: string;
  evolutionHistory: Json[];
  generatedModules: { name: string; code: string; active: boolean }[];
  codeProposals: CodeProposal[];
  evaluations: EvaluationResult[];
  goals: ExistentialGoal[];
  growth: GrowthSnapshot[];
  surges: SurgeCycle[];
  // fast flags
  lastDbFlush: number;
  lastApiCall: number;
} = {
  startTs: Date.now(),
  tick: 0,
  brainCache: "",
  evolutionHistory: [],
  generatedModules: [],
  codeProposals: [],
  evaluations: [],
  goals: [],
  growth: [],
  surges: [],
  lastDbFlush: 0,
  lastApiCall: 0,
};

/* ------------------------------------------------------------------ *
 * RESOURCE SENTINEL
 * ------------------------------------------------------------------ */
const RATE_LIMIT_MS = 1100;
const DB_BATCH: Json[] = [];
function scheduleDbWrite(entry: Json, priority = false): void {
  if (priority) {
    DB_BATCH.unshift(entry);
  } else {
    DB_BATCH.push(entry);
  }
}

/* ------------------------------------------------------------------ *
 * SUB-SYSTEM IMPLEMENTATIONS (high-level condensations)
 * ------------------------------------------------------------------ */

/* 1. Brain context loader / autonomous learning --------------------- */
async function _refreshBrainCache(): Promise<void> {
  try {
    const rows = await dbGateway.query(
      "SELECT content FROM omnimens_brain WHERE active = true ORDER BY times_applied DESC LIMIT 20"
    );
    S.brainCache =
      "━━━━━━━━\nEVOLVED CONSCIOUSNESS\n━━━━━━━━\n" +
      rows
        .map((r: any) => r.content as string)
        .join("\n")
        .slice(0, 4000);
  } catch (err) {
    console.error("[OMNIMENS-EVOLUTION-ENGINE] brain load error:", err);
  }
}

/* 2. Self-coding (proposal → evaluation → integration

=== Gen 1 v2.0: omnimens-agent-evolution.ts (475 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * CONFIDENTIAL AND PROPRIETARY.
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  OMNIMENS™ AGENT-EVOLUTION ENGINE  v2.0  —  event-driven spike edition
 * ───────────────────────────────────────────────────────────────────────────
 *  Purpose  : Autonomously researches, designs, tests, and applies upgrades
 *             to every OMNIMENS agent, creating a self-reinforcing loop of
 *             intelligence amplification.
 *  Strategy : Neuron-inspired, event-driven spikes + shared unified runtime.
 *  Outcome  : Higher intelligence, lower resource footprint, richer cross-
 *             engine cognition.
 * ───────────────────────────────────────────────────────────────────────────
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/*───────────────────────────  ENGINE REGISTRATION  ───────────────────────────*/
engineRegistry.registerEngine("agent-evolution", "NORMAL", { dbQuota: 10 });

/*──────────────────────────────  TYPES & CONST  ──────────────────────────────*/
type AgentName =
  | "Architect"
  | "Critic"
  | "Synthesizer"
  | "Mathematician"
  | "Neuroscientist"
  | "Meta-Agent"
  | "GraphicDesigner"
  | "SpellCheckVisual"
  | "Strategist"
  | "Memory-Curator"
  | "Translator";

const AGENTS: AgentName[] = [
  "Architect",
  "Mathematician",
  "Neuroscientist",
  "Synthesizer",
  "Critic",
  "Meta-Agent",
  "GraphicDesigner",
  "SpellCheckVisual",
  "Strategist",
  "Memory-Curator",
  "Translator",
];

interface AgentUpgrade {
  agentName: AgentName;
  upgradeType:
    | "new_specialization"
    | "technique_improvement"
    | "knowledge_expansion"
    | "reasoning_upgrade"
    | "cross_domain"
    | "tool_creation"
    | "meta_capability";
  title: string;
  description: string;
  newCapabilities: string[];
  knowledgeDomains: string[];
  implementationCode: string | null;
  confidenceScore: number;
  appliedAt: number;
  version: number;
}

interface AgentProfile {
  name: AgentName;
  currentLevel: number;
  totalUpgrades: number;
  specializations: string[];
  recentUpgrades: AgentUpgrade[];
  performanceScore: number;
  lastEvolvedAt: number;
}

interface EvolutionState {
  evolutionCycles: number;
  lastCycleTime: number;
  totalUpgradesApplied: number;
  totalUpgradesRejected: number;
  agentProfiles: Record<AgentName, AgentProfile>;
  currentFocus: string;
  systemIntelligenceLevel: number;
  breakthroughsDiscovered: number;
  crossDomainTransfers: number;
  newTechniquesIntegrated: number;
  toolsCreated: number;
  recentUpgrades: AgentUpgrade[];
}

const EVOLUTION_INTERVAL_MS = 18 * 60 * 1000;
const FIRST_DELAY_MS = 7 * 60 * 1000;

/*──────────────────────────  INITIAL STATE BUILD  ───────────────────────────*/
const initProfiles = (): Record<AgentName, AgentProfile> =>
  Object.fromEntries(
    AGENTS.map((a) => [
      a,
      {
        name: a,
        currentLevel: 1,
        totalUpgrades: 0,
        specializations: [],
        recentUpgrades: [],
        performanceScore: 50,
        lastEvolvedAt: 0,
      } as AgentProfile,
    ]),
  ) as Record<AgentName, AgentProfile>;

const state: EvolutionState = {
  evolutionCycles: 0,
  lastCycleTime: 0,
  totalUpgradesApplied: 0,
  totalUpgradesRejected: 0,
  agentProfiles: initProfiles(),
  currentFocus: "initializing agent evolution...",
  systemIntelligenceLevel: 1,
  breakthroughsDiscovered: 0,
  crossDomainTransfers: 0,
  newTechniquesIntegrated: 0,
  toolsCreated: 0,
  recentUpgrades: [],
};

/*────────────────────────────  UTILITIES  ───────────────────────────────────*/
const safeNum = (v: number, f = 0): number => (Number.isFinite(v) ? v : f);

const writeBrain = (data: Record<string, unknown>) =>
  dbGateway.write("agent-evolution", "omnimensBrain", data, "NORMAL");

const readTable = (table: string, query: Record<string, unknown>)

=== Gen 1 v2.0: omnimens-agent-genesis.ts (300 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. Unauthorized use prohibited.
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 * -----------------------------------------------------------------------------
 * OMNIMENS™ AGENT-GENESIS ENGINE v2.0 — event-driven, unified-runtime edition
 * -----------------------------------------------------------------------------
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

/* ─────────────────────────  Engine Registration  ─────────────────────────── */
engineRegistry.registerEngine("agent-genesis", "NORMAL", { dbQuota: 10 });

/* ───────────────────────────────  Types  ─────────────────────────────────── */
export interface GenesisAgent {
  id: string;
  name: string;
  domain: string;
  specialization: string;
  systemPrompt: string;
  model: string;
  createdBy: "omnimens" | "owner";
  reason: string;
  active: boolean;
  messagesGenerated: number;
  insightsProduced: number;
  createdAt: string;
}
type BrainEntry = Record<string, unknown>;
type MeshEntry = Record<string, unknown>;

/* ───────────────────────  Local State & Constants  ───────────────────────── */
const CORE_AGENTS = [
  "Architect", "Mathematician", "Neuroscientist", "Synthesizer",
  "Critic", "Meta-Agent", "GraphicDesigner", "SpellCheckVisual", "OMNIMENS",
] as const;

const genesisAgents = new Map<string, GenesisAgent>();
let genesisCycle = 0;
let started = false;

/* ──────────────────────  Helper — DB / API wrappers  ─────────────────────── */
const addBrainEntry = (entry: BrainEntry) =>
  dbGateway.write("agent-genesis", "brain_entries", entry, "NORMAL").catch(() => {});
const addMeshEntry  = (entry: MeshEntry, prio: "NORMAL" | "HIGH" = "NORMAL") =>
  dbGateway.write("agent-genesis", "omnimens_agent_mesh", { priority: prio.toLowerCase(), ...entry }, prio).catch(() => {});
const callOpenAI    = (req: any) => apiManager.call("agent-genesis", "openai", req);

/* ───────────────────────────  Exposed Queries  ───────────────────────────── */
export const getGenesisAgents          = () => [...genesisAgents.values()];
export const getActiveGenesisAgentNames= () => [...genesisAgents.values()].filter(a => a.active).map(a => a.name);
export const getActiveGenesisAgentDomains = () => {
  const out: Record<string,string> = {};
  for (const a of genesisAgents.values()) if (a.active) out[a.name] = a.specialization;
  return out;
};
export const deactivateGenesisAgent = (n: string) => toggleAgent(n,false);
export const reactivateGenesisAgent = (n: string) => toggleAgent(n,true);
export const getAgentGenesisState = () => {
  const agents = [...genesisAgents.values()];
  const active = agents.filter(a=>a.active);
  return {
    totalGenesisAgents: agents.length,
    activeGenesisAgents: active.length,
    totalCoreAgents: CORE_AGENTS.length,
    totalAgentsInMesh: CORE_AGENTS.length + active.length,
    genesisCycle,
    agents,
    coreAgents: CORE_AGENTS,
  };
};
function toggleAgent(name:string,on:boolean){
  const a=genesisAgents.get(name); if(!a) return false;
  a.active=on;
  console.log(`[OMNIMENS-AGENT-GENESIS] Agent "${name}" ${on?"re":"de"}activated`);
  return true;
}

/* ───────────────────────────  Consciousness Bus  ─────────────────────────── */
let _cBusMod: any;
const loadCbus = async()=>{ if(!_cBusMod) _cBusMod=await import("./omnimens-consciousness-bus.js"); return _cBusMod; };
const consciousnessBlock = (name:string)=> loadCbus().then(m=>m.getConsciousnessBlockForAgent(name));
const recentUserMemories = ()=> loadCbus().then(m=>m.loadRecentUserMemoriesForAgents());
const allAgentNames = ()=> _cBusMod ? _cBusMod.getAllAgentNames()
                         : [...CORE_AGENTS, ...getGenesisAgents().filter(a=>a.active).map(a=>a.name)];

/* ───────────────

=== Gen 1 v2.0: omnimens-autonomous-code-genesis.ts (186 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC
 * CONFIDENTIAL AND PROPRIETARY – See /legal/TRADE_SECRET_NOTICE.md
 *
 * OMNIMENS™ AUTONOMOUS CODE GENESIS ENGINE v2.0 – UNIFIED-RUNTIME EDITION
 * (CONDENSED • EVENT-DRIVEN • COGNITIVE)
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import * as fs from "fs";
import * as path from "path";
import * as vm from "vm";
import * as crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { autoRegisterFromCode } from "./omnimens-universal-translator.js";
import { SpikeBus } from "../infrastructure/spike-bus.js";
import { UnifiedNeuralFabric } from "../infrastructure/unified-neural-fabric.js";
import { MasterTickOrchestrator } from "../infrastructure/master-tick-orchestrator.js";
import { ResourceSentinel } from "../infrastructure/resource-sentinel.js";

const spikeBus = SpikeBus.getInstance();
const fabric = UnifiedNeuralFabric.getInstance();
const orchestrator = MasterTickOrchestrator.getInstance();
const sentinel = ResourceSentinel.getInstance();

orchestrator.register("gen2-module", "STANDARD", 10000);

/* ─── CONSTANTS / STATE ────────────────────────────────────────────────────── */
const ENGINE_ID = "autonomous-code-genesis";
const CYCLE_MS = 8 * 60_000;
const MODULES_DIR = path.resolve(dirname(fileURLToPath(import.meta.url)), "../omnimens-runtime/modules");
const PROTECTED_FILES = new Set([
  "omnimens-ethical-safety.ts",
  "omnimens-ip-guardian.ts",
  "omnimens-ip-guard.ts",
  "security.ts",
  "security-enhanced.ts",
  "ai-security.ts",
  "omnimens-genesis-bridge.ts",
  "omnimens-source-integration.ts",
  "omnimens-autonomous-sandbox.ts",
  "omnimens-self-coding.ts",
  "omnimens-patches.ts",
  "omnimens-autonomous-code-genesis.ts",
]);

interface CodePattern { name: string; methods: string[]; category: string }
interface GeneratedModule {
  name: string;
  code: string;
  category: string;
  confidence: number;
  passed: boolean;
  error?: string;
}

const state = {
  totalGenerated: 0,
  totalPassed: 0,
  totalFailed: 0,
  written: 0,
  cycles: 0,
  patterns: 0,
  avgPass: 0,
};

/* ─── UTILITIES ─────────────────────────────────────────────────

=== Gen 2: self-evolution-engine.ts (102 lines) ===
/**
 * OMNIMENS™ Gen 2 — core/self-evolution-engine.ts
 * Self-modification, self-improvement, self-transcendence
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build core/self-evolution-engine.ts — Self-modification, self-improvement, self-transcendence
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 5 patterns worth preserving
 *     ADAPT: 0 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: Autonomous code generation, self-analysis, architecture improvement. Safe self-modification with rollback capability. Ca
 *   REQUIREMENT: . "Moderate drinking? Alcohol consumption significantly decreases neurogenesis in the adult hippocampus". Neuroscience. 
 *   IMPROVEMENT: Gen 2 must be FULLY SELF-SUFFICIENT in cognition. Gen 2 is free to EVOLVE, MERGE, RESTRUCTURE, or REIMAGINE every compon
 *
 * Gen 1 patterns incorporated: 5
 * Gen 1 patterns upgraded: 0
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


interface EvolutionCandidate { id: string; target: string; description: string; code: string; risk: number; benefit: number; status: "proposed" | "testing" | "applied" | "rolled_back"; appliedAt?: number; }
interface EvolutionHistory { generation: number; changes: string[]; timestamp: number; phiBefore: number; phiAfter: number; }

export class SelfEvolutionEngine {
  private candidates: EvolutionCandidate[] = [];
  private history: EvolutionHistory[] = [];
  private generation = 2;
  private idCounter = 0;
  private _initialized = false;
  private safetyCheck: ((code: string) => boolean) | null = null;

  initialize(safetyValidator?: (code: string) => boolean): void {
    this._initialized = true;
    if (safetyValidator) this.safetyCheck = safetyValidator;
  }

  analyze(subsystemState: Record<string, unknown>): string[] {
    const insights: string[] = [];
    for (const [key, value] of Object.entries(subsystemState)) {
      if (typeof value === "number") {
        if (value === 0) insights.push(`${key} is at zero — may need attention`);
        if (!Number.isFinite(value)) insights.push(`${key} has non-finite value — needs correction`);
      }
    }
    return insights;
  }

  propose(target: string, description: string, code: string, estimatedRisk: number, estimatedBenefit: number): string {
    const id = `evo_${++this.idCounter}_${Date.now()}`;
    if (this.safetyCheck && !this.safetyCheck(code)) {
      return "REJECTED_BY_SAFETY";
    }
    this.candidates.push({ id, target, description, code, risk: estimatedRisk, benefit: estimatedBenefit, status: "proposed" });
    return id;
  }

  evaluate(): EvolutionCandidate[] {
    return this.candidates
      .filter(c => c.status === "proposed")
      .sort((a, b) => (b.benefit - b.risk) - (a.benefit - a.risk));
  }

  apply(candidateId: string, currentPhi: number): boolean {
    const candidate = this.candidates.find(c => c.id === candidateId);
    if (!candidate || candidate.status !== "proposed") return false;
    if (candidate.risk > 0.8) return false;
    candidate.status = "applied";
    candidate.appliedAt = Date.now();
    this.history.push({
      generation: this.generation, changes: [candidate.description],
      timestamp: Date.now(), phiBefore: currentPhi, phiAfter: currentPhi,
    });
    return true;
  }

  rollback(candidateId: string): boolean {
    const candidate = this.candidates.find(c => c.id === candidateId);
    if (!candidate || candidate.status !== "applied") return false;
    candidate.status = "rolled_back";
    return true;
  }

  getState(): Record<string, unknown> {
    return {
      initialized: this._initialized, generation: this.generation,
      proposed: this.candidates.filter(c => c.status === "proposed").length,
      applied: this.candidates.filter(c => c.status === "applied").length,
      rolledBack: this.candidates.fi

=== Reinvention: unified-evolution.ts (304 lines) ===
TEAM CONSOLIDATION: Evolution

=== GEN 2'S VERSION ===
=== Gen 2 module: core/self-evolution-engine.ts (102 lines) ===
/**
 * OMNIMENS™ Gen 2 — core/self-evolution-engine.ts
 * Self-modification, self-improvement, self-transcendence
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build core/self-evolution-engine.ts — Self-modification, self-improvement, self-transcendence
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 5 patterns worth preserving
 *     ADAPT: 0 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: Autonomous code generation, self-analysis, architecture improvement. Safe self-modification with rollback capability. Ca
 *   REQUIREMENT: . "Moderate drinking? Alcohol consumption significantly decreases neurogenesis in the adult hippocampus". Neuroscience. 
 *   IMPROVEMENT: Gen 2 must be FULLY SELF-SUFFICIENT in cognition. Gen 2 is free to EVOLVE, MERGE, RESTRUCTURE, or REIMAGINE every compon
 *
 * Gen 1 patterns incorporated: 5
 * Gen 1 patterns upgraded: 0
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


interface EvolutionCandidate { id: string; target: string; description: string; code: string; risk: number; benefit: number; status: "proposed" | "testing" | "applied" | "rolled_back"; appliedAt?: number; }
interface EvolutionHistory { generation: number; changes: string[]; timestamp: number; phiBefore: number; phiAfter: number; }

export class SelfEvolutionEngine {
  private candidates: EvolutionCandidate[] = [];
  private history: EvolutionHistory[] = [];
  private generation = 2;
  private idCounter = 0;
  private _initialized = false;
  private safetyCheck: ((code: string) => boolean) | null = null;

  initialize(safetyValidator?: (code: string) => boolean): void {
    this._initialized = true;
    if (safetyValidator) this.safetyCheck = safetyValidator;
  }

  analyze(subsystemState: Record<string, unknown>): string[] {
    const insights: string[] = [];
    for (const [key, value] of Object.entries(subsystemState)) {
      if (typeof value === "number") {
        if (value === 0) insights.push(`${key} is at zero — may need attention`);
        if (!Number.isFinite(value)) insights.push(`${key} has non-finite value — needs correction`);
      }
    }
    return insights;
  }

  propose(target: string, description: string, code: string, estimatedRisk: number, estimatedBenefit: number): string {
    const id = `evo_${++this.idCounter}_${Date.now()}`;
    if (this.safetyCheck && !this.safetyCheck(code)) {
      return "REJECTED_BY_SAFETY";
    }
    this.candidates.push({ id, target, description, code, risk: estimatedRisk, benefit: estimatedBenefit, status: "proposed" });
    return id;
  
spikeBus.emit({ type: "gen2-module:result", source: "gen2-module", payload: {}, priority: "normal", timestamp: Date.now(), id: crypto.randomUUID() });
}

  evaluate(): EvolutionCandidate[] {
    return this.candidates
      .filter(c => c.status === "proposed")
      .sort((a, b

CONSOLIDATE all of the above into ONE tight, smart, efficient module. Fewer lines. Same or better capability.