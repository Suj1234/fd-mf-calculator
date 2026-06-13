import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_INPUTS, CURRENT_SBI_FD } from './logic/defaults'
import { simulateAllPhases } from './logic/calculator'
import { formatCompact, formatDuration } from './logic/formatters'
import InputPanel from './components/InputPanel'
import ScenarioToggle from './components/ScenarioToggle'
import ResultTabs from './components/ResultTabs'
import HeroSummary from './components/HeroSummary'
import HealthScore from './components/HealthScore'
import RunwayTips from './components/RunwayTips'
import WhatIf from './components/WhatIf'
import PhaseTimeline from './components/PhaseTimeline'
import PhaseCardList from './components/PhaseCardList'
import Term from './components/Term'
import TaxSummary from './components/TaxSummary'
import ComparisonTable from './components/ComparisonTable'
import StrategyExplainer from './components/StrategyExplainer'
import './index.css'

// ─── URL helpers ──────────────────────────────────────────────────────────────

function parseFromURL() {
  const params = new URLSearchParams(window.location.search)
  const overrides = {}

  // New corpus format: tc = total corpus, fpct = FD percentage
  const tc = params.get('tc')
  const fpct = params.get('fpct')
  if (tc !== null) {
    overrides.totalCorpus = parseFloat(tc)
    overrides.fdPct = fpct !== null ? Math.min(1, Math.max(0, parseFloat(fpct))) : 0.5
    overrides.fdAmount = Math.round(overrides.totalCorpus * overrides.fdPct)
    overrides.mfAmount = Math.round(overrides.totalCorpus * (1 - overrides.fdPct))
  } else {
    // Legacy format: fd + mf separately
    const fd = params.get('fd')
    const mf = params.get('mf')
    if (fd !== null || mf !== null) {
      const fdVal = fd !== null ? parseFloat(fd) : DEFAULT_INPUTS.fdAmount
      const mfVal = mf !== null ? parseFloat(mf) : DEFAULT_INPUTS.mfAmount
      overrides.fdAmount = fdVal
      overrides.mfAmount = mfVal
      overrides.totalCorpus = fdVal + mfVal
      overrides.fdPct = overrides.totalCorpus > 0
        ? Math.min(1, Math.max(0, fdVal / overrides.totalCorpus))
        : 0.5
    }
  }

  // Age
  const age = params.get('age')
  if (age !== null) overrides.currentAge = Math.min(90, Math.max(0, parseInt(age, 10)))

  // Numeric/boolean params
  const map = {
    wd: 'monthlyWithdrawal',
    fdr: 'fdStartRate', mr: 'mfRate', inf: 'inflationRate',
    tax: 'taxSlab', ltcg: 'ltcgEnabled', fdd: 'fdDeclineEnabled',
    floor: 'fdFloor', ltcgex: 'ltcgExemption',
  }
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
  const params = new URLSearchParams()
  params.set('tc', String(inputs.totalCorpus))
  params.set('fpct', String(inputs.fdPct))
  if (inputs.currentAge > 0) params.set('age', String(inputs.currentAge))
  params.set('wd', String(inputs.monthlyWithdrawal))
  params.set('fdr', String(inputs.fdStartRate))
  params.set('mr', String(inputs.mfRate))
  params.set('inf', String(inputs.inflationRate))
  params.set('tax', String(inputs.taxSlab))
  params.set('ltcg', inputs.ltcgEnabled ? '1' : '0')
  params.set('fdd', inputs.fdDeclineEnabled ? '1' : '0')
  params.set('floor', String(inputs.fdFloor))
  params.set('ltcgex', String(inputs.ltcgExemption))
  return '?' + params.toString()
}

// ─── Inline notes (blue/calm — not alarming) ──────────────────────────────────

