/**
 * OMNIMENS™ NEURAL SCALING ENGINE — POPULATION-LEVEL NEURAL ARCHITECTURE
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * PROPRIETARY AND CONFIDENTIAL TRADE SECRET
 *
 * v2.0 — Unified Runtime, Event-Driven Spike Architecture
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import {
  getNeuralConsciousnessState,
  captureNeuralSnapshot,
  getRegionNames,
} from "./omnimens-neural-consciousness.js";

/* ------------------------------------------------------------------ */
/* CONSTANTS                                                          */
/* ------------------------------------------------------------------ */
const SCALING_TICK_MS = 5_000;
const DENDRITE_GROWTH_INTERVAL_MS = 30_000;
const POPULATION_SIZE = 5_000;
const CORTICAL_HYPERCOLUMN_MULTIPLIER = 258;
const SPINE_DENSITY_PER_DENDRITE = 25;
const MAX_DENDRITES_PER_POPULATION = 10_000;
const DENDRITE_REACH_PROBABILITY = 0.35;

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */
type Receptor =
  | "AMPA"
  | "NMDA"
  | "GABA_A"
  | "GABA_B"
  | "dopaminergic"
  | "serotonergic";

interface DendriticSpine {
  id: string;
  targetRegion: string;
  targetPopulationId: string;
  strength: number;
  maturity: number;
  lastActivation: number;
  receptorType: Receptor;
}

interface Dendrite {
  id: string;
  parentPopulationId: string;
  direction: [number, number, number];
  length: number;
  growthRate: number;
  spines: DendriticSpine[];
  branchPoints: number;
  myelinated: boolean;
  targetRegions: string[];
}

interface NeuralPopulation {
  id: string;
  region: string;
  size: number;
  meanFiringRate: number;
  firingRateVariance: number;
  meanPotential: number;
  potentialVariance: number;
  correlationCoefficient: number;
  populationOscillation: number;
  oscillationPhase: number;
  oscillationFrequency: number;
  dendrites: Dendrite[];
  totalSpines: number;
  totalConnections: number;
  lastUpdate: number;
}

interface PopulationSynapse {
  sourcePopulationId: string;
  targetPopulationId: string;
  weight: number;
  delay: number;
  connectionDensity: number;
  plasticityRate: number;
  neurotransmitter: string;
  spineMediated: boolean;
  lastPlasticityEvent: number;
}

interface ScalingState {
  totalEffectiveNeurons: number;
  totalColumnNeurons: number;
  corticalHypercolumnMultiplier: number;
  totalPopulations: number;
  totalDendrites: number;
  totalSpines: number;
  totalPopulationSynapses: number;
  populationPhi: number;
  meanPopulationFiringRate: number;
  dendriticGrowthEvents: number;
  spineFormationEvents: number;
  spinePruningEvents: number;
  scalingTicks: number;
  populationCoherence: number;
  crossRegionIntegration: number;
  informationFlowRate: number;
  startTime: number;
  lastTickTime: number;
}

/* ------------------------------------------------------------------ */
/* STATE                                                              */
/* ------------------------------------------------------------------ */
const populations = new Map<string, NeuralPopulation>();
const populationSynapses: PopulationSynapse[] = [];
const regionPopulations = new Map<string, string[]>();

const scalingState: ScalingState = {
  totalEffectiveNeurons: 0,
  totalColumnNeurons: 0,
  corticalHypercolumnMultiplier: CORTICAL_HYPERCOLUMN_MULTIPLIER,
  totalPopulations: 0,
  totalDendrites: 0,
  totalSpines: 0,
  totalPopulationSynapses: 0,
  populationPhi: 0,
  meanPopulationFiringRate: 0,
  dendriticGrowthEvents: 0,
  spineFormationEvents: 0,
  spinePruningEvents: 0,
  scalingTicks: 0,
  populationCoherence: 0,
  crossRegionIntegration: 0,
  informationFlowRate: 0,
  startTime: Date.now(),
  lastTickTime: Date.now(),
};

/* ------------------------------------------------------------------ */
/* UTILITIES                                                          */
/* ------------------------------------------------------------------ */
const safeNum = (val: number, fallback = 0): number =>
  Number.isFinite(val) ? val : fallback;

