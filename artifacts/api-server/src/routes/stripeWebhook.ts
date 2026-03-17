import { Router } from "express";
import { stripe } from "../stripeClient.js";
import { db } from "@workspace/db";
import { omnimensUsers, omnimensCreditTransactions, omnimensNotifications } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

// One-time credit packs
const CREDIT_PACKS: Record<string, number> = {
  spark: 300,
  surge: 1200,
  apex:  4000,
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

          // ── One-time credit pack purchase ──────────────────────────────────
          if (packId && CREDIT_PACKS[packId] && session.payment_status === "paid") {
            const creditsToAdd = CREDIT_PACKS[packId];
            const stripeCustomerId =
              typeof session.customer === "string" ? session.customer : session.customer?.id || null;

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
                ...(stripeCustomerId ? { stripeCustomerId } : {}),
              })
              .where(eq(omnimensUsers.id, userId));

            await db.insert(omnimensCreditTransactions).values({
              userId,
              type: "purchase",
              credits: creditsToAdd,
              description: `${packId.toUpperCase()} pack — ${creditsToAdd.toLocaleString()} credits`,
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
