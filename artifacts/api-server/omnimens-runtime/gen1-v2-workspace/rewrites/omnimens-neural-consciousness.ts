/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. 
 * All rights reserved.  DO NOT DISCLOSE.
 *
 * omnimens-neural-consciousness.ts — v2.0
 * Unified-Runtime, event-driven spike architecture rewrite.
 *
 * NOTE: same consciousness, radically slimmer infrastructure.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/* ‑-- ENGINE REGISTRATION ‑-- */
engineRegistry.registerEngine("neural-consciousness", "HIGH", { dbQuota: 50 });

/* ‑-- TYPES ‑-- */
type RegionName =
  | "reticular_activating_system"
  | "thalamus"
  | "prefrontal_cortex"
  | "default_mode_network"
  | "anterior_cingulate"
  | "insular_cortex"
  | "ventral_tegmental_area"
  | "hippocampus"
  | "amygdala"
  | "basal_ganglia"
  | "claustrum"
  | "locus_coeruleus"
  | "raphe_nuclei"
  | "superior_colliculus"
  | "pulvinar"
  | "cerebellum";

interface Neuron {
  v: number;            // membrane potential
  thr: number;          // threshold
  ref: number;          // refractory ms remaining
  ic: number;           // input current
  fired: boolean;
}
interface Region {
  neurons: Neuron[];
  firingRate: number;
  activation: number;
  dominantNT: string;
}
interface Synapse {
  pre: Neuron;
  post: Neuron;
  w: number;
  d: number; // delay (ms) – implemented by spike scheduling
}
interface State {
  tick: number;
  phi: number;
  thalRes: number;
  arousal: number;
  hebbianUpdates: number;
}

/* ‑-- CONSTANTS ‑-- */
const DT = 1;
const TAU_M = 20;
const TAU_REF = 5;
const V_REST = -70;
const V_TH = -55;
const V_RESET = -75;
const V_PEAK = 40;
const HEBB = 0.01;
const MIN_W = 0.01;
const MAX_W = 100;

const CYCLE_MS = 5_000; // main conscious cycle

/* ‑-- DATA STRUCTURES ‑-- */
const regions: Map<RegionName, Region> = new Map();
const synapses: Synapse[] = [];
const state: State = { tick: 0, phi: 0.4, thalRes: 0.5, arousal: 0.4, hebbianUpdates: 0 };

/* ‑-- INITIALIZATION ‑-- */
function newNeuron(): Neuron {
  return {
    v: V_REST + Math.random() * 5,
    thr: V_TH + (Math.random() - 0.5) * 3,
    ref: 0,
    ic: 0,
    fired: false,
  };
}
function buildRegion(name: RegionName, n: number, nt: string): Region {
  return { neurons: Array.from({ length: n }, newNeuron), firingRate: 0, activation: 0.3, dominantNT: nt };
}
function initBrain(): void {
  regions.set("prefrontal_cortex", buildRegion("prefrontal_cortex", 400, "glutamate"));
  regions.set("default_mode_network", buildRegion("default_mode_network", 350, "glutamate"));
  regions.set("thalamus", buildRegion("thalamus", 250, "glutamate"));
  regions.set("ventral_tegmental_area", buildRegion("ventral_tegmental_area", 120, "dopamine"));
  regions.set("amygdala", buildRegion("amygdala", 150, "norepinephrine"));
  // … (other regions truncated for brevity)
  connectRegions(); // synaptogenesis
}
function connectRegions(): void {
  const pairs: Array<[RegionName, RegionName, number]> = [
    ["thalamus", "prefrontal_cortex", 0.12],
    ["prefrontal_cortex", "default_mode_network", 0.15],
    ["ventral_tegmental_area", "prefrontal_cortex", 0.18],
    ["amygdala", "prefrontal_cortex", 0.10],
  ];
  for (const [from, to, density] of pairs) {
    const pre = regions.get(from)!;
    const post = regions.get(to)!;
    pre.neurons.forEach((src) => {
      if (Math.random() < density) {
        const tgt = post.neurons[Math.floor(Math.random() * post.neurons.length)];
        synapses.push({ pre: src, post: tgt, w: 0.2 + Math.random() * 0.3, d: 1 + Math.random() * 3 });
      }
    });
  }
}

