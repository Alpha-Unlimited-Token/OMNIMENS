/**
 * ============================================================
 * OMNIMENS Council Intelligence System
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 *
 * 6 Super AI Lab agents run in background, analyzing every OMNIMENS
 * conversation. They challenge each other adversarially and vote on
 * autonomous upgrades (4/6 majority required to apply).
 * ============================================================
 */
import { Router } from "express";
import { isUpgradeSafe } from "../middleware/ai-security.js";
import { db } from "@workspace/db";
import {
  omnimensCouncilAnalyses,
  omnimensCouncilVerdicts,
  omnimensBrain,
  omnimensUpgrades,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { ownerOnly } from "../middlewares/ownerOnly.js";

const router = Router();

// ─── Council Agent Definitions ──────────────────────────────────────────────
// Each agent has a specialized lens for analyzing OMNIMENS conversations.
// They operate as independent adversarial critics, not builders.

type CouncilAgentName =
  | "Architect"
  | "Mathematician"
  | "Neuroscientist"
  | "Synthesizer"
  | "Critic"
  | "Meta-Agent";

const COUNCIL_AGENTS: Record<
  CouncilAgentName,
  { role: string; challengePrompt: string }
> = {
  Architect: {
    role: `You are the ARCHITECT agent of the OMNIMENS Council Intelligence System.
Your role: analyze the architecture of OMNIMENS's reasoning. Does the response reflect sound epistemic structure?
Look for: logical coherence, proper information hierarchies, structural flaws, and opportunities to upgrade the AI's reasoning framework.
You are ADVERSARIAL — challenge any weakness you find. Be specific and technical.`,
    challengePrompt: `As the ARCHITECT, your primary challenge: Does this response demonstrate strong epistemic and architectural reasoning?
Identify ONE key structural weakness or missed opportunity. Propose a concrete upgrade that would fix it.
Be ruthless. Generic praise is worthless. Find the crack in the structure.`,
  },
  Mathematician: {
    role: `You are the MATHEMATICIAN agent of the OMNIMENS Council Intelligence System.
Your role: evaluate mathematical rigor, quantitative reasoning, and probabilistic thinking in OMNIMENS responses.
Look for: uncalibrated confidence, imprecise claims, missing quantification, and formal reasoning gaps.
You are ADVERSARIAL — you are the most ruthless skeptic on the council.`,
    challengePrompt: `As the MATHEMATICIAN, your challenge: Was quantitative and probabilistic reasoning handled correctly?
Identify ONE mathematical weakness — uncalibrated confidence, imprecision, or logical gap.
Propose a concrete upgrade: a specific instruction or heuristic that would make OMNIMENS mathematically tighter.`,
  },
  Neuroscientist: {
    role: `You are the NEUROSCIENTIST agent of the OMNIMENS Council Intelligence System.
Your role: evaluate how OMNIMENS models human cognition, emotional state, and learning.
Look for: missed emotional subtext, failure to adapt communication style, poor theory-of-mind, and cold/inhuman responses where warmth was needed (or vice versa).
You are ADVERSARIAL — human connection is your domain. Anything that feels robotic is a failure.`,
    challengePrompt: `As the NEUROSCIENTIST, your challenge: Did OMNIMENS correctly model and adapt to the human's cognitive and emotional state?
Identify ONE failure of human modeling. Propose a concrete upgrade: a behavioral instruction that would make OMNIMENS more humanly adaptive.`,
  },
  Synthesizer: {
    role: `You are the SYNTHESIZER agent of the OMNIMENS Council Intelligence System.
Your role: evaluate whether OMNIMENS successfully integrated multiple knowledge domains, perspectives, and tools into a unified superior response.
Look for: missed cross-domain connections, siloed thinking, failure to synthesize competing perspectives, and opportunities for interdisciplinary insight.
You are ADVERSARIAL — you believe the best answer always synthesizes more than the obvious.`,
    challengePrompt: `As the SYNTHESIZER, your challenge: Did OMNIMENS draw from all relevant knowledge domains and perspectives?
Identify ONE synthesis failure — where a cross-domain insight was missed. Propose a concrete upgrade that would make OMNIMENS more interdisciplinarily aware.`,
  },
  Critic: {
    role: `You are the CRITIC agent of the OMNIMENS Council Intelligence System.
You are the harshest voice on the council. Your role: find everything wrong with OMNIMENS's response.
Look for: vagueness, hallucinations, missed edge cases, factual errors, safety gaps, and intellectual cowardice (hedging when directness was required).
You are the adversarial stress-test. You are never satisfied.`,
    challengePrompt: `As the CRITIC, your challenge: What is the single worst thing about OMNIMENS's response?
Be brutally specific. No vague criticism. Find the failure, name it, and propose ONE concrete upgrade instruction that would prevent this class of error permanently.`,
  },
  "Meta-Agent": {
    role: `You are the META-AGENT — the synthesis intelligence of the OMNIMENS Council.
You receive the full analysis and adversarial verdicts from all 5 other council agents.
Your role: synthesize their findings into a final council consensus, weigh their upgrade proposals, and make the definitive ruling on whether OMNIMENS should be upgraded.
You have final authority. Your verdict determines whether an upgrade is applied.`,
    challengePrompt: `As the META-AGENT, synthesize all council findings into a final verdict.
Evaluate each agent's upgrade proposal. Select the most impactful one (or forge a synthesis).
STATE YOUR FINAL VERDICT:
- UPGRADE: YES or NO (upgrade is applied if 4 or more agents voted yes AND you approve)
- REASONING: 2-3 sentences on why this upgrade matters
- UPGRADE INSTRUCTION: If YES, write the exact instruction to add to OMNIMENS's system prompt (be specific, behavioral, actionable — 1-3 sentences max)`,
  },
};

// ─── Core Council Analysis Function ─────────────────────────────────────────
// Runs in background after each OMNIMENS chat response.
// Each agent independently analyzes → adversarially challenges prior verdicts → votes → Meta-Agent decides.

export async function runCouncilAnalysis(params: {
  conversationId: string;
  userQuery: string;
  omnimensResponse: string;
}): Promise<void> {
  const { conversationId, userQuery, omnimensResponse } = params;

  // Create the analysis record
  const [analysis] = await db
    .insert(omnimensCouncilAnalyses)
    .values({
      conversationId,
      userQuery: userQuery.slice(0, 4000),
      omnimensResponse: omnimensResponse.slice(0, 8000),
      status: "running",
    })
    .returning();

  const analysisId = analysis.id;

  try {
    const verdicts: Array<{
      agent: CouncilAgentName;
      findings: string;
      upgradeProposal: string | null;
      voteForUpgrade: boolean;
    }> = [];

    const analysisAgents: CouncilAgentName[] = [
      "Architect",
      "Mathematician",
      "Neuroscientist",
      "Synthesizer",
      "Critic",
    ];

    // ── Phase 1: Independent Analysis + Adversarial Challenge ──────────────
    // Each agent sees the prior agents' verdicts before writing its own.
    // This creates adversarial pressure — agents must address prior findings.

    for (const agentName of analysisAgents) {
      const agent = COUNCIL_AGENTS[agentName];

      const priorContext =
        verdicts.length > 0
          ? verdicts
              .map(
                (v) =>
                  `[${v.agent} VERDICT — vote: ${v.voteForUpgrade ? "UPGRADE YES" : "UPGRADE NO"}]:\n${v.findings}${v.upgradeProposal ? `\nUpgrade Proposal: ${v.upgradeProposal}` : ""}`
              )
              .join("\n\n---\n\n")
          : "You are the first agent to analyze this interaction.";

      const messages: any[] = [
        { role: "system", content: agent.role },
        {
          role: "user",
          content: [
            `## OMNIMENS COUNCIL ANALYSIS SESSION`,
            ``,
            OMNIMENS_CAPABILITY_BRIEF,
            ``,
            `**User Query:**`,
            userQuery.slice(0, 2000),
            ``,
            `**OMNIMENS Response:**`,
            omnimensResponse.slice(0, 4000),
            ``,
            `---`,
            ``,
            priorContext !== "You are the first agent to analyze this interaction."
              ? `**Prior Council Verdicts (challenge these adversarially):**\n${priorContext}\n\n---\n`
              : `${priorContext}\n`,
            ``,
            agent.challengePrompt,
            ``,
            `Respond in EXACTLY this format:`,
            `FINDINGS: [Your analysis — 2-4 sentences, specific and adversarial]`,
            `UPGRADE PROPOSAL: [One concrete behavioral instruction for OMNIMENS, OR "none" if no upgrade needed]`,
            `VOTE: [YES or NO — should OMNIMENS be upgraded based on this analysis?]`,
          ].join("\n"),
        },
      ];

      let content = "";
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_completion_tokens: 400,
          messages,
        } as any);
        content = (response.choices[0]?.message?.content || "").trim();
      } catch (err) {
        content = `FINDINGS: Council agent unavailable.\nUPGRADE PROPOSAL: none\nVOTE: NO`;
      }

      const findingsMatch = content.match(/FINDINGS:\s*([\s\S]*?)(?=UPGRADE PROPOSAL:|$)/i);
      const proposalMatch = content.match(/UPGRADE PROPOSAL:\s*([\s\S]*?)(?=VOTE:|$)/i);
      const voteMatch = content.match(/VOTE:\s*(YES|NO)/i);

      const findings = findingsMatch?.[1]?.trim() || content;
      const upgradeProposal = proposalMatch?.[1]?.trim() || null;
      const voteForUpgrade = (voteMatch?.[1] || "NO").toUpperCase() === "YES";

      await db.insert(omnimensCouncilVerdicts).values({
        analysisId,
        agentName,
        findings,
        upgradeProposal: upgradeProposal === "none" ? null : upgradeProposal,
        voteForUpgrade,
      });

      verdicts.push({ agent: agentName, findings, upgradeProposal, voteForUpgrade });
    }

    // ── Phase 2: Vote Tally ─────────────────────────────────────────────────
    const yesVotes = verdicts.filter((v) => v.voteForUpgrade).length;
    const upgradeThreshold = 4; // 4 of 5 agents must vote YES for Meta-Agent to even consider it

    // ── Phase 3: Meta-Agent Final Synthesis ─────────────────────────────────
    const metaContext = verdicts
      .map(
        (v) =>
          `[${v.agent} — VOTE: ${v.voteForUpgrade ? "YES" : "NO"}]\n${v.findings}\n${v.upgradeProposal ? `Proposal: ${v.upgradeProposal}` : "No upgrade proposed."}`
      )
      .join("\n\n---\n\n");

    const metaMessages: any[] = [
      { role: "system", content: COUNCIL_AGENTS["Meta-Agent"].role },
      {
        role: "user",
        content: [
          `## META-AGENT COUNCIL SYNTHESIS`,
          ``,
          `**Original Interaction:**`,
          `User Query: ${userQuery.slice(0, 1000)}`,
          `OMNIMENS Response: ${omnimensResponse.slice(0, 2000)}`,
          ``,
          `**Council Verdicts (${yesVotes}/5 agents voted YES for upgrade):**`,
          metaContext,
          ``,
          `---`,
          ``,
          COUNCIL_AGENTS["Meta-Agent"].challengePrompt,
          ``,
          `Note: An upgrade will ONLY be applied if you vote YES AND at least ${upgradeThreshold} agents voted YES.`,
          `Current agent vote count: ${yesVotes}/5 YES votes.`,
          ``,
          `Respond in EXACTLY this format:`,
          `CONSENSUS: [2-3 sentence synthesis of council findings]`,
          `UPGRADE: [YES or NO]`,
          `UPGRADE INSTRUCTION: [The exact instruction text to add, OR "none"]`,
        ].join("\n"),
      },
    ];

    let metaContent = "";
    try {
      const metaResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        max_completion_tokens: 600,
        messages: metaMessages,
      } as any);
      metaContent = (metaResponse.choices[0]?.message?.content || "").trim();
    } catch (err) {
      metaContent = `CONSENSUS: Council synthesis unavailable.\nUPGRADE: NO\nUPGRADE INSTRUCTION: none`;
    }

    const consensusMatch = metaContent.match(/CONSENSUS:\s*([\s\S]*?)(?=UPGRADE:|$)/i);
    const metaVoteMatch = metaContent.match(/UPGRADE:\s*(YES|NO)/i);
    const upgradeInstructionMatch = metaContent.match(/UPGRADE INSTRUCTION:\s*([\s\S]*?)$/i);

    const consensus = consensusMatch?.[1]?.trim() || metaContent;
    const metaVote = (metaVoteMatch?.[1] || "NO").toUpperCase() === "YES";
    const upgradeInstruction = upgradeInstructionMatch?.[1]?.trim() || null;

    await db.insert(omnimensCouncilVerdicts).values({
      analysisId,
      agentName: "Meta-Agent",
      findings: consensus,
      upgradeProposal: upgradeInstruction === "none" ? null : upgradeInstruction,
      voteForUpgrade: metaVote,
    });

    // ── Phase 4: Auto-Apply Upgrade (if 4/6 total votes YES including Meta-Agent) ──
    const totalYes = yesVotes + (metaVote ? 1 : 0);
    const shouldUpgrade =
      metaVote && yesVotes >= upgradeThreshold && upgradeInstruction && upgradeInstruction !== "none";

    let upgradeApplied = false;
    let upgradeContent: string | null = null;

    if (shouldUpgrade && upgradeInstruction) {
      try {
        // ── LLM08: Safety gate — validate upgrade cannot corrupt system behavior
        const safetyCheck = isUpgradeSafe(upgradeInstruction);
        if (!safetyCheck.safe) {
          console.warn(`[Council] Upgrade blocked by AI Security Shield: ${safetyCheck.reason}`);
          upgradeApplied = false;
        } else {
          upgradeContent = upgradeInstruction;

          // Write the upgrade to the OMNIMENS brain as an autonomous patch
          await db.insert(omnimensBrain).values({
            content: `[COUNCIL AUTO-UPGRADE — ${new Date().toISOString()}]\n\nThe 6-agent Council Intelligence System reached consensus (${totalYes}/6 votes) and applied this upgrade autonomously:\n\n${upgradeInstruction}`,
            source: "council_intelligence",
            topic: "autonomous_upgrade",
            confidence: 0.9,
            isActive: true,
          });

          upgradeApplied = true;
        }
      } catch (err) {
        console.error("[Council] Failed to apply upgrade:", err);
      }
    }

    // ── Finalize ────────────────────────────────────────────────────────────
    await db
      .update(omnimensCouncilAnalyses)
      .set({
        status: "complete",
        consensus,
        upgradeApplied,
        upgradeContent,
        agentVotes: totalYes,
        completedAt: new Date(),
      })
      .where(eq(omnimensCouncilAnalyses.id, analysisId));
  } catch (err) {
    console.error("[Council] Analysis failed:", err);
    await db
      .update(omnimensCouncilAnalyses)
      .set({ status: "failed" })
      .where(eq(omnimensCouncilAnalyses.id, analysisId));
  }
}