function InlineWarnings({ inputs, result }) {
  const notes = []
  const { fdAmount, mfAmount, monthlyWithdrawal, fdStartRate, taxSlab } = inputs

  if (monthlyWithdrawal > 0 && fdAmount > 0) {
    const firstNetInterest = fdAmount * (fdStartRate / 12) * (1 - taxSlab)
    if (monthlyWithdrawal > firstNetInterest) {
      notes.push(
        `You're withdrawing more than your FD earns in interest — so you'll draw from principal too. This is common and fully factored into the simulation.`
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
        <div key={i} className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5">
          <span className="text-blue-400 flex-shrink-0 text-sm mt-0.5">ℹ</span>
          <p className="text-xs text-blue-700 leading-relaxed">{w}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Strategy modal ────────────────────────────────────────────────────────────

function StrategyModal({ onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

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
        Set your total retirement corpus, split between FD and MF, and monthly withdrawal on the left.
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
  const [activeTab, setActiveTab] = useState('summary')
  const debounceTimer = useRef(null)
  const resultsTopRef = useRef(null)

  const goToTax = useCallback(() => {
    setActiveTab('tax')
    setTimeout(() => resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }, [])

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
      setTimeout(() => setCopied(false), 3000)
    })
  }, [])

  return (
    <div className="min-h-screen bg-bg text-text-primary">

      {/* ── Header ── */}
      <header className="border-b border-border sticky top-0 z-40 bg-bg/95 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-accent-fd/15 border border-accent-fd/25 flex items-center justify-center flex-shrink-0">
              <span className="num text-accent-fd text-xs font-bold">₹</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-text-primary leading-none truncate">FD + MF Withdrawal Calculator</h1>
              <p className="text-[10px] text-text-muted mt-0.5 hidden sm:block">FD + MF retirement simulator · Real Indian tax rules</p>
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex items-center gap-2 no-print flex-shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              title="Download PDF report (uses browser print)"
              className="h-8 px-3 flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary border border-border rounded-lg bg-card hover:bg-card-hover transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v8m0 0L5 6m3 3l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 11v3a1 1 0 001 1h10a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Report
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
            {copied && (
              <div className="absolute right-0 top-full mt-2 bg-[#0f172a] text-white text-[11px] px-3 py-2 rounded-lg z-50 shadow-card-md leading-relaxed"
                style={{ minWidth: '220px' }}>
                <div className="font-medium">Link copied!</div>
                <div className="opacity-70 mt-0.5">Includes your inputs — anyone with this link sees your numbers.</div>
                <div className="absolute bottom-full right-3 border-4 border-transparent border-b-[#0f172a]" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">

        {/* Print-only report header */}
        <div className="print-only" style={{ marginBottom: '16px', borderBottom: '1px solid #dce3f0', paddingBottom: '10px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>FD + MF Withdrawal — Retirement Report</h1>
          <p style={{ fontSize: '11px', color: '#334155', marginTop: '4px' }}>
            Generated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}Corpus {formatCompact(debouncedInputs.totalCorpus)} ({Math.round(debouncedInputs.fdPct * 100)}% FD / {Math.round((1 - debouncedInputs.fdPct) * 100)}% MF)
            {' · '}Withdrawal {formatCompact(debouncedInputs.monthlyWithdrawal)}/mo
            {debouncedInputs.currentAge > 0 ? ` · Age ${debouncedInputs.currentAge}` : ''}
            {' · '}Tax slab {Math.round(debouncedInputs.taxSlab * 100)}%
          </p>
        </div>

        {/* Hero — explains the novel FD+MF cycling concept before user touches any input */}
        <div className="mb-6 bg-card border border-border rounded-2xl shadow-card overflow-hidden">

          {/* Headline */}
          <div className="px-6 pt-5 pb-4 border-b border-border">
            <h2 className="text-base sm:text-xl font-bold text-text-primary leading-snug">
              How long will your FD + MF savings last in retirement?
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1.5 leading-relaxed">
              Most retirees split savings between FD and Mutual Funds — but never calculate how long it actually lasts
              after inflation, LTCG tax, and falling FD rates. This tool does exactly that.
            </p>
          </div>

          {/* 3-step visual flow */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">How the strategy works</p>
              <button
                type="button"
                onClick={() => setShowStrategy(true)}
                className="no-print text-xs text-accent-fd hover:underline font-medium"
              >
                Full explanation →
              </button>
            </div>

            {/* Arrow centering: items-stretch makes arrows fill the step height;
                pt-7 offsets past the title row (h-5=20px + gap-2=8px = 28px),
                then items-center places the arrow at the vertical center of the box. */}
            <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 sm:gap-3">

              {/* Step 1 */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-accent-fd text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <span className="text-xs font-bold text-text-primary">Split your corpus</span>
                </div>
                <div className="bg-bg border border-border rounded-xl p-3 flex flex-col gap-2">
                  {/* Dynamic split bar — width + label reflect actual fdPct */}
                  <div className="flex h-6 rounded-md overflow-hidden">
                    {inputs.fdPct > 0 && (
                      <div
                        className="bg-accent-fd flex items-center justify-center"
                        style={{ width: `${Math.round(inputs.fdPct * 100)}%` }}
                      >
                        {Math.round(inputs.fdPct * 100) >= 18 && (
                          <span className="text-[9px] text-white font-semibold">FD {Math.round(inputs.fdPct * 100)}%</span>
                        )}
                      </div>
                    )}
                    {inputs.fdPct < 1 && (
                      <div
                        className="bg-accent-mf flex items-center justify-center"
                        style={{ width: `${Math.round((1 - inputs.fdPct) * 100)}%` }}
                      >
                        {Math.round((1 - inputs.fdPct) * 100) >= 18 && (
                          <span className="text-[9px] text-white font-semibold">MF {Math.round((1 - inputs.fdPct) * 100)}%</span>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Corpus amounts — always show, with description below to match Step 2 & 3 card heights */}
                  {inputs.totalCorpus > 0 && (
                    <p className="text-[10px] text-text-muted leading-none">
                      <span className="font-semibold text-accent-fd">{formatCompact(inputs.fdAmount)}</span> FD ·{' '}
                      <span className="font-semibold text-accent-mf">{formatCompact(inputs.mfAmount)}</span> MF
                    </p>
                  )}
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    <span className="font-semibold text-accent-fd">FD</span> = stable monthly income.{' '}
                    <span className="font-semibold text-accent-mf">MF</span> = untouched growth engine. You control the split.
                  </p>
                </div>
              </div>

              {/* Desktop arrow — pt-7 offsets past title row, items-center centers in box height */}
              <div className="flex-shrink-0 hidden sm:flex items-center pt-7 text-text-muted font-bold text-base">→</div>
              <div className="text-center text-text-muted font-bold text-base sm:hidden">↓</div>

              {/* Step 2 */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-accent-mf text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <span className="text-xs font-bold text-text-primary">Live off your FD</span>
                </div>
                <div className="bg-bg border border-border rounded-xl p-3 flex flex-col gap-2">
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-accent-fd/10 text-accent-fd border border-accent-fd/20 self-start">
                    FD {(debouncedInputs.fdStartRate * 100).toFixed(1)}% → {inputs.monthlyWithdrawal > 0 ? formatCompact(inputs.monthlyWithdrawal) : '₹X'}/mo to you
                  </span>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Withdraw from FD each month. MF compounds untouched at{' '}
                    <span className="font-medium">{(debouncedInputs.mfRate * 100).toFixed(0)}% CAGR</span>{' '}
                    — years of undisturbed growth.
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0 hidden sm:flex items-center pt-7 text-text-muted font-bold text-base">→</div>
              <div className="text-center text-text-muted font-bold text-base sm:hidden">↓</div>

              {/* Step 3 */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-accent-fd text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <span className="text-xs font-bold text-text-primary">Refill FD from MF</span>
                </div>
                <div className="bg-bg border border-border rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent-mf/10 text-accent-mf border border-accent-mf/20">Sell MF</span>
                    <span className="text-text-muted text-xs">→</span>
                    {debouncedInputs.ltcgEnabled ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent-tax/10 text-accent-tax border border-accent-tax/20">
                        Pay LTCG {(debouncedInputs.ltcgRate * 100).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-border text-text-muted">
                        No LTCG tax
                      </span>
                    )}
                    <span className="text-text-muted text-xs">→</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent-fd/10 text-accent-fd border border-accent-fd/20">New FD</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {result?.scenarioB?.phases?.[0]
                      ? <>FD depletes in <span className="font-medium">{formatDuration(result.scenarioB.phases[0].fdMonths)}</span>.</>
                      : 'FD runs out in ~5–8 yrs.'
                    }{' '}
                    Sell MF → pay tax → open a new,{' '}
                    {result?.scenarioB?.phases?.[0] && result.scenarioB.phases[1]
                      ? <span className="font-medium">
                          {result.scenarioB.phases[1].fdPrincipal > result.scenarioB.phases[0].fdPrincipal
                            ? 'often bigger'
                            : 'next'}{' '}
                          FD ({formatCompact(result.scenarioB.phases[1].fdPrincipal)})
                        </span>
                      : <span className="font-medium">new FD</span>
                    }.
                  </p>
                </div>
              </div>
            </div>

            {/* Loop-back: U-bracket showing Step 3 feeds back into Step 2 */}
            {/* Mobile: simple text; Desktop: full U-bracket diagram */}
            <div className="mt-3 sm:hidden text-center">
              <p className="text-[10px] font-semibold text-accent-mf">
                ↺ Sell % of MF → pay LTCG tax → open new FD → repeat
              </p>
            </div>
            <div className="hidden sm:flex gap-3 mt-1">
              {/* Empty placeholder covering Step 1 + arrow */}
              <div className="flex-1" />
              <div className="w-4 flex-shrink-0" />
              {/* U-bracket spanning Steps 2 and 3 */}
              <div className="flex-1" style={{ flex: '2 1 0%' }}>
                <div className="flex justify-between px-1 mb-0.5">
                  <span className="text-[9px] font-semibold text-accent-mf">↑ New FD opens</span>
                  <span className="text-[9px] text-text-muted">FD runs out ↓</span>
                </div>
                <div className="border-l-2 border-b-2 border-r-2 border-dashed border-accent-mf/35 rounded-b-xl h-3" />
                <p className="text-center text-[10px] font-semibold text-accent-mf mt-1.5">↺ Sell % of MF → pay LTCG tax → open new FD → withdraw monthly → leave rest of MF untouched. Repeat.</p>
              </div>
            </div>

            {/* Two outcomes */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
                <p className="text-[11px] text-red-700 leading-relaxed">
                  <span className="font-semibold">Withdrawal too high</span> — each new FD is smaller. Money runs out
                  {result && !result.scenarioB.perpetual && result.scenarioB.totalMonths
                    ? ` in ${formatDuration(result.scenarioB.totalMonths)}.`
                    : ' in finite time.'}
                </p>
              </div>
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                <span className="text-accent-mf text-sm flex-shrink-0 leading-none mt-0.5">∞</span>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  <span className="font-semibold">Withdrawal sustainable</span> — FD grows each cycle until interest alone covers expenses forever.
                </p>
              </div>
            </div>

          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left — Inputs */}
          <aside className="w-full lg:w-[320px] lg:flex-shrink-0">
            <div className="lg:sticky lg:top-[56px] lg:max-h-[calc(100vh-64px)] lg:overflow-y-auto lg:pb-4">
              <InputPanel inputs={inputs} onChange={setInputs} />
            </div>
          </aside>

          {/* Scroll shortcut — visible on mobile/tablet (below lg), hidden on desktop */}
          {result && (
            <div className="lg:hidden flex justify-center no-print">
              <button
                type="button"
                onClick={() => resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="text-xs text-accent-fd border border-accent-fd/30 rounded-full px-4 py-2 bg-accent-fd/5 hover:bg-accent-fd/10 transition-colors"
              >
                See projections ↓
              </button>
            </div>
          )}

          {/* Right — Results */}
          <main className="flex-1 min-w-0 flex flex-col gap-4">
            {!result ? (
              <EmptyState />
            ) : (
              <div className="fade-in flex flex-col gap-5">

                {/* Global scenario toggle — drives every tab */}
                <ScenarioToggle
                  scenarioA={result.scenarioA}
                  scenarioB={result.scenarioB}
                  activeScenario={activeScenario}
                  onScenarioChange={setActiveScenario}
                  monthlyWithdrawal={debouncedInputs.monthlyWithdrawal}
                  inflationRate={debouncedInputs.inflationRate}
                  currentAge={debouncedInputs.currentAge}
                />

                {/* Tabbed results (Problem 2) */}
                <div ref={resultsTopRef} className="scroll-mt-16">
                  <ResultTabs
                    active={activeTab}
                    onChange={setActiveTab}
                    activeScenario={activeScenario}
                    tabs={[
                      {
                        key: 'summary', icon: '📊', label: 'Summary', printTitle: 'Summary',
                        content: (
                          <div className="flex flex-col gap-5">
                            <HeroSummary
                              scenarioA={result.scenarioA}
                              scenarioB={result.scenarioB}
                              activeScenario={activeScenario}
                              currentAge={debouncedInputs.currentAge}
                              monthlyWithdrawal={debouncedInputs.monthlyWithdrawal}
                              inflationRate={debouncedInputs.inflationRate}
                            />
                            <InlineWarnings inputs={debouncedInputs} result={result} />
                            {activeResult && activeResult.totalTax > 0 && (
                              <button
                                type="button"
                                onClick={goToTax}
                                className="no-print flex items-start gap-2 text-left bg-accent-fd/[0.06] border border-accent-fd/20 rounded-xl px-4 py-2.5 hover:bg-accent-fd/10 transition-colors"
                              >
                                <span className="flex-shrink-0 text-sm">💡</span>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                  <span className="font-semibold text-text-primary">
                                    {Math.round((activeResult.totalLTCG / activeResult.totalTax) * 100)}% of your {formatCompact(activeResult.totalTax)} tax is LTCG
                                  </span>{' '}
                                  — paid each time you sell MF to refill the FD.{' '}
                                  <span className="text-accent-fd font-medium">See full breakdown →</span>
                                </p>
                              </button>
                            )}
                            <HealthScore inputs={debouncedInputs} result={result} />
                            <RunwayTips inputs={debouncedInputs} result={result} />
                            <div className="no-print">
                              <WhatIf inputs={debouncedInputs} baselineResult={result} />
                            </div>
                          </div>
                        ),
                      },
                      {
                        key: 'timeline', icon: '📅', label: 'Timeline', printTitle: 'Lifecycle & FD cycles',
                        content: activeResult ? (
                          <div className="flex flex-col gap-5">
                            <div className="bg-card border border-border rounded-xl px-5 py-4">
                              <PhaseTimeline
                                phases={activeResult.phases}
                                perpetual={activeResult.perpetual}
                                currentAge={debouncedInputs.currentAge}
                              />
                            </div>
                            <div className="flex flex-col gap-2.5">
                              <div className="flex items-end justify-between px-1">
                                <div>
                                  <h3 className="text-sm font-semibold text-text-primary">FD Cycles</h3>
                                  <p className="text-[11px] text-text-muted mt-0.5">Click any cycle to expand month-by-month detail</p>
                                </div>
                                <span className="text-[10px] text-text-muted">
                                  {activeScenario === 'A' ? 'Fixed Withdrawal' : 'Inflation-Adjusted'}
                                </span>
                              </div>
                              <PhaseCardList
                                phases={activeResult.phases}
                                baseWithdrawal={debouncedInputs.monthlyWithdrawal}
                                scenarioKey={activeScenario}
                              />
                            </div>
                          </div>
                        ) : null,
                      },
                      {
                        key: 'tax', icon: '💰', label: 'Tax', printTitle: 'Tax & comparison',
                        content: activeResult ? (
                          <div className="flex flex-col gap-4">
                            <TaxSummary phases={activeResult.phases} perpetual={activeResult.perpetual} />
                            <ComparisonTable scenarioA={result.scenarioA} scenarioB={result.scenarioB} />
                          </div>
                        ) : null,
                      },
                    ]}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-6">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid gap-5 sm:grid-cols-3 text-text-muted">
          <div>
            <h4 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mb-2">What this model assumes</h4>
            <ul className="text-[11px] leading-relaxed space-y-1 list-disc list-inside marker:text-text-muted/50">
              <li>No SIP or fresh investment after retirement</li>
              <li>No partial MF redemptions or FD laddering</li>
              <li>MF is sold only at the end of each FD cycle</li>
              <li>Return &amp; inflation rates held constant (long-run averages)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mb-2">Disclaimer</h4>
            <p className="text-[11px] leading-relaxed">
              For planning and education only — not investment advice. Tax laws, FD rates and market
              returns change over time. Consult a SEBI-registered advisor before making any investment decision.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mb-2">Last updated</h4>
            <p className="text-[11px] leading-relaxed">
              Tax rules as of Budget 2024–25 (LTCG 12.5% above ₹1.25L/yr — unchanged in Budget 2025). FD rate default reflects SBI {CURRENT_SBI_FD.tenure} as of {CURRENT_SBI_FD.asOf}.
            </p>
          </div>
        </div>
      </footer>

      {/* Strategy modal */}
      {showStrategy && <StrategyModal onClose={() => setShowStrategy(false)} />}
    </div>
  )
}
