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

export type OmnimensEvolution = typeof omnimensEvolution.$inferSelect;
export type OmnimensGeneratedModule = typeof omnimensGeneratedModules.$inferSelect;
export type OmnimensConsciousness = typeof omnimensConsciousness.$inferSelect;

export type OmnimensUser = typeof omnimensUsers.$inferSelect;
export type OmnimensUsage = typeof omnimensUsage.$inferSelect;
export type OmnimensCreditTransaction = typeof omnimensCreditTransactions.$inferSelect;
export type OmnimensBrain = typeof omnimensBrain.$inferSelect;
export type OmnimensUpgrade = typeof omnimensUpgrades.$inferSelect;
export type OmnimensNotification = typeof omnimensNotifications.$inferSelect;
export type OmnimensProject = typeof omnimensProjects.$inferSelect;
export type OmnimensProjectFile = typeof omnimensProjectFiles.$inferSelect;
export type OmnimensMemory = typeof omnimensMemories.$inferSelect;
export type OmnimensCustomInstructions = typeof omnimensCustomInstructions.$inferSelect;
export type OmnimensCodeRun = typeof omnimensCodeRuns.$inferSelect;
export const insertOmnimensUserSchema = createInsertSchema(omnimensUsers);
