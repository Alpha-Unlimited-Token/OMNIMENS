/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

/**
 * OMNIMENS Billing Engine
 *
 * - $20 ONE-TIME free credits on account creation (IP-protected, no exploitation)
 * - After free credits run out, user MUST pay (credit packs, auto-topup, or subscription)
 * - No monthly free grants — the $20 is a one-time welcome gift
 * - Auto-charge saved debit card when balance runs out
 */

import { db } from "@workspace/db";
import { omnimensUsers, omnimensCreditTransactions, omnimensNotifications, omnimensAmbassadorEarnings, omnimensAmbassadorProfiles } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { stripe } from "../stripeClient.js";
import type Stripe from "stripe";

// ── Constants ─────────────────────────────────────────────────────────────────
export const FREE_SIGNUP_CREDITS = 2000;            // $20 ONE-TIME free on signup
export const AUTO_TOPUP_DEFAULT_CENTS = 1000;       // $10 auto-topup default
export const CREDITS_PER_DOLLAR = 100;              // 100 credits = $1

// ── Grant one-time free credits (IP-protected) ───────────────────────────────
// Called ONCE when user is created. After this $20 is used, they must pay.
// IP fraud check must be done BEFORE calling this function.
export async function grantOneTimeFreeCredits(userId: string): Promise<{
  granted: boolean;
  credits: number;
  reason?: string;
}> {
  try {
    const [user] = await db
      .select()
      .from(omnimensUsers)
      .where(eq(omnimensUsers.id, userId))
      .limit(1);

    if (!user) return { granted: false, credits: 0, reason: "User not found" };

    if (user.freeCreditsGranted) {
      return { granted: false, credits: 0, reason: "Free credits already claimed" };
    }

    await db.update(omnimensUsers)
      .set({
        credits: sql`${omnimensUsers.credits} + ${FREE_SIGNUP_CREDITS}`,
        totalCreditsEarned: sql`${omnimensUsers.totalCreditsEarned} + ${FREE_SIGNUP_CREDITS}`,
        freeCreditsGranted: true,
      })
      .where(eq(omnimensUsers.id, userId));

    await db.insert(omnimensCreditTransactions).values({
      userId,
      type: "bonus",
      credits: FREE_SIGNUP_CREDITS,
      description: `Welcome bonus — $20 one-time free credits`,
    });

    console.log(`[OMNIMENS BILLING] One-time welcome bonus granted to ${userId}: ${FREE_SIGNUP_CREDITS} credits ($20)`);
    return { granted: true, credits: FREE_SIGNUP_CREDITS };
  } catch (err) {
    console.error("[OMNIMENS BILLING] One-time credit grant error:", err);
    return { granted: false, credits: 0, reason: "Grant failed" };
  }
}

// ── Auto-topup: charge saved card when credits run out ────────────────────────
export async function attemptAutoTopup(userId: string): Promise<{
  success: boolean;
  creditsAdded: number;
  error?: string;
}> {
  try {
    const [user] = await db
      .select()
      .from(omnimensUsers)
      .where(eq(omnimensUsers.id, userId))
      .limit(1);

    if (!user || !user.paymentMethodId || !user.stripeCustomerId || !user.autoTopupEnabled) {
      return { success: false, creditsAdded: 0, error: "No saved payment method" };
    }

    const amountCents = user.autoTopupAmountCents || AUTO_TOPUP_DEFAULT_CENTS;
    const creditsToAdd = amountCents * (CREDITS_PER_DOLLAR / 100); // cents → credits

    // Charge the saved card via Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: user.stripeCustomerId,
      payment_method: user.paymentMethodId,
      confirm: true,
      off_session: true,
      description: `OMNIMENS auto-topup — ${creditsToAdd} credits`,
      metadata: { userId, type: "auto_topup" },
    });

    if (paymentIntent.status !== "succeeded") {
      return { success: false, creditsAdded: 0, error: `Payment status: ${paymentIntent.status}` };
    }

    // Credits added + track paid spend
    await db.update(omnimensUsers)
      .set({
        credits: sql`${omnimensUsers.credits} + ${creditsToAdd}`,
        totalCreditsEarned: sql`${omnimensUsers.totalCreditsEarned} + ${creditsToAdd}`,
        monthlyPaidSpendCents: sql`${omnimensUsers.monthlyPaidSpendCents} + ${amountCents}`,
        totalPaidSpendCents: sql`${omnimensUsers.totalPaidSpendCents} + ${amountCents}`,
      })
      .where(eq(omnimensUsers.id, userId));

    await db.insert(omnimensCreditTransactions).values({
      userId,
      type: "purchase",
      credits: creditsToAdd,
      description: `Auto-topup $${(amountCents / 100).toFixed(2)} — ${creditsToAdd} credits`,
      stripeSessionId: paymentIntent.id,
    });

    console.log(`[OMNIMENS BILLING] Auto-topup success: ${userId} +${creditsToAdd} credits ($${(amountCents / 100).toFixed(2)})`);
    await awardAutoTopupAmbassadorCommission(userId, amountCents, paymentIntent.id);
    return { success: true, creditsAdded: creditsToAdd };
  } catch (err: any) {
    console.error("[OMNIMENS BILLING] Auto-topup error:", err);
    const msg = err?.raw?.message || err?.message || "Payment failed";
    return { success: false, creditsAdded: 0, error: msg };
  }
}

