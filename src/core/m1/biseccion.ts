import type { ResultadoMetodo } from '../tipos'
import { LIMITES } from './modelos'

export interface EntradaBiseccion {
  f: (x: number) => number
  a: number
  b: number
  tol: number
  maxIter: number
}

export interface PasoBiseccion {
  n: number
  a: number
  b: number
  medio: number
  fMedio: number
  /** Cota del error del punto medio: (b − a) / 2 del intervalo de esta iteración. */
  cota: number
}

export interface SalidaBiseccion {
  raiz: number
  iteraciones: number
  cotaError: number
  residuo: number
  criterio: string
}

export const CRITERIO_BISECCION = 'cota del error (b − a)/2 ≤ tolerancia, o f(medio) = 0'

const falla = (estado: ResultadoMetodo<never, never>['estado'], mensaje: string, pasos: PasoBiseccion[] = []): ResultadoMetodo<SalidaBiseccion, PasoBiseccion> => ({ estado, mensaje, resultado: null, pasos })

export function biseccion({ f, a, b, tol, maxIter }: EntradaBiseccion): ResultadoMetodo<SalidaBiseccion, PasoBiseccion> {
  const lim = LIMITES.maxAbs
  if (![a, b, tol].every(Number.isFinite) || !Number.isInteger(maxIter)) return falla('invalido', 'Los datos deben ser números finitos y el máximo de iteraciones un entero.')
  if (Math.abs(a) > lim || Math.abs(b) > lim) return falla('invalido', `Los extremos deben estar en [−${lim}, ${lim}].`)
  if (!(a < b)) return falla('invalido', 'Se requiere a < b.')
  if (tol < LIMITES.tolMin) return falla('invalido', `La tolerancia debe ser ≥ ${LIMITES.tolMin}.`)
  if (maxIter < 1 || maxIter > LIMITES.maxIter) return falla('invalido', `El máximo de iteraciones debe estar entre 1 y ${LIMITES.maxIter}.`)

  const fa = f(a)
  const fb = f(b)
  if (!Number.isFinite(fa) || !Number.isFinite(fb)) return falla('no_finito', 'f no es finita en un extremo del intervalo.')
  if (fa * fb > 0) return falla('sin_cambio_signo', `f(a) = ${fa} y f(b) = ${fb} tienen el mismo signo: no hay garantía de raíz en [a, b].`)

  const pasos: PasoBiseccion[] = []
  let lo = a
  let hi = b
  let fLo = fa
  for (let n = 1; n <= maxIter; n++) {
    const medio = lo + (hi - lo) / 2
    const fMedio = f(medio)
    const cota = (hi - lo) / 2
    pasos.push({ n, a: lo, b: hi, medio, fMedio, cota })
    if (!Number.isFinite(fMedio)) return falla('no_finito', `f no es finita en x = ${medio}.`, pasos)
    if (fMedio === 0 || cota <= tol) {
      return {
        estado: 'convergio',
        mensaje: `Criterio de parada alcanzado en ${n} iteraciones: ${CRITERIO_BISECCION}.`,
        resultado: { raiz: medio, iteraciones: n, cotaError: cota, residuo: Math.abs(fMedio), criterio: CRITERIO_BISECCION },
        pasos,
      }
    }
    if (fLo * fMedio < 0) hi = medio
    else {
      lo = medio
      fLo = fMedio
    }
  }
  return { estado: 'max_iter', mensaje: `Se agotaron las ${maxIter} iteraciones sin cumplir el criterio de parada; no se afirma convergencia.`, resultado: null, pasos }
}
