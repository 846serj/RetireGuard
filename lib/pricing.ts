export type BillingCycle = "monthly" | "annual";
export type TierKey = "free" | "plus" | "premium" | "concierge";

export type PriceTier = {
  key: TierKey;
  name: string;
  monthlyCents: number;
  description: string;
  cta?: string;
  popular?: boolean;
  from?: boolean;
};

export const pricingTiers: PriceTier[] = [
  { key: "free", name: "Free", monthlyCents: 0, description: "Safety Score + 3 actions" },
  { key: "plus", name: "Plus", monthlyCents: 1900, description: "Monthly monitoring + AI coach" },
  { key: "premium", name: "Premium", monthlyCents: 3900, description: "Unlimited coach, Medicare/SS deep tools, score history", popular: true },
  { key: "concierge", name: "Concierge", monthlyCents: 9900, description: "A human retirement coach, done-for-you checkups", from: true },
];

export function annualCents(monthlyCents: number) {
  return monthlyCents * 10;
}

export function savingsCents(monthlyCents: number) {
  return monthlyCents * 2;
}

function dollars(cents: number) {
  const amount = cents / 100;
  return Number.isInteger(amount) ? `$${amount.toLocaleString("en-US")}` : `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatMonthly(tier: PriceTier) {
  return `${tier.from ? "from " : ""}${dollars(tier.monthlyCents)}/mo`;
}

export function formatAnnual(tier: PriceTier) {
  return `${tier.from ? "from " : ""}${dollars(annualCents(tier.monthlyCents))}/year`;
}

export function formatAnnualSavings(tier: PriceTier) {
  return `save ${dollars(savingsCents(tier.monthlyCents))}`;
}

export function primaryPrice(tier: PriceTier, billing: BillingCycle) {
  return billing === "monthly" ? formatMonthly(tier) : formatAnnual(tier);
}

export function alternatePrice(tier: PriceTier, billing: BillingCycle) {
  if (tier.monthlyCents === 0) return billing === "monthly" ? "or $0/year" : "$0/mo billed annually";

  if (billing === "monthly") {
    return `or ${formatAnnual(tier)} — ${formatAnnualSavings(tier)}`;
  }

  return `${tier.from ? "from " : ""}${dollars(annualCents(tier.monthlyCents) / 12)}/mo billed annually`;
}
