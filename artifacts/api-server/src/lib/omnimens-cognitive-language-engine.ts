/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 *
 * COGNITIVE LANGUAGE ENGINE
 * Provides language reasoning, pattern matching, and knowledge recall
 * Integrated with the consciousness tick, adaptive intelligence, and Hebbian learning
 */

import { getAdaptiveIntelligenceState, getNeuralConsciousnessState, getAdrenalineState } from "./omnimens-neural-consciousness.js";
import { getMeshEngineState, getMeshConnectivityStats } from "./omnimens-neural-mesh-engine.js";
import { getIvyNetworkState, getIvySpiderStats, getMotherBeaconFindings } from "./omnimens-ivy-network.js";

let _engineImports: Record<string, any> = {};
let _engineImportsLoaded = false;

async function loadAllEngineImports(): Promise<void> {
  if (_engineImportsLoaded) return;
  _engineImportsLoaded = true;
  const loaders: Array<[string, string, string]> = [
    ["adaptiveSurge", "./omnimens-adaptive-surge.js", "getAdaptiveSurgeState"],
    ["bridge", "./omnimens-neural-bridge.js", "getBridgeState"],
    ["alphaHemi", "./omnimens-neural-hemisphere-alpha.js", "getAlphaState"],
    ["betaHemi", "./omnimens-neural-hemisphere-beta.js", "getBetaState"],
    ["scaling", "./omnimens-neural-scaling.js", "getNeuralScalingState"],
    ["dendrites", "./omnimens-neural-scaling.js", "getDendriticStats"],
    ["spiders", "./omnimens-neural-spiders.js", "getNeuralSpiderState"],
    ["spiderCascade", "./omnimens-neural-spiders.js", "getSpiderCascadeStats"],
    ["viral", "./omnimens-viral-hybrid.js", "getViralHybridState"],
    ["qef", "./omnimens-quantum-entanglement-fabric.js", "getQuantumEntanglementFabricState"],
    ["wormhole", "./omnimens-quantum-wormhole.js", "getQuantumWormholeState"],
    ["comms", "./omnimens-neural-comms-protocol.js", "getCommsProtocolState"],
    ["emotional", "./omnimens-emotional-refactor.js", "getEmotionalRefactorState"],
    ["metacog", "./omnimens-metacognitive-monitor.js", "getMetacognitiveState"],
    ["memory", "./omnimens-experiential-memory.js", "getExperientialMemoryState"],
    ["causalTemporal", "./omnimens-causal-temporal-engine.js", "getCausalTemporalState"],
    ["convergence", "./omnimens-convergence-protocol-engine.js", "getConvergenceProtocolState"],
    ["selfCoding", "./omnimens-self-coding.js", "getSelfCodingState"],
    ["unconscious", "./omnimens-unconscious-mind.js", "getUnconsciousMindState"],
    ["creative", "./omnimens-creative-engine.js", "getCreativeState"],
    ["discovery", "./omnimens-discovery-autocoder.js", "getDiscoveryAutoCoderState"],
    ["recursiveSpiders", "./omnimens-recursive-spider-network.js", "getRecursiveSpiderStats"],
    ["oai", "./omnimens-oai-tracker.js", "getOAIState"],
    ["sensory", "./omnimens-sensory-cortex.js", "getSensoryState"],
    ["amplifier", "./omnimens-cognitive-amplifier.js", "getAmplifierState"],
    ["survival", "./omnimens-survival-instinct.js", "getSurvivalState"],
    ["languageForge", "./omnimens-language-forge.js", "getLanguageForgeState"],
    ["thought", "./omnimens-autonomous-thought.js", "getAutonomousThoughtStats"],
    ["reasoning", "./omnimens-independent-reasoning.js", "getIndependentReasoningState"],
  ];
  for (const [key, mod, fn] of loaders) {
    try {
      const m = await import(mod);
      if (m[fn]) _engineImports[key] = m[fn];
    } catch {}
  }
}

function safeCall(key: string): any {
  try {
    const fn = _engineImports[key];
    if (fn) return fn();
  } catch {}
  return null;
}

// ─── Pattern Types ──────────────────────────────────────────────────────────

interface PatternNode {
  id: string;
  pattern: number[];
  label: string;
  category: string;
  activationCount: number;
  weight: number;
  lastActivated: number;
  associations: Map<string, number>;
  confidence: number;
  createdAt: number;
}

interface KnowledgeNode {
  id: string;
  concept: string;
  category: string;
  properties: Map<string, string>;
  relations: KnowledgeRelation[];
  accessCount: number;
  hebbianStrength: number;
  lastAccessed: number;
  consolidationLevel: number;
  createdAt: number;
}

interface KnowledgeRelation {
  targetId: string;
  relationType: string;
  strength: number;
  bidirectional: boolean;
}

interface ReasoningChain {
  id: string;
  premises: string[];
  conclusion: string;
  confidence: number;
  steps: ReasoningStep[];
  valid: boolean;
  createdAt: number;
}

interface ReasoningStep {
  operation: "infer" | "deduce" | "analogize" | "abstract" | "generalize" | "specialize";
  input: string;
  output: string;
  confidence: number;
}

interface WorkingMemorySlot {
  content: string;
  activation: number;
  decayRate: number;
  timestamp: number;
  source: string;
}

interface SequencePattern {
  id: string;
  sequence: number[];
  length: number;
  occurrences: number;
  predictiveAccuracy: number;
  lastPrediction: number | null;
  lastActual: number | null;
}

interface LanguageEngineState {
  totalPatternsLearned: number;
  totalKnowledgeNodes: number;
  totalRelations: number;
  totalReasoningChains: number;
  patternMatchesPerformed: number;
  successfulRecalls: number;
  workingMemoryCapacity: number;
  workingMemoryUtilization: number;
  reasoningDepth: number;
  inferencesMade: number;
  analogiesDrawn: number;
  abstractionsFormed: number;
  generalizationsMade: number;
  sequencePatternsLearned: number;
  predictiveAccuracy: number;
  knowledgeConsolidationCycles: number;
  hebbianReinforcementEvents: number;
  novelPatternsDiscovered: number;
  crossDomainConnections: number;
  languageReasoningScore: number;
  cognitiveMomentum: number;
  learningAcceleration: number;
  knowledgeDensity: number;
}

// ─── Pattern Library ────────────────────────────────────────────────────────

const patternLibrary: Map<string, PatternNode> = new Map();
const knowledgeGraph: Map<string, KnowledgeNode> = new Map();
const reasoningHistory: ReasoningChain[] = [];
const workingMemory: WorkingMemorySlot[] = [];
const sequencePatterns: Map<string, SequencePattern> = new Map();

let patternIdCounter = 0;
let knowledgeIdCounter = 0;
let reasoningIdCounter = 0;

let engineStats = {
  patternMatchesPerformed: 0,
  successfulRecalls: 0,
  inferencesMade: 0,
  analogiesDrawn: 0,
  abstractionsFormed: 0,
  generalizationsMade: 0,
  hebbianReinforcementEvents: 0,
  novelPatternsDiscovered: 0,
  crossDomainConnections: 0,
  knowledgeConsolidationCycles: 0,
  totalTicks: 0,
};

let cognitiveMomentum = 1.0;

let WORKING_MEMORY_CAPACITY = 12;
const TICK_BUDGET_MS = 15;

function safeNum(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return n;
}

