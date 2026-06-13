import { healthScore, withdrawalRate, swrZone } from '../logic/analysis'

function Gauge({ score, color }) {
  const r = 42
  const c = 2 * Math.PI * r
  const offset = c * (1 - score / 100)
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" className="flex-shrink-0">
      <circle cx="52" cy="52" r={r} fill="none" stroke="#e8edf8" strokeWidth="9" />
      <circle
        cx="52" cy="52" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        transform="rotate(-90 52 52)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x="52" y="50" textAnchor="middle" className="num" fontSize="26" fontWeight="700" fill="#0f172a">{score}</text>
      <text x="52" y="68" textAnchor="middle" fontSize="10" fill="#94a3b8" letterSpacing="0.08em">/ 100</text>
    </svg>
  )
}

export default function HealthScore({ inputs, result }) {
  const hs = healthScore(inputs, result)
  const rate = withdrawalRate(inputs)
  const swr = swrZone(rate)

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-5">
      <div className="flex items-center gap-5">
        <Gauge score={hs.score} color={hs.color} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold" style={{ color: hs.color }}>
              {hs.label}
            </span>
            <span
              className="text-[11px] font-bold text-white rounded-md px-1.5 py-0.5 leading-none"
              style={{ backgroundColor: hs.color }}
            >
              Grade {hs.letter}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">Retirement health score</p>

          {/* Safe withdrawal rate */}
          <div className="mt-3 flex items-center justify-between gap-3 bg-bg rounded-lg px-3 py-2">
            <div className="min-w-0">
              <div className="text-[10px] text-text-muted uppercase tracking-wide">Withdrawal rate</div>
              <div className="text-[11px] text-text-secondary mt-0.5">
                Safe range for Indian retirees: <span className="font-medium">4–5%</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="num text-lg font-bold" style={{ color: swr.color }}>
                {(rate * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] font-semibold" style={{ color: swr.color }}>{swr.label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {hs.breakdown.map((b) => (
          <div key={b.label} className="bg-bg rounded-lg px-2.5 py-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] text-text-muted truncate">{b.label}</span>
              <span className="num text-[11px] font-semibold text-text-secondary">{b.got}<span className="text-text-muted">/{b.max}</span></span>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden mt-1.5">
              <div className="h-full rounded-full" style={{ width: `${(b.got / b.max) * 100}%`, backgroundColor: hs.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
