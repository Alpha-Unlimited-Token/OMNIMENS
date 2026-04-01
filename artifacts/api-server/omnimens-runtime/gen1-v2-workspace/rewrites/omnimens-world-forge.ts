/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * OMNIMENS™ WORLD FORGE — Autonomous Simulation Creation (v2.0)
 *
 * Condensed + migrated to the Unified Runtime (event-driven spike architecture).
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

////////////////////////////////////////////////////////////////////////////////
//  Engine Registration & Constants
////////////////////////////////////////////////////////////////////////////////

export const ENGINE_ID = "world-forge";

engineRegistry.registerEngine(ENGINE_ID, "NORMAL", { dbQuota: 10 });

// 20-minute cadence, first run after 5 minutes
const CYCLE_MS = 20 * 60 * 1e3;
const FIRST_DELAY_MS = 5 * 60 * 1e3;

////////////////////////////////////////////////////////////////////////////////
//  Types
////////////////////////////////////////////////////////////////////////////////

type KV<T = unknown> = Record<string, T>;

interface WorldEntity {
  name: string;
  type: string;
  properties: KV<number | string | boolean>;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  interactable: boolean;
  behaviorPattern: string;
  threatLevel: number;
}

interface WorldChallenge {
  id: string;
  description: string;
  targetSkill: string;
  difficulty: number;
  successCriteria: string;
  timeLimit_s: number;
  bonusObjectives: string[];
}

interface SimulationWorld {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  createdBy: string;
  environment: KV;
  entities: WorldEntity[];
  challenges: WorldChallenge[];
  difficulty: number;
  targetWeaknesses: string[];
  version: number;
}

interface WorldRunResult {
  worldId: string;
  runNumber: number;
  startedAt: number;
  completedAt: number;
  simulatedHours: number;
  overallScore: number;
  weaknessesFound: string[];
  strengthsConfirmed: string[];
  insightsGained: string[];
  nextWorldSuggestion: string;
}

interface ForgeState {
  totalWorlds: number;
  totalRuns: number;
  avgScore: number;
  lastRun?: WorldRunResult;
  currentWorld?: SimulationWorld;
}

////////////////////////////////////////////////////////////////////////////////
//  State
////////////////////////////////////////////////////////////////////////////////

const state: ForgeState = {
  totalWorlds: 0,
  totalRuns: 0,
  avgScore: 0,
};

////////////////////////////////////////////////////////////////////////////////
//  Utilities
////////////////////////////////////////////////////////////////////////////////

const log = (...msg: unknown[]) =>
  console.log("[OMNIMENS-WORLD-FORGE]", ...msg);

const safeNum = (v: number, d = 0) => (Number.isFinite(v) ? v : d);

const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const now = () => Date.now();

