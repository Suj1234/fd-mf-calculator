import { useState } from 'react'
import { DEFAULT_INPUTS, TOOLTIPS, CURRENT_SBI_FD } from '../logic/defaults'
import { formatCompact } from '../logic/formatters'

const SLIDER_FILLED   = '#4f46e5'
const SLIDER_UNFILLED = '#dce3f0'

function Tooltip({ text }) {
  return (
    <span className="tooltip ml-1.5 cursor-help" tabIndex={0} onClick={(e) => e.stopPropagation()}>
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-text-muted inline">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <text x="8" y="12" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="600">i</text>
      </svg>
      <span className="tooltip-content">{text}</span>
    </span>
  )
}

function ValidationNote({ tone = 'blue', children }) {
  const styles = {
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red:   'bg-red-50 border-red-200 text-red-700',
    blue:  'bg-blue-50 border-blue-200 text-blue-700',
  }[tone]
  return (
    <div className={`flex items-start gap-2 border rounded-lg px-3 py-2 ${styles}`}>
      <span className="text-xs flex-shrink-0 mt-px">{tone === 'red' ? '⚠' : 'ℹ'}</span>
      <p className="text-[11px] leading-relaxed">{children}</p>
    </div>
  )
}

function MoneyInput({ value, onChange, accentBorder = 'focus:border-accent-fd', accentRing = 'focus:ring-accent-fd/20', placeholder = '0' }) {
  const [raw, setRaw] = useState('')
  const [focused, setFocused] = useState(false)

  const displayValue = focused ? raw : value ? value.toLocaleString('en-IN') : ''
  const hint = value > 0 ? formatCompact(value) : null

  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-medium select-none">₹</span>
      <input
        type="text"
        inputMode="numeric"
        className={`w-full bg-[#f8faff] border border-border rounded-xl pl-8 pr-16 py-3 num text-xl font-semibold text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:ring-2 ${accentRing} ${accentBorder} transition-all shadow-sm`}
        value={displayValue}
        onFocus={() => { setFocused(true); setRaw(value ? String(value) : '') }}
        onChange={(e) => {
          const n = e.target.value.replace(/[^0-9]/g, '')
          setRaw(n)
          onChange(n ? parseInt(n, 10) : 0)
        }}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
      />
      {hint && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted font-medium pointer-events-none select-none num">
          {hint}
        </span>
      )}
    </div>
  )
}

function SliderInput({ label, value, onChange, min, max, step, tooltip }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-text-secondary flex items-center">
          {label}
          {tooltip && <Tooltip text={tooltip} />}
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            style={{ fontSize: '16px' }}
            className="w-16 bg-[#f8faff] border border-border rounded-lg px-2 py-1 num text-xs text-right text-text-primary focus:outline-none focus:border-accent-fd focus:ring-1 focus:ring-accent-fd/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            value={(value * 100).toFixed(1)}
            step={(step * 100).toFixed(1)}
            min={(min * 100).toFixed(1)}
            max={(max * 100).toFixed(1)}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v / 100)))
            }}
          />
          <span className="text-xs text-text-muted">%</span>
        </div>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        style={{ background: `linear-gradient(to right, ${SLIDER_FILLED} 0%, ${SLIDER_FILLED} ${pct}%, ${SLIDER_UNFILLED} ${pct}%, ${SLIDER_UNFILLED} 100%)` }}
      />
      <div className="flex justify-between num text-[10px] text-text-muted">
        <span>{(min * 100).toFixed(0)}%</span>
        <span>{(max * 100).toFixed(0)}%</span>
      </div>
    </div>
  )
}

function Toggle({ label, description, value, onChange, tooltip }) {
  return (
    <div>
      <div
        className="flex items-center justify-between gap-3 min-h-[44px] cursor-pointer"
        role="switch"
        aria-checked={value}
        tabIndex={0}
        onClick={() => onChange(!value)}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!value) } }}
      >
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-text-secondary flex items-center">
            {label}
            {tooltip && <Tooltip text={tooltip} />}
          </div>
          {description && <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{description}</p>}
        </div>
        <span
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
            value ? 'bg-accent-fd' : 'bg-[#d1d5db]'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
              value ? 'translate-x-5' : 'translate-x-0'
            }`}
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.10)' }}
          />
        </span>
      </div>
    </div>
  )
}

const PRESETS = [
  { label: 'Conservative', sub: '70% FD', fdPct: 0.7, tag: 'sleeping-well portfolio' },
  { label: 'Balanced',     sub: '50% FD', fdPct: 0.5, tag: 'best of both worlds' },
  { label: 'Growth',       sub: '30% FD', fdPct: 0.3, tag: 'trust the compounding' },
]

function CollapsibleCard({ step, title, summary, open, onToggle, children }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-card">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-card-hover transition-colors"
        onClick={onToggle}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted flex-shrink-0">{step}</span>
            <span className="text-sm font-semibold text-text-primary">{title}</span>
          </div>
          {!open && summary && (
            <p className="text-xs text-text-secondary mt-0.5 num truncate">{summary}</p>
          )}
        </div>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={`flex-shrink-0 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-5 pt-3 border-t border-border flex flex-col gap-4">
          {children}
        </div>
      )}
    </div>
  )
}

