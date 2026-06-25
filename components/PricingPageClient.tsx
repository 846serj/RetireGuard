"use client";

import { Fragment, useId, useState } from "react";
import { Check, Minus, ShieldCheck, Sparkles, UserRoundCheck } from "lucide-react";
import { BillingToggle } from "@/components/BillingToggle";
import { Button, Container, Eyebrow } from "@/components/ui";
import { alternatePrice, type BillingCycle, pricingTiers, primaryPrice, type TierKey } from "@/lib/pricing";

type FeatureValue = boolean | string;

type FeatureRow = {
  label: string;
  values: Record<TierKey, FeatureValue>;
};

type FeatureGroup = {
  name: string;
  rows: FeatureRow[];
};

const tiers = pricingTiers.map((tier) => ({
  ...tier,
  description: {
    free: "Verdict, trigger, safe max, and your safe-to-spend number.",
    plus: "Unlock decision depth, calculation trace, history, and connected accounts.",
    premium: "Plus with existing Medicare/IRMAA, Social Security, and score-history tools.",
    concierge: "Premium plus human checkups and done-for-you organization.",
  }[tier.key],
  cta: { free: "Start free", plus: "Choose Plus", premium: "Choose Premium", concierge: "Talk to us" }[tier.key],
}));

const featureGroups: FeatureGroup[] = [
  { name: "Safety Score & actions", rows: [
    { label: "Can I afford it? verdict + trigger", values: { free: true, plus: true, premium: true, concierge: true } },
    { label: "Safe max + safe-to-spend number", values: { free: true, plus: true, premium: true, concierge: true } },
    { label: "Tax/Medicare ripple", values: { free: false, plus: true, premium: true, concierge: true } },
    { label: "Alternatives + how calculated trace", values: { free: false, plus: true, premium: true, concierge: true } },
  ] },
  { name: "Monthly monitoring & alerts", rows: [
    { label: "Saved decision history", values: { free: false, plus: true, premium: true, concierge: true } },
    { label: "Connect accounts", values: { free: false, plus: true, premium: true, concierge: true } },
    { label: "Score history", values: { free: false, plus: false, premium: true, concierge: true } },
  ] },
  { name: "AI coach", rows: [
    { label: "Ask retirement questions", values: { free: "Limited preview", plus: "Monthly allowance", premium: "Unlimited", concierge: "Unlimited" } },
    { label: "Scenario explanations", values: { free: false, plus: true, premium: true, concierge: true } },
    { label: "Plain-English action drafts", values: { free: false, plus: false, premium: true, concierge: true } },
  ] },
  { name: "Medicare & Social Security tools", rows: [
    { label: "Social Security planning tools", values: { free: false, plus: false, premium: true, concierge: true } },
    { label: "Medicare and IRMAA checks", values: { free: false, plus: false, premium: true, concierge: true } },
    { label: "Expanded deep planners", values: { free: false, plus: false, premium: "Included — rolling out", concierge: "Included — rolling out" } },
  ] },
  { name: "Score history", rows: [
    { label: "Saved Safety Scores", values: { free: "Current only", plus: "12 months", premium: "Full history", concierge: "Full history" } },
    { label: "Trend view", values: { free: false, plus: true, premium: true, concierge: true } },
    { label: "Downloadable checkup summary", values: { free: false, plus: false, premium: true, concierge: true } },
  ] },
  { name: "Human Concierge checkups", rows: [
    { label: "Human retirement checkups", values: { free: false, plus: false, premium: false, concierge: true } },
    { label: "Family-ready summary", values: { free: false, plus: false, premium: false, concierge: true } },
    { label: "Done-for-you monitoring review", values: { free: false, plus: false, premium: false, concierge: true } },
  ] },
];

const faqs = [
  { question: "What's free?", answer: "The Free plan includes your Retirement Safety Score and three personalized actions so you can see your biggest risks before paying anything." },
  { question: "Do I need a credit card?", answer: "No for Free. Yes for Plus and Premium trials: they are 7-day, card-required trials that auto-convert unless you cancel anytime before the trial ends." },
  { question: "Can I cancel anytime?", answer: "Yes. There are no contracts, and you can cancel before your next renewal." },
  { question: "Is my data safe?", answer: "We use privacy-minded product design and keep your information protected. We never sell your personal data." },
  { question: "What information do I enter?", answer: "Start with approximate retirement details like savings, income, spending, and timing goals. You can update them as your picture changes." },
  { question: "How do I choose a plan?", answer: "Start free if you want a first Safety Score. Upgrade when you want saved history, monitoring, scenarios, and deeper planning tools." },
  { question: "What's Concierge?", answer: "Concierge adds human checkups for people who want another set of eyes on their RetireShield information and action plan." },
  { question: "How does the annual discount work?", answer: "Annual billing gives you 12 months for the price of 10 — the same as 2 months free compared with monthly billing." },
];

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-good" aria-label="Included" />;
  if (value === false) return <Minus className="mx-auto h-5 w-5 text-slate-300" aria-label="Not included" />;
  return <span className="text-sm font-semibold text-slate-700">{value}</span>;
}


