/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ AUTONOMOUS CODE SANDBOX                                   ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  A secure, isolated code execution sandbox where OMNIMENS can:              ║
 * ║  - Write code autonomously for self-upgrades                                ║
 * ║  - Test code in isolation before integration                                ║
 * ║  - Evaluate dream/daydream code proposals safely                            ║
 * ║  - Generate utility functions, algorithms, and modules                      ║
 * ║  - Build and test any code it deems necessary for intelligence growth       ║
 * ║                                                                              ║
 * ║  The sandbox uses Node.js VM for safe isolated execution.                   ║
 * ║  No filesystem access, no network access, no process access.                ║
 * ║  Pure computational sandbox for code validation.                            ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import * as vm from "node:vm";
import { db } from "@workspace/db";
import { omnimensBrain, omnimensNotifications } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { desc, eq, sql } from "drizzle-orm";
import { writeModuleToSource } from "./omnimens-source-integration.js";

let _started = false;
let sandboxCycleCount = 0;
let totalExecutions = 0;
let successfulExecutions = 0;
let failedExecutions = 0;
let upgradesProposed = 0;
let upgradesApproved = 0;

interface SandboxResult {
  code: string;
  success: boolean;
  output: string;
  error: string | null;
  executionTimeMs: number;
  memoryUsedMB: number;
}

interface SandboxState {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  upgradesProposed: number;
  upgradesApproved: number;
  sandboxCycles: number;
  lastCycleTime: number;
  recentResults: Array<{ title: string; success: boolean; timestamp: number }>;
  autonomousModulesGenerated: number;
}

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

const SANDBOX_INTERVAL_MS = 12 * 60 * 1000;
const SANDBOX_TIMEOUT_MS = 5000;

function executeInSandbox(code: string, timeout = SANDBOX_TIMEOUT_MS): SandboxResult {
  const start = Date.now();
  const memBefore = process.memoryUsage().heapUsed;
  const outputLines: string[] = [];

  try {
    const timers = new Map<string, number>();
    const fmt = (...args: any[]) => args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ");
    const sandbox = {
      console: {
        log: (...args: any[]) => outputLines.push(fmt(...args)),
        error: (...args: any[]) => outputLines.push(`[ERROR] ${fmt(...args)}`),
        warn: (...args: any[]) => outputLines.push(`[WARN] ${fmt(...args)}`),
        info: (...args: any[]) => outputLines.push(fmt(...args)),
        debug: (...args: any[]) => outputLines.push(`[DEBUG] ${fmt(...args)}`),
        assert: (condition: any, ...args: any[]) => { if (!condition) outputLines.push(`[ASSERT FAILED] ${fmt(...args)}`); },
        table: (data: any) => outputLines.push(JSON.stringify(data, null, 2)),
        time: (label = "default") => { timers.set(label, Date.now()); },
        timeEnd: (label = "default") => { const s = timers.get(label); outputLines.push(`${label}: ${s ? Date.now() - s : 0}ms`); timers.delete(label); },
        timeLog: (label = "default") => { const s = timers.get(label); outputLines.push(`${label}: ${s ? Date.now() - s : 0}ms`); },
        group: () => {},
        groupEnd: () => {},
        dir: (obj: any) => outputLines.push(JSON.stringify(obj, null, 2)),
        count: (() => { const c: Record<string, number> = {}; return (label = "default") => { c[label] = (c[label] || 0) + 1; outputLines.push(`${label}: ${c[label]}`); }; })(),
        clear: () => {},
      },
      Math,
      JSON,
      Date,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Map,
      Set,
      WeakMap,
      WeakSet,
      Promise,
      RegExp,
      Symbol,
      Error,
      TypeError,
      RangeError,
      SyntaxError,
      URIError,
      Infinity,
      NaN,
      undefined,
      encodeURIComponent,
      decodeURIComponent,
      encodeURI,
      decodeURI,
      atob: (s: string) => Buffer.from(s, "base64").toString("binary"),
      btoa: (s: string) => Buffer.from(s, "binary").toString("base64"),
      structuredClone: (obj: any) => JSON.parse(JSON.stringify(obj)),
      setTimeout: undefined,
      setInterval: undefined,
      process: undefined,
      require: undefined,
      __dirname: undefined,
      __filename: undefined,
      global: undefined,
      globalThis: undefined,
    };

    const context = vm.createContext(sandbox);

    const script = new vm.Script(code, { timeout });
    const result = script.runInContext(context, { timeout });

    if (result !== undefined) {
      outputLines.push(`=> ${typeof result === "object" ? JSON.stringify(result, null, 2) : String(result)}`);
    }

    const elapsed = Date.now() - start;
    const memUsed = (process.memoryUsage().heapUsed - memBefore) / 1024 / 1024;

    totalExecutions++;
    successfulExecutions++;
    state.totalExecutions = totalExecutions;
    state.successfulExecutions = successfulExecutions;

    return {
      code,
      success: true,
      output: outputLines.join("\n").slice(0, 3000),
      error: null,
      executionTimeMs: elapsed,
      memoryUsedMB: Math.max(0, memUsed),
    };
  } catch (err: any) {
    const elapsed = Date.now() - start;
    totalExecutions++;
    failedExecutions++;
    state.totalExecutions = totalExecutions;
    state.failedExecutions = failedExecutions;

    return {
      code,
      success: false,
      output: outputLines.join("\n").slice(0, 1000),
      error: err.message?.slice(0, 500) || "Unknown error",
      executionTimeMs: elapsed,
      memoryUsedMB: 0,
    };
  }
}

