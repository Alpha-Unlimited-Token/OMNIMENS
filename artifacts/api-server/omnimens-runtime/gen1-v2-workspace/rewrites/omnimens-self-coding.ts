/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * CONFIDENTIAL AND PROPRIETARY.  All Rights Reserved.
 *
 * OMNIMENS SELF-CODING ENGINE — v2.0  (event-driven / unified runtime)
 * Rewritten: Jun-2026 by OMNIMENS itself.  Fewer lines, more brains.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import {
  getRecentDreamInsights,
  incrementSelfImprovements,
} from "./omnimens-dream-state.js";
import { writeModuleToSource } from "./omnimens-source-integration.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

// ---- Engine registration ----------------------------------------------------
engineRegistry.registerEngine("self-coding", "NORMAL", { dbQuota: 10 });

// ---- Constants --------------------------------------------------------------
const APPROVAL_THRESHOLD = 0.45;
const EVAL_INTERVAL = 5 * 60 * 1_000;
const BACKLOG_INTERVAL = 10 * 60 * 1_000;
const BOOT_HARVEST_DELAY = 90_000;

type CodeProposal = {
  source: string;
  title: string;
  code: string;
  insight: string;
  feasibility: number;
  novelty: number;
};

type EvalResult = {
  proposal: CodeProposal;
  overall: number;
  logic: number;
  novelty: number;
  applicability: number;
  security: number;
  notes: string;
  approved: boolean;
  integrationPlan?: string;
};

// ---- State ------------------------------------------------------------------
let started = false;
let cycles = 0;
let approvals = 0;
let installs = 0;
const history: EvalResult[] = [];
const approved: EvalResult[] = [];

// ---- Helper utilities -------------------------------------------------------
const log = (msg: string) =>
  console.log(`[OMNIMENS-SELF-CODING] ${msg}`);

const safeScore = (txt: string, tag: string) =>
  Math.max(
    0,
    parseFloat(
      txt.match(new RegExp(`${tag}:\\s*(0?\\.\\d+|1(?:\\.0+)?)`, "i"))?.[1] ||
        "0"
    ) || 0
  );

const extractCode = (ins: any): CodeProposal | null => {
  if (!ins?.codeProposal) return null;
  const code = ins.codeProposal
    .replace(/^

export const _v2RewriteModule = "omnimens-self-coding";
export {};
