import type { ResultadoMetodo } from '../tipos'
import { evaluarTasa, type Tasa } from './comun'
import { derivacionCentral } from './integracion'

export type IdDerivable = 'tasa' | 'seno' | 'exponencial'

export interface Derivable {
  id: IdDerivable
  nombre: string
  expresion: string
  f: (t: number) => number
  /** Derivada exacta, solo para medir el error de las aproximaciones. */
  df: (t: number) => number
}

export const NOMBRES_DERIVABLE: Record<IdDerivable, string> = {
  tasa: 'Tasa r(t) = a·t² + b·t + c',
  seno: 'Seno: r(t) = sen t',
  exponencial: 'Exponencial: r(t) = eᵗ',
}

export function crearDerivable(id: IdDerivable, tasa: Tasa = { a: 1, b: 0, c: 1 }): Derivable {
  if (id === 'seno') return { id, nombre: NOMBRES_DERIVABLE[id], expresion: 'sen t', f: Math.sin, df: Math.cos }
  if (id === 'exponencial') return { id, nombre: NOMBRES_DERIVABLE[id], expresion: 'eᵗ', f: Math.exp, df: Math.exp }
  return { id, nombre: NOMBRES_DERIVABLE[id], expresion: `${tasa.a}t² + ${tasa.b}t + ${tasa.c}`, f: (t) => evaluarTasa(tasa, t), df: (t) => 2 * tasa.a * t + tasa.b }
}

export const LIMITES_DERIVACION = { hMin: 1e-12, hMax: 10, niveles: 6, maxAbs: 1e3 } as const

/** Diferencia progresiva (f(t+h) − f(t))/h: error O(h). */
export const derivacionProgresiva = (f: (t: number) => number, t: number, h: number): number => (f(t + h) - f(t)) / h
/** Diferencia regresiva (f(t) − f(t−h))/h: error O(h). */
export const derivacionRegresiva = (f: (t: number) => number, t: number, h: number): number => (f(t) - f(t - h)) / h

export interface PasoDerivada {
  h: number
  central: number
  progresiva: number
  errorCentral: number
  errorProgresiva: number
  /** Cociente entre el error del paso anterior y este (≈ 4 si el error es O(h²), ≈ 2 si es O(h)); null en el primero o si el error es 0. */
  razonCentral: number | null
  razonProgresiva: number | null
}

export interface SalidaDerivada {
  exacta: number
  central: number
  progresiva: number
  regresiva: number
  errorCentral: number
  errorProgresiva: number
  errorRegresiva: number
  advertencias: string[]
}

const razon = (previo: number | undefined, actual: number) => (previo === undefined || actual === 0 || previo === 0 ? null : previo / actual)

/** Aproximaciones de f′(t) con paso h y con h/2, h/4, …: el cociente entre errores revela el orden. */
export function aproximarDerivada({ derivable, t, h }: { derivable: Derivable; t: number; h: number }): ResultadoMetodo<SalidaDerivada, PasoDerivada> {
  const inv = (mensaje: string): ResultadoMetodo<SalidaDerivada, PasoDerivada> => ({ estado: 'invalido', mensaje, resultado: null, pasos: [] })
  if (![t, h].every(Number.isFinite) || Math.abs(t) > LIMITES_DERIVACION.maxAbs) return inv(`t debe ser un número finito en [−${LIMITES_DERIVACION.maxAbs}, ${LIMITES_DERIVACION.maxAbs}].`)
  if (h < LIMITES_DERIVACION.hMin || h > LIMITES_DERIVACION.hMax) return inv(`El paso h debe estar en [${LIMITES_DERIVACION.hMin}, ${LIMITES_DERIVACION.hMax}].`)
  const { f, df } = derivable
  const exacta = df(t)
  if (![f(t - h), f(t), f(t + h), exacta].every(Number.isFinite)) return inv('La función no es finita en alguno de los puntos t − h, t o t + h.')
  const pasos: PasoDerivada[] = []
  for (let i = 0; i < LIMITES_DERIVACION.niveles; i++) {
    const hi = h / 2 ** i
    const central = derivacionCentral(f, t, hi)
    const progresiva = derivacionProgresiva(f, t, hi)
    const errorCentral = Math.abs(central - exacta)
    const errorProgresiva = Math.abs(progresiva - exacta)
    const previo = pasos[pasos.length - 1]
    pasos.push({ h: hi, central, progresiva, errorCentral, errorProgresiva, razonCentral: razon(previo?.errorCentral, errorCentral), razonProgresiva: razon(previo?.errorProgresiva, errorProgresiva) })
  }
  const central = derivacionCentral(f, t, h)
  const progresiva = derivacionProgresiva(f, t, h)
  const regresiva = derivacionRegresiva(f, t, h)
  const advertencias: string[] = []
  if (h < 1e-5) advertencias.push('Con h tan pequeño f(t + h) y f(t − h) casi coinciden: al restarlos se pierden cifras (cancelación) y el error de redondeo domina sobre el de truncamiento.')
  if (derivable.id === 'tasa' && pasos[0].errorCentral < 1e-9 * Math.max(1, Math.abs(exacta))) advertencias.push('La diferencia central es exacta para polinomios de grado ≤ 2: aquí el error que ves es solo de redondeo.')
  return {
    estado: 'ok',
    mensaje: `f′(${t}) ≈ ${central} con diferencia central y h = ${h} (valor exacto ${exacta}).`,
    resultado: { exacta, central, progresiva, regresiva, errorCentral: Math.abs(central - exacta), errorProgresiva: Math.abs(progresiva - exacta), errorRegresiva: Math.abs(regresiva - exacta), advertencias },
    pasos,
  }
}
