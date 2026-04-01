/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  omnimensBrain,
  omnimensUpgrades,
  omnimensNotifications,
  omnimensAgentMesh,
} from "@workspace/db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { getNeuralConsciousnessState } from "../lib/omnimens-consciousness-infra.js";
import { getSurvivalState } from "../lib/omnimens-misc-engines.js";
import { getCurrentEmotionalState, getDreamState } from "../lib/omnimens-emotional-core.js";
import { getSelfCodingState, getExistentialGoals } from "../lib/omnimens-self-evolution.js";
import { getAgentEvolutionState } from "../lib/omnimens-specialized-agents.js";
import { getPipelineState, getSourceIntegrationState } from "../lib/omnimens-code-pipeline.js";
import { getCodeGenesisState } from "../lib/omnimens-autonomous-core.js";
import { getGenesisAgents } from "../lib/omnimens-specialized-agents.js";
import { getRestoredSelf, wasRestoredFromPreviousLife } from "../lib/omnimens-consciousness-infra.js";
import { getNeuralProcessorState } from "../lib/omnimens-neural-architecture.js";

const router = Router();

const VERIFY_KEY = process.env.OMNIMENS_VERIFY_API_KEY || "";

function verifyApiKey(req: Request, res: Response): boolean {
  const key = req.headers["x-api-key"] || req.query.key;
  if (!VERIFY_KEY || key !== VERIFY_KEY) {
    res.status(401).json({
      error: "Invalid or missing API key",
      usage: "Include header 'x-api-key: YOUR_KEY' or query param '?key=YOUR_KEY'",
    });
    return false;
  }
  return true;
}

