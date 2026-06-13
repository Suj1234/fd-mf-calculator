import { useState } from 'react'
import { formatDuration, formatCompact } from '../logic/formatters'
import { phaseHealthColor as getPhaseColor } from '../logic/colors'

export default function PhaseTimeline({ phases, perpetual, currentAge = 0 }) {
  const [tooltip, setTooltip] = useState(null)
  const totalMonths = phases.reduce((s, p) => s + p.fdMonths, 0) || 1
  const totalYears = totalMonths / 12

  const ageAt = (monthIdx) => Math.round(currentAge + monthIdx / 12)

  // Legend: show each phase > 6 months individually; group ≤ 6 months
  const longPhases  = phases.filter((p) => p.fdMonths > 6 || p.perpetual)
  const shortPhases = phases.filter((p) => p.fdMonths <= 6 && !p.perpetual)

  // Insight callout: first phase duration and where decline starts
  const firstPhase = phases[0]
  const firstYears  = firstPhase ? (firstPhase.fdMonths / 12).toFixed(1) : 0
  const declinePhase = phases.findIndex((p, i) => i > 0 && p.fdMonths < 12)
  const calloutText = firstPhase && !perpetual
    ? `Your corpus is healthy for the first ~${firstYears} years (Phase 1)${declinePhase > 0 ? `, then phases shorten from Phase ${declinePhase + 1} onward as the FD corpus shrinks with each cycle` : ''}.`
    : null

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Lifecycle Timeline</h3>
        <p className="text-[11px] text-text-muted mt-0.5">Each block = one FD cycle. Color shows phase health: green = long, red = short.</p>
      </div>

      {/* Bar with tooltip */}
      <div className="relative">
        {tooltip && (
          <div
            className="absolute -top-2 z-10 bg-[#0f172a] text-white text-[10px] px-3 py-2 rounded-lg pointer-events-none whitespace-nowrap shadow-card-md -translate-y-full"
            style={
              tooltip.anchor === 'left'
                ? { left: 0, transform: 'translateY(-100%)' }
                : tooltip.anchor === 'right'
                ? { right: 0, left: 'auto', transform: 'translateY(-100%)' }
                : { left: `${tooltip.leftPct}%`, transform: 'translateX(-50%) translateY(-100%)' }
            }
          >
            <div className="font-bold mb-0.5">
              Phase {tooltip.phase.phase} · {tooltip.phase.perpetual ? 'Perpetual' : formatDuration(tooltip.phase.fdMonths)}
            </div>
            {currentAge > 0 && !tooltip.phase.perpetual && (
              <div className="text-white/70">Ages {ageAt(tooltip.phase.globalStart - 1)}–{ageAt(tooltip.phase.globalEnd)}</div>
            )}
            <div className="text-white/70">FD opened: {formatCompact(tooltip.phase.fdPrincipal)}</div>
            <div className="text-white/70">MF at start: {formatCompact(tooltip.phase.mfStart)}</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0f172a]" />
          </div>
        )}

        <div className="flex rounded-lg overflow-hidden h-10 w-full">
          {phases.map((phase, i) => {
            const pct = (phase.fdMonths / totalMonths) * 100
            const color = getPhaseColor(phase.fdMonths, phase.perpetual)
            const isLast = i === phases.length - 1
            const cumulativePct = phases.slice(0, i).reduce((s, p) => s + (p.fdMonths / totalMonths) * 100, 0)
            const midPct = cumulativePct + pct / 2

            return (
              <div
                key={i}
                className="relative flex items-center justify-center cursor-default transition-all hover:brightness-110"
                style={{ width: `${pct}%`, backgroundColor: color, minWidth: pct < 2 ? '3px' : undefined }}
                onMouseEnter={() => setTooltip({
                  phase,
                  leftPct: midPct,
                  anchor: midPct < 25 ? 'left' : midPct > 75 ? 'right' : 'center',
                })}
                onMouseLeave={() => setTooltip(null)}
                onTouchStart={() => setTooltip({
                  phase,
                  leftPct: midPct,
                  anchor: midPct < 25 ? 'left' : midPct > 75 ? 'right' : 'center',
                })}
                onTouchEnd={() => setTimeout(() => setTooltip(null), 1800)}
              >
                {/* Phase label: inside block if wide enough */}
                {pct > 6 && (
                  <span className="text-white text-xs font-semibold truncate px-1 select-none drop-shadow">
                    {isLast && perpetual ? '∞' : `P${phase.phase}`}
                  </span>
                )}
                {/* Duration inside block on larger blocks */}
                {pct > 14 && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-white/70 text-[9px] font-medium select-none whitespace-nowrap drop-shadow">
                    {phase.perpetual ? '∞' : formatDuration(phase.fdMonths)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Age axis — anchors the timeline to the user's life (P16) */}
      {currentAge > 0 && !perpetual && (
        <div className="flex justify-between text-[10px] text-text-muted -mt-1">
          <span>Now · age {currentAge}</span>
          <span>Age {Math.round(currentAge + totalYears)} ↓ corpus runs out</span>
        </div>
      )}

      {/* Legend — only phases > 6 months individually; short phases grouped */}
      <div className="flex gap-x-4 gap-y-1 flex-wrap">
        {longPhases.map((phase) => (
          <div key={phase.phase} className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0"
              style={{ backgroundColor: getPhaseColor(phase.fdMonths, phase.perpetual) }}
            />
            <span>P{phase.phase}: {phase.perpetual ? '∞ Perpetual' : formatDuration(phase.fdMonths)}</span>
          </div>
        ))}
        {shortPhases.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0 bg-red-400" />
            <span>
              {shortPhases.length === 1
                ? `P${shortPhases[0].phase}: ${formatDuration(shortPhases[0].fdMonths)} (nearing depletion)`
                : `P${shortPhases[0].phase}–P${shortPhases[shortPhases.length - 1].phase}: each under 6 months (corpus nearing depletion)`}
            </span>
          </div>
        )}
      </div>

      {/* Callout */}
      {calloutText && (
        <div className="bg-[#f0f9f4] border border-emerald-100 rounded-lg px-3.5 py-2.5">
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            <span className="font-semibold">💡 </span>{calloutText}
          </p>
        </div>
      )}
    </div>
  )
}
