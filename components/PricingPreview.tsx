"use client";

import Link from "next/link";
import { useState } from "react";
import { BillingToggle } from "@/components/BillingToggle";
import { alternatePrice, type BillingCycle, pricingTiers, primaryPrice } from "@/lib/pricing";

function PricingCard({ tier, billing }: { tier: (typeof pricingTiers)[number]; billing: BillingCycle }) {
  return (
    <Link
      href="/pricing"
      className={`relative flex h-full flex-col rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand/20 ${
        tier.popular ? "border-brand bg-brand text-white shadow-lg" : "border-slate-200 bg-white text-ink hover:border-brand/30"
      }`}
    >
      {tier.popular ? <span className="absolute right-5 top-5 rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-brand">Most popular</span> : null}
      <h3 className={`text-xl font-extrabold ${tier.popular ? "pr-28 text-white" : "text-ink"}`}>{tier.name}</h3>
      <p className={`mt-5 text-4xl font-extrabold tracking-tight ${tier.popular ? "text-white" : "text-brand"}`}>{primaryPrice(tier, billing)}</p>
      <p className={`mt-1 text-sm font-bold ${tier.popular ? "text-white/80" : "text-slate-500"}`}>{alternatePrice(tier, billing)}</p>
      <p className={`mt-4 flex-1 text-lg font-semibold leading-8 ${tier.popular ? "text-white/90" : "text-slate-700"}`}>{tier.description}</p>
      <span className={`mt-6 text-sm font-extrabold uppercase tracking-[0.16em] ${tier.popular ? "text-white" : "text-brand"}`}>Compare plans →</span>
    </Link>
  );
}

export function PricingPreview() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  return (
    <>
      <div className="mt-6 text-center"><BillingToggle billing={billing} setBilling={setBilling} /></div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pricingTiers.map((tier) => <PricingCard key={tier.key} tier={tier} billing={billing} />)}
      </div>
    </>
  );
}
