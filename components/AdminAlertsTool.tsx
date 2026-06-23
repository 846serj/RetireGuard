"use client";

import { useState } from "react";

export default function AdminAlertsTool() {
  const [source, setSource] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  async function draft() {
    setStatus("Drafting…");
    const res = await fetch("/api/admin/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source }) });
    const json = await res.json();
    setItems(json.items ?? []);
    setStatus(res.ok ? "Review the structured result before approving." : json.error ?? "Failed");
  }
  async function approve() {
    setStatus("Inserting…");
    const res = await fetch("/api/admin/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve", items }) });
    const json = await res.json();
    setStatus(res.ok ? `Inserted ${json.inserted?.length ?? 0} item(s).` : json.error ?? "Failed");
  }

  return <div className="space-y-4">
    <textarea value={source} onChange={(e) => setSource(e.target.value)} className="h-72 w-full rounded-xl border border-slate-300 p-3" placeholder="Paste source text here" />
    <button onClick={draft} className="rounded-xl bg-brand px-5 py-3 font-bold text-white">Draft structured alerts</button>
    {status && <p className="text-sm text-slate-600">{status}</p>}
    {items.length > 0 && <>
      <textarea value={JSON.stringify(items, null, 2)} onChange={(e) => { try { setItems(JSON.parse(e.target.value)); } catch {} }} className="h-72 w-full rounded-xl border border-slate-300 p-3 font-mono text-sm" />
      <button onClick={approve} className="rounded-xl bg-green-700 px-5 py-3 font-bold text-white">Approve and insert</button>
    </>}
  </div>;
}
