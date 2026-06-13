// Tabbed results panel (Problem 2). All panels stay mounted — inactive ones are
// hidden via CSS, not unmounted — so: (1) state survives tab switches (expanded
// cycles, what-if levers), and (2) the print stylesheet can reveal every panel
// so the PDF report stays complete.
export default function ResultTabs({ active, onChange, tabs }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="no-print flex gap-1 bg-[#e8edf8] border border-border rounded-xl p-1 sticky top-[56px] z-30">
        {tabs.map((t) => {
          const isActive = active === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive ? 'bg-card text-text-primary shadow-card' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <span aria-hidden>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Panels */}
      {tabs.map((t) => (
        <section
          key={t.key}
          className={`result-panel ${active === t.key ? '' : 'hidden'}`}
        >
          {t.printTitle && (
            <h2 className="print-only" style={{ fontSize: '15px', fontWeight: 700, margin: '18px 0 10px' }}>
              {t.printTitle}
            </h2>
          )}
          {t.content}
        </section>
      ))}
    </div>
  )
}
