import type { ResultadoMetodo } from '../tipos'
import { LIMITES } from './modelos'
import { verificarRaiz, type VerificacionRaiz } from './verificacion'

export interface EntradaFalsaPosicion {
  f: (x: number) => number
  a: number
  b: number
  tol: number
  maxIter: number
}

export interface PasoFalsaPosicion {
  n: number
  a: number
  b: number
  /** Punto donde la recta que une (a, f(a)) y (b, f(b)) corta el eje x. */
  c: number
  fc: number
  /** |cₙ − cₙ₋₁|; null en la primera iteración. */
  cambio: number | null
  /** Ancho b − a del intervalo con cambio de signo: a diferencia de la bisección, puede no reducirse. */
  ancho: number
}

export interface SalidaFalsaPosicion {
  raiz: number
  iteraciones: number
  ultimoCambio: number
  residuo: number
  criterio: string
  verificacion: VerificacionRaiz
}

export const CRITERIO_FALSA_POSICION = 'cambio |cₙ − cₙ₋₁| ≤ tolerancia, o f(c) = 0'

const falla = (estado: ResultadoMetodo<never, never>['estado'], mensaje: string, pasos: PasoFalsaPosicion[] = []): ResultadoMetodo<SalidaFalsaPosicion, PasoFalsaPosicion> => ({ estado, mensaje, resultado: null, pasos })

/** Falsa posición (regula falsi): como la bisección conserva un intervalo con cambio de signo, pero el nuevo punto es el corte de la secante. */
export function falsaPosicion({ f, a, b, tol, maxIter }: EntradaFalsaPosicion): ResultadoMetodo<SalidaFalsaPosicion, PasoFalsaPosicion> {
  const lim = LIMITES.maxAbs
  if (![a, b, tol].every(Number.isFinite) || !Number.isInteger(maxIter)) return falla('invalido', 'Los datos deben ser números finitos y el máximo de iteraciones un entero.')
  if (Math.abs(a) > lim || Math.abs(b) > lim) return falla('invalido', `Los extremos deben estar en [−${lim}, ${lim}].`)
  if (!(a < b)) return falla('invalido', 'Se requiere a < b.')
  if (tol < LIMITES.tolMin) return falla('invalido', `La tolerancia debe ser ≥ ${LIMITES.tolMin}.`)
  if (maxIter < 1 || maxIter > LIMITES.maxIter) return falla('invalido', `El máximo de iteraciones debe estar entre 1 y ${LIMITES.maxIter}.`)

  let lo = a
  let hi = b
  let fLo = f(lo)
  let fHi = f(hi)
  if (!Number.isFinite(fLo) || !Number.isFinite(fHi)) return falla('no_finito', 'f no es finita en un extremo del intervalo.')
  if (fLo * fHi > 0) return falla('sin_cambio_signo', `f(a) = ${fLo} y f(b) = ${fHi} tienen el mismo signo: no hay garantía de raíz en [a, b].`)

  const pasos: PasoFalsaPosicion[] = []
  let previo: number | null = null
  for (let n = 1; n <= maxIter; n++) {
    // Si un extremo ya es raíz el corte de la secante coincide con él (y se evita 0/0).
    const c: number = fLo === 0 ? lo : fHi === 0 ? hi : (lo * fHi - hi * fLo) / (fHi - fLo)
    const fc = f(c)
    const cambio: number | null = previo === null ? null : Math.abs(c - previo)
    pasos.push({ n, a: lo, b: hi, c, fc, cambio, ancho: hi - lo })
    if (!Number.isFinite(c) || !Number.isFinite(fc)) return falla('no_finito', `La iteración produjo un valor no finito (c = ${c}).`, pasos)
    if (fc === 0 || (cambio !== null && cambio <= tol)) {
      const verificacion = verificarRaiz(f, c, tol)
      if (!verificacion.verificada) {
        return falla('no_converge', `No converge a una raíz: el cambio entre iteraciones es ≤ tolerancia, pero c = ${c} no verifica ser raíz (|f(c)| = ${Math.abs(fc)}). Posible discontinuidad o polo en el intervalo.`, pasos)
      }
      return {
        estado: 'convergio',
        mensaje: `Criterio de parada alcanzado en ${n} iteraciones: ${CRITERIO_FALSA_POSICION}.`,
        resultado: { raiz: c, iteraciones: n, ultimoCambio: cambio ?? 0, residuo: Math.abs(fc), criterio: CRITERIO_FALSA_POSICION, verificacion },
        pasos,
      }
    }
    previo = c
    if (fLo * fc < 0) {
      hi = c
      fHi = fc
    } else {
      lo = c
      fLo = fc
    }
  }
  return { estado: 'max_iter', mensaje: `Se agotaron las ${maxIter} iteraciones sin cumplir el criterio de parada; no se afirma convergencia.`, resultado: null, pasos }
}
