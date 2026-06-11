// Content-only component — rendered inside a modal in App.jsx

function Arrow() {
  return <span className="text-text-muted text-sm select-none mx-1">→</span>
}

function Box({ label, sub, colorClass = 'border-border bg-card-hover' }) {
  return (
    <div className={`border rounded-lg px-3 py-2 text-center min-w-[96px] ${colorClass}`}>
      <div className="text-xs font-medium text-text-primary">{label}</div>
      {sub && <div className="text-[10px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  )
}

function Term({ word, def }) {
  return (
    <div>
      <div className="text-xs font-semibold text-text-primary">{word}</div>
      <div className="text-xs text-text-muted mt-0.5 leading-relaxed">{def}</div>
    </div>
  )
}

export default function StrategyExplainer() {
  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      {/* Summary */}
      <p className="text-sm text-text-secondary leading-relaxed">
        You split your retirement savings between a{' '}
        <span className="text-accent-fd font-medium">Fixed Deposit</span> and an{' '}
        <span className="text-accent-mf font-medium">Equity Mutual Fund</span>. You live off the FD. The MF
        compounds untouched. When the FD runs out, you sell half the MF, pay taxes, and open a new (larger) FD.
        This repeats until the portfolio becomes self-sustaining forever.
      </p>

      {/* Flow: during phase */}
      <div>
        <div className="text-[10px] text-text-muted uppercase tracking-wider mb-3">During each cycle</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center flex-wrap gap-1">
            <Box label="Your FD" sub="earning interest" colorClass="border-accent-fd/30 bg-accent-fd/5" />
            <Arrow />
            <Box label="Monthly withdrawal" sub="paid to you" colorClass="border-accent-wd/30 bg-accent-wd/5" />
          </div>
          <div className="flex items-center flex-wrap gap-1">
            <Box label="Your MF" sub="compounding ~12%" colorClass="border-accent-mf/30 bg-accent-mf/5" />
            <span className="text-xs text-text-muted italic ml-1">← untouched, growing freely</span>
          </div>
        </div>
      </div>

      {/* Flow: at transition */}
      <div>
        <div className="text-[10px] text-text-muted uppercase tracking-wider mb-3">When FD runs out</div>
        <div className="flex items-center flex-wrap gap-1">
          <Box label="Sell 50% of MF" colorClass="border-accent-mf/30 bg-accent-mf/5" />
          <Arrow />
          <Box label="Pay LTCG tax" sub="12.5% on gains" colorClass="border-accent-tax/30 bg-accent-tax/5" />
          <Arrow />
          <Box label="Open new FD" sub="next cycle begins" colorClass="border-accent-fd/30 bg-accent-fd/5" />
        </div>
        <p className="text-xs text-text-muted mt-2">The other 50% stays in MF and keeps compounding.</p>
      </div>

      {/* Perpetual outcome */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="text-accent-mf text-xl leading-none mt-0.5">∞</span>
          <div>
            <div className="text-sm font-semibold text-emerald-800">The goal: self-sustaining forever</div>
            <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
              As cycles repeat, the MF grows faster than withdrawals deplete it. Eventually the FD interest alone
              covers monthly expenses — the MF never needs to be touched again.
            </p>
          </div>
        </div>
      </div>

      {/* Glossary */}
      <div>
        <div className="text-[10px] text-text-muted uppercase tracking-wider mb-3">Key terms</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Term word="Phase / Cycle" def="One FD cycle from opening to exhaustion. Each phase = a row in the timeline below." />
          <Term word="LTCG Tax" def="Long Term Capital Gains: 12.5% on equity MF profits above ₹1.25L/year (Budget 2024)." />
          <Term word="Scenario A" def="You withdraw the same fixed ₹ amount every month." />
          <Term word="Scenario B" def="Your withdrawal rises each year with inflation — purchasing power stays constant." />
          <Term word="Real Value" def="A future withdrawal expressed in today's rupees, adjusted for inflation." />
          <Term word="Self-sustaining" def="When FD interest (after income tax) ≥ monthly withdrawal — money never runs out." />
        </div>
      </div>
    </div>
  )
}
