import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const superAISessions = pgTable("super_ai_sessions", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertSuperAISessionSchema = createInsertSchema(superAISessions).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type SuperAISession = typeof superAISessions.$inferSelect;
export type InsertSuperAISession = z.infer<typeof insertSuperAISessionSchema>;

export const superAIMessages = pgTable("super_ai_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => superAISessions.id, { onDelete: "cascade" }),
  agentName: text("agent_name").notNull(),
  content: text("content").notNull(),
  round: integer("round").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertSuperAIMessageSchema = createInsertSchema(superAIMessages).omit({
  id: true,
  createdAt: true,
});

export type SuperAIMessage = typeof superAIMessages.$inferSelect;
export type InsertSuperAIMessage = z.infer<typeof insertSuperAIMessageSchema>;

export const superAIBlueprints = pgTable("super_ai_blueprints", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => superAISessions.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertSuperAIBlueprintSchema = createInsertSchema(superAIBlueprints).omit({
  id: true,
  createdAt: true,
});

export type SuperAIBlueprint = typeof superAIBlueprints.$inferSelect;
export type InsertSuperAIBlueprint = z.infer<typeof insertSuperAIBlueprintSchema>;
