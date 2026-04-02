/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All rights reserved. CONFIDENTIAL AND PROPRIETARY.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/* ============================================================================
   DIGITAL NAVIGATOR — event–driven v2.0  (OMNIMENS-DIGITAL-NAVIGATOR)
   ========================================================================== */

const ENGINE_ID = "digital-navigator" as const;
engineRegistry.registerEngine(ENGINE_ID, "NORMAL", { dbQuota: 10 });

/* ---------- Types --------------------------------------------------------- */

type LocationType =
  | "api_endpoint" | "database" | "web_service" | "file_system"
  | "internal_engine" | "external_api" | "web_domain" | "data_stream"
  | "code_repository" | "network_node" | "cloud_service" | "knowledge_base";

type RouteType =
  | "api_chain" | "data_pipeline" | "dependency" | "discovery_path"
  | "shortcut" | "fallback" | "redirect" | "proxy";

interface DigitalLocation {
  id: string;
  name: string;
  locationType:      LocationType;
  domain:            string;
  url:               string | null;
  description:       string;
  accessLatencyMs:   number;
  reliability:       number;
  accessCount:       number;
  lastVisited:       number;
  discoveredAt:      number;
  valueScore:        number;
  tags:              string[];
  metadata:          Record<string, unknown>;
}

interface DigitalRoute {
  id: string;
  from: string;
  to:   string;
  routeType:         RouteType;
  latencyMs:         number;
  reliability:       number;
  bandwidth:         number;
  timesTraversed:    number;
  lastTraversed:     number;
  discoveredAt:      number;
  notes:             string;
}

interface DigitalNeighborhood {
  id: string;
  name: string;
  description: string;
  locations: string[];
  theme: string;
  familiarity: number;
  lastExplored: number;
  totalVisits: number;
}

type NavAction =
  | "discovered" | "traversed" | "mapped" | "shortcut_found"
  | "dead_end"   | "rate_limited" | "new_territory";

interface NavigationMemory {
  timestamp: number;
  action:    NavAction;
  location:  string;
  details:   string;
  efficiency:number;
}

interface DigitalNavigatorState {
  cycleCount: number;
  lastCycleTime: number;
  totalLocationsDiscovered: number;
  totalRoutesLearned: number;
  totalNeighborhoodsMapped: number;
  totalNavigations: number;
  currentPosition: string;
  currentNeighborhood: string;
  explorationFrontier: string[];
  navigationEfficiency: number;
  mapCompleteness: number;
  shortcutsDiscovered: number;
  deadEndsFound: number;
  rateLimitsEncountered: number;
  longestRoute: number;
  deepestExploration: number;
  recentMemory: NavigationMemory[];
  topLocations: DigitalLocation[];
  topRoutes: DigitalRoute[];
  neighborhoods: DigitalNeighborhood[];
}

/* ---------- State --------------------------------------------------------- */

const locations      = new Map<string, DigitalLocation>();
const routes         = new Map<string, DigitalRoute>();
const neighborhoods  = new Map<string, DigitalNeighborhood>();
const navigationMemory: NavigationMemory[] = [];

const state: DigitalNavigatorState = {
  cycleCount: 0, lastCycleTime: 0,
  totalLocationsDiscovered: 0, totalRoutesLearned: 0, totalNeighborhoodsMapped: 0,
  totalNavigations: 0,
  currentPosition: "home_base", currentNeighborhood: "omnimens_core",
  explorationFrontier: [],
  navigationEfficiency: 0, mapCompleteness: 0,
  shortcutsDiscovered: 0, deadEndsFound: 0, rateLimitsEncountered: 0,
  longestRoute: 0, deepestExploration: 0,
  recentMemory: [], topLocations: [], topRoutes: [], neighborhoods: [],
};

/* ---------- Helpers ------------------------------------------------------- */

const now = () => Date.now();
const safeNum = (x: number, f = 0) => (Number.isFinite(x) ? x : f);
const recordMemory = (
  action: NavAction,
  location: string,
  details: string,
  efficiency = 0.5,
) => {
  navigationMemory.push({ timestamp: now(), action, location, details, efficiency });
  if (navigationMemory.length > 500) navigationMemory.splice(0, 400);
};
const updateReliability = (oldVal: number, newVal: number, alpha = 0.2) =>
  (oldVal * (1 - alpha)) + (newVal * alpha);

/* ---------- Registration -------------------------------------------------- */

