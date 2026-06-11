import { useState } from 'react'
import { formatCompact, formatINR, formatDuration } from '../logic/formatters'
import MonthTable from './MonthTable'

const PHASE_COLORS = [
  '#7c83f5', '#34d399', '#fbbf24', '#22d3ee', '#a78bfa',
  '#fb923c', '#f472b6', '#2dd4bf', '#a3e635', '#818cf8',
]

function Chip({ label, value, valueClass = 'text-text-secondary' }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wide">{label}</span>
      <span className={`num text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  )
}

export default function PhaseCard({ phase, baseWithdrawal, index }) {
  const [expanded, setExpanded] = useState(false)
  const color = PHASE_COLORS[index % PHASE_COLORS.length]

  const startPct = phase.firstRealWd / baseWithdrawal
  const endPct   = phase.lastRealWd  / baseWithdrawal
  const barColor = endPct >= 0.8 ? '#34d399' : endPct >= 0.5 ? '#fbbf24' : '#f87171'

  return (
    <div
      className="bg-card rounded-2xl border overflow-hidden transition-colors shadow-card"
      style={{ borderColor: color + '40' }}
    >
      {/* Header row — always visible */}
      <button
        type="button"
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-card-hover rounded-2xl transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Phase number badge */}
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
          style={{ backgroundColor: color }}
        >
          {phase.phase}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap mb-2.5">
            <span className="num text-sm font-semibold text-text-primary">
              {formatDuration(phase.fdMonths)}
            </span>
            <span className="text-[10px] text-text-muted">
              months {phase.globalStart}–{phase.perpetual ? '∞' : phase.globalEnd}
            </span>
            {phase.perpetual && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-mf/15 text-accent-mf font-semibold">
                ∞ self-sustaining
              </span>
            )}
            {!phase.perpetual && phase.fdRateStart !== phase.fdRateEnd && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-border text-text-muted">
                FD rate ↓ during cycle
              </span>
            )}
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
            <Chip label="FD opened" value={formatCompact(phase.fdPrincipal)} valueClass="text-accent-fd" />
            <Chip label="MF at start" value={formatCompact(phase.mfStart)} valueClass="text-accent-mf" />
            <Chip label="Withdrawn" value={formatCompact(phase.totalNomWd)} valueClass="text-accent-wd" />
            <Chip label="MF at end" value={phase.perpetual ? '∞' : formatCompact(phase.mfEndNominal)} valueClass="text-accent-mf" />
          </div>

          {/* Purchasing power bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-text-muted mb-1">
              <span>Purchasing power of withdrawal: {formatCompact(phase.firstRealWd)} → {formatCompact(phase.lastRealWd)}</span>
              <span style={{ color: barColor }}>{(endPct * 100).toFixed(0)}% of target</span>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(100, endPct * 100)}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        </div>

        <span className="text-text-muted text-sm flex-shrink-0 mt-1">{expanded ? '−' : '+'}</span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border/50 px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 py-4">
            <Chip
              label="FD interest rate"
              value={`${(phase.fdRateStart * 100).toFixed(1)}% → ${(phase.fdRateEnd * 100).toFixed(1)}%`}
            />
            <Chip
              label="Tax on FD interest"
              value={formatCompact(phase.totalFDTax)}
              valueClass="text-accent-tax"
            />
            <Chip
              label="Real value withdrawn"
              value={formatCompact(phase.totalRealWd)}
              valueClass="text-text-secondary"
            />
            {!phase.perpetual && (
              <>
                <Chip
                  label="LTCG tax at phase end"
                  value={formatCompact(phase.ltcgTax)}
                  valueClass="text-accent-tax"
                />
                <Chip
                  label="Taxable MF gains"
                  value={formatCompact(phase.taxableGains)}
                />
                <Chip
                  label="New FD after tax"
                  value={formatCompact(phase.nextFD)}
                  valueClass="text-accent-fd"
                />
              </>
            )}
          </div>
          <MonthTable rows={phase.rows} baseWithdrawal={baseWithdrawal} />
        </div>
      )}
    </div>
  )
}
