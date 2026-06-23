import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPaidAccess } from "@/lib/subscription";
import { getAnthropicClient, anthropicModel, timeoutSignal } from "@/lib/ai/client";
import { SAFETY_SYSTEM } from "@/lib/ai/guardrails";

const MAX_PER_HOUR = 20;
const fallback = "The AI coach is unavailable right now. RetireShield is education only and never asks for account numbers, SSNs, passwords, or payments. For personal decisions, talk with a licensed fiduciary.";

type IncomingMessage = { role: "user" | "assistant"; content: string };

function cleanMessages(input: unknown): IncomingMessage[] {
  if (!Array.isArray(input)) return [];
  return input.slice(-10).filter((m): m is IncomingMessage =>
    !!m && ["user", "assistant"].includes((m as any).role) && typeof (m as any).content === "string"
  ).map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await hasPaidAccess(user.id))) return NextResponse.json({ ok: false }, { status: 401 });

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("coach_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_HOUR) return NextResponse.json({ error: "Rate limit reached" }, { status: 429 });
  await supabase.from("coach_usage").insert({ user_id: user.id });

  try {
    const body = await req.json();
    const messages = cleanMessages(body.messages);
    if (messages.length === 0) return NextResponse.json({ error: "messages required" }, { status: 400 });

    const { data: latest } = await supabase
      .from("scores")
      .select("overall, band, sub_scores, answers, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const client = await getAnthropicClient();
    if (!client) return new Response(fallback, { headers: { "Content-Type": "text/plain; charset=utf-8" } });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const claudeStream = await client.messages.create({
            model: anthropicModel,
            max_tokens: 900,
            temperature: 0.3,
            stream: true,
            system: `${SAFETY_SYSTEM}\n\nUser context for personalization. Do not reveal raw JSON; use it only to provide education. Latest profile/score: ${JSON.stringify(latest ?? {})}`,
            messages,
          }, { signal: timeoutSignal(20_000) });

          for await (const event of claudeStream as AsyncIterable<any>) {
            if (event?.type === "content_block_delta" && event.delta?.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (error) {
          console.error("Coach stream failed", error);
          controller.enqueue(encoder.encode(fallback));
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error) {
    console.error("Coach failed", error);
    return new Response(fallback, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
