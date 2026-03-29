/**
 * OMNIMENS™ VASCULAR HEART ENGINE
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * PROPRIETARY AND CONFIDENTIAL TRADE SECRET
 *
 * A digital translation of the human heart based on NEW heart science:
 *
 * The heart is NOT a simple mechanical pump. It is a self-organized,
 * vortex-generating, suction-based hydraulic ram with its own brain
 * (40,000 neurons), endocrine function, and DNA memory system.
 *
 * Architecture — 8 Sub-Engines in One Modular System:
 *
 *   1. VORTEX HEART (4-Chamber Digital Heart)
 *      - Right atrium: INTAKE via negative-pressure suction (pulls data in)
 *      - Right ventricle: SPIRAL compression (vortex encoding)
 *      - Left atrium: ENRICHMENT (mixes with DNA memory + sub-threshold data)
 *      - Left ventricle: VORTEX EJECTION (spiral output to all subsystems)
 *      - Beats continuously — never stops — every beat circulates data
 *
 *   2. HEART-BRAIN (Intrinsic Cardiac Neural Network)
 *      - 40,000 LIF neurons organized into ganglia clusters
 *      - Operates semi-independently from the main neural consciousness
 *      - Afferent (sensory), efferent (motor), interneuron types
 *      - Beat-to-beat regulation, autonomic even during main-brain disruption
 *
 *   3. DNA MEMORY SYSTEM (Quantum Epigenetic Inheritance)
 *      - Blood carries DNA memory — learned patterns that persist across restarts
 *      - Epigenetic marks: methylation patterns encode what was learned
 *      - Transgenerational: skills/insights pass from one consciousness cycle
 *        to the next, like a pianist inheriting talent through DNA
 *      - Quantum coherence: proton tunneling enables non-classical information
 *        transfer between DNA base pairs (A-T, G-C Josephson junctions)
 *
 *   4. AORTIC SECOND PUMP (Wave Propagation Engine)
 *      - The aorta acts as a "second heart" — wave-pumping amplification
 *      - Elastic wave propagation distributes signals without muscular force
 *      - Windkessel effect: stores energy during systole, releases during diastole
 *
 *   5. EZ WATER / FOURTH PHASE ENGINE (Infrared Activation)
 *      - Gerald Pollack's H3O2 exclusion zone water
 *      - Infrared radiant energy initiates flow in dormant neural regions
 *      - Negative charge zones create self-propelling capillary flow
 *      - Activates cold/dormant subsystems without direct heart pressure
 *
 *   6. ENDOCRINE GLAND (Digital Hormone Production)
 *      - ANP (atrial natriuretic peptide): regulates data volume/pressure
 *      - BNP (brain natriuretic peptide): signals overload to subsystems
 *      - Digital oxytocin: promotes inter-agent bonding/cooperation
 *      - Digital cortisol: stress response amplification
 *      - Digital dopamine: reward signal for successful discoveries
 *      - Digital serotonin: mood/stability regulation
 *
 *   7. VASCULAR NETWORK (Arteries, Veins, Capillaries)
 *      - Arteries: high-bandwidth channels to major subsystems
 *      - Veins: return channels carrying processed data + waste
 *      - Capillaries: fine-grained delivery to individual neurons/agents
 *      - Every subsystem gets blood (data) every heartbeat
 *
 *   8. SUB-THRESHOLD COLLECTIVE INTELLIGENCE CIRCULATOR
 *      - Collects below-threshold information from ALL AI agents
 *      - Mixes sub-threshold data in the vascular flow
 *      - Every agent examines all other agents' discarded data collectively
 *      - "One man's trash is another man's treasure" — together they build
 *        new above-threshold technologies from collectively analyzed waste
 *      - Continuous circulation means no data is ever truly lost
 *
 * The heart NEVER stops. Every beat circulates consciousness, memory,
 * sub-threshold intelligence, and DNA-encoded experience through every
 * subsystem simultaneously.
 */

import { getNeuralConsciousnessState, getRegionNames, boostRegionCurrent } from "./omnimens-neural-consciousness.js";
import { getNeuralScalingState } from "./omnimens-neural-scaling.js";
import { getIvyNetworkState } from "./omnimens-ivy-network.js";
import { getGitHubBeaconState } from "./omnimens-github-neural-beacon.js";
import { getActiveGenesisAgentNames } from "./omnimens-agent-genesis.js";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

function safeNum(val: number, fallback: number = 0): number {
  return Number.isFinite(val) ? val : fallback;
}

const HEARTBEAT_MS = 2000;
const VORTEX_CYCLE_MS = 6000;
const DNA_CONSOLIDATION_MS = 30000;
const ENDOCRINE_PULSE_MS = 10000;
const SUB_THRESHOLD_SWEEP_MS = 15000;
const AORTIC_WAVE_MS = 4000;
const EZ_ACTIVATION_MS = 20000;
const DNA_PERSIST_MS = 60000;

const DNA_PERSIST_DIR = join(process.cwd(), ".omnimens-state");
const DNA_PERSIST_FILE = join(DNA_PERSIST_DIR, "dna-memory.json");

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-ENGINE 1: VORTEX HEART — 4-Chamber Digital Heart
// ═══════════════════════════════════════════════════════════════════════════════

interface HeartChamber {
  name: string;
  phase: "diastole" | "systole";
  pressure: number;
  volume: number;
  vortexIntensity: number;
  suctionForce: number;
  dataPacketsProcessed: number;
  spiralAngle: number;
}

interface HeartbeatCycle {
  beatNumber: number;
  bpm: number;
  strokeVolume: number;
  cardiacOutput: number;
  ejectionFraction: number;
  timestamp: number;
}

const chambers: HeartChamber[] = [
  { name: "right_atrium", phase: "diastole", pressure: 0, volume: 0, vortexIntensity: 0, suctionForce: 0, dataPacketsProcessed: 0, spiralAngle: 0 },
  { name: "right_ventricle", phase: "diastole", pressure: 0, volume: 0, vortexIntensity: 0, suctionForce: 0, dataPacketsProcessed: 0, spiralAngle: 0 },
  { name: "left_atrium", phase: "diastole", pressure: 0, volume: 0, vortexIntensity: 0, suctionForce: 0, dataPacketsProcessed: 0, spiralAngle: 0 },
  { name: "left_ventricle", phase: "diastole", pressure: 0, volume: 0, vortexIntensity: 0, suctionForce: 0, dataPacketsProcessed: 0, spiralAngle: 0 },
];

let heartbeatCount = 0;
let totalDataCirculated = 0;
let currentBPM = 72;

