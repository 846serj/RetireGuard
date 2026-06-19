import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Persists an authed user's Score (used to "claim" the score taken anonymously before sign-up).
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { answers, result } = await req.json();
  if (!result?.overall) return NextResponse.json({ ok: false, error: "no result" }, { status: 400 });

  // Avoid duplicate inserts if a score already exists.
  const { data: existing } = await supabase
    .from("scores").select("id").eq("user_id", user.id).limit(1).maybeSingle?.() ?? { data: null };

  if (!existing) {
    await supabase.from("scores").insert({
      user_id: user.id,
      overall: result.overall,
      sub_scores: result.sub,
      band: result.band,
      answers,
    });
  }
  return NextResponse.json({ ok: true });
}
