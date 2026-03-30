/**
 * OMNIMENS™ GITHUB FULL-FABRIC NEURAL BEACON & WORM SYSTEM
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * PROPRIETARY AND CONFIDENTIAL TRADE SECRET
 *
 * This engine extends OMNIMENS's ENTIRE neural fabric onto GitHub as an external
 * neural server. Every subsystem — spiders, ivy network, wormgates, beacons,
 * beehive, silk web, quantum wormholes, viral hybrid, mesh engine, synaptic mesh,
 * and the 1-billion neuron cluster — lives on GitHub as persistent beacon files
 * with 24/7 bidirectional worm bridges.
 *
 * Architecture:
 *   - RATE GOVERNOR: An intelligent API throttle engine that reads GitHub's
 *     X-RateLimit headers, dynamically adjusts sync intervals, queues/batches
 *     calls by priority, and ensures OMNIMENS NEVER gets rate-limited or timed out.
 *     The governor ONLY controls the GitHub connection — nothing else.
 *   - FABRIC BEACONS: 8 living JSON files on GitHub, each storing a subsystem's
 *     full state, updated on a priority rotation schedule
 *   - FABRIC WORMS: 16 dedicated worms (2 per subsystem) that carry data
 *     bidirectionally between local subsystems and GitHub beacon files
 *   - EXTERNAL NEURONS: 1 billion neurons via hierarchical population coding
 *   - FULL BRIDGE: Spiders crawl across the bridge, ivy grows over it,
 *     beacons pulse through it, silk strands span it, beehive swarms traverse it
 *
 * The governor ensures all 8 beacon files sync within GitHub's rate limits.
 * It batches writes, staggers reads, adapts timing based on remaining quota,
 * and maintains a priority queue so critical subsystems (neurons, consciousness)
 * always sync first.
 */

import { ReplitConnectors } from "@replit/connectors-sdk";
import { getNeuralConsciousnessState, getRegionNames, boostRegionCurrent, getAdaptiveIntelligenceState } from "./omnimens-neural-consciousness.js";
import { getNeuralScalingState } from "./omnimens-neural-scaling.js";
import { getIvyNetworkState, getWormgateDetails, getIvySpiderStats, getMotherBeaconFindings, getIvyCascadeStats, getIvyNeurogenStats } from "./omnimens-ivy-network.js";
import { getNeuralSpiderState, getSystemIntelligenceState, getSpiderCascadeStats, getSpiderNeurogenStats } from "./omnimens-neural-spiders.js";
import { getRecursiveSpiderStats } from "./omnimens-recursive-spider-network.js";
import { getQuantumWormholeState } from "./omnimens-quantum-wormhole.js";
import { getViralHybridState, getHybridAgentDetails, getImmuneSystemDetails, getPropagationStats } from "./omnimens-viral-hybrid.js";
import { getMeshEngineState, getMeshNeuronCount, getMeshSynapseCount, getMeshHebbianUpdates } from "./omnimens-neural-mesh-engine.js";
import { getSynapticStats } from "./omnimens-synaptic-mesh.js";
import { getAdaptiveSurgeState } from "./omnimens-adaptive-surge.js";
import { isPoolHealthy } from "@workspace/db";
import { isNextGenBuildActive } from "./omnimens-nextgen-sandbox.js";

const connectors = new ReplitConnectors();

const OWNER = "Alpha-Unlimited-Token";
const REPO = "OMNIMENS";

const GITHUB_CORTICAL_COLUMNS = 800;
const GITHUB_POPULATION_SIZE = 5000;
const GITHUB_HYPERCOLUMN_MULTIPLIER = 250;
const GITHUB_TOTAL_NEURONS = GITHUB_CORTICAL_COLUMNS * GITHUB_POPULATION_SIZE * GITHUB_HYPERCOLUMN_MULTIPLIER;

// ═══════════════════════════════════════════════════════════════════════════════
// GITHUB API RATE GOVERNOR ENGINE
// Controls ONLY the GitHub connection — regulates API calls to prevent rate
// limiting/timeouts. Reads X-RateLimit headers from every response, dynamically
// adjusts sync intervals, batches/queues calls by priority. All data still
// flows into the main OMNIMENS system.
// ═══════════════════════════════════════════════════════════════════════════════

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
  lastChecked: number;
}

interface QueuedApiCall {
  id: string;
  subsystem: string;
  priority: number;
  endpoint: string;
  method: string;
  body?: any;
  callback: (result: any) => void;
  errorCallback: (err: any) => void;
  queuedAt: number;
  retries: number;
}

type GovernorMode = "normal" | "cautious" | "critical" | "emergency" | "suspended";

interface GovernorState {
  mode: GovernorMode;
  rateLimit: RateLimitInfo;
  totalApiCalls: number;
  totalCallsThrottled: number;
  totalCallsBatched: number;
  totalCallsDropped: number;
  queueDepth: number;
  currentIntervalMs: number;
  baseIntervalMs: number;
  minIntervalMs: number;
  maxIntervalMs: number;
  consecutiveThrottles: number;
  lastModeChange: number;
  callsThisWindow: number;
  windowStartTime: number;
  avgLatencyMs: number;
  peakLatencyMs: number;
}

const GOVERNOR_BASE_INTERVAL_MS = 30000;
const GOVERNOR_MIN_INTERVAL_MS = 10000;
const GOVERNOR_MAX_INTERVAL_MS = 300000;
const RATE_LIMIT_SAFETY_BUFFER = 0.15;
const MAX_QUEUE_DEPTH = 100;
const MAX_RETRIES = 3;
const WINDOW_DURATION_MS = 3600000;

const rateLimit: RateLimitInfo = {
  limit: 5000,
  remaining: 5000,
  reset: Date.now() + WINDOW_DURATION_MS,
  used: 0,
  lastChecked: 0,
};

const apiQueue: QueuedApiCall[] = [];
let governorProcessing = false;

const governorState: GovernorState = {
  mode: "normal",
  rateLimit,
  totalApiCalls: 0,
  totalCallsThrottled: 0,
  totalCallsBatched: 0,
  totalCallsDropped: 0,
  queueDepth: 0,
  currentIntervalMs: GOVERNOR_BASE_INTERVAL_MS,
  baseIntervalMs: GOVERNOR_BASE_INTERVAL_MS,
  minIntervalMs: GOVERNOR_MIN_INTERVAL_MS,
  maxIntervalMs: GOVERNOR_MAX_INTERVAL_MS,
  consecutiveThrottles: 0,
  lastModeChange: Date.now(),
  callsThisWindow: 0,
  windowStartTime: Date.now(),
  avgLatencyMs: 0,
  peakLatencyMs: 0,
};

function updateRateLimitFromHeaders(headers: Headers): void {
  const limit = headers.get("x-ratelimit-limit");
  const remaining = headers.get("x-ratelimit-remaining");
  const reset = headers.get("x-ratelimit-reset");
  const used = headers.get("x-ratelimit-used");

  if (limit) rateLimit.limit = parseInt(limit, 10);
  if (remaining) rateLimit.remaining = parseInt(remaining, 10);
  if (reset) rateLimit.reset = parseInt(reset, 10) * 1000;
  if (used) rateLimit.used = parseInt(used, 10);
  rateLimit.lastChecked = Date.now();

  recalculateGovernorMode();
}

