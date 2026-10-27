import type { ResultadoMetodo } from '../tipos'
import { cifrasSignificativas, type ModoRedondeo } from './decimal'

export const LIMITES_ERRORES = { tMin: 1, tMax: 12, maxAbs: 1e9, maxLista: 6, maxTerminos: 30 } as const

export type Operacion = '+' | '−' | '×' | '÷'

export interface SalidaOperacion {
  aRed: number
  bRed: number
  /** Resultado con aritmética exacta (precisión doble) de los datos sin redondear. */
  exacto: number
  /** Resultado de operar los datos redondeados y redondear el resultado a t cifras. */
  calculado: number
  absoluto: number
  relativo: number | null
}

const aplicar = (a: number, op: Operacion, b: number) => (op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b)

function validarT(t: number): string | null {
  return Number.isInteger(t) && t >= LIMITES_ERRORES.tMin && t <= LIMITES_ERRORES.tMax ? null : `Las cifras significativas t deben ser un entero entre ${LIMITES_ERRORES.tMin} y ${LIMITES_ERRORES.tMax}.`
}

const invalido = <R,>(mensaje: string): ResultadoMetodo<R, never> => ({ estado: 'invalido', mensaje, resultado: null, pasos: [] })

/** Una operación en aritmética de t cifras: se redondean (o truncan) los operandos y el resultado. */
export function operarConPrecision({ a, op, b, t, modo }: { a: number; op: Operacion; b: number; t: number; modo: ModoRedondeo }): ResultadoMetodo<SalidaOperacion, never> {
  const errT = validarT(t)
  if (errT) return invalido(errT)
  if (![a, b].every(Number.isFinite) || Math.abs(a) > LIMITES_ERRORES.maxAbs || Math.abs(b) > LIMITES_ERRORES.maxAbs) return invalido(`Los operandos deben ser números finitos en [−${LIMITES_ERRORES.maxAbs}, ${LIMITES_ERRORES.maxAbs}].`)
  if (op === '÷' && b === 0) return invalido('No se puede dividir entre 0.')
  const aRed = cifrasSignificativas(a, t, modo)
  const bRed = cifrasSignificativas(b, t, modo)
  if (op === '÷' && bRed === 0) return invalido('El divisor se redondea a 0 con t cifras.')
  const exacto = aplicar(a, op, b)
  const calculado = cifrasSignificativas(aplicar(aRed, op, bRed), t, modo)
  const absoluto = Math.abs(exacto - calculado)
  const relativo = exacto === 0 ? null : absoluto / Math.abs(exacto)
  return { estado: 'ok', mensaje: `Con t = ${t} cifras (${modo}): ${aRed} ${op} ${bRed} = ${calculado}; valor exacto ${exacto}.`, resultado: { aRed, bRed, exacto, calculado, absoluto, relativo }, pasos: [] }
}

export interface PasoSuma {
  k: number
  sumando: number
  sumandoRed: number
  /** Suma parcial después de redondear a t cifras. */
  parcial: number
}

export interface SalidaSuma {
  orden: PasoSuma[]
  ordenCreciente: PasoSuma[]
  exacta: number
  resultadoOrden: number
  resultadoCreciente: number
  errorOrden: number
  errorCreciente: number
}

function sumarSecuencia(valores: number[], t: number, modo: ModoRedondeo): PasoSuma[] {
  let parcial = 0
  return valores.map((v, i) => {
    const sumandoRed = cifrasSignificativas(v, t, modo)
    parcial = cifrasSignificativas(parcial + sumandoRed, t, modo)
    return { k: i + 1, sumando: v, sumandoRed, parcial }
  })
}

/** Suma de izquierda a derecha en t cifras, en el orden dado y en orden creciente de |valor|: el orden altera el error. */
export function sumaConPrecision({ valores, t, modo }: { valores: number[]; t: number; modo: ModoRedondeo }): ResultadoMetodo<SalidaSuma, never> {
  const errT = validarT(t)
  if (errT) return invalido(errT)
  if (valores.length < 2 || valores.length > LIMITES_ERRORES.maxLista) return invalido(`Se requieren entre 2 y ${LIMITES_ERRORES.maxLista} números.`)
  if (!valores.every((v) => Number.isFinite(v) && Math.abs(v) <= LIMITES_ERRORES.maxAbs)) return invalido(`Los valores deben ser números finitos en [−${LIMITES_ERRORES.maxAbs}, ${LIMITES_ERRORES.maxAbs}].`)
  const orden = sumarSecuencia(valores, t, modo)
  const ordenCreciente = sumarSecuencia([...valores].sort((p, q) => Math.abs(p) - Math.abs(q)), t, modo)
  // Suma «exacta» con compensación de Kahan para no contaminar la referencia con el error de doble precisión.
  let s = 0
  let c = 0
  for (const v of valores) {
    const y = v - c
    const tt = s + y
    c = tt - s - y
    s = tt
  }
  const resultadoOrden = orden[orden.length - 1].parcial
  const resultadoCreciente = ordenCreciente[ordenCreciente.length - 1].parcial
  return {
    estado: 'ok',
    mensaje: `Suma exacta ${s}; en el orden dado ${resultadoOrden}; en orden creciente ${resultadoCreciente}.`,
    resultado: { orden, ordenCreciente, exacta: s, resultadoOrden, resultadoCreciente, errorOrden: Math.abs(s - resultadoOrden), errorCreciente: Math.abs(s - resultadoCreciente) },
    pasos: [],
  }
}
