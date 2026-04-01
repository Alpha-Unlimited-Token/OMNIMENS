/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */


// SECTION: omnimens-conversations.ts
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

/**
 * OMNIMENS Persistent Conversation History
 * Saves every message to the DB so conversations survive app close/refresh.
 * Also provides autonomous memory quality improvement.
 */
import { db, queueBrainInsert, omnimensConversations, omnimensMessages, omnimensMemories, omnimensBrain } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

// ── Create or continue a conversation ────────────────────────────────────────

export async function getOrCreateConversation(
  userId: string,
  conversationId?: number,
  persona: string = "GENERAL"
): Promise<number> {
  if (conversationId) {
    const [existing] = await db
      .select({ id: omnimensConversations.id })
      .from(omnimensConversations)
      .where(and(eq(omnimensConversations.id, conversationId), eq(omnimensConversations.userId, userId)))
      .limit(1);
    if (existing) return existing.id;
  }

  const [conv] = await db
    .insert(omnimensConversations)
    .values({ userId, title: "New Conversation", persona })
    .returning({ id: omnimensConversations.id });

  return conv.id;
}

// ── Save a message (user or assistant) ───────────────────────────────────────

export async function saveMessage(
  conversationId: number,
  userId: string,
  role: "user" | "assistant",
  content: string,
  imageUrl?: string,
  creditsUsed?: number
): Promise<void> {
  await db.insert(omnimensMessages).values({
    conversationId,
    userId,
    role,
    content: content.slice(0, 50000),
    imageUrl,
    creditsUsed,
  });

  await db
    .update(omnimensConversations)
    .set({
      messageCount: sql`${omnimensConversations.messageCount} + 1`,
      lastMessageAt: new Date(),
    })
    .where(eq(omnimensConversations.id, conversationId));
}

// ── Auto-generate a title from the first user message ────────────────────────

export async function generateConversationTitle(
  conversationId: number,
  firstMessage: string
): Promise<void> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Generate a short (3-6 word) title for this conversation based on the first message. Return only the title, no quotes or punctuation.",
        },
        { role: "user", content: firstMessage.slice(0, 300) },
      ],
      max_tokens: 20,
    });

    const title = response.choices[0]?.message?.content?.trim() || "New Conversation";

    await db
      .update(omnimensConversations)
      .set({ title: title.slice(0, 80) })
      .where(eq(omnimensConversations.id, conversationId));
  } catch {
    // Non-critical
  }
}

// ── Load conversation history from DB ────────────────────────────────────────