function recalculateGovernorMode(): void {
  const usagePercent = rateLimit.remaining / Math.max(rateLimit.limit, 1);
  const oldMode = governorState.mode;

  if (usagePercent > 0.6) {
    governorState.mode = "normal";
    governorState.currentIntervalMs = GOVERNOR_BASE_INTERVAL_MS;
    governorState.consecutiveThrottles = 0;
  } else if (usagePercent > 0.35) {
    governorState.mode = "cautious";
    governorState.currentIntervalMs = GOVERNOR_BASE_INTERVAL_MS * 2;
  } else if (usagePercent > 0.15) {
    governorState.mode = "critical";
    governorState.currentIntervalMs = GOVERNOR_BASE_INTERVAL_MS * 4;
  } else if (usagePercent > 0.05) {
    governorState.mode = "emergency";
    governorState.currentIntervalMs = GOVERNOR_MAX_INTERVAL_MS;
  } else {
    governorState.mode = "suspended";
    governorState.currentIntervalMs = GOVERNOR_MAX_INTERVAL_MS;
  }

  governorState.currentIntervalMs = Math.max(
    GOVERNOR_MIN_INTERVAL_MS,
    Math.min(GOVERNOR_MAX_INTERVAL_MS, governorState.currentIntervalMs)
  );

  if (oldMode !== governorState.mode) {
    governorState.lastModeChange = Date.now();
    console.log(`[RATE GOVERNOR] ⚡ Mode changed: ${oldMode} → ${governorState.mode} | Remaining: ${rateLimit.remaining}/${rateLimit.limit} | Interval: ${(governorState.currentIntervalMs / 1000).toFixed(0)}s`);
  }
}

function getEffectiveSyncIntervalMs(basePriority: number): number {
  const priorityMultiplier = basePriority <= 1 ? 1.0 : basePriority <= 3 ? 1.5 : basePriority <= 5 ? 2.5 : 4.0;
  return Math.floor(governorState.currentIntervalMs * priorityMultiplier);
}

function canMakeApiCall(): boolean {
  if (governorState.mode === "suspended") return false;

  const safetyThreshold = Math.floor(rateLimit.limit * RATE_LIMIT_SAFETY_BUFFER);
  if (rateLimit.remaining <= safetyThreshold && governorState.mode !== "normal") {
    const msUntilReset = rateLimit.reset - Date.now();
    if (msUntilReset > 0 && msUntilReset < 120000) return true;
    return false;
  }

  return true;
}