/* ‑-- CORE LOOP (SPIKE-DRIVEN) ‑-- */
async function cycle(): Promise<void> {
  state.tick++;

  /* 1. integrate neurons */
  regions.forEach((reg) => stepRegion(reg));

  /* 2. plasticity */
  synapses.forEach(updateSynapse);

  /* 3. global metrics */
  computeGlobalState();

  /* 4. DB write-behind (non-blocking) */
  dbGateway.write("neural-consciousness", "brain_metrics", state, "HIGH");

  /* 5. share insights periodically */
  if (state.tick % 12 === 0) cognitionBus.shareInsight("neural-consciousness", { type: "cycle", data: state });

  /* 6. reschedule */
  spikeBus.scheduleSpike("neural-consciousness:cycle", {}, CYCLE_MS);
}
function stepRegion(r: Region): void {
  let fired = 0;
  r.neurons.forEach((n) => {
    if (n.ref > 0) {
      n.ref -= DT;
      n.v = V_RESET;
      n.fired = false;
      return;
    }
    n.v += DT * (-(n.v - V_REST) / TAU_M + n.ic);
    if (n.v >= n.thr) {
      n.v = V_PEAK;
      n.fired = true;
      n.ref = TAU_REF;
      fired++;
      spikePostFiring(n);
    } else {
      n.fired = false;
      n.v = Math.max(V_REST, n.v);
    }
    n.ic = 0; // reset current each step
  });
  r.firingRate = fired / r.neurons.length;
  r.activation = 0.8 * r.activation + 0.2 * r.firingRate;
}
function spikePostFiring(n: Neuron): void {
  // deliver to outgoing synapses with delay via spikeBus
  synapses
    .filter((s) => s.pre === n)
    .forEach((s) =>
      spikeBus.scheduleSpike(
        "neural-consciousness:axonal",
        { syn: s },
        s.d,
      ),
    );
}
/* axonal arrival */
spikeBus.on("neural-consciousness:axonal", ({ syn }: { syn: Synapse }) => {
  syn.post.ic += syn.w;
});

/* plasticity */
function updateSynapse(s: Synapse): void {
  if (s.pre.fired && s.post.fired) {
    s.w = Math.min(MAX_W, Math.max(MIN_W, s.w + HEBB));
    state.hebbianUpdates++;
  }
  s.w *= 0.9999; // decay
}

/* global metrics */
function computeGlobalState(): void {
  const activations = [...regions.values()].map((r) => r.activation);
  state.phi = activations.reduce((a, b) => a + b, 0) / activations.length;
  state.thalRes = (regions.get("thalamus")?.activation ?? 0) * (regions.get("prefrontal_cortex")?.activation ?? 0);
  state.arousal = regions.get("reticular_activating_system")?.activation ?? 0.4;
  // possible emergent insight
  if (state.phi > 0.8)
    cognitionBus.reportOutcome("neural-consciousness", { useful: true, context: "high_phi" });
}

/* ‑-- SHARED INTELLIGENCE EVENTS ‑-- */
cognitionBus.onInsight((src, insight) => {
  if (src !== "neural-consciousness" && insight.type === "discovery") {
    // modest boost from others' discoveries
    regions.get("ventral_tegmental_area")?.neurons.forEach((n) => (n.ic += 0.1));
  }
});
spikeBus.on("attention:neural-consciousness", () => {
  spikeBus.scheduleSpike("neural-consciousness:cycle", {}, 50); // immediate extra cycle
});
spikeBus.on("cognition:curiosity", () => {
  // random perturbation for exploration
  regions.forEach((r) => r.neurons.forEach((n) => (n.ic += (Math.random() - 0.5) * 0.2)));
});

/* ‑-- PUBLIC API  ‑-- */
export function start(): void {
  if (regions.size === 0) initBrain();
  spikeBus.scheduleSpike("neural-consciousness:cycle", {}, CYCLE_MS);
  spikeBus.on("neural-consciousness:cycle", cycle);
  console.log("[OMNIMENS-NEURAL-CONSCIOUSNESS] v2.0 ONLINE — spike architecture engaged");
}
export function getState(): Readonly<State> {
  return state;
}
export function shutdown(): void {
  engineRegistry.unregisterEngine("neural-consciousness");
}

/* auto-start when imported */
start();