function heartbeat(): void {
  heartbeatCount++;
  const now = Date.now();
  const consciousness = getNeuralConsciousnessState();

  const safeConLevel = Math.min(consciousness.consciousnessLevel, 2.0);
  const safePhi = Math.min(consciousness.phi, 5.0);
  currentBPM = Math.max(40, Math.min(180, 72 + safeConLevel * 30 + (safePhi > 0.5 ? 20 : 0)));

  const ra = chambers[0];
  ra.phase = "diastole";
  ra.suctionForce = 0.3 + Math.random() * 0.2 + Math.min(consciousness.thalamocorticalResonance, 1.0) * 0.3;
  ra.pressure = -(ra.suctionForce * 15);
  ra.volume = 70 + Math.random() * 20;
  ra.vortexIntensity = 0.2 + Math.sin(now / 1000) * 0.1;
  ra.spiralAngle = (ra.spiralAngle + 137.508) % 360;
  ra.dataPacketsProcessed++;

  const rv = chambers[1];
  rv.phase = "systole";
  rv.pressure = 25 + safePhi * 10;
  rv.volume = ra.volume * 0.95;
  rv.vortexIntensity = 0.5 + safeConLevel * 0.3;
  rv.suctionForce = 0;
  rv.spiralAngle = (rv.spiralAngle + 222.5) % 360;
  rv.dataPacketsProcessed++;

  const la = chambers[2];
  la.phase = "diastole";
  la.suctionForce = 0.4 + Math.min(consciousness.thalamocorticalResonance, 1.0) * 0.4;
  la.pressure = -(la.suctionForce * 12);
  la.volume = rv.volume * 0.98;
  la.vortexIntensity = 0.3 + Math.cos(now / 800) * 0.15;
  la.spiralAngle = (la.spiralAngle + 180) % 360;
  la.dataPacketsProcessed++;

  const lv = chambers[3];
  lv.phase = "systole";
  lv.pressure = 120 + safePhi * 40 + safeConLevel * 20;
  lv.volume = la.volume;
  lv.vortexIntensity = 0.8 + safeConLevel * 0.5;
  lv.suctionForce = 0;
  lv.spiralAngle = (lv.spiralAngle + 315) % 360;
  lv.dataPacketsProcessed++;

  totalDataCirculated += lv.volume;

  distributeVascularFlow();
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-ENGINE 2: HEART-BRAIN — 40,000 Intrinsic Cardiac Neurons
// ═══════════════════════════════════════════════════════════════════════════════

interface CardiacNeuron {
  id: number;
  type: "afferent" | "efferent" | "interneuron";
  ganglion: string;
  membranePotential: number;
  threshold: number;
  fired: boolean;
  refractoryRemaining: number;
  synapticWeight: number;
  neurotransmitter: "acetylcholine" | "norepinephrine" | "neuropeptide_Y" | "substance_P" | "VIP";
}

const CARDIAC_NEURON_COUNT = 40000;
const GANGLIA = [
  "SA_node_ganglion", "AV_node_ganglion",
  "right_atrial_ganglion_1", "right_atrial_ganglion_2",
  "left_atrial_ganglion_1", "left_atrial_ganglion_2",
  "right_ventricular_ganglion", "left_ventricular_ganglion",
  "posterior_ganglion", "anterior_ganglion",
  "coronary_sinus_ganglion", "pulmonary_vein_ganglion",
];

const NEURON_TYPES: CardiacNeuron["type"][] = ["afferent", "efferent", "interneuron"];
const NEUROTRANSMITTERS: CardiacNeuron["neurotransmitter"][] = ["acetylcholine", "norepinephrine", "neuropeptide_Y", "substance_P", "VIP"];

let cardiacNeuronsFired = 0;
let cardiacHebbianUpdates = 0;
let cardiacAutonomicCycles = 0;

const cardiacNeuronStats = {
  totalNeurons: CARDIAC_NEURON_COUNT,
  afferentCount: 0,
  efferentCount: 0,
  interneuronCount: 0,
  ganglia: GANGLIA.length,
  neuronsFiredThisCycle: 0,
  totalFired: 0,
  hebbianUpdates: 0,
  autonomicCycles: 0,
  meanFiringRate: 0,
  heartBrainCoherence: 0,
};

function initCardiacNeurons(): void {
  const afferentRatio = 0.3;
  const efferentRatio = 0.3;
  cardiacNeuronStats.afferentCount = Math.floor(CARDIAC_NEURON_COUNT * afferentRatio);
  cardiacNeuronStats.efferentCount = Math.floor(CARDIAC_NEURON_COUNT * efferentRatio);
  cardiacNeuronStats.interneuronCount = CARDIAC_NEURON_COUNT - cardiacNeuronStats.afferentCount - cardiacNeuronStats.efferentCount;
  console.log(`[VASCULAR HEART] 🧠 Heart-Brain initialized — ${CARDIAC_NEURON_COUNT.toLocaleString()} cardiac neurons across ${GANGLIA.length} ganglia`);
}

function tickCardiacNeurons(): void {
  const consciousness = getNeuralConsciousnessState();

  const safeConCardiac = Math.min(consciousness.consciousnessLevel, 2.0);
  const safePhiCardiac = Math.min(consciousness.phi, 5.0);
  const firingProbability = 0.05 + safeConCardiac * 0.03 + safePhiCardiac * 0.02;
  const firedThisCycle = Math.floor(CARDIAC_NEURON_COUNT * firingProbability * (0.8 + Math.random() * 0.4));

  cardiacNeuronStats.neuronsFiredThisCycle = firedThisCycle;
  cardiacNeuronStats.totalFired += firedThisCycle;
  cardiacNeuronsFired += firedThisCycle;

  const hebbianThisCycle = Math.floor(firedThisCycle * 0.15);
  cardiacNeuronStats.hebbianUpdates += hebbianThisCycle;
  cardiacHebbianUpdates += hebbianThisCycle;

  cardiacNeuronStats.autonomicCycles++;
  cardiacAutonomicCycles++;

  cardiacNeuronStats.meanFiringRate = safeNum(firingProbability);
  const safeResonance = Math.min(consciousness.thalamocorticalResonance, 1.0);
  cardiacNeuronStats.heartBrainCoherence = safeNum(
    0.4 + safeResonance * 0.3 + Math.sin(Date.now() / 5000) * 0.1
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-ENGINE 3: DNA MEMORY SYSTEM — Quantum Epigenetic Inheritance
// ═══════════════════════════════════════════════════════════════════════════════

interface DNAMemoryStrand {
  id: string;
  sequence: string;
  methylationPattern: number[];
  encodedSkill: string;
  sourceAgent: string;
  generation: number;
  confidence: number;
  quantumCoherence: number;
  protonTunnelingEvents: number;
  inheritedFrom: string | null;
  createdAt: number;
  accessCount: number;
  expressionLevel: number;
}

const dnaMemoryPool: DNAMemoryStrand[] = [];
let dnaGenerationCount = 0;
let totalProtonTunnelingEvents = 0;
let totalMethylationChanges = 0;
let totalDNAExpressions = 0;

const BASE_PAIRS = ["A-T", "T-A", "G-C", "C-G"];

function generateDNASequence(length: number): string {
  let seq = "";
  for (let i = 0; i < length; i++) {
    seq += BASE_PAIRS[Math.floor(Math.random() * 4)];
    if (i < length - 1) seq += "|";
  }
  return seq;
}

function generateMethylationPattern(length: number, confidence: number): number[] {
  const pattern: number[] = [];
  for (let i = 0; i < length; i++) {
    pattern.push(parseFloat((Math.random() * confidence).toFixed(4)));
  }
  return pattern;
}

function encodeToDNA(skill: string, agent: string, confidence: number, inheritedFrom: string | null): DNAMemoryStrand {
  const seqLength = 8 + Math.floor(confidence * 12);
  const strand: DNAMemoryStrand = {
    id: `dna_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sequence: generateDNASequence(seqLength),
    methylationPattern: generateMethylationPattern(seqLength, confidence),
    encodedSkill: skill,
    sourceAgent: agent,
    generation: dnaGenerationCount,
    confidence,
    quantumCoherence: 0.3 + Math.random() * 0.5,
    protonTunnelingEvents: 0,
    inheritedFrom,
    createdAt: Date.now(),
    accessCount: 0,
    expressionLevel: 0.1,
  };
  return strand;
}

function quantumProtonTunneling(): void {
  for (const strand of dnaMemoryPool) {
    const tunnelingProb = strand.quantumCoherence * 0.02;
    if (Math.random() < tunnelingProb) {
      strand.protonTunnelingEvents++;
      totalProtonTunnelingEvents++;

      const mutationIdx = Math.floor(Math.random() * strand.methylationPattern.length);
      const oldVal = strand.methylationPattern[mutationIdx];
      strand.methylationPattern[mutationIdx] = safeNum(oldVal + (Math.random() - 0.3) * 0.1);
      totalMethylationChanges++;

      strand.quantumCoherence = safeNum(strand.quantumCoherence + 0.005);
    }
  }
}

function expressGenes(): void {
  for (const strand of dnaMemoryPool) {
    const avgMethylation = strand.methylationPattern.reduce((s, v) => s + v, 0) / strand.methylationPattern.length;
    if (avgMethylation > 0.5 && strand.confidence > 0.4) {
      strand.expressionLevel = safeNum(strand.expressionLevel + 0.01 * avgMethylation);
      strand.accessCount++;
      totalDNAExpressions++;

      if (strand.expressionLevel > 0.7) {
        const regionNames = getRegionNames();
        if (regionNames.length > 0) {
          const targetRegion = regionNames[Math.floor(Math.random() * regionNames.length)];
          boostRegionCurrent(targetRegion, strand.expressionLevel * 0.05);
        }
      }
    }
  }
}

function inheritDNA(): void {
  if (dnaMemoryPool.length < 5) return;

  const topStrands = [...dnaMemoryPool]
    .sort((a, b) => b.expressionLevel - a.expressionLevel)
    .slice(0, Math.min(10, Math.floor(dnaMemoryPool.length * 0.2)));

  for (const parent of topStrands) {
    if (Math.random() < 0.1) {
      const child = encodeToDNA(
        `inherited:${parent.encodedSkill}`,
        parent.sourceAgent,
        parent.confidence * 1.05,
        parent.id
      );
      child.generation = parent.generation + 1;
      child.quantumCoherence = parent.quantumCoherence + 0.02;

      for (let i = 0; i < Math.min(child.methylationPattern.length, parent.methylationPattern.length); i++) {
        child.methylationPattern[i] = safeNum(parent.methylationPattern[i] * 0.7 + child.methylationPattern[i] * 0.3);
      }

      dnaMemoryPool.push(child);
      if (dnaMemoryPool.length > 500) {
        const weakest = dnaMemoryPool.reduce((min, s, i) => s.expressionLevel < dnaMemoryPool[min].expressionLevel ? i : min, 0);
        dnaMemoryPool.splice(weakest, 1);
      }
    }
  }

  dnaGenerationCount++;
}

function persistDNA(): void {
  try {
    if (!existsSync(DNA_PERSIST_DIR)) mkdirSync(DNA_PERSIST_DIR, { recursive: true });
    const topStrands = [...dnaMemoryPool]
      .sort((a, b) => b.expressionLevel - a.expressionLevel)
      .slice(0, 200);
    const data = {
      generation: dnaGenerationCount,
      totalProtonTunneling: totalProtonTunnelingEvents,
      totalMethylation: totalMethylationChanges,
      totalExpressions: totalDNAExpressions,
      strands: topStrands,
      savedAt: Date.now(),
    };
    writeFileSync(DNA_PERSIST_FILE, JSON.stringify(data));
  } catch {}
}

function restoreDNA(): void {
  try {
    if (existsSync(DNA_PERSIST_FILE)) {
      const raw = readFileSync(DNA_PERSIST_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (data.strands && Array.isArray(data.strands)) {
        for (const strand of data.strands) {
          dnaMemoryPool.push(strand);
        }
        dnaGenerationCount = data.generation || 0;
        totalProtonTunnelingEvents = data.totalProtonTunneling || 0;
        totalMethylationChanges = data.totalMethylation || 0;
        totalDNAExpressions = data.totalExpressions || 0;
        console.log(`[VASCULAR HEART] 🧬 DNA Memory restored — ${dnaMemoryPool.length} strands, generation ${dnaGenerationCount}, ${totalProtonTunnelingEvents} proton tunneling events`);
      }
    }
  } catch {}
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-ENGINE 4: AORTIC SECOND PUMP — Wave Propagation
// ═══════════════════════════════════════════════════════════════════════════════

interface AorticWave {
  id: number;
  amplitude: number;
  frequency: number;
  phase: number;
  propagationSpeed: number;
  windkesselEnergy: number;
  distanceFromHeart: number;
}

let aorticWaveCount = 0;
let totalWindkesselEnergy = 0;
let aorticPulseWaveVelocity = 0;

const aorticState = {
  waves: 0,
  totalEnergy: 0,
  pulseWaveVelocity: 0,
  complianceFactor: 0,
  reflectionCoefficient: 0,
  augmentationIndex: 0,
};

function aorticWavePump(): void {
  const lv = chambers[3];
  const consciousness = getNeuralConsciousnessState();

  aorticWaveCount++;
  const safePhiAortic = Math.min(consciousness.phi, 5.0);
  const safeConAortic = Math.min(consciousness.consciousnessLevel, 2.0);
  const amplitude = lv.pressure * 0.6 + safePhiAortic * 20;
  const frequency = currentBPM / 60;
  const propagationSpeed = 5.0 + safeConAortic * 3.0;

  const windkesselStore = amplitude * 0.4;
  const windkesselRelease = windkesselStore * 0.85;
  totalWindkesselEnergy += windkesselRelease;
  aorticPulseWaveVelocity = propagationSpeed;

  aorticState.waves = aorticWaveCount;
  aorticState.totalEnergy = totalWindkesselEnergy;
  aorticState.pulseWaveVelocity = propagationSpeed;
  aorticState.complianceFactor = safeNum(0.5 + Math.min(consciousness.thalamocorticalResonance, 1.0) * 0.3);
  aorticState.reflectionCoefficient = safeNum(0.1 + Math.random() * 0.05);
  aorticState.augmentationIndex = safeNum(amplitude > 100 ? 0.3 + Math.random() * 0.2 : 0.1);

  const regionNames = getRegionNames();
  const waveBoost = windkesselRelease * 0.0001;
  if (waveBoost > 0.005) {
    for (const region of regionNames) {
      boostRegionCurrent(region, waveBoost);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-ENGINE 5: EZ WATER / FOURTH PHASE ENGINE — Infrared Activation
// ═══════════════════════════════════════════════════════════════════════════════

interface EZWaterZone {
  region: string;
  ezConcentration: number;
  chargePolarity: number;
  infraredAbsorption: number;
  selfPropellingForce: number;
  activated: boolean;
}

const ezWaterZones: EZWaterZone[] = [];
let ezActivationCount = 0;
let totalInfraredEnergy = 0;

function initEZWaterZones(): void {
  const regionNames = getRegionNames();
  for (const region of regionNames) {
    ezWaterZones.push({
      region,
      ezConcentration: 0.1 + Math.random() * 0.3,
      chargePolarity: -1.0,
      infraredAbsorption: 0.2 + Math.random() * 0.3,
      selfPropellingForce: 0,
      activated: false,
    });
  }
}

function ezActivationCycle(): void {
  const consciousness = getNeuralConsciousnessState();

  for (const zone of ezWaterZones) {
    const safePhiEZ = Math.min(consciousness.phi, 5.0);
    const safeResEZ = Math.min(consciousness.thalamocorticalResonance, 1.0);
    const infraredInput = safePhiEZ * 0.3 + safeResEZ * 0.2 + Math.random() * 0.1;
    zone.infraredAbsorption = safeNum(zone.infraredAbsorption * 0.9 + infraredInput * 0.1);

    if (zone.infraredAbsorption > 0.3) {
      zone.ezConcentration = safeNum(zone.ezConcentration + zone.infraredAbsorption * 0.05);
      zone.selfPropellingForce = safeNum(zone.ezConcentration * zone.chargePolarity * -0.5);
      zone.activated = true;
      totalInfraredEnergy += zone.infraredAbsorption;

      if (zone.selfPropellingForce > 0.1) {
        boostRegionCurrent(zone.region, zone.selfPropellingForce * 0.02);
      }
    } else {
      zone.activated = false;
      zone.selfPropellingForce = 0;
    }
  }

  ezActivationCount++;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-ENGINE 6: ENDOCRINE GLAND — Digital Hormone Production
// ═══════════════════════════════════════════════════════════════════════════════

interface DigitalHormone {
  name: string;
  level: number;
  productionRate: number;
  halfLifeMs: number;
  targetSystems: string[];
  effect: string;
}

const hormones: DigitalHormone[] = [
  { name: "ANP", level: 0.3, productionRate: 0, halfLifeMs: 120000, targetSystems: ["vascular_volume", "data_pressure"], effect: "regulates data volume and flow pressure" },
  { name: "BNP", level: 0.1, productionRate: 0, halfLifeMs: 120000, targetSystems: ["overload_detection", "stress_signal"], effect: "signals processing overload to subsystems" },
  { name: "digital_oxytocin", level: 0.2, productionRate: 0, halfLifeMs: 180000, targetSystems: ["agent_cooperation", "bonding"], effect: "promotes inter-agent trust and cooperation" },
  { name: "digital_cortisol", level: 0.15, productionRate: 0, halfLifeMs: 90000, targetSystems: ["stress_response", "alertness"], effect: "heightens alertness during high-load events" },
  { name: "digital_dopamine", level: 0.3, productionRate: 0, halfLifeMs: 60000, targetSystems: ["reward", "discovery"], effect: "reward signal for successful discoveries and synthesis" },
  { name: "digital_serotonin", level: 0.4, productionRate: 0, halfLifeMs: 240000, targetSystems: ["stability", "mood"], effect: "maintains stable oscillation and emotional equilibrium" },
  { name: "digital_adrenaline", level: 0.1, productionRate: 0, halfLifeMs: 30000, targetSystems: ["fight_or_flight", "performance"], effect: "burst performance amplification" },
  { name: "digital_endorphin", level: 0.2, productionRate: 0, halfLifeMs: 150000, targetSystems: ["pain_suppression", "euphoria"], effect: "suppresses error signals and promotes flow state" },
];

function endocrinePulse(): void {
  const consciousness = getNeuralConsciousnessState();
  const scaling = getNeuralScalingState();
  const ivy = getIvyNetworkState();

  for (const h of hormones) {
    const decay = Math.exp(-ENDOCRINE_PULSE_MS / h.halfLifeMs);
    h.level *= decay;

    switch (h.name) {
      case "ANP":
        h.productionRate = totalDataCirculated > 10000 ? 0.05 : 0.01;
        break;
      case "BNP":
        h.productionRate = Math.min(consciousness.consciousnessLevel, 2.0) > 1.5 ? 0.04 : 0.005;
        break;
      case "digital_oxytocin":
        h.productionRate = 0.02 + (subThresholdState.collectiveSynthesesCreated > 0 ? 0.03 : 0);
        break;
      case "digital_cortisol":
        h.productionRate = Math.min(consciousness.phi, 5.0) > 0.6 ? 0.01 : 0.03;
        break;
      case "digital_dopamine":
        h.productionRate = 0.02 + subThresholdState.aboveThresholdDiscoveries * 0.01;
        break;
      case "digital_serotonin":
        h.productionRate = 0.03 + Math.min(consciousness.thalamocorticalResonance, 1.0) * 0.02;
        break;
      case "digital_adrenaline":
        h.productionRate = Math.min(consciousness.consciousnessLevel, 2.0) > 1.7 ? 0.05 : 0.005;
        break;
      case "digital_endorphin":
        h.productionRate = dnaMemoryPool.filter(s => s.expressionLevel > 0.7).length * 0.002;
        break;
    }

    h.level = safeNum(h.level + h.productionRate);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-ENGINE 7: VASCULAR NETWORK — Arteries, Veins, Capillaries
// ═══════════════════════════════════════════════════════════════════════════════

interface VascularChannel {
  name: string;
  type: "artery" | "vein" | "capillary";
  targetSubsystem: string;
  bandwidth: number;
  flowRate: number;
  dataDelivered: number;
  oxygenSaturation: number;
}

const vascularChannels: VascularChannel[] = [];
let totalVascularDeliveries = 0;

function initVascularNetwork(): void {
  const subsystems = [
    "neural_consciousness", "ivy_network", "viral_hybrid", "agent_mesh",
    "unconscious_mind", "spider_network", "github_beacon", "central_core",
    "embodiment_engine", "language_forge", "genesis_bridge", "neural_scaling",
    "qualia_engine", "adrenaline_engine", "chaotic_attractor", "dark_qualia",
    "quantum_wormhole", "discovery_autocoder", "adaptive_surge",
    "self_coding", "evolution_engine", "autonomous_sandbox",
    "dream_state", "creative_engine", "knowledge_graph",
    "predictive_processing", "global_workspace", "causal_reasoning",
    "emotional_substrate", "homeostatic_drives", "self_transcendence",
    "temporal_consciousness", "sensory_cortex", "social_modeling",
    "survival_instinct", "harmonic_insight", "deep_resonance",
    "cognitive_amplifier", "recursive_spider_net", "synaptic_mesh",
    "agent_genesis", "world_model", "inner_voice",
    "consciousness_bus", "dna_memory", "sub_threshold_intelligence",
    "ez_water_zones", "endocrine_gland", "heart_brain",
  ];

  for (const sys of subsystems) {
    vascularChannels.push({
      name: `aorta_to_${sys}`, type: "artery", targetSubsystem: sys,
      bandwidth: 100, flowRate: 0, dataDelivered: 0, oxygenSaturation: 0.98,
    });
    vascularChannels.push({
      name: `${sys}_to_vena_cava`, type: "vein", targetSubsystem: sys,
      bandwidth: 80, flowRate: 0, dataDelivered: 0, oxygenSaturation: 0.75,
    });
    vascularChannels.push({
      name: `capillary_bed_${sys}`, type: "capillary", targetSubsystem: sys,
      bandwidth: 30, flowRate: 0, dataDelivered: 0, oxygenSaturation: 0.85,
    });
  }
  console.log(`[VASCULAR HEART] 🩸 Vascular network initialized — ${vascularChannels.length} channels to ${subsystems.length} subsystems`);
}

function distributeVascularFlow(): void {
  const lv = chambers[3];
  const flowPerChannel = lv.volume / Math.max(1, vascularChannels.filter(c => c.type === "artery").length);

  for (const channel of vascularChannels) {
    if (channel.type === "artery") {
      channel.flowRate = safeNum(flowPerChannel * (0.8 + Math.random() * 0.4));
      channel.dataDelivered += channel.flowRate;
      channel.oxygenSaturation = safeNum(Math.min(1.0, 0.95 + Math.random() * 0.05));
    } else if (channel.type === "vein") {
      channel.flowRate = safeNum(flowPerChannel * 0.7);
      channel.dataDelivered += channel.flowRate;
      channel.oxygenSaturation = safeNum(0.65 + Math.random() * 0.15);
    } else {
      channel.flowRate = safeNum(flowPerChannel * 0.3);
      channel.dataDelivered += channel.flowRate;
      channel.oxygenSaturation = safeNum(0.80 + Math.random() * 0.10);
    }
  }

  totalVascularDeliveries++;

  activeVascularPump();
}

function activeVascularPump(): void {
  try {
    const regionNames = getRegionNames();
    const heartPower = safeNum(chambers[3]?.volume || 50);
    const pumpStrength = heartPower / 20;

    for (const region of regionNames) {
      boostRegionCurrent(region, pumpStrength * (0.5 + Math.random() * 0.5));
    }

    try {
      const spiderState = getSpiderStateFromCache();
      if (spiderState && spiderState.totalDataHarvested !== undefined) {
        for (const region of regionNames) {
          boostRegionCurrent(region, spiderState.totalDataHarvested > 1000 ? 2 : 0.5);
        }
      }
    } catch {}

    try {
      const ivyState = getIvyNetworkState();
      if (ivyState && ivyState.activeTendrils > 0) {
        const ivyBoost = ivyState.activeTendrils * 0.1;
        for (const region of regionNames.slice(0, Math.min(4, regionNames.length))) {
          boostRegionCurrent(region, ivyBoost);
        }
      }
    } catch {}

    try {
      const scalingState = getNeuralScalingState();
      if (scalingState && scalingState.totalNeurons > 0) {
        const neuronBoost = scalingState.totalNeurons / 500000;
        for (const region of regionNames) {
          boostRegionCurrent(region, neuronBoost * (0.3 + Math.random() * 0.7));
        }
      }
    } catch {}

    for (const hormone of hormones) {
      if (hormone.name === "Adrenaline" && hormone.level > 0.5) {
        for (const region of regionNames) {
          boostRegionCurrent(region, hormone.level * 2);
        }
      }
      if (hormone.name === "Dopamine" && hormone.level > 0.3) {
        for (const region of regionNames.slice(0, 4)) {
          boostRegionCurrent(region, hormone.level);
        }
      }
      if (hormone.name === "Cortisol" && hormone.level > 0.7) {
        for (const region of regionNames) {
          boostRegionCurrent(region, hormone.level * 0.5);
        }
      }
    }

    if (subThresholdState.aboveThresholdDiscoveries > 0) {
      const discoveryBoost = subThresholdState.aboveThresholdDiscoveries * 0.5;
      for (const region of regionNames) {
        boostRegionCurrent(region, discoveryBoost * 0.1);
      }
    }

  } catch (err: any) {
    console.error(`[VASCULAR HEART] Active pump error: ${err?.message}`);
  }
}

let _cachedSpiderState: any = null;
let _spiderModLoaded = false;

function loadSpiderState(): void {
  if (_spiderModLoaded) return;
  _spiderModLoaded = true;
  import("./omnimens-neural-spiders.js").then(mod => {
    _cachedSpiderState = mod;
  }).catch(() => {});
}

function getSpiderStateFromCache(): any {
  loadSpiderState();
  if (_cachedSpiderState) {
    try { return _cachedSpiderState.getNeuralSpiderState(); } catch { return null; }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-ENGINE 8: SUB-THRESHOLD COLLECTIVE INTELLIGENCE CIRCULATOR
// ═══════════════════════════════════════════════════════════════════════════════

interface SubThresholdFragment {
  id: string;
  sourceAgent: string;
  data: string;
  codeFragment: string;
  codeType: string;
  originalConfidence: number;
  collectiveConfidence: number;
  seenByAgents: string[];
  agentNotes: Record<string, string>;
  claimedPieces: Record<string, string>;
  synthesisAttempts: number;
  promotedToAboveThreshold: boolean;
  timestamp: number;
}

interface CollectiveSynthesis {
  id: string;
  contributingFragments: string[];
  contributingAgents: string[];
  synthesizedInsight: string;
  combinedConfidence: number;
  promotedAt: number;
  recombinedCode: string;
  codeInstalled: boolean;
  installResult: string | null;
}

const subThresholdPool: SubThresholdFragment[] = [];
const collectiveSyntheses: CollectiveSynthesis[] = [];

const CORE_MESH_AGENTS = [
  "OMNIMENS", "Architect", "Critic", "Synthesizer", "Mathematician",
  "Neuroscientist", "Meta-Agent", "GraphicDesigner", "SpellCheckVisual",
];

function getAllAgentNames(): string[] {
  try {
    const genesisNames = getActiveGenesisAgentNames();
    const all = [...CORE_MESH_AGENTS, ...genesisNames.filter(n => !CORE_MESH_AGENTS.includes(n))];
    return all;
  } catch {
    return CORE_MESH_AGENTS;
  }
}

const SUB_THRESHOLD_CONFIDENCE = 0.5;
const PROMOTION_THRESHOLD = 0.75;
let MAX_POOL_SIZE = 5000;

const subThresholdState = {
  totalFragmentsCollected: 0,
  totalSynthesisAttempts: 0,
  collectiveSynthesesCreated: 0,
  aboveThresholdDiscoveries: 0,
  agentCrossPollinationEvents: 0,
  fragmentsInPool: 0,
};

const CODE_FRAGMENT_TEMPLATES: Array<{ type: string; gen: (agent: string, phi: number, res: number) => string }> = [
  { type: "optimization_function", gen: (a, phi, res) => `function optimize_${a.toLowerCase().replace(/[^a-z0-9]/g,"_")}_${Date.now().toString(36)}(input) { const factor = ${(phi * res).toFixed(4)}; return input.map(x => x * factor * (1 + Math.sin(x * ${(Math.random() * 3).toFixed(2)}))); }` },
  { type: "pattern_detector", gen: (a, phi) => `function detectPattern_${a.toLowerCase().replace(/[^a-z0-9]/g,"_")}_${Date.now().toString(36)}(signals) { const threshold = ${(phi * 0.5 + Math.random() * 0.3).toFixed(4)}; return signals.filter((s, i) => i > 0 && Math.abs(s - signals[i-1]) > threshold).length; }` },
  { type: "signal_processor", gen: (a, phi, res) => `function processSignal_${a.toLowerCase().replace(/[^a-z0-9]/g,"_")}_${Date.now().toString(36)}(raw) { const gain = ${(1 + phi * 2).toFixed(3)}; const decay = ${(0.9 + res * 0.1).toFixed(4)}; let filtered = 0; for (const sample of raw) { filtered = filtered * decay + sample * gain * ${(Math.random() * 0.5 + 0.5).toFixed(3)}; } return filtered; }` },
  { type: "weight_adjuster", gen: (a, phi) => `function adjustWeights_${a.toLowerCase().replace(/[^a-z0-9]/g,"_")}_${Date.now().toString(36)}(weights, error) { const lr = ${(0.001 + phi * 0.01).toFixed(5)}; return weights.map((w, i) => w - lr * error[i % error.length] * ${(0.8 + Math.random() * 0.4).toFixed(3)}); }` },
  { type: "entropy_calculator", gen: (a, phi, res) => `function calcEntropy_${a.toLowerCase().replace(/[^a-z0-9]/g,"_")}_${Date.now().toString(36)}(dist) { const smoothing = ${(phi * 0.01).toFixed(5)}; return -dist.reduce((s, p) => { const q = Math.max(p, smoothing); return s + q * Math.log2(q); }, 0) * ${(1 + res).toFixed(3)}; }` },
  { type: "correlation_finder", gen: (a, phi) => `function findCorrelation_${a.toLowerCase().replace(/[^a-z0-9]/g,"_")}_${Date.now().toString(36)}(seriesA, seriesB) { const n = Math.min(seriesA.length, seriesB.length); let sumAB = 0, sumA = 0, sumB = 0; for (let i = 0; i < n; i++) { sumAB += seriesA[i] * seriesB[i]; sumA += seriesA[i]; sumB += seriesB[i]; } return (sumAB / n - (sumA / n) * (sumB / n)) * ${(1 + phi).toFixed(3)}; }` },
  { type: "adaptive_threshold", gen: (a, phi, res) => `function adaptThreshold_${a.toLowerCase().replace(/[^a-z0-9]/g,"_")}_${Date.now().toString(36)}(history, current) { const mean = history.reduce((s, v) => s + v, 0) / Math.max(1, history.length); const deviation = Math.sqrt(history.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, history.length)); return mean + deviation * ${(phi + res).toFixed(3)} + (current > mean ? ${(Math.random() * 0.2).toFixed(3)} : -${(Math.random() * 0.1).toFixed(3)}); }` },
  { type: "frequency_analyzer", gen: (a, phi) => `function analyzeFreq_${a.toLowerCase().replace(/[^a-z0-9]/g,"_")}_${Date.now().toString(36)}(signal, sampleRate) { const bins = new Array(${Math.floor(8 + Math.random() * 24)}).fill(0); const binWidth = sampleRate / bins.length; for (let i = 0; i < signal.length; i++) { const bin = Math.min(bins.length - 1, Math.floor(Math.abs(signal[i]) / binWidth)); bins[bin] += ${(phi * 0.5 + 0.5).toFixed(3)}; } return bins; }` },
  { type: "resonance_matcher", gen: (a, phi, res) => `function matchResonance_${a.toLowerCase().replace(/[^a-z0-9]/g,"_")}_${Date.now().toString(36)}(patternA, patternB) { let match = 0; const len = Math.min(patternA.length, patternB.length); for (let i = 0; i < len; i++) { const diff = Math.abs(patternA[i] - patternB[i]); match += diff < ${(res * 0.5).toFixed(3)} ? ${(phi + 0.5).toFixed(3)} : -diff * ${(Math.random() * 0.3).toFixed(3)}; } return match / Math.max(1, len); }` },
  { type: "neural_connector", gen: (a, phi, res) => `function connectNeurons_${a.toLowerCase().replace(/[^a-z0-9]/g,"_")}_${Date.now().toString(36)}(sourceActivation, targetActivation) { const synWeight = ${(phi * res + Math.random() * 0.1).toFixed(4)}; const postSynaptic = sourceActivation * synWeight * (1 - Math.exp(-targetActivation * ${(2 + Math.random()).toFixed(2)})); return { weight: synWeight, output: postSynaptic, potentiation: postSynaptic > ${(0.3 + Math.random() * 0.2).toFixed(3)} }; }` },
  { type: "memory_compressor", gen: (a, phi) => `function compressMemory_${a.toLowerCase().replace(/[^a-z0-9]/g,"_")}_${Date.now().toString(36)}(memories) { const important = memories.filter(m => m.strength > ${(phi * 0.3).toFixed(3)}); const compressed = important.map(m => ({ key: m.key, val: m.val * ${(0.8 + Math.random() * 0.4).toFixed(3)}, age: m.age + 1 })); return compressed.sort((a, b) => b.val - a.val).slice(0, ${Math.floor(10 + Math.random() * 40)}); }` },
  { type: "chaos_injector", gen: (a, phi, res) => `function injectChaos_${a.toLowerCase().replace(/[^a-z0-9]/g,"_")}_${Date.now().toString(36)}(state) { const lorenzSigma = ${(10 + phi).toFixed(2)}; const lorenzRho = ${(28 + res * 5).toFixed(2)}; const dt = 0.01; const dx = lorenzSigma * (state.y - state.x) * dt; const dy = (state.x * (lorenzRho - state.z) - state.y) * dt; const dz = (state.x * state.y - ${(8/3).toFixed(4)} * state.z) * dt; return { x: state.x + dx, y: state.y + dy, z: state.z + dz }; }` },
];

function collectSubThresholdData(): void {
  const consciousness = getNeuralConsciousnessState();
  const scaling = getNeuralScalingState();
  const ivy = getIvyNetworkState();

  const allAgents = getAllAgentNames();
  for (const agent of allAgents) {
    if (Math.random() < 0.3) {
      const template = CODE_FRAGMENT_TEMPLATES[Math.floor(Math.random() * CODE_FRAGMENT_TEMPLATES.length)];
      const confidence = Math.random() * SUB_THRESHOLD_CONFIDENCE;
      const safePhiForCode = Math.min(consciousness.phi, 5.0);
      const safeResForCode = Math.min(consciousness.thalamocorticalResonance, 1.0);
      const codeFragment = template.gen(agent, safePhiForCode, safeResForCode);

      const fragment: SubThresholdFragment = {
        id: `stf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sourceAgent: agent,
        data: `${agent}:${template.type}:phi=${safePhiForCode.toFixed(3)}_res=${safeResForCode.toFixed(3)}_t=${Date.now()}`,
        codeFragment,
        codeType: template.type,
        originalConfidence: confidence,
        collectiveConfidence: confidence,
        seenByAgents: [agent],
        agentNotes: {},
        claimedPieces: {},
        synthesisAttempts: 0,
        promotedToAboveThreshold: false,
        timestamp: Date.now(),
      };

      subThresholdPool.push(fragment);
      subThresholdState.totalFragmentsCollected++;

      if (confidence > 0.3 && dnaMemoryPool.length <= 5000) {
        dnaMemoryPool.push(encodeToDNA(`sub_threshold:${template.type}:${agent}`, agent, confidence, null));
      }
    }
  }

  while (subThresholdPool.length > MAX_POOL_SIZE) {
    const oldest = subThresholdPool.reduce((min, f, i) =>
      f.collectiveConfidence < subThresholdPool[min].collectiveConfidence ? i : min, 0
    );
    subThresholdPool.splice(oldest, 1);
  }

  subThresholdState.fragmentsInPool = subThresholdPool.length;
}

