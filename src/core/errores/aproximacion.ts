import type { ResultadoMetodo } from '../tipos'

export interface SalidaAproximacion {
  absoluto: number
  /** null si el valor verdadero es 0 (el error relativo no está definido). */
  relativo: number | null
  porcentual: number | null
  /** Cifras significativas correctas del valor aproximado; Infinity si es exacto; null si el verdadero es 0. */
  cifras: number | null
  advertencias: string[]
}

const LIM = 1e12

/**
 * Cifras significativas correctas: el mayor n con E_abs < 0.5 · 10^(m − n + 1), donde m es el exponente de la
 * primera cifra significativa del valor verdadero (criterio de Scarborough).
 */
export function cifrasCorrectas(verdadero: number, absoluto: number): number | null {
  if (verdadero === 0) return null
  if (absoluto === 0) return Infinity
  const m = Math.floor(Math.log10(Math.abs(verdadero)))
  const n = Math.ceil(m + 1 - Math.log10(2 * absoluto)) - 1
  return Math.max(0, n)
}

export function erroresAproximacion({ verdadero, aproximado }: { verdadero: number; aproximado: number }): ResultadoMetodo<SalidaAproximacion, never> {
  if (![verdadero, aproximado].every(Number.isFinite)) return { estado: 'invalido', mensaje: 'Los valores deben ser números finitos.', resultado: null, pasos: [] }
  if (Math.abs(verdadero) > LIM || Math.abs(aproximado) > LIM) return { estado: 'invalido', mensaje: `Los valores deben estar en [−${LIM}, ${LIM}].`, resultado: null, pasos: [] }
  const absoluto = Math.abs(verdadero - aproximado)
  const advertencias: string[] = []
  const relativo = verdadero === 0 ? null : absoluto / Math.abs(verdadero)
  if (relativo === null) advertencias.push('El valor verdadero es 0: el error relativo y el porcentual no están definidos; use solo el error absoluto.')
  if (absoluto === 0) advertencias.push('El valor aproximado coincide con el verdadero (error nulo).')
  return {
    estado: 'ok',
    mensaje: `Error absoluto ${absoluto}${relativo === null ? '' : `, error relativo ${relativo}`}.`,
    resultado: { absoluto, relativo, porcentual: relativo === null ? null : relativo * 100, cifras: cifrasCorrectas(verdadero, absoluto), advertencias },
    pasos: [],
  }
}
