# Product Requirements Document — FD + MF Withdrawal Calculator
## Existing Features (as of June 2026)

---

## 1. Product Overview

### 1.1 Product Name
**FD + MF Withdrawal Calculator** (working title: Antigravity Retirement Planner)

### 1.2 Problem Statement
Most Indian retirement calculators either assume a single investment vehicle (all FD or all equity) or ignore Indian tax law entirely. Retirees in India often hold a mix of Fixed Deposits and equity Mutual Funds, and the decision of *how* to draw down this corpus — in what order, with what tax implications, at what pace — is genuinely complex.

Existing tools fail in four key ways:
- They assume a fixed FD rate for 30+ years (unrealistic; rates change every cycle)
- They ignore LTCG tax on MF redemptions (can cost 13% of gains at each cycle)
- They don't model the "refill FD from MF" cycling strategy that most Indian retirees actually use
- They give no feedback on *whether* a withdrawal plan is safe or how close the corpus is to depletion

### 1.3 Product Vision
A single-page, browser-based tool that gives any Indian retiree a rigorous, honest answer to: **"How long will my money last?"** — with real tax math, real FD renewal mechanics, and an inflation-adjusted view of purchasing power over time.

### 1.4 Target Users
- **Primary:** Indian retirees (55–70 years) with a lump-sum corpus split between bank FDs and equity MFs
- **Secondary:** Pre-retirees (45–55) stress-testing a retirement plan before they stop working
- **Tertiary:** Financial advisors and planners who want a quick scenario tool to show clients

### 1.5 Non-Goals
- Not a brokerage or account-linked tool (no live portfolio data)
- Not a financial advisor (explicitly disclaimed)
- Not a tax filing tool
- Does not handle debt MFs, NPS, PPF, EPF, or insurance products in the current version

---

## 2. Core Strategy Modeled

### 2.1 The FD + MF Cycling Method
The calculator models a specific, widely-used Indian retirement draw-down strategy:

**Phase 1 (Setup):** Retiree splits total corpus into:
- **FD Bucket:** Provides a monthly income stream (interest + principal drawdown)
- **MF Bucket:** Continues compounding in equity, untouched

**Phase 2 (Draw-down):** Retiree withdraws monthly expenses entirely from FD. MF bucket grows independently.

**Phase 3 (Refill):** When FD is exhausted, retiree sells a pre-determined percentage of MF (paying LTCG tax on gains), uses net proceeds to open a fresh FD, and restarts Phase 2.

**Outcome 1 — Depletion:** If withdrawal rate is too high, each new FD is smaller than the last. Eventually the corpus is exhausted.

**Outcome 2 — Perpetuity:** If MF growth outpaces spending, each new FD is larger than the last. The corpus becomes self-sustaining.

### 2.2 Two Withdrawal Scenarios
- **Scenario A (Fixed):** Same nominal rupee amount every month. Purchasing power shrinks with inflation. Useful as a baseline comparison.
- **Scenario B (Inflation-Adjusted, Recommended):** Monthly withdrawal increases each year at the user's specified inflation rate. Maintains real purchasing power. This is what retirement actually costs.

---

## 3. User Inputs

### 3.1 Corpus Configuration

| Input | Type | Default | Range | Notes |
|---|---|---|---|---|
| Total Retirement Corpus | Number field (₹) | ₹3,00,00,000 | ≥ 0 | Combined FD + MF value at retirement |
| FD Allocation % | Slider | 50% | 0–100% | Determines FD vs. MF split |

**Quick Preset Buttons:**
- Conservative: 70% FD / 30% MF
- Balanced: 50% FD / 50% MF
- Growth: 30% FD / 70% MF

**Validation:** Warning shown if corpus < ₹50L (results are illustrative, not actionable at that scale).

### 3.2 Monthly Spending

| Input | Type | Default | Range | Notes |
|---|---|---|---|---|
| Monthly Withdrawal | Number field (₹) | ₹1,75,000 | ≥ 0 | Monthly expenses in today's rupees |

**Validation:** Red warning if annual withdrawal > 10% of corpus (dangerously high rate).

### 3.3 Tax, Age & Rates

#### Income Tax Slab (applied to FD interest)
| Option | When to Use |
|---|---|
| 0% | Annual income ≤ ₹7L (new regime rebate) or senior citizen exemptions |
| 5% | ₹3L–₹7L income bracket |
| 20% | ₹10L–₹15L income bracket |
| 30% | >₹15L income (highest slab) |

