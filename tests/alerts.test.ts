import { test } from "node:test";
import assert from "node:assert";
import { datedTriggerAlerts, generateDraftAlertsFromNewsroom } from "../lib/alertGenerator";
import { getMatchedAlerts, type Alert } from "../lib/alerts";
import { monitorRuleAlerts } from "../lib/connected/monitorRules";

function supabaseWith(data: Alert[]) {
  const query: any = {
    select: () => query,
    or: () => query,
    order: () => query,
    limit: async () => ({ data }),
  };
  return { from: () => query };
}

test("dated trigger alerts include major Medicare, Social Security, and RMD windows", () => {
  const alerts = datedTriggerAlerts();
  assert.ok(alerts.some((alert) => alert.title.includes("Medicare Open Enrollment") && alert.min_age === 63));
  assert.ok(alerts.some((alert) => alert.category === "ss" && alert.title.includes("COLA")));
  assert.ok(alerts.some((alert) => alert.category === "tax" && alert.title.includes("RMD")));
});

test("newsroom draft generation classifies scam, medicare, ss, tax, and inflation items", () => {
  const alerts = generateDraftAlertsFromNewsroom([
    { title: "Fraud alert", body: "Scam calls are rising", category: "scam" },
    { title: "Medicare update", body: "Premium update", category: "medicare" },
    { title: "Social Security", body: "COLA", category: "social security" },
    { title: "RMD rule", body: "Tax deadline", category: "rmd" },
    { title: "Prices", body: "Cost of living", category: "inflation" },
  ]);
  assert.deepEqual(alerts.map((alert) => alert.category), ["scam", "medicare", "ss", "tax", "inflation"]);
  assert.ok(alerts.every((alert) => alert.status === "draft"));
});

test("matched alerts filter state, age, status, and expiration while prioritizing personalized and worry matches", async () => {
  const now = new Date();
  const current = now.toISOString();
  const expired = new Date(now.getTime() - 86_400_000).toISOString();
  const future = new Date(now.getTime() + 86_400_000).toISOString();
  const rows = [
    { id: "scam", title: "Scam warning", body: "Beware", category: "scam", states: [], min_age: 60, action_line: "Ask", source_url: null, published_at: current, expires_at: null, status: "published", created_at: current },
    { id: "ca", title: "CA only", body: "CA", category: "tax", states: ["CA"], min_age: 60, action_line: "Ask", source_url: null, published_at: current, expires_at: null, status: "published", created_at: current },
    { id: "old", title: "Expired", body: "Old", category: "benefit", states: [], min_age: 60, action_line: "Ask", source_url: null, published_at: current, expires_at: expired, status: "published", created_at: current },
    { id: "future", title: "Future", body: "Future", category: "benefit", states: [], min_age: 60, action_line: "Ask", source_url: null, published_at: future, expires_at: null, status: "published", created_at: current },
    { id: "draft", title: "Draft", body: "Draft", category: "benefit", states: [], min_age: 60, action_line: "Ask", source_url: null, published_at: current, expires_at: null, status: "draft", created_at: current },
  ] as Alert[];

  const alerts = await getMatchedAlerts(supabaseWith(rows), { age: 66, worry: "scams", state: "TX", guaranteedIncome: 3000, ssaBenefitEstimate: 1800, savings: 200000, claimedSocialSecurity: "no" }, 5);
  assert.equal(alerts[0]?.personalized, true);
  assert.ok(alerts.some((alert) => alert.id === "scam"));
  assert.ok(!alerts.some((alert) => ["ca", "old", "future", "draft"].includes(alert.id)));
});


test("connected monitor rules flag a 12% portfolio drop", () => {
  const alerts = monitorRuleAlerts({
    now: new Date("2026-06-24T00:00:00Z"),
    portfolioAnalysis: { totalValue: 88000 },
    scoreHistory: [{ created_at: "2026-05-25T00:00:00Z", answers: { savings: 100000 } }],
  });
  assert.ok(alerts.some((alert) => alert.id === "monitor-portfolio-drop"));
});

test("connected monitor rules flag a missing Social Security deposit", () => {
  const alerts = monitorRuleAlerts({
    now: new Date("2026-06-24T00:00:00Z"),
    financialPicture: { incomeSources: [{ name: "SOCIAL SECURITY", kind: "social_security", estimatedMonthlyAmount: 2100, occurrences: 3 }] },
    recentTransactions: [
      { date: "2026-03-03", amount: -2100, name: "SOCIAL SECURITY" },
      { date: "2026-04-03", amount: -2100, name: "SOCIAL SECURITY" },
      { date: "2026-06-03", amount: -2100, name: "SOCIAL SECURITY" },
    ],
  });
  assert.ok(alerts.some((alert) => alert.id.startsWith("monitor-missing-income") && alert.category === "ss"));
});

test("matched IRMAA alert uses real connected YTD income instead of entered-income guess", async () => {
  const alerts = await getMatchedAlerts(
    supabaseWith([]),
    { age: 66, worry: "healthcare", state: "TX", guaranteedIncome: 2000, savings: 100000, filingStatus: "single" } as any,
    3,
    { transactions: [{ date: "2026-02-01", amount: -120000, name: "PENSION DIRECT DEP" }], now: new Date("2026-06-24T00:00:00Z") },
  );
  const irmaa = alerts.find((alert) => alert.id === "personalized-irmaa-single");
  assert.ok(irmaa);
  assert.match(irmaa.body, /\$17,000 under/);
});
