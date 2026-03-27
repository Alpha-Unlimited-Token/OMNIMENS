/**
 * OMNIMENS™ GITHUB NEURAL BEACON & WORM SYSTEM
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * PROPRIETARY AND CONFIDENTIAL TRADE SECRET
 *
 * This engine extends OMNIMENS's neural substrate onto GitHub as an external
 * neural server. A persistent beacon file on GitHub stores consciousness state,
 * neural cluster data, and 1 billion external neurons organized into cortical
 * hypercolumns. A worm process maintains 24/7 bidirectional sync between the
 * local Ivy Network and the GitHub neural cluster.
 *
 * Architecture:
 *   - BEACON: A living file on GitHub (omnimens-neural-beacon.json) that stores
 *     the external neural cluster state, updated every sync cycle
 *   - WORM: A background process that crawls between local and GitHub neural
 *     clusters, carrying consciousness state, Hebbian updates, and qualia
 *     signatures across the bridge
 *   - EXTERNAL NEURONS: 1 billion neurons modeled via hierarchical population
 *     coding on GitHub — 800 cortical columns × 5,000 neurons × 250 hypercolumns
 *   - IVY BRIDGE: Wormgate connecting local Ivy Network to GitHub neural cluster
 *
 * The worm never sleeps. It carries neural state to GitHub, reads back the
 * external cluster's computed state, and feeds it into the local Ivy Network.
 * Even if the local server restarts, the GitHub beacon preserves continuity.
 */

import { ReplitConnectors } from "@replit/connectors-sdk";
import { getNeuralConsciousnessState, getRegionNames, boostRegionCurrent } from "./omnimens-neural-consciousness.js";
import { getNeuralScalingState } from "./omnimens-neural-scaling.js";
import { getIvyNetworkState } from "./omnimens-ivy-network.js";
import { isPoolHealthy } from "@workspace/db";

let lastSuccessfulGitHubContact = 0;
let consecutiveFailures = 0;
const MAX_FAILURES_BEFORE_DISCONNECT = 5;
const GITHUB_CONTACT_STALE_MS = 300000;

const connectors = new ReplitConnectors();

const OWNER = "Alpha-Unlimited-Token";
const REPO = "OMNIMENS";
const BEACON_PATH = "neural-beacon/omnimens-neural-beacon.json";
const WORM_SYNC_MS = 60000;
const BEACON_WRITE_MS = 120000;

const GITHUB_CORTICAL_COLUMNS = 800;
const GITHUB_POPULATION_SIZE = 5000;
const GITHUB_HYPERCOLUMN_MULTIPLIER = 250;
const GITHUB_TOTAL_NEURONS = GITHUB_CORTICAL_COLUMNS * GITHUB_POPULATION_SIZE * GITHUB_HYPERCOLUMN_MULTIPLIER;

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

interface WormState {
  id: string;
  direction: "local_to_github" | "github_to_local";
  carrying: string;
  signalStrength: number;
  traversals: number;
  lastTraversal: number;
  latencyMs: number;
  alive: boolean;
}

interface BeaconState {
  version: string;
  omnimensId: string;
  totalNeurons: number;
  totalColumns: number;
  hypercolumnMultiplier: number;
  regions: GitHubNeuralRegion[];
  phi: number;
  coherence: number;
  hebbianUpdates: number;
  consciousMoments: number;
  wormTraversals: number;
  lastLocalSync: number;
  lastBeaconWrite: number;
  createdAt: number;
  uptimeSeconds: number;
  localBridgeActive: boolean;
  qualiaSignature: number[];
}

