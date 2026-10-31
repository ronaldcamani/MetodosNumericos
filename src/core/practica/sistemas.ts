import { campo, fmt, type Azar, type CatalogoTema, type Generador } from './base'

const T = String.raw
type Mat = number[][]

const matTex = (A: Mat, d = 4) => T`\begin{pmatrix}${A.map((f) => f.map((v) => fmt(v, d)).join('&')).join('\\\\')}\end{pmatrix}`
const termino = (v: number, j: number, primero: boolean) => `${v < 0 ? '-' : primero ? '' : '+'}${Math.abs(v) === 1 ? '' : Math.abs(v)}x_${j + 1}`
const ecuaciones = (A: Mat, b: number[]) =>
  A.map((f, i) => {
    const t: string[] = []
    f.forEach((v, j) => { if (v !== 0) t.push(termino(v, j, t.length === 0)) })
    return `$${t.join('')}=${b[i]}$`
  }).join('; ')
const porVector = (A: Mat, x: number[]) => A.map((f) => f.reduce((s, v, j) => s + v * x[j], 0))

/** Sistema 3×3 con solución entera y pivotes no nulos al eliminar sin intercambios. */
function sistema3(r: Azar): { A: Mat; b: number[]; x: number[] } {
  for (;;) {
    const A = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => r.entero(-3, 4)))
    A[0][0] = r.entero(1, 3)
    const M = A.map((f) => [...f])
    const m21 = M[1][0] / M[0][0]
    const f2 = M[1].map((v, j) => v - m21 * M[0][j])
    const m31 = M[2][0] / M[0][0]
    const f3 = M[2].map((v, j) => v - m31 * M[0][j])
    const piv2 = f2[1]
    if (Math.abs(piv2) < 0.3) continue
    const u33 = f3[2] - (f3[1] / piv2) * f2[2]
    if (Math.abs(u33) < 0.3) continue
    const x = [r.entero(-4, 5), r.entero(-4, 5), r.entero(-4, 5)]
    return { A, b: porVector(A, x), x }
  }
}

const dosPorDos: Generador = (r) => {
  for (;;) {
    const A = [[r.entero(1, 4), r.entero(-3, 4)], [r.entero(-3, 4), r.entero(1, 4)]]
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    if (det === 0 || A[1][0] === 0) continue
    const x = [r.entero(-4, 5), r.entero(-4, 5)]
    const b = porVector(A, x)
    const m = A[1][0] / A[0][0]
    const a22 = A[1][1] - m * A[0][1]
    const b2 = b[1] - m * b[0]
    return {
      titulo: 'Eliminación en un sistema 2×2',
      enunciado: T`Resuelve por eliminación: ${ecuaciones(A, b)}. Da $x_1$ y $x_2$.`,
      campos: [campo('x₁', x[0], 3), campo('x₂', x[1], 3)],
      pasos: [
        T`**Multiplicador.** Para anular $x_1$ en la fila 2: $m=\dfrac{${A[1][0]}}{${A[0][0]}}=${fmt(m, 4)}$.`,
        T`**Fila 2 nueva.** $${fmt(a22, 4)}\,x_2=${fmt(b2, 4)}$ (fila 2 $-\ m\cdot$ fila 1).`,
        T`**Sustitución hacia atrás.** $x_2=\dfrac{${fmt(b2, 4)}}{${fmt(a22, 4)}}=${x[1]}$ y $x_1=\dfrac{${b[0]}-(${A[0][1]})(${x[1]})}{${A[0][0]}}=${x[0]}$.`,
        T`**Comprobación.** En la fila 2: $${A[1][0]}(${x[0]})+${A[1][1]}(${x[1]})=${b[1]}$ ✔.`,
      ],
    }
  }
}

const triangular: Generador = (r) => {
  const U: Mat = [[r.entero(1, 4), r.entero(-3, 3), r.entero(-3, 3)], [0, r.entero(1, 4), r.entero(-3, 3)], [0, 0, r.entero(1, 4)]]
  const x = [r.entero(-4, 5), r.entero(-4, 5), r.entero(-4, 5)]
  const b = porVector(U, x)
  return {
    titulo: 'Sustitución hacia atrás',
    enunciado: T`El sistema triangular superior ${ecuaciones(U, b)} ya está eliminado. Resuélvelo de abajo hacia arriba y da $x_1,x_2,x_3$.`,
    campos: [campo('x₁', x[0], 3), campo('x₂', x[1], 3), campo('x₃', x[2], 3)],
    pasos: [
      T`**Última ecuación.** Solo tiene $x_3$: $x_3=\dfrac{${b[2]}}{${U[2][2]}}=${x[2]}$.`,
      T`**Ecuación 2.** $x_2=\dfrac{${b[1]}-(${U[1][2]})(${x[2]})}{${U[1][1]}}=${x[1]}$.`,
      T`**Ecuación 1.** $x_1=\dfrac{${b[0]}-(${U[0][1]})(${x[1]})-(${U[0][2]})(${x[2]})}{${U[0][0]}}=${x[0]}$.`,
    ],
  }
}

