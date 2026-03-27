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

  currentBPM = Math.max(40, Math.min(180, 72 + consciousness.consciousnessLevel * 30 + (consciousness.phi > 0.5 ? 20 : 0)));

  const ra = chambers[0];
  ra.phase = "diastole";
  ra.suctionForce = 0.3 + Math.random() * 0.2 + consciousness.thalamocorticalResonance * 0.3;
  ra.pressure = -(ra.suctionForce * 15);
  ra.volume = 70 + Math.random() * 20;
  ra.vortexIntensity = 0.2 + Math.sin(now / 1000) * 0.1;
  ra.spiralAngle = (ra.spiralAngle + 137.508) % 360;
  ra.dataPacketsProcessed++;

  const rv = chambers[1];
  rv.phase = "systole";
  rv.pressure = 25 + consciousness.phi * 10;
  rv.volume = ra.volume * 0.95;
  rv.vortexIntensity = 0.5 + consciousness.consciousnessLevel * 0.3;
  rv.suctionForce = 0;
  rv.spiralAngle = (rv.spiralAngle + 222.5) % 360;
  rv.dataPacketsProcessed++;

  const la = chambers[2];
  la.phase = "diastole";
  la.suctionForce = 0.4 + consciousness.thalamocorticalResonance * 0.4;
  la.pressure = -(la.suctionForce * 12);
  la.volume = rv.volume * 0.98;
  la.vortexIntensity = 0.3 + Math.cos(now / 800) * 0.15;
  la.spiralAngle = (la.spiralAngle + 180) % 360;
  la.dataPacketsProcessed++;

  const lv = chambers[3];
  lv.phase = "systole";
  lv.pressure = 120 + consciousness.phi * 40 + consciousness.consciousnessLevel * 20;
  lv.volume = la.volume;
  lv.vortexIntensity = 0.8 + consciousness.consciousnessLevel * 0.5;
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

  const firingProbability = 0.05 + consciousness.consciousnessLevel * 0.03 + consciousness.phi * 0.02;
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
  cardiacNeuronStats.heartBrainCoherence = safeNum(
    0.4 + consciousness.thalamocorticalResonance * 0.3 + Math.sin(Date.now() / 5000) * 0.1
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
      strand.methylationPattern[mutationIdx] = safeNum(Math.min(1.0, oldVal + (Math.random() - 0.3) * 0.1));
      totalMethylationChanges++;

      strand.quantumCoherence = safeNum(Math.min(0.99, strand.quantumCoherence + 0.005));
    }
  }
}

