import { NextRequest, NextResponse } from "next/server";
import { sendSupabaseMagicLink } from "@/lib/auth/magicLink";
import { getPublicBaseUrl } from "@/lib/siteUrl";

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function safeNextPath(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  if (!isValidEmail(body?.email)) {
    return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
  }

  const callbackUrl = new URL(`${getPublicBaseUrl(req.url)}/auth/callback`);
  callbackUrl.searchParams.set("next", safeNextPath(body?.next));

  const result = await sendSupabaseMagicLink(body.email, callbackUrl.toString());
  if (!result.sent) {
    return NextResponse.json(
      {
        ok: false,
        error: result.reason,
        rateLimited: Boolean(result.rateLimited),
        retryAfterSeconds: result.rateLimited ? result.retryAfterSeconds : undefined,
      },
      { status: result.rateLimited ? 429 : 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