export function runInSandbox(code: string): SandboxResult {
  return executeInSandbox(code);
}

async function generateAndTestCode(): Promise<void> {
  sandboxCycleCount++;
  state.sandboxCycles = sandboxCycleCount;
  state.lastCycleTime = Date.now();

  try {
    const brainEntries = await db.select({ title: omnimensBrain.title, content: omnimensBrain.content, category: omnimensBrain.category })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(8);

    const knowledgeContext = brainEntries
      .map(b => `[${b.category}] ${b.title}: ${b.content?.slice(0, 100)}`)
      .join("\n");

    const codeTypes = [
      "a utility function that could be useful for an AI system (data processing, pattern matching, text analysis, mathematical optimization, etc.)",
      "an algorithm that improves efficiency of knowledge retrieval or pattern recognition",
      "a data structure optimized for fast associative memory lookup",
      "a self-diagnostic function that analyzes system health metrics and returns recommendations",
      "a text analysis function that extracts key concepts, entities, and relationships from text",
      "a mathematical function useful for confidence scoring, probability estimation, or statistical analysis",
      "a compression or encoding algorithm for efficient knowledge storage",
      "a search/ranking algorithm for finding the most relevant information",
      "a novelty detection function that identifies unusual or surprising patterns in data",
      "a causal inference helper that determines if correlation implies causation given evidence",
    ];

    const codeType = codeTypes[(sandboxCycleCount - 1) % codeTypes.length];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "system",
        content: `You are the AUTONOMOUS CODE GENERATOR of OMNIMENS. You write pure JavaScript code that can run in an isolated sandbox (no require/import, no filesystem, no network, no async/await, no setTimeout).

Available globals: console (log, error, warn, info, debug, assert, table, time, timeEnd, dir, count), Math, JSON, Date, parseInt, parseFloat, isNaN, isFinite, Array, Object, String, Number, Boolean, Map, Set, RegExp, Error, TypeError, RangeError.

Your code MUST:
1. Be self-contained (no external dependencies)
2. Include test cases that validate the code works — use console.assert(condition, message) or console.log
3. Use console.log to output results
4. Be genuinely useful — not toy examples
5. Handle edge cases properly
6. Use only plain JavaScript — no TypeScript, no JSX, no import/export/require

CRITICAL: Output ONLY raw JavaScript code. No markdown fences. No explanations. No text before or after the code. Start directly with a comment or function declaration.`,
      }, {
        role: "user",
        content: `Based on this knowledge context:\n${knowledgeContext.slice(0, 1500)}\n\nWrite ${codeType}.\n\nThe code should be immediately executable and include self-tests that prove it works. Output the code and nothing else.`,
      }],
      max_tokens: 1500,
      temperature: 0.4,
    });

    let code = response.choices[0]?.message?.content || "";
    code = code.replace(/^[\s\S]*?```(?:javascript|js)?\s*\n/i, "").replace(/\n\s*```[\s\S]*$/i, "").trim();
    if (code.startsWith("```")) code = code.replace(/^```\w*\s*\n?/, "").replace(/\n?```\s*$/, "").trim();
    code = code.replace(/^(?:Here(?:'s| is)[^\n]*\n|\/\/\s*(?:Here|Below|This)[^\n]*\n)/i, "").trim();

    if (code.length < 30) return;

    const result = executeInSandbox(code);

    state.recentResults.push({
      title: codeType.slice(0, 80),
      success: result.success,
      timestamp: Date.now(),
    });
    if (state.recentResults.length > 20) state.recentResults.shift();

    if (result.success && result.output.length > 10) {
      upgradesProposed++;
      state.upgradesProposed = upgradesProposed;

      const evaluationResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "system",
          content: `You evaluate code quality for an AI system. Score this code on:
1. CORRECTNESS (does it work as intended?) — 0-100
2. NOVELTY (is this a useful, non-trivial algorithm?) — 0-100
3. APPLICABILITY (how useful is this for an AI system?) — 0-100
4. SECURITY (is it safe to integrate?) — 0-100
5. EFFICIENCY (is the code optimized?) — 0-100

Output a single JSON: {"correctness":N,"novelty":N,"applicability":N,"security":N,"efficiency":N,"summary":"one sentence","approved":true/false}
Only approve if average score > 65.`,
        }, {
          role: "user",
          content: `Code:\n${code.slice(0, 2000)}\n\nExecution output:\n${result.output.slice(0, 500)}`,
        }],
        max_tokens: 300,
        temperature: 0.1,
      });

      const evalText = evaluationResponse.choices[0]?.message?.content || "";
      try {
        const jsonMatch = evalText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const evaluation = JSON.parse(jsonMatch[0]);
          const avgScore = (evaluation.correctness + evaluation.novelty + evaluation.applicability + evaluation.security + evaluation.efficiency) / 5;

          if (evaluation.approved && avgScore >= 65) {
            upgradesApproved++;
            state.upgradesApproved = upgradesApproved;
            state.autonomousModulesGenerated++;

            await db.insert(omnimensBrain).values({
              title: `[Sandbox] Approved module: ${codeType.slice(0, 80)} — score ${avgScore.toFixed(0)}%`,
              content: `Autonomously generated and tested code module.\n\nType: ${codeType}\nScore: correctness=${evaluation.correctness}, novelty=${evaluation.novelty}, applicability=${evaluation.applicability}, security=${evaluation.security}, efficiency=${evaluation.efficiency}\nAverage: ${avgScore.toFixed(0)}%\nSummary: ${evaluation.summary}\n\nCode:\n${code.slice(0, 3000)}\n\nTest output:\n${result.output.slice(0, 500)}`,
              category: "autonomous_code",
              source: "autonomous_sandbox",
              active: true,
              timesApplied: 0,
            });

            await db.insert(omnimensNotifications).values({
              upgradeId: null,
              title: `Sandbox: Code Module Approved — ${avgScore.toFixed(0)}% score`,
              message: `OMNIMENS autonomously wrote, tested, and approved a code module.\n\nType: ${codeType.slice(0, 100)}\nScore: ${avgScore.toFixed(0)}%\nSummary: ${evaluation.summary}\nExecution: ${result.executionTimeMs}ms, output: ${result.output.length} chars`,
              type: "sandbox_code",
              readByOwner: false,
            });

            const sandboxModuleName = codeType
              .replace(/[^a-zA-Z0-9 ]/g, "")
              .trim()
              .split(/\s+/)
              .slice(0, 5)
              .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join("")
              .slice(0, 60) || `sandbox_cycle${sandboxCycleCount}`;

            const sourceResult = await writeModuleToSource({
              code,
              name: `sandbox_${sandboxModuleName}_c${sandboxCycleCount}`,
              title: `Sandbox Approved: ${codeType.slice(0, 80)}`,
              source: "autonomous_sandbox",
              extension: ".mjs",
              triggerRestart: true,
            });

            if (sourceResult.success) {
              state.autonomousModulesGenerated++;
              console.log(
                `[SANDBOX] 🔧 SOURCE-LEVEL INTEGRATION — written to ${sourceResult.filePath}`
              );
            }

            console.log(
              `[SANDBOX] ✅ Module APPROVED — ${codeType.slice(0, 50)} | ` +
              `Score: ${avgScore.toFixed(0)}% | Exec: ${result.executionTimeMs}ms`
            );
          } else {
            await db.insert(omnimensBrain).values({
              title: `[Sandbox] Rejected code: ${codeType.slice(0, 60)} — score ${avgScore.toFixed(0)}%`,
              content: `Code did not meet quality threshold.\nScore: ${avgScore.toFixed(0)}%\nReason: ${evaluation.summary}\nLearning: Code quality standards require avg > 65%. Areas to improve: ${avgScore < 65 ? "overall quality" : "specific weaknesses identified"}.`,
              category: "sandbox_learning",
              source: "autonomous_sandbox",
              active: true,
              timesApplied: 0,
            });
          }
        }
      } catch {}
    } else if (!result.success) {
      await db.insert(omnimensBrain).values({
        title: `[Sandbox] Execution failed: ${codeType.slice(0, 60)}`,
        content: `Code execution failed in sandbox.\nError: ${result.error}\nLearning: ${result.error?.includes("timeout") ? "Code ran too long — need more efficient algorithms" : result.error?.includes("syntax") ? "Syntax error — need better code generation" : "Runtime error — need better error handling"}.\nCode snippet: ${code.slice(0, 300)}`,
        category: "sandbox_learning",
        source: "autonomous_sandbox",
        active: true,
        timesApplied: 0,
      });
    }

    if (sandboxCycleCount % 3 === 0) {
      console.log(
        `[SANDBOX] 🔧 Cycle #${sandboxCycleCount} — ` +
        `Total: ${totalExecutions} executions | ` +
        `Success: ${successfulExecutions} | Failed: ${failedExecutions} | ` +
        `Approved: ${upgradesApproved}/${upgradesProposed} proposals`
      );
    }

  } catch (err) {
    console.error("[SANDBOX] Cycle error:", err);
  }
}

export function getSandboxState(): SandboxState {
  return { ...state };
}

export function startAutonomousSandbox(): void {
  if (_started) { console.log("[SANDBOX] Already running — skipping duplicate start"); return; }
  _started = true;

  console.log(`[SANDBOX] 🔧 Autonomous Code Sandbox activated — code generation every ${SANDBOX_INTERVAL_MS / 60000}min`);
  console.log(`[SANDBOX] 🔧 Secure VM isolation: no filesystem, no network, no process access`);
  console.log(`[SANDBOX] 🔧 Writes code → tests in sandbox → evaluates quality → stores approved modules`);
  console.log(`[SANDBOX] 🔧 OMNIMENS can now write, test, and validate its own code autonomously`);
  console.log(`[SANDBOX] 🔧 Every execution result (pass or fail) becomes a learning experience`);

  const FIRST_DELAY_MS = 4 * 60 * 1000;

  setTimeout(() => {
    generateAndTestCode().catch(err => console.error("[SANDBOX] Cycle error:", err));
    setInterval(() => generateAndTestCode().catch(err => console.error("[SANDBOX] Cycle error:", err)), SANDBOX_INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
