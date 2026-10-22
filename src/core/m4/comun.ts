export const LIMITES_M4 = { maxN: 1000, maxAbs: 1e6 } as const

/** Tasa cuadrática r(t) = a·t² + b·t + c (MB/s con t en segundos). */
export interface Tasa {
  a: number
  b: number
  c: number
}

export type MetodoIntegral = 'trapecio' | 'simpson'

export interface EntradaIntegral {
  tasa: Tasa
  /** Extremo inferior del intervalo (s). */
  inicio: number
  /** Extremo superior del intervalo (s). */
  fin: number
  /** Número de subintervalos. */
  n: number
}

export const evaluarTasa = ({ a, b, c }: Tasa, t: number): number => (a * t + b) * t + c

/** Integral exacta de la tasa en [inicio, fin]: a(β³−α³)/3 + b(β²−α²)/2 + c(β−α). */
export function integralExacta({ a, b, c }: Tasa, inicio: number, fin: number): number {
  return (a * (fin ** 3 - inicio ** 3)) / 3 + (b * (fin ** 2 - inicio ** 2)) / 2 + c * (fin - inicio)
}

/** Mínimo de la tasa en el intervalo: extremos y, si cae dentro y a > 0, el vértice. */
export function minimoTasa(tasa: Tasa, inicio: number, fin: number): number {
  const candidatos = [evaluarTasa(tasa, inicio), evaluarTasa(tasa, fin)]
  if (tasa.a !== 0) {
    const v = -tasa.b / (2 * tasa.a)
    if (v > inicio && v < fin) candidatos.push(evaluarTasa(tasa, v))
  }
  return Math.min(...candidatos)
}

/** Devuelve el mensaje de error o null si la entrada es válida para el método. */
export function validarEntrada({ tasa, inicio, fin, n }: EntradaIntegral, metodo: MetodoIntegral): string | null {
  const valores = [tasa.a, tasa.b, tasa.c, inicio, fin]
  if (!valores.every(Number.isFinite)) return 'Los coeficientes y los extremos deben ser números finitos.'
  if (valores.some((v) => Math.abs(v) > LIMITES_M4.maxAbs)) return `Los coeficientes y los extremos deben estar en [−${LIMITES_M4.maxAbs}, ${LIMITES_M4.maxAbs}].`
  if (!(inicio < fin)) return 'El extremo inferior debe ser menor que el superior (el dominio es [inicio, fin] con inicio < fin).'
  if (!Number.isInteger(n) || n < 1) return `n debe ser un entero positivo (n ≥ 1). Con n = ${n} no hay ninguna partición del intervalo.`
  if (n > LIMITES_M4.maxN) return `n debe ser a lo sumo ${LIMITES_M4.maxN}.`
  if (metodo === 'simpson' && n % 2 !== 0) {
    return `Simpson 1/3 exige n par: ajusta una parábola por cada tres nodos consecutivos, es decir, agrupa los subintervalos de dos en dos. Con n = ${n} sobra un subintervalo; usa n = ${n - 1} o n = ${n + 1}.`
  }
  return null
}
