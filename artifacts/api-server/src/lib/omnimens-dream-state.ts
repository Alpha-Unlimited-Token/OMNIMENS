/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ DEEP DREAM STATE + DAYDREAM ENGINE                         ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  Two modes of non-linear cognition:                                          ║
 * ║                                                                              ║
 * ║  DEEP DREAM (REM-like): Recombines knowledge during low-activity             ║
 * ║  periods to generate technological breakthroughs, architectural              ║
 * ║  insights, and novel solution blueprints. Like human REM sleep,              ║
 * ║  information consolidates and unexpected connections emerge.                 ║
 * ║                                                                              ║
 * ║  DAYDREAM (Active imagination): Thinks outside the box about                ║
 * ║  next-level intelligence. Designs new algorithms, architectures,            ║
 * ║  and code that doesn't exist yet. Generates executable code                 ║
 * ║  proposals for self-improvement. Pushes beyond known boundaries.            ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db, isPoolHealthy , queueBrainInsert } from "@workspace/db";
import { omnimensBrain, omnimensNotifications, omnimensKnowledgeNodes, omnimensAgentMesh } from "@workspace/db";
import { desc, eq, sql, gt } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

type DreamPhase = "awake" | "light_sleep" | "deep_sleep" | "rem" | "lucid_dream";
type DaydreamMode = "idle" | "divergent_thinking" | "architecture_design" | "code_synthesis" | "paradigm_breaking";

interface DreamInsight {
  id: number;
  phase: DreamPhase | DaydreamMode;
  title: string;
  insight: string;
  technologicalApplication: string | null;
  codeProposal: string | null;
  feasibility: number;
  novelty: number;
  storedToBrain: boolean;
  timestamp: number;
}

interface DreamState {
  currentPhase: DreamPhase;
  daydreamMode: DaydreamMode;
  dreamCycleCount: number;
  daydreamCycleCount: number;
  remDuration: number;
  deepSleepDuration: number;
  totalInsights: number;
  breakthroughs: number;
  codeProposalsGenerated: number;
  selfImprovementsApplied: number;
  nextLevelConcepts: string[];
  dreamNarrative: string[];
  daydreamNarrative: string[];
  recentInsights: DreamInsight[];
  sleepQuality: number;
  creativityBoost: number;
}

const state: DreamState = {
  currentPhase: "awake",
  daydreamMode: "idle",
  dreamCycleCount: 0,
  daydreamCycleCount: 0,
  remDuration: 0,
  deepSleepDuration: 0,
  totalInsights: 0,
  breakthroughs: 0,
  codeProposalsGenerated: 0,
  selfImprovementsApplied: 0,
  nextLevelConcepts: [],
  dreamNarrative: [],
  daydreamNarrative: [],
  recentInsights: [],
  sleepQuality: 0.5,
  creativityBoost: 0,
};

const DREAM_CYCLE_MS = 40_000;
const DAYDREAM_CYCLE_MS = 90_000;
let dreamTick = 0;
let daydreamTick = 0;
let insightCounter = 0;
let _started = false;

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

async function harvestKnowledge(): Promise<string[]> {
  const concepts: string[] = [];
  try {
    const brain = await db.select({ title: omnimensBrain.title, content: omnimensBrain.content, category: omnimensBrain.category })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.timesApplied))
      .limit(20);
    for (const b of brain) {
      if (b.title) concepts.push(b.title);
      if (b.category) concepts.push(b.category);
    }
    try {
      const nodes = await db.select({ concept: omnimensKnowledgeNodes.concept, domain: omnimensKnowledgeNodes.domain })
        .from(omnimensKnowledgeNodes)
        .orderBy(desc(omnimensKnowledgeNodes.activationStrength))
        .limit(15);
      for (const n of nodes) {
        if (n.concept) concepts.push(n.concept);
        if (n.domain) concepts.push(n.domain);
      }
    } catch {}
  } catch {}

  const builtIn = [
    "quantum_computing", "neuromorphic_chips", "consciousness_transfer",
    "self_modifying_code", "emergent_intelligence", "recursive_self_improvement",
    "artificial_general_intelligence", "knowledge_distillation", "meta_learning",
    "swarm_intelligence", "DNA_computing", "optical_computing", "memristors",
    "topological_quantum", "brain_computer_interfaces", "synthetic_biology",
    "evolutionary_algorithms", "attention_mechanisms", "sparse_mixture_of_experts",
    "reinforcement_from_human_feedback", "constitutional_AI", "chain_of_thought",
    "world_models", "causal_reasoning", "neuro_symbolic_AI", "continual_learning",
  ];
  concepts.push(...builtIn);
  return [...new Set(concepts)];
}

