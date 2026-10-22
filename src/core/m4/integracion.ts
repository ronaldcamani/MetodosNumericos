import { fmt } from '../formato'
import type { ResultadoMetodo } from '../tipos'
import { evaluarTasa, integralExacta, minimoTasa, validarEntrada, type EntradaIntegral, type MetodoIntegral } from './comun'

/** Un nodo de la malla con su peso y su aporte al total. */
export interface PasoNodo {
  i: number
  t: number
  r: number
  /** Peso entero del nodo: trapecio 1,2,…,2,1 · Simpson 1,4,2,4,…,4,1. */
  peso: number
  /** Aporte factor·peso·r(t). */
  contribucion: number
  sumaParcial: number
}

export interface SalidaIntegral {
  metodo: MetodoIntegral
  integral: number
  h: number
  /** Factor común: h/2 (trapecio) o h/3 (Simpson). */
  factor: number
  exacta: number
  errorAbs: number
  /** null si la integral exacta es 0. */
  errorRel: number | null
  minTasa: number
  advertencias: string[]
}

export function pesos(metodo: MetodoIntegral, n: number): number[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    if (i === 0 || i === n) return 1
    if (metodo === 'trapecio') return 2
    return i % 2 === 1 ? 4 : 2
  })
}

/** Regla compuesta sobre una malla uniforme para cualquier integrando (n ya validado). */
export function reglaCompuesta(metodo: MetodoIntegral, f: (t: number) => number, inicio: number, fin: number, n: number) {
  const h = (fin - inicio) / n
  const factor = metodo === 'trapecio' ? h / 2 : h / 3
  const w = pesos(metodo, n)
  let suma = 0
  const pasos: PasoNodo[] = w.map((peso, i) => {
    const t = i === n ? fin : inicio + i * h
    const r = f(t)
    const contribucion = factor * peso * r
    suma += contribucion
    return { i, t, r, peso, contribucion, sumaParcial: suma }
  })
  return { integral: suma, h, factor, pasos }
}

const NOMBRE = { trapecio: 'Trapecio compuesto', simpson: 'Simpson 1/3 compuesto' } as const

export function integrarTasa(metodo: MetodoIntegral, entrada: EntradaIntegral): ResultadoMetodo<SalidaIntegral, PasoNodo> {
  const error = validarEntrada(entrada, metodo)
  if (error) return { estado: 'invalido', mensaje: error, resultado: null, pasos: [] }
  const { tasa, inicio, fin, n } = entrada
  const { integral, h, factor, pasos } = reglaCompuesta(metodo, (t) => evaluarTasa(tasa, t), inicio, fin, n)
  if (!Number.isFinite(integral)) return { estado: 'no_finito', mensaje: 'El cálculo produjo un valor no finito.', resultado: null, pasos }
  const exacta = integralExacta(tasa, inicio, fin)
  const errorAbs = Math.abs(integral - exacta)
  const minTasa = minimoTasa(tasa, inicio, fin)
  const advertencias: string[] = []
  if (minTasa < 0) {
    advertencias.push(`La tasa es negativa en parte de [${inicio}, ${fin}] (mínimo ${fmt(minTasa, 6)} MB/s): un volumen transferido no puede disminuir, así que el resultado es un acumulado neto y no un volumen físico.`)
  }
  return {
    estado: 'ok',
    mensaje: `${NOMBRE[metodo]} con n = ${n} (h = ${fmt(h, 8)} s): ${fmt(integral, 10)} MB. Error absoluto frente a la integral exacta: ${fmt(errorAbs, 6)} MB.`,
    resultado: { metodo, integral, h, factor, exacta, errorAbs, errorRel: exacta !== 0 ? errorAbs / Math.abs(exacta) : null, minTasa, advertencias },
    pasos,
  }
}

/** Diferencia central (f(t+h) − f(t−h)) / (2h): aproxima f′(t) con error O(h²). */
export function derivacionCentral(f: (t: number) => number, t: number, h: number): number {
  return Number.isFinite(h) && h > 0 ? (f(t + h) - f(t - h)) / (2 * h) : NaN
}
