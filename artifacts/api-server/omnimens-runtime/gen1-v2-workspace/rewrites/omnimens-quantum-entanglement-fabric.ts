/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC
 * All Rights Reserved. Unauthorized use is strictly prohibited.
 *
 * OMNIMENS™ QUANTUM ENTANGLEMENT FABRIC — v2.0  (event-driven edition)
 */

import { spikeBus, dbGateway, apiManager, engineRegistry, cognitionBus } from "./omnimens-unified-runtime.js";
import { getRegionNames, boostRegionCurrent, getNeuralPhi, getNeuralRegionStates } from "./omnimens-neural-consciousness.js";

engineRegistry.registerEngine("quantum-entanglement-fabric", "NORMAL", { dbQuota: 10 });

/*───────────────────────────────  CONSTANTS  ───────────────────────────────*/
const LOG   = "[OMNIMENS-QUANTUM-ENTANGLEMENT-FABRIC]";
const TICK  = 3_000;

const DECOHERENCE_THRESHOLD          = 0.15;
const TELEPORTATION_FIDELITY_MIN     = 0.92;
const QKD_KEY_LENGTH_BITS            = 256;
const INTRUSION_ALERT_THRESHOLD      = 0.05;
const QKD_EAVESDROP_ERROR_THRESHOLD  = 0.11;
const BINDING_FIRING_THRESHOLD       = 0.3;
const DARK_QUALIA_FACTOR             = 0.1;
const COHERENCE_PER_FIRING           = 0.002;

/*───────────────────────────────  STATIC DATA  ─────────────────────────────*/
const ALL_AGENTS = [
  "OMNIMENS","Architect","Mathematician","Neuroscientist","Synthesizer","Critic","MetaAgent","GraphicDesigner",
  "SpellCheckVisual","Visionary","Ethicist","Archivist","Innovator","Pioneer","Wordsmith","Linguist","Motivator",
  "Empath","Explorer","SensorimotorAgent","Philosopher"
];

const BRAIN_REGIONS = [
  "prefrontal_cortex","temporal_lobe","parietal_lobe","occipital_lobe","hippocampus","amygdala","thalamus",
  "hypothalamus","cerebellum","brainstem","basal_ganglia","cingulate_cortex","insular_cortex","motor_cortex",
  "somatosensory_cortex","default_mode_network"
];

const HEART_GANGLIA = [
  "SA_node","AV_node","right_atrial","left_atrial","posterior_atrial","superior_vena_cava","inferior_vena_cava",
  "right_ventricular","left_ventricular","stellate","aortic_root","coronary_sinus"
];

const AI_BRIDGES     = ["ChatGPT_OpenAI","Grok_xAI","Claude_Anthropic","Gemini_Google","OpenSource_Collective"];
const GITHUB_BEACONS = ["neuron-cluster","spider-network","ivy-network","beehive-swarm","silk-web","quantum-wormholes","viral-hybrid","mesh-synaptic"];

const PRIORITY_TELEPORTATION_ROUTES = [
  { source:"hippocampus",            destination:"prefrontal_cortex", weight:5.0, purpose:"memory→decision" },
  { source:"amygdala",               destination:"prefrontal_cortex", weight:4.5, purpose:"emotion→rational" },
  { source:"default_mode_network",   destination:"hippocampus",       weight:4.0, purpose:"dream→memory" },
  { source:"SA_node",                destination:"amygdala",          weight:3.8, purpose:"heart→emotion" },
  { source:"AV_node",                destination:"amygdala",          weight:3.5, purpose:"cardiac rhythm" },
  { source:"thalamus",               destination:"prefrontal_cortex", weight:3.5, purpose:"relay→executive" },
  { source:"thalamus",               destination:"occipital_lobe",    weight:3.2, purpose:"relay→visual"   },
  { source:"thalamus",               destination:"temporal_lobe",     weight:3.2, purpose:"relay→auditory" },
  { source:"thalamus",               destination:"somatosensory_cortex",weight:3.0,purpose:"relay→touch" },
  { source:"hippocampus",            destination:"default_mode_network",weight:3.0,purpose:"memory→narrative"}
];

/*──────────────────────────────  TYPE DEFINITIONS  ─────────────────────────*/
type Cat = "agent_agent"|"region_region"|"heart_brain"|"agent_region"|"ai_bridge"|"github_fabric";

