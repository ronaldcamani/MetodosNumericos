import { campo, fmt, type CatalogoTema, type Generador } from './base'

const T = String.raw
/** Coeficiente delante de una variable: 1 → «», −1 → «-». */
const co = (a: number) => (a === 1 ? '' : a === -1 ? '-' : String(a))

const eulerPaso = (f: (t: number, y: number) => number, t: number, y: number, h: number) => y + h * f(t, y)
const rk4Paso = (f: (t: number, y: number) => number, t: number, y: number, h: number) => {
  const k1 = f(t, y)
  const k2 = f(t + h / 2, y + (h / 2) * k1)
  const k3 = f(t + h / 2, y + (h / 2) * k2)
  const k4 = f(t + h, y + h * k3)
  return { k: [k1, k2, k3, k4], y1: y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4) }
}

const eulerUnPaso: Generador = (r) => {
  const a = r.elegir([-2, -1, 0.5, 1])
  const y0 = r.elegir([1, 2, 4])
  const h = r.elegir([0.1, 0.2, 0.5])
  const f = (_: number, y: number) => a * y
  const y1 = eulerPaso(f, 0, y0, h)
  const ex = y0 * Math.exp(a * h)
  return {
    titulo: 'Un paso de Euler',
    enunciado: T`Para $y'=${co(a)}y$ con $y(0)=${y0}$, da un paso de Euler con $h=${h}$. Calcula $y_1$ y el error respecto de la solución exacta $y(t)=${co(y0)}e^{${co(a)}t}$ (4 decimales).`,
    campos: [campo('y₁', y1, 4), campo('Error absoluto', Math.abs(ex - y1), 4)],
    pasos: [
      T`**Fórmula.** $y_{n+1}=y_n+h\,f(t_n,y_n)$ con $f(t,y)=${co(a)}y$.`,
      T`**Pendiente en el inicio.** $f(0,${y0})=${fmt(a * y0, 4)}$.`,
      T`**Paso.** $y_1=${y0}+${h}\cdot(${fmt(a * y0, 4)})=${fmt(y1, 4)}$.`,
      T`**Error.** Exacto: $y(${h})=${y0}e^{${fmt(a * h, 3)}}=${fmt(ex, 4)}$; $E=${fmt(Math.abs(ex - y1), 4)}$.`,
    ],
  }
}

const eulerDosPasos: Generador = (r) => {
  const y0 = r.elegir([1, 2, 3])
  const h = r.elegir([0.5, 0.25])
  const f = (t: number, y: number) => t - y
  const y1 = eulerPaso(f, 0, y0, h)
  const y2 = eulerPaso(f, h, y1, h)
  return {
    titulo: 'Dos pasos de Euler',
    enunciado: T`Resuelve $y'=t-y$, $y(0)=${y0}$ con Euler y $h=${h}$. Calcula $y_1$ y $y_2$ (4 decimales).`,
    campos: [campo('y₁', y1, 4), campo('y₂', y2, 4)],
    pasos: [
      T`**Paso 1** ($t_0=0$). $f(0,${y0})=0-${y0}=${-y0}$; $y_1=${y0}+${h}(${-y0})=${fmt(y1, 4)}$.`,
      T`**Paso 2** ($t_1=${h}$). $f(${h},${fmt(y1, 4)})=${h}-${fmt(y1, 4)}=${fmt(f(h, y1), 4)}$.`,
      T`**Resultado.** $y_2=${fmt(y1, 4)}+${h}(${fmt(f(h, y1), 4)})=${fmt(y2, 4)}$.`,
    ],
  }
}

const eulerTresPasos: Generador = (r) => {
  const y0 = r.elegir([0, 1, 2])
  const h = r.elegir([0.1, 0.2])
  const f = (t: number, y: number) => t + y
  let y = y0
  const filas: string[] = []
  for (let n = 0; n < 3; n++) {
    const t = n * h
    const yn = eulerPaso(f, t, y, h)
    filas.push(`**Paso ${n + 1}.** $t_${n}=${fmt(t, 2)}$: $f=${fmt(f(t, y), 5)}$ → $y_${n + 1}=${fmt(yn, 5)}$.`)
    y = yn
  }
  const ex = (y0 + 1) * Math.exp(3 * h) - 3 * h - 1
  return {
    titulo: 'Tres pasos de Euler',
    enunciado: T`Para $y'=t+y$, $y(0)=${y0}$ (solución exacta $y=${y0 + 1}e^t-t-1$) aplica Euler con $h=${h}$ hasta $t=${fmt(3 * h, 1)}$. Da $y_3$ y el error (5 decimales).`,
    campos: [campo('y₃', y, 5), campo('Error absoluto', Math.abs(ex - y), 5)],
    pasos: [T`**Idea.** Repetir $y_{n+1}=y_n+h(t_n+y_n)$ tres veces.`, ...filas, T`**Error.** Exacto $y(${fmt(3 * h, 1)})=${fmt(ex, 5)}$; $E=${fmt(Math.abs(ex - y), 5)}$. Es el error global, que se va acumulando paso a paso.`],
  }
}

