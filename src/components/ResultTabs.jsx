// Tabbed results panel. All panels stay mounted — inactive ones are
// hidden via CSS, not unmounted — so: (1) state survives tab switches (expanded
// cycles, what-if levers), and (2) the print stylesheet can reveal every panel
// so the PDF report stays complete.
export default function ResultTabs({ active, onChange, tabs, activeScenario }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="no-print flex items-center gap-1 bg-[#e8edf8] border border-border rounded-xl p-1 sticky top-[56px] z-30">
        {tabs.map((t) => {
          const isActive = active === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive ? 'bg-card text-text-primary shadow-card' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <span aria-hidden>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          )
        })}
        {/* Active scenario pill — visible when ScenarioToggle has scrolled out of view */}
        {activeScenario && (
          <div className="flex-shrink-0 flex items-center px-2 ml-0.5 border-l border-border/60">
            <span className="text-[10px] font-bold text-text-muted whitespace-nowrap">
              {activeScenario === 'B' ? '★ B' : 'A'}
            </span>
          </div>
        )}
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
