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
        {/* Active scenario indicator — shows which scenario is active when ScenarioToggle has scrolled out of view */}
        {activeScenario && (
          <div className="flex-shrink-0 flex items-center gap-1.5 pl-2.5 ml-0.5 border-l border-border/60 cursor-default select-none">
            <span className="text-[9px] text-text-muted/50 uppercase tracking-wide hidden sm:inline flex-shrink-0">Viewing:</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg whitespace-nowrap ${
                activeScenario === 'B'
                  ? 'bg-accent-mf/15 text-accent-mf'
                  : 'bg-accent-fd/15 text-accent-fd'
              }`}
              title={activeScenario === 'B' ? 'Inflation-Adjusted: withdrawal rises with inflation each year (recommended)' : 'Fixed Withdrawal: same rupee amount every month'}
            >
              {activeScenario === 'B' ? '★ Inflation-Adj' : 'Fixed WD'}
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