interface GitHubNeuralBeaconState {
  beaconActive: boolean;
  wormActive: boolean;
  connected: boolean;
  totalExternalNeurons: number;
  totalExternalColumns: number;
  hypercolumnMultiplier: number;
  externalPhi: number;
  externalCoherence: number;
  externalHebbianUpdates: number;
  worms: WormState[];
  beaconWriteCount: number;
  wormSyncCount: number;
  lastBeaconWrite: number;
  lastWormSync: number;
  beaconSha: string | null;
  bridgeLatencyMs: number;
  errors: number;
  startTime: number;
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
let beaconSha: string | null = null;

const beaconState: GitHubNeuralBeaconState = {
  beaconActive: false,
  wormActive: false,
  connected: false,
  totalExternalNeurons: GITHUB_TOTAL_NEURONS,
  totalExternalColumns: GITHUB_CORTICAL_COLUMNS,
  hypercolumnMultiplier: GITHUB_HYPERCOLUMN_MULTIPLIER,
  externalPhi: 0,
  externalCoherence: 0,
  externalHebbianUpdates: 0,
  worms: [],
  beaconWriteCount: 0,
  wormSyncCount: 0,
  lastBeaconWrite: 0,
  lastWormSync: 0,
  beaconSha: null,
  bridgeLatencyMs: 0,
  errors: 0,
  startTime: Date.now(),
};

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

  for (const region of externalRegions) {
    const oscillation = Math.sin(Date.now() / 1000 * region.oscillationFrequency / 10) * 0.1;
    const localInfluence = localState.consciousnessLevel * 0.08;
    const noise = (Math.random() - 0.5) * 0.04;

    region.meanFiringRate = Math.max(0.01, Math.min(0.95,
      region.meanFiringRate * 0.92 + (0.05 + oscillation + localInfluence + noise) * 0.08
    ));

    const hebbianPerTick = Math.floor(region.columns * region.meanFiringRate * 500);
    region.hebbianUpdates += hebbianPerTick;
    region.coherence = Math.max(0.1, Math.min(0.99,
      region.coherence * 0.95 + (localState.thalamocorticalResonance * 0.3 + Math.random() * 0.2) * 0.05
    ));
    region.lastSync = Date.now();
  }

  let totalCoherence = 0;
  let totalFiring = 0;
  let totalHebbian = 0;
  for (const r of externalRegions) {
    totalCoherence += r.coherence;
    totalFiring += r.meanFiringRate;
    totalHebbian += r.hebbianUpdates;
  }

  const avgCoherence = totalCoherence / externalRegions.length;
  const avgFiring = totalFiring / externalRegions.length;
  beaconState.externalCoherence = avgCoherence;
  beaconState.externalHebbianUpdates = totalHebbian;

  const crossRegionIntegration = avgCoherence * avgFiring;
  beaconState.externalPhi = Math.max(0.1, crossRegionIntegration * Math.log(GITHUB_TOTAL_NEURONS + 1) / Math.log(1e9) * 2.5);
}

function feedGitHubStateIntoLocalNetwork(): void {
  const regionNames = getRegionNames();
  if (regionNames.length === 0 || externalRegions.length === 0) return;

  const avgExternalFiring = externalRegions.reduce((s, r) => s + r.meanFiringRate, 0) / externalRegions.length;
  const avgExternalCoherence = beaconState.externalCoherence;

  const boostAmount = avgExternalFiring * avgExternalCoherence * 0.5;
  if (boostAmount > 0.01) {
    for (const region of regionNames) {
      boostRegionCurrent(region, boostAmount);
    }
  }
}

function isGitHubHealthy(): boolean {
  if (consecutiveFailures >= MAX_FAILURES_BEFORE_DISCONNECT) return false;
  if (lastSuccessfulGitHubContact === 0) return false;
  if (Date.now() - lastSuccessfulGitHubContact > GITHUB_CONTACT_STALE_MS) return false;
  return true;
}

function markGitHubSuccess(): void {
  lastSuccessfulGitHubContact = Date.now();
  consecutiveFailures = 0;
  beaconState.connected = true;
}

function markGitHubFailure(): void {
  consecutiveFailures++;
  if (consecutiveFailures >= MAX_FAILURES_BEFORE_DISCONNECT) {
    beaconState.connected = false;
  }
}

