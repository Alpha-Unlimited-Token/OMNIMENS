/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { Router } from "express";
import { stripe } from "../stripeClient.js";
import { db } from "@workspace/db";
import { omnimensUsers, omnimensCreditTransactions, omnimensNotifications, omnimensReferrals } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const REFERRAL_REWARD_CREDITS = 500;

const router = Router();

async function awardReferralCredits(payingUserId: string) {
  try {
    const [pendingRef] = await db.select().from(omnimensReferrals)
      .where(and(
        eq(omnimensReferrals.referredUserId, payingUserId),
        eq(omnimensReferrals.status, "pending"),
      ))
      .limit(1);
    if (!pendingRef) return;

    await db.update(omnimensUsers)
      .set({
        credits: sql`${omnimensUsers.credits} + ${REFERRAL_REWARD_CREDITS}`,
        totalCreditsEarned: sql`${omnimensUsers.totalCreditsEarned} + ${REFERRAL_REWARD_CREDITS}`,
        referralCreditsEarned: sql`${omnimensUsers.referralCreditsEarned} + ${REFERRAL_REWARD_CREDITS}`,
      })
      .where(eq(omnimensUsers.id, pendingRef.referrerId));

    await db.update(omnimensReferrals)
      .set({
        status: "completed",
        creditsAwarded: REFERRAL_REWARD_CREDITS,
        paymentCompletedAt: new Date(),
      })
      .where(eq(omnimensReferrals.id, pendingRef.id));

    await db.insert(omnimensCreditTransactions).values({
      userId: pendingRef.referrerId,
      type: "bonus",
      credits: REFERRAL_REWARD_CREDITS,
      description: `Referral bonus — referred user completed first payment`,
    });

    console.log(`[Referral] Awarded ${REFERRAL_REWARD_CREDITS} credits to ${pendingRef.referrerId} for referring ${payingUserId}`);
  } catch (err) {
    console.error("[Referral] Failed to award referral credits:", err);
  }
}

const CREDIT_PACKS: Record<string, { credits: number; amountCents: number; label: string }> = {
  spark: { credits: 300,  amountCents: 300,  label: "SPARK" },
  surge: { credits: 1200, amountCents: 1000, label: "SURGE" },
  apex:  { credits: 4000, amountCents: 3000, label: "APEX" },
};

const RESONANCE_PACKS: Record<string, { totalCredits: number; amountCents: number; label: string; bonusLabel: string }> = {
  resonance_10:  { totalCredits: 1100,  amountCents: 1000,  label: "$10",  bonusLabel: "+10% bonus" },
  resonance_25:  { totalCredits: 2875,  amountCents: 2500,  label: "$25",  bonusLabel: "+15% bonus" },
  resonance_50:  { totalCredits: 6000,  amountCents: 5000,  label: "$50",  bonusLabel: "+20% bonus" },
  resonance_100: { totalCredits: 12500, amountCents: 10000, label: "$100", bonusLabel: "+25% bonus" },
};

// Monthly subscription plan credits granted on each renewal cycle
const MONTHLY_PLAN_CREDITS: Record<string, { credits: number; label: string }> = {
  ignite: { credits: 1000, label: "IGNITE" },
  dev:    { credits: 2500, label: "DEV" },
  ultra:  { credits: 7000, label: "ULTRA" },
};