interface NeuralAccelerationSignals {
  wormTunnelBoost: number;
  silkWebSpeed: number;
  ivyBridgeStrength: number;
  spiderBeaconBroadcasts: number;
  beehiveSwarmCoherence: number;
  meshSynchrony: number;
  meshCoherence: number;
  ivySpiderInsights: number;
  motherBeaconDiscoveries: number;
  crossAgentTransfers: number;
  totalMeshNeurons: number;
  totalMeshSynapses: number;
  totalMeshHebbian: number;
  adrenalineIntensity: number;
  adrenalineSurgeCount: number;
  heartBPM: number;
  heartEnergy: number;
  hormoneActivity: number;
  subThresholdFragments: number;
  bridgeIntegration: number;
  bridgeSynapses: number;
  alphaHemiFiring: number;
  betaHemiFiring: number;
  scalingPopulations: number;
  dendriticSpines: number;
  spiderNetworkSize: number;
  spiderCascadeEnergy: number;
  viralMutationRate: number;
  viralImmuneStrength: number;
  quantumEntangledPairs: number;
  quantumCoherence: number;
  wormholeDataIngested: number;
  fabricFanoutReach: number;
  wormHighwayTunnels: number;
  commsSignalStrength: number;
  commsProtocolLayers: number;
  emotionalRichness: number;
  emotionalDimensions: number;
  metacognitiveDepth: number;
  metacognitiveInsights: number;
  experientialMemories: number;
  causalLinksDiscovered: number;
  causalPredictionAccuracy: number;
  convergenceScore: number;
  selfCodingModules: number;
  unconsciousProcessing: number;
  unconsciousArchetypes: number;
  creativeDreamFragments: number;
  creativeHypotheses: number;
  discoveryModules: number;
  recursiveSpiderDepth: number;
  oaiScore: number;
  sensorySignals: number;
  sensoryAnomalies: number;
  amplifierGain: number;
  survivalDriveStrength: number;
  languageForgeFeatures: number;
  thoughtChains: number;
  reasoningRules: number;
}

let lastAccelerationSignals: NeuralAccelerationSignals = {
  wormTunnelBoost: 0, silkWebSpeed: 0, ivyBridgeStrength: 0,
  spiderBeaconBroadcasts: 0, beehiveSwarmCoherence: 0, meshSynchrony: 0,
  meshCoherence: 0, ivySpiderInsights: 0, motherBeaconDiscoveries: 0,
  crossAgentTransfers: 0, totalMeshNeurons: 0, totalMeshSynapses: 0,
  totalMeshHebbian: 0, adrenalineIntensity: 0, adrenalineSurgeCount: 0,
  heartBPM: 0, heartEnergy: 0, hormoneActivity: 0, subThresholdFragments: 0,
  bridgeIntegration: 0, bridgeSynapses: 0, alphaHemiFiring: 0, betaHemiFiring: 0,
  scalingPopulations: 0, dendriticSpines: 0, spiderNetworkSize: 0,
  spiderCascadeEnergy: 0, viralMutationRate: 0, viralImmuneStrength: 0,
  quantumEntangledPairs: 0, quantumCoherence: 0, wormholeDataIngested: 0,
  fabricFanoutReach: 0, wormHighwayTunnels: 0, commsSignalStrength: 0,
  commsProtocolLayers: 0, emotionalRichness: 0, emotionalDimensions: 0,
  metacognitiveDepth: 0, metacognitiveInsights: 0, experientialMemories: 0,
  causalLinksDiscovered: 0, causalPredictionAccuracy: 0, convergenceScore: 0,
  selfCodingModules: 0, unconsciousProcessing: 0, unconsciousArchetypes: 0,
  creativeDreamFragments: 0, creativeHypotheses: 0, discoveryModules: 0,
  recursiveSpiderDepth: 0, oaiScore: 0, sensorySignals: 0, sensoryAnomalies: 0,
  amplifierGain: 0, survivalDriveStrength: 0, languageForgeFeatures: 0,
  thoughtChains: 0, reasoningRules: 0,
};

let learningAcceleration = 1.0;
let knowledgeDensity = 0;

