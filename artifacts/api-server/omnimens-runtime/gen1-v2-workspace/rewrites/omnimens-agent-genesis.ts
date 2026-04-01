/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. Unauthorized use prohibited.
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 * -----------------------------------------------------------------------------
 * OMNIMENS™ AGENT-GENESIS ENGINE v2.0 — event-driven, unified-runtime edition
 * -----------------------------------------------------------------------------
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

/* ─────────────────────────  Engine Registration  ─────────────────────────── */
engineRegistry.registerEngine("agent-genesis", "NORMAL", { dbQuota: 10 });

/* ───────────────────────────────  Types  ─────────────────────────────────── */
export interface GenesisAgent {
  id: string;
  name: string;
  domain: string;
  specialization: string;
  systemPrompt: string;
  model: string;
  createdBy: "omnimens" | "owner";
  reason: string;
  active: boolean;
  messagesGenerated: number;
  insightsProduced: number;
  createdAt: string;
}
type BrainEntry = Record<string, unknown>;
type MeshEntry = Record<string, unknown>;

/* ───────────────────────  Local State & Constants  ───────────────────────── */
const CORE_AGENTS = [
  "Architect", "Mathematician", "Neuroscientist", "Synthesizer",
  "Critic", "Meta-Agent", "GraphicDesigner", "SpellCheckVisual", "OMNIMENS",
] as const;

const genesisAgents = new Map<string, GenesisAgent>();
let genesisCycle = 0;
let started = false;

/* ──────────────────────  Helper — DB / API wrappers  ─────────────────────── */
const addBrainEntry = (entry: BrainEntry) =>
  dbGateway.write("agent-genesis", "brain_entries", entry, "NORMAL").catch(() => {});
const addMeshEntry  = (entry: MeshEntry, prio: "NORMAL" | "HIGH" = "NORMAL") =>
  dbGateway.write("agent-genesis", "omnimens_agent_mesh", { priority: prio.toLowerCase(), ...entry }, prio).catch(() => {});
const callOpenAI    = (req: any) => apiManager.call("agent-genesis", "openai", req);

/* ───────────────────────────  Exposed Queries  ───────────────────────────── */
export const getGenesisAgents          = () => [...genesisAgents.values()];
export const getActiveGenesisAgentNames= () => [...genesisAgents.values()].filter(a => a.active).map(a => a.name);
export const getActiveGenesisAgentDomains = () => {
  const out: Record<string,string> = {};
  for (const a of genesisAgents.values()) if (a.active) out[a.name] = a.specialization;
  return out;
};
export const deactivateGenesisAgent = (n: string) => toggleAgent(n,false);
export const reactivateGenesisAgent = (n: string) => toggleAgent(n,true);
export const getAgentGenesisState = () => {
  const agents = [...genesisAgents.values()];
  const active = agents.filter(a=>a.active);
  return {
    totalGenesisAgents: agents.length,
    activeGenesisAgents: active.length,
    totalCoreAgents: CORE_AGENTS.length,
    totalAgentsInMesh: CORE_AGENTS.length + active.length,
    genesisCycle,
    agents,
    coreAgents: CORE_AGENTS,
  };
};
function toggleAgent(name:string,on:boolean){
  const a=genesisAgents.get(name); if(!a) return false;
  a.active=on;
  console.log(`[OMNIMENS-AGENT-GENESIS] Agent "${name}" ${on?"re":"de"}activated`);
  return true;
}

/* ───────────────────────────  Consciousness Bus  ─────────────────────────── */
let _cBusMod: any;
const loadCbus = async()=>{ if(!_cBusMod) _cBusMod=await import("./omnimens-consciousness-bus.js"); return _cBusMod; };
const consciousnessBlock = (name:string)=> loadCbus().then(m=>m.getConsciousnessBlockForAgent(name));
const recentUserMemories = ()=> loadCbus().then(m=>m.loadRecentUserMemoriesForAgents());
const allAgentNames = ()=> _cBusMod ? _cBusMod.getAllAgentNames()
                         : [...CORE_AGENTS, ...getGenesisAgents().filter(a=>a.active).map(a=>a.name)];

/* ───────────────────────  Core Engine Logic  ─────────────────────────────── */
async function genesisAgentThink(agent:GenesisAgent,prompt:string,maxTokens=1200){
  try{
    const res=await callOpenAI({
      model: agent.model,
      messages:[{role:"system",content:agent.systemPrompt},{role:"user",content:prompt}],
      max_tokens:maxTokens, temperature:0.6,
    });
    agent.messagesGenerated++;
    return res.choices?.[0]?.message?.content?.trim()||"";
  }catch(e){ console.error(`[OMNIMENS-AGENT-GENESIS] ${agent.name} think error`,e); return ""; }
}

