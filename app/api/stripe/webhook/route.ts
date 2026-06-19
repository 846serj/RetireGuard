import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { sendConfirmationEmail } from "@/lib/email";

// Stripe webhook: keeps the `subscriptions` table in sync. Add this URL + signing secret in Stripe.
// Note: this route is excluded from middleware (it needs the raw body, no session).
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig!, secret!);
  } catch (e: any) {
    return NextResponse.json({ error: `signature: ${e.message}` }, { status: 400 });
  }

  const db = createServiceClient();

  async function upsert(sub: any) {
    const userId = sub.metadata?.user_id;
    if (!userId) return;
    await db.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: sub.customer,
      stripe_subscription_id: sub.id,
      status: sub.status,
      plan: sub.metadata?.plan ?? null,
      trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as any;
      if (s.subscription) {
        const sub = await stripe.subscriptions.retrieve(s.subscription);
        await upsert(sub);
        if (s.customer_details?.email) await sendConfirmationEmail(s.customer_details.email);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created":
    case "customer.subscription.deleted":
      await upsert(event.data.object);
      break;
  }

  return NextResponse.json({ received: true });
}