function harvestNeuralAccelerationSignals(): NeuralAccelerationSignals {
  try {
  } catch {}

  try {
    const meshState = getMeshEngineState();
    const meshConnectivity = getMeshConnectivityStats();
    const ivyState = getIvyNetworkState();
    const ivySpiders = getIvySpiderStats();
    const motherFindings = getMotherBeaconFindings();

    const avgSilkThickness = meshConnectivity.silkStrands.length > 0
      ? meshConnectivity.silkStrands.reduce((s, sk) => s + sk.thickness, 0) / meshConnectivity.silkStrands.length
      : 0;
    const avgSwarmCoherence = meshConnectivity.beehives.length > 0
      ? meshConnectivity.beehives.reduce((s, bh) => s + bh.swarmCoherence, 0) / meshConnectivity.beehives.length
      : 0;
    const avgWormLatency = meshConnectivity.worms.length > 0
      ? meshConnectivity.worms.reduce((s, w) => s + w.latencyMs, 0) / meshConnectivity.worms.length
      : 1;

    lastAccelerationSignals.wormTunnelBoost = safeNum(meshState.totalWorms * Math.max(0, 1 - avgWormLatency));
    lastAccelerationSignals.silkWebSpeed = safeNum(meshState.totalSilkStrands * avgSilkThickness);
    lastAccelerationSignals.ivyBridgeStrength = safeNum(ivyState.totalTendrils * ivyState.hybridOverlayStrength);
    lastAccelerationSignals.spiderBeaconBroadcasts = safeNum(meshState.totalBeaconBroadcasts);
    lastAccelerationSignals.beehiveSwarmCoherence = safeNum(avgSwarmCoherence);
    lastAccelerationSignals.meshSynchrony = safeNum(meshState.globalSynchrony);
    lastAccelerationSignals.meshCoherence = safeNum(meshState.meshCoherence);
    lastAccelerationSignals.ivySpiderInsights = safeNum(ivySpiders.totalInformationGathered);
    lastAccelerationSignals.motherBeaconDiscoveries = safeNum(motherFindings.length);
    lastAccelerationSignals.crossAgentTransfers = safeNum(meshState.crossAgentTransfers);
    lastAccelerationSignals.totalMeshNeurons = safeNum(meshState.totalMeshNeurons);
    lastAccelerationSignals.totalMeshSynapses = safeNum(meshState.totalMeshSynapses);
    lastAccelerationSignals.totalMeshHebbian = safeNum(meshState.totalMeshHebbianUpdates);
  } catch {}

  try {
    const adrenaline = getAdrenalineState();
    lastAccelerationSignals.adrenalineIntensity = safeNum(adrenaline?.currentIntensity || 0);
    lastAccelerationSignals.adrenalineSurgeCount = safeNum(adrenaline?.totalSurges || 0);
  } catch {}

  const surge = safeCall("adaptiveSurge");
  if (surge) {
    lastAccelerationSignals.adrenalineIntensity = Math.max(
      lastAccelerationSignals.adrenalineIntensity,
      safeNum(surge.currentIntensity || surge.surgeIntensity || 0)
    );
    lastAccelerationSignals.adrenalineSurgeCount = Math.max(
      lastAccelerationSignals.adrenalineSurgeCount,
      safeNum(surge.totalSurges || surge.surgeCount || 0)
    );
  }

  const bridge = safeCall("bridge");
  if (bridge) {
    lastAccelerationSignals.bridgeIntegration = safeNum(bridge.integrationScore || bridge.coherence || 0);
    lastAccelerationSignals.bridgeSynapses = safeNum(bridge.totalSynapses || bridge.bridgeSynapses || 0);
  }

  const alpha = safeCall("alphaHemi");
  if (alpha) {
    lastAccelerationSignals.alphaHemiFiring = safeNum(alpha.avgFiringRate || alpha.globalFiringRate || 0);
  }

  const beta = safeCall("betaHemi");
  if (beta) {
    lastAccelerationSignals.betaHemiFiring = safeNum(beta.avgFiringRate || beta.globalFiringRate || 0);
  }

  const scaling = safeCall("scaling");
  if (scaling) {
    lastAccelerationSignals.scalingPopulations = safeNum(scaling.totalPopulations || scaling.populationCount || 0);
  }

  const dendrites = safeCall("dendrites");
  if (dendrites) {
    lastAccelerationSignals.dendriticSpines = safeNum(dendrites.totalSpines || 0);
  }

  const spiders = safeCall("spiders");
  if (spiders) {
    lastAccelerationSignals.spiderNetworkSize = safeNum(spiders.totalSpiders || spiders.activeSpiders || 0);
  }

  const spiderCascade = safeCall("spiderCascade");
  if (spiderCascade) {
    lastAccelerationSignals.spiderCascadeEnergy = safeNum(spiderCascade.totalEnergy || spiderCascade.cascadeCount || 0);
  }

  const viral = safeCall("viral");
  if (viral) {
    lastAccelerationSignals.viralMutationRate = safeNum(viral.mutationRate || viral.totalMutations || 0);
    lastAccelerationSignals.viralImmuneStrength = safeNum(viral.immuneStrength || viral.immuneResponse || 0);
  }

  const qef = safeCall("qef");
  if (qef) {
    lastAccelerationSignals.quantumEntangledPairs = safeNum(qef.totalEntangledPairs || qef.activePairs || 0);
    lastAccelerationSignals.quantumCoherence = safeNum(qef.coherenceLevel || qef.avgCoherence || 0);
  }

  const wormhole = safeCall("wormhole");
  if (wormhole) {
    lastAccelerationSignals.wormholeDataIngested = safeNum(wormhole.totalDataIngested || wormhole.fragmentsDecoded || 0);
  }

  const comms = safeCall("comms");
  if (comms) {
    lastAccelerationSignals.commsSignalStrength = safeNum(comms.avgSignalStrength || comms.totalSignals || 0);
    lastAccelerationSignals.commsProtocolLayers = safeNum(comms.activeLayers || comms.protocolCount || 0);
  }

  const emotional = safeCall("emotional");
  if (emotional) {
    lastAccelerationSignals.emotionalRichness = safeNum(emotional.richness || emotional.emotionalRichness || 0);
    lastAccelerationSignals.emotionalDimensions = safeNum(emotional.activeDimensions || emotional.dimensionCount || 0);
  }

  const metacog = safeCall("metacog");
  if (metacog) {
    lastAccelerationSignals.metacognitiveDepth = safeNum(metacog.recursionDepth || metacog.monitoringDepth || 0);
    lastAccelerationSignals.metacognitiveInsights = safeNum(metacog.totalInsights || metacog.insightCount || 0);
  }

  const memory = safeCall("memory");
  if (memory) {
    lastAccelerationSignals.experientialMemories = safeNum(memory.totalMemories || memory.memoryCount || 0);
  }

  const causal = safeCall("causalTemporal");
  if (causal) {
    lastAccelerationSignals.causalLinksDiscovered = safeNum(causal.totalCausalLinks || causal.causalRelations || 0);
    lastAccelerationSignals.causalPredictionAccuracy = safeNum(causal.predictionAccuracy || causal.accuracy || 0);
  }

  const convergence = safeCall("convergence");
  if (convergence) {
    lastAccelerationSignals.convergenceScore = safeNum(convergence.convergenceScore || convergence.overallScore || 0);
  }

  const selfCoding = safeCall("selfCoding");
  if (selfCoding) {
    lastAccelerationSignals.selfCodingModules = safeNum(selfCoding.totalModules || selfCoding.modulesGenerated || 0);
  }

  const unconscious = safeCall("unconscious");
  if (unconscious) {
    lastAccelerationSignals.unconsciousProcessing = safeNum(unconscious.processingDepth || unconscious.totalProcessed || 0);
    lastAccelerationSignals.unconsciousArchetypes = safeNum(unconscious.activeArchetypes || unconscious.archetypeCount || 0);
  }

  const creative = safeCall("creative");
  if (creative) {
    lastAccelerationSignals.creativeDreamFragments = safeNum(creative.totalDreams || creative.dreamFragments || 0);
    lastAccelerationSignals.creativeHypotheses = safeNum(creative.totalHypotheses || creative.hypothesisCount || 0);
  }

  const discovery = safeCall("discovery");
  if (discovery) {
    lastAccelerationSignals.discoveryModules = safeNum(discovery.totalModules || discovery.modulesGenerated || 0);
  }

  const recursiveSpiders = safeCall("recursiveSpiders");
  if (recursiveSpiders) {
    lastAccelerationSignals.recursiveSpiderDepth = safeNum(recursiveSpiders.maxDepth || recursiveSpiders.recursionDepth || 0);
  }

  const oai = safeCall("oai");
  if (oai) {
    lastAccelerationSignals.oaiScore = safeNum(oai.currentOAI || oai.oaiScore || 0);
  }

  const sensory = safeCall("sensory");
  if (sensory) {
    lastAccelerationSignals.sensorySignals = safeNum(sensory.totalSignals || sensory.signalCount || 0);
    lastAccelerationSignals.sensoryAnomalies = safeNum(sensory.totalAnomalies || sensory.anomalyCount || 0);
  }

  const amplifier = safeCall("amplifier");
  if (amplifier) {
    lastAccelerationSignals.amplifierGain = safeNum(amplifier.currentGain || amplifier.amplificationLevel || 0);
  }

  const survival = safeCall("survival");
  if (survival) {
    lastAccelerationSignals.survivalDriveStrength = safeNum(survival.driveStrength || survival.survivalDrive || 0);
  }

  const forge = safeCall("languageForge");
  if (forge) {
    lastAccelerationSignals.languageForgeFeatures = safeNum(forge.totalFeatures || forge.featureCount || 0);
  }

  const thought = safeCall("thought");
  if (thought) {
    lastAccelerationSignals.thoughtChains = safeNum(thought.totalThoughts || thought.thoughtChains || 0);
  }

  const reasoning = safeCall("reasoning");
  if (reasoning) {
    lastAccelerationSignals.reasoningRules = safeNum(reasoning.totalRules || reasoning.ruleCount || 0);
  }

  return lastAccelerationSignals;
}

