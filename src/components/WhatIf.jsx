import { useState, useMemo } from 'react'
import { simulateAllPhases } from '../logic/calculator'
import { formatDuration, formatCompact } from '../logic/formatters'

function durationLabel(scenarioB) {
  return scenarioB.perpetual ? 'Self-sustaining' : formatDuration(scenarioB.totalMonths || 0)
}

function Lever({ label, value, onDec, onInc, decDisabled, incDisabled }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-text-secondary min-w-0 flex-1 truncate">{label}</span>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button type="button" onClick={onDec} disabled={decDisabled}
          className="w-10 h-10 rounded-lg border border-border text-text-secondary hover:bg-card-hover disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center text-base leading-none">−</button>
        <span className="num text-xs font-semibold text-text-primary w-20 text-center">{value}</span>
        <button type="button" onClick={onInc} disabled={incDisabled}
          className="w-10 h-10 rounded-lg border border-border text-text-secondary hover:bg-card-hover disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center text-base leading-none">+</button>
      </div>
    </div>
  )
}

// Default "plan to age" when user has set their current age
function defaultTargetAge(currentAge) {
  return currentAge > 0 ? Math.min(100, currentAge + 30) : 85
}

export default function WhatIf({ inputs, baselineResult }) {
  const [dWd,        setDWd]        = useState(0)   // ₹ change to monthly withdrawal
  const [dFd,        setDFd]        = useState(0)   // change to FD fraction
  const [dCorpus,    setDCorpus]    = useState(0)   // ₹ change to total corpus
  const [dInf,       setDInf]       = useState(0)   // change to inflation rate
  const [dIncome,    setDIncome]    = useState(0)   // ₹ change to other monthly income
  const [targetAge,  setTargetAge]  = useState(() => defaultTargetAge(inputs.currentAge))

  const newWithdrawal = Math.max(0, inputs.monthlyWithdrawal + dWd)
  const newFdPct      = Math.min(1, Math.max(0, inputs.fdPct + dFd))
  const newCorpus     = Math.max(500000, inputs.totalCorpus + dCorpus)
  const newInfRate    = Math.min(0.20, Math.max(0.01, inputs.inflationRate + dInf))

  // Total year-1 other income from base streams
  const baseOtherIncome = (inputs.otherIncomeStreams || [])
    .filter(s => (s.startMonth || 0) === 0)
    .reduce((sum, s) => sum + (s.monthlyAmount || 0), 0)
  const newOtherIncome = Math.max(0, baseOtherIncome + dIncome)

  // Inject a synthetic delta stream so existing streams are untouched
  const patchedStreams = useMemo(() => {
    const base = inputs.otherIncomeStreams || []
    if (dIncome === 0) return base
    return [...base, {
      id: '_whatif_income',
      label: 'Adjustment',
      monthlyAmount: dIncome,
      inflationLinked: false,
      startMonth: 0,
      endMonth: null,
    }]
  }, [inputs.otherIncomeStreams, dIncome])

  const patched = useMemo(() => ({
    ...inputs,
    monthlyWithdrawal: newWithdrawal,
    fdPct: newFdPct,
    totalCorpus: newCorpus,
    fdAmount: Math.round(newCorpus * newFdPct),
    mfAmount: Math.round(newCorpus * (1 - newFdPct)),
    inflationRate: newInfRate,
    otherIncomeStreams: patchedStreams,
  }), [inputs, newWithdrawal, newFdPct, newCorpus, newInfRate, patchedStreams])

  const hasAge = inputs.currentAge > 0
  const targetMonths = hasAge ? (targetAge - inputs.currentAge) * 12 : null

  const changed = dWd !== 0 || dFd !== 0 || dCorpus !== 0 || dInf !== 0 || dIncome !== 0

  const newResult = useMemo(() => {
    try { return simulateAllPhases(patched) } catch { return null }
  }, [patched])

  const baseB = baselineResult.scenarioB
  const newB  = newResult?.scenarioB

  let deltaText    = null
  let deltaPositive = true
  if (changed && newB) {
    if (newB.perpetual && !baseB.perpetual) {
      deltaText = 'now self-sustaining'; deltaPositive = true
    } else if (!newB.perpetual && baseB.perpetual) {
      deltaText = 'no longer self-sustaining'; deltaPositive = false
    } else if (!newB.perpetual && !baseB.perpetual) {
      const d = (newB.totalMonths || 0) - (baseB.totalMonths || 0)
      deltaPositive = d >= 0
      deltaText = `${d >= 0 ? '+' : '−'}${formatDuration(Math.abs(d))}`
    } else {
      deltaText = 'no change'
    }
  }

  // Longevity check: does corpus outlast target age?
  let longevityLine = null
  if (hasAge && targetMonths !== null && newB) {
    const corpusMonths = newB.perpetual ? Infinity : (newB.totalMonths || 0)
    const surplusMonths = corpusMonths - targetMonths
    const ageAtDepletion = newB.perpetual ? null : Math.round(inputs.currentAge + (newB.totalMonths || 0) / 12)
    if (newB.perpetual || surplusMonths >= 0) {
      const surplusYrs = newB.perpetual ? null : Math.round(surplusMonths / 12)
      longevityLine = {
        ok: true,
        text: newB.perpetual
          ? `Covers you beyond age ${targetAge}`
          : `Covers you to age ${targetAge} (+${surplusYrs} yr surplus)`,
      }
    } else {
      const shortYrs = Math.abs(Math.round(surplusMonths / 12))
      longevityLine = {
        ok: false,
        text: `Runs out at age ${ageAtDepletion} (${shortYrs} yr short of ${targetAge})`,
      }
    }
  }

  const resetAll = () => {
    setDWd(0); setDFd(0); setDCorpus(0); setDInf(0); setDIncome(0)
    setTargetAge(defaultTargetAge(inputs.currentAge))
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">What if…?</h3>
          <p className="text-[11px] text-text-muted mt-0.5">Try a change without touching your real inputs</p>
        </div>
        {changed && (
          <button type="button" onClick={resetAll}
            className="text-[11px] text-accent-fd hover:underline flex-shrink-0">Reset</button>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <Lever
          label="Monthly withdrawal"
          value={`${formatCompact(newWithdrawal)}/mo`}
          onDec={() => setDWd(d => d - 10000)}
          onInc={() => setDWd(d => d + 10000)}
          decDisabled={newWithdrawal <= 10000}
        />
        <Lever
          label="Total corpus"
          value={formatCompact(newCorpus)}
          onDec={() => setDCorpus(d => d - 1000000)}
          onInc={() => setDCorpus(d => d + 1000000)}
          decDisabled={newCorpus <= 500000}
        />
        <Lever
          label="FD allocation"
          value={`${Math.round(newFdPct * 100)}% FD`}
          onDec={() => setDFd(d => d - 0.05)}
          onInc={() => setDFd(d => d + 0.05)}
          decDisabled={newFdPct <= 0}
          incDisabled={newFdPct >= 1}
        />
        <Lever
          label="Inflation rate"
          value={`${(newInfRate * 100).toFixed(1)}%`}
          onDec={() => setDInf(d => d - 0.005)}
          onInc={() => setDInf(d => d + 0.005)}
          decDisabled={newInfRate <= 0.01}
          incDisabled={newInfRate >= 0.20}
        />
        <Lever
          label="Other monthly income"
          value={`+${formatCompact(newOtherIncome)}/mo`}
          onDec={() => setDIncome(d => d - 5000)}
          onInc={() => setDIncome(d => d + 5000)}
          decDisabled={newOtherIncome <= 0}
        />

        {/* Plan to age — only when currentAge is set */}
        {hasAge ? (
          <Lever
            label="Plan to age"
            value={`age ${targetAge}`}
            onDec={() => setTargetAge(a => Math.max(inputs.currentAge + 1, a - 1))}
            onInc={() => setTargetAge(a => Math.min(110, a + 1))}
            decDisabled={targetAge <= inputs.currentAge + 1}
            incDisabled={targetAge >= 110}
          />
        ) : (
          <div className="flex items-center justify-between gap-3 opacity-40">
            <span className="text-xs text-text-secondary min-w-0 flex-1">Plan to age</span>
            <span className="text-[11px] text-text-muted italic">set current age above to use</span>
          </div>
        )}
      </div>

      {/* Result */}
      <div className="mt-4 bg-bg rounded-xl px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] text-text-muted uppercase tracking-wide">Now lasts</div>
            <div className="num text-lg font-bold text-text-primary mt-0.5">
              {newB ? durationLabel(newB) : '—'}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">was {durationLabel(baseB)}</div>
          </div>
          {deltaText && (
            <span className={`flex-shrink-0 num text-sm font-bold rounded-lg px-3 py-1.5 ${
              deltaPositive ? 'text-white bg-accent-mf' : 'text-white bg-accent-tax'
            }`}>
              {deltaText}
            </span>
          )}
        </div>

        {/* Longevity verdict */}
        {longevityLine && (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
            longevityLine.ok
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            <span className="flex-shrink-0 text-sm leading-none">
              {longevityLine.ok ? '✓' : '✗'}
            </span>
            <span>{longevityLine.text}</span>
          </div>
        )}
      </div>
    </div>
  )
}