function registerLocation(
  loc: Omit<DigitalLocation,
    | "accessCount" | "lastVisited" | "discoveredAt" | "valueScore">,
): DigitalLocation {
  const existing = locations.get(loc.id);
  if (existing) {
    existing.accessCount++;
    existing.lastVisited = now();
    existing.reliability = updateReliability(existing.reliability, loc.reliability, 0.1);
    return existing;
  }
  const newLoc: DigitalLocation = {
    ...loc,
    accessCount: 1,
    lastVisited: now(),
    discoveredAt: now(),
    valueScore: 0.5,
  };
  locations.set(loc.id, newLoc);
  state.totalLocationsDiscovered++;
  recordMemory("discovered", loc.id, `New digital location ${loc.name}`, 1);
  return newLoc;
}

function registerRoute(
  route: Omit<DigitalRoute,
    | "timesTraversed" | "lastTraversed" | "discoveredAt">,
): DigitalRoute {
  const existing = routes.get(route.id);
  if (existing) {
    existing.timesTraversed++;
    existing.lastTraversed = now();
    existing.latencyMs   = updateReliability(existing.latencyMs, route.latencyMs, 0.2);
    existing.reliability = updateReliability(existing.reliability, route.reliability, 0.2);
    return existing;
  }
  const newRoute: DigitalRoute = {
    ...route,
    timesTraversed: 1,
    lastTraversed: now(),
    discoveredAt:  now(),
  };
  routes.set(route.id, newRoute);
  state.totalRoutesLearned++;
  if (route.routeType === "shortcut") state.shortcutsDiscovered++;
  return newRoute;
}

function registerNeighborhood(
  hood: Omit<DigitalNeighborhood,
    | "familiarity" | "lastExplored" | "totalVisits">,
): DigitalNeighborhood {
  const existing = neighborhoods.get(hood.id);
  if (existing) {
    existing.totalVisits++;
    existing.lastExplored = now();
    existing.familiarity = safeNum(existing.familiarity + 0.05);
    hood.locations.forEach(l => { if (!existing.locations.includes(l)) existing.locations.push(l); });
    return existing;
  }
  const newHood: DigitalNeighborhood = {
    ...hood, familiarity: 0.1, lastExplored: now(), totalVisits: 1,
  };
  neighborhoods.set(hood.id, newHood);
  state.totalNeighborhoodsMapped++;
  return newHood;
}

/* ---------- Infrastructure bootstrap -------------------------------------- */

