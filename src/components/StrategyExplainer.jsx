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

function SectionTitle({ children }) {
  return <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-3">{children}</div>
}

export default function StrategyExplainer() {
  return (
    <div className="flex flex-col gap-7 px-6 py-6">

      {/* ── The Cycle ── */}
      <div>
        <SectionTitle>The core loop</SectionTitle>
        <div className="rounded-xl border border-border bg-card-hover p-4">

          {/* Mobile: vertical */}
          <div className="flex sm:hidden flex-col items-center gap-1.5">
            <Box label="FD pays you" sub="monthly income" colorClass="border-accent-fd/30 bg-accent-fd/5" />
            <span className="text-text-muted text-sm select-none">↓</span>
            <Box label="MF grows silently" sub="completely untouched" colorClass="border-accent-mf/30 bg-accent-mf/5" />
            <span className="text-text-muted text-sm select-none">↓</span>
            <Box label="MF refills FD" sub="new cycle begins" colorClass="border-accent-mf/30 bg-accent-mf/5" />
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-text-muted text-xs select-none">↺</span>
              <span className="text-[10px] text-text-muted">repeat from top</span>
            </div>
          </div>

          {/* Desktop: horizontal */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            <Box label="FD pays you" sub="monthly income" colorClass="border-accent-fd/30 bg-accent-fd/5" />
            <Arrow />
            <Box label="MF grows silently" sub="completely untouched" colorClass="border-accent-mf/30 bg-accent-mf/5" />
            <Arrow />
            <Box label="MF refills FD" sub="new cycle begins" colorClass="border-accent-mf/30 bg-accent-mf/5" />
            <span className="text-text-muted text-sm select-none mx-1">↺</span>
            <span className="text-[10px] text-text-muted italic">repeats from start</span>
          </div>

          {/* Info note */}
          <div className="mt-3 flex gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
            <span className="shrink-0 text-sm text-blue-400 mt-0.5">ⓘ</span>
            <p className="text-[10px] leading-relaxed text-blue-700">
              <strong>How many cycles will you get?</strong> It depends on your monthly withdrawal.
              If MF grows faster than you spend, each refill makes the FD bigger — the cycle runs <em>forever</em>.
              Withdraw too much and each FD shrinks — the cycle ends after a few rounds.
              The calculator tells you exactly which path your numbers lead to.
            </p>
          </div>
        </div>
      </div>

      {/* ── Why not just FD or MF? ── */}
      <div>
        <SectionTitle>Why not just put everything in FD or MF?</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <div className="text-xs font-semibold text-red-800 mb-1">Only FD ✗</div>
            <p className="text-xs text-red-700 leading-relaxed">
              ₹1Cr FD at 7% gives ~₹58K/month in interest. Sounds fine — but after 10 years,
              inflation makes that ₹58K worth only ~₹32K in today's money. Your lifestyle quietly shrinks every year.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <div className="text-xs font-semibold text-red-800 mb-1">Only MF ✗</div>
            <p className="text-xs text-red-700 leading-relaxed">
              Markets go up and down. If you sell MF units every month to pay expenses,
              you're forced to sell even during a crash — locking in losses permanently. Too risky for retirement income.
            </p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mt-3">
          <div className="text-xs font-semibold text-emerald-800 mb-1">FD + MF together ✓</div>
          <p className="text-xs text-emerald-700 leading-relaxed">
            FD gives stable, predictable income for years — no market stress. MF grows untouched in the background.
            When the FD is spent, you refill it from the (now bigger) MF. Best of both worlds.
          </p>
        </div>
      </div>

      {/* ── Step 1: Split ── */}
      <div>
        <SectionTitle>Step 1 — Split your retirement corpus into two parts</SectionTitle>
        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          You decide how much goes into each. A common split is 50–70% in FD (for near-term income) and the rest in MF (for long-term growth).
        </p>
        {/* Mobile: vertical stack */}
        <div className="flex flex-col gap-1.5 sm:hidden">
          <Box label="₹1 Crore corpus" colorClass="border-border bg-card-hover" />
          <div className="text-center text-text-muted text-sm">↓</div>
          <Box label="₹50L in FD" sub="your income source" colorClass="border-accent-fd/30 bg-accent-fd/5" />
          <div className="text-center text-text-muted text-sm">+</div>
          <Box label="₹50L in MF" sub="your growth engine" colorClass="border-accent-mf/30 bg-accent-mf/5" />
        </div>
        {/* Desktop: horizontal flow */}
        <div className="hidden sm:flex items-center flex-wrap gap-2">
          <Box label="₹1 Crore corpus" colorClass="border-border bg-card-hover" />
          <Arrow />
          <Box label="₹50L in FD" sub="your income source" colorClass="border-accent-fd/30 bg-accent-fd/5" />
          <span className="text-text-muted text-sm">+</span>
          <Box label="₹50L in MF" sub="your growth engine" colorClass="border-accent-mf/30 bg-accent-mf/5" />
        </div>
        <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
          You can adjust this split in the calculator. More FD = safer income now. More MF = bigger corpus later.
        </p>
      </div>

      {/* ── Step 2: During a cycle ── */}
      <div>
        <SectionTitle>Step 2 — Live off FD while MF grows silently</SectionTitle>
        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          Each month you withdraw from the FD (interest + principal as needed). The MF is not touched at all — it just compounds.
        </p>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center flex-wrap gap-2">
            <Box label="FD (₹50L)" sub="earning 7% interest" colorClass="border-accent-fd/30 bg-accent-fd/5" />
            <Arrow />
            <Box label="₹50,000/month" sub="paid to you" colorClass="border-accent-wd/30 bg-accent-wd/5" />
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <Box label="MF (₹50L)" sub="growing at ~12%" colorClass="border-accent-mf/30 bg-accent-mf/5" />
            <span className="text-xs text-text-muted italic">← untouched. After 6 yrs it has grown to ~₹98L</span>
          </div>
        </div>
        <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
          Because MF is not disturbed, it grows without you worrying about market timing. It has years to compound freely.
        </p>
      </div>

      {/* ── Step 3: FD runs out ── */}
      <div>
        <SectionTitle>Step 3 — When FD runs out, refill it from MF</SectionTitle>
        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          The FD eventually runs dry (typically after 5–8 years). Now you sell <strong>50%</strong> of your MF,
          pay the LTCG tax on gains, and put the proceeds into a new FD. The other 50% stays in MF and keeps growing.
        </p>
        {/* Mobile: vertical stack */}
        <div className="flex flex-col gap-1.5 sm:hidden mb-2">
          <Box label="MF grew to ₹98L" colorClass="border-accent-mf/30 bg-accent-mf/5" />
          <div className="text-center text-text-muted text-sm">↓</div>
          <Box label="Sell 50% = ₹49L" colorClass="border-accent-mf/30 bg-accent-mf/5" />
          <div className="text-center text-text-muted text-sm">↓</div>
          <Box label="Pay LTCG tax" sub="~₹3L on gains" colorClass="border-accent-tax/30 bg-accent-tax/5" />
          <div className="text-center text-text-muted text-sm">↓</div>
          <Box label="New FD ≈ ₹46L" sub="next cycle begins" colorClass="border-accent-fd/30 bg-accent-fd/5" />
        </div>
        {/* Desktop: horizontal flow */}
        <div className="hidden sm:flex items-center flex-wrap gap-1.5 mb-2">
          <Box label="MF grew to ₹98L" colorClass="border-accent-mf/30 bg-accent-mf/5" />
          <Arrow />
          <Box label="Sell 50% = ₹49L" colorClass="border-accent-mf/30 bg-accent-mf/5" />
          <Arrow />
          <Box label="Pay LTCG tax" sub="~₹3L on gains" colorClass="border-accent-tax/30 bg-accent-tax/5" />
          <Arrow />
          <Box label="New FD ≈ ₹46L" sub="next cycle begins" colorClass="border-accent-fd/30 bg-accent-fd/5" />
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed">
          The remaining ₹49L stays in MF and keeps compounding for the next cycle.
        </p>

        {/* LTCG plain English */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-3">
          <div className="text-xs font-semibold text-amber-800 mb-1">What is LTCG tax?</div>
          <p className="text-xs text-amber-700 leading-relaxed">
            When you sell equity mutual funds held over 1 year, the government taxes 12.5% of your <em>profit</em> (not the full amount).
            First ₹1.25L of profit each year is tax-free (Budget 2024 rule). So if you sell ₹49L of MF and your cost was ₹25L,
            your profit is ₹24L — tax ≈ ₹2.8L. The rest goes into your new FD.
          </p>
        </div>
      </div>

      {/* ── Two outcomes ── */}
      <div>
        <SectionTitle>Two possible outcomes — depending on your withdrawal rate</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <div className="text-xs font-semibold text-red-800 mb-1">Money eventually runs out</div>
            <p className="text-xs text-red-700 leading-relaxed">
              If you're withdrawing too much relative to your corpus, each new FD is smaller than the last.
              Eventually MF is too small to refill a meaningful FD — the money runs out.
              Example: ₹50L corpus with ₹80K/month withdrawal.
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-accent-mf text-base">∞</span>
              <div className="text-xs font-semibold text-emerald-800">Self-sustaining forever</div>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              If withdrawal is sustainable, each new FD is larger than the last — MF grows faster than you spend.
              Eventually FD interest alone covers your expenses. You never touch principal again. Money lasts forever.
            </p>
          </div>
        </div>
        <p className="text-[10px] text-text-muted mt-3 leading-relaxed text-center">
          This calculator shows exactly which outcome your numbers lead to — and by how many years.
        </p>
      </div>

    </div>
  )
}
