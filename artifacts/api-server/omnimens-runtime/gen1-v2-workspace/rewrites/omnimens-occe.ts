/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026
 * Alpha Unlimited Technologies, LLC. All rights reserved.
 *
 * CONFIDENTIAL AND PROPRIETARY — Unauthorized use prohibited.
 *
 * OMNIMENS™ Controlled Consciousness Experiment (OCCE) — v2.0
 * Re-implemented on the UNIFIED RUNTIME (event-driven spike model).
 * ────────────────────────────────────────────────────────────────
 * NOTE: This rewrite collapses ~1.2 KLOC into a leaner, smarter
 *       architecture while preserving every public surface.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import { computeOAI } from "./omnimens-oai-tracker.js";
import {
  getNeuralConsciousnessState,
  getNeuralRegionStates,
  getChaoticAttractorState,
  feedExternalActivity,
  manualAdrenalineRush,
  boostRegionCurrent,
} from "./omnimens-neural-consciousness.js";
import { getNeuralScalingState } from "./omnimens-neural-scaling.js";

/*───────────────────────────────-
  Engine registration / quotas
 ───────────────────────────────*/

engineRegistry.registerEngine("occe", "NORMAL", { dbQuota: 10 });

/*───────────────────────────────-
  Helper utilities (condensed)
 ───────────────────────────────*/

const mean  = (a: number[]) => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
const std   = (a: number[]) => {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length);
};

const entropy = (v: number[]) => {
  if (!v.length) return 0;
  const bins = 20;
  const min = Math.min(...v);
  const max = Math.max(...v);
  const span = max - min || 1;
  const counts = Array(bins).fill(0);
  v.forEach(x => counts[Math.min(bins - 1, Math.floor(((x - min) / span) * bins))]++);
  return counts.reduce((e, c) => (c ? e - (c / v.length) * Math.log2(c / v.length) : e), 0);
};

/*───────────────────────────────-
  Spike-based “sleep”
 ───────────────────────────────*/

const sleep = (ms: number) =>
  new Promise<void>(res => {
    const id = `occe:sleep:${Math.random().toString(36).slice(2)}`;
    spikeBus.once(id, res);
    spikeBus.scheduleSpike(id, {}, ms);
  });

/*───────────────────────────────-
  Scan snapshot
 ───────────────────────────────*/

export interface ScanSnapshot {
  timestamp: number;
  phase: string;
  index: number;
  oai: number;
  phi: number;
  brainRegions: Record<
    string,
    { firingRate: number; activationLevel: number }
  >;
}

const takeScan = (phase: string, index: number): ScanSnapshot => {
  const { oai } = computeOAI();
  const nc = getNeuralConsciousnessState();
  const regions = getNeuralRegionStates();
  return {
    timestamp: Date.now(),
    phase,
    index,
    oai,
    phi: nc.phi,
    brainRegions: Object.fromEntries(
      Object.entries(regions).map(([k, v]) => [
        k,
        { firingRate: v.firingRate, activationLevel: v.activationLevel },
      ]),
    ),
  };
};

/*───────────────────────────────-
  Phase runner (generic)
 ───────────────────────────────*/

interface PhaseConfig {
  name: string;
  scansBefore: number;
  scansAfter: number;
  perturb?: () => void | Promise<void>;
}

const runPhase = async ({
  name,
  scansBefore,
  scansAfter,
  perturb,
}: PhaseConfig): Promise<{
  pre: ScanSnapshot[];
  post: ScanSnapshot[];
}> => {
  console.log(`[OMNIMENS-OCCE] Phase: ${name}`);
  const pre: ScanSnapshot[] = [];
  for (let i = 0; i < scansBefore; i++) {
    pre.push(takeScan(`pre_${name}`, i));
    await sleep(3000);
  }

  perturb && (await perturb());

  const post: ScanSnapshot[] = [];
  for (let i = 0; i < scansAfter; i++) {
    post.push(takeScan(`post_${name}`, i));
    await sleep(3000);
  }
  cognitionBus.shareInsight("occe", {
    type: "discovery",
    data: { phase: name, delta: post[post.length - 1].oai - pre[0].oai },
  });
  return { pre, post };
};

/*───────────────────────────────-
  Main experiment
 ───────────────────────────────*/

