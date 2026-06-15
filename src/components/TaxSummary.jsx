import { formatCompact } from '../logic/formatters'
import Term from './Term'

export default function TaxSummary({ phases, perpetual, bucket3 = null }) {
  const totalFDTax  = phases.reduce((s, p) => s + p.totalFDTax, 0)
  const totalLTCG   = phases.reduce((s, p) => s + (p.ltcgTax || 0), 0)
  const totalB3Tax  = phases.reduce((s, p) => s + (p.b3Tax || 0), 0)
  const totalTax    = totalFDTax + totalLTCG + totalB3Tax
  const hasB3Tax    = bucket3 && totalB3Tax > 0

  const ltcgPct = totalTax > 0 ? Math.round((totalLTCG / totalTax) * 100) : 0
  const fdPct   = totalTax > 0 ? Math.round((totalFDTax / totalTax) * 100) : 0
  const b3Pct   = totalTax > 0 ? Math.round((totalB3Tax / totalTax) * 100) : 0

  // Group phases where total tax < ₹1L (100 000) into a summary row
  const THRESHOLD = 100000
  const significantPhases = phases.filter((p) => (p.totalFDTax + (p.ltcgTax || 0)) >= THRESHOLD)
  const minorPhases       = phases.filter((p) => (p.totalFDTax + (p.ltcgTax || 0)) < THRESHOLD)

  const minorFirst = minorPhases[0]
  const minorLast  = minorPhases[minorPhases.length - 1]
  const minorTotal = minorPhases.reduce((s, p) => s + p.totalFDTax + (p.ltcgTax || 0), 0)

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">Tax Summary</h3>
        <p className="text-xs text-text-muted mt-0.5">
          FD interest tax (each phase) + <Term k="ltcg">LTCG</Term> tax paid when switching from MF to a new FD at end of each cycle
        </p>
      </div>

      {/* Insight */}
      {totalTax > 0 && (
        <div className="px-5 py-3 bg-[#f8faff] border-b border-border">
          <p className="text-xs text-text-secondary leading-relaxed">
            <span className="font-semibold">Insight:</span>{' '}
            Of your total {formatCompact(totalTax)} tax, {fdPct}% is FD interest tax, {ltcgPct}% is MF LTCG
            {hasB3Tax ? `, and ${b3Pct}% is ${bucket3.label} gains tax` : ''}.
            {ltcgPct > 50 && !hasB3Tax && ' Disabling LTCG (in Tax, Age & Rates settings above) will significantly extend your runway.'}
            {hasB3Tax && b3Pct > 20 && bucket3.taxType === 'slab' && ` Note: ${bucket3.label} is taxed at slab rate (not equity LTCG) — significantly higher than MF's 13%.`}
          </p>
          {perpetual && (
            <p className="text-[10px] text-text-muted mt-1.5">
              * This scenario runs perpetually — FD interest tax is cumulative over the full indefinite period and will appear very large. Compare the Inflation-Adjusted tab for a realistic retirement horizon.
            </p>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-text-muted border-b border-border">
              <th className="text-left px-4 py-2.5 font-medium">Phase</th>
              <th className="text-right px-4 py-2.5 font-medium">FD Interest Tax</th>
              <th className="text-right px-4 py-2.5 font-medium">MF LTCG Tax</th>
              {hasB3Tax && <th className="text-right px-4 py-2.5 font-medium">{bucket3.label} Tax</th>}
              <th className="text-right px-4 py-2.5 font-medium">Total Tax</th>
              <th className="text-right px-4 py-2.5 font-medium">Next FD (post tax)</th>
            </tr>
          </thead>
          <tbody>
            {significantPhases.map((phase, i) => (
              <tr key={i} className="border-b border-border/40 hover:bg-card-hover/50 transition-colors">
                <td className="px-4 py-2.5 font-medium text-text-secondary">
                  Phase {phase.phase}
                  {phase.perpetual && <span className="ml-2 text-accent-mf text-[10px]">∞</span>}
                  {phase.fromB3 && bucket3 && <span className="ml-2 text-amber-600 text-[10px]">🪣</span>}
                </td>
                <td className="px-4 py-2.5 text-right num text-accent-tax/80">
                  {formatCompact(phase.totalFDTax)}
                </td>
                <td className="px-4 py-2.5 text-right num text-accent-tax">
                  {phase.perpetual || phase.fromB3 ? '—' : formatCompact(phase.ltcgTax || 0)}
                </td>
                {hasB3Tax && (
                  <td className="px-4 py-2.5 text-right num text-amber-600">
                    {phase.b3Tax > 0 ? formatCompact(phase.b3Tax) : '—'}
                  </td>
                )}
                <td className="px-4 py-2.5 text-right num font-semibold text-accent-tax">
                  {formatCompact((phase.totalFDTax || 0) + (phase.ltcgTax || 0) + (phase.b3Tax || 0))}
                </td>
                <td className="px-4 py-2.5 text-right num text-accent-fd">
                  {phase.perpetual ? '—' : formatCompact(phase.nextFD || 0)}
                </td>
              </tr>
            ))}

            {/* Grouped minor phases row */}
            {minorPhases.length > 0 && (
              <tr className="border-b border-border/40 bg-card-hover/30">
                <td className="px-4 py-2.5 font-medium text-text-muted italic">
                  {minorPhases.length === 1
                    ? `Phase ${minorFirst.phase}`
                    : `Phases ${minorFirst.phase}–${minorLast.phase}`}
                  <span className="ml-1.5 not-italic font-normal text-[10px]">
                    (corpus nearing depletion — tax negligible)
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right num text-text-muted" colSpan={hasB3Tax ? 4 : 3}>combined</td>
                <td className="px-4 py-2.5 text-right num text-text-muted">
                  {minorTotal > 0 ? formatCompact(minorTotal) : '≈ ₹0'}
                </td>
                <td className="px-4 py-2.5 text-right text-text-muted">—</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-card-hover">
              <td className="px-4 py-3 font-semibold text-text-primary">Total</td>
              <td className="px-4 py-3 text-right num font-semibold text-accent-tax/80">
                {formatCompact(totalFDTax)}
              </td>
              <td className="px-4 py-3 text-right num font-semibold text-accent-tax">
                {formatCompact(totalLTCG)}
              </td>
              {hasB3Tax && (
                <td className="px-4 py-3 text-right num font-semibold text-amber-600">
                  {formatCompact(totalB3Tax)}
                </td>
              )}
              <td className="px-4 py-3 text-right num font-bold text-accent-tax text-sm">
                {formatCompact(totalTax)}
              </td>
              <td className="px-4 py-3 text-right text-text-muted">—</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Cess disclaimer */}
      <div className="px-5 py-3 border-t border-border bg-[#f8faff]">
        <p className="text-[10px] text-text-muted leading-relaxed">
          <span className="font-semibold text-text-secondary">Note on LTCG tax:</span>{' '}
          Amounts above already include the mandatory <span className="font-medium">4% Health &amp; Education Cess</span> levied on top of the 12.5% base rate — making the effective LTCG rate <span className="font-medium">13%</span>. FD interest tax does not include cess (offset against other income deductions in practice); consult your CA for your exact liability.
        </p>
      </div>
    </div>
  )
}
