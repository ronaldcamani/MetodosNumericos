import type { ResultadoMetodo } from '../tipos'
import {
  EPS_PIVOTE_PEQUENO,
  EPS_SINGULAR,
  escalaMatriz,
  normaInf,
  normaMatrizInf,
  numeroCondicionInf,
  residuo,
  validarSistema,
  type AnalisisCondicionamiento,
  type EntradaSistema,
  type Matriz,
} from './comun'
import { CRITERIO_PIVOTE } from './gauss'

export interface PasoLU {
  k: number
  intercambio: [number, number] | null
  pivote: number
  multiplicadores: number[]
  L: Matriz
  U: Matriz
}

export interface SalidaLU {
  x: number[]
  y: number[]
  L: Matriz
  U: Matriz
  P: Matriz
  permutacion: number[]
  intercambios: number
  errorFactorizacionInf: number
  residuoInf: number
  advertencias: string[]
  criterio: string
  condicion: AnalisisCondicionamiento | null
}

const falla = (
  estado: ResultadoMetodo<never, never>['estado'],
  mensaje: string,
  pasos: PasoLU[] = [],
): ResultadoMetodo<SalidaLU, PasoLU> => ({ estado, mensaje, resultado: null, pasos })

function multiplicarMatrices(A: Matriz, B: Matriz): Matriz {
  const n = A.length
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => A[i].reduce((s, a, k) => s + a * B[k][j], 0)),
  )
}

/**
 * Factorización LU por Doolittle con pivoteo parcial (P·A = L·U) para Tema 06 (Cap. III).
 * Resuelve L·y = P·b (hacia adelante) y U·x = y (hacia atrás), y evalúa κ∞(A).
 */
export function descomposicionLU(entrada: EntradaSistema): ResultadoMetodo<SalidaLU, PasoLU> {
  const error = validarSistema(entrada)
  if (error) return falla('invalido', error)

  const n = entrada.A.length
  const escala = escalaMatriz(entrada.A)
  const U: Matriz = entrada.A.map((f) => [...f])
  const L: Matriz = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  const perm = Array.from({ length: n }, (_, i) => i)
  const pasos: PasoLU[] = []
  const advertencias: string[] = []
  let intercambios = 0

  const singular = (k: number, p: number) =>
    falla(
      'singular',
      `Pivote ${Math.abs(p)} en la columna ${k + 1}: ${CRITERIO_PIVOTE}. La matriz es singular y no admite factorización LU no singular.`,
      pasos,
    )

  for (let k = 0; k < n - 1; k++) {
    let fp = k
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(U[i][k]) > Math.abs(U[fp][k])) fp = i
    }
    const pivote = U[fp][k]
    if (Math.abs(pivote) <= EPS_SINGULAR * escala) return singular(k, pivote)
    if (Math.abs(pivote) < EPS_PIVOTE_PEQUENO * escala) {
      advertencias.push(`Pivote pequeño en la columna ${k + 1} (${pivote}): posible pérdida de precisión en LU.`)
    }

    let intercambio: [number, number] | null = null
    if (fp !== k) {
      ;[U[k], U[fp]] = [U[fp], U[k]]
      ;[perm[k], perm[fp]] = [perm[fp], perm[k]]
      for (let j = 0; j < k; j++) {
        const tmp = L[k][j]
        L[k][j] = L[fp][j]
        L[fp][j] = tmp
      }
      intercambio = [k, fp]
      intercambios++
    }

    const multiplicadores: number[] = []
    for (let i = k + 1; i < n; i++) {
      const m = U[i][k] / U[k][k]
      L[i][k] = m
      multiplicadores.push(m)
      for (let j = k; j < n; j++) U[i][j] -= m * U[k][j]
      U[i][k] = 0
    }

    pasos.push({
      k: k + 1,
      intercambio,
      pivote: U[k][k],
      multiplicadores,
      L: L.map((f) => [...f]),
      U: U.map((f) => [...f]),
    })
  }

  const ultimo = U[n - 1][n - 1]
  if (Math.abs(ultimo) <= EPS_SINGULAR * escala) return singular(n - 1, ultimo)
  if (Math.abs(ultimo) < EPS_PIVOTE_PEQUENO * escala) {
    advertencias.push(`Pivote pequeño en la columna ${n} (${ultimo}): posible pérdida de precisión en LU.`)
  }

  const P: Matriz = perm.map((idx) => Array.from({ length: n }, (_, j) => (j === idx ? 1 : 0)))
  const pb = perm.map((idx) => entrada.b[idx])

  // Sustitución hacia adelante: L·y = P·b
  const y = new Array<number>(n).fill(0)
  for (let i = 0; i < n; i++) {
    let s = pb[i]
    for (let j = 0; j < i; j++) s -= L[i][j] * y[j]
    y[i] = s / L[i][i]
  }

  // Sustitución hacia atrás: U·x = y
  const x = new Array<number>(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i]
    for (let j = i + 1; j < n; j++) s -= U[i][j] * x[j]
    x[i] = s / U[i][i]
  }

  if (!x.every(Number.isFinite) || !y.every(Number.isFinite)) {
    return falla('no_finito', 'La sustitución sobre L y U produjo valores no finitos.', pasos)
  }

  const PA = multiplicarMatrices(P, entrada.A)
  const LU = multiplicarMatrices(L, U)
  const diffPA_LU = PA.map((fila, i) => fila.map((v, j) => v - LU[i][j]))
  const errorFactorizacionInf = normaMatrizInf(diffPA_LU)
  const residuoInf = normaInf(residuo(entrada.A, entrada.b, x))
  const condicion = numeroCondicionInf(entrada.A)

  if (condicion?.malCondicionado) {
    advertencias.push(
      `Sistema mal condicionado: κ∞(A) = ${condicion.kappaInf.toExponential(3)} > 10⁴. Un residuo pequeño no garantiza error pequeño en x.`,
    )
  }

  return {
    estado: 'ok',
    mensaje: `Factorización PA = LU (Doolittle) completada con ${intercambios} intercambio(s). Residuo ‖b − Ax‖∞ = ${residuoInf}.`,
    resultado: {
      x,
      y,
      L,
      U,
      P,
      permutacion: perm,
      intercambios,
      errorFactorizacionInf,
      residuoInf,
      advertencias,
      criterio: CRITERIO_PIVOTE,
      condicion,
    },
    pasos,
  }
}