const rk4Lineal: Generador = (r) => {
  const a = r.elegir([-2, -1, 1, 2])
  const y0 = r.elegir([1, 2])
  const h = r.elegir([0.1, 0.2, 0.25])
  const { k, y1 } = rk4Paso((_, y) => a * y, 0, y0, h)
  return {
    titulo: 'Un paso de Runge-Kutta 4',
    enunciado: T`Para $y'=${co(a)}y$, $y(0)=${y0}$, da un paso de RK4 con $h=${h}$. Calcula $k_2$, $k_4$ y $y_1$ (6 decimales).`,
    campos: [campo('k₂', k[1], 6), campo('k₄', k[3], 6), campo('y₁', y1, 6)],
    pasos: [
      T`**Fórmulas.** $k_1=f(t,y)$; $k_2=f(t+\tfrac h2,\,y+\tfrac h2k_1)$; $k_3=f(t+\tfrac h2,\,y+\tfrac h2k_2)$; $k_4=f(t+h,\,y+hk_3)$.`,
      T`**$k_1$ y $k_2$.** $k_1=${fmt(k[0], 6)}$; $k_2=${a}\,(${y0}+${h / 2}\cdot${fmt(k[0], 6)})=${fmt(k[1], 6)}$.`,
      T`**$k_3$ y $k_4$.** $k_3=${fmt(k[2], 6)}$; $k_4=${a}\,(${y0}+${h}\cdot${fmt(k[2], 6)})=${fmt(k[3], 6)}$.`,
      T`**Combinar.** $y_1=y_0+\dfrac h6(k_1+2k_2+2k_3+k_4)=${fmt(y1, 6)}$. La solución exacta es $${fmt(y0 * Math.exp(a * h), 6)}$.`,
    ],
  }
}

const rk4Mixto: Generador = (r) => {
  const y0 = r.elegir([0, 1])
  const h = r.elegir([0.2, 0.5])
  const f = (t: number, y: number) => t + y
  const { k, y1 } = rk4Paso(f, 0, y0, h)
  const ex = (y0 + 1) * Math.exp(h) - h - 1
  return {
    titulo: 'RK4 con dependencia de t',
    enunciado: T`Para $y'=t+y$, $y(0)=${y0}$, da un paso de RK4 con $h=${h}$. Calcula $k_2$, $k_3$ y $y_1$ (6 decimales).`,
    campos: [campo('k₂', k[1], 6), campo('k₃', k[2], 6), campo('y₁', y1, 6)],
    pasos: [
      T`**$k_1$.** $f(0,${y0})=${fmt(k[0], 6)}$.`,
      T`**$k_2$.** Punto medio en $t$ ($${h / 2}$) y en $y$ ($${y0}+${h / 2}\cdot${fmt(k[0], 6)}$): $k_2=${fmt(k[1], 6)}$.`,
      T`**$k_3$ y $k_4$.** $k_3=${fmt(k[2], 6)}$ (otra vez en el punto medio, con $k_2$); $k_4=${fmt(k[3], 6)}$ (en $t=${h}$).`,
      T`**Combinar.** $y_1=${y0}+\dfrac{${h}}{6}(${fmt(k[0], 4)}+2\cdot${fmt(k[1], 4)}+2\cdot${fmt(k[2], 4)}+${fmt(k[3], 4)})=${fmt(y1, 6)}$. Exacto: $${fmt(ex, 6)}$; error $${fmt(Math.abs(ex - y1), 7)}$.`,
    ],
  }
}

const estabilidadEuler: Generador = (r) => {
  const lam = r.elegir([5, 10, 20, 50])
  const hs = [0.01, 0.02, 0.05, 0.1, 0.2, 0.3].filter((h) => h * lam > 0.5 && h * lam < 4 && Math.abs(h * lam - 1) > 1e-9)
  const h = r.elegir(hs)
  const R = 1 - lam * h
  const y5 = R ** 5
  const hmax = 2 / lam
  const estable = Math.abs(R) < 1
  return {
    titulo: 'Estabilidad de Euler',
    enunciado: T`Para $y'=-${lam}\,y$, $y(0)=1$, Euler con $h=${h}$ multiplica la solución por un factor $R$ en cada paso. Da $R$, el paso máximo estable $h_{max}$ y $y_5$ (4 decimales).`,
    campos: [campo('R = 1 − λh', R, 4), campo('h máximo estable', hmax, 4), campo('y₅', y5, 4)],
    pasos: [
      T`**Factor por paso.** $y_{n+1}=y_n+h(-${lam}y_n)=(1-${lam}h)\,y_n$, así que $R=1-${lam}\cdot${h}=${fmt(R, 4)}$.`,
      T`**Condición.** El método es estable si $|R|<1$, es decir $0<h<\dfrac{2}{\lambda}=${fmt(hmax, 4)}$.`,
      T`**Crecimiento.** $y_5=R^5=${fmt(y5, 4)}$.`,
      T`**Lectura.** Con $h=${h}$ ${estable ? 'se cumple $|R|<1$: la solución decae como la exacta' : `$|R|=${fmt(Math.abs(R), 3)}>1$: Euler es inestable, los valores oscilan y crecen aunque la solución exacta tienda a 0`}.`,
    ],
  }
}

export const DIFERENCIALES: CatalogoTema = {
  basico: [eulerUnPaso, eulerDosPasos],
  intermedio: [eulerTresPasos, rk4Lineal],
  avanzado: [rk4Mixto, estabilidadEuler],
}
