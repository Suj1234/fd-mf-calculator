import { simulateAllPhases } from './calculator'

// ─── Safe withdrawal rate ───────────────────────────────────────────────────
// The Indian equivalent of the "4% rule": annual withdrawals ÷ corpus.
export function withdrawalRate(inputs) {
  if (!inputs.totalCorpus) return 0
  return (inputs.monthlyWithdrawal * 12) / inputs.totalCorpus
}

export function swrZone(rate) {
  if (rate <= 0.05) return { zone: 'safe', label: 'Safe', color: '#059669' }
  if (rate <= 0.07) return { zone: 'moderate', label: 'Stretched', color: '#d97706' }
  return { zone: 'high', label: 'High', color: '#dc2626' }
}

// Duration of the realistic (inflation-adjusted) scenario, in months.
// Returns Infinity when self-sustaining.
function realisticMonths(result) {
  const b = result.scenarioB
  return b.perpetual ? Infinity : (b.totalMonths || 0)
}

// ─── Health score (0–100) ───────────────────────────────────────────────────
// Synthesises three things a retiree actually cares about: how long the money
// lasts (inflation-adjusted), how aggressive the withdrawal is, and how much
// tax drags on it. Weighted 50 / 35 / 15.
export function healthScore(inputs, result) {
  const months = realisticMonths(result)
  const durationScore = months === Infinity ? 50 : Math.min(50, (months / 480) * 50)

  const rate = withdrawalRate(inputs)
  // 4% → full marks, 10%+ → zero.
  const swrScore = Math.max(0, Math.min(35, ((0.10 - rate) / (0.10 - 0.04)) * 35))

  const b = result.scenarioB
  const taxRatio = b.totalNomWd > 0 ? b.totalTax / b.totalNomWd : 0
  // 5% tax drag → full marks, 20%+ → zero.
  const taxScore = Math.max(0, Math.min(15, ((0.20 - taxRatio) / (0.20 - 0.05)) * 15))

  const score = Math.round(durationScore + swrScore + taxScore)

  const grade =
    score >= 85 ? { letter: 'A', label: 'Excellent', color: '#059669' } :
    score >= 70 ? { letter: 'B', label: 'Good',      color: '#059669' } :
    score >= 55 ? { letter: 'C', label: 'Moderate',  color: '#d97706' } :
    score >= 40 ? { letter: 'D', label: 'Weak',      color: '#ea580c' } :
                  { letter: 'E', label: 'Critical',  color: '#dc2626' }

  return {
    score,
    ...grade,
    breakdown: [
      { label: 'Longevity', got: Math.round(durationScore), max: 50 },
      { label: 'Withdrawal rate', got: Math.round(swrScore), max: 35 },
      { label: 'Tax efficiency', got: Math.round(taxScore), max: 15 },
    ],
  }
}

// ─── "Increase my runway" tips ──────────────────────────────────────────────
// Each tip re-runs the simulation with a single lever changed and reports the
// gain in the realistic scenario. Only positive, meaningful gains are returned.
export function runwayTips(inputs, baselineResult) {
  const base = realisticMonths(baselineResult)
  if (base === Infinity) return [] // already self-sustaining — nothing to fix

  const tips = []
  const tryTweak = (label, patched) => {
    let r
    try { r = simulateAllPhases(patched) } catch { return }
    const m = realisticMonths(r)
    const delta = m === Infinity ? Infinity : m - base
    if (delta === Infinity) tips.push({ label, gain: 'becomes self-sustaining', strong: true, delta: Infinity })
    else if (delta >= 1) tips.push({ label, gain: `+${fmtDelta(delta)}`, strong: delta >= 24, delta })
  }

  // 1. Spend ₹20k/mo less.
  if (inputs.monthlyWithdrawal > 25000) {
    tryTweak('Reduce monthly withdrawal by ₹20,000', {
      ...inputs, monthlyWithdrawal: inputs.monthlyWithdrawal - 20000,
    })
  }
  // 2. Shift 10% from FD into MF.
  if (inputs.fdPct > 0.25) {
    const fdPct = Math.max(0, inputs.fdPct - 0.1)
    tryTweak('Move 10% from FD into MF (more growth)', {
      ...inputs, fdPct,
      fdAmount: Math.round(inputs.totalCorpus * fdPct),
      mfAmount: Math.round(inputs.totalCorpus * (1 - fdPct)),
    })
  }
  // 3. (Illustrative) remove LTCG drag.
  if (inputs.ltcgEnabled) {
    tryTweak('If LTCG tax did not apply', { ...inputs, ltcgEnabled: false })
  }

  tips.sort((a, b) => (b.delta === Infinity ? 1e9 : b.delta) - (a.delta === Infinity ? 1e9 : a.delta))
  return tips
}

function fmtDelta(months) {
  const yrs = Math.floor(months / 12)
  const mo = Math.round(months % 12)
  if (yrs === 0) return `${mo} mo`
  if (mo === 0) return `${yrs} yr`
  return `${yrs} yr ${mo} mo`
}
