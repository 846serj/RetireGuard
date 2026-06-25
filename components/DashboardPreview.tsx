import Link from "next/link";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";

const promptChips = [
  "Should I delay Social Security?",
  "Am I ready for a market drop?",
  "Will an extra withdrawal raise my Medicare?",
];

export default function DashboardPreview() {
  return (
    <section
      role="img"
      aria-label="Example RetireShield dashboard preview"
      className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-surface shadow-[0_20px_50px_-24px_rgba(22,58,102,0.45)]"
    >
      <div className="flex h-10 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-2 text-sm font-extrabold text-ink">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand" aria-hidden="true">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
          <span>Your dashboard</span>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-slate-500">
          Baseline
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
          <div aria-label="Retirement safety score gauge showing 82 out of 100">
            <ScoreGauge value={82} subtitle="Baseline plan" badge="Secure" subScores={[]} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-extrabold text-score-secure ring-1 ring-emerald-100">
              ▲ +4 since last month
            </span>
            <p className="text-sm font-semibold text-slate-500">Last checked today · we re-check monthly</p>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
          <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Safe to spend this year</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-serif text-3xl font-semibold leading-none text-ink">$4,150/mo</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">Your money lasts to age 96 at this pace.</p>
            </div>
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-brand">
              Age 67–96
            </span>
          </div>
          <svg viewBox="0 0 420 118" className="mt-5 h-28 w-full" role="img" aria-label="Projected safe spending sparkline trending up">
            <defs>
              <linearGradient id="dashboardPreviewSparkline" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1D4E89" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#1D4E89" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <path d="M0 97 C48 90 61 82 98 84 C140 87 154 72 190 68 C230 64 240 51 276 54 C319 58 340 34 420 24 L420 118 L0 118 Z" fill="url(#dashboardPreviewSparkline)" />
            <path d="M0 97 C48 90 61 82 98 84 C140 87 154 72 190 68 C230 64 240 51 276 54 C319 58 340 34 420 24" fill="none" stroke="#1D4E89" strokeLinecap="round" strokeWidth="5" />
            <circle cx="420" cy="24" r="6" fill="#1D4E89" />
          </svg>
        </article>

        <aside className="flex flex-col rounded-2xl bg-band p-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-sm font-extrabold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand shadow-sm shadow-slate-200" aria-hidden="true">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>Ask RetireShield</span>
          </div>

          <div className="mt-6 space-y-4 text-sm font-semibold leading-6">
            <div className="ml-6 rounded-2xl rounded-tr-sm bg-brand px-4 py-3 text-white shadow-sm shadow-brand/20">
              Can I afford a $25k kitchen remodel?
            </div>
            <div className="mr-4 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm shadow-slate-200/80">
              Yes — it dips your cushion slightly but keeps you ‘Secure’ (82 → 80). You still cover essentials past age 92.
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-score-secure ring-1 ring-emerald-100">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                how this was calculated
              </div>
            </div>
          </div>

          <div className="pt-6 lg:mt-auto">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">Try a planning question</p>
            <div className="flex flex-wrap gap-2">
              {promptChips.map((chip) => (
                <Link
                  key={chip}
                  href="/quiz"
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-brand no-underline shadow-sm shadow-slate-200/70 transition hover:border-brand/30 hover:bg-brand/10 hover:text-brand-dark motion-reduce:transition-none"
                >
                  {chip}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <article className="rounded-2xl border border-slate-200 border-l-4 border-l-brand bg-white p-5 shadow-sm shadow-slate-200/70 md:col-span-2 lg:col-span-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-brand">Medicare</p>
              <h3 className="mt-1 text-xl font-semibold text-ink">An IRMAA line is close</h3>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              A Roth move before December could keep you under the next surcharge — about $1,737/yr per person.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
