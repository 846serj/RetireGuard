import type { CookieOptions } from "@supabase/ssr";

export const RETIRESHIELD_AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function withPersistentAuthCookie(options: CookieOptions): CookieOptions {
  if (typeof options.maxAge === "number") return options;

  return {
    ...options,
    maxAge: RETIRESHIELD_AUTH_COOKIE_MAX_AGE,
  };
}