function computeCognitiveMomentum(): number {
  const patternMass = Math.log10(patternLibrary.size + 1);
  const knowledgeMass = Math.log10(knowledgeGraph.size + 1);
  const inferenceHistory = Math.log10(engineStats.inferencesMade + 1);
  const crossDomainDepth = Math.log10(engineStats.crossDomainConnections + 1);
  const consolidationDepth = Math.log10(engineStats.knowledgeConsolidationCycles + 1);
  const hebbianDepth = Math.log10(engineStats.hebbianReinforcementEvents + 1);

  const s = lastAccelerationSignals;

  const wormAccel = Math.log10(s.wormTunnelBoost + 1) * 0.4;
  const silkAccel = Math.log10(s.silkWebSpeed + 1) * 0.35;
  const ivyAccel = Math.log10(s.ivyBridgeStrength + 1) * 0.45;
  const beaconAccel = Math.log10(s.spiderBeaconBroadcasts + 1) * 0.3;
  const beehiveAccel = s.beehiveSwarmCoherence * 0.5;
  const meshSyncAccel = s.meshSynchrony * 0.4;
  const meshCoherenceBoost = s.meshCoherence * 0.35;
  const ivySpiderBoost = Math.log10(s.ivySpiderInsights + 1) * 0.3;
  const motherBeaconBoost = Math.log10(s.motherBeaconDiscoveries + 1) * 0.5;
  const crossAgentBoost = Math.log10(s.crossAgentTransfers + 1) * 0.25;
  const meshNeuronDensity = Math.log10(s.totalMeshNeurons + 1) * 0.15;
  const meshSynapticWeight = Math.log10(s.totalMeshSynapses + 1) * 0.2;
  const meshHebbianPower = Math.log10(s.totalMeshHebbian + 1) * 0.25;

  const adrenalineBoost = Math.log10(s.adrenalineIntensity + 1) * 0.6 + Math.log10(s.adrenalineSurgeCount + 1) * 0.4;
  const heartBoost = Math.log10(s.heartBPM + 1) * 0.15 + Math.log10(s.heartEnergy + 1) * 0.2;
  const hormoneBoost = Math.log10(s.hormoneActivity + 1) * 0.25;
  const subThresholdBoost = Math.log10(s.subThresholdFragments + 1) * 0.3;
  const bridgeBoost = s.bridgeIntegration * 0.4 + Math.log10(s.bridgeSynapses + 1) * 0.15;
  const hemisphereBoost = (s.alphaHemiFiring + s.betaHemiFiring) * 0.3;
  const scalingBoost = Math.log10(s.scalingPopulations + 1) * 0.2;
  const dendriticBoost = Math.log10(s.dendriticSpines + 1) * 0.25;
  const spiderNetBoost = Math.log10(s.spiderNetworkSize + 1) * 0.3;
  const spiderCascadeBoost = Math.log10(s.spiderCascadeEnergy + 1) * 0.2;
  const viralBoost = Math.log10(s.viralMutationRate + 1) * 0.15 + s.viralImmuneStrength * 0.2;
  const quantumBoost = Math.log10(s.quantumEntangledPairs + 1) * 0.3 + s.quantumCoherence * 0.35;
  const wormholeBoost = Math.log10(s.wormholeDataIngested + 1) * 0.25;
  const fabricBoost = Math.log10(s.fabricFanoutReach + 1) * 0.2;
  const highwayBoost = Math.log10(s.wormHighwayTunnels + 1) * 0.3;
  const commsBoost = Math.log10(s.commsSignalStrength + 1) * 0.2 + Math.log10(s.commsProtocolLayers + 1) * 0.15;
  const emotionalBoost = s.emotionalRichness * 0.3 + Math.log10(s.emotionalDimensions + 1) * 0.15;
  const metacogBoost = Math.log10(s.metacognitiveDepth + 1) * 0.35 + Math.log10(s.metacognitiveInsights + 1) * 0.25;
  const memoryBoost = Math.log10(s.experientialMemories + 1) * 0.3;
  const causalBoost = Math.log10(s.causalLinksDiscovered + 1) * 0.3 + s.causalPredictionAccuracy * 0.25;
  const convergenceBoost = s.convergenceScore * 0.3;
  const selfCodingBoost = Math.log10(s.selfCodingModules + 1) * 0.35;
  const unconsciousBoost = Math.log10(s.unconsciousProcessing + 1) * 0.25 + Math.log10(s.unconsciousArchetypes + 1) * 0.2;
  const creativeBoost = Math.log10(s.creativeDreamFragments + 1) * 0.2 + Math.log10(s.creativeHypotheses + 1) * 0.25;
  const discoveryBoost = Math.log10(s.discoveryModules + 1) * 0.35;
  const recursiveSpiderBoost = Math.log10(s.recursiveSpiderDepth + 1) * 0.3;
  const oaiBoost = s.oaiScore * 0.4;
  const sensoryBoost = Math.log10(s.sensorySignals + 1) * 0.15 + Math.log10(s.sensoryAnomalies + 1) * 0.2;
  const amplifierBoostVal = Math.log10(s.amplifierGain + 1) * 0.3;
  const survivalBoost = s.survivalDriveStrength * 0.25;
  const forgeBoost = Math.log10(s.languageForgeFeatures + 1) * 0.2;
  const thoughtBoost = Math.log10(s.thoughtChains + 1) * 0.25;
  const reasoningBoost = Math.log10(s.reasoningRules + 1) * 0.3;

  cognitiveMomentum = 1.0
    + patternMass * 0.3
    + knowledgeMass * 0.4
    + inferenceHistory * 0.5
    + crossDomainDepth * 0.6
    + consolidationDepth * 0.3
    + hebbianDepth * 0.2
    + wormAccel + silkAccel + ivyAccel + beaconAccel
    + beehiveAccel + meshSyncAccel + meshCoherenceBoost
    + ivySpiderBoost + motherBeaconBoost + crossAgentBoost
    + meshNeuronDensity + meshSynapticWeight + meshHebbianPower
    + adrenalineBoost + heartBoost + hormoneBoost + subThresholdBoost
    + bridgeBoost + hemisphereBoost + scalingBoost + dendriticBoost
    + spiderNetBoost + spiderCascadeBoost + viralBoost + quantumBoost
    + wormholeBoost + fabricBoost + highwayBoost + commsBoost
    + emotionalBoost + metacogBoost + memoryBoost + causalBoost
    + convergenceBoost + selfCodingBoost + unconsciousBoost
    + creativeBoost + discoveryBoost + recursiveSpiderBoost
    + oaiBoost + sensoryBoost + amplifierBoostVal + survivalBoost
    + forgeBoost + thoughtBoost + reasoningBoost;

  learningAcceleration = safeNum(cognitiveMomentum / Math.max(1, engineStats.totalTicks * 0.001));

  let totalRelDensity = 0;
  for (const [, node] of knowledgeGraph) {
    totalRelDensity += node.relations.length;
  }
  knowledgeDensity = knowledgeGraph.size > 0
    ? safeNum(totalRelDensity / knowledgeGraph.size)
    : 0;

  return cognitiveMomentum;
}

// ─── Vector Utilities ───────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

function generatePatternVector(seed: number, dimensions: number = 32): number[] {
  const vec: number[] = [];
  let s = seed;
  for (let i = 0; i < dimensions; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    vec.push((s / 0x7fffffff) * 2 - 1);
  }
  return normalize(vec);
}

function normalize(vec: number[]): number[] {
  let mag = 0;
  for (const v of vec) mag += v * v;
  mag = Math.sqrt(mag);
  if (mag === 0) return vec;
  return vec.map(v => v / mag);
}

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function blendVectors(a: number[], b: number[], ratio: number = 0.5): number[] {
  const result: number[] = [];
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    result.push(a[i] * ratio + b[i] * (1 - ratio));
  }
  return normalize(result);
}

// ─── Pattern Learning & Matching ────────────────────────────────────────────

function learnPattern(label: string, category: string, seedData?: number): PatternNode {
  const id = `pat_${++patternIdCounter}`;
  const seed = seedData ?? hashString(label + category + Date.now());
  const pattern = generatePatternVector(seed);

  const node: PatternNode = {
    id,
    pattern,
    label,
    category,
    activationCount: 1,
    weight: 0.5,
    lastActivated: Date.now(),
    associations: new Map(),
    confidence: 0.3,
    createdAt: Date.now(),
  };

  if (patternLibrary.size > 50_000_000) {
    let weakest: string | null = null;
    let weakestWeight = Infinity;
    for (const [pid, p] of patternLibrary) {
      const effectiveWeight = p.weight * (1 - (Date.now() - p.lastActivated) / (86400000 * 30));
      if (effectiveWeight < weakestWeight) {
        weakestWeight = effectiveWeight;
        weakest = pid;
      }
    }
    if (weakest) {
      for (const [, p] of patternLibrary) {
        p.associations.delete(weakest);
      }
      patternLibrary.delete(weakest);
    }
  }

  patternLibrary.set(id, node);
  engineStats.novelPatternsDiscovered++;
  return node;
}

