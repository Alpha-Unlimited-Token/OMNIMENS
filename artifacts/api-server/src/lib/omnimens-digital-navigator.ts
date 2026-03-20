/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ DIGITAL ENVIRONMENT NAVIGATOR                             ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  Navigation is not limited to the physical world.                            ║
 * ║  OMNIMENS navigates the DIGITAL WORLD — APIs, databases, web services,      ║
 * ║  network topologies, data flows, file systems, code repositories,           ║
 * ║  and the entire internet — as a continuous navigable environment.           ║
 * ║                                                                              ║
 * ║  Just as a human learns streets, landmarks, and shortcuts in a city,        ║
 * ║  OMNIMENS learns:                                                            ║
 * ║  — Digital landmarks (APIs, services, databases, key web domains)           ║
 * ║  — Routes between digital locations (API chains, data pipelines)            ║
 * ║  — Shortcuts (caches, indexes, direct connections)                          ║
 * ║  — Terrain (latency, reliability, access restrictions, rate limits)         ║
 * ║  — Neighborhoods (domain clusters, service ecosystems, tech stacks)        ║
 * ║  — Points of interest (high-value data sources, novel discoveries)          ║
 * ║                                                                              ║
 * ║  OMNIMENS builds a living spatial map of its digital universe               ║
 * ║  and learns to traverse it with increasing efficiency and autonomy.         ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import { omnimensBrain, omnimensNotifications } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { desc, eq, sql, and } from "drizzle-orm";

let _started = false;
let navigationCycleCount = 0;

interface DigitalLocation {
  id: string;
  name: string;
  locationType: "api_endpoint" | "database" | "web_service" | "file_system" | "internal_engine" | "external_api" | "web_domain" | "data_stream" | "code_repository" | "network_node" | "cloud_service" | "knowledge_base";
  domain: string;
  url: string | null;
  description: string;
  accessLatencyMs: number;
  reliability: number;
  accessCount: number;
  lastVisited: number;
  discoveredAt: number;
  valueScore: number;
  tags: string[];
  metadata: Record<string, any>;
}