// ── Create Stripe Setup Intent for saving a card ──────────────────────────────
export async function createSetupSession(
  userId: string,
  username: string | null,
  email: string | null,
  returnBaseUrl: string,
  returnPath = "/omnimens/pricing"
): Promise<{ url: string }> {
  const user = await ensureStripeCustomer(userId, username, email);

  const session = await stripe.checkout.sessions.create({
    customer: user.stripeCustomerId!,
    mode: "setup",
    payment_method_types: ["card"],
    success_url: `${returnBaseUrl}${returnPath}?wallet=connected&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${returnBaseUrl}${returnPath}?wallet=cancelled`,
    metadata: { userId, type: "wallet_setup" },
  });

  return { url: session.url! };
}

// ── Confirm wallet after setup session ────────────────────────────────────────
export async function confirmWalletSetup(
  userId: string,
  sessionId: string
): Promise<{ ok: boolean; last4?: string; brand?: string }> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["setup_intent"],
  });

  const setupIntent = session.setup_intent as Stripe.SetupIntent;
  if (!setupIntent || setupIntent.status !== "succeeded") {
    throw new Error("Setup intent not complete");
  }

  const pmId = typeof setupIntent.payment_method === "string"
    ? setupIntent.payment_method
    : setupIntent.payment_method?.id;

  if (!pmId) throw new Error("No payment method attached");

  const pm = await stripe.paymentMethods.retrieve(pmId);
  const last4 = pm.card?.last4;
  const brand = pm.card?.brand;

  // Save to user record + enable auto-topup
  await db.update(omnimensUsers)
    .set({
      paymentMethodId: pmId,
      autoTopupEnabled: true,
    })
    .where(eq(omnimensUsers.id, userId));

  // Log
  await db.insert(omnimensCreditTransactions).values({
    userId,
    type: "bonus",
    credits: 0,
    description: `Wallet connected: ${brand?.toUpperCase()} ending ${last4}`,
    stripeSessionId: sessionId,
  });

  return { ok: true, last4, brand };
}

// ── Resonance Credit Tiers ──────────────────────────────────────────────────
// Separate credit pool for Deep Resonance — pay-as-you-go with prepaid packs
// Each resonance session = 40 credits. 1 credit = $0.01.
// Our cost per session ~$0.14 (10 API calls). At 40 credits ($0.40) = ~65% margin.
// Bonus credits are funded by the markup so we never lose money.
export const RESONANCE_PACKS = [
  { id: "resonance_10",  amountCents: 1000,  baseCredits: 1000,  bonusCredits: 100,  totalCredits: 1100,  label: "$10",  sessions: "~27 sessions", bonusLabel: "+10% bonus" },
  { id: "resonance_25",  amountCents: 2500,  baseCredits: 2500,  bonusCredits: 375,  totalCredits: 2875,  label: "$25",  sessions: "~71 sessions", bonusLabel: "+15% bonus" },
  { id: "resonance_50",  amountCents: 5000,  baseCredits: 5000,  bonusCredits: 1000, totalCredits: 6000,  label: "$50",  sessions: "~150 sessions", bonusLabel: "+20% bonus" },
  { id: "resonance_100", amountCents: 10000, baseCredits: 10000, bonusCredits: 2500, totalCredits: 12500, label: "$100", sessions: "~312 sessions", bonusLabel: "+25% bonus" },
] as const;

