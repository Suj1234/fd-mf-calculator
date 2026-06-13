import { useState } from 'react'
import { formatDuration } from '../logic/formatters'
import PhaseCard from './PhaseCard'

// Cycles this short (and non-perpetual) get folded into a single summary row —
// the "corpus nearly depleted" tail of 1–4 month micro-cycles that otherwise
// add a dozen near-identical cards. (Blueprint Problem 7.)
const MICRO_MONTHS = 6

export default function PhaseCardList({ phases, baseWithdrawal, scenarioKey }) {
  const [expandMicro, setExpandMicro] = useState(false)

  // Micro-cycles only cluster at the tail (cycles keep shrinking to depletion),
  // so split into a leading "meaningful" run and a trailing "micro" run.
  let splitAt = phases.length
  for (let i = 0; i < phases.length; i++) {
    if (!phases[i].perpetual && phases[i].fdMonths <= MICRO_MONTHS) {
      splitAt = i
      break
    }
  }
  const meaningful = phases.slice(0, splitAt)
  const micro = phases.slice(splitAt)

  const microMonths = micro.reduce((s, p) => s + p.fdMonths, 0)

  return (
    <div className="flex flex-col gap-2">
      {meaningful.map((phase, i) => (
        <PhaseCard
          key={`${scenarioKey}-${i}`}
          phase={phase}
          baseWithdrawal={baseWithdrawal}
        />
      ))}

      {micro.length > 0 && (
        expandMicro ? (
          <>
            {micro.map((phase, i) => (
              <PhaseCard
                key={`${scenarioKey}-m-${i}`}
                phase={phase}
                index={meaningful.length + i}
                baseWithdrawal={baseWithdrawal}
              />
            ))}
            <button
              type="button"
              onClick={() => setExpandMicro(false)}
              className="self-start text-xs text-accent-fd hover:underline px-1 py-1"
            >
              Collapse final {micro.length} micro-cycles
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setExpandMicro(true)}
            className="text-left bg-card rounded-2xl border border-border overflow-hidden shadow-card hover:bg-card-hover transition-colors p-4"
            style={{ borderLeft: '3px solid #dc2626' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 bg-accent-tax">
                ⚠
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-text-primary">
                  Cycles {micro[0].phase}–{micro[micro.length - 1].phase}: corpus near depletion
                </div>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {micro.length} remaining micro-cycles lasting 1–{MICRO_MONTHS} months each ·
                  combined duration {formatDuration(microMonths)}.
                </p>
                <span className="inline-block mt-2 text-xs text-accent-fd font-medium">
                  Expand all {micro.length} →
                </span>
              </div>
            </div>
          </button>
        )
      )}
    </div>
  )
}
