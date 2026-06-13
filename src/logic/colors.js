// ─── Semantic health colors ────────────────────────────────────────────────
// One source of truth for "how healthy is this FD cycle" coloring, shared by
// the timeline bar and the cycle cards so the page reads consistently.
//
// Green  → long, healthy cycle
// Amber  → moderate
// Red    → short, corpus nearing depletion

export function phaseHealthColor(months, isPerpetual) {
  if (isPerpetual) return '#059669'    // emerald-600
  if (months >= 72) return '#059669'   // 6+ yr   → deep green
  if (months >= 36) return '#34d399'   // 3–6 yr  → medium green
  if (months >= 12) return '#d97706'   // 1–3 yr  → amber
  if (months >= 6)  return '#ea580c'   // 6–12 mo → orange
  if (months >= 2)  return '#dc2626'   // 2–6 mo  → red
  return '#7f1d1d'                      // < 2 mo  → dark red
}

// Coarser 3-band classification used for badges / labels.
export function phaseHealthZone(months, isPerpetual) {
  if (isPerpetual || months >= 36) return 'healthy'
  if (months >= 12) return 'moderate'
  return 'caution'
}
