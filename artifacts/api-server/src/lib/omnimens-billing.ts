/**
 * OMNIMENS Billing Engine
 *
 * - $20 free credits every month for every user
 * - After free credits run out, auto-charge saved debit card
 * - Monthly loyalty bonus: 10% of prior month's paid spend, given as free credits
 * - Bonus is always profitable: our cost = 33% of credits, bonus = 10% = 3.3% of revenue
 */

import { db } from "@workspace/db";
import { omnimensUsers, omnimensCreditTransactions, omnimensNotifications } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { stripe } from "../stripeClient.js";
import type Stripe from "stripe";

// ── Constants ─────────────────────────────────────────────────────────────────
export const FREE_MONTHLY_CREDITS = 2000;          // $20 free every month
export const AUTO_TOPUP_DEFAULT_CENTS = 1000;      // $10 auto-topup default
export const CREDITS_PER_DOLLAR = 100;             // 100 credits = $1

// ── Loyalty Bonus Tiers ───────────────────────────────────────────────────────
// Based on prior month's PAID spend in cents
// Our margin: we charge 3× OpenAI cost, so 10% bonus = 3.3% of revenue hit
// At $1,000 paid: $333 cost + $33 bonus cost = $634 profit (63.4%) ✓
export const LOYALTY_TIERS = [
  { minSpendCents: 0,      maxSpendCents: 999,    bonusCredits: 2000,  label: "BASE",    desc: "$20 monthly base" },
  { minSpendCents: 1000,   maxSpendCents: 4999,   bonusCredits: 2000,  label: "SPARK",   desc: "$20 free next month" },
  { minSpendCents: 5000,   maxSpendCents: 9999,   bonusCredits: 2200,  label: "RISE",    desc: "$22 free next month" },
  { minSpendCents: 10000,  maxSpendCents: 24999,  bonusCredits: 2500,  label: "SURGE",   desc: "$25 free next month" },
  { minSpendCents: 25000,  maxSpendCents: 49999,  bonusCredits: 3500,  label: "APEX",    desc: "$35 free next month" },
  { minSpendCents: 50000,  maxSpendCents: 99999,  bonusCredits: 5000,  label: "ELITE",   desc: "$50 free next month" },
  { minSpendCents: 100000, maxSpendCents: 199999, bonusCredits: 10000, label: "PRIME",   desc: "$100 free next month" },
  { minSpendCents: 200000, maxSpendCents: 499999, bonusCredits: 20000, label: "APEX+",   desc: "$200 free next month" },
  { minSpendCents: 500000, maxSpendCents: Infinity,bonusCredits: 50000, label: "LEGEND",  desc: "$500 free next month" },
] as const;

export function calculateLoyaltyBonus(paidSpendCents: number): {
  bonusCredits: number;
  tier: string;
  desc: string;
  nextTierSpendCents: number | null;
} {
  const tier = [...LOYALTY_TIERS].reverse().find(t => paidSpendCents >= t.minSpendCents) || LOYALTY_TIERS[0];
  const tierIdx = LOYALTY_TIERS.findIndex(t => t.label === tier.label);
  const nextTier = tierIdx < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[tierIdx + 1] : null;
  return {
    bonusCredits: tier.bonusCredits,
    tier: tier.label,
    desc: tier.desc,
    nextTierSpendCents: nextTier ? nextTier.minSpendCents : null,
  };
}