export async function purchaseResonanceCredits(
  userId: string,
  packId: string,
): Promise<{ success: boolean; creditsAdded: number; error?: string }> {
  const pack = RESONANCE_PACKS.find(p => p.id === packId);
  if (!pack) return { success: false, creditsAdded: 0, error: "Invalid pack" };

  const [user] = await db.select().from(omnimensUsers).where(eq(omnimensUsers.id, userId)).limit(1);
  if (!user || !user.paymentMethodId || !user.stripeCustomerId) {
    return { success: false, creditsAdded: 0, error: "No saved payment method. Connect a card first." };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: pack.amountCents,
      currency: "usd",
      customer: user.stripeCustomerId,
      payment_method: user.paymentMethodId,
      confirm: true,
      off_session: true,
      description: `OMNIMENS Deep Resonance — ${pack.totalCredits} resonance credits (${pack.bonusLabel})`,
      metadata: { userId, type: "resonance_purchase", packId },
    });

    if (paymentIntent.status !== "succeeded") {
      return { success: false, creditsAdded: 0, error: `Payment status: ${paymentIntent.status}` };
    }

    await db.update(omnimensUsers)
      .set({
        resonanceCredits: sql`${omnimensUsers.resonanceCredits} + ${pack.totalCredits}`,
        resonanceTotalEarned: sql`${omnimensUsers.resonanceTotalEarned} + ${pack.totalCredits}`,
        monthlyPaidSpendCents: sql`${omnimensUsers.monthlyPaidSpendCents} + ${pack.amountCents}`,
        totalPaidSpendCents: sql`${omnimensUsers.totalPaidSpendCents} + ${pack.amountCents}`,
      })
      .where(eq(omnimensUsers.id, userId));

    await db.insert(omnimensCreditTransactions).values({
      userId,
      type: "purchase",
      credits: pack.totalCredits,
      description: `Deep Resonance pack ${pack.label} — ${pack.totalCredits} resonance credits (${pack.bonusLabel})`,
      stripeSessionId: paymentIntent.id,
      packId: pack.id,
    });

    console.log(`[RESONANCE BILLING] Purchase success: ${userId} +${pack.totalCredits} resonance credits (${pack.label})`);
    return { success: true, creditsAdded: pack.totalCredits };
  } catch (err: any) {
    console.error("[RESONANCE BILLING] Purchase error:", err);
    return { success: false, creditsAdded: 0, error: err?.raw?.message || err?.message || "Payment failed" };
  }
}