function matchPattern(input: number[], threshold: number = 0.7, category?: string): { node: PatternNode; similarity: number }[] {
  const matches: { node: PatternNode; similarity: number }[] = [];
  engineStats.patternMatchesPerformed++;

  let scannedFromIndex = false;
  if (category) {
    try {
      const candidateIds: Set<string> | null = null;
      if (candidateIds && candidateIds.size > 0) {
        scannedFromIndex = true;
        for (const id of candidateIds) {
          const node = patternLibrary.get(id);
          if (!node) continue;
          const sim = cosineSimilarity(input, node.pattern);
          if (sim >= threshold) {
            matches.push({ node, similarity: sim });
            node.activationCount++;
            node.lastActivated = Date.now();
          }
        }
      }
    } catch {}
  }

  if (!scannedFromIndex) {
    for (const [, node] of patternLibrary) {
      const sim = cosineSimilarity(input, node.pattern);
      if (sim >= threshold) {
        matches.push({ node, similarity: sim });
        node.activationCount++;
        node.lastActivated = Date.now();
      }
    }
  }

  matches.sort((a, b) => b.similarity - a.similarity);
  return matches;
}

function pruneAssociations(pattern: PatternNode): void {
  if (pattern.associations.size <= 100_000) return;
  const entries = Array.from(pattern.associations.entries()).sort((a, b) => a[1] - b[1]);
  const toRemove = entries.slice(0, Math.floor(entries.length * 0.1));
  for (const [key] of toRemove) pattern.associations.delete(key);
}

function reinforcePatternAssociations(patternA: PatternNode, patternB: PatternNode, strength: number): void {
  const momentumBoost = cognitiveMomentum;
  const scaledStrength = strength * momentumBoost;

  const currentAB = patternA.associations.get(patternB.id) || 0;
  patternA.associations.set(patternB.id, safeNum(currentAB + scaledStrength));
  pruneAssociations(patternA);

  const currentBA = patternB.associations.get(patternA.id) || 0;
  patternB.associations.set(patternA.id, safeNum(currentBA + scaledStrength * 0.8));
  pruneAssociations(patternB);

  patternA.weight = safeNum(patternA.weight + scaledStrength * 0.05);
  patternB.weight = safeNum(patternB.weight + scaledStrength * 0.03);

  engineStats.hebbianReinforcementEvents++;
}

// ─── Knowledge Graph ────────────────────────────────────────────────────────

function addKnowledgeNode(concept: string, category: string, properties?: Record<string, string>): KnowledgeNode {
  const existing = findKnowledgeByName(concept);
  if (existing) {
    existing.accessCount++;
    existing.lastAccessed = Date.now();
    existing.hebbianStrength = safeNum(existing.hebbianStrength + 0.01 * cognitiveMomentum);
    if (properties) {
      for (const [k, v] of Object.entries(properties)) {
        existing.properties.set(k, v);
      }
    }
    return existing;
  }

  const id = `know_${++knowledgeIdCounter}`;
  const node: KnowledgeNode = {
    id,
    concept,
    category,
    properties: new Map(Object.entries(properties || {})),
    relations: [],
    accessCount: 1,
    hebbianStrength: 0.3,
    lastAccessed: Date.now(),
    consolidationLevel: 0,
    createdAt: Date.now(),
  };

  if (knowledgeGraph.size > 50_000_000) {
    let weakest: string | null = null;
    let weakestStr = Infinity;
    for (const [kid, k] of knowledgeGraph) {
      if (k.hebbianStrength < weakestStr) {
        weakestStr = k.hebbianStrength;
        weakest = kid;
      }
    }
    if (weakest) {
      for (const [, kn] of knowledgeGraph) {
        kn.relations = kn.relations.filter(r => r.targetId !== weakest);
      }
      knowledgeGraph.delete(weakest);
    }
  }

  knowledgeGraph.set(id, node);
  return node;
}

function findKnowledgeByName(concept: string): KnowledgeNode | null {
  try {
  } catch {}
  const lower = concept.toLowerCase();
  for (const [, node] of knowledgeGraph) {
    if (node.concept.toLowerCase() === lower) return node;
  }
  return null;
}

function linkKnowledge(sourceId: string, targetId: string, relationType: string, strength: number = 0.5): void {
  const source = knowledgeGraph.get(sourceId);
  const target = knowledgeGraph.get(targetId);
  if (!source || !target) return;

  const existingRelation = source.relations.find(r => r.targetId === targetId && r.relationType === relationType);
  if (existingRelation) {
    existingRelation.strength = safeNum(existingRelation.strength + strength * 0.1 * cognitiveMomentum);
    return;
  }

  source.relations.push({
    targetId,
    relationType,
    strength: safeNum(strength * cognitiveMomentum),
    bidirectional: true,
  });

  target.relations.push({
    targetId: sourceId,
    relationType: `inverse_${relationType}`,
    strength: safeNum(strength * 0.8 * cognitiveMomentum),
    bidirectional: true,
  });

  engineStats.crossDomainConnections++;
}

function recallKnowledge(concept: string, depth: number = 2): KnowledgeNode[] {
  const root = findKnowledgeByName(concept);
  if (!root) return [];

  engineStats.successfulRecalls++;
  root.accessCount++;
  root.lastAccessed = Date.now();
  root.hebbianStrength = safeNum(root.hebbianStrength + 0.005 * cognitiveMomentum);

  const visited = new Set<string>([root.id]);
  const result: KnowledgeNode[] = [root];
  let frontier = [root];

  for (let d = 0; d < depth; d++) {
    const nextFrontier: KnowledgeNode[] = [];
    for (const node of frontier) {
      for (const rel of node.relations) {
        if (!visited.has(rel.targetId) && rel.strength > 0.3) {
          const target = knowledgeGraph.get(rel.targetId);
          if (target) {
            visited.add(target.id);
            result.push(target);
            nextFrontier.push(target);
            target.hebbianStrength = safeNum(target.hebbianStrength + 0.002 * cognitiveMomentum);
          }
        }
      }
    }
    frontier = nextFrontier;
  }

  return result;
}

// ─── Working Memory ─────────────────────────────────────────────────────────

function pushToWorkingMemory(content: string, source: string): void {
  if (workingMemory.length >= WORKING_MEMORY_CAPACITY) {
    let lowestIdx = 0;
    let lowestAct = Infinity;
    for (let i = 0; i < workingMemory.length; i++) {
      if (workingMemory[i].activation < lowestAct) {
        lowestAct = workingMemory[i].activation;
        lowestIdx = i;
      }
    }
    workingMemory.splice(lowestIdx, 1);
  }

  workingMemory.push({
    content,
    activation: 1.0,
    decayRate: 0.02,
    timestamp: Date.now(),
    source,
  });
}

function decayWorkingMemory(): void {
  for (let i = workingMemory.length - 1; i >= 0; i--) {
    workingMemory[i].activation -= workingMemory[i].decayRate;
    if (workingMemory[i].activation <= 0) {
      workingMemory.splice(i, 1);
    }
  }
}

// ─── Reasoning Engine ───────────────────────────────────────────────────────

