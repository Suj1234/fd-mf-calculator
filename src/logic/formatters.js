// Indian number system formatting
export function formatINR(amount, decimals = 0) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0'
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  const fixed = abs.toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')
  const digits = intPart.replace(/^0+/, '') || '0'
  let result = ''
  const len = digits.length
  if (len <= 3) {
    result = digits
  } else {
    result = digits.slice(-3)
    let rem = digits.slice(0, -3)
    while (rem.length > 2) {
      result = rem.slice(-2) + ',' + result
      rem = rem.slice(0, -2)
    }
    result = rem + ',' + result
  }
  return sign + '₹' + result + (decPart !== undefined ? '.' + decPart : '')
}

export function formatCompact(amount) {
  if (!amount && amount !== 0) return '₹0'
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 10000000) return sign + '₹' + (abs / 10000000).toFixed(2) + ' Cr'
  if (abs >= 100000) return sign + '₹' + (abs / 100000).toFixed(2) + 'L'
  if (abs >= 1000) return sign + '₹' + (abs / 1000).toFixed(1) + 'K'
  return sign + '₹' + abs.toFixed(0)
}

export function formatDuration(months) {
  if (!months || months <= 0) return '0 mo'
  const yrs = Math.floor(months / 12)
  const mo = months % 12
  if (yrs === 0) return `${mo} mo`
  if (mo === 0) return `${yrs} yr`
  return `${yrs} yr ${mo} mo`
}

export function formatPct(value, decimals = 1) {
  return (value * 100).toFixed(decimals) + '%'
}

// Parse raw string into number, removing commas and ₹
export function parseAmount(str) {
  if (typeof str === 'number') return str
  return parseFloat(String(str).replace(/[₹,\s]/g, '')) || 0
}

// Show compact hint below input (e.g. "= ₹1.50 Cr")
export function amountHint(val) {
  if (!val || val < 1000) return ''
  return '= ' + formatCompact(val)
}