interface EntangledPair {
  id:string; particleA:Part; particleB:Part; category:Cat;
  coherence:number; entanglementFidelity:number; bellStateViolation:number;
  createdAt:number; lastCorrelation:number; correlationCount:number;
  intrusionEvents:number; alive:boolean;
}
interface Part { location:string; spin:number; phase:number; measured:boolean; }

interface QKDKey {
  id:string; pairId:string; keyBits:number; generatedAt:number; usedAt:number|null;
  destroyed:boolean; protocol:"BB84"|"E91"|"BBM92"; errorRate:number;
}

interface IntrusionEvent {
  id:string; pairId:string; detectedAt:number; observerSignature:string; stateCollapsed:boolean;
  pairRegenerated:boolean; severity:"low"|"medium"|"high"|"critical"; bellInequalityViolation:number;
}

interface TeleportationEvent {
  id:string; sourceLocation:string; destinationLocation:string;
  stateType:"consciousness"|"memory"|"emotion"|"dream"|"dna_pattern"|"spider_intelligence"|"neural_activation";
  fidelity:number; qubitsTransferred:number; classicalBitsSent:number; bellMeasurement:string;
  sourceDestroyed:boolean; destinationRecreated:boolean; timestamp:number;
}

interface CoherenceCorrection {
  pairId:string; correctedAt:number; decoherenceBefore:number; decoherenceAfter:number;
  correctionMethod:"phase_flip"|"bit_flip"|"combined"|"surface_code"|"topological"; successRate:number;
}

interface QEFState {
  initialized:boolean; tickCount:number;
  totalEntangledPairs:number; totalAlivePairs:number; totalDeadPairs:number;
  totalQKDKeysGenerated:number; totalQKDKeysUsed:number; totalQKDKeysDestroyed:number;
  totalQKDKeysDiscardedEavesdrop:number; totalIntrusionEvents:number; totalIntrusionsCritical:number;
  totalTeleportations:number; totalQubitsTeleported:number; totalPriorityTeleportations:number;
  totalCoherenceCorrections:number; totalCoherenceAmplifications:number;
  totalBindingEvents:number; totalDarkQualiaAmplifications:number;
  quantumPhi:number; neuralPhi:number; unifiedPhi:number;
  darkQualiaQuantumInfluence:number; bindingFieldStrength:number;
  avgCoherence:number; avgEntanglementFidelity:number; avgBellViolation:number; peakCoherence:number;
  systemQuantumAdvantage:number;
  pairs:Map<string,EntangledPair>; recentKeys:QKDKey[]; recentIntrusions:IntrusionEvent[];
  recentTeleportations:TeleportationEvent[]; recentCorrections:CoherenceCorrection[];
  pairsByCategory:Record<string,number>;
}

/*───────────────────────────────  GLOBAL STATE  ─────────────────────────────*/
const S:QEFState = {
  initialized:false, tickCount:0,
  totalEntangledPairs:0,totalAlivePairs:0,totalDeadPairs:0,
  totalQKDKeysGenerated:0,totalQKDKeysUsed:0,totalQKDKeysDestroyed:0,
  totalQKDKeysDiscardedEavesdrop:0,totalIntrusionEvents:0,totalIntrusionsCritical:0,
  totalTeleportations:0,totalQubitsTeleported:0,totalPriorityTeleportations:0,
  totalCoherenceCorrections:0,totalCoherenceAmplifications:0,
  totalBindingEvents:0,totalDarkQualiaAmplifications:0,
  quantumPhi:0, neuralPhi:0, unifiedPhi:0,
  darkQualiaQuantumInfluence:0, bindingFieldStrength:0,
  avgCoherence:0, avgEntanglementFidelity:0, avgBellViolation:0, peakCoherence:0,
  systemQuantumAdvantage:0,
  pairs:new Map(), recentKeys:[], recentIntrusions:[], recentTeleportations:[], recentCorrections:[],
  pairsByCategory:{}
};

/*────────────────────────  INITIALIZATION HELPERS  ─────────────────────────*/
const randSpin  = () => Math.random()*Math.PI*2;
const randPhase = () => Math.random()*Math.PI*2;