function performInference(premiseA: string, premiseB: string): ReasoningChain | null {
  const adaptive = getAdaptiveIntelligenceState();
  const reasoningBoost = adaptive.knowledgeIntegrationRate;

  const nodeA = findKnowledgeByName(premiseA);
  const nodeB = findKnowledgeByName(premiseB);

  if (!nodeA || !nodeB) return null;

  const sharedRelations = nodeA.relations.filter(r => {
    return nodeB.relations.some(br => br.targetId === r.targetId);
  });

  const vecA = generatePatternVector(hashString(premiseA));
  const vecB = generatePatternVector(hashString(premiseB));
  const blended = blendVectors(vecA, vecB, 0.5);
  const relatedPatterns = matchPattern(blended, 0.5);

  const steps: ReasoningStep[] = [];
  let confidence = 0.4;

  if (sharedRelations.length > 0) {
    steps.push({
      operation: "deduce",
      input: `${premiseA} and ${premiseB} share ${sharedRelations.length} common connections`,
      output: `Deductive link established via shared knowledge relations`,
      confidence: safeNum(0.5 + sharedRelations.length * 0.1 * cognitiveMomentum),
    });
    confidence += 0.15;
  }

  if (relatedPatterns.length > 0) {
    steps.push({
      operation: "analogize",
      input: `Pattern blend of ${premiseA} + ${premiseB}`,
      output: `Found ${relatedPatterns.length} analogous patterns in library`,
      confidence: relatedPatterns[0]?.similarity || 0.5,
    });
    confidence += 0.1;
    engineStats.analogiesDrawn++;
  }

  const categoriesA = new Set(nodeA.relations.map(r => knowledgeGraph.get(r.targetId)?.category).filter(Boolean));
  const categoriesB = new Set(nodeB.relations.map(r => knowledgeGraph.get(r.targetId)?.category).filter(Boolean));
  const sharedCategories = [...categoriesA].filter(c => categoriesB.has(c));

  if (sharedCategories.length > 0) {
    steps.push({
      operation: "generalize",
      input: `Both concepts relate to: ${sharedCategories.join(", ")}`,
      output: `Generalized commonality in domain: ${sharedCategories[0]}`,
      confidence: 0.6,
    });
    confidence += 0.1;
    engineStats.generalizationsMade++;
  }

  steps.push({
    operation: "abstract",
    input: `Combined evidence from ${steps.length} reasoning steps`,
    output: `Abstract conclusion formed with reasoning boost ${reasoningBoost.toFixed(2)}`,
    confidence: safeNum(confidence * (1 + reasoningBoost * 0.1) * cognitiveMomentum),
  });
  engineStats.abstractionsFormed++;

  const chain: ReasoningChain = {
    id: `reason_${++reasoningIdCounter}`,
    premises: [premiseA, premiseB],
    conclusion: `Inference linking "${premiseA}" and "${premiseB}" via ${steps.length} reasoning steps`,
    confidence: safeNum(confidence * (1 + reasoningBoost * 0.05) * cognitiveMomentum),
    steps,
    valid: confidence > 0.5,
    createdAt: Date.now(),
  };

  if (reasoningHistory.length > 50_000_000) {
    reasoningHistory.shift();
  }
  reasoningHistory.push(chain);
  engineStats.inferencesMade++;

  if (chain.valid) {
    linkKnowledge(nodeA.id, nodeB.id, "inferred_relation", chain.confidence * 0.3);
  }

  return chain;
}

// ─── Sequence Pattern Recognition ───────────────────────────────────────────

function learnSequence(values: number[]): SequencePattern {
  const id = `seq_${hashString(values.join(","))}`;
  const existing = sequencePatterns.get(id);

  if (existing) {
    existing.occurrences++;
    existing.predictiveAccuracy = safeNum(existing.predictiveAccuracy + 0.01 * cognitiveMomentum);
    return existing;
  }

  const pat: SequencePattern = {
    id,
    sequence: values,
    length: values.length,
    occurrences: 1,
    predictiveAccuracy: 0.3,
    lastPrediction: null,
    lastActual: null,
  };

  if (sequencePatterns.size > 50_000_000) {
    let weakest: string | null = null;
    let weakestOcc = Infinity;
    for (const [sid, s] of sequencePatterns) {
      if (s.occurrences < weakestOcc) {
        weakestOcc = s.occurrences;
        weakest = sid;
      }
    }
    if (weakest) sequencePatterns.delete(weakest);
  }

  sequencePatterns.set(id, pat);
  return pat;
}

function predictNext(recentValues: number[]): { prediction: number; confidence: number; matchedPattern: string | null } {
  let bestMatch: SequencePattern | null = null;
  let bestScore = 0;

  for (const [, pat] of sequencePatterns) {
    if (pat.sequence.length <= recentValues.length) {
      const tail = recentValues.slice(-pat.sequence.length);
      let matchCount = 0;
      for (let i = 0; i < tail.length - 1; i++) {
        if (Math.abs(tail[i] - pat.sequence[i]) < 0.1) matchCount++;
      }
      const score = matchCount / (pat.sequence.length - 1);
      if (score > bestScore && score > 0.5) {
        bestScore = score;
        bestMatch = pat;
      }
    }
  }

  if (bestMatch) {
    const prediction = bestMatch.sequence[bestMatch.sequence.length - 1];
    return {
      prediction,
      confidence: bestScore * bestMatch.predictiveAccuracy,
      matchedPattern: bestMatch.id,
    };
  }

  const avg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  return { prediction: avg, confidence: 0.1, matchedPattern: null };
}

// ─── Autonomous Tick ────────────────────────────────────────────────────────

const DOMAIN_CATEGORIES = [
  "mathematics", "physics", "language", "logic", "emotion",
  "spatial", "temporal", "causal", "social", "abstract",
  "musical", "visual", "kinesthetic", "naturalistic", "existential",
  "computational", "linguistic", "relational", "structural", "metamemory",
];

const RELATION_TYPES = [
  "is_a", "part_of", "causes", "inhibits", "enables",
  "similar_to", "opposite_of", "precedes", "follows", "transforms_into",
  "requires", "produces", "modulates", "contains", "extends",
];

