import { formatCompact, formatDuration } from '../logic/formatters'

const SCENARIO_DESC = {
  A: 'You withdraw the same fixed amount every month. Simple and predictable, but inflation slowly erodes your purchasing power each year.',
  B: 'Your withdrawal increases every year with inflation, so your real purchasing power stays constant. More realistic for long-term retirement planning.',
}

function StatCell({ label, value, sub, valueClass = 'text-text-secondary' }) {
  return (
    <div className="bg-card px-4 py-4 text-center">
      <div className="text-[10px] uppercase tracking-[0.1em] text-text-muted mb-1.5">{label}</div>
      <div className={`num text-sm font-semibold ${valueClass}`}>{value}</div>
      {sub && <div className="num text-[10px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  )
}

export default function HeroSummary({ scenarioA, scenarioB, activeScenario, onScenarioChange }) {
  const active = activeScenario === 'A' ? scenarioA : scenarioB
  const perpetual = active.perpetual

  const duration = perpetual
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

  const tabDuration = (r) =>
    r.perpetual ? 'Forever' : r.totalMonths ? formatDuration(r.totalMonths) : '—'

  return (
    <div className="flex flex-col gap-3">

      {/* ── Scenario tab switcher ── */}
      <div className="grid grid-cols-2 gap-2 bg-[#e8edf8] border border-border rounded-2xl p-1.5">
        {[
          { key: 'A', result: scenarioA, label: 'Scenario A', sub: 'Fixed withdrawal' },
          { key: 'B', result: scenarioB, label: 'Scenario B', sub: 'Inflation-adjusted' },
        ].map(({ key, result, label, sub }) => {
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
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-[0.12em]">{label}</div>
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

      {/* ── Scenario description ── */}
      <p className="text-xs text-text-muted px-1 leading-relaxed">
        <span className="font-medium text-text-secondary">Scenario {activeScenario}: </span>
        {SCENARIO_DESC[activeScenario]}
      </p>

      {/* ── Hero card ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        {/* The big answer */}
        <div className="py-10 px-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-4">
            {activeScenario === 'A' ? 'Fixed withdrawal · Scenario A' : 'Inflation-adjusted · Scenario B'}
          </p>
          <p
            className={`num font-bold leading-none ${heroColor}`}
            style={{ fontSize: perpetual ? '5rem' : '3.5rem' }}
          >
            {duration}
          </p>
          {subLabel && (
            <p className="text-sm text-text-muted mt-3">{subLabel}</p>
          )}
        </div>

        {/* Stats — gap-px creates dividers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border-t border-border">
          <StatCell
            label="Total withdrawn"
            value={formatCompact(active.totalNomWd)}
            sub={`real: ${formatCompact(active.totalRealWd)}`}
            valueClass="text-accent-wd"
          />
          <StatCell
            label="Tax paid"
            value={formatCompact(active.totalTax)}
            sub={`FD tax: ${formatCompact(active.totalFDTax)}`}
            valueClass="text-accent-tax"
          />
          <StatCell
            label="Final MF corpus"
            value={perpetual ? '∞ Growing' : formatCompact(active.finalMF)}
            sub={perpetual ? '' : `real: ${formatCompact(active.finalMFReal)}`}
            valueClass="text-accent-mf"
          />
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
