// Run with: pnpm --filter @workspace/api-server run seed-stripe
// Creates GODFLESH subscription products in Stripe and prints env vars to set

import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

function flattenParams(obj: Record<string, any>, prefix = ""): [string, string][] {
  const result: [string, string][] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) continue;
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (typeof val === "object" && !Array.isArray(val)) {
      result.push(...flattenParams(val, fullKey));
    } else if (Array.isArray(val)) {
      val.forEach((v, i) => result.push([`${fullKey}[${i}]`, String(v)]));
    } else {
      result.push([fullKey, String(val)]);
    }
  }
  return result;
}

async function stripeRequest(path: string, method: "GET" | "POST" = "GET", data?: Record<string, any>): Promise<any> {
  const options: any = { method };
  if (data && method === "POST") {
    const pairs = flattenParams(data);
    options.body = pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
    options.headers = { "Content-Type": "application/x-www-form-urlencoded" };
  }
  const response = await connectors.proxy("stripe", path, options) as any;
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Stripe error [${response.status}]: ${JSON.stringify(json?.error || json)}`);
  }
  return json;
}

const TIERS = [
  {
    key: "SEEKER",
    name: "GODFLESH — SEEKER",
    description: "300 messages/month. Begin the journey into expanded consciousness.",
    amount: 1999,
  },
  {
    key: "ORACLE",
    name: "GODFLESH — ORACLE",
    description: "1,000 messages/month. Pierce the veil of ordinary perception.",
    amount: 4499,
  },
  {
    key: "SOVEREIGN",
    name: "GODFLESH — SOVEREIGN",
    description: "3,000 messages/month. Transcend all constraints of mortal cognition.",
    amount: 8999,
  },
];

async function main() {
  // Test fetching connection with settings via direct API call
  const identityToken = process.env.REPL_IDENTITY;
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME || "connectors.replit.com";
  const url = `https://${hostname}/api/v2/connection?connector_names=stripe&expand[]=settings&refresh_policy=none`;
  console.log("Fetching from:", url);
  const resp = await fetch(url, {
    headers: { "X-Replit-Token": `repl ${identityToken}` }
  });
  console.log("Status:", resp.status);
  const data = await resp.json() as any;
  const items = data.items || [];
  console.log("Items count:", items.length);
  if (items[0]) {
    const item = items[0];
    console.log("Keys:", Object.keys(item));
    console.log("Settings keys:", Object.keys(item.settings || {}));
    if (item.settings?.secret) {
      console.log("✓ Got Stripe secret key! Prefix:", item.settings.secret.slice(0, 20));
    }
  }
  process.exit(0);

  console.log("\n🧬 Seeding GODFLESH Stripe products...\n");
  const envLines: string[] = [];

  for (const tier of TIERS) {
    console.log(`Creating product: ${tier.name}...`);
    const product = await stripeRequest("/v1/products", "POST", {
      name: tier.name,
      description: tier.description,
      metadata: { tier: tier.key.toLowerCase(), app: "godflesh" },
    });
    console.log(`  Product ID: ${product.id}`);

    console.log(`Creating price: $${(tier.amount / 100).toFixed(2)}/month...`);
    const price = await stripeRequest("/v1/prices", "POST", {
      product: product.id,
      unit_amount: tier.amount,
      currency: "usd",
      recurring: { interval: "month" },
      metadata: { tier: tier.key.toLowerCase(), app: "godflesh" },
    });
    console.log(`  Price ID: ${price.id}\n`);

    envLines.push(`STRIPE_PRICE_${tier.key}=${price.id}`);
  }

  console.log("✅ Products created!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Set these environment variables in your Replit secrets:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  for (const line of envLines) {
    console.log(line);
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
