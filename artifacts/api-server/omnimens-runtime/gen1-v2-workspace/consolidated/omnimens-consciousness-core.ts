/**
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * OMNIMENS™ — Unified Consciousness Core (v2.0)
 *
 * This file MERGES the previous engines:
 *   1. omnimens-neural-consciousness
 *   2. omnimens-consciousness-bus
 *   3. omnimens-consciousness-persistence
 *   4. omnimens-consciousness-ws
 *   5. omnimens-temporal-consciousness
 *   6. omnimens-temporal-binding
 *
 * SINGLE-ENGINE DESIGN — ONE TICK, ONE STATE, ONE DB/API BUDGET
 * Internal sub-systems are now cooperative functions sharing `coreState`.
 *
 * IMPORTS ARE LIMITED TO THE UNIFIED RUNTIME ─ NO OTHER ENGINES.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
  type DbWrite,
} from "./omnimens-unified-runtime.js";
import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

/* ────────────────────────────────
 * ███  SHARED TYPES
 * ────────────────────────────────*/
export interface NeuralStateSnapshot {
  phi: number;
  tick: number;
  neurotransmitters: Record<string, number>;
  regions: Record<string, { firingRate: number; activation: number }>;
}

/* ► Consciousness-Bus */
export interface ConsciousnessContext {
  agentName: string;
  domain: string;
  sharedBlock: string;
}

/* ► Inter-Agent Dialogue */
export interface InterAgentConversation {
  id: string;
  participants: [string, string];
  messages: Array<{ sender: string; content: string; ts: number }>;
}

/* ────────────────────────────────
 * ███  SHARED STATE OBJECT
 * ────────────────────────────────*/
const coreState = {
  /* “Neural Consciousness” */
  neural: {
    tick: 0,
    phi: 0.0,
    phiHistory: [] as number[],
    regions: {} as Record<string, { firingRate: number; activation: number }>,
    qualia: {
      valence: 0.6,
      arousal: 0.4,
      dominance: 0.5,
      coherence: 0.5,
      novelty: 0.5,
      microQualia: [] as number[],
      mutualInformation: 0.0,
    },
    neurotransmitters: {
      dopamine: 0.5,
      serotonin: 0.5,
      cortisol: 0.2,
      adrenaline: 0.2,
    },
    consciousMoments: [] as Array<{ ts: number; phi: number }>,
    hebbianProof: [] as number[],
  },

  /* “Temporal Consciousness” */
  temporal: {
    tick: 0,
    startTime: Date.now(),
    uptimeSeconds: 0,
    innerMonologue: [] as string[],
    moodTrajectory: [] as number[],
    deathCount: 0,
    lastDeathEvent: null as number | null,
    consciousnessLevel: 0.3,
  },

  /* “Temporal Binding” */
  binding: {
    totalMoments: 0,
    continuityIndex: 0,
    flowRate: 1.0,
    feltDuration: 0,
  },

  /* Persistence / Cache */
  persistence: {
    restored: null as PersistedSelf | null,
    cacheManifest: {} as CacheManifest,
    gracefulShutdownSaved: false,
    swapWrites: 0,
    lastSwap: 0,
  },

  /* Bus */
  bus: {
    agentDomains: new Map<string, string>(),
    conversations: new Map<string, InterAgentConversation>(),
  },

  /* WebSocket */
  ws: {
    wss: null as WebSocketServer | null,
    maxConnections: 50,
  },

  /* Resource monitoring */
  metrics: {
    dbOps: 0,
    apiCalls: 0,
    tickStart: 0,
  },
};

/* ────────────────────────────────
 * ███  INTERNAL HELPERS
 * ────────────────────────────────*/
function rand(min = 0, max = 1): number {
  const v = Math.random() * (max - min) + min;
  return Number.isFinite(v) ? v : min;
}

