import type { Alert } from "@/lib/alerts";

const CATEGORY_LABELS: Record<string, string> = {
  benefit: "Benefit",
  healthcare: "Healthcare",
  medicare: "Medicare",
  ss: "Social Security",
  tax: "Tax",
  inflation: "Inflation",
  market: "Markets",
  costofliving: "Cost of living",
  scam: "Scam watch",
};

type AlertFeedProps = {
  alerts: Alert[];
};

function formatAlertDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function compactLine(value: string) {
  return value.replace(/^(Ask|What to ask|What to do|What it means for you):\s*/i, "").replace(/\s+/g, " ").trim();
}

function getAskLine(alert: Alert) {
  if (alert.action_line) return alert.action_line;
  if (alert.what_to_ask) return alert.what_to_ask;

  switch (alert.category) {
    case "benefit":
      return "What to ask: Does this change any benefit or eligibility deadline I should review?";
    case "medicare":
      return "What to ask: Could this affect my Medicare, premiums, prescriptions, or out-of-pocket costs?";
    case "ss":
      return "What to ask: Could this affect my Social Security claiming, COLA, or household income plan?";
    case "tax":
      return "What to ask: Could this affect my taxes, RMDs, withholding, or Medicare premium thresholds?";
    case "healthcare":
      return "What to ask: Could this affect my Medicare, premiums, prescriptions, or out-of-pocket costs?";
    case "inflation":
    case "costofliving":
      return "What to ask: Should I update my spending assumptions or cash cushion for this?";
    case "scam":
      return "What to do: Pause, verify through an official source, and avoid sharing personal or financial information.";
    default:
      return "What to ask: Is there anything in my plan I should review because of this?";
  }
}

export default function AlertFeed({ alerts }: AlertFeedProps) {
  return (
    <section className="mb-8" aria-labelledby="alerts-heading">
      <div className="mb-5 max-w-3xl">
        <p className="rg-kicker">Retirement Watch</p>
        <h2 id="alerts-heading" className="mt-2 text-3xl font-extrabold">Alerts matched to you</h2>
        <p className="mt-3 text-slate-700">
          We watch Social Security, COLA, Medicare, taxes, inflation, markets, and scam signals for timely updates relevant to you.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="rg-card border-emerald-200 bg-emerald-50/70">
          <p className="font-serif text-2xl font-semibold text-ink">All clear.</p>
          <p className="mt-2 text-slate-700">
            We&apos;re watching — if anything changes that affects your plan, you&apos;ll see it here and get an email.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <article key={alert.id} className="rg-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-accent">
                  {CATEGORY_LABELS[alert.category] ?? alert.category}
                </span>
                <time className="text-sm font-semibold text-slate-500" dateTime={alert.published_at ?? alert.created_at}>{formatAlertDate(alert.published_at ?? alert.created_at)}</time>
              </div>
              <h3 className="mt-4 truncate font-serif text-2xl font-semibold text-ink">{alert.title}</h3>
              <p className="mt-2 truncate text-sm font-semibold text-slate-700">
                <span className="text-slate-500">What it means for you: </span>{compactLine(getAskLine(alert))}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