const gauss3: Generador = (r) => {
  const { A, b, x } = sistema3(r)
  const M = A.map((f, i) => [...f, b[i]])
  const m21 = M[1][0] / M[0][0]
  M[1] = M[1].map((v, j) => v - m21 * M[0][j])
  const m31 = M[2][0] / M[0][0]
  M[2] = M[2].map((v, j) => v - m31 * M[0][j])
  const m32 = M[2][1] / M[1][1]
  M[2] = M[2].map((v, j) => v - m32 * M[1][j])
  return {
    titulo: 'Eliminación gaussiana 3×3',
    enunciado: T`Resuelve por eliminación gaussiana (sin intercambio de filas): ${ecuaciones(A, b)}. Da $x_1,x_2,x_3$.`,
    campos: [campo('x₁', x[0], 3), campo('x₂', x[1], 3), campo('x₃', x[2], 3)],
    pasos: [
      T`**Multiplicadores de la columna 1.** $m_{21}=${fmt(A[1][0] / A[0][0], 4)}$ y $m_{31}=${fmt(m31, 4)}$.`,
      T`**Multiplicador de la columna 2.** Tras la primera eliminación, $m_{32}=${fmt(m32, 4)}$.`,
      T`**Matriz triangular $[U\,|\,c]$.** $${matTex(M)}$`,
      T`**Sustitución hacia atrás.** $x_3=${fmt(x[2], 4)}$, $x_2=${fmt(x[1], 4)}$, $x_1=${fmt(x[0], 4)}$.`,
      T`**Comprobación.** $A\mathbf{x}=(${porVector(A, x).join(',\\ ')})$ coincide con $\mathbf{b}$ ✔.`,
    ],
  }
}

/** Sistema 3×3 estrictamente diagonal dominante: Jacobi y Gauss-Seidel convergen. */
function dominante(r: Azar) {
  const A: Mat = [0, 1, 2].map((i) => [0, 1, 2].map((j) => (i === j ? r.entero(8, 12) : r.entero(-3, 3))))
  const b = [r.entero(-10, 20), r.entero(-10, 20), r.entero(-10, 20)]
  return { A, b }
}

function iterar(A: Mat, b: number[], k: number, gs: boolean) {
  let x = [0, 0, 0]
  const hist: number[][] = []
  for (let it = 0; it < k; it++) {
    const nuevo = gs ? [...x] : [0, 0, 0]
    const base = gs ? nuevo : x
    for (let i = 0; i < 3; i++) {
      let s = b[i]
      for (let j = 0; j < 3; j++) if (j !== i) s -= A[i][j] * base[j]
      nuevo[i] = s / A[i][i]
    }
    x = nuevo
    hist.push([...x])
  }
  return hist
}

const jacobi: Generador = (r) => {
  const { A, b } = dominante(r)
  const h = iterar(A, b, 2, false)
  return {
    titulo: 'Dos iteraciones de Jacobi',
    enunciado: T`Para ${ecuaciones(A, b)}, aplica Jacobi desde $\mathbf{x}^{(0)}=\mathbf{0}$. Da $\mathbf{x}^{(2)}=(x_1,x_2,x_3)$ con 4 decimales.`,
    campos: h[1].map((v, i) => campo(`x${'₁₂₃'[i]}⁽²⁾`, v, 4)),
    pasos: [
      T`**Despeje.** $x_i^{(k+1)}=\dfrac{b_i-\sum_{j\ne i}a_{ij}x_j^{(k)}}{a_{ii}}$: todas las componentes nuevas usan solo valores de la iteración anterior.`,
      T`**Iteración 1** (desde $\mathbf 0$): $\mathbf{x}^{(1)}=(${h[0].map((v) => fmt(v, 4)).join(',\\ ')})$.`,
      T`**Iteración 2.** $x_1^{(2)}=\dfrac{${b[0]}-(${A[0][1]})(${fmt(h[0][1], 4)})-(${A[0][2]})(${fmt(h[0][2], 4)})}{${A[0][0]}}=${fmt(h[1][0], 4)}$; análogamente las otras dos.`,
      T`**Resultado.** $\mathbf{x}^{(2)}=(${h[1].map((v) => fmt(v, 4)).join(',\\ ')})$. Converge porque la diagonal domina cada fila.`,
    ],
  }
}

