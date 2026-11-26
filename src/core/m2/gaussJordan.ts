import type { ResultadoMetodo } from '../tipos'
import {
  EPS_PIVOTE_PEQUENO,
  EPS_SINGULAR,
  escalaMatriz,
  normaInf,
  numeroCondicionInf,
  residuo,
  validarSistema,
  type AnalisisCondicionamiento,
  type EntradaSistema,
  type Matriz,
} from './comun'
import { CRITERIO_PIVOTE } from './gauss'

export interface PasoGaussJordan {
  /** Columna pivote procesada (1 … n). */
  k: number
  intercambio: [number, number] | null
  pivoteOriginal: number
  /** Matriz aumentada [A | b] tras normalizar la fila pivote a 1 y anular arriba y abajo. */
  matriz: Matriz
}

export interface SalidaGaussJordan {
  x: number[]
  residuoInf: number
  intercambios: number
  advertencias: string[]
  criterio: string
  condicion: AnalisisCondicionamiento | null
}

const falla = (
  estado: ResultadoMetodo<never, never>['estado'],
  mensaje: string,
  pasos: PasoGaussJordan[] = [],
): ResultadoMetodo<SalidaGaussJordan, PasoGaussJordan> => ({ estado, mensaje, resultado: null, pasos })

/**
 * Eliminación de Gauss-Jordan con pivoteo parcial hasta forma escalonada reducida [I | x].
 * Incluye evaluación del número de condición κ∞(A) = ‖A‖∞‖A⁻¹‖∞.
 */
export function eliminacionGaussJordan(entrada: EntradaSistema): ResultadoMetodo<SalidaGaussJordan, PasoGaussJordan> {
  const error = validarSistema(entrada)
  if (error) return falla('invalido', error)

  const n = entrada.A.length
  const escala = escalaMatriz(entrada.A)
  const M: Matriz = entrada.A.map((fila, i) => [...fila, entrada.b[i]])
  const pasos: PasoGaussJordan[] = []
  const advertencias: string[] = []
  let intercambios = 0

  const singular = (k: number, p: number) =>
    falla(
      'singular',
      `Pivote ${Math.abs(p)} en la columna ${k + 1}: ${CRITERIO_PIVOTE}. El sistema es singular y no admite forma [I | x] única.`,
      pasos,
    )

  for (let k = 0; k < n; k++) {
    let fp = k
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i][k]) > Math.abs(M[fp][k])) fp = i
    }
    const pivoteOriginal = M[fp][k]
    if (Math.abs(pivoteOriginal) <= EPS_SINGULAR * escala) return singular(k, pivoteOriginal)
    if (Math.abs(pivoteOriginal) < EPS_PIVOTE_PEQUENO * escala) {
      advertencias.push(`Pivote pequeño en la columna ${k + 1} (${pivoteOriginal}): posible pérdida de cifras significativas.`)
    }

    let intercambio: [number, number] | null = null
    if (fp !== k) {
      ;[M[k], M[fp]] = [M[fp], M[k]]
      intercambio = [k, fp]
      intercambios++
    }

    const piv = M[k][k]
    for (let j = k; j <= n; j++) M[k][j] /= piv
    M[k][k] = 1

    for (let i = 0; i < n; i++) {
      if (i === k) continue
      const factor = M[i][k]
      if (factor === 0) continue
      for (let j = k; j <= n; j++) M[i][j] -= factor * M[k][j]
      M[i][k] = 0
    }

    pasos.push({
      k: k + 1,
      intercambio,
      pivoteOriginal,
      matriz: M.map((f) => [...f]),
    })
  }

  const x = M.map((fila) => fila[n])
  if (!x.every(Number.isFinite)) return falla('no_finito', 'La reducción de Gauss-Jordan produjo valores no finitos.', pasos)

  const residuoInf = normaInf(residuo(entrada.A, entrada.b, x))
  const condicion = numeroCondicionInf(entrada.A)
  if (condicion?.malCondicionado) {
    advertencias.push(
      `Sistema mal condicionado: κ∞(A) = ${condicion.kappaInf.toExponential(3)} > 10⁴. Pequeñas perturbaciones en los datos pueden amplificarse significativamente en x.`,
    )
  }

  return {
    estado: 'ok',
    mensaje: `Forma reducida [I | x] alcanzada por Gauss-Jordan con ${intercambios} intercambio(s). Residuo ‖b − Ax‖∞ = ${residuoInf}.`,
    resultado: { x, residuoInf, intercambios, advertencias, criterio: CRITERIO_PIVOTE, condicion },
    pasos,
  }
}