#### Current Age
- Optional input (30–90)
- If provided, all duration outputs also show "lasts until age X"
- Used in Timeline tab to show age axis

#### FD Interest Rate
- Range: 4.0%–10.0%, step 0.1%
- Default: 6.4% (SBI 2–3 year FD rate as of June 2026)
- "Use Current SBI Rate" button resets to default
- Senior citizen premium (+0.5%) can be factored into the rate manually

#### Mutual Fund CAGR
- Range: 6.0%–20.0%, step 0.5%
- Default: 12% (Nifty 50 15-year historical CAGR)

#### Inflation Rate
- Range: 3.0%–12.0%, step 0.5%
- Default: 6%
- Context note: RBI CPI target 4% ±2%; India 5-year average 5.5–6%

#### LTCG Tax Toggle
- On/Off toggle (default: ON)
- Description: 12.5% on equity MF gains above ₹1.25L/year (Budget 2024 rules)
- When ON, shows nested **LTCG Exemption Limit** field (default ₹1,25,000, editable)

#### FD Rate Decline Toggle
- On/Off toggle (default: ON)
- Models historical fall in SBI FD rates (~2% decline over 15 years)
- When ON, shows nested **Minimum Floor Rate** slider (default 5.5%, range 4–7%)
- Decline rate: −0.5% every 5 years

#### Reset Button
- Restores all tax/rate/age fields to defaults
- Preserves corpus and withdrawal amounts

---

## 4. Calculations Engine

### 4.1 Monthly FD Phase Simulation (`runFDPhase`)

For each month within a single FD cycle:

```
Interest = Balance × (Annual FD Rate / 12)
FD Tax = Interest × Tax Slab
Net Interest = Interest − FD Tax
Withdrawal (Scenario A) = Fixed monthly amount
Withdrawal (Scenario B) = Base × (1 + Inflation)^global_month
Net Draw = max(0, Withdrawal − Net Interest)
New Balance = Balance − Net Draw
```

Phase ends when Balance ≤ 0. Partial final month is recorded accurately.

### 4.2 MF Compounding During FD Phase

MF compounds monthly, untouched during each FD phase:
```
Monthly MF Rate = (1 + Annual MF Rate)^(1/12) − 1
MF End = MF Start × (1 + Monthly MF Rate)^months_in_phase
```
Cost basis is tracked separately to compute LTCG gains later.

### 4.3 LTCG Tax Calculation

At the end of each FD cycle (when MF is sold to refill FD):
```
MF Sold Value = MF End × FD Allocation %
MF Sold Cost Basis = Original Cost × FD Allocation %
Gains = MF Sold Value − MF Sold Cost Basis
Taxable Gains = max(0, Gains − Annual LTCG Exemption)
LTCG Tax = Taxable Gains × 12.5% × 1.04  (4% Health & Education Cess)
Net Proceeds = MF Sold Value − LTCG Tax
```

Annual exemption (₹1.25L) is shared across all redemptions in the same financial year (April–March).

### 4.4 FD Rate Decline Model (`getFDRate`)

```
Periods Elapsed = floor(global_month / 60)   [every 5 years]
Rate = Start Rate − (Periods × 0.5%)
Effective Rate = max(Rate, Floor Rate)
```

### 4.5 Multi-Phase Cycling (`simulateScenario`)

Runs up to 20 FD phases in sequence. Stops when:
- Combined corpus depletes (no MF left to sell)
- FD phase lasts 600+ months (marked perpetual — corpus is self-sustaining)

### 4.6 Withdrawal Rate

```
Annual Withdrawal Rate = (Monthly Withdrawal × 12) / Total Corpus
```

Safe zone: ≤ 5%. Stretched: 5–7%. High risk: > 7%.

---

## 5. Health Score

A single 0–100 composite score with an A–E letter grade.

### 5.1 Scoring Components

| Factor | Weight | How Scored |
|---|---|---|
| Longevity | 50% | Months from Scenario B; 480 months (40 yr) = max. Perpetual = max. |
| Withdrawal Rate | 35% | 4% SWR = max; 10%+ = 0. Linear interpolation. |
| Tax Efficiency | 15% | Tax drag (total tax / total withdrawn); 5% = max; 20%+ = 0. |

### 5.2 Grade Scale

| Score | Grade | Label |
|---|---|---|
| 85–100 | A | Excellent |
| 70–84 | B | Good |
| 55–69 | C | Moderate |
| 40–54 | D | Weak |
| 0–39 | E | Critical |