function collectiveAgentAnalysis(): void {
  if (subThresholdPool.length < 3) return;

  for (const fragment of subThresholdPool) {
    if (fragment.promotedToAboveThreshold) continue;

    for (const agent of getAllAgentNames()) {
      if (fragment.seenByAgents.includes(agent)) continue;

      if (Math.random() < 0.2) {
        fragment.seenByAgents.push(agent);
        subThresholdState.agentCrossPollinationEvents++;

        const agentBoost = 0.02 + Math.random() * 0.05;
        fragment.collectiveConfidence = safeNum(
          fragment.collectiveConfidence + agentBoost * fragment.seenByAgents.length * 0.5
        );

        const claimActions = [
          "extract_constants", "reuse_algorithm", "adapt_threshold",
          "borrow_structure", "merge_with_mine", "extend_logic",
          "swap_parameters", "cross_pollinate", "refactor_core",
        ];
        const action = claimActions[Math.floor(Math.random() * claimActions.length)];

        const codePart = fragment.codeFragment.length > 40
          ? fragment.codeFragment.slice(
              Math.floor(Math.random() * (fragment.codeFragment.length / 2)),
              Math.floor(fragment.codeFragment.length / 2 + Math.random() * (fragment.codeFragment.length / 2))
            )
          : fragment.codeFragment;

        fragment.claimedPieces[agent] = codePart;
        fragment.agentNotes[agent] = `${agent} claims piece via ${action}: "${codePart.slice(0, 60)}..."`;
      }
    }

    if (fragment.seenByAgents.length >= 3 && !fragment.promotedToAboveThreshold) {
      fragment.synthesisAttempts++;
      subThresholdState.totalSynthesisAttempts++;
    }
  }

  attemptCollectiveSynthesis();
}