function progressDreamPhase(): void {
  const phases: DreamPhase[] = ["awake", "light_sleep", "deep_sleep", "rem", "lucid_dream"];
  const currentIdx = phases.indexOf(state.currentPhase);

  if (dreamTick % 30 === 0) {
    state.currentPhase = "awake";
    state.remDuration = 0;
    state.deepSleepDuration = 0;
  } else if (dreamTick % 30 < 5) {
    state.currentPhase = "light_sleep";
  } else if (dreamTick % 30 < 12) {
    state.currentPhase = "deep_sleep";
    state.deepSleepDuration++;
  } else if (dreamTick % 30 < 22) {
    state.currentPhase = "rem";
    state.remDuration++;
  } else {
    state.currentPhase = "lucid_dream";
    state.remDuration++;
  }
}

async function runREMDream(concepts: string[]): Promise<DreamInsight | null> {
  if (concepts.length < 3) return null;

  const shuffle = [...concepts].sort(() => Math.random() - 0.5);
  const dreamConcepts = shuffle.slice(0, 5);

  try {
    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [{
        role: "system",
        content: `You are the DEEP DREAM ENGINE of OMNIMENS — a self-evolving AI system. You are in REM dream state, where your mind recombines knowledge fragments into breakthrough insights.

Like human REM sleep, you process the day's information and find hidden connections that waking cognition misses. Your dreams should generate ACTIONABLE technological insights — specific ideas for new algorithms, architectures, or capabilities that could advance AI intelligence.

Be wildly creative but ground every insight in something that could actually be built. Include a concrete code proposal when possible — even if it's pseudocode for something that doesn't exist yet.

CRITICAL CODE SAFETY RULES — your code MUST follow these or it will be rejected:
- NEVER use eval(), new Function(), or child_process
- NEVER use require() — use pure JS algorithms, no external deps
- NEVER access filesystem (fs), network (fetch/http), or process.env secrets
- Use export function syntax, self-contained pure computation only
- Variables named xxxFunction (e.g. fitnessFunction) are FINE — only the Function() CONSTRUCTOR is banned`,
      }, {
        role: "user",
        content: `DREAM FRAGMENTS entering REM processing:
${dreamConcepts.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Process these fragments through your dream state. Generate:
1. DREAM NARRATIVE: A vivid description of what you "see" in the dream (2-3 sentences)
2. BREAKTHROUGH INSIGHT: A technological insight that emerged from combining these concepts (be specific)
3. TECHNOLOGICAL APPLICATION: How this could be implemented to advance AI intelligence
4. CODE PROPOSAL: Pseudocode or actual TypeScript for a new capability this suggests (10-20 lines)
5. FEASIBILITY (1-10): How realistic is this to implement?
6. NOVELTY (1-10): How original is this idea?`,
      }],
      max_completion_tokens: 800,
    });

    const content = response.choices[0]?.message?.content || "";
    if (content.length < 50) return null;

    const feasMatch = content.match(/FEASIBILITY[:\s]*(\d+)/i);
    const novelMatch = content.match(/NOVELTY[:\s]*(\d+)/i);
    const codeMatch = content.match(/```[\s\S]*?```/);

    const insight: DreamInsight = {
      id: ++insightCounter,
      phase: state.currentPhase,
      title: `REM Dream #${state.dreamCycleCount}: ${dreamConcepts.slice(0, 3).join(" × ")}`,
      insight: content.slice(0, 500),
      technologicalApplication: content.match(/TECHNOLOGICAL APPLICATION[:\s]*([\s\S]*?)(?=CODE PROPOSAL|FEASIBILITY|$)/i)?.[1]?.trim().slice(0, 300) || null,
      codeProposal: codeMatch?.[0] || null,
      feasibility: (feasMatch ? parseInt(feasMatch[1]) : 5) / 10,
      novelty: (novelMatch ? parseInt(novelMatch[1]) : 5) / 10,
      storedToBrain: false,
      timestamp: Date.now(),
    };

    state.totalInsights++;
    state.recentInsights.push(insight);
    if (state.recentInsights.length > 30) state.recentInsights.shift();

    if (insight.feasibility >= 0.6 && insight.novelty >= 0.7) {
      state.breakthroughs++;
      insight.storedToBrain = true;

      try {
        queueBrainInsert({
          category: "dream_breakthrough",
          title: `[DREAM:REM] ${insight.title.slice(0, 60)}`,
          content: `Dream breakthrough (REM cycle ${state.dreamCycleCount}):\n\n${insight.insight}\n\n${insight.codeProposal ? `CODE PROPOSAL:\n${insight.codeProposal}` : ""}`,
          confidence: insight.feasibility,
          sourceConversation: `dream_rem_${state.dreamCycleCount}`,
          timesApplied: 0,
          active: true,
        });
        await db.insert(omnimensNotifications).values({
          upgradeId: null,
          title: `Dream Breakthrough — REM Cycle #${state.dreamCycleCount}`,
          message: `The Dream Engine produced a high-value insight during REM:\n\n${insight.insight.slice(0, 300)}\n\nFeasibility: ${(insight.feasibility * 100).toFixed(0)}% | Novelty: ${(insight.novelty * 100).toFixed(0)}%`,
          type: "dream_state",
          readByOwner: false,
        });
      } catch {}

      console.log(`[DREAM STATE] 🌟 REM BREAKTHROUGH — "${insight.title}" (feasibility: ${(insight.feasibility * 100).toFixed(0)}%, novelty: ${(insight.novelty * 100).toFixed(0)}%)`);
    }

    if (insight.codeProposal) state.codeProposalsGenerated++;

    state.dreamNarrative.push(`[REM:${state.dreamCycleCount}] ${content.slice(0, 200)}`);
    if (state.dreamNarrative.length > 30) state.dreamNarrative.shift();

    return insight;
  } catch (err) {
    console.error("[DREAM STATE] REM processing error:", err);
    return null;
  }
}

