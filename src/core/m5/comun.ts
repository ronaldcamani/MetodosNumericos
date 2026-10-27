/** Enfriamiento de un servidor: T′ = −k (T − Tₐ), T(0) = T₀, con el tiempo en minutos y las temperaturas en °C. */
export interface Enfriamiento {
  /** Temperatura inicial T(0) (°C). */
  T0: number
  /** Temperatura ambiente Tₐ (°C). */
  Ta: number
  /** Constante de enfriamiento k > 0 (1/min). */
  k: number
  /** Tiempo final (min). */
  tf: number
}

export type MetodoEDO = 'euler' | 'rk4'

export const LIMITES_M5 = { maxAbs: 1e4, kMax: 10, tfMax: 1000, maxPasos: 10000, hMin: 1e-6 } as const

/** Caso de partida de la guía: T′ = −0.5 (T − 20), T(0) = 80 °C, hasta 2 min. */
export const CASO_ENFRIAMIENTO: Enfriamiento = { T0: 80, Ta: 20, k: 0.5, tf: 2 }

/** Lado derecho de la ecuación: f(T) = −k (T − Tₐ). */
export const derivada = ({ Ta, k }: Enfriamiento, T: number): number => -k * (T - Ta)

/** Solución exacta T(t) = Tₐ + (T₀ − Tₐ) e^(−kt). */
export const exacta = ({ T0, Ta, k }: Enfriamiento, t: number): number => Ta + (T0 - Ta) * Math.exp(-k * t)

/** Devuelve el mensaje de error o null si los parámetros son válidos. */
export function validarEnfriamiento({ T0, Ta, k, tf }: Enfriamiento): string | null {
  if (![T0, Ta, k, tf].every(Number.isFinite)) return 'Todos los parámetros deben ser números finitos.'
  if (Math.abs(T0) > LIMITES_M5.maxAbs || Math.abs(Ta) > LIMITES_M5.maxAbs) return `Las temperaturas deben estar en [−${LIMITES_M5.maxAbs}, ${LIMITES_M5.maxAbs}] °C.`
  if (!(k > 0) || k > LIMITES_M5.kMax) return `La constante de enfriamiento k debe cumplir 0 < k ≤ ${LIMITES_M5.kMax} (1/min).`
  if (!(tf > 0) || tf > LIMITES_M5.tfMax) return `El tiempo final debe cumplir 0 < t ≤ ${LIMITES_M5.tfMax} min.`
  return null
}