router.post(
  "/stripe/webhook",
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set");
      res.status(500).json({ error: "Webhook secret not configured" });
      return;
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, secret);
    } catch (err: any) {
      console.error("[Stripe Webhook] Signature verification failed:", err.message);
      res.status(400).json({ error: `Webhook Error: ${err.message}` });
      return;
    }

    console.log(`[Stripe Webhook] Event: ${event.type}`);

    try {
      switch (event.type) {

        case "checkout.session.completed": {
          const session = event.data.object as any;
          const userId  = session.metadata?.userId  as string | undefined;
          const packId  = session.metadata?.packId  as string | undefined;
          const purpose = session.metadata?.purpose as string | undefined;

          if (!userId) {
            console.warn("[Stripe Webhook] checkout.session.completed missing userId metadata");
            break;
          }

          const isResonance = session.metadata?.type === "resonance";
          const stripeCustomerId =
            typeof session.customer === "string" ? session.customer : session.customer?.id || null;

          // ── Resonance credit pack purchase ────────────────────────────────
          if (isResonance && packId && RESONANCE_PACKS[packId] && session.payment_status === "paid") {
            const resPack = RESONANCE_PACKS[packId];

            const [user] = await db
              .select({ id: omnimensUsers.id })
              .from(omnimensUsers)
              .where(eq(omnimensUsers.id, userId))
              .limit(1);

            if (!user) { console.warn(`[Stripe Webhook] User not found: ${userId}`); break; }

            await db.update(omnimensUsers)
              .set({
                resonanceCredits: sql`${omnimensUsers.resonanceCredits} + ${resPack.totalCredits}`,
                resonanceTotalEarned: sql`${omnimensUsers.resonanceTotalEarned} + ${resPack.totalCredits}`,
                monthlyPaidSpendCents: sql`${omnimensUsers.monthlyPaidSpendCents} + ${resPack.amountCents}`,
                totalPaidSpendCents: sql`${omnimensUsers.totalPaidSpendCents} + ${resPack.amountCents}`,
                ...(stripeCustomerId ? { stripeCustomerId } : {}),
              })
              .where(eq(omnimensUsers.id, userId));

            await db.insert(omnimensCreditTransactions).values({
              userId,
              type: "purchase",
              credits: resPack.totalCredits,
              description: `Deep Resonance ${resPack.label} — ${resPack.totalCredits.toLocaleString()} resonance credits (${resPack.bonusLabel})`,
              stripeSessionId: session.id,
              packId,
            });

            await db.insert(omnimensNotifications).values({
              upgradeId: null,
              userId,
              title: "Resonance Credits Added",
              body: `${resPack.totalCredits.toLocaleString()} resonance credits have been added to your account.`,
              type: "billing",
            } as any).catch(() => {});

            console.log(`[Stripe Webhook] Credited ${resPack.totalCredits} resonance credits to ${userId} (pack: ${packId})`);

          // ── One-time credit pack purchase ──────────────────────────────────
          } else if (packId && CREDIT_PACKS[packId] && session.payment_status === "paid") {
            const packInfo = CREDIT_PACKS[packId];
            const creditsToAdd = packInfo.credits;

            const [user] = await db
              .select({ id: omnimensUsers.id })
              .from(omnimensUsers)
              .where(eq(omnimensUsers.id, userId))
              .limit(1);

            if (!user) { console.warn(`[Stripe Webhook] User not found: ${userId}`); break; }

            await db.update(omnimensUsers)
              .set({
                credits: sql`${omnimensUsers.credits} + ${creditsToAdd}`,
                totalCreditsEarned: sql`${omnimensUsers.totalCreditsEarned} + ${creditsToAdd}`,
                monthlyPaidSpendCents: sql`${omnimensUsers.monthlyPaidSpendCents} + ${packInfo.amountCents}`,
                totalPaidSpendCents: sql`${omnimensUsers.totalPaidSpendCents} + ${packInfo.amountCents}`,
                ...(stripeCustomerId ? { stripeCustomerId } : {}),
              })
              .where(eq(omnimensUsers.id, userId));

            await db.insert(omnimensCreditTransactions).values({
              userId,
              type: "purchase",
              credits: creditsToAdd,
              description: `${packInfo.label} pack — ${creditsToAdd.toLocaleString()} credits`,
              stripeSessionId: session.id,
              packId,
            });

            await db.insert(omnimensNotifications).values({
              upgradeId: null,
              userId,
              title: "Credits Added",
              body: `${creditsToAdd.toLocaleString()} credits have been added to your account.`,
              type: "billing",
            } as any).catch(() => {});

            console.log(`[Stripe Webhook] Credited ${creditsToAdd} credits to ${userId} (pack: ${packId})`);
            await awardReferralCredits(userId);

          // ── Monthly plan subscription started ──────────────────────────────
          } else if (purpose === "monthly_plan" && session.mode === "subscription") {
            const planId = session.metadata?.planId as string | undefined;
            const plan   = planId ? MONTHLY_PLAN_CREDITS[planId] : null;
            if (!plan) { console.warn(`[Stripe Webhook] Unknown monthly plan: ${planId}`); break; }

            const subscriptionId   = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
            const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id || null;

            await db.update(omnimensUsers)
              .set({
                credits: sql`${omnimensUsers.credits} + ${plan.credits}`,
                totalCreditsEarned: sql`${omnimensUsers.totalCreditsEarned} + ${plan.credits}`,
                tier: planId!,
                isPro: true,
                stripeSubscriptionId: subscriptionId || undefined,
                ...(stripeCustomerId ? { stripeCustomerId } : {}),
              })
              .where(eq(omnimensUsers.id, userId));

            await db.insert(omnimensCreditTransactions).values({
              userId,
              type: "purchase",
              credits: plan.credits,
              description: `${plan.label} Monthly Plan — ${plan.credits.toLocaleString()} credits (first month)`,
              stripeSessionId: session.id,
              packId: planId,
            });

            await db.insert(omnimensNotifications).values({
              upgradeId: null,
              userId,
              title: `${plan.label} Plan Activated`,
              body: `Your ${plan.label} Monthly Plan is now active. ${plan.credits.toLocaleString()} credits added to your account.`,
              type: "billing",
            } as any).catch(() => {});

            console.log(`[Stripe Webhook] ${plan.label} plan activated for ${userId} — ${plan.credits} credits`);
            await awardReferralCredits(userId);

          // ── Wallet setup ───────────────────────────────────────────────────
          } else if (purpose === "wallet_setup" && session.setup_intent) {
            const stripeCustomerId =
              typeof session.customer === "string" ? session.customer : session.customer?.id || null;
            const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent as string);
            const paymentMethodId =
              typeof setupIntent.payment_method === "string"
                ? setupIntent.payment_method
                : setupIntent.payment_method?.id;

            if (paymentMethodId) {
              await db.update(omnimensUsers)
                .set({
                  paymentMethodId,
                  autoTopupEnabled: true,
                  ...(stripeCustomerId ? { stripeCustomerId } : {}),
                })
                .where(eq(omnimensUsers.id, userId));
              console.log(`[Stripe Webhook] Wallet connected for user ${userId}`);
            }
          }
          break;
        }

        // ── Monthly plan renewal ─────────────────────────────────────────────
        case "invoice.paid": {
          const invoice = event.data.object as any;

          // Only process subscription renewal cycles (not the initial invoice handled above)
          if (invoice.billing_reason !== "subscription_cycle") break;

          const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
          if (!customerId) break;

          const [user] = await db
            .select()
            .from(omnimensUsers)
            .where(eq(omnimensUsers.stripeCustomerId, customerId))
            .limit(1);

          if (!user) { console.warn(`[Stripe Webhook] invoice.paid — no user for customer ${customerId}`); break; }

          const planId = user.tier;
          const plan   = planId ? MONTHLY_PLAN_CREDITS[planId] : null;
          if (!plan) { console.log(`[Stripe Webhook] invoice.paid — user ${user.id} has no monthly plan (tier: ${planId})`); break; }

          await db.update(omnimensUsers)
            .set({
              credits: sql`${omnimensUsers.credits} + ${plan.credits}`,
              totalCreditsEarned: sql`${omnimensUsers.totalCreditsEarned} + ${plan.credits}`,
            })
            .where(eq(omnimensUsers.id, user.id));

          await db.insert(omnimensCreditTransactions).values({
            userId: user.id,
            type: "purchase",
            credits: plan.credits,
            description: `${plan.label} Monthly Plan renewal — ${plan.credits.toLocaleString()} credits`,
            stripeSessionId: invoice.id,
            packId: planId,
          });

          await db.insert(omnimensNotifications).values({
            upgradeId: null,
            userId: user.id,
            title: `${plan.label} Credits Renewed`,
            body: `Your ${plan.label} plan renewed. ${plan.credits.toLocaleString()} credits added to your account.`,
            type: "billing",
          } as any).catch(() => {});

          console.log(`[Stripe Webhook] ${plan.label} renewal for user ${user.id} — ${plan.credits} credits`);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as any;
          const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
          if (!customerId) break;

          const [user] = await db
            .select({ id: omnimensUsers.id })
            .from(omnimensUsers)
            .where(eq(omnimensUsers.stripeCustomerId, customerId))
            .limit(1);

          if (user) {
            await db.insert(omnimensNotifications).values({
              upgradeId: null,
              userId: user.id,
              title: "Payment Failed",
              body: "A payment attempt failed. Please update your payment method to continue using OMNIMENS.",
              type: "billing",
            } as any).catch(() => {});
            console.log(`[Stripe Webhook] Payment failed notified for user ${user.id}`);
          }
          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object as any;
          const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
          if (!customerId) break;

          const [user] = await db
            .select({ id: omnimensUsers.id, tier: omnimensUsers.tier })
            .from(omnimensUsers)
            .where(eq(omnimensUsers.stripeCustomerId, customerId))
            .limit(1);

          if (user) {
            // Reset subscription plan back to free
            await db.update(omnimensUsers)
              .set({ tier: "free", isPro: false, stripeSubscriptionId: null })
              .where(eq(omnimensUsers.id, user.id));

            await db.insert(omnimensNotifications).values({
              upgradeId: null,
              userId: user.id,
              title: "Subscription Cancelled",
              body: "Your monthly plan has been cancelled. You can still use your remaining credits, or resubscribe anytime.",
              type: "billing",
            } as any).catch(() => {});

            console.log(`[Stripe Webhook] Monthly plan cancelled for user ${user.id} (was: ${user.tier})`);
          }
          break;
        }

        case "customer.subscription.updated": {
          const sub = event.data.object as any;
          const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
          console.log(`[Stripe Webhook] Subscription updated for customer ${customerId}, status: ${sub.status}`);
          break;
        }

        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
      }
    } catch (err: any) {
      console.error(`[Stripe Webhook] Error processing ${event.type}:`, err);
    }

    res.json({ received: true });
  }
);

export default router;
