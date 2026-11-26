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

/** Norma infinito matricial ‖A‖∞ = máx_i Σ_j |a_ij|. */
export function normaMatrizInf(A: Matriz): number {
  return A.reduce((maxFila, fila) => Math.max(maxFila, fila.reduce((s, a) => s + Math.abs(a), 0)), 0)
}

/** Matriz de Hilbert H_{ij} = 1 / (i + j + 1) de tamaño n ∈ {2, 3, 4} (referencia clásica de mal condicionamiento). */
export function matrizHilbert(n: 2 | 3 | 4): Matriz {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => 1 / (i + j + 1)))
}

/** Inversa A⁻¹ mediante Gauss-Jordan con pivoteo parcial; devuelve null si A es singular. */
export function invertirMatriz(A: Matriz): Matriz | null {
  const n = A.length
  if (n === 0 || A.some((f) => f.length !== n)) return null
  const escala = escalaMatriz(A)
  if (escala === 0) return null

  const aug: Matriz = A.map((fila, i) => [
    ...fila,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ])

  for (let k = 0; k < n; k++) {
    let fp = k
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(aug[i][k]) > Math.abs(aug[fp][k])) fp = i
    }
    if (Math.abs(aug[fp][k]) <= EPS_SINGULAR * escala) return null
    if (fp !== k) [aug[k], aug[fp]] = [aug[fp], aug[k]]

    const piv = aug[k][k]
    for (let j = k; j < 2 * n; j++) aug[k][j] /= piv
    for (let i = 0; i < n; i++) {
      if (i === k) continue
      const factor = aug[i][k]
      if (factor === 0) continue
      for (let j = k; j < 2 * n; j++) aug[i][j] -= factor * aug[k][j]
    }
  }

  const inv = aug.map((fila) => fila.slice(n))
  return inv.every((fila) => fila.every(Number.isFinite)) ? inv : null
}

export interface AnalisisCondicionamiento {
  normaA: number
  normaAInv: number
  kappaInf: number
  malCondicionado: boolean
  nivel: 'bien_condicionado' | 'moderado' | 'mal_condicionado'
  inversa: Matriz
}

/** Calcula κ∞(A) = ‖A‖∞ · ‖A⁻¹‖∞ para n ∈ {2, 3, 4} y clasifica el condicionamiento (alerta si κ∞ > 10⁴). */
export function numeroCondicionInf(A: Matriz): AnalisisCondicionamiento | null {
  const inversa = invertirMatriz(A)
  if (!inversa) return null
  const normaA = normaMatrizInf(A)
  const normaAInv = normaMatrizInf(inversa)
  const kappaInf = normaA * normaAInv
  if (!Number.isFinite(kappaInf)) return null
  const malCondicionado = kappaInf > 1e4
  const nivel: AnalisisCondicionamiento['nivel'] = malCondicionado
    ? 'mal_condicionado'
    : kappaInf > 100
      ? 'moderado'
      : 'bien_condicionado'
  return { normaA, normaAInv, kappaInf, malCondicionado, nivel, inversa }
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

/** Singular si tiene fila o columna nula, o si |det(A_normalizada)| ≤ EPS_SINGULAR tras equilibrar filas por su norma ∞. */
export function esSingular(A: Matriz): boolean {
  const n = A.length
  if (n === 0) return true
  const normas = A.map((fila) => normaInf(fila))
  if (normas.some((r) => r === 0 || !Number.isFinite(r))) return true
  const normalizada = A.map((fila, i) => fila.map((v) => v / normas[i]))
  for (let j = 0; j < n; j++) {
    let maxCol = 0
    for (let i = 0; i < n; i++) maxCol = Math.max(maxCol, Math.abs(normalizada[i][j]))
    if (maxCol === 0) return true
  }
  return Math.abs(determinante(normalizada)) <= EPS_SINGULAR
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
