export const DEFAULT_INPUTS = {
  fdAmount: 15000000,
  mfAmount: 15000000,
  monthlyWithdrawal: 175000,
  fdStartRate: 0.069,
  mfRate: 0.12,
  inflationRate: 0.06,
  taxSlab: 0.30,
  ltcgEnabled: true,
  fdDeclineEnabled: true,
  fdDeclineRate: 0.005,
  fdDeclinePeriod: 60,
  fdFloor: 0.055,
  ltcgRate: 0.125,
  ltcgExemption: 125000,
}

export const TOOLTIPS = {
  fdStartRate: 'SBI 2–3yr FD: 7.0% (2023) → 6.9% (Apr 2025). Rates have declined ~2% over 15 years.',
  mfRate: 'Nifty 50 15-yr CAGR: ~12–13%. Includes bear markets of 2008, 2020.',
  inflationRate: 'RBI CPI target: 4% (±2%). India 5yr avg: ~5.5–6%. Use 7% for conservative planning.',
  taxSlab: 'Your income tax slab on FD interest income. FD interest is taxed as regular income.',
  ltcgEnabled: 'Equity MF redemption held >1yr: 12.5% on gains above ₹1.25L (Budget 2024).',
  fdDeclineEnabled: 'Based on SBI historical data: rates dropped from ~9% (2012) to ~5.5% (2021). Modelled as 0.5% drop every 5 years, floor at 5.5%.',
  ltcgExemption: 'LTCG exemption limit per financial year. Currently ₹1.25L (Budget 2024). Editable in case law changes.',
}
