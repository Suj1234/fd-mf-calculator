import { useState } from 'react'
import { DEFAULT_INPUTS, TOOLTIPS } from '../logic/defaults'
import { formatCompact } from '../logic/formatters'

const SLIDER_FILLED   = '#4f46e5'
const SLIDER_UNFILLED = '#dce3f0'

function Tooltip({ text }) {
  return (
    <span className="tooltip ml-1.5 cursor-help">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-text-muted inline">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <text x="8" y="12" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="600">i</text>
      </svg>
      <span className="tooltip-content">{text}</span>
    </span>
  )
}

function CorpusInput({ label, description, value, onChange, accentBorder = 'focus:border-accent-fd' }) {
  const [raw, setRaw] = useState('')
  const [focused, setFocused] = useState(false)

  const displayValue = focused ? raw : value ? value.toLocaleString('en-IN') : ''
  const hint = value > 0 ? formatCompact(value) : null

  return (
    <div className="flex flex-col gap-1.5">
      <div>
        <label className="text-sm font-semibold text-text-primary">{label}</label>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-medium select-none">₹</span>
        <input
          type="text"
          inputMode="numeric"
          className={`w-full bg-[#f8faff] border border-border rounded-xl pl-8 pr-16 py-3 num text-xl font-semibold text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent-fd/20 ${accentBorder} transition-all shadow-sm`}
          value={displayValue}
          onFocus={() => { setFocused(true); setRaw(value ? String(value) : '') }}
          onChange={(e) => {
            const n = e.target.value.replace(/[^0-9]/g, '')
            setRaw(n)
            onChange(n ? parseInt(n, 10) : 0)
          }}
          onBlur={() => setFocused(false)}
          placeholder="0"
        />
        {hint && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted font-medium pointer-events-none select-none num">
            {hint}
          </span>
        )}
      </div>
    </div>
  )
}

const PRESETS = [
  { label: 'Conservative', sub: '70% FD', fdPct: 0.7 },
  { label: 'Balanced', sub: '50% FD', fdPct: 0.5 },
  { label: 'Growth', sub: '30% FD', fdPct: 0.3 },
]