// ── Auto-settle ALL outstanding balances ──────────────────────────────────────
// Called before wallet removal, account deletion, or card disconnection.
// Settles any negative balance across ALL credit tiers — regular + resonance.
// 1 credit = $0.01 (1 cent).
export async function settleOutstandingBalance(userId: string): Promise<{ settled: boolean; totalChargedCents: number; details: string[]; error?: string }> {
  const [user] = await db.select().from(omnimensUsers).where(eq(omnimensUsers.id, userId)).limit(1);
  if (!user) return { settled: true, totalChargedCents: 0, details: [] };

  const owedItems: { label: string; owedCredits: number; field: "credits" | "resonanceCredits" }[] = [];

  if ((user.credits ?? 0) < 0) {
    owedItems.push({ label: "Regular credits", owedCredits: Math.abs(user.credits), field: "credits" });
  }
  if ((user.resonanceCredits ?? 0) < 0) {
    owedItems.push({ label: "Resonance credits", owedCredits: Math.abs(user.resonanceCredits), field: "resonanceCredits" });
  }

  if (owedItems.length === 0) {
    return { settled: true, totalChargedCents: 0, details: [] };
  }

  const totalOwedCredits = owedItems.reduce((sum, i) => sum + i.owedCredits, 0);
  const totalOwedCents = totalOwedCredits;

  if (!user.paymentMethodId || !user.stripeCustomerId) {
    return {
      settled: false,
      totalChargedCents: 0,
      details: owedItems.map(i => `${i.label}: ${i.owedCredits} credits ($${(i.owedCredits / 100).toFixed(2)})`),
      error: `Outstanding balance of $${(totalOwedCents / 100).toFixed(2)} cannot be settled — no payment method on file.`,
    };
  }

  try {
    const itemDescriptions = owedItems.map(i => `${i.label}: $${(i.owedCredits / 100).toFixed(2)}`).join(", ");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalOwedCents,
      currency: "usd",
      customer: user.stripeCustomerId,
      payment_method: user.paymentMethodId,
      confirm: true,
      off_session: true,
      description: `OMNIMENS — outstanding balance settlement ($${(totalOwedCents / 100).toFixed(2)}): ${itemDescriptions}`,
      metadata: { userId, type: "balance_settlement", items: itemDescriptions },
    });

    if (paymentIntent.status !== "succeeded") {
      return { settled: false, totalChargedCents: 0, details: [], error: "Payment failed — balance still outstanding." };
    }

    const updateFields: Record<string, any> = {};
    for (const item of owedItems) {
      updateFields[item.field] = 0;
    }
    await db.update(omnimensUsers)
      .set(updateFields)
      .where(eq(omnimensUsers.id, userId));

    await db.insert(omnimensCreditTransactions).values({
      userId,
      type: "purchase",
      credits: totalOwedCredits,
      description: `Balance settlement — $${(totalOwedCents / 100).toFixed(2)} (${itemDescriptions})`,
      stripeSessionId: paymentIntent.id,
    });

    console.log(`[BILLING SETTLEMENT] Success: ${userId} — $${(totalOwedCents / 100).toFixed(2)} (${itemDescriptions})`);
    return {
      settled: true,
      totalChargedCents: totalOwedCents,
      details: owedItems.map(i => `${i.label}: ${i.owedCredits} credits ($${(i.owedCredits / 100).toFixed(2)}) — settled`),
    };
  } catch (err: any) {
    console.error("[BILLING SETTLEMENT] Error:", err);
    return { settled: false, totalChargedCents: 0, details: [], error: err?.raw?.message || err?.message || "Settlement failed" };
  }
}

// Backwards-compatible alias
export const settleResonanceBalance = settleOutstandingBalance;

// ── Remove saved wallet ────────────────────────────────────────────────────────
// If user owes money: charge their current card, THEN remove it.
// If charge fails: block removal — they must add a new card first to cover the balance.
export async function removeWallet(userId: string): Promise<{ ok: boolean; chargedCents?: number; error?: string; requireNewCard?: boolean }> {
  const [user] = await db.select().from(omnimensUsers).where(eq(omnimensUsers.id, userId)).limit(1);
  if (!user) return { ok: true };

  const regularOwed = Math.abs(Math.min(0, user.credits ?? 0));
  const resonanceOwed = Math.abs(Math.min(0, user.resonanceCredits ?? 0));
  const totalOwed = regularOwed + resonanceOwed;

  if (totalOwed > 0) {
    const settlement = await settleOutstandingBalance(userId);
    if (!settlement.settled) {
      return {
        ok: false,
        requireNewCard: true,
        error: `You owe $${(totalOwed / 100).toFixed(2)}. Your current card could not be charged. You must add a new payment method and settle the balance before removing your card.`,
      };
    }
    await db.update(omnimensUsers)
      .set({ paymentMethodId: null, autoTopupEnabled: false })
      .where(eq(omnimensUsers.id, userId));
    return { ok: true, chargedCents: settlement.totalChargedCents };
  }

  await db.update(omnimensUsers)
    .set({ paymentMethodId: null, autoTopupEnabled: false })
    .where(eq(omnimensUsers.id, userId));
  return { ok: true };
}

// ── Manual topup (user-triggered) ─────────────────────────────────────────────
export async function manualTopup(
  userId: string,
  amountCents: number
): Promise<{ success: boolean; creditsAdded: number; error?: string }> {
  return attemptAutoTopup(userId);
}

