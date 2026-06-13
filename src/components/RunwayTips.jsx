import { runwayTips } from '../logic/analysis'

export default function RunwayTips({ inputs, result }) {
  const tips = runwayTips(inputs, result)
  if (!tips.length) return null

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-5">
      <h3 className="text-sm font-semibold text-text-primary">Increase your runway</h3>
      <p className="text-[11px] text-text-muted mt-0.5">Small changes, recalculated on your actual numbers</p>

      <div className="flex flex-col gap-2 mt-3">
        {tips.map((t) => (
          <div key={t.label} className="flex items-center justify-between gap-3 bg-bg rounded-lg px-3.5 py-2.5">
            <span className="text-xs text-text-secondary leading-snug">{t.label}</span>
            <span
              className={`flex-shrink-0 num text-xs font-bold rounded-md px-2 py-1 leading-none ${
                t.strong ? 'text-white bg-accent-mf' : 'text-accent-mf bg-accent-mf/10'
              }`}
            >
              {t.gain}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