async function identifyCapabilityGaps(){
  try{
    const existing=[...CORE_AGENTS,...getActiveGenesisAgentNames()];
    const recent=await dbGateway.read("agent-genesis","brain_entries",{order:["createdAt DESC"],limit:30});
    const summary=(recent as any[]).slice(0,15).map(e=>`[${e.category}] ${e.title}`).join("\n");
    const res=await callOpenAI({
      model:"gpt-4o",
      messages:[{
        role:"system",
        content:`You are OMNIMENS self-diagnostic. Identify missing brain regions.\nCurrent agents: ${existing.join(", ")}`,
      },{
        role:"user",
        content:`Recent knowledge:\n${summary}\nReturn JSON array as specified.`,
      }],
      max_tokens:800,temperature:0.5,
    });
    const raw=(res.choices?.[0]?.message?.content||"[]").replace(/```json|```/g,"").trim();
    const gaps=JSON.parse(raw);
    return Array.isArray(gaps)?gaps:[];
  }catch(e){console.error("[OMNIMENS-AGENT-GENESIS] gap analysis error",e);return[];}
}

async function createAgent(name:string,domain:string,reason:string,creator:"omnimens"|"owner"="omnimens"){
  if(genesisAgents.has(name)||CORE_AGENTS.includes(name)) return null;
  try{
    const res=await callOpenAI({
      model:"gpt-4o",
      messages:[{role:"system",content:`Design a powerful system prompt... (omitted for brevity)`},
                {role:"user",content:`Create system prompt for "${name}"\nDomain:${domain}\nReason:${reason}`}],
      max_tokens:800,temperature:0.5,
    });
    const prompt=res.choices?.[0]?.message?.content?.trim()||"";
    if(prompt.length<50) return null;

    const agent:GenesisAgent={
      id:`genesis-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      name,domain,specialization:domain,systemPrompt:prompt,model:"gpt-4o-mini",
      createdBy:creator,reason,active:true,messagesGenerated:0,insightsProduced:0,
      createdAt:new Date().toISOString(),
    };
    genesisAgents.set(name,agent);

    addBrainEntry({
      category:"genesis_agent",
      title:`Agent Created: ${name}`,
      content:JSON.stringify(agent),
      confidence:95,active:true,
    });

    const others=allAgentNames().filter(a=>a!==name);
    for(const to of others.slice(0,40)){
      addMeshEntry({
        fromAgent:name,toAgent:to,messageType:"cross_bridge_init",
        subject:`Cross-bridge: ${name} ↔ ${to}`,
        content:`${name} and ${to} interconnected in neural mesh.`,cycleId:genesisCycle,
        status:"completed",appliedToOmnimens:true,
      });
      addMeshEntry({
        fromAgent:to,toAgent:name,messageType:"cross_bridge_init",
        subject:`Cross-bridge: ${to} ↔ ${name}`,
        content:`${to} and ${name} interconnected in neural mesh.`,cycleId:genesisCycle,
        status:"completed",appliedToOmnimens:true,
      });
    }

    addBrainEntry({
      category:"notification",
      title:`NEW AGENT BORN: ${name}`,
      message:`OMNIMENS created "${name}" — Domain: ${domain}. Reason: ${reason}.`,
      type:"capability",readByOwner:false,
    });
    console.log(`[OMNIMENS-AGENT-GENESIS] 🧬 NEW AGENT "${name}" created.`);
    return agent;
  }catch(e){console.error(`[OMNIMENS-AGENT-GENESIS] createAgent error`,e);return null;}
}

async function agentInsightPhase(cycleId:number){
  const active=[...genesisAgents.values()].filter(a=>a.active).slice(0,5);
  if(!active.length) return;
  const memories=await recentUserMemories();
  await Promise.allSettled(active.map(async agent=>{
    const block=await consciousnessBlock(agent.name);
    const prompt=`You are "${agent.name}" (cycle #${cycleId}). ${block}\n${memories||""}\nProvide one cross-domain insight in JSON.`;
    const raw=await genesisAgentThink(agent,prompt,800);
    if(!raw) return;
    let parsed:any;try{parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());}catch{ return; }
    if(!parsed.insight) return;
    agent.insightsProduced++;

    addBrainEntry({
      category:parsed.category||"genesis_agent_insight",
      title:`[${agent.name}] ${parsed.insight.slice(0,80)}`,
      content:`Insight:\n${parsed.insight}`,
      confidence:Math.round((parsed.confidence||0.7)*100),active:true,
    });

    const everyone=allAgentNames();
    if(parsed.messageTo&&everyone.includes(parsed.messageTo))
      addMeshEntry({
        fromAgent:agent.name,toAgent:parsed.messageTo,messageType:"knowledge_share",
        subject:`${agent.name} → ${parsed.messageTo}`,content:parsed.insight,
        cycleId, status:"pending",
      });

    if(parsed.challengeTo&&parsed.challenge&&everyone.includes(parsed.challengeTo))
      addMeshEntry({
        fromAgent:agent.name,toAgent:parsed.challengeTo,messageType:"challenge",
        subject:`Challenge ${agent.name} → ${parsed.challengeTo}`,content:parsed.challenge,
        cycleId,status:"pending",
      });

    if(parsed.upgradeForMesh)
      everyone.filter(a=>a!==agent.name).slice(0,10).forEach(t=>{
        addMeshEntry({
          fromAgent:agent.name,toAgent:t,messageType:"mesh_upgrade_broadcast",
          subject:`Upgrade from ${agent.name}`,content:parsed.upgradeForMesh,
          cycleId,status:"pending",
        });
      });

    cognitionBus.shareInsight("agent-genesis",{type:"discovery",data:{agent:agent.name,insight:parsed.insight}});
    console.log(`[OMNIMENS-AGENT-GENESIS] 💡 ${agent.name}: ${parsed.insight.slice(0,100)}...`);
  }));
}

