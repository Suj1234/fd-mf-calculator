# FD + MF Withdrawal Calculator

**Indian retirement simulator — model how long your Fixed Deposit + Mutual Fund corpus lasts under real-world conditions.**

> FD + MF retirement simulator · Real Indian tax rules

---

## What it does

Enter your retirement corpus, monthly withdrawal target, and a handful of rate assumptions. The calculator runs a phase-by-phase simulation showing:

- How long your FD sustains withdrawals before being exhausted
- When and how MF corpus is partially redeemed to refill the FD
- Whether the portfolio is self-sustaining (perpetual) or eventually depleted
- Total taxes paid (FD interest tax + LTCG on MF redemptions)
- Month-by-month breakdown for every phase

Two scenarios run simultaneously:

| Scenario | Description |
|---|---|
| **Fixed Withdrawal** | Same nominal withdrawal every month |
| **Inflation-Adjusted** | Withdrawal grows with inflation — purchasing power stays constant |

---

## Features

- **Single corpus + split slider** — set total corpus (e.g. ₹3 Cr) and pick your FD/MF allocation via a slider (20–80%) or preset chips (Conservative / Balanced / Growth)
- **Age-aware planning** — enter your current age to see "lasts until age X" in results
- **Benchmark band** — Caution / Moderate / Healthy zones show at a glance how your plan stacks up
- **Phase timeline** — color-coded by duration (green → red), grouped phases under 6 months, plain-language callout
- **Tax summary** — FD interest tax per phase, LTCG grouped by phase, insight row, perpetual note
- **A vs B comparison table** — all key metrics side-by-side with a ₹L / ₹Cr unit toggle
- **Month-by-month table** — expandable per phase, shows FD opening/closing, interest earned, tax paid, withdrawal
- **Shareable URL** — all inputs encoded in query params; copy the link to share a specific scenario
- **Declining FD rate model** — based on historical SBI data (rates dropped ~2% over 15 years); configurable floor

---

## Tax rules modelled

| Tax | Rule |
|---|---|
| **FD interest tax** | Taxed as regular income at your slab rate (10% / 20% / 30%) |
| **LTCG on Equity MF** | 12.5% on gains above ₹1.25L exemption (Budget 2024), applied at each MF → FD transition |

---

## How the simulation works

1. Withdrawals come from the **FD** first (monthly net interest, then principal if needed)
2. Meanwhile, the **MF corpus compounds untouched** at the configured CAGR
3. When the FD is exhausted, **half of the grown MF corpus** is redeemed, LTCG tax applied, and the proceeds become the new FD principal. The other half stays invested.
4. This repeats as a new **phase** — up to 20 phases or until both pools are exhausted
5. If the FD never exhausts (net interest ≥ monthly withdrawal), the plan is marked **perpetual**

---

## Default inputs

| Parameter | Default | Note |
|---|---|---|
| Total corpus | ₹3,00,00,000 | ₹3 Cr |
| FD / MF split | 50% / 50% | Balanced preset |
| Monthly withdrawal | ₹1,75,000 | |
| FD rate | 6.9% p.a. | SBI 2–3yr (Apr 2025) |
| MF return | 12% p.a. | Nifty 50 15-yr CAGR |
| Inflation | 6% p.a. | RBI CPI avg |
| Tax slab | 30% | On FD interest |
| FD rate decline | 0.5% every 5 years, floor 5.5% | Based on SBI historical |
| LTCG | 12.5% above ₹1.25L | Budget 2024 |

---

## Tech stack

- **React 19** + **Vite 8**
- **Tailwind CSS 3**
- **Recharts 3** — phase timeline chart
- No backend — fully client-side

---

## Getting started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## URL parameters

Share or bookmark any scenario via query string:

| Param | Input |
|---|---|
| `tc` | Total corpus |
| `fpct` | FD percentage (0–1) |
| `age` | Current age |
| `wd` | Monthly withdrawal |
| `fdr` | FD start rate |
| `mr` | MF return rate |
| `inf` | Inflation rate |
| `tax` | Tax slab |
| `ltcg` | LTCG rate |
| `fdd` | FD decline rate |
| `floor` | FD rate floor |
| `ltcgex` | LTCG exemption amount |

Example: `?tc=30000000&fpct=0.5&wd=175000&fdr=0.069`

---

## Project structure

```
src/
  logic/
    calculator.js     # Core simulation engine (simulateAllPhases)
    defaults.js       # Default inputs and tooltip copy
    formatters.js     # ₹ formatting utilities
  components/
    InputPanel.jsx    # All user inputs (corpus, split, rates, tax)
    HeroSummary.jsx   # Top-level result cards + benchmark band
    PhaseTimeline.jsx # Color-coded phase chart
    PhaseCard.jsx     # Per-phase expandable detail
    TaxSummary.jsx    # Tax table across all phases
    ComparisonTable.jsx # Scenario A vs B side-by-side
    MonthTable.jsx    # Month-by-month FD detail
    StrategyExplainer.jsx # "How it works" section
```

---

## Disclaimer

This tool is for **illustrative and planning purposes only**. It does not constitute financial advice. Returns, tax rates, and inflation are projections — actual outcomes will differ. Consult a SEBI-registered financial advisor before making investment decisions.
