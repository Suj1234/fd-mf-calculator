import { useState } from 'react'
import { formatCompact, formatDuration } from '../logic/formatters'
import { phaseHealthColor } from '../logic/colors'
import MonthTable from './MonthTable'

function Chip({ label, value, valueClass = 'text-text-secondary' }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wide">{label}</span>
      <span className={`num text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  )
}

export default function PhaseCard({ phase, baseWithdrawal, bucket3 = null }) {
  const [expanded, setExpanded] = useState(false)
  // Health-based color (green=long → red=short) — same scale as the timeline,
  // so a cycle's badge, border and timeline block all read the same.
  const color = phaseHealthColor(phase.fdMonths, phase.perpetual)

  // Only show FD rate badge if the rate actually declined during this cycle
  const fdRateDropped = !phase.perpetual && phase.fdRateEnd < phase.fdRateStart

  return (
    <div
      className="bg-card rounded-2xl border overflow-hidden transition-colors shadow-card"
      style={{ borderColor: color + '40', borderLeft: `3px solid ${color}` }}
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
            {fdRateDropped && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded bg-border text-text-muted cursor-help"
                title={`FD rate declined from ${(phase.fdRateStart * 100).toFixed(1)}% to ${(phase.fdRateEnd * 100).toFixed(1)}% during this cycle — modelled per the FD rate decline setting (rates fell ~2% over 15 yrs historically). Interest earned each month uses the rate applicable at that time.`}
              >
                FD rate fell during cycle ℹ
              </span>
            )}
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
            <Chip label="FD opened"  value={formatCompact(phase.fdPrincipal)} valueClass="text-accent-fd" />
            <Chip label="MF at start" value={formatCompact(phase.mfStart)}   valueClass="text-accent-mf" />
            <Chip label="Withdrawn"  value={formatCompact(phase.totalNomWd)} valueClass="text-accent-wd" />
            <Chip label="MF at end"  value={phase.perpetual ? '∞' : formatCompact(phase.mfEndNominal)} valueClass="text-accent-mf" />
            {bucket3 && phase.b3Start > 0 && (
              <>
                <Chip label={`${bucket3.label} start`} value={formatCompact(phase.b3Start)} valueClass="text-amber-600" />
                <Chip label={`${bucket3.label} end`}   value={phase.perpetual ? '∞' : formatCompact(phase.nextB3 ?? phase.b3End)} valueClass="text-amber-600" />
              </>
            )}
          </div>

          {/* Why FD ≠ MF at start — LTCG tax explanation */}
          {phase.incomingLtcgTax > 0 && (
            <div className="mt-2 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="text-amber-500 text-xs flex-shrink-0 mt-px">ℹ</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                FD opened (<span className="font-semibold">{formatCompact(phase.fdPrincipal)}</span>) is less than MF at start (<span className="font-semibold">{formatCompact(phase.mfStart)}</span>) because{' '}
                <span className="font-semibold">{formatCompact(phase.incomingLtcgTax)}</span> LTCG tax was deducted when selling MF to fund this FD.
              </p>
            </div>
          )}

          {/* B3 was the refill source — explain FD ≠ B3 at sale */}
          {phase.incomingB3Tax > 0 && bucket3 && (
            <div className="mt-2 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="text-amber-500 text-xs flex-shrink-0 mt-px">ℹ</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                FD opened (<span className="font-semibold">{formatCompact(phase.fdPrincipal)}</span>) reflects{' '}
                <span className="font-semibold">{formatCompact(phase.incomingB3Tax)}</span> {bucket3.label} tax deducted when selling {bucket3.taxType === 'ltcg' ? '(LTCG)' : '(slab rate)'} to fund this FD.
              </p>
            </div>
          )}

          {/* "Drawing from B3" banner */}
          {phase.fromB3 && bucket3 && (
            <div className="mt-2 flex items-center gap-1.5 bg-amber-100 border border-amber-300 rounded-lg px-3 py-2">
              <span className="text-amber-600 text-xs">🪣</span>
              <p className="text-[11px] text-amber-800 font-medium">
                MF depleted — drawing from {bucket3.label} ({bucket3.taxType === 'ltcg' ? 'Equity LTCG tax' : 'slab rate tax on gains'})
              </p>
            </div>
          )}

        </div>

        {/* Expand toggle with label */}
        <div className="flex-shrink-0 mt-1 flex items-center gap-1 text-[10px] text-text-muted hover:text-text-secondary transition-colors">
          <span className="sm:hidden">{expanded ? 'Hide' : 'Detail'}</span>
          <span className="hidden sm:inline">{expanded ? 'Hide detail' : 'Month-by-month detail'}</span>
          <span className="text-sm font-medium ml-0.5">{expanded ? '−' : '+'}</span>
        </div>
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
                {!phase.fromB3 && (
                  <>
                    <Chip label="LTCG tax at phase end" value={formatCompact(phase.ltcgTax)} valueClass="text-accent-tax" />
                    <Chip label="Taxable MF gains"      value={formatCompact(phase.taxableGains)} />
                  </>
                )}
                {phase.fromB3 && bucket3 && (
                  <>
                    <Chip label={`${bucket3.label} tax`}          value={formatCompact(phase.b3Tax || 0)}          valueClass="text-accent-tax" />
                    <Chip label={`Taxable ${bucket3.label} gains`} value={formatCompact(phase.b3TaxableGains || 0)} />
                  </>
                )}
                <Chip label="New FD after tax" value={formatCompact(phase.nextFD)} valueClass="text-accent-fd" />
              </>
            )}
          </div>
          <MonthTable rows={phase.rows} baseWithdrawal={baseWithdrawal} />
        </div>
      )}
    </div>
  )
}
