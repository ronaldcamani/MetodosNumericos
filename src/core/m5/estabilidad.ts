/** Factor por paso de Euler en y′ = −k y: yₙ₊₁ = (1 − k h) yₙ. Estable si |1 − k h| < 1, es decir 0 < h < 2/k. */
export const factorEuler = (k: number, h: number): number => 1 - k * h

/** Factor por paso de RK4 en y′ = −k y: polinomio de Taylor de e^(−kh) hasta grado 4. */
export function factorRK4(k: number, h: number): number {
  const z = -k * h
  return 1 + z + (z * z) / 2 + (z * z * z) / 6 + (z * z * z * z) / 24
}

/** Límite de h para Euler: 2/k (4 min con k = 0.5). */
export const limiteEuler = (k: number): number => 2 / k

/** Valor z = k h hasta el que |R(−z)| < 1 en RK4 (≈ 2.7853), calculado por bisección. */
export const KH_LIMITE_RK4 = (() => {
  let lo = 2
  let hi = 3
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2
    if (Math.abs(factorRK4(1, m)) < 1) lo = m
    else hi = m
  }
  return lo
})()

/** Límite de h para RK4: ≈ 2.7853/k (≈ 5.57 min con k = 0.5). */
export const limiteRK4 = (k: number): number => KH_LIMITE_RK4 / k

export type ComportamientoEuler = 'monotono' | 'inmediato' | 'oscila' | 'marginal' | 'diverge'

/** Cómo se comporta Euler con k h: decae monótono (0 < kh < 1), llega a Tₐ de golpe (kh = 1), oscila decayendo (1 < kh < 2), oscila sin decaer (kh = 2) o diverge (kh > 2). */
export function comportamientoEuler(k: number, h: number): ComportamientoEuler {
  const kh = k * h
  if (Math.abs(kh - 1) < 1e-12) return 'inmediato'
  if (Math.abs(kh - 2) < 1e-12) return 'marginal'
  if (kh < 1) return 'monotono'
  return kh < 2 ? 'oscila' : 'diverge'
}

export const DESCRIPCION_EULER: Record<ComportamientoEuler, string> = {
  monotono: 'Estable y monótono: la temperatura baja hacia la ambiente sin cruzarla.',
  inmediato: 'Cae a la temperatura ambiente en un solo paso (caso límite).',
  oscila: 'Estable pero oscila: cruza la temperatura ambiente alternando lados. Converge, pero la trayectoria no es físicamente válida.',
  marginal: 'Marginal: oscila sin decaer entre dos valores. Tampoco es físicamente válida.',
  diverge: 'Inestable: las oscilaciones crecen en cada paso (el error se amplifica).',
}