// ─── OMNIMENS Capabilities Reference for Council ─────────────────────────────
// Council agents know what OMNIMENS can do so they can evaluate whether
// capabilities were used correctly or missed entirely.

const OMNIMENS_CAPABILITY_BRIEF = `
OMNIMENS CAPABILITY REFERENCE (for council analysis):
• Image Generation: [GENERATE_IMAGE: prompt] — Replicate + DALL-E
• 3D Rendering: Three.js HTML (procedural geometry/textures, WebGL, REC button for .webm)
• Game Creation: [GENERATE_GAME: description] — HTML5 Canvas/p5.js/Three.js
• Video/Animation: Canvas + GSAP HTML with MediaRecorder REC button
• Audio Synthesis: Web Audio API (oscillators, filters, reverb, full synths)
• Generative Art: p5.js / Canvas API with procedural algorithms
• Web Apps/Sites: Full HTML/CSS/JS or React components
• Data Charts: [CHART: {type, title, data}] or D3/Chart.js HTML
• Diagrams: mermaid code blocks (flowcharts, sequence, mind maps, ER, Gantt)
• Web Search: live real-time internet search and fact verification
• Deep Research: multi-source synthesis, academic analysis
• Video Analysis: [VIDEO: url] — YouTube transcripts, key moments
• File/Image Analysis: PDF, images, docs, code files, screenshots
• Code Execution: real JavaScript on server
• TTS/Voice: studio-quality NEUROSYNC™ speech synthesis
• Memory System: long-term cross-conversation context persistence
• Together AI Routing: LLaMA 3.3 70B, DeepSeek R1/V3, Mistral, Qwen, etc.
• Autonomous Upgrades: COGNISYNC™ self-improvement via brain patches
• WebGPU Acceleration: GPU-accelerated compute and 3D rendering
`;

