import { formatCompact, formatINR } from '../logic/formatters'

export default function TaxSummary({ phases }) {
  const totalFDTax = phases.reduce((s, p) => s + p.totalFDTax, 0)
  const totalLTCG = phases.reduce((s, p) => s + (p.ltcgTax || 0), 0)
  const totalTax = totalFDTax + totalLTCG

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">Tax Summary</h3>
        <p className="text-xs text-text-muted mt-0.5">FD interest tax (yearly) + LTCG tax paid when switching from MF to a new FD at end of each phase</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-text-muted border-b border-border">
              <th className="text-left px-4 py-2.5 font-medium">Phase</th>
              <th className="text-right px-4 py-2.5 font-medium">FD Interest Tax</th>
              <th className="text-right px-4 py-2.5 font-medium">LTCG Tax</th>
              <th className="text-right px-4 py-2.5 font-medium">Taxable MF Gains</th>
              <th className="text-right px-4 py-2.5 font-medium">Total Tax</th>
              <th className="text-right px-4 py-2.5 font-medium">Next FD (post LTCG)</th>
            </tr>
          </thead>
          <tbody>
            {phases.map((phase, i) => (
              <tr key={i} className="border-b border-border/40 hover:bg-card-hover/50 transition-colors">
                <td className="px-4 py-2.5 font-medium text-text-secondary">
                  Phase {phase.phase}
                  {phase.perpetual && (
                    <span className="ml-2 text-accent-mf text-[10px]">∞</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right num text-accent-tax/80">
                  {formatCompact(phase.totalFDTax)}
                </td>
                <td className="px-4 py-2.5 text-right num text-accent-tax">
                  {phase.perpetual ? '—' : formatCompact(phase.ltcgTax || 0)}
                </td>
                <td className="px-4 py-2.5 text-right num text-text-secondary">
                  {phase.perpetual ? '—' : formatCompact(phase.taxableGains || 0)}
                </td>
                <td className="px-4 py-2.5 text-right num font-semibold text-accent-tax">
                  {formatCompact((phase.totalFDTax || 0) + (phase.ltcgTax || 0))}
                </td>
                <td className="px-4 py-2.5 text-right num text-accent-fd">
                  {phase.perpetual ? '—' : formatCompact(phase.nextFD || 0)}
                </td>
              </tr>
            ))}
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
              <td className="px-4 py-3 text-right num text-text-muted">—</td>
              <td className="px-4 py-3 text-right num font-bold text-accent-tax text-sm">
                {formatCompact(totalTax)}
              </td>
              <td className="px-4 py-3 text-right text-text-muted">—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
