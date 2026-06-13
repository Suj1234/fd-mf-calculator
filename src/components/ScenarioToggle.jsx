import { formatCompact, formatDuration } from '../logic/formatters'

export default function ScenarioToggle({ scenarioA, scenarioB, activeScenario, onScenarioChange, monthlyWithdrawal, inflationRate }) {
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
    <div className="grid grid-cols-2 gap-2 bg-[#e8edf8] border border-border rounded-2xl p-1.5">
      {tabs.map(({ key, result, label, sub, recommended }) => {
        const isActive = activeScenario === key
        const perpetual = result.perpetual
        const duration = !perpetual && result.totalMonths ? formatDuration(result.totalMonths) : null

        return (
          <button
            key={key}
            type="button"
            onClick={() => onScenarioChange(key)}
            className={`flex flex-col gap-2 px-4 py-3.5 rounded-xl text-left transition-all ${
              isActive ? 'bg-card shadow-card' : 'hover:bg-white/60'
            }`}
          >
            {/* Label + recommended badge */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.12em]">{label}</span>
              {recommended && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-mf text-white font-bold leading-none uppercase tracking-wide shadow-sm">
                  ★ Recommended
                </span>
              )}
            </div>

            {/* Duration — always in same slot, styled as badge */}
            <div>
              {perpetual ? (
                <span className="num inline-flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg bg-accent-mf/10 text-accent-mf border border-accent-mf/20">
                  Perpetual ∞
                </span>
              ) : duration ? (
                <span className={`num text-xl font-bold ${isActive ? 'text-text-primary' : 'text-text-muted'}`}>
                  {duration}
                </span>
              ) : (
                <span className="num text-xl font-bold text-text-muted">—</span>
              )}
            </div>

            {/* Description */}
            <p className="text-[11px] text-text-secondary leading-relaxed">{sub}</p>
          </button>
        )
      })}
    </div>
  )
}
