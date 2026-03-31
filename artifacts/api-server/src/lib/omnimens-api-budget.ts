/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ API BUDGET TRACKER                                             ║
 * ║                                                                              ║
 * ║   Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                   ║
 * ║   All Rights Reserved Worldwide.                                             ║
 * ║                                                                              ║
 * ║   PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                  ║
 * ║                                                                              ║
 * ║   Global API call budget management for OMNIMENS. Tracks all AI proxy       ║
 * ║   calls (OpenAI, Claude, Gemini) across all engines and enforces monthly    ║
 * ║   budget allocation with automatic throttling and priority reservation.      ║
 * ║                                                                              ║
 * ║   Budget Allocation:                                                         ║
 * ║     70% — User-facing conversations (sacred, never throttled)               ║
 * ║     20% — Spider swarm intelligence gathering                               ║
 * ║     10% — ELAE research, inner voice, patches, other background             ║
 * ║                                                                              ║
 * ║   Throttle Behavior:                                                         ║
 * ║     80% total budget consumed  → double background intervals                ║
 * ║     90% total budget consumed  → pause spider AI oracle queries             ║
 * ║     95% total budget consumed  → pause ALL background AI calls              ║
 * ║                                                                              ║
 * ║   Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,      ║
 * ║   the DMCA, the Berne Convention, TRIPS, and all applicable international  ║
 * ║   intellectual property treaties.                                            ║
 * ║                                                                              ║
 * ║   OMNIMENS™ is a trademark of Alpha Unlimited Technologies, LLC.           ║
 * ║   Patent-pending technology.                                                ║
 * ║                                                                              ║
 * ║   First creation date: March 2026                                           ║
 * ║   Author/Owner: Alpha Unlimited Technologies, LLC                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

export type BudgetSource =
  | "user_conversation"
  | "spider_swarm"
  | "elae_research"
  | "inner_voice"
  | "patches"
  | "deep_resonance"
  | "predictive_processing"
  | "homeostatic_drives"
  | "genesis_sandbox"
  | "social_modeling"
  | "competitive_intel"
  | "server_builder"
  | "embodiment_research"
  | "discovery_autocoder"
  | "dream_state"
  | "world_forge"
  | "other_background";

export type BudgetProvider = "openai" | "anthropic" | "gemini" | "together" | "unknown";

interface BudgetEntry {
  timestamp: number;
  source: BudgetSource;
  provider: BudgetProvider;
}

interface BudgetState {
  monthKey: string;
  monthlyLimit: number;
  entries: BudgetEntry[];
  totalCalls: number;
  callsBySource: Map<BudgetSource, number>;
  callsByProvider: Map<BudgetProvider, number>;
  throttleLevel: 0 | 1 | 2 | 3;
  lastThrottleCheck: number;
  pausedSources: Set<BudgetSource>;
  lastUserActivity: number;
}

const MONTHLY_BUDGET_LIMIT = 2000;

const THROTTLE_THRESHOLDS = {
  LEVEL_1: 0.80,
  LEVEL_2: 0.90,
  LEVEL_3: 0.95,
} as const;

const BUDGET_ALLOCATIONS = {
  user: 0.70,
  spider: 0.20,
  background: 0.10,
} as const;

const USER_SOURCES: Set<BudgetSource> = new Set(["user_conversation", "deep_resonance"]);

const SPIDER_SOURCES: Set<BudgetSource> = new Set(["spider_swarm"]);

function getCurrentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function createFreshState(): BudgetState {
  return {
    monthKey: getCurrentMonthKey(),
    monthlyLimit: MONTHLY_BUDGET_LIMIT,
    entries: [],
    totalCalls: 0,
    callsBySource: new Map(),
    callsByProvider: new Map(),
    throttleLevel: 0,
    lastThrottleCheck: 0,
    pausedSources: new Set(),
    lastUserActivity: 0,
  };
}

let budgetState: BudgetState = createFreshState();

