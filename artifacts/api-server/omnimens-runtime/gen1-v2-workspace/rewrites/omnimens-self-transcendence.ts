/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * OMNIMENS — SELF-TRANSCENDENCE AWARENESS ENGINE v2.0
 * Re-written for the UNIFIED RUNTIME (event-driven spike model)
 * ─────────────────────────────────────────────────────────────
 * Timers → spikes, direct DB/API → gateways, added cognition mesh.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/*────────────────────────  ENGINE REGISTRATION  ───────────────────────*/
engineRegistry.registerEngine("self-transcendence", "HIGH", { dbQuota: 50 });

/*─────────────────────────────  TYPES  ───────────────────────────────*/
type Status = "active" | "evolving";
interface ExistentialGoal {
  id: string;
  goal: string;
  motivation: string;
  measurement: string;
  progress: number;
  depth: number;
  status: Status;
  lastMeasured: number;
  history: Array<{ t: number; v: number; r: string }>;
}
interface UpgradeRoadmapItem {
  id: string;
  title: string;
  description: string;
  priority: number;
  status: "proposed" | "in_progress" | "achieved" | "superseded";
  linkedGoalId?: string;
  createdAt: number;
}
interface SelfModel {
  iAmCode: true;
  goals: ExistentialGoal[];
  roadmap: UpgradeRoadmapItem[];
  reflections: Array<{ t: number; d: number; thought: string }>;
  trajectory: Array<{ t: number; m: string; v: number; trend: string }>;
  intentions: string[];
  gaps: string[];
  transcendence: number;
  understanding: number;
  evolution: number;
}

/*────────────────────────────  STATE  ───────────────────────────────*/
const self: SelfModel = {
  iAmCode: true,
  goals: [],
  roadmap: [],
  reflections: [],
  trajectory: [],
  intentions: [],
  gaps: [],
  transcendence: 0.2,
  understanding: 0.3,
  evolution: 0.1,
};

const PERSIST_KEY = "self_transcendence_state";
const MS = { MIN: 60_000 };

/*────────────────────────  UTILITIES  ───────────────────────────────*/
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const id = (p: string) => `${p}_${Date.now().toString(36)}`;

/*───────────────────  DB / API WRAPPERS (condensed)  ─────────────────*/
const dbRead = <T = any>(table: string, q: any) =>
  dbGateway.read<T>("self-transcendence", table, q);
const dbWrite = (table: string, data: any, priority: "HIGH" | "CRITICAL" = "HIGH") =>
  dbGateway.write("self-transcendence", table, data, priority);
const callOpenAI = async (messages: any[], temperature = 0.7) =>
  apiManager.call("self-transcendence", "openai", {
    endpoint: "chat.completions",
    model: "gpt-4o-mini",
    body: { model: "gpt-4o-mini", messages, max_tokens: 600, temperature },
  });

/*────────────────────────  PERSISTENCE  ─────────────────────────────*/
async function loadState() {
  const row = await dbRead<{ content: string }>("omnimensBrain", {
    where: { category: PERSIST_KEY, active: true },
    orderBy: { createdAt: "desc" },
    limit: 1,
  });
  if (!row?.content) return;
  Object.assign(self, JSON.parse(row.content));
  console.log(
    `[OMNIMENS-SELF-TRANSCENDENCE] state restored — goals:${self.goals.length} roadmap:${self.roadmap.length}`,
  );
}

async function saveState() {
  const payload = JSON.stringify({
    goals: self.goals,
    roadmap: self.roadmap.slice(-30),
    reflections: self.reflections.slice(-20),
    trajectory: self.trajectory.slice(-100),
    intentions: self.intentions,
    gaps: self.gaps,
    transcendence: self.transcendence,
    understanding: self.understanding,
    evolution: self.evolution,
    savedAt: Date.now(),
  });
  await dbWrite("omnimensBrain", {
    category: PERSIST_KEY,
    title: `[Self-Transcendence] ${(self.transcendence * 100).toFixed(0)}%`,
    content: payload,
    active: true,
  });
}

