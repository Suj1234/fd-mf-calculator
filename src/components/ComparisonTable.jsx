import { formatCompact, formatDuration } from '../logic/formatters'

export default function ComparisonTable({ scenarioA, scenarioB }) {
  const rows = [
    {
      metric: 'Duration',
      a: scenarioA.perpetual ? 'Forever (∞)' : formatDuration(scenarioA.totalMonths),
      b: scenarioB.perpetual ? 'Forever (∞)' : formatDuration(scenarioB.totalMonths),
      aColor: scenarioA.perpetual ? 'text-accent-mf' : 'text-text-primary',
      bColor: scenarioB.perpetual ? 'text-accent-mf' : 'text-text-primary',
    },
    {
      metric: 'Total Nominal Withdrawn',
      a: formatCompact(scenarioA.totalNomWd),
      b: formatCompact(scenarioB.totalNomWd),
      aColor: 'text-accent-wd',
      bColor: 'text-accent-wd',
    },
    {
      metric: 'Total Real Value (today\'s ₹)',
      a: formatCompact(scenarioA.totalRealWd),
      b: formatCompact(scenarioB.totalRealWd),
      aColor: 'text-accent-real',
      bColor: 'text-accent-real',
    },
    {
      metric: 'Total FD Interest Tax',
      a: formatCompact(scenarioA.totalFDTax),
      b: formatCompact(scenarioB.totalFDTax),
      aColor: 'text-accent-tax/80',
      bColor: 'text-accent-tax/80',
    },
    {
      metric: 'Total LTCG Tax',
      a: formatCompact(scenarioA.totalLTCG),
      b: formatCompact(scenarioB.totalLTCG),
      aColor: 'text-accent-tax',
      bColor: 'text-accent-tax',
    },
    {
      metric: 'Total Tax (FD + LTCG)',
      a: formatCompact(scenarioA.totalTax),
      b: formatCompact(scenarioB.totalTax),
      aColor: 'text-accent-tax font-semibold',
      bColor: 'text-accent-tax font-semibold',
    },
    {
      metric: 'Final MF Corpus (nominal)',
      a: scenarioA.perpetual ? '∞ Growing' : formatCompact(scenarioA.finalMF),
      b: scenarioB.perpetual ? '∞ Growing' : formatCompact(scenarioB.finalMF),
      aColor: scenarioA.perpetual ? 'text-accent-mf' : 'text-accent-mf',
      bColor: scenarioB.perpetual ? 'text-accent-mf' : 'text-accent-mf',
    },
    {
      metric: 'Final MF Corpus (real)',
      a: scenarioA.perpetual ? '∞' : formatCompact(scenarioA.finalMFReal),
      b: scenarioB.perpetual ? '∞' : formatCompact(scenarioB.finalMFReal),
      aColor: 'text-accent-real',
      bColor: 'text-accent-real',
    },
    {
      metric: 'Number of Phases',
      a: scenarioA.phases.length + (scenarioA.perpetual ? ' (perpetual last)' : ''),
      b: scenarioB.phases.length + (scenarioB.perpetual ? ' (perpetual last)' : ''),
      aColor: 'text-accent-total',
      bColor: 'text-accent-total',
    },
  ]

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">A vs B Comparison</h3>
        <p className="text-xs text-text-muted mt-0.5">
          A = same ₹ every month · B = withdrawal rises with inflation (more realistic)
        </p>
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
                <td className={`px-4 py-2.5 text-right num ${row.aColor}`}>{row.a}</td>
                <td className={`px-4 py-2.5 text-right num ${row.bColor}`}>{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