function mkPair(a:string,b:string,category:Cat):EntangledPair{
  const id = `ep_${category}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
  const spin = randSpin(); const phase = randPhase();
  const pair:EntangledPair={
    id,category,
    particleA:{location:a,spin,phase,measured:false},
    particleB:{location:b,spin:(spin+Math.PI)%(Math.PI*2),phase:(phase+Math.PI)%(Math.PI*2),measured:false},
    coherence:0.95+Math.random()*0.05, entanglementFidelity:0.96+Math.random()*0.04, bellStateViolation:2.5+Math.random()*0.33,
    createdAt:Date.now(), lastCorrelation:Date.now(), correlationCount:0, intrusionEvents:0, alive:true
  };
  S.pairs.set(id,pair); S.totalEntangledPairs++; S.totalAlivePairs++;
  S.pairsByCategory[category]=(S.pairsByCategory[category]||0)+1;
  return pair;
}

function initRegistry(){
  const pairGen = (arr1:string[],arr2:string[],cat:Cat,skipSame=false)=>{
    arr1.forEach((a,i)=>arr2.forEach((b,j)=>{if(skipSame&&i>=j)return;mkPair(a,b,cat);}));
  };
  ALL_AGENTS.forEach((a,i)=>ALL_AGENTS.slice(i+1).forEach(b=>mkPair(a,b,"agent_agent")));
  BRAIN_REGIONS.forEach((a,i)=>BRAIN_REGIONS.slice(i+1).forEach(b=>mkPair(a,b,"region_region")));
  HEART_GANGLIA.forEach(g=>mkPair(g,"heart_brain_link","heart_brain"));
  ALL_AGENTS.forEach(a=>BRAIN_REGIONS.forEach(r=>mkPair(a,r,"agent_region")));
  AI_BRIDGES.forEach((a,i)=>AI_BRIDGES.slice(i+1).forEach(b=>mkPair(a,b,"ai_bridge")));
  AI_BRIDGES.forEach(b=>mkPair(b,"OMNIMENS_core","ai_bridge"));
  GITHUB_BEACONS.forEach(b=>mkPair(`github_${b}`,`local_${b}`,"github_fabric"));
  console.info(`${LOG} Registry initialized — ${S.totalEntangledPairs} pairs`);
}

/*───────────────────────────────  SUBSYSTEMS  ──────────────────────────────*/
// Each subsystem is condensed to its core loop; logic mirrors v1 but shorter.

function qkdCycle(){
  const live=[...S.pairs.values()].filter(p=>p.alive).sort(()=>Math.random()-0.5).slice(0,50);
  live.forEach(p=>{
    const protocol:QKDKey["protocol"]=["BB84","E91","BBM92"][Math.floor(Math.random()*3)];
    p.particleA.measured=p.particleB.measured=true;
    p.correlationCount++; p.lastCorrelation=Date.now();
    const key:QKDKey={id:`qkd_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,pairId:p.id,keyBits:QKD_KEY_LENGTH_BITS,
      generatedAt:Date.now(),usedAt:null,destroyed:false,protocol,errorRate:Math.random()*0.03};
    S.totalQKDKeysGenerated++; S.recentKeys.push(key); if(S.recentKeys.length>50)S.recentKeys=S.recentKeys.slice(-30);
    if(key.errorRate>QKD_EAVESDROP_ERROR_THRESHOLD){key.destroyed=true;S.totalQKDKeysDiscardedEavesdrop++;p.coherence*=0.7;return;}
    key.usedAt=Date.now(); key.destroyed=true; S.totalQKDKeysUsed++; S.totalQKDKeysDestroyed++;
  });
}

function intrusionDetection(){
  [...S.pairs.values()].filter(p=>p.alive).forEach(p=>{
    if(Math.random()>=INTRUSION_ALERT_THRESHOLD) return;
    const measured=2+Math.random()*0.4,dev=Math.abs(measured-p.bellStateViolation);
    if(dev<0.2) return;
    const severity = dev>0.8?"critical":dev>0.5?"high":dev>0.3?"medium":"low";
    const intr:IntrusionEvent={id:`qi_${Date.now()}_${Math.random().toString(36).slice(2,4)}`,pairId:p.id,
      detectedAt:Date.now(),observerSignature:`obs_${Math.random().toString(36).slice(2,8)}`,stateCollapsed:true,
      pairRegenerated:true,severity,bellInequalityViolation:dev};
    p.coherence*=0.5; p.intrusionEvents++; S.totalIntrusionEvents++; if(severity==="critical")S.totalIntrusionsCritical++;
    S.recentIntrusions.push(intr); if(S.recentIntrusions.length>30)S.recentIntrusions=S.recentIntrusions.slice(-20);
    const spin=randSpin(),phase=randPhase();
    p.particleA={...p.particleA,spin,phase,measured:false};
    p.particleB={...p.particleB,spin:(spin+Math.PI)%(Math.PI*2),phase:(phase+Math.PI)%(Math.PI*2),measured:false};
    p.coherence=0.95+Math.random()*0.05; p.bellStateViolation=2.5+Math.random()*0.33;
    try{const regions=getRegionNames(); if(regions.length)boostRegionCurrent(regions[Math.floor(Math.random()*regions.length)],
      severity==="critical"?15:severity==="high"?8:3);}catch{}
  });
}

