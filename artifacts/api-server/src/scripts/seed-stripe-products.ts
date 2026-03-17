// Run with: pnpm --filter @workspace/api-server run seed-stripe
// Creates OMNIMENS one-time credit packs + monthly subscription plans in Stripe
// and prints the env vars to set in Replit Secrets.

import { stripe } from "../stripeClient.js";

// ── One-time credit packs ─────────────────────────────────────────────────────
const CREDIT_PACKS = [
  {
    key:         "SPARK",
    name:        "OMNIMENS — SPARK Pack",
    description: "300 credits · one-time purchase · never expire",
    amount:      300,  // cents = $3.00
    credits:     300,
    envVar:      "STRIPE_PRICE_SPARK",
  },
  {
    key:         "SURGE",
    name:        "OMNIMENS — SURGE Pack",
    description: "1,200 credits · one-time purchase · never expire · +20% bonus",
    amount:      1000, // cents = $10.00
    credits:     1200,
    envVar:      "STRIPE_PRICE_SURGE",
  },
  {
    key:         "APEX",
    name:        "OMNIMENS — APEX Pack",
    description: "4,000 credits · one-time purchase · never expire · +33% bonus",
    amount:      3000, // cents = $30.00
    credits:     4000,
    envVar:      "STRIPE_PRICE_APEX",
  },
];

// ── Monthly subscription plans ────────────────────────────────────────────────
const MONTHLY_PLANS = [
  {
    key:         "IGNITE",
    name:        "OMNIMENS — IGNITE Monthly",
    description: "1,000 credits/month · GPT-4o + all models · developer platform tools",
    amount:      900,  // cents = $9.00/month
    credits:     1000,
    envVar:      "STRIPE_PRICE_IGNITE",
  },
  {
    key:         "DEV",
    name:        "OMNIMENS — DEV Monthly",
    description: "2,500 credits/month · priority queue · no rate limits · advanced agent mode",
    amount:      1900, // cents = $19.00/month
    credits:     2500,
    envVar:      "STRIPE_PRICE_DEV",
  },
  {
    key:         "ULTRA",
    name:        "OMNIMENS — ULTRA Monthly",
    description: "7,000 credits/month · o3 reasoning model · API key access · highest priority",
    amount:      4900, // cents = $49.00/month
    credits:     7000,
    envVar:      "STRIPE_PRICE_ULTRA",
  },
];

async function createProduct(
  name: string,
  description: string,
  metadata: Record<string, string>,
): Promise<string> {
  const product = await stripe.products.create({ name, description, metadata });
  console.log(`  Product: ${product.id}`);
  return product.id;
}

async function createOneTimePrice(
  productId: string,
  amount: number,
  metadata: Record<string, string>,
): Promise<string> {
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amount,
    currency: "usd",
    metadata,
  });
  console.log(`  Price: ${price.id} ($${(amount / 100).toFixed(2)} one-time)\n`);
  return price.id;
}

async function createMonthlyPrice(
  productId: string,
  amount: number,
  metadata: Record<string, string>,
): Promise<string> {
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amount,
    currency: "usd",
    recurring: { interval: "month" },
    metadata,
  });
  console.log(`  Price: ${price.id} ($${(amount / 100).toFixed(2)}/month)\n`);
  return price.id;
}

async function main() {
  console.log("\n🧬 Seeding OMNIMENS Stripe products...\n");
  const envLines: string[] = [];

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("ONE-TIME CREDIT PACKS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (const pack of CREDIT_PACKS) {
    console.log(`Creating: ${pack.name}...`);
    const productId = await createProduct(pack.name, pack.description, {
      type: "credit_pack", pack: pack.key.toLowerCase(), credits: String(pack.credits),
    });
    const priceId = await createOneTimePrice(productId, pack.amount, {
      pack: pack.key.toLowerCase(), credits: String(pack.credits),
    });
    envLines.push(`${pack.envVar}=${priceId}`);
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("MONTHLY SUBSCRIPTION PLANS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (const plan of MONTHLY_PLANS) {
    console.log(`Creating: ${plan.name}...`);
    const productId = await createProduct(plan.name, plan.description, {
      type: "monthly_plan", plan: plan.key.toLowerCase(), credits_per_month: String(plan.credits),
    });
    const priceId = await createMonthlyPrice(productId, plan.amount, {
      plan: plan.key.toLowerCase(), credits_per_month: String(plan.credits),
    });
    envLines.push(`${plan.envVar}=${priceId}`);
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ All products created! Set these Replit Secrets:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  for (const line of envLines) {
    console.log(line);
  }
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Also configure your Stripe webhook to send these events:");
  console.log("  checkout.session.completed");
  console.log("  invoice.paid");
  console.log("  invoice.payment_failed");
  console.log("  customer.subscription.deleted");
  console.log("  customer.subscription.updated");
  console.log("  Webhook URL: https://your-domain.com/api/stripe/webhook");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