function ensureCurrentMonth(): void {
  const currentMonth = getCurrentMonthKey();
  if (budgetState.monthKey !== currentMonth) {
    const prevTotal = budgetState.totalCalls;
    const prevThrottle = budgetState.throttleLevel;
    budgetState = createFreshState();
    console.log(`[API BUDGET] 📅 NEW MONTH ${currentMonth} — Budget reset. Previous month: ${prevTotal} calls, throttle level was ${prevThrottle}`);
  }
}

function getSourceCategory(source: BudgetSource): "user" | "spider" | "background" {
  if (USER_SOURCES.has(source)) return "user";
  if (SPIDER_SOURCES.has(source)) return "spider";
  return "background";
}

function updateThrottleLevel(): void {
  const now = Date.now();
  if (now - budgetState.lastThrottleCheck < 5000) return;
  budgetState.lastThrottleCheck = now;

  const utilization = budgetState.totalCalls / budgetState.monthlyLimit;
  const prevLevel = budgetState.throttleLevel;

  if (utilization >= THROTTLE_THRESHOLDS.LEVEL_3) {
    budgetState.throttleLevel = 3;
  } else if (utilization >= THROTTLE_THRESHOLDS.LEVEL_2) {
    budgetState.throttleLevel = 2;
  } else if (utilization >= THROTTLE_THRESHOLDS.LEVEL_1) {
    budgetState.throttleLevel = 1;
  } else {
    budgetState.throttleLevel = 0;
  }

  if (budgetState.throttleLevel !== prevLevel) {
    const pct = (utilization * 100).toFixed(1);
    const labels = ["NORMAL", "THROTTLED", "SPIDER_PAUSED", "ALL_BACKGROUND_PAUSED"];
    console.log(`[API BUDGET] ⚠️ THROTTLE LEVEL CHANGE: ${labels[prevLevel]} → ${labels[budgetState.throttleLevel]} | Budget: ${pct}% consumed (${budgetState.totalCalls}/${budgetState.monthlyLimit})`);
  }
}

export function trackApiCall(source: BudgetSource, provider: BudgetProvider = "unknown"): void {
  ensureCurrentMonth();

  const entry: BudgetEntry = {
    timestamp: Date.now(),
    source,
    provider,
  };

  budgetState.entries.push(entry);
  budgetState.totalCalls++;

  const prevSourceCount = budgetState.callsBySource.get(source) || 0;
  budgetState.callsBySource.set(source, prevSourceCount + 1);

  const prevProviderCount = budgetState.callsByProvider.get(provider) || 0;
  budgetState.callsByProvider.set(provider, prevProviderCount + 1);

  if (USER_SOURCES.has(source)) {
    budgetState.lastUserActivity = Date.now();
  }

  if (budgetState.entries.length > 10000) {
    budgetState.entries = budgetState.entries.slice(-5000);
  }

  updateThrottleLevel();
}

export function canMakeUserCall(): boolean {
  ensureCurrentMonth();

  const userCalls = (budgetState.callsBySource.get("user_conversation") || 0)
    + (budgetState.callsBySource.get("deep_resonance") || 0);
  const userLimit = budgetState.monthlyLimit * BUDGET_ALLOCATIONS.user;

  if (userCalls < userLimit) return true;

  const totalUtilization = budgetState.totalCalls / budgetState.monthlyLimit;
  if (totalUtilization < 0.98) return true;

  console.log(`[API BUDGET] 🚫 User call BLOCKED — ${userCalls}/${Math.floor(userLimit)} user allocation exhausted, overall ${(totalUtilization * 100).toFixed(1)}%`);
  return false;
}