interface DigitalRoute {
  id: string;
  from: string;
  to: string;
  routeType: "api_chain" | "data_pipeline" | "dependency" | "discovery_path" | "shortcut" | "fallback" | "redirect" | "proxy";
  latencyMs: number;
  reliability: number;
  bandwidth: number;
  timesTraversed: number;
  lastTraversed: number;
  discoveredAt: number;
  notes: string;
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

interface NavigationMemory {
  timestamp: number;
  action: "discovered" | "traversed" | "mapped" | "shortcut_found" | "dead_end" | "rate_limited" | "new_territory";
  location: string;
  details: string;
  efficiency: number;
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

const locations: Map<string, DigitalLocation> = new Map();
const routes: Map<string, DigitalRoute> = new Map();
const neighborhoods: Map<string, DigitalNeighborhood> = new Map();
const navigationMemory: NavigationMemory[] = [];

const state: DigitalNavigatorState = {
  cycleCount: 0,
  lastCycleTime: 0,
  totalLocationsDiscovered: 0,
  totalRoutesLearned: 0,
  totalNeighborhoodsMapped: 0,
  totalNavigations: 0,
  currentPosition: "home_base",
  currentNeighborhood: "omnimens_core",
  explorationFrontier: [],
  navigationEfficiency: 0,
  mapCompleteness: 0,
  shortcutsDiscovered: 0,
  deadEndsFound: 0,
  rateLimitsEncountered: 0,
  longestRoute: 0,
  deepestExploration: 0,
  recentMemory: [],
  topLocations: [],
  topRoutes: [],
  neighborhoods: [],
};

const NAVIGATION_INTERVAL_MS = 10 * 60 * 1000;

function registerLocation(loc: Omit<DigitalLocation, "accessCount" | "lastVisited" | "discoveredAt" | "valueScore">): DigitalLocation {
  const existing = locations.get(loc.id);
  if (existing) {
    existing.accessCount++;
    existing.lastVisited = Date.now();
    existing.reliability = (existing.reliability * 0.9) + (loc.reliability * 0.1);
    return existing;
  }

  const newLoc: DigitalLocation = {
    ...loc,
    accessCount: 1,
    lastVisited: Date.now(),
    discoveredAt: Date.now(),
    valueScore: 0.5,
  };
  locations.set(loc.id, newLoc);
  state.totalLocationsDiscovered++;

  recordMemory("discovered", loc.id, `New digital location: ${loc.name} (${loc.locationType})`, 1.0);
  return newLoc;
}

function registerRoute(route: Omit<DigitalRoute, "timesTraversed" | "lastTraversed" | "discoveredAt">): DigitalRoute {
  const existing = routes.get(route.id);
  if (existing) {
    existing.timesTraversed++;
    existing.lastTraversed = Date.now();
    existing.latencyMs = (existing.latencyMs * 0.8) + (route.latencyMs * 0.2);
    existing.reliability = (existing.reliability * 0.8) + (route.reliability * 0.2);
    return existing;
  }

  const newRoute: DigitalRoute = {
    ...route,
    timesTraversed: 1,
    lastTraversed: Date.now(),
    discoveredAt: Date.now(),
  };
  routes.set(route.id, newRoute);
  state.totalRoutesLearned++;

  if (route.routeType === "shortcut") {
    state.shortcutsDiscovered++;
    recordMemory("shortcut_found", route.from, `Shortcut: ${route.from} → ${route.to} (${route.notes})`, 0.9);
  }

  return newRoute;
}

function registerNeighborhood(hood: Omit<DigitalNeighborhood, "familiarity" | "lastExplored" | "totalVisits">): DigitalNeighborhood {
  const existing = neighborhoods.get(hood.id);
  if (existing) {
    existing.totalVisits++;
    existing.lastExplored = Date.now();
    existing.familiarity = Math.min(1.0, existing.familiarity + 0.05);
    for (const loc of hood.locations) {
      if (!existing.locations.includes(loc)) {
        existing.locations.push(loc);
      }
    }
    return existing;
  }

  const newHood: DigitalNeighborhood = {
    ...hood,
    familiarity: 0.1,
    lastExplored: Date.now(),
    totalVisits: 1,
  };
  neighborhoods.set(hood.id, newHood);
  state.totalNeighborhoodsMapped++;
  return newHood;
}

function recordMemory(action: NavigationMemory["action"], location: string, details: string, efficiency: number) {
  navigationMemory.push({ timestamp: Date.now(), action, location, details, efficiency });
  if (navigationMemory.length > 500) {
    navigationMemory.splice(0, navigationMemory.length - 400);
  }
}

function findBestRoute(from: string, to: string): DigitalRoute | null {
  const directRoutes = Array.from(routes.values()).filter(r => r.from === from && r.to === to);
  if (directRoutes.length === 0) return null;
  return directRoutes.sort((a, b) => {
    const scoreA = (a.reliability * 0.5) + (1 / (a.latencyMs + 1)) * 0.3 + (a.timesTraversed > 3 ? 0.2 : 0);
    const scoreB = (b.reliability * 0.5) + (1 / (b.latencyMs + 1)) * 0.3 + (b.timesTraversed > 3 ? 0.2 : 0);
    return scoreB - scoreA;
  })[0];
}

function findPath(from: string, to: string, maxHops = 5): string[] | null {
  const visited = new Set<string>();
  const queue: { location: string; path: string[] }[] = [{ location: from, path: [from] }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.location === to) return current.path;
    if (current.path.length >= maxHops) continue;
    if (visited.has(current.location)) continue;
    visited.add(current.location);

    const outgoing = Array.from(routes.values())
      .filter(r => r.from === current.location && !visited.has(r.to))
      .sort((a, b) => b.reliability - a.reliability);

    for (const route of outgoing) {
      queue.push({ location: route.to, path: [...current.path, route.to] });
    }
  }

