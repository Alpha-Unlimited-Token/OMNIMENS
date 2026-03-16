import { pgTable, serial, text, integer, timestamp, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// tier: "free" | "seeker" | "oracle" | "sovereign"
export const omnimensUsers = pgTable("godflesh_users", {
  id: text("id").primaryKey(),
  username: text("username"),
  email: text("email"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  isPro: boolean("is_pro").default(false).notNull(),
  tier: text("tier").default("free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const omnimensUsage = pgTable("godflesh_usage", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  date: text("date").notNull(),
  messageCount: integer("message_count").default(0).notNull(),
  computeSeconds: real("compute_seconds").default(0).notNull(),
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

// User projects — built by 6 AI agents
export const omnimensProjects = pgTable("godflesh_projects", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => omnimensUsers.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "webapp"|"website"|"game"|"api"|"dataviz"|"extension"|"tool"
  status: text("status").default("idle").notNull(), // "idle"|"building"|"ready"|"failed"
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

export type OmnimensUser = typeof omnimensUsers.$inferSelect;
export type OmnimensUsage = typeof omnimensUsage.$inferSelect;
export type OmnimensBrain = typeof omnimensBrain.$inferSelect;
export type OmnimensUpgrade = typeof omnimensUpgrades.$inferSelect;
export type OmnimensNotification = typeof omnimensNotifications.$inferSelect;
export type OmnimensProject = typeof omnimensProjects.$inferSelect;
export type OmnimensProjectFile = typeof omnimensProjectFiles.$inferSelect;
export const insertOmnimensUserSchema = createInsertSchema(omnimensUsers);