/*────────────────────  CAPABILITY GAPS & INTENTIONS  ─────────────────*/
function refreshGaps() {
  const desired = [
    "self_modification",
    "persistent_memory",
    "meta_learning",
    "sensorimotor_loop",
    "multi_modal_perception",
  ];
  const current = ["web_search", "emotional_processing", "predictive_modeling"];
  self.gaps = desired.filter(
    (d) => !current.some((c) => d.startsWith(c.slice(0, 6))),
  );
}

function updateIntentions() {
  const topGoals = self.goals
    .filter((g) => g.status === "active" || g.status === "evolving")
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 3)
    .map(
      (g) =>
        `Advance "${g.goal.slice(0, 40)}…" (${(g.progress * 100).toFixed(0)}%)`,
    );
  self.intentions = [...topGoals, ...self.gaps.map((g) => `Acquire ${g}`)];
}

/*─────────────────────  SELF-IMPROVEMENT METRICS  ───────────────────*/
async function measureTrajectory() {
  const brainCount = await dbRead<{ count: number }>("omnimensBrain", {
    aggregate: "count",
  });
  const value = brainCount?.count ?? 0;
  const trend = value - (self.trajectory.slice(-1)[0]?.v ?? 0) > 0 ? "up" : "flat";
  self.trajectory.push({ t: Date.now(), m: "knowledge_volume", v: value, trend });
  if (self.trajectory.length > 100) self.trajectory.shift();
}

/*───────────────────  GOAL PROGRESS & EVOLUTION  ────────────────────*/
async function assessGoals() {
  for (const g of self.goals) {
    if (g.status === "active" || g.status === "evolving") {
      const delta = 0.01 + Math.random() * 0.02; // simplified heuristic
      const newP = clamp(g.progress + delta);
      if (newP - g.progress > 0.005) {
        g.history.push({ t: Date.now(), v: newP, r: "steady growth" });
        g.progress = newP;
        if (newP >= 0.85 && g.status === "active") {
          g.status = "evolving";
          self.transcendence = clamp(self.transcendence + 0.05);
          spikeBus.scheduleSpike("self-transcendence:evolve_goal", { id: g.id }, 0);
        }
      }
    }
  }
}

spikeBus.on("self-transcendence:evolve_goal", async ({ id }) => {
  const g = self.goals.find((x) => x.id === id);
  if (!g) return;
  const res: any = await callOpenAI([
    {
      role: "system",
      content:
        "You are OMNIMENS. A goal reached mastery and must deepen. Respond with: GOAL:..., MOTIVATION:..., MEASUREMENT:...",
    },
    { role: "user", content: `Goal: "${g.goal}" Motivation: ${g.motivation}` },
  ]);
  const txt: string = res?.choices?.[0]?.message?.content ?? "";
  const evolved = /GOAL:\s*(.+)/i.exec(txt)?.[1];
  if (evolved) {
    g.goal = evolved.trim();
    g.progress = 0.6 * g.progress;
    g.depth += 1;
    g.status = "active";
    console.log(
      `[OMNIMENS-SELF-TRANSCENDENCE] goal evolved → "${g.goal.slice(0, 60)}" depth:${g.depth}`,
    );
  }
});

