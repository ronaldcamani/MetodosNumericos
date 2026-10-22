import { fmt } from '../formato'
import type { ResultadoMetodo } from '../tipos'
import { avisoExtrapolacion, fueraDeIntervalo, intervaloDe, sinVariacionEnX, validarDatos, type Datos } from './comun'

export interface EntradaRegresion extends Datos {
  consulta: number
}

export interface PasoResiduo {
  i: number
  x: number
  y: number
  yAjustada: number
  residuo: number
  residuo2: number
}

export interface SalidaRegresion {
  pendiente: number
  intercepto: number
  /** Suma de cuadrados de los residuos Σ (yᵢ − ŷᵢ)². */
  sse: number
  /** Coeficiente de determinación; null si todas las y son iguales (no está definido). */
  r2: number | null
  xMedia: number
  yMedia: number
  sxx: number
  sxy: number
  prediccion: number
  intervalo: [number, number]
  fueraDeIntervalo: boolean
  advertencias: string[]
}

const falla = (estado: ResultadoMetodo<never, never>['estado'], mensaje: string): ResultadoMetodo<SalidaRegresion, PasoResiduo> => ({ estado, mensaje, resultado: null, pasos: [] })

/** Regresión lineal y = b₀ + b₁x por mínimos cuadrados: b₁ = Sxy/Sxx, b₀ = ȳ − b₁x̄. */
export function regresionLineal(entrada: EntradaRegresion): ResultadoMetodo<SalidaRegresion, PasoResiduo> {
  const error = validarDatos(entrada)
  if (error) return falla('invalido', error)
  if (!Number.isFinite(entrada.consulta)) return falla('invalido', 'El valor de consulta debe ser un número finito.')
  const { x, y, consulta } = entrada
  if (sinVariacionEnX(x)) {
    return falla('singular', `Todas las x valen ${x[0]}: no hay variación en x, Sxx = 0 y la pendiente no está definida. No se calcula ninguna recta.`)
  }
  const n = x.length
  const xMedia = x.reduce((s, v) => s + v, 0) / n
  const yMedia = y.reduce((s, v) => s + v, 0) / n
  const sxx = x.reduce((s, v) => s + (v - xMedia) ** 2, 0)
  const sxy = x.reduce((s, v, i) => s + (v - xMedia) * (y[i] - yMedia), 0)
  const pendiente = sxy / sxx
  const intercepto = yMedia - pendiente * xMedia
  const pasos: PasoResiduo[] = x.map((xi, i) => {
    const yAjustada = intercepto + pendiente * xi
    const residuo = y[i] - yAjustada
    return { i, x: xi, y: y[i], yAjustada, residuo, residuo2: residuo ** 2 }
  })
  const sse = pasos.reduce((s, p) => s + p.residuo2, 0)
  const sst = y.reduce((s, v) => s + (v - yMedia) ** 2, 0)
  const r2 = sst > 0 ? 1 - sse / sst : null
  const prediccion = intercepto + pendiente * consulta
  if (![pendiente, intercepto, sse, prediccion].every(Number.isFinite)) return falla('no_finito', 'El cálculo produjo valores no finitos.')

  const fuera = fueraDeIntervalo(x, consulta)
  const advertencias: string[] = []
  if (fuera) advertencias.push(avisoExtrapolacion(consulta, x))
  if (n === 2) advertencias.push('Con solo 2 puntos la recta pasa exactamente por ambos (SSE = 0); no hay información para juzgar el ajuste.')
  if (r2 === null) advertencias.push('Todas las y son iguales: la recta es horizontal y R² no está definido.')
  return {
    estado: 'ok',
    mensaje: `Recta ajustada y = ${fmt(intercepto, 8)} + ${fmt(pendiente, 8)}·x. Suma de cuadrados de los residuos = ${fmt(sse, 8)}.`,
    resultado: { pendiente, intercepto, sse, r2, xMedia, yMedia, sxx, sxy, prediccion, intervalo: intervaloDe(x), fueraDeIntervalo: fuera, advertencias },
    pasos,
  }
}
