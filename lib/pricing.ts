export type BillingCycle = "monthly" | "annual";
export type TierKey = "free" | "plus" | "premium" | "concierge";
export type SelfServeTierKey = "plus" | "premium";

export type PriceTier = {
  key: TierKey;
  name: string;
  monthlyCents: number;
  annualCents: number;
  description: string;
  cta?: string;
  popular?: boolean;
  from?: boolean;
  trialDays?: number;
  selfServe?: boolean;
};

export const pricingTiers: PriceTier[] = [
  { key: "free", name: "Free", monthlyCents: 0, annualCents: 0, description: "Verdict + safe-to-spend number" },
  { key: "plus", name: "Plus", monthlyCents: 1900, annualCents: 19000, description: "Decision depth, history, and connected accounts", trialDays: 7, selfServe: true },
  { key: "premium", name: "Premium", monthlyCents: 3900, annualCents: 39000, description: "Plus plus Medicare, Social Security, and score history", popular: true, trialDays: 7, selfServe: true },
  { key: "concierge", name: "Concierge", monthlyCents: 9900, annualCents: 99000, description: "Human checkups and done-for-you organization", from: true },
];

export function isSelfServeTier(value: unknown): value is SelfServeTierKey {
  return value === "plus" || value === "premium";
}

export function checkoutPriceEnvName(tier: SelfServeTierKey, cadence: BillingCycle) {
  return `STRIPE_PRICE_${tier.toUpperCase()}_${cadence.toUpperCase()}`;
}

export function savingsCents(tier: PriceTier) {
  return tier.monthlyCents * 12 - tier.annualCents;
}

function dollars(cents: number) {
  const amount = cents / 100;
  return Number.isInteger(amount) ? `$${amount.toLocaleString("en-US")}` : `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatMonthly(tier: PriceTier) {
  return `${tier.from ? "from " : ""}${dollars(tier.monthlyCents)}/mo`;
}

export function formatAnnual(tier: PriceTier) {
  return `${tier.from ? "from " : ""}${dollars(tier.annualCents)}/yr`;
}

export function formatAnnualSavings(tier: PriceTier) {
  return `2 months free — save ${dollars(savingsCents(tier))}`;
}

export function primaryPrice(tier: PriceTier, billing: BillingCycle) {
  return billing === "monthly" ? formatMonthly(tier) : formatAnnual(tier);
}

export function alternatePrice(tier: PriceTier, billing: BillingCycle) {
  if (tier.monthlyCents === 0) return billing === "monthly" ? "or $0/yr" : "$0/mo billed annually";

  if (billing === "monthly") {
    return `or ${formatAnnual(tier)} — ${formatAnnualSavings(tier)}`;
  }

  return `${tier.from ? "from " : ""}${dollars(tier.annualCents / 12)}/mo billed annually`;
}
