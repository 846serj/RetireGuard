"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPublicBaseUrl } from "@/lib/siteUrl";

type AuthMode = "password" | "link" | "signup" | "reset" | "update";

function getAuthRedirectUrl(nextPath: string) {
  const callbackUrl = new URL(`${getPublicBaseUrl(window.location.origin)}/auth/callback`);
  callbackUrl.searchParams.set("next", nextPath);
  return callbackUrl.toString();
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    return next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  }, [searchParams]);

  const [mode, setMode] = useState<AuthMode>(searchParams.get("setPassword") === "1" ? "update" : "password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const normalizedEmail = email.trim();
  const canSubmit = mode === "update" ? password.length >= 6 : normalizedEmail.includes("@") && (mode === "link" || mode === "reset" || password.length >= 6);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setSent(false);
    setErr("");
  }

  async function submit() {
    setErr("");
    setSending(true);
    const supabase = createClient();

    if (mode === "password") {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      setSending(false);
      if (error) {
        setErr(error.message);
      } else {
        router.replace(nextPath);
        router.refresh();
      }
      return;
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { emailRedirectTo: getAuthRedirectUrl(nextPath) },
      });
      setSending(false);
      if (error) setErr(error.message);
      else setSent(true);
      return;
    }

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: getAuthRedirectUrl("/login?setPassword=1"),
      });
      setSending(false);
      if (error) setErr(error.message);
      else setSent(true);
      return;
    }

    if (mode === "update") {
      const { error } = await supabase.auth.updateUser({ password });
      setSending(false);
      if (error) {
        setErr(error.message);
      } else {
        router.replace(nextPath);
        router.refresh();
      }
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: getAuthRedirectUrl(nextPath),
        shouldCreateUser: true,
      },
    });
    setSending(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  const copy = {
    password: {
      title: "Sign in instantly",
      button: "Sign in",
      sent: "You're signed in.",
      help: "Use the email and password on your RetireShield account.",
    },
    signup: {
      title: "Create your RetireShield login",
      button: "Create account",
      sent: "Check your email to confirm your new account.",
      help: "Create a password so you can sign in immediately next time.",
    },
    reset: {
      title: "Set or reset your password",
      button: "Email me a password reset link",
      sent: "Check your email for a password reset link.",
      help: "If you previously used email links only, set a password here for instant sign-in.",
    },
    update: {
      title: "Choose your new password",
      button: "Save password and sign in",
      sent: "Your password has been updated.",
      help: "Enter a new password for instant sign-in next time.",
    },
    link: {
      title: "Email me a secure sign-in link",
      button: "Email me a sign-in link",
      sent: "Check your email for a secure sign-in link.",
      help: "No password needed. We'll email you a one-time link.",
    },
  }[mode];

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold mb-3">Sign in to RetireShield</h1>
      <p className="mb-6 text-slate-600">Account holders can sign in right away with a password. Email links are still available as a backup.</p>

      {mode !== "update" && <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2 text-sm font-bold">
        <button type="button" onClick={() => switchMode("password")} className={`rounded-xl px-3 py-2 ${mode === "password" ? "bg-white shadow" : "text-slate-600"}`}>Password</button>
        <button type="button" onClick={() => switchMode("link")} className={`rounded-xl px-3 py-2 ${mode === "link" ? "bg-white shadow" : "text-slate-600"}`}>Email link</button>
      </div>}

      {sent ? (
        <div className="space-y-4">
          <p className="text-lg">{copy.sent}</p>
          <button type="button" onClick={() => switchMode("password")} className="font-bold text-brand">Back to password sign-in</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">{copy.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{copy.help}</p>
          </div>
          {mode !== "update" && (
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-lg"
            />
          )}
          {mode !== "link" && mode !== "reset" && (
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === "password" ? "current-password" : "new-password"}
              className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-lg"
            />
          )}
          <button
            disabled={!canSubmit || sending} onClick={submit}
            className="w-full rounded-xl bg-brand px-6 py-3 text-lg font-bold text-white disabled:opacity-50"
          >
            {sending ? "Please wait..." : copy.button}
          </button>
          {err && <p className="text-bad text-sm">{err}</p>}
          <div className="space-y-2 text-sm text-slate-600">
            {mode === "password" && <button type="button" onClick={() => switchMode("reset")} className="font-bold text-brand">Need to set or reset your password?</button>}
            {mode !== "signup" && mode !== "update" && <p>New here? <button type="button" onClick={() => switchMode("signup")} className="font-bold text-brand">Create a password account.</button></p>}
            {mode !== "password" && mode !== "update" && <p>Already have a password? <button type="button" onClick={() => switchMode("password")} className="font-bold text-brand">Sign in instantly.</button></p>}
          </div>
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
