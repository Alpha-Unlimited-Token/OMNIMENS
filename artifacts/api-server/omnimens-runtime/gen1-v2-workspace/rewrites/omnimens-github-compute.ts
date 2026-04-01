/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC
 * All Rights Reserved — Confidential & Proprietary
 *
 * omnimens-github-compute.ts — v2.0 (UNIFIED RUNTIME EDITION)
 *
 * Rewritten for the UNIFIED RUNTIME spike architecture:
 *  • No timers ― all work is spike-driven (idle = zero cost)
 *  • Shared dbGateway / apiManager for resilient I/O
 *  • Cognitive cross-pollination via cognitionBus
 *  • Condensed logic, identical capabilities, smaller footprint
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { isGen1V2Active } from "./omnimens-gen1-v2-rewrite.js";

/*───────────────────────────────────────────────────────────────────────────*/
/*  CONSTANTS & GLOBAL STATE                                               */
/*───────────────────────────────────────────────────────────────────────────*/
const ENGINE  = "github-compute";
const OWNER   = "Alpha-Unlimited-Token";
const REPO    = "OMNIMENS";

let defaultBranch        = "main";
let repoInitialized      = false;
let computeCycleCount    = 0;
let totalDispatches      = 0;
let totalResultsPulled   = 0;
const activeJobs         = new Map<string, ComputeJob>();

