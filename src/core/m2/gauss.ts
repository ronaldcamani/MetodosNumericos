import type { ResultadoMetodo } from '../tipos'
import { EPS_PIVOTE_PEQUENO, EPS_SINGULAR, escalaMatriz, normaInf, residuo, validarSistema, type EntradaSistema, type Matriz } from './comun'

export interface PasoGauss {
  /** Columna que se elimina (1 … n−1). */
  k: number
  /** Filas intercambiadas (índices desde 0), o null si no hubo intercambio. */
  intercambio: [number, number] | null
  pivote: number
  /** Multiplicador usado en cada fila inferior. */
  multiplicadores: number[]
  /** Matriz aumentada [A | b] tras el intercambio y la eliminación. */
  matriz: Matriz
}

export interface SalidaGauss {
  x: number[]
  residuoInf: number
  intercambios: number
  advertencias: string[]
  criterio: string
}

export const CRITERIO_PIVOTE = `|pivote| ≤ ${EPS_SINGULAR} · (mayor |a_ij| de A) se considera nulo (sistema singular)`

const falla = (estado: ResultadoMetodo<never, never>['estado'], mensaje: string, pasos: PasoGauss[] = []): ResultadoMetodo<SalidaGauss, PasoGauss> => ({ estado, mensaje, resultado: null, pasos })

export function eliminacionGauss(entrada: EntradaSistema): ResultadoMetodo<SalidaGauss, PasoGauss> {
  const error = validarSistema(entrada)
  if (error) return falla('invalido', error)
  const n = entrada.A.length
  const escala = escalaMatriz(entrada.A)
  const M: Matriz = entrada.A.map((fila, i) => [...fila, entrada.b[i]])
  const pasos: PasoGauss[] = []
  const advertencias: string[] = []
  let intercambios = 0

  const singular = (k: number, p: number) =>
    falla('singular', `Pivote ${Math.abs(p)} en la columna ${k + 1}: ${CRITERIO_PIVOTE}. El sistema es singular (sin solución única); no se calcula ninguna solución.`, pasos)

  for (let k = 0; k < n - 1; k++) {
    let fp = k
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[fp][k])) fp = i
    const pivote = M[fp][k]
    if (Math.abs(pivote) <= EPS_SINGULAR * escala) return singular(k, pivote)
    if (Math.abs(pivote) < EPS_PIVOTE_PEQUENO * escala) advertencias.push(`Pivote pequeño en la columna ${k + 1} (${pivote}): el resultado puede perder precisión.`)
    let intercambio: [number, number] | null = null
    if (fp !== k) {
      ;[M[k], M[fp]] = [M[fp], M[k]]
      intercambio = [k, fp]
      intercambios++
    }
    const multiplicadores: number[] = []
    for (let i = k + 1; i < n; i++) {
      const m = M[i][k] / M[k][k]
      multiplicadores.push(m)
      for (let j = k; j <= n; j++) M[i][j] -= m * M[k][j]
      M[i][k] = 0
    }
    pasos.push({ k: k + 1, intercambio, pivote: M[k][k], multiplicadores, matriz: M.map((f) => [...f]) })
  }
  const ultimo = M[n - 1][n - 1]
  if (Math.abs(ultimo) <= EPS_SINGULAR * escala) return singular(n - 1, ultimo)
  if (Math.abs(ultimo) < EPS_PIVOTE_PEQUENO * escala) advertencias.push(`Pivote pequeño en la columna ${n} (${ultimo}): el resultado puede perder precisión.`)

  const x = new Array<number>(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n]
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j]
    x[i] = s / M[i][i]
  }
  if (!x.every(Number.isFinite)) return falla('no_finito', 'La sustitución produjo valores no finitos.', pasos)
  const residuoInf = normaInf(residuo(entrada.A, entrada.b, x))
  return {
    estado: 'ok',
    mensaje: `Solución obtenida con ${intercambios} intercambio(s) de filas. Residuo ‖b − Ax‖∞ = ${residuoInf}.`,
    resultado: { x, residuoInf, intercambios, advertencias, criterio: CRITERIO_PIVOTE },
    pasos,
  }
}
