import type { ResultadoMetodo } from '../tipos'
import { LIMITES_ERRORES } from './aritmetica'

export interface PasoSerie {
  /** Número de términos usados (hasta xᵏ⁻¹/(k−1)!). */
  terminos: number
  suma: number
  /** Error de truncamiento real |eˣ − Sₙ|. */
  error: number
  /** Cota de Lagrange: e^{máx(0,x)} · |x|ⁿ / n!. */
  cota: number
}

export interface SalidaSerie {
  exacto: number
  pasos: PasoSerie[]
}

/** Error de truncamiento al aproximar eˣ con n términos de su serie de Maclaurin. */
export function serieExponencial({ x, terminos }: { x: number; terminos: number }): ResultadoMetodo<SalidaSerie, PasoSerie> {
  if (!Number.isFinite(x) || Math.abs(x) > 20) return { estado: 'invalido', mensaje: 'x debe ser un número finito en [−20, 20].', resultado: null, pasos: [] }
  if (!Number.isInteger(terminos) || terminos < 1 || terminos > LIMITES_ERRORES.maxTerminos) return { estado: 'invalido', mensaje: `El número de términos debe ser un entero entre 1 y ${LIMITES_ERRORES.maxTerminos}.`, resultado: null, pasos: [] }
  const exacto = Math.exp(x)
  const pasos: PasoSerie[] = []
  let suma = 0
  let termino = 1
  for (let n = 1; n <= terminos; n++) {
    suma += termino
    // cota de Lagrange del resto tras n términos: e^{ξ} |x|ⁿ / n!, con ξ entre 0 y x
    let potencia = 1
    for (let k = 1; k <= n; k++) potencia *= Math.abs(x) / k
    pasos.push({ terminos: n, suma, error: Math.abs(exacto - suma), cota: Math.exp(Math.max(0, x)) * potencia })
    termino = (termino * x) / n
  }
  return { estado: 'ok', mensaje: `e^${x} = ${exacto}; con ${terminos} términos el error de truncamiento es ${pasos[pasos.length - 1].error}.`, resultado: { exacto, pasos }, pasos }
}

/** Épsilon de máquina de la doble precisión: el menor ε tal que 1 + ε > 1. */
export function epsilonMaquina(): number {
  let e = 1
  while (1 + e / 2 > 1) e /= 2
  return e
}
