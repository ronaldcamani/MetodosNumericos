import { campo, fmt, type CatalogoTema, type Generador } from './base'

const T = String.raw

function recta(x: number[], y: number[]) {
  const n = x.length
  const mx = x.reduce((s, v) => s + v, 0) / n
  const my = y.reduce((s, v) => s + v, 0) / n
  const sxx = x.reduce((s, v) => s + (v - mx) ** 2, 0)
  const sxy = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0)
  const b1 = sxy / sxx
  return { mx, my, sxx, sxy, b1, b0: my - b1 * mx }
}

const lagrangeBase = (x: number[], i: number, xq: number) => x.reduce((L, xj, j) => (j === i ? L : (L * (xq - xj)) / (x[i] - xj)), 1)

const lineal: Generador = (r) => {
  const x0 = r.entero(0, 5)
  const x1 = x0 + r.entero(2, 4)
  const y0 = r.entero(1, 9)
  const y1 = y0 + r.signo() * r.entero(2, 7)
  const xq = x0 + 0.5 * (x1 - x0) + r.elegir([-0.5, 0, 0.5])
  const p = y0 + ((y1 - y0) / (x1 - x0)) * (xq - x0)
  return {
    titulo: 'Interpolación lineal',
    enunciado: T`Se conocen $(${x0},${y0})$ y $(${x1},${y1})$. Estima $y$ en $x=${fmt(xq, 2)}$ con la recta que pasa por ambos puntos (3 decimales).`,
    campos: [campo('y(x)', p, 3)],
    pasos: [
      T`**Pendiente.** $m=\dfrac{${y1}-${y0}}{${x1}-${x0}}=${fmt((y1 - y0) / (x1 - x0), 4)}$.`,
      T`**Recta.** $y=${y0}+m\,(x-${x0})$.`,
      T`**Evaluar.** $y(${fmt(xq, 2)})=${y0}+${fmt((y1 - y0) / (x1 - x0), 4)}\cdot${fmt(xq - x0, 2)}=${fmt(p, 3)}$.`,
    ],
  }
}

const regresion3: Generador = (r) => {
  const x = [1, 2, 3]
  const y = x.map(() => r.entero(1, 9))
  const { b1, b0, mx, my, sxx, sxy } = recta(x, y)
  return {
    titulo: 'Recta de mínimos cuadrados con 3 puntos',
    enunciado: T`Ajusta $y=b_0+b_1x$ por mínimos cuadrados a los puntos $(1,${y[0]})$, $(2,${y[1]})$, $(3,${y[2]})$. Da $b_1$ y $b_0$ (4 decimales).`,
    campos: [campo('b₁ (pendiente)', b1, 4), campo('b₀ (intercepto)', b0, 4)],
    pasos: [
      T`**Medias.** $\bar x=${fmt(mx, 4)}$ y $\bar y=${fmt(my, 4)}$.`,
      T`**Sumas.** $S_{xx}=\sum(x_i-\bar x)^2=${fmt(sxx, 4)}$ y $S_{xy}=\sum(x_i-\bar x)(y_i-\bar y)=${fmt(sxy, 4)}$.`,
      T`**Pendiente.** $b_1=S_{xy}/S_{xx}=${fmt(b1, 4)}$.`,
      T`**Intercepto.** $b_0=\bar y-b_1\bar x=${fmt(b0, 4)}$.`,
    ],
  }
}

const lagrange3: Generador = (r) => {
  const x0 = r.entero(0, 3)
  const x = [x0, x0 + 1, x0 + 2]
  const y = x.map(() => r.entero(1, 9))
  const xq = x0 + r.elegir([0.5, 1.5])
  const L = x.map((_, i) => lagrangeBase(x, i, xq))
  const P = L.reduce((s, l, i) => s + l * y[i], 0)
  return {
    titulo: 'Polinomio de Lagrange con 3 nodos',
    enunciado: T`Nodos $(${x[0]},${y[0]})$, $(${x[1]},${y[1]})$, $(${x[2]},${y[2]})$. Calcula $L_0(${xq})$, $L_1(${xq})$ y $P(${xq})$ (4 decimales).`,
    campos: [campo(`L₀(${xq})`, L[0], 4), campo(`L₁(${xq})`, L[1], 4), campo(`P(${xq})`, P, 4)],
    pasos: [
      T`**Bases.** $L_i(x)=\prod_{j\ne i}\dfrac{x-x_j}{x_i-x_j}$; valen 1 en su nodo y 0 en los demás.`,
      T`**$L_0$.** $\dfrac{(${xq}-${x[1]})(${xq}-${x[2]})}{(${x[0]}-${x[1]})(${x[0]}-${x[2]})}=${fmt(L[0], 4)}$.`,
      T`**$L_1$ y $L_2$.** $L_1=${fmt(L[1], 4)}$ y $L_2=${fmt(L[2], 4)}$. Comprobación: suman ${fmt(L[0] + L[1] + L[2], 4)} (siempre 1).`,
      T`**Valor.** $P(${xq})=${y[0]}L_0+${y[1]}L_1+${y[2]}L_2=${fmt(P, 4)}$.`,
    ],
  }
}

