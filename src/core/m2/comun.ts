export type Matriz = number[][]

export const LIMITES_M2 = { tamanos: [2, 3, 4], maxAbs: 1e6, tolMin: 1e-15, maxIter: 1000 } as const

/** Un pivote se considera nulo si |p| ≤ EPS_SINGULAR · (mayor |a_ij| de la matriz original). */
export const EPS_SINGULAR = 1e-12
/** Advertencia (sin detener el cálculo) si |p| < EPS_PIVOTE_PEQUENO · escala. */
export const EPS_PIVOTE_PEQUENO = 1e-6

export interface EntradaSistema {
  A: Matriz
  b: number[]
}

/** Devuelve el mensaje de error o null si el sistema es válido. */
export function validarSistema({ A, b }: EntradaSistema): string | null {
  const n = A.length
  if (!(LIMITES_M2.tamanos as readonly number[]).includes(n)) return 'El sistema debe ser de tamaño 2, 3 o 4.'
  if (A.some((f) => f.length !== n)) return 'La matriz debe ser cuadrada.'
  if (b.length !== n) return 'El vector b debe tener tantas componentes como filas tiene la matriz.'
  const valores = [...A.flat(), ...b]
  if (!valores.every(Number.isFinite)) return 'Todos los coeficientes deben ser números finitos.'
  if (valores.some((v) => Math.abs(v) > LIMITES_M2.maxAbs)) return `Los coeficientes deben estar en [−${LIMITES_M2.maxAbs}, ${LIMITES_M2.maxAbs}].`
  return null
}

export function normaInf(v: number[]): number {
  return v.reduce((m, x) => Math.max(m, Math.abs(x)), 0)
}

/** Residuo b − A·x. */
export function residuo(A: Matriz, b: number[], x: number[]): number[] {
  return A.map((fila, i) => b[i] - fila.reduce((s, a, j) => s + a * x[j], 0))
}

export function escalaMatriz(A: Matriz): number {
  return A.flat().reduce((m, a) => Math.max(m, Math.abs(a)), 0)
}

export function dominanciaDiagonalEstricta(A: Matriz): boolean {
  return A.every((fila, i) => Math.abs(fila[i]) > fila.reduce((s, a, j) => (j === i ? s : s + Math.abs(a)), 0))
}

/** Determinante por cofactores (los tamaños admitidos son ≤ 4). */
export function determinante(A: Matriz): number {
  if (A.length === 1) return A[0][0]
  return A[0].reduce((suma, a, j) => suma + (j % 2 ? -1 : 1) * a * determinante(A.slice(1).map((f) => f.filter((_, k) => k !== j))), 0)
}

/** Singular si |det A| ≤ EPS_SINGULAR · escala^n (criterio relativo a la magnitud de los coeficientes). */
export function esSingular(A: Matriz): boolean {
  return Math.abs(determinante(A)) <= EPS_SINGULAR * escalaMatriz(A) ** A.length
}

function permutaciones(n: number): number[][] {
  if (n === 0) return [[]]
  return permutaciones(n - 1).flatMap((p) => Array.from({ length: n }, (_, i) => [...p.slice(0, i), n - 1, ...p.slice(i)]))
}

/**
 * Orden de filas (índices desde 0) que hace A diagonalmente dominante por filas, o null si no existe.
 * La identidad tiene prioridad; entre las demás se elige la primera en orden lexicográfico.
 */
export function permutacionDominante(A: Matriz): number[] | null {
  const n = A.length
  const candidatas = permutaciones(n).sort((p, q) => {
    for (let i = 0; i < n; i++) if (p[i] !== q[i]) return p[i] - q[i]
    return 0
  })
  return candidatas.find((p) => dominanciaDiagonalEstricta(p.map((i) => A[i]))) ?? null
}
