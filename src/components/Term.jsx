import { GLOSSARY } from '../logic/defaults'

// Inline jargon with a dotted underline and a hover/tap definition (P22).
// Usage: <Term k="ltcg">LTCG</Term>  — or pass an explicit def via `def`.
export default function Term({ k, def, children }) {
  const text = def || GLOSSARY[k] || ''
  return (
    <span
      className="tooltip cursor-help"
      style={{ borderBottom: '1px dotted currentColor' }}
      tabIndex={0}
    >
      {children}
      <span className="tooltip-content" style={{ textTransform: 'none', letterSpacing: 'normal', fontWeight: 400 }}>
        {text}
      </span>
    </span>
  )
}
