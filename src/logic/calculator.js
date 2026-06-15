const MAX_PHASES = 20
const MAX_MONTHS_PER_PHASE = 600

// Returns annual FD rate for a given absolute month
export function getFDRate(globalMonth, startRate, declineEnabled, declineRate, declinePeriod, floor) {
  if (!declineEnabled) return startRate
  const periods = Math.floor(globalMonth / declinePeriod)
  const rate = startRate - periods * declineRate
  return Math.max(rate, floor)
}

// Compute total other income for a given global month from all active streams.
// Inflation-linked streams grow with the same monthly inflation rate as expenses.
function computeOtherIncome(streams, globalMonth, inflationRate) {
  if (!streams || streams.length === 0) return 0
  let total = 0
  for (const s of streams) {
    const start = s.startMonth || 0
    if (globalMonth < start) continue
    if (s.endMonth != null && globalMonth > s.endMonth) continue
    total += s.inflationLinked
      ? s.monthlyAmount * Math.pow(1 + inflationRate / 12, globalMonth)
      : s.monthlyAmount
  }
  return total
}

// Calculate LTCG tax at a phase transition.
// ltcgTax includes the mandatory 4% Health & Education Cess (effective rate = ltcgRate × 1.04).
export function calcLTCG(mfCorpus, costBasis, ltcgEnabled, ltcgRate, ltcgExemption) {
  if (!ltcgEnabled || mfCorpus <= costBasis) return { taxableGains: 0, ltcgTax: 0, netProceeds: mfCorpus }
  const gains = mfCorpus - costBasis
  const taxableGains = Math.max(0, gains - ltcgExemption)
  const ltcgTax = taxableGains * ltcgRate * 1.04
  return { taxableGains, ltcgTax, netProceeds: mfCorpus - ltcgTax }
}

// Calculate tax on Bucket 3 redemption.
// taxType 'slab': gains × effectiveTaxRate (no annual exemption, no cess — consistent with FD treatment)
// taxType 'ltcg': shares the ₹1.25L annual exemption pool with MF; includes 4% cess + surcharge capped at 15%
function calcB3Tax({ b3Corpus, b3CostBasis, taxType, taxSlab, surchargePct, ltcgRate, availableExemption }) {
  if (b3Corpus <= b3CostBasis) return { b3Tax: 0, b3TaxableGains: 0, b3NetProceeds: b3Corpus }
  const gains = b3Corpus - b3CostBasis
  if (taxType === 'ltcg') {
    const taxableGains = Math.max(0, gains - availableExemption)
    const ltcgSurcharge = Math.min(surchargePct, 0.15)
    const b3Tax = taxableGains * ltcgRate * (1 + ltcgSurcharge) * 1.04
    return { b3Tax, b3TaxableGains: taxableGains, b3NetProceeds: b3Corpus - b3Tax }
  } else {
    // slab rate on gains, no cess (matching FD treatment for consistency)
    const b3Tax = gains * taxSlab * (1 + surchargePct)
    return { b3Tax, b3TaxableGains: gains, b3NetProceeds: b3Corpus - b3Tax }
  }
}