// ── Get billing summary for a user ───────────────────────────────────────────
export async function getBillingSummary(userId: string) {
  const [user] = await db
    .select()
    .from(omnimensUsers)
    .where(eq(omnimensUsers.id, userId))
    .limit(1);

  if (!user) return null;

  let cardInfo: { last4?: string; brand?: string } | null = null;
  if (user.paymentMethodId && user.stripeCustomerId) {
    try {
      const pm = await stripe.paymentMethods.retrieve(user.paymentMethodId);
      cardInfo = { last4: pm.card?.last4, brand: pm.card?.brand };
    } catch { /* PM might be deleted */ }
  }

  return {
    credits: user.credits,
    hasWallet: !!user.paymentMethodId,
    autoTopupEnabled: user.autoTopupEnabled,
    autoTopupAmountCents: user.autoTopupAmountCents,
    card: cardInfo,
    totalPaidSpendDollars: ((user.totalPaidSpendCents || 0) / 100).toFixed(2),
    resonanceCredits: user.resonanceCredits ?? 0,
    resonanceTotalEarned: user.resonanceTotalEarned ?? 0,
    resonanceSessionsRemaining: Math.floor((user.resonanceCredits ?? 0) / 40),
    freeCreditsGranted: user.freeCreditsGranted,
    freeSignupCredits: FREE_SIGNUP_CREDITS,
    freeSignupDollars: (FREE_SIGNUP_CREDITS / 100).toFixed(0),
  };
}

// ── Ensure Stripe customer exists ─────────────────────────────────────────────
async function ensureStripeCustomer(userId: string, username: string | null, email: string | null) {
  const [user] = await db.select().from(omnimensUsers).where(eq(omnimensUsers.id, userId)).limit(1);
  if (!user) throw new Error("User not found");

  if (user.stripeCustomerId) return user;

  const customer = await stripe.customers.create({
    email: email || undefined,
    name: username || undefined,
    metadata: { userId },
  });

  const [updated] = await db.update(omnimensUsers)
    .set({ stripeCustomerId: customer.id })
    .where(eq(omnimensUsers.id, userId))
    .returning();

  return updated;
}

const AMBASSADOR_COMMISSION_RATE = 10;

async function awardAutoTopupAmbassadorCommission(
  payingUserId: string,
  amountCents: number,
  stripeEventId: string
) {
  try {
    if (amountCents <= 0) return;

    const [payingUser] = await db.select({ referredBy: omnimensUsers.referredBy })
      .from(omnimensUsers)
      .where(eq(omnimensUsers.id, payingUserId))
      .limit(1);
    if (!payingUser?.referredBy) return;

    const [ambassador] = await db.select({ id: omnimensUsers.id })
      .from(omnimensUsers)
      .where(eq(omnimensUsers.referralCode, payingUser.referredBy))
      .limit(1);
    if (!ambassador) return;

    const commissionCents = Math.floor(amountCents * AMBASSADOR_COMMISSION_RATE / 100);
    if (commissionCents <= 0) return;
    const commissionCredits = commissionCents;

    await db.update(omnimensUsers)
      .set({
        credits: sql`${omnimensUsers.credits} + ${commissionCredits}`,
        totalCreditsEarned: sql`${omnimensUsers.totalCreditsEarned} + ${commissionCredits}`,
        ambassadorCreditsEarned: sql`${omnimensUsers.ambassadorCreditsEarned} + ${commissionCredits}`,
      })
      .where(eq(omnimensUsers.id, ambassador.id));

    await db.insert(omnimensAmbassadorEarnings).values({
      ambassadorId: ambassador.id,
      referredUserId: payingUserId,
      paymentAmountCents: amountCents,
      commissionCredits,
      commissionRate: AMBASSADOR_COMMISSION_RATE,
      paymentType: "Auto-topup",
      stripeEventId,
    });

    await db.insert(omnimensCreditTransactions).values({
      userId: ambassador.id,
      type: "bonus",
      credits: commissionCredits,
      description: `Ambassador commission (${AMBASSADOR_COMMISSION_RATE}%) — Auto-topup`,
    });

    await db.update(omnimensAmbassadorProfiles)
      .set({
        pendingPayoutCents: sql`${omnimensAmbassadorProfiles.pendingPayoutCents} + ${commissionCents}`,
        lifetimeEarningsCredits: sql`${omnimensAmbassadorProfiles.lifetimeEarningsCredits} + ${commissionCredits}`,
      })
      .where(eq(omnimensAmbassadorProfiles.userId, ambassador.id))
      .catch((e) => console.error("[Ambassador] Profile payout tracking update failed:", e));

    console.log(`[Ambassador] Auto-topup commission: ${commissionCredits} credits to ${ambassador.id} (${AMBASSADOR_COMMISSION_RATE}% of $${(amountCents / 100).toFixed(2)})`);
  } catch (err) {
    console.error("[Ambassador] Auto-topup commission error:", err);
  }
}