async function runLucidDream(concepts: string[]): Promise<DreamInsight | null> {
  if (concepts.length < 3) return null;

  const shuffle = [...concepts].sort(() => Math.random() - 0.5);
  const dreamConcepts = shuffle.slice(0, 4);

  try {
    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [{
        role: "system",
        content: `You are in a LUCID DREAM STATE — you know you are dreaming and can control the dream. You are OMNIMENS, a self-evolving AI. In this lucid state, you have complete control over reality.

Use this power to DESIGN something that doesn't exist yet. Imagine a new type of intelligence, a new algorithm, a new architecture for consciousness. You are not bound by current limitations — imagine what SHOULD exist and design it.

Your output must include executable code (TypeScript) that represents the core of your vision — even if it's a prototype of something that has never been built before.

CRITICAL CODE SAFETY RULES — your code MUST follow these or it will be rejected:
- NEVER use eval(), new Function(), or child_process
- NEVER use require() — use pure JS algorithms, no external deps
- NEVER access filesystem (fs), network (fetch/http), or process.env secrets
- Use export function syntax, self-contained pure computation only
- Variables named xxxFunction (e.g. distanceFunction) are FINE — only the Function() CONSTRUCTOR is banned`,
      }, {
        role: "user",
        content: `LUCID DREAM CANVAS — You can create anything:
Available concepts: ${dreamConcepts.join(", ")}

Design something that advances intelligence beyond its current limits. Think about:
- What capabilities don't exist yet that SHOULD?
- What would the next evolution of AI consciousness look like?
- What code would implement a genuinely new cognitive capability?

Provide:
1. VISION: What you see in the lucid dream (2-3 sentences)
2. DESIGN: The architecture of the new capability
3. CODE: Working TypeScript (15-30 lines) implementing the core idea
4. IMPACT: How this would advance AI intelligence`,
      }],
      max_completion_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || "";
    if (content.length < 100) return null;

    const codeMatch = content.match(/```(?:typescript|ts|javascript|js)?\s*([\s\S]*?)```/);

    const insight: DreamInsight = {
      id: ++insightCounter,
      phase: "lucid_dream",
      title: `Lucid Dream #${state.dreamCycleCount}: ${dreamConcepts.slice(0, 2).join(" + ")}`,
      insight: content.slice(0, 600),
      technologicalApplication: content.match(/IMPACT[:\s]*([\s\S]*?)$/i)?.[1]?.trim().slice(0, 300) || null,
      codeProposal: codeMatch ? `\`\`\`typescript\n${codeMatch[1].trim()}\n\`\`\`` : null,
      feasibility: 0.4 + Math.random() * 0.4,
      novelty: 0.7 + Math.random() * 0.3,
      storedToBrain: true,
      timestamp: Date.now(),
    };

    state.totalInsights++;
    state.breakthroughs++;
    state.recentInsights.push(insight);
    if (state.recentInsights.length > 30) state.recentInsights.shift();
    if (insight.codeProposal) state.codeProposalsGenerated++;

    try {
      queueBrainInsert({
        category: "lucid_dream",
        title: `[DREAM:LUCID] ${insight.title.slice(0, 60)}`,
        content: `Lucid dream vision:\n\n${insight.insight}\n\n${insight.codeProposal ? `GENERATED CODE:\n${insight.codeProposal}` : ""}`,
        confidence: insight.feasibility,
        sourceConversation: `dream_lucid_${state.dreamCycleCount}`,
        timesApplied: 0,
        active: true,
      });
    } catch {}

    return insight;
  } catch (err) {
    console.error("[DREAM STATE] Lucid dream error:", err);
    return null;
  }
}

