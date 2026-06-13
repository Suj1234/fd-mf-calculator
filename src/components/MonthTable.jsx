import { useState } from 'react'
import { formatINR } from '../logic/formatters'

function realColor(pct) {
  if (pct >= 0.8) return 'text-accent-mf'
  if (pct >= 0.5) return 'text-accent-wd'
  return 'text-accent-tax'
}

export default function MonthTable({ rows, baseWithdrawal }) {
  const [showAll, setShowAll] = useState(false)
  const displayRows = showAll ? rows : rows.slice(0, 24)

  return (
    <div className="mt-3">
      <p className="sm:hidden text-[10px] text-text-muted mb-1.5">Swipe the table sideways to see all columns →</p>
      <div className="overflow-auto max-h-[440px] rounded-lg border border-border/50">
      <table className="w-full text-xs border-collapse min-w-[600px]">
        <thead className="sticky top-0 z-10 bg-card">
          <tr className="text-text-muted border-b border-border shadow-[0_1px_0_0_#dce3f0]">
            <th className="text-left py-2 pl-3 pr-3 font-medium">Mo</th>
            <th className="text-left py-2 pr-3 font-medium">Yr</th>
            <th className="text-right py-2 pr-3 font-medium">FD Rate</th>
            <th className="text-right py-2 pr-3 font-medium">FD Opening</th>
            <th className="text-right py-2 pr-3 font-medium">FD Tax</th>
            <th className="text-right py-2 pr-3 font-medium">Withdrawal</th>
            <th className="text-right py-2 pr-3 font-medium">Today's ₹ Value</th>
            <th className="text-right py-2 pr-3 font-medium">FD Closing</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, i) => {
            const prevRow = i > 0 ? displayRows[i - 1] : null
            const rateChanged = prevRow && row.fdRate !== prevRow.fdRate
            const isYearEnd = row.month % 12 === 0
            const isLast = i === rows.length - 1
            const rpct = row.realWd / baseWithdrawal

            // Base zebra striping → rate-change tint → depletion tint take priority.
            const rowBg = isLast
              ? 'bg-accent-tax/[0.07]'
              : rateChanged
              ? 'bg-accent-wd/5'
              : i % 2 === 1
              ? 'bg-bg/50'
              : ''

            return (
              <tr
                key={i}
                className={`
                  border-b transition-colors
                  ${rateChanged ? 'border-accent-wd/20' : isYearEnd ? 'border-border' : 'border-border/40'}
                  ${isLast ? 'border-accent-tax/40' : ''}
                  ${rowBg} hover:bg-card-hover/50
                `}
              >
                <td className="py-1.5 pl-3 pr-3 text-text-muted">
                  {row.month}
                  {isLast && (
                    <span className="ml-1 text-accent-tax font-bold text-[10px]">FD out</span>
                  )}
                </td>
                <td className="py-1.5 pr-3 text-text-muted">{row.year}</td>
                <td className={`py-1.5 pr-3 text-right font-mono ${rateChanged ? 'text-accent-wd' : 'text-text-secondary'}`}>
                  {(row.fdRate * 100).toFixed(1)}%
                  {rateChanged && <span className="ml-1 text-accent-wd">⬇</span>}
                </td>
                <td className="py-1.5 pr-3 text-right font-mono text-text-secondary">
                  {formatINR(row.fdOpening)}
                </td>
                <td className="py-1.5 pr-3 text-right font-mono text-accent-tax/80">
                  {formatINR(row.fdTax)}
                </td>
                <td className="py-1.5 pr-3 text-right font-mono text-accent-wd">
                  {formatINR(row.nominalWd)}
                </td>
                <td className={`py-1.5 pr-3 text-right font-mono ${realColor(rpct)}`}>
                  {formatINR(row.realWd)}
                  <span className="text-text-muted ml-1">({(rpct * 100).toFixed(0)}%)</span>
                </td>
                <td className={`py-1.5 text-right font-mono ${row.fdClosing < 100 ? 'text-accent-tax' : 'text-text-secondary'}`}>
                  {formatINR(row.fdClosing)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
      {rows.length > 24 && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="mt-2 text-xs text-accent-fd hover:underline"
        >
          {showAll ? 'Show less' : `Show all ${rows.length} months`}
        </button>
      )}
    </div>
  )
}
