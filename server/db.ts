import { eq, and, sql, desc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, resellers, keyStock, generatedKeys, customSessions } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Resellers ────────────────────────────────────────────────────────────────

export async function createReseller(username: string, passwordHash: string, credits: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(resellers).values({ username, passwordHash, credits, status: "active", totalKeysGenerated: 0 });
}

export async function getResellerByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(resellers).where(eq(resellers.username, username)).limit(1);
  return result[0] ?? undefined;
}

export async function getAllResellers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resellers).orderBy(desc(resellers.createdAt));
}

export async function updateResellerStatus(id: number, status: "active" | "paused") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(resellers).set({ status }).where(eq(resellers.id, id));
}

export async function deleteReseller(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(resellers).where(eq(resellers.id, id));
}

export async function addCreditsToReseller(id: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(resellers).set({ credits: sql`${resellers.credits} + ${amount}` }).where(eq(resellers.id, id));
}

export async function getResellerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(resellers).where(eq(resellers.id, id)).limit(1);
  return result[0] ?? undefined;
}

// ─── Key Stock ────────────────────────────────────────────────────────────────

export async function addKeysToStock(keys: { keyValue: string; keyType: "1h" | "1d" | "7d" | "30d" | "999d" }[]) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (keys.length === 0) return;
  await db.insert(keyStock).values(keys.map(k => ({ keyValue: k.keyValue, keyType: k.keyType, isUsed: 0 }))).onDuplicateKeyUpdate({ set: { keyType: sql`keyType` } });
}

export async function getStockCountByType() {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select({ keyType: keyStock.keyType, total: count() })
    .from(keyStock)
    .where(eq(keyStock.isUsed, 0))
    .groupBy(keyStock.keyType);
  const result: Record<string, number> = { "1h": 0, "1d": 0, "7d": 0, "30d": 0, "999d": 0 };
  for (const row of rows) result[row.keyType] = row.total;
  return result;
}

export async function clearStockByType(keyType: "1h" | "1d" | "7d" | "30d" | "999d") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(keyStock).where(and(eq(keyStock.keyType, keyType), eq(keyStock.isUsed, 0)));
}

export async function getRecentStockKeys(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(keyStock).orderBy(desc(keyStock.addedAt)).limit(limit);
}

export async function takeKeyFromStock(keyType: "1h" | "1d" | "7d" | "30d" | "999d") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const available = await db.select().from(keyStock)
    .where(and(eq(keyStock.keyType, keyType), eq(keyStock.isUsed, 0)))
    .limit(1);
  if (available.length === 0) return null;
  const key = available[0];
  await db.update(keyStock).set({ isUsed: 1 }).where(eq(keyStock.id, key.id));
  return key.keyValue;
}

// ─── Generated Keys ───────────────────────────────────────────────────────────

export async function recordGeneratedKey(resellerId: number, keyValue: string, keyType: "1h" | "1d" | "7d" | "30d" | "999d") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(generatedKeys).values({ resellerId, keyValue, keyType, creditsUsed: 1 });
  await db.update(resellers).set({
    credits: sql`${resellers.credits} - 1`,
    totalKeysGenerated: sql`${resellers.totalKeysGenerated} + 1`,
  }).where(eq(resellers.id, resellerId));
}

export async function getGeneratedKeysByReseller(resellerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(generatedKeys).where(eq(generatedKeys.resellerId, resellerId)).orderBy(desc(generatedKeys.generatedAt));
}

export async function getAllGeneratedKeys() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: generatedKeys.id,
    resellerId: generatedKeys.resellerId,
    resellerName: resellers.username,
    keyValue: generatedKeys.keyValue,
    keyType: generatedKeys.keyType,
    creditsUsed: generatedKeys.creditsUsed,
    generatedAt: generatedKeys.generatedAt,
  }).from(generatedKeys)
    .leftJoin(resellers, eq(generatedKeys.resellerId, resellers.id))
    .orderBy(desc(generatedKeys.generatedAt));
}

export async function getTotalGeneratedKeys() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ total: count() }).from(generatedKeys);
  return result[0]?.total ?? 0;
}

export async function getRanking() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: resellers.id,
    username: resellers.username,
    totalKeysGenerated: resellers.totalKeysGenerated,
    credits: resellers.credits,
  }).from(resellers).orderBy(desc(resellers.totalKeysGenerated)).limit(20);
}

// ─── Custom Sessions ──────────────────────────────────────────────────────────

export async function createCustomSession(sessionToken: string, role: "admin" | "reseller", resellerId?: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  // Ensure resellerId is explicitly null if not provided, avoiding empty string issues
  const rId = (resellerId === undefined || resellerId === null) ? null : resellerId;
  await db.insert(customSessions).values({ sessionToken, role, resellerId: rId, expiresAt });
}

export async function getCustomSession(sessionToken: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customSessions).where(eq(customSessions.sessionToken, sessionToken)).limit(1);
  const session = result[0];
  if (!session) return undefined;
  if (session.expiresAt < Date.now()) {
    await db.delete(customSessions).where(eq(customSessions.sessionToken, sessionToken));
    return undefined;
  }
  return session;
}

export async function deleteCustomSession(sessionToken: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(customSessions).where(eq(customSessions.sessionToken, sessionToken));
}
