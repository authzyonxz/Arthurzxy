import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  createReseller,
  getResellerByUsername,
  getAllResellers,
  updateResellerStatus,
  deleteReseller,
  addCreditsToReseller,
  getResellerById,
  addKeysToStock,
  getStockCountByType,
  clearStockByType,
  getRecentStockKeys,
  takeKeyFromStock,
  recordGeneratedKey,
  getGeneratedKeysByReseller,
  getAllGeneratedKeys,
  getTotalGeneratedKeys,
  getRanking,
  createCustomSession,
  getCustomSession,
  deleteCustomSession,
} from "./db";

const ADMIN_USERNAME = "Arthur";
const ADMIN_PASSWORD = "arthurzxy12";
const CUSTOM_SESSION_COOKIE = "auth_session";

// Middleware to get custom session from cookie
async function getSessionFromCtx(ctx: { req: { headers: Record<string, string | string[] | undefined> }; res: { clearCookie: (name: string, opts?: object) => void } }) {
  const cookieHeader = ctx.req.headers["cookie"] as string | undefined;
  if (!cookieHeader) return null;
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((c) => {
    const [k, ...v] = c.trim().split("=");
    if (k) cookies[k.trim()] = decodeURIComponent(v.join("="));
  });
  const token = cookies[CUSTOM_SESSION_COOKIE];
  if (!token) return null;
  return getCustomSession(token);
}

// Protected procedure for admin
const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = await getSessionFromCtx(ctx);
  if (!session || session.role !== "admin") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Acesso negado. Faça login como administrador." });
  }
  return next({ ctx: { ...ctx, session } });
});

// Protected procedure for reseller
const resellerProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = await getSessionFromCtx(ctx);
  if (!session || session.role !== "reseller" || !session.resellerId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Acesso negado. Faça login como revendedor." });
  }
  const reseller = await getResellerById(session.resellerId);
  if (!reseller) throw new TRPCError({ code: "UNAUTHORIZED", message: "Revendedor não encontrado." });
  if (reseller.status === "paused") throw new TRPCError({ code: "FORBIDDEN", message: "Sua conta está pausada. Contate o administrador." });
  return next({ ctx: { ...ctx, session, reseller } });
});