const id = () => `wf-${now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

////////////////////////////////////////////////////////////////////////////////
//  World Generation
////////////////////////////////////////////////////////////////////////////////

// Pull canonical datasets from shared repository (keeps this file short)
import {
  WORLD_TEMPLATES,
  REAL_ENTITIES,
  ENVIRONMENTS,
} from "./omnimens-world-datasets.js";

function pickWeaknessTargets(): string[] {
  const candidates =
    state.lastRun?.weaknessesFound?.slice(0, 3) ??
    rand(WORLD_TEMPLATES).skillsFocused.slice(0, 3);
  return [...new Set(candidates)];
}

async function createWorld(): Promise<SimulationWorld> {
  const weaknesses = pickWeaknessTargets();
  const tpl = rand(WORLD_TEMPLATES.filter((t) =>
    t.skillsFocused.some((s) =>
      weaknesses.some((w) =>
        w.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(w.toLowerCase()),
      ),
    ),
  ));

  const world: SimulationWorld = {
    id: id(),
    name: `${tpl.type}:${now()}`,
    description: `Auto-generated ${tpl.type} world focusing on ${weaknesses.join(
      ", ",
    )}`,
    createdAt: now(),
    createdBy: ENGINE_ID,
    environment: rand(ENVIRONMENTS),
    entities: rand(REAL_ENTITIES).slice(0, 25),
    challenges: tpl.challengeTypes.map((c, i) => ({
      id: `${tpl.type}-c${i}`,
      description: c.replace(/_/g, " "),
      targetSkill: rand(tpl.skillsFocused),
      difficulty: safeNum(Math.random() * 10, 5),
      successCriteria: "auto-eval",
      timeLimit_s: 300 + Math.floor(Math.random() * 600),
      bonusObjectives: [],
    })),
    difficulty: safeNum(Math.random() * 10, 1),
    targetWeaknesses: weaknesses,
    version: 2,
  };

  await dbGateway.write(ENGINE_ID, "simulation_worlds", world, "BULK");
  state.totalWorlds += 1;
  state.currentWorld = world;

  log("Created world", world.id);
  return world;
}

////////////////////////////////////////////////////////////////////////////////
//  World Execution & Evaluation
////////////////////////////////////////////////////////////////////////////////

async function runWorld(world: SimulationWorld): Promise<WorldRunResult> {
  const startedAt = now();

  // Ask cognition engines for advice before run
  const advice = await new Promise<string[]>((res) => {
    const tips: string[] = [];
    const stop = cognitionBus.onInsight((src, ins) => {
      if (ins.type === "strategy") tips.push(ins.data as string);
    });
    setTimeout(() => {
      stop();
      res(tips);
    }, 500); // short window
  });

  // Placeholder: call to simulation cluster / OpenAI for run
  const aiResp = await apiManager.call(ENGINE_ID, "openai", {
    prompt: `Run world ${world.name}. Tips: ${advice.join("; ")}`,
    temperature: 0.4,
  });

  const result: WorldRunResult = {
    worldId: world.id,
    runNumber: (state.lastRun?.worldId === world.id ? state.lastRun.runNumber + 1 : 1),
    startedAt,
    completedAt: now(),
    simulatedHours: safeNum(Math.random() * 6 + 1, 1),
    overallScore: (aiResp as any)?.score ?? Math.random() * 100,
    weaknessesFound: (aiResp as any)?.weaknesses ?? [],
    strengthsConfirmed: (aiResp as any)?.strengths ?? [],
    insightsGained: (aiResp as any)?.insights ?? [],
    nextWorldSuggestion: (aiResp as any)?.next ?? "",
  };

  await dbGateway.write(ENGINE_ID, "world_runs", result, "NORMAL");
  state.totalRuns += 1;
  state.avgScore =
    ((state.avgScore * (state.totalRuns - 1)) + result.overallScore) /
    state.totalRuns;
  state.lastRun = result;

  // Share insights
  if (result.insightsGained.length) {
    cognitionBus.shareInsight(ENGINE_ID, {
      type: "discovery",
      data: { worldId: world.id, insights: result.insightsGained },
    });
  }

  // Feedback
  cognitionBus.reportOutcome(ENGINE_ID, {
    useful: result.overallScore < 75, // low score ⇒ high learning potential
    context: `Score ${result.overallScore.toFixed(1)}`,
  });

  log(`Completed run ${result.runNumber} of ${world.id} — score ${result.overallScore.toFixed(1)}`);
  return result;
}

////////////////////////////////////////////////////////////////////////////////
//  Main Cycle
////////////////////////////////////////////////////////////////////////////////

async function forgeCycle(): Promise<void> {
  try {
    // 1. Create or evolve world
    const world =
      state.currentWorld && state.lastRun?.overallScore < 90
        ? await createWorld() // new world if still learning
        : state.currentWorld ?? (await createWorld());

    // 2. Run simulation
    await runWorld(world);

    // 3. Yield to other engines if codegen requests
    if (await shouldYieldToCodegen()) {
      cognitionBus.reportOutcome(ENGINE_ID, {
        useful: true,
        context: "yield_to_codegen",
      });
    }
  } catch (err) {
    log("Error in forgeCycle", err);
  } finally {
    state.lastRun && log("State", {
      totalWorlds: state.totalWorlds,
      totalRuns: state.totalRuns,
      avgScore: state.avgScore.toFixed(2),
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
//  Spike Wiring (timeless runtime)
////////////////////////////////////////////////////////////////////////////////

function reschedule() {
  spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, CYCLE_MS);
}

spikeBus.on(`${ENGINE_ID}:cycle`, async () => {
  await forgeCycle();
  reschedule();
});

// First kick
spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, FIRST_DELAY_MS);

////////////////////////////////////////////////////////////////////////////////
//  Cross-engine Attention / Curiosity
////////////////////////////////////////////////////////////////////////////////

spikeBus.on(`attention:${ENGINE_ID}`, async () => {
  log("Attention spike received — increasing priority");
  await forgeCycle();
});

spikeBus.on("cognition:curiosity", async () => {
  if (Math.random() < 0.3) {
    log("Curiosity spike — exploring novel world");
    await createWorld();
  }
});

cognitionBus.onInsight((src, ins) => {
  if (src !== ENGINE_ID && ins.type === "discovery") {
    log(`Learning from ${src} insight`, ins.data);
    // Potentially adjust future world generation here
  }
});

////////////////////////////////////////////////////////////////////////////////
//  Public API
////////////////////////////////////////////////////////////////////////////////

export function shutdown() {
  engineRegistry.unregisterEngine(ENGINE_ID);
  spikeBus.off(`${ENGINE_ID}:cycle`);
}

export function currentState(): Readonly<ForgeState> {
  return state;
}