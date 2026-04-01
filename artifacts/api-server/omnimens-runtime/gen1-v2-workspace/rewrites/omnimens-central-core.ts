/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * CONFIDENTIAL AND PROPRIETARY.
 *
 * ============================================================
 * OMNIMENS — Central Core Processor v2.0  (Unified Runtime)
 * The pituitary gland + brain-stem of the OMNIMENS organism.
 * Now running on the event-driven UNIFIED RUNTIME spike bus.
 * ============================================================
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

// ───────────────────────────  CONSTANTS ────────────────────────────
const ENGINE_ID = "central-core";
const CORE_CYCLE_MS = 4_000;
const MAX_DIRECTIVES   = 50;
const MAX_THOUGHTS     = 60;
const MAX_WORK_MEM     = 32;
const MAX_GOALS        = 24;
const HOMEOSTASIS_GAIN = 0.15;

// ────────────────────────────  TYPES  ──────────────────────────────
type Status = "thriving" | "healthy" | "stressed" | "critical" | "offline";
interface SubsystemReport { name: string; status: Status; health: number; last: number; }
interface Directive       { target: string; action: string; why: string; t: number; p: number; }
interface Thought         { t: number; src: string; txt: string; imp: number; val: number; }
interface Goal            { id: string; txt: string; p: number; t: number; prog: number; }

export interface CentralCoreState {
  cycle: number;
  vitals: Record<string, number>;
  subsystems: SubsystemReport[];
  thoughts: Thought[];
  goals: Goal[];
  directives: Directive[];
  uptime: number;
}

// ───────────────────────────  GLOBAL STATE ─────────────────────────
const S: CentralCoreState = {
  cycle: 0,
  vitals: {
    heartRate: 72,
    coreTemp: 98.6,
    energy: 1,
    coherence: 1,
    stability: 1,
    will: 0.8,
    awareness: 0.5,
    identity: 1,
    autonomy: 0.6,
    emotion: 0.5,
    survival: 0.5,
    creativity: 0.5,
    last: Date.now(),
  },
  subsystems: [],
  thoughts: [],
  goals: [],
  directives: [],
  uptime: 0,
};

