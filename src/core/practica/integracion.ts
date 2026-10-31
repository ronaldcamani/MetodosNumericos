import { campo, fmt, type CatalogoTema, type Generador } from './base'

const T = String.raw

interface Fn { tex: string; f: (x: number) => number; F: (x: number) => number; df?: (x: number) => number }
const POTENCIAS: Fn[] = [
  { tex: 'x^2', f: (x) => x * x, F: (x) => x ** 3 / 3, df: (x) => 2 * x },
  { tex: 'x^3', f: (x) => x ** 3, F: (x) => x ** 4 / 4, df: (x) => 3 * x * x },
]
const INVERSA: Fn = { tex: '1/x', f: (x) => 1 / x, F: Math.log }
const trapecioCompuesto = (f: (x: number) => number, a: number, b: number, n: number) => {
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += 2 * f(a + i * h)
  return (h / 2) * s
}
const simpsonCompuesto = (f: (x: number) => number, a: number, b: number, n: number) => {
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h)
  return (h / 3) * s
}

const trapecioSimple: Generador = (r) => {
  const fn = r.elegir(POTENCIAS)
  const a = r.entero(0, 2)
  const b = a + r.entero(1, 3)
  const T1 = ((b - a) / 2) * (fn.f(a) + fn.f(b))
  const ex = fn.F(b) - fn.F(a)
  return {
    titulo: 'Regla del trapecio simple',
    enunciado: T`Aproxima $\displaystyle\int_{${a}}^{${b}}${fn.tex}\,dx$ con la regla del trapecio (un solo trapecio). Da la aproximación y el error respecto del valor exacto (4 decimales).`,
    campos: [campo('Trapecio', T1, 4), campo('Error absoluto', Math.abs(ex - T1), 4)],
    pasos: [
      T`**Fórmula.** $T=\dfrac{b-a}{2}\,[f(a)+f(b)]$.`,
      T`**Valores.** $f(${a})=${fmt(fn.f(a), 4)}$ y $f(${b})=${fmt(fn.f(b), 4)}$.`,
      T`**Aproximación.** $T=\dfrac{${b - a}}{2}(${fmt(fn.f(a), 4)}+${fmt(fn.f(b), 4)})=${fmt(T1, 4)}$.`,
      T`**Error.** El valor exacto es $${fmt(ex, 4)}$, así que $E=${fmt(Math.abs(ex - T1), 4)}$. El trapecio sobrestima las funciones convexas.`,
    ],
  }
}

const derivadaAdelante: Generador = (r) => {
  const fn = r.elegir(POTENCIAS)
  const x0 = r.entero(1, 4)
  const h = r.elegir([0.1, 0.05, 0.2])
  const D = (fn.f(x0 + h) - fn.f(x0)) / h
  const ex = fn.df!(x0)
  return {
    titulo: 'Derivada por diferencia hacia adelante',
    enunciado: T`Para $f(x)=${fn.tex}$ estima $f'(${x0})$ con la diferencia hacia adelante y $h=${h}$. Da la estimación y su error absoluto (5 decimales).`,
    campos: [campo("Estimación de f'", D, 5), campo('Error absoluto', Math.abs(D - ex), 5)],
    pasos: [
      T`**Fórmula.** $f'(x_0)\approx\dfrac{f(x_0+h)-f(x_0)}{h}$.`,
      T`**Valores.** $f(${fmt(x0 + h, 3)})=${fmt(fn.f(x0 + h), 5)}$ y $f(${x0})=${fmt(fn.f(x0), 5)}$.`,
      T`**Cociente.** $\dfrac{${fmt(fn.f(x0 + h), 5)}-${fmt(fn.f(x0), 5)}}{${h}}=${fmt(D, 5)}$.`,
      T`**Error.** La derivada exacta es $${fmt(ex, 5)}$ y el error $${fmt(Math.abs(D - ex), 5)}$; es de orden $O(h)$: con $h$ diez veces menor, el error baja unas diez veces.`,
    ],
  }
}

const trapecioCompuestoP: Generador = (r) => {
  const a = r.elegir([1, 1, 2])
  const b = a + r.elegir([1, 2, 3])
  const n = r.elegir([4, 5])
  const Tn = trapecioCompuesto(INVERSA.f, a, b, n)
  const ex = INVERSA.F(b) - INVERSA.F(a)
  const h = (b - a) / n
  return {
    titulo: 'Trapecio compuesto',
    enunciado: T`Aproxima $\displaystyle\int_{${a}}^{${b}}\dfrac{dx}{x}$ con la regla del trapecio compuesta y $n=${n}$ subintervalos. Da $T_{${n}}$ y su error respecto de $\ln${b}-\ln${a}$ (5 decimales).`,
    campos: [campo(`T${n}`, Tn, 5), campo('Error absoluto', Math.abs(ex - Tn), 5)],
    pasos: [
      T`**Paso.** $h=\dfrac{${b}-${a}}{${n}}=${fmt(h, 4)}$; nodos $x_i=${a}+ih$.`,
      T`**Valores.** ${Array.from({ length: n + 1 }, (_, i) => `$f(${fmt(a + i * h, 3)})=${fmt(1 / (a + i * h), 5)}$`).join(', ')}.`,
      T`**Fórmula.** $T_n=\dfrac h2\,[f_0+2(f_1+\dots+f_{n-1})+f_n]=${fmt(Tn, 5)}$.`,
      T`**Error.** Exacto $=${fmt(ex, 5)}$; $E=${fmt(Math.abs(ex - Tn), 5)}$. Duplicar $n$ divide el error entre ≈4.`,
    ],
  }
}