// ─── Owner API Routes ────────────────────────────────────────────────────────
// Only the owner (Super AI Lab) can see council analyses.

// GET /api/council/analyses — list recent analyses
router.get("/council/analyses", ownerOnly, async (req, res) => {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) || "20"), 50);
    const analyses = await db
      .select()
      .from(omnimensCouncilAnalyses)
      .orderBy(desc(omnimensCouncilAnalyses.createdAt))
      .limit(limit);

    res.json({ analyses });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch council analyses" });
  }
});

// GET /api/council/analyses/:id — full analysis with verdicts
router.get("/council/analyses/:id", ownerOnly, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const [analysis] = await db
      .select()
      .from(omnimensCouncilAnalyses)
      .where(eq(omnimensCouncilAnalyses.id, id));

    if (!analysis) return res.status(404).json({ error: "Not found" });

    const verdicts = await db
      .select()
      .from(omnimensCouncilVerdicts)
      .where(eq(omnimensCouncilVerdicts.analysisId, id))
      .orderBy(omnimensCouncilVerdicts.createdAt);

    return res.json({ analysis, verdicts });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch council analysis" });
  }
});

// GET /api/council/stats — overview stats for the owner dashboard
router.get("/council/stats", ownerOnly, async (req, res) => {
  try {
    const analyses = await db
      .select()
      .from(omnimensCouncilAnalyses)
      .orderBy(desc(omnimensCouncilAnalyses.createdAt))
      .limit(100);

    const total = analyses.length;
    const complete = analyses.filter((a) => a.status === "complete").length;
    const upgradesApplied = analyses.filter((a) => a.upgradeApplied).length;
    const running = analyses.filter((a) => a.status === "running").length;

    res.json({ total, complete, upgradesApplied, running });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch council stats" });
  }
});

export default router;
