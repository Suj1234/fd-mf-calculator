const MAX_PHASES = 20
const MAX_MONTHS_PER_PHASE = 600

// Returns annual FD rate for a given absolute month
export function getFDRate(globalMonth, startRate, declineEnabled, declineRate, declinePeriod, floor) {
  if (!declineEnabled) return startRate
  const periods = Math.floor(globalMonth / declinePeriod)
  const rate = startRate - periods * declineRate
  return Math.max(rate, floor)
}

// Calculate LTCG tax at a phase transition
export function calcLTCG(mfCorpus, costBasis, ltcgEnabled, ltcgRate, ltcgExemption) {
  if (!ltcgEnabled || mfCorpus <= costBasis) return { taxableGains: 0, ltcgTax: 0, netProceeds: mfCorpus }
  const gains = mfCorpus - costBasis
  const taxableGains = Math.max(0, gains - ltcgExemption)
  const ltcgTax = taxableGains * ltcgRate
  return { taxableGains, ltcgTax, netProceeds: mfCorpus - ltcgTax }
}

// Run a single FD phase month by month
// Returns { rows, exhaustedMonth, totalNomWd, totalRealWd, totalFDTax }
export function runFDPhase({
  principal,
  baseWithdrawal,
  globalMonthOffset,
  startRate,
  inflationRate,
  taxSlab,
  isInflationAdjusted,
  fdDeclineEnabled,
  fdDeclineRate,
  fdDeclinePeriod,
  fdFloor,
}) {
  const rows = []
  let balance = principal
  let totalNomWd = 0
  let totalRealWd = 0
  let totalFDTax = 0
  let exhaustedMonth = null

  for (let m = 0; m < MAX_MONTHS_PER_PHASE; m++) {
    const globalMonth = globalMonthOffset + m
    const annualRate = getFDRate(globalMonth, startRate, fdDeclineEnabled, fdDeclineRate, fdDeclinePeriod, fdFloor)
    const monthlyRate = annualRate / 12

    const interest = balance * monthlyRate
    const fdTax = interest * taxSlab
    const netInterest = interest - fdTax

    // Inflation-adjusted withdrawal grows continuously from month 0
    const nominalWd = isInflationAdjusted
      ? baseWithdrawal * Math.pow(1 + inflationRate / 12, globalMonth)
      : baseWithdrawal

    // Real value = purchasing power in today's ₹
    const realWd = nominalWd / Math.pow(1 + inflationRate / 12, globalMonth)

    let actualWd = nominalWd
    let principalDraw = 0

    if (nominalWd <= netInterest) {
      // Withdrawal covered by net interest alone
      principalDraw = 0
      balance = balance + interest - fdTax - nominalWd
    } else {
      // Draw from principal too
      principalDraw = nominalWd - netInterest
      balance = balance - principalDraw
    }

    if (balance < 0) {
      actualWd = nominalWd + balance // partial last withdrawal
      balance = 0
    }

    totalNomWd += actualWd
    totalRealWd += actualWd / Math.pow(1 + inflationRate / 12, globalMonth)
    totalFDTax += fdTax

    rows.push({
      month: m + 1,
      globalMonth: globalMonth + 1,
      year: Math.ceil((m + 1) / 12),
      fdRate: annualRate,
      fdOpening: balance + principalDraw > 0 ? balance + principalDraw : principal - totalNomWd + totalFDTax + actualWd,
      // recalculate opening correctly
      fdOpeningCorrect: rows.length === 0 ? principal : rows[rows.length - 1].fdClosing,
      interest,
      fdTax,
      netInterest,
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

  return { rows, exhaustedMonth, totalNomWd, totalRealWd, totalFDTax }
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

// Run full multi-phase simulation for one scenario
function simulateScenario({
  fdAmount,
  mfAmount,
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
}) {
  const phases = []
  let fdPrincipal = fdAmount
  let mfCorpus = mfAmount
  let mfCostBasis = mfAmount
  let globalMonth = 0
  let perpetual = false
  let perpetualPhase = null

  for (let phaseIdx = 0; phaseIdx < MAX_PHASES; phaseIdx++) {
    if (fdPrincipal <= 0 && mfCorpus <= 0) break

    const fdRateAtStart = getFDRate(globalMonth, fdStartRate, fdDeclineEnabled, fdDeclineRate, fdDeclinePeriod, fdFloor)

    // Run the FD phase
    const { rows: rawRows, exhaustedMonth, totalNomWd, totalRealWd, totalFDTax } = runFDPhase({
      principal: fdPrincipal,
      baseWithdrawal: monthlyWithdrawal,
      globalMonthOffset: globalMonth,
      startRate: fdStartRate,
      inflationRate,
      taxSlab,
      isInflationAdjusted,
      fdDeclineEnabled,
      fdDeclineRate,
      fdDeclinePeriod,
      fdFloor,
    })

    const correctedRows = correctRows(rawRows, fdPrincipal)
    const fdMonths = correctedRows.length
    const fdRateAtEnd = getFDRate(globalMonth + fdMonths - 1, fdStartRate, fdDeclineEnabled, fdDeclineRate, fdDeclinePeriod, fdFloor)

    // MF compounds untouched during FD phase
    const mfMonthlyRate = mfRate / 12
    const mfEndNominal = mfCorpus * Math.pow(1 + mfMonthlyRate, fdMonths)
    // MF cost basis tracks the original investment
    const mfEndCostBasis = mfCostBasis

    // Real value of MF at end
    const mfEndReal = mfEndNominal / Math.pow(1 + inflationRate / 12, globalMonth + fdMonths)

    const firstRow = correctedRows[0]
    const lastRow = correctedRows[correctedRows.length - 1]

    // Check perpetual: if FD rate is self-sustaining (last month balance > first month balance)
    // FD self-sustains when monthly net interest >= monthly withdrawal in Scenario A
    const lastMonthRate = getFDRate(globalMonth + fdMonths - 1, fdStartRate, fdDeclineEnabled, fdDeclineRate, fdDeclinePeriod, fdFloor)
    const lastMonthInterest = fdPrincipal * (lastMonthRate / 12)
    const lastMonthNetInterest = lastMonthInterest * (1 - taxSlab)
    const lastMonthWd = isInflationAdjusted
      ? monthlyWithdrawal * Math.pow(1 + inflationRate / 12, globalMonth + fdMonths - 1)
      : monthlyWithdrawal

    // Perpetual check: FD lasted the full MAX_MONTHS_PER_PHASE (it didn't exhaust)
    if (!exhaustedMonth) {
      perpetual = true
      perpetualPhase = phaseIdx + 1
      phases.push({
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
        mfEndNominal,
        mfEndReal,
        mfEndCostBasis,
        firstNomWd: firstRow?.nominalWd ?? 0,
        firstRealWd: firstRow?.realWd ?? 0,
        lastNomWd: lastRow?.nominalWd ?? 0,
        lastRealWd: lastRow?.realWd ?? 0,
        fdRateStart: fdRateAtStart,
        fdRateEnd: fdRateAtEnd,
        ltcgTax: 0,
        taxableGains: 0,
        nextFD: 0,
        nextMF: 0,
        rows: correctedRows,
        perpetual: true,
      })
      break
    }

    // LTCG calculation on half of MF corpus at transition
    const halfMF = mfEndNominal / 2
    const halfCostBasis = mfEndCostBasis / 2
    const { taxableGains, ltcgTax, netProceeds } = calcLTCG(halfMF, halfCostBasis, ltcgEnabled, ltcgRate, ltcgExemption)

    const nextFD = netProceeds
    const nextMF = halfMF
    // The half that stays in MF keeps its original cost basis (unrealised units not sold)
    const nextMFCostBasis = halfCostBasis

    phases.push({
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
      mfEndNominal,
      mfEndReal,
      mfEndCostBasis,
      firstNomWd: firstRow?.nominalWd ?? 0,
      firstRealWd: firstRow?.realWd ?? 0,
      lastNomWd: lastRow?.nominalWd ?? 0,
      lastRealWd: lastRow?.realWd ?? 0,
      fdRateStart: fdRateAtStart,
      fdRateEnd: fdRateAtEnd,
      taxableGains,
      ltcgTax,
      nextFD,
      nextMF,
      rows: correctedRows,
      perpetual: false,
    })

    globalMonth += fdMonths
    fdPrincipal = nextFD
    mfCorpus = nextMF
    mfCostBasis = nextMFCostBasis

    if (fdPrincipal <= 0 && mfCorpus <= 0) break
  }

  // Summary
  const totalMonths = perpetual ? null : phases.reduce((s, p) => s + p.fdMonths, 0)
  const totalNomWd = phases.reduce((s, p) => s + p.totalNomWd, 0)
  const totalRealWd = phases.reduce((s, p) => s + p.totalRealWd, 0)
  const totalFDTax = phases.reduce((s, p) => s + p.totalFDTax, 0)
  const totalLTCG = phases.reduce((s, p) => s + (p.ltcgTax || 0), 0)
  const lastPhase = phases[phases.length - 1]
  const finalMF = lastPhase?.mfEndNominal ?? 0
  const finalMFReal = lastPhase?.mfEndReal ?? 0

  return {
    phases,
    perpetual,
    perpetualPhase,
    totalMonths,
    totalNomWd,
    totalRealWd,
    totalFDTax,
    totalLTCG,
    totalTax: totalFDTax + totalLTCG,
    finalMF,
    finalMFReal,
  }
}

// Main export: run both scenarios
export function simulateAllPhases(inputs) {
  const base = { ...inputs }
  const scenarioA = simulateScenario({ ...base, isInflationAdjusted: false })
  const scenarioB = simulateScenario({ ...base, isInflationAdjusted: true })
  return { scenarioA, scenarioB }
}
