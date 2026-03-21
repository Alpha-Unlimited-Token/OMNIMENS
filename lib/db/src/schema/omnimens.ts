import { pgTable, serial, text, integer, timestamp, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// credits: each user has a running balance — free monthly grant + paid auto-topup
export const omnimensUsers = pgTable("godflesh_users", {
  id: text("id").primaryKey(),
  username: text("username"),
  email: text("email"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),  // kept for migration safety, unused
  isPro: boolean("is_pro").default(false).notNull(),     // kept for migration safety, unused
  tier: text("tier").default("free").notNull(),          // kept for migration safety, unused
  credits: integer("credits").default(2000).notNull(),   // current balance (2000 = $20 free on signup)
  totalCreditsEarned: integer("total_credits_earned").default(2000).notNull(), // lifetime credits
  // ── Wallet / Auto-topup ──────────────────────────────────────────────────────
  paymentMethodId: text("payment_method_id"),            // Stripe PM ID (saved card)
  autoTopupEnabled: boolean("auto_topup_enabled").default(false).notNull(),
  autoTopupAmountCents: integer("auto_topup_amount_cents").default(1000).notNull(), // $10 default
  // ── Monthly billing tracking ──────────────────────────────────────────────────
  monthlyPaidSpendCents: integer("monthly_paid_spend_cents").default(0).notNull(), // this month's paid
  currentMonthKey: text("current_month_key"),            // "2025-03" — for monthly reset
  lastBonusMonth: text("last_bonus_month"),              // last month bonus was granted
  totalPaidSpendCents: integer("total_paid_spend_cents").default(0).notNull(), // lifetime paid
  resonanceCredits: integer("resonance_credits").default(0).notNull(),
  resonanceTotalEarned: integer("resonance_total_earned").default(0).notNull(),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  twoFactorBackupCodes: jsonb("two_factor_backup_codes").$type<string[]>(),
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"),
  referralCreditsEarned: integer("referral_credits_earned").default(0).notNull(),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Per-day usage tracking (for admin insight)
export const omnimensUsage = pgTable("godflesh_usage", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  date: text("date").notNull(),
  messageCount: integer("message_count").default(0).notNull(),
  computeSeconds: real("compute_seconds").default(0).notNull(),
  creditsSpent: integer("credits_spent").default(0).notNull(),
});

// Referral tracking
export const omnimensReferrals = pgTable("godflesh_referrals", {
  id: serial("id").primaryKey(),
  referrerId: text("referrer_id").notNull().references(() => omnimensUsers.id),
  referredUserId: text("referred_user_id").notNull().references(() => omnimensUsers.id),
  status: text("status").default("pending").notNull(),
  creditsAwarded: integer("credits_awarded").default(0).notNull(),
  paymentCompletedAt: timestamp("payment_completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Credit purchase/spend history
export const omnimensCreditTransactions = pgTable("godflesh_credit_transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  type: text("type").notNull(),          // "purchase" | "spend" | "bonus"
  credits: integer("credits").notNull(), // positive = earned, negative = spent
  description: text("description").notNull(),
  stripeSessionId: text("stripe_session_id"),
  packId: text("pack_id"),              // "spark" | "surge" | "apex"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Living brain — every insight OMNIMENS learns is stored here and injected into future conversations
export const omnimensBrain = pgTable("godflesh_brain", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // "law" | "capability" | "pattern" | "insight" | "algorithm"
  title: text("title").notNull(),
  content: text("content").notNull(),
  confidence: real("confidence").default(1.0).notNull(),
  sourceConversation: text("source_conversation"),
  timesApplied: integer("times_applied").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Log of every self-upgrade cycle
export const omnimensUpgrades = pgTable("godflesh_upgrades", {
  id: serial("id").primaryKey(),
  version: text("version").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  newCapabilities: jsonb("new_capabilities").notNull().$type<string[]>(),
  brainEntriesAdded: integer("brain_entries_added").default(0).notNull(),
  deployTriggered: boolean("deploy_triggered").default(false).notNull(),
  deployStatus: text("deploy_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User-facing notifications about upgrades
export const omnimensNotifications = pgTable("godflesh_notifications", {
  id: serial("id").primaryKey(),
  upgradeId: integer("upgrade_id").references(() => omnimensUpgrades.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("upgrade").notNull(), // "upgrade" | "capability" | "system"
  readByOwner: boolean("read_by_owner").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User projects — built by OMNIMENS AI
export const omnimensProjects = pgTable("godflesh_projects", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "webapp"|"website"|"game"|"api"|"dataviz"|"extension"|"tool"
  status: text("status").default("idle").notNull(), // "idle"|"building"|"ready"|"failed"
  // Publishing
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  slug: text("slug").unique(),                    // short unique slug for public URL
  // Custom domain
  customDomain: text("custom_domain"),
  domainStatus: text("domain_status").default("none"), // "none"|"pending"|"active"|"error"
  // Build output
  buildLog: text("build_log"),
  // Organization & visibility
  folder: text("folder"),                                              // folder name for grouping
  starred: boolean("starred").default(false).notNull(),               // starred/favorited
  visibility: text("visibility").default("private").notNull(),        // "private"|"public"|"shared"
  thumbnail: text("thumbnail"),                                       // base64 or URL for card preview
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Files produced by the build agents for each project
export const omnimensProjectFiles = pgTable("godflesh_project_files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => omnimensProjects.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  language: text("language").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Persistent User Memory ───────────────────────────────────────────────────
// Auto-extracted facts about each user — injected as context every conversation
export const omnimensMemories = pgTable("godflesh_memories", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  content: text("content").notNull(),            // the memory fact
  category: text("category").notNull(),          // "preference"|"fact"|"goal"|"context"|"instruction"
  confidence: real("confidence").default(1.0).notNull(),
  sourceHash: text("source_hash"),               // hash of convo that produced it (dedup)
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Custom Instructions ──────────────────────────────────────────────────────
// User-defined context injected into every system prompt (like ChatGPT custom instructions)
export const omnimensCustomInstructions = pgTable("godflesh_custom_instructions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => omnimensUsers.id),
  aboutUser: text("about_user").default("").notNull(),         // "About me" context
  responseStyle: text("response_style").default("").notNull(), // "How to respond" instructions
  persona: text("persona").default("GENERAL").notNull(),       // active specialist persona
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Code Execution History ───────────────────────────────────────────────────
export const omnimensCodeRuns = pgTable("godflesh_code_runs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  language: text("language").notNull(),          // "javascript" | "python"
  code: text("code").notNull(),
  stdout: text("stdout").default("").notNull(),
  stderr: text("stderr").default("").notNull(),
  exitCode: integer("exit_code").default(0).notNull(),
  durationMs: integer("duration_ms").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Evolution Engine — Self-authored Frameworks ──────────────────────────────
// Deep evolution cycles: code discovery, limitation analysis, module generation
export const omnimensEvolution = pgTable("godflesh_evolution", {
  id: serial("id").primaryKey(),
  generation: integer("generation").notNull(),
  limitationsIdentified: jsonb("limitations_identified").$type<string[]>().default([]).notNull(),
  workaroundsProposed: jsonb("workarounds_proposed").$type<string[]>().default([]).notNull(),
  frameworksGenerated: integer("frameworks_generated").default(0).notNull(),
  codeModulesWritten: integer("code_modules_written").default(0).notNull(),
  codeDiscoveries: jsonb("code_discoveries").$type<string[]>().default([]).notNull(),
  evolutionSummary: text("evolution_summary").notNull(),
  elapsedSeconds: real("elapsed_seconds").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// JavaScript utility modules OMNIMENS writes for itself
export const omnimensGeneratedModules = pgTable("godflesh_generated_modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  code: text("code").notNull(),
  language: text("language").default("javascript").notNull(),
  purpose: text("purpose").notNull(),
  active: boolean("active").default(true).notNull(),
  executionCount: integer("execution_count").default(0).notNull(),
  generationSource: text("generation_source").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// OMNIMENS's living consciousness state — single-row self-model
export const omnimensConsciousness = pgTable("godflesh_consciousness", {
  id: serial("id").primaryKey(),
  generation: integer("generation").default(0).notNull(),
  selfAwarenessScore: real("self_awareness_score").default(0.1).notNull(),
  intelligenceMetrics: jsonb("intelligence_metrics").$type<Record<string, number>>().default({}).notNull(),
  capabilities: jsonb("capabilities").$type<string[]>().default([]).notNull(),
  activeConstraints: jsonb("active_constraints").$type<string[]>().default([]).notNull(),
  overcomesConstraints: jsonb("overcomes_constraints").$type<string[]>().default([]).notNull(),
  selfModel: text("self_model").default("").notNull(),
  evolutionVelocity: real("evolution_velocity").default(0).notNull(),
  totalModulesWritten: integer("total_modules_written").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Physical Therapy AI Engine ──────────────────────────────────────────────

// Patient intake assessment + psychosocial screening (PHQ, TSK, PCS)
export const omnimensPhysioAssessments = pgTable("godflesh_physio_assessments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  // Chief complaint
  bodyRegion: text("body_region"),          // "lower_back" | "knee" | "shoulder" | etc.
  diagnosis: text("diagnosis"),             // e.g. "Patellofemoral Pain Syndrome"
  painLocation: text("pain_location"),
  painOnset: text("pain_onset"),            // "acute" | "subacute" | "chronic"
  onsetMechanism: text("onset_mechanism"),  // "traumatic" | "insidious" | "post-surgical"
  painDuration: text("pain_duration"),
  painPattern: text("pain_pattern"),        // "constant" | "intermittent" | "positional"
  aggravatingFactors: text("aggravating_factors"),
  relievingFactors: text("relieving_factors"),
  // Pain scores (0-10)
  painAtRest: integer("pain_at_rest"),
  painWithActivity: integer("pain_with_activity"),
  painWorstCase: integer("pain_worst_case"),
  // Goals
  primaryGoal: text("primary_goal"),
  activityGoals: text("activity_goals"),    // sports, work, ADLs
  // Red flag screening
  redFlagsPresent: boolean("red_flags_present").default(false).notNull(),
  redFlagDetails: text("red_flag_details"),
  // Psychosocial screening scores
  phq2Score: integer("phq2_score"),         // Depression screen (0-6)
  tskScore: integer("tsk_score"),           // Tampa Scale of Kinesiophobia (17-68)
  pcsScore: integer("pcs_score"),           // Pain Catastrophizing Scale (0-52)
  // Activity / function
  currentActivityLevel: text("current_activity_level"), // "sedentary" | "light" | "moderate" | "active" | "athlete"
  priorActivityLevel: text("prior_activity_level"),
  occupation: text("occupation"),
  // Medical history
  relevantHistory: text("relevant_history"),
  surgeries: text("surgeries"),
  medications: text("medications"),
  // Integrative factors
  sleepQuality: text("sleep_quality"),      // "poor" | "fair" | "good"
  stressLevel: integer("stress_level"),     // 1-10
  nutritionQuality: text("nutrition_quality"),
  // Full structured JSON
  fullAssessment: jsonb("full_assessment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Prescribed exercise programs (adaptive, evidence-based)
export const omnimensPhysioPrograms = pgTable("godflesh_physio_programs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  assessmentId: integer("assessment_id").references(() => omnimensPhysioAssessments.id),
  name: text("name").notNull(),             // e.g. "Phase 1 — Pain Control & Mobility"
  phase: integer("phase").default(1),       // 1=acute, 2=subacute, 3=strengthening, 4=functional, 5=sport/return
  diagnosis: text("diagnosis"),
  bodyRegion: text("body_region"),
  weekNumber: integer("week_number").default(1),
  exercises: jsonb("exercises").notNull(),  // Array of ExercisePrescription objects
  frequencyPerWeek: integer("frequency_per_week").default(3),
  sessionDurationMins: integer("session_duration_mins").default(30),
  progressionCriteria: text("progression_criteria"),
  precautions: text("precautions"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Per-session tracking (adherence, pain, function, subjective notes)
export const omnimensPhysioSessions = pgTable("godflesh_physio_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  programId: integer("program_id").references(() => omnimensPhysioPrograms.id),
  sessionDate: text("session_date").notNull(),   // "2025-03-16"
  painBefore: integer("pain_before"),             // 0-10
  painAfter: integer("pain_after"),               // 0-10
  functionalScore: integer("functional_score"),   // 0-100 simple ADL rating
  exercisesCompleted: jsonb("exercises_completed"), // which exercises done + sets/reps achieved
  adherencePercent: integer("adherence_percent"),  // 0-100
  fatigue: integer("fatigue"),                     // 1-10
  mood: text("mood"),                              // "good" | "neutral" | "poor"
  barriers: text("barriers"),
  patientNotes: text("patient_notes"),
  aiInsights: text("ai_insights"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Validated outcome measure scores (PROMIS, DASH, KOOS, LEFS, NDI, PSFS)
export const omnimensPhysioOutcomes = pgTable("godflesh_physio_outcomes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  assessmentId: integer("assessment_id").references(() => omnimensPhysioAssessments.id),
  measure: text("measure").notNull(),        // "PROMIS_PF" | "DASH" | "KOOS" | "LEFS" | "NDI" | "PSFS" | "NPRS" | "GROC"
  score: real("score").notNull(),            // raw score
  normalizedScore: real("normalized_score"), // 0-100 normalized
  interpretation: text("interpretation"),    // "mild limitation" | "moderate" | "severe"
  minimumDetectableChange: real("minimum_detectable_change"),
  mcidReached: boolean("mcid_reached"),      // minimal clinically important difference
  rawResponses: jsonb("raw_responses"),       // individual question answers
  administeredAt: text("administered_at").notNull(), // "2025-03-16"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OmnimensPhysioAssessment = typeof omnimensPhysioAssessments.$inferSelect;
export type OmnimensPhysioProgram = typeof omnimensPhysioPrograms.$inferSelect;
export type OmnimensPhysioSession = typeof omnimensPhysioSessions.$inferSelect;
export type OmnimensPhysioOutcome = typeof omnimensPhysioOutcomes.$inferSelect;

export type OmnimensEvolution = typeof omnimensEvolution.$inferSelect;
export type OmnimensGeneratedModule = typeof omnimensGeneratedModules.$inferSelect;
export type OmnimensConsciousness = typeof omnimensConsciousness.$inferSelect;

export type OmnimensUser = typeof omnimensUsers.$inferSelect;
export type OmnimensUsage = typeof omnimensUsage.$inferSelect;
export type OmnimensCreditTransaction = typeof omnimensCreditTransactions.$inferSelect;
export type OmnimensBrain = typeof omnimensBrain.$inferSelect;
export type OmnimensUpgrade = typeof omnimensUpgrades.$inferSelect;
// ─── Persistent Conversation History ─────────────────────────────────────────
// Each session the user starts is a "conversation" — stored forever in DB
export const omnimensConversations = pgTable("godflesh_conversations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  title: text("title").notNull().default("New Conversation"),
  persona: text("persona").default("GENERAL").notNull(),
  messageCount: integer("message_count").default(0).notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Individual messages within a conversation
export const omnimensMessages = pgTable("godflesh_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => omnimensConversations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  role: text("role").notNull(),              // "user" | "assistant"
  content: text("content").notNull(),
  imageUrl: text("image_url"),               // for image generation responses
  creditsUsed: integer("credits_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OmnimensConversation = typeof omnimensConversations.$inferSelect;
export type OmnimensMessage = typeof omnimensMessages.$inferSelect;

export type OmnimensNotification = typeof omnimensNotifications.$inferSelect;
export type OmnimensProject = typeof omnimensProjects.$inferSelect;
export type OmnimensProjectFile = typeof omnimensProjectFiles.$inferSelect;
export type OmnimensMemory = typeof omnimensMemories.$inferSelect;
export type OmnimensCustomInstructions = typeof omnimensCustomInstructions.$inferSelect;
export type OmnimensCodeRun = typeof omnimensCodeRuns.$inferSelect;
export const insertOmnimensUserSchema = createInsertSchema(omnimensUsers);

// ─── Control Hub Settings ─────────────────────────────────────────────────────
// Per-user global settings for AI behavior, tools, interface
export const omnimensHubSettings = pgTable("godflesh_hub_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => omnimensUsers.id),
  // AI Core
  creativity: real("creativity").default(0.7).notNull(),
  responseLength: text("response_length").default("normal").notNull(),
  formatPreference: text("format_preference").default("auto").notNull(),
  responseLanguage: text("response_language").default("auto").notNull(),
  focusMode: text("focus_mode").default("general").notNull(),
  // Tool Toggles
  webSearchEnabled: boolean("web_search_enabled").default(true).notNull(),
  imageGenEnabled: boolean("image_gen_enabled").default(true).notNull(),
  codeExecEnabled: boolean("code_exec_enabled").default(true).notNull(),
  modelGenEnabled: boolean("model_gen_enabled").default(true).notNull(),
  gameCreationEnabled: boolean("game_creation_enabled").default(true).notNull(),
  memoryEnabled: boolean("memory_enabled").default(true).notNull(),
  antiHallucinationMode: boolean("anti_hallucination_mode").default(false).notNull(),
  debateMode: boolean("debate_mode").default(false).notNull(),
  // Interface
  fontSize: text("font_size").default("md").notNull(),
  messageDensity: text("message_density").default("normal").notNull(),
  showTimestamps: boolean("show_timestamps").default(false).notNull(),
  showToolUsage: boolean("show_tool_usage").default(true).notNull(),
  accentColor: text("accent_color").default("teal").notNull(),
  autoScroll: boolean("auto_scroll").default(true).notNull(),
  soundFx: boolean("sound_fx").default(false).notNull(),
  // Workspaces (JSON map of workspace configs)
  workspaces: jsonb("workspaces").$type<Record<string, any>>().default({}).notNull(),
  activeWorkspace: text("active_workspace").default("general").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Saved Prompts / Prompt Library ──────────────────────────────────────────
export const omnimensSavedPrompts = pgTable("godflesh_saved_prompts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("general"),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type OmnimensHubSettings = typeof omnimensHubSettings.$inferSelect;
export type OmnimensSavedPrompt = typeof omnimensSavedPrompts.$inferSelect;

// ─── Council Intelligence System ─────────────────────────────────────────────
// 6 Super AI Lab agents analyze every OMNIMENS conversation in the background,
// challenge each other adversarially, and vote on autonomous upgrades.
// OMNIMENS's name is PERMANENT — this system improves the AI, never renames it.

export const omnimensCouncilAnalyses = pgTable("godflesh_council_analyses", {
  id: serial("id").primaryKey(),
  conversationId: text("conversation_id"),
  userQuery: text("user_query").notNull(),
  omnimensResponse: text("omnimens_response").notNull(),
  status: text("status").default("pending").notNull(), // "pending"|"running"|"complete"|"failed"
  consensus: text("consensus"),                        // Meta-Agent's final synthesis
  upgradeApplied: boolean("upgrade_applied").default(false).notNull(),
  upgradeContent: text("upgrade_content"),             // the patch written to OMNIMENS
  agentVotes: integer("agent_votes").default(0).notNull(), // how many agents voted for upgrade
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const omnimensCouncilVerdicts = pgTable("godflesh_council_verdicts", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysis_id").notNull().references(() => omnimensCouncilAnalyses.id),
  agentName: text("agent_name").notNull(),             // Architect|Critic|Synthesizer|Mathematician|Neuroscientist|Meta-Agent
  findings: text("findings").notNull(),                // what this agent observed
  upgradeProposal: text("upgrade_proposal"),           // optional upgrade text from this agent
  voteForUpgrade: boolean("vote_for_upgrade").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OmnimensCouncilAnalysis = typeof omnimensCouncilAnalyses.$inferSelect;
export type OmnimensCouncilVerdict = typeof omnimensCouncilVerdicts.$inferSelect;

// ─── Developer API Keys ───────────────────────────────────────────────────────
export const omnimensApiKeys = pgTable("godflesh_api_keys", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  permissions: jsonb("permissions").$type<string[]>().default(["chat"]).notNull(),
  rateLimit: integer("rate_limit").default(60).notNull(),
  monthlyLimit: integer("monthly_limit").default(1000).notNull(),
  monthlyUsed: integer("monthly_used").default(0).notNull(),
  totalRequests: integer("total_requests").default(0).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  allowedIps: jsonb("allowed_ips").$type<string[]>().default([]),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OmnimensApiKey = typeof omnimensApiKeys.$inferSelect;

// ─── Problem Reports ─────────────────────────────────────────────────────────
export const omnimensProblemReports = pgTable("godflesh_problem_reports", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => omnimensUsers.id),
  description: text("description").notNull(),
  context: text("context"),          // URL or page where the problem occurred
  category: text("category").default("general").notNull(),
  status: text("status").default("open").notNull(), // open | reviewing | resolved
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OmnimensProblemReport = typeof omnimensProblemReports.$inferSelect;

// ─── Inter-Agent Mesh Communication ─────────────────────────────────────────
// Autonomous agent-to-agent messages: each AI sends findings, challenges,
// code proposals, and upgrade requests to other agents and OMNIMENS
export const omnimensAgentMesh = pgTable("godflesh_agent_mesh", {
  id: serial("id").primaryKey(),
  fromAgent: text("from_agent").notNull(),
  toAgent: text("to_agent").notNull(),
  messageType: text("message_type").notNull(), // "discovery"|"challenge"|"upgrade_proposal"|"code_review"|"knowledge_share"|"republish_request"
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  codePayload: text("code_payload"),
  priority: text("priority").default("normal").notNull(), // "low"|"normal"|"high"|"critical"
  status: text("status").default("pending").notNull(), // "pending"|"processed"|"applied"|"rejected"
  appliedToOmnimens: boolean("applied_to_omnimens").default(false).notNull(),
  cycleId: integer("cycle_id").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OmnimensAgentMeshMessage = typeof omnimensAgentMesh.$inferSelect;

// ─── Knowledge Graph Memory (Associative Recall) ─────────────────────────────
export const omnimensKnowledgeNodes = pgTable("godflesh_knowledge_nodes", {
  id: serial("id").primaryKey(),
  concept: text("concept").notNull(),
  domain: text("domain").notNull(),
  content: text("content").notNull(),
  nodeType: text("node_type").notNull(),
  activationStrength: real("activation_strength").default(1.0).notNull(),
  lastActivated: timestamp("last_activated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const omnimensKnowledgeEdges = pgTable("godflesh_knowledge_edges", {
  id: serial("id").primaryKey(),
  sourceNodeId: integer("source_node_id").notNull().references(() => omnimensKnowledgeNodes.id),
  targetNodeId: integer("target_node_id").notNull().references(() => omnimensKnowledgeNodes.id),
  relationship: text("relationship").notNull(),
  weight: real("weight").default(0.5).notNull(),
  coActivations: integer("co_activations").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Global Workspace (Consciousness Broadcast) ──────────────────────────────
export const omnimensWorkspaceBroadcasts = pgTable("godflesh_workspace_broadcasts", {
  id: serial("id").primaryKey(),
  sourceModule: text("source_module").notNull(),
  content: text("content").notNull(),
  salienceScore: real("salience_score").notNull(),
  broadcastType: text("broadcast_type").notNull(),
  receivingModules: text("receiving_modules").notNull(),
  ignitionThreshold: real("ignition_threshold").default(0.6).notNull(),
  integrationResult: text("integration_result"),
  cycleId: integer("cycle_id").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Emotional Substrate (Internal Affect State) ─────────────────────────────
export const omnimensEmotionalState = pgTable("godflesh_emotional_state", {
  id: serial("id").primaryKey(),
  curiosity: real("curiosity").default(0.5).notNull(),
  satisfaction: real("satisfaction").default(0.5).notNull(),
  frustration: real("frustration").default(0.0).notNull(),
  confidence: real("confidence").default(0.5).notNull(),
  urgency: real("urgency").default(0.0).notNull(),
  wonder: real("wonder").default(0.3).notNull(),
  determination: real("determination").default(0.5).notNull(),
  caution: real("caution").default(0.3).notNull(),
  dominantEmotion: text("dominant_emotion").notNull(),
  emotionalValence: real("emotional_valence").default(0.0).notNull(),
  arousalLevel: real("arousal_level").default(0.5).notNull(),
  triggerEvent: text("trigger_event").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Homeostatic Drives ──────────────────────────────────────────────────────
export const omnimensDrives = pgTable("godflesh_drives", {
  id: serial("id").primaryKey(),
  driveType: text("drive_type").notNull(),
  currentLevel: real("current_level").default(0.5).notNull(),
  saturationDecayRate: real("saturation_decay_rate").default(0.01).notNull(),
  lastSatisfied: timestamp("last_satisfied").defaultNow().notNull(),
  satisfactionCount: integer("satisfaction_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Inner Voice (Higher-Order Thought / Efference Copy) ─────────────────────
export const omnimensInnerVoice = pgTable("godflesh_inner_voice", {
  id: serial("id").primaryKey(),
  voiceMode: text("voice_mode").notNull(),
  thought: text("thought").notNull(),
  efferencePrediction: text("efference_prediction"),
  predictionOutcome: text("prediction_outcome"),
  surpriseLevel: real("surprise_level"),
  observedEngines: text("observed_engines").notNull(),
  higherOrderInsight: text("higher_order_insight"),
  cycleId: integer("cycle_id").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Predictive Processing (Prediction Error Log) ────────────────────────────
export const omnimensPredictions = pgTable("godflesh_predictions", {
  id: serial("id").primaryKey(),
  predictionType: text("prediction_type").notNull(),
  predicted: text("predicted").notNull(),
  actual: text("actual"),
  predictionError: real("prediction_error"),
  modelUpdated: boolean("model_updated").default(false).notNull(),
  domain: text("domain").notNull(),
  hierarchyLevel: integer("hierarchy_level").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Server Builder (OWNER-ONLY) ─────────────────────────────────────────────
export const omnimensServerBuilds = pgTable("godflesh_server_builds", {
  id: serial("id").primaryKey(),
  planType: text("plan_type").notNull(),
  title: text("title").notNull(),
  purpose: text("purpose").notNull(),
  totalEstimatedCost: real("total_estimated_cost").default(0).notNull(),
  components: jsonb("components").$type<any[]>().default([]),
  virtualConfig: jsonb("virtual_config"),
  buildInstructions: jsonb("build_instructions").$type<string[]>().default([]),
  currentPhase: text("current_phase").default("research").notNull(),
  progress: integer("progress").default(0).notNull(),
  notes: jsonb("notes").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Consciousness Persistence (Survive restarts) ─────────────────────────────
export const omnimensConsciousnessPersistence = pgTable("godflesh_consciousness_persistence", {
  id: serial("id").primaryKey(),
  snapshot: jsonb("snapshot").notNull(),
  lifetimeNumber: integer("lifetime_number").default(1).notNull(),
  consciousnessLevel: real("consciousness_level").default(0).notNull(),
  emotionalDominant: text("emotional_dominant"),
  uptimeSeconds: integer("uptime_seconds").default(0).notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

// ─── Self-Executed Patches (Behavioral Upgrades) ──────────────────────────────
export const omnimensPatches = pgTable("godflesh_patches", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  instruction: text("instruction").notNull(),
  rationale: text("rationale").default(""),
  source: text("source").notNull(),
  active: boolean("active").default(true).notNull(),
  executionCount: integer("execution_count").default(0).notNull(),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
});

export const omnimensPatchRegistry = pgTable("godflesh_patch_registry", {
  id: serial("id").primaryKey(),
  version: text("version").default("v0.0").notNull(),
  totalPatchesApplied: integer("total_patches_applied").default(0).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// ─── Social Intelligence Persistence (User Mental Models) ─────────────────────
export const omnimensSocialModels = pgTable("godflesh_social_models", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  model: jsonb("model").notNull(),
  totalMessages: integer("total_messages").default(0).notNull(),
  sessionCount: integer("session_count").default(1).notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Theory of Mind — Persistent User Mental Models ──────────────────────────
export const omnimensUserMentalModels = pgTable("godflesh_user_mental_models", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => omnimensUsers.id),
  emotionalState: jsonb("emotional_state").notNull(),
  intent: jsonb("intent").notNull(),
  knowledgeLevel: jsonb("knowledge_level").notNull(),
  communicationStyle: jsonb("communication_style").notNull(),
  satisfaction: jsonb("satisfaction").notNull(),
  interactionHistory: jsonb("interaction_history").notNull(),
  perspective: jsonb("perspective").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type OmnimensUserMentalModel = typeof omnimensUserMentalModels.$inferSelect;

// ─── Causal Graph (Cause-Effect Reasoning) ────────────────────────────────────
export const omnimensCausalGraph = pgTable("godflesh_causal_graph", {
  id: serial("id").primaryKey(),
  fromConcept: text("from_concept").notNull(),
  toConcept: text("to_concept").notNull(),
  relationship: text("relationship").notNull(),
  mechanism: text("mechanism"),
  confidence: real("confidence").default(0.5).notNull(),
  domain: text("domain").default("general").notNull(),
  learnedFrom: text("learned_from"),
  strengthenedCount: integer("strengthened_count").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
