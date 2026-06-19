import Stripe from "stripe";

// Server-only Stripe client. Use TEST keys until Phase 6 lawyer sign-off, then swap to live.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});
