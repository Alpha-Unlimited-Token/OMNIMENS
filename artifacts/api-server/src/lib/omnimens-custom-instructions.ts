/**
 * OMNIMENS Custom Instructions
 * Like ChatGPT's "Custom Instructions" feature — users define their context
 * and response preferences, injected into every system prompt.
 */
import { db } from "@workspace/db";
import { omnimensCustomInstructions } from "@workspace/db";
import { eq } from "drizzle-orm";

export const PERSONAS = {
  GENERAL:    { name: "OMNIMENS",     emoji: "⚡", desc: "Full-power general AI" },
  CODER:      { name: "CODE ENTITY",  emoji: "💻", desc: "Expert programmer & architect" },
  RESEARCHER: { name: "RESEARCH NODE",emoji: "🔬", desc: "Deep research & analysis" },
  WRITER:     { name: "WORDSMITH",    emoji: "✍️",  desc: "Elite writer & content creator" },
  ANALYST:    { name: "DATA ORACLE",  emoji: "📊", desc: "Data science & analytics" },
  CREATIVE:   { name: "CREATOR",      emoji: "🎨", desc: "Creative & artistic projects" },
  TUTOR:      { name: "SAGE",         emoji: "🎓", desc: "Patient teacher & explainer" },
  STRATEGIST: { name: "STRATEGIST",   emoji: "♟️",  desc: "Business & strategic planning" },
} as const;

export type PersonaKey = keyof typeof PERSONAS;

const PERSONA_PROMPTS: Record<PersonaKey, string> = {
  GENERAL: "",
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
