"use client";

import type { BillingCycle } from "@/lib/pricing";

export function BillingToggle({ billing, setBilling }: { billing: BillingCycle; setBilling: (billing: BillingCycle) => void }) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm" role="group" aria-label="Choose billing cycle">
      {(["monthly", "annual"] as BillingCycle[]).map((cycle) => (
        <button key={cycle} type="button" onClick={() => setBilling(cycle)} aria-pressed={billing === cycle} className={`rounded-xl px-5 py-3 text-sm font-extrabold transition sm:text-base ${billing === cycle ? "bg-brand text-white" : "text-slate-700 hover:bg-band"}`}>
          {cycle === "monthly" ? "Monthly" : "Annual"}
          {cycle === "annual" ? <span className="ml-2 rounded-full bg-alert px-2 py-0.5 text-xs text-ink">2 months free</span> : null}
        </button>
      ))}
    </div>
  );
}