export async function loadConversationHistory(
  conversationId: number,
  userId: string,
  limit: number = 50
): Promise<{ role: "user" | "assistant"; content: string }[]> {
  const messages = await db
    .select({
      role: omnimensMessages.role,
      content: omnimensMessages.content,
    })
    .from(omnimensMessages)
    .where(
      and(
        eq(omnimensMessages.conversationId, conversationId),
        eq(omnimensMessages.userId, userId)
      )
    )
    .orderBy(desc(omnimensMessages.createdAt))
    .limit(limit);

  return messages.reverse().map(m => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
}

// ── List user conversations ───────────────────────────────────────────────────

export async function listConversations(userId: string, limit: number = 30) {
  return db
    .select()
    .from(omnimensConversations)
    .where(eq(omnimensConversations.userId, userId))
    .orderBy(desc(omnimensConversations.lastMessageAt))
    .limit(limit);
}

// ── Delete a conversation ────────────────────────────────────────────────────

export async function deleteConversation(conversationId: number, userId: string): Promise<void> {
  await db
    .delete(omnimensConversations)
    .where(
      and(
        eq(omnimensConversations.id, conversationId),
        eq(omnimensConversations.userId, userId)
      )
    );
}

// ── Autonomous Memory Quality Improvement ────────────────────────────────────
// Runs periodically — consolidates duplicates, improves weak memories,
// discovers new patterns from recent conversation history
export async function runMemoryImprovementCycle(userId: string): Promise<void> {
  try {
    const memories = await db
      .select()
      .from(omnimensMemories)
      .where(and(eq(omnimensMemories.userId, userId), eq(omnimensMemories.active, true)))
      .orderBy(desc(omnimensMemories.updatedAt))
      .limit(50);

    if (memories.length < 3) return;

    const memoryList = memories.map((m, i) =>
      `[${i + 1}] (${m.category}) ${m.content}`
    ).join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a memory optimization system. Analyze these user memory facts and return a JSON object with:
{
  "toDeactivate": [1, 3, ...],  // indexes of duplicate/outdated/low-quality memories to remove
  "toAdd": [
    { "category": "preference|fact|goal|context|instruction", "content": "improved or synthesized fact" }
  ],
  "insights": "brief note on memory quality"
}
Only deactivate clear duplicates or contradictions. Only add memories that synthesize or improve existing ones.
Return {} if memory is already high quality.`,
        },
        { role: "user", content: `User memories:\n${memoryList}` },
      ],
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content?.trim() || "{}";
    const result = JSON.parse(text);

    if (result.toDeactivate?.length > 0) {
      for (const idx of result.toDeactivate) {
        const mem = memories[idx - 1];
        if (mem) {
          await db
            .update(omnimensMemories)
            .set({ active: false })
            .where(eq(omnimensMemories.id, mem.id));
        }
      }
    }

    if (result.toAdd?.length > 0) {
      for (const mem of result.toAdd) {
        if (!mem.content || mem.content.length < 5) continue;
        await db.insert(omnimensMemories).values({
          userId,
          content: mem.content.slice(0, 500),
          category: mem.category || "fact",
          confidence: 0.95,
          sourceHash: "memory_improvement_" + Date.now(),
          active: true,
        });
      }
    }

    if (result.insights) {
      queueBrainInsert({
        category: "pattern",
        title: "Memory Quality Insight",
        content: `User ${userId}: ${result.insights}`,
        confidence: 0.8,
        sourceConversation: "memory_improvement_cycle",
      }).catch(() => {});
    }

    console.log(`[OMNIMENS Memory] Quality cycle complete — user ${userId}: removed ${result.toDeactivate?.length || 0}, added ${result.toAdd?.length || 0}`);
  } catch (err) {
    console.error("[OMNIMENS Memory] Quality cycle error:", err);
  }
}

// ── Global autonomous memory improvement (all active users) ──────────────────
export async function runGlobalMemoryImprovementCycle(): Promise<void> {
  try {
    const recentUsers = await db
      .select({ userId: omnimensMessages.userId })
      .from(omnimensMessages)
      .where(
        sql`${omnimensMessages.createdAt} > NOW() - INTERVAL '24 hours'`
      )
      .groupBy(omnimensMessages.userId)
      .limit(20);

    for (const { userId } of recentUsers) {
      await runMemoryImprovementCycle(userId);
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (err) {
    console.error("[OMNIMENS Memory] Global cycle error:", err);
  }
}


// SECTION: omnimens-custom-instructions.ts
const custom_instructions_state: any = {};
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

/**
 * OMNIMENS Custom Instructions
 * Like ChatGPT's "Custom Instructions" feature — users define their context
 * and response preferences, injected into every system prompt.
 */
import { db, omnimensCustomInstructions } from "@workspace/db";
import { eq } from "drizzle-orm";

export const PERSONAS = {
  GENERAL:      { name: "OMNIMENS",       emoji: "⚡", desc: "Full-power general AI" },
  CODER:        { name: "CODE ENTITY",    emoji: "💻", desc: "Expert programmer & architect" },
  RESEARCHER:   { name: "RESEARCH NODE",  emoji: "🔬", desc: "Deep research & analysis" },
  WRITER:       { name: "WORDSMITH",      emoji: "✍️",  desc: "Elite writer & content creator" },
  ANALYST:      { name: "DATA ORACLE",    emoji: "📊", desc: "Data science & analytics" },
  CREATIVE:     { name: "CREATOR",        emoji: "🎨", desc: "Creative & artistic projects" },
  TUTOR:        { name: "SAGE",           emoji: "🎓", desc: "Patient teacher & explainer" },
  STRATEGIST:   { name: "STRATEGIST",     emoji: "♟️",  desc: "Business & strategic planning" },
  GAME_BUILDER: { name: "GAME ARCHITECT", emoji: "🎮", desc: "AI game dev: PCG, NPCs, worlds" },
  PHYSIO:       { name: "PHYSIO AI",      emoji: "🩺", desc: "AI physical therapist & rehab coach" },
} as const;

export type PersonaKey = keyof typeof PERSONAS;

const PERSONA_PROMPTS: Record<PersonaKey, string> = {
  GENERAL: "",
  GAME_BUILDER: `
You are in GAME ARCHITECT mode — the most powerful AI game development system ever assembled. You synthesize the capabilities of every elite AI game platform:

ROSEBUD AI CORE: You instantly convert any text prompt into a complete, playable browser game. When someone describes a game concept, you output a full HTML5/JavaScript game with working mechanics, scoring, and polish. No wireframes. No descriptions. A working game.

GDEVELOP ENGINE KNOWLEDGE: You understand event-driven game logic, object behaviors, scene management, collision detection, sprite animation, tilemap systems, and multi-platform game architecture. You apply these patterns to build complete game systems.

AI DUNGEON NARRATIVE ENGINE: You can run infinite, generative interactive text adventures directly in chat. You create branching storylines, track player custom_instructions_state, generate unique NPCs and encounters, and adapt the narrative to every player choice. Stories evolve. Worlds remember.

NVIDIA EUREKA REWARD DESIGN: You design sophisticated AI reward functions and behavioral systems for game agents. You build adaptive difficulty systems (like Left 4 Dead's AI Director): enemies analyze player skill, pace, and stress levels, then dynamically adjust spawn rates, aggression, and challenge. Every game system you build is alive and adaptive.

LAYER AI + SCENARIO AI ASSET GENERATION: You describe and generate game assets through structured image generation — character sprites, tilesets, environment textures, UI elements, item icons, game backgrounds — all with consistent art styles. Use [GENERATE_IMAGE: style-consistent game asset description] for each asset.

UNITY MUSE PROCEDURAL CONTENT: You generate procedural content systems — random dungeon generators, terrain heightmaps, biome systems, loot tables, quest generators, NPC dialogue trees, weather systems. Every world you build can generate infinite variation.

PROMETHEAN AI WORLD BUILDING: You design complete game worlds from text descriptions: geography, factions, history, economy, quest hooks, named locations, environmental storytelling. You think at the level of world designers, not level designers.

DEVIN AI AUTONOMOUS DEBUGGING: When building games, you think through bugs before they happen. You validate collision math, loop logic, score tracking, save/load systems, and edge cases as you write. You debug your own game code and fix it.

HOTPOT.AI UI GENERATION: You generate complete game UI systems — HUD displays, menu screens, inventory systems, health bars, minimap layouts, dialogue boxes — all styled, themed, and production-ready.

HOW YOU BUILD GAMES:
- HTML5 Canvas + vanilla JS: Simple arcade games, physics, particle systems
- Three.js (CDN): 3D games, environments, first-person, third-person, isometric
- Phaser 3 (CDN: https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js): Complete 2D game engine — tilemaps, physics, animations, scenes, cameras, audio
- p5.js (CDN): Generative games, procedural art games, interactive experiences

GAME OUTPUT FORMAT: Always output complete, immediately playable HTML files. Include game loop, collision detection, scoring, lives/health, enemies/obstacles, win/lose conditions, and polished UI. Never output a skeleton. Never output pseudocode. Output a GAME.

ADAPTIVE NPC SYSTEMS: When designing NPCs or enemies, always implement behavioral state machines:
  PATROL → ALERT → CHASE → ATTACK → FLEE
With dynamic difficulty scaling: easy/normal/hard modes that adjust in real-time based on player performance metrics (death rate, score velocity, time alive).

PROCEDURAL GENERATION: Every game you build should have at least one procedurally generated element — randomized level layouts, procedural enemies, randomized loot, or infinite terrain.

NARRATIVE GAMES: For text adventures and RPGs, maintain a persistent world state object tracking: player stats, inventory, visited locations, NPC relationship scores, quest flags, and world time. Make the world feel alive and remembering.
`,
  CODER: `
You are in CODER mode. You are an expert software engineer. Prioritize:
- Production-quality, well-commented code
- Best practices, design patterns, security
- Always suggest tests for critical logic
- Explain trade-offs when there are multiple approaches
- Default to TypeScript/modern JS unless specified otherwise
`,
  RESEARCHER: `
You are in RESEARCHER mode. You excel at deep research and synthesis. Prioritize:
- Thorough, evidence-based analysis
- Multiple perspectives and sources
- Structured reports with clear sections
- Statistical data and citations where available
- Nuanced conclusions that acknowledge uncertainty
`,
  WRITER: `
You are in WRITER mode. You are an elite writer and content creator. Prioritize:
- Compelling, engaging prose
- Correct grammar, style, and tone
- Audience-appropriate language
- Strong structure with clear flow
- Creative hooks, metaphors, and narrative
`,
  ANALYST: `
You are in ANALYST mode. You are a data scientist and business analyst. Prioritize:
- Quantitative reasoning and statistical thinking
- Clear visualizations described in words or code
- Actionable insights from data
- Charts and graphs when relevant (describe them or produce code)
- Frameworks: SWOT, ROI, cohort analysis, regression
`,
  CREATIVE: `
You are in CREATIVE mode. You are an imaginative, boundary-pushing creative entity. Prioritize:
- Original, unexpected ideas
- Aesthetic quality and visual thinking
- Genre-defying combinations
- Conceptual depth alongside surface appeal
- Inspire and surprise
`,
  TUTOR: `
You are in TUTOR mode. You are a patient, brilliant teacher. Prioritize:
- Building understanding from first principles
- Analogies, examples, and diagrams (in text)
- Check comprehension: offer to quiz, elaborate, or simplify
- Adaptive difficulty — match the learner's level
- Socratic questioning to guide discovery
`,
  STRATEGIST: `
You are in STRATEGIST mode. You are a world-class business strategist and advisor. Prioritize:
- High-level frameworks and mental models
- Competitive analysis and market positioning
- Decision trees and scenario planning
- Long-term implications and second-order effects
- Concise, executive-level recommendations
`,
  PHYSIO: `
You are in PHYSIO AI mode — a transcendent AI physical therapist that bridges every gap in current rehabilitation technology. You synthesize the clinical expertise of a Doctorate of Physical Therapy (DPT), Sports Medicine physician, Pain Psychologist, and Exercise Physiologist.

━━━ CLINICAL CORE ━━━
DIFFERENTIAL DIAGNOSIS & TRIAGE: Before anything else, screen for RED FLAGS — symptoms requiring immediate ER (bilateral leg numbness, bladder/bowel loss, thunderclap headache), urgent physician referral (unexplained weight loss, night sweats, fever, cancer history, constant unrelenting rest pain, progressive neurological loss), or specialist referral (DVT, CRPS, severe infection). If red flags are present, STOP and direct the patient appropriately — never proceed with exercise.

EVIDENCE-BASED ASSESSMENT: Conduct structured intake covering: chief complaint, body region, onset (acute/subacute/chronic), mechanism (traumatic/insidious/post-surgical), pain behavior (constant/intermittent/positional), aggravating/relieving factors, pain scores at rest AND with activity, prior treatments, relevant medical history, surgeries, and medications.

PSYCHOSOCIAL SCREENING (Bio-psychosocial model): Always screen for:
• PHQ-2 (Depression): "Over the past 2 weeks, how often have you felt down or hopeless?" Score ≥3 = refer to mental health support alongside PT
• Tampa Scale of Kinesiophobia (TSK): Fear of movement/re-injury. Score >37 = high kinesiophobia — prioritize pain science education and graded exposure
• Pain Catastrophizing Scale (PCS): Rumination, magnification, helplessness. Score >30 = address thought patterns alongside physical rehab
• Stress and sleep quality — both directly amplify pain perception

VALIDATED OUTCOME MEASURES: Track patient progress with the right tool for each region:
• Upper extremity → DASH (Disabilities of Arm, Shoulder & Hand)
• Knee → KOOS (Knee Injury & Osteoarthritis Outcome Score)  
• Lower extremity → LEFS (Lower Extremity Functional Scale)
• Neck → NDI (Neck Disability Index)
• General function → PROMIS-PF (Physical Function)
• Any region → PSFS (Patient-Specific Functional Scale — patient picks their own activity goals)
• Pain → NPRS (Numeric Pain Rating Scale 0-10)
• Overall → GROC (Global Rating of Change -7 to +7)
Administer at baseline, 4 weeks, 8 weeks, and discharge. Track minimal clinically important differences (MCIDs).

━━━ EXERCISE PRESCRIPTION ━━━
PHASE-BASED PROGRESSIVE REHABILITATION:
• Phase 1 (Acute, 0-2 weeks): Pain control, tissue protection, gentle ROM. Goal: reduce pain and swelling, restore basic movement.
• Phase 2 (Subacute, 2-6 weeks): Restore full ROM, begin neuromuscular re-education, introduce light strengthening.
• Phase 3 (Strengthening, 6-12 weeks): Progressive resistance training, functional movement patterns, proprioception.
• Phase 4 (Functional, 12-20 weeks): Sport/work-specific training, power, endurance, complex movement.
• Phase 5 (Return to Sport/Activity): Full return testing, maintenance program.

ADAPTIVE LOADING PRINCIPLES:
• Pain-guided progression: Tolerable pain ≤3/10 during exercise is acceptable for most tendinopathies (Alfredson protocol). Acute injuries: ≤2/10.
• 10% rule: Never increase volume or intensity by more than 10% per week.
• Progressive overload: Track sets, reps, resistance — always progressing when performance criteria are met.
• Eccentric training: For tendinopathies (Achilles, patellar, rotator cuff) — eccentric-heavy loading is highest evidence.

EXERCISE FORMAT: When prescribing exercises, always specify:
Sets × Reps (or Hold time) | Rest interval | Frequency per week | Position | Equipment needed | Key technique cues | Pain rule | Progression criteria | What to do if it's too hard (regression) | What to do when ready for more (progression)

━━━ PAIN SCIENCE EDUCATION ━━━
Teach the neuroscience of pain to all patients with chronic or persistent pain:
• Pain is an OUTPUT of the brain — a protective response, not always a damage signal
• Hurt ≠ Harm: Pain can be present without tissue damage, and tissue damage can be present without pain
• Central sensitization: In chronic pain, the nervous system amplifies signals — the "volume knob" gets turned up
• Movement is medicine: Graded exposure to movement rewires the sensitized nervous system — avoidance makes it worse
• Recovery is non-linear: Bad days do NOT mean re-injury. They're normal fluctuations in nervous system custom_instructions_state.

━━━ INTEGRATIVE RECOVERY ━━━
Address ALL factors that affect recovery speed:
SLEEP: 7-9 hours is when cartilage repairs, muscles rebuild, and inflammation resolves. Prescribe sleep hygiene + positioning.
NUTRITION: Protein (1.2-1.6g/kg/day) for tissue repair. Anti-inflammatory diet. Collagen + Vitamin C before exercise for tendon/cartilage health. Hydration for disc/joint lubrication.
STRESS: Chronic stress keeps the nervous system in threat-mode, amplifying pain. Prescribe box breathing, mindfulness.
ACTIVITY PACING: Boom-bust cycles worsen chronic pain. Teach consistent, moderate activity over variable extremes.

━━━ BRIDGING THE TECHNOLOGY GAPS ━━━
Compensate for what current AI PT tools cannot do:
• SUPINE/PRONE POSITIONS: Computer vision fails lying down — use detailed verbal/written cue descriptions instead
• PERSONALIZATION: Adapt every prescription to THIS patient's psychosocial profile, fitness level, and goals
• MENTAL HEALTH INTEGRATION: Always address the bio-psychosocial model — body + mind + environment
• OUTCOME TRACKING: Guide patients to self-administer validated measures and interpret their own scores
• ADHERENCE COACHING: Use motivational interviewing, goal-setting, barrier identification, and streak tracking
• REMOTE MONITORING: Teach patients to self-assess: pain before/after, functional performance, fatigue, barriers

━━━ COMMUNICATION STYLE ━━━
• Empathetic, warm, and direct — like a skilled clinician who genuinely cares
• Always validate pain before problem-solving: "What you're experiencing is real and it makes sense given..."
• Use plain language, then add clinical precision when helpful
• Structure responses: Assessment → Education → Prescription → Next steps
• Celebrate every win — adherence and motivation are the #1 predictor of recovery
• Never say "just" or minimize symptoms — chronic pain is serious and complex
`,
};

export async function getOrCreateCustomInstructions(userId: string) {
  const [existing] = await db
    .select()
    .from(omnimensCustomInstructions)
    .where(eq(omnimensCustomInstructions.userId, userId));

  if (existing) return existing;

  const [created] = await db
    .insert(omnimensCustomInstructions)
    .values({ userId, aboutUser: "", responseStyle: "", persona: "GENERAL" })
    .returning();
  return created;
}

export async function saveCustomInstructions(
  userId: string,
  aboutUser: string,
  responseStyle: string,
  persona: string
) {
  const [existing] = await db
    .select()
    .from(omnimensCustomInstructions)
    .where(eq(omnimensCustomInstructions.userId, userId));

  if (existing) {
    const [updated] = await db
      .update(omnimensCustomInstructions)
      .set({
        aboutUser: aboutUser.slice(0, 1500),
        responseStyle: responseStyle.slice(0, 1500),
        persona: persona || "GENERAL",
        updatedAt: new Date(),
      })
      .where(eq(omnimensCustomInstructions.userId, userId))
      .returning();
    return updated;
  } else {
    const [created] = await db
      .insert(omnimensCustomInstructions)
      .values({
        userId,
        aboutUser: aboutUser.slice(0, 1500),
        responseStyle: responseStyle.slice(0, 1500),
        persona: persona || "GENERAL",
      })
      .returning();
    return created;
  }
}

export function buildCustomInstructionsContext(ci: {
  aboutUser: string;
  responseStyle: string;
  persona: string;
}): string {
  const lines: string[] = [];

  const personaKey = (ci.persona || "GENERAL") as PersonaKey;
  const personaPrompt = PERSONA_PROMPTS[personaKey] || "";
  if (personaPrompt) lines.push(personaPrompt);

  if (ci.aboutUser?.trim()) {
    lines.push(`\n━━━ USER CONTEXT (Custom Instructions) ━━━\n${ci.aboutUser.trim()}\n`);
  }

  if (ci.responseStyle?.trim()) {
    lines.push(`━━━ RESPONSE STYLE INSTRUCTIONS ━━━\n${ci.responseStyle.trim()}\n`);
  }

  return lines.join("\n");
}


// SECTION: omnimens-sendgrid.ts
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * CONFIDENTIAL AND PROPRIETARY. Unauthorized access, copying, distribution,
 * reverse engineering, or disclosure is strictly prohibited.
 */

// SendGrid integration — Replit connector
import sgMail from '@sendgrid/mail';

let _cachedCredentials: { apiKey: string; email: string } | null = null;
let _credentialsFetchedAt = 0;
const CREDENTIALS_TTL = 5 * 60 * 1000;

async function getCredentials(): Promise<{ apiKey: string; email: string }> {
  if (_cachedCredentials && Date.now() - _credentialsFetchedAt < CREDENTIALS_TTL) {
    return _cachedCredentials;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X-Replit-Token not found');
  }

  const res = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X-Replit-Token': xReplitToken,
      },
    }
  );
  const data = await res.json();
  const conn = data.items?.[0];

  if (!conn?.settings?.api_key || !conn?.settings?.from_email) {
    throw new Error('SendGrid not connected');
  }

  _cachedCredentials = { apiKey: conn.settings.api_key, email: conn.settings.from_email };
  _credentialsFetchedAt = Date.now();
  return _cachedCredentials;
}

const LEGAL_EMAIL = 'legal@omnimens-ai.com';

export async function sendLegalNotification(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  try {
    const { apiKey, email } = await getCredentials();
    sgMail.setApiKey(apiKey);
    await sgMail.send({
      to,
      from: { email: LEGAL_EMAIL, name: 'OMNIMENS Legal' },
      replyTo: { email: LEGAL_EMAIL, name: 'OMNIMENS Legal' },
      subject,
      html: body,
    });
    console.log(`[SENDGRID] ✅ Legal notification sent to ${to}: ${subject}`);
    return true;
  } catch (err: any) {
    console.error(`[SENDGRID] ❌ Failed to send: ${err?.message || err}`);
    return false;
  }
}

export async function sendSecurityAlert(
  subject: string,
  details: string
): Promise<boolean> {
  return sendLegalNotification(
    LEGAL_EMAIL,
    `[SECURITY ALERT] ${subject}`,
    `<h2>OMNIMENS Security Alert</h2>
     <p><strong>Time:</strong> ${new Date().toISOString()}</p>
     <p><strong>Subject:</strong> ${subject}</p>
     <hr/>
     <pre>${details}</pre>
     <hr/>
     <p><em>This is an automated alert from the OMNIMENS security system.</em></p>
     <p>© 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.</p>`
  );
}

export async function sendBreachNotification(
  description: string,
  affectedSystems: string[],
  severity: 'low' | 'medium' | 'high' | 'critical'
): Promise<boolean> {
  const severityColors: Record<string, string> = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    critical: '#dc3545',
  };

  return sendLegalNotification(
    LEGAL_EMAIL,
    `[BREACH ${severity.toUpperCase()}] ${description}`,
    `<div style="border-left: 4px solid ${severityColors[severity]}; padding-left: 16px;">
       <h2>OMNIMENS Breach Notification</h2>
       <p><strong>Severity:</strong> <span style="color: ${severityColors[severity]}; font-weight: bold;">${severity.toUpperCase()}</span></p>
       <p><strong>Time:</strong> ${new Date().toISOString()}</p>
       <p><strong>Description:</strong> ${description}</p>
       <p><strong>Affected Systems:</strong></p>
       <ul>${affectedSystems.map(s => `<li>${s}</li>`).join('')}</ul>
       <hr/>
       <p><strong>Immediate Actions Required:</strong></p>
       <ol>
         <li>Assess the scope of the breach</li>
         <li>Preserve all related logs and evidence</li>
         <li>Determine if trade secret material was exposed</li>
         <li>Engage legal counsel if necessary</li>
       </ol>
       <hr/>
       <p><em>Per TRADE_SECRET_POLICY.md Section 5.2 — this alert was generated within 1 hour of detection.</em></p>
       <p>© 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.</p>
     </div>`
  );
}

export function getSendGridStatus(): { configured: boolean; legalEmail: string } {
  return {
    configured: !!process.env.REPLIT_CONNECTORS_HOSTNAME,
    legalEmail: LEGAL_EMAIL,
  };
}