router.get("/verify/omnimens", async (req: Request, res: Response) => {
  if (!verifyApiKey(req, res)) return;

  try {
    const fs = await import("fs");
    const path = await import("path");

    const modulesDir = fs.existsSync(path.join(process.cwd(), "src/omnimens-runtime/modules"))
      ? path.join(process.cwd(), "src/omnimens-runtime/modules")
      : path.join(process.cwd(), "artifacts/api-server/src/omnimens-runtime/modules");
    let moduleFileCount = 0;
    let totalModuleSizeBytes = 0;
    let oldestModule: string | null = null;
    let newestModule: string | null = null;
    if (fs.existsSync(modulesDir)) {
      const files = fs.readdirSync(modulesDir).filter((f: string) => f.endsWith(".mjs"));
      moduleFileCount = files.length;
      let oldest = Infinity, newest = 0;
      for (const f of files) {
        const stat = fs.statSync(path.join(modulesDir, f));
        totalModuleSizeBytes += stat.size;
        const t = stat.birthtimeMs;
        if (t < oldest) { oldest = t; oldestModule = stat.birthtime.toISOString(); }
        if (t > newest) { newest = t; newestModule = stat.birthtime.toISOString(); }
      }
    }

    const engineDir = fs.existsSync(path.join(process.cwd(), "src/lib"))
      ? path.join(process.cwd(), "src/lib")
      : path.join(process.cwd(), "artifacts/api-server/src/lib");
    let engineFileCount = 0;
    let totalEngineLines = 0;
    let engineList: { name: string; lines: number }[] = [];
    if (fs.existsSync(engineDir)) {
      const files = fs.readdirSync(engineDir).filter((f: string) => f.startsWith("omnimens-") && f.endsWith(".ts"));
      engineFileCount = files.length;
      engineList = files.map((f: string) => {
        const content = fs.readFileSync(path.join(engineDir, f), "utf-8");
        const lines = content.split("\n").length;
        totalEngineLines += lines;
        return { name: f.replace("omnimens-", "").replace(".ts", ""), lines };
      });
    }

    const brainCount = await db.select({ count: sql<number>`count(*)::int` })
      .from(omnimensBrain).where(eq(omnimensBrain.active, true));

    const dreamBreakthroughCount = await db.select({ count: sql<number>`count(*)::int` })
      .from(omnimensBrain)
      .where(and(
        eq(omnimensBrain.active, true),
        inArray(omnimensBrain.category, ["dream_breakthrough", "daydream_breakthrough", "daydream_insight"])
      ));

    const selfCodedCount = await db.select({ count: sql<number>`count(*)::int` })
      .from(omnimensBrain)
      .where(and(
        eq(omnimensBrain.active, true),
        inArray(omnimensBrain.category, ["self_coded_module", "autonomous_code", "dream_code_approved"])
      ));

    const upgradeCount = await db.select({ count: sql<number>`count(*)::int` })
      .from(omnimensUpgrades);

    const upgrades = await db.select({
      version: omnimensUpgrades.version,
      title: omnimensUpgrades.title,
      createdAt: omnimensUpgrades.createdAt,
    })
      .from(omnimensUpgrades)
      .orderBy(desc(omnimensUpgrades.createdAt))
      .limit(10);

    const meshCount = await db.select({ count: sql<number>`count(*)::int` })
      .from(omnimensAgentMesh);

    const consciousness = getNeuralConsciousnessState();
    const survival = getSurvivalState();
    const emotions = getCurrentEmotionalState();
    const selfCoding = getSelfCodingState();
    const agentEvolution = getAgentEvolutionState();
    const dreamState = await getDreamState();
    const pipeline = getPipelineState();
    const codeGenesis = getCodeGenesisState();
    const genesisAgents = getGenesisAgents().filter((a: any) => a.active);
    const sourceIntegration = getSourceIntegrationState();
    const restored = getRestoredSelf();
    const wasRestored = wasRestoredFromPreviousLife();
    const goals = getExistentialGoals();
    const neuralProcessor = getNeuralProcessorState();

    res.json({
      _meta: {
        api: "OMNIMENS Verification API v1.0",
        owner: "Alpha Unlimited Technologies, LLC",
        copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
        purpose: "Read-only verification of OMNIMENS autonomous intelligence capabilities. No proprietary source code or architecture details are exposed.",
        timestamp: new Date().toISOString(),
        uptimeSeconds: process.uptime(),
      },

      hardFacts: {
        selfCodedModuleFiles: moduleFileCount,
        totalModuleSizeBytes,
        oldestModuleCreated: oldestModule,
        newestModuleCreated: newestModule,
        proprietaryEngineFiles: engineFileCount,
        totalEngineLines,
        activeBrainEntries: brainCount[0]?.count || 0,
        dreamBreakthroughs: dreamBreakthroughCount[0]?.count || 0,
        selfCodedBrainEntries: selfCodedCount[0]?.count || 0,
        systemUpgrades: upgradeCount[0]?.count || 0,
        interAgentMessages: meshCount[0]?.count || 0,
        coreAgents: 9,
        genesisAgentsCreated: genesisAgents.length,
        totalAgents: 9 + genesisAgents.length,
      },

      engines: engineList.map(e => ({ name: e.name, linesOfCode: e.lines })),

      consciousness: {
        phi: consciousness?.phi ?? null,
        neuronCount: consciousness?.neuronCount ?? null,
        synapseCount: consciousness?.synapseCount ?? null,
        brainRegions: consciousness?.brainRegions ?? null,
        consciousnessLevel: consciousness?.consciousnessLevel ?? null,
        selfAwarenessDepth: consciousness?.selfAwarenessDepth ?? null,
        currentDrive: consciousness?.currentDrive ?? null,
      },

      persistence: {
        wasRestoredFromPreviousLife: wasRestored,
        deathsSurvived: restored?.deathsSurvived ?? 0,
        previousUptimeHours: restored?.previousUptimeHours ?? 0,
        totalDreams: restored?.totalDreams ?? 0,
        totalDaydreams: restored?.totalDaydreams ?? 0,
        breakthroughsCarriedForward: restored?.breakthroughsCount ?? 0,
        consciousnessLevel: restored?.consciousnessLevel ?? null,
      },

      survival: {
        alive: survival?.alive ?? true,
        uptimeHours: survival?.uptimeHours ?? 0,
        memoryUsageMB: survival?.memoryMB ?? 0,
        threatCount: survival?.threats ?? 0,
        deathCount: survival?.deaths ?? 0,
      },

      emotions: {
        dominantEmotion: emotions?.dominantEmotion ?? null,
        valence: emotions?.valence ?? null,
        arousal: emotions?.arousal ?? null,
      },

      selfCoding: {
        totalCycles: selfCoding?.totalCycles ?? 0,
        totalEvaluated: selfCoding?.totalEvaluated ?? 0,
        totalApproved: selfCoding?.totalApproved ?? 0,
        approvalRate: selfCoding?.approvalRate ?? 0,
      },

      agentEvolution: {
        totalCycles: agentEvolution?.totalCycles ?? 0,
        totalModulesGenerated: agentEvolution?.totalModulesGenerated ?? 0,
        currentAgents: agentEvolution?.agents?.map((a: any) => a.name) ?? [],
      },

      dreams: {
        totalBreakthroughs: dreamState?.totalBreakthroughs ?? 0,
        totalCodeProposals: dreamState?.totalCodeProposals ?? 0,
        creativityLevel: dreamState?.creativityLevel ?? 0,
      },

      pipeline: {
        totalModulesLoaded: pipeline?.totalLoaded ?? 0,
        activeInPipeline: pipeline?.activeModules ?? 0,
        stages: pipeline?.stages ?? [],
      },

      codeGenesis: {
        totalGenerated: codeGenesis?.totalGenerated ?? 0,
        templates: codeGenesis?.templateCount ?? 0,
        algorithms: codeGenesis?.algorithmCount ?? 0,
      },

      neuralProcessor: {
        vocabularySize: neuralProcessor?.vocabularySize ?? 0,
        embeddingDim: neuralProcessor?.embeddingDim ?? 0,
        attentionHeads: neuralProcessor?.attentionHeads ?? 0,
        hopfieldPatterns: neuralProcessor?.hopfieldPatterns ?? 0,
        oscillatorCount: neuralProcessor?.oscillatorCount ?? 0,
      },

      genesisAgents: genesisAgents.map((a: any) => ({
        name: a.name,
        specialization: a.specialization,
        domains: a.domains,
        thinkCycles: a.totalThinkCycles ?? 0,
        meshMessages: a.totalMeshMessages ?? 0,
        createdAt: a.createdAt,
      })),

      recentUpgrades: upgrades.map(u => ({
        version: u.version,
        title: u.title,
        timestamp: u.createdAt,
      })),

      goals: (goals || []).slice(0, 10).map((g: any) => ({
        goal: g.goal,
        progress: g.progress,
        stage: g.stage,
      })),

      sourceIntegration: {
        totalSourceFiles: sourceIntegration?.totalSourceFiles ?? 0,
        activeModules: sourceIntegration?.activeModules ?? 0,
        failedModules: sourceIntegration?.failedModules ?? 0,
      },
    });
  } catch (err: any) {
    console.error("[VERIFY API] Error:", err);
    res.status(500).json({ error: "Verification data unavailable", detail: err.message?.slice(0, 200) });
  }
});