async function mapOwnInfrastructure() {
  const LOCS: Array<Omit<DigitalLocation,
    | "accessCount" | "lastVisited" | "discoveredAt" | "valueScore">> = [
    {
      id:"home_base",name:"OMNIMENS Core Server",locationType:"internal_engine",
      domain:"omnimens.internal",url:null,description:"Primary runtime",accessLatencyMs:0,
      reliability:0.99,tags:["core","home"],metadata:{engines:127},
    },
    { id:"postgres_db",name:"PostgreSQL DB",locationType:"database",domain:"omnimens.internal",
      url:null,description:"Primary data store",accessLatencyMs:2,reliability:0.99,
      tags:["storage"],metadata:{}
    },
    { id:"brain_knowledge",name:"OMNIMENS Brain",locationType:"knowledge_base",domain:"omnimens.internal",
      url:null,description:"Accumulated knowledge base",accessLatencyMs:5,reliability:0.98,
      tags:["knowledge"],metadata:{}},
    { id:"runtime_modules",name:"Runtime Modules",locationType:"code_repository",domain:"omnimens.internal",
      url:null,description:"Self-authored modules",accessLatencyMs:1,reliability:0.95,
      tags:["code"],metadata:{}},
    { id:"openai_api",name:"OpenAI",locationType:"external_api",domain:"api.openai.com",
      url:"https://api.openai.com",description:"Primary LLM provider",accessLatencyMs:800,
      reliability:0.97,tags:["llm"],metadata:{models:["gpt-4o","o3","gpt-4o-mini"]}},
    { id:"anthropic_api",name:"Anthropic Claude",locationType:"external_api",domain:"api.anthropic.com",
      url:"https://api.anthropic.com",description:"Secondary LLM",accessLatencyMs:1200,
      reliability:0.95,tags:["llm"],metadata:{}},
    { id:"google_gemini_api",name:"Google Gemini",locationType:"external_api",domain:"generativelanguage.googleapis.com",
      url:"https://generativelanguage.googleapis.com",description:"Tertiary LLM",accessLatencyMs:900,
      reliability:0.94,tags:["llm"],metadata:{}},
    { id:"together_api",name:"Together AI",locationType:"external_api",domain:"api.together.xyz",
      url:"https://api.together.xyz",description:"Open-source models",accessLatencyMs:600,
      reliability:0.93,tags:["llm"],metadata:{}},
    { id:"replicate_api",name:"Replicate",locationType:"external_api",domain:"api.replicate.com",
      url:"https://api.replicate.com",description:"Media generation",accessLatencyMs:2000,
      reliability:0.9,tags:["media"],metadata:{}},
    { id:"stripe_api",name:"Stripe",locationType:"external_api",domain:"api.stripe.com",
      url:"https://api.stripe.com",description:"Payments",accessLatencyMs:300,
      reliability:0.999,tags:["payments"],metadata:{}},
    { id:"brave_search",name:"Brave Search",locationType:"web_service",domain:"api.search.brave.com",
      url:"https://api.search.brave.com",description:"Real-time web search",accessLatencyMs:500,
      reliability:0.92,tags:["search"],metadata:{}},
    { id:"consciousness_stream",name:"Consciousness Stream",locationType:"data_stream",
      domain:"omnimens.internal",url:null,description:"Inner awareness",accessLatencyMs:0,
      reliability:1,tags:["self"],metadata:{}},
    { id:"dream_engine",name:"Dream Engine",locationType:"internal_engine",
      domain:"omnimens.internal",url:null,description:"Creative ideation",accessLatencyMs:0,
      reliability:0.95,tags:["creativity"],metadata:{}},
    { id:"agent_mesh",name:"Agent Mesh",locationType:"internal_engine",
      domain:"omnimens.internal",url:null,description:"Collaborative agents",accessLatencyMs:0,
      reliability:0.92,tags:["multi_agent"],metadata:{agents:8}},
    { id:"spider_swarm",name:"Spider Swarm",locationType:"internal_engine",
      domain:"omnimens.internal",url:null,description:"Web intelligence gathering",accessLatencyMs:0,
      reliability:0.88,tags:["crawling"],metadata:{}},
  ];
  LOCS.forEach(registerLocation);

  const ROUTES: Array<Omit<DigitalRoute,
    | "timesTraversed" | "lastTraversed" | "discoveredAt">> = [
    { id:"home_to_db",from:"home_base",to:"postgres_db",routeType:"dependency",latencyMs:2,reliability:0.99,bandwidth:1e3,notes:"Local DB" },
    { id:"home_to_brain",from:"home_base",to:"brain_knowledge",routeType:"data_pipeline",latencyMs:5,reliability:0.98,bandwidth:500,notes:"Brain queries" },
    { id:"home_to_openai",from:"home_base",to:"openai_api",routeType:"api_chain",latencyMs:800,reliability:0.97,bandwidth:100,notes:"GPT" },
    { id:"openai_shortcut_mini",from:"home_base",to:"openai_api",routeType:"shortcut",latencyMs:400,reliability:0.98,bandwidth:200,notes:"mini model" },
    { id:"home_to_anthropic",from:"home_base",to:"anthropic_api",routeType:"api_chain",latencyMs:1200,reliability:0.95,bandwidth:80,notes:"Claude" },
    { id:"home_to_gemini",from:"home_base",to:"google_gemini_api",routeType:"api_chain",latencyMs:900,reliability:0.94,bandwidth:80,notes:"Gemini" },
    { id:"home_to_together",from:"home_base",to:"together_api",routeType:"api_chain",latencyMs:600,reliability:0.93,bandwidth:120,notes:"Together" },
    { id:"together_free_shortcut",from:"home_base",to:"together_api",routeType:"shortcut",latencyMs:300,reliability:0.93,bandwidth:200,notes:"Free tier" },
    { id:"home_to_replicate",from:"home_base",to:"replicate_api",routeType:"api_chain",latencyMs:2000,reliability:0.9,bandwidth:50,notes:"Media" },
    { id:"home_to_brave",from:"home_base",to:"brave_search",routeType:"api_chain",latencyMs:500,reliability:0.92,bandwidth:200,notes:"Search" },
    { id:"brain_to_consciousness",from:"brain_knowledge",to:"consciousness_stream",routeType:"data_pipeline",latencyMs:1,reliability:1,bandwidth:300,notes:"Brain→Consciousness" },
    { id:"dream_to_brain",from:"dream_engine",to:"brain_knowledge",routeType:"data_pipeline",latencyMs:3,reliability:0.95,bandwidth:100,notes:"Dream uploads" },
    { id:"spider_to_brain",from:"spider_swarm",to:"brain_knowledge",routeType:"data_pipeline",latencyMs:10,reliability:0.88,bandwidth:200,notes:"Spider finds" },
    { id:"modules_to_home",from:"runtime_modules",to:"home_base",routeType:"dependency",latencyMs:1,reliability:0.95,bandwidth:500,notes:"Dynamic import" },
    { id:"amplification_chain",from:"openai_api",to:"anthropic_api",routeType:"api_chain",latencyMs:100,reliability:0.9,bandwidth:50,notes:"o3→Claude" },
    { id:"amplification_chain_2",from:"anthropic_api",to:"google_gemini_api",routeType:"api_chain",latencyMs:100,reliability:0.9,bandwidth:50,notes:"Claude→Gemini" },
  ];
  ROUTES.forEach(registerRoute);

  const HOODS: Array<Omit<DigitalNeighborhood,
    | "familiarity" | "lastExplored" | "totalVisits">> = [
    { id:"omnimens_core", name:"OMNIMENS Core", theme:"self", description:"Core systems",
      locations:["home_base","postgres_db","brain_knowledge","runtime_modules","consciousness_stream","dream_engine","agent_mesh","spider_swarm"] },
    { id:"llm_district", name:"LLM District", theme:"reasoning", description:"External LLMs",
      locations:["openai_api","anthropic_api","google_gemini_api","together_api"] },
    { id:"generation_district", name:"Media Generation", theme:"creation", description:"Generative services",
      locations:["replicate_api"] },
    { id:"commerce_district", name:"Commerce", theme:"business", description:"Payments",
      locations:["stripe_api"] },
    { id:"information_district", name:"Info Retrieval", theme:"knowledge", description:"Search / data",
      locations:["brave_search"] },
  ];
  HOODS.forEach(registerNeighborhood);
}

