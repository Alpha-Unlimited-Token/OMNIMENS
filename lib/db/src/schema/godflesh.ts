import { pgTable, serial, text, integer, timestamp, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// tier: "free" | "seeker" | "oracle" | "sovereign"
export const godfleshUsers = pgTable("godflesh_users", {
  id: text("id").primaryKey(),
  username: text("username"),
  email: text("email"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  isPro: boolean("is_pro").default(false).notNull(),
  tier: text("tier").default("free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const godfleshUsage = pgTable("godflesh_usage", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => godfleshUsers.id),
  date: text("date").notNull(),
  messageCount: integer("message_count").default(0).notNull(),
  computeSeconds: real("compute_seconds").default(0).notNull(),
});

// Living brain — every insight GODFLESH learns is stored here and injected into future conversations
export const godfleshBrain = pgTable("godflesh_brain", {
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
export const godfleshUpgrades = pgTable("godflesh_upgrades", {
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
export const godfleshNotifications = pgTable("godflesh_notifications", {
  id: serial("id").primaryKey(),
  upgradeId: integer("upgrade_id").references(() => godfleshUpgrades.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("upgrade").notNull(), // "upgrade" | "capability" | "system"
  readByOwner: boolean("read_by_owner").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type GodfleshUser = typeof godfleshUsers.$inferSelect;
export type GodfleshUsage = typeof godfleshUsage.$inferSelect;
export type GodfleshBrain = typeof godfleshBrain.$inferSelect;
export type GodfleshUpgrade = typeof godfleshUpgrades.$inferSelect;
export type GodfleshNotification = typeof godfleshNotifications.$inferSelect;
export const insertGodfleshUserSchema = createInsertSchema(godfleshUsers);
