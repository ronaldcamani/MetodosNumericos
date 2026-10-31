import { campo, fmt, type CatalogoTema, type Generador } from './base'

const T = String.raw

const exponente = (x: number) => Math.floor(Math.log10(Math.abs(x)))
/** Redondea a t cifras significativas. */
const redondear = (x: number, t: number) => (x === 0 ? 0 : Number(x.toPrecision(t)))
/** Trunca a t cifras significativas. */
const truncar = (x: number, t: number) => {
  if (x === 0) return 0
  const f = 10 ** (t - 1 - exponente(x))
  return Math.trunc(x * f + Math.sign(x) * 1e-9) / f
}

const errorAbsRel: Generador = (r) => {
  const x = r.entero(20, 95)
  const xa = Number((x + r.signo() * r.decimal(0.2, 3, 1)).toFixed(1))
  const ea = Math.abs(x - xa)
  const er = (ea / Math.abs(x)) * 100
  return {
    titulo: 'Error absoluto y relativo',
    enunciado: T`El valor verdadero de una medida es $x=${x}$ y se aproxima por $\tilde x=${fmt(xa, 1)}$. Calcula el error absoluto (1 decimal) y el error relativo porcentual (3 decimales).`,
    campos: [campo('Error absoluto', ea, 1), campo('Error relativo (%)', er, 3)],
    pasos: [
      T`**Definiciones.** $E_{abs}=|x-\tilde x|$ y $E_{rel}=\dfrac{E_{abs}}{|x|}\cdot100\,\%$.`,
      T`**Error absoluto.** $|${x}-${fmt(xa, 1)}|=${fmt(ea, 1)}$.`,
      T`**Error relativo.** $\dfrac{${fmt(ea, 1)}}{${x}}\cdot100=${fmt(er, 3)}\,\%$.`,
    ],
  }
}

const redondeoDecimales: Generador = (r) => {
  const x = r.decimal(1, 9, 5)
  const d = r.elegir([2, 3])
  const xr = Number(x.toFixed(d))
  const ea = Math.abs(x - xr)
  return {
    titulo: 'Redondeo a d decimales',
    enunciado: T`Redondea $x=${fmt(x, 5)}$ a ${d} decimales y calcula el error absoluto del redondeo (5 decimales).`,
    campos: [{ etiqueta: `x redondeado a ${d} decimales`, valor: xr, tol: 1e-9 }, campo('Error absoluto', ea, 5)],
    pasos: [
      T`**Redondeo.** Se mira la cifra siguiente a la ${d}.ª decimal: si es 5 o más, la anterior sube. Resultado: $\tilde x=${fmt(xr, d)}$.`,
      T`**Error.** $|${fmt(x, 5)}-${fmt(xr, d)}|=${fmt(ea, 5)}$.`,
      T`**Control.** En un redondeo a ${d} decimales el error nunca supera $0.5\cdot10^{-${d}}=${fmt(0.5 * 10 ** -d, d + 1)}$; aquí se cumple.`,
    ],
  }
}

const APROX: [string, number, number[]][] = [
  ['\\pi', Math.PI, [3.14, 3.1416, 3.142, 3.14159, 3.1, 3.15]],
  ['e', Math.E, [2.7, 2.718, 2.72, 2.7183, 2.71, 2.8]],
  ['\\sqrt2', Math.SQRT2, [1.41, 1.414, 1.4142, 1.4, 1.42]],
]
const cifrasCorrectas: Generador = (r) => {
  const [nombre, x, opciones] = r.elegir(APROX)
  const xa = r.elegir(opciones)
  const ea = Math.abs(x - xa)
  const m = exponente(x)
  let n = 0
  for (let k = 1; k <= 10; k++) if (ea < 0.5 * 10 ** (m - k + 1)) n = k
  return {
    titulo: 'Cifras significativas correctas',
    enunciado: T`¿Cuántas cifras significativas correctas tiene $\tilde x=${xa}$ como aproximación de $${nombre}=${fmt(x, 8)}\ldots$? (un entero; 0 si ninguna)`,
    campos: [{ etiqueta: 'Cifras correctas', valor: n, tol: 0 }],
    pasos: [
      T`**Error absoluto.** $E_{abs}=|${fmt(x, 8)}-${xa}|\approx${ea.toExponential(3)}$.`,
      T`**Criterio.** $\tilde x$ tiene $n$ cifras correctas si $E_{abs}<0.5\cdot10^{m-n+1}$, con $m=${m}$ el exponente de la primera cifra.`,
      T`**Búsqueda de $n$.** Para $n=${n}$ el límite es $${(0.5 * 10 ** (m - n + 1)).toExponential(1)}$ y se cumple${n < 10 ? T`; para $n=${n + 1}$ el límite es $${(0.5 * 10 ** (m - n)).toExponential(1)}$ y ya no` : ''}.`,
      T`**Respuesta.** ${n} cifras significativas correctas.`,
    ],
  }
}