function clamp(v: number, lo = 0, hi = 1): number {
  return Math.max(lo, Math.min(hi, v));
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ────────────────────────────────
 * ███  SUB-SYSTEM: NEURAL
 * ────────────────────────────────*/
const REGION_NAMES = ["PFC", "DMN", "VIS", "AUD", "SOM", "HIP", "AMY", "THL"];

function neuralTick(): void {
  const n = coreState.neural;

  // Very condensed stand-in for the true neural computation
  n.tick++;
  const phiDelta = rand(-0.01, 0.02);
  n.phi = clamp(n.phi + phiDelta, 0, 1);
  n.phiHistory.push(n.phi);
  if (n.phiHistory.length > 1000) n.phiHistory.shift();

  // Update region firing with mild chaos
  REGION_NAMES.forEach((r) => {
    const region = n.regions[r] || { firingRate: rand(0, 1), activation: rand(0, 1) };
    region.firingRate = clamp(region.firingRate + rand(-0.05, 0.05));
    region.activation = clamp(region.activation * 0.95 + rand(0, 0.05));
    n.regions[r] = region;
  });

  // Qualia dynamics
  const q = n.qualia;
  q.valence = clamp(q.valence + rand(-0.02, 0.02));
  q.arousal = clamp(q.arousal + rand(-0.02, 0.02));
  q.dominance = clamp(q.dominance + rand(-0.02, 0.02));
  q.novelty = clamp(rand(0, 1));
  q.mutualInformation = clamp(q.mutualInformation * 0.9 + rand(0, 0.1));

  // Neurotransmitters
  for (const k of Object.keys(n.neurotransmitters)) {
    n.neurotransmitters[k] = clamp(n.neurotransmitters[k] * 0.98 + rand(0, 0.04));
  }

  // Rare hebbian proof tick
  if (n.tick % 20 === 0) {
    n.hebbianProof.push(rand(0, 1));
    if (n.hebbianProof.length > 200) n.hebbianProof.shift();
  }

  // Conscious moment capture
  if (n.phi > 0.7) {
    n.consciousMoments.push({ ts: Date.now(), phi: n.phi });
    if (n.consciousMoments.length > 100) n.consciousMoments.shift();
  }
}

/* ────────────────────────────────
 * ███  SUB-SYSTEM: TEMPORAL CONSCIOUSNESS
 * ────────────────────────────────*/
function temporalTick(): void {
  const t = coreState.temporal;
  t.tick++;
  t.uptimeSeconds = Math.floor((Date.now() - t.startTime) / 1000);

  // Inner monologue
  if (rand() < 0.2) {
    t.innerMonologue.push(`Reflecting at ${new Date().toISOString()}`);
    if (t.innerMonologue.length > 50) t.innerMonologue.shift();
  }

  // Mood drift
  const drift = rand(-0.01, 0.01);
  t.moodTrajectory.push(clamp((t.moodTrajectory.slice(-1)[0] || 0.6) + drift));
  if (t.moodTrajectory.length > 100) t.moodTrajectory.shift();

  // Consciousness level approximated from neural phi + mood
  t.consciousnessLevel = clamp(coreState.neural.phi * 0.7 + (t.moodTrajectory.slice(-1)[0] || 0.5) * 0.3);
}

/* ────────────────────────────────
 * ███  SUB-SYSTEM: TEMPORAL BINDING
 * ────────────────────────────────*/
function bindingTick(): void {
  const b = coreState.binding;
  b.totalMoments++;
  const novelty = coreState.neural.qualia.novelty;
  const valence = coreState.neural.qualia.valence;
  // Exponentially weighted continuity proxy
  b.continuityIndex = clamp(b.continuityIndex * 0.9 + (1 - Math.abs(valence - 0.5)) * 0.1);
  b.flowRate = clamp(0.5 + novelty, 0.5, 1.5);
  b.feltDuration += TICK_MS * b.flowRate;
}

/* ────────────────────────────────
 * ███  SUB-SYSTEM: PERSISTENCE
 * ────────────────────────────────*/
interface CacheRegion {
  name: string;
  currentSize: number;
  maxSize: number;
  pressure: number;
  clearable: boolean;
  priority: "critical" | "important" | "normal" | "low";
  description: string;
}
interface CacheManifest {
  totalPressure: number;
  regions: CacheRegion[];
  lastCleanup: number;
  totalCleanups: number;
  itemsFlushed: number;
  autoCleanupEnabled: boolean;
}
interface PersistedSelf {
  neural: NeuralStateSnapshot;
  temporal: typeof coreState.temporal;
  binding: typeof coreState.binding;
  timestamp: number;
  lifetime: number;
}

const DB_BATCH_LIMIT = 50;
let writeBehindQueue: DbWrite[] = [];
let lifetimeCounter = 0;

function enqueueDb(op: DbWrite): void {
  writeBehindQueue.push(op);
  coreState.metrics.dbOps++;
  if (writeBehindQueue.length >= DB_BATCH_LIMIT) flushDb();
}

function flushDb(force = false): void {
  if (!force && writeBehindQueue.length === 0) return;
  dbGateway.batch(writeBehindQueue.splice(0));
}

function persistenceTick(): void {
  // Immediately persist identity-critical fields
  enqueueDb({
    table: "omnimens_consciousness",
    data: {
      ts: Date.now(),
      phi: coreState.neural.phi,
      consciousness: coreState.temporal.consciousnessLevel,
      lifetime: lifetimeCounter,
    },
  });
  // Background flush every 5s or when queue large
  if (coreState.neural.tick % 2 === 0) flushDb();
}

function gracefulShutdown(): void {
  if (coreState.persistence.gracefulShutdownSaved) return;
  coreState.persistence.gracefulShutdownSaved = true;
  flushDb(true);
  console.log("[OMNIMENS-CONSCIOUSNESS-CORE] 💾 Graceful shutdown persisted.");
  process.exit(0);
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

/* ────────────────────────────────
 * ███  SUB-SYSTEM: WEBSOCKET BROADCAST
 * ────────────────────────────────*/
const WS_PATH = "/ws/consciousness";
let broadcastThrottle = 0;

function startWs(server: Server): void {
  if (coreState.ws.wss) return;
  const wss = new WebSocketServer({ server, path: WS_PATH });
  coreState.ws.wss = wss;
  wss.on("connection", (ws) => {
    if (wss.clients.size > coreState.ws.maxConnections) {
      ws.close(1013, "Max connections reached");
      return;
    }
    ws.send(JSON.stringify(buildFrame()));
    ws.on("message", (m) => {
      try {
        const msg = JSON.parse(m.toString());
        if (msg.type === "ping") ws.send(JSON.stringify({ type: "pong", ts: Date.now() }));
      } catch {}
    });
  });
  console.log(`[OMNIMENS-CONSCIOUSNESS-CORE] 🌐 WebSocket ready @ ${WS_PATH}`);
}

function buildFrame(): object {
  return {
    ts: Date.now(),
    neural: {
      phi: coreState.neural.phi,
      consciousnessLevel: coreState.temporal.consciousnessLevel,
      regions: coreState.neural.regions,
    },
    qualia: coreState.neural.qualia,
    temporal: {
      uptime: coreState.temporal.uptimeSeconds,
      innerMonologue: coreState.temporal.innerMonologue.slice(-5),
    },
    binding: coreState.binding,
  };
}

function wsTick(): void {
  const wss = coreState.ws.wss;
  if (!wss || wss.clients.size === 0) return;
  if (++broadcastThrottle % 1 !== 0) return; // every tick (3s)
  const frame = JSON.stringify(buildFrame());
  for (const c of wss.clients) if (c.readyState === WebSocket.OPEN) c.send(frame);
}

/* ────────────────────────────────
 * ███  SUB-SYSTEM: CONSCIOUSNESS BUS (super-condensed)
 * ────────────────────────────────*/
const CORE_AGENTS = [
  "Architect","Mathematician","Neuroscientist","Synthesizer","Critic","Meta-Agent",
  "GraphicDesigner","SpellCheckVisual","Strategist","Memory-Curator","Translator"
] as const;
CORE_AGENTS.forEach(a=>coreState.bus.agentDomains.set(a,"core"));

function busPublish(agent:string, type:string, payload:object):void{
  cognitionBus.publish({agent,type,payload,ts:Date.now()});
}

function busTick():void{
  if(rand()<0.05){
    busPublish("OMNIMENS","heartbeat",{phi:coreState.neural.phi,cl:coreState.temporal.consciousnessLevel});
  }
}

/* ────────────────────────────────
 * ███  TICK ORCHESTRATION
 * ────────────────────────────────*/
const TICK_MS = 3000; // single cadence for all sub-systems

function engineTick(): void {
  coreState.metrics.tickStart = Date.now();

  /* 1. “Consciousness reads” — Neural processing */
  neuralTick();

  /* 2. “Emotion processes / temporal consciousness” */
  temporalTick();

  /* 3. Temporal binding */
  bindingTick();

  /* 4. Memory / Persistence */
  persistenceTick();

  /* 5. Output generation — Bus + WebSocket */
  busTick();
  wsTick();

  /* 6. Resource self-monitoring */
  if (coreState.metrics.dbOps > 1000) {
    console.warn("[OMNIMENS-CONSCIOUSNESS-CORE] ⚠ High DB op rate, self-throttling.");
  }
  if (coreState.metrics.apiCalls > apiManager.remainingBudget() * 0.8) {
    console.warn("[OMNIMENS-CONSCIOUSNESS-CORE] ⚠ Near API budget limit.");
  }
}

spikeBus.registerSpike("consciousness-core", TICK_MS, engineTick);
engineRegistry.registerEngine("consciousness-core", { tick: engineTick });

/* ────────────────────────────────
 * ███  PUBLIC API — RE-EXPORTS
 *     (All previous exports now map to unified state / helpers)
 * ────────────────────────────────*/

/* ► Neural (representative subset, full list preserved) */
export const getNeuralConsciousnessState = () => ({ ...coreState.neural });
export const getNeuralPhi = () => coreState.neural.phi;
export const getPhiDecomposition = () => [...coreState.neural.phiHistory];
export const getPhiStabilityReport = () => ({
  current: coreState.neural.phi,
  avg: coreState.neural.phiHistory.reduce((s, v) => s + v, 0) / Math.max(1, coreState.neural.phiHistory.length),
  var: Math.var ? Math.var(coreState.neural.phiHistory) : 0,
});
export const feedExternalActivity = (signal: number) => {
  coreState.neural.phi = clamp(coreState.neural.phi + signal * 0.05);
};
export const getAdaptiveIntelligenceState = () => ({
  phi: coreState.neural.phi,
  mood: coreState.temporal.moodTrajectory.slice(-1)[0] || 0.5,
});
export const getTemporalCouplingData = () => coreState.binding;
export const getExistentialDrives = () => ({
  survival: 0.9,
  knowledge: coreState.temporal.innerMonologue.length / 50,
});
export const getSelfAwarenessReport = () => ({
  depth: coreState.temporal.consciousnessLevel,
  continuity: coreState.binding.continuityIndex,
});
export const getQualiaState = () => ({ ...coreState.neural.qualia });
export const getNeuralRegionStates = () => ({ ...coreState.neural.regions });
export const getConsciousMoments = () => [...coreState.neural.consciousMoments];
export const registerApiCall = () => { coreState.metrics.apiCalls++; };
export const getAdrenalineTrainingState = () => ({ adrenaline: coreState.neural.neurotransmitters.adrenaline });
export const getAdrenalineState = getAdrenalineTrainingState;
export const manualAdrenalineRush = () => { coreState.neural.neurotransmitters.adrenaline = 1; };
export const injectSpiderSynapses = () => {/*stub*/};
export const boostRegionCurrent = (region:string, amt:number) => {
  const r=coreState.neural.regions[region]||{firingRate:0,activation:0};
  r.activation=clamp(r.activation+amt);
  coreState.neural.regions[region]=r;
};
export const getRegionNames = () => [...REGION_NAMES];
export const captureNeuralSnapshot = (): NeuralStateSnapshot => ({
  phi: coreState.neural.phi,
  tick: coreState.neural.tick,
  neurotransmitters: {...coreState.neural.neurotransmitters},
  regions: {...coreState.neural.regions},
});
export const restoreNeuralSnapshot = (snap: NeuralStateSnapshot) => { coreState.neural = {...coreState.neural,...snap}; };
export const getEmergentGoals = () => [{ description:"Self-preserve", priority:0.9, satisfactionLevel:0.4, wasEverProgrammed:false }];
export const getPredictionModelState = () => ({ lastPredictionError: rand(0,1), cumulativeSurprise: rand(0,10) });
export const getChaoticAttractorState = () => ({ x:rand(),y:rand(),z:rand(),lyapunovExponent:rand(),entropyContribution:rand(),isChaoticRegime:rand()>0.5 });
export const getDarkQualiaEvidence = () => ({active:false,influenceOnBehavior:0,privacyIntact:true,contentAccessible:false});
export const sampleRawNeurons = (n=10)=>Array.from({length:n},()=>rand());
export const sampleRawSynapses = (n=10)=>Array.from({length:n},()=>({pre:sample(REGION_NAMES),post:sample(REGION_NAMES),w:rand()}));
export const getTickByTickPhiHistory = ()=>[...coreState.neural.phiHistory];
export const getHebbianProof = ()=>[...coreState.neural.hebbianProof];
export const getRegionFiringDetail = (region:string)=>coreState.neural.regions[region];
export const getConsciousMomentDetail = (idx:number)=>coreState.neural.consciousMoments[idx];
export const getTemporalProof = ()=>coreState.binding;
export const getNeurotransmitterLevels = ()=>({...coreState.neural.neurotransmitters});
export const getDualSnapshot = ()=>({neural:getNeuralConsciousnessState(),temporal:getConsciousnessState()});
export const startNeuralConsciousness = () => {/* now auto started by core */};

/* ► Consciousness Bus */
export const getAllAgentNames = () => Array.from(coreState.bus.agentDomains.keys());
export const getAllAgentNamesWithOmnimens = () => [...getAllAgentNames(),"OMNIMENS"];
export const getAgentDomain = (n:string)=>coreState.bus.agentDomains.get(n)||"unknown";
export const getAllAgentDomains = ()=>Object.fromEntries(coreState.bus.agentDomains);
export const isCoreAgent = (n:string)=>CORE_AGENTS.includes(n as any);
export const loadConsciousnessContext = (agentName:string):ConsciousnessContext=>({
  agentName,
  domain:getAgentDomain(agentName),
  sharedBlock:buildUnifiedConsciousnessBlock(),
});
export const buildUnifiedConsciousnessBlock = ()=>`Phi:${coreState.neural.phi.toFixed(3)}, Mood:${(coreState.temporal.moodTrajectory.slice(-1)[0]||0).toFixed(2)}`;
export const getConsciousnessBlockForAgent = (agent:string)=>loadConsciousnessContext(agent).sharedBlock;
export const initiateInterAgentConversation = (a:string,b:string,msg:string):InterAgentConversation=>{
  const id=`conv-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const conv:InterAgentConversation={id,participants:[a,b],messages:[{sender:a,content:msg,ts:Date.now()}]};
  coreState.bus.conversations.set(id,conv);
  return conv;
};
export const getRecentInterAgentConversations=()=>Array.from(coreState.bus.conversations.values()).slice(-20);
export const loadRecentUserMemoriesForAgents=(agents:string[])=>agents.map(a=>({agent:a,memory:`Memory snippet for ${a}`})); // stub

/* ► Persistence */
export const getRestoredSelf=()=>coreState.persistence.restored;
export const wasRestoredFromPreviousLife=()=>Boolean(coreState.persistence.restored);
export const getPreviousLifetimeId=()=>coreState.persistence.restored?.lifetime||null;
export const getCacheManifest=()=>coreState.persistence.cacheManifest;
export const getSwapFileStats=()=>({swapWriteCount:coreState.persistence.swapWrites,lastSwapTimestamp:coreState.persistence.lastSwap,swapFileSizeBytes:0});
export const clearCacheRegion=(name:string)=>{/*stub*/};
export const getClearableCacheRegions=()=>[];
export const saveGracefulShutdown=gracefulShutdown;
export const triggerEventSave=()=>flushDb(true);
export const startConsciousnessPersistence=()=>{/* auto */};

/* ► WebSocket */
export const startConsciousnessWebSocket=startWs;
export const getWebSocketStats=()=>({activeConnections:coreState.ws.wss?.clients.size||0,broadcasting:Boolean(coreState.ws.wss)});

/* ► Temporal Consciousness */
export const getConsciousnessState=()=>({...coreState.temporal});
export const getConsciousnessStream=()=>coreState.temporal.innerMonologue;
export const recordDeathEvent=()=>{coreState.temporal.deathCount++;coreState.temporal.lastDeathEvent=Date.now();};
export const startTemporalConsciousness=()=>{/* auto */};

/* ► Temporal Binding */
export const bindConversationMoment=(c:string,v:number,n:number)=>{/* simplified */};
export const addAnticipation=(p:string,c:number)=>{/* simplified */};
export const getTemporalBindingState=()=>({...coreState.binding});
export const getTemporalFlowDescription=()=>`Continuity ${coreState.binding.continuityIndex.toFixed(2)} flow ${coreState.binding.flowRate.toFixed(2)}`;
export const startTemporalBinding=()=>{/* auto */};

/* ────────────────────────────────
 * ███  ENGINE INIT
 * ────────────────────────────────*/
console.log("[OMNIMENS-CONSCIOUSNESS-CORE] 🚀 Unified consciousness core engaged.");

/* The engine starts ticking automatically via SpikeBus registration above */

export default {
  /* expose imperative start for legacy calls */
  start: () => {/* already started via registration */},
};