import { useState } from 'react'
import { DEFAULT_INPUTS, TOOLTIPS } from '../logic/defaults'
import { formatCompact } from '../logic/formatters'

// Light-theme slider track colors
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
            className="w-14 bg-[#f8faff] border border-border rounded-lg px-2 py-1 num text-xs text-right text-text-primary focus:outline-none focus:border-accent-fd focus:ring-1 focus:ring-accent-fd/20"
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

// Proper iOS-style toggle
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

  return (
    <div className="flex flex-col gap-3">

      <div className="px-1">
        <h2 className="text-sm font-bold text-text-primary">Your Corpus</h2>
        <p className="text-xs text-text-muted mt-0.5">Enter your total retirement savings in each instrument.</p>
      </div>

      {/* FD */}
      <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
        <CorpusInput
          label="Fixed Deposit (FD)"
          description="Total amount across all FDs you'll start with"
          value={inputs.fdAmount}
          onChange={set('fdAmount')}
          accentBorder="focus:border-accent-fd"
        />
      </div>

      {/* MF */}
      <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
        <CorpusInput
          label="Equity Mutual Fund"
          description="Total in equity MF — left to compound untouched"
          value={inputs.mfAmount}
          onChange={set('mfAmount')}
          accentBorder="focus:border-accent-mf"
        />
      </div>

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
          Scenario A keeps this exact amount every month.
          Scenario B increases it each year with inflation.
        </p>
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
              onClick={() => onChange({ ...inputs, ...DEFAULT_INPUTS, fdAmount: inputs.fdAmount, mfAmount: inputs.mfAmount, monthlyWithdrawal: inputs.monthlyWithdrawal })}
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