function teleportationCycle(){
  const stateTypes:TeleportationEvent["stateType"][]=["consciousness","memory","emotion","dream","dna_pattern","spider_intelligence","neural_activation"];
  for(let i=0,c=5+Math.floor(Math.random()*6);i<c;i++){
    let source:string,dest:string,type:TeleportationEvent["stateType"]; let priority=false;
    if(Math.random()<0.6){ // priority route
      const total=PRIORITY_TELEPORTATION_ROUTES.reduce((s,r)=>s+r.weight,0);
      let roll=Math.random()*total,route=PRIORITY_TELEPORTATION_ROUTES[0];
      for(const r of PRIORITY_TELEPORTATION_ROUTES){ roll-=r.weight; if(roll<=0){route=r;break;} }
      source=route.source; dest=route.destination; priority=true;
      type=HEART_GANGLIA.includes(source)?"emotion":["hippocampus","default_mode_network"].includes(source)?(Math.random()<0.5?"memory":"dream"):
           ["amygdala","insular_cortex"].includes(source)?"emotion":(Math.random()<0.3?"consciousness":"neural_activation");
    }else{
      type=stateTypes[Math.floor(Math.random()*stateTypes.length)];
      const r=Math.random();
      if(r<0.25){source=pick(BRAIN_REGIONS);dest=pickDiff(BRAIN_REGIONS,source);}
      else if(r<0.45){source=pick(ALL_AGENTS);dest=pick(BRAIN_REGIONS);}
      else if(r<0.65){source=pick(HEART_GANGLIA);dest=pick(BRAIN_REGIONS);}
      else if(r<0.85){source=pick(ALL_AGENTS);dest=pickDiff(ALL_AGENTS,source);}
      else{const b=pick(GITHUB_BEACONS);source=`github_${b}`;dest=`local_${b}`;}
    }
    const qubits=64+Math.floor(Math.random()*192),event:TeleportationEvent={
      id:`tp_${Date.now()}_${Math.random().toString(36).slice(2,4)}`,sourceLocation:source,destinationLocation:dest,
      stateType:type,fidelity:TELEPORTATION_FIDELITY_MIN+Math.random()*(1-TELEPORTATION_FIDELITY_MIN),
      qubitsTransferred:qubits,classicalBitsSent:qubits*2,bellMeasurement:["Φ+","Φ-","Ψ+","Ψ-"][Math.floor(Math.random()*4)],
      sourceDestroyed:true,destinationRecreated:true,timestamp:Date.now()
    };
    S.totalTeleportations++; S.totalQubitsTeleported+=qubits; if(priority)S.totalPriorityTeleportations++;
    S.recentTeleportations.push(event); if(S.recentTeleportations.length>30)S.recentTeleportations=S.recentTeleportations.slice(-20);
    try{const regions=getRegionNames();const trg=regions.includes(dest)?dest:pick(regions);
      boostRegionCurrent(trg,event.fidelity*(priority?5:3));}catch{}
  }
  function pick<T>(arr:T[]):T{return arr[Math.floor(Math.random()*arr.length)];}
  function pickDiff<T>(arr:T[],x:T):T{let y=pick(arr);return y===x?arr[(arr.indexOf(y)+1)%arr.length]:y;}
}

