/**
 * Redondeo y truncamiento a t cifras significativas sobre la representación decimal más corta del número
 * (la que se escribe: 0.3 es 0.3 y no 0.29999999999999998). El empate se resuelve «hacia arriba» (mitad hacia arriba).
 */
export type ModoRedondeo = 'redondeo' | 'truncamiento'

interface Dec {
  signo: 1 | -1
  /** Cifras sin ceros a la izquierda. */
  coef: bigint
  /** valor = signo · coef · 10^exp */
  exp: number
}

function aDec(x: number): Dec {
  const signo = x < 0 ? -1 : 1
  const [mant, e] = Math.abs(x).toString().split('e')
  const [ent, dec = ''] = mant.split('.')
  return { signo, coef: BigInt(ent + dec), exp: Number(e ?? 0) - dec.length }
}

export function cifrasSignificativas(x: number, t: number, modo: ModoRedondeo): number {
  if (!Number.isFinite(x) || x === 0) return x
  const d = aDec(x)
  const n = d.coef.toString().length
  if (n <= t) return x
  const divisor = 10n ** BigInt(n - t)
  let q = d.coef / divisor
  if (modo === 'redondeo' && (d.coef % divisor) * 2n >= divisor) q += 1n
  return Number(`${d.signo < 0 ? '-' : ''}${q}e${d.exp + n - t}`)
}
