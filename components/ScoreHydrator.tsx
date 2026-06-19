"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// If the user took the Score anonymously (stored in localStorage) and has no saved score yet,
// claim it to their account on first dashboard load.
export default function ScoreHydrator({ hasScore }: { hasScore: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (hasScore) return;
    const raw = localStorage.getItem("rg_score");
    if (!raw) return;
    (async () => {
      try {
        const parsed = JSON.parse(raw);
        const res = await fetch("/api/score-save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed),
        });
        if (res.ok) {
          localStorage.removeItem("rg_score");
          router.refresh();
        }
      } catch {
        /* ignore malformed cache */
      }
    })();
  }, [hasScore, router]);
  return null;
}
