/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Light theme — calm, professional, trustworthy
        bg:           '#f0f4fb',   // soft blue-gray page background
        card:         '#ffffff',   // white cards
        'card-hover': '#f5f8ff',
        border:       '#dce3f0',   // subtle border

        // Accents — darker for good contrast on white
        'accent-fd':  '#4f46e5',   // indigo-600  — FD
        'accent-mf':  '#059669',   // emerald-600 — MF / positive
        'accent-wd':  '#d97706',   // amber-600   — withdrawal
        'accent-tax': '#dc2626',   // red-600     — tax / cost
        'accent-real':'#059669',   // same green  — real value

        // Text — 3 levels only
        'text-primary':   '#0f172a',   // slate-950
        'text-secondary': '#334155',   // slate-700
        'text-muted':     '#94a3b8',   // slate-400
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15,23,42,0.06), 0 1px 2px -1px rgba(15,23,42,0.04)',
        'card-md': '0 4px 12px 0 rgba(15,23,42,0.08)',
      },
    },
  },
  plugins: [],
}