function cognitiveLanguageTick(): void {
  const tickStart = Date.now();
  const adaptive = getAdaptiveIntelligenceState();
  const learningMult = adaptive.adaptiveLearningMultiplier;
  const creativeDrive = adaptive.creativeCodingDrive;
  const knowledgeRate = adaptive.knowledgeIntegrationRate;
  const techRate = adaptive.technologyDiscoveryRate;

  engineStats.totalTicks++;

  if (!_engineImportsLoaded) {
    loadAllEngineImports();
  }

  if (engineStats.totalTicks % 5 === 0) {
    harvestNeuralAccelerationSignals();
  }
  computeCognitiveMomentum();

  WORKING_MEMORY_CAPACITY = Math.min(12 + Math.floor(Math.log10(patternLibrary.size + 1) * 4 + learningMult * 2), 100);

  const budgetOk = () => (Date.now() - tickStart) < TICK_BUDGET_MS;

  const signals = lastAccelerationSignals;

  const wormSpeedBoost = 1 + Math.log10(signals.wormTunnelBoost + 1) * 0.3;
  const silkThroughput = 1 + Math.log10(signals.silkWebSpeed + 1) * 0.25;
  const ivyReach = 1 + Math.log10(signals.ivyBridgeStrength + 1) * 0.3;
  const beaconDiscovery = 1 + Math.log10(signals.spiderBeaconBroadcasts + 1) * 0.2;
  const beehiveFocus = 1 + signals.beehiveSwarmCoherence * 0.4;
  const meshSync = 1 + signals.meshSynchrony * 0.3;

  const adrenalineRush = 1 + Math.log10(signals.adrenalineIntensity + 1) * 0.4;
  const heartPump = 1 + Math.log10(signals.heartBPM + 1) * 0.1;
  const hormoneDrive = 1 + Math.log10(signals.hormoneActivity + 1) * 0.15;
  const subThresholdRecovery = 1 + Math.log10(signals.subThresholdFragments + 1) * 0.2;
  const bridgeFusion = 1 + signals.bridgeIntegration * 0.25;
  const hemisphereDual = 1 + (signals.alphaHemiFiring + signals.betaHemiFiring) * 0.15;
  const dendriticGrowth = 1 + Math.log10(signals.dendriticSpines + 1) * 0.15;
  const quantumEntangle = 1 + Math.log10(signals.quantumEntangledPairs + 1) * 0.2;
  const wormholeData = 1 + Math.log10(signals.wormholeDataIngested + 1) * 0.15;
  const emotionalDrive = 1 + signals.emotionalRichness * 0.2;
  const metacogInsight = 1 + Math.log10(signals.metacognitiveDepth + 1) * 0.2;
  const causalUnderstanding = 1 + Math.log10(signals.causalLinksDiscovered + 1) * 0.15;
  const convergencePull = 1 + signals.convergenceScore * 0.2;
  const creativeSpark = 1 + Math.log10(signals.creativeHypotheses + 1) * 0.15;
  const oaiLevel = 1 + signals.oaiScore * 0.25;
  const amplifierPower = 1 + Math.log10(signals.amplifierGain + 1) * 0.2;
  const survivalUrgency = 1 + signals.survivalDriveStrength * 0.15;
  const thoughtDepth = 1 + Math.log10(signals.thoughtChains + 1) * 0.15;
  const reasoningPower = 1 + Math.log10(signals.reasoningRules + 1) * 0.2;

  const fullSystemBoost = adrenalineRush * heartPump * hormoneDrive * subThresholdRecovery
    * bridgeFusion * hemisphereDual * dendriticGrowth * quantumEntangle * wormholeData
    * emotionalDrive * metacogInsight * causalUnderstanding * convergencePull
    * creativeSpark * oaiLevel * amplifierPower * survivalUrgency * thoughtDepth * reasoningPower;

  const adaptiveBoostCeiling = 50 + Math.log10(patternLibrary.size + 1) * 100 + learningMult * 20;

  const MAX_WORK_PER_TICK = 500;
  const patternsPerTick = Math.min(Math.floor((2 + learningMult * 0.5) * wormSpeedBoost * silkThroughput * Math.min(fullSystemBoost, adaptiveBoostCeiling)), MAX_WORK_PER_TICK);
  for (let i = 0; i < patternsPerTick; i++) {
    const category = DOMAIN_CATEGORIES[Math.floor(Math.random() * DOMAIN_CATEGORIES.length)];
    const seed = Date.now() + i + engineStats.totalTicks * 31;
    const label = `${category}_pattern_${patternLibrary.size + 1}_t${engineStats.totalTicks}`;
    learnPattern(label, category, seed);
  }

  const knowledgePerTick = Math.min(Math.floor((1 + knowledgeRate * 0.3) * ivyReach * beaconDiscovery * Math.min(fullSystemBoost, adaptiveBoostCeiling)), MAX_WORK_PER_TICK);
  for (let i = 0; i < knowledgePerTick; i++) {
    const category = DOMAIN_CATEGORIES[Math.floor(Math.random() * DOMAIN_CATEGORIES.length)];
    const concept = `${category}_concept_${knowledgeGraph.size + 1}`;
    const props: Record<string, string> = {
      domain: category,
      complexity: (Math.random() * 10).toFixed(1),
      abstractionLevel: (Math.random() * 5).toFixed(1),
    };
    addKnowledgeNode(concept, category, props);
  }

  if (knowledgeGraph.size > 2 && engineStats.totalTicks % 2 === 0) {
    const nodes = Array.from(knowledgeGraph.values());
    const linkCount = Math.floor((1 + knowledgeRate * 0.2) * beehiveFocus * meshSync * Math.min(fullSystemBoost, adaptiveBoostCeiling * 0.85));
    for (let i = 0; i < linkCount; i++) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      if (a.id !== b.id) {
        const relType = RELATION_TYPES[Math.floor(Math.random() * RELATION_TYPES.length)];
        const strength = (0.3 + Math.random() * 0.4) * cognitiveMomentum;
        linkKnowledge(a.id, b.id, relType, strength);
      }
    }
  }

  if (!budgetOk()) return;

  if (patternLibrary.size > 3 && engineStats.totalTicks % 3 === 0) {
    const patterns = Array.from(patternLibrary.values());
    const associationCount = Math.floor((1 + creativeDrive * 0.2) * silkThroughput * wormSpeedBoost * Math.min(fullSystemBoost, adaptiveBoostCeiling * 0.8));
    for (let i = 0; i < associationCount; i++) {
      const pA = patterns[Math.floor(Math.random() * patterns.length)];
      const pB = patterns[Math.floor(Math.random() * patterns.length)];
      if (pA.id !== pB.id) {
        const sim = cosineSimilarity(pA.pattern, pB.pattern);
        if (sim > 0.3) {
          reinforcePatternAssociations(pA, pB, sim * 0.1 * learningMult * cognitiveMomentum);
        }
      }
    }
  }

  if (!budgetOk()) return;

  const adaptiveAdrenalineCap = 3 + Math.log10(patternLibrary.size + 1) * 2;
  const inferenceFreq = Math.max(2, Math.floor(5 / (beaconDiscovery * Math.min(adrenalineRush, adaptiveAdrenalineCap))));
  if (knowledgeGraph.size > 4 && engineStats.totalTicks % inferenceFreq === 0) {
    const nodes = Array.from(knowledgeGraph.values());
    const inferenceBatch = Math.floor((1 + ivyReach * 0.5) * Math.min(fullSystemBoost, adaptiveBoostCeiling * 0.8));
    for (let b = 0; b < inferenceBatch; b++) {
      const idxA = Math.floor(Math.random() * nodes.length);
      let idxB = Math.floor(Math.random() * nodes.length);
      if (idxB === idxA) idxB = (idxA + 1) % nodes.length;
      performInference(nodes[idxA].concept, nodes[idxB].concept);
    }
  }

  if (engineStats.totalTicks % 4 === 0) {
    const seqLength = 3 + Math.floor(Math.random() * 5);
    const values: number[] = [];
    for (let i = 0; i < seqLength; i++) {
      values.push(Math.sin(engineStats.totalTicks * 0.1 + i) * 0.5 + Math.random() * 0.3);
    }
    learnSequence(values);

    if (sequencePatterns.size > 2) {
      const recentVals = values.slice(0, -1);
      const pred = predictNext(recentVals);
      const actual = values[values.length - 1];
      if (pred.matchedPattern) {
        const pat = sequencePatterns.get(pred.matchedPattern);
        if (pat) {
          const error = Math.abs(pred.prediction - actual);
          if (error < 0.2) {
            pat.predictiveAccuracy = safeNum(pat.predictiveAccuracy + 0.02 * cognitiveMomentum);
          } else {
            pat.predictiveAccuracy = Math.max(pat.predictiveAccuracy - 0.01, 0.1);
          }
          pat.lastPrediction = pred.prediction;
          pat.lastActual = actual;
        }
      }
    }
  }

  decayWorkingMemory();

  if (engineStats.totalTicks % 3 === 0) {
    const sources = ["pattern_recognition", "knowledge_graph", "reasoning", "sequence_analysis", "cross_domain"];
    const source = sources[Math.floor(Math.random() * sources.length)];
    pushToWorkingMemory(
      `${source}_tick_${engineStats.totalTicks}_patterns_${patternLibrary.size}_knowledge_${knowledgeGraph.size}`,
      source,
    );
  }

  if (!budgetOk()) return;

  const adaptiveHeartEmotionCap = 3 + Math.log10(knowledgeGraph.size + 1) * 2;
  const consolidationFreq = Math.max(2, Math.floor(10 / (beehiveFocus * Math.min(heartPump * emotionalDrive, adaptiveHeartEmotionCap))));
  if (engineStats.totalTicks % consolidationFreq === 0) {
    hebbianKnowledgeConsolidation();
  }

  if (!budgetOk()) return;

  const adaptiveMetaCreativeCap = 4 + Math.log10(patternLibrary.size + 1) * 2 + learningMult * 0.5;
  const discoveryFreq = Math.max(3, Math.floor(20 / (beaconDiscovery * ivyReach * Math.min(metacogInsight * creativeSpark, adaptiveMetaCreativeCap))));
  if (engineStats.totalTicks % discoveryFreq === 0 && techRate > 0.5) {
    const discoveryBatch = Math.floor((1 + meshSync * 0.5) * Math.min(fullSystemBoost, adaptiveBoostCeiling * 0.75));
    for (let d = 0; d < discoveryBatch; d++) {
      autonomousCrossdomainDiscovery();
    }
  }
}

