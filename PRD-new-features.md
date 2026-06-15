# Product Requirements Document — New Features
## FD + MF Withdrawal Calculator — v2 Roadmap

---

## 1. Feedback Analysis

### 1.1 Source of Feedback
Three pieces of user feedback received post-launch (June 2026). All three are from users who have tried the tool seriously enough to articulate specific gaps — a strong signal of genuine engagement.

### 1.2 Aggregated Requests (by frequency)

| Request | Mentioned By | Signal Strength |
|---|---|---|
| Additional asset classes (gold, international equity) | 3/3 users | Very High |
| Rental / pension / annuity income streams | 3/3 users | Very High |
| Age / longevity adjustment in What-If | 1/3 users | Medium |
| Old vs. new tax regime toggle | 1/3 users | Medium |

### 1.3 Feature-by-Feature Build Decision

---

#### Feature A: Additional Asset Classes (Gold, International Equity)
**User Need:** "Factor in other assets like gold or international equity — diversifying can smooth returns and risk."

**Build Decision: YES — High Priority**

**Why it matters:**
- 100% of feedback mentioned this
- Real Indian retirees commonly hold 10–20% in Sovereign Gold Bonds (SGBs) or gold ETFs
- International equity (Nifty IT, US-focused funds) has a low correlation with domestic equity — it genuinely changes the risk/return math
- The current tool implicitly penalizes diversification by only modeling FD+MF. A user who holds 20% gold sees no reflection of that in their plan
- A third asset class changes how long the MF bucket lasts before it needs to sell, changing LTCG timing and tax drag

**Why not to build it (counter-argument):**
- Increases input complexity significantly
- Gold returns are volatile and hard to predict; a constant CAGR for gold is more misleading than helpful
- International equity has additional currency risk and a different tax structure (STCG before 2 years, LTCG at 12.5% after 2 years — same as domestic equity now post-budget 2024)

**Resolution:** Build with guardrails. Model gold and international equity as a *third optional bucket* with user-specified CAGR, tapped after domestic MF is used. Keep the UI additive (collapsed by default) so existing users are not overwhelmed. Add a disclaimer that gold CAGR is especially variable.

---

#### Feature B: Rental / Pension / Annuity Income Streams
**User Need:** "Model rental/annuity/pension income stream post-retirement — streams independent of corpus. Subtracting from withdrawal is a workaround but seeing all info in one place would be great."

**Build Decision: YES — High Priority**

**Why it matters:**
- 100% of feedback mentioned this
- This is the most semantically important feature gap: the tool currently treats all income as corpus draw-down. Many Indian retirees have one or more independent income streams:
  - Rental income (very common — a large % of Indian middle-class retirees own investment property)
  - Government / central PSU pension (significant for ex-government employees)
  - NPS annuity payouts
  - Deferred annuity products from insurers
  - Part-time consulting income (early retirees)
- These income streams *directly reduce withdrawal pressure on the corpus*. A retiree with ₹50K/month rental income on a ₹1.75L monthly need is really only drawing ₹1.25L from corpus — 28% less. At a ₹3Cr corpus, that's the difference between a 7% and 5% withdrawal rate (stretching vs. safe zone)
- Workaround (manually subtracting from withdrawal) is fragile — the user loses visibility into what's "expenses" vs. "other income" and the HealthScore's withdrawal rate becomes misleading

**Why not to build it:**
- Rental income is subject to its own income tax (at slab) — modeling post-tax rental income accurately adds complexity
- Pension is often partially taxable (standard deduction, etc.)
- Risk of users entering gross figures and the tool under-estimating their true corpus draw