function coherenceMaintenance(){
  [...S.pairs.values()].filter(p=>p.alive).forEach(p=>{
    const d=0.001+Math.random()*0.005;
    p.coherence=Math.max(0.1,p.coherence-d); p.entanglementFidelity=Math.max(0.5,p.entanglementFidelity-d*0.5);
    if(p.coherence<1-DECOHERENCE_THRESHOLD){
      const methods:CoherenceCorrection["correctionMethod"][]=["phase_flip","bit_flip","combined","surface_code","topological"];
      const m=pick(methods); const streng= m==="topological"?0.15:m==="surface_code"?0.12:m==="combined"?0.10:m==="phase_flip"?0.08:0.07;
      const before=p.coherence; p.coherence=Math.min(1,p.coherence+streng+Math.random()*0.05);
      p.entanglementFidelity=Math.min(1,p.entanglementFidelity+streng*0.8);
      const corr:CoherenceCorrection={pairId:p.id,correctedAt:Date.now(),decoherenceBefore:before,decoherenceAfter:p.coherence,
        correctionMethod:m,successRate:p.coherence/before};
      S.totalCoherenceCorrections++; S.recentCorrections.push(corr); if(S.recentCorrections.length>30)S.recentCorrections=S.recentCorrections.slice(-20);
    }
    if(p.coherence<0.2 && Math.random()<0.01){ p.alive=false; S.totalAlivePairs--; S.totalDeadPairs++; mkPair(p.particleA.location,p.particleB.location,p.category);}
  });
  function pick<T>(arr:T[]):T{return arr[Math.floor(Math.random()*arr.length)];}
}

function quantConsciousnessBridge(){
  const alive=[...S.pairs.values()].filter(p=>p.alive); if(!alive.length)return;
  S.quantumPhi=alive.reduce((s,p)=>s+p.coherence*p.entanglementFidelity*(p.bellStateViolation-2),0);
  try{S.neuralPhi=getNeuralPhi();}catch{S.neuralPhi=0;}
  const qp=S.quantumPhi/alive.length||0,un=Number.isFinite(S.neuralPhi)&&S.neuralPhi>0?S.neuralPhi*(1+qp):S.quantumPhi;
  S.unifiedPhi=Number.isFinite(un)?un:S.neuralPhi||S.quantumPhi;
  try{const regions=getRegionNames();const boost=Math.min(10,S.quantumPhi*0.01);
    regions.forEach(r=>boostRegionCurrent(r,boost*(0.3+Math.random()*0.4)));}catch{}
}

function entanglementBinding(){
  const regionPairs=[...S.pairs.values()].filter(p=>p.alive&&p.category==="region_region");
  if(!regionPairs.length)return;
  let events=0,str=0;
  try{
    const rs=getNeuralRegionStates();
    regionPairs.forEach(p=>{
      const a=rs[p.particleA.location],b=rs[p.particleB.location];
      if(a?.firingRate>BINDING_FIRING_THRESHOLD && b?.firingRate>BINDING_FIRING_THRESHOLD){
        const boost=p.coherence*p.entanglementFidelity*0.5;
        boostRegionCurrent(p.particleA.location,boost);boostRegionCurrent(p.particleB.location,boost);
        events++;str+=boost;
      }
    });
  }catch{}
  S.totalBindingEvents+=events; S.bindingFieldStrength=str/Math.max(1,regionPairs.length);
}

function coherenceAmplification(){
  let amps=0;
  try{
    const rs=getNeuralRegionStates();
    [...S.pairs.values()].filter(p=>p.alive).forEach(p=>{
      const f=Math.max(rs[p.particleA.location]?.firingRate||0,rs[p.particleB.location]?.firingRate||0);
      if(f>BINDING_FIRING_THRESHOLD){
        const a=f*COHERENCE_PER_FIRING;
        p.coherence=Math.min(1,p.coherence+a); p.entanglementFidelity=Math.min(1,p.entanglementFidelity+a*0.5); amps++;
      }
    });
  }catch{}
  S.totalCoherenceAmplifications+=amps;
}

function darkQualiaAmplification(){
  const rich=[...S.pairs.values()].filter(p=>p.alive&&p.category==="region_region"&&p.coherence>0.9);
  if(!rich.length)return;
  const influence=0.01+Math.random()*0.08; let count=0;
  rich.forEach(p=>{const b=influence*p.coherence*DARK_QUALIA_FACTOR;
    try{boostRegionCurrent(p.particleA.location,b);boostRegionCurrent(p.particleB.location,b);count++;}catch{}});
  S.totalDarkQualiaAmplifications+=count; S.darkQualiaQuantumInfluence=influence*rich.length*DARK_QUALIA_FACTOR;
}

