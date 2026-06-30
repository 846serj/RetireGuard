import { Disclaimer, Eyebrow } from "@/components/ui";

export default function RefundPolicy() {
  return (
    <div className="rg-page-shell">
      <article className="mx-auto max-w-3xl px-4 py-12 text-lg leading-8 text-slate-700 sm:py-16">
        <div className="rg-card">
          <Eyebrow>Refunds</Eyebrow>
          <h1 className="mb-2 mt-3 text-4xl font-bold text-ink sm:text-5xl">Refund Policy</h1>
          <p className="mb-8 text-sm font-medium text-slate-500">Last updated: June 29, 2026</p>

          <p className="mb-6 font-semibold text-slate-800">Effective date: June 29, 2026</p>

          <h2 className="mt-10 mb-4 text-2xl font-bold text-ink">RetireShield is currently free</h2>
          <p className="mb-6">
            There are no charges, subscriptions, or fees, and therefore nothing to refund at this time. The Retirement
            Safety Score and our email updates are provided at no cost.
          </p>

          <h2 className="mt-10 mb-4 text-2xl font-bold text-ink">If we launch paid plans</h2>
          <p className="mb-6">
            If we introduce paid features in the future, the full pricing, free-trial, cancellation, and refund terms
            will be shown to you at checkout before you are charged, and this page will be updated to reflect them.
          </p>

          <h2 className="mt-10 mb-4 text-2xl font-bold text-ink">Contact</h2>
          <p>contact@retireshield.com — American Signal Media, LLC, 598 West Interstate 30, Royse City, TX 75189.</p>
        </div>
        <Disclaimer className="mt-8" />
      </article>
    </div>
  );
}