export default function PricingPageClient() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const faqHeadingId = useId();

  return (
    <main>
      <section className="bg-gradient-to-b from-band via-white to-white py-16 sm:py-20 lg:py-24"><Container><div className="mx-auto max-w-3xl text-center"><Eyebrow>Pricing</Eyebrow><h1 className="mt-5 text-5xl font-extrabold tracking-tight text-ink sm:text-6xl lg:text-7xl">Simple pricing. Start free.</h1><p className="mx-auto mt-6 max-w-2xl text-2xl font-semibold leading-9 text-slate-700">No contracts. Cancel anytime.</p><div className="mt-8"><BillingToggle billing={billing} setBilling={setBilling} /></div></div><div className="mt-12 grid gap-5 lg:grid-cols-4">{tiers.map((tier) => <article key={tier.key} className={`relative flex h-full flex-col rounded-3xl border p-6 shadow-sm ${tier.popular ? "border-brand bg-brand text-white shadow-xl" : "border-slate-200 bg-white text-ink"}`}>{tier.popular ? <div className="mb-4 flex justify-center"><span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-brand shadow-sm">Most popular</span></div> : null}<h2 className={`text-2xl font-extrabold ${tier.popular ? "text-white" : "text-ink"}`}>{tier.name}</h2><p className={`mt-5 text-4xl font-extrabold tracking-tight ${tier.popular ? "text-white" : "text-brand"}`}>{primaryPrice(tier, billing)}</p><p className={`mt-1 text-sm font-bold ${tier.popular ? "text-white/80" : "text-slate-500"}`}>{alternatePrice(tier, billing)}</p><p className={`mt-5 flex-1 text-lg font-semibold leading-8 ${tier.popular ? "text-white/90" : "text-slate-700"}`}>{tier.description}</p><Button href={tier.key === "free" ? "/quiz" : "/upgrade"} variant={tier.popular ? "secondary" : "primary"} className="mt-7 w-full">{tier.cta}</Button></article>)}</div></Container></section>

      <section className="py-14 sm:py-20" aria-labelledby="comparison-heading"><Container><div className="mb-8 max-w-3xl"><Eyebrow>Compare tiers</Eyebrow><h2 id="comparison-heading" className="mt-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Full feature comparison</h2></div><div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[920px] border-collapse text-left"><caption className="sr-only">ComparisonTable of RetireShield pricing tier features</caption><thead className="bg-band text-sm uppercase tracking-[0.14em] text-slate-600"><tr><th scope="col" className="w-1/3 px-6 py-5">Feature</th>{tiers.map((tier) => <th key={tier.key} scope="col" className="px-4 py-5 text-center">{tier.name}</th>)}</tr></thead><tbody>{featureGroups.map((group) => <Fragment key={group.name}><tr className="border-t border-slate-200 bg-slate-50"><th scope="colgroup" colSpan={5} className="px-6 py-4 text-lg font-extrabold text-ink">{group.name}</th></tr>{group.rows.map((row) => <tr key={row.label} className="border-t border-slate-100"><th scope="row" className="px-6 py-4 text-base font-bold text-slate-800">{row.label}</th>{tiers.map((tier) => <td key={tier.key} className="px-4 py-4 text-center"><FeatureCell value={row.values[tier.key]} /></td>)}</tr>)}</Fragment>)}</tbody></table></div></Container></section>

      <section className="bg-ink py-14 text-white sm:py-20" aria-labelledby="advisor-cost-heading"><Container className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center"><div><Eyebrow className="bg-white/10 text-white">Advisor cost check</Eyebrow><h2 id="advisor-cost-heading" className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Know what 1% can cost.</h2><p className="mt-6 text-2xl font-semibold leading-10 text-white/85">An advisor typically charges about 1% of your savings every year. On $500,000 that&apos;s roughly $5,000 a year. RetireShield Premium is $390 a year.</p></div><div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl"><ShieldCheck className="h-12 w-12 text-alert" aria-hidden="true" /><p className="mt-5 text-3xl font-extrabold">$4,610 less per year</p><p className="mt-3 text-lg text-white/75">A simple lower-cost option before paying percentage-based fees.</p></div></Container></section>

      <section className="py-14 sm:py-20" aria-labelledby={faqHeadingId}><Container><div className="mx-auto max-w-3xl text-center"><Sparkles className="mx-auto h-10 w-10 text-brand" aria-hidden="true" /><h2 id={faqHeadingId} className="mt-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Pricing FAQ</h2></div><div className="mx-auto mt-10 max-w-3xl space-y-4">{faqs.map((faq) => <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-extrabold text-ink">{faq.question}<UserRoundCheck className="h-6 w-6 shrink-0 text-brand transition group-open:rotate-45" aria-hidden="true" /></summary><p className="mt-4 text-lg leading-8 text-slate-700">{faq.answer}</p></details>)}</div></Container></section>
    </main>
  );
}