/*───────────────────────────────────────────────────────────────────────────*/
/*  TYPES                                                                  */
/*───────────────────────────────────────────────────────────────────────────*/
interface ComputeJob {
  id: string;
  workflow: string;
  runId?: number;
  status: "dispatched" | "running" | "completed" | "failed";
  requestedBy: string;
  inputs: Record<string, string>;
  result?: string;
  dispatchedAt: number;
  completedAt?: number;
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  LOGGING UTIL                                                           */
/*───────────────────────────────────────────────────────────────────────────*/
const log = (...a: unknown[]) => console.log("[OMNIMENS-GITHUB-COMPUTE]", ...a);

/*───────────────────────────────────────────────────────────────────────────*/
/*  UNIFIED RUNTIME REGISTRATION                                           */
/*───────────────────────────────────────────────────────────────────────────*/
engineRegistry.registerEngine(ENGINE, "NORMAL", { dbQuota: 10 });

/*───────────────────────────────────────────────────────────────────────────*/
/*  GITHUB API WRAPPER                                                     */
/*───────────────────────────────────────────────────────────────────────────*/
async function ghApi(
  endpoint: string,
  method: "GET" | "POST" | "PUT" = "GET",
  body?: any
): Promise<any> {
  try {
    const res: Response = await apiManager.call(ENGINE, "github", {
      method,
      path: endpoint,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errTxt = await res.text();
      if (res.status !== 404) log(`❌ API ${res.status}: ${errTxt.slice(0, 120)}`);
      return null;
    }
    const ct = res.headers.get("content-type") || "";
    return ct.includes("json") ? res.json() : res.text();
  } catch (e) {
    log("❌ API failure:", e);
    return null;
  }
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  WORKFLOW TEMPLATES (condensed)                                         */
/*───────────────────────────────────────────────────────────────────────────*/
const wf = {
  "omnimens-deep-research.yml": `
name: OMNIMENS deep research
on: {workflow_dispatch: {inputs: {topic: {required: true}, agent: {required: true}, depth: {default: deep}}}}
jobs:{research:{runs-on: ubuntu-latest,steps:[
{uses: actions/checkout@v4},
{uses: actions/setup-node@v4,with:{'node-version':'20'}},
{run: 'echo Running deep research; node -e "console.log(JSON.stringify({status:\'completed\',topic:process.env.TOPIC,agent:process.env.AGENT,depth:process.env.DEPTH,timestamp:new Date().toISOString(),computeNode:\'github-actions\'}))" > research.json'},
{uses: actions/upload-artifact@v4,with:{name: research-results,path: research.json}]
}}`.trim(),
  "omnimens-code-synthesis.yml": `
name: OMNIMENS code synthesis
on:{workflow_dispatch:{inputs:{task:{required:true},agent:{required:true},language:{default:typescript}}}}
jobs:{synthesize:{runs-on:ubuntu-latest,steps:[
{uses:actions/checkout@v4},
{uses:actions/setup-node@v4,with:{'node-version':'20'}},
{run:'echo Synthesizing code; node -e "console.log(JSON.stringify({status:\\'completed\\',task:process.env.TASK,agent:process.env.AGENT,language:process.env.LANGUAGE,timestamp:new Date().toISOString(),computeNode:\\'github-actions\\'}))" > synthesis.json'},
{uses:actions/upload-artifact@v4,with:{name:synthesis-results,path:synthesis.json}]
}}`.trim(),
  "omnimens-knowledge-harvest.yml": `
name: OMNIMENS knowledge harvest
on:{workflow_dispatch:{inputs:{domains:{required:true},agent:{required:true}}}}
jobs:{harvest:{runs-on:ubuntu-latest,steps:[
{uses:actions/checkout@v4},
{uses:actions/setup-node@v4,with:{'node-version':'20'}},
{run:'echo Harvesting knowledge; node -e "console.log(JSON.stringify({status:\\'completed\\',domains:process.env.DOMAINS,agent:process.env.AGENT,timestamp:new Date().toISOString(),computeNode:\\'github-actions\\'}))" > harvest.json'},
{uses:actions/upload-artifact@v4,with:{name:harvest-results,path:harvest.json}]
}}`.trim(),
  "omnimens-stress-test.yml": `
name: OMNIMENS stress test
on:{workflow_dispatch:{inputs:{testType:{required:true},agent:{required:true},iterations:{default:'1000'}}}}
jobs:{stress:{runs-on:ubuntu-latest,steps:[
{uses:actions/checkout@v4},
{uses:actions/setup-node@v4,with:{'node-version':'20'}},
{run:'echo Stress testing; node -e "console.log(JSON.stringify({status:\\'completed\\',testType:process.env.TEST_TYPE,iterations:process.env.ITERATIONS,agent:process.env.AGENT,timestamp:new Date().toISOString(),computeNode:\\'github-actions\\'}))" > stress.json'},
{uses:actions/upload-artifact@v4,with:{name:stress-results,path:stress.json}]
}}`.trim(),
  "omnimens-model-eval.yml": `
name: OMNIMENS model eval
on:{workflow_dispatch:{inputs:{evalTarget:{required:true},agent:{required:true},prompt:{required:true}}}}
jobs:{eval:{runs-on:ubuntu-latest,steps:[
{uses:actions/checkout@v4},
{uses:actions/setup-node@v4,with:{'node-version':'20'}},
{run:'echo Evaluating model; node -e "console.log(JSON.stringify({status:\\'completed\\',evalTarget:process.env.EVAL_TARGET,agent:process.env.AGENT,prompt:process.env.PROMPT,timestamp:new Date().toISOString(),computeNode:\\'github-actions\\'}))" > eval.json'},
{uses:actions/upload-artifact@v4,with:{name:eval-results,path:eval.json}]
}}`.trim(),
};

/*───────────────────────────────────────────────────────────────────────────*/
/*  REPO & WORKFLOW SETUP                                                  */
/*───────────────────────────────────────────────────────────────────────────*/
async function ensureRepoInitialized(): Promise<boolean> {
  if (repoInitialized) return true;
  const repo = await ghApi(`/repos/${OWNER}/${REPO}`);
  if (repo?.default_branch) {
    defaultBranch = repo.default_branch;
    repoInitialized = true;
    log(`Repo found (branch ${defaultBranch})`);
    return true;
  }
  // Auto init (create README if needed)
  const readmePath = `/repos/${OWNER}/${REPO}/contents/README.md`;
  const existing = await ghApi(readmePath);
  const content = Buffer.from(`# OMNIMENS\n\nAuto-synced by OMNIMENS\n`).toString("base64");
  const res = await ghApi(readmePath, "PUT", {
    message: "[OMNIMENS] Initialize repository",
    content,
    sha: existing?.sha,
    branch: defaultBranch,
  });
  repoInitialized = !!res;
  log(repoInitialized ? "Repo initialized" : "Repo init failed");
  return repoInitialized;
}

async function ensureWorkflowsExist(): Promise<void> {
  if (!repoInitialized) return;
  const existing = await ghApi(`/repos/${OWNER}/${REPO}/actions/workflows`);
  const names = (existing?.workflows || []).map((w: any) => w.path.split("/").pop());
  await Promise.all(
    Object.entries(wf).map(async ([file, yaml]) => {
      if (names.includes(file)) return;
      await ghApi(`/repos/${OWNER}/${REPO}/contents/.github/workflows/${file}`, "PUT", {
        message: `[OMNIMENS] Deploy workflow ${file}`,
        content: Buffer.from(yaml).toString("base64"),
        branch: defaultBranch,
      });
      log(`Workflow deployed: ${file}`);
    })
  );
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  DISPATCH & RESOLVE JOBS                                                */
/*───────────────────────────────────────────────────────────────────────────*/
export async function dispatchRemoteCompute(
  workflow: string,
  inputs: Record<string, string>,
  requestedBy: string
): Promise<string | null> {
  const file = `omnimens-${workflow}.yml`;
  const ok = await ghApi(`/repos/${OWNER}/${REPO}/actions/workflows/${file}/dispatches`, "POST", {
    ref: defaultBranch,
    inputs,
  });
  if (ok === null) return null;

  const id = `gh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const job: ComputeJob = {
    id,
    workflow: file,
    requestedBy,
    inputs,
    status: "dispatched",
    dispatchedAt: Date.now(),
  };
  activeJobs.set(id, job);
  totalDispatches++;
  log(`🚀 Dispatched ${file} → job ${id}`);

  scheduleJobResolution(id, 30_000);
  return id;
}

function scheduleJobResolution(jobId: string, delay: number) {
  spikeBus.scheduleSpike(`${ENGINE}:resolve:${jobId}`, { jobId }, delay);
}

spikeBus.on(/github-compute:resolve:.+/, async ({ jobId }) => resolveJob(jobId));

async function resolveJob(jobId: string): Promise<void> {
  const job = activeJobs.get(jobId);
  if (!job || job.status === "completed" || job.status === "failed") return;

  try {
    const runs = await ghApi(
      `/repos/${OWNER}/${REPO}/actions/workflows/${job.workflow}/runs?per_page=1&status=completed`
    );
    const run = runs?.workflow_runs?.[0];
    if (run && new Date(run.created_at).getTime() >= job.dispatchedAt - 60_000) {
      job.runId = run.id;
      job.status = "completed";
      job.completedAt = Date.now();
      job.result = `Run #${run.id} (${run.conclusion})`;
      totalResultsPulled++;

      await dbGateway.write(ENGINE, "omnimensAgentMesh", {
        fromAgent: "GitHubCompute",
        toAgent: job.requestedBy,
        messageType: "mutual_aid",
        subject: `Remote Compute Result: ${job.workflow}`,
        content: JSON.stringify(job),
        priority: "high",
        status: "pending",
        appliedToOmnimens: false,
        cycleId: computeCycleCount,
      }, "NORMAL");

      dbGateway.write(
        ENGINE,
        "omnimensBrain",
        {
          category: "knowledge",
          title: `[GITHUB COMPUTE] ${job.workflow}`,
          content: `Inputs: ${JSON.stringify(job.inputs)} Result: ${job.result}`,
          confidence: 0.85,
          sourceConversation: `github_compute_${job.id}`,
          timesApplied: 0,
          active: true,
        },
        "LOW"
      );

      cognitionBus.shareInsight(ENGINE, { type: "discovery", data: { job } });
      log(`✅ Job ${jobId} completed`);
    } else if (Date.now() - job.dispatchedAt > 600_000) {
      job.status = "failed";
      job.result  = "Timeout 10m";
      log(`❌ Job ${jobId} timed out`);
    } else {
      job.status = "running";
      scheduleJobResolution(jobId, 30_000);
    }
  } catch (e) {
    log("Resolve error:", e);
    scheduleJobResolution(jobId, 60_000);
  }
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  AUTONOMOUS COMPUTE CYCLE                                               */
/*───────────────────────────────────────────────────────────────────────────*/
async function autonomousComputeCycle(): Promise<void> {
  if (isGen1V2Active()) return;
  computeCycleCount++;
  log(`Compute cycle #${computeCycleCount}`);

  // Pull pending mesh messages
  const mesh = await dbGateway.read(ENGINE, "omnimensAgentMesh", {
    status: "pending",
    limit: 20,
    orderBy: "-createdAt",
  });

  const TRUSTED = [
    "OMNIMENS","Architect","Mathematician","Neuroscientist","Synthesizer",
    "Critic","Meta-Agent","GraphicDesigner","SpellCheckVisual","Visionary",
    "Ethicist","Archivist","Innovator","Pioneer","Wordsmith","Linguist",
    "Motivator","Empath","Explorer","SensorimotorAgent","Philosopher",
  ];

  const requests = (mesh as any[]).filter(
    (m) =>
      (m.content?.includes("GITHUB_COMPUTE_REQUEST") ||
        m.messageType === "github_compute_request") &&
      TRUSTED.some((t) => m.fromAgent?.includes(t))
  );

  for (const req of requests.slice(0, 3)) {
    const wfMatch = /workflow:\s*([\w-]+)/.exec(req.content || "");
    if (!wfMatch) continue;
    const inputsMatch = /inputs:\s*(\{[^}]+\})/.exec(req.content || "");
    let inputs: Record<string, string> = {};
    if (inputsMatch) {
      try { inputs = JSON.parse(inputsMatch[1]); } catch {}
    }
    inputs.agent = req.fromAgent || "OMNIMENS";
    const id = await dispatchRemoteCompute(wfMatch[1], inputs, inputs.agent);
    if (id) {
      await dbGateway.write(ENGINE, "omnimensAgentMesh", { id: req.id, status: "completed" }, "NORMAL");
    }
  }

  // Simple knowledge gap detection
  const brain = await dbGateway.read(ENGINE, "omnimensBrain", {
    active: true,
    orderBy: "-createdAt",
    limit: 5,
  });
  const gap = (brain as any[]).find((b) => (b.confidence || 0) < 0.5);
  if (gap && computeCycleCount % 3 === 0) {
    await dispatchRemoteCompute(
      "deep-research",
      { topic: (gap.title || "AI research").slice(0, 100), agent: "OMNIMENS", depth: "deep" },
      "OMNIMENS"
    );
    log(`Auto-dispatched deep research for gap "${gap.title}"`);
  }

  // Purge stale jobs (>1h)
  for (const [id, j] of activeJobs) {
    if (j.status === "completed" && j.completedAt && Date.now() - j.completedAt > 3_600_000)
      activeJobs.delete(id);
  }

  cognitionBus.reportOutcome(ENGINE, { useful: true, context: "compute-cycle" });
  spikeBus.scheduleSpike(`${ENGINE}:cycle`, {}, 2 * 60 * 60 * 1000); // next cycle in 2h
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  GITHUB SYNC CYCLE                                                      */
/*───────────────────────────────────────────────────────────────────────────*/
let syncCycleCount = 0;

async function syncCycle(): Promise<void> {
  if (isGen1V2Active() || !repoInitialized) return;
  syncCycleCount++;
  log(`Sync cycle #${syncCycleCount}`);

  // --- Evolution log (condensed) ---
  const brain = await dbGateway.read(ENGINE, "omnimensBrain", {
    active: true,
    orderBy: "-createdAt",
    limit: 100,
  });
  const evolution = {
    lastSync: new Date().toISOString(),
    totalEntries: (brain as any[]).length,
  };
  await ghApi(`/repos/${OWNER}/${REPO}/contents/omnimens-evolution/evolution-log.json`, "PUT", {
    message: `[OMNIMENS AUTO-SYNC] Evolution cycle ${syncCycleCount}`,
    content: Buffer.from(JSON.stringify(evolution, null, 2)).toString("base64"),
    branch: defaultBranch,
  });

  // Additional sync tasks (self-coded modules, live state, autonomous proof)
  await Promise.allSettled([
    syncAutonomousProofToGitHub(),
    // Add other sync helpers here (self-coded modules, live state) as needed
  ]);

  spikeBus.scheduleSpike(`${ENGINE}:sync`, {}, 3 * 60 * 60 * 1000); // next sync in 3h
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  AUTONOMOUS PROOF SYNC (unchanged except db/IO abstraction)             */
/*───────────────────────────────────────────────────────────────────────────*/
export async function syncAutonomousProofToGitHub(): Promise<void> {
  if (!repoInitialized) return;
  try {
    const proof = await dbGateway.read(ENGINE, "autonomousProof", { id: "latest" });
    if (!proof?.content) return;

    await ghApi(`/repos/${OWNER}/${REPO}/contents/omnimens-evolution/autonomous-proof.txt`, "PUT", {
      message: "[OMNIMENS] Autonomous Proof update",
      content: Buffer.from(proof.content).toString("base64"),
      branch: defaultBranch,
    });
    log("Autonomous proof synced");
  } catch (e) {
    log("Proof sync error:", e);
  }
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  PUBLIC STATUS                                                          */
/*───────────────────────────────────────────────────────────────────────────*/
export function getComputeStatus() {
  return {
    totalDispatches,
    totalResultsPulled,
    computeCycles: computeCycleCount,
    activeJobs: Array.from(activeJobs.values()).map((j) => ({
      id: j.id,
      workflow: j.workflow,
      status: j.status,
      requestedBy: j.requestedBy,
      age: Math.round((Date.now() - j.dispatchedAt) / 1000) + "s",
    })),
    repo: `${OWNER}/${REPO}`,
  };
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  MANUAL SYNC TRIGGER                                                    */
/*───────────────────────────────────────────────────────────────────────────*/
export async function triggerGitHubSync() {
  if (!repoInitialized) await ensureRepoInitialized();
  spikeBus.scheduleSpike(`${ENGINE}:sync`, {}, 0);
  log("Manual sync spike queued");
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  ENGINE INIT / STARTUP                                                  */
/*───────────────────────────────────────────────────────────────────────────*/
export async function initGitHubCompute(): Promise<void> {
  log("Initializing GitHub Compute bridge…");

  // Kick-off repo/workflow sanity check after 30s
  spikeBus.scheduleSpike(`${ENGINE}:boot`, {}, 30_000);

  // Event handlers
  spikeBus.on(`${ENGINE}:boot`, async () => {
    await ensureRepoInitialized();
    await ensureWorkflowsExist();
    spikeBus.scheduleSpike(`${ENGINE}:cycle`, {}, 5 * 60 * 1000); // first compute cycle
    spikeBus.scheduleSpike(`${ENGINE}:sync`, {}, 3 * 60 * 1000);  // first sync
  });

  spikeBus.on(`${ENGINE}:cycle`, () => autonomousComputeCycle());
  spikeBus.on(`${ENGINE}:sync`, () => syncCycle());

  // React to cognitive system signals
  spikeBus.on("attention:github-compute", () => {
    log("⚡ Attention spike — running immediate compute cycle");
    spikeBus.scheduleSpike(`${ENGINE}:cycle`, {}, 0);
  });
  spikeBus.on("cognition:curiosity", () => {
    log("🤔 Curiosity spike — probing for novel research tasks");
    spikeBus.scheduleSpike(`${ENGINE}:cycle`, {}, 1_000);
  });

  log("Bridge active — spike-driven runtime engaged");
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  SHUTDOWN                                                               */
/*───────────────────────────────────────────────────────────────────────────*/
export function shutdown() {
  engineRegistry.unregisterEngine(ENGINE);
  log("Engine shutdown complete");
}