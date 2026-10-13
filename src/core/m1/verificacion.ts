/** Verificación independiente de una raíz candidata (no usa la derivada ni el criterio de parada). */
export interface VerificacionRaiz {
  verificada: boolean
  delta: number
  fMenos: number
  fMas: number
  fRaiz: number
  /** Texto breve del criterio aplicado, para mostrarlo al usuario. */
  criterio: string
}

export const CRITERIO_VERIFICACION =
  '|f(r)| ≤ mín(|f(r−δ)|, |f(r+δ)|) con δ = 10·tol, y f cambia de signo en [r−δ, r+δ] o |f(r)| ≤ tol'

/**
 * Una raíz r (con error ≤ tol) debe ser un mínimo local de |f| entre r−δ y r+δ, y además
 * cruzar el cero (cambio de signo) o ser prácticamente cero (raíz doble). Esto descarta
 * falsas convergencias: pasos pequeños donde f sigue siendo grande, y polos (f → ±∞) donde
 * la bisección «converge» a una discontinuidad.
 */
export function verificarRaiz(f: (x: number) => number, r: number, tol: number): VerificacionRaiz {
  const delta = 10 * tol
  const fRaiz = f(r)
  const fMenos = f(r - delta)
  const fMas = f(r + delta)
  const finitos = [fRaiz, fMenos, fMas].every(Number.isFinite)
  const minimoLocal = Math.abs(fRaiz) <= Math.min(Math.abs(fMenos), Math.abs(fMas))
  const cruza = fMenos * fMas < 0 || Math.abs(fRaiz) <= tol
  return { verificada: finitos && minimoLocal && cruza, delta, fMenos, fMas, fRaiz, criterio: CRITERIO_VERIFICACION }
}