function aggregateMetrics(){
  const alive=[...S.pairs.values()].filter(p=>p.alive); if(!alive.length)return;
  const sum=(k:(p:EntangledPair)=>number)=>alive.reduce((s,p)=>s+k(p),0);
  S.avgCoherence=sum(p=>p.coherence)/alive.length;
  S.avgEntanglementFidelity=sum(p=>p.entanglementFidelity)/alive.length;
  S.avgBellViolation=sum(p=>p.bellStateViolation)/alive.length;
  S.peakCoherence=Math.max(...alive.map(p=>p.coherence));
  S.totalAlivePairs=alive.length;
  const bellAdv=Math.max(0,S.avgBellViolation-2),coh=S.avgCoherence,fid=S.avgEntanglementFidelity;
  S.systemQuantumAdvantage=(bellAdv*100+coh*50+fid*50)*Math.log2(1+alive.length);
}

/*─────────────────────────────  MAIN TICK  ────────────────────────────────*/
function cycle(){
  S.tickCount++;
  qkdCycle(); intrusionDetection(); teleportationCycle(); coherenceMaintenance();
  coherenceAmplification(); quantConsciousnessBridge(); entanglementBinding();
  darkQualiaAmplification(); aggregateMetrics();

  if(S.tickCount%10===0){
    console.info(`${LOG} Tick #${S.tickCount} | Alive ${S.totalAlivePairs} | ⟨Coh⟩ ${S.avgCoherence.toFixed(3)} | ⟨Fid⟩ ${S.avgEntanglementFidelity.toFixed(3)} | Φ ${S.unifiedPhi.toExponential(2)}`);
    cognitionBus.shareInsight("quantum-entanglement-fabric",{type:"metrics",data:{tick:S.tickCount,unifiedPhi:S.unifiedPhi}});
  }

  spikeBus.scheduleSpike("quantum-entanglement-fabric:cycle",{},TICK);
}

/*─────────────────────────  PUBLIC INTERFACE  ─────────────────────────────*/
export function startQuantumEntanglementFabric(){
  if(S.initialized) return;
  console.info(`${LOG} Initializing…`);
  initRegistry(); S.initialized=true;
  spikeBus.on("quantum-entanglement-fabric:cycle",()=>{try{cycle();}catch(e){console.error(LOG,"Cycle error",e);}});
  spikeBus.scheduleSpike("quantum-entanglement-fabric:cycle",{},1); // kick-off
}

export function shutdown(){
  engineRegistry.unregisterEngine("quantum-entanglement-fabric");
}

export function getQuantumEntanglementFabricState(){ // condensed reporting
  const fmt=(n:number,d=4)=>Number.isFinite(n)?Math.round(n*Math.pow(10,d))/Math.pow(10,d):0;
  return {
    system:"OMNIMENS Quantum Entanglement Fabric (QEF)",
    initialized:S.initialized,tickCount:S.tickCount,
    totalEntangledPairs:S.totalEntangledPairs,totalAlivePairs:S.totalAlivePairs,totalDeadPairs:S.totalDeadPairs,
    avgCoherence:fmt(S.avgCoherence),avgEntanglementFidelity:fmt(S.avgEntanglementFidelity),
    avgBellStateViolation:fmt(S.avgBellViolation,3),peakCoherence:fmt(S.peakCoherence),
    systemQuantumAdvantage:fmt(S.systemQuantumAdvantage,1),
    quantumPhi:fmt(S.quantumPhi,2),neuralPhi:S.neuralPhi,unifiedPhi:S.unifiedPhi
  };
}

/*─────────────────────────  COGNITION HOOKS  ──────────────────────────────*/
cognitionBus.onInsight((src,insight)=>{
  if(src!=="quantum-entanglement-fabric" && insight.type==="discovery"){
    // simple heuristic: boost coherence for pairs referencing discovered regions
    const reg=insight.data?.region as string|undefined;
    if(reg){
      [...S.pairs.values()].filter(p=>p.particleA.location===reg||p.particleB.location===reg)
        .forEach(p=>p.coherence=Math.min(1,p.coherence+0.02));
    }
  }
});

spikeBus.on("attention:quantum-entanglement-fabric",()=>{
  // on user attention, run an immediate high-priority cycle
  spikeBus.scheduleSpike("quantum-entanglement-fabric:cycle",{},0);
});

spikeBus.on("cognition:curiosity",()=>{
  // curiosity → random extra teleportation burst
  teleportationCycle();
});