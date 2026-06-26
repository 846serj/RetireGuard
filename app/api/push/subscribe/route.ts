import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publicVapidKey, pushDeliveryConfigured } from "@/lib/push";

function keyFromSubscription(subscription: any, key: "p256dh" | "auth") {
  return subscription?.keys?.[key] ?? null;
}

export async function GET() {
  return NextResponse.json({ publicKey: publicVapidKey(), configured: pushDeliveryConfigured() });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const subscription = await req.json().catch(() => null);
  const endpoint = subscription?.endpoint;
  const p256dh = keyFromSubscription(subscription, "p256dh");
  const auth = keyFromSubscription(subscription, "auth");
  if (!endpoint || !p256dh || !auth) return NextResponse.json({ ok: false, error: "invalid subscription" }, { status: 400 });

  const { error } = await supabase.from("push_subscriptions").upsert({
    user_id: user.id,
    endpoint,
    p256dh,
    auth,
    user_agent: req.headers.get("user-agent"),
    enabled: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,endpoint" });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { endpoint } = await req.json().catch(() => ({ endpoint: null }));
  if (!endpoint) return NextResponse.json({ ok: false, error: "missing endpoint" }, { status: 400 });
  const { error } = await supabase.from("push_subscriptions").update({ enabled: false, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("endpoint", endpoint);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