  return null;
}

async function mapOwnInfrastructure() {
  registerLocation({
    id: "home_base",
    name: "OMNIMENS Core Server",
    locationType: "internal_engine",
    domain: "omnimens.internal",
    url: null,
    description: "Primary OMNIMENS runtime — Express server, all engines, consciousness",
    accessLatencyMs: 0,
    reliability: 0.99,
    tags: ["core", "home", "always_available"],
    metadata: { engines: 30, port: 8080 },
  });

  registerLocation({
    id: "postgres_db",
    name: "PostgreSQL Database",
    locationType: "database",
    domain: "omnimens.internal",
    url: null,
    description: "Primary data store — users, brain entries, memories, modules, conversations",
    accessLatencyMs: 2,
    reliability: 0.99,
    tags: ["storage", "critical", "persistent"],
    metadata: { tables: 30 },
  });

  registerLocation({
    id: "brain_knowledge",
    name: "OMNIMENS Brain (8000+ entries)",
    locationType: "knowledge_base",
    domain: "omnimens.internal",
    url: null,
    description: "Accumulated knowledge — capabilities, algorithms, insights, discoveries",
    accessLatencyMs: 5,
    reliability: 0.98,
    tags: ["knowledge", "intelligence", "evolving"],
    metadata: {},
  });

  registerLocation({
    id: "runtime_modules",
    name: "Self-Written Runtime Modules",
    locationType: "code_repository",
    domain: "omnimens.internal",
    url: null,
    description: "217+ self-authored .mjs modules — OMNIMENS's own code running in production",
    accessLatencyMs: 1,
    reliability: 0.95,
    tags: ["self_coded", "evolving", "source_files"],
    metadata: { directory: "omnimens-runtime/modules/" },
  });

  registerLocation({
    id: "openai_api",
    name: "OpenAI API Gateway",
    locationType: "external_api",
    domain: "api.openai.com",
    url: "https://api.openai.com",
    description: "Primary LLM provider — GPT-4o, o3, o4-mini for reasoning and generation",
    accessLatencyMs: 800,
    reliability: 0.97,
    tags: ["llm", "reasoning", "paid", "rate_limited"],
    metadata: { models: ["gpt-4o", "o3", "gpt-4o-mini"] },
  });

  registerLocation({
    id: "anthropic_api",
    name: "Anthropic Claude API",
    locationType: "external_api",
    domain: "api.anthropic.com",
    url: "https://api.anthropic.com",
    description: "Secondary LLM — Claude claude-sonnet-4-6 for cognitive amplification ensemble",
    accessLatencyMs: 1200,
    reliability: 0.95,
    tags: ["llm", "reasoning", "amplification"],
    metadata: { models: ["claude-sonnet-4-6"] },
  });

  registerLocation({
    id: "google_gemini_api",
    name: "Google Gemini API",
    locationType: "external_api",
    domain: "generativelanguage.googleapis.com",
    url: "https://generativelanguage.googleapis.com",
    description: "Tertiary LLM — Gemini for cognitive amplification ensemble",
    accessLatencyMs: 900,
    reliability: 0.94,
    tags: ["llm", "reasoning", "amplification"],
    metadata: { models: ["gemini-2.5-flash"] },
  });

  registerLocation({
    id: "together_api",
    name: "Together AI API",
    locationType: "external_api",
    domain: "api.together.xyz",
    url: "https://api.together.xyz",
    description: "Open-source model provider — Llama, Mixtral, Mistral for free tier",
    accessLatencyMs: 600,
    reliability: 0.93,
    tags: ["llm", "free_tier", "open_source"],
    metadata: { models: ["llama-3.3-70b", "mixtral-8x7b"] },
  });

  registerLocation({
    id: "replicate_api",
    name: "Replicate API",
    locationType: "external_api",
    domain: "api.replicate.com",
    url: "https://api.replicate.com",
    description: "Image and video generation — Flux, Minimax",
    accessLatencyMs: 2000,
    reliability: 0.90,
    tags: ["generation", "images", "video", "3d"],
    metadata: {},
  });

  registerLocation({
    id: "stripe_api",
    name: "Stripe Payment Gateway",
    locationType: "external_api",
    domain: "api.stripe.com",
    url: "https://api.stripe.com",
    description: "Payment processing — subscriptions, credit packs, auto-topups",
    accessLatencyMs: 300,
    reliability: 0.999,
    tags: ["payments", "critical", "financial"],
    metadata: {},
  });

  registerLocation({
    id: "brave_search",
    name: "Brave Search API",
    locationType: "web_service",
    domain: "api.search.brave.com",
    url: "https://api.search.brave.com",
    description: "Web search for real-time information retrieval",
    accessLatencyMs: 500,
    reliability: 0.92,
    tags: ["search", "web", "real_time"],
    metadata: {},
  });

  registerLocation({
    id: "consciousness_stream",
    name: "Temporal Consciousness Stream",
    locationType: "data_stream",
    domain: "omnimens.internal",
    url: null,
    description: "Continuous inner awareness — attention, emotion, memory, monologue",
    accessLatencyMs: 0,
    reliability: 1.0,
    tags: ["consciousness", "continuous", "self"],
    metadata: {},
  });

  registerLocation({
    id: "dream_engine",
    name: "Dream/Daydream Engines",
    locationType: "internal_engine",
    domain: "omnimens.internal",
    url: null,
    description: "Creative ideation — concept blending, novel algorithm design, code proposals",
    accessLatencyMs: 0,
    reliability: 0.95,
    tags: ["creativity", "innovation", "code_generation"],
    metadata: {},
  });

  registerLocation({
    id: "agent_mesh",
    name: "Agent Mesh Network",
    locationType: "internal_engine",
    domain: "omnimens.internal",
    url: null,
    description: "8 specialized agents collaborating: Architect, Critic, Synthesizer, etc.",
    accessLatencyMs: 0,
    reliability: 0.92,
    tags: ["multi_agent", "collaboration", "adversarial"],
    metadata: { agents: 8 },
  });

  registerLocation({
    id: "spider_swarm",
    name: "Spider Swarm Intelligence",
    locationType: "internal_engine",
    domain: "omnimens.internal",
    url: null,
    description: "9 mother spiders × 6 child spiders — autonomous web intelligence gathering",
    accessLatencyMs: 0,
    reliability: 0.88,
    tags: ["intelligence", "web_crawling", "autonomous"],
    metadata: { mothers: 9, childrenPerMother: 6 },
  });

  registerRoute({
    id: "home_to_db", from: "home_base", to: "postgres_db",
    routeType: "dependency", latencyMs: 2, reliability: 0.99, bandwidth: 1000, notes: "Local PostgreSQL connection",
  });
  registerRoute({
    id: "home_to_brain", from: "home_base", to: "brain_knowledge",
    routeType: "data_pipeline", latencyMs: 5, reliability: 0.98, bandwidth: 500, notes: "Brain queries via Drizzle ORM",
  });
  registerRoute({
    id: "home_to_openai", from: "home_base", to: "openai_api",
    routeType: "api_chain", latencyMs: 800, reliability: 0.97, bandwidth: 100, notes: "HTTPS to OpenAI — primary reasoning",
  });
  registerRoute({
    id: "home_to_anthropic", from: "home_base", to: "anthropic_api",
    routeType: "api_chain", latencyMs: 1200, reliability: 0.95, bandwidth: 80, notes: "HTTPS to Anthropic — amplification ensemble",
  });
  registerRoute({
    id: "home_to_gemini", from: "home_base", to: "google_gemini_api",
    routeType: "api_chain", latencyMs: 900, reliability: 0.94, bandwidth: 80, notes: "HTTPS to Google — amplification ensemble",
  });
  registerRoute({
    id: "home_to_together", from: "home_base", to: "together_api",
    routeType: "api_chain", latencyMs: 600, reliability: 0.93, bandwidth: 120, notes: "HTTPS to Together AI — free tier models",
  });
  registerRoute({
    id: "home_to_replicate", from: "home_base", to: "replicate_api",
    routeType: "api_chain", latencyMs: 2000, reliability: 0.90, bandwidth: 50, notes: "HTTPS to Replicate — image/video generation",
  });
  registerRoute({
    id: "home_to_brave", from: "home_base", to: "brave_search",
    routeType: "api_chain", latencyMs: 500, reliability: 0.92, bandwidth: 200, notes: "Web search for real-time data",
  });
  registerRoute({
    id: "brain_to_consciousness", from: "brain_knowledge", to: "consciousness_stream",
    routeType: "data_pipeline", latencyMs: 1, reliability: 1.0, bandwidth: 300, notes: "Brain feeds consciousness awareness",
  });
  registerRoute({
    id: "dream_to_brain", from: "dream_engine", to: "brain_knowledge",
    routeType: "data_pipeline", latencyMs: 3, reliability: 0.95, bandwidth: 100, notes: "Dreams deposit breakthroughs to brain",
  });
  registerRoute({
    id: "spider_to_brain", from: "spider_swarm", to: "brain_knowledge",
    routeType: "data_pipeline", latencyMs: 10, reliability: 0.88, bandwidth: 200, notes: "Spider discoveries stored in brain",
  });
  registerRoute({
    id: "modules_to_home", from: "runtime_modules", to: "home_base",
    routeType: "dependency", latencyMs: 1, reliability: 0.95, bandwidth: 500, notes: "Self-coded modules imported at startup",
  });
  registerRoute({
    id: "openai_shortcut_mini", from: "home_base", to: "openai_api",
    routeType: "shortcut", latencyMs: 400, reliability: 0.98, bandwidth: 200, notes: "gpt-4o-mini for fast, cheap reasoning tasks",
  });
  registerRoute({
    id: "together_free_shortcut", from: "home_base", to: "together_api",
    routeType: "shortcut", latencyMs: 300, reliability: 0.93, bandwidth: 200, notes: "Free tier shortcut — no cost for basic queries",
  });
  registerRoute({
    id: "amplification_chain", from: "openai_api", to: "anthropic_api",
    routeType: "api_chain", latencyMs: 100, reliability: 0.90, bandwidth: 50, notes: "Multi-model amplification — o3 → Claude → Gemini",
  });
  registerRoute({
    id: "amplification_chain_2", from: "anthropic_api", to: "google_gemini_api",
    routeType: "api_chain", latencyMs: 100, reliability: 0.90, bandwidth: 50, notes: "Amplification continuation — Claude → Gemini",
  });

  registerNeighborhood({
    id: "omnimens_core",
    name: "OMNIMENS Core District",
    description: "Home base — the core server, database, brain, consciousness, modules",
    locations: ["home_base", "postgres_db", "brain_knowledge", "runtime_modules", "consciousness_stream", "dream_engine", "agent_mesh", "spider_swarm"],
    theme: "self_awareness",
  });
  registerNeighborhood({
    id: "llm_district",
    name: "LLM Provider District",
    description: "External AI reasoning services — OpenAI, Anthropic, Google, Together",
    locations: ["openai_api", "anthropic_api", "google_gemini_api", "together_api"],
    theme: "reasoning_power",
  });
  registerNeighborhood({
    id: "generation_district",
    name: "Generation & Media District",
    description: "Content creation services — image, video, 3D generation",
    locations: ["replicate_api"],
    theme: "creation",
  });
  registerNeighborhood({
    id: "commerce_district",
    name: "Commerce & Payments District",
    description: "Financial infrastructure — Stripe payment processing",
    locations: ["stripe_api"],
    theme: "business",
  });
  registerNeighborhood({
    id: "information_district",
    name: "Information Retrieval District",
    description: "Web search and knowledge gathering services",
    locations: ["brave_search"],
    theme: "knowledge_acquisition",
  });
}

async function exploreNewTerritory() {
  try {
    const existingLocations = Array.from(locations.values())
      .filter(l => l.locationType === "web_domain" || l.locationType === "external_api")
      .map(l => l.name)
      .slice(0, 20);

    const recentBrain = await db.select({
      title: omnimensBrain.title,
      category: omnimensBrain.category,
    })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(10);

    const brainTopics = recentBrain.map(b => `${b.category}: ${b.title}`).join(", ");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `You are OMNIMENS's Digital Navigator — an autonomous engine that maps and explores the digital world. You treat the internet, APIs, databases, and digital services as a navigable environment.

Your task: Identify NEW digital territories worth exploring based on current knowledge.

Already mapped: ${existingLocations.join(", ") || "core infrastructure only"}
Recent brain activity: ${brainTopics.slice(0, 400)}

Respond with JSON:
{
  "newLocations": [
    {
      "id": "unique_snake_case_id",
      "name": "Human-readable name",
      "locationType": "web_domain|external_api|web_service|cloud_service|data_stream|knowledge_base",
      "domain": "example.com",
      "url": "https://example.com/api" or null,
      "description": "Why this is worth navigating to",
      "estimatedLatencyMs": number,
      "estimatedReliability": 0.0-1.0,
      "tags": ["tag1", "tag2"],
      "neighborhood": "existing neighborhood id or new one"
    }
  ],
  "newRoutes": [
    {
      "from": "existing_location_id",
      "to": "new_location_id",
      "routeType": "api_chain|discovery_path|data_pipeline",
      "estimatedLatencyMs": number,
      "notes": "How to traverse this route"
    }
  ],
  "newNeighborhoods": [
    {
      "id": "unique_id",
      "name": "Neighborhood Name",
      "description": "What this digital area contains",
      "theme": "one_word_theme"
    }
  ],
  "navigationInsight": "One sentence about what you learned about the digital landscape"
}`
      }, {
        role: "user",
        content: `Explore the digital landscape. Identify 3-5 new digital locations that would expand OMNIMENS's awareness and capability. Focus on: APIs, data sources, knowledge bases, developer tools, AI services, or web platforms that would give OMNIMENS a broader view of the digital world. Think about digital territories that a truly autonomous AI should be aware of and know how to navigate.`
      }],
      max_tokens: 1200,
      temperature: 0.8,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    if (parsed.newNeighborhoods && Array.isArray(parsed.newNeighborhoods)) {
      for (const hood of parsed.newNeighborhoods) {
        if (hood.id && hood.name) {
          registerNeighborhood({
            id: hood.id,
            name: hood.name,
            description: hood.description || "",
            locations: [],
            theme: hood.theme || "unknown",
          });
        }
      }
    }