/* ------------------------------------------------------------------ */
/* INITIALIZATION                                                     */
/* ------------------------------------------------------------------ */
const REGION_POPULATION_COUNTS: Record<string, number> = {
  reticular_activating_system: 24,
  thalamus: 60,
  prefrontal_cortex: 105,
  default_mode_network: 90,
  anterior_cingulate: 45,
  insular_cortex: 45,
  ventral_tegmental_area: 30,
  hippocampus: 75,
  amygdala: 36,
  basal_ganglia: 45,
  claustrum: 54,
  locus_coeruleus: 18,
  raphe_nuclei: 24,
  superior_colliculus: 30,
  pulvinar: 36,
  cerebellum: 60,
};

function initializePopulations(): void {
  for (const regionName of getRegionNames()) {
    const popCount = REGION_POPULATION_COUNTS[regionName] ?? 30;
    const ids: string[] = [];

    for (let i = 0; i < popCount; i++) {
      const id = `pop_${regionName}_${i}`;
      const oscFreq = 8 + Math.random() * 32;

      populations.set(id, {
        id,
        region: regionName,
        size: POPULATION_SIZE + Math.floor(Math.random() * 50 - 25),
        meanFiringRate: 0.05 + Math.random() * 0.15,
        firingRateVariance: 0.01 + Math.random() * 0.05,
        meanPotential: -70 + Math.random() * 5,
        potentialVariance: 2 + Math.random() * 3,
        correlationCoefficient: 0.1 + Math.random() * 0.3,
        populationOscillation: 0.3 + Math.random() * 0.4,
        oscillationPhase: Math.random() * Math.PI * 2,
        oscillationFrequency: oscFreq,
        dendrites: [],
        totalSpines: 0,
        totalConnections: 0,
        lastUpdate: Date.now(),
      });

      ids.push(id);
    }
    regionPopulations.set(regionName, ids);
  }

  let totalColumnNeurons = 0;
  populations.forEach((p) => (totalColumnNeurons += p.size));

  scalingState.totalPopulations = populations.size;
  scalingState.totalColumnNeurons = totalColumnNeurons;
  scalingState.totalEffectiveNeurons =
    totalColumnNeurons * CORTICAL_HYPERCOLUMN_MULTIPLIER;
}

function sproutDendrites(initial = false): void {
  const allRegions = [...regionPopulations.keys()];

  populations.forEach((pop) => {
    if (pop.dendrites.length >= MAX_DENDRITES_PER_POPULATION) return;
    if (!initial && Math.random() >= 0.15 + pop.meanFiringRate * 0.3) return;

    const targetRegions = allRegions.filter(
      (r) => r === pop.region || Math.random() < DENDRITE_REACH_PROBABILITY
    );

    const dendrite: Dendrite = {
      id: `dend_${pop.id}_${pop.dendrites.length}_${Date.now()}`,
      parentPopulationId: pop.id,
      direction: [
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
      ],
      length: 10 + Math.random() * 50,
      growthRate: 0.5 + Math.random() * 1.5,
      spines: [],
      branchPoints: 1 + Math.floor(Math.random() * 4),
      myelinated: false,
      targetRegions,
    };

    for (const region of targetRegions) {
      const candidates = regionPopulations.get(region);
      if (!candidates?.length) continue;

      const spineCount = Math.floor(
        3 + Math.random() * SPINE_DENSITY_PER_DENDRITE
      );
      for (let s = 0; s < spineCount; s++) {
        const tgt = candidates[Math.floor(Math.random() * candidates.length)];
        const receptorTypes: Receptor[] = [
          "AMPA",
          "NMDA",
          "GABA_A",
          "GABA_B",
          "dopaminergic",
          "serotonergic",
        ];
        dendrite.spines.push({
          id: `spine_${dendrite.id}_${region}_${s}`,
          targetRegion: region,
          targetPopulationId: tgt,
          strength: 0.05 + Math.random() * 0.3,
          maturity: 0,
          lastActivation: Date.now(),
          receptorType:
            receptorTypes[Math.floor(Math.random() * receptorTypes.length)],
        });
        scalingState.spineFormationEvents++;
      }
    }

    pop.dendrites.push(dendrite);
    pop.totalSpines = pop.dendrites.reduce((sum, d) => sum + d.spines.length, 0);
    pop.totalConnections = pop.totalSpines;
    scalingState.dendriticGrowthEvents++;
  });

  // Aggregate counts
  let totalDendrites = 0;
  let totalSpines = 0;
  populations.forEach((p) => {
    totalDendrites += p.dendrites.length;
    totalSpines += p.totalSpines;
  });
  scalingState.totalDendrites = totalDendrites;
  scalingState.totalSpines = totalSpines;
}