// Run a single FD phase month by month.
// Other income streams reduce the net draw from the FD each month.
// totalNomWd = net corpus draws (gross expense minus other income)
// totalGrossExpense = what the user actually spends each month (before income offset)
// totalOtherIncome = total covered by other income sources
export function runFDPhase({
  principal,
  baseWithdrawal,
  globalMonthOffset,
  startRate,
  inflationRate,
  taxSlab,
  surchargePct = 0,
  isInflationAdjusted,
  fdDeclineEnabled,
  fdDeclineRate,
  fdDeclinePeriod,
  fdFloor,
  otherIncomeStreams = [],
}) {
  const rows = []
  let balance = principal
  let totalNomWd = 0
  let totalRealWd = 0
  let totalFDTax = 0
  let totalGrossExpense = 0
  let totalOtherIncome = 0
  let exhaustedMonth = null

  for (let m = 0; m < MAX_MONTHS_PER_PHASE; m++) {
    const globalMonth = globalMonthOffset + m
    const annualRate = getFDRate(globalMonth, startRate, fdDeclineEnabled, fdDeclineRate, fdDeclinePeriod, fdFloor)
    const monthlyRate = annualRate / 12

    const interest = balance * monthlyRate
    const fdTax = interest * taxSlab * (1 + surchargePct)
    const netInterest = interest - fdTax

    // Gross expense this month (what the user actually spends)
    const grossExpense = isInflationAdjusted
      ? baseWithdrawal * Math.pow(1 + inflationRate / 12, globalMonth)
      : baseWithdrawal

    // Other income this month reduces what the FD must cover
    const monthlyOtherIncome = computeOtherIncome(otherIncomeStreams, globalMonth, inflationRate)

    // Net FD draw = what the FD needs to supply after other income
    const nominalWd = Math.max(0, grossExpense - monthlyOtherIncome)

    let actualWd = nominalWd
    let principalDraw = 0

    if (nominalWd <= netInterest) {
      principalDraw = 0
      balance = balance + interest - fdTax - nominalWd
    } else {
      principalDraw = nominalWd - netInterest
      balance = balance - principalDraw
    }

    if (balance < 0) {
      actualWd = nominalWd + balance
      balance = 0
    }

    totalNomWd += actualWd
    totalRealWd += actualWd / Math.pow(1 + inflationRate / 12, globalMonth)
    totalFDTax += fdTax
    totalGrossExpense += grossExpense
    totalOtherIncome += monthlyOtherIncome

    rows.push({
      month: m + 1,
      globalMonth: globalMonth + 1,
      year: Math.ceil((m + 1) / 12),
      fdRate: annualRate,
      fdOpening: balance + principalDraw > 0 ? balance + principalDraw : principal - totalNomWd + totalFDTax + actualWd,
      fdOpeningCorrect: rows.length === 0 ? principal : rows[rows.length - 1].fdClosing,
      interest,
      fdTax,
      netInterest,
      grossExpense,
      monthlyOtherIncome,
      nominalWd: actualWd,
      realWd: actualWd / Math.pow(1 + inflationRate / 12, globalMonth),
      realWdPct: (actualWd / Math.pow(1 + inflationRate / 12, globalMonth)) / baseWithdrawal,
      fdClosing: balance,
      principalDraw,
    })

    if (balance <= 0) {
      exhaustedMonth = m + 1
      break
    }
  }

  return { rows, exhaustedMonth, totalNomWd, totalRealWd, totalFDTax, totalGrossExpense, totalOtherIncome }
}

// Rebuild rows with correct opening balance
function correctRows(rows, principal) {
  let bal = principal
  return rows.map((r) => {
    const opening = bal
    const closing = r.fdClosing
    bal = closing
    return { ...r, fdOpening: opening }
  })
}

// Below this value mfCorpus is treated as depleted and Bucket 3 takes over as the refill source.
const MF_THRESHOLD = 1000

