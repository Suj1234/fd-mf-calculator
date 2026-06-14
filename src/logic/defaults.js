export const DEFAULT_INPUTS = {
  totalCorpus: 30000000,
  fdPct: 0.5,
  currentAge: 0,
  fdAmount: 15000000,
  mfAmount: 15000000,
  monthlyWithdrawal: 175000,
  fdStartRate: 0.064,
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

// Reference FD rate surfaced as a one-click "use current rate" button.
// Update the rate + asOf each quarter (no public CORS API exists to fetch live).
export const CURRENT_SBI_FD = { rate: 0.064, asOf: 'Jun 2026', tenure: '2–3 yr' }
// Senior citizens get an additional 0.5% premium: 6.9% as of Jun 2026.

// Plain-language definitions for jargon, shown via the <Term> tooltip (P22).
export const GLOSSARY = {
  ltcg: 'Long-Term Capital Gains tax — 12.5% on equity mutual-fund profits when you sell units held over 1 year (on gains above ₹1.25L per year).',
  cagr: 'Compound Annual Growth Rate — the average yearly return, accounting for compounding over time.',
  mfCorpus: 'Your total mutual-fund holding (units × current value) at a point in time.',
  fdCycle: 'One round of the strategy: live off an FD until it empties, then sell some MF to open a fresh FD.',
  realValue: "Today's rupees — money adjusted for inflation, so future amounts can be compared to present-day buying power.",
}

export const TOOLTIPS = {
  fdStartRate: 'SBI 2–3yr FD (general public): 6.4% as of Jun 2026. Senior citizens get an extra 0.5% (6.9%). Rates have declined ~2% over 15 years.',
  mfRate: 'Nifty 50 15-yr CAGR: ~12–13%. Includes bear markets of 2008, 2020.',
  inflationRate: 'RBI CPI target: 4% (±2%). India 5yr avg: ~5.5–6%. Use 7% for conservative planning.',
  taxSlab: 'Your income tax slab on FD interest income. FD interest is taxed as regular income.',
  ltcgEnabled: 'Equity MF redemption held >1yr: 12.5% on gains above ₹1.25L (Budget 2024).',
  fdDeclineEnabled: 'Based on SBI historical data: rates dropped from ~9% (2012) to ~5.5% (2021). Modelled as 0.5% drop every 5 years, floor at 5.5%.',
  ltcgExemption: 'LTCG exemption limit per financial year. Currently ₹1.25L (Budget 2024). Editable in case law changes.',
  corpusSplit: 'FD provides stable monthly income. MF grows your corpus over time at higher returns. A 50/50 split is a common balanced starting point.',
}