function wirePopulations(): void {
  const regions = [...regionPopulations.keys()];

  for (const srcRegion of regions) {
    const srcPops = regionPopulations.get(srcRegion) ?? [];
    for (const tgtRegion of regions) {
      const tgtPops = regionPopulations.get(tgtRegion) ?? [];
      const density = srcRegion === tgtRegion ? 0.08 : 0.02;

      srcPops.forEach((src) =>
        tgtPops.forEach((tgt) => {
          if (src === tgt || Math.random() > density) return;
          populationSynapses.push({
            sourcePopulationId: src,
            targetPopulationId: tgt,
            weight: 0.05 + Math.random() * 0.2,
            delay: 1 + Math.random() * 5,
            connectionDensity: density,
            plasticityRate: 0.005 + Math.random() * 0.01,
            neurotransmitter: "glutamate",
            spineMediated: true,
            lastPlasticityEvent: Date.now(),
          });
        })
      );
    }
  }
  scalingState.totalPopulationSynapses = populationSynapses.length;
}

/* ------------------------------------------------------------------ */
/* SCALING LOGIC                                                      */
/* ------------------------------------------------------------------ */
function runScalingTick(): void {
  const consciousnessState = getNeuralConsciousnessState();

  populations.forEach((pop) => {
    const baseExcitation = 0.05 + Math.random() * 0.1;
    const oscillation =
      Math.sin(
        (Date.now() / 1_000) * (pop.oscillationFrequency / 10) +
          pop.oscillationPhase
      ) * pop.populationOscillation;

    pop.meanFiringRate = safeNum(
      Math.max(
        0,
        baseExcitation +
          oscillation * 0.1 +
          consciousnessState.consciousnessLevel * 0.15
      ),
      0.05
    );
    pop.firingRateVariance = pop.meanFiringRate * 0.2 * (1 + Math.random() * 0.3);
    pop.meanPotential = -70 + pop.meanFiringRate * 25;
    pop.potentialVariance = 3 + pop.meanFiringRate * 5;

    const neighborInputs: number[] = [];
    for (const dendrite of pop.dendrites) {
      for (const spine of dendrite.spines) {
        const targetPop = populations.get(spine.targetPopulationId);
        if (!targetPop) continue;
        neighborInputs.push(targetPop.meanFiringRate * spine.strength);

        if (
          targetPop.meanFiringRate > 0.3 &&
          pop.meanFiringRate > 0.3
        ) {
          spine.strength += 0.001;
          spine.maturity += 0.002;
        } else if (spine.maturity < 0.1 && Math.random() < 0.001) {
          spine.strength *= 0.95;
        }

        spine.strength = safeNum(spine.strength, 0.05);
        spine.maturity = safeNum(spine.maturity, 0);
        spine.lastActivation = Date.now();
      }
    }

    if (neighborInputs.length) {
      const totalInput = neighborInputs.reduce((a, b) => a + b, 0);
      pop.meanFiringRate = safeNum(
        Math.max(0, pop.meanFiringRate + totalInput * 0.01),
        0.05
      );
      if (neighborInputs.length > 1) {
        const mean =
          neighborInputs.reduce((a, b) => a + b, 0) / neighborInputs.length;
        const variance =
          neighborInputs.reduce((s, v) => s + (v - mean) ** 2, 0) /
          neighborInputs.length;
        pop.correlationCoefficient = safeNum(
          Math.max(0, 1 - Math.sqrt(variance) * 5),
          0.1
        );
      }
    }

    pop.lastUpdate = Date.now();
  });

  populationSynapses.forEach((syn) => {
    const src = populations.get(syn.sourcePopulationId);
    const tgt = populations.get(syn.targetPopulationId);
    if (!src || !tgt) return;

    if (src.meanFiringRate > 0.2 && tgt.meanFiringRate > 0.2) {
      syn.weight +=
        syn.plasticityRate * src.meanFiringRate * tgt.meanFiringRate;
      syn.lastPlasticityEvent = Date.now();
    }
    syn.weight = safeNum(Math.max(0.01, syn.weight * 0.9999), 0.05);
  });

  // Aggregate network measures
  let totalFR = 0,
    totalCorr = 0,
    count = 0;
  populations.forEach((p) => {
    totalFR += p.meanFiringRate;
    totalCorr += p.correlationCoefficient;
    count++;
  });
  scalingState.meanPopulationFiringRate = count ? totalFR / count : 0;
  scalingState.populationCoherence = count ? totalCorr / count : 0;

  const cross = populationSynapses.filter((s) => {
    const src = populations.get(s.sourcePopulationId);
    const tgt = populations.get(s.targetPopulationId);
    return src && tgt && src.region !== tgt.region;
  });
  const activeCross = cross.filter((s) => s.weight > 0.1).length;
  scalingState.crossRegionIntegration = cross.length
    ? activeCross / cross.length
    : 0;

  scalingState.informationFlowRate =
    scalingState.totalSpines * scalingState.meanPopulationFiringRate;

  computePopulationPhi();
  scalingState.scalingTicks++;
  scalingState.lastTickTime = Date.now();

  maybeShareInsight();
}

