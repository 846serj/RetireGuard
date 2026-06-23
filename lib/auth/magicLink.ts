import { createClient } from "@supabase/supabase-js";

export const AUTH_EMAIL_COOLDOWN_MS = 10 * 60 * 1000;

type AuthEmailAttempt = {
  nextAllowedAt: number;
};

type SendMagicLinkResult =
  | { sent: true }
  | { sent: false; reason: string; rateLimited?: false }
  | { sent: false; reason: string; rateLimited: true; nextAllowedAt: number; retryAfterSeconds: number };

const authEmailAttempts = new Map<string, AuthEmailAttempt>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAuthEmailCooldown(email: string, now = Date.now()) {
  const key = normalizeEmail(email);
  const attempt = authEmailAttempts.get(key);

  if (!attempt || attempt.nextAllowedAt <= now) {
    if (attempt) authEmailAttempts.delete(key);
    return null;
  }

  return {
    nextAllowedAt: attempt.nextAllowedAt,
    retryAfterSeconds: Math.ceil((attempt.nextAllowedAt - now) / 1000),
  };
}

function rememberAuthEmailAttempt(email: string, now = Date.now()) {
  authEmailAttempts.set(normalizeEmail(email), {
    nextAllowedAt: now + AUTH_EMAIL_COOLDOWN_MS,
  });
}

export async function sendSupabaseMagicLink(email: string, emailRedirectTo: string): Promise<SendMagicLinkResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.log(`[auth stub] would send verification link to ${email}`);
    return { sent: false, reason: "auth not configured" };
  }

  const cooldown = getAuthEmailCooldown(email);
  if (cooldown) {
    return {
      sent: false,
      reason: "Please wait before requesting another sign-in email.",
      rateLimited: true,
      ...cooldown,
    };
  }

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizeEmail(email),
    options: {
      emailRedirectTo,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("verification email failed:", error.message);
    return { sent: false, reason: error.message };
  }

  rememberAuthEmailAttempt(email);
  return { sent: true };
}
