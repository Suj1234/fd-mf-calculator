import { formatCompact, formatDuration } from '../logic/formatters'

// ─── Benchmark band ────────────────────────────────────────────────────────────

function BenchmarkBand({ totalMonths, perpetual, currentAge }) {
  const MAX_MONTHS = 480 // 40 years caps the bar
  const rawPos = perpetual ? 99 : (totalMonths / MAX_MONTHS) * 100
  const markerPos = Math.min(99, Math.max(1, rawPos))

  const zone = (perpetual || totalMonths >= 300) ? 'Healthy'
    : totalMonths >= 180 ? 'Moderate'
    : 'Caution'

  // Absolute age labels at zone transitions (only when user entered an age)
  const ageAt15yr = currentAge > 0 ? currentAge + 15 : null
  const ageAt25yr = currentAge > 0 ? currentAge + 25 : null

  return (
    <div className="px-6 pb-6 pt-1">
      {/* "You're here" label above marker */}
      <div className="relative h-5 mb-0.5">
        <div
          className="absolute flex flex-col items-center"
          style={{ left: `${markerPos}%`, transform: 'translateX(-50%)' }}
        >
          <span className="text-[9px] text-text-muted whitespace-nowrap leading-none">you're here</span>
          <span className="text-[9px] text-text-muted leading-none">↓</span>
        </div>
      </div>

      {/* Segmented bar */}
      <div className="relative flex rounded-md overflow-hidden h-2.5">
        {/* Zone fills */}
        <div className="bg-red-200"   style={{ width: '37.5%' }} />
        <div className="bg-amber-200" style={{ width: '25%' }}   />
        <div className="bg-emerald-200" style={{ width: '37.5%' }} />
        {/* Marker line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#0f172a] rounded-full"
          style={{ left: `${markerPos}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Zone labels with age tick marks */}
      <div className="flex mt-1.5">
        <div className="text-center" style={{ width: '37.5%' }}>
          <div className={`text-[9px] font-semibold ${zone === 'Caution' ? 'text-red-500' : 'text-red-400'}`}>Caution</div>
          <div className="text-[9px] text-text-muted">0–15 yr{ageAt15yr ? ` · to age ${ageAt15yr}` : ''}</div>
        </div>
        <div className="text-center" style={{ width: '25%' }}>
          <div className={`text-[9px] font-semibold ${zone === 'Moderate' ? 'text-amber-500' : 'text-amber-400'}`}>Moderate</div>
          <div className="text-[9px] text-text-muted">15–25 yr{ageAt25yr ? ` · to ${ageAt25yr}` : ''}</div>
        </div>
        <div className="text-center" style={{ width: '37.5%' }}>
          <div className={`text-[9px] font-semibold ${zone === 'Healthy' ? 'text-emerald-600' : 'text-emerald-400'}`}>Healthy</div>
          <div className="text-[9px] text-text-muted">25+ yr{ageAt25yr ? ` · age ${ageAt25yr}+` : ''}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Stat cell ─────────────────────────────────────────────────────────────────

function StatCell({ label, value, sub, subClass = 'text-text-muted', valueClass = 'text-text-secondary' }) {
  return (
    <div className="bg-card px-4 py-4 text-center">
      <div className="text-[10px] uppercase tracking-[0.1em] text-text-muted mb-1.5">{label}</div>
      <div className={`num text-sm font-semibold ${valueClass}`}>{value}</div>
      {sub && <div className={`num text-[10px] mt-0.5 ${subClass}`}>{sub}</div>}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function HeroSummary({ scenarioA, scenarioB, activeScenario, currentAge, monthlyWithdrawal, inflationRate }) {
  const active = activeScenario === 'A' ? scenarioA : scenarioB
  const perpetual = active.perpetual

  const durationText = perpetual
    ? 'FOREVER'
    : active.totalMonths ? formatDuration(active.totalMonths) : '—'

  const nonPerpetualMonths = active.phases
    .filter((p) => !p.perpetual)
    .reduce((s, p) => s + p.fdMonths, 0)

  const subLabel = perpetual
    ? `Self-sustaining after ${formatDuration(nonPerpetualMonths)}`
    : active.totalMonths ? `${active.totalMonths} months total` : ''

  const heroColor = perpetual
    ? 'text-accent-mf'
    : active.totalMonths && active.totalMonths < 120
    ? 'text-accent-tax'
    : 'text-text-primary'

  // Age-based display
  const ageAtEnd = currentAge > 0 && !perpetual && active.totalMonths
    ? Math.round(currentAge + active.totalMonths / 12)
    : null

  // Buying power of a "perpetual" fixed withdrawal after 30 years (P14).
  const buyingPower30 = monthlyWithdrawal && inflationRate
    ? Math.round(monthlyWithdrawal / Math.pow(1 + inflationRate, 30))
    : null


  return (
    <div className="flex flex-col gap-3">

      {/* ── Hero card ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        {/* The big answer */}
        <div className="py-8 px-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-4">
            {activeScenario === 'A' ? 'Fixed Withdrawal · Scenario A' : 'Inflation-Adjusted · Scenario B (recommended)'}
          </p>

          <p
            className={`num font-bold leading-none ${heroColor}`}
            style={{ fontSize: perpetual ? '5rem' : '3.5rem' }}
          >
            {durationText}
          </p>

          {ageAtEnd && (
            <p className="text-sm text-text-muted mt-2">until you're {ageAtEnd}</p>
          )}

          {subLabel && !ageAtEnd && (
            <p className="text-sm text-text-muted mt-3">{subLabel}</p>
          )}

          {perpetual && (
            <p className="text-xs text-text-muted mt-2">*Perpetual in <span className="font-medium">nominal</span> rupees — not in real spending power</p>
          )}
        </div>

        {/* "Forever is an illusion" warning — fixed-withdrawal only (P14) */}
        {perpetual && buyingPower30 && (
          <div className="mx-6 mb-2 -mt-2 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span className="text-amber-500 text-base flex-shrink-0 leading-none mt-0.5">⚠️</span>
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">“Forever” is misleading.</span> At {(inflationRate * 100).toFixed(0)}% inflation,
              your {formatCompact(monthlyWithdrawal)}/mo will have the buying power of only{' '}
              <span className="font-semibold">{formatCompact(buyingPower30)}/mo</span> in 30 years.
              This scenario is <span className="font-semibold">not recommended</span> for long-term retirement —
              switch to the <span className="font-semibold">Inflation-Adjusted</span> tab for a realistic picture.
            </p>
          </div>
        )}

        {/* Benchmark band (non-perpetual only) */}
        {!perpetual && active.totalMonths && (
          <BenchmarkBand totalMonths={active.totalMonths} perpetual={false} currentAge={currentAge} />
        )}
        {perpetual && (
          <BenchmarkBand totalMonths={active.totalMonths} perpetual={true} currentAge={currentAge} />
        )}

        {/* Stats — colors carry honest meaning (P15) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border-t border-border">
          {/* 1. Final MF — green only when it's actually meaningful, red when depleted */}
          {perpetual ? (
            <StatCell label="Final MF value" value="∞" sub="growing indefinitely" valueClass="text-accent-mf" />
          ) : active.finalMF < 100000 ? (
            <StatCell label="Final MF value" value={formatCompact(active.finalMF)} sub="corpus depleted" subClass="text-accent-tax font-medium" valueClass="text-accent-tax" />
          ) : (
            <StatCell label="Final MF value" value={formatCompact(active.finalMF)} valueClass="text-accent-mf" />
          )}
          {/* 2. Total withdrawn — money you successfully spent */}
          <StatCell
            label="Total withdrawn"
            value={formatCompact(active.totalNomWd)}
            valueClass="text-accent-wd"
          />
          {/* 4. Tax paid — informational, not a danger; neutral so it doesn't read as a loss */}
          <StatCell
            label="Tax paid"
            value={formatCompact(active.totalTax)}
            sub={`FD ${formatCompact(active.totalFDTax)} · LTCG ${formatCompact(active.totalLTCG)}`}
            valueClass="text-text-secondary"
          />
          {/* 5. FD cycles */}
          <StatCell
            label="FD cycles"
            value={String(active.phases.length)}
            sub={perpetual
              ? 'last cycle self-sustaining'
              : active.phases.length >= 8
                ? '↑ many cycles: drawing principal'
                : 'sustainable withdrawal pace'}
          />
        </div>
      </div>
    </div>
  )
}
