import { useState } from 'react'
import { formatDuration } from '../logic/formatters'

const PHASE_COLORS = [
  '#4f46e5', '#059669', '#d97706', '#0891b2', '#7c3aed',
  '#ea580c', '#db2777', '#0d9488', '#65a30d', '#6d28d9',
]

export default function PhaseTimeline({ phases, perpetual }) {
  const [tooltip, setTooltip] = useState(null) // { text, leftPct }
  const totalMonths = phases.reduce((s, p) => s + p.fdMonths, 0) || 1

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Lifecycle Timeline</h3>
        <p className="text-[10px] text-text-muted mt-0.5">Each block = one FD cycle. Hover to see duration.</p>
      </div>

      {/* Bar with tooltip */}
      <div className="relative">
        {tooltip && (
          <div
            className="absolute -top-8 z-10 bg-[#0f172a] text-white text-[10px] font-medium px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap shadow-card-md"
            style={{ left: `${tooltip.leftPct}%`, transform: 'translateX(-50%)' }}
          >
            {tooltip.text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0f172a]" />
          </div>
        )}

        <div className="flex rounded-lg overflow-hidden h-10 w-full">
          {phases.map((phase, i) => {
            const pct = (phase.fdMonths / totalMonths) * 100
            const color = PHASE_COLORS[i % PHASE_COLORS.length]
            const isLast = i === phases.length - 1
            const cumulativePct = phases.slice(0, i).reduce((s, p) => s + (p.fdMonths / totalMonths) * 100, 0)
            const midPct = cumulativePct + pct / 2

            return (
              <div
                key={i}
                className="relative flex items-center justify-center cursor-default transition-all hover:brightness-110"
                style={{ width: `${pct}%`, backgroundColor: color, minWidth: pct < 2 ? '3px' : undefined }}
                onMouseEnter={() => setTooltip({
                  text: `Phase ${phase.phase}: ${phase.perpetual ? '∞ Perpetual' : formatDuration(phase.fdMonths)}`,
                  leftPct: Math.min(95, Math.max(5, midPct)),
                })}
                onMouseLeave={() => setTooltip(null)}
              >
                {pct > 8 && (
                  <span className="text-white text-xs font-semibold truncate px-1 select-none drop-shadow">
                    {isLast && perpetual ? '∞' : `P${phase.phase}`}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-x-4 gap-y-1 flex-wrap">
        {phases.map((phase, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0"
              style={{ backgroundColor: PHASE_COLORS[i % PHASE_COLORS.length] }}
            />
            <span>P{phase.phase}: {phase.perpetual ? '∞ Perpetual' : formatDuration(phase.fdMonths)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