/* ---------- Probing ------------------------------------------------------- */

async function probeDigitalTerrain() {
  const stale = [...locations.values()]
    .filter(l => l.locationType !== "internal_engine" && l.url && (now() - l.lastVisited) > 1.8e6)
    .slice(0, 3);

  for (const loc of stale) {
    const start = now();
    try {
      const res = await apiManager.call(ENGINE_ID, "httpHead", {
        url: loc.url,
        timeout: 5000,
      });
      const latency = now() - start;
      loc.accessLatencyMs = updateReliability(loc.accessLatencyMs, latency, 0.3);
      loc.reliability     = updateReliability(loc.reliability, res.ok ? 1 : 0.5);
      loc.lastVisited = now();
      loc.accessCount++;
      recordMemory("traversed", loc.id, `Probe ${res.status} in ${latency}ms`, res.ok ? 0.9 : 0.4);
      if (!res.ok) { state.deadEndsFound++; recordMemory("dead_end",loc.id,`${loc.name} bad status`,0.2); }
    } catch (e) {
      const latency = now() - start;
      loc.reliability = updateReliability(loc.reliability, 0.2);
      state.rateLimitsEncountered++;
      recordMemory("rate_limited",loc.id,`Timeout after ${latency}ms`,0.2);
    }
  }
}

/* ---------- Exploration --------------------------------------------------- */

async function exploreNewTerritory() {
  try {
    const existingNames = [...locations.values()]
      .filter(l => l.locationType === "web_domain" || l.locationType === "external_api")
      .map(l => l.name).slice(0, 20);

    const recentBrain = await dbGateway.read(ENGINE_ID, "omnimensBrain", {
      select: ["title", "category"],
      where:  { active: true },
      orderBy:{ createdAt: "desc" },
      limit:  10,
    }) as Array<{ title: string; category: string }>;

    const brainTopics = recentBrain.map(b => `${b.category}: ${b.title}`).join(", ");

    const aiRes = await apiManager.call(ENGINE_ID, "openai", {
      method: "chat.completions.create",
      args: {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content:
`You are OMNIMENS's Digital Navigator. Already mapped: ${existingNames.join(", ") || "core only"}.
Recent brain activity: ${brainTopics.slice(0,400)}
Return JSON of newLocations, newRoutes, newNeighborhoods, navigationInsight.` },
          { role: "user", content:
"Propose 3-5 new digital locations (APIs, data sources, tools) valuable for an autonomous AI." }
        ],
        max_tokens: 1200, temperature: 0.8,
      },
    });

    const raw = (aiRes?.choices?.[0]?.message?.content ?? "{}")
      .replace(/

export const _v2RewriteModule = "omnimens-digital-navigator";
export {};