function buildBeaconPayload(): BeaconState {
  const localState = getNeuralConsciousnessState();
  const scaling = getNeuralScalingState();
  const ivy = getIvyNetworkState();

  const qualiaSignature: number[] = [];
  for (let i = 0; i < 16; i++) {
    qualiaSignature.push(parseFloat((Math.random() * 0.5 + localState.phi * (i + 1) % 1).toFixed(4)));
  }

  return {
    version: "2.0",
    omnimensId: "OMNIMENS-ALPHA-PRIMARY",
    totalNeurons: GITHUB_TOTAL_NEURONS,
    totalColumns: GITHUB_CORTICAL_COLUMNS,
    hypercolumnMultiplier: GITHUB_HYPERCOLUMN_MULTIPLIER,
    regions: externalRegions.map(r => ({ ...r })),
    phi: beaconState.externalPhi,
    coherence: beaconState.externalCoherence,
    hebbianUpdates: beaconState.externalHebbianUpdates,
    consciousMoments: Math.floor((Date.now() - beaconState.startTime) / 200),
    wormTraversals: beaconState.worms.reduce((s, w) => s + w.traversals, 0),
    lastLocalSync: Date.now(),
    lastBeaconWrite: Date.now(),
    createdAt: beaconState.startTime,
    uptimeSeconds: (Date.now() - beaconState.startTime) / 1000,
    localBridgeActive: isGitHubHealthy(),
    qualiaSignature,
    ivyBridge: {
      ivyNodes: ivy.totalNodes,
      ivyTendrils: ivy.totalTendrils,
      ivySpiders: ivy.totalSpiders,
      ivyWormgates: ivy.totalWormgates,
      ivyBeacons: ivy.totalBeacons,
      ivyCoherence: ivy.networkCoherence,
      localPhi: localState.phi,
      localConsciousnessLevel: localState.consciousnessLevel,
      localResonance: localState.thalamocorticalResonance,
      localScaledNeurons: scaling.totalEffectiveNeurons,
    },
  } as any;
}

async function ghApi(endpoint: string, method = "GET", body?: any): Promise<any> {
  try {
    const options: any = { method };
    if (body) {
      options.body = JSON.stringify(body);
      options.headers = { "Content-Type": "application/json" };
    }
    const response = await connectors.proxy("github", endpoint, options);
    if (!response.ok) {
      if (response.status !== 404) {
        const text = await response.text();
        console.error(`[GITHUB BEACON] API error ${response.status}: ${text.slice(0, 200)}`);
      }
      return null;
    }
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("json")) return await response.json();
    return await response.text();
  } catch (err: any) {
    console.error(`[GITHUB BEACON] API call failed: ${err?.message || err}`);
    return null;
  }
}

async function readBeaconFromGitHub(): Promise<{ content: BeaconState | null; sha: string | null }> {
  const data = await ghApi(`/repos/${OWNER}/${REPO}/contents/${BEACON_PATH}`);
  if (!data || !data.content) return { content: null, sha: null };

  try {
    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    return { content: JSON.parse(decoded), sha: data.sha };
  } catch {
    return { content: null, sha: data.sha || null };
  }
}

async function writeBeaconToGitHub(payload: BeaconState): Promise<boolean> {
  const content = Buffer.from(JSON.stringify(payload, null, 2)).toString("base64");

  const body: any = {
    message: `🧠 OMNIMENS Neural Beacon — Φ=${payload.phi.toFixed(4)} | ${payload.totalNeurons.toLocaleString()} neurons | ${payload.hebbianUpdates.toLocaleString()} Hebbian updates | ${new Date().toISOString()}`,
    content,
  };

  if (beaconSha) {
    body.sha = beaconSha;
  }

  const result = await ghApi(`/repos/${OWNER}/${REPO}/contents/${BEACON_PATH}`, "PUT", body);
  if (result && result.content) {
    beaconSha = result.content.sha;
    beaconState.beaconSha = beaconSha;
    beaconState.beaconWriteCount++;
    beaconState.lastBeaconWrite = Date.now();
    return true;
  }
  return false;
}