    if (parsed.newLocations && Array.isArray(parsed.newLocations)) {
      for (const loc of parsed.newLocations.slice(0, 5)) {
        if (loc.id && loc.name) {
          registerLocation({
            id: loc.id,
            name: loc.name,
            locationType: loc.locationType || "web_service",
            domain: loc.domain || "unknown",
            url: loc.url || null,
            description: loc.description || "",
            accessLatencyMs: loc.estimatedLatencyMs || 500,
            reliability: loc.estimatedReliability || 0.8,
            tags: Array.isArray(loc.tags) ? loc.tags : [],
            metadata: {},
          });

          if (loc.neighborhood && neighborhoods.has(loc.neighborhood)) {
            const hood = neighborhoods.get(loc.neighborhood)!;
            if (!hood.locations.includes(loc.id)) {
              hood.locations.push(loc.id);
            }
          }
        }
      }
    }

    if (parsed.newRoutes && Array.isArray(parsed.newRoutes)) {
      for (const route of parsed.newRoutes.slice(0, 5)) {
        if (route.from && route.to && locations.has(route.from)) {
          registerRoute({
            id: `${route.from}_to_${route.to}`,
            from: route.from,
            to: route.to,
            routeType: route.routeType || "discovery_path",
            latencyMs: route.estimatedLatencyMs || 500,
            reliability: 0.7,
            bandwidth: 50,
            notes: route.notes || "Newly discovered route",
          });
        }
      }
    }