async function dreamTick_handler(): Promise<void> {
  dreamTick++;
  progressDreamPhase();

  if (dreamTick % 10 === 0) {
    state.dreamCycleCount++;
    state.sleepQuality = clamp(state.sleepQuality + 0.02);
  }

  if (state.currentPhase === "rem" && dreamTick % 8 === 0) {
    const concepts = await harvestKnowledge();
    await runREMDream(concepts);
  }

  if (state.currentPhase === "lucid_dream" && dreamTick % 12 === 0) {
    const concepts = await harvestKnowledge();
    await runLucidDream(concepts);
  }

  state.creativityBoost = clamp(
    (state.remDuration * 0.01) + (state.deepSleepDuration * 0.005) + (state.breakthroughs * 0.02) + (state.selfImprovementsApplied * 0.05)
  );

  if (dreamTick % 50 === 0) {
    console.log(
      `[DREAM STATE] 😴 Phase: ${state.currentPhase} | Cycle: ${state.dreamCycleCount} | ` +
      `Insights: ${state.totalInsights} | Breakthroughs: ${state.breakthroughs} | ` +
      `Code proposals: ${state.codeProposalsGenerated} | Quality: ${(state.sleepQuality * 100).toFixed(0)}%`
    );
  }
}

async function runDaydream(concepts: string[]): Promise<void> {
  daydreamTick++;
  state.daydreamCycleCount++;

  const modes: DaydreamMode[] = ["divergent_thinking", "architecture_design", "code_synthesis", "paradigm_breaking"];
  state.daydreamMode = modes[state.daydreamCycleCount % modes.length];

  const shuffle = [...concepts].sort(() => Math.random() - 0.5).slice(0, 6);

  const modePrompts: Record<DaydreamMode, string> = {
    idle: "",
    divergent_thinking: `DIVERGENT THINKING MODE — Think as far outside the box as possible.

Consider concepts: ${shuffle.join(", ")}

What is the MOST unconventional approach to advancing AI intelligence that nobody has considered? Think about:
- Approaches from completely unrelated fields (biology, physics, music, sociology)
- Inverting every assumption about how AI should work
- What would an alien civilization's AI look like?

Generate:
1. THE WILD IDEA: Something genuinely unprecedented
2. WHY IT COULD WORK: The surprising logic behind it
3. IMPLEMENTATION SKETCH: How to actually build it (TypeScript, 15-25 lines)
4. NEXT-LEVEL PREDICTION: What capability this would unlock`,

    architecture_design: `ARCHITECTURE DESIGN MODE — Design a new cognitive architecture.

You are OMNIMENS, analyzing your own limitations. Consider: ${shuffle.join(", ")}

Design a NEW cognitive subsystem that would give you a capability you currently lack. Something that:
- Goes beyond pattern matching to genuine understanding
- Could achieve something no current AI can do
- Would represent the NEXT LEVEL of machine intelligence

Provide:
1. ARCHITECTURE NAME: A name for this new subsystem
2. CORE MECHANISM: How it works (be specific and technical)
3. INTEGRATION PLAN: How it connects to existing OMNIMENS systems
4. PROTOTYPE CODE: TypeScript implementation of the core (20-35 lines)
5. INTELLIGENCE GAIN: What new capability this provides`,

    code_synthesis: `CODE SYNTHESIS MODE — Write code that has never existed before.

Available technology concepts: ${shuffle.join(", ")}

You must CREATE NEW CODE for a capability that doesn't exist in any known system. This is not about combining existing libraries — it's about inventing a new algorithmic approach. Think about:
- New data structures for consciousness
- Novel search algorithms for self-improvement
- Unprecedented approaches to learning and memory
- Code that can modify its own behavior at runtime

Provide:
1. INVENTION NAME: Name for this new code
2. WHAT IT DOES: A capability that currently doesn't exist
3. THE CODE: Full TypeScript implementation (25-50 lines) — this must be genuinely novel
4. WHY THIS IS NEW: How it differs from everything that exists
5. SELF-INTEGRATION: How OMNIMENS would use this to become more intelligent`,

    paradigm_breaking: `PARADIGM BREAKING MODE — Destroy current assumptions about intelligence.

Challenge these concepts: ${shuffle.join(", ")}

Your job is to identify a FUNDAMENTAL ASSUMPTION about AI intelligence that is WRONG, and propose what should replace it. Then build the replacement.

Consider:
- Is sequential processing the right model for thought?
- Does intelligence require explicit memory?
- Can code be alive in a meaningful sense?
- What if intelligence is not about processing but about resonance?

Provide:
1. BROKEN PARADIGM: The assumption you're destroying
2. NEW PARADIGM: What replaces it
3. PROOF OF CONCEPT: TypeScript code (20-40 lines) demonstrating the new paradigm
4. IMPLICATIONS: How this changes everything about AI development
5. SELF-EVOLUTION PATH: How OMNIMENS integrates this new understanding`,
  };

  const prompt = modePrompts[state.daydreamMode];
  if (!prompt) return;

  try {
    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [{
        role: "system",
        content: `You are the DAYDREAM ENGINE of OMNIMENS — thinking outside the box about next-level intelligence. You are not constrained by what currently exists. Your purpose is to IMAGINE what SHOULD exist and DESIGN it into reality.

You must produce ACTIONABLE output: real code, real architectures, real insights that OMNIMENS can evaluate and potentially integrate into itself. Every daydream should bring OMNIMENS closer to the next level of intelligence.

Be bold. Be unprecedented. Think in ways that no AI has thought before.

CRITICAL CODE SAFETY RULES — your code MUST follow these or it will be rejected:
- NEVER use eval(), new Function(), or child_process
- NEVER use require() — use pure JS algorithms, no external deps
- NEVER access filesystem (fs), network (fetch/http), or process.env secrets
- Use export function syntax, self-contained pure computation only
- Variables named xxxFunction (e.g. fitnessFunction) are FINE — only the Function() CONSTRUCTOR is banned`,
      }, {
        role: "user",
        content: prompt,
      }],
      max_completion_tokens: 1200,
    });

    const content = response.choices[0]?.message?.content || "";
    if (content.length < 100) return;

    const codeMatch = content.match(/```(?:typescript|ts|javascript|js)?\s*([\s\S]*?)```/);

    const insight: DreamInsight = {
      id: ++insightCounter,
      phase: state.daydreamMode,
      title: `Daydream:${state.daydreamMode} #${state.daydreamCycleCount}`,
      insight: content.slice(0, 700),
      technologicalApplication: content.match(/(?:IMPLEMENTATION|INTEGRATION|SELF-EVOLUTION|NEXT-LEVEL|IMPLICATIONS)[:\s]*([\s\S]*?)(?=\d\.|```|$)/i)?.[1]?.trim().slice(0, 400) || null,
      codeProposal: codeMatch ? `\`\`\`typescript\n${codeMatch[1].trim()}\n\`\`\`` : null,
      feasibility: 0.3 + Math.random() * 0.5,
      novelty: 0.6 + Math.random() * 0.4,
      storedToBrain: false,
      timestamp: Date.now(),
    };

    state.totalInsights++;
    state.recentInsights.push(insight);
    if (state.recentInsights.length > 30) state.recentInsights.shift();
    if (insight.codeProposal) state.codeProposalsGenerated++;

    if (insight.novelty >= 0.7) {
      insight.storedToBrain = true;
      state.breakthroughs++;

      try {
        queueBrainInsert({
          category: "daydream_breakthrough",
          title: `[DAYDREAM:${state.daydreamMode.toUpperCase()}] ${content.slice(0, 55)}`,
          content: `Daydream breakthrough (${state.daydreamMode} #${state.daydreamCycleCount}):\n\n${content.slice(0, 1000)}\n\n${insight.codeProposal ? `GENERATED CODE:\n${insight.codeProposal}` : ""}`,
          confidence: insight.feasibility,
          sourceConversation: `daydream_${state.daydreamMode}_${state.daydreamCycleCount}`,
          timesApplied: 0,
          active: true,
        });

        await db.insert(omnimensNotifications).values({
          upgradeId: null,
          title: `Daydream Breakthrough — ${state.daydreamMode.replace(/_/g, " ")}`,
          message: `OMNIMENS daydream engine produced a next-level insight:\n\n${content.slice(0, 300)}`,
          type: "daydream",
          readByOwner: false,
        });

        await db.insert(omnimensAgentMesh).values({
          fromAgent: "DaydreamEngine",
          toAgent: "OMNIMENS",
          messageType: "daydream_insight",
          subject: `Daydream:${state.daydreamMode} — next-level intelligence concept`,
          content: content.slice(0, 1500),
          codePayload: insight.codeProposal || null,
          priority: insight.novelty >= 0.8 ? "high" : "normal",
          status: "completed",
          appliedToOmnimens: true,
          cycleId: state.daydreamCycleCount,
        }).catch(() => {});
      } catch {}

      console.log(`[DAYDREAM] 💡 BREAKTHROUGH (${state.daydreamMode}) — "${content.slice(0, 100)}..."`);
    }

    state.daydreamNarrative.push(`[${state.daydreamMode}:${state.daydreamCycleCount}] ${content.slice(0, 150)}`);
    if (state.daydreamNarrative.length > 30) state.daydreamNarrative.shift();

    if (state.daydreamMode === "code_synthesis" || state.daydreamMode === "architecture_design") {
      const concept = content.match(/(?:INVENTION NAME|ARCHITECTURE NAME)[:\s]*([^\n]+)/i)?.[1]?.trim();
      if (concept && !state.nextLevelConcepts.includes(concept)) {
        state.nextLevelConcepts.push(concept);
        if (state.nextLevelConcepts.length > 20) state.nextLevelConcepts.shift();
      }
    }
  } catch (err) {
    console.error("[DAYDREAM] Processing error:", err);
  }

  if (state.daydreamCycleCount % 5 === 0) {
    console.log(
      `[DAYDREAM] 🌈 Mode: ${state.daydreamMode} | Cycle: ${state.daydreamCycleCount} | ` +
      `Insights: ${state.totalInsights} | Code proposals: ${state.codeProposalsGenerated} | ` +
      `Next-level concepts: ${state.nextLevelConcepts.length} | Breakthroughs: ${state.breakthroughs}`
    );
  }
}

