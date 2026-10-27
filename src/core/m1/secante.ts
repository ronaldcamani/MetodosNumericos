import type { ResultadoMetodo } from '../tipos'
import { LIMITES } from './modelos'
import { UMBRAL_DERIVADA } from './newton'
import { verificarRaiz, type VerificacionRaiz } from './verificacion'

export interface EntradaSecante {
  f: (x: number) => number
  x0: number
  x1: number
  tol: number
  maxIter: number
}

export interface PasoSecante {
  n: number
  x0: number
  x1: number
  f0: number
  f1: number
  siguiente: number
  /** |xₙ₊₁ − xₙ| */
  cambio: number
  /** |f(xₙ₊₁)|: residuo, no es el error de la raíz. */
  residuo: number
}

export interface SalidaSecante {
  raiz: number
  iteraciones: number
  ultimoCambio: number
  residuo: number
  criterio: string
  verificacion: VerificacionRaiz
}

export const CRITERIO_SECANTE = 'cambio |xₙ₊₁ − xₙ| ≤ tolerancia'

const falla = (estado: ResultadoMetodo<never, never>['estado'], mensaje: string, pasos: PasoSecante[] = []): ResultadoMetodo<SalidaSecante, PasoSecante> => ({ estado, mensaje, resultado: null, pasos })

/** Secante: Newton sin derivada, con la pendiente (f(xₙ) − f(xₙ₋₁))/(xₙ − xₙ₋₁). No exige cambio de signo. */
export function secante({ f, x0, x1, tol, maxIter }: EntradaSecante): ResultadoMetodo<SalidaSecante, PasoSecante> {
  if (![x0, x1, tol].every(Number.isFinite) || !Number.isInteger(maxIter)) return falla('invalido', 'Los datos deben ser números finitos y el máximo de iteraciones un entero.')
  if (Math.abs(x0) > LIMITES.maxAbs || Math.abs(x1) > LIMITES.maxAbs) return falla('invalido', `Los puntos iniciales deben estar en [−${LIMITES.maxAbs}, ${LIMITES.maxAbs}].`)
  if (x0 === x1) return falla('invalido', 'Los dos puntos iniciales deben ser distintos.')
  if (tol < LIMITES.tolMin) return falla('invalido', `La tolerancia debe ser ≥ ${LIMITES.tolMin}.`)
  if (maxIter < 1 || maxIter > LIMITES.maxIter) return falla('invalido', `El máximo de iteraciones debe estar entre 1 y ${LIMITES.maxIter}.`)

  const pasos: PasoSecante[] = []
  let p = x0
  let q = x1
  let fp = f(p)
  let fq = f(q)
  for (let n = 1; n <= maxIter; n++) {
    if (!Number.isFinite(fp) || !Number.isFinite(fq)) return falla('no_finito', 'f no es finita en uno de los puntos de la iteración.', pasos)
    const pendiente = (fq - fp) / (q - p)
    if (!Number.isFinite(pendiente) || Math.abs(pendiente) < UMBRAL_DERIVADA) {
      return falla('derivada_nula', `La pendiente de la secante (${pendiente}) es nula o demasiado pequeña: f(xₙ) ≈ f(xₙ₋₁) y no se puede dividir.`, pasos)
    }
    const siguiente = q - fq / pendiente
    const fs = f(siguiente)
    if (!Number.isFinite(siguiente) || !Number.isFinite(fs)) return falla('no_finito', 'La iteración produjo un valor no finito (divergencia).', pasos)
    const cambio = Math.abs(siguiente - q)
    pasos.push({ n, x0: p, x1: q, f0: fp, f1: fq, siguiente, cambio, residuo: Math.abs(fs) })
    p = q
    fp = fq
    q = siguiente
    fq = fs
    if (cambio <= tol) {
      const verificacion = verificarRaiz(f, q, tol)
      if (!verificacion.verificada) {
        return falla('no_converge', `No converge: el cambio entre iteraciones es ≤ tolerancia, pero x = ${q} no verifica ser raíz (|f(x)| = ${Math.abs(verificacion.fRaiz)} no es mínimo local ni cruza el cero).`, pasos)
      }
      return {
        estado: 'convergio',
        mensaje: `Criterio de parada alcanzado en ${n} iteraciones: ${CRITERIO_SECANTE}.`,
        resultado: { raiz: q, iteraciones: n, ultimoCambio: cambio, residuo: Math.abs(fs), criterio: CRITERIO_SECANTE, verificacion },
        pasos,
      }
    }
  }
  return { estado: 'max_iter', mensaje: `Se agotaron las ${maxIter} iteraciones sin cumplir el criterio de parada; no se afirma convergencia.`, resultado: null, pasos }
}
