import { formatCompact, formatDuration } from '../logic/formatters'

// ─── Benchmark band ────────────────────────────────────────────────────────────

function BenchmarkBand({ totalMonths, perpetual }) {
  const MAX_MONTHS = 480 // 40 years caps the bar
  const rawPos = perpetual ? 99 : (totalMonths / MAX_MONTHS) * 100
  const markerPos = Math.min(99, Math.max(1, rawPos))

  const zone = (perpetual || totalMonths >= 300) ? 'Healthy'
    : totalMonths >= 180 ? 'Moderate'
    : 'Caution'

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

      {/* Zone labels */}
      <div className="flex mt-1.5">
        <div className="text-center" style={{ width: '37.5%' }}>
          <div className={`text-[9px] font-semibold ${zone === 'Caution' ? 'text-red-500' : 'text-red-400'}`}>Caution</div>
          <div className="text-[9px] text-text-muted">0–15 yr</div>
        </div>
        <div className="text-center" style={{ width: '25%' }}>
          <div className={`text-[9px] font-semibold ${zone === 'Moderate' ? 'text-amber-500' : 'text-amber-400'}`}>Moderate</div>
          <div className="text-[9px] text-text-muted">15–25 yr</div>
        </div>
        <div className="text-center" style={{ width: '37.5%' }}>
          <div className={`text-[9px] font-semibold ${zone === 'Healthy' ? 'text-emerald-600' : 'text-emerald-400'}`}>Healthy</div>
          <div className="text-[9px] text-text-muted">25+ yr</div>
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

export default function HeroSummary({ scenarioA, scenarioB, activeScenario, onScenarioChange, currentAge, monthlyWithdrawal, inflationRate }) {
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

  const tabDuration = (r) =>
    r.perpetual ? '∞ Perpetual' : r.totalMonths ? formatDuration(r.totalMonths) : '—'

  const futureWd5yr = monthlyWithdrawal && inflationRate
    ? Math.round(monthlyWithdrawal * Math.pow(1 + inflationRate, 5))
    : null

  const tabs = [
    {
      key: 'A',
      label: 'Fixed Withdrawal',
      sub: monthlyWithdrawal
        ? `Always ${formatCompact(monthlyWithdrawal)}/mo — same every month, but buys less as prices rise`
        : 'Same ₹ every month — buys less over time as prices rise',
      result: scenarioA,
    },
    {
      key: 'B',
      label: 'Inflation-Adjusted',
      sub: futureWd5yr
        ? `You withdraw more each year to match rising prices — e.g. ${formatCompact(monthlyWithdrawal)}/mo today becomes ~${formatCompact(futureWd5yr)}/mo in 5 yrs (same lifestyle, higher price tags)`
        : 'You withdraw more each year to match rising prices — same lifestyle, higher price tags',
      result: scenarioB,
      recommended: true,
    },
  ]

  return (
    <div className="flex flex-col gap-3">

      {/* ── Scenario tab switcher ── */}
      <div className="grid grid-cols-2 gap-2 bg-[#e8edf8] border border-border rounded-2xl p-1.5">
        {tabs.map(({ key, result, label, sub, recommended }) => {
          const isActive = activeScenario === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onScenarioChange(key)}
              className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-left transition-all ${
                isActive ? 'bg-card shadow-card' : 'hover:bg-white/60'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-[0.12em]">{label}</div>
                  {recommended && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent-mf text-white font-bold leading-none uppercase tracking-wide">
                      RECOMMENDED
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-secondary mt-0.5">{sub}</div>
              </div>
              <div className={`num text-base font-bold flex-shrink-0 ${
                result.perpetual ? 'text-accent-mf' : isActive ? 'text-text-primary' : 'text-text-muted'
              }`}>
                {tabDuration(result)}
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Hero card ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        {/* The big answer */}
        <div className="py-8 px-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-4">
            {activeScenario === 'A' ? 'Fixed Withdrawal · Scenario A' : 'Inflation-Adjusted · Scenario B (recommended)'}
          </p>

          {ageAtEnd ? (
            <>
              <p className={`font-bold leading-tight ${heroColor}`} style={{ fontSize: '3rem' }}>
                Until age {ageAtEnd}
              </p>
              <p className="text-sm text-text-muted mt-2">
                ({formatDuration(active.totalMonths)} from today)
              </p>
            </>
          ) : (
            <p
              className={`num font-bold leading-none ${heroColor}`}
              style={{ fontSize: perpetual ? '5rem' : '3.5rem' }}
            >
              {durationText}
            </p>
          )}

          {subLabel && !ageAtEnd && (
            <p className="text-sm text-text-muted mt-3">{subLabel}</p>
          )}
        </div>

        {/* Benchmark band (non-perpetual only) */}
        {!perpetual && active.totalMonths && (
          <BenchmarkBand totalMonths={active.totalMonths} perpetual={false} />
        )}
        {perpetual && (
          <BenchmarkBand totalMonths={active.totalMonths} perpetual={true} />
        )}

        {/* Stats — reordered by importance */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border-t border-border">
          {/* 1. Final MF — today's ₹ is the primary value */}
          <StatCell
            label="Final MF value"
            value={perpetual ? '∞' : formatCompact(active.finalMF)}
            sub={perpetual ? 'growing indefinitely' : undefined}
            subClass="text-text-muted"
            valueClass="text-accent-mf"
          />
          {/* 2. Tax paid — FD + LTCG merged */}
          <StatCell
            label="Tax paid"
            value={formatCompact(active.totalTax)}
            sub={`FD: ${formatCompact(active.totalFDTax)} · LTCG: ${formatCompact(active.totalLTCG)}`}
            valueClass="text-accent-tax"
          />
          {/* 3. Total withdrawn */}
          <StatCell
            label="Total withdrawn"
            value={formatCompact(active.totalNomWd)}
            valueClass="text-accent-wd"
          />
          {/* 4. FD cycles */}
          <StatCell
            label="FD cycles"
            value={String(active.phases.length)}
            sub={perpetual ? 'last is perpetual' : undefined}
          />
        </div>
      </div>
    </div>
  )
}