const sumaTCifras: Generador = (r) => {
  const t = r.elegir([3, 4])
  const a = r.decimal(10, 99, 3)
  const b = r.decimal(1, 9, 4)
  const modo = r.elegir(['redondeo', 'truncamiento'] as const)
  const f = modo === 'redondeo' ? redondear : truncar
  const [ta, tb] = [f(a, t), f(b, t)]
  const s = f(ta + tb, t)
  const ea = Math.abs(a + b - s)
  return {
    titulo: `Suma con ${t} cifras (${modo})`,
    enunciado: T`Una máquina trabaja con ${t} cifras significativas y usa ${modo}. Suma $a=${fmt(a, 3)}$ y $b=${fmt(b, 4)}$: primero guarda cada número, luego suma y vuelve a ${modo === 'redondeo' ? 'redondear' : 'truncar'}. Da el resultado y su error absoluto respecto de la suma exacta (4 decimales).`,
    campos: [{ etiqueta: 'Resultado de la máquina', valor: s, tol: 1e-6 }, campo('Error absoluto', ea, 4)],
    pasos: [
      T`**Guardar los datos.** $a\to${fmt(ta, 4)}$ y $b\to${fmt(tb, 4)}$ (${t} cifras, ${modo}).`,
      T`**Sumar.** $${fmt(ta, 4)}+${fmt(tb, 4)}=${fmt(ta + tb, 5)}$.`,
      T`**Guardar el resultado.** Con ${t} cifras queda $${fmt(s, 4)}$.`,
      T`**Error.** La suma exacta es $${fmt(a + b, 4)}$; $E_{abs}=|${fmt(a + b, 4)}-${fmt(s, 4)}|=${fmt(ea, 4)}$.`,
    ],
  }
}

const taylorExp: Generador = (r) => {
  const x = r.elegir([1, 1.5, 2])
  const n = r.elegir([3, 4, 5])
  let p = 0
  let term = 1
  const terms: string[] = []
  for (let k = 0; k < n; k++) {
    p += term
    terms.push(fmt(term, 6))
    term = (term * x) / (k + 1)
  }
  const e = Math.abs(Math.exp(x) - p)
  return {
    titulo: 'Truncamiento de la serie de Taylor',
    enunciado: T`Aproxima $e^{${x}}$ con los primeros ${n} términos de su serie de Maclaurin $\sum x^k/k!$. Da la aproximación (6 decimales) y el error de truncamiento real $|e^{${x}}-P|$ (5 decimales).`,
    campos: [campo('Aproximación P', p, 6), campo('Error de truncamiento', e, 5)],
    pasos: [
      T`**Términos.** $x^k/k!$ para $k=0,\dots,${n - 1}$ con $x=${x}$: ${terms.map((t) => `$${t}$`).join(', ')}.`,
      T`**Suma.** $P=${fmt(p, 6)}$.`,
      T`**Valor verdadero.** $e^{${x}}=${fmt(Math.exp(x), 6)}$.`,
      T`**Error de truncamiento.** $|${fmt(Math.exp(x), 6)}-${fmt(p, 6)}|=${fmt(e, 5)}$: es la parte de la serie que se descartó.`,
    ],
  }
}

const cancelacion: Generador = (r) => {
  const x = r.elegir([200, 400, 600, 800, 1500])
  const t = 5
  const s = redondear(Math.sqrt(x * x + 1), t)
  const directo = redondear(s - x, t)
  const den = redondear(s + x, t)
  const conj = redondear(1 / den, t)
  return {
    titulo: 'Cancelación catastrófica',
    enunciado: T`Con aritmética de ${t} cifras significativas (redondeo en cada operación) calcula $\sqrt{x^2+1}-x$ para $x=${x}$ de dos formas: (a) directamente; (b) con la forma equivalente $\dfrac{1}{\sqrt{x^2+1}+x}$. Da ambos resultados.`,
    campos: [{ etiqueta: '(a) directo', valor: directo, tol: 1e-9 }, { etiqueta: '(b) reformulado', valor: conj, tol: Math.abs(conj) * 0.01 }],
    pasos: [
      T`**Raíz.** $\sqrt{${x * x}+1}=${fmt(Math.sqrt(x * x + 1), 8)}$, que con ${t} cifras se guarda como $${fmt(s, 4)}$.`,
      T`**(a) Directo.** $${fmt(s, 4)}-${x}=${fmt(directo, 4)}$. Las dos cantidades son casi iguales y se cancelan todas las cifras: el resultado ni siquiera tiene una cifra correcta.`,
      T`**(b) Reformulado.** El denominador suma dos números positivos: $${fmt(s, 4)}+${x}=${fmt(den, 3)}$. Luego $1/${fmt(den, 3)}=${fmt(conj, 7)}$.`,
      T`**Conclusión.** El valor exacto es $\approx${fmt(1 / (Math.sqrt(x * x + 1) + x), 7)}$. Restar números casi iguales destruye cifras; reescribir la expresión evita la resta.`,
    ],
  }
}

export const ERRORES: CatalogoTema = {
  basico: [errorAbsRel, redondeoDecimales],
  intermedio: [cifrasCorrectas, sumaTCifras],
  avanzado: [taylorExp, cancelacion],
}
