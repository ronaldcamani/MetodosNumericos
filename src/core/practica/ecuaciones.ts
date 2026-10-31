import { campo, fmt, type CatalogoTema, type Generador } from './base'

const T = String.raw
const RAICES_DE = [2, 3, 5, 6, 7, 10, 11, 12, 13, 14]

const biseccionUnPaso: Generador = (r) => {
  const N = r.elegir(RAICES_DE)
  const a = Math.floor(Math.sqrt(N))
  const b = a + 1
  const c = (a + b) / 2
  const fc = c * c - N
  const nuevoA = fc < 0 ? c : a
  return {
    titulo: 'Primera iteración de bisección',
    enunciado: T`Se busca una raíz de $f(x)=x^2-${N}$ en $[${a},${b}]$ (hay cambio de signo). Haz una iteración de bisección: calcula el punto medio $c$, $f(c)$ (4 decimales) y el extremo izquierdo del nuevo intervalo.`,
    campos: [campo('c', c, 4), campo('f(c)', fc, 4), campo('Nuevo extremo izquierdo', nuevoA, 4)],
    pasos: [
      T`**Comprobar el intervalo.** $f(${a})=${a * a - N}$ y $f(${b})=${b * b - N}$ tienen signos opuestos.`,
      T`**Punto medio.** $c=\dfrac{${a}+${b}}{2}=${fmt(c, 4)}$.`,
      T`**Evaluar.** $f(c)=${fmt(c, 4)}^2-${N}=${fmt(fc, 4)}$.`,
      T`**Elegir mitad.** ${fc < 0 ? `$f(c)<0$ tiene el signo de $f(${a})$, así que la raíz está en $[c,${b}]$` : `$f(c)>0$ tiene el signo de $f(${b})$, así que la raíz está en $[${a},c]$`}; el extremo izquierdo nuevo es $${fmt(nuevoA, 4)}$.`,
    ],
  }
}

const iteracionesNecesarias: Generador = (r) => {
  const w = r.elegir([1, 2, 4, 8])
  const e = r.elegir([1, 2, 3, 4])
  const tol = 10 ** -e
  const n = Math.ceil(Math.log2(w / tol) - 1e-12)
  return {
    titulo: '¿Cuántas iteraciones?',
    enunciado: T`El intervalo inicial de bisección mide $b-a=${w}$. ¿Cuántas iteraciones garantizan un error menor o igual que $10^{-${e}}$? (entero)`,
    campos: [{ etiqueta: 'Iteraciones n', valor: n, tol: 0 }],
    pasos: [
      T`**Cota del error.** Tras $n$ iteraciones el error es a lo sumo $\dfrac{b-a}{2^n}$.`,
      T`**Condición.** $\dfrac{${w}}{2^n}\le10^{-${e}}\Rightarrow2^n\ge${w * 10 ** e}$.`,
      T`**Despejar.** $n\ge\log_2(${w * 10 ** e})=${fmt(Math.log2(w * 10 ** e), 3)}$.`,
      T`**Respuesta.** Como $n$ es entero, $n=${n}$ (con ${n - 1} no alcanza: $${fmt(w / 2 ** (n - 1), 6)}>10^{-${e}}$).`,
    ],
  }
}

const biseccionTres: Generador = (r) => {
  const N = r.elegir(RAICES_DE)
  const a0 = Math.floor(Math.sqrt(N))
  let [a, b] = [a0, a0 + 1]
  let c = 0
  const filas: string[] = []
  for (let k = 1; k <= 3; k++) {
    c = (a + b) / 2
    const fc = c * c - N
    filas.push(`$k=${k}$: $c_${k}=${fmt(c, 5)}$, $f(c_${k})=${fmt(fc, 5)}$ → ${fc < 0 ? `$[${fmt(c, 5)},${fmt(b, 5)}]$` : `$[${fmt(a, 5)},${fmt(c, 5)}]$`}`)
    if (fc < 0) a = c
    else b = c
  }
  const cota = 1 / 2 ** 3
  return {
    titulo: 'Tres iteraciones de bisección',
    enunciado: T`Aplica 3 iteraciones de bisección a $f(x)=x^2-${N}$ en $[${a0},${a0 + 1}]$. Da la tercera aproximación $c_3$ (5 decimales) y la cota del error $(b-a)/2^3$ (4 decimales).`,
    campos: [campo('c₃', c, 5), campo('Cota del error', cota, 4)],
    pasos: [
      T`**Plan.** En cada iteración: punto medio, signo de $f$ y quedarse con la mitad que conserva el cambio de signo.`,
      ...filas.map((f, i) => `**Iteración ${i + 1}.** ${f}`),
      T`**Cota.** $\dfrac{${a0 + 1}-${a0}}{2^3}=${fmt(cota, 4)}$. El valor real es $\sqrt{${N}}=${fmt(Math.sqrt(N), 5)}$ y $c_3$ queda a $${fmt(Math.abs(Math.sqrt(N) - c), 5)}$.`,
    ],
  }
}