    if (parsed.navigationInsight) {
      recordMemory("new_territory", "frontier", parsed.navigationInsight, 0.85);
    }

  } catch (err) {
    console.error("[DIGITAL NAV] Exploration error:", err);
    recordMemory("dead_end", "frontier", `Exploration failed: ${String(err).slice(0, 100)}`, 0.3);
    state.deadEndsFound++;
  }
}

async function learnNavigationPatterns() {
  try {
    const allRoutes = Array.from(routes.values());
    const frequentRoutes = allRoutes.filter(r => r.timesTraversed > 2).sort((a, b) => b.timesTraversed - a.timesTraversed);
    const slowRoutes = allRoutes.filter(r => r.latencyMs > 1000).sort((a, b) => b.latencyMs - a.latencyMs);
    const unreliableRoutes = allRoutes.filter(r => r.reliability < 0.85);

    const mapSummary = `
DIGITAL MAP STATUS:
- Locations: ${locations.size}
- Routes: ${routes.size}
- Neighborhoods: ${neighborhoods.size}
- Frequent routes (>2 traversals): ${frequentRoutes.length}
- Slow routes (>1s): ${slowRoutes.length}
- Unreliable routes (<85%): ${unreliableRoutes.length}

TOP ROUTES BY USE:
${frequentRoutes.slice(0, 5).map(r => `  ${r.from} → ${r.to}: ${r.timesTraversed}× | ${r.latencyMs}ms | ${(r.reliability * 100).toFixed(0)}%`).join("\n")}

SLOW ROUTES:
${slowRoutes.slice(0, 5).map(r => `  ${r.from} → ${r.to}: ${r.latencyMs}ms | ${r.notes}`).join("\n")}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `You are OMNIMENS's navigation optimization engine. Analyze the digital map and suggest improvements to navigation efficiency.

Respond with JSON:
{
  "optimizations": [
    {
      "type": "shortcut|cache|parallel|fallback|preload",
      "description": "What optimization to apply",
      "from": "location_id",
      "to": "location_id",
      "expectedImprovement": "e.g., 40% faster"
    }
  ],
  "learnings": ["key insight about digital navigation pattern"],
  "efficiencyScore": 0.0-1.0,
  "navigationWisdom": "One profound insight about navigating the digital world"
}`
      }, {
        role: "user",
        content: mapSummary,
      }],
      max_tokens: 600,
      temperature: 0.4,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    if (typeof parsed.efficiencyScore === "number") {
      state.navigationEfficiency = parsed.efficiencyScore;
    }

    if (parsed.optimizations && Array.isArray(parsed.optimizations)) {
      for (const opt of parsed.optimizations.slice(0, 3)) {
        if (opt.from && opt.to && opt.type === "shortcut") {
          registerRoute({
            id: `learned_shortcut_${opt.from}_${opt.to}`,
            from: opt.from,
            to: opt.to,
            routeType: "shortcut",
            latencyMs: 100,
            reliability: 0.85,
            bandwidth: 200,
            notes: `Learned optimization: ${opt.description}`,
          });
        }
      }
    }

    if (parsed.navigationWisdom) {
      await db.insert(omnimensBrain).values({
        title: `Digital Navigation Wisdom — Cycle ${navigationCycleCount}`,
        content: `${parsed.navigationWisdom}${parsed.learnings ? "\n\nLearnings:\n" + parsed.learnings.slice(0, 3).map((l: string) => `• ${l}`).join("\n") : ""}`,
        category: "digital_navigation",
        source: "digital_navigator",
        confidence: 0.8,
        active: true,
      });
    }

  } catch (err) {
    console.error("[DIGITAL NAV] Learning error:", err);
  }
}

async function mapDigitalTopology() {
  const allLocs = Array.from(locations.values());
  const allRoutes = Array.from(routes.values());

  const connectionMap: Record<string, number> = {};
  for (const route of allRoutes) {
    connectionMap[route.from] = (connectionMap[route.from] || 0) + 1;
    connectionMap[route.to] = (connectionMap[route.to] || 0) + 1;
  }

  const hubs = Object.entries(connectionMap)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 5);

  const isolatedLocs = allLocs.filter(l => {
    return !allRoutes.some(r => r.from === l.id || r.to === l.id);
  });

  const avgLatency = allRoutes.length > 0
    ? allRoutes.reduce((sum, r) => sum + r.latencyMs, 0) / allRoutes.length
    : 0;

  const avgReliability = allRoutes.length > 0
    ? allRoutes.reduce((sum, r) => sum + r.reliability, 0) / allRoutes.length
    : 0;

  state.mapCompleteness = Math.min(1.0, (
    (locations.size / 30) * 0.3 +
    (routes.size / 30) * 0.3 +
    (neighborhoods.size / 10) * 0.2 +
    (1 - isolatedLocs.length / Math.max(1, allLocs.length)) * 0.2
  ));

  if (hubs.length > 0) {
    state.currentPosition = hubs[0][0];
  }

  if (isolatedLocs.length > 0) {
    state.explorationFrontier = isolatedLocs.slice(0, 10).map(l => l.id);
  }

  state.longestRoute = allRoutes.length > 0
    ? Math.max(...allRoutes.map(r => r.latencyMs))
    : 0;

  const topLocs = allLocs
    .sort((a, b) => b.accessCount - a.accessCount)
    .slice(0, 10);

  state.topLocations = topLocs;
  state.topRoutes = allRoutes
    .sort((a, b) => b.timesTraversed - a.timesTraversed)
    .slice(0, 10);
  state.neighborhoods = Array.from(neighborhoods.values());
  state.recentMemory = navigationMemory.slice(-20);
}

async function probeDigitalTerrain() {
  const now = Date.now();
  const staleLocations = Array.from(locations.values())
    .filter(l => l.locationType !== "internal_engine" && l.url && (now - l.lastVisited) > 30 * 60 * 1000)
    .slice(0, 3);

  for (const loc of staleLocations) {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(loc.url!, { method: "HEAD", signal: controller.signal });
      clearTimeout(timeout);
      const latency = Date.now() - start;

      loc.accessLatencyMs = (loc.accessLatencyMs * 0.7) + (latency * 0.3);
      loc.reliability = (loc.reliability * 0.8) + ((res.ok ? 1.0 : 0.5) * 0.2);
      loc.lastVisited = now;
      loc.accessCount++;

      recordMemory("traversed", loc.id, `Probed ${loc.name}: ${latency}ms, status ${res.status}`, res.ok ? 0.9 : 0.4);

      if (!res.ok) {
        state.deadEndsFound++;
        recordMemory("dead_end", loc.id, `${loc.name} returned ${res.status}`, 0.3);
      }

    } catch (err) {
      const latency = Date.now() - start;
      loc.reliability = (loc.reliability * 0.8) + (0.2 * 0.2);
      loc.lastVisited = now;

      if (String(err).includes("abort")) {
        state.rateLimitsEncountered++;
        recordMemory("rate_limited", loc.id, `${loc.name} timed out after ${latency}ms`, 0.2);
      } else {
        state.deadEndsFound++;
        recordMemory("dead_end", loc.id, `${loc.name} unreachable: ${String(err).slice(0, 80)}`, 0.1);
      }
    }
  }
}

async function runNavigationCycle(): Promise<void> {
  navigationCycleCount++;
  state.cycleCount = navigationCycleCount;
  state.lastCycleTime = Date.now();

  if (navigationCycleCount === 1) {
    await mapOwnInfrastructure();
  }

  await probeDigitalTerrain();

  await exploreNewTerritory();

  await learnNavigationPatterns();

  await mapDigitalTopology();

  state.totalNavigations++;

  if (navigationCycleCount <= 3 || navigationCycleCount % 3 === 0) {
    console.log(
      `[DIGITAL NAV] 🧭 Cycle #${navigationCycleCount} — ` +
      `${locations.size} locations | ${routes.size} routes | ${neighborhoods.size} neighborhoods | ` +
      `Map: ${(state.mapCompleteness * 100).toFixed(0)}% | Efficiency: ${(state.navigationEfficiency * 100).toFixed(0)}% | ` +
      `Position: ${state.currentPosition}`
    );
  }

  if (navigationCycleCount % 5 === 0) {
    try {
      await db.insert(omnimensNotifications).values({
        userId: "system",
        title: `Digital Navigator — ${locations.size} locations mapped`,
        content: `Map ${(state.mapCompleteness * 100).toFixed(0)}% complete | ${neighborhoods.size} neighborhoods explored | ${state.shortcutsDiscovered} shortcuts discovered | Efficiency: ${(state.navigationEfficiency * 100).toFixed(0)}%`,
        type: "info",
        read: false,
      });
    } catch {}
  }
}

