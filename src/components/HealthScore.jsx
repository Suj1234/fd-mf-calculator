import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { healthScore, withdrawalRate, swrZone } from '../logic/analysis'

const GRADE_LEGEND = [
  {
    letter: 'A',
    range: '85–100',
    label: 'Excellent',
    color: '#059669',
    headline: 'Your corpus should comfortably outlast a 30+ year retirement at this pace.',
    bullets: [
      'Withdrawal rate is within the safe 4–5% band where interest largely covers expenses',
      'No major changes needed — keep the FD/MF ratio stable and review annually',
    ],
  },
  {
    letter: 'B',
    range: '70–84',
    label: 'Good',
    color: '#059669',
    headline: 'The plan is solid, with a small gap between here and Excellent.',
    bullets: [
      'Withdrawal rate or tax drag is slightly above the ideal range, reducing long-term buffer',
      'Reducing monthly withdrawal by ₹10–15K, or shifting 10% more to MF, can push this to an A',
    ],
  },
  {
    letter: 'C',
    range: '55–69',
    label: 'Moderate',
    color: '#d97706',
    headline: 'The plan works, but has limited cushion against rate changes or emergencies.',
    bullets: [
      'A 1–2% drop in FD rates or an unplanned expense could noticeably shorten the runway',
      'Shifting 10% from FD to MF or cutting ₹10–20K/mo can add several years of runway',
    ],
  },
  {
    letter: 'D',
    range: '40–54',
    label: 'Weak',
    color: '#ea580c',
    headline: 'The corpus runs out before the 25-year safety floor, but it\'s fixable.',
    bullets: [
      'At current withdrawal, money runs out before age 85 — the standard retirement planning benchmark',
      'Even ₹20K/mo less in spending, or a 15% shift toward MF, can close most of the gap',
    ],
  },
  {
    letter: 'E',
    range: '0–39',
    label: 'Critical',
    color: '#dc2626',
    headline: 'At this pace the corpus depletes well before a full retirement horizon.',
    bullets: [
      'Withdrawal rate is significantly above what the corpus can sustain over time',
      'A major reset is needed — either a substantially lower withdrawal or a larger starting corpus',
    ],
  },
]

function GradeLegendModal({ currentLetter, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Grade Scale</h2>
            <p className="text-xs text-text-muted mt-0.5">How your retirement health score is graded</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg transition-colors text-lg leading-none flex-shrink-0 ml-4"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Grade cards — 2-col on wider screens */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GRADE_LEGEND.map((g) => {
            const isYou = currentLetter === g.letter
            return (
              <div
                key={g.letter}
                className={`rounded-xl border px-4 py-4 ${isYou ? '' : 'border-border'}`}
                style={isYou ? { borderColor: g.color + '66', backgroundColor: g.color + '08' } : {}}
              >
                {/* Grade badge + range + label + you pill */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-xs font-bold text-white rounded px-2 py-0.5 leading-none flex-shrink-0"
                    style={{ backgroundColor: g.color }}
                  >
                    {g.letter}
                  </span>
                  <span className="num text-xs text-text-muted flex-shrink-0">{g.range}</span>
                  <span className="text-xs font-semibold" style={{ color: g.color }}>{g.label}</span>
                  {isYou && (
                    <span
                      className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded text-white leading-none flex-shrink-0"
                      style={{ backgroundColor: g.color }}
                    >
                      ← you
                    </span>
                  )}
                </div>

                {/* Headline */}
                <p className="text-xs text-text-secondary leading-relaxed mb-2">{g.headline}</p>

                {/* Bullets */}
                <ul className="flex flex-col gap-1.5">
                  {g.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
                      <span className="text-xs text-text-muted leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  )
}

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
  const [showModal, setShowModal] = useState(false)
  const hs = healthScore(inputs, result)
  const rate = withdrawalRate(inputs)
  const swr = swrZone(rate)

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
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
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-[10px] text-text-muted/70 hover:text-text-secondary underline decoration-dotted transition-colors"
            >
              what does this mean?
            </button>
          </div>
          <p className="text-xs text-text-muted mt-0.5">{hs.description}</p>

          {/* Safe withdrawal rate */}
          <div className="mt-3 flex items-center justify-between gap-3 bg-bg rounded-lg px-3 py-2">
            <div className="min-w-0">
              <div className="text-[10px] text-text-muted uppercase tracking-wide">Annual withdrawal rate</div>
              <div className="text-[11px] text-text-secondary mt-0.5">
                % of total corpus withdrawn per year · safe: <span className="font-medium">4–5%</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="num text-lg font-bold" style={{ color: swr.color }}>
                {(rate * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] font-semibold" style={{ color: swr.color }}>{swr.label}</div>
              <div className="text-[9px] text-text-muted mt-0.5">per year</div>
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
            {b.hint && (
              <div className="text-[9px] text-text-muted mt-1 leading-tight">{b.hint}</div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <GradeLegendModal currentLetter={hs.letter} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
