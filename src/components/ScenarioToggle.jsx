import { formatCompact, formatDuration } from '../logic/formatters'

const ACCENT = { A: '#4f46e5', B: '#059669' }

export default function ScenarioToggle({ scenarioA, scenarioB, activeScenario, onScenarioChange, monthlyWithdrawal, inflationRate, currentAge }) {
  const futureWd5yr = monthlyWithdrawal && inflationRate
    ? Math.round(monthlyWithdrawal * Math.pow(1 + inflationRate, 5))
    : null

  const tabs = [
    {
      key: 'A',
      label: 'Fixed Withdrawal',
      sub: monthlyWithdrawal
        ? `Same ${formatCompact(monthlyWithdrawal)}/mo every month — same rupees, but buys less as prices rise`
        : 'Same ₹ every month — purchasing power shrinks over time',
      result: scenarioA,
      recommended: false,
    },
    {
      key: 'B',
      label: 'Inflation-Adjusted',
      sub: futureWd5yr
        ? `Withdrawals rise each year with inflation — ${formatCompact(monthlyWithdrawal)}/mo today becomes ~${formatCompact(futureWd5yr)}/mo in 5 yrs`
        : 'Withdrawals rise each year with inflation — same lifestyle, higher price tags',
      result: scenarioB,
      recommended: true,
    },
  ]

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-2 gap-2 bg-[#e8edf8] border border-border rounded-2xl p-1.5">
        {tabs.map(({ key, result, label, sub, recommended }) => {
          const isActive = activeScenario === key
          const perpetual = result.perpetual
          const duration = !perpetual && result.totalMonths ? formatDuration(result.totalMonths) : null
          const ageAtEnd = currentAge > 0 && !perpetual && result.totalMonths
            ? Math.round(currentAge + result.totalMonths / 12)
            : null

          return (
            <button
              key={key}
              type="button"
              onClick={() => onScenarioChange(key)}
              className={`relative flex flex-col gap-2 px-4 py-3.5 rounded-xl text-left transition-all border border-border bg-card ${
                isActive
                  ? 'shadow-card'
                  : 'opacity-55 hover:opacity-100 hover:shadow-sm'
              }`}
            >
              {/* Colored top accent on active card */}
              {isActive && (
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
                  style={{ backgroundColor: ACCENT[key] }}
                />
              )}

              {/* Label + recommended badge */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.12em]">{label}</span>
                {recommended && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-mf text-white font-bold leading-none uppercase tracking-wide shadow-sm">
                    ★ Recommended
                  </span>
                )}
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-0.5">
                {perpetual ? (
                  key === 'A' ? (
                    <span className="num inline-flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                      ⚠ Perpetual ∞
                    </span>
                  ) : (
                    <span className="num inline-flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg bg-accent-mf/10 text-accent-mf border border-accent-mf/20">
                      Perpetual ∞
                    </span>
                  )
                ) : duration ? (
                  <span className="num text-xl font-bold text-text-primary">
                    {duration}
                  </span>
                ) : (
                  <span className="num text-xl font-bold text-text-muted">—</span>
                )}

                {ageAtEnd && (
                  <span className="text-[11px] text-text-muted">until age {ageAtEnd}</span>
                )}

                {perpetual && key === 'A' && (
                  <span className="text-[10px] text-amber-600">nominal terms only — not inflation-adjusted</span>
                )}
              </div>

              {/* Description */}
              <p className="text-[11px] text-text-secondary leading-relaxed">{sub}</p>
            </button>
          )
        })}
      </div>

      <p className="text-center text-[10px] text-text-muted tracking-wide">
        ↑ tap either card to switch scenario
      </p>
    </div>
  )
}
