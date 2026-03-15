import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const superAISessions = pgTable("super_ai_sessions", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  status: text("status").notNull().default("pending"),
  mode: text("mode").notNull().default("blueprint"),
  aiName: text("ai_name"),
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

export const superAICodeFiles = pgTable("super_ai_code_files", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => superAISessions.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  language: text("language").notNull().default("javascript"),
  content: text("content").notNull(),
  writtenBy: text("written_by").notNull(),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SuperAICodeFile = typeof superAICodeFiles.$inferSelect;

export const superAIExecutions = pgTable("super_ai_executions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => superAISessions.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  code: text("code").notNull(),
  output: text("output").notNull().default(""),
  errors: text("errors").notNull().default(""),
  success: boolean("success").notNull().default(false),
  executedAt: timestamp("executed_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SuperAIExecution = typeof superAIExecutions.$inferSelect;

// Global package registry — tracks every package ever installed across all lab sessions
// Persists independently so packages can be restored after server restarts
export const superAIPackages = pgTable("super_ai_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  version: text("version"),
  installedBy: text("installed_by"),
  installedAt: timestamp("installed_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SuperAIPackage = typeof superAIPackages.$inferSelect;

// Global lab files — the latest version of every file ever written, persisted independently
// This is the source of truth for the persistent lab workspace
export const superAILabFiles = pgTable("super_ai_lab_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull().unique(),
  language: text("language").notNull().default("javascript"),
  content: text("content").notNull(),
  writtenBy: text("written_by").notNull(),
  sessionId: integer("session_id").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SuperAILabFile = typeof superAILabFiles.$inferSelect;

// SSE event log — every event sent during a session is persisted here.
// This enables background execution: sessions keep running after the browser
// disconnects, and reconnecting clients replay everything they missed.
export const superAIEvents = pgTable("super_ai_events", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => superAISessions.id, { onDelete: "cascade" }),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SuperAIEvent = typeof superAIEvents.$inferSelect;