const Divider = () => <div className="h-px bg-border" />

// ─── Income stream helpers ─────────────────────────────────────────────────────

const INCOME_PRESETS = [
  { icon: '🏛', label: 'Govt Pension',   inflationLinked: true,  startMonth: 0, endMonth: null },
  { icon: '🏠', label: 'Rental Income',  inflationLinked: true,  startMonth: 0, endMonth: null },
  { icon: '📄', label: 'Annuity',        inflationLinked: false, startMonth: 0, endMonth: null },
  { icon: '💼', label: 'Consulting',     inflationLinked: false, startMonth: 0, endMonth: 120  },
  { icon: '➕', label: 'Other',          inflationLinked: false, startMonth: 0, endMonth: null },
]

const START_OPTIONS = [
  { label: 'At retirement',   months: 0   },
  { label: 'After 1 year',    months: 12  },
  { label: 'After 2 years',   months: 24  },
  { label: 'After 5 years',   months: 60  },
  { label: 'After 10 years',  months: 120 },
]

const END_OPTIONS = [
  { label: 'Never (permanent)',  months: null },
  { label: 'After 5 years',      months: 60   },
  { label: 'After 10 years',     months: 120  },
  { label: 'After 15 years',     months: 180  },
  { label: 'After 20 years',     months: 240  },
  { label: 'After 25 years',     months: 300  },
]

function streamIcon(label = '') {
  const l = label.toLowerCase()
  if (l.includes('pension') || l.includes('govt')) return '🏛'
  if (l.includes('rent') || l.includes('property')) return '🏠'
  if (l.includes('annuity') || l.includes('lic') || l.includes('nps')) return '📄'
  if (l.includes('consult') || l.includes('freelance') || l.includes('work')) return '💼'
  return '₹'
}

