"use client";

import { useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function PushNotifications() {
  const [status, setStatus] = useState<string>("Browser push is available for urgent, personalized alerts when enabled.");
  const [busy, setBusy] = useState(false);

  async function enablePush() {
    setBusy(true);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setStatus("This browser does not support web push notifications.");
        return;
      }
      const config = await fetch("/api/push/subscribe").then((res) => res.json());
      if (!config.publicKey) {
        setStatus("Push is a fast-follow: add NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY plus server delivery credentials to enable sending.");
        return;
      }
      if (!config.configured) {
        setStatus("Push subscription storage is ready; server delivery is a labeled fast-follow until WEB_PUSH_SEND_ENDPOINT and credentials are configured.");
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("Notification permission was not granted.");
        return;
      }
      const registration = await navigator.serviceWorker.register("/push-sw.js");
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(config.publicKey) });
      const response = await fetch("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(subscription) });
      setStatus(response.ok ? "Push notifications are enabled for urgent, personalized alerts." : "We could not save this push subscription yet.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Push setup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rg-card mb-5" aria-labelledby="push-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="rg-kicker">Push alerts</p>
          <h2 id="push-heading" className="mt-1 text-2xl font-extrabold">Browser notifications</h2>
          <p className="mt-2 text-sm font-semibold text-slate-700">{status}</p>
        </div>
        <button type="button" onClick={enablePush} disabled={busy} className="rounded-2xl bg-brand px-5 py-3 text-sm font-extrabold text-white shadow-sm disabled:opacity-60">
          {busy ? "Enabling…" : "Enable push"}
        </button>
      </div>
    </section>
  );
}