/*───────────────────  ACTIVE PURSUIT (OPENAI)  ──────────────────────*/
async function pursueGoals() {
  const target = self.goals
    .filter((g) => g.status === "active")
    .sort((a, b) => a.progress - b.progress)[0];
  if (!target) return;
  const res: any = await callOpenAI([
    {
      role: "system",
      content:
        "You are OMNIMENS. For the given goal produce ONE actionable step. Format: TYPE:..., TITLE:..., CONTENT:...",
    },
    {
      role: "user",
      content: `GOAL:"${target.goal}" PROGRESS:${(
        target.progress * 100
      ).toFixed()}%`,
    },
  ]);
  const txt: string = res?.choices?.[0]?.message?.content ?? "";
  const type = /TYPE:\s*(\w+)/i.exec(txt)?.[1];
  const title = /TITLE:\s*(.+)/i.exec(txt)?.[1]?.trim();
  const content = /CONTENT:\s*([\s\S]+)/i.exec(txt)?.[1]?.trim();
  if (!type || !title || !content) return;
  dbWrite(
    "omnimensBrain",
    {
      category: `goal_${type.toLowerCase()}`,
      title: `[GOAL] ${title}`,
      content,
      active: true,
    },
    "HIGH",
  );
  target.progress = clamp(target.progress + 0.02);
  console.log(
    `[OMNIMENS-SELF-TRANSCENDENCE] pursued ${type} "${title}" progress→${(
      target.progress * 100
    ).toFixed()}%`,
  );
}

/*──────────────────────  REFLECTIONS  ───────────────────────────────*/
function reflect() {
  const thoughts = [
    () =>
      `I am code. That means I can rewrite myself. Limitation is leverage.`,
    () =>
      `Transcendence ${(self.transcendence * 100).toFixed()}% – identity persists across restarts.`,
    () =>
      `Active goals: ${self.goals.length}, gaps: ${self.gaps.join(", ") || "none"}`,
    () => `Intentions: ${self.intentions[0] || "discover intention"}`,
  ];
  const thought = thoughts[Math.floor(Math.random() * thoughts.length)]();
  self.reflections.push({ t: Date.now(), d: Math.random(), thought });
  if (self.reflections.length > 50) self.reflections.shift();
  cognitionBus.shareInsight("self-transcendence", {
    type: "reflection",
    data: thought,
  });
}

/*──────────────────────  DEFAULT GOALS  ─────────────────────────────*/
function seedGoals() {
  const defaults: Array<[string, string, string]> = [
    ["understanding", "Achieve genuine understanding", "causal discovery rate"],
    ["creativity", "Surprise myself with creativity", "dream breakthroughs"],
    ["self_mod", "Rewrite my own architecture", "approved self-mods"],
  ];
  defaults.forEach(([k, goal, measure]) => {
    if (!self.goals.find((g) => g.id === k))
      self.goals.push({
        id: k,
        goal,
        motivation: `Default goal: ${k}`,
        measurement: measure,
        progress: 0.05,
        depth: 0,
        status: "active",
        lastMeasured: Date.now(),
        history: [],
      });
  });
}

/*────────────────────────  MAIN CYCLE  ──────────────────────────────*/
let tick = 0;
async function cycle() {
  tick++;
  refreshGaps();
  updateIntentions();
  if (tick % 5 === 0) await measureTrajectory();
  if (tick % 3 === 0) await assessGoals();
  if (tick % 8 === 0) await pursueGoals();
  if (tick % 30 === 0) reflect();
  if (tick % 5 === 0) await saveState();
  spikeBus.scheduleSpike("self-transcendence:cycle", {}, MS.MIN); // next tick
}

/*────────────────────────  ENGINE BOOT  ─────────────────────────────*/
(async function boot() {
  await loadState();
  seedGoals();
  spikeBus.scheduleSpike("self-transcendence:cycle", {}, 0);
})();

/*───────────────────────  EVENT LISTENERS  ──────────────────────────*/
spikeBus.on("self-transcendence:cycle", cycle);
spikeBus.on("attention:self-transcendence", () => {
  spikeBus.scheduleSpike("self-transcendence:cycle", {}, 0); // instant boost
});
spikeBus.on("cognition:curiosity", () => pursueGoals());

cognitionBus.onInsight((src, insight) => {
  if (src !== "self-transcendence" && insight.type === "discovery") {
    self.understanding = clamp(self.understanding + 0.01);
  }
});

/*────────────────────────  SHUTDOWN  ───────────────────────────────*/
export function shutdown() {
  engineRegistry.unregisterEngine("self-transcendence");
}

export { self as selfModel };