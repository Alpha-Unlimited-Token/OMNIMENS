/**
 * ============================================================
 * OMNIMENS Custom Email/Password Authentication
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *
 * Provides a fully branded login/register flow that never exposes
 * any third-party OAuth branding to end users.
 * ============================================================
 */
import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createSession, clearSession, SESSION_COOKIE, SESSION_TTL } from "../lib/auth.js";

const router = Router();

const BCRYPT_ROUNDS = 12;

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

// ── POST /api/auth/email/register ─────────────────────────────────────────────
router.post("/auth/email/register", async (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = req.body as {
      email: string;
      password: string;
      displayName?: string;
    };

    if (!email || !validateEmail(email)) {
      res.status(400).json({ error: "A valid email address is required." });
      return;
    }

    const pwError = validatePassword(password || "");
    if (pwError) {
      res.status(400).json({ error: pwError });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail));

    if (existing) {
      res.status(409).json({ error: "An account with this email already exists. Sign in instead." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const firstName = displayName?.trim().split(" ")[0] || normalizedEmail.split("@")[0];
    const lastName = displayName?.trim().split(" ").slice(1).join(" ") || null;

    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: normalizedEmail,
        passwordHash,
        firstName,
        lastName: lastName || undefined,
      })
      .returning();

    const sid = await createSession({
      user: {
        id: newUser.id,
        email: newUser.email || normalizedEmail,
        username: firstName,
        firstName: newUser.firstName || firstName,
        lastName: newUser.lastName || null,
        profileImageUrl: null,
        roles: [],
      },
      access_token: "",
    });

    setSessionCookie(res, sid);
    res.status(201).json({
      ok: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: firstName,
      },
    });
  } catch (err) {
    console.error("[OMNIMENS AUTH] Registration error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ── POST /api/auth/email/login ─────────────────────────────────────────────────
router.post("/auth/email/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail));

    if (!user || !user.passwordHash) {
      // Use a constant-time response to prevent user enumeration
      await bcrypt.hash("dummy_prevent_timing_attack", BCRYPT_ROUNDS);
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const sid = await createSession({
      user: {
        id: user.id,
        email: user.email || normalizedEmail,
        username: user.firstName || normalizedEmail.split("@")[0],
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        profileImageUrl: user.profileImageUrl || null,
        roles: [],
      },
      access_token: "",
    });

    setSessionCookie(res, sid);
    res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.firstName || normalizedEmail.split("@")[0],
      },
    });
  } catch (err) {
    console.error("[OMNIMENS AUTH] Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ── POST /api/auth/email/logout ────────────────────────────────────────────────
router.post("/auth/email/logout", async (req: Request, res: Response) => {
  try {
    const sid = req.cookies?.[SESSION_COOKIE];
    await clearSession(res, sid);
    res.json({ ok: true });
  } catch (err) {
    console.error("[OMNIMENS AUTH] Logout error:", err);
    res.status(500).json({ error: "Logout failed." });
  }
});

export default router;