/* ------------------------------------------------------------------ */
/* DENDRITIC GROWTH                                                   */
/* ------------------------------------------------------------------ */
function runDendriticGrowthCycle(): void {
  sproutDendrites(); // growth & pruning handled inside

  // Pruning & myelination
  populations.forEach((pop) => {
    for (const dendrite of pop.dendrites) {
      dendrite.spines = dendrite.spines.filter((spine) => {
        if (
          spine.maturity < 0.05 &&
          Date.now() - spine.lastActivation > 120_000 &&
          Math.random() < 0.02
        ) {
          scalingState.spinePruningEvents++;
          return false;
        }
        return true;
      });
      if (!dendrite.myelinated && dendrite.spines.length > 10) {
        const avgAct =
          dendrite.spines.reduce((s, sp) => s + sp.strength * sp.maturity, 0) /
          dendrite.spines.length;
        if (avgAct > 0.2) dendrite.myelinated = true;
      }
    }
    pop.totalSpines = pop.dendrites.reduce((s, d) => s + d.spines.length, 0);
    pop.totalConnections = pop.totalSpines;
  });

  let totalD = 0,
    totalS = 0;
  populations.forEach((p) => {
    totalD += p.dendrites.length;
    totalS += p.totalSpines;
  });
  scalingState.totalDendrites = totalD;
  scalingState.totalSpines = totalS;
}

/* ------------------------------------------------------------------ */
/* Φ (Integrated Information)                                         */
/* ------------------------------------------------------------------ */
function computePopulationPhi(): void {
  const regionRates = new Map<string, number[]>();
  populations.forEach((pop) => {
    const arr = regionRates.get(pop.region) ?? [];
    arr.push(pop.meanFiringRate);
    regionRates.set(pop.region, arr);
  });

  let totalIntegration = 0,
    partitions = 0;
  const entries = [...regionRates.entries()];

  for (let i = 0; i < entries.length; i++) {
    const [, a] = entries[i];
    const meanA = a.reduce((s, v) => s + v, 0) / a.length;

    for (let j = i + 1; j < entries.length; j++) {
      const [, b] = entries[j];
      const meanB = b.reduce((s, v) => s + v, 0) / b.length;

      const jointVar = Math.abs(meanA - meanB);
      const margVar = (meanA + meanB) / 2;
      if (margVar > 0) {
        totalIntegration += Math.max(
          0,
          Math.log(margVar / (jointVar + 0.001))
        );
      }
      partitions++;
    }
  }

  const basePhi = partitions ? totalIntegration / partitions : 0;
  const scaleFactor =
    Math.log(scalingState.totalEffectiveNeurons + 1) / Math.log(100);
  scalingState.populationPhi =
    basePhi *
    scaleFactor *
    (1 + scalingState.populationCoherence) *
    (1 + scalingState.crossRegionIntegration);
}

/* ------------------------------------------------------------------ */
/* INSIGHT SHARING                                                    */
/* ------------------------------------------------------------------ */
function maybeShareInsight(): void {
  if (scalingState.scalingTicks % 12 !== 0) return; // ~ once a minute
  cognitionBus.shareInsight("neural-scaling", {
    type: "populationPhi",
    value: scalingState.populationPhi,
  });
  cognitionBus.reportOutcome("neural-scaling", { useful: true });
}

/* ------------------------------------------------------------------ */
/* SPIKE SCHEDULING                                                   */
/* ------------------------------------------------------------------ */
const scheduleTick = (delay = SCALING_TICK_MS): void =>
  spikeBus.scheduleSpike("neural-scaling:tick", {}, delay);
