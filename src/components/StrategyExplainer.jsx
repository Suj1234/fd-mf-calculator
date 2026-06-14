function Arrow() {
  return <span className="text-text-muted text-sm select-none mx-1">→</span>
}

function Box({ label, sub, colorClass = 'border-border bg-card-hover' }) {
  return (
    <div className={`border rounded-lg px-3 py-2 text-center ${colorClass}`} style={{ minWidth: 90 }}>
      <div className="text-xs font-medium text-text-primary">{label}</div>
      {sub && <div className="text-[10px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  )
}

function SectionTitle({ step, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {step && (
        <span className="w-5 h-5 rounded-full bg-text-muted/20 text-text-muted text-[10px] font-bold flex items-center justify-center flex-shrink-0">
          {step}
        </span>
      )}
      <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{children}</div>
    </div>
  )
}

export default function StrategyExplainer() {
  return (
    <div className="flex flex-col gap-6 px-5 py-6 sm:px-6">

      {/* Opening hook */}
      <p className="text-xs text-text-secondary leading-relaxed">
        Your corpus is split into two pots. One pays your expenses now. The other grows silently in the
        background. When the first runs empty, you refill it from the second — and the cycle begins again.
        Here is exactly how it works.
      </p>

      {/* ── The Setup ── */}
      <div>
        <SectionTitle>The setup — happens once, at retirement</SectionTitle>
        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          Split your total corpus into two parts: FD for near-term income, MF for long-term growth.
          A 50/50 split is common, but you decide — more FD means more income now, more MF means a
          larger corpus later.
        </p>

        {/* Mobile: vertical */}
        <div className="flex flex-col gap-1.5 sm:hidden">
          <Box label="₹1 Crore corpus" colorClass="border-border bg-card-hover" />
          <div className="text-center text-text-muted text-sm">↓</div>
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <Box label="₹50L in FD" sub="your income source" colorClass="border-accent-fd/30 bg-accent-fd/5" />
            </div>
            <div className="flex items-center text-text-muted text-sm font-semibold flex-shrink-0">+</div>
            <div className="flex-1 min-w-0">
              <Box label="₹50L in MF" sub="your growth engine" colorClass="border-accent-mf/30 bg-accent-mf/5" />
            </div>
          </div>
        </div>
        {/* Desktop: horizontal */}
        <div className="hidden sm:flex items-center flex-wrap gap-2">
          <Box label="₹1 Crore corpus" colorClass="border-border bg-card-hover" />
          <Arrow />
          <Box label="₹50L in FD" sub="your income source" colorClass="border-accent-fd/30 bg-accent-fd/5" />
          <span className="text-text-muted text-sm">+</span>
          <Box label="₹50L in MF" sub="your growth engine" colorClass="border-accent-mf/30 bg-accent-mf/5" />
        </div>
        <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
          From here, the FD is your spending account. The MF is left completely untouched to grow.
        </p>
      </div>

      {/* Cycle divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent-mf whitespace-nowrap">the cycle begins</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* ── Phase 1: Live off FD ── */}
      <div>
        <SectionTitle step="1">Live off FD · MF grows completely untouched</SectionTitle>
        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          Each month you withdraw from the FD — interest first, then principal as needed.
          The MF is never touched at all. It compounds freely, year after year.
        </p>
        <div className="bg-bg border border-border rounded-xl p-3 flex flex-col gap-3">
          <div className="flex items-center flex-wrap gap-2">
            <Box label="FD (₹50L)" sub="earning 7% interest" colorClass="border-accent-fd/30 bg-accent-fd/5" />
            <Arrow />
            <Box label="₹50,000/month" sub="paid to you" colorClass="border-accent-wd/30 bg-accent-wd/5" />
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <Box label="MF (₹50L)" sub="growing at ~12%" colorClass="border-accent-mf/30 bg-accent-mf/5" />
            <span className="text-[10px] text-text-muted italic">← untouched · grows to ~₹98L in 6 yrs</span>
          </div>
        </div>
        <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
          Because MF is never disturbed, it has years to compound without you worrying about market timing.
          This is the key advantage over selling MF monthly.
        </p>
      </div>

      {/* Transition: FD runs empty */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
        <span className="text-amber-500 text-sm flex-shrink-0">⏱</span>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          <strong>After ~5–8 years:</strong> FD runs empty. Time to refill it — the MF has grown significantly during this time.
        </p>
      </div>

      {/* ── Phase 2: Refill FD ── */}
      <div>
        <SectionTitle step="2">Sell part of MF · Open a new FD</SectionTitle>
        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          You sell a portion of MF (typically 50%), pay LTCG tax on the gains, and open a new FD.
          The remaining MF stays invested and starts compounding again for the next cycle.
        </p>

        {/* Mobile: vertical */}
        <div className="flex flex-col gap-1.5 sm:hidden mb-3">
          <Box label="MF grew to ₹98L" colorClass="border-accent-mf/30 bg-accent-mf/5" />
          <div className="text-center text-text-muted text-sm">↓</div>
          <Box label="Sell 50% = ₹49L" colorClass="border-accent-mf/30 bg-accent-mf/5" />
          <div className="text-center text-text-muted text-sm">↓</div>
          <Box label="Pay LTCG tax" sub="~₹3L on gains" colorClass="border-accent-tax/30 bg-accent-tax/5" />
          <div className="text-center text-text-muted text-sm">↓</div>
          <Box label="New FD ≈ ₹46L" sub="next cycle begins" colorClass="border-accent-fd/30 bg-accent-fd/5" />
        </div>
        {/* Desktop: horizontal */}
        <div className="hidden sm:flex items-center flex-wrap gap-1.5 mb-3">
          <Box label="MF grew to ₹98L" colorClass="border-accent-mf/30 bg-accent-mf/5" />
          <Arrow />
          <Box label="Sell 50% = ₹49L" colorClass="border-accent-mf/30 bg-accent-mf/5" />
          <Arrow />
          <Box label="Pay LTCG tax" sub="~₹3L on gains" colorClass="border-accent-tax/30 bg-accent-tax/5" />
          <Arrow />
          <Box label="New FD ≈ ₹46L" sub="next cycle begins" colorClass="border-accent-fd/30 bg-accent-fd/5" />
        </div>

        <p className="text-[10px] text-text-muted leading-relaxed mb-3">
          Remaining ₹49L stays in MF and keeps compounding. The new FD is your income source for the next phase.
        </p>

        {/* LTCG explainer — naturally placed here at the refill step */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="text-xs font-semibold text-amber-800 mb-1">What is LTCG tax?</div>
          <p className="text-xs text-amber-700 leading-relaxed">
            When you sell equity MF held over 1 year, the government taxes 12.5% of your <em>profit</em> only —
            not the full sale amount. The first ₹1.25L of annual profit is tax-free. So if you sell ₹49L and
            your cost was ₹25L, profit = ₹24L, tax ≈ ₹2.8L. The rest goes into your new FD.
          </p>
        </div>
      </div>

      {/* ↺ Cycle repeats — prominent visual */}
      <div className="border-2 border-dashed border-accent-mf/40 rounded-xl px-4 py-4 bg-accent-mf/[0.03]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-accent-mf text-xl leading-none">↺</span>
          <span className="text-xs font-bold text-accent-mf">Back to Phase 1 — new cycle begins</span>
        </div>
        <p className="text-[10px] text-text-muted text-center leading-relaxed">
          The new FD pays your monthly expenses. The remaining MF grows untouched again.
          After another ~5–8 years, the FD runs dry and you refill from MF once more.
        </p>
      </div>

      {/* ── Two outcomes ── */}
      <div>
        <SectionTitle>Two possible outcomes — depends on your withdrawal</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <div className="text-xs font-semibold text-red-800 mb-1">Money eventually runs out</div>
            <p className="text-xs text-red-700 leading-relaxed">
              If withdrawal is too high, each new FD is smaller than the last.
              Eventually MF can no longer fund a meaningful FD — the money runs out.
              Example: ₹1Cr corpus with ₹1.5L/month withdrawal.
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-accent-mf text-base leading-none">∞</span>
              <div className="text-xs font-semibold text-emerald-800">Self-sustaining forever</div>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              If MF grows faster than you spend, each new FD is larger. Eventually FD interest alone
              covers your expenses — you never touch principal again. Money lasts forever.
            </p>
          </div>
        </div>
        <p className="text-[10px] text-text-muted mt-3 text-center leading-relaxed">
          This calculator shows exactly which path your numbers lead to — and by how many years.
        </p>
      </div>

    </div>
  )
}