// Procedure accessible by both admin and reseller
const anyAuthProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = await getSessionFromCtx(ctx);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Faça login para continuar." });
  return next({ ctx: { ...ctx, session } });
});

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ────────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // Admin login
        if (input.username === ADMIN_USERNAME && input.password === ADMIN_PASSWORD) {
          const token = nanoid(64);
          await createCustomSession(token, "admin");
          ctx.res.cookie(CUSTOM_SESSION_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: "/",
          });
          return { role: "admin" as const, username: ADMIN_USERNAME };
        }
        // Reseller login
        const reseller = await getResellerByUsername(input.username);
        if (!reseller) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha incorretos." });
        const valid = await bcrypt.compare(input.password, reseller.passwordHash);
        if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha incorretos." });
        if (reseller.status === "paused") throw new TRPCError({ code: "FORBIDDEN", message: "Sua conta está pausada. Contate o administrador." });
        const token = nanoid(64);
        await createCustomSession(token, "reseller", reseller.id);
        ctx.res.cookie(CUSTOM_SESSION_COOKIE, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 1000 * 60 * 60 * 24 * 7,
          path: "/",
        });
        return { role: "reseller" as const, username: reseller.username, resellerId: reseller.id };
      }),

    customLogout: publicProcedure.mutation(async ({ ctx }) => {
      const cookieHeader = ctx.req.headers["cookie"] as string | undefined;
      if (cookieHeader) {
        const cookies: Record<string, string> = {};
        cookieHeader.split(";").forEach((c) => {
          const [k, ...v] = c.trim().split("=");
          if (k) cookies[k.trim()] = decodeURIComponent(v.join("="));
        });
        const token = cookies[CUSTOM_SESSION_COOKIE];
        if (token) await deleteCustomSession(token);
      }
      ctx.res.clearCookie(CUSTOM_SESSION_COOKIE, { path: "/" });
      return { success: true };
    }),

    session: publicProcedure.query(async ({ ctx }) => {
      const session = await getSessionFromCtx(ctx);
      if (!session) return null;
      if (session.role === "admin") return { role: "admin" as const, username: ADMIN_USERNAME };
      if (session.resellerId) {
        const reseller = await getResellerById(session.resellerId);
        if (!reseller) return null;
        return { role: "reseller" as const, username: reseller.username, resellerId: reseller.id, credits: reseller.credits, status: reseller.status };
      }
      return null;
    }),
  }),

  // ─── Admin ───────────────────────────────────────────────────────────────────
  admin: router({
    dashboard: adminProcedure.query(async () => {
      const [allResellers, stockCounts, totalGenerated, ranking] = await Promise.all([
        getAllResellers(),
        getStockCountByType(),
        getTotalGeneratedKeys(),
        getRanking(),
      ]);
      const totalStock = Object.values(stockCounts).reduce((a, b) => a + b, 0);
      return {
        totalResellers: allResellers.length,
        totalStock,
        totalGenerated,
        stockByType: stockCounts,
        topResellers: ranking.slice(0, 5),
      };
    }),

    // Resellers management
    listResellers: adminProcedure.query(async () => getAllResellers()),

    createReseller: adminProcedure
      .input(z.object({ username: z.string().min(3).max(32), password: z.string().min(4), credits: z.number().int().min(0).default(0) }))
      .mutation(async ({ input }) => {
        const existing = await getResellerByUsername(input.username);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Nome de usuário já existe." });
        const hash = await bcrypt.hash(input.password, 10);
        await createReseller(input.username, hash, input.credits);
        return { success: true };
      }),

    pauseReseller: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["active", "paused"]) }))
      .mutation(async ({ input }) => {
        await updateResellerStatus(input.id, input.status);
        return { success: true };
      }),

    deleteReseller: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteReseller(input.id);
        return { success: true };
      }),

    addCredits: adminProcedure
      .input(z.object({ id: z.number(), amount: z.number().int().min(1) }))
      .mutation(async ({ input }) => {
        await addCreditsToReseller(input.id, input.amount);
        return { success: true };
      }),

    // Stock management
    addStock: adminProcedure
      .input(z.object({
        keyType: z.enum(["1h", "1d", "7d", "30d", "999d"]),
        keys: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const keyList = input.keys.split(/[\n,]+/).map(k => k.trim()).filter(k => k.length > 0);
        if (keyList.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Nenhuma key válida fornecida." });
        await addKeysToStock(keyList.map(k => ({ keyValue: k, keyType: input.keyType })));
        return { success: true, count: keyList.length };
      }),

    getStock: adminProcedure.query(async () => {
      const [counts, recent] = await Promise.all([getStockCountByType(), getRecentStockKeys(30)]);
      return { counts, recent };
    }),

    clearStock: adminProcedure
      .input(z.object({ keyType: z.enum(["1h", "1d", "7d", "30d", "999d"]) }))
      .mutation(async ({ input }) => {
        await clearStockByType(input.keyType);
        return { success: true };
      }),

    // History
    allGeneratedKeys: adminProcedure.query(async () => getAllGeneratedKeys()),

    // Ranking
    ranking: adminProcedure.query(async () => getRanking()),
  }),

  // ─── Reseller ────────────────────────────────────────────────────────────────
  reseller: router({
    me: resellerProcedure.query(async ({ ctx }) => ctx.reseller),

    generateKey: resellerProcedure
      .input(z.object({ keyType: z.enum(["1h", "1d", "7d", "30d", "999d"]) }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.reseller.credits < 1) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Créditos insuficientes para gerar uma key." });
        }
        const keyValue = await takeKeyFromStock(input.keyType);
        if (!keyValue) {
          throw new TRPCError({ code: "NOT_FOUND", message: `Sem keys disponíveis no estoque para o tipo ${input.keyType}.` });
        }
        await recordGeneratedKey(ctx.reseller.id, keyValue, input.keyType);
        return { success: true, keyValue, keyType: input.keyType };
      }),

    myKeys: resellerProcedure.query(async ({ ctx }) => getGeneratedKeysByReseller(ctx.reseller.id)),

    generateMultipleKeys: resellerProcedure
      .input(z.object({ keyType: z.enum(["1h", "1d", "7d", "30d", "999d"]), quantity: z.number().int().min(1).max(50) }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.reseller.credits < input.quantity) {
          throw new TRPCError({ code: "FORBIDDEN", message: `Créditos insuficientes. Você tem ${ctx.reseller.credits} créditos, mas precisa de ${input.quantity}.` });
        }
        const keys: string[] = [];
        for (let i = 0; i < input.quantity; i++) {
          const keyValue = await takeKeyFromStock(input.keyType);
          if (!keyValue) {
            throw new TRPCError({ code: "NOT_FOUND", message: `Sem keys disponíveis no estoque para o tipo ${input.keyType}. Apenas ${i} keys foram geradas.` });
          }
          keys.push(keyValue);
          await recordGeneratedKey(ctx.reseller.id, keyValue, input.keyType);
        }
        return { success: true, keys, keyType: input.keyType, quantity: input.quantity };
      }),

    getStockAvailable: resellerProcedure.query(async () => getStockCountByType()),
  }),
});

export type AppRouter = typeof appRouter;
