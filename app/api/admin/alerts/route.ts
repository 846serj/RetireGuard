import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { curateAlertsFromSource } from "@/lib/ai/alerts";

function authorized(req: Request) {
  const user = process.env.ADMIN_BASIC_USER;
  const pass = process.env.ADMIN_BASIC_PASSWORD;
  if (!user || !pass) return false;
  const header = req.headers.get("authorization") ?? "";
  const [u, p] = Buffer.from(header.replace(/^Basic\s+/i, ""), "base64").toString().split(":");
  return u === user && p === pass;
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "WWW-Authenticate": "Basic" } });
  const body = await req.json();
  if (body.action === "approve") {
    const items = Array.isArray(body.items) ? body.items : [];
    const rows = items.map((it: any) => ({ title: it.title, body: it.body, category: it.category, states: it.states ?? [], min_age: it.min_age ?? 0 }));
    if (rows.length === 0) return NextResponse.json({ error: "No items" }, { status: 400 });
    const { data, error } = await createServiceClient().from("content_items").insert(rows).select("id,title");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ inserted: data });
  }
  const source = String(body.source ?? "");
  return NextResponse.json({ items: await curateAlertsFromSource(source) });
}
