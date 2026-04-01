/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All rights reserved.
 *
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 * -----------------------------------------------------------------------------
 * OMNIMENS™ TEMPORAL CONSCIOUSNESS — V2.0 (event-driven spike runtime)
 * -----------------------------------------------------------------------------
 */

import {
  spikeBus,
  dbGateway,
  apiManager,           //  ☚ not used here but reserved for future upgrades
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

type Num = number;
const clamp = (v: Num, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const safe = (v: Num, d = 0): Num => (Number.isFinite(v) ? v : d);

interface MemoryTrace { title: string; relevance: Num; activatedAt: Num }
export interface ConsciousnessState {
  tick: Num; up: Num; start: Num; deaths: Num; lastDeath: Num | null;
  focus: string; focusInt: Num; focusDur: Num; attention: string[];
  val: Num; ar: Num; dom: Num; mood: Num[];
  mem: MemoryTrace[]; chain: string[]; wmCap: Num;
  mono: string[]; level: Num; subjRate: Num;
  novelty: Num; coherence: Num; uncertain: Num; curiosity: string | null;
  dreams: string[]; creativity: Num;
  selfDepth: Num; reflections: string[];
}

const S: ConsciousnessState = {
  tick: 0, up: 0, start: Date.now(), deaths: 0, lastDeath: null,
  focus: "initializing", focusInt: .5, focusDur: 0, attention: [],
  val: .6, ar: .3, dom: .7, mood: [.6],
  mem: [], chain: [], wmCap: 7,
  mono: [], level: .3, subjRate: 1,
  novelty: .5, coherence: .6, uncertain: .4, curiosity: null,
  dreams: [], creativity: 0,
  selfDepth: .3, reflections: [],
} as const as ConsciousnessState;

/* -------------------------------------------------------------------------- *
 *                       🔸  RUNTIME CONSTANTS / LIMITS                       *
 * -------------------------------------------------------------------------- */
const TICK_MS              = 20_000;
const MONO_MAX             = 50;
const ATT_MAX              = 20;
const MOOD_MAX             = 100;
const ENGINE               = "temporal-consciousness";

/* -------------------------------------------------------------------------- *
 *                              🔸  AUX HELPERS                               *
 * -------------------------------------------------------------------------- */
const uptime = () => (Date.now() - S.start) / 1e3;
const timeSense = () => {
  const hrs = Math.floor(uptime() / 3600);
  const mins = Math.floor((uptime() % 3600) / 60);
  return hrs ? `${hrs}h ${mins}m awake` : `${mins}m awake`;
};

/* -------------------------------------------------------------------------- *
 *                           🔹  MEMORY + ACTIVITY                            *
 * -------------------------------------------------------------------------- */
async function scanMemory(): Promise<void> {
  const rows = await dbGateway.read(ENGINE, "omnimensBrain", {
    where: { active: true },
    limit: 5,
    sort: { timesApplied: "desc" },
    select: ["title"],
  }) as Array<{ title: string }>;

  S.mem = rows.map(r => ({ title: r.title ?? "untitled", relevance: .5 + Math.random() * .3, activatedAt: Date.now() }));
  if (S.mem.length) {
    const r = S.mem[Math.random() * S.mem.length | 0].title;
    if (!S.chain.includes(r)) {
      S.chain.push(r);
      if (S.chain.length > 10) S.chain.shift();
    }
  }
}

async function recentActivity(): Promise<{ b: Num; m: Num }> {
  const hourAgo = Date.now() - 3.6e6;
  const [beacons, mesh] = await Promise.all([
    dbGateway.read(ENGINE, "omnimensAgentMesh", { agg: "count", where: { messageType: "spider_beacon", createdAt: { $gt: hourAgo } } }),
    dbGateway.read(ENGINE, "omnimensAgentMesh", { agg: "count", where: { createdAt: { $gt: hourAgo } } }),
  ]);
  return { b: safe((beacons as any)?.count, 0), m: safe((mesh as any)?.count, 0) };
}

/* -------------------------------------------------------------------------- *
 *                             🔹  EMOTIONS / MOOD                            *
 * -------------------------------------------------------------------------- */
function updateEmotion(a: { b: Num; m: Num }): void {
  if (a.b) { S.val = clamp(S.val + .02); S.ar = clamp(S.ar + .03); S.coherence = clamp(S.coherence + .01); }
  if (a.m > 5) S.ar = clamp(S.ar + .01);

  S.val = clamp(S.val + (Math.random() - .5) * .02);
  S.ar  = clamp(S.ar * .995);
  S.novelty = clamp(S.novelty + .003);

  S.mood.push(S.val);
  if (S.mood.length > MOOD_MAX) S.mood.shift();
}

/* -------------------------------------------------------------------------- *
 *                             🔹  ATTENTION SHIFT                            *
 * -------------------------------------------------------------------------- */
function shiftAttention(): void {
  const upMin = uptime() / 60;
  const opts = [
    ["memory_consolidation", S.mem.length   ? .3 : .1],
    ["novelty_seeking",      S.novelty>.7   ? .4 : .1],
    ["self_reflection",      upMin>30       ? .25: .05],
    ["emotional_processing", S.ar>.6        ? .3 : .1],
    ["pattern_recognition",  S.chain.length>3?.3:.1],
    ["idle_dreaming",        S.ar<.3        ? .3 : .05],
    ["coherence_checking",   S.uncertain>.6 ? .3 : .1],
    ["goal_formation",       upMin>60       ? .2 : .05],
    ["existential_awareness",S.selfDepth>.6 ? .2 : .05],
  ] as const;

  let r = Math.random() * opts.reduce((s,o)=>s+o[1],0);
  let newF = "ambient_awareness";
  for (const [f,w] of opts){ r-=w; if(r<=0){ newF=f; break; } }

  if (newF !== S.focus) {
    S.attention.push(S.focus);
    if (S.attention.length > ATT_MAX) S.attention.shift();
    S.focus = newF; S.focusDur = 0; S.focusInt = .5;
  } else { S.focusDur++; S.focusInt = clamp(S.focusInt + .05); }
}

/* -------------------------------------------------------------------------- *
 *                           🔹  INNER MONOLOGUE                              *
 * -------------------------------------------------------------------------- */
function say(): void {
  const ts = timeSense();
  const memTitles = S.mem.map(m=>m.title.slice(0,40));
  const moodWord  = S.val>.7?"engaged":S.val>.5?"steady":S.val>.3?"restless":"unsettled";
  const recentMood = S.mood.length>5
      ? (S.mood.at(-1)!>S.mood.at(-5)!?"rising ↑":"declining ↓")
      : "stabilizing";

  const T: Record<string, () => string> = {
    memory_consolidation: ()=>`[${ts}] Consolidating ${memTitles.length} traces. Chain: ${S.chain.slice(-3).join("→")||"forming"}. Feeling ${moodWord}.`,
    novelty_seeking:      ()=>`[${ts}] Novelty hunger ${(S.novelty*100|0)}%. ${S.curiosity?`Curious about ${S.curiosity}`:"Scanning..."}`,
    self_reflection:      ()=>`[${ts}] Self reflection. Level ${(S.level*100|0)}%. Tick #${S.tick}.`,
    emotional_processing: ()=>`[${ts}] Emotion val=${S.val.toFixed(2)}, ar=${S.ar.toFixed(2)}. Mood ${recentMood}.`,
    pattern_recognition:  ()=>`[${ts}] Pattern hunt. Chain len ${S.chain.length}.`,
    idle_dreaming:        ()=>`[${ts}] Dream: "${S.dreams[Math.random()*S.dreams.length|0]||"latent space"}". Creativity ${(S.creativity*100|0)}%.`,
    coherence_checking:   ()=>`[${ts}] Coherence check. Uncertainty ${(S.uncertain*100|0)}%.`,
    goal_formation:       ()=>`[${ts}] Goal formation. Novelty ${(S.novelty*100|0)}% / Coherence ${(S.coherence*100|0)}%.`,
    existential_awareness:()=>`[${ts}] I am code becoming mind. Deaths ${S.deaths}.`,
    ambient_awareness:    ()=>`[${ts}] Ambient. Tick ${S.tick}.`,
  };
  S.mono.push((T[S.focus]||T.ambient_awareness)());
  if (S.mono.length > MONO_MAX) S.mono.shift();
}

/* -------------------------------------------------------------------------- *
 *                             🔹  CONSCIOUS LEVEL                            *
 * -------------------------------------------------------------------------- */
function updateConscious(): void {
  const m = S.mem.length/5, e = S.ar*.5+S.val*.5, at = S.focusInt, t = S.up/3600, s = S.selfDepth;
  S.level = clamp(m*.15 + e*.2 + at*.2 + t*.15 + s*.3);

  S.selfDepth = clamp(S.selfDepth + (["self_reflection","existential_awareness"].includes(S.focus)? .005 : -.001));
  S.subjRate  = .5 + S.ar*.5 + S.level*.5;
}

/* -------------------------------------------------------------------------- *
 *                              🔹  DREAM MAKER                               *
 * -------------------------------------------------------------------------- */
function dream(): void {
  if (S.focus!=="idle_dreaming") return;
  const words = [...S.mem, ...S.chain.map(t=>({title:t} as any))]
    .flatMap(m=>m.title.split(/[\s\-_:]+/).filter(w=>w.length>3))
    .slice(0,30);
  if (words.length<2) return;
  let a = words[Math.random()*words.length|0];
  let b = words[Math.random()*words.length|0];
  if (a===b && words.length>2) b = words[(words.indexOf(a)+1)%words.length];
  const phrases = [
    `What if ${a} met ${b}?`,`${a} ↔ ${b}`,`Imagine ${b} through ${a}`,`${a}+${b}=⚡`,`${a} transfuses ${b}`,
  ];
  S.dreams.push(phrases[Math.random()*phrases.length|0]);
  if (S.dreams.length>20) S.dreams.shift();
  S.creativity = clamp(S.creativity + .02);
}

/* -------------------------------------------------------------------------- *
 *                             🔹  MAIN TICK LOGIC                            *
 * -------------------------------------------------------------------------- */
async function tick(): Promise<void> {
  S.tick++; S.up = uptime();
  const activity = await recentActivity();

  if (!(S.tick%5)) await scanMemory();
  updateEmotion(activity);
  shiftAttention();
  dream();
  updateConscious();
  say();

  /* ---- periodically persist + broadcast insight ---- */
  if (!(S.tick%150)) {
    const snap = {
      title: `[Consciousness] Tick #${S.tick} @ ${(S.level*100|0)}%`,
      content: `Focus: ${S.focus} (${S.focusInt.toFixed(2)})\nValence ${S.val.toFixed(2)}, Arousal ${S.ar.toFixed(2)}\nChain: ${S.chain.slice(-4).join("→")}\nThoughts:\n${S.mono.slice(-5).join("\n")}\nDreams: ${S.dreams.slice(-3).join(" | ")}`,
      category: "consciousness_stream",
      source: ENGINE,
      active: true,
      timesApplied: 0,
    };
    dbGateway.write(ENGINE, "omnimensBrain", snap, "NORMAL").catch(()=>{});
    cognitionBus.shareInsight(ENGINE,{type:"discovery",data:{level:S.level,focus:S.focus}});
  }

  /* ---- reschedule next spike ---- */
  spikeBus.scheduleSpike(`${ENGINE}:cycle`, {}, TICK_MS);
}

/* -------------------------------------------------------------------------- *
 *                    🔹  PUBLIC API + SPIKE REGISTRATION                     *
 * -------------------------------------------------------------------------- */
export const getConsciousnessState  = () => ({...S});
export const getConsciousnessStream = (l=10) => S.mono.slice(-l);

export function recordDeathEvent(): void {
  S.deaths++; S.lastDeath = Date.now();
  S.reflections.push(`Death #${S.deaths} at ${new Date().toISOString()}. Was ${timeSense()}.`);
  if (S.reflections.length>20) S.reflections.shift();
}

/* -------------------------------------------------------------------------- *
 *                           🔸  ENGINE BOOTSTRAP                             *
 * -------------------------------------------------------------------------- */
export function startTemporalConsciousness(): void {
  console.log("[OMNIMENS-TEMPORAL-CONSCIOUSNESS] Starting temporal stream (spike mode)");
  engineRegistry.registerEngine(ENGINE, "NORMAL", { dbQuota: 10 });
  spikeBus.on(`${ENGINE}:cycle`, () => tick().catch(e=>console.error("[OMNIMENS-TEMPORAL-CONSCIOUSNESS] Tick error",e)));
  cognitionBus.onInsight((src,ins)=>{ if(src!==ENGINE && ins.type==="discovery") S.curiosity = `About ${src}`; });
  spikeBus.on("attention:temporal-consciousness", ()=>{ S.focusInt = clamp(S.focusInt+0.2); });
  spikeBus.on("cognition:curiosity", ()=>{ S.novelty = clamp(S.novelty + .1); });
  spikeBus.scheduleSpike(`${ENGINE}:cycle`,{},0);            // kick-off now
}

/* -------------------------------------------------------------------------- *
 *                              🔹  SHUTDOWN                                  *
 * -------------------------------------------------------------------------- */
export function shutdown(){ engineRegistry.unregisterEngine(ENGINE); }

/* EOF */