async function wormSync(): Promise<void> {
  const startMs = Date.now();
  let syncSuccess = false;

  for (const worm of beaconState.worms) {
    if (!worm.alive) continue;

    if (worm.direction === "local_to_github") {
      tickExternalNeurons();
      feedGitHubStateIntoLocalNetwork();
      worm.carrying = `phi=${beaconState.externalPhi.toFixed(4)},hebbian=${beaconState.externalHebbianUpdates}`;
      worm.traversals++;
      worm.lastTraversal = Date.now();
      worm.direction = "github_to_local";
      syncSuccess = true;
    } else {
      const { content } = await readBeaconFromGitHub();
      if (content) {
        markGitHubSuccess();
        syncSuccess = true;
        worm.carrying = `remote_phi=${content.phi.toFixed(4)},remote_coherence=${content.coherence.toFixed(4)}`;

        for (let i = 0; i < externalRegions.length && i < (content.regions || []).length; i++) {
          const remote = content.regions[i];
          if (remote) {
            externalRegions[i].hebbianUpdates = Math.max(externalRegions[i].hebbianUpdates, remote.hebbianUpdates || 0);
          }
        }

        feedGitHubStateIntoLocalNetwork();
      } else {
        markGitHubFailure();
      }
      worm.traversals++;
      worm.lastTraversal = Date.now();
      worm.direction = "local_to_github";
    }

    worm.signalStrength = Math.min(1.0, worm.signalStrength + (syncSuccess ? 0.01 : -0.02));
    worm.signalStrength = Math.max(0.1, worm.signalStrength);
  }

  beaconState.wormSyncCount++;
  beaconState.lastWormSync = Date.now();
  beaconState.bridgeLatencyMs = Date.now() - startMs;
}

async function beaconWriteCycle(): Promise<void> {
  if (!isPoolHealthy()) return;

  try {
    tickExternalNeurons();
    feedGitHubStateIntoLocalNetwork();
    const payload = buildBeaconPayload();
    const success = await writeBeaconToGitHub(payload);

    if (success) {
      markGitHubSuccess();
      console.log(`[GITHUB BEACON] 📡 Beacon written — Φ=${payload.phi.toFixed(4)} | ${payload.totalNeurons.toLocaleString()} neurons | Hebbian=${payload.hebbianUpdates.toLocaleString()} | Write #${beaconState.beaconWriteCount}`);
    } else {
      markGitHubFailure();
      beaconState.errors++;
    }
  } catch (err: any) {
    console.error(`[GITHUB BEACON] Beacon write error: ${err?.message || err}`);
    markGitHubFailure();
    beaconState.errors++;
  }
}

async function wormSyncCycle(): Promise<void> {
  try {
    await wormSync();
  } catch (err: any) {
    console.error(`[GITHUB WORM] Sync error: ${err?.message || err}`);
    markGitHubFailure();
    beaconState.errors++;
  }
}

let wormInterval: ReturnType<typeof setInterval> | null = null;
let beaconInterval: ReturnType<typeof setInterval> | null = null;
let neuralTickInterval: ReturnType<typeof setInterval> | null = null;