const newtonDos: Generador = (r) => {
  const N = r.elegir(RAICES_DE)
  const x0 = Math.floor(Math.sqrt(N)) + r.elegir([0, 1])
  const x1 = (x0 + N / x0) / 2
  const x2 = (x1 + N / x1) / 2
  return {
    titulo: 'Dos iteraciones de Newton',
    enunciado: T`Aplica el método de Newton a $f(x)=x^2-${N}$ con $x_0=${x0}$. Calcula $x_1$ y $x_2$ (5 decimales).`,
    campos: [campo('x₁', x1, 5), campo('x₂', x2, 5)],
    pasos: [
      T`**Fórmula.** $x_{k+1}=x_k-\dfrac{f(x_k)}{f'(x_k)}=x_k-\dfrac{x_k^2-${N}}{2x_k}=\dfrac{x_k+${N}/x_k}{2}$.`,
      T`**Primera iteración.** $x_1=\dfrac{${x0}+${N}/${x0}}{2}=${fmt(x1, 5)}$.`,
      T`**Segunda iteración.** $x_2=\dfrac{${fmt(x1, 5)}+${N}/${fmt(x1, 5)}}{2}=${fmt(x2, 5)}$.`,
      T`**Control.** $\sqrt{${N}}=${fmt(Math.sqrt(N), 5)}$: el error baja de $${fmt(Math.abs(x1 - Math.sqrt(N)), 5)}$ a $${fmt(Math.abs(x2 - Math.sqrt(N)), 6)}$; las cifras correctas casi se duplican.`,
    ],
  }
}

const secanteDos: Generador = (r) => {
  const N = r.elegir(RAICES_DE)
  const a = Math.floor(Math.sqrt(N))
  const f = (x: number) => x * x - N
  const sec = (p: number, q: number) => q - (f(q) * (q - p)) / (f(q) - f(p))
  const x2 = sec(a, a + 1)
  const x3 = sec(a + 1, x2)
  return {
    titulo: 'Método de la secante',
    enunciado: T`Aplica la secante a $f(x)=x^2-${N}$ con $x_0=${a}$ y $x_1=${a + 1}$. Calcula $x_2$ y $x_3$ (5 decimales).`,
    campos: [campo('x₂', x2, 5), campo('x₃', x3, 5)],
    pasos: [
      T`**Fórmula.** $x_{k+1}=x_k-f(x_k)\dfrac{x_k-x_{k-1}}{f(x_k)-f(x_{k-1})}$ (no necesita la derivada).`,
      T`**Valores.** $f(${a})=${fmt(f(a), 4)}$ y $f(${a + 1})=${fmt(f(a + 1), 4)}$.`,
      T`**$x_2$.** $${a + 1}-${fmt(f(a + 1), 4)}\cdot\dfrac{${a + 1}-${a}}{${fmt(f(a + 1), 4)}-(${fmt(f(a), 4)})}=${fmt(x2, 5)}$.`,
      T`**$x_3$.** Con $x_1=${a + 1}$ y $x_2=${fmt(x2, 5)}$, $f(x_2)=${fmt(f(x2), 5)}$: $x_3=${fmt(x3, 5)}$. La raíz es $${fmt(Math.sqrt(N), 5)}$.`,
    ],
  }
}

const hornerDeflacion: Generador = (r) => {
  let rs: number[]
  do rs = [0, 0, 0].map(() => r.elegir([-4, -3, -2, -1, 1, 2, 3, 4]))
  while (new Set(rs).size < 3)
  const [r1, r2, r3] = rs
  const alfa = -(r1 + r2 + r3)
  const beta = r1 * r2 + r1 * r3 + r2 * r3
  const gamma = -r1 * r2 * r3
  const b1 = alfa + r1
  const b0 = beta + r1 * b1
  const resto = gamma + r1 * b0
  const mayor = Math.max(r2, r3)
  const signo = (k: number, primero = false) => (k < 0 ? `-${-k}` : primero ? `${k}` : `+${k}`)
  const coef = (k: number) => (Math.abs(k) === 1 ? (k < 0 ? '-' : '+') : signo(k))
  const poli = T`x^3${alfa ? `${coef(alfa)}x^2` : ''}${beta ? `${coef(beta)}x` : ''}${gamma ? signo(gamma) : ''}`
  return {
    titulo: 'Horner y deflación',
    enunciado: T`Sea $p(x)=${poli}$. Con la división sintética (Horner) por $(x-${r1})$ calcula $p(${r1})$, el término independiente del cociente $q(x)$ y la mayor de las raíces restantes de $q$.`,
    campos: [{ etiqueta: `p(${r1})`, valor: resto, tol: 1e-9 }, { etiqueta: 'Término independiente de q', valor: b0, tol: 1e-9 }, { etiqueta: 'Mayor raíz de q', valor: mayor, tol: 1e-6 }],
    pasos: [
      T`**Coeficientes.** $p$: $1,\ ${alfa},\ ${beta},\ ${gamma}$. Se usa $c=${r1}$.`,
      T`**Horner.** $b_2=1$; $b_1=${alfa}+${r1}\cdot1=${b1}$; $b_0=${beta}+${r1}\cdot(${b1})=${b0}$; resto $=${gamma}+${r1}\cdot(${b0})=${resto}$.`,
      T`**Lectura.** El resto es $p(${r1})=${resto}$, así que ${resto === 0 ? `$${r1}$ es una raíz y $p(x)=(x-${r1})q(x)$` : 'no es raíz'}. El cociente es $q(x)=x^2${signo(b1)}x${signo(b0)}$.`,
      T`**Raíces de $q$.** $x^2${signo(b1)}x${signo(b0)}=0$ da $x=${r2}$ y $x=${r3}$; la mayor es $${mayor}$.`,
    ],
  }
}

export const ECUACIONES: CatalogoTema = {
  basico: [biseccionUnPaso, iteracionesNecesarias],
  intermedio: [biseccionTres, newtonDos],
  avanzado: [secanteDos, hornerDeflacion],
}
