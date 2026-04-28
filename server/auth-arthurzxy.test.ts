import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  createReseller: vi.fn(),
  getResellerByUsername: vi.fn().mockResolvedValue(undefined),
  getAllResellers: vi.fn().mockResolvedValue([]),
  updateResellerStatus: vi.fn(),
  deleteReseller: vi.fn(),
  addCreditsToReseller: vi.fn(),
  getResellerById: vi.fn(),
  addKeysToStock: vi.fn(),
  getStockCountByType: vi.fn().mockResolvedValue({ "1h": 0, "1d": 0, "7d": 0, "30d": 0, "999d": 0 }),
  clearStockByType: vi.fn(),
  getRecentStockKeys: vi.fn().mockResolvedValue([]),
  takeKeyFromStock: vi.fn().mockResolvedValue(null),
  recordGeneratedKey: vi.fn(),
  getGeneratedKeysByReseller: vi.fn().mockResolvedValue([]),
  getAllGeneratedKeys: vi.fn().mockResolvedValue([]),
  getTotalGeneratedKeys: vi.fn().mockResolvedValue(0),
  getRanking: vi.fn().mockResolvedValue([]),
  createCustomSession: vi.fn(),
  getCustomSession: vi.fn().mockResolvedValue(null),
  deleteCustomSession: vi.fn(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function createCtx(cookieHeader?: string): TrpcContext {
  const clearedCookies: string[] = [];
  const setCookies: { name: string; value: string }[] = [];
  return {
    user: null,
    req: {
      protocol: "https",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string) => clearedCookies.push(name),
      cookie: (name: string, value: string) => setCookies.push({ name, value }),
    } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("auth.login", () => {
  it("rejects unknown user", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.auth.login({ username: "unknown", password: "wrong" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects wrong admin password", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.auth.login({ username: "Arthur", password: "wrongpassword" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("accepts correct admin credentials", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.auth.login({ username: "Arthur", password: "arthurzxy12" });
    expect(result.role).toBe("admin");
    expect(result.username).toBe("Arthur");
  });
});

describe("auth.session", () => {
  it("returns null when no session cookie", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.auth.session();
    expect(result).toBeNull();
  });

  it("returns null when session token not found in DB", async () => {
    const caller = appRouter.createCaller(createCtx("auth_session=invalid-token"));
    const result = await caller.auth.session();
    expect(result).toBeNull();
  });
});

describe("auth.customLogout", () => {
  it("clears the session cookie", async () => {
    const ctx = createCtx("auth_session=some-token");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.customLogout();
    expect(result.success).toBe(true);
  });
});

describe("admin procedures - unauthorized without session", () => {
  it("dashboard throws UNAUTHORIZED", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(caller.admin.dashboard()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("listResellers throws UNAUTHORIZED", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(caller.admin.listResellers()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("addStock throws UNAUTHORIZED", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.admin.addStock({ keyType: "1d", keys: "KEY-TEST-001" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("reseller procedures - unauthorized without session", () => {
  it("me throws UNAUTHORIZED", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(caller.reseller.me()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("generateKey throws UNAUTHORIZED", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.reseller.generateKey({ keyType: "1d" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("myKeys throws UNAUTHORIZED", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(caller.reseller.myKeys()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