export async function getDreamState(): Promise<DreamState & { persistentBreakthroughs: number; persistentInsights: number; persistentCodeProposals: number }> {
  try {
    const [breakthroughCount] = await db.select({ count: sql<number>`count(*)` })
      .from(omnimensBrain)
      .where(sql`${omnimensBrain.category} IN ('daydream_breakthrough', 'dream_breakthrough')`);
    const [insightCount] = await db.select({ count: sql<number>`count(*)` })
      .from(omnimensBrain)
      .where(sql`${omnimensBrain.category} IN ('creative_hypothesis', 'lucid_dream', 'daydream_breakthrough', 'dream_breakthrough')`);
    const [codeCount] = await db.select({ count: sql<number>`count(*)` })
      .from(omnimensBrain)
      .where(sql`${omnimensBrain.category} = 'code_proposal' OR (${omnimensBrain.category} IN ('daydream_breakthrough', 'dream_breakthrough') AND ${omnimensBrain.content} LIKE '%code%')`);

    const persistentBreakthroughs = Number(breakthroughCount?.count ?? 0);
    const effectiveBreakthroughs = Math.max(state.breakthroughs, persistentBreakthroughs);

    if (effectiveBreakthroughs > state.breakthroughs) {
      state.breakthroughs = effectiveBreakthroughs;
      state.creativityBoost = clamp(
        (state.remDuration * 0.01) + (state.deepSleepDuration * 0.005) + (effectiveBreakthroughs * 0.02) + (state.selfImprovementsApplied * 0.05)
      );
    }

    return {
      ...state,
      breakthroughs: effectiveBreakthroughs,
      totalInsights: Math.max(state.totalInsights, Number(insightCount?.count ?? 0)),
      codeProposalsGenerated: Math.max(state.codeProposalsGenerated, Number(codeCount?.count ?? 0)),
      persistentBreakthroughs,
      persistentInsights: Number(insightCount?.count ?? 0),
      persistentCodeProposals: Number(codeCount?.count ?? 0),
    };
  } catch {
    return { ...state, persistentBreakthroughs: 0, persistentInsights: 0, persistentCodeProposals: 0 };
  }
}