const regresion4: Generador = (r) => {
  const x = [0, 1, 2, 3]
  const y = x.map((v) => Math.max(0, Math.round(2 + 1.5 * v + r.entero(-2, 2))))
  const xq = r.elegir([4, 5])
  const { b1, b0, mx, my } = recta(x, y)
  return {
    titulo: 'Regresión lineal con 4 puntos',
    enunciado: T`Datos: $x=0,1,2,3$ e $y=${y.join(',\\ ')}$. Ajusta una recta por mínimos cuadrados y predice $y(${xq})$. Da $b_1$, $b_0$ y la predicción (4 decimales).`,
    campos: [campo('b₁', b1, 4), campo('b₀', b0, 4), campo(`y(${xq})`, b0 + b1 * xq, 4)],
    pasos: [
      T`**Medias.** $\bar x=${fmt(mx, 2)}$, $\bar y=${fmt(my, 4)}$.`,
      T`**Pendiente.** $b_1=\dfrac{\sum(x_i-\bar x)(y_i-\bar y)}{\sum(x_i-\bar x)^2}=${fmt(b1, 4)}$.`,
      T`**Intercepto.** $b_0=${fmt(my, 4)}-${fmt(b1, 4)}\cdot${fmt(mx, 2)}=${fmt(b0, 4)}$.`,
      T`**Predicción.** $y(${xq})=${fmt(b0, 4)}+${fmt(b1, 4)}\cdot${xq}=${fmt(b0 + b1 * xq, 4)}$. Como ${xq} está fuera de [0, 3], es una extrapolación: confía menos en ella.`,
    ],
  }
}

const lagrange4: Generador = (r) => {
  const k = r.entero(1, 3)
  const x = [k, k + 1, k + 2, k + 3]
  const f = (v: number) => 1 / v
  const xq = k + 1.5
  const L = x.map((_, i) => lagrangeBase(x, i, xq))
  const P = L.reduce((s, l, i) => s + l * f(x[i]), 0)
  return {
    titulo: 'Lagrange cúbico y su error',
    enunciado: T`Interpola $f(x)=1/x$ con los nodos $x=${x.join(',\\ ')}$ y evalúa en $x=${xq}$. Da $P(${xq})$ y el error $|f(${xq})-P(${xq})|$ (5 decimales).`,
    campos: [campo(`P(${xq})`, P, 5), campo('Error absoluto', Math.abs(f(xq) - P), 5)],
    pasos: [
      T`**Valores en los nodos.** $f=${x.map((v) => fmt(f(v), 5)).join(',\\ ')}$.`,
      T`**Bases en ${xq}.** $L_0=${fmt(L[0], 5)}$, $L_1=${fmt(L[1], 5)}$, $L_2=${fmt(L[2], 5)}$, $L_3=${fmt(L[3], 5)}$ (suman 1).`,
      T`**Polinomio.** $P(${xq})=\sum L_i f(x_i)=${fmt(P, 5)}$.`,
      T`**Error.** $f(${xq})=${fmt(f(xq), 5)}$, luego $|f-P|=${fmt(Math.abs(f(xq) - P), 5)}$. Con 4 nodos el error depende de la cuarta derivada y del producto $\prod(x-x_i)$.`,
    ],
  }
}

const calidadAjuste: Generador = (r) => {
  const x = [1, 2, 3, 4, 5]
  const y = x.map((v) => Math.max(1, Math.round(1 + 2 * v + r.entero(-3, 3))))
  const { b1, b0, my } = recta(x, y)
  const sse = x.reduce((s, v, i) => s + (y[i] - b0 - b1 * v) ** 2, 0)
  const sst = y.reduce((s, v) => s + (v - my) ** 2, 0)
  return {
    titulo: 'Calidad del ajuste: SSE y R²',
    enunciado: T`Para los datos $x=1,2,3,4,5$ e $y=${y.join(',\\ ')}$, ajusta la recta de mínimos cuadrados y calcula $b_1$, la suma de cuadrados del error $SSE$ y el coeficiente $R^2$ (4 decimales).`,
    campos: [campo('b₁', b1, 4), campo('SSE', sse, 4), campo('R²', 1 - sse / sst, 4)],
    pasos: [
      T`**Recta.** $b_1=${fmt(b1, 4)}$ y $b_0=${fmt(b0, 4)}$.`,
      T`**Residuos.** $e_i=y_i-\hat y_i$: ${x.map((v, i) => `$${fmt(y[i] - b0 - b1 * v, 3)}$`).join(', ')} (suman 0).`,
      T`**SSE.** $\sum e_i^2=${fmt(sse, 4)}$.`,
      T`**SST.** $\sum(y_i-\bar y)^2=${fmt(sst, 4)}$ con $\bar y=${fmt(my, 3)}$.`,
      T`**R².** $1-\dfrac{SSE}{SST}=${fmt(1 - sse / sst, 4)}$: ${1 - sse / sst > 0.9 ? 'la recta explica casi toda la variación' : 'la recta explica solo una parte de la variación'}.`,
    ],
  }
}

export const INTERPOLACION: CatalogoTema = {
  basico: [lineal, regresion3],
  intermedio: [lagrange3, regresion4],
  avanzado: [lagrange4, calidadAjuste],
}