function CorpusSplitInput({ inputs, onCorpusChange, onFdPctChange }) {
  const [raw, setRaw] = useState('')
  const [focused, setFocused] = useState(false)

  const { totalCorpus, fdPct } = inputs
  const fdAmt  = totalCorpus * fdPct
  const mfAmt  = totalCorpus * (1 - fdPct)
  const sliderPct = ((fdPct - 0.2) / 0.6) * 100

  const displayValue = focused ? raw : totalCorpus ? totalCorpus.toLocaleString('en-IN') : ''
  const hint = totalCorpus > 0 ? formatCompact(totalCorpus) : null

  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-card flex flex-col gap-4">

      {/* Total corpus input */}
      <div className="flex flex-col gap-1.5">
        <div>
          <label className="text-sm font-semibold text-text-primary">
            Total Retirement Corpus
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            Your combined savings across all FDs and equity mutual funds
          </p>
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-medium select-none">₹</span>
          <input
            type="text"
            inputMode="numeric"
            className="w-full bg-[#f8faff] border border-border rounded-xl pl-8 pr-16 py-3 num text-xl font-semibold text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent-fd/20 focus:border-accent-fd transition-all shadow-sm"
            value={displayValue}
            onFocus={() => { setFocused(true); setRaw(totalCorpus ? String(totalCorpus) : '') }}
            onChange={(e) => {
              const n = e.target.value.replace(/[^0-9]/g, '')
              setRaw(n)
              onCorpusChange(n ? parseInt(n, 10) : 0)
            }}
            onBlur={() => setFocused(false)}
            placeholder="0"
          />
          {hint && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted font-medium pointer-events-none select-none num">
              {hint}
            </span>
          )}
        </div>
      </div>

      {/* Split slider */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-text-secondary">How do you want to split it?</span>
          <Tooltip text={TOOLTIPS.corpusSplit} />
        </div>

        {/* Slider track with FD/MF labels */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-accent-fd w-6 flex-shrink-0">FD</span>
          <input
            type="range"
            min={0.2} max={0.8} step={0.01}
            value={fdPct}
            onChange={(e) => onFdPctChange(parseFloat(e.target.value))}
            className="flex-1"
            style={{
              background: `linear-gradient(to right, ${SLIDER_FILLED} 0%, ${SLIDER_FILLED} ${sliderPct}%, ${SLIDER_UNFILLED} ${sliderPct}%, ${SLIDER_UNFILLED} 100%)`,
            }}
          />
          <span className="text-[10px] font-bold text-accent-mf w-6 text-right flex-shrink-0">MF</span>
        </div>

        {/* Live amount chips */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-accent-fd/8 rounded-lg px-3 py-2 text-center border border-accent-fd/15">
            <div className="text-[10px] text-accent-fd font-semibold uppercase tracking-wide">
              FD · {Math.round(fdPct * 100)}%
            </div>
            <div className="num text-sm font-bold text-accent-fd mt-0.5">{formatCompact(fdAmt)}</div>
          </div>
          <div className="bg-accent-mf/8 rounded-lg px-3 py-2 text-center border border-accent-mf/15">
            <div className="text-[10px] text-accent-mf font-semibold uppercase tracking-wide">
              MF · {Math.round((1 - fdPct) * 100)}%
            </div>
            <div className="num text-sm font-bold text-accent-mf mt-0.5">{formatCompact(mfAmt)}</div>
          </div>
        </div>

        {/* Preset chips */}
        <div className="flex gap-1.5">
          {PRESETS.map((p) => {
            const isActive = Math.abs(fdPct - p.fdPct) < 0.01
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onFdPctChange(p.fdPct)}
                className={`flex-1 py-1.5 rounded-lg border text-center transition-colors ${
                  isActive
                    ? 'border-accent-fd bg-accent-fd/10 text-accent-fd'
                    : 'border-border text-text-muted hover:border-accent-fd/40 hover:text-text-secondary'
                }`}
              >
                <div className={`text-[10px] font-semibold ${isActive ? '' : ''}`}>{p.label}</div>
                <div className="text-[9px] opacity-70 mt-0.5">{p.sub}</div>
              </button>
            )
          })}
        </div>
      </div>
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-text-secondary flex items-center">
            {label}
            {tooltip && <Tooltip text={tooltip} />}
          </div>
          {description && <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{description}</p>}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-fd focus:ring-offset-1 ${
            value ? 'bg-accent-fd' : 'bg-[#d1d5db]'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
              value ? 'translate-x-5' : 'translate-x-0'
            }`}
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.10)' }}
          />
        </button>
      </div>
    </div>
  )
}

export default function InputPanel({ inputs, onChange }) {
  const [advOpen, setAdvOpen] = useState(false)
  const set = (key) => (val) => onChange({ ...inputs, [key]: val })

  const handleCorpusChange = (totalCorpus) => {
    onChange({
      ...inputs,
      totalCorpus,
      fdAmount: Math.round(totalCorpus * inputs.fdPct),
      mfAmount: Math.round(totalCorpus * (1 - inputs.fdPct)),
    })
  }

  const handleFdPctChange = (rawPct) => {
    const fdPct = Math.min(0.8, Math.max(0.2, rawPct))
    onChange({
      ...inputs,
      fdPct,
      fdAmount: Math.round(inputs.totalCorpus * fdPct),
      mfAmount: Math.round(inputs.totalCorpus * (1 - fdPct)),
    })
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Corpus split card */}
      <CorpusSplitInput
        inputs={inputs}
        onCorpusChange={handleCorpusChange}
        onFdPctChange={handleFdPctChange}
      />

      {/* Withdrawal */}
      <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
        <CorpusInput
          label="Monthly Withdrawal"
          description="Your estimated monthly living expenses (today's rupees)"
          value={inputs.monthlyWithdrawal}
          onChange={set('monthlyWithdrawal')}
          accentBorder="focus:border-accent-wd"
        />
        <p className="text-[10px] text-text-muted mt-2.5 leading-relaxed">
          Fixed Withdrawal keeps this exact amount every month.
          Inflation-Adjusted increases it each year with inflation.
        </p>
      </div>

      {/* Current age — optional */}
      <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <label className="text-sm font-semibold text-text-primary">Your current age</label>
            <p className="text-xs text-text-muted mt-0.5">Optional — shows "lasts until age X" in results</p>
          </div>
          <div className="relative w-24">
            <input
              type="number"
              min="30"
              max="90"
              step="1"
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
      </div>

      {/* Advanced Settings */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-card-hover transition-colors"
          onClick={() => setAdvOpen((o) => !o)}
        >
          <div>
            <span className="text-xs font-semibold text-text-secondary">Advanced Settings</span>
            {!advOpen && (
              <p className="text-[10px] text-text-muted mt-0.5">Rates, tax, LTCG — smart defaults pre-filled</p>
            )}
          </div>
          <span className="text-text-muted text-base flex-shrink-0 ml-2 leading-none">{advOpen ? '−' : '+'}</span>
        </button>

        {advOpen && (
          <div className="px-4 pb-5 border-t border-border flex flex-col gap-5">
            <div className="pt-4">
              <SliderInput
                label="FD Interest Rate"
                value={inputs.fdStartRate}
                onChange={set('fdStartRate')}
                min={0.04} max={0.10} step={0.001}
                tooltip={TOOLTIPS.fdStartRate}
              />
            </div>
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary flex items-center">
                Your Income Tax Slab
                <Tooltip text={TOOLTIPS.taxSlab} />
              </label>
              <p className="text-[10px] text-text-muted">Applied on FD interest income</p>
              <select
                className="bg-[#f8faff] border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-fd shadow-sm"
                value={inputs.taxSlab}
                onChange={(e) => set('taxSlab')(parseFloat(e.target.value))}
              >
                <option value={0}>0% — below exemption / no tax</option>
                <option value={0.05}>5% slab</option>
                <option value={0.20}>20% slab</option>
                <option value={0.30}>30% slab</option>
              </select>
            </div>

            <div className="h-px bg-border" />

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
                    className="w-full bg-[#f8faff] border border-border rounded-xl pl-7 pr-3 py-2 num text-sm text-text-primary focus:outline-none focus:border-accent-fd shadow-sm"
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
                  style={{
                    background: `linear-gradient(to right, ${SLIDER_FILLED} 0%, ${SLIDER_FILLED} ${((inputs.fdFloor - 0.04) / 0.03) * 100}%, ${SLIDER_UNFILLED} ${((inputs.fdFloor - 0.04) / 0.03) * 100}%, ${SLIDER_UNFILLED} 100%)`,
                  }}
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
          </div>
        )}
      </div>
    </div>
  )
}
