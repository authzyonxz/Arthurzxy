import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  bigint,
} from "drizzle-orm/mysql-core";

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

// Revendedores (gerenciados pelo admin)
export const resellers = mysqlTable("resellers", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  credits: int("credits").default(0).notNull(),
  status: mysqlEnum("status", ["active", "paused"]).default("active").notNull(),
  totalKeysGenerated: int("totalKeysGenerated").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reseller = typeof resellers.$inferSelect;
export type InsertReseller = typeof resellers.$inferInsert;

// Estoque de keys por tipo
export const keyStock = mysqlTable("key_stock", {
  id: int("id").autoincrement().primaryKey(),
  keyValue: varchar("keyValue", { length: 128 }).notNull().unique(),
  keyType: mysqlEnum("keyType", ["1h", "1d", "7d", "30d", "999d"]).notNull(),
  isUsed: int("isUsed").default(0).notNull(), // 0 = available, 1 = used
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type KeyStock = typeof keyStock.$inferSelect;
export type InsertKeyStock = typeof keyStock.$inferInsert;

// Histórico de keys geradas pelos revendedores
export const generatedKeys = mysqlTable("generated_keys", {
  id: int("id").autoincrement().primaryKey(),
  resellerId: int("resellerId").notNull(),
  keyValue: varchar("keyValue", { length: 128 }).notNull(),
  keyType: mysqlEnum("keyType", ["1h", "1d", "7d", "30d", "999d"]).notNull(),
  creditsUsed: int("creditsUsed").default(1).notNull(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export type GeneratedKey = typeof generatedKeys.$inferSelect;
export type InsertGeneratedKey = typeof generatedKeys.$inferInsert;

// Sessões customizadas (login próprio sem OAuth)
export const customSessions = mysqlTable("custom_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().unique(),
  role: mysqlEnum("role", ["admin", "reseller"]).notNull(),
  resellerId: int("resellerId"), // null se for admin
  expiresAt: bigint("expiresAt", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomSession = typeof customSessions.$inferSelect;
