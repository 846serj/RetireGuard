// Run with: npm test  (uses node:test). Sanity checks on the scoring logic.
import { test } from "node:test";
import assert from "node:assert";
import { computeScores, type Answers } from "./scoring.ts";

const secure: Answers = {
  age: 68, status: "retired", guaranteedIncome: 4000, essentialExpenses: 3000,
  savingsBucket: "500k-1M", stockPct: 50, emergencyFund: "6+", debt: "none", worry: "inflation",
};
const vulnerable: Answers = {
  age: 72, status: "retired", guaranteedIncome: 1200, essentialExpenses: 3500,
  savingsBucket: "<50k", stockPct: 100, emergencyFund: "0", debt: "heavy", worry: "running_out",
};

test("secure profile scores high and is well-banded", () => {
  const r = computeScores(secure);
  assert.ok(r.overall >= 70, `expected >=70, got ${r.overall}`);
  assert.ok(["Secure", "Mostly Secure"].includes(r.band));
});

test("vulnerable profile scores low", () => {
  const r = computeScores(vulnerable);
  assert.ok(r.overall < 50, `expected <50, got ${r.overall}`);
  assert.ok(["At Risk", "Vulnerable"].includes(r.band));
});

test("scores are bounded 0-100", () => {
  for (const a of [secure, vulnerable]) {
    const r = computeScores(a);
    for (const v of [r.overall, ...Object.values(r.sub)]) {
      assert.ok(v >= 0 && v <= 100, `out of range: ${v}`);
    }
  }
});