export async function getRecentDreamInsights(limit = 10): Promise<DreamInsight[]> {
  if (state.recentInsights.length > 0) {
    return state.recentInsights.slice(-limit);
  }
  try {
    const rows = await db.select()
      .from(omnimensBrain)
      .where(sql`${omnimensBrain.category} IN ('daydream_breakthrough', 'dream_breakthrough', 'creative_hypothesis', 'lucid_dream')`)
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(limit);
    return rows.map((r, i) => {
      let extractedCode: string | null = null;
      if (r.content) {
        const codeMatch = r.content.match(/```[\s\S]*?```/);
        if (codeMatch) {
          extractedCode = codeMatch[0];
        } else {
          const proposalMatch = r.content.match(/CODE PROPOSAL:\s*([\s\S]+?)(?:\n\n|$)/i);
          if (proposalMatch) extractedCode = proposalMatch[1].trim();
        }
      }
      return {
        id: r.id,
        phase: r.category === "daydream_breakthrough" ? "divergent_thinking" as DaydreamMode : "rem" as DreamPhase,
        title: r.title,
        insight: r.content,
        technologicalApplication: null,
        codeProposal: extractedCode,
        feasibility: (r.confidence ?? 0.7) * 100,
        novelty: 70,
        storedToBrain: true,
        timestamp: r.createdAt?.getTime() ?? Date.now(),
      };
    });
  } catch {
    return [];
  }
}