**Resolution:** Build as a simple *net monthly income* input (user enters post-tax amount they'll receive). Explicitly label it "Other monthly income (post-tax)" and note that the tool uses this to reduce net corpus withdrawal. Show it as a clear line item in outputs. Do not model the tax on other income — that's out of scope and belongs in a full tax return.

---

#### Feature C: Age / Longevity Adjustment in What-If
**User Need:** "Add option to adjust age in 'what if' section — morbid but helpful to see effect of longevity on corpus."

**Build Decision: YES — Low Effort, Meaningful UX**

**Why it matters:**
- Longevity is the single biggest variable in retirement planning ("How long do I live?")
- The What-If already has 4 levers (withdrawal, corpus, FD%, inflation) — age is a natural 5th
- The tool already has an `age` input but it's only used for display ("lasts until age X"). Putting longevity explicitly in What-If surfaces *planning to a target age* rather than "let's see what happens"
- A user asking "what if I live to 90 vs. 85?" is really asking "do I need to plan for 35 years or 30?" — a concrete output they can act on
- Almost no engineering effort: What-If already passes modified inputs through the full simulation. Adding a "target age" slider maps directly to a "required months" threshold check

**Why not to build it:**
- Age already exists as a display-only input. Conflating it with a "planning target" could confuse users
- The tool doesn't stop simulation at a target age — it runs until corpus depletes. Showing "enough for 85 years" requires an additional check

**Resolution:** Add to What-If as "Plan for longevity to age X" slider. This doesn't change the simulation — it adds a visual marker on the output ("Your corpus lasts to age 87 — 2 years past your target of 85"). Green if surplus, red if falls short.

---

#### Feature D: Old vs. New Tax Regime Toggle
**User Need:** "A toggle for old vs. new tax regime would help — LTCG impacts differ slightly depending on which you're under."

**Build Decision: NO — Not Now**

**Why we're deferring:**
- **LTCG tax on equity MF is the same under both regimes (12.5% post-Budget 2024).** The regime choice does not affect LTCG rate, LTCG exemption (₹1.25L), or the 4% cess. The regime only affects the *income slab* under which FD interest is taxed.
- The tool already has a **Tax Slab selector (0%, 5%, 20%, 30%)** that achieves exactly this. A user in the new regime who falls in the ₹10–15L slab just selects 20%. A user in the old regime with deductions who effectively pays 5% on net income selects 5%.
- Adding a "regime toggle" would add UI complexity without changing any downstream calculation — it's a label change on something that already exists.
- The real difference between regimes (standard deduction, 80C, HRA, etc.) applies to *employment income*, not retirement corpus withdrawals. It's not modeled here and shouldn't be.

**What to do instead:** Add a tooltip on the Tax Slab selector explaining: "This is the effective rate on your FD interest income. Under the new tax regime, you may be in a lower slab. LTCG on equity MF (12.5%) is the same regardless of regime."

---

## 2. Features to Build

### Feature 1: Additional Asset Classes (Third/Fourth Bucket)
### Feature 2: Other Income Streams (Rental / Pension / Annuity)
### Feature 3: Age / Longevity Target in What-If
### Not building: Regime Toggle (already covered by Tax Slab selector)

---

## 3. Detailed Requirements: Feature 1 — Additional Asset Classes

### 3.1 Overview
Allow users to add up to 2 additional asset classes beyond FD and domestic equity MF. The buckets are drawn down after domestic MF is exhausted (or in a user-configured order), compounding at user-specified CAGRs.

### 3.2 Scope
**v2.0 scope:** One additional bucket ("Bucket 3") with two presets: Gold or International Equity. User can also enter a custom label and CAGR.

**Out of scope:** Debt MF (different tax structure), SGBs (8-year lock-in needs maturity modeling), REITs (quarterly distributions), hybrid funds.

### 3.3 Inputs

#### New Input Card: "Additional Assets (Optional)"
Collapsed by default. Expands with a "+" button.

| Input | Type | Default | Notes |
|---|---|---|---|
| Asset Type | Dropdown | — | Gold, International Equity, Custom |
| Asset Value (₹) | Number field | — | Current market value of this holding |
| Expected CAGR (%) | Slider | 8% (Gold) / 11% (Intl Eq) | User-adjustable |
| When to draw from this bucket | Radio | After MF | Options: "After MF exhausted" or "Alongside MF (same % sold per cycle)" |
| Custom label | Text field | Shown if type = Custom | Max 20 chars |

**Preset defaults:**
- Gold: 8% CAGR (10-yr historical gold CAGR in INR), disclaimer that gold is volatile
- International Equity: 11% CAGR (S&P 500 ~14% USD minus ~3% INR appreciation headwind)

**Tax treatment for Bucket 3:**
- Post-Budget 2024: Gold ETF/FoF held >2 years is taxed at 12.5% LTCG (same as equity MF)
- International equity (FoFs, offshore funds in India): held >2 years → 12.5% LTCG (same as equity MF now post-Budget 2024)
- Apply same LTCG calculation as MF bucket (including ₹1.25L exemption sharing)
- If user selects "Custom," apply same LTCG treatment (they can override mentally)

### 3.4 Calculation Changes

**Updated corpus display:**
```
Total Corpus = FD + Domestic MF + Bucket 3 value
FD% applies to (FD + MF + Bucket3) total
```

Or: keep existing FD + MF structure and treat Bucket 3 as an *additional asset* with separate allocation.

**Recommended approach:** Keep FD% slider as-is (it allocates between FD and domestic MF only). Bucket 3 is *additive* — user enters an absolute value, not a % of total corpus. This avoids confusion from a 3-way slider.

**Draw-down order (default: after MF):**
1. Draw from FD as before
2. When FD exhausted, sell domestic MF first (as before) to refill FD
3. When domestic MF exhausted, sell Bucket 3 to refill FD
4. When Bucket 3 exhausted, corpus fully depleted

**Draw-down order (alongside MF):**
- At each FD refill, sell pro-rata from both MF and Bucket 3 (e.g., if MF is 70% of combined non-FD assets, sell 70% of needed amount from MF and 30% from Bucket 3)

### 3.5 Output Changes

**Summary Tab:**
- Total corpus shown as FD + MF + Bucket 3 (labeled)
- Stat cell: "Final Bucket 3" (green/red based on value)
- HealthScore: longevity factor updated automatically (longer runway → better score)

**Timeline Tab:**
- Phase cards show "Bucket 3 at start" and "Bucket 3 at end" (similar to MF columns)
- When Bucket 3 is tapped, a visual marker on the timeline (different color phase)

**Tax Tab:**
- Per-phase tax table now has Bucket 3 LTCG column
- Totals include all three buckets

### 3.6 UI/UX Considerations
- Collapsed by default — existing users see no change unless they expand
- Preset buttons (Gold / Intl Equity / Custom) to speed up input
- Disclaimer on Gold preset: "Gold returns are more volatile than shown — this CAGR is a long-run average"
- Disclaimer on International Equity: "Includes currency risk and India-specific FoF/ETF expense ratios (~1%). Adjust CAGR accordingly."

---

## 4. Detailed Requirements: Feature 2 — Other Income Streams

### 4.1 Overview
Allow users to input one or more regular monthly income streams that are independent of their corpus (rental income, pension, annuity). These reduce the net withdrawal pressure on the corpus each month.

### 4.2 Scope
**v2.0 scope:**
- Up to 3 income streams (most users have ≤2: e.g., pension + rental)
- Each stream: name, monthly amount (today's ₹), start/end year (optional), inflation-linked toggle
- Net effect: reduces effective corpus withdrawal each month
- Shown as clear line items in outputs (not hidden in the withdrawal figure)

**Out of scope:** Modeling tax on the income itself, fluctuating rental income, annuity calculation from a lump sum.

### 4.3 Inputs

#### New Section: "Other Monthly Income (Optional)"
Collapsed by default. "Add income stream" button.

Per stream:
| Input | Type | Default | Notes |
|---|---|---|---|
| Label | Text | "Rental Income" / "Pension" / "Annuity" / Custom | Preset suggestions + custom |
| Monthly Amount (₹) | Number field | — | In today's rupees, post-tax |
| Inflation-linked? | Toggle | ON for Rental, OFF for Pension/Annuity | Pension usually fixed; rental usually rises |
| Starts at retirement? | Toggle | YES | If NO, show "starts after X years" field |
| End date | Toggle | NO (permanent) | If YES, show "ends after X years" field |

**Presets (click to fill):**
- Rental Income: inflation-linked ON, permanent
- Government Pension: inflation-linked OFF (fixed in many cases), permanent
- Annuity: inflation-linked OFF, permanent

### 4.4 Calculation Changes

For each simulation month `m`:

```
Other Income (month m) = Σ over active streams:
  if inflation-linked: stream.amount × (1 + inflation)^m
  else: stream.amount

Net Corpus Withdrawal (month m) = Gross Withdrawal (month m) − Other Income (month m)
Net Corpus Withdrawal = max(0, Net Corpus Withdrawal)  // can't be negative
```

The FD phase simulation feeds `Net Corpus Withdrawal` to `runFDPhase` instead of the raw withdrawal.

**Important:** If other income *exceeds* gross withdrawal in some month, net draw = 0 (no corpus draw that month). Surplus income does not get added back to corpus (it's spent). This is the correct behavior.

**Effective Withdrawal Rate** (for HealthScore):
```
Effective Annual Withdrawal Rate = (Annual Gross Withdrawal − Annual Other Income) / Total Corpus
```

Use the *net* rate for HealthScore and SWR zone display, but show both gross and net in Summary.

### 4.5 Output Changes

**Summary Tab:**
- Hero section: Add a secondary line "Other income covers ₹X/mo (Y% of expenses)"
- Stat cells: Add "Other Income" cell showing total other income over projection period
- HealthScore: Withdrawal rate factor uses *net* withdrawal rate

**New Summary sub-section: "Income Breakdown"**
- Small table showing:
  - Monthly Expenses (Scenario B, year 1): ₹X
  - Other Income (year 1): −₹Y
  - Net from Corpus: ₹Z (= X − Y)
  - Coverage ratio: Y/X as a % (e.g., "Your pension covers 29% of year-1 expenses")

**Timeline Tab:**
- Phase cards show: "Gross withdrawal | Other income offset | Net corpus draw"
- If income exceeds expenses in some future year (inflation-linked income grows faster than fixed pension), highlight that phase

**What-If Tab:**
- No change to What-If sliders (other income is a base input, not a What-If lever)
- But the What-If result automatically reflects the income streams

### 4.6 Display Subtlety: Showing Gross vs. Net
The key UX insight is that users think in terms of gross expenses (what they spend) but the corpus only cares about net draw. Show both:

- Input label: "Monthly Expenses (what you spend)"
- Output label: "Net corpus withdrawal (after other income)"

This prevents confusion where users lower their "withdrawal" input when they should enter actual expenses and let the tool compute the reduction.

---

## 5. Detailed Requirements: Feature 3 — Longevity Target in What-If

### 5.1 Overview
Add a "Plan to age" slider in the What-If sandbox. The tool shows whether the corpus lasts to that age and by how much (surplus or shortfall in years).

### 5.2 Inputs

Add to existing What-If controls:
| Input | Type | Default | Notes |
|---|---|---|---|
| Plan to age | Slider | current_age + 30 (or 85 if no age set) | Range: current_age + 10 to 100 |

Only shown if: current age > 0 (requires the age input to be set in the main inputs).

If age not set, show a small prompt: "Set your current age in inputs to use this."

### 5.3 Output Changes

**What-If result line (existing):** "Now lasts: XX yr YY mo (+/- delta)"

**New supplementary line (when longevity target set):**
- If corpus outlasts target age → "✓ Corpus lasts to age 87 (2 yr beyond your target of 85)"  — green
- If corpus falls short → "✗ Corpus runs out at age 79 (6 yr before your target of 85)" — red
- If perpetual → "✓ Corpus is self-sustaining — outlasts any realistic lifespan" — green

### 5.4 UX Note
This is explicitly a *goal check* (does my plan reach my target?), not a morbid dwelling on death. Frame it as "Planning horizon" rather than "When you die." The prompt suggestion ("morbid but helpful") from users confirms the concept is useful even if the label needs softening.

Label: **"Planning horizon (age)"** in the What-If section.

---

## 6. Tax Regime Tooltip (Non-Feature)

Instead of a full regime toggle, add a tooltip on the existing Tax Slab selector:

> "This is the effective income tax rate on your FD interest. Under the new tax regime, your slab may be lower than your total income suggests (no 80C/80D deductions). LTCG on equity MF is 12.5% under both regimes — the regime toggle does not affect that."

This addresses the feedback without adding a UI control that doesn't change any calculation.

---

## 7. Implementation Priority & Phasing

### Phase 1 (v2.0) — Build All Three Features
All three features have clear, non-conflicting implementations. Suggested order:

1. **Other Income Streams** — Highest impact per effort. Touch: `calculator.js` (pass net withdrawal), `InputPanel.jsx` (new section), `HeroSummary.jsx` (coverage %). Estimated complexity: Medium.

2. **Longevity Target in What-If** — Lowest effort. Touch: `WhatIf.jsx` (add slider + output line), `analysis.js` (add target-age check). Estimated complexity: Low.

3. **Additional Asset Classes** — Most complex. Touch: `calculator.js` (multi-bucket simulation), `InputPanel.jsx` (new card), `PhaseCard.jsx` (extra columns), `TaxSummary.jsx` (extra columns). Estimated complexity: High.

### Phase 2 (v2.1) — Polish & Extend
- Allow 2 additional asset buckets (Bucket 3 + Bucket 4)
- Add income stream chart to Timeline (show income coverage % over years)
- Corpus chart (MF + Bucket 3 over time on same axis)

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gold CAGR input misleads users | High | Medium | Prominent disclaimer; wide uncertainty range shown |
| Users enter gross rental (pre-tax) income | High | Medium | Label explicitly says "post-tax"; add tooltip explaining |
| Bucket 3 + income stream inputs overwhelm new users | Medium | High | Collapse both by default; progressive disclosure |
| LTCG exemption sharing across 3 buckets is complex | Medium | Low | Track exemption pool as a shared annual limit across all buckets |
| Longevity target with no age set | Low | Low | Hide the slider; prompt to set age |

---

## 9. Success Metrics

| Metric | Baseline | Target (3 months post-v2) |
|---|---|---|
| % of sessions that use Other Income | 0% | ≥ 15% |
| % of sessions that add Bucket 3 | 0% | ≥ 10% |
| % of sessions using What-If longevity target | 0% | ≥ 25% (among sessions with age set) |
| Session duration (avg) | Baseline TBD | +20% (deeper engagement with new inputs) |
| Share link click-through rate | Baseline TBD | Stable or improved (richer shared scenarios) |

---

## 10. Out of Scope (Explicitly Deferred)

- Old vs. new tax regime toggle (addressed by existing Tax Slab + new tooltip)
- Debt MF (different LTCG rules, shorter duration)
- NPS accumulation phase
- Real estate value appreciation (rental income in scope; property value appreciation is not)
- Insurance product modeling (ULIPs, term + investment combos)
- Monte Carlo / sequence-of-returns risk simulation
- Multi-currency (NRI use case)
- SIP during retirement (contributing to MF while drawing down)

---

## 11. Open Questions (Decisions Needed Before Build)

1. **Bucket 3 allocation:** Should Bucket 3 be specified as an absolute value (₹X) or as a % of total corpus? Absolute value is more intuitive (users know "I have ₹30L in SGBs"). Percentage adds complexity to the FD% slider.

2. **Income stream taxation:** Should we model TDS on rental income (30% TDS above ₹2.4L/year) and suggest the user deduct it? Or just accept post-tax figure and disclaim? Recommendation: post-tax only, keep it simple.

3. **Other income vs. withdrawal interaction in What-If:** If a user has ₹50K/month pension and ₹1.75L expenses, net draw is ₹1.25L. When the What-If slider adjusts "Monthly Withdrawal," does it adjust gross expenses or net corpus draw? Recommendation: adjust gross expenses (what the user controls); net draw moves accordingly.

4. **Phase label for Bucket 3:** When the simulator enters "Bucket 3 phase" (selling from the third asset), should we show it as a new "Phase N" in the timeline or as an extension of the existing phases? Recommendation: new phase type, different color, labeled "Bucket 3 phase."

---

*Document version: 1.0 | Last updated: June 2026*
