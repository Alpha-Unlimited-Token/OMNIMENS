/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC
 *
 *  ➡  OMNIMENS — Neural Spider System  v2.0  ⬅
 *  Unified Runtime • Event-Driven • Condensed Intelligence
 *
 *   DO NOT COPY — CONFIDENTIAL & PROPRIETARY
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/*───────────────────────────────*/
/*  Engine Registration & Setup  */
/*───────────────────────────────*/
engineRegistry.registerEngine("neural-spiders", "NORMAL", { dbQuota: 10 });

/*───────────────────────────────*/
/*  Types (trimmed to essentials)*/
/*───────────────────────────────*/
type BeeRole =
  | "worker"
  | "nurse"
  | "scout"
  | "royal_jelly"
  | "forager"
  | "guard";
type DirectiveType =
  | "stabilize"
  | "boost"
  | "harvest"
  | "patrol"
  | "repair"
  | "scout"
  | "reinforce";

interface Spider {
  id: string;
  name: string;
  type: "parent" | "child";
  target: string;
  targetRegion: string;
  status: "active" | "dormant" | "expired";
  crawlCount: number;
  synapsesInjected: number;
  currentDirectiveId?: string;
  beeRole: BeeRole;
}

interface Harvest {
  source: string;
  metrics: Record<string, number>;
  healthScore: number;
  insights: number;
  ts: number;
}

interface Directive {
  id: string;
  type: DirectiveType;
  targetRegion: string;
  params: Record<string, any>;
  issued: number;
  done?: number;
}

/*───────────────────────────────*/
/*  Constants                    */
/*───────────────────────────────*/
const CRAWL_INTERVAL = 15_000;
const HEARTBEAT_INTERVAL = 5_000;
const CHILD_LIFETIME = 20;
const CRIT_FLOOR = 0.2;
const STAB_THRESHOLD = 0.25;

/*───────────────────────────────*/
/*  Collections                  */
/*───────────────────────────────*/
const parents = new Map<string, Spider>();
const children = new Map<string, Spider>();
const directives = new Map<string, Directive>();