// Run full multi-phase simulation for one scenario
function simulateScenario({
  fdAmount,
  mfAmount,
  fdPct,
  monthlyWithdrawal,
  fdStartRate,
  mfRate,
  inflationRate,
  taxSlab,
  ltcgEnabled,
  fdDeclineEnabled,
  fdDeclineRate,
  fdDeclinePeriod,
  fdFloor,
  ltcgRate,
  ltcgExemption,
  isInflationAdjusted,
  otherIncomeStreams = [],
  bucket3 = null,
  surchargePct = 0,
  jointPortfolio = false,
}) {
  const sellPct = (fdPct != null && fdPct > 0 && fdPct < 1) ? fdPct : 0.5
  // Joint portfolio doubles the annual LTCG exemption (each spouse gets ₹1.25L)
  const effectiveLtcgExemption = (jointPortfolio ? 2 : 1) * ltcgExemption

  const phases = []
  let fdPrincipal = fdAmount
  let mfCorpus = mfAmount
  let mfCostBasis = mfAmount
  let b3Corpus = bucket3 ? (bucket3.amount || 0) : 0
  let b3CostBasis = b3Corpus
  const b3MonthlyRate = bucket3 ? Math.pow(1 + (bucket3.cagr || 0), 1 / 12) - 1 : 0
  let globalMonth = 0
  let perpetual = false
  let perpetualPhase = null
  let incomingLtcgTax = 0
  let incomingB3Tax = 0
  const yearlyExemptionUsed = {}

  for (let phaseIdx = 0; phaseIdx < MAX_PHASES; phaseIdx++) {
    const mfEffective = mfCorpus > MF_THRESHOLD ? mfCorpus : 0
    if (fdPrincipal <= 0 && mfEffective <= 0 && b3Corpus <= 0) break

    const fdRateAtStart = getFDRate(globalMonth, fdStartRate, fdDeclineEnabled, fdDeclineRate, fdDeclinePeriod, fdFloor)

    const {
      rows: rawRows,
      exhaustedMonth,
      totalNomWd,
      totalRealWd,
      totalFDTax,
      totalGrossExpense,
      totalOtherIncome,
    } = runFDPhase({
      principal: fdPrincipal,
      baseWithdrawal: monthlyWithdrawal,
      globalMonthOffset: globalMonth,
      startRate: fdStartRate,
      inflationRate,
      taxSlab,
      surchargePct,
      isInflationAdjusted,
      fdDeclineEnabled,
      fdDeclineRate,
      fdDeclinePeriod,
      fdFloor,
      otherIncomeStreams,
    })

    const correctedRows = correctRows(rawRows, fdPrincipal)
    const fdMonths = correctedRows.length
    const fdRateAtEnd = getFDRate(globalMonth + fdMonths - 1, fdStartRate, fdDeclineEnabled, fdDeclineRate, fdDeclinePeriod, fdFloor)

    const mfMonthlyRate = Math.pow(1 + mfRate, 1 / 12) - 1
    const mfEndNominal = mfCorpus * Math.pow(1 + mfMonthlyRate, fdMonths)
    const mfEndCostBasis = mfCostBasis
    const mfEndReal = mfEndNominal / Math.pow(1 + inflationRate / 12, globalMonth + fdMonths)

    // Bucket 3 grows passively during every FD phase
    const b3EndNominal = b3Corpus * Math.pow(1 + b3MonthlyRate, fdMonths)

    const firstRow = correctedRows[0]
    const lastRow = correctedRows[correctedRows.length - 1]

    const phaseBase = {
      phase: phaseIdx + 1,
      fdPrincipal,
      mfStart: mfCorpus,
      mfCostBasis,
      globalStart: globalMonth + 1,
      globalEnd: globalMonth + fdMonths,
      fdMonths,
      totalNomWd,
      totalRealWd,
      totalFDTax,
      totalGrossExpense,
      totalOtherIncome,
      mfEndNominal,
      mfEndReal,
      mfEndCostBasis,
      firstNomWd: firstRow?.nominalWd ?? 0,
      firstRealWd: firstRow?.realWd ?? 0,
      lastNomWd: lastRow?.nominalWd ?? 0,
      lastRealWd: lastRow?.realWd ?? 0,
      fdRateStart: fdRateAtStart,
      fdRateEnd: fdRateAtEnd,
      incomingLtcgTax,
      incomingB3Tax,
      b3Start: b3Corpus,
      b3End: b3EndNominal,
      rows: correctedRows,
    }

    if (!exhaustedMonth) {
      perpetual = true
      perpetualPhase = phaseIdx + 1
      phases.push({
        ...phaseBase,
        ltcgTax: 0,
        taxableGains: 0,
        nextFD: 0,
        nextMF: 0,
        b3Tax: 0,
        b3TaxableGains: 0,
        nextB3: b3Corpus,
        fromB3: false,
        perpetual: true,
      })
      break
    }

    const saleYearIdx = Math.floor((globalMonth + fdMonths) / 12)

    // ── Determine refill source: MF first, then B3 ──
    let nextFD = 0, nextMF = 0, nextMFCostBasis = 0
    let nextB3 = b3EndNominal, nextB3CostBasis = b3CostBasis
    let ltcgTax = 0, taxableGains = 0
    let b3Tax = 0, b3TaxableGains = 0
    let fromB3 = false

    if (mfEffective > 0) {
      // ── Sell from MF (existing path) ──
      const sellMF = mfEndNominal * sellPct
      const keepMF = mfEndNominal * (1 - sellPct)
      const sellCostBasis = mfEndCostBasis * sellPct
      const keepCostBasis = mfEndCostBasis * (1 - sellPct)

      const usedThisYear = yearlyExemptionUsed[saleYearIdx] || 0
      const effectiveExemption = Math.max(0, effectiveLtcgExemption - usedThisYear)
      const ltcg = calcLTCG(sellMF, sellCostBasis, ltcgEnabled, ltcgRate, effectiveExemption)
      // Track exemption used (only the portion that actually offset gains)
      if (ltcgEnabled && sellMF > sellCostBasis) {
        const gains = sellMF - sellCostBasis
        yearlyExemptionUsed[saleYearIdx] = usedThisYear + Math.min(gains, effectiveExemption)
      }
      // Apply surcharge to LTCG (capped at 15%)
      const ltcgSurcharge = Math.min(surchargePct, 0.15)
      ltcgTax = ltcg.ltcgTax * (1 + ltcgSurcharge) // base already has 1.04 cess from calcLTCG
      taxableGains = ltcg.taxableGains

      nextFD = ltcg.netProceeds - (ltcgTax - ltcg.ltcgTax) // adjust for surcharge delta
      nextMF = keepMF
      nextMFCostBasis = keepCostBasis
      // B3 grew but wasn't sold
      nextB3 = b3EndNominal
      nextB3CostBasis = b3CostBasis

    } else if (b3Corpus > 0) {
      // ── Sell from Bucket 3 ──
      fromB3 = true
      const sellB3 = b3EndNominal * sellPct
      const keepB3 = b3EndNominal * (1 - sellPct)
      const sellB3CostBasis = b3CostBasis * sellPct
      const keepB3CostBasis = b3CostBasis * (1 - sellPct)

      let availableExemption = 0
      if (bucket3.taxType === 'ltcg') {
        const usedThisYear = yearlyExemptionUsed[saleYearIdx] || 0
        availableExemption = Math.max(0, effectiveLtcgExemption - usedThisYear)
      }
      const b3Result = calcB3Tax({
        b3Corpus: sellB3,
        b3CostBasis: sellB3CostBasis,
        taxType: bucket3.taxType || 'slab',
        taxSlab,
        surchargePct,
        ltcgRate,
        availableExemption,
      })
      b3Tax = b3Result.b3Tax
      b3TaxableGains = b3Result.b3TaxableGains
      // Track exemption used if B3 was LTCG type
      if (bucket3.taxType === 'ltcg' && sellB3 > sellB3CostBasis) {
        const gains = sellB3 - sellB3CostBasis
        const usedThisYear = yearlyExemptionUsed[saleYearIdx] || 0
        yearlyExemptionUsed[saleYearIdx] = usedThisYear + Math.min(gains, availableExemption)
      }

      nextFD = b3Result.b3NetProceeds
      nextMF = 0
      nextMFCostBasis = 0
      nextB3 = keepB3
      nextB3CostBasis = keepB3CostBasis
    }

    phases.push({
      ...phaseBase,
      ltcgTax,
      taxableGains,
      nextFD,
      nextMF,
      b3Tax,
      b3TaxableGains,
      nextB3,
      fromB3,
      perpetual: false,
    })

    globalMonth += fdMonths
    fdPrincipal = nextFD
    mfCorpus = nextMF
    mfCostBasis = nextMFCostBasis
    b3Corpus = nextB3
    b3CostBasis = nextB3CostBasis
    incomingLtcgTax = ltcgTax
    incomingB3Tax = b3Tax

    if (fdPrincipal <= 0 && (mfCorpus <= MF_THRESHOLD) && b3Corpus <= 0) break
  }

  const totalMonths = perpetual ? null : phases.reduce((s, p) => s + p.fdMonths, 0)
  const totalNomWd = phases.reduce((s, p) => s + p.totalNomWd, 0)
  const totalRealWd = phases.reduce((s, p) => s + p.totalRealWd, 0)
  const totalFDTax = phases.reduce((s, p) => s + p.totalFDTax, 0)
  const totalLTCG = phases.reduce((s, p) => s + (p.ltcgTax || 0), 0)
  const totalB3Tax = phases.reduce((s, p) => s + (p.b3Tax || 0), 0)
  const totalGrossExpense = phases.reduce((s, p) => s + (p.totalGrossExpense || 0), 0)
  const totalOtherIncome = phases.reduce((s, p) => s + (p.totalOtherIncome || 0), 0)
  const lastPhase = phases[phases.length - 1]
  const finalMF = lastPhase?.mfEndNominal ?? 0
  const finalMFReal = lastPhase?.mfEndReal ?? 0
  const finalB3 = lastPhase?.nextB3 ?? 0

  return {
    phases,
    perpetual,
    perpetualPhase,
    totalMonths,
    totalNomWd,
    totalRealWd,
    totalFDTax,
    totalLTCG,
    totalB3Tax,
    totalTax: totalFDTax + totalLTCG + totalB3Tax,
    totalGrossExpense,
    totalOtherIncome,
    finalMF,
    finalMFReal,
    finalB3,
  }
}

// Main export: run both scenarios
export function simulateAllPhases(inputs) {
  const base = { ...inputs }
  const streams = inputs.otherIncomeStreams || []
  const bucket3 = inputs.bucket3 || null
  const surchargePct = inputs.surchargePct || 0
  const jointPortfolio = inputs.jointPortfolio || false
  const scenarioA = simulateScenario({ ...base, isInflationAdjusted: false, otherIncomeStreams: streams, bucket3, surchargePct, jointPortfolio })
  const scenarioB = simulateScenario({ ...base, isInflationAdjusted: true, otherIncomeStreams: streams, bucket3, surchargePct, jointPortfolio })
  return { scenarioA, scenarioB }
}
