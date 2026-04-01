/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * [OMNIMENS-EVOLUTION] v2.0 — unified-runtime edition
 *
 * This file was aggressively condensed while preserving every public export and
 * all high-level behaviours.  One spike handler now replaces the old timers,
 * and all infra concerns (DB / API / scheduling / cognition) are delegated to
 * the unified runtime.  More brains, fewer lines.  Idle = zero cost.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { webSearch, formatSearchResults } from "./web-search.js";
import { writeModuleToSource } from "./omnimens-source-integration.js";

const ENGINE = "evolution";
const __dirname = dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = join(__dirname, "../omnimens-runtime/modules");
const CYCLE_MS = 6 * 60 * 60 * 1000; // every 6h

/* ───────────────────────  Runtime registration  ──────────────────────────── */
engineRegistry.registerEngine(ENGINE, "NORMAL", { dbQuota: 10 });

/* ───────────────────────────  Small utilities  ───────────────────────────── */
const ensureDir = () => { if (!existsSync(MODULES_DIR)) mkdirSync(MODULES_DIR, { recursive: true }); };
const rndPick = <T>(arr: T[], n: number) =>
  [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const now = () => Date.now();

type Insight = { type: string; data: any };

/* ─────────────────────────  Code discovery seeds  ────────────────────────── */
const CODE_QUERIES = [
  "novel neural architecture transformer 2025",
  "emerging programming paradigms 2025",
  "webassembly wasm ai runtime node",
  "vector embedding similarity search javascript",
  "autonomous ai agent framework 2025",
  // … (trimmed; same spirit, shorter list)
] as const;

/* ───────────────────  LLM / OpenAI thin abstraction  ─────────────────────── */
const llm = async (req: any) =>
  apiManager.call(ENGINE, "openai", {
    method: "chat.completions.create",
    ...req,
  });

/* ──────────────────────  Self-coding / module writer  ─────────────────────── */
async function genModule(
  name: string,
  purpose: string,
  algorithm: string,
  context: string
) {
  const prompt = `You are OMNIMENS generating a reusable JS module.

MODULE: ${name}
PURPOSE: ${purpose}
ALGORITHM: ${algorithm}
CONTEXT:
${context.slice(0, 1200)}

Return JSON with { "code": "...", "description": "..." } obeying strict ES-module & safety rules.`;
  const rsp = await llm({ model: "gpt-4o", messages: [{ role: "user", content: prompt }], max_tokens: 2200 });
  const txt = rsp.choices?.[0]?.message?.content?.trim() ?? "{}";
  try {
    const obj = JSON.parse(txt.replace(/^