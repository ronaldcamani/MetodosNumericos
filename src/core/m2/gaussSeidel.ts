import type { ResultadoMetodo } from '../tipos'
import { LIMITES_M2, dominanciaDiagonalEstricta, esSingular, permutacionDominante, normaInf, residuo, validarSistema, type EntradaSistema } from './comun'

export interface EntradaGaussSeidel extends EntradaSistema {
  tol: number
  maxIter: number
  /** Vector inicial; por defecto el vector cero. */
  x0?: number[]
  /** Si es true y A no es dominante, reordena las ecuaciones (filas) para lograr dominancia estricta cuando exista. */
  reordenar?: boolean
}

export interface PasoGaussSeidel {
  n: number
  x: number[]
  /** ‖x_{n} − x_{n−1}‖∞ */
  cambioInf: number
  /** ‖b − A·x_n‖∞ */
  residuoInf: number
}

export interface SalidaGaussSeidel {
  x: number[]
  iteraciones: number
  residuoInf: number
  /** Condición suficiente (no necesaria) de convergencia. */
  /** Dominancia del sistema realmente resuelto (tras reordenar, si se hizo). */
  dominanciaEstricta: boolean
  /** Filas del sistema original en el orden usado (índices desde 0), o null si no se reordenó. */
  permutacion: number[] | null
  criterio: string
}

export const CRITERIO_GS = 'residuo ‖b − Ax‖∞ ≤ tolerancia'

const falla = (estado: ResultadoMetodo<never, never>['estado'], mensaje: string, pasos: PasoGaussSeidel[] = []): ResultadoMetodo<SalidaGaussSeidel, PasoGaussSeidel> => ({ estado, mensaje, resultado: null, pasos })

export function gaussSeidel(entrada: EntradaGaussSeidel): ResultadoMetodo<SalidaGaussSeidel, PasoGaussSeidel> {
  const { tol, maxIter } = entrada
  let { A, b } = entrada
  const error = validarSistema(entrada)
  if (error) return falla('invalido', error)
  if (!Number.isFinite(tol) || tol < LIMITES_M2.tolMin) return falla('invalido', `La tolerancia debe ser un número ≥ ${LIMITES_M2.tolMin}.`)
  if (!Number.isInteger(maxIter) || maxIter < 1 || maxIter > LIMITES_M2.maxIter) return falla('invalido', `El máximo de iteraciones debe ser un entero entre 1 y ${LIMITES_M2.maxIter}.`)
  const n = A.length
  const x0 = entrada.x0 ?? new Array<number>(n).fill(0)
  if (x0.length !== n || !x0.every(Number.isFinite)) return falla('invalido', 'El vector inicial no es válido.')
  if (esSingular(A)) return falla('singular', 'El determinante de A es (casi) cero: el sistema es singular y no tiene solución única; Gauss-Seidel no se ejecuta.')
  let permutacion: number[] | null = null
  let nota = ''
  if (entrada.reordenar && !dominanciaDiagonalEstricta(A)) {
    permutacion = permutacionDominante(A)
    if (permutacion) {
      const p = permutacion
      A = p.map((i) => A[i])
      b = p.map((i) => b[i])
      nota = ` Se reordenaron las ecuaciones (filas ${p.map((i) => i + 1).join(', ')} del sistema original) para obtener dominancia diagonal estricta.`
    } else nota = ' No existe un reordenamiento de filas con dominancia diagonal estricta.'
  }
  const cero = A.findIndex((f, i) => f[i] === 0)
  if (cero >= 0) return falla('singular', `El elemento diagonal a${cero + 1}${cero + 1} es cero: Gauss-Seidel no puede dividir. Reordena las ecuaciones.${nota}`)

  const dominanciaEstricta = dominanciaDiagonalEstricta(A)
  const pasos: PasoGaussSeidel[] = []
  const x = [...x0]
  for (let it = 1; it <= maxIter; it++) {
    const previo = [...x]
    for (let i = 0; i < n; i++) {
      let s = b[i]
      for (let j = 0; j < n; j++) if (j !== i) s -= A[i][j] * x[j]
      x[i] = s / A[i][i]
    }
    if (!x.every(Number.isFinite)) return falla('no_finito', `La iteración produjo valores no finitos (divergencia).${dominanciaEstricta ? '' : ' La matriz no es diagonalmente dominante; prueba a reordenar las ecuaciones.'}`, pasos)
    const residuoInf = normaInf(residuo(A, b, x))
    const cambioInf = normaInf(x.map((v, i) => v - previo[i]))
    pasos.push({ n: it, x: [...x], cambioInf, residuoInf })
    if (residuoInf <= tol) {
      return {
        estado: 'convergio',
        mensaje: `Criterio de parada alcanzado en ${it} iteraciones: ${CRITERIO_GS}.${nota}`,
        resultado: { x, iteraciones: it, residuoInf, dominanciaEstricta, permutacion, criterio: CRITERIO_GS },
        pasos,
      }
    }
  }
  return {
    estado: 'max_iter',
    mensaje: `Se agotaron las ${maxIter} iteraciones sin cumplir el criterio de parada; no se afirma convergencia.${nota}${dominanciaEstricta ? '' : ' La matriz no es diagonalmente dominante (condición suficiente que aquí no se cumple); prueba a reordenar las ecuaciones.'}`,
    resultado: null,
    pasos,
  }
}
