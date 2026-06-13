import { useState, useMemo } from 'react'
import { simulateAllPhases } from '../logic/calculator'
import { formatDuration, formatCompact } from '../logic/formatters'

function durationLabel(scenarioB) {
  return scenarioB.perpetual ? 'Self-sustaining' : formatDuration(scenarioB.totalMonths || 0)
}

function Lever({ label, value, onDec, onInc, decDisabled, incDisabled }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-text-secondary">{label}</span>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={onDec} disabled={decDisabled}
          className="w-7 h-7 rounded-lg border border-border text-text-secondary hover:bg-card-hover disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center text-base leading-none">−</button>
        <span className="num text-xs font-semibold text-text-primary w-20 text-center">{value}</span>
        <button type="button" onClick={onInc} disabled={incDisabled}
          className="w-7 h-7 rounded-lg border border-border text-text-secondary hover:bg-card-hover disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center text-base leading-none">+</button>
      </div>
    </div>
  )
}

export default function WhatIf({ inputs, baselineResult }) {
  const [dWd, setDWd] = useState(0)          // ₹ change to monthly withdrawal
  const [dFd, setDFd] = useState(0)          // change to FD fraction
  const [dCorpus, setDCorpus] = useState(0)  // ₹ change to total corpus
  const [dInf, setDInf] = useState(0)        // change to inflation rate

  const newWithdrawal = Math.max(0, inputs.monthlyWithdrawal + dWd)
  const newFdPct = Math.min(1, Math.max(0, inputs.fdPct + dFd))
  const newCorpus = Math.max(500000, inputs.totalCorpus + dCorpus)
  const newInfRate = Math.min(0.20, Math.max(0.01, inputs.inflationRate + dInf))

  const patched = useMemo(() => ({
    ...inputs,
    monthlyWithdrawal: newWithdrawal,
    fdPct: newFdPct,
    totalCorpus: newCorpus,
    fdAmount: Math.round(newCorpus * newFdPct),
    mfAmount: Math.round(newCorpus * (1 - newFdPct)),
    inflationRate: newInfRate,
  }), [inputs, newWithdrawal, newFdPct, newCorpus, newInfRate])

  const changed = dWd !== 0 || dFd !== 0 || dCorpus !== 0 || dInf !== 0
  const newResult = useMemo(() => {
    try { return simulateAllPhases(patched) } catch { return null }
  }, [patched])

  const baseB = baselineResult.scenarioB
  const newB = newResult?.scenarioB

  let deltaText = null
  let deltaPositive = true
  if (changed && newB) {
    if (newB.perpetual && !baseB.perpetual) { deltaText = 'now self-sustaining'; deltaPositive = true }
    else if (!newB.perpetual && baseB.perpetual) { deltaText = 'no longer self-sustaining'; deltaPositive = false }
    else if (!newB.perpetual && !baseB.perpetual) {
      const d = (newB.totalMonths || 0) - (baseB.totalMonths || 0)
      deltaPositive = d >= 0
      deltaText = `${d >= 0 ? '+' : '−'}${formatDuration(Math.abs(d))}`
    } else { deltaText = 'no change' }
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">What if…?</h3>
          <p className="text-[11px] text-text-muted mt-0.5">Try a change without touching your real inputs</p>
        </div>
        {changed && (
          <button type="button" onClick={() => { setDWd(0); setDFd(0); setDCorpus(0); setDInf(0) }}
            className="text-[11px] text-accent-fd hover:underline flex-shrink-0">Reset</button>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <Lever
          label="Monthly withdrawal"
          value={`${formatCompact(newWithdrawal)}/mo`}
          onDec={() => setDWd((d) => d - 10000)}
          onInc={() => setDWd((d) => d + 10000)}
          decDisabled={newWithdrawal <= 10000}
        />
        <Lever
          label="Total corpus"
          value={formatCompact(newCorpus)}
          onDec={() => setDCorpus((d) => d - 1000000)}
          onInc={() => setDCorpus((d) => d + 1000000)}
          decDisabled={newCorpus <= 500000}
        />
        <Lever
          label="FD allocation"
          value={`${Math.round(newFdPct * 100)}% FD`}
          onDec={() => setDFd((d) => d - 0.05)}
          onInc={() => setDFd((d) => d + 0.05)}
          decDisabled={newFdPct <= 0}
          incDisabled={newFdPct >= 1}
        />
        <Lever
          label="Inflation rate"
          value={`${(newInfRate * 100).toFixed(1)}%`}
          onDec={() => setDInf((d) => d - 0.005)}
          onInc={() => setDInf((d) => d + 0.005)}
          decDisabled={newInfRate <= 0.01}
          incDisabled={newInfRate >= 0.20}
        />
      </div>

      {/* Result */}
      <div className="mt-4 flex items-center justify-between gap-3 bg-bg rounded-xl px-4 py-3">
        <div className="min-w-0">
          <div className="text-[10px] text-text-muted uppercase tracking-wide">Now lasts</div>
          <div className="num text-lg font-bold text-text-primary mt-0.5">
            {newB ? durationLabel(newB) : '—'}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">was {durationLabel(baseB)}</div>
        </div>
        {deltaText && (
          <span
            className={`flex-shrink-0 num text-sm font-bold rounded-lg px-3 py-1.5 ${
              deltaPositive ? 'text-white bg-accent-mf' : 'text-white bg-accent-tax'
            }`}
          >
            {deltaText}
          </span>
        )}
      </div>
    </div>
  )
}