// ── Current month key (YYYY-MM) ────────────────────────────────────────────────
export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ── Check and grant monthly free credits ──────────────────────────────────────
// Called on every request — grants bonus if a new month has started
export async function checkAndGrantMonthlyCredits(userId: string): Promise<void> {
  try {
    const monthKey = currentMonthKey();
    const [user] = await db
      .select()
      .from(omnimensUsers)
      .where(eq(omnimensUsers.id, userId))
      .limit(1);

    if (!user) return;

    const prevMonthKey = user.currentMonthKey;
    const isNewMonth = prevMonthKey !== monthKey;
    if (!isNewMonth) return;

    // New month — calculate bonus based on last month's paid spend
    const prevSpendCents = user.monthlyPaidSpendCents || 0;
    const { bonusCredits, tier, desc } = calculateLoyaltyBonus(prevSpendCents);

    // Grant the bonus (or base $20 for new users) + reset monthly counters
    await db.update(omnimensUsers)
      .set({
        credits: sql`${omnimensUsers.credits} + ${bonusCredits}`,
        totalCreditsEarned: sql`${omnimensUsers.totalCreditsEarned} + ${bonusCredits}`,
        currentMonthKey: monthKey,
        monthlyPaidSpendCents: 0,  // reset for new month
        lastBonusMonth: prevMonthKey || monthKey,
      })
      .where(eq(omnimensUsers.id, userId));

    await db.insert(omnimensCreditTransactions).values({
      userId,
      type: "bonus",
      credits: bonusCredits,
      description: `Monthly ${tier} loyalty bonus — ${desc} (prev spend: $${(prevSpendCents / 100).toFixed(2)})`,
    });

    await db.insert(omnimensNotifications).values({
      upgradeId: null,
      title: `YOUR MONTHLY ${tier} BONUS HAS ARRIVED`,
      message: `${bonusCredits} free credits added to your account for this month. ${desc}. Based on your $${(prevSpendCents / 100).toFixed(2)} spend last month.`,
      type: "system",
      readByOwner: false,
    });

    console.log(`[OMNIMENS BILLING] Monthly ${tier} bonus granted to ${userId}: ${bonusCredits} credits`);
  } catch (err) {
    console.error("[OMNIMENS BILLING] Monthly credit grant error:", err);
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
// Auto-settles ALL outstanding balances before removing the card
export async function removeWallet(userId: string): Promise<{ ok: boolean; chargedCents?: number; error?: string }> {
  const [user] = await db.select().from(omnimensUsers).where(eq(omnimensUsers.id, userId)).limit(1);
  if (!user) return { ok: true };

  const hasNegativeRegular = (user.credits ?? 0) < 0;
  const hasNegativeResonance = (user.resonanceCredits ?? 0) < 0;

  if (hasNegativeRegular || hasNegativeResonance) {
    const settlement = await settleOutstandingBalance(userId);
    if (!settlement.settled) {
      return { ok: false, error: settlement.error || "Cannot remove wallet — outstanding balance must be settled first." };
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

  const monthKey = currentMonthKey();
  const isNewMonth = user.currentMonthKey !== monthKey;
  const spendCents = isNewMonth ? 0 : (user.monthlyPaidSpendCents || 0);
  const { bonusCredits, tier, desc, nextTierSpendCents } = calculateLoyaltyBonus(spendCents);

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
    currentMonthSpendCents: spendCents,
    currentMonthSpendDollars: (spendCents / 100).toFixed(2),
    nextBonusCredits: bonusCredits,
    nextBonusTier: tier,
    nextBonusDesc: desc,
    nextTierSpendCents,
    nextTierSpendDollars: nextTierSpendCents ? (nextTierSpendCents / 100).toFixed(2) : null,
    totalPaidSpendDollars: ((user.totalPaidSpendCents || 0) / 100).toFixed(2),
    resonanceCredits: user.resonanceCredits ?? 0,
    resonanceTotalEarned: user.resonanceTotalEarned ?? 0,
    resonanceSessionsRemaining: Math.floor((user.resonanceCredits ?? 0) / 40),
    freeMonthlyCredits: FREE_MONTHLY_CREDITS,
    loyaltyTiers: LOYALTY_TIERS.map(t => ({
      label: t.label,
      minSpendDollars: (t.minSpendCents / 100).toFixed(0),
      bonusCredits: t.bonusCredits,
      bonusDollars: (t.bonusCredits / CREDITS_PER_DOLLAR).toFixed(0),
      desc: t.desc,
    })),
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
