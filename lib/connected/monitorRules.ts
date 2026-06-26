import type { Alert } from "@/lib/alerts";
import type { SpendingTransaction } from "@/lib/engine/spending";

type FinancialPicture = {
  cushionMonths?: number;
  incomeSources?: { name: string; kind?: string; estimatedMonthlyAmount?: number; occurrences?: number }[];
};

type PortfolioAnalysis = {
  totalValue?: number;
  feeDragAnnual?: number;
  feeDragPct?: number;
  partial?: boolean;
};

type ScoreHistoryRow = {
  created_at?: string | null;
  checkedAt?: string | null;
  answers?: { savings?: number | string | null } | null;
  portfolioValue?: number | string | null;
  overall?: number | string | null;
};

export type MonitorRulesInput = {
  financialPicture?: FinancialPicture | null;
  portfolioAnalysis?: PortfolioAnalysis | null;
  recentTransactions?: SpendingTransaction[];
  scoreHistory?: ScoreHistoryRow[];
  now?: Date;
  economicSignals?: { interestRateChangeBps?: number; inflationRateChangeBps?: number; majorTaxLawChange?: boolean; taxLawSummary?: string };
};

function amountOf(txn: SpendingTransaction): number {
  const amount = Number(txn.amount ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function dateOf(txn: SpendingTransaction): Date | null {
  if (!txn.date) return null;
  const date = new Date(`${txn.date}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function payeeOf(txn: SpendingTransaction): string {
  return (txn.merchant_name ?? txn.name ?? "Unknown payee").trim().replace(/\s+/g, " ");
}

function normPayee(value: string): string {
  return value.toUpperCase().replace(/\b\d{2,}\b/g, "").replace(/[^A-Z ]/g, " ").replace(/\s+/g, " ").trim();
}

function alertBase(id: string, now: Date): Pick<Alert, "id" | "states" | "min_age" | "source_url" | "published_at" | "expires_at" | "status" | "created_at" | "personalized"> {
  const iso = now.toISOString();
  return { id, states: null, min_age: null, source_url: null, published_at: iso, expires_at: null, status: "published", created_at: iso, personalized: true };
}

function previousPortfolioValue(scoreHistory: ScoreHistoryRow[], now: Date): number | null {
  const target = now.getTime() - 30 * 86_400_000;
  const rows = scoreHistory
    .map((row) => {
      const stamp = row.created_at ?? row.checkedAt;
      const time = stamp ? new Date(stamp).getTime() : NaN;
      const value = Number(row.portfolioValue ?? row.answers?.savings ?? 0);
      return { time, value };
    })
    .filter((row) => Number.isFinite(row.time) && Number.isFinite(row.value) && row.value > 0)
    .sort((a, b) => Math.abs(a.time - target) - Math.abs(b.time - target));
  return rows[0]?.value ?? null;
}

function previousOverallScore(scoreHistory: ScoreHistoryRow[]): number | null {
  const rows = scoreHistory
    .map((row) => Number(row.overall ?? 0))
    .filter((value) => Number.isFinite(value) && value > 0);
  return rows.length >= 2 ? rows[rows.length - 2] : null;
}

function lastMonthWindow(now: Date) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59));
  return { start, end };
}

function hasRecentExpectedDeposit(txns: SpendingTransaction[], sourceName: string, expected: number, now: Date): boolean {
  const { start, end } = lastMonthWindow(now);
  const key = normPayee(sourceName);
  return txns.some((txn) => {
    const date = dateOf(txn);
    if (!date || date < start || date > end || amountOf(txn) >= 0) return false;
    return normPayee(payeeOf(txn)) === key && Math.abs(Math.abs(amountOf(txn)) - expected) <= Math.max(25, expected * 0.2);
  });
}

export function monitorRuleAlerts(input: MonitorRulesInput): Alert[] {
  const now = input.now ?? new Date();
  const financialPicture = input.financialPicture ?? {};
  const portfolio = input.portfolioAnalysis ?? {};
  const txns = input.recentTransactions ?? [];
  const alerts: Alert[] = [];

  const previous = previousPortfolioValue(input.scoreHistory ?? [], now);
  const current = Number(portfolio.totalValue ?? 0);
  if (previous && current > 0 && current < previous * 0.9) {
    const dropPct = Math.round((1 - current / previous) * 100);
    alerts.push({ ...alertBase("monitor-portfolio-drop", now), title: "Portfolio value is down more than 10%", body: `Connected holdings show an estimated ${dropPct}% decline versus roughly 30 days ago; check whether this is market movement, withdrawals, transfers, or stale data.`, category: "market", action_line: "What it means for you: Review whether your withdrawal plan still fits before making portfolio changes.", urgent: dropPct >= 15, delivery_channels: ["in_app", "email", "push"] });
  }

  const previousScore = previousOverallScore(input.scoreHistory ?? []);
  const currentScore = Number((input.scoreHistory ?? []).at(-1)?.overall ?? 0);
  if (previousScore && currentScore > 0 && previousScore - currentScore >= 8) {
    alerts.push({ ...alertBase("monitor-score-drop", now), title: "Safety Score dropped this month", body: `Your latest score is ${Math.round(previousScore - currentScore)} points lower than the prior check, usually from spending, market, inflation, or income changes.`, category: "market", action_line: "What it means for you: Open the score details and review the one change driving the drop.", urgent: previousScore - currentScore >= 12, delivery_channels: ["in_app", "email", "push"] });
  }

  const rateMove = Number(input.economicSignals?.interestRateChangeBps ?? 0);
  if (Math.abs(rateMove) >= 50) {
    alerts.push({ ...alertBase("monitor-interest-rate-move", now), title: "Interest rates moved sharply", body: `${Math.abs(rateMove)} bps rate move can affect cash yields, bond prices, annuity quotes, and borrowing costs.`, category: "inflation", action_line: "What it means for you: Re-check cash yield, debt cost, and bond risk assumptions before major moves.", delivery_channels: ["in_app", "email"] });
  }

  if (input.economicSignals?.majorTaxLawChange) {
    alerts.push({ ...alertBase("monitor-major-tax-law-change", now), title: "Major tax-law change flagged", body: input.economicSignals.taxLawSummary ?? "A major Congress or IRS tax-law update may affect brackets, deductions, credits, RMDs, or Medicare-related income planning.", category: "tax", action_line: "What it means for you: Review withholding, Roth conversion, RMD, and IRMAA assumptions with a tax professional.", delivery_channels: ["in_app", "email", "push"] });
  }

  for (const source of financialPicture.incomeSources ?? []) {
    if ((source.occurrences ?? 0) >= 2 && source.estimatedMonthlyAmount && !hasRecentExpectedDeposit(txns, source.name, source.estimatedMonthlyAmount, now)) {
      alerts.push({ ...alertBase(`monitor-missing-income-${normPayee(source.name).toLowerCase().replace(/\s+/g, "-")}`, now), title: "Expected income deposit may be missing", body: `We did not see the expected ${source.name} deposit of about $${Math.round(source.estimatedMonthlyAmount).toLocaleString()} in last month's window. Check the paying agency, pension administrator, or bank before adjusting spending.`, category: source.kind === "social_security" ? "ss" : "benefit", action_line: "Ask: Did this income arrive in another account, arrive late, or require follow-up?" });
      break;
    }
  }

  if (Number.isFinite(financialPicture.cushionMonths) && Number(financialPicture.cushionMonths) < 3) {
    alerts.push({ ...alertBase("monitor-cash-cushion-low", now), title: "Cash cushion is below three months", body: `Connected balances and essential spending estimate a ${Number(financialPicture.cushionMonths).toFixed(1)} month cash cushion. A low cushion can force withdrawals or card debt during surprises.`, category: "benefit", action_line: "Ask: What expense or transfer would rebuild at least three months of essential cash?" });
  }

  const cutoff = now.getTime() - 30 * 86_400_000;
  const priorPayees = new Set(txns.filter((txn) => { const date = dateOf(txn); return date && date.getTime() < cutoff; }).map((txn) => normPayee(payeeOf(txn))).filter(Boolean));
  const largeNew = txns.find((txn) => { const date = dateOf(txn); const payee = normPayee(payeeOf(txn)); return date && date.getTime() >= cutoff && amountOf(txn) > 2000 && payee && !priorPayees.has(payee); });
  if (largeNew) {
    alerts.push({ ...alertBase("monitor-new-large-payee", now), title: "New large payee detected", body: `A transfer of $${Math.round(amountOf(largeNew)).toLocaleString()} to ${payeeOf(largeNew)} is larger than $2,000 and was not seen in prior connected history.`, category: "scam", action_line: "Ask: Did I authorize this transfer, and have I verified the payee outside email or text links?" });
  }

  const feePct = Number(portfolio.feeDragPct ?? 0);
  if (feePct >= 0.006 || Number(portfolio.feeDragAnnual ?? 0) >= 1000) {
    alerts.push({ ...alertBase("monitor-fee-drag-high", now), title: "Portfolio fee drag looks high", body: `Known fund expense ratios suggest about $${Math.round(Number(portfolio.feeDragAnnual ?? 0)).toLocaleString()} per year of fund expenses${portfolio.partial ? " based on partial data" : ""}. Lower fees are not always better, but this is worth reviewing.`, category: "tax", action_line: "Ask: Which holdings drive my annual fund costs, and are lower-cost equivalents appropriate?" });
  }

  return alerts;
}