### 5.3 Per-Factor Display
- Individual 0–10 sub-scores
- Progress bar per factor
- Contextual hint text (e.g., "Your withdrawal rate of 7.2% is stretched — safe zone is ≤5%")

---

## 6. Runway Tips

Shown when corpus is not perpetual. Up to 3 high-impact levers, ranked by delta months:

1. **Reduce monthly withdrawal by ₹20K** → recalculates and shows delta (e.g., "+2 yr 4 mo")
2. **Shift 10% allocation from FD to MF** → recalculates with 60% MF, shows delta
3. **Disable LTCG tax** → illustrative; shows how much tax is costing in runway

Each tip displays a clear "+X yr Y mo" badge. Only shown if the impact is meaningful (>6 months).

---

## 7. What-If Sandbox

Interactive sliders that let users stress-test without changing their base inputs.

| Control | Step | Range |
|---|---|---|
| Monthly Withdrawal | ±₹10,000 | Any |
| Total Corpus | ±₹10,00,000 | ≥ 0 |
| FD Allocation % | ±5% | 0–100% |
| Inflation Rate | ±0.5% | 3–12% |

**Behavior:**
- Real-time recalculation (instant feedback)
- Delta badge shows "now lasts +X yr Y mo" vs. base
- Reset button clears tweaks and restores base inputs
- What-If inputs do not affect the saved URL or printed report

---

## 8. Output Tabs

### 8.1 Summary Tab

**Hero Number:** Large display of corpus duration. Options:
- "FOREVER" (perpetual)
- "XX yr XX mo" (finite)
- Age overlay if current age was entered

**Benchmark Band:** A horizontal ruler showing the user's position across:
- Caution zone (red, 0–15 yr)
- Moderate zone (amber, 15–25 yr)
- Healthy zone (green, 25+ yr)

**Stat Cells (4):**
1. Final MF value (green if surplus, red if depleted)
2. Total Withdrawn (nominal rupees over entire period)
3. Total Tax Paid (FD tax + LTCG tax combined)
4. FD Cycles count

### 8.2 Timeline Tab

**Phase Timeline Bar:**
- Horizontal bar; each FD cycle is a colored block proportional to its duration
- Color: green (≥6yr) → amber (1–3yr) → red (<6mo)
- Hover tooltip: Phase #, duration, FD opened, MF at start, ages if applicable
- Age axis shown if current age entered

**Phase Card List:**
- Expandable accordion for each FD cycle
- Always-visible header: Phase #, duration, global months, FD rate used
- Always-visible metrics: FD opened, MF at start, total withdrawn, MF at end
- Expanded detail (click to open):
  - FD rate trajectory (start → end if rate declined)
  - FD interest tax paid
  - Inflation-adjusted real value withdrawn
  - LTCG tax paid (if applicable)
  - Net proceeds → new FD amount
  - **Month-by-month table** (MonthTable): every month of the FD cycle with FD opening/closing balance, interest, tax, and withdrawal

**Micro-Cycle Handling:**
- If 6+ consecutive phases each last <6 months (rapid depletion), they're collapsed into a summary row
- User can expand to see individual cards

### 8.3 Tax Tab

**Tax Breakdown Table:**
- Per-phase rows: FD Interest Tax, LTCG Tax, Taxable MF Gains, Total Tax, Next FD Amount
- Minor phases (<₹1L combined tax) grouped into a single collapsed row
- Footer totals across all phases

**Comparison Table (A vs. B):**
- Side-by-side: Scenario A (Fixed) vs. Scenario B (Inflation-Adjusted)
- Columns: Duration, Real Value, Total Tax, FD Tax, LTCG Tax, Final MF (real & nominal), Cycles
- Unit toggle: ₹ Lakhs or ₹ Crore
- Recommendation banner: "Scenario B is realistic — use this for planning"

---

## 9. Supporting Features

### 9.1 URL Sharing
All inputs encoded in URL query parameters. One-click "Share" copies the full URL. Recipient opens the exact same scenario.

Query params: `tc` (corpus), `fpct` (FD%), `wd` (withdrawal), `slab` (tax slab), `fdr` (FD rate), `mfr` (MF rate), `inf` (inflation), `age` (current age), `ltcg` (LTCG on/off), `ltcgex` (exemption), `fddecline` (decline on/off), `fdfloor` (floor rate)

Legacy format (FD + MF as separate fields) also parsed for backwards compatibility.

### 9.2 Print / PDF Report
- "Report" button triggers browser print dialog
- All three tabs rendered in order (no JS-hidden content in print view)
- Print-only header with scenario name and date
- Suitable for "Save as PDF" from any browser