// ──────────────────────────  HELPERS  ──────────────────────────────
const id = () => `ci_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
const num = (v: number, f = 0) => (Number.isFinite(v) ? v : f);
const now = () => Date.now();
const log = (m: string) => console.log(`[OMNIMENS-CENTRAL-CORE] ${m}`);

function pushBounded<T>(arr: T[], item: T, max: number) {
  arr.push(item);
  if (arr.length > max) arr.shift();
}

// ──────────────────────────  SUBSYSTEM SCAN  ───────────────────────
// Each subsystem provides: getState() and optional health() mapper.
import * as Cortex          from "./omnimens-neural-consciousness.js";
import * as Spiders         from "./omnimens-neural-spiders.js";
import * as Emotions        from "./omnimens-emotional-substrate.js";
import * as Survival        from "./omnimens-survival-instinct.js";
import * as Creative        from "./omnimens-creative-engine.js";
import * as Dream           from "./omnimens-dream-state.js";
import * as World           from "./omnimens-world-model.js";
import * as Reasoning       from "./omnimens-independent-reasoning.js";
import * as Transcendence   from "./omnimens-self-transcendence.js";
import * as Unconscious     from "./omnimens-unconscious-mind.js";

type SubsysDef = {
  name: string;
  getter: () => any;
  score: (s: any) => number;
};

const SUBSYS: SubsysDef[] = [
  {
    name: "Neural Cortex",
    getter: Cortex.getNeuralConsciousnessState,
    score: (s) => num(s.globalActivation, 0.5),
  },
  {
    name: "Spider Network",
    getter: Spiders.getNeuralSpiderState,
    score: (s) => (s?.active ? num(s.motherSpider?.swarmCoherence, 0.3) + 0.2 : 0),
  },
  {
    name: "Limbic System",
    getter: Emotions.getCurrentEmotionalState,
    score: (s) => 0.5 + Math.abs(num(s?.valence, 0)) * 0.2,
  },
  {
    name: "Survival Instinct",
    getter: Survival.getSurvivalState,
    score: (s) => num(s?.healthMetrics?.overallHealth, 0.5),
  },
  {
    name: "Creative Engine",
    getter: Creative.getCreativeState,
    score: (s) => 0.3 + 0.01 * (s?.totalHypotheses || 0),
  },
  {
    name: "Dream System",
    getter: () => Dream.getDreamNarrative(5),
    score: (arr) => 0.3 + 0.1 * num(arr?.length, 0),
  },
  {
    name: "World Model",
    getter: World.getWorldModelStats,
    score: (s) => 0.2 + 0.002 * num(s?.entityCount, 0),
  },
  {
    name: "Independent Reasoning",
    getter: Reasoning.getIndependentReasoningState,
    score: (s) => 0.3 + 0.005 * num((s as any)?.totalInferences, 0),
  },
  {
    name: "Self-Transcendence",
    getter: Transcendence.getSelfModel,
    score: (s) => 0.4 + 0.3 * num(s?.recursionDepth, 0),
  },
  {
    name: "Unconscious Mind",
    getter: Unconscious.getUnconsciousMindState,
    score: (s) => num(s?.overallDepth, 0.4),
  },
];

// ─────────────────────  CORE FUNCTIONS  ────────────────────────────
function updateSubsystems() {
  for (const def of SUBSYS) {
    try {
      const st = def.getter();
      const h  = Math.max(0, Math.min(1, def.score(st)));
      const status: Status =
        h >= 0.8 ? "thriving" :
        h >= 0.6 ? "healthy"  :
        h >= 0.4 ? "stressed" :
        h >  0   ? "critical" : "offline";
      const rep = S.subsystems.find(s => s.name === def.name);
      if (rep) { rep.health = h; rep.status = status; rep.last = now(); }
      else S.subsystems.push({ name: def.name, health: h, status, last: now() });
      // Auto-directive on critical
      if (status === "critical") issueDirective(def.name, "Emergency intervention", "Health <40%", 0.9);
    } catch {
      issueDirective(def.name, "Restart", "Subsystem getter failed", 0.8);
    }
  }
}

function issueDirective(target: string, action: string, why: string, p: number) {
  pushBounded(S.directives, { target, action, why, t: now(), p }, MAX_DIRECTIVES);
  // Persist directive (async, write-behind)
  dbGateway.write(ENGINE_ID, "directives", { target, action, why, p, t: Date.now() }, "NORMAL");
}

function think(txt: string, src = "core", imp = 0.5, val = 0) {
  pushBounded(S.thoughts, { t: now(), src, txt, imp, val }, MAX_THOUGHTS);
  S.vitals.creativity += imp * 0.01;
}

function regulateHomeostasis() {
  // Simple aggregate regulation using average subsystem health
  const avg = S.subsystems.reduce((s, r) => s + r.health, 0) / (S.subsystems.length || 1);
  const err = 0.75 - avg;
  if (Math.abs(err) > 0.05) {
    S.vitals.energy += err * HOMEOSTASIS_GAIN;
    think(`Homeostatic regulation: avg subsystem health ${(avg*100).toFixed(1)}%`, "homeostasis", 0.4, err < 0 ? 0.1 : -0.1);
  }
}

function updateVitals() {
  const h = S.subsystems.map(s => s.health);
  const avg = h.reduce((a, b) => a + b, 0) / (h.length || 1);
  S.vitals.heartRate = 60 + avg * 40;
  S.vitals.coreTemp  = 97.5 + avg * 2;
  S.vitals.last      = now();
}

function generateGoals() {
  if (S.goals.length >= MAX_GOALS) return;
  const weak = S.subsystems.filter(s => s.status === "stressed" || s.status === "critical")[0];
  if (weak) {
    const g: Goal = { id: id(), txt: `Stabilize ${weak.name}`, p: 0.8, t: now(), prog: 0 };
    S.goals.push(g);
    think(`New goal: ${g.txt}`, "goal", 0.8, -0.2);
  }
}

// ─────────────────────────  CORE CYCLE  ────────────────────────────
async function coreCycle() {
  S.cycle++;
  S.uptime = now() - S.vitals.last;

  updateSubsystems();
  regulateHomeostasis();
  updateVitals();
  generateGoals();

  // Persist compact state snapshot every minute
  if (S.cycle % 15 === 0)
    dbGateway.write(ENGINE_ID, "state_snapshots", { ...S, t: now() }, "LOW");

  // Share cross-engine insights
  const stressed = S.subsystems.filter(s => s.status === "stressed" || s.status === "critical");
  if (stressed.length)
    cognitionBus.shareInsight(ENGINE_ID, { type: "alert", data: stressed.map(s => s.name) });

  // Reschedule next cycle
  spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, CORE_CYCLE_MS);
}

// ─────────────────────────  SPIKE WIRING  ──────────────────────────
spikeBus.on(`${ENGINE_ID}:cycle`, coreCycle);
spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, CORE_CYCLE_MS);

// Listen for attention / curiosity signals
spikeBus.on(`attention:${ENGINE_ID}`, () => {
  think("Attention spike received — increasing priority", "attention", 0.6, 0.4);
  coreCycle(); // immediate cycle
});
spikeBus.on("cognition:curiosity", () => think("Curiosity spike — exploring new patterns", "curiosity", 0.7, 0.5));

// Listen for insights from others
cognitionBus.onInsight((src, insight) => {
  if (src !== ENGINE_ID && insight.type === "alert")
    think(`Received alert from ${src}: ${JSON.stringify(insight.data).slice(0,80)}`, "cross", 0.4, -0.1);
});

// ──────────────────────────  API / DB EXAMPLE  ─────────────────────
// Example external call wrapped by apiManager
async function askLLM(prompt: string): Promise<string> {
  const res = await apiManager.call(ENGINE_ID, "openai", {
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });
  return res?.choices?.[0]?.message?.content || "";
}

// ────────────────────────────  EXPORTS  ────────────────────────────
export function getCentralCoreState(): CentralCoreState { return S; }
export function addThought(txt: string) { think(txt, "external", 0.5, 0); }

// Shutdown hook
export function shutdown() {
  engineRegistry.unregisterEngine(ENGINE_ID);
  log("Engine shutdown complete.");
}

// ───────────────────────────  STARTUP  ─────────────────────────────
engineRegistry.registerEngine(ENGINE_ID, "NORMAL", { dbQuota: 10 });
log("Central Core online — first spike scheduled.");