function IncomeStreamCard({ stream, onChange, onDelete }) {
  const [expanded, setExpanded] = useState(!stream.monthlyAmount)

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-[#f8faff]">
      {/* Header row — always visible, full touch target */}
      <button
        type="button"
        className="w-full flex items-center gap-2.5 px-3 py-3 text-left hover:bg-card-hover transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-base flex-shrink-0 leading-none">{streamIcon(stream.label)}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-text-primary truncate">
            {stream.label || 'Income Source'}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">
            {stream.monthlyAmount > 0
              ? `${formatCompact(stream.monthlyAmount)}/mo${stream.inflationLinked ? ' · grows with inflation' : ''}`
              : 'Tap to enter amount'}
          </div>
        </div>
        {/* Delete — 44px touch area, separated so it doesn't trigger expand */}
        <span
          role="button"
          tabIndex={0}
          aria-label="Remove"
          onClick={e => { e.stopPropagation(); onDelete() }}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onDelete() } }}
          className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-red-500 rounded-lg flex-shrink-0 text-lg leading-none cursor-pointer"
        >
          ×
        </span>
        <svg
          width="11" height="11" viewBox="0 0 12 12" fill="none"
          className={`flex-shrink-0 text-text-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Expanded form */}
      {expanded && (
        <div className="border-t border-border px-3 pb-4 pt-3 flex flex-col gap-3 bg-white">
          {/* Label */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-text-muted">Income source name</label>
            <input
              type="text"
              className="w-full bg-[#f8faff] border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-fd focus:ring-2 focus:ring-accent-fd/20 shadow-sm"
              value={stream.label}
              onChange={e => onChange({ ...stream, label: e.target.value })}
              placeholder="e.g. Government Pension"
            />
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-text-muted">Monthly amount (post-tax, in today's ₹)</label>
            <MoneyInput
              value={stream.monthlyAmount}
              onChange={v => onChange({ ...stream, monthlyAmount: v })}
              accentBorder="focus:border-accent-mf"
              accentRing="focus:ring-accent-mf/20"
              placeholder="50,000"
            />
          </div>

          {/* Inflation linked toggle */}
          <Toggle
            label="Grows with inflation each year"
            description={stream.inflationLinked
              ? 'Amount increases annually — like DA-revised pensions or rental income'
              : 'Fixed rupee amount — like LIC Jeevan Akshay or NPS annuity'}
            value={stream.inflationLinked}
            onChange={v => onChange({ ...stream, inflationLinked: v })}
          />

          {/* Start & End — side by side, mobile-friendly */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-text-muted">Starts</label>
              <select
                className="w-full bg-[#f8faff] border border-border rounded-xl px-2.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-fd shadow-sm"
                value={stream.startMonth || 0}
                onChange={e => onChange({ ...stream, startMonth: parseInt(e.target.value, 10) })}
              >
                {START_OPTIONS.map(opt => (
                  <option key={opt.months} value={opt.months}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-text-muted">Ends</label>
              <select
                className="w-full bg-[#f8faff] border border-border rounded-xl px-2.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-fd shadow-sm"
                value={stream.endMonth ?? -1}
                onChange={e => {
                  const v = parseInt(e.target.value, 10)
                  onChange({ ...stream, endMonth: v === -1 ? null : v })
                }}
              >
                {END_OPTIONS.map(opt => (
                  <option key={opt.months ?? -1} value={opt.months ?? -1}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main InputPanel ───────────────────────────────────────────────────────────

// ─── Bucket 3 preset definitions ──────────────────────────────────────────────

const B3_PRESETS = [
  { label: 'Gold ETF',    icon: '🥇', cagr: 0.10, taxType: 'slab', note: 'Slab rate on gains since Finance Act 2023 — not equity LTCG' },
  { label: 'Intl Equity', icon: '🌍', cagr: 0.12, taxType: 'slab', note: 'Slab rate — even Nasdaq/S&P funds changed in Finance Act 2023' },
  { label: 'Debt MF',     icon: '📊', cagr: 0.07, taxType: 'slab', note: 'Slab rate — indexation benefit removed in Finance Act 2023' },
  { label: 'REITs',       icon: '🏢', cagr: 0.09, taxType: 'ltcg', note: 'Equity LTCG — Budget 2024 aligned REITs to domestic equity' },
  { label: 'Custom',      icon: '⚙️', cagr: 0.10, taxType: 'slab', note: 'Set your own expected return and tax treatment' },
]

export default function InputPanel({ inputs, onChange, isFromURL = false }) {
  const [corpusOpen,   setCorpusOpen]   = useState(!isFromURL)
  const [spendingOpen, setSpendingOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [incomeOpen,   setIncomeOpen]   = useState(false)
  const [bucketOpen,   setBucketOpen]   = useState(false)

  const set = (key) => (val) => onChange({ ...inputs, [key]: val })

  // ── Income stream helpers ──
  const incomeStreams = inputs.otherIncomeStreams || []
  const totalMonthlyIncome = incomeStreams.reduce((s, st) => s + (st.monthlyAmount || 0), 0)

  function addStream(preset) {
    const stream = {
      id: `stream_${Date.now()}`,
      label: preset.label === 'Other' ? '' : preset.label,
      monthlyAmount: 0,
      inflationLinked: preset.inflationLinked,
      startMonth: preset.startMonth || 0,
      endMonth: preset.endMonth ?? null,
    }
    onChange({ ...inputs, otherIncomeStreams: [...incomeStreams, stream] })
    setIncomeOpen(true)
  }

  function updateStream(idx, updated) {
    onChange({ ...inputs, otherIncomeStreams: incomeStreams.map((s, i) => i === idx ? updated : s) })
  }

  function deleteStream(idx) {
    onChange({ ...inputs, otherIncomeStreams: incomeStreams.filter((_, i) => i !== idx) })
  }

  const handleCorpusChange = (totalCorpus) => {
    onChange({
      ...inputs,
      totalCorpus,
      fdAmount: Math.round(totalCorpus * inputs.fdPct),
      mfAmount: Math.round(totalCorpus * (1 - inputs.fdPct)),
    })
  }

  const handleFdPctChange = (rawPct) => {
    const fdPct = Math.min(1, Math.max(0, rawPct))
    onChange({
      ...inputs,
      fdPct,
      fdAmount: Math.round(inputs.totalCorpus * fdPct),
      mfAmount: Math.round(inputs.totalCorpus * (1 - fdPct)),
    })
  }

  const annualWithdrawalRate = inputs.totalCorpus > 0
    ? (inputs.monthlyWithdrawal * 12) / inputs.totalCorpus
    : 0
  const highWithdrawal = annualWithdrawalRate > 0.10

  const { totalCorpus, fdPct } = inputs
  const fdAmt = totalCorpus * fdPct
  const mfAmt = totalCorpus * (1 - fdPct)
  const fdW   = fdPct * 100
  const mfW   = (1 - fdPct) * 100
  const activePreset = PRESETS.find((p) => Math.abs(fdPct - p.fdPct) < 0.01)

  // Collapsed summary strings — users see what's set without opening
  const corpus1Summary = totalCorpus > 0
    ? `${formatCompact(totalCorpus)} · ${Math.round(fdPct * 100)}% FD · ${Math.round((1 - fdPct) * 100)}% MF`
    : 'Not set'

  const spending2Summary = inputs.monthlyWithdrawal > 0
    ? `${formatCompact(inputs.monthlyWithdrawal)} / month`
    : 'Not set'

  const settings3Summary = [
    `${Math.round(inputs.taxSlab * 100)}% tax`,
    inputs.surchargePct > 0 ? `+${Math.round(inputs.surchargePct * 100)}% surcharge` : null,
    inputs.jointPortfolio ? 'Joint' : null,
    inputs.currentAge ? `Age ${inputs.currentAge}` : null,
    `FD ${(inputs.fdStartRate * 100).toFixed(1)}%`,
    `MF ${(inputs.mfRate * 100).toFixed(0)}%`,
    `Inf ${(inputs.inflationRate * 100).toFixed(0)}%`,
  ].filter(Boolean).join(' · ')

  const b3 = inputs.bucket3
  const bucket5Summary = b3
    ? `${formatCompact(b3.amount)} · ${b3.label} · ${Math.round(b3.cagr * 100)}% CAGR · ${b3.taxType === 'ltcg' ? 'Equity LTCG' : 'Slab rate'}`
    : 'Optional — Gold ETF, International Equity, Debt MF'

  const income4Summary = totalMonthlyIncome > 0
    ? `${incomeStreams.length} source${incomeStreams.length !== 1 ? 's' : ''} · ${formatCompact(totalMonthlyIncome)}/mo`
    : 'Optional — pension, rental, annuity'

  return (
    <div className="flex flex-col gap-3">

      {/* ── Card 1: Corpus + Split ── */}
      <CollapsibleCard
        step="1"
        title="Your Corpus"
        summary={corpus1Summary}
        open={corpusOpen}
        onToggle={() => setCorpusOpen((o) => !o)}
      >
        <div className="flex flex-col gap-1.5">
          <div>
            <label className="text-sm font-semibold text-text-primary">Total Retirement Corpus</label>
            <p className="text-xs text-text-muted mt-0.5">Your combined savings across all FDs and equity mutual funds</p>
          </div>
          <MoneyInput value={totalCorpus} onChange={handleCorpusChange} />
        </div>

        {totalCorpus > 0 && totalCorpus < 500000 && (
          <ValidationNote tone="amber">
            Very small corpus. The FD + MF strategy works best with ₹50L+ — at this size, results are mostly illustrative.
          </ValidationNote>
        )}

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-text-secondary">How do you want to split it?</span>
            <Tooltip text={TOOLTIPS.corpusSplit} />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Less FD"
              onClick={() => handleFdPctChange(Math.max(0, Math.round((fdPct - 0.05) * 100) / 100))}
              className="w-10 h-10 rounded-lg border border-border text-text-secondary hover:bg-card-hover flex items-center justify-center text-lg leading-none flex-shrink-0 transition-colors"
            >−</button>
            <input
              type="range"
              min={0} max={1} step={0.01}
              value={fdPct}
              onChange={(e) => handleFdPctChange(parseFloat(e.target.value))}
              className="flex-1"
              style={{ background: `linear-gradient(to right, ${SLIDER_FILLED} 0%, ${SLIDER_FILLED} ${fdW}%, ${SLIDER_UNFILLED} ${fdW}%, ${SLIDER_UNFILLED} 100%)` }}
            />
            <button
              type="button"
              aria-label="More FD"
              onClick={() => handleFdPctChange(Math.min(1, Math.round((fdPct + 0.05) * 100) / 100))}
              className="w-10 h-10 rounded-lg border border-border text-text-secondary hover:bg-card-hover flex items-center justify-center text-lg leading-none flex-shrink-0 transition-colors"
            >+</button>
          </div>

          <p className="text-[10px] text-text-muted text-center leading-relaxed">
            More FD = safer income now · More MF = bigger corpus later
          </p>

          <div className="flex h-12 rounded-lg overflow-hidden text-white">
            {fdW > 0 && (
              <div className="bg-accent-fd flex flex-col items-center justify-center min-w-0 px-1" style={{ width: `${fdW}%` }}>
                {fdW >= 18 && <>
                  <span className="text-[10px] font-semibold uppercase tracking-wide truncate">FD {Math.round(fdW)}%</span>
                  <span className="num text-xs font-bold truncate">{formatCompact(fdAmt)}</span>
                </>}
              </div>
            )}
            {mfW > 0 && (
              <div className="bg-accent-mf flex flex-col items-center justify-center min-w-0 px-1" style={{ width: `${mfW}%` }}>
                {mfW >= 18 && <>
                  <span className="text-[10px] font-semibold uppercase tracking-wide truncate">MF {Math.round(mfW)}%</span>
                  <span className="num text-xs font-bold truncate">{formatCompact(mfAmt)}</span>
                </>}
              </div>
            )}
          </div>

          <div className="flex gap-1.5">
            {PRESETS.map((p) => {
              const isActive = Math.abs(fdPct - p.fdPct) < 0.01
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleFdPctChange(p.fdPct)}
                  className={`flex-1 py-2.5 rounded-lg border text-center transition-colors ${
                    isActive
                      ? 'border-accent-fd bg-accent-fd/10 text-accent-fd'
                      : 'border-border text-text-muted hover:border-accent-fd/40 hover:text-text-secondary'
                  }`}
                >
                  <div className="text-[10px] font-semibold">{p.label}</div>
                  <div className="text-[9px] opacity-70 mt-0.5">{p.sub}</div>
                </button>
              )
            })}
          </div>
          {activePreset && (
            <p className="text-[10px] text-text-muted text-center italic">"{activePreset.label} — {activePreset.tag}"</p>
          )}
        </div>
      </CollapsibleCard>

      {/* ── Card 2: Monthly Spending ── */}
      <CollapsibleCard
        step="2"
        title="Monthly Spending"
        summary={spending2Summary}
        open={spendingOpen}
        onToggle={() => setSpendingOpen((o) => !o)}
      >
        <div className="flex flex-col gap-2">
          <div>
            <label className="text-sm font-semibold text-text-primary">Monthly Withdrawal</label>
            <p className="text-xs text-text-muted mt-0.5">Your estimated monthly living expenses (today's rupees)</p>
          </div>
          <MoneyInput
            value={inputs.monthlyWithdrawal}
            onChange={set('monthlyWithdrawal')}
            accentBorder="focus:border-accent-wd"
            accentRing="focus:ring-accent-wd/20"
          />
          <p className="text-[10px] text-text-muted leading-relaxed">
            Fixed Withdrawal keeps this exact amount every month. Inflation-Adjusted increases it each year with inflation.
          </p>
          {highWithdrawal && (
            <ValidationNote tone="red">
              High withdrawal rate — you're drawing {(annualWithdrawalRate * 100).toFixed(1)}% of your corpus per year.
              Sustainable retirement withdrawals are usually 4–5%. Your corpus may deplete quickly.
            </ValidationNote>
          )}
        </div>
      </CollapsibleCard>

      {/* ── Card 3: Tax, Age & Rates (fully flat) ── */}
      <CollapsibleCard
        step="3"
        title="Tax, Age & Rates"
        summary={settings3Summary}
        open={settingsOpen}
        onToggle={() => setSettingsOpen((o) => !o)}
      >
        {/* Tax slab */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-text-primary flex items-center">
            Income Tax Slab
            <Tooltip text={TOOLTIPS.taxSlab} />
          </label>
          <p className="text-xs text-text-muted">Applied on FD interest income</p>
          <select
            className="bg-[#f8faff] border border-border rounded-xl px-3 py-2.5 text-base text-text-primary focus:outline-none focus:border-accent-fd shadow-sm"
            value={inputs.taxSlab}
            onChange={(e) => set('taxSlab')(parseFloat(e.target.value))}
          >
            <option value={0}>0% — below exemption / no tax</option>
            <option value={0.05}>5% slab</option>
            <option value={0.20}>20% slab</option>
            <option value={0.30}>30% slab</option>
          </select>
          <ValidationNote tone="blue">
            💡 Under new regime, income ≤ ₹12L is effectively <strong>0% tax</strong> (Budget 2025 rebate). The 30% slab applies above ₹15L in old regime.
          </ValidationNote>
        </div>

        {/* Surcharge */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-text-primary flex items-center">
            Surcharge
            <Tooltip text="Applicable if your annual income (FD interest + other income) exceeds ₹50L. Applied on top of income tax. LTCG surcharge is capped at 15% per IT rules." />
          </label>
          <select
            className="bg-[#f8faff] border border-border rounded-xl px-3 py-2.5 text-base text-text-primary focus:outline-none focus:border-accent-fd shadow-sm"
            value={inputs.surchargePct}
            onChange={(e) => set('surchargePct')(parseFloat(e.target.value))}
          >
            <option value={0}>None — annual income below ₹50L</option>
            <option value={0.10}>10% surcharge — income ₹50L–₹1Cr</option>
            <option value={0.15}>15% surcharge — income ₹1Cr–₹2Cr</option>
            <option value={0.25}>25% surcharge — income above ₹2Cr</option>
          </select>
          {inputs.surchargePct > 0 && (
            <p className="text-[10px] text-text-muted leading-relaxed">
              Effective FD tax: <span className="font-semibold">{(inputs.taxSlab * (1 + inputs.surchargePct) * 100).toFixed(1)}%</span> ·
              Effective LTCG: <span className="font-semibold">{(0.125 * (1 + Math.min(inputs.surchargePct, 0.15)) * 1.04 * 100).toFixed(1)}%</span>
            </p>
          )}
        </div>

        {/* Joint portfolio */}
        <Toggle
          label="Joint portfolio (I + spouse)"
          description="Doubles the LTCG annual exemption to ₹2.5L — husband and wife each get ₹1.25L separately"
          value={inputs.jointPortfolio || false}
          onChange={set('jointPortfolio')}
        />

        {/* Age */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <label className="text-sm font-semibold text-text-primary">Your current age</label>
            <p className="text-xs text-text-muted mt-0.5">Optional — shows "lasts until age X" in results</p>
          </div>
          <div className="w-24">
            <input
              type="number"
              min="30" max="90" step="1"
              className="w-full bg-[#f8faff] border border-border rounded-xl px-3 py-2.5 num text-base font-semibold text-text-primary text-center focus:outline-none focus:border-accent-fd focus:ring-2 focus:ring-accent-fd/20 transition-all shadow-sm"
              value={inputs.currentAge || ''}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                onChange({ ...inputs, currentAge: isNaN(v) ? 0 : Math.min(90, Math.max(0, v)) })
              }}
              placeholder="60"
            />
          </div>
        </div>

        <Divider />

        {/* Rates */}
        <SliderInput
          label="FD Interest Rate"
          value={inputs.fdStartRate}
          onChange={set('fdStartRate')}
          min={0.04} max={0.10} step={0.001}
          tooltip={TOOLTIPS.fdStartRate}
        />
        {Math.abs(inputs.fdStartRate - CURRENT_SBI_FD.rate) < 0.0005 ? (
          <p className="text-[10px] text-accent-mf">✓ Using current SBI {CURRENT_SBI_FD.tenure} rate ({(CURRENT_SBI_FD.rate * 100).toFixed(1)}%, as of {CURRENT_SBI_FD.asOf})</p>
        ) : (
          <button
            type="button"
            onClick={() => set('fdStartRate')(CURRENT_SBI_FD.rate)}
            className="text-[10px] text-accent-fd hover:underline self-start"
          >
            Use current SBI {CURRENT_SBI_FD.tenure} rate: {(CURRENT_SBI_FD.rate * 100).toFixed(1)}% (as of {CURRENT_SBI_FD.asOf})
          </button>
        )}

        <SliderInput
          label="Mutual Fund Return (CAGR)"
          value={inputs.mfRate}
          onChange={set('mfRate')}
          min={0.06} max={0.20} step={0.005}
          tooltip={TOOLTIPS.mfRate}
        />

        <SliderInput
          label="Inflation Rate"
          value={inputs.inflationRate}
          onChange={set('inflationRate')}
          min={0.03} max={0.12} step={0.005}
          tooltip={TOOLTIPS.inflationRate}
        />

        <Divider />

        <Toggle
          label="Apply LTCG Tax on MF redemption"
          description="12.5% on equity MF gains above ₹1.25L/year (Budget 2024 rules)"
          value={inputs.ltcgEnabled}
          onChange={set('ltcgEnabled')}
          tooltip={TOOLTIPS.ltcgEnabled}
        />

        {inputs.ltcgEnabled && (
          <div className="flex flex-col gap-1.5 ml-2 pl-3 border-l-2 border-accent-fd/20">
            <label className="text-[10px] font-medium text-text-muted flex items-center">
              LTCG annual exemption limit
              <Tooltip text={TOOLTIPS.ltcgExemption} />
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
              <input
                type="text"
                inputMode="numeric"
                className="w-full bg-[#f8faff] border border-border rounded-xl pl-7 pr-3 py-2 num text-base text-text-primary focus:outline-none focus:border-accent-fd shadow-sm"
                value={inputs.ltcgExemption ? inputs.ltcgExemption.toLocaleString('en-IN') : ''}
                onChange={(e) => {
                  const n = e.target.value.replace(/[^0-9]/g, '')
                  set('ltcgExemption')(n ? parseInt(n, 10) : 0)
                }}
              />
            </div>
          </div>
        )}

        <Toggle
          label="Model FD rate decline over time"
          description="SBI rates fell ~2% over 15 yrs. Models 0.5% drop every 5 years."
          value={inputs.fdDeclineEnabled}
          onChange={set('fdDeclineEnabled')}
          tooltip={TOOLTIPS.fdDeclineEnabled}
        />

        {inputs.fdDeclineEnabled && (
          <div className="ml-2 pl-3 border-l-2 border-accent-fd/20 flex flex-col gap-1.5">
            <div className="num text-[10px] text-text-muted flex items-center justify-between">
              <span>Minimum floor rate</span>
              <span className="font-semibold text-text-secondary">{(inputs.fdFloor * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0.04} max={0.07} step={0.005}
              value={inputs.fdFloor}
              onChange={(e) => set('fdFloor')(parseFloat(e.target.value))}
              className="w-full"
              style={{ background: `linear-gradient(to right, ${SLIDER_FILLED} 0%, ${SLIDER_FILLED} ${((inputs.fdFloor - 0.04) / 0.03) * 100}%, ${SLIDER_UNFILLED} ${((inputs.fdFloor - 0.04) / 0.03) * 100}%, ${SLIDER_UNFILLED} 100%)` }}
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => onChange({
            ...inputs,
            ...DEFAULT_INPUTS,
            totalCorpus: inputs.totalCorpus,
            fdPct: inputs.fdPct,
            fdAmount: inputs.fdAmount,
            mfAmount: inputs.mfAmount,
            monthlyWithdrawal: inputs.monthlyWithdrawal,
            currentAge: inputs.currentAge,
          })}
          className="text-[10px] text-text-muted hover:text-text-secondary underline self-start transition-colors mt-1"
        >
          Restore defaults
        </button>
      </CollapsibleCard>

      {/* ── Card 4: Other Monthly Income ── */}
      <CollapsibleCard
        step="4"
        title="Other Monthly Income"
        summary={income4Summary}
        open={incomeOpen}
        onToggle={() => setIncomeOpen(o => !o)}
      >
        {/* Existing streams */}
        {incomeStreams.length > 0 && (
          <div className="flex flex-col gap-2">
            {incomeStreams.map((stream, idx) => (
              <IncomeStreamCard
                key={stream.id}
                stream={stream}
                onChange={updated => updateStream(idx, updated)}
                onDelete={() => deleteStream(idx)}
              />
            ))}
          </div>
        )}

        {/* Quick-add presets */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-medium text-text-muted">
            {incomeStreams.length === 0 ? 'Add an income source:' : 'Add another:'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {INCOME_PRESETS.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => addStream(preset)}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg border border-border text-[11px] text-text-secondary hover:border-accent-mf/50 hover:text-accent-mf hover:bg-accent-mf/5 transition-colors min-h-[36px]"
              >
                <span className="text-sm leading-none">{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Helper note */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
          <span className="text-blue-400 text-xs flex-shrink-0 mt-px">ℹ</span>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            Enter <strong>post-tax amounts</strong> — what actually reaches your bank account.
            These reduce how much is drawn from your corpus each month.
          </p>
        </div>
      </CollapsibleCard>

      {/* ── Card 5: Additional Bucket (Bucket 3) ── */}
      <CollapsibleCard
        step="5"
        title="Additional Bucket"
        summary={bucket5Summary}
        open={bucketOpen}
        onToggle={() => setBucketOpen(o => !o)}
      >
        {/* Preset chips */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-medium text-text-muted">Pick an asset type to add as a third bucket:</p>
          <div className="flex flex-wrap gap-1.5">
            {B3_PRESETS.map(preset => {
              const isActive = b3 && b3.label === preset.label
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      onChange({ ...inputs, bucket3: null })
                    } else {
                      onChange({
                        ...inputs,
                        bucket3: {
                          label: preset.label,
                          cagr: preset.cagr,
                          taxType: preset.taxType,
                          amount: b3?.amount || 0,
                        },
                      })
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[11px] transition-colors min-h-[36px] ${
                    isActive
                      ? 'border-amber-400 bg-amber-50 text-amber-700 font-semibold'
                      : 'border-border text-text-secondary hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50/50'
                  }`}
                >
                  <span className="text-sm leading-none">{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* B3 configuration — only when a preset is selected */}
        {b3 && (
          <>
            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-primary">{b3.label} — Amount</label>
              <p className="text-xs text-text-muted">How much of your corpus is currently in {b3.label}?</p>
              <MoneyInput
                value={b3.amount}
                onChange={v => onChange({ ...inputs, bucket3: { ...b3, amount: v } })}
                accentBorder="focus:border-amber-400"
                accentRing="focus:ring-amber-400/20"
                placeholder="10,00,000"
              />
            </div>

            {/* CAGR slider */}
            <SliderInput
              label={`Expected return (CAGR) — ${b3.label}`}
              value={b3.cagr}
              onChange={v => onChange({ ...inputs, bucket3: { ...b3, cagr: v } })}
              min={0.04}
              max={0.20}
              step={0.005}
              tooltip={`Historical approximate: Gold ETF ~10%, Intl Equity ~12%, Debt MF ~7%, REITs ~9%. These are long-run estimates — actual returns vary.`}
            />

            {/* Tax type toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-text-secondary">Tax treatment on redemption</label>
              <div className="flex gap-2">
                {[
                  { id: 'slab', label: 'Slab rate', desc: 'Gains taxed at your income slab (20–30%+)' },
                  { id: 'ltcg', label: 'Equity LTCG', desc: '12.5% on gains above ₹1.25L/year' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ ...inputs, bucket3: { ...b3, taxType: opt.id } })}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-left transition-colors ${
                      b3.taxType === opt.id
                        ? 'border-accent-fd bg-accent-fd/8 text-accent-fd'
                        : 'border-border text-text-muted hover:border-accent-fd/40'
                    }`}
                  >
                    <div className="text-[11px] font-semibold">{opt.label}</div>
                    <div className="text-[9px] mt-0.5 opacity-80 leading-tight">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Education note — auto-selected based on preset */}
            {(() => {
              const preset = B3_PRESETS.find(p => p.label === b3.label)
              if (!preset) return null
              const effectiveTaxRate = b3.taxType === 'ltcg'
                ? `~${(0.125 * (1 + Math.min(inputs.surchargePct || 0, 0.15)) * 1.04 * 100).toFixed(0)}% on gains above ₹1.25L/yr`
                : `~${(inputs.taxSlab * (1 + (inputs.surchargePct || 0)) * 100).toFixed(0)}% on all gains`
              return (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                  <span className="text-amber-500 text-xs flex-shrink-0 mt-px">ℹ</span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    <strong>{b3.label}:</strong> {preset.note}. At your slab, effective tax ≈ <strong>{effectiveTaxRate}</strong>.
                    {b3.taxType === 'slab' && inputs.taxSlab >= 0.20 && (
                      <> Compare: Equity MF gains are taxed at just ~13%.</>
                    )}
                  </p>
                </div>
              )
            })()}

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onChange({ ...inputs, bucket3: null })}
              className="text-[11px] text-red-500 hover:underline self-start"
            >
              Remove {b3.label} bucket
            </button>
          </>
        )}

        {!b3 && (
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
            <span className="text-blue-400 text-xs flex-shrink-0 mt-px">ℹ</span>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Bucket 3 grows alongside your MF. When MF is depleted, it takes over as the refill source — extending your runway.
              <strong> Gold ETF and Intl Equity are taxed at slab rate</strong> (not LTCG) since Finance Act 2023.
            </p>
          </div>
        )}
      </CollapsibleCard>

      <p className="text-[10px] text-text-muted text-center px-2">
        Results update live as you adjust these inputs
      </p>
    </div>
  )
}
