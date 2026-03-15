import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const godfleshUsers = pgTable("godflesh_users", {
  id: text("id").primaryKey(),
  username: text("username"),
  email: text("email"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  isPro: boolean("is_pro").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const godfleshUsage = pgTable("godflesh_usage", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => godfleshUsers.id),
  date: text("date").notNull(),
  messageCount: integer("message_count").default(0).notNull(),
});

export type GodfleshUser = typeof godfleshUsers.$inferSelect;
export type GodfleshUsage = typeof godfleshUsage.$inferSelect;
export const insertGodfleshUserSchema = createInsertSchema(godfleshUsers);
