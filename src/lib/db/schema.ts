import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "pro", "team"]);
export const docTypeEnum = pgEnum("doc_type", [
  "lp",
  "sales_letter",
  "website",
  "email",
  "other",
]);
export const blockTypeEnum = pgEnum("block_type", [
  "hero",
  "headline",
  "body",
  "cta",
  "testimonial",
  "faq",
  "feature",
  "price",
  "footer",
  "image",
  "video",
]);
export const memberRoleEnum = pgEnum("member_role", [
  "viewer",
  "editor",
  "admin",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: timestamp("emailVerified", { withTimezone: true }),
  name: varchar("name", { length: 100 }),
  image: text("image"),
  avatar_url: text("avatar_url"),
  plan: planEnum("plan").notNull().default("free"),
  ai_credits_used: integer("ai_credits_used").notNull().default(0),
  ai_credits_reset_at: timestamp("ai_credits_reset_at", {
    withTimezone: true,
  }),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  owner_id: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  thumbnail_url: text("thumbnail_url"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  doc_type: docTypeEnum("doc_type").notNull().default("lp"),
  product_context: jsonb("product_context").notNull().default({}),
  theme: jsonb("theme").notNull().default({}),
  custom_html: text("custom_html"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const blocks = pgTable("blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  document_id: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  block_type: blockTypeEnum("block_type").notNull(),
  order_index: integer("order_index").notNull(),
  content: jsonb("content").notNull().default({}),
  is_ai_generated: boolean("is_ai_generated").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const document_versions = pgTable("document_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  document_id: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  snapshot: jsonb("snapshot").notNull(),
  label: varchar("label", { length: 100 }),
  created_by: uuid("created_by").references(() => users.id),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const project_members = pgTable("project_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: memberRoleEnum("role").notNull().default("editor"),
  invited_at: timestamp("invited_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Auth.js required tables
export const accounts = pgTable("accounts", {
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});