### 9.3 Strategy Explainer Modal
- Full walkthrough of the FD/MF cycling strategy
- Triggered from hero section
- Explains: why split the corpus, how the refill works, what makes it perpetual vs. depleting

### 9.4 Grade Legend Modal
- Triggered from HealthScore component
- Explains A–E grades, what each implies, and what lever to pull to improve

### 9.5 Glossary Tooltips (`Term` component)
- Hover any underlined term to see definition
- Terms covered: LTCG, CAGR, FD Cycle, MF Corpus, Real Value, SWR, Health Score
- Definitions tailored to Indian context

### 9.6 Analytics
- Vercel Analytics integrated for usage tracking
- No PII collected; all computation is client-side

---

## 10. Technical Architecture

### 10.1 Stack
- **React 19** (hooks-based, no Redux)
- **Vite** (build, dev server, HMR)
- **Tailwind CSS** (utility classes, responsive breakpoints)
- **Recharts** (charting library — used in timeline)
- **Vercel Analytics**
- **Deployed as static SPA** (no server, no database)

### 10.2 Key Files

| File | Responsibility |
|---|---|
| `src/logic/calculator.js` | Core simulation: `runFDPhase`, `simulateScenario`, `getFDRate` |
| `src/logic/analysis.js` | `healthScore`, `runwayTips`, `swrZone`, `withdrawalRate` |
| `src/logic/defaults.js` | Default inputs, glossary definitions, SBI rate reference |
| `src/logic/formatters.js` | Indian number formatting (lakhs/crores), duration formatting |
| `src/logic/colors.js` | Phase health → color mappings |
| `src/App.jsx` | Root component, URL encode/decode, modal state |
| `src/components/InputPanel.jsx` | All input controls (3 collapsible cards) |
| `src/components/HeroSummary.jsx` | Hero number, benchmark band, stat cells |
| `src/components/HealthScore.jsx` | Gauge, grade, score breakdown, legend modal |
| `src/components/RunwayTips.jsx` | 3 leverage suggestions |
| `src/components/WhatIf.jsx` | Interactive sandbox sliders |
| `src/components/PhaseTimeline.jsx` | Timeline bar with hover tooltips |
| `src/components/PhaseCardList.jsx` | Accordion list of FD cycles |
| `src/components/PhaseCard.jsx` | Single cycle card with MonthTable |
| `src/components/MonthTable.jsx` | Month-by-month detail table |
| `src/components/TaxSummary.jsx` | Per-phase tax breakdown |
| `src/components/ComparisonTable.jsx` | Scenario A vs. B comparison |
| `src/components/StrategyExplainer.jsx` | Strategy modal |
| `src/components/Term.jsx` | Glossary tooltip wrapper |

### 10.3 State Management
- All state in `App.jsx` via `useState`
- `useMemo` for expensive recalculations (only recomputes when inputs change)
- `useCallback` for stable event handlers
- URL synced via debounced `useEffect` (300ms debounce)
- No external state library

### 10.4 Responsive Design

| Breakpoint | Layout |
|---|---|
| < 640px (mobile) | Single column; inputs stack above results |
| 640–1023px (tablet) | Two-column; inputs left, results right |
| ≥ 1024px (desktop) | Two-column; input panel sticky on scroll |

---

## 11. Known Limitations & Assumptions

| Assumption | Rationale |
|---|---|
| No SIP or fresh investment after retirement | Tool is for draw-down phase, not accumulation |
| MF sold only at FD cycle end | Models the common "let MF run" behavior; no mid-phase redemptions |
| Constant return & inflation rates | Uses long-run averages; sequence-of-returns risk is not modeled |
| LTCG 4% cess always included | 12.5% + 4% cess = 13% effective; cess rate rarely changes |
| FD tax excludes cess | Cess is usually offset by deductions in practice for retirees |
| 20-phase max, 600 months/phase limit | Sufficient for any realistic scenario; prevents infinite loops |
| Corpus split % is fixed | Same FD% used for every cycle refill; no dynamic rebalancing |
| No govt pensions, rental income, insurance | Modeled as corpus-only; other income streams not yet supported |

---

## 12. Disclaimers

- For planning and education only — not investment advice
- Tax laws (LTCG rate, exemption limits, cess) may change in future budgets
- FD rates and market returns are estimates, not guarantees
- Consult a SEBI-registered investment advisor before making financial decisions

---

*Document version: 1.0 | Last updated: June 2026*
