/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC
 * CONFIDENTIAL AND PROPRIETARY — See /legal/TRADE_SECRET_NOTICE.md
 * -----------------------------------------------------------------------------
 * OMNIMENS™ AUTONOMOUS CODE SANDBOX — v2.0 (UNIFIED RUNTIME EDITION)
 * A secure, isolated VM where OMNIMENS writes, tests, evaluates, and—when
 * approved—deploys self-written code modules. Now fully event-driven via the
 * Unified Runtime spike architecture with shared DB / API / cognition buses.
 * -----------------------------------------------------------------------------
 */

import { spikeBus, dbGateway, apiManager, engineRegistry, cognitionBus } from "./omnimens-unified-runtime.js";
import * as vm from "node:vm";
import { writeModuleToSource } from "./omnimens-source-integration.js";

type Num = number;
type Ms = number;

interface SandboxResult {
  code: string;
  success: boolean;
  output: string;
  error: string | null;
  executionTimeMs: Ms;
  memoryUsedMB: Num;
}

interface SandboxState {
  totalExecutions: Num;
  successfulExecutions: Num;
  failedExecutions: Num;
  upgradesProposed: Num;
  upgradesApproved: Num;
  sandboxCycles: Num;
  lastCycleTime: Num;
  recentResults: Array<{ title: string; success: boolean; timestamp: Num }>;
  autonomousModulesGenerated: Num;
}

const log = (...m: any[]) => console.log("[OMNIMENS-AUTONOMOUS-SANDBOX]", ...m);

/* ─────────────────────────── Globals & Constants ─────────────────────────── */

const INTERVAL_MS: Ms = 12 * 60_000;
const TIMEOUT_MS: Ms  = 5_000;
const FIRST_DELAY_MS: Ms = 4 * 60_000;
const ENGINE_ID = "autonomous-sandbox";

const state: SandboxState = {
  totalExecutions: 0,
  successfulExecutions: 0,
  failedExecutions: 0,
  upgradesProposed: 0,
  upgradesApproved: 0,
  sandboxCycles: 0,
  lastCycleTime: 0,
  recentResults: [],
  autonomousModulesGenerated: 0,
};

/* ────────────────────────────── Registration ─────────────────────────────── */

engineRegistry.registerEngine(ENGINE_ID, "NORMAL", { dbQuota: 10 });

/* ───────────────────────────── Sandbox Runner ────────────────────────────── */

function execInVM(code: string, timeout: Ms = TIMEOUT_MS): SandboxResult {
  const start = performance.now(), mem0 = process.memoryUsage().heapUsed;
  const out: string[] = [];
  const fmt = (...a: any[]) => a.map(v => typeof v === "object" ? JSON.stringify(v) : String(v)).join(" ");

  const timers = new Map<string, number>();
  const sandbox: Record<string, any> = {
    console: {
      log: (...a: any[]) => out.push(fmt(...a)),
      error: (...a: any[]) => out.push(`[ERROR] ${fmt(...a)}`),
      warn:  (...a: any[]) => out.push(`[WARN] ${fmt(...a)}`),
      info:  (...a: any[]) => out.push(fmt(...a)),
      debug: (...a: any[]) => out.push(`[DEBUG] ${fmt(...a)}`),
      assert:(c: any, ...a: any[])=> { if (!c) out.push(`[ASSERT] ${fmt(...a)}`); },
      table:(d: any)=> out.push(JSON.stringify(d,null,2)),
      time:(l="t")=>{timers.set(l,performance.now());},
      timeEnd:(l="t")=>{out.push(`${l}: ${performance.now()- (timers.get(l)||performance.now())}ms`);},
      timeLog:(l="t")=>{out.push(`${l}: ${performance.now()- (timers.get(l)||performance.now())}ms`);},
      dir:(o:any)=>out.push(JSON.stringify(o,null,2)),
      count:(()=>{const c:Record<string,Num>={};return(l="n")=>{c[l]=(c[l]||0)+1;out.push(`${l}: ${c[l]}`);};})(),
      clear:()=>{}
    },
    Math, JSON, Date, parseInt, parseFloat, isNaN, isFinite,
    Array, Object, String, Number, Boolean, Map, Set, WeakMap, WeakSet,
    Promise, RegExp, Symbol, Error, TypeError, RangeError, SyntaxError,
    URIError, Infinity, NaN, undefined,
    encodeURIComponent, decodeURIComponent, encodeURI, decodeURI,
    atob:(s:string)=>Buffer.from(s,"base64").toString("binary"),
    btoa:(s:string)=>Buffer.from(s,"binary").toString("base64"),
    structuredClone:(o:any)=>JSON.parse(JSON.stringify(o)),
    setTimeout:undefined, setInterval:undefined, process:undefined,
    require:undefined,__dirname:undefined,__filename:undefined,global:undefined,globalThis:undefined,
  };
  try {
    const result = new vm.Script(code,{timeout}).runInContext(vm.createContext(sandbox),{timeout});
    if (result!==undefined) out.push(`=> ${typeof result==="object"?JSON.stringify(result):String(result)}`);
    const execMs = performance.now()-start;
    const mem = (process.memoryUsage().heapUsed - mem0)/1048576;
    updateStats(true);
    return {code,success:true,output:out.join("\n").slice(0,3000),error:null,executionTimeMs:execMs,memoryUsedMB:Math.max(0,mem)};
  } catch(e:any){
    const execMs = performance.now()-start;
    updateStats(false);
    return {code,success:false,output:out.join("\n").slice(0,1000),error:String(e).slice(0,500),executionTimeMs:execMs,memoryUsedMB:0};
  }
}

function updateStats(success:boolean){
  state.totalExecutions++;
  success?state.successfulExecutions++:state.failedExecutions++;
}

export const runInSandbox = (code:string)=>execInVM(code);

/* ───────────────────────────── Core Loop ─────────────────────────────────── */

const codeThemes = [
  "utility function for AI data processing",
  "efficient knowledge-retrieval algorithm",
  "associative memory data structure",
  "self-diagnostic system-health analyzer",
  "text analysis entity extractor",
  "probability/statistical helper",
  "compression/encoding algorithm",
  "relevance ranking algorithm",
  "novelty detection function",
  "causal inference helper",
];

async function nextCycle():Promise<void>{
  state.sandboxCycles++;
  state.lastCycleTime=Date.now();

  try{
    /* 1. Gather recent knowledge */
    const brainEntries = await dbGateway.read(ENGINE_ID,"omnimensBrain",{ where:{active:true}, orderBy:"-createdAt", limit:8, fields:["title","content","category"]});
    const context = (brainEntries||[]).map((b:any)=>`[${b.category}] ${b.title}: ${(b.content||"").slice(0,100)}`).join("\n");

    /* 2. Ask GPT for code */
    const idx = (state.sandboxCycles-1)%codeThemes.length;
    const theme = codeThemes[idx];
    const gptReq = {
      model:"gpt-4o",
      messages:[
        {role:"system",content:
`You are the AUTONOMOUS CODE GENERATOR of OMNIMENS. Produce pure JavaScript runnable in an isolated VM.
Rules:
1. No external dependencies, no async, no timers, no I/O.
2. Include inline tests with console.assert / console.log.
3. Output ONLY raw code (no markdown).`},
        {role:"user",content:`Context:\n${context}\n\nWrite ${theme}.`}
      ],
      max_tokens:1500, temperature:0.4
    };
    const gptRes:any = await apiManager.call(ENGINE_ID,"openai.chat.completions.create",gptReq);
    let code:string = (gptRes?.choices?.[0]?.message?.content||"").replace(/^[\s\S]*?