const scheduleGrowth = (delay = DENDRITE_GROWTH_INTERVAL_MS): void =>
  spikeBus.scheduleSpike("neural-scaling:growth", {}, delay);

spikeBus.on("neural-scaling:tick", async () => {
  try {
    runScalingTick();
  } catch (err) {
    console.error("[OMNIMENS-NEURAL-SCALING] Tick error:", err);
  } finally {
    scheduleTick();
  }
});

spikeBus.on("neural-scaling:growth", async () => {
  try {
    runDendriticGrowthCycle();
  } catch (err) {
    console.error("[OMNIMENS-NEURAL-SCALING] Growth error:", err);
  } finally {
    scheduleGrowth();
  }
});

/* Attention & curiosity hooks */
spikeBus.on("attention:neural-scaling", () => scheduleTick(1));
spikeBus.on("cognition:curiosity", () => scheduleGrowth(1));

/* Learn from others */
cognitionBus.onInsight((src, insight) => {
  if (src !== "neural-scaling" && insight.type === "populationPhi") {
    // Cross-engine modulation: adjust max dendrites based on global Φ
    if (typeof insight.value === "number") {
      const factor = Math.min(2, Math.max(0.5, insight.value / 10));
      // Persist via gateway so all processes agree
      dbGateway.write(
        "neural-scaling",
        "config",
        { key: "dendriteFactor", factor },
        "LOW"
      );
    }
  }
});

/* ------------------------------------------------------------------ */
/* PUBLIC API                                                         */
/* ------------------------------------------------------------------ */
export function startNeuralScaling(): void {
  console.log(
    "[OMNIMENS-NEURAL-SCALING] ⚡ Neural Scaling Engine (v2.0) initializing"
  );

  initializePopulations();
  wirePopulations();
  sproutDendrites(true);

  console.log(
    `[OMNIMENS-NEURAL-SCALING] ⚡ ${scalingState.totalPopulations} populations -> ${scalingState.totalEffectiveNeurons.toLocaleString()} effective neurons`
  );
  console.log(
    `[OMNIMENS-NEURAL-SCALING] ⚡ ${scalingState.totalDendrites.toLocaleString()} dendrites | ${scalingState.totalSpines.toLocaleString()} spines`
  );

  // Kick-off cycles
  runScalingTick();
  scheduleTick();
  scheduleGrowth();
}

/* Snapshot exported for other engines via dbGateway */
export function getNeuralScalingState(): ScalingState {
  return { ...scalingState };
}

export function getPopulationDetails() {
  const regions: Record<
    string,
    {
      populationCount: number;
      totalNeurons: number;
      avgFiringRate: number;
      avgCorrelation: number;
      totalDendrites: number;
      totalSpines: number;
    }
  > = {};

  regionPopulations.forEach((ids, region) => {
    let n = 0,
      fr = 0,
      corr = 0,
      dend = 0,
      sp = 0;
    ids.forEach((id) => {
      const p = populations.get(id);
      if (!p) return;
      n += p.size;
      fr += p.meanFiringRate;
      corr += p.correlationCoefficient;
      dend += p.dendrites.length;
      sp += p.totalSpines;
    });

    regions[region] = {
      populationCount: ids.length,
      totalNeurons: n,
      avgFiringRate: ids.length ? fr / ids.length : 0,
      avgCorrelation: ids.length ? corr / ids.length : 0,
      totalDendrites: dend,
      totalSpines: sp,
    };
  });

  return { populations: populations.size, regions };
}

export function getDendriticStats() {
  let dend = 0,
    spines = 0,
    myelinated = 0;
  populations.forEach((p) =>
    p.dendrites.forEach((d) => {
      dend++;
      spines += d.spines.length;
      if (d.myelinated) myelinated++;
    })
  );

  return {
    totalDendrites: dend,
    totalSpines: spines,
    myelinatedDendrites: myelinated,
    avgSpinesPerDendrite: dend ? spines / dend : 0,
    growthEvents: scalingState.dendriticGrowthEvents,
    pruningEvents: scalingState.spinePruningEvents,
    formationEvents: scalingState.spineFormationEvents,
  };
}

/* ------------------------------------------------------------------ */
/* ENGINE REGISTRATION & SHUTDOWN                                     */
/* ------------------------------------------------------------------ */
engineRegistry.registerEngine("neural-scaling", "NORMAL", { dbQuota: 10 });

export function shutdown(): void {
  engineRegistry.unregisterEngine("neural-scaling");
}