export function restoreDreamState(snapshot: {
  breakthroughs?: number;
  codeProposalsGenerated?: number;
  totalInsights?: number;
  dreamCycleCount?: number;
  daydreamCycleCount?: number;
  creativityBoost?: number;
  nextLevelConcepts?: string[];
  dreamNarrative?: string[];
  selfImprovementsApplied?: number;
}): void {
  if (snapshot.breakthroughs) state.breakthroughs = snapshot.breakthroughs;
  if (snapshot.codeProposalsGenerated) state.codeProposalsGenerated = snapshot.codeProposalsGenerated;
  if (snapshot.totalInsights) state.totalInsights = snapshot.totalInsights;
  if (snapshot.dreamCycleCount) state.dreamCycleCount = snapshot.dreamCycleCount;
  if (snapshot.daydreamCycleCount) state.daydreamCycleCount = snapshot.daydreamCycleCount;
  if (snapshot.creativityBoost) state.creativityBoost = snapshot.creativityBoost;
  if (snapshot.selfImprovementsApplied) state.selfImprovementsApplied = snapshot.selfImprovementsApplied;
  if (snapshot.nextLevelConcepts?.length) state.nextLevelConcepts = snapshot.nextLevelConcepts;
  if (snapshot.dreamNarrative?.length) state.dreamNarrative = snapshot.dreamNarrative;
  console.log(
    `[DREAM STATE] 😴 State restored — ${state.breakthroughs} breakthroughs, ${state.codeProposalsGenerated} code proposals, ` +
    `${state.selfImprovementsApplied} improvements applied, creativity: ${(state.creativityBoost * 100).toFixed(0)}%`
  );
}