const simpsonSimple: Generador = (r) => {
  const b = r.elegir([2, 3, 4])
  const f = (x: number) => x ** 4
  const m = b / 2
  const S = (b / 6) * (f(0) + 4 * f(m) + f(b))
  const ex = b ** 5 / 5
  return {
    titulo: 'Simpson 1/3 simple',
    enunciado: T`Aproxima $\displaystyle\int_0^{${b}}x^4\,dx$ con Simpson 1/3 (dos subintervalos, punto medio incluido). Da la aproximación y el error (4 decimales).`,
    campos: [campo('Simpson', S, 4), campo('Error absoluto', Math.abs(ex - S), 4)],
    pasos: [
      T`**Fórmula.** $S=\dfrac{b-a}{6}\,[f(a)+4f(m)+f(b)]$ con $m=\dfrac{a+b}{2}=${m}$.`,
      T`**Valores.** $f(0)=0$, $f(${m})=${fmt(f(m), 4)}$, $f(${b})=${fmt(f(b), 4)}$.`,
      T`**Aproximación.** $S=\dfrac{${b}}{6}(0+4\cdot${fmt(f(m), 4)}+${fmt(f(b), 4)})=${fmt(S, 4)}$.`,
      T`**Error.** Exacto $=${b}^5/5=${fmt(ex, 4)}$; $E=${fmt(Math.abs(ex - S), 4)}$. Simpson es exacto hasta grado 3; $x^4$ ya no lo es.`,
    ],
  }
}

const simpsonCompuestoP: Generador = (r) => {
  const a = 1
  const b = r.elegir([2, 3, 4])
  const n = r.elegir([2, 4])
  const S = simpsonCompuesto(INVERSA.f, a, b, n)
  const ex = Math.log(b)
  const h = (b - a) / n
  return {
    titulo: 'Simpson compuesto',
    enunciado: T`Aproxima $\ln ${b}=\displaystyle\int_1^{${b}}\dfrac{dx}{x}$ con Simpson compuesto y $n=${n}$. Da $S_{${n}}$ y su error (6 decimales).`,
    campos: [campo(`S${n}`, S, 6), campo('Error absoluto', Math.abs(ex - S), 6)],
    pasos: [
      T`**Condición.** $n$ debe ser par: $n=${n}$ ✔. Paso $h=\dfrac{${b}-1}{${n}}=${fmt(h, 4)}$.`,
      T`**Pesos.** Los nodos interiores alternan 4 y 2: ${Array.from({ length: n + 1 }, (_, i) => (i === 0 || i === n ? 1 : i % 2 ? 4 : 2)).join(', ')}.`,
      T`**Valores.** $f_i=${Array.from({ length: n + 1 }, (_, i) => fmt(1 / (a + i * h), 6)).join(',\\ ')}$.`,
      T`**Suma.** $S_n=\dfrac h3\sum w_if_i=${fmt(S, 6)}$.`,
      T`**Error.** $\ln${b}=${fmt(ex, 6)}$; $E=${fmt(Math.abs(ex - S), 6)}$.`,
    ],
  }
}

const diferenciaCentral: Generador = (r) => {
  const x0 = r.elegir([0, 1])
  const h = r.elegir([0.1, 0.2, 0.5])
  const D = (Math.exp(x0 + h) - Math.exp(x0 - h)) / (2 * h)
  const ex = Math.exp(x0)
  return {
    titulo: 'Diferencia central',
    enunciado: T`Para $f(x)=e^x$ estima $f'(${x0})$ con la diferencia central y $h=${h}$. Da la estimación y su error (5 decimales).`,
    campos: [campo("Estimación de f'", D, 5), campo('Error absoluto', Math.abs(D - ex), 5)],
    pasos: [
      T`**Fórmula.** $f'(x_0)\approx\dfrac{f(x_0+h)-f(x_0-h)}{2h}$, de orden $O(h^2)$.`,
      T`**Valores.** $f(${fmt(x0 + h, 2)})=${fmt(Math.exp(x0 + h), 5)}$ y $f(${fmt(x0 - h, 2)})=${fmt(Math.exp(x0 - h), 5)}$.`,
      T`**Cociente.** $\dfrac{${fmt(Math.exp(x0 + h), 5)}-${fmt(Math.exp(x0 - h), 5)}}{${fmt(2 * h, 2)}}=${fmt(D, 5)}$.`,
      T`**Error.** Exacto $e^{${x0}}=${fmt(ex, 5)}$, error $${fmt(Math.abs(D - ex), 5)}$. Con la diferencia hacia adelante y el mismo $h$ el error sería ${fmt(Math.abs((Math.exp(x0 + h) - Math.exp(x0)) / h - ex), 5)}: la central es más precisa.`,
    ],
  }
}

export const INTEGRACION: CatalogoTema = {
  basico: [trapecioSimple, derivadaAdelante],
  intermedio: [trapecioCompuestoP, simpsonSimple],
  avanzado: [simpsonCompuestoP, diferenciaCentral],
}