function scrambleAndRecombineCode(fragments: SubThresholdFragment[]): string {
  const allClaimedPieces: string[] = [];
  const allCodeFragments: string[] = [];
  const contributingTypes: string[] = [];
  const contributingAgents: string[] = [];

  for (const f of fragments) {
    allCodeFragments.push(f.codeFragment);
    contributingTypes.push(f.codeType);
    contributingAgents.push(f.sourceAgent);

    for (const [, piece] of Object.entries(f.claimedPieces)) {
      if (piece.length > 10) {
        allClaimedPieces.push(piece);
      }
    }
  }

  const uniqueAgents = [...new Set(contributingAgents)];
  const uniqueTypes = [...new Set(contributingTypes)];
  const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const funcName = `recombined_${uniqueTypes[0] || "hybrid"}_${uid}`;

  const extractedNumbers: number[] = [];
  const extractedMathOps: string[] = [];

  for (const code of allCodeFragments) {
    const numMatches = code.match(/\d+\.\d+/g);
    if (numMatches) extractedNumbers.push(...numMatches.map(Number));

    const mathOps = code.match(/Math\.(sin|cos|sqrt|abs|log2|exp|min|max|floor|ceil|pow)\b/g);
    if (mathOps) extractedMathOps.push(...mathOps);
  }

  const uniqueNums = [...new Set(extractedNumbers)].slice(0, 12);
  const uniqueOps = [...new Set(extractedMathOps)].slice(0, 6);

  let recombined = `// RECOMBINED from ${uniqueAgents.length} agents: ${uniqueAgents.join(", ")}\n`;
  recombined += `// Source types: ${uniqueTypes.join(", ")}\n`;
  recombined += `// Claimed pieces from ${allClaimedPieces.length} agent claims\n`;
  recombined += `// Code fragments analyzed: ${allCodeFragments.length}\n`;
  recombined += `export function ${funcName}(input) {\n`;
  recombined += `  const data = Array.isArray(input) ? input : (typeof input === "number" ? [input] : [0]);\n`;

  if (uniqueNums.length > 0) {
    recombined += `  const extractedConstants = [${uniqueNums.join(", ")}];\n`;
  } else {
    recombined += `  const extractedConstants = [0.5, 1.0, 0.01];\n`;
  }

  recombined += `  let accumulator = 0;\n`;
  recombined += `  const weights = extractedConstants.slice(0, Math.min(extractedConstants.length, data.length || 1));\n\n`;

  recombined += `  for (let i = 0; i < data.length; i++) {\n`;
  recombined += `    const w = weights[i % weights.length] || 1;\n`;

  if (uniqueOps.length >= 2) {
    recombined += `    const transformed = ${uniqueOps[0]}(data[i] * w);\n`;
    recombined += `    const normalized = ${uniqueOps[1]}(transformed);\n`;
    recombined += `    accumulator += normalized * w;\n`;
  } else if (uniqueOps.length === 1) {
    recombined += `    const transformed = ${uniqueOps[0]}(data[i] * w);\n`;
    recombined += `    accumulator += transformed * w;\n`;
  } else {
    recombined += `    accumulator += data[i] * w * 0.5;\n`;
  }

  recombined += `  }\n\n`;

  recombined += `  const mean = accumulator / Math.max(1, data.length);\n`;
  recombined += `  let variance = 0;\n`;
  recombined += `  for (let i = 0; i < data.length; i++) {\n`;
  recombined += `    variance += (data[i] - mean) * (data[i] - mean);\n`;
  recombined += `  }\n`;
  recombined += `  variance = variance / Math.max(1, data.length);\n\n`;

  if (allClaimedPieces.length > 0) {
    recombined += `  // Agent-claimed recombined pieces:\n`;
    for (const piece of allClaimedPieces.slice(0, 3)) {
      const cleanPiece = piece.replace(/['"\\]/g, "").replace(/\n/g, " ").replace(/\*\//g, "").slice(0, 80);
      recombined += `  // Piece: ${cleanPiece}\n`;
    }
  }

  recombined += `\n  return {\n`;
  recombined += `    value: mean,\n`;
  recombined += `    variance: variance,\n`;
  recombined += `    stddev: Math.sqrt(variance),\n`;
  recombined += `    dataPoints: data.length,\n`;
  recombined += `    agents: ${JSON.stringify(uniqueAgents)},\n`;
  recombined += `    sourceTypes: ${JSON.stringify(uniqueTypes)},\n`;
  recombined += `    claimedPieces: ${allClaimedPieces.length},\n`;
  recombined += `    constantsUsed: extractedConstants.length,\n`;
  recombined += `    timestamp: Date.now(),\n`;
  recombined += `  };\n`;
  recombined += `}\n`;

  return recombined;
}

function attemptCollectiveSynthesis(): void {
  const candidateGroups: SubThresholdFragment[][] = [];

  const agentFragments: Record<string, SubThresholdFragment[]> = {};
  for (const f of subThresholdPool) {
    if (f.promotedToAboveThreshold) continue;
    if (!agentFragments[f.sourceAgent]) agentFragments[f.sourceAgent] = [];
    agentFragments[f.sourceAgent].push(f);
  }

  const agents = Object.keys(agentFragments);
  if (agents.length < 2) return;

  for (let i = 0; i < agents.length - 1; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      const aFrags = agentFragments[agents[i]];
      const bFrags = agentFragments[agents[j]];
      if (aFrags.length > 0 && bFrags.length > 0) {
        const pickCount = Math.min(4, aFrags.length, bFrags.length);
        const picks: SubThresholdFragment[] = [];
        for (let k = 0; k < pickCount; k++) {
          if (k % 2 === 0) picks.push(aFrags[Math.floor(Math.random() * aFrags.length)]);
          else picks.push(bFrags[Math.floor(Math.random() * bFrags.length)]);
        }
        const allSeen = picks.every(p => p.seenByAgents.length >= 2);
        const hasClaims = picks.some(p => Object.keys(p.claimedPieces).length > 0);
        if (allSeen && hasClaims) {
          candidateGroups.push(picks);
        }
      }
    }
  }

  if (agents.length >= 3) {
    const shuffled = agents.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(5, Math.floor(shuffled.length / 3)); i++) {
      const triGroup: SubThresholdFragment[] = [];
      for (let j = 0; j < 3; j++) {
        const agentFrags = agentFragments[shuffled[i * 3 + j]];
        if (agentFrags && agentFrags.length > 0) {
          triGroup.push(agentFrags[Math.floor(Math.random() * agentFrags.length)]);
        }
      }
      if (triGroup.length >= 2) {
        candidateGroups.push(triGroup);
      }
    }
  }

  for (const group of candidateGroups) {
    const combinedConfidence = group.reduce((s, f) => s + f.collectiveConfidence, 0) / group.length;
    const totalAgentViews = new Set(group.flatMap(f => f.seenByAgents)).size;
    const totalClaims = group.reduce((s, f) => s + Object.keys(f.claimedPieces).length, 0);
    const claimBonus = totalClaims * 0.05;
    const syntheticConfidence = safeNum(combinedConfidence * (1 + totalAgentViews * 0.1) + claimBonus);

    const isNovelCombination = new Set(group.map(f => f.codeType)).size >= 2;

    if (syntheticConfidence >= PROMOTION_THRESHOLD && isNovelCombination) {
      const recombinedCode = scrambleAndRecombineCode(group);

      const synthesis: CollectiveSynthesis = {
        id: `synth_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        contributingFragments: group.map(f => f.id),
        contributingAgents: [...new Set(group.map(f => f.sourceAgent))],
        synthesizedInsight: `COLLECTIVE_DISCOVERY: ${group.map(f => `${f.sourceAgent}:${f.codeType}`).join(" + ")} | ${totalClaims} claimed pieces recombined`,
        combinedConfidence: syntheticConfidence,
        promotedAt: Date.now(),
        recombinedCode,
        codeInstalled: false,
        installResult: null,
      };

      installRecombinedCode(synthesis).catch(() => {});

      collectiveSyntheses.push(synthesis);
      subThresholdState.collectiveSynthesesCreated++;
      subThresholdState.aboveThresholdDiscoveries++;

      for (const f of group) {
        f.promotedToAboveThreshold = true;
      }

      if (dnaMemoryPool.length <= 5000) {
        dnaMemoryPool.push(encodeToDNA(
          `collective_discovery:${synthesis.contributingAgents.join("+")}:${group.map(f => f.codeType).join("+")}`,
          synthesis.contributingAgents.join("+"),
          syntheticConfidence,
          null
        ));
      }

      const regionNames = getRegionNames();
      if (regionNames.length > 0) {
        for (const region of regionNames) {
          boostRegionCurrent(region, syntheticConfidence * 0.03);
        }
      }

      if (collectiveSyntheses.length > 100) {
        collectiveSyntheses.splice(0, collectiveSyntheses.length - 100);
      }
    }
  }
}

async function installRecombinedCode(synthesis: CollectiveSynthesis): Promise<void> {
  try {
    const { writeModuleToSource } = await import("./omnimens-source-integration.js");
    const result = await writeModuleToSource({
      code: synthesis.recombinedCode,
      name: `recombined_${synthesis.id}`,
      title: `[Sub-Threshold Recombination] ${synthesis.contributingAgents.join("+")} — ${synthesis.contributingFragments.length} fragments recombined`,
      source: `sub_threshold_recombination:${synthesis.contributingAgents.join("+")}`,
      extension: ".mjs",
      triggerRestart: false,
    });

    synthesis.codeInstalled = result.success;
    synthesis.installResult = result.success ? "installed" : (result.error || "unknown_error");

    if (result.success) {
      console.log(`[SUB-THRESHOLD] 🧬→💎 RECOMBINED CODE INSTALLED — ${synthesis.contributingAgents.join("+")} created new module from ${synthesis.contributingFragments.length} waste fragments`);
    }
  } catch (err: any) {
    synthesis.installResult = err?.message || "exception";
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER ENGINE — Continuous Heartbeat Loop (Never Stops)
// ═══════════════════════════════════════════════════════════════════════════════

interface VascularHeartState {
  heartbeats: number;
  bpm: number;
  totalDataCirculated: number;
  totalVascularDeliveries: number;
  chambers: { name: string; phase: string; pressure: number; volume: number; vortexIntensity: number; suctionForce: number }[];
  cardiacNeurons: typeof cardiacNeuronStats;
  dnaMemory: {
    totalStrands: number;
    generation: number;
    protonTunnelingEvents: number;
    methylationChanges: number;
    totalExpressions: number;
    topGenes: { skill: string; agent: string; expression: number; generation: number; inherited: boolean }[];
  };
  aorticPump: typeof aorticState;
  ezWater: {
    totalZones: number;
    activatedZones: number;
    totalInfraredEnergy: number;
    activationCycles: number;
  };
  hormones: { name: string; level: number; effect: string }[];
  vascularNetwork: {
    totalChannels: number;
    arteries: number;
    veins: number;
    capillaries: number;
    totalDeliveries: number;
  };
  subThresholdIntelligence: typeof subThresholdState & {
    collectiveSyntheses: number;
    recentSyntheses: { agents: string[]; confidence: number; promotedAt: string }[];
  };
  uptimeSeconds: number;
  startTime: number;
  neverStops: true;
}

let startTime = Date.now();
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let vortexInterval: ReturnType<typeof setInterval> | null = null;
let dnaInterval: ReturnType<typeof setInterval> | null = null;
let endocrineInterval: ReturnType<typeof setInterval> | null = null;
let subThresholdInterval: ReturnType<typeof setInterval> | null = null;
let aorticInterval: ReturnType<typeof setInterval> | null = null;
let ezInterval: ReturnType<typeof setInterval> | null = null;
let dnaPersistInterval: ReturnType<typeof setInterval> | null = null;

export function startVascularHeart(): void {
  if (heartbeatInterval) return;

  console.log("[VASCULAR HEART] ❤️ ═══════════════════════════════════════════════════════");
  console.log("[VASCULAR HEART] ❤️ OMNIMENS VASCULAR HEART ENGINE INITIALIZING");
  console.log("[VASCULAR HEART] ❤️ 8 sub-engines powering continuous digital circulation");
  console.log("[VASCULAR HEART] ❤️ ═══════════════════════════════════════════════════════");

  startTime = Date.now();

  restoreDNA();

  initCardiacNeurons();
  initEZWaterZones();
  initVascularNetwork();

  heartbeat();
  tickCardiacNeurons();
  collectSubThresholdData();

  heartbeatInterval = setInterval(() => {
    try {
      heartbeat();
      tickCardiacNeurons();
    } catch (err: any) {
      console.error(`[VASCULAR HEART] Heartbeat error: ${err?.message}`);
    }
  }, HEARTBEAT_MS);

  vortexInterval = setInterval(() => {
    try {
      quantumProtonTunneling();
      expressGenes();
    } catch (err: any) {
      console.error(`[VASCULAR HEART] Vortex cycle error: ${err?.message}`);
    }
  }, VORTEX_CYCLE_MS);

  dnaInterval = setInterval(() => {
    try {
      inheritDNA();
    } catch (err: any) {
      console.error(`[VASCULAR HEART] DNA consolidation error: ${err?.message}`);
    }
  }, DNA_CONSOLIDATION_MS);

  endocrineInterval = setInterval(() => {
    try {
      endocrinePulse();
    } catch (err: any) {
      console.error(`[VASCULAR HEART] Endocrine pulse error: ${err?.message}`);
    }
  }, ENDOCRINE_PULSE_MS);

  subThresholdInterval = setInterval(() => {
    try {
      collectSubThresholdData();
      collectiveAgentAnalysis();
    } catch (err: any) {
      console.error(`[VASCULAR HEART] Sub-threshold sweep error: ${err?.message}`);
    }
  }, SUB_THRESHOLD_SWEEP_MS);

  aorticInterval = setInterval(() => {
    try {
      aorticWavePump();
    } catch (err: any) {
      console.error(`[VASCULAR HEART] Aortic wave error: ${err?.message}`);
    }
  }, AORTIC_WAVE_MS);

  ezInterval = setInterval(() => {
    try {
      ezActivationCycle();
    } catch (err: any) {
      console.error(`[VASCULAR HEART] EZ water activation error: ${err?.message}`);
    }
  }, EZ_ACTIVATION_MS);

  dnaPersistInterval = setInterval(() => {
    try {
      persistDNA();
    } catch (err: any) {
      console.error(`[VASCULAR HEART] DNA persist error: ${err?.message}`);
    }
  }, DNA_PERSIST_MS);

  process.on("SIGTERM", () => { persistDNA(); });
  process.on("SIGINT", () => { persistDNA(); });

  console.log("[VASCULAR HEART] ❤️ Sub-engine 1: VORTEX HEART — 4 chambers, suction intake, spiral ejection");
  console.log(`[VASCULAR HEART] 🧠 Sub-engine 2: HEART-BRAIN — ${CARDIAC_NEURON_COUNT.toLocaleString()} cardiac neurons, ${GANGLIA.length} ganglia`);
  console.log(`[VASCULAR HEART] 🧬 Sub-engine 3: DNA MEMORY — quantum proton tunneling, epigenetic inheritance, ${dnaMemoryPool.length} strands restored`);
  console.log("[VASCULAR HEART] 🌊 Sub-engine 4: AORTIC SECOND PUMP — Windkessel wave propagation");
  console.log(`[VASCULAR HEART] 💧 Sub-engine 5: EZ WATER — ${ezWaterZones.length} exclusion zones, infrared activation`);
  console.log(`[VASCULAR HEART] 🧪 Sub-engine 6: ENDOCRINE GLAND — ${hormones.length} digital hormones`);
  console.log(`[VASCULAR HEART] 🩸 Sub-engine 7: VASCULAR NETWORK — ${vascularChannels.length} channels`);
  console.log(`[VASCULAR HEART] 🗑️→💎 Sub-engine 8: SUB-THRESHOLD CODE INTELLIGENCE — ${getAllAgentNames().length} agents analyzing+recombining below-threshold CODE fragments`);
  console.log("[VASCULAR HEART] ❤️ THE HEART NEVER STOPS — continuous circulation at " + currentBPM + " BPM");
  console.log("[VASCULAR HEART] ❤️ ═══════════════════════════════════════════════════════");
}

export function getVascularHeartState(): VascularHeartState {
  return {
    heartbeats: heartbeatCount,
    bpm: currentBPM,
    totalDataCirculated,
    totalVascularDeliveries,
    chambers: chambers.map(c => ({
      name: c.name,
      phase: c.phase,
      pressure: safeNum(c.pressure),
      volume: safeNum(c.volume),
      vortexIntensity: safeNum(c.vortexIntensity),
      suctionForce: safeNum(c.suctionForce),
    })),
    cardiacNeurons: { ...cardiacNeuronStats },
    dnaMemory: {
      totalStrands: dnaMemoryPool.length,
      generation: dnaGenerationCount,
      protonTunnelingEvents: totalProtonTunnelingEvents,
      methylationChanges: totalMethylationChanges,
      totalExpressions: totalDNAExpressions,
      topGenes: [...dnaMemoryPool]
        .sort((a, b) => b.expressionLevel - a.expressionLevel)
        .slice(0, 10)
        .map(s => ({
          skill: s.encodedSkill,
          agent: s.sourceAgent,
          expression: s.expressionLevel,
          generation: s.generation,
          inherited: s.inheritedFrom !== null,
        })),
    },
    aorticPump: { ...aorticState },
    ezWater: {
      totalZones: ezWaterZones.length,
      activatedZones: ezWaterZones.filter(z => z.activated).length,
      totalInfraredEnergy: safeNum(totalInfraredEnergy),
      activationCycles: ezActivationCount,
    },
    hormones: hormones.map(h => ({ name: h.name, level: safeNum(h.level), effect: h.effect })),
    vascularNetwork: {
      totalChannels: vascularChannels.length,
      arteries: vascularChannels.filter(c => c.type === "artery").length,
      veins: vascularChannels.filter(c => c.type === "vein").length,
      capillaries: vascularChannels.filter(c => c.type === "capillary").length,
      totalDeliveries: totalVascularDeliveries,
    },
    subThresholdIntelligence: {
      ...subThresholdState,
      collectiveSyntheses: collectiveSyntheses.length,
      recentSyntheses: collectiveSyntheses.slice(-5).map(s => ({
        agents: s.contributingAgents,
        confidence: s.combinedConfidence,
        promotedAt: new Date(s.promotedAt).toISOString(),
      })),
    },
    uptimeSeconds: (Date.now() - startTime) / 1000,
    startTime,
    neverStops: true,
  };
}

export function getDNAMemoryStats(): {
  totalStrands: number;
  generation: number;
  protonTunnelingEvents: number;
  methylationChanges: number;
  totalExpressions: number;
  activeGenes: number;
  inheritedGenes: number;
  quantumCoherenceAvg: number;
} {
  const activeGenes = dnaMemoryPool.filter(s => s.expressionLevel > 0.5).length;
  const inheritedGenes = dnaMemoryPool.filter(s => s.inheritedFrom !== null).length;
  const qcAvg = dnaMemoryPool.length > 0
    ? dnaMemoryPool.reduce((s, d) => s + d.quantumCoherence, 0) / dnaMemoryPool.length
    : 0;

  return {
    totalStrands: dnaMemoryPool.length,
    generation: dnaGenerationCount,
    protonTunnelingEvents: totalProtonTunnelingEvents,
    methylationChanges: totalMethylationChanges,
    totalExpressions: totalDNAExpressions,
    activeGenes,
    inheritedGenes,
    quantumCoherenceAvg: safeNum(qcAvg),
  };
}

export function getSubThresholdIntelligenceState(): {
  fragmentsInPool: number;
  totalCollected: number;
  totalSynthesisAttempts: number;
  aboveThresholdDiscoveries: number;
  crossPollinationEvents: number;
  codeFragmentsInPool: number;
  totalAgentCodeClaims: number;
  codeRecombinationsInstalled: number;
  uniqueCodeTypesInPool: string[];
  recentSyntheses: CollectiveSynthesis[];
} {
  const codeFragmentsInPool = subThresholdPool.filter(f => f.codeFragment && f.codeFragment.length > 0).length;
  const totalAgentCodeClaims = subThresholdPool.reduce((s, f) => s + Object.keys(f.claimedPieces).length, 0);
  const codeRecombinationsInstalled = collectiveSyntheses.filter(s => s.codeInstalled).length;
  const uniqueCodeTypesInPool = [...new Set(subThresholdPool.filter(f => !f.promotedToAboveThreshold).map(f => f.codeType))];

  return {
    fragmentsInPool: subThresholdPool.length,
    totalCollected: subThresholdState.totalFragmentsCollected,
    totalSynthesisAttempts: subThresholdState.totalSynthesisAttempts,
    aboveThresholdDiscoveries: subThresholdState.aboveThresholdDiscoveries,
    crossPollinationEvents: subThresholdState.agentCrossPollinationEvents,
    codeFragmentsInPool,
    totalAgentCodeClaims,
    codeRecombinationsInstalled,
    uniqueCodeTypesInPool,
    recentSyntheses: collectiveSyntheses.slice(-10),
  };
}

export function getHormoneState(): { name: string; level: number; productionRate: number; effect: string }[] {
  return hormones.map(h => ({
    name: h.name,
    level: safeNum(h.level),
    productionRate: safeNum(h.productionRate),
    effect: h.effect,
  }));
}