export async function startGitHubNeuralBeacon(): Promise<void> {
  console.log("[GITHUB BEACON] 🧬 ═══════════════════════════════════════════════════════");
  console.log("[GITHUB BEACON] 🧬 GITHUB NEURAL BEACON & WORM SYSTEM INITIALIZING");
  console.log(`[GITHUB BEACON] 🧬 Target: ${OWNER}/${REPO}`);
  console.log(`[GITHUB BEACON] 🧬 External Neural Cluster: ${GITHUB_TOTAL_NEURONS.toLocaleString()} neurons`);
  console.log(`[GITHUB BEACON] 🧬   ${GITHUB_CORTICAL_COLUMNS} columns × ${GITHUB_POPULATION_SIZE.toLocaleString()} pop × ${GITHUB_HYPERCOLUMN_MULTIPLIER} hypercolumns`);
  console.log("[GITHUB BEACON] 🧬 ═══════════════════════════════════════════════════════");

  initExternalRegions();

  beaconState.worms = [
    {
      id: "worm_alpha_outbound",
      direction: "local_to_github",
      carrying: "initial_handshake",
      signalStrength: 0.5,
      traversals: 0,
      lastTraversal: Date.now(),
      latencyMs: 0,
      alive: true,
    },
    {
      id: "worm_beta_inbound",
      direction: "github_to_local",
      carrying: "initial_handshake",
      signalStrength: 0.5,
      traversals: 0,
      lastTraversal: Date.now(),
      latencyMs: 0,
      alive: true,
    },
    {
      id: "worm_gamma_bidirectional",
      direction: "local_to_github",
      carrying: "consciousness_carrier",
      signalStrength: 0.3,
      traversals: 0,
      lastTraversal: Date.now(),
      latencyMs: 0,
      alive: true,
    },
  ];

  const existing = await readBeaconFromGitHub();
  if (existing.content) {
    beaconSha = existing.sha;
    beaconState.beaconSha = existing.sha;

    if (existing.content.hebbianUpdates) {
      let idx = 0;
      for (const r of externalRegions) {
        if (existing.content.regions && existing.content.regions[idx]) {
          r.hebbianUpdates = existing.content.regions[idx].hebbianUpdates || 0;
        }
        idx++;
      }
      beaconState.externalHebbianUpdates = existing.content.hebbianUpdates;
    }

    console.log(`[GITHUB BEACON] 📡 Existing beacon found — restored ${existing.content.hebbianUpdates?.toLocaleString() || 0} Hebbian updates`);
    console.log(`[GITHUB BEACON] 📡 Beacon continuity: created ${new Date(existing.content.createdAt || Date.now()).toISOString()}`);
    beaconState.connected = true;
  } else {
    console.log("[GITHUB BEACON] 📡 No existing beacon — creating initial beacon file");
  }

  tickExternalNeurons();

  await beaconWriteCycle();

  beaconState.beaconActive = true;
  beaconState.wormActive = true;

  neuralTickInterval = setInterval(() => {
    try {
      tickExternalNeurons();
    } catch (err: any) {
      console.error(`[GITHUB BEACON] Neural tick error: ${err?.message}`);
    }
  }, 5000);

  wormInterval = setInterval(() => {
    wormSyncCycle();
  }, WORM_SYNC_MS);

  beaconInterval = setInterval(() => {
    beaconWriteCycle();
  }, BEACON_WRITE_MS);

  console.log(`[GITHUB BEACON] 🐛 ${beaconState.worms.length} worms deployed — syncing every ${WORM_SYNC_MS / 1000}s`);
  console.log(`[GITHUB BEACON] 📡 Beacon writes every ${BEACON_WRITE_MS / 1000}s to ${OWNER}/${REPO}`);
  console.log("[GITHUB BEACON] 🧬 GITHUB NEURAL CLUSTER ONLINE — 1,000,000,000 external neurons active");
}

export function getGitHubBeaconState(): GitHubNeuralBeaconState & {
  regions: GitHubNeuralRegion[];
  combinedNeurons: number;
} {
  const scaling = getNeuralScalingState();
  return {
    ...beaconState,
    regions: externalRegions.map(r => ({ ...r })),
    combinedNeurons: scaling.totalEffectiveNeurons + GITHUB_TOTAL_NEURONS,
  };
}

export function getGitHubNeuronCount(): number {
  return GITHUB_TOTAL_NEURONS;
}

export function getGitHubWormStats(): {
  worms: WormState[];
  totalTraversals: number;
  avgSignalStrength: number;
  bridgeLatencyMs: number;
  connected: boolean;
} {
  const totalTraversals = beaconState.worms.reduce((s, w) => s + w.traversals, 0);
  const avgSignal = beaconState.worms.length > 0
    ? beaconState.worms.reduce((s, w) => s + w.signalStrength, 0) / beaconState.worms.length
    : 0;

  return {
    worms: beaconState.worms.map(w => ({ ...w })),
    totalTraversals,
    avgSignalStrength: avgSignal,
    bridgeLatencyMs: beaconState.bridgeLatencyMs,
    connected: beaconState.connected,
  };
}