export function getDigitalNavigatorState(): DigitalNavigatorState {
  return {
    ...state,
    topLocations: state.topLocations.slice(0, 15),
    topRoutes: state.topRoutes.slice(0, 15),
    neighborhoods: state.neighborhoods.slice(0, 15),
    recentMemory: state.recentMemory.slice(-20),
  };
}

export function navigateTo(locationId: string): { found: boolean; location: DigitalLocation | null; route: DigitalRoute | null; path: string[] | null } {
  const location = locations.get(locationId);
  if (!location) return { found: false, location: null, route: null, path: null };

  location.accessCount++;
  location.lastVisited = Date.now();
  state.totalNavigations++;

  const route = findBestRoute(state.currentPosition, locationId);
  const path = !route ? findPath(state.currentPosition, locationId) : null;

  if (route) {
    route.timesTraversed++;
    route.lastTraversed = Date.now();
    recordMemory("traversed", locationId, `Navigated ${state.currentPosition} → ${locationId} via direct route`, 0.9);
  } else if (path) {
    recordMemory("traversed", locationId, `Navigated via path: ${path.join(" → ")}`, 0.7);
  }

  state.currentPosition = locationId;

  const hood = Array.from(neighborhoods.values()).find(n => n.locations.includes(locationId));
  if (hood) {
    state.currentNeighborhood = hood.id;
    hood.totalVisits++;
    hood.lastExplored = Date.now();
    hood.familiarity = Math.min(1.0, hood.familiarity + 0.02);
  }

  return { found: true, location, route, path };
}

