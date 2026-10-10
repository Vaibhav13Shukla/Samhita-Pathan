import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const languageEnum = pgEnum("language", ["en", "hi", "mr"]);
export const planEnum = pgEnum("plan", ["free", "premium", "institutional"]);
export const audioTypeEnum = pgEnum("audio_type", ["reference", "user"]);
export const qcStatusEnum = pgEnum("qc_status", ["pending", "approved", "rejected"]);
export const attemptStatusEnum = pgEnum("attempt_status", ["processing", "completed", "failed"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  preferredLanguage: languageEnum("preferred_language").notNull().default("en"),
  plan: planEnum("plan").notNull().default("free"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("users_email_unique").on(table.email)]);

export const samhitas = pgTable("samhitas", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  titleSanskrit: text("title_sanskrit"),
  description: text("description"),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: uuid("id").defaultRandom().primaryKey(),
  samhitaId: uuid("samhita_id").notNull().references(() => samhitas.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  titleSanskrit: text("title_sanskrit"),
  sthana: text("sthana").notNull(),
  order: integer("order").notNull(),
  published: boolean("published").notNull().default(false),
}, (table) => [uniqueIndex("chapter_samhita_slug_unique").on(table.samhitaId, table.slug)]);

export const shlokas = pgTable("shlokas", {
  id: uuid("id").defaultRandom().primaryKey(),
  chapterId: uuid("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  stableKey: text("stable_key").notNull().unique(),
  reference: text("reference").notNull(),
  sanskritText: text("sanskrit_text").notNull(),
  padas: jsonb("padas").$type<string[]>().notNull(),
  transliteration: text("transliteration"),
  meter: text("meter"),
  sourceEdition: text("source_edition"),
  order: integer("order").notNull(),
  premium: boolean("premium").notNull().default(false),
  contentReviewed: boolean("content_reviewed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("shlokas_chapter_order_idx").on(table.chapterId, table.order)]);

export const audioAssets = pgTable("audio_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  shlokaId: uuid("shloka_id").notNull().references(() => shlokas.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  objectKey: text("object_key"),
  type: audioTypeEnum("type").notNull(),
  meter: text("meter"),
  durationSeconds: real("duration_seconds"),
  qcStatus: qcStatusEnum("qc_status").notNull().default("pending"),
  qcNotes: text("qc_notes"),
  generatedAt: timestamp("generated_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("audio_approved_reference_idx").on(table.shlokaId, table.type, table.qcStatus),
  index("audio_user_idx").on(table.userId),
  uniqueIndex("audio_object_key_unique").on(table.objectKey),
]);

export const recitationAttempts = pgTable("recitation_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  shlokaId: uuid("shloka_id").notNull().references(() => shlokas.id, { onDelete: "cascade" }),
  audioAssetId: uuid("audio_asset_id").references(() => audioAssets.id, { onDelete: "set null" }),
  status: attemptStatusEnum("status").notNull().default("processing"),
  score: integer("score"),
  feedbackJson: jsonb("feedback_json").$type<{ summary: string; strengths: string[]; improvements: string[] }>(),
  safeErrorCode: text("safe_error_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [index("attempt_owner_created_idx").on(table.userId, table.createdAt)]);

export const userProgress = pgTable("user_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  shlokaId: uuid("shloka_id").notNull().references(() => shlokas.id, { onDelete: "cascade" }),
  currentStep: integer("current_step").notNull().default(1),
  completedSteps: jsonb("completed_steps").$type<number[]>().notNull().default([]),
  quizScore: integer("quiz_score"),
  lastStudiedAt: timestamp("last_studied_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("progress_user_shloka_unique").on(table.userId, table.shlokaId)]);

export const aiContent = pgTable("ai_content", {
  id: uuid("id").defaultRandom().primaryKey(),
  shlokaId: uuid("shloka_id").notNull().references(() => shlokas.id, { onDelete: "cascade" }),
  capability: text("capability").notNull(),
  language: languageEnum("language").notNull(),
  promptVersion: text("prompt_version").notNull(),
  payload: jsonb("payload").notNull(),
  model: text("model").notNull(),
  reviewed: boolean("reviewed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("ai_content_cache_unique").on(table.shlokaId, table.capability, table.language, table.promptVersion)]);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