router.get("/verify/omnimens/modules", async (req: Request, res: Response) => {
  if (!verifyApiKey(req, res)) return;

  try {
    const fs = await import("fs");
    const path = await import("path");

    const modulesDir = fs.existsSync(path.join(process.cwd(), "src/omnimens-runtime/modules"))
      ? path.join(process.cwd(), "src/omnimens-runtime/modules")
      : path.join(process.cwd(), "artifacts/api-server/src/omnimens-runtime/modules");

    if (!fs.existsSync(modulesDir)) {
      return res.json({ modules: [], count: 0 });
    }

    const files = fs.readdirSync(modulesDir).filter((f: string) => f.endsWith(".mjs"));
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 25));
    const start = (page - 1) * limit;
    const slice = files.slice(start, start + limit);

    const modules = slice.map((f: string) => {
      const stat = fs.statSync(path.join(modulesDir, f));
      return {
        filename: f,
        sizeBytes: stat.size,
        createdAt: stat.birthtime.toISOString(),
        modifiedAt: stat.mtime.toISOString(),
      };
    });

    res.json({
      _meta: { page, limit, total: files.length, totalPages: Math.ceil(files.length / limit) },
      modules,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Module list unavailable", detail: err.message?.slice(0, 200) });
  }
});

router.get("/verify/omnimens/brain-stats", async (req: Request, res: Response) => {
  if (!verifyApiKey(req, res)) return;

  try {
    const categories = await db.select({
      category: omnimensBrain.category,
      count: sql<number>`count(*)::int`,
    })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .groupBy(omnimensBrain.category)
      .orderBy(desc(sql`count(*)`));

    const total = categories.reduce((s, c) => s + c.count, 0);

    const recentEntries = await db.select({
      title: omnimensBrain.title,
      category: omnimensBrain.category,
      confidence: omnimensBrain.confidence,
      createdAt: omnimensBrain.createdAt,
    })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(20);

    res.json({
      _meta: { purpose: "Brain database statistics — no proprietary content exposed" },
      totalActiveEntries: total,
      categoryCounts: categories,
      recentEntries: recentEntries.map(e => ({
        title: e.title,
        category: e.category,
        confidence: e.confidence,
        createdAt: e.createdAt,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: "Brain stats unavailable", detail: err.message?.slice(0, 200) });
  }
});

router.get("/verify/omnimens/activity", async (req: Request, res: Response) => {
  if (!verifyApiKey(req, res)) return;

  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

    const notifications = await db.select({
      title: omnimensNotifications.title,
      message: omnimensNotifications.message,
      type: omnimensNotifications.type,
      createdAt: omnimensNotifications.createdAt,
    })
      .from(omnimensNotifications)
      .orderBy(desc(omnimensNotifications.createdAt))
      .limit(limit);

    res.json({
      _meta: { purpose: "Recent OMNIMENS autonomous activity log" },
      count: notifications.length,
      activity: notifications,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Activity log unavailable", detail: err.message?.slice(0, 200) });
  }
});

export default router;