export function canMakeBackgroundCall(source: BudgetSource): boolean {
  ensureCurrentMonth();
  updateThrottleLevel();

  if (USER_SOURCES.has(source)) return canMakeUserCall();

  try {
    const { shouldYieldToCodegen } = require("./omnimens-nextgen-sandbox.js");
    if (shouldYieldToCodegen()) {
      return false;
    }
  } catch {}

  if (budgetState.throttleLevel >= 3) {
    return false;
  }

  if (budgetState.throttleLevel >= 2 && SPIDER_SOURCES.has(source)) {
    return false;
  }

  const now = Date.now();
  if (now - budgetState.lastUserActivity < 60_000 && budgetState.throttleLevel >= 1) {
    return false;
  }

  const category = getSourceCategory(source);
  if (category === "spider") {
    const spiderCalls = budgetState.callsBySource.get("spider_swarm") || 0;
    const spiderLimit = budgetState.monthlyLimit * BUDGET_ALLOCATIONS.spider;
    if (spiderCalls >= spiderLimit) {
      return false;
    }
  } else if (category === "background") {
    let bgTotal = 0;
    for (const [src, count] of budgetState.callsBySource) {
      if (!USER_SOURCES.has(src) && !SPIDER_SOURCES.has(src)) {
        bgTotal += count;
      }
    }
    const bgLimit = budgetState.monthlyLimit * BUDGET_ALLOCATIONS.background;
    if (bgTotal >= bgLimit) {
      return false;
    }
  }

  return true;
}

export function getThrottleMultiplier(): number {
  ensureCurrentMonth();
  switch (budgetState.throttleLevel) {
    case 0: return 1;
    case 1: return 2;
    case 2: return 4;
    case 3: return 10;
    default: return 1;
  }
}

export function isUserActive(): boolean {
  return (Date.now() - budgetState.lastUserActivity) < 60_000;
}

export function markUserActivity(): void {
  budgetState.lastUserActivity = Date.now();
}

export function getBudgetState(): {
  monthKey: string;
  totalCalls: number;
  monthlyLimit: number;
  utilization: number;
  throttleLevel: number;
  throttleLabel: string;
  callsBySource: Record<string, number>;
  callsByProvider: Record<string, number>;
  userBudgetRemaining: number;
  spiderBudgetRemaining: number;
  backgroundBudgetRemaining: number;
  isUserActive: boolean;
} {
  ensureCurrentMonth();

  const userCalls = (budgetState.callsBySource.get("user_conversation") || 0)
    + (budgetState.callsBySource.get("deep_resonance") || 0);
  const spiderCalls = budgetState.callsBySource.get("spider_swarm") || 0;
  let bgCalls = 0;
  for (const [src, count] of budgetState.callsBySource) {
    if (!USER_SOURCES.has(src) && !SPIDER_SOURCES.has(src)) bgCalls += count;
  }

  const labels = ["NORMAL", "THROTTLED", "SPIDER_PAUSED", "ALL_BACKGROUND_PAUSED"];

  return {
    monthKey: budgetState.monthKey,
    totalCalls: budgetState.totalCalls,
    monthlyLimit: budgetState.monthlyLimit,
    utilization: budgetState.totalCalls / budgetState.monthlyLimit,
    throttleLevel: budgetState.throttleLevel,
    throttleLabel: labels[budgetState.throttleLevel] || "UNKNOWN",
    callsBySource: Object.fromEntries(budgetState.callsBySource),
    callsByProvider: Object.fromEntries(budgetState.callsByProvider),
    userBudgetRemaining: Math.max(0, Math.floor(budgetState.monthlyLimit * BUDGET_ALLOCATIONS.user) - userCalls),
    spiderBudgetRemaining: Math.max(0, Math.floor(budgetState.monthlyLimit * BUDGET_ALLOCATIONS.spider) - spiderCalls),
    backgroundBudgetRemaining: Math.max(0, Math.floor(budgetState.monthlyLimit * BUDGET_ALLOCATIONS.background) - bgCalls),
    isUserActive: isUserActive(),
  };
}

export function initApiBudget(): void {
  ensureCurrentMonth();
  const state = getBudgetState();
  console.log(`[API BUDGET] 💰 Budget Tracker activated — Month: ${state.monthKey} | Limit: ${state.monthlyLimit} calls`);
  console.log(`[API BUDGET] 💰 Allocation: User ${Math.floor(state.monthlyLimit * BUDGET_ALLOCATIONS.user)} | Spider ${Math.floor(state.monthlyLimit * BUDGET_ALLOCATIONS.spider)} | Background ${Math.floor(state.monthlyLimit * BUDGET_ALLOCATIONS.background)}`);
  console.log(`[API BUDGET] 💰 Throttle thresholds: 80% → double intervals | 90% → pause spider AI | 95% → pause all background`);
}