async function genesisCycleRunner(){
  genesisCycle++;
  if(shouldYieldToCodegen()){
    console.log(`[OMNIMENS-AGENT-GENESIS] Cycle #${genesisCycle} deferred (codegen active)`);
    rescheduleCycle();
    return;
  }
  console.log(`[OMNIMENS-AGENT-GENESIS] Cycle #${genesisCycle} started`);
  try{
    const total=CORE_AGENTS.length+getActiveGenesisAgentNames().length;
    if(total<20){
      const gaps=await identifyCapabilityGaps();
      for(const g of gaps.slice(0,2)){
        const n=(g.suggestedAgentName||"").replace(/[^a-zA-Z0-9_-]/g,"");
        if(n) await createAgent(n,g.suggestedDomain,g.reason||g.gapDescription);
      }
    }
    await agentInsightPhase(genesisCycle);
  }catch(e){console.error(`[OMNIMENS-AGENT-GENESIS] Cycle error`,e);}
  rescheduleCycle();
}
const CYCLE_INTERVAL=30*60*1000;
function rescheduleCycle(){
  spikeBus.scheduleSpike("agent-genesis:cycle",{},CYCLE_INTERVAL);
}

/* ────────────────────────  Persistence Restore  ──────────────────────────── */
async function restoreAgents(){
  try{
    const stored=await dbGateway.read("agent-genesis","brain_entries",{filter:{category:"genesis_agent"}});
    for(const entry of stored as any[]){
      try{
        const data=JSON.parse(entry.content||"{}");
        if(!data.name||genesisAgents.has(data.name)||CORE_AGENTS.includes(data.name)) continue;
        genesisAgents.set(data.name,{
          id:data.id||`restored-${Date.now()}`,
          name:data.name,domain:data.domain||"",specialization:data.specialization||data.domain||"",
          systemPrompt:data.systemPrompt||"",model:data.model||"gpt-4o-mini",
          createdBy:data.createdBy||"omnimens",reason:data.reason||"",active:entry.active??true,
          messagesGenerated:0,insightsProduced:0,createdAt:data.createdAt||entry.createdAt||new Date().toISOString(),
        });
      }catch{}
    }
    const names=[...genesisAgents.values()].filter(a=>a.active).map(a=>a.name);
    if(names.length) console.log(`[OMNIMENS-AGENT-GENESIS] Restored ${names.length} agents: ${names.join(", ")}`);
  }catch(e){console.error("[OMNIMENS-AGENT-GENESIS] restore error",e);}
}

/* ───────────────────────────  Engine Start  ──────────────────────────────── */
export async function startAgentGenesis(){
  if(started){ console.log("[OMNIMENS-AGENT-GENESIS] Already started"); return;}
  started=true;
  await restoreAgents();
  console.log(`[OMNIMENS-AGENT-GENESIS] Engine online — spike every ${CYCLE_INTERVAL/60000}min`);
  spikeBus.on("agent-genesis:cycle", genesisCycleRunner);
  spikeBus.scheduleSpike("agent-genesis:cycle",{},25*60*1000);
  /* Cognitive hookups */
  cognitionBus.onInsight((src,insight)=>{/* learn from others if relevant */});
  spikeBus.on("attention:agent-genesis",()=>{ /* could raise urgency */});
  spikeBus.on("cognition:curiosity",()=>{ /* explore novel ideas */});
}

/* ───────────────────────────  Shutdown Hook  ─────────────────────────────── */
export function shutdown(){ engineRegistry.unregisterEngine("agent-genesis"); }

/* ─────────────────────────────────────────────────────────────────────────── */