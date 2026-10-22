import { fmt } from '../formato'
import type { ResultadoMetodo } from '../tipos'
import { abscisaRepetida, avisoExtrapolacion, fueraDeIntervalo, intervaloDe, validarDatos, type Datos } from './comun'

export interface EntradaLagrange extends Datos {
  consulta: number
}

/** Contribución de un nodo: yᵢ · Lᵢ(x). */
export interface PasoLagrange {
  i: number
  xi: number
  yi: number
  base: number
  contribucion: number
}

export interface SalidaLagrange {
  valor: number
  grado: number
  intervalo: [number, number]
  fueraDeIntervalo: boolean
  advertencias: string[]
}

const falla = (estado: ResultadoMetodo<never, never>['estado'], mensaje: string): ResultadoMetodo<SalidaLagrange, PasoLagrange> => ({ estado, mensaje, resultado: null, pasos: [] })

/** Lᵢ(t) = ∏_{j≠i} (t − xⱼ)/(xᵢ − xⱼ). Requiere abscisas distintas. */
export function baseLagrange(x: number[], i: number, t: number): number {
  let L = 1
  for (let j = 0; j < x.length; j++) if (j !== i) L *= (t - x[j]) / (x[i] - x[j])
  return L
}

/** Valor del polinomio interpolante en t (para graficar la curva). */
export function evaluarLagrange({ x, y }: Datos, t: number): number {
  return x.reduce((s, _, i) => s + y[i] * baseLagrange(x, i, t), 0)
}

export function lagrange(entrada: EntradaLagrange): ResultadoMetodo<SalidaLagrange, PasoLagrange> {
  const error = validarDatos(entrada)
  if (error) return falla('invalido', error)
  if (!Number.isFinite(entrada.consulta)) return falla('invalido', 'El valor de consulta debe ser un número finito.')
  // Nunca se elimina un nodo en silencio: una abscisa repetida se rechaza.
  const rep = abscisaRepetida(entrada.x)
  if (rep !== null) {
    return falla('invalido', `La abscisa x = ${rep} aparece más de una vez. La interpolación de Lagrange exige abscisas distintas; corrige los datos (no se elimina ningún nodo automáticamente).`)
  }
  const { x, y, consulta } = entrada
  const pasos: PasoLagrange[] = x.map((xi, i) => {
    const base = baseLagrange(x, i, consulta)
    return { i, xi, yi: y[i], base, contribucion: y[i] * base }
  })
  const valor = pasos.reduce((s, p) => s + p.contribucion, 0)
  if (!Number.isFinite(valor)) return falla('no_finito', 'El cálculo produjo un valor no finito.')

  const fuera = fueraDeIntervalo(x, consulta)
  const advertencias: string[] = []
  if (fuera) advertencias.push(avisoExtrapolacion(consulta, x))
  if (x.length >= 5) advertencias.push(`Con ${x.length} nodos el polinomio es de grado ${x.length - 1}: un grado alto puede oscilar entre los nodos (fenómeno de Runge) aunque pase por todos los datos.`)
  return {
    estado: 'ok',
    mensaje: `P(${consulta}) = ${fmt(valor, 10)}. Polinomio de grado ≤ ${x.length - 1} que pasa por los ${x.length} nodos.`,
    resultado: { valor, grado: x.length - 1, intervalo: intervaloDe(x), fueraDeIntervalo: fuera, advertencias },
    pasos,
  }
}