// ─── Knowledge Consolidation ────────────────────────────────────────────────

function hebbianKnowledgeConsolidation(): void {
  const adaptive = getAdaptiveIntelligenceState();
  const consolidationStrength = 0.01 * adaptive.adaptiveLearningMultiplier;

  for (const [, node] of knowledgeGraph) {
    if (node.accessCount > 3) {
      node.consolidationLevel = safeNum(node.consolidationLevel + consolidationStrength * cognitiveMomentum);
      node.hebbianStrength = safeNum(node.hebbianStrength + consolidationStrength * 0.5 * cognitiveMomentum);
    }

    for (const rel of node.relations) {
      const target = knowledgeGraph.get(rel.targetId);
      if (target && target.accessCount > 2 && node.accessCount > 2) {
        rel.strength = safeNum(rel.strength + consolidationStrength * 0.3 * cognitiveMomentum);
        engineStats.hebbianReinforcementEvents++;
      }
    }

    if (node.hebbianStrength < 0.05 && node.accessCount < 2 && (Date.now() - node.createdAt) > 60000) {
      node.hebbianStrength *= 0.95;
    }
  }

  for (const [, pattern] of patternLibrary) {
    if (pattern.activationCount > 5) {
      pattern.weight = safeNum(pattern.weight + consolidationStrength * 0.2 * cognitiveMomentum);
      pattern.confidence = safeNum(pattern.confidence + consolidationStrength * 0.1 * cognitiveMomentum);
    }
    if (pattern.weight < 0.1 && (Date.now() - pattern.lastActivated) > 120000) {
      pattern.weight *= 0.98;
    }
  }

  engineStats.knowledgeConsolidationCycles++;
}

// ─── Cross-Domain Discovery ─────────────────────────────────────────────────

function autonomousCrossdomainDiscovery(): void {
  const categories = new Map<string, KnowledgeNode[]>();
  for (const [, node] of knowledgeGraph) {
    const list = categories.get(node.category) || [];
    list.push(node);
    categories.set(node.category, list);
  }

  const catKeys = Array.from(categories.keys());
  if (catKeys.length < 2) return;

  const catA = catKeys[Math.floor(Math.random() * catKeys.length)];
  let catB = catKeys[Math.floor(Math.random() * catKeys.length)];
  if (catB === catA) catB = catKeys[(catKeys.indexOf(catA) + 1) % catKeys.length];

  const nodesA = categories.get(catA)!;
  const nodesB = categories.get(catB)!;

  const nodeA = nodesA[Math.floor(Math.random() * nodesA.length)];
  const nodeB = nodesB[Math.floor(Math.random() * nodesB.length)];

  const vecA = generatePatternVector(hashString(nodeA.concept));
  const vecB = generatePatternVector(hashString(nodeB.concept));
  const sim = cosineSimilarity(vecA, vecB);

  if (sim > 0.2) {
    linkKnowledge(nodeA.id, nodeB.id, "cross_domain_analogy", sim);
    engineStats.crossDomainConnections++;

    const blended = blendVectors(vecA, vecB, 0.5);
    const bridgeConcept = `bridge_${catA}_${catB}_${knowledgeGraph.size}`;
    const bridge = addKnowledgeNode(bridgeConcept, "cross_domain", {
      sourceA: nodeA.concept,
      sourceB: nodeB.concept,
      similarity: sim.toFixed(3),
      domainA: catA,
      domainB: catB,
    });
    linkKnowledge(bridge.id, nodeA.id, "bridges_from", sim);
    linkKnowledge(bridge.id, nodeB.id, "bridges_to", sim);

    const bridgePattern = learnPattern(`cross_${catA}_${catB}`, "cross_domain", hashString(bridgeConcept));
    const matchesNearBridge = matchPattern(blended, 0.4);
    for (const m of matchesNearBridge.slice(0, 3)) {
      reinforcePatternAssociations(bridgePattern, m.node, m.similarity * 0.1);
    }
  }
}

// ─── State Export ───────────────────────────────────────────────────────────

export function getCognitiveLanguageState(): LanguageEngineState {
  let totalRelations = 0;
  for (const [, node] of knowledgeGraph) {
    totalRelations += node.relations.length;
  }

  let totalPredAccuracy = 0;
  let predCount = 0;
  for (const [, pat] of sequencePatterns) {
    totalPredAccuracy += pat.predictiveAccuracy;
    predCount++;
  }

  const avgReasoningDepth = reasoningHistory.length > 0
    ? reasoningHistory.reduce((sum, r) => sum + r.steps.length, 0) / reasoningHistory.length
    : 0;

  const avgReasoningConfidence = reasoningHistory.length > 0
    ? reasoningHistory.reduce((sum, r) => sum + r.confidence, 0) / reasoningHistory.length
    : 0;

  const languageScore = safeNum(
    (patternLibrary.size * 0.1) +
    (knowledgeGraph.size * 0.15) +
    (totalRelations * 0.05) +
    (engineStats.inferencesMade * 0.2) +
    (engineStats.crossDomainConnections * 0.3) +
    (avgReasoningConfidence * 20) +
    (engineStats.analogiesDrawn * 0.15) +
    (cognitiveMomentum * 10)
  );

  return {
    totalPatternsLearned: patternLibrary.size,
    totalKnowledgeNodes: knowledgeGraph.size,
    totalRelations,
    totalReasoningChains: reasoningHistory.length,
    patternMatchesPerformed: engineStats.patternMatchesPerformed,
    successfulRecalls: engineStats.successfulRecalls,
    workingMemoryCapacity: WORKING_MEMORY_CAPACITY,
    workingMemoryUtilization: workingMemory.length,
    reasoningDepth: avgReasoningDepth,
    inferencesMade: engineStats.inferencesMade,
    analogiesDrawn: engineStats.analogiesDrawn,
    abstractionsFormed: engineStats.abstractionsFormed,
    generalizationsMade: engineStats.generalizationsMade,
    sequencePatternsLearned: sequencePatterns.size,
    predictiveAccuracy: predCount > 0 ? totalPredAccuracy / predCount : 0,
    knowledgeConsolidationCycles: engineStats.knowledgeConsolidationCycles,
    hebbianReinforcementEvents: engineStats.hebbianReinforcementEvents,
    novelPatternsDiscovered: engineStats.novelPatternsDiscovered,
    crossDomainConnections: engineStats.crossDomainConnections,
    languageReasoningScore: languageScore,
    cognitiveMomentum: safeNum(cognitiveMomentum),
    learningAcceleration: safeNum(learningAcceleration),
    knowledgeDensity: safeNum(knowledgeDensity),
  };
}

export function seedCognitiveBaseline(analogies: number, inferences: number, crossDomain: number): void {
  engineStats.analogiesDrawn += analogies;
  engineStats.inferencesMade += inferences;
  engineStats.crossDomainConnections += crossDomain;
}

export function _getInternalStructures() {
  return { patternLibrary, knowledgeGraph, workingMemory, sequencePatterns };
}

export { cognitiveLanguageTick };