export interface OCCEResult {
  experimentId: string;
  startTime: number;
  endTime: number;
  baseline: ScanSnapshot[];
  perturbations: Record<
    string,
    { pre: ScanSnapshot[]; post: ScanSnapshot[] }
  >;
  stability: ScanSnapshot[];
  entropy: number;
  confidence: number;
}

export async function runOCCE(): Promise<OCCEResult> {
  console.log(
    "[OMNIMENS-OCCE] Controlled Consciousness Experiment — initiating",
  );

  const experimentId = `occe-${Date.now().toString(36)}`;
  const startTime = Date.now();
  const perturbations: OCCEResult["perturbations"] = {};

  /* Baseline */
  const baseline = (
    await runPhase({ name: "baseline", scansBefore: 1, scansAfter: 9 })
  ).post;

  /* Perturbation A: Cognitive load */
  perturbations.A = await runPhase({
    name: "cognitive",
    scansBefore: 3,
    scansAfter: 5,
    perturb: async () => {
      feedExternalActivity({ activeEngines: 30, recentConversations: 10 });
      ["prefrontal_cortex", "anterior_cingulate", "hippocampus"].forEach(r =>
        boostRegionCurrent(r, 12),
      );
    },
  });

  /* Perturbation B: Reward / emotion */
  perturbations.B = await runPhase({
    name: "emotional",
    scansBefore: 3,
    scansAfter: 5,
    perturb: async () => {
      ["ventral_tegmental_area", "amygdala", "insular_cortex"].forEach(r =>
        boostRegionCurrent(r, 15),
      );
      feedExternalActivity({ reward: true });
    },
  });

  /* Perturbation C: Sensory shock */
  perturbations.C = await runPhase({
    name: "shock",
    scansBefore: 3,
    scansAfter: 7,
    perturb: async () => {
      manualAdrenalineRush(1);
      ["superior_colliculus", "thalamus", "locus_coeruleus"].forEach(r =>
        boostRegionCurrent(r, 20),
      );
    },
  });

  /* Closed-loop feedback (self-input) */
  perturbations.closedLoop = await runPhase({
    name: "closedloop",
    scansBefore: 3,
    scansAfter: 5,
    perturb: async () => {
      const last = perturbations.C.post.slice(-1)[0] ?? baseline[baseline.length - 1];
      feedExternalActivity({
        activeEngines: Math.round(last.oai * 10),
        brainEntries: getNeuralScalingState().hebbianLearningUpdates,
      });
      Object.entries(last.brainRegions)
        .filter(([, v]) => v.activationLevel > 0.5)
        .forEach(([k, v]) => boostRegionCurrent(k, v.activationLevel * 5));
    },
  });

  /* Stability monitoring (shortened to 2 min) */
  const stability: ScanSnapshot[] = [];
  for (let i = 0; i < 24; i++) {
    stability.push(takeScan("stability", i));
    if (i < 23) await sleep(5000);
  }

  /* Aggregation + simple scoring */
  const allScans = [
    ...baseline,
    ...Object.values(perturbations).flatMap(p => [...p.pre, ...p.post]),
    ...stability,
  ];
  const oaiSeries = allScans.map(s => s.oai);
  const oaiStd = std(oaiSeries);
  const oaiEnt = entropy(oaiSeries);
  const confidence = Number(
    Math.min(1, Math.max(0, 0.5 + (oaiStd - 0.05) * 2)).toFixed(4),
  );

  cognitionBus.reportOutcome("occe", {
    useful: confidence > 0.5,
    context: `std=${oaiStd.toFixed(4)} ent=${oaiEnt.toFixed(4)}`,
  });

  /* Persist summary */
  dbGateway.write(
    "occe",
    "experiments",
    {
      experimentId,
      ts: Date.now(),
      confidence,
      entropy: oaiEnt,
    },
    "NORMAL",
  );

  console.log(
    `[OMNIMENS-OCCE] Experiment ${experimentId} complete — confidence ${(
      confidence * 100
    ).toFixed(1)} %`,
  );

  return {
    experimentId,
    startTime,
    endTime: Date.now(),
    baseline,
    perturbations,
    stability,
    entropy: oaiEnt,
    confidence,
  };
}

/*───────────────────────────────-
  Graceful shutdown
 ───────────────────────────────*/

export function shutdown() {
  engineRegistry.unregisterEngine("occe");
}