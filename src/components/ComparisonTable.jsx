import { useState } from 'react'
import { formatDuration } from '../logic/formatters'

// Format in chosen unit: L or Cr
function fmt(amount, mode) {
  if (!amount && amount !== 0) return '₹0'
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (mode === 'Cr') return sign + '₹' + (abs / 10000000).toFixed(2) + ' Cr'
  return sign + '₹' + (abs / 100000).toFixed(2) + 'L'
}

export default function ComparisonTable({ scenarioA, scenarioB }) {
  const [unit, setUnit] = useState('Cr')

  // Perpetual MF display: show approximate snapshot value with note
  const finalMFNomA = scenarioA.perpetual
    ? `≈ ${fmt(scenarioA.finalMF, unit)} (grows indefinitely)`
    : fmt(scenarioA.finalMF, unit)
  const finalMFNomB = scenarioB.perpetual
    ? `≈ ${fmt(scenarioB.finalMF, unit)} (grows indefinitely)`
    : fmt(scenarioB.finalMF, unit)

  const rows = [
    // 1. Duration
    {
      metric: 'Duration',
      a: scenarioA.perpetual ? 'Forever (∞)' : formatDuration(scenarioA.totalMonths),
      b: scenarioB.perpetual ? 'Forever (∞)' : formatDuration(scenarioB.totalMonths),
      aColor: scenarioA.perpetual ? 'text-accent-mf' : 'text-text-primary',
      bColor: scenarioB.perpetual ? 'text-accent-mf' : 'text-text-primary',
      isText: true,
    },
    // 2. Total Real Value (today's ₹) — moved up from row 3
    {
      metric: "Total Real Value (today's ₹)",
      a: fmt(scenarioA.totalRealWd, unit),
      b: fmt(scenarioB.totalRealWd, unit),
      aColor: 'text-accent-real',
      bColor: 'text-accent-real',
    },
    // 3. Total Tax (FD + LTCG)
    {
      metric: 'Total Tax (FD + LTCG)',
      a: fmt(scenarioA.totalTax, unit),
      b: fmt(scenarioB.totalTax, unit),
      aColor: 'text-accent-tax font-semibold',
      bColor: 'text-accent-tax font-semibold',
    },
    // 4. Total Nominal Withdrawn
    {
      metric: 'Total Withdrawn (nominal)',
      a: fmt(scenarioA.totalNomWd, unit),
      b: fmt(scenarioB.totalNomWd, unit),
      aColor: 'text-accent-wd',
      bColor: 'text-accent-wd',
    },
    // 5. FD Interest Tax
    {
      metric: 'FD Interest Tax',
      a: fmt(scenarioA.totalFDTax, unit),
      b: fmt(scenarioB.totalFDTax, unit),
      aColor: 'text-accent-tax/80',
      bColor: 'text-accent-tax/80',
    },
    // 6. LTCG Tax
    {
      metric: 'LTCG Tax',
      a: fmt(scenarioA.totalLTCG, unit),
      b: fmt(scenarioB.totalLTCG, unit),
      aColor: 'text-accent-tax',
      bColor: 'text-accent-tax',
    },
    // 7. Final MF (real / today's ₹)
    {
      metric: "Final MF Corpus (today's ₹)",
      a: scenarioA.perpetual ? '∞' : fmt(scenarioA.finalMFReal, unit),
      b: scenarioB.perpetual ? '∞' : fmt(scenarioB.finalMFReal, unit),
      aColor: 'text-accent-real',
      bColor: 'text-accent-real',
    },
    // 8. Final MF nominal (with perpetual note)
    {
      metric: 'Final MF Corpus (nominal)',
      a: finalMFNomA,
      b: finalMFNomB,
      aColor: 'text-accent-mf',
      bColor: 'text-accent-mf',
      isText: true,
    },
    // 9. Number of phases
    {
      metric: 'Number of FD Cycles',
      a: scenarioA.phases.length + (scenarioA.perpetual ? ' (last is perpetual)' : ''),
      b: scenarioB.phases.length + (scenarioB.perpetual ? ' (last is perpetual)' : ''),
      aColor: 'text-text-secondary',
      bColor: 'text-text-secondary',
      isText: true,
    },
  ]

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">A vs B Comparison</h3>
          <p className="text-xs text-text-muted mt-0.5">
            A = same ₹ every month · B = withdrawal rises with inflation (more realistic)
          </p>
        </div>
        {/* Unit toggle */}
        <div className="flex items-center gap-1 bg-bg border border-border rounded-lg p-0.5">
          {['L', 'Cr'].map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                unit === u
                  ? 'bg-card text-accent-fd shadow-card'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              ₹{u}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th className="text-left px-4 py-3 font-medium">Metric</th>
              <th className="text-right px-4 py-3 font-medium text-accent-fd">A — Fixed</th>
              <th className="text-right px-4 py-3 font-medium text-text-secondary">B — Inflation-Adj</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/40 hover:bg-card-hover/50 transition-colors">
                <td className="px-4 py-2.5 text-text-muted">{row.metric}</td>
                <td className={`px-4 py-2.5 text-right ${row.isText ? '' : 'num'} ${row.aColor}`}>{row.a}</td>
                <td className={`px-4 py-2.5 text-right ${row.isText ? '' : 'num'} ${row.bColor}`}>{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