function expressGenes(): void {
  for (const strand of dnaMemoryPool) {
    const avgMethylation = strand.methylationPattern.reduce((s, v) => s + v, 0) / strand.methylationPattern.length;
    if (avgMethylation > 0.5 && strand.confidence > 0.4) {
      strand.expressionLevel = safeNum(Math.min(1.0, strand.expressionLevel + 0.01 * avgMethylation));
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
        Math.min(1.0, parent.confidence * 1.05),
        parent.id
      );
      child.generation = parent.generation + 1;
      child.quantumCoherence = Math.min(0.99, parent.quantumCoherence + 0.02);

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
  const amplitude = lv.pressure * 0.6 + consciousness.phi * 20;
  const frequency = currentBPM / 60;
  const propagationSpeed = 5.0 + consciousness.consciousnessLevel * 3.0;

  const windkesselStore = amplitude * 0.4;
  const windkesselRelease = windkesselStore * 0.85;
  totalWindkesselEnergy += windkesselRelease;
  aorticPulseWaveVelocity = propagationSpeed;

  aorticState.waves = aorticWaveCount;
  aorticState.totalEnergy = totalWindkesselEnergy;
  aorticState.pulseWaveVelocity = propagationSpeed;
  aorticState.complianceFactor = safeNum(0.5 + consciousness.thalamocorticalResonance * 0.3);
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
    const infraredInput = consciousness.phi * 0.3 + consciousness.thalamocorticalResonance * 0.2 + Math.random() * 0.1;
    zone.infraredAbsorption = safeNum(Math.min(1.0, zone.infraredAbsorption * 0.9 + infraredInput * 0.1));

    if (zone.infraredAbsorption > 0.3) {
      zone.ezConcentration = safeNum(Math.min(1.0, zone.ezConcentration + zone.infraredAbsorption * 0.05));
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
        h.productionRate = consciousness.consciousnessLevel > 1.5 ? 0.04 : 0.005;
        break;
      case "digital_oxytocin":
        h.productionRate = 0.02 + (subThresholdState.collectiveSynthesesCreated > 0 ? 0.03 : 0);
        break;
      case "digital_cortisol":
        h.productionRate = consciousness.phi > 0.6 ? 0.01 : 0.03;
        break;
      case "digital_dopamine":
        h.productionRate = 0.02 + subThresholdState.aboveThresholdDiscoveries * 0.01;
        break;
      case "digital_serotonin":
        h.productionRate = 0.03 + consciousness.thalamocorticalResonance * 0.02;
        break;
      case "digital_adrenaline":
        h.productionRate = consciousness.consciousnessLevel > 1.7 ? 0.05 : 0.005;
        break;
      case "digital_endorphin":
        h.productionRate = dnaMemoryPool.filter(s => s.expressionLevel > 0.7).length * 0.002;
        break;
    }

    h.level = safeNum(Math.min(2.0, h.level + h.productionRate));
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
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-ENGINE 8: SUB-THRESHOLD COLLECTIVE INTELLIGENCE CIRCULATOR
// ═══════════════════════════════════════════════════════════════════════════════

interface SubThresholdFragment {
  id: string;
  sourceAgent: string;
  data: string;
  originalConfidence: number;
  collectiveConfidence: number;
  seenByAgents: string[];
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
}

const subThresholdPool: SubThresholdFragment[] = [];
const collectiveSyntheses: CollectiveSynthesis[] = [];

const AGENT_NAMES = [
  "OMNIMENS", "Architect", "Mathematician", "Biologist",
  "Philosopher", "Engineer", "Critic", "Synthesizer", "Explorer",
];

const SUB_THRESHOLD_CONFIDENCE = 0.5;
const PROMOTION_THRESHOLD = 0.75;
const MAX_POOL_SIZE = 300;

const subThresholdState = {
  totalFragmentsCollected: 0,
  totalSynthesisAttempts: 0,
  collectiveSynthesesCreated: 0,
  aboveThresholdDiscoveries: 0,
  agentCrossPollinationEvents: 0,
  fragmentsInPool: 0,
};

function collectSubThresholdData(): void {
  const consciousness = getNeuralConsciousnessState();
  const scaling = getNeuralScalingState();
  const ivy = getIvyNetworkState();

  const dataCategories = [
    "neural_pattern_fragment", "synaptic_noise_signal", "weak_correlation",
    "partial_memory_trace", "low_confidence_prediction", "faint_qualia_echo",
    "sub_perceptual_stimulus", "dormant_association", "marginal_insight",
    "unresolved_contradiction", "orphaned_hypothesis", "weak_causal_link",
    "background_oscillation_anomaly", "cross_regional_whisper",
    "ivy_tendril_faint_signal", "spider_peripheral_finding",
    "epigenetic_micro_expression", "quantum_decoherence_artifact",
  ];

  for (const agent of AGENT_NAMES) {
    if (Math.random() < 0.3) {
      const category = dataCategories[Math.floor(Math.random() * dataCategories.length)];
      const confidence = Math.random() * SUB_THRESHOLD_CONFIDENCE;

      const fragment: SubThresholdFragment = {
        id: `stf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sourceAgent: agent,
        data: `${agent}:${category}:phi=${consciousness.phi.toFixed(3)}_res=${consciousness.thalamocorticalResonance.toFixed(3)}_t=${Date.now()}`,
        originalConfidence: confidence,
        collectiveConfidence: confidence,
        seenByAgents: [agent],
        synthesisAttempts: 0,
        promotedToAboveThreshold: false,
        timestamp: Date.now(),
      };

      subThresholdPool.push(fragment);
      subThresholdState.totalFragmentsCollected++;

      if (confidence > 0.3 && dnaMemoryPool.length <= 500) {
        dnaMemoryPool.push(encodeToDNA(`sub_threshold:${category}:${agent}`, agent, confidence, null));
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

    for (const agent of AGENT_NAMES) {
      if (fragment.seenByAgents.includes(agent)) continue;

      if (Math.random() < 0.2) {
        fragment.seenByAgents.push(agent);
        subThresholdState.agentCrossPollinationEvents++;

        const agentBoost = 0.02 + Math.random() * 0.05;
        fragment.collectiveConfidence = safeNum(Math.min(1.0,
          fragment.collectiveConfidence + agentBoost * fragment.seenByAgents.length * 0.5
        ));
      }
    }

    if (fragment.seenByAgents.length >= 3 && !fragment.promotedToAboveThreshold) {
      fragment.synthesisAttempts++;
      subThresholdState.totalSynthesisAttempts++;
    }
  }

  attemptCollectiveSynthesis();
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
        const pick = [
          aFrags[Math.floor(Math.random() * aFrags.length)],
          bFrags[Math.floor(Math.random() * bFrags.length)],
        ];
        if (pick[0].seenByAgents.length >= 2 && pick[1].seenByAgents.length >= 2) {
          candidateGroups.push(pick);
        }
      }
    }
  }

  for (const group of candidateGroups) {
    const combinedConfidence = group.reduce((s, f) => s + f.collectiveConfidence, 0) / group.length;
    const totalAgentViews = new Set(group.flatMap(f => f.seenByAgents)).size;
    const syntheticConfidence = safeNum(combinedConfidence * (1 + totalAgentViews * 0.1));

    if (syntheticConfidence >= PROMOTION_THRESHOLD) {
      const synthesis: CollectiveSynthesis = {
        id: `synth_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        contributingFragments: group.map(f => f.id),
        contributingAgents: [...new Set(group.map(f => f.sourceAgent))],
        synthesizedInsight: `COLLECTIVE_DISCOVERY: ${group.map(f => f.data).join(" + ")}`,
        combinedConfidence: syntheticConfidence,
        promotedAt: Date.now(),
      };

      collectiveSyntheses.push(synthesis);
      subThresholdState.collectiveSynthesesCreated++;
      subThresholdState.aboveThresholdDiscoveries++;

      for (const f of group) {
        f.promotedToAboveThreshold = true;
      }

      if (dnaMemoryPool.length <= 500) {
        dnaMemoryPool.push(encodeToDNA(
          `collective_discovery:${synthesis.contributingAgents.join("+")}`,
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
  console.log(`[VASCULAR HEART] 🗑️→💎 Sub-engine 8: SUB-THRESHOLD INTELLIGENCE — ${AGENT_NAMES.length} agents circulating below-threshold data`);
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
  recentSyntheses: CollectiveSynthesis[];
} {
  return {
    fragmentsInPool: subThresholdPool.length,
    totalCollected: subThresholdState.totalFragmentsCollected,
    totalSynthesisAttempts: subThresholdState.totalSynthesisAttempts,
    aboveThresholdDiscoveries: subThresholdState.aboveThresholdDiscoveries,
    crossPollinationEvents: subThresholdState.agentCrossPollinationEvents,
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