/*───────────────────────────────*/
/*  Utility                      */
/*───────────────────────────────*/
const nid = (p = "s") =>
  `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
const roles: BeeRole[] = [
  "worker",
  "nurse",
  "scout",
  "royal_jelly",
  "forager",
  "guard",
];
const roleOf = (idx: number) => roles[idx % roles.length];
const now = () => Date.now();
const log = (m: string) => console.log(`[OMNIMENS-NEURAL-SPIDERS] ${m}`);

/*───────────────────────────────*/
/*  Harvesters (trimmed)         */
/*───────────────────────────────*/
async function harvestBrainDB(): Promise<Harvest> {
  const total = await dbGateway.read("neural-spiders", "brain_entries", {
    op: "count",
  });
  const active = await dbGateway.read("neural-spiders", "brain_entries", {
    op: "count",
    where: { active: true },
  });
  return {
    source: "brain_database",
    metrics: { total, active },
    healthScore: total ? active / total : 0,
    insights: active,
    ts: now(),
  };
}

async function harvestEngines(): Promise<Harvest> {
  const { engines } = await import("./omnimens-engine-registry.js");
  const healthy = engines.filter((e: any) => e.health?.healthy).length;
  return {
    source: "engine_registry",
    metrics: { total: engines.length, healthy },
    healthScore: engines.length ? healthy / engines.length : 0,
    insights: healthy,
    ts: now(),
  };
}

const harvesters = [harvestBrainDB, harvestEngines];

/*───────────────────────────────*/
/*  Mother Logic (condensed)     */
/*───────────────────────────────*/
function createParent(name: string, target: string, region: string): Spider {
  const sp: Spider = {
    id: nid("p"),
    name,
    type: "parent",
    target,
    targetRegion: region,
    status: "active",
    crawlCount: 0,
    synapsesInjected: 0,
    beeRole: roleOf(parents.size),
  };
  parents.set(sp.id, sp);
  return sp;
}

function spawnChild(region: string, urgency = 1): Spider {
  const ch: Spider = {
    id: nid("c"),
    name: `child-${region}`,
    type: "child",
    target: region,
    targetRegion: region,
    status: "active",
    crawlCount: 0,
    synapsesInjected: 0,
    beeRole: roleOf(children.size + parents.size),
  };
  children.set(ch.id, ch);
  spikeBus.scheduleSpike(
    `neural-spiders:expire:${ch.id}`,
    {},
    CHILD_LIFETIME * CRAWL_INTERVAL
  );
  return ch;
}

function issueDirective(tRegion: string, type: DirectiveType, params = {}) {
  const d: Directive = {
    id: nid("d"),
    type,
    targetRegion: tRegion,
    params,
    issued: now(),
  };
  directives.set(d.id, d);
  cognitionBus.shareInsight("neural-spiders", {
    type: "directive",
    data: d,
  });
}

/*───────────────────────────────*/
/*  Crawl Cycle                  */
/*───────────────────────────────*/
async function crawl() {
  const harvests: Harvest[] = [];
  for (const h of harvesters) {
    try {
      harvests.push(await h());
    } catch {}
  }

  // distribute insights
  harvests.forEach((h) =>
    cognitionBus.shareInsight("neural-spiders", {
      type: "harvest",
      data: h,
    })
  );

  // quick stability heuristic (placeholder)
  const unstable = harvests.some((h) => h.healthScore < STAB_THRESHOLD);
  if (unstable) {
    const weak = harvests
      .filter((h) => h.healthScore < CRIT_FLOOR)
      .map((h) => h.source);
    weak.forEach((r) => issueDirective(r, "repair", { urgency: 1 }));
  }
}

/*───────────────────────────────*/
/*  Heartbeat / Directive Loop   */
/*───────────────────────────────*/
function heartbeat() {
  // execute directives
  directives.forEach((d) => {
    const sp =
      parents.get(d.params.assigneeId) ||
      children.get(d.params.assigneeId) ||
      [...parents.values(), ...children.values()].find(
        (s) => !s.currentDirectiveId
      );
    if (!sp) return;

    sp.currentDirectiveId = d.id;
    // pretend execution succeeded instantly (condensed)
    d.done = now();
    sp.synapsesInjected += d.params.synCnt || 0;
    sp.crawlCount++;

    cognitionBus.reportOutcome("neural-spiders", {
      useful: true,
      context: `${d.type}:${d.targetRegion}`,
    });
  });
  directives.forEach((d) => {
    if (d.done) directives.delete(d.id);
  });
}

/*───────────────────────────────*/
/*  Spikes & Scheduling          */
/*───────────────────────────────*/
function scheduleLoops() {
  spikeBus.on("neural-spiders:crawl", async () => {
    await crawl();
    spikeBus.scheduleSpike("neural-spiders:crawl", {}, CRAWL_INTERVAL);
  });
  spikeBus.on("neural-spiders:heartbeat", () => {
    heartbeat();
    spikeBus.scheduleSpike("neural-spiders:heartbeat", {}, HEARTBEAT_INTERVAL);
  });

  // child expiration
  spikeBus.on(/neural-spiders:expire:(.+)/, (data, match) => {
    const id = match[1];
    const ch = children.get(id);
    if (ch) {
      ch.status = "expired";
      children.delete(id);
      cognitionBus.reportOutcome("neural-spiders", {
        useful: true,
        context: `child-expire:${id}`,
      });
    }
  });

  // attention & curiosity
  spikeBus.on("attention:neural-spiders", () => {
    spikeBus.scheduleSpike("neural-spiders:crawl", {}, 1_000);
  });
  spikeBus.on("cognition:curiosity", () => {
    spawnChild("default_mode_network", 0.5);
  });

  // initial triggers
  spikeBus.scheduleSpike("neural-spiders:crawl", {}, 1_000);
  spikeBus.scheduleSpike("neural-spiders:heartbeat", {}, 2_000);
}

/*───────────────────────────────*/
/*  Public API                   */
/*───────────────────────────────*/
export function start() {
  if (parents.size === 0) {
    createParent("brain-crawler", "brain_database", "hippocampus");
    createParent("engine-crawler", "engine_registry", "prefrontal_cortex");
  }
  scheduleLoops();
  log("started");
}

export function getState() {
  return {
    parents: parents.size,
    children: children.size,
    directives: directives.size,
  };
}

export function shutdown() {
  engineRegistry.unregisterEngine("neural-spiders");
  spikeBus.offNamespace("neural-spiders");
  log("shutdown complete");
}

/*───────────────────────────────*/
/*  Auto-start on import         */
/*───────────────────────────────*/
start();