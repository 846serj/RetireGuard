alter table profiles
  alter column balance_taxable drop default,
  alter column balance_tax_deferred drop default,
  alter column balance_roth drop default,
  alter column stock_pct drop default,
  alter column bond_pct drop default,
  alter column cash_pct drop default,
  alter column ss_benefit_fra drop default,
  alter column spending_essential_monthly drop default,
  alter column spending_discretionary_monthly drop default;

update profiles p
set
  balance_taxable = nullif(p.balance_taxable, 0),
  balance_tax_deferred = nullif(p.balance_tax_deferred, 0),
  balance_roth = nullif(p.balance_roth, 0),
  stock_pct = nullif(p.stock_pct, 0),
  bond_pct = nullif(p.bond_pct, 0),
  cash_pct = nullif(p.cash_pct, 0),
  ss_benefit_fra = nullif(p.ss_benefit_fra, 0),
  spending_essential_monthly = nullif(p.spending_essential_monthly, 0),
  spending_discretionary_monthly = nullif(p.spending_discretionary_monthly, 0)
where not exists (
  select 1 from scores s where s.user_id = p.user_id and s.score_source = 'quiz'
)
and not exists (
  select 1 from financial_accounts fa where fa.user_id = p.user_id
)
and not exists (
  select 1 from transactions t where t.user_id = p.user_id
)
and not exists (
  select 1 from holdings h where h.user_id = p.user_id
);
