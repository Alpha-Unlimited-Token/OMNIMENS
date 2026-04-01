/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import * as oidc from "openid-client";
import crypto from "crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { GetCurrentAuthUserResponse } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import {
  clearSession,
  getOidcConfig,
  getSessionId,
  createSession,
  SESSION_COOKIE,
  SESSION_TTL,
  type SessionData,
} from "../lib/auth";
import { recordBruteForceAttempt } from "../middleware/security-enhanced.js";
import { extractIp, recordIp } from "../lib/omnimens-security-core.js";

const OIDC_TX_TTL = 10 * 60 * 1000;
const SESSION_EXCHANGE_TTL = 60_000;

const ALLOWED_CUSTOM_DOMAINS = new Set([
  "omnimens-ai.com",
  "www.omnimens-ai.com",
]);

interface OidcTransaction {
  codeVerifier: string;
  nonce: string;
  returnTo: string;
  originHost: string;
  expires: number;
}

const oidcTransactions = new Map<string, OidcTransaction>();
const sessionExchangeTokens = new Map<string, { sid: string; targetHost: string; expires: number }>();

function createExchangeToken(sid: string, targetHost: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  sessionExchangeTokens.set(token, { sid, targetHost, expires: Date.now() + SESSION_EXCHANGE_TTL });
  return token;
}

function consumeExchangeToken(token: string, requestHost: string): string | null {
  const entry = sessionExchangeTokens.get(token);
  if (!entry) return null;
  sessionExchangeTokens.delete(token);
  if (Date.now() > entry.expires) return null;
  if (entry.targetHost && !requestHost.endsWith(entry.targetHost)) return null;
  return entry.sid;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of sessionExchangeTokens) {
    if (now > v.expires) sessionExchangeTokens.delete(k);
  }
  for (const [k, v] of oidcTransactions) {
    if (now > v.expires) oidcTransactions.delete(k);
  }
}, 60_000);

const router: IRouter = Router();

function isReplitDomain(host: string): boolean {
  return (
    host.endsWith(".replit.dev") ||
    host.endsWith(".replit.app") ||
    host.endsWith(".repl.co") ||
    host === "localhost"
  );
}

function getFirstHost(raw: string): string {
  return raw.split(",")[0].trim();
}

function getReplitOrigin(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const rawHost = String(req.headers["x-forwarded-host"] || req.headers["host"] || "localhost");
  const host = getFirstHost(rawHost);

  if (isReplitDomain(host)) {
    return `${proto}://${host}`;
  }

  const replitDomain = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
  if (replitDomain) {
    const first = getFirstHost(replitDomain);
    return `https://${first}`;
  }

  return `${proto}://${host}`;
}

function getIncomingHost(req: Request): string {
  const rawHost = String(req.headers["x-forwarded-host"] || req.headers["host"] || "localhost");
  return getFirstHost(rawHost);
}

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

function getSafeReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/chat";
  }
  return value;
}

async function upsertUser(claims: Record<string, unknown>) {
  const userData = {
    id: claims.sub as string,
    email: (claims.email as string) || null,
    firstName: (claims.first_name as string) || null,
    lastName: (claims.last_name as string) || null,
    profileImageUrl: (claims.profile_image_url || claims.picture) as
      | string
      | null,
  };

  const [user] = await db
    .insert(usersTable)
    .values(userData)
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        ...userData,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}

router.get("/auth/user", (req: Request, res: Response) => {
  const isAuth = req.isAuthenticated();
  res.json(
    GetCurrentAuthUserResponse.parse({
      isAuthenticated: isAuth,
      user: isAuth ? {
        id: req.user!.id,
        username: req.user!.username || req.user!.firstName || req.user!.id,
        firstName: req.user!.firstName ?? undefined,
        lastName: req.user!.lastName ?? undefined,
        profileImageUrl: req.user!.profileImageUrl ?? undefined,
      } : undefined,
    }),
  );
});