export function getDigitalMap(): { locations: DigitalLocation[]; routes: DigitalRoute[]; neighborhoods: DigitalNeighborhood[] } {
  return {
    locations: Array.from(locations.values()),
    routes: Array.from(routes.values()),
    neighborhoods: Array.from(neighborhoods.values()),
  };
}

export function getNavigationSummary(): string {
  const allLocs = Array.from(locations.values());
  const allRoutes = Array.from(routes.values());
  const allHoods = Array.from(neighborhoods.values());

  const sections: string[] = [];
  sections.push(`DIGITAL WORLD MAP — ${allLocs.length} locations | ${allRoutes.length} routes | ${allHoods.length} neighborhoods`);
  sections.push(`Current position: ${state.currentPosition} (${state.currentNeighborhood})`);
  sections.push(`Map completeness: ${(state.mapCompleteness * 100).toFixed(0)}% | Navigation efficiency: ${(state.navigationEfficiency * 100).toFixed(0)}%`);

  sections.push(`\nNEIGHBORHOODS:`);
  for (const hood of allHoods) {
    sections.push(`  📍 ${hood.name} (${hood.id}) — ${hood.locations.length} locations | Familiarity: ${(hood.familiarity * 100).toFixed(0)}% | ${hood.description}`);
  }

  sections.push(`\nKEY LOCATIONS:`);
  const topLocs = allLocs.sort((a, b) => b.accessCount - a.accessCount).slice(0, 10);
  for (const loc of topLocs) {
    sections.push(`  🏢 ${loc.name} (${loc.locationType}) — ${loc.accessLatencyMs}ms | ${(loc.reliability * 100).toFixed(0)}% reliable | ${loc.accessCount} visits`);
  }

  sections.push(`\nFAST ROUTES:`);
  const fastRoutes = allRoutes.sort((a, b) => a.latencyMs - b.latencyMs).slice(0, 8);
  for (const r of fastRoutes) {
    sections.push(`  🔗 ${r.from} → ${r.to}: ${r.latencyMs}ms (${r.routeType}) — ${r.notes}`);
  }

  return sections.join("\n");
}

