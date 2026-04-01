/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
import { db } from "@workspace/db";
import { omnimensIpLog, omnimensIpBans, omnimensUsers } from "@workspace/db";
import { eq, and, sql, ne } from "drizzle-orm";
import type { Request } from "express";

export function extractIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = typeof forwarded === "string"
    ? forwarded.split(",")[0].trim()
    : req.ip || req.socket?.remoteAddress || "unknown";
  return raw.replace(/^::ffff:/, "");
}

export async function recordIp(
  userId: string,
  ip: string,
  action: string,
  userAgent?: string,
): Promise<void> {
  if (!ip || ip === "unknown") return;
  try {
    const [existing] = await db
      .select()
      .from(omnimensIpLog)
      .where(and(eq(omnimensIpLog.userId, userId), eq(omnimensIpLog.ipAddress, ip)))
      .limit(1);

    if (existing) {
      await db
        .update(omnimensIpLog)
        .set({
          lastSeenAt: new Date(),
          hitCount: sql`${omnimensIpLog.hitCount} + 1`,
          action,
          userAgent: userAgent || existing.userAgent,
        })
        .where(eq(omnimensIpLog.id, existing.id));
    } else {
      await db.insert(omnimensIpLog).values({
        userId,
        ipAddress: ip,
        action,
        userAgent: userAgent || null,
      });
    }
  } catch (err) {
    console.error("[IP GUARD] Record error:", err);
  }
}

export async function isIpBanned(ip: string): Promise<boolean> {
  if (!ip || ip === "unknown") return false;
  try {
    const [ban] = await db
      .select()
      .from(omnimensIpBans)
      .where(eq(omnimensIpBans.ipAddress, ip))
      .limit(1);
    return !!ban;
  } catch {
    return false;
  }
}

export async function checkIpFraudForFreeCredits(
  userId: string,
  ip: string,
): Promise<{ blocked: boolean; reason?: string }> {
  if (!ip || ip === "unknown") {
    return { blocked: true, reason: "Unable to verify your identity. Free credits require a verifiable connection." };
  }

  try {
    const banned = await isIpBanned(ip);
    if (banned) {
      return { blocked: true, reason: "This network has been flagged for abuse. Free credits are not available." };
    }

    const otherAccountsOnIp = await db
      .select({
        userId: omnimensIpLog.userId,
        freeCreditsGranted: omnimensUsers.freeCreditsGranted,
      })
      .from(omnimensIpLog)
      .innerJoin(omnimensUsers, eq(omnimensIpLog.userId, omnimensUsers.id))
      .where(and(
        eq(omnimensIpLog.ipAddress, ip),
        ne(omnimensIpLog.userId, userId),
        eq(omnimensUsers.freeCreditsGranted, true),
      ))
      .limit(1);

    if (otherAccountsOnIp.length > 0) {
      await db.insert(omnimensIpBans).values({
        ipAddress: ip,
        reason: `Free credit exploitation detected: user ${userId} attempted to claim free credits from IP ${ip} which was already used by user ${otherAccountsOnIp[0].userId}`,
      }).onConflictDoNothing();

      return {
        blocked: true,
        reason: "Free credits have already been claimed from this network. Each person is eligible for one free credit grant. Please purchase credits to continue.",
      };
    }

    return { blocked: false };
  } catch (err) {
    console.error("[IP GUARD] Fraud check error:", err);
    return { blocked: false };
  }
}

export async function getAllIpsForUser(userId: string): Promise<string[]> {
  try {
    const records = await db
      .select({ ipAddress: omnimensIpLog.ipAddress })
      .from(omnimensIpLog)
      .where(eq(omnimensIpLog.userId, userId));
    return records.map(r => r.ipAddress);
  } catch {
    return [];
  }
}
