/**
 * ============================================================
 * OMNIMENS — Google OAuth Sign-In Verification
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *
 * Receives a Google ID token from the frontend (issued via GIS popup),
 * verifies it using Google's public keys, then finds or creates the user
 * and issues an OMNIMENS session cookie — identical to email/password auth.
 * ============================================================
 */
import { Router, type Request, type Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createSession, SESSION_COOKIE, SESSION_TTL } from "../lib/auth.js";

const router = Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = CLIENT_ID ? new OAuth2Client(CLIENT_ID) : null;

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

// ── POST /api/auth/google/verify ──────────────────────────────────────────────
// The frontend sends the Google credential (ID token) here after the user
// completes the Google sign-in popup. We verify it, upsert the user, create session.
router.post("/auth/google/verify", async (req: Request, res: Response) => {
  if (!client || !CLIENT_ID) {
    res.status(503).json({ error: "Google sign-in is not configured." });
    return;
  }

  const { credential } = req.body as { credential?: string };
  if (!credential) {
    res.status(400).json({ error: "Missing Google credential token." });
    return;
  }

  try {
    // Verify the ID token against Google's public keys
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(401).json({ error: "Invalid Google token." });
      return;
    }

    const {
      email,
      given_name: firstName,
      family_name: lastName,
      picture: profileImageUrl,
      name: displayName,
    } = payload;

    const normalizedEmail = email.toLowerCase();

    // Find existing user or create new one
    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail));

    if (!user) {
      // New user — create account (no passwordHash since they use Google)
      const derivedFirst = firstName || displayName?.split(" ")[0] || normalizedEmail.split("@")[0];
      const derivedLast = lastName || displayName?.split(" ").slice(1).join(" ") || null;

      const [created] = await db
        .insert(usersTable)
        .values({
          email: normalizedEmail,
          firstName: derivedFirst,
          lastName: derivedLast ?? undefined,
          profileImageUrl: profileImageUrl ?? undefined,
        })
        .returning();

      user = created;
    } else if (profileImageUrl && !user.profileImageUrl) {
      // Update profile image if we now have one from Google
      await db
        .update(usersTable)
        .set({ profileImageUrl })
        .where(eq(usersTable.email, normalizedEmail));
      user.profileImageUrl = profileImageUrl;
    }

    const resolvedFirst = user.firstName || firstName || normalizedEmail.split("@")[0];

    const sid = await createSession({
      user: {
        id: user.id,
        email: user.email || normalizedEmail,
        username: resolvedFirst,
        firstName: resolvedFirst,
        lastName: user.lastName || lastName || null,
        profileImageUrl: user.profileImageUrl || profileImageUrl || null,
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
        username: resolvedFirst,
      },
    });
  } catch (err) {
    console.error("[OMNIMENS AUTH] Google verify error:", err);
    res.status(401).json({ error: "Google sign-in failed. Please try again." });
  }
});

export default router;
