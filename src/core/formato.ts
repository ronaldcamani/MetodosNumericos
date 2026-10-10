/** Redondea solo al presentar; el cálculo conserva la precisión interna. */
export function fmt(x: number | null | undefined, cifras = 6): string {
  if (x === null || x === undefined) return '—'
  if (Number.isNaN(x)) return 'NaN'
  if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞'
  if (x === 0) return '0'
  const abs = Math.abs(x)
  if (abs >= 1e6 || abs < 1e-4) return x.toExponential(Math.max(cifras - 1, 1)).replaceAll('-', '−')
  return Number(x.toFixed(cifras)).toString().replaceAll('-', '−')
}
