"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    return next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (data.user) {
        router.replace(nextPath);
      } else {
        setCheckingSession(false);
      }
    }).catch(() => {
      if (mounted) setCheckingSession(false);
    });

    return () => {
      mounted = false;
    };
  }, [nextPath, router]);

  async function send() {
    const normalizedEmail = email.trim();
    setErr("");
    setSending(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, next: nextPath }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload.ok) {
        setErr(
          payload.rateLimited
            ? "We already sent a sign-in link. Please check your inbox, or wait a few minutes before requesting another one."
            : payload.error ?? "We could not send a sign-in link. Please try again.",
        );
      } else {
        setSent(true);
      }
    } catch {
      setErr("We could not reach the server. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (checkingSession) {
    return <div className="mx-auto max-w-md px-4 py-16">Checking your session…</div>;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Sign in to RetireShield</h1>
      {sent ? (
        <p className="text-lg">Check your email for a secure sign-in link.</p>
      ) : (
        <div className="space-y-4">
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-lg"
          />
          <button
            disabled={!email.trim().includes("@") || sending} onClick={send}
            className="w-full rounded-xl bg-brand px-6 py-3 text-lg font-bold text-white disabled:opacity-50"
          >
            {sending ? "Sending..." : "Email me a sign-in link"}
          </button>
          {err && <p className="text-bad text-sm">{err}</p>}
          <p className="text-xs text-slate-500">No passwords. We email you a one-time link.</p>
        </div>
      )}
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16">Loading sign in…</div>}>
      <LoginContent />
    </Suspense>
  );
}
