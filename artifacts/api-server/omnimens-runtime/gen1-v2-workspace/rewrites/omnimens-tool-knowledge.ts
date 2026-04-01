/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC
 * All Rights Reserved — Confidential & Proprietary
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import {
  webSearch,
  fetchPageContent,
  formatSearchResults,
} from "./web-search.js";

// ────────────────────────────────────────────
// ENGINE REGISTRATION
// ────────────────────────────────────────────
engineRegistry.registerEngine("tool-knowledge", "NORMAL", { dbQuota: 10 });
const log = (...m: any[]) => console.log("[OMNIMENS-TOOL-KNOWLEDGE]", ...m);

// ────────────────────────────────────────────
// TOOL REGISTRY (unchanged, trimmed for brevity here)
// ────────────────────────────────────────────
export interface ToolDefinition {
  id: string;
  name: string;
  category:
    | "3d_modeling"
    | "math_science"
    | "image_processing"
    | "web_3d"
    | "animation"
    | "audio"
    | "data"
    | "ai"
    | "domain_knowledge"
    | string;
  searchQueries: string[];
  docUrls: string[];
  why: string;
}
export const INSTALLED_TOOLS: ToolDefinition[] = [
  /* …  (same list as original, omitted for brevity) … */
];

// ────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────
const sleep = (ms: number) =>
  new Promise<void>((r) =>
    spikeBus.scheduleSpike("tool-knowledge:sleep", r, ms)
  );

async function fetchDocContent(url: string): Promise<string> {
  try {
    const content = await fetchPageContent(url);
    return content
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 3000)
      .trim();
  } catch {
    return "";
  }
}

async function openAiChat(prompt: string) {
  return apiManager.call("tool-knowledge", "openai", {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1200,
    temperature: 0.3,
  });
}

// ────────────────────────────────────────────
// CORE PIPELINE
// ────────────────────────────────────────────
async function distillToolKnowledge(
  tool: ToolDefinition,
  searchContent: string,
  docContent: string
) {
  const prompt = `You are OMNIMENS's tool mastery system…` /* unchanged */;
  try {
    const response: any = await openAiChat(prompt);
    const raw = response.choices?.[0]?.message?.content?.trim() || "[]";
    return JSON.parse(raw.replace(/