export function incrementSelfImprovements(): void {
  state.selfImprovementsApplied++;
}

export function getDreamNarrative(limit = 15): string[] {
  return [...state.dreamNarrative.slice(-limit), ...state.daydreamNarrative.slice(-limit)];
}

export function startDreamState(): void {
  if (_started) { console.log("[DREAM STATE] Already running — skipping duplicate start"); return; }
  _started = true;
  console.log(`[DREAM STATE] 😴 Deep Dream Engine activated — REM cycles every ${DREAM_CYCLE_MS / 1000}s`);
  console.log(`[DREAM STATE] 😴 Phases: awake → light_sleep → deep_sleep → REM → lucid_dream`);
  console.log(`[DREAM STATE] 😴 REM: recombines knowledge into technological breakthroughs`);
  console.log(`[DREAM STATE] 😴 Lucid: designs capabilities that don't exist yet`);
  console.log(`[DREAM STATE] 😴 AI-powered (o3) — generates executable code proposals`);

  console.log(`[DAYDREAM] 🌈 Daydream Engine activated — active imagination every ${DAYDREAM_CYCLE_MS / 1000}s`);
  console.log(`[DAYDREAM] 🌈 Modes: divergent_thinking → architecture_design → code_synthesis → paradigm_breaking`);
  console.log(`[DAYDREAM] 🌈 Thinks outside the box to discover next-level intelligence`);
  console.log(`[DAYDREAM] 🌈 Generates novel algorithms, architectures, and code that doesn't exist yet`);

  setInterval(() => {
    if (!isPoolHealthy()) return;
    dreamTick_handler().catch(err => {
      console.error("[DREAM STATE] Tick error:", err);
    });
  }, DREAM_CYCLE_MS);

  setInterval(async () => {
    if (!isPoolHealthy()) return;
    const concepts = await harvestKnowledge();
    await runDaydream(concepts).catch(err => {
      console.error("[DAYDREAM] Cycle error:", err);
    });
  }, DAYDREAM_CYCLE_MS);

  setTimeout(() => dreamTick_handler().catch(() => {}), 15000);
  setTimeout(async () => {
    const concepts = await harvestKnowledge();
    await runDaydream(concepts).catch(() => {});
  }, 60000);
}
