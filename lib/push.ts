import type { Alert } from "@/lib/alerts";

type SupabaseLike = { from: (t: string) => any };

type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  enabled: boolean;
};

export function publicVapidKey() {
  return process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? "";
}

export function pushDeliveryConfigured() {
  return Boolean(publicVapidKey() && process.env.WEB_PUSH_PRIVATE_KEY && process.env.WEB_PUSH_SEND_ENDPOINT);
}

function compact(value: string) {
  return value.replace(/^(Ask|What to ask|What to do|What it means for you):\s*/i, "").replace(/\s+/g, " ").trim();
}

function shouldPush(alert: Alert) {
  return alert.urgent || alert.personalized || alert.delivery_channels?.includes("push");
}

export function pushPayloadForAlert(alert: Alert) {
  return {
    title: alert.title,
    body: compact(alert.action_line || alert.what_to_ask || alert.body).slice(0, 140),
    tag: alert.id,
    url: "/dashboard/monitoring",
    category: alert.category,
  };
}

async function sendViaConfiguredProvider(subscription: PushSubscriptionRow, payload: ReturnType<typeof pushPayloadForAlert>) {
  const endpoint = process.env.WEB_PUSH_SEND_ENDPOINT;
  if (!endpoint) return { sent: false, skipped: "missing WEB_PUSH_SEND_ENDPOINT" };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.WEB_PUSH_PRIVATE_KEY ?? ""}` },
    body: JSON.stringify({ subscription: { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, payload }),
  });
  return { sent: response.ok, skipped: response.ok ? undefined : `provider ${response.status}` };
}

export async function sendUrgentAlertPushNotifications(supabase: SupabaseLike, userId: string, alerts: Alert[]) {
  const pushAlerts = alerts.filter(shouldPush);
  if (pushAlerts.length === 0) return { attempted: 0, sent: 0, skipped: 0 };

  const { data } = await supabase.from("push_subscriptions").select("id,user_id,endpoint,p256dh,auth,enabled").eq("user_id", userId).eq("enabled", true);
  const subscriptions = (data ?? []) as PushSubscriptionRow[];
  if (subscriptions.length === 0) return { attempted: 0, sent: 0, skipped: pushAlerts.length };

  let sent = 0;
  let skipped = 0;
  for (const alert of pushAlerts) {
    const payload = pushPayloadForAlert(alert);
    for (const subscription of subscriptions) {
      const result = await sendViaConfiguredProvider(subscription, payload);
      if (result.sent) sent += 1;
      else skipped += 1;
    }
  }
  return { attempted: pushAlerts.length * subscriptions.length, sent, skipped };
}
