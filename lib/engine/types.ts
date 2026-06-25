export type MaritalStatus = "single" | "married" | "partnered" | "widowed" | "divorced";

export type FinancialProfile = {
  user_id: string;
  birthdate: string | null;
  marital_status: MaritalStatus | null;
  spouse_birthdate: string | null;
  state: string | null;
  balance_taxable: number | null;
  taxable_cost_basis: number | null;
  balance_tax_deferred: number | null;
  balance_roth: number | null;
  stock_pct: number | null;
  bond_pct: number | null;
  cash_pct: number | null;
  ss_benefit_fra: number | null;
  ss_claim_age: number | null;
  spouse_ss_benefit_fra: number | null;
  spouse_ss_claim_age: number | null;
  pension_amount: number | null;
  pension_start_age: number | null;
  pension_has_cola: boolean;
  pension_survivor_pct: number | null;
  other_taxable_income?: number | null;
  spending_essential_monthly: number | null;
  spending_discretionary_monthly: number | null;
  inflation_assumption: number;
  target_retirement_age: number | null;
  planning_horizon_age: number;
  updated_at: string | null;
};

export const FINANCIAL_PROFILE_DEFAULTS = {
  inflation_assumption: 0.03,
  planning_horizon_age: 95,
} as const;
