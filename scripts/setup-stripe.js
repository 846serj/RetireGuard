#!/usr/bin/env node
/*
 * Idempotently creates the RetireShield pricing ladder in TEST or LIVE mode,
 * depending on STRIPE_SECRET_KEY. It prints the env vars this app needs.
 *
 * Note: Stripe trial-ending reminder emails are an account Billing setting. Keep
 * them enabled in Dashboard -> Billing -> Subscriptions and emails before going live.
 */
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

const PRODUCT_NAME = "RetireShield";
const TRIAL_DAYS = 7;
const SELF_SERVE_PRICES = [
  { tier: "plus", cadence: "monthly", lookupKey: "retireshield_plus_monthly_19", amount: 1900, interval: "month" },
  { tier: "plus", cadence: "annual", lookupKey: "retireshield_plus_annual_190", amount: 19000, interval: "year" },
  { tier: "premium", cadence: "monthly", lookupKey: "retireshield_premium_monthly_39", amount: 3900, interval: "month" },
  { tier: "premium", cadence: "annual", lookupKey: "retireshield_premium_annual_390", amount: 39000, interval: "year" },
];
const CATALOG_ONLY_PRICES = [
  { tier: "concierge", cadence: "monthly", lookupKey: "retireshield_concierge_monthly_99", amount: 9900, interval: "month" },
  { tier: "concierge", cadence: "annual", lookupKey: "retireshield_concierge_annual_990", amount: 99000, interval: "year" },
];

async function requireSecretKey() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY. Use a Stripe test-mode secret key first, then repeat with live when ready.");
  }
}

async function getOrCreateProduct() {
  const products = await stripe.products.search({ query: `name:'${PRODUCT_NAME}' AND active:'true'`, limit: 1 });
  if (products.data[0]) return products.data[0];
  return stripe.products.create({ name: PRODUCT_NAME, metadata: { app: "retireshield", ladder: "free_plus_premium_concierge" } });
}

async function getOrCreatePrice({ product, lookupKey, amount, interval, tier, cadence, selfServe }) {
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  if (existing.data[0]) return existing.data[0];
  return stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: amount,
    lookup_key: lookupKey,
    recurring: { interval },
    metadata: { app: "retireshield", tier, cadence, plan: `${tier}_${cadence}`, self_serve: String(selfServe) },
  });
}

async function getOrCreatePortalConfiguration(product, selfServePrices) {
  const configs = await stripe.billingPortal.configurations.list({ active: true, limit: 100 });
  const existing = configs.data.find((config) => config.metadata?.app === "retireshield" && config.metadata?.ladder === "2026_plus_premium");
  if (existing) return existing;
  return stripe.billingPortal.configurations.create({
    business_profile: { headline: "Manage your RetireShield subscription" },
    features: {
      customer_update: { enabled: true, allowed_updates: ["email", "tax_id", "address"] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
      subscription_update: { enabled: true, default_allowed_updates: ["price"], products: [{ product: product.id, prices: selfServePrices.map((price) => price.id) }] },
    },
    metadata: { app: "retireshield", ladder: "2026_plus_premium" },
  });
}

function envName({ tier, cadence }) {
  return `STRIPE_PRICE_${tier.toUpperCase()}_${cadence.toUpperCase()}`;
}

async function main() {
  await requireSecretKey();
  const product = await getOrCreateProduct();
  const selfServePrices = [];
  const catalogOnlyPrices = [];
  for (const config of SELF_SERVE_PRICES) selfServePrices.push(await getOrCreatePrice({ product, ...config, selfServe: true }));
  for (const config of CATALOG_ONLY_PRICES) catalogOnlyPrices.push(await getOrCreatePrice({ product, ...config, selfServe: false }));
  const portalConfiguration = await getOrCreatePortalConfiguration(product, selfServePrices);

  console.log("Stripe setup complete:\n");
  console.log(`Product: ${product.id} (${product.name})`);
  [...selfServePrices, ...catalogOnlyPrices].forEach((price) => {
    const label = price.metadata.self_serve === "true" ? `${TRIAL_DAYS}-day trial in Checkout` : "talk-to-sales / waitlist";
    console.log(`${price.metadata.plan}: ${price.id} ($${(price.unit_amount / 100).toLocaleString("en-US")}/${price.recurring.interval}, ${label})`);
  });
  console.log(`Customer Portal configuration: ${portalConfiguration.id}\n`);
  console.log("Add these to your app environment:");
  [...selfServePrices, ...catalogOnlyPrices].forEach((price) => console.log(`${envName(price.metadata)}=${price.id}`));
  console.log(`STRIPE_PORTAL_CONFIGURATION=${portalConfiguration.id}`);
  console.log("\nCheckout applies trial_period_days=7 for Plus and Premium. Concierge prices are catalog-only for talk-to-sales/waitlist.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
