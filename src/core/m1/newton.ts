import type { ResultadoMetodo } from '../tipos'
import { LIMITES } from './modelos'

export interface EntradaNewton {
  f: (x: number) => number
  df: (x: number) => number
  x0: number
  tol: number
  maxIter: number
  /** |f'(x)| por debajo de este umbral se considera derivada nula. */
  umbralDerivada?: number
}

export interface PasoNewton {
  n: number
  x: number
  fx: number
  dfx: number
  siguiente: number
  /** |x_{n+1} − x_n| */
  cambio: number
  /** |f(x_{n+1})|: residuo, no es el error de la raíz. */
  residuo: number
}

export interface SalidaNewton {
  raiz: number
  iteraciones: number
  ultimoCambio: number
  residuo: number
  criterio: string
}

export const UMBRAL_DERIVADA = 1e-12
export const CRITERIO_NEWTON = 'cambio |xₙ₊₁ − xₙ| ≤ tolerancia'

const falla = (estado: ResultadoMetodo<never, never>['estado'], mensaje: string, pasos: PasoNewton[] = []): ResultadoMetodo<SalidaNewton, PasoNewton> => ({ estado, mensaje, resultado: null, pasos })

export function newton({ f, df, x0, tol, maxIter, umbralDerivada = UMBRAL_DERIVADA }: EntradaNewton): ResultadoMetodo<SalidaNewton, PasoNewton> {
  if (![x0, tol].every(Number.isFinite) || !Number.isInteger(maxIter)) return falla('invalido', 'Los datos deben ser números finitos y el máximo de iteraciones un entero.')
  if (Math.abs(x0) > LIMITES.maxAbs) return falla('invalido', `El punto inicial debe estar en [−${LIMITES.maxAbs}, ${LIMITES.maxAbs}].`)
  if (tol < LIMITES.tolMin) return falla('invalido', `La tolerancia debe ser ≥ ${LIMITES.tolMin}.`)
  if (maxIter < 1 || maxIter > LIMITES.maxIter) return falla('invalido', `El máximo de iteraciones debe estar entre 1 y ${LIMITES.maxIter}.`)

  const pasos: PasoNewton[] = []
  let x = x0
  for (let n = 1; n <= maxIter; n++) {
    const fx = f(x)
    const dfx = df(x)
    if (!Number.isFinite(fx) || !Number.isFinite(dfx)) return falla('no_finito', `f o f' no son finitas en x = ${x}.`, pasos)
    if (Math.abs(dfx) < umbralDerivada) {
      return falla('derivada_nula', `|f'(${x})| = ${Math.abs(dfx)} es menor que ${umbralDerivada}: no se puede dividir (derivada nula o demasiado pequeña).`, pasos)
    }
    const siguiente = x - fx / dfx
    const fSig = f(siguiente)
    if (!Number.isFinite(siguiente) || !Number.isFinite(fSig)) return falla('no_finito', 'La iteración produjo un valor no finito (divergencia).', pasos)
    const cambio = Math.abs(siguiente - x)
    const residuo = Math.abs(fSig)
    pasos.push({ n, x, fx, dfx, siguiente, cambio, residuo })
    x = siguiente
    if (cambio <= tol) {
      return {
        estado: 'convergio',
        mensaje: `Criterio de parada alcanzado en ${n} iteraciones: ${CRITERIO_NEWTON}.`,
        resultado: { raiz: x, iteraciones: n, ultimoCambio: cambio, residuo, criterio: CRITERIO_NEWTON },
        pasos,
      }
    }
  }
  return { estado: 'max_iter', mensaje: `Se agotaron las ${maxIter} iteraciones sin cumplir el criterio de parada; no se afirma convergencia.`, resultado: null, pasos }
}
