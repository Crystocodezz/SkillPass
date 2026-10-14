import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import type { SkillPassState } from "../shared/skillpass";

/** Core user table backing the starter's existing Manus OAuth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Versioned demo aggregate. Its payload contains typed records with stable IDs and relationships;
 * this keeps the fictional evaluator workflow durable without representing it as a production
 * identity/credential system. A production launch should normalize these collections and add RLS.
 */
export const skillpassAppState = mysqlTable("skillpass_app_state", {
  id: varchar("id", { length: 32 }).primaryKey(),
  payload: json("payload").$type<SkillPassState>().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