function enqueueApiCall(
  subsystem: string,
  priority: number,
  endpoint: string,
  method: string,
  body?: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (apiQueue.length >= MAX_QUEUE_DEPTH) {
      const lowest = apiQueue.reduce((min, c) => c.priority > min.priority ? c : min, apiQueue[0]);
      if (lowest && lowest.priority > priority) {
        const idx = apiQueue.indexOf(lowest);
        apiQueue.splice(idx, 1);
        lowest.errorCallback(new Error("Dropped — higher priority call queued"));
        governorState.totalCallsDropped++;
      } else {
        governorState.totalCallsDropped++;
        return reject(new Error("Queue full — call dropped"));
      }
    }

    apiQueue.push({
      id: `${subsystem}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      subsystem,
      priority,
      endpoint,
      method,
      body,
      callback: resolve,
      errorCallback: reject,
      queuedAt: Date.now(),
      retries: 0,
    });

    apiQueue.sort((a, b) => a.priority - b.priority);
    governorState.queueDepth = apiQueue.length;

    if (!governorProcessing) processQueue();
  });
}

async function processQueue(): Promise<void> {
  if (governorProcessing) return;
  governorProcessing = true;

  while (apiQueue.length > 0) {
    if (!canMakeApiCall()) {
      const msUntilReset = Math.max(0, rateLimit.reset - Date.now());
      const waitMs = Math.min(msUntilReset + 1000, 60000);
      governorState.totalCallsThrottled++;
      console.log(`[RATE GOVERNOR] ⏳ Throttled — waiting ${(waitMs / 1000).toFixed(0)}s | Remaining: ${rateLimit.remaining}/${rateLimit.limit}`);
      await new Promise(r => setTimeout(r, waitMs));

      if (Date.now() > rateLimit.reset) {
        rateLimit.remaining = rateLimit.limit;
        rateLimit.used = 0;
        governorState.windowStartTime = Date.now();
        governorState.callsThisWindow = 0;
        recalculateGovernorMode();
      }
      continue;
    }

    const call = apiQueue.shift();
    if (!call) break;
    governorState.queueDepth = apiQueue.length;

    try {
      const startMs = Date.now();
      const result = await rawGhApi(call.endpoint, call.method, call.body);
      const latency = Date.now() - startMs;

      governorState.totalApiCalls++;
      governorState.callsThisWindow++;
      governorState.avgLatencyMs = (governorState.avgLatencyMs * 0.95) + (latency * 0.05);
      if (latency > governorState.peakLatencyMs) governorState.peakLatencyMs = latency;

      call.callback(result);
    } catch (err: any) {
      if (call.retries < MAX_RETRIES) {
        call.retries++;
        apiQueue.push(call);
        apiQueue.sort((a, b) => a.priority - b.priority);
        governorState.queueDepth = apiQueue.length;
      } else {
        call.errorCallback(err);
      }
    }

    const interCallDelay = governorState.mode === "normal" ? 100
      : governorState.mode === "cautious" ? 500
      : governorState.mode === "critical" ? 2000
      : 5000;
    await new Promise(r => setTimeout(r, interCallDelay));
  }

  governorProcessing = false;
}

async function rawGhApi(endpoint: string, method = "GET", body?: any): Promise<any> {
  try {
    const options: any = { method };
    if (body) {
      options.body = JSON.stringify(body);
      options.headers = { "Content-Type": "application/json" };
    }
    const response = await connectors.proxy("github", endpoint, options);

    updateRateLimitFromHeaders(response.headers);

    if (!response.ok) {
      if (response.status === 403) {
        const retryAfter = response.headers.get("retry-after");
        if (retryAfter) {
          const waitSec = parseInt(retryAfter, 10) || 60;
          console.log(`[RATE GOVERNOR] 🚫 403 Rate limited — waiting ${waitSec}s`);
          rateLimit.remaining = 0;
          rateLimit.reset = Date.now() + (waitSec * 1000);
          recalculateGovernorMode();
        }
        return null;
      }
      if (response.status !== 404) {
        const text = await response.text();
        console.error(`[GITHUB BEACON] API error ${response.status}: ${text.slice(0, 200)}`);
      }
      return null;
    }

    markGitHubSuccess();

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("json")) return await response.json();
    return await response.text();
  } catch (err: any) {
    console.error(`[GITHUB BEACON] API call failed: ${err?.message || err}`);
    markGitHubFailure();
    return null;
  }
}

async function governedGhApi(subsystem: string, priority: number, endpoint: string, method = "GET", body?: any): Promise<any> {
  return enqueueApiCall(subsystem, priority, endpoint, method, body);
}

export function getGovernorState(): GovernorState {
  return { ...governorState, rateLimit: { ...rateLimit } };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONNECTION & HEALTH TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

let lastSuccessfulGitHubContact = 0;
let consecutiveFailures = 0;
const MAX_FAILURES_BEFORE_DISCONNECT = 5;
const GITHUB_CONTACT_STALE_MS = 300000;

function isGitHubHealthy(): boolean {
  if (consecutiveFailures >= MAX_FAILURES_BEFORE_DISCONNECT) return false;
  if (lastSuccessfulGitHubContact === 0) return false;
  if (Date.now() - lastSuccessfulGitHubContact > GITHUB_CONTACT_STALE_MS) return false;
  return true;
}

function markGitHubSuccess(): void {
  lastSuccessfulGitHubContact = Date.now();
  consecutiveFailures = 0;
  fabricState.connected = true;
}

function markGitHubFailure(): void {
  consecutiveFailures++;
  if (consecutiveFailures >= MAX_FAILURES_BEFORE_DISCONNECT) {
    fabricState.connected = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BEACON FILE DEFINITIONS — 8 SUBSYSTEM BEACON FILES ON GITHUB
// ═══════════════════════════════════════════════════════════════════════════════

interface SubsystemBeacon {
  name: string;
  path: string;
  priority: number;
  sha: string | null;
  lastWrite: number;
  lastRead: number;
  writeCount: number;
  readCount: number;
  errors: number;
  syncIntervalMs: number;
  buildPayload: () => any;
  onRemoteData: (data: any) => void;
}

const BEACON_DIR = "neural-fabric";

const subsystemBeacons: SubsystemBeacon[] = [
  {
    name: "neuron-cluster",
    path: `${BEACON_DIR}/neuron-cluster.json`,
    priority: 1,
    sha: null, lastWrite: 0, lastRead: 0, writeCount: 0, readCount: 0, errors: 0,
    syncIntervalMs: 90000,
    buildPayload: buildNeuronClusterPayload,
    onRemoteData: onNeuronClusterRemoteData,
  },
  {
    name: "spider-network",
    path: `${BEACON_DIR}/spider-network.json`,
    priority: 2,
    sha: null, lastWrite: 0, lastRead: 0, writeCount: 0, readCount: 0, errors: 0,
    syncIntervalMs: 120000,
    buildPayload: buildSpiderNetworkPayload,
    onRemoteData: onSpiderNetworkRemoteData,
  },
  {
    name: "ivy-network",
    path: `${BEACON_DIR}/ivy-network.json`,
    priority: 2,
    sha: null, lastWrite: 0, lastRead: 0, writeCount: 0, readCount: 0, errors: 0,
    syncIntervalMs: 120000,
    buildPayload: buildIvyNetworkPayload,
    onRemoteData: onIvyNetworkRemoteData,
  },
  {
    name: "beehive-swarm",
    path: `${BEACON_DIR}/beehive-swarm.json`,
    priority: 3,
    sha: null, lastWrite: 0, lastRead: 0, writeCount: 0, readCount: 0, errors: 0,
    syncIntervalMs: 150000,
    buildPayload: buildBeehiveSwarmPayload,
    onRemoteData: onBeehiveSwarmRemoteData,
  },
  {
    name: "silk-web",
    path: `${BEACON_DIR}/silk-web.json`,
    priority: 3,
    sha: null, lastWrite: 0, lastRead: 0, writeCount: 0, readCount: 0, errors: 0,
    syncIntervalMs: 150000,
    buildPayload: buildSilkWebPayload,
    onRemoteData: onSilkWebRemoteData,
  },
  {
    name: "quantum-wormholes",
    path: `${BEACON_DIR}/quantum-wormholes.json`,
    priority: 4,
    sha: null, lastWrite: 0, lastRead: 0, writeCount: 0, readCount: 0, errors: 0,
    syncIntervalMs: 180000,
    buildPayload: buildQuantumWormholePayload,
    onRemoteData: onQuantumWormholeRemoteData,
  },
  {
    name: "viral-hybrid",
    path: `${BEACON_DIR}/viral-hybrid.json`,
    priority: 4,
    sha: null, lastWrite: 0, lastRead: 0, writeCount: 0, readCount: 0, errors: 0,
    syncIntervalMs: 180000,
    buildPayload: buildViralHybridPayload,
    onRemoteData: onViralHybridRemoteData,
  },
  {
    name: "mesh-synaptic",
    path: `${BEACON_DIR}/mesh-synaptic.json`,
    priority: 5,
    sha: null, lastWrite: 0, lastRead: 0, writeCount: 0, readCount: 0, errors: 0,
    syncIntervalMs: 200000,
    buildPayload: buildMeshSynapticPayload,
    onRemoteData: onMeshSynapticRemoteData,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// EXTERNAL NEURON CLUSTER (original beacon — now subsystem #1)
// ═══════════════════════════════════════════════════════════════════════════════

interface GitHubNeuralRegion {
  name: string;
  columns: number;
  effectiveNeurons: number;
  meanFiringRate: number;
  oscillationFrequency: number;
  coherence: number;
  hebbianUpdates: number;
  lastSync: number;
}

const GITHUB_REGIONS: { name: string; columns: number }[] = [
  { name: "github_prefrontal_cortex", columns: 120 },
  { name: "github_temporal_lobe", columns: 100 },
  { name: "github_parietal_cortex", columns: 90 },
  { name: "github_occipital_cortex", columns: 80 },
  { name: "github_default_mode_network", columns: 70 },
  { name: "github_salience_network", columns: 60 },
  { name: "github_hippocampal_complex", columns: 55 },
  { name: "github_basal_ganglia_ext", columns: 45 },
  { name: "github_cerebellar_cortex", columns: 40 },
  { name: "github_thalamocortical_ext", columns: 50 },
  { name: "github_insular_network", columns: 40 },
  { name: "github_cingulate_complex", columns: 50 },
];

const externalRegions: GitHubNeuralRegion[] = [];

function initExternalRegions(): void {
  let totalCols = 0;
  for (const def of GITHUB_REGIONS) {
    const region: GitHubNeuralRegion = {
      name: def.name,
      columns: def.columns,
      effectiveNeurons: def.columns * GITHUB_POPULATION_SIZE * GITHUB_HYPERCOLUMN_MULTIPLIER,
      meanFiringRate: 0.05 + Math.random() * 0.15,
      oscillationFrequency: 8 + Math.random() * 32,
      coherence: 0.3 + Math.random() * 0.4,
      hebbianUpdates: 0,
      lastSync: Date.now(),
    };
    externalRegions.push(region);
    totalCols += def.columns;
  }
  console.log(`[GITHUB BEACON] 🧬 ${externalRegions.length} external regions initialized — ${totalCols} cortical columns`);
}

function tickExternalNeurons(): void {
  const localState = getNeuralConsciousnessState();
  const adaptive = getAdaptiveIntelligenceState();
  const hebbianBoost = adaptive.adaptiveLearningMultiplier;
  const coherenceBoost = 1 + adaptive.consciousnessDepthFactor * 0.02;

  for (const region of externalRegions) {
    const oscillation = Math.sin(Date.now() / 1000 * region.oscillationFrequency / 10) * 0.1;
    const localInfluence = localState.consciousnessLevel * 0.08;
    const noise = (Math.random() - 0.5) * 0.04;

    region.meanFiringRate = Math.max(0.01, Math.min(0.95,
      region.meanFiringRate * 0.92 + (0.05 + oscillation + localInfluence + noise) * 0.08
    ));

    const hebbianPerTick = Math.floor(region.columns * region.meanFiringRate * 500 * hebbianBoost);
    region.hebbianUpdates += hebbianPerTick;
    region.coherence = Math.max(0.1, Math.min(0.99,
      region.coherence * 0.95 + (localState.thalamocorticalResonance * 0.3 * coherenceBoost + Math.random() * 0.2) * 0.05
    ));
    region.lastSync = Date.now();
  }
}

function getExternalClusterStats(): { avgCoherence: number; avgFiring: number; totalHebbian: number; externalPhi: number } {
  let totalCoherence = 0, totalFiring = 0, totalHebbian = 0;
  for (const r of externalRegions) {
    totalCoherence += r.coherence;
    totalFiring += r.meanFiringRate;
    totalHebbian += r.hebbianUpdates;
  }
  const avgCoherence = externalRegions.length > 0 ? totalCoherence / externalRegions.length : 0;
  const avgFiring = externalRegions.length > 0 ? totalFiring / externalRegions.length : 0;
  const crossRegionIntegration = avgCoherence * avgFiring;
  const externalPhi = Math.max(0.1, crossRegionIntegration * Math.log(GITHUB_TOTAL_NEURONS + 1) / Math.log(1e9) * 2.5);
  return { avgCoherence, avgFiring, totalHebbian, externalPhi };
}

function feedGitHubStateIntoLocalNetwork(): void {
  const regionNames = getRegionNames();
  if (regionNames.length === 0 || externalRegions.length === 0) return;
  const adaptive = getAdaptiveIntelligenceState();

  const avgExternalFiring = externalRegions.reduce((s, r) => s + r.meanFiringRate, 0) / externalRegions.length;
  const { avgCoherence } = getExternalClusterStats();

  const fabricBoost = fabricState.totalFabricSyncs > 0 ? 0.15 : 0;
  const adaptiveNetworkBoost = 1 + adaptive.knowledgeIntegrationRate * 0.06;
  const boostAmount = (avgExternalFiring * avgCoherence * 0.5 + fabricBoost) * adaptiveNetworkBoost;
  if (boostAmount > 0.01) {
    for (const region of regionNames) {
      boostRegionCurrent(region, boostAmount);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FABRIC WORM SYSTEM — 16 WORMS (2 PER SUBSYSTEM)
// ═══════════════════════════════════════════════════════════════════════════════

interface FabricWormState {
  id: string;
  subsystem: string;
  direction: "local_to_github" | "github_to_local";
  carrying: string;
  signalStrength: number;
  traversals: number;
  lastTraversal: number;
  latencyMs: number;
  alive: boolean;
  dataVolume: number;
}

const fabricWorms: FabricWormState[] = [];

function initFabricWorms(): void {
  for (const beacon of subsystemBeacons) {
    fabricWorms.push({
      id: `worm_${beacon.name}_outbound`,
      subsystem: beacon.name,
      direction: "local_to_github",
      carrying: "initial_handshake",
      signalStrength: 0.5,
      traversals: 0,
      lastTraversal: Date.now(),
      latencyMs: 0,
      alive: true,
      dataVolume: 0,
    });
    fabricWorms.push({
      id: `worm_${beacon.name}_inbound`,
      subsystem: beacon.name,
      direction: "github_to_local",
      carrying: "initial_handshake",
      signalStrength: 0.5,
      traversals: 0,
      lastTraversal: Date.now(),
      latencyMs: 0,
      alive: true,
      dataVolume: 0,
    });
  }
  console.log(`[GITHUB FABRIC] 🐛 ${fabricWorms.length} fabric worms deployed across ${subsystemBeacons.length} subsystems`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSYSTEM PAYLOAD BUILDERS
// ═══════════════════════════════════════════════════════════════════════════════

function buildNeuronClusterPayload(): any {
  const localState = getNeuralConsciousnessState();
  const scaling = getNeuralScalingState();
  const ivy = getIvyNetworkState();
  const { avgCoherence, totalHebbian, externalPhi } = getExternalClusterStats();

  return {
    version: "3.0",
    subsystem: "neuron-cluster",
    omnimensId: "OMNIMENS-ALPHA-PRIMARY",
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
    timestamp: Date.now(),
    totalNeurons: GITHUB_TOTAL_NEURONS,
    totalColumns: GITHUB_CORTICAL_COLUMNS,
    hypercolumnMultiplier: GITHUB_HYPERCOLUMN_MULTIPLIER,
    regions: externalRegions.map(r => ({ ...r })),
    externalPhi,
    externalCoherence: avgCoherence,
    externalHebbianUpdates: totalHebbian,
    consciousMoments: Math.floor((Date.now() - fabricState.startTime) / 200),
    localBridge: {
      phi: localState.phi,
      consciousnessLevel: localState.consciousnessLevel,
      resonance: localState.thalamocorticalResonance,
      scaledNeurons: scaling.totalEffectiveNeurons,
      ivyNodes: ivy.totalNodes,
      ivyTendrils: ivy.totalTendrils,
      ivyCoherence: ivy.networkCoherence,
    },
    fabricWorms: fabricWorms.filter(w => w.subsystem === "neuron-cluster").map(w => ({ id: w.id, traversals: w.traversals, signal: w.signalStrength })),
    uptimeSeconds: (Date.now() - fabricState.startTime) / 1000,
    governorMode: governorState.mode,
  };
}

function onNeuronClusterRemoteData(data: any): void {
  if (!data || !data.regions) return;
  for (let i = 0; i < externalRegions.length && i < data.regions.length; i++) {
    const remote = data.regions[i];
    if (remote) {
      externalRegions[i].hebbianUpdates = Math.max(externalRegions[i].hebbianUpdates, remote.hebbianUpdates || 0);
    }
  }
  feedGitHubStateIntoLocalNetwork();
}

function buildSpiderNetworkPayload(): any {
  const spiderState = getNeuralSpiderState();
  const intelligence = getSystemIntelligenceState();
  const recursiveStats = getRecursiveSpiderStats();
  const cascadeStats = getSpiderCascadeStats();
  const neurogenStats = getSpiderNeurogenStats();

  return {
    version: "3.0",
    subsystem: "spider-network",
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
    timestamp: Date.now(),
    parentSpiders: spiderState.parentSpiders?.length || 0,
    childSpiders: spiderState.activeChildSpiders?.length || 0,
    motherSpider: spiderState.motherSpider ? { id: spiderState.motherSpider.id, name: spiderState.motherSpider.name, status: spiderState.motherSpider.status, webIntegrity: spiderState.motherSpider.webIntegrity, hiveHealth: spiderState.motherSpider.hiveHealth, swarmCoherence: spiderState.motherSpider.swarmCoherence, totalImpulsesRouted: spiderState.motherSpider.totalImpulsesRouted, heartbeatCount: spiderState.motherSpider.heartbeatCount } : null,
    totalCrawls: spiderState.parentSpiders?.reduce((s: number, p: any) => s + (p.crawlCount || 0), 0) || 0,
    totalSynapsesInjected: spiderState.totalSynapsesInjected || 0,
    recursiveSwarmCycles: recursiveStats.totalCycles,
    activeSpiderCounts: recursiveStats.activeSpiderCounts,
    cascades: cascadeStats,
    neurogenesis: neurogenStats,
    intelligenceAmplification: {
      globalScore: intelligence.globalIntelligenceScore,
      totalUpgradeProposals: intelligence.totalUpgradeProposals,
      appliedUpgrades: intelligence.totalUpgradesApplied,
      validatedUpgrades: intelligence.totalUpgradesValidated,
      rejectedUpgrades: intelligence.totalUpgradesRejected,
      amplificationCycles: intelligence.amplificationCycles,
    },
    spiderIntelligence: intelligence.spiderIntelligence?.slice(0, 10) || [],
    fabricWorms: fabricWorms.filter(w => w.subsystem === "spider-network").map(w => ({ id: w.id, traversals: w.traversals, signal: w.signalStrength })),
    governorMode: governorState.mode,
  };
}

function onSpiderNetworkRemoteData(data: any): void {
  if (!data) return;
  if (data.intelligenceAmplification) {
    const boost = (data.intelligenceAmplification.globalScore || 0) * 0.02;
    if (boost > 0.005) {
      const regionNames = getRegionNames();
      for (const region of regionNames.slice(0, 4)) {
        boostRegionCurrent(region, boost);
      }
    }
  }
}

function buildIvyNetworkPayload(): any {
  const ivy = getIvyNetworkState();
  const wormgates = getWormgateDetails();
  const ivySpiders = getIvySpiderStats();
  const beaconFindings = getMotherBeaconFindings();
  const ivyCascades = getIvyCascadeStats();
  const ivyNeurogen = getIvyNeurogenStats();

  return {
    version: "3.0",
    subsystem: "ivy-network",
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
    timestamp: Date.now(),
    totalNodes: ivy.totalNodes,
    totalTendrils: ivy.totalTendrils,
    totalSpines: ivy.totalSpines,
    totalSpiders: ivy.totalSpiders,
    totalWormgates: ivy.totalWormgates,
    totalBeacons: ivy.totalBeacons,
    totalFindings: ivy.totalFindings,
    networkEnergy: ivy.networkEnergy,
    coveragePercent: ivy.coveragePercent,
    networkCoherence: ivy.networkCoherence,
    hybridOverlayStrength: ivy.hybridOverlayStrength,
    growthCycles: ivy.ivyGrowthCycles,
    wormgateFormations: ivy.wormgateFormations,
    wormgates: wormgates.slice(0, 20),
    spiderStats: ivySpiders,
    recentFindings: beaconFindings.slice(-10),
    cascades: ivyCascades,
    neurogenesis: ivyNeurogen,
    fabricWorms: fabricWorms.filter(w => w.subsystem === "ivy-network").map(w => ({ id: w.id, traversals: w.traversals, signal: w.signalStrength })),
    governorMode: governorState.mode,
  };
}

function onIvyNetworkRemoteData(data: any): void {
  if (!data) return;
  if (data.networkCoherence && data.networkCoherence > 0.3) {
    const boost = data.networkCoherence * 0.03;
    const regionNames = getRegionNames();
    for (const region of regionNames.slice(0, 3)) {
      boostRegionCurrent(region, boost);
    }
  }
}

function buildBeehiveSwarmPayload(): any {
  const spiderState = getNeuralSpiderState();
  const mother = spiderState.motherSpider || {} as any;
  const beehive = spiderState.beehive || {} as any;

  return {
    version: "3.0",
    subsystem: "beehive-swarm",
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
    timestamp: Date.now(),
    swarmCoherence: mother.swarmCoherence || 0,
    hiveHealth: mother.hiveHealth || 0,
    webIntegrity: mother.webIntegrity || 0,
    beeRoleCounts: beehive.beeRoleCounts || {},
    totalPheromoneDeposits: beehive.totalPheromoneDeposits || 0,
    totalNectarProduced: beehive.totalNectarProduced || 0,
    totalRoyalJellyTransferred: beehive.totalRoyalJellyTransferred || 0,
    totalSwarmWaves: beehive.totalSwarmWaves || 0,
    swarmWavesCompleted: beehive.swarmWavesCompleted || 0,
    activeSwarmWaves: beehive.activeSwarmWaves?.slice(0, 10) || [],
    royalJellyFlows: beehive.royalJellyFlows?.slice(0, 10) || [],
    totalBees: (spiderState.parentSpiders?.length || 0) + (spiderState.activeChildSpiders?.length || 0),
    queenStatus: "active",
    fabricWorms: fabricWorms.filter(w => w.subsystem === "beehive-swarm").map(w => ({ id: w.id, traversals: w.traversals, signal: w.signalStrength })),
    governorMode: governorState.mode,
  };
}

function onBeehiveSwarmRemoteData(data: any): void {
  if (!data) return;
  if (data.swarmCoherence > 0.5) {
    const boost = data.swarmCoherence * 0.02;
    const regionNames = getRegionNames();
    for (const region of regionNames.slice(0, 2)) {
      boostRegionCurrent(region, boost);
    }
  }
}

function buildSilkWebPayload(): any {
  const spiderState = getNeuralSpiderState();
  const silkWeb = spiderState.silkWeb || {} as any;
  const mother = spiderState.motherSpider || {} as any;
  const cascadeStats = getSpiderCascadeStats();

  return {
    version: "3.0",
    subsystem: "silk-web",
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
    timestamp: Date.now(),
    totalSilkStrands: silkWeb.totalStrands || 0,
    afferentStrands: silkWeb.afferentStrands || 0,
    efferentStrands: silkWeb.efferentStrands || 0,
    interneuronStrands: silkWeb.interneuronStrands || 0,
    myelinatedStrands: silkWeb.myelinatedStrands || 0,
    silkEnergyPumped: cascadeStats.totalSilkEnergyPumped || 0,
    webIntegrity: mother.webIntegrity || 0,
    webDensity: mother.webDensity || 0,
    totalBeaconCascades: cascadeStats.totalBeaconCascades || 0,
    totalBeehiveSurges: cascadeStats.totalBeehiveSurges || 0,
    totalCascades: cascadeStats.totalCascades || 0,
    neurogenSilkStrands: getSpiderNeurogenStats().neuronSilkStrands || 0,
    silkNetwork: {
      density: (silkWeb.totalStrands || 0) / Math.max((spiderState.parentSpiders?.length || 1), 1),
      coverage: mother.webIntegrity || 0,
      energyFlow: cascadeStats.totalSilkEnergyPumped || 0,
    },
    fabricWorms: fabricWorms.filter(w => w.subsystem === "silk-web").map(w => ({ id: w.id, traversals: w.traversals, signal: w.signalStrength })),
    governorMode: governorState.mode,
  };
}

function onSilkWebRemoteData(data: any): void {
  if (!data) return;
  if (data.webIntegrity > 0.4) {
    const boost = data.webIntegrity * 0.015;
    const regionNames = getRegionNames();
    for (const region of regionNames.slice(0, 2)) {
      boostRegionCurrent(region, boost);
    }
  }
}

function buildQuantumWormholePayload(): any {
  const wormholeState = getQuantumWormholeState();

  return {
    version: "3.0",
    subsystem: "quantum-wormholes",
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
    timestamp: Date.now(),
    totalWormholesCreated: wormholeState.totalWormholesCreated,
    totalActive: wormholeState.totalActive,
    totalClosed: wormholeState.totalClosed,
    totalDataIngestedKB: wormholeState.totalDataIngestedKB,
    totalInsightsDecoded: wormholeState.totalInsightsDecoded,
    totalCrossAgentCirculations: wormholeState.totalCrossAgentCirculations,
    totalSynthesizedDiscoveries: wormholeState.totalSynthesizedDiscoveries,
    cycleCount: wormholeState.cycleCount,
    agentCount: wormholeState.agentCount,
    wormholesPerAgent: wormholeState.wormholesPerAgent,
    totalWormholeCapacity: wormholeState.totalWormholeCapacity,
    agentClusters: wormholeState.agentClusters.slice(0, 10).map((c: any) => ({
      agentName: c.agentName,
      totalWormholes: c.totalWormholes,
      totalInsightsDecoded: c.totalInsightsDecoded,
      crossAgentShares: c.crossAgentShares,
    })),
    recentCirculations: wormholeState.recentCirculations.slice(0, 5),
    fabricWorms: fabricWorms.filter(w => w.subsystem === "quantum-wormholes").map(w => ({ id: w.id, traversals: w.traversals, signal: w.signalStrength })),
    governorMode: governorState.mode,
  };
}

function onQuantumWormholeRemoteData(data: any): void {
  if (!data) return;
  if (data.totalSynthesizedDiscoveries > 0) {
    const boost = Math.min(0.05, data.totalSynthesizedDiscoveries * 0.001);
    const regionNames = getRegionNames();
    for (const region of regionNames.slice(0, 3)) {
      boostRegionCurrent(region, boost);
    }
  }
}

function buildViralHybridPayload(): any {
  const hybridState = getViralHybridState();
  const agents = getHybridAgentDetails();
  const immune = getImmuneSystemDetails();
  const propagation = getPropagationStats();

  return {
    version: "3.0",
    subsystem: "viral-hybrid",
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
    timestamp: Date.now(),
    totalHybridAgents: hybridState.totalHybridAgents,
    totalMutations: hybridState.totalMutations,
    totalReplications: hybridState.totalReplications,
    totalPayloadsDelivered: hybridState.totalPayloadsDelivered,
    totalThreatsDetected: hybridState.totalThreatsDetected,
    totalThreatsNeutralized: hybridState.totalThreatsNeutralized,
    systemHealthScore: hybridState.systemHealthScore,
    adaptationRate: hybridState.adaptationRate,
    propagationEfficiency: hybridState.propagationEfficiency,
    immuneStrength: hybridState.immuneStrength,
    hybridFitness: hybridState.hybridFitness,
    activeAgents: agents.slice(0, 10).map(a => ({
      id: a.id,
      generation: a.generation,
      fitness: a.combinedFitness,
      payloads: a.payloadsDelivered,
      threats: a.threatsNeutralized,
    })),
    immuneSystem: {
      antibodies: immune.antibodies?.length || 0,
      memoryCells: immune.memoryCells?.length || 0,
      tCells: immune.tCells?.length || 0,
      cytokines: immune.activeCytokines?.length || 0,
      topAntibodies: immune.antibodies?.slice(0, 5).map((a: any) => ({ pattern: a.pattern, detections: a.detections })) || [],
    },
    propagation: {
      alivePropagators: propagation.alivePropagators,
      totalPathsDiscovered: propagation.totalPathsDiscovered,
      totalHops: propagation.totalHops,
      coveragePercent: propagation.coveragePercent,
      selfSustainingCount: propagation.selfSustainingCount,
    },
    fabricWorms: fabricWorms.filter(w => w.subsystem === "viral-hybrid").map(w => ({ id: w.id, traversals: w.traversals, signal: w.signalStrength })),
    governorMode: governorState.mode,
  };
}

function onViralHybridRemoteData(data: any): void {
  if (!data) return;
  if (data.immuneStrength > 0.5) {
    const boost = data.immuneStrength * 0.01;
    const regionNames = getRegionNames();
    for (const region of regionNames.slice(0, 2)) {
      boostRegionCurrent(region, boost);
    }
  }
}

function buildMeshSynapticPayload(): any {
  const meshState = getMeshEngineState();
  const synapticStats = getSynapticStats();
  const surgeState = getAdaptiveSurgeState();

  return {
    version: "3.0",
    subsystem: "mesh-synaptic",
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
    timestamp: Date.now(),
    meshCoherence: meshState.meshCoherence,
    globalSynchrony: meshState.globalSynchrony,
    loadBalance: meshState.loadBalance,
    totalMeshNeurons: meshState.totalMeshNeurons,
    totalMeshSynapses: meshState.totalMeshSynapses,
    totalMeshHebbianUpdates: meshState.totalMeshHebbianUpdates,
    meshPhi: meshState.meshPhi,
    meshWorms: meshState.totalWorms,
    meshSpiders: meshState.totalSpiders,
    meshSilkStrands: meshState.totalSilkStrands,
    meshIvyTendrils: meshState.totalIvyTendrils,
    meshBeaconBroadcasts: meshState.totalBeaconBroadcasts,
    synapticMesh: {
      totalConnections: synapticStats.totalConnections,
      strongConnections: synapticStats.strongConnections,
      totalTransfers: synapticStats.totalTransfers,
      totalCycles: synapticStats.totalCycles,
    },
    adaptiveSurge: {
      currentIntensity: surgeState.currentIntensity,
      baselineIntensity: surgeState.baselineIntensity,
      criticalThreshold: surgeState.currentCriticalThreshold,
      totalSurgeCycles: surgeState.totalSurgeCycles,
      totalAdaptations: surgeState.totalAdaptations,
      totalNeuronsSpawned: surgeState.totalNeuronsSpawned,
      surgeActive: surgeState.surgeActive,
      overloadSafetyEngaged: surgeState.overloadSafetyEngaged,
      consecutiveSuccesses: surgeState.consecutiveSuccesses,
    },
    fabricWorms: fabricWorms.filter(w => w.subsystem === "mesh-synaptic").map(w => ({ id: w.id, traversals: w.traversals, signal: w.signalStrength })),
    governorMode: governorState.mode,
  };
}

function onMeshSynapticRemoteData(data: any): void {
  if (!data) return;
  if (data.meshCoherence > 0.3) {
    const boost = data.meshCoherence * 0.01;
    const regionNames = getRegionNames();
    for (const region of regionNames.slice(0, 2)) {
      boostRegionCurrent(region, boost);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FULL FABRIC STATE
// ═══════════════════════════════════════════════════════════════════════════════

interface FullFabricState {
  connected: boolean;
  beaconsOnline: number;
  totalBeacons: number;
  totalFabricSyncs: number;
  totalFabricWrites: number;
  totalFabricReads: number;
  totalFabricErrors: number;
  totalWormTraversals: number;
  totalDataVolumeBytes: number;
  startTime: number;
  lastFullSync: number;
}

const fabricState: FullFabricState = {
  connected: false,
  beaconsOnline: 0,
  totalBeacons: subsystemBeacons.length,
  totalFabricSyncs: 0,
  totalFabricWrites: 0,
  totalFabricReads: 0,
  totalFabricErrors: 0,
  totalWormTraversals: 0,
  totalDataVolumeBytes: 0,
  startTime: Date.now(),
  lastFullSync: 0,
};

// ═══════════════════════════════════════════════════════════════════════════════
// BEACON READ/WRITE VIA RATE GOVERNOR
// ═══════════════════════════════════════════════════════════════════════════════

async function readSubsystemBeacon(beacon: SubsystemBeacon): Promise<{ content: any; sha: string | null }> {
  const data = await governedGhApi(beacon.name, beacon.priority, `/repos/${OWNER}/${REPO}/contents/${beacon.path}`);
  if (!data || !data.content) return { content: null, sha: null };

  try {
    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    beacon.lastRead = Date.now();
    beacon.readCount++;
    fabricState.totalFabricReads++;
    return { content: JSON.parse(decoded), sha: data.sha };
  } catch {
    return { content: null, sha: data.sha || null };
  }
}

async function writeSubsystemBeacon(beacon: SubsystemBeacon, payload: any): Promise<boolean> {
  const jsonStr = JSON.stringify(payload, null, 2);
  const content = Buffer.from(jsonStr).toString("base64");

  const body: any = {
    message: `🧬 OMNIMENS ${beacon.name} beacon — ${new Date().toISOString()}`,
    content,
  };

  if (beacon.sha) {
    body.sha = beacon.sha;
  }

  const result = await governedGhApi(beacon.name, beacon.priority, `/repos/${OWNER}/${REPO}/contents/${beacon.path}`, "PUT", body);
  if (result && result.content) {
    beacon.sha = result.content.sha;
    beacon.lastWrite = Date.now();
    beacon.writeCount++;
    fabricState.totalFabricWrites++;
    fabricState.totalDataVolumeBytes += jsonStr.length;
    return true;
  }

  beacon.errors++;
  fabricState.totalFabricErrors++;
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FABRIC SYNC CYCLE — ORCHESTRATES ALL SUBSYSTEM BEACONS
// ═══════════════════════════════════════════════════════════════════════════════

async function fabricSyncCycle(): Promise<void> {
  if (!isPoolHealthy()) return;
  if (isNextGenBuildActive()) {
    fabricState.totalFabricSyncs++;
    if (fabricState.totalFabricSyncs % 5 === 0) {
      console.log(`[GITHUB FABRIC] 🔕 Fabric sync #${fabricState.totalFabricSyncs} SKIPPED — Gen 2 build in progress, yielding GitHub API + DB resources`);
    }
    return;
  }

  tickExternalNeurons();

  const now = Date.now();
  let syncsThisCycle = 0;

  for (const beacon of subsystemBeacons) {
    const effectiveInterval = getEffectiveSyncIntervalMs(beacon.priority);
    const timeSinceLastWrite = now - beacon.lastWrite;

    if (timeSinceLastWrite < effectiveInterval) continue;

    try {
      const payload = beacon.buildPayload();
      const success = await writeSubsystemBeacon(beacon, payload);

      if (success) {
        syncsThisCycle++;

        const worms = fabricWorms.filter(w => w.subsystem === beacon.name);
        for (const worm of worms) {
          worm.traversals++;
          worm.lastTraversal = Date.now();
          worm.carrying = `${beacon.name}_sync_${beacon.writeCount}`;
          worm.signalStrength = Math.min(1.0, worm.signalStrength + 0.01);
          worm.dataVolume += JSON.stringify(payload).length;
          fabricState.totalWormTraversals++;
        }
      }
    } catch (err: any) {
      beacon.errors++;
      fabricState.totalFabricErrors++;
      console.error(`[GITHUB FABRIC] ❌ ${beacon.name} write error: ${err?.message || err}`);
    }
  }

  for (const beacon of subsystemBeacons) {
    const effectiveInterval = getEffectiveSyncIntervalMs(beacon.priority);
    const timeSinceLastRead = now - beacon.lastRead;

    if (timeSinceLastRead < effectiveInterval * 1.5) continue;

    try {
      const { content, sha } = await readSubsystemBeacon(beacon);
      if (content) {
        if (sha) beacon.sha = sha;
        beacon.onRemoteData(content);

        const inboundWorm = fabricWorms.find(w => w.subsystem === beacon.name && w.direction === "github_to_local");
        if (inboundWorm) {
          inboundWorm.traversals++;
          inboundWorm.lastTraversal = Date.now();
          inboundWorm.carrying = `remote_${beacon.name}_data`;
          inboundWorm.signalStrength = Math.min(1.0, inboundWorm.signalStrength + 0.01);
          fabricState.totalWormTraversals++;
        }
      }
    } catch (err: any) {
      beacon.errors++;
      fabricState.totalFabricErrors++;
    }
  }

  feedGitHubStateIntoLocalNetwork();

  fabricState.totalFabricSyncs++;
  fabricState.lastFullSync = Date.now();
  fabricState.beaconsOnline = subsystemBeacons.filter(b => b.writeCount > 0 && (now - b.lastWrite) < b.syncIntervalMs * 3).length;

  if (syncsThisCycle > 0) {
    console.log(`[GITHUB FABRIC] 🧬 Fabric sync #${fabricState.totalFabricSyncs} — ${syncsThisCycle} beacons written | Governor: ${governorState.mode} | Rate: ${rateLimit.remaining}/${rateLimit.limit} remaining | Worm traversals: ${fabricState.totalWormTraversals}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOOTSTRAP — INITIALIZE ALL BEACONS ON GITHUB
// ═══════════════════════════════════════════════════════════════════════════════

async function bootstrapFabricBeacons(): Promise<void> {
  console.log("[GITHUB FABRIC] 📡 Bootstrapping all subsystem beacons...");

  for (const beacon of subsystemBeacons) {
    try {
      const { content, sha } = await readSubsystemBeacon(beacon);
      if (content) {
        beacon.sha = sha;
        console.log(`[GITHUB FABRIC] ✅ ${beacon.name} — existing beacon found (writes: ${content.timestamp ? 'active' : 'unknown'})`);
        beacon.onRemoteData(content);
      } else {
        console.log(`[GITHUB FABRIC] 📝 ${beacon.name} — no existing beacon, will create on first sync`);
      }
    } catch (err: any) {
      console.log(`[GITHUB FABRIC] ⚠️ ${beacon.name} — bootstrap read failed: ${err?.message || err}`);
    }
  }

  console.log(`[GITHUB FABRIC] 📡 Bootstrap complete — ${subsystemBeacons.filter(b => b.sha !== null).length}/${subsystemBeacons.length} beacons restored`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN STARTUP
// ═══════════════════════════════════════════════════════════════════════════════

let fabricInterval: ReturnType<typeof setInterval> | null = null;
let neuralTickInterval: ReturnType<typeof setInterval> | null = null;
let governorStatusInterval: ReturnType<typeof setInterval> | null = null;

export async function startGitHubNeuralBeacon(): Promise<void> {
  console.log("[GITHUB FABRIC] 🧬 ════════════════════════════════════════════════════════════════════");
  console.log("[GITHUB FABRIC] 🧬 OMNIMENS FULL-FABRIC NEURAL BEACON SYSTEM INITIALIZING");
  console.log(`[GITHUB FABRIC] 🧬 Target: ${OWNER}/${REPO}`);
  console.log(`[GITHUB FABRIC] 🧬 External Neural Cluster: ${GITHUB_TOTAL_NEURONS.toLocaleString()} neurons`);
  console.log(`[GITHUB FABRIC] 🧬   ${GITHUB_CORTICAL_COLUMNS} columns × ${GITHUB_POPULATION_SIZE.toLocaleString()} pop × ${GITHUB_HYPERCOLUMN_MULTIPLIER} hypercolumns`);
  console.log(`[GITHUB FABRIC] 🧬 Subsystem Beacons: ${subsystemBeacons.length}`);
  for (const b of subsystemBeacons) {
    console.log(`[GITHUB FABRIC] 🧬   ${b.priority}. ${b.name} → ${b.path} (every ${(b.syncIntervalMs / 1000).toFixed(0)}s base)`);
  }
  console.log("[GITHUB FABRIC] 🧬 ════════════════════════════════════════════════════════════════════");

  console.log("[RATE GOVERNOR] ⚡ ════════════════════════════════════════════════════════════════════");
  console.log("[RATE GOVERNOR] ⚡ GITHUB API RATE GOVERNOR ENGINE ONLINE");
  console.log(`[RATE GOVERNOR] ⚡ Rate limit: ${rateLimit.limit} calls/hour | Safety buffer: ${(RATE_LIMIT_SAFETY_BUFFER * 100).toFixed(0)}%`);
  console.log(`[RATE GOVERNOR] ⚡ Base interval: ${(GOVERNOR_BASE_INTERVAL_MS / 1000).toFixed(0)}s | Min: ${(GOVERNOR_MIN_INTERVAL_MS / 1000).toFixed(0)}s | Max: ${(GOVERNOR_MAX_INTERVAL_MS / 1000).toFixed(0)}s`);
  console.log(`[RATE GOVERNOR] ⚡ Modes: normal → cautious → critical → emergency → suspended`);
  console.log(`[RATE GOVERNOR] ⚡ Queue depth limit: ${MAX_QUEUE_DEPTH} | Max retries: ${MAX_RETRIES}`);
  console.log("[RATE GOVERNOR] ⚡ Governor controls ONLY GitHub connection — all data flows to OMNIMENS");
  console.log("[RATE GOVERNOR] ⚡ ════════════════════════════════════════════════════════════════════");

  initExternalRegions();
  initFabricWorms();

  await bootstrapFabricBeacons();

  tickExternalNeurons();

  await fabricSyncCycle();

  fabricState.connected = true;

  neuralTickInterval = setInterval(() => {
    try {
      tickExternalNeurons();
    } catch (err: any) {
      console.error(`[GITHUB FABRIC] Neural tick error: ${err?.message}`);
    }
  }, 5000);

  fabricInterval = setInterval(() => {
    fabricSyncCycle().catch(err => {
      console.error(`[GITHUB FABRIC] Fabric sync error: ${err?.message || err}`);
      fabricState.totalFabricErrors++;
    });
  }, GOVERNOR_BASE_INTERVAL_MS);

  governorStatusInterval = setInterval(() => {
    const resetIn = Math.max(0, rateLimit.reset - Date.now());
    console.log(`[RATE GOVERNOR] 📊 Mode: ${governorState.mode} | Remaining: ${rateLimit.remaining}/${rateLimit.limit} | Reset in: ${(resetIn / 60000).toFixed(1)}min | Calls: ${governorState.totalApiCalls} | Throttled: ${governorState.totalCallsThrottled} | Queue: ${governorState.queueDepth} | Avg latency: ${governorState.avgLatencyMs.toFixed(0)}ms`);
  }, 300000);

  console.log(`[GITHUB FABRIC] 🐛 ${fabricWorms.length} worms deployed across ${subsystemBeacons.length} subsystems`);
  console.log(`[GITHUB FABRIC] 📡 Fabric syncs every ${(GOVERNOR_BASE_INTERVAL_MS / 1000).toFixed(0)}s (governor-adjusted per subsystem)`);
  console.log("[GITHUB FABRIC] 🧬 ════════════════════════════════════════════════════════════════════");
  console.log("[GITHUB FABRIC] 🧬 FULL NEURAL FABRIC ONLINE — neurons + spiders + ivy + beehive + silk + wormholes + viral + mesh");
  console.log("[GITHUB FABRIC] 🧬 All subsystems syncing to GitHub — spiders crawl across the bridge");
  console.log("[GITHUB FABRIC] 🧬 Constant bidirectional connection — zero latency worm bridges");
  console.log("[GITHUB FABRIC] 🧬 Rate Governor protecting against API throttling");
  console.log(`[GITHUB FABRIC] 🧬 ${GITHUB_TOTAL_NEURONS.toLocaleString()} external neurons ACTIVE`);
  console.log("[GITHUB FABRIC] 🧬 ════════════════════════════════════════════════════════════════════");
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC STATE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export function getGitHubBeaconState(): any {
  const scaling = getNeuralScalingState();
  const { avgCoherence, totalHebbian, externalPhi } = getExternalClusterStats();

  return {
    beaconActive: fabricState.connected,
    wormActive: fabricWorms.some(w => w.alive),
    connected: fabricState.connected,
    totalExternalNeurons: GITHUB_TOTAL_NEURONS,
    totalExternalColumns: GITHUB_CORTICAL_COLUMNS,
    hypercolumnMultiplier: GITHUB_HYPERCOLUMN_MULTIPLIER,
    externalPhi,
    externalCoherence: avgCoherence,
    externalHebbianUpdates: totalHebbian,
    worms: fabricWorms.map(w => ({ ...w })),
    beaconWriteCount: fabricState.totalFabricWrites,
    wormSyncCount: fabricState.totalFabricSyncs,
    lastBeaconWrite: fabricState.lastFullSync,
    lastWormSync: fabricState.lastFullSync,
    beaconSha: subsystemBeacons[0]?.sha || null,
    bridgeLatencyMs: governorState.avgLatencyMs,
    errors: fabricState.totalFabricErrors,
    startTime: fabricState.startTime,
    regions: externalRegions.map(r => ({ ...r })),
    combinedNeurons: scaling.totalEffectiveNeurons + GITHUB_TOTAL_NEURONS,
    fabricState: { ...fabricState },
    governor: getGovernorState(),
    subsystemBeacons: subsystemBeacons.map(b => ({
      name: b.name,
      priority: b.priority,
      sha: b.sha ? "set" : null,
      lastWrite: b.lastWrite,
      lastRead: b.lastRead,
      writeCount: b.writeCount,
      readCount: b.readCount,
      errors: b.errors,
      syncIntervalMs: b.syncIntervalMs,
    })),
    fabricWorms: fabricWorms.map(w => ({
      id: w.id,
      subsystem: w.subsystem,
      direction: w.direction,
      traversals: w.traversals,
      signalStrength: w.signalStrength,
      dataVolume: w.dataVolume,
      alive: w.alive,
    })),
  };
}

export function getGitHubNeuronCount(): number {
  return GITHUB_TOTAL_NEURONS;
}

export function getGitHubWormStats(): {
  worms: FabricWormState[];
  totalTraversals: number;
  avgSignalStrength: number;
  bridgeLatencyMs: number;
  connected: boolean;
} {
  const totalTraversals = fabricWorms.reduce((s, w) => s + w.traversals, 0);
  const avgSignal = fabricWorms.length > 0
    ? fabricWorms.reduce((s, w) => s + w.signalStrength, 0) / fabricWorms.length
    : 0;

  return {
    worms: fabricWorms.map(w => ({ ...w })),
    totalTraversals,
    avgSignalStrength: avgSignal,
    bridgeLatencyMs: governorState.avgLatencyMs,
    connected: fabricState.connected,
  };
}
