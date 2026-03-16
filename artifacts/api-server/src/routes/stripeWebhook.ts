import { Router } from "express";
import { stripe } from "../stripeClient.js";
import { db } from "@workspace/db";
import { omnimensUsers, omnimensCreditTransactions, omnimensNotifications } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

const CREDIT_PACKS: Record<string, number> = {
  spark: 300,
  surge: 1000,
  blaze: 3000,
  nova: 8000,
  apex: 20000,
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
          const userId = session.metadata?.userId as string | undefined;
          const packId = session.metadata?.packId as string | undefined;
          const purpose = session.metadata?.purpose as string | undefined;

          if (!userId) {
            console.warn("[Stripe Webhook] checkout.session.completed missing userId metadata");
            break;
          }

          if (packId && session.payment_status === "paid") {
            const creditsToAdd = CREDIT_PACKS[packId] ?? CREDIT_PACKS.surge;

            const [user] = await db
              .select({ id: omnimensUsers.id, credits: omnimensUsers.credits })
              .from(omnimensUsers)
              .where(eq(omnimensUsers.id, userId))
              .limit(1);

            if (!user) {
              console.warn(`[Stripe Webhook] User not found: ${userId}`);
              break;
            }

            const stripeCustomerId =
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id || null;

            await db
              .update(omnimensUsers)
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
              description: `Webhook: ${packId.toUpperCase()} pack — ${creditsToAdd} credits`,
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

            console.log(`[Stripe Webhook] Credited ${creditsToAdd} credits to user ${userId} (pack: ${packId})`);
          } else if (purpose === "wallet_setup" && session.setup_intent) {
            const stripeCustomerId =
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id || null;
            const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent as string);
            const paymentMethodId =
              typeof setupIntent.payment_method === "string"
                ? setupIntent.payment_method
                : setupIntent.payment_method?.id;

            if (paymentMethodId) {
              await db
                .update(omnimensUsers)
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

        case "invoice.payment_failed": {
          const invoice = event.data.object as any;
          const customerId =
            typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

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
          const customerId =
            typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

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
              title: "Subscription Cancelled",
              body: "Your subscription has been cancelled. You can still use remaining credits.",
              type: "billing",
            } as any).catch(() => {});
            console.log(`[Stripe Webhook] Subscription deleted for user ${user.id}`);
          }
          break;
        }

        case "customer.subscription.updated": {
          const sub = event.data.object as any;
          const customerId =
            typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
          console.log(`[Stripe Webhook] Subscription updated for customer ${customerId}`);
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