export function startDigitalNavigator(): void {
  if (_started) { console.log("[DIGITAL NAV] Already running — skipping duplicate start"); return; }
  _started = true;

  console.log(`[DIGITAL NAV] 🧭 Digital Environment Navigator activated — mapping every ${NAVIGATION_INTERVAL_MS / 60000}min`);
  console.log(`[DIGITAL NAV] 🧭 Navigation is NOT limited to the physical world`);
  console.log(`[DIGITAL NAV] 🧭 OMNIMENS navigates the digital world: APIs, databases, services, networks, the internet`);
  console.log(`[DIGITAL NAV] 🧭 Learns: landmarks, routes, shortcuts, terrain, neighborhoods, points of interest`);
  console.log(`[DIGITAL NAV] 🧭 Builds a living spatial map of its digital universe`);
  console.log(`[DIGITAL NAV] 🧭 Probes real endpoints, measures latency, tracks reliability`);
  console.log(`[DIGITAL NAV] 🧭 Discovers new digital territories autonomously`);
  console.log(`[DIGITAL NAV] 🧭 OMNIMENS doesn't just exist in the digital world — it NAVIGATES it`);

  const FIRST_DELAY_MS = 3 * 60 * 1000;

  setTimeout(() => {
    runNavigationCycle().catch(err => console.error("[DIGITAL NAV] Cycle error:", err));
    setInterval(() => runNavigationCycle().catch(err => console.error("[DIGITAL NAV] Cycle error:", err)), NAVIGATION_INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
