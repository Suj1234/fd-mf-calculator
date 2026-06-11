import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_INPUTS } from './logic/defaults'
import { simulateAllPhases } from './logic/calculator'
import { formatCompact } from './logic/formatters'
import InputPanel from './components/InputPanel'
import HeroSummary from './components/HeroSummary'
import PhaseTimeline from './components/PhaseTimeline'
import PhaseCard from './components/PhaseCard'
import TaxSummary from './components/TaxSummary'
import ComparisonTable from './components/ComparisonTable'
import StrategyExplainer from './components/StrategyExplainer'
import './index.css'

// ─── URL helpers ──────────────────────────────────────────────────────────────

function parseFromURL() {
  const params = new URLSearchParams(window.location.search)
  const map = {
    fd: 'fdAmount', mf: 'mfAmount', wd: 'monthlyWithdrawal',
    fdr: 'fdStartRate', mr: 'mfRate', inf: 'inflationRate',
    tax: 'taxSlab', ltcg: 'ltcgEnabled', fdd: 'fdDeclineEnabled',
    floor: 'fdFloor', ltcgex: 'ltcgExemption',
  }
  const overrides = {}
  for (const [short, key] of Object.entries(map)) {
    const v = params.get(short)
    if (v !== null) {
      if (key === 'ltcgEnabled' || key === 'fdDeclineEnabled') overrides[key] = v === '1'
      else overrides[key] = parseFloat(v)
    }
  }
  return Object.keys(overrides).length > 0 ? { ...DEFAULT_INPUTS, ...overrides } : null
}

function serializeToURL(inputs) {
  const map = {
    fd: 'fdAmount', mf: 'mfAmount', wd: 'monthlyWithdrawal',
    fdr: 'fdStartRate', mr: 'mfRate', inf: 'inflationRate',
    tax: 'taxSlab', ltcg: 'ltcgEnabled', fdd: 'fdDeclineEnabled',
    floor: 'fdFloor', ltcgex: 'ltcgExemption',
  }
  const params = new URLSearchParams()
  for (const [short, key] of Object.entries(map)) {
    const v = inputs[key]
    if (v === true) params.set(short, '1')
    else if (v === false) params.set(short, '0')
    else params.set(short, String(v))
  }
  return '?' + params.toString()
}

// ─── Inline notes (helpful, not alarming) ─────────────────────────────────────

function InlineWarnings({ inputs, result }) {
  const notes = []
  const { fdAmount, mfAmount, monthlyWithdrawal, fdStartRate, taxSlab } = inputs

  if (monthlyWithdrawal > 0 && fdAmount > 0) {
    const firstNetInterest = fdAmount * (fdStartRate / 12) * (1 - taxSlab)
    if (monthlyWithdrawal > firstNetInterest) {
      notes.push(
        `Your ₹${formatCompact(monthlyWithdrawal)} monthly withdrawal is more than the ₹${formatCompact(firstNetInterest)} FD interest earned. This is normal — you'll draw from both interest and FD principal each month. The simulation handles this automatically.`
      )
    }
  }
  if (fdAmount === 0 && mfAmount === 0) {
    notes.push('Both FD and MF amounts are zero. Please enter your corpus above.')
  }
  if (monthlyWithdrawal > 0 && result?.scenarioB?.phases?.[0]?.fdMonths === 1) {
    notes.push('FD exhausted in month 1 — your withdrawal is very high relative to FD corpus. Consider increasing your FD amount.')
  }

  if (!notes.length) return null
  return (
    <div className="flex flex-col gap-1.5">
      {notes.map((w, i) => (
        <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
          <span className="text-amber-500 flex-shrink-0 text-sm mt-0.5">ℹ</span>
          <p className="text-xs text-amber-800 leading-relaxed">{w}</p>
        </div>
      ))}
    </div>
  )
}

// ─── More Details (Tax + Comparison, collapsed) ────────────────────────────────

function MoreDetails({ scenarioA, scenarioB, phases }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-card-hover transition-colors bg-card"
      >
        <div>
          <span className="text-xs font-semibold text-text-secondary">Tax breakdown &amp; A vs B comparison</span>
          {!open && <p className="text-[10px] text-text-muted mt-0.5">Full tax table and side-by-side scenario comparison</p>}
        </div>
        <span className="text-text-muted text-base flex-shrink-0 ml-3">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-4 p-4 border-t border-border bg-bg">
          <TaxSummary phases={phases} />
          <ComparisonTable scenarioA={scenarioA} scenarioB={scenarioB} />
        </div>
      )}
    </div>
  )
}

// ─── Strategy modal ────────────────────────────────────────────────────────────

function StrategyModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">The FD + MF Cycling Strategy</h2>
            <p className="text-xs text-text-muted mt-0.5">How this calculator models your retirement</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-card-hover transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <StrategyExplainer />
      </div>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
      <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center">
        <span className="num text-accent-fd text-lg font-bold">₹</span>
      </div>
      <p className="text-sm font-medium text-text-secondary">Enter your corpus to see projections</p>
      <p className="text-xs text-text-muted max-w-xs leading-relaxed">
        Fill in your FD amount, Mutual Fund amount, and monthly withdrawal on the left.
        Results update instantly.
      </p>
    </div>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [inputs, setInputs] = useState(() => parseFromURL() || DEFAULT_INPUTS)
  const [debouncedInputs, setDebouncedInputs] = useState(inputs)
  const [activeScenario, setActiveScenario] = useState('B')
  const [copied, setCopied] = useState(false)
  const [showStrategy, setShowStrategy] = useState(false)
  const debounceTimer = useRef(null)

  useEffect(() => {
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => setDebouncedInputs(inputs), 300)
    return () => clearTimeout(debounceTimer.current)
  }, [inputs])

  useEffect(() => {
    window.history.replaceState(null, '', serializeToURL(debouncedInputs))
  }, [debouncedInputs])

  const result = useMemo(() => {
    if (!debouncedInputs.fdAmount && !debouncedInputs.mfAmount) return null
    if (!debouncedInputs.monthlyWithdrawal) return null
    try { return simulateAllPhases(debouncedInputs) }
    catch (e) { console.error(e); return null }
  }, [debouncedInputs])

  const activeResult = result
    ? (activeScenario === 'A' ? result.scenarioA : result.scenarioB)
    : null

  const copyShareLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <div className="min-h-screen bg-bg text-text-primary">

      {/* ── Header ── */}
      <header className="border-b border-border sticky top-0 z-40 bg-bg/95 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent-fd/15 border border-accent-fd/25 flex items-center justify-center flex-shrink-0">
              <span className="num text-accent-fd text-xs font-bold">₹</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary leading-none">FD + MF Withdrawal Calculator</h1>
              <p className="text-[10px] text-text-muted mt-0.5">Indian Retirement Planner</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowStrategy(true)}
              className="h-8 px-3 flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary border border-border rounded-lg bg-card hover:bg-card-hover transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              How it works
            </button>
            <button
              type="button"
              onClick={copyShareLink}
              className="h-8 px-3 flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary border border-border rounded-lg bg-card hover:bg-card-hover transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M10 1H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V6l-4-5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M10 1v5h5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              {copied ? '✓ Copied' : 'Share'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left — Inputs */}
          <aside className="w-full lg:w-[320px] lg:flex-shrink-0">
            <div className="lg:sticky lg:top-[56px] lg:max-h-[calc(100vh-64px)] lg:overflow-y-auto lg:pb-4">
              <InputPanel inputs={inputs} onChange={setInputs} />
            </div>
          </aside>

          {/* Right — Results */}
          <main className="flex-1 min-w-0 flex flex-col gap-4">
            {!result ? (
              <EmptyState />
            ) : (
              <div className="fade-in flex flex-col gap-4">

                {/* Inline strategy summary — always visible */}
                <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-card">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-accent-fd" />
                      <div className="w-px h-4 bg-border" />
                      <div className="w-2 h-2 rounded-full bg-accent-mf" />
                      <div className="w-px h-4 bg-border" />
                      <div className="w-2 h-2 rounded-full bg-accent-fd opacity-60" />
                    </div>
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="text-xs text-text-secondary leading-relaxed">
                        <span className="font-semibold text-accent-fd">Step 1 — Use your FD.</span>{' '}
                        Your FD pays monthly interest. You withdraw from it each month (interest + principal as needed) until it runs out.
                      </div>
                      <div className="text-xs text-text-secondary leading-relaxed">
                        <span className="font-semibold text-accent-mf">Meanwhile — MF compounds.</span>{' '}
                        Your Mutual Fund grows untouched at ~12% CAGR while you live off the FD.
                      </div>
                      <div className="text-xs text-text-secondary leading-relaxed">
                        <span className="font-semibold text-accent-fd">When FD runs out → new cycle.</span>{' '}
                        Sell 50% of your MF → pay LTCG tax → put proceeds into a new FD. Repeat.
                        Each colored block in the timeline below = one such cycle.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario tabs + hero result card */}
                <HeroSummary
                  scenarioA={result.scenarioA}
                  scenarioB={result.scenarioB}
                  activeScenario={activeScenario}
                  onScenarioChange={setActiveScenario}
                />

                {/* Subtle inline warnings */}
                <InlineWarnings inputs={debouncedInputs} result={result} />

                {activeResult && (
                  <>
                    {/* Lifecycle timeline */}
                    <div className="bg-card border border-border rounded-xl px-5 py-4">
                      <PhaseTimeline
                        phases={activeResult.phases}
                        perpetual={activeResult.perpetual}
                      />
                    </div>

                    {/* Phase cards */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                          FD Cycles
                          <span className="ml-2 font-normal normal-case tracking-normal text-text-muted">
                            — click any cycle to see month-by-month detail
                          </span>
                        </h3>
                        <span className="text-[10px] text-text-muted">
                          Scenario {activeScenario} · {activeScenario === 'A' ? 'Fixed' : 'Inflation-adjusted'}
                        </span>
                      </div>
                      {activeResult.phases.map((phase, i) => (
                        <PhaseCard
                          key={`${activeScenario}-${i}`}
                          phase={phase}
                          index={i}
                          baseWithdrawal={debouncedInputs.monthlyWithdrawal}
                        />
                      ))}
                    </div>

                    {/* Tax + Comparison — behind a toggle */}
                    <MoreDetails
                      scenarioA={result.scenarioA}
                      scenarioB={result.scenarioB}
                      phases={activeResult.phases}
                    />
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-5">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-[10px] text-text-muted text-center leading-relaxed">
          For planning purposes only · Assumes no SIP, no partial redemptions, no FD laddering ·
          Tax laws, FD rates, and MF returns change over time ·
          Consult a SEBI-registered advisor before making investment decisions.
        </div>
      </footer>

      {/* Strategy modal */}
      {showStrategy && <StrategyModal onClose={() => setShowStrategy(false)} />}
    </div>
  )
}