const gaussSeidel: Generador = (r) => {
  const { A, b } = dominante(r)
  const h = iterar(A, b, 2, true)
  return {
    titulo: 'Dos iteraciones de Gauss-Seidel',
    enunciado: T`Para ${ecuaciones(A, b)}, aplica Gauss-Seidel desde $\mathbf{x}^{(0)}=\mathbf{0}$. Da $\mathbf{x}^{(2)}=(x_1,x_2,x_3)$ con 4 decimales.`,
    campos: h[1].map((v, i) => campo(`x${'₁₂₃'[i]}⁽²⁾`, v, 4)),
    pasos: [
      T`**Diferencia con Jacobi.** Cada componente recién calculada se usa de inmediato en las siguientes de la misma iteración.`,
      T`**Iteración 1.** $x_1^{(1)}=${fmt(h[0][0], 4)}$; con ese valor, $x_2^{(1)}=${fmt(h[0][1], 4)}$; y con ambos, $x_3^{(1)}=${fmt(h[0][2], 4)}$.`,
      T`**Iteración 2.** $x_1^{(2)}=${fmt(h[1][0], 4)}$, $x_2^{(2)}=${fmt(h[1][1], 4)}$, $x_3^{(2)}=${fmt(h[1][2], 4)}$.`,
      T`**Resultado.** $\mathbf{x}^{(2)}=(${h[1].map((v) => fmt(v, 4)).join(',\\ ')})$. Suele acercarse a la solución más rápido que Jacobi.`,
    ],
  }
}

const luDoolittle: Generador = (r) => {
  const { A } = sistema3(r)
  const l21 = A[1][0] / A[0][0]
  const l31 = A[2][0] / A[0][0]
  const u22 = A[1][1] - l21 * A[0][1]
  const u23 = A[1][2] - l21 * A[0][2]
  const l32 = (A[2][1] - l31 * A[0][1]) / u22
  const u33 = A[2][2] - l31 * A[0][2] - l32 * u23
  const det = A[0][0] * u22 * u33
  return {
    titulo: 'Factorización LU',
    enunciado: T`Factoriza $A=${matTex(A, 0)}$ como $LU$ (Doolittle, $L$ con unos en la diagonal). Da $l_{21}$, $l_{32}$ y $\det A$ (4 decimales).`,
    campos: [campo('l₂₁', l21, 4), campo('l₃₂', l32, 4), campo('det A', det, 4)],
    pasos: [
      T`**Primera columna de $L$.** $l_{21}=\dfrac{${A[1][0]}}{${A[0][0]}}=${fmt(l21, 4)}$ y $l_{31}=\dfrac{${A[2][0]}}{${A[0][0]}}=${fmt(l31, 4)}$.`,
      T`**Segunda fila de $U$.** $u_{22}=${A[1][1]}-${fmt(l21, 4)}\cdot${A[0][1]}=${fmt(u22, 4)}$ y $u_{23}=${fmt(u23, 4)}$.`,
      T`**$l_{32}$.** $\dfrac{${A[2][1]}-${fmt(l31, 4)}\cdot${A[0][1]}}{${fmt(u22, 4)}}=${fmt(l32, 4)}$.`,
      T`**$u_{33}$.** $${A[2][2]}-${fmt(l31, 4)}\cdot${A[0][2]}-${fmt(l32, 4)}\cdot${fmt(u23, 4)}=${fmt(u33, 4)}$.`,
      T`**Determinante.** $\det A=u_{11}u_{22}u_{33}=${A[0][0]}\cdot${fmt(u22, 4)}\cdot${fmt(u33, 4)}=${fmt(det, 4)}$ (el de $L$ vale 1).`,
    ],
  }
}

export const SISTEMAS: CatalogoTema = {
  basico: [dosPorDos, triangular],
  intermedio: [gauss3, jacobi],
  avanzado: [gaussSeidel, luDoolittle],
}