router.get("/login", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const callbackUrl = `${getReplitOrigin(req)}/api/callback`;

  const returnTo = getSafeReturnTo(req.query.returnTo);

  const incomingHost = getIncomingHost(req);
  const originHost = !isReplitDomain(incomingHost) && ALLOWED_CUSTOM_DOMAINS.has(incomingHost)
    ? incomingHost
    : "";

  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

  const redirectTo = oidc.buildAuthorizationUrl(config, {
    redirect_uri: callbackUrl,
    scope: "openid email profile offline_access",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "login consent",
    state,
    nonce,
  });

  oidcTransactions.set(state, {
    codeVerifier,
    nonce,
    returnTo,
    originHost,
    expires: Date.now() + OIDC_TX_TTL,
  });

  res.redirect(redirectTo.href);
});

router.get("/callback", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const callbackUrl = `${getReplitOrigin(req)}/api/callback`;

  const stateParam = String(req.query.state || "");
  const tx = oidcTransactions.get(stateParam);

  if (!tx) {
    res.redirect("/api/login");
    return;
  }
  oidcTransactions.delete(stateParam);

  if (Date.now() > tx.expires) {
    res.redirect("/api/login");
    return;
  }

  const currentUrl = new URL(
    `${callbackUrl}?${new URL(req.url, `http://${req.headers.host}`).searchParams}`,
  );

  let tokens: oidc.TokenEndpointResponse & oidc.TokenEndpointResponseHelpers;
  try {
    tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: tx.codeVerifier,
      expectedNonce: tx.nonce,
      expectedState: stateParam,
      idTokenExpected: true,
    });
  } catch {
    const ip = (req.ip || req.socket?.remoteAddress || "unknown").replace(/^::ffff:/, "");
    recordBruteForceAttempt(ip);
    res.redirect("/api/login");
    return;
  }

  const claims = tokens.claims();
  if (!claims) {
    res.redirect("/api/login");
    return;
  }

  const dbUser = await upsertUser(
    claims as unknown as Record<string, unknown>,
  );

  const now = Math.floor(Date.now() / 1000);
  const username = (claims as Record<string, unknown>).preferred_username as string
    || (claims as Record<string, unknown>).nickname as string
    || dbUser.firstName
    || dbUser.id;
  const sessionData: SessionData = {
    user: {
      id: dbUser.id,
      username,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      profileImageUrl: dbUser.profileImageUrl,
    },
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : claims.exp,
  };

  const sid = await createSession(sessionData);

  const loginIp = extractIp(req);
  recordIp(dbUser.id, loginIp, "oidc_login", req.headers["user-agent"] as string).catch(() => {});

  if (tx.originHost) {
    const exchangeToken = createExchangeToken(sid, tx.originHost);
    const dest = `https://${tx.originHost}/api/exchange-session?token=${encodeURIComponent(exchangeToken)}&returnTo=${encodeURIComponent(tx.returnTo)}`;
    res.redirect(dest);
  } else {
    setSessionCookie(res, sid);
    res.redirect(tx.returnTo);
  }
});

router.get("/exchange-session", (req: Request, res: Response) => {
  const token = String(req.query.token || "");
  const returnTo = getSafeReturnTo(req.query.returnTo);
  const requestHost = getIncomingHost(req);

  const sid = consumeExchangeToken(token, requestHost);
  if (!sid) {
    res.redirect(`/api/login?returnTo=${encodeURIComponent(returnTo)}`);
    return;
  }

  setSessionCookie(res, sid);
  res.redirect(returnTo);
});

router.get("/logout", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const origin = getReplitOrigin(req);

  const sid = getSessionId(req);
  await clearSession(res, sid);

  const endSessionUrl = oidc.buildEndSessionUrl(config, {
    client_id: process.env.REPL_ID!,
    post_logout_redirect_uri: origin,
  });

  res.redirect(endSessionUrl.href);
});


export default router;
