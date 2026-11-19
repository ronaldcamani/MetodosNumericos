import type { Pregunta } from '../autoevaluacion'
import { crearAzar, fmt, type Azar, type MicroPasoSocratico, type Problema } from './base'

const T = String.raw

export type TemaId = 'errores' | 'ecuaciones' | 'sistemas' | 'interpolacion' | 'integracion' | 'diferenciales'

export interface PasoEncadenado {
  numero: 1 | 2 | 3
  etiqueta: string
  tipo: 'opcion' | 'numerica'
  enunciado: string
  opciones?: string[]
  correctaOpcion?: number
  correctaNumero?: number
  tolerancia?: number
  explicacion: string
  trampa: string
  tutor: MicroPasoSocratico[]
}

export interface EjercicioGuiado {
  id: string
  tema: TemaId
  titulo: string
  contexto: string
  pasos: [PasoEncadenado, PasoEncadenado, PasoEncadenado]
}

type GenGuiado = (r: Azar) => Omit<EjercicioGuiado, 'id' | 'tema'>

const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1))

/** Ubica la opción correcta (inicialmente en índice 0) en una posición variada según el generador. */
function ordenarOpciones(opciones: string[], r: Azar): { opciones: string[]; correcta: number } {
  const pos = r.entero(0, opciones.length - 1)
  if (pos === 0) return { opciones, correcta: 0 }
  const copia = [...opciones]
  ;[copia[0], copia[pos]] = [copia[pos], copia[0]]
  return { opciones: copia, correcta: pos }
}

/* ==================== 1. ERRORES ==================== */

const errCorteRedondeo: GenGuiado = (r) => {
  const d1 = r.entero(1, 8)
  const d2 = r.entero(1, 8)
  const d3 = r.entero(1, 7)
  const d4 = r.entero(6, 9) // >= 6 para distinguir corte y redondeo sin ambigüedad
  const d5 = r.entero(1, 9)
  const exacto = Number(`${d1}.${d2}${d3}${d4}${d5}`)
  const trunc = Number(`${d1}.${d2}${d3}`)
  const redond = Number(`${d1}.${d2}${d3 + 1}`)
  const esTrunc = r.elegir([true, false])
  const aprox = esTrunc ? trunc : redond
  const erPct = (Math.abs(exacto - aprox) / exacto) * 100

  return {
    titulo: 'Diagnóstico de truncamiento vs redondeo',
    contexto: T`Se midió el valor exacto $x=${exacto.toFixed(4)}$ y en la salida del programa apareció $\tilde x=${aprox.toFixed(2)}$.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Identificación de cifras y modo',
        tipo: 'opcion',
        enunciado: T`¿Cuántas cifras significativas $t$ y qué criterio se aplicaron sobre $x=${exacto.toFixed(4)}$ para obtener $\tilde x=${aprox.toFixed(2)}$?`,
        opciones: [
          T`$t=3$ cifras por truncamiento (corte)`,
          T`$t=3$ cifras por redondeo`,
          T`$t=4$ cifras por truncamiento (corte)`,
          T`$t=2$ cifras por redondeo`,
        ],
        correctaOpcion: esTrunc ? 0 : 1,
        explicacion: esTrunc
          ? T`Se conservaron 3 cifras (${d1}.${d2}${d3}) sin subir la última cifra pese a que la siguiente es ${d4}.`
          : T`Se conservaron 3 cifras y la tercera pasó de ${d3} a ${d3 + 1} porque la cuarta cifra (${d4}) es mayor o igual que 5.`,
        trampa: T`Cuenta las cifras desde el primer dígito no nulo (${d1}) y compara el tercer dígito (${d3}) con el resultado $\tilde x=${aprox.toFixed(2)}$.`,
        tutor: [
          {
            regla: T`Para identificar $t$, contamos los dígitos significativos desde la primera cifra distinta de cero (${d1}) hasta la última escrita en $\tilde x=${aprox.toFixed(2)}$.`,
            pregunta: T`¿Cuántos dígitos significativos tiene $\tilde x=${aprox.toFixed(2)}$?`,
            opciones: ['2 cifras', '3 cifras', '4 cifras'],
            correcta: 1,
            exito: T`¡Exacto! Tiene 3 dígitos significativos: ${d1}, ${d2} y ${esTrunc ? d3 : d3 + 1}.`,
            trampa: T`No cuentes solo decimales: el dígito entero ${d1} también es una cifra significativa.`,
            revelacion: T`Sabemos que $t=3$. Ahora la 4.ª cifra de $x$ es **${d4}**.`,
          },
          {
            regla: T`Cuando la primera cifra descartada es $\ge 5$ (aquí es ${d4}), el redondeo incrementa en 1 la última cifra conservada, mientras que el truncamiento la deja intacta.`,
            pregunta: T`Aquí la 4.ª cifra es ${d4} ($\ge 5$). Al pasar de ${d1}.${d2}${d3}… a ${aprox.toFixed(2)}, ¿subió la 3.ª cifra?`,
            opciones: ['Sí subió: fue redondeo', 'No subió: fue truncamiento (corte)'],
            correcta: esTrunc ? 1 : 0,
            exito: esTrunc ? '¡Correcto! Por eso sabemos que se truncó.' : '¡Correcto! Por eso sabemos que se redondeó.',
            trampa: T`Compara la tercera cifra original (${d3}) con la de $\tilde x$ (${esTrunc ? d3 : d3 + 1}).`,
            revelacion: esTrunc ? T`Conclusión: $t=3$ por truncamiento.` : T`Conclusión: $t=3$ por redondeo.`,
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Cota teórica del método detectado',
        tipo: 'opcion',
        enunciado: T`Con $t=3$ y **${esTrunc ? 'truncamiento' : 'redondeo'}**, ¿cuál es la cota teórica del error relativo $E_{rel}$?`,
        opciones: [
          T`$0.5\cdot 10^{1-t}=5\times 10^{-3}$`,
          T`$10^{1-t}=10^{-2}$`,
          T`$10^{-t}=10^{-3}$`,
        ],
        correctaOpcion: esTrunc ? 1 : 0,
        explicacion: esTrunc
          ? T`En truncamiento a $t$ cifras la cota relativa es $10^{1-t}=10^{-2}$.`
          : T`En redondeo simétrico a $t$ cifras la cota relativa es $0.5\cdot 10^{1-t}=5\times 10^{-3}$.`,
        trampa: T`Recuerda que el truncamiento puede equivocarse hasta una unidad completa de la última cifra conservada (el doble que el redondeo).`,
        tutor: [
          {
            regla: T`El redondeo acota el error relativo por $0.5\cdot 10^{1-t}$ y el truncamiento por $10^{1-t}$.`,
            pregunta: T`Para $t=3$, ¿cuánto vale $10^{1-t}$?`,
            opciones: [T`$10^{-2}=0.01$`, T`$10^{-3}=0.001$`, T`$10^{2}=100$`],
            correcta: 0,
            exito: T`Bien: $1-3=-2$, así que $10^{1-3}=10^{-2}$.`,
            trampa: T`Sustituye $t=3$ en el exponente $1-t$.`,
            revelacion: esTrunc ? T`La cota de truncamiento es $10^{-2}$.` : T`Multiplicando por $0.5$ queda $0.5\cdot 10^{-2}=5\times 10^{-3}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Error relativo porcentual',
        tipo: 'numerica',
        enunciado: T`Calcula el error relativo porcentual $E_{\%}=\dfrac{|x-\tilde x|}{|x|}\cdot 100$ (en %, 3 decimales).`,
        correctaNumero: erPct,
        tolerancia: 0.01,
        explicacion: T`$|${exacto.toFixed(4)}-${aprox.toFixed(2)}|/${exacto.toFixed(4)}\cdot 100\approx ${fmt(erPct, 3)}\,\%$.`,
        trampa: T`Divide el error absoluto $|x-\tilde x|$ entre el valor verdadero $x=${exacto.toFixed(4)}$ (no entre $\tilde x$) y multiplica por 100.`,
        tutor: [
          {
            regla: T`Primero halla la distancia absoluta $E_{abs}=|x-\tilde x|$.`,
            pregunta: T`¿Cuál es el error absoluto $|${exacto.toFixed(4)}-${aprox.toFixed(2)}|$?`,
            opciones: [
              fmt(Math.abs(exacto - aprox), 4),
              fmt(Math.abs(exacto - aprox) * 10, 4),
              fmt(exacto + aprox, 4),
            ],
            correcta: 0,
            exito: T`Exacto: $E_{abs}=${fmt(Math.abs(exacto - aprox), 4)}$.`,
            trampa: T`Solo debes restar ${exacto.toFixed(4)} y ${aprox.toFixed(2)} en valor absoluto.`,
            revelacion: T`Ahora divide ${fmt(Math.abs(exacto - aprox), 4)} entre ${exacto.toFixed(4)} y multiplica por 100 para obtener ${fmt(erPct, 3)} %.`,
          },
        ],
      },
    ],
  }
}

const errTaylorTrunc: GenGuiado = (r) => {
  const x = r.elegir([0.5, 1, 1.5])
  const n = r.elegir([2, 3, 4])
  const terminosTex = ['1', 'x', T`\frac{x^2}{2!}`, T`\frac{x^3}{3!}`, T`\frac{x^4}{4!}`].slice(0, n + 1).join(' + ')
  let suma = 0
  for (let k = 0; k <= n; k++) suma += x ** k / fact(k)
  const exacto = Math.exp(x)
  const err = Math.abs(exacto - suma)
  const siguienteTerm = T`\frac{x^{${n + 1}}}{${n + 1}!}`

  return {
    titulo: 'Truncamiento de la serie de Taylor de eˣ',
    contexto: T`Para aproximar $e^{${x}}$ se usa el polinomio $P(x)=${terminosTex}$, que da $P(${x})=${fmt(suma, 5)}$ frente a $e^{${x}}\approx ${fmt(exacto, 5)}$.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Orden de truncamiento',
        tipo: 'opcion',
        enunciado: T`¿Cuál es el grado $n$ del polinomio de Maclaurin utilizado en $P(x)=${terminosTex}$?`,
        opciones: ['Grado n = 1', 'Grado n = 2', 'Grado n = 3', 'Grado n = 4'],
        correctaOpcion: n - 1,
        explicacion: T`La mayor potencia incluida es $x^{${n}}$, por lo que el polinomio es de grado $n=${n}$ (${n + 1} términos).`,
        trampa: T`Fíjate en el mayor exponente de $x$ presente en la suma (no confundas número de términos con el grado $n$).`,
        tutor: [
          {
            regla: T`El orden o grado de truncamiento $n$ de un polinomio de Taylor corresponde al mayor exponente de $x$ conservado.`,
            pregunta: T`¿Cuál es el último término incluido en $P(x)=${terminosTex}$?`,
            opciones: [T`$x^{${n}}/${n}!$`, T`$x^{${n + 1}}/${n + 1}!$`, T`$x^{${n - 1}}/${n - 1}!$`],
            correcta: 0,
            exito: T`¡Bien! El exponente máximo es ${n}, luego el grado de truncamiento es $n=${n}$.`,
            trampa: T`Observa el último sumando escrito en $P(x)$.`,
            revelacion: T`Por lo tanto, el grado del truncamiento es $n=${n}$.`,
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Primer término despreciado',
        tipo: 'opcion',
        enunciado: T`¿Qué término de la serie $\sum_{k=0}^{\infty}\frac{x^k}{k!}$ es el primero que quedó fuera y domina el error de truncamiento?`,
        opciones: [
          T`$${siguienteTerm}$`,
          T`$\frac{x^{${n}}}{${n}!}$`,
          T`$\frac{x^{${n + 2}}}{${n + 2}!}$`,
          T`$x^{${n + 1}}$`,
        ],
        correctaOpcion: 0,
        explicacion: T`Como la serie se cortó en $k=${n}$, el primer término descartado corresponde a $k=${n + 1}$: $${siguienteTerm}$.`,
        trampa: T`El término de grado ${n} SÍ está dentro de $P(x)$; el error de truncamiento empieza en $k=n+1$.`,
        tutor: [
          {
            regla: T`La cola descartada de la serie comienza en el índice $k=n+1$.`,
            pregunta: T`Si el último término dentro de $P(x)$ tiene $k=${n}$, ¿qué índice $k$ tiene el primer término descartado?`,
            opciones: [T`$k=${n + 1}$`, T`$k=${n}$`, T`$k=${n + 2}$`],
            correcta: 0,
            exito: T`¡Exacto! El primer término fuera es $k=${n + 1}$, es decir $${siguienteTerm}$.`,
            trampa: T`Suma 1 al grado $n=${n}$.`,
            revelacion: T`El primer término despreciado es $${siguienteTerm}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Error absoluto de truncamiento',
        tipo: 'numerica',
        enunciado: T`Calcula el error absoluto de truncamiento $|e^{${x}}-P(${x})|$ (4 decimales).`,
        correctaNumero: err,
        tolerancia: 0.001,
        explicacion: T`$|${fmt(exacto, 5)}-${fmt(suma, 5)}|=${fmt(err, 4)}$.`,
        trampa: T`Resta el valor aproximado $P(${x})=${fmt(suma, 5)}$ del valor verdadero $e^{${x}}=${fmt(exacto, 5)}$.`,
        tutor: [
          {
            regla: T`El error de truncamiento real es $|e^x - P_n(x)|$.`,
            pregunta: T`El valor aproximado $P(${x})=${fmt(suma, 5)}$ es ligeramente…`,
            opciones: [T`menor que $e^{${x}}=${fmt(exacto, 5)}$`, T`mayor que $e^{${x}}=${fmt(exacto, 5)}$`],
            correcta: 0,
            exito: T`¡Correcto! Para $x>0$ todos los términos omitidos son positivos, así que $P(${x}) < e^{${x}}$.`,
            trampa: T`Compara ${fmt(suma, 5)} con ${fmt(exacto, 5)}.`,
            revelacion: T`La diferencia positiva es ${fmt(exacto, 5)} - ${fmt(suma, 5)} = ${fmt(err, 4)}.`,
          },
        ],
      },
    ],
  }
}

const errCancelacionGuiado: GenGuiado = (r) => {
  const x = r.elegir([200, 500, 1000])
  const exacto = 1 / (Math.sqrt(x * x + 1) + x)
  return {
    titulo: 'Evitar cancelación catastrófica',
    contexto: T`Con 4 cifras significativas queremos calcular $f(${x})=\sqrt{${x}^2+1}-${x}$.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Diagnóstico del riesgo',
        tipo: 'opcion',
        enunciado: T`Con 4 cifras, $\sqrt{${x}^2+1}\approx ${x}$. ¿Qué ocurre si restamos directamente $\sqrt{x^2+1}-x$?`,
        opciones: [
          'Cancelación catastrófica: da 0 y se pierden todas las cifras significativas (100 % de error)',
          'Error de truncamiento de serie',
          'El resultado es exacto porque x es entero',
        ],
        correctaOpcion: 0,
        explicacion: 'Restar dos cantidades casi iguales cancela las cifras iniciales exactas y deja solo ruido o cero.',
        trampa: 'El problema no es una serie infinita sino restar dos números muy parecidos en aritmética finita.',
        tutor: [
          {
            regla: T`$\sqrt{${x * x + 1}}=${fmt(Math.sqrt(x * x + 1), 6)}$ comparte sus primeras cifras con ${x}.`,
            pregunta: T`Con solo 4 cifras significativas, ¿en qué se redondea $\sqrt{${x * x + 1}}$?`,
            opciones: [T`En ${x} (idéntico al sustraendo)`, T`En ${x + 1}`],
            correcta: 0,
            exito: T`¡Así es! Al restar ${x} - ${x} da 0: es cancelación catastrófica.`,
            trampa: T`Redondea ${fmt(Math.sqrt(x * x + 1), 6)} a 4 cifras significativas.`,
            revelacion: 'La resta directa pierde el 100 % de las cifras correctas.',
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Reformulación estable',
        tipo: 'opcion',
        enunciado: '¿Qué expresión algebraicamente equivalente evita restar números casi iguales?',
        opciones: [
          T`$\dfrac{1}{\sqrt{x^2+1}+x}$`,
          T`$\dfrac{\sqrt{x^2+1}-x}{2}$`,
          T`$\sqrt{x^2+1}-x+0.001$`,
        ],
        correctaOpcion: 0,
        explicacion: 'Al multiplicar y dividir por el conjugado, el denominador suma dos términos positivos y no cancela cifras.',
        trampa: 'Busca la identidad $(a-b)(a+b)=a^2-b^2$: $(x^2+1)-x^2=1$.',
        tutor: [
          {
            regla: T`Multiplicamos numerador y denominador por el conjugado $\sqrt{x^2+1}+x$.`,
            pregunta: T`¿Cuánto queda en el numerador al hacer $(\sqrt{x^2+1}-x)(\sqrt{x^2+1}+x)$?`,
            opciones: ['1', T`$2x$`],
            correcta: 0,
            exito: '¡Exacto! $(x^2+1) - x^2 = 1$, eliminando la resta por completo.',
            trampa: T`Usa diferencia de cuadrados: $(\sqrt{x^2+1})^2 - x^2$.`,
            revelacion: T`Queda $\dfrac{1}{\sqrt{x^2+1}+x}$, donde solo hay una suma positiva.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Valor estable',
        tipo: 'numerica',
        enunciado: T`Calcula la aproximación estable $\dfrac{1}{\sqrt{${x}^2+1}+${x}}$ (6 decimales).`,
        correctaNumero: exacto,
        tolerancia: 0.0001,
        explicacion: T`Con $\sqrt{${x}^2+1}+${x}\approx ${2 * x}$, el resultado es $1/${2 * x}\approx ${fmt(exacto, 6)}$.`,
        trampa: T`El denominador es aproximadamente $2x=${2 * x}$; divide $1$ entre $${2 * x}$.`,
        tutor: [
          {
            regla: T`Como $\sqrt{${x}^2+1}\approx ${x}$, el denominador vale aproximadamente $2x$.`,
            pregunta: T`¿Cuánto vale aproximadamente el denominador $\sqrt{${x}^2+1}+${x}$?`,
            opciones: [String(2 * x), String(x)],
            correcta: 0,
            exito: T`¡Bien! El denominador es ≈ ${2 * x}.`,
            trampa: T`Estás sumando dos cantidades positivas cercanas a ${x}.`,
            revelacion: T`Por tanto $1/${2 * x}=${fmt(exacto, 6)}$.`,
          },
        ],
      },
    ],
  }
}

/* ==================== 2. ECUACIONES NO LINEALES (M1) ==================== */

const ecNewtonGuiado: GenGuiado = (r) => {
  const N = r.elegir([2, 3, 5, 7, 10])
  const x0 = Math.floor(Math.sqrt(N)) + 1
  const fx0 = x0 * x0 - N
  const dfx0 = 2 * x0
  const x1 = x0 - fx0 / dfx0

  return {
    titulo: 'Razonamiento paso a paso en Newton-Raphson',
    contexto: T`Aplicamos Newton-Raphson a $f(x)=x^2-${N}$ partiendo de $x_0=${x0}$.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Dirección de la tangente',
        tipo: 'opcion',
        enunciado: T`En $x_0=${x0}$ tenemos $f(${x0})=${fx0}>0$ y $f'(${x0})=${dfx0}>0$. Sin calcular todavía $x_1$, ¿hacia dónde se moverá el iterado?`,
        opciones: [
          T`Hacia la izquierda ($x_1 < x_0$), acercándose a $\sqrt{${N}}$`,
          T`Hacia la derecha ($x_1 > x_0$)`,
          'El método falla por derivada nula',
        ],
        correctaOpcion: 0,
        explicacion: T`Como $f(x_0)>0$ y $f'(x_0)>0$, el cociente $f/f'$ es positivo y al restarlo en $x_0 - f/f'$ obtenemos $x_1 < x_0$.`,
        trampa: T`Observa los signos en la fórmula $x_1 = x_0 - \frac{f(x_0)}{f'(x_0)}$.`,
        tutor: [
          {
            regla: T`La fórmula de Newton resta la corrección $\frac{f(x_0)}{f'(x_0)}$ al punto actual.`,
            pregunta: T`Con $f(${x0})=${fx0}$ y $f'(${x0})=${dfx0}$, ¿qué signo tiene $\frac{f(x_0)}{f'(x_0)}$?`,
            opciones: ['Positivo (+)', 'Negativo (−)'],
            correcta: 0,
            exito: '¡Correcto! Positivo entre positivo da positivo.',
            trampa: T`Divide dos números positivos: ${fx0} / ${dfx0}.`,
            revelacion: T`Al restar una cantidad positiva a $${x0}$, $x_1$ será menor que $${x0}$.`,
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Primera iteración',
        tipo: 'numerica',
        enunciado: T`Calcula $x_1 = x_0 - \dfrac{f(x_0)}{f'(x_0)}$ (4 decimales).`,
        correctaNumero: x1,
        tolerancia: 0.001,
        explicacion: T`$x_1=${x0}-\dfrac{${fx0}}{${dfx0}}=${fmt(x1, 4)}$.`,
        trampa: T`Sustituye $x_0=${x0}$, $f(x_0)=${fx0}$ y $f'(x_0)=${dfx0}$.`,
        tutor: [
          {
            regla: T`La derivada de $f(x)=x^2-${N}$ es $f'(x)=2x$.`,
            pregunta: T`¿Cuánto vale la corrección $\dfrac{${fx0}}{${dfx0}}$?`,
            opciones: [fmt(fx0 / dfx0, 4), fmt(dfx0 / fx0, 4)],
            correcta: 0,
            exito: T`¡Bien! La corrección es ${fmt(fx0 / dfx0, 4)}.`,
            trampa: T`Recuerda que en el numerador va $f(x_0)=${fx0}$ y en el denominador $f'(x_0)=${dfx0}$.`,
            revelacion: T`Restando a ${x0}: $x_1 = ${x0} - ${fmt(fx0 / dfx0, 4)} = ${fmt(x1, 4)}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Orden de convergencia',
        tipo: 'opcion',
        enunciado: T`Como $\sqrt{${N}}$ es raíz simple ($f'(\sqrt{${N}})\neq 0$), ¿qué orden tiene Newton aquí y qué pasaría si la raíz fuese doble?`,
        opciones: [
          'Orden cuadrático (p = 2); en raíz doble bajaría a lineal (p = 1)',
          'Orden lineal (p = 1); en raíz doble subiría a p = 2',
          'Orden superlineal φ ≈ 1.618 en ambos casos',
        ],
        correctaOpcion: 0,
        explicacion: 'Newton es cuadrático (p = 2) solo en raíces simples; cuando f′(r) = 0 (raíz múltiple), degrada a p = 1.',
        trampa: 'El orden cuadrático p = 2 requiere f′(r) ≠ 0; el orden 1.618 corresponde a la Secante.',
        tutor: [
          {
            regla: T`En $e_{k+1} \approx \left|\frac{f''(r)}{2f'(r)}\right|e_k^2$, la constante exige $f'(r)\neq 0$.`,
            pregunta: T`¿Qué sucede en una raíz múltiple (por ejemplo $(x-1)^2=0$)?`,
            opciones: [T`$f'(r)=0$ y la velocidad baja a lineal ($p=1$)`, T`$f'(r)=\infty$ y converge en 1 paso`],
            correcta: 0,
            exito: '¡Exacto! Por eso vigilamos si |f′(x)| tiende a 0 junto con |f(x)|.',
            trampa: T`Deriva $(x-1)^2$ y evalúa en $x=1$.`,
            revelacion: 'Raíz simple → p = 2; raíz doble → p = 1.',
          },
        ],
      },
    ],
  }
}

const ecSecanteGuiado: GenGuiado = (r) => {
  const N = r.elegir([2, 3, 5, 6, 10])
  const a = Math.floor(Math.sqrt(N))
  const b = a + 1
  const fa = a * a - N
  const fb = b * b - N
  const x2 = b - (fb * (b - a)) / (fb - fa)

  return {
    titulo: 'Análisis del método de la secante',
    contexto: T`Para $f(x)=x^2-${N}$ usamos la secante con $x_0=${a}$ ($f(${a})=${fa}$) y $x_1=${b}$ ($f(${b})=${fb}$).`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Diferencia clave con Newton',
        tipo: 'opcion',
        enunciado: '¿Qué requisito evita la Secante frente a Newton y qué condición necesita en su denominador?',
        opciones: [
          T`Evita calcular $f'(x)$, pero exige $f(x_k)\neq f(x_{k-1})$ para no tener secante horizontal`,
          T`Evita evaluar $f(x)$ y exige siempre cambio de signo`,
          T`Calcula $f''(x)$ en cada paso`,
        ],
        correctaOpcion: 0,
        explicacion: 'La secante aproxima la derivada mediante la pendiente entre los dos últimos puntos.',
        trampa: 'La secante no exige cambio de signo ni usa derivadas analíticas, pero divide por f(x_k) - f(x_{k-1}).',
        tutor: [
          {
            regla: T`La pendiente secante es $m_k = \frac{f(x_k)-f(x_{k-1})}{x_k-x_{k-1}}$.`,
            pregunta: T`¿Cuándo se vuelve horizontal esa recta y no corta al eje x?`,
            opciones: [T`Cuando $f(x_k)=f(x_{k-1})$`, T`Cuando $x_k > 0$`],
            correcta: 0,
            exito: '¡Correcto! Si f(x_k) = f(x_{k-1}), la pendiente es 0 y no se puede dividir.',
            trampa: 'Mira el numerador de la pendiente m_k.',
            revelacion: 'Exige f(x_k) ≠ f(x_{k-1}) y no requiere f′(x).',
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Primer iterado x₂',
        tipo: 'numerica',
        enunciado: T`Calcula $x_2 = x_1 - f(x_1)\dfrac{x_1-x_0}{f(x_1)-f(x_0)}$ (4 decimales).`,
        correctaNumero: x2,
        tolerancia: 0.001,
        explicacion: T`$x_2 = ${b} - ${fb}\cdot\dfrac{${b - a}}{${fb}-(${fa})} = ${fmt(x2, 4)}$.`,
        trampa: T`Ten cuidado con el signo de $f(x_0)=${fa}$ en el denominador: $f(x_1)-f(x_0)=${fb}-(${fa})=${fb - fa}$.`,
        tutor: [
          {
            regla: T`Calcula primero el denominador $f(x_1)-f(x_0)$.`,
            pregunta: T`¿Cuánto vale $f(${b}) - f(${a}) = ${fb} - (${fa})$?`,
            opciones: [String(fb - fa), String(fb + fa)],
            correcta: 0,
            exito: T`¡Bien! Al restar el valor negativo cambia el signo y suma ${fb - fa}.`,
            trampa: T`Recuerda la regla de signos: $a - (-c) = a + c$.`,
            revelacion: T`Luego $x_2 = ${b} - ${fb}/${fb - fa} = ${fmt(x2, 4)}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Orden de convergencia',
        tipo: 'opcion',
        enunciado: '¿Cuál es el orden teórico de convergencia de la Secante en una raíz simple?',
        opciones: [
          T`Superlineal $\varphi = \frac{1+\sqrt{5}}{2}\approx 1.618$`,
          T`Lineal $p = 1$ (razón $0.5$)`,
          T`Cuadrático $p = 2$`,
        ],
        correctaOpcion: 0,
        explicacion: 'Al usar dos puntos previos en lugar de la tangente exacta, el orden es la razón áurea φ ≈ 1.618.',
        trampa: 'Es más rápida que p = 1 (bisección) pero algo menor que p = 2 (Newton).',
        tutor: [
          {
            regla: T`La relación de error de la secante cumple $e_{k+1} \propto e_k \cdot e_{k-1}$, cuya ecuación característica es $p^2 - p - 1 = 0$.`,
            pregunta: T`¿Cuál es la raíz positiva de $p^2 - p - 1 = 0$?`,
            opciones: [T`$\frac{1+\sqrt{5}}{2}\approx 1.618$`, '2'],
            correcta: 0,
            exito: '¡Exacto! Es el número áureo φ ≈ 1.618.',
            trampa: 'Si p = 2, 2² - 2 - 1 = 1 ≠ 0.',
            revelacion: 'Orden superlineal p ≈ 1.618.',
          },
        ],
      },
    ],
  }
}

const ecPolinomioGuiado: GenGuiado = (r) => {
  const r1 = r.elegir([-2, -1, 1, 2, 3])
  const q = r.elegir([1, 4, 9])
  // p(x) = (x - r1)(x^2 + q) = x^3 - r1*x^2 + q*x - r1*q
  const a2 = -r1
  const a1 = q
  const a0 = -r1 * q
  const cauchy = 1 + Math.max(Math.abs(a2), Math.abs(a1), Math.abs(a0))
  const s = (k: number) => (k < 0 ? `${k}` : `+${k}`)
  const tex = T`x^3${s(a2)}x^2${s(a1)}x${s(a0)}`

  return {
    titulo: 'Polinomios: cota de Cauchy, deflación y pulido',
    contexto: T`Sea $p(x)=${tex}$, que se factoriza como $(x-(${r1}))(x^2+${q})$.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Clasificación de raíces',
        tipo: 'opcion',
        enunciado: T`¿Cuántas raíces reales y cuántas complejas conjugadas tiene $p(x)$?`,
        opciones: [
          '1 raíz real y 2 raíces complejas conjugadas',
          '3 raíces reales distintas',
          '3 raíces complejas sin raíces reales',
        ],
        correctaOpcion: 0,
        explicacion: T`$(x-(${r1}))$ aporta una raíz real ($${r1}$) y el cociente $x^2+${q}=0$ tiene discriminante negativo ($-4\cdot${q}<0$), dando dos raíces imaginarias puras.`,
        trampa: T`Un polinomio real de grado 3 siempre tiene al menos una raíz real; revisa si $x^2+${q}=0$ tiene soluciones reales.`,
        tutor: [
          {
            regla: T`Tras dividir por $(x-(${r1}))$, queda el factor cuadrático $x^2+${q}=0$.`,
            pregunta: T`¿Tiene soluciones reales $x^2+${q}=0$?`,
            opciones: [`No, porque x² = −${q} < 0 (raíces complejas)`, 'Sí, dos raíces reales'],
            correcta: 0,
            exito: `¡Exacto! Las raíces de x² + ${q} son complejas conjugadas.`,
            trampa: T`Despeja $x^2 = -${q}$ en los reales.`,
            revelacion: 'Tiene 1 raíz real y 1 par complejo conjugado.',
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Cota de Cauchy',
        tipo: 'numerica',
        enunciado: T`Calcula la cota de Cauchy $M = 1 + \max_{i<3}|a_i/a_3|$ dentro de la cual están todas las raíces (entero).`,
        correctaNumero: cauchy,
        tolerancia: 0,
        explicacion: T`Los coeficientes son $1,\;${a2},\;${a1},\;${a0}$; el máximo valor absoluto entre el principal ($1$) es ${cauchy - 1}, luego $M=1+${cauchy - 1}=${cauchy}$.`,
        trampa: T`Toma el máximo entre $|${a2}|$, $|${a1}|$ y $|${a0}|$ (sin olvidar el signo positivo del valor absoluto) y súmale 1.`,
        tutor: [
          {
            regla: T`La fórmula de Cauchy es $1 + \max\left(|a_2/a_3|,\,|a_1/a_3|,\,|a_0/a_3|\right)$.`,
            pregunta: T`Aquí $a_3=1$. ¿Cuál es el mayor valor absoluto entre ${a2}, ${a1} y ${a0}?`,
            opciones: [String(cauchy - 1), String(Math.abs(a2))],
            correcta: 0,
            exito: T`¡Bien! El máximo es ${cauchy - 1}.`,
            trampa: T`Compara $|${a2}|=${Math.abs(a2)}$, $|${a1}|=${a1}$ y $|${a0}|=${Math.abs(a0)}$.`,
            revelacion: T`Sumando 1 obtenemos la cota de Cauchy $M = ${cauchy}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Control del error de deflación',
        tipo: 'opcion',
        enunciado: '¿Por qué el motor del portal «pule» cada raíz real sobre el polinomio original p(x) tras hallarla en el cociente?',
        opciones: [
          'Para evitar que los errores de redondeo acumulados en los cocientes deflacionados contaminen las raíces',
          'Porque Horner solo sirve para el polinomio original',
          'Para eliminar las raíces complejas',
        ],
        correctaOpcion: 0,
        explicacion: 'Una pequeña inexactitud en la primera raíz altera los coeficientes del cociente; pulir en el original recupera la precisión total.',
        trampa: 'Cada deflación arrastra el error de la raíz previa al siguiente cociente.',
        tutor: [
          {
            regla: T`Si $r_1$ tiene un error $\varepsilon$, el cociente deflacionado $q(x)$ ya no tiene exactamente las mismas raíces que $p(x)$.`,
            pregunta: T`¿Qué ocurre al dar una iteración de Newton usando $p(x)$ original partiendo de la raíz aproximada?`,
            opciones: ['Se elimina el error heredado del cociente', 'Se duplica el grado del polinomio'],
            correcta: 0,
            exito: '¡Exacto! Pulir sobre p(x) original corrige el sesgo de la deflación.',
            trampa: 'Newton sobre p(x) busca los ceros verdaderos de p, sin error acumulado.',
            revelacion: 'El pulido evita la propagación del error entre deflaciones.',
          },
        ],
      },
    ],
  }
}

/* ==================== 3. SISTEMAS LINEALES (M2) ==================== */

const sisDominanciaGuiado: GenGuiado = (r) => {
  const diag = r.entero(5, 8)
  const off = r.entero(1, 2)
  const x1Real = r.entero(1, 3)
  const x2Real = r.entero(1, 3)
  // Fila 1 (dominante en x2) y Fila 2 (dominante en x1) puestas al revés:
  // Fila 1: off*x1 + diag*x2 = b1
  // Fila 2: diag*x1 + off*x2 = b2
  const b1 = off * x1Real + diag * x2Real
  const b2 = diag * x1Real + off * x2Real
  const x1Iter1 = b2 / diag

  return {
    titulo: 'Dominancia diagonal y primer paso de Gauss-Seidel',
    contexto: T`Dado el sistema $(1)\; ${off}x_1+${diag}x_2=${b1}$, $(2)\; ${diag}x_1+${off}x_2=${b2}$ con $x^{(0)}=(0,0)$.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Diagnóstico de convergencia',
        tipo: 'opcion',
        enunciado: 'Tal como están escritas las ecuaciones, ¿hay dominancia diagonal estricta y qué conviene hacer para Gauss-Seidel?',
        opciones: [
          'No es dominante tal cual; conviene intercambiar las filas 1 y 2 para lograr dominancia diagonal estricta',
          'Ya es dominante porque todos los coeficientes son positivos',
          'Es singular y no tiene solución',
        ],
        correctaOpcion: 0,
        explicacion: T`En la fila 1, $|a_{11}|=${off} < |a_{12}|=${diag}$. Al intercambiar filas quedan $${diag} > ${off}$ en ambas diagonales.`,
        trampa: T`Compara $|a_{ii}|$ frente a $\sum_{j\neq i}|a_{ij}|$ en cada fila, no el signo de los coeficientes.`,
        tutor: [
          {
            regla: T`Una fila es estrictamente dominante si $|a_{ii}| > \sum_{j\neq i}|a_{ij}|$.`,
            pregunta: T`En la ecuación $(1)\; ${off}x_1+${diag}x_2=${b1}$, ¿es ${off} > ${diag}?`,
            opciones: ['No, hay que reordenar las ecuaciones', 'Sí, ya domina la diagonal'],
            correcta: 0,
            exito: '¡Bien! Al intercambiar las dos filas, ambas quedan dominantes.',
            trampa: T`Compara el coeficiente diagonal ${off} con ${diag}.`,
            revelacion: T`Reordenando: $(1')\; ${diag}x_1+${off}x_2=${b2}$ y $(2')\; ${off}x_1+${diag}x_2=${b1}$.`,
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Primer despeje de Gauss-Seidel',
        tipo: 'numerica',
        enunciado: T`Con las ecuaciones ya reordenadas (primera ecuación $${diag}x_1+${off}x_2=${b2}$) y $x_2^{(0)}=0$, calcula $x_1^{(1)}$ (3 decimales).`,
        correctaNumero: x1Iter1,
        tolerancia: 0.005,
        explicacion: T`$x_1^{(1)}=\dfrac{${b2}-${off}\cdot 0}{${diag}}=${fmt(x1Iter1, 3)}$.`,
        trampa: T`Despeja $x_1$ de la ecuación reordenada $${diag}x_1+${off}x_2=${b2}$ sustituyendo $x_2=0$.`,
        tutor: [
          {
            regla: T`En la ecuación $${diag}x_1+${off}x_2=${b2}$, despejamos $x_1 = \frac{${b2}-${off}x_2}{${diag}}$.`,
            pregunta: T`Como partimos de $x^{(0)}=(0,0)$, ¿qué valor toma $x_2$ al calcular $x_1^{(1)}$?`,
            opciones: ['0', String(b1)],
            correcta: 0,
            exito: T`¡Correcto! Así queda $x_1^{(1)}=${b2}/${diag}=${fmt(x1Iter1, 3)}$.`,
            trampa: T`Todavía no hemos actualizado $x_2$; usamos $x_2^{(0)}=0$.`,
            revelacion: T`$x_1^{(1)}=${fmt(x1Iter1, 3)}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Regla distintiva de Gauss-Seidel',
        tipo: 'opcion',
        enunciado: T`Inmediatamente después, al calcular $x_2^{(1)}$ en la segunda ecuación, ¿qué valor de $x_1$ usa Gauss-Seidel?`,
        opciones: [
          T`El recién calculado $x_1^{(1)}=${fmt(x1Iter1, 3)}$ (a diferencia de Jacobi, que usaría $x_1^{(0)}=0$)`,
          T`El antiguo $x_1^{(0)}=0$`,
          'El promedio entre ambos',
        ],
        correctaOpcion: 0,
        explicacion: 'Gauss-Seidel actualiza el vector componente a componente y reutiliza de inmediato cada nuevo valor.',
        trampa: 'Usar toda la iteración anterior corresponde al método de Jacobi, no a Gauss-Seidel.',
        tutor: [
          {
            regla: T`Gauss-Seidel sobreescribe en memoria cada incógnita apenas la calcula.`,
            pregunta: T`¿En qué se diferencia Gauss-Seidel de Jacobi?`,
            opciones: ['Reutiliza los valores nuevos dentro de la misma iteración', 'Espera al final de la iteración para actualizar'],
            correcta: 0,
            exito: '¡Exacto! Por eso suele converger más rápido que Jacobi.',
            trampa: 'Jacobi guarda un vector nuevo aparte; Gauss-Seidel actualiza in situ.',
            revelacion: T`Usa $x_1^{(1)}=${fmt(x1Iter1, 3)}$ inmediatamente para hallar $x_2^{(1)}$.`,
          },
        ],
      },
    ],
  }
}

const sisEliminacionGuiado: GenGuiado = (r) => {
  const a11 = r.elegir([1, 2])
  const a21 = r.elegir([4, 6, 8])
  const a12 = r.entero(1, 3)
  const a22 = r.entero(1, 4)
  const m21 = a11 / a21

  return {
    titulo: 'Pivoteo parcial y multiplicadores',
    contexto: T`Sistema $A=\begin{pmatrix}${a11}&${a12}\\${a21}&${a22}\end{pmatrix}$ para resolver por eliminación gaussiana.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Elección de pivote',
        tipo: 'opcion',
        enunciado: T`Al iniciar la columna 1 con $|a_{11}|=${a11}$ y $|a_{21}|=${a21}$, ¿qué hace el pivoteo parcial?`,
        opciones: [
          T`Intercambia las filas 1 y 2 para usar ${a21} como pivote y mantener $|m_{21}|\le 1$`,
          'Divide toda la fila 1 entre 0',
          'Mantiene siempre la fila 1 arriba aunque su pivote sea menor',
        ],
        correctaOpcion: 0,
        explicacion: 'El pivoteo parcial elige el elemento de mayor valor absoluto en la columna para reducir errores de redondeo.',
        trampa: 'No intercambiar cuando hay un candidato mayor en la columna aumenta el multiplicador y amplifica el redondeo.',
        tutor: [
          {
            regla: T`Para eliminar debajo del pivote se multiplica por $m = \text{elemento}/\text{pivote}$.`,
            pregunta: T`Si elegimos el mayor $|a_{i1}|$ como pivote (${a21}), ¿qué se cumple para todo multiplicador $|m|$?`,
            opciones: [T`$|m| \le 1$`, T`$|m| > 10$`],
            correcta: 0,
            exito: '¡Exacto! Multiplicadores acotados por 1 estabilizan la eliminación.',
            trampa: T`Al dividir un número menor entre uno mayor en valor absoluto, el cociente es $\le 1$.`,
            revelacion: 'Se intercambian fila 1 y fila 2.',
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Multiplicador de eliminación',
        tipo: 'numerica',
        enunciado: T`Ya intercambiadas las filas (pivote ${a21} arriba y ${a11} abajo), calcula el multiplicador $m_{21}$ (4 decimales).`,
        correctaNumero: m21,
        tolerancia: 0.001,
        explicacion: T`$m_{21}=\dfrac{${a11}}{${a21}}=${fmt(m21, 4)}$.`,
        trampa: T`El multiplicador es el coeficiente de la fila inferior (${a11}) dividido entre el pivote (${a21}).`,
        tutor: [
          {
            regla: T`Tras el intercambio, la fila 1 tiene ${a21} en la columna 1 y la fila 2 tiene ${a11}.`,
            pregunta: T`Para anular ${a11} haciendo $F_2 \leftarrow F_2 - m_{21}F_1$, ¿cuánto vale $m_{21}$?`,
            opciones: [T`${a11}/${a21}=${fmt(m21, 4)}`, T`${a21}/${a11}=${fmt(a21 / a11, 4)}`],
            correcta: 0,
            exito: T`¡Bien! $m_{21}=${fmt(m21, 4)}$ y $|m_{21}|\le 1$.`,
            trampa: T`Comprueba: ${a11} - m·${a21} = 0.`,
            revelacion: T`$m_{21}=${fmt(m21, 4)}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Detección de singularidad',
        tipo: 'opcion',
        enunciado: 'Si tras el pivoteo parcial un pivote resulta nulo (o menor al umbral relativo de singularidad), ¿qué ocurre?',
        opciones: [
          'El sistema es singular (sin solución única) y el método se detiene sin devolver solución',
          'Se reemplaza el pivote por 1 y se continúa',
          'Se pasa automáticamente a Lagrange',
        ],
        correctaOpcion: 0,
        explicacion: 'Un pivote nulo indica filas linealmente dependientes: det(A) = 0 y no existe solución única.',
        trampa: 'Nunca se debe dividir entre un pivote nulo ni inventar un reemplazo.',
        tutor: [
          {
            regla: T`El determinante es proporcional al producto de los pivotes de $U$.`,
            pregunta: T`Si uno de los pivotes de $U$ es 0, ¿cuánto vale $\det(A)$?`,
            opciones: ['0 (matriz singular)', '1 (matriz identidad)'],
            correcta: 0,
            exito: '¡Exacto! Con det(A) = 0 no hay solución única.',
            trampa: 'Cualquier número multiplicado por 0 es 0.',
            revelacion: 'El sistema se declara singular.',
          },
        ],
      },
    ],
  }
}

const sisResiduoGuiado: GenGuiado = (r) => {
  const x1 = r.entero(1, 3)
  const x2 = r.entero(1, 3)
  const b1 = 4 * x1 + x2
  const b2 = x1 + 5 * x2
  const dx1 = 0.2
  const dx2 = -0.1
  const tx1 = x1 + dx1
  const tx2 = x2 + dx2
  const res1 = Math.abs(b1 - (4 * tx1 + tx2))
  const res2 = Math.abs(b2 - (tx1 + 5 * tx2))
  const resInf = Math.max(res1, res2)

  return {
    titulo: 'Interpretación de la norma infinito del residuo',
    contexto: T`Para $A=\begin{pmatrix}4&1\\1&5\end{pmatrix}$ y $b=(${b1},${b2})$ tenemos la aproximación $\tilde x=(${fmt(tx1, 1)},${fmt(tx2, 1)})$.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Definición de norma infinito',
        tipo: 'opcion',
        enunciado: T`¿Qué representa $\|b - A\tilde x\|_\infty$?`,
        opciones: [
          'El máximo valor absoluto entre las discrepancias de cada ecuación',
          'La suma de las incógnitas x₁ + x₂',
          'El número de iteraciones realizadas',
        ],
        correctaOpcion: 0,
        explicacion: 'La norma infinito de un vector r = b − Ax̃ es max_i |r_i|.',
        trampa: 'No se suman las incógnitas: se evalúa cuánto falla cada ecuación y se toma el máximo absoluto.',
        tutor: [
          {
            regla: T`El vector residuo es $r = b - A\tilde x = (r_1, r_2)$.`,
            pregunta: T`¿Cómo se calcula $\|r\|_\infty$?`,
            opciones: [T`$\max(|r_1|,\;|r_2|)$`, T`$r_1 \cdot r_2$`],
            correcta: 0,
            exito: '¡Correcto! La norma ∞ toma el mayor componente en valor absoluto.',
            trampa: 'La norma infinito mide la peor desviación por fila.',
            revelacion: T`Calculamos $|r_1|$ y $|r_2|$ y nos quedamos con el mayor.`,
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Cálculo del residuo',
        tipo: 'numerica',
        enunciado: T`Calcula $\|b - A\tilde x\|_\infty$ para $\tilde x=(${fmt(tx1, 1)},${fmt(tx2, 1)})$ (2 decimales).`,
        correctaNumero: resInf,
        tolerancia: 0.01,
        explicacion: T`$A\tilde x=(${fmt(4 * tx1 + tx2, 2)},${fmt(tx1 + 5 * tx2, 2)})$, luego $r=(${fmt(b1 - (4 * tx1 + tx2), 2)},${fmt(b2 - (tx1 + 5 * tx2), 2)})$ y $\|r\|_\infty=${fmt(resInf, 2)}$.`,
        trampa: T`Multiplica cada fila de $A$ por $\tilde x$, réstalo de $b$ y toma el mayor absoluto.`,
        tutor: [
          {
            regla: T`Primera componente: $r_1 = ${b1} - (4\cdot ${fmt(tx1, 1)} + ${fmt(tx2, 1)})$.`,
            pregunta: T`¿Cuánto valen $|r_1|$ y $|r_2|$ respectivamente?`,
            opciones: [T`${fmt(res1, 2)} y ${fmt(res2, 2)}`, T`${fmt(res1 + 1, 2)} y ${fmt(res2 + 1, 2)}`],
            correcta: 0,
            exito: T`¡Bien! El mayor de ambos es ${fmt(resInf, 2)}.`,
            trampa: T`Evalúa $4(${fmt(tx1, 1)})+${fmt(tx2, 1)}=${fmt(4 * tx1 + tx2, 2)}$ y resta de ${b1}.`,
            revelacion: T`$\|b-A\tilde x\|_\infty = \max(${fmt(res1, 2)}, ${fmt(res2, 2)}) = ${fmt(resInf, 2)}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Residuo vs error',
        tipo: 'opcion',
        enunciado: 'Si en otro sistema el residuo es muy pequeño (10⁻⁸), ¿significa automáticamente que el error ‖x − x̃‖ es ≤ 10⁻⁸?',
        opciones: [
          'No necesariamente: solo si la matriz está bien condicionada; si está mal condicionada el error puede ser mucho mayor',
          'Sí, siempre son exactamente iguales',
          'El residuo siempre es mayor que el error',
        ],
        correctaOpcion: 0,
        explicacion: 'En sistemas mal condicionados, ecuaciones casi paralelas hacen que una gran desviación en x apenas mueva a Ax.',
        trampa: 'Recuerda la cota con el número de condición κ(A): un κ(A) enorme amplifica el error frente al residuo.',
        tutor: [
          {
            regla: T`Dos rectas casi paralelas se cortan en un punto muy sensible a pequeñas perturbaciones.`,
            pregunta: T`Cuando $\kappa(A)$ es muy grande (matriz mal condicionada), un residuo pequeño puede coexistir con…`,
            opciones: ['un error grande en la solución x', 'un determinante igual a 1 siempre'],
            correcta: 0,
            exito: '¡Exacto! Por eso distinguimos residuo de error real.',
            trampa: 'Si las rectas casi coinciden, estar «cerca de ambas rectas» permite estar lejos del punto de corte.',
            revelacion: 'Residuo pequeño asegura error pequeño solo con buen condicionamiento.',
          },
        ],
      },
    ],
  }
}

/* ==================== 4. INTERPOLACIÓN Y REGRESIÓN (M3) ==================== */

const intEleccionGuiado: GenGuiado = (r) => {
  const b1 = r.entero(2, 4)
  const x = [1, 2, 3, 4]
  const y = x.map((v) => b1 * v + r.elegir([-0.1, 0.2, -0.2, 0.1]))
  const xq = r.elegir([5, 6])
  const mx = 2.5

  return {
    titulo: 'Elección entre Lagrange y regresión con extrapolación',
    contexto: T`Mediciones con ruido experimental: $x=(1,2,3,4)$ e $y=(${y.map((v) => fmt(v, 1)).join(',\\ ')})$. Queremos predecir en $x=${xq}$.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Elección de modelo y rango',
        tipo: 'opcion',
        enunciado: T`Con datos ruidosos y consulta $x=${xq}$ fuera de $[1,4]$, ¿qué modelo conviene y qué precaución hay?`,
        opciones: [
          'Regresión lineal por mínimos cuadrados, advirtiendo que es una extrapolación',
          'Interpolación de Lagrange de grado 3, porque es exacta fuera del intervalo',
          'Ninguno sirve si hay decimales en y',
        ],
        correctaOpcion: 0,
        explicacion: 'La regresión resume la tendencia sin copiar el ruido; los polinomios de Lagrange oscilan fuertemente al extrapolar.',
        trampa: 'Pasar exactamente por puntos ruidosos traslada y amplifica el ruido fuera del intervalo.',
        tutor: [
          {
            regla: T`La interpolación obliga $P(x_i)=y_i$ exacto; la regresión minimiza la tendencia global.`,
            pregunta: T`¿Qué ocurre al evaluar un polinomio interpolante de grado alto fuera de $[1, 4]$?`,
            opciones: ['Oscila y se desvía bruscamente al copiar el ruido', 'Filtra el ruido automáticamente'],
            correcta: 0,
            exito: '¡Exacto! Por eso usamos regresión lineal con aviso de extrapolación.',
            trampa: 'Un polinomio cúbico ajustado a ruido puede incluso girar en sentido contrario fuera del rango.',
            revelacion: 'Elegimos regresión lineal y advertimos extrapolación.',
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Media de las abscisas',
        tipo: 'numerica',
        enunciado: T`Para iniciar el cálculo de $b_1=\dfrac{\sum(x_i-\bar x)(y_i-\bar y)}{\sum(x_i-\bar x)^2}$, calcula $\bar x$ (2 decimales).`,
        correctaNumero: mx,
        tolerancia: 0.01,
        explicacion: T`$\bar x = \dfrac{1+2+3+4}{4} = 2.5$.`,
        trampa: T`Suma los cuatro valores de $x$ ($1+2+3+4$) y divide entre $n=4$.`,
        tutor: [
          {
            regla: T`La media aritmética es $\bar x = \frac{1}{n}\sum_{i=1}^n x_i$.`,
            pregunta: T`La suma $1+2+3+4$ vale $10$. ¿Cuánto es $10/4$?`,
            opciones: ['2.5', '2'],
            correcta: 0,
            exito: T`¡Bien! $\bar x = 2.5$.`,
            trampa: 'Divide exactamente 10 entre 4.',
            revelacion: T`$\bar x = 2.5$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Naturaleza de los residuos',
        tipo: 'opcion',
        enunciado: '¿Por qué la interpolación de Lagrange tiene residuo 0 en los nodos y aun así predice peor datos con ruido?',
        opciones: [
          'Porque residuo 0 en los nodos solo significa forzar la curva a pasar por el error de medición',
          'Porque Lagrange tiene un error de fórmula en el denominador',
          'Porque el residuo 0 solo ocurre en rectas',
        ],
        correctaOpcion: 0,
        explicacion: 'En datos ruidosos, pasar por cada punto sobreajusta el error de medida y deteriora la predicción intermedia y futura.',
        trampa: 'Que el error en los nodos sea cero no garantiza que el modelo represente el fenómeno real.',
        tutor: [
          {
            regla: T`Toda medición ruidosa es $y_i = y_{\text{real}}(x_i) + \varepsilon_i$.`,
            pregunta: T`Si una curva pasa exactamente por $y_i$, ¿qué está copiando además de la señal real?`,
            opciones: [T`El error aleatorio $\varepsilon_i$`, 'La derivada segunda exacta'],
            correcta: 0,
            exito: '¡Exacto! Interpolar no elimina el error de medición: lo reproduce.',
            trampa: T`Si $P(x_i) = y_{\text{real}} + \varepsilon_i$, el ruido queda incrustado en el polinomio.`,
            revelacion: 'El residuo 0 sobre datos con ruido indica sobreajuste.',
          },
        ],
      },
    ],
  }
}

const intLagrangeGuiado: GenGuiado = (r) => {
  const y = [r.entero(1, 5), r.entero(2, 6), r.entero(1, 5)]
  const xq = r.elegir([0.5, 1.5])
  const L0 = ((xq - 1) * (xq - 2)) / ((0 - 1) * (0 - 2))
  const L1 = ((xq - 0) * (xq - 2)) / ((1 - 0) * (1 - 2))
  const L2 = ((xq - 0) * (xq - 1)) / ((2 - 0) * (2 - 1))
  const P = y[0] * L0 + y[1] * L1 + y[2] * L2

  return {
    titulo: 'Polinomio interpolante de Lagrange paso a paso',
    contexto: T`Nodos exactos $(0,${y[0]})$, $(1,${y[1]})$ y $(2,${y[2]})$. Queremos interpolar en $x=${xq}$.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Grado y propiedad de las bases',
        tipo: 'opcion',
        enunciado: 'Con 3 abscisas distintas, ¿cuál es el grado máximo del polinomio de Lagrange y cuánto suman las bases L₀(x) + L₁(x) + L₂(x)?',
        opciones: [
          'Grado ≤ 2 y las bases siempre suman exactamente 1',
          'Grado 3 y las bases suman 0',
          'Grado 1 y las bases suman x',
        ],
        correctaOpcion: 0,
        explicacion: 'Por n nodos pasa un único polinomio de grado ≤ n − 1, y como debe interpolar la constante y = 1, ∑ Lᵢ(x) = 1.',
        trampa: 'Con 3 puntos definimos una parábola (grado ≤ 2), no un polinomio cúbico.',
        tutor: [
          {
            regla: T`Cada base $L_i(x)$ es un producto de $n-1$ factores lineales $(x-x_j)$.`,
            pregunta: T`Si hay $n=3$ nodos, ¿cuántos factores lineales multiplica cada $L_i(x)$?`,
            opciones: ['2 factores (grado 2)', '3 factores (grado 3)'],
            correcta: 0,
            exito: '¡Exacto! El producto excluye $j=i$, así que tiene $n-1=2$ factores.',
            trampa: T`En $L_i(x)=\prod_{j\neq i}\frac{x-x_j}{x_i-x_j}$ se excluye el índice propio $i$.`,
            revelacion: 'Grado ≤ 2 y la partición de la unidad garantiza ∑ Lᵢ(x) = 1.',
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Base central L₁(x)',
        tipo: 'numerica',
        enunciado: T`Calcula el valor de la base $L_1(${xq})=\dfrac{(${xq}-0)(${xq}-2)}{(1-0)(1-2)}$ (4 decimales).`,
        correctaNumero: L1,
        tolerancia: 0.001,
        explicacion: T`$L_1(${xq})=\dfrac{${xq}\cdot(${xq - 2})}{1\cdot(-1)}=${fmt(L1, 4)}$.`,
        trampa: T`Fíjate en el signo del denominador: $(1-0)(1-2)=-1$.`,
        tutor: [
          {
            regla: T`Evalúa numerador y denominador por separado.`,
            pregunta: T`¿Cuánto vale $(1-0)(1-2)$ en el denominador de $L_1$?`,
            opciones: ['−1', '1'],
            correcta: 0,
            exito: T`¡Bien! El denominador es −1, por lo que $L_1(${xq})=${fmt(L1, 4)}>0$.`,
            trampa: T`$1 - 2 = -1$.`,
            revelacion: T`$L_1(${xq})=${fmt(L1, 4)}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Evaluación de P(x)',
        tipo: 'numerica',
        enunciado: T`Sabiendo que $L_0(${xq})=${fmt(L0, 4)}$ y $L_2(${xq})=${fmt(L2, 4)}$, calcula $P(${xq})=\sum y_i L_i(${xq})$ (4 decimales).`,
        correctaNumero: P,
        tolerancia: 0.005,
        explicacion: T`$P(${xq})=${y[0]}(${fmt(L0, 4)})+${y[1]}(${fmt(L1, 4)})+${y[2]}(${fmt(L2, 4)})=${fmt(P, 4)}$.`,
        trampa: T`Multiplica cada $y_i$ por su respectiva base $L_i(${xq})$ y suma los tres términos.`,
        tutor: [
          {
            regla: T`Comprobación previa: $L_0+L_1+L_2 = ${fmt(L0, 4)}+${fmt(L1, 4)}+${fmt(L2, 4)} = 1$.`,
            pregunta: T`¿Cuál término aporta más peso en $x=${xq}$?`,
            opciones: [T`$y_1 L_1$ porque $L_1=${fmt(L1, 4)}$ es la base mayor`, T`$y_0 L_0$ siempre`],
            correcta: 0,
            exito: T`¡Correcto! Al sumar los productos ponderados resulta $P(${xq})=${fmt(P, 4)}$.`,
            trampa: T`Compara ${fmt(L0, 4)}, ${fmt(L1, 4)} y ${fmt(L2, 4)}.`,
            revelacion: T`$P(${xq})=${fmt(P, 4)}$.`,
          },
        ],
      },
    ],
  }
}

const intAjusteGuiado: GenGuiado = (r) => {
  const y = [r.entero(1, 4), r.entero(3, 6), r.entero(5, 9)]
  const mx = 2
  const my = (y[0] + y[1] + y[2]) / 3
  const sxx = 2 // (1-2)^2 + (2-2)^2 + (3-2)^2 = 2
  const sxy = -1 * (y[0] - my) + 0 + 1 * (y[2] - my)
  const b1 = sxy / sxx

  return {
    titulo: 'Criterio de mínimos cuadrados y calidad R²',
    contexto: T`Puntos $(1,${y[0]})$, $(2,${y[1]})$, $(3,${y[2]})$ ajustados con la recta $\hat y = b_0 + b_1 x$.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Función objetivo',
        tipo: 'opcion',
        enunciado: '¿Qué minimiza exactamente la recta de regresión lineal por mínimos cuadrados?',
        opciones: [
          T`La suma de los cuadrados de los residuos verticales $SSE=\sum(y_i-\hat y_i)^2$`,
          'La distancia al primer y último punto solamente',
          'La suma simple sin elevar al cuadrado (que siempre da 0)',
        ],
        correctaOpcion: 0,
        explicacion: 'Elevar al cuadrado evita cancelaciones entre residuos positivos y negativos y penaliza más las desviaciones grandes.',
        trampa: 'Sin elevar al cuadrado, infinitas rectas que pasan por (x̄, ȳ) tienen suma de residuos igual a cero.',
        tutor: [
          {
            regla: T`Toda recta que pasa por $(\bar x,\bar y)$ cumple $\sum (y_i - \hat y_i) = 0$.`,
            pregunta: T`Por qué se eleva al cuadrado cada residuo $(y_i - \hat y_i)$?`,
            opciones: ['Para evitar que signos + y − se cancelen y tener mínimo único', 'Para convertir unidades de ms a segundos'],
            correcta: 0,
            exito: '¡Exacto! Por eso minimizamos SSE.',
            trampa: 'Un residuo negativo y uno positivo se cancelarían si no se elevaran al cuadrado.',
            revelacion: T`Se minimiza $SSE = \sum(y_i - \hat y_i)^2$.`,
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Pendiente b₁',
        tipo: 'numerica',
        enunciado: T`Con $\bar x=${mx}$, calcula la pendiente $b_1=\dfrac{S_{xy}}{S_{xx}}$ (3 decimales).`,
        correctaNumero: b1,
        tolerancia: 0.01,
        explicacion: T`$S_{xx}=(-1)^2+0^2+1^2=2$ y $S_{xy}=(-1)(${fmt(y[0] - my, 2)})+1(${fmt(y[2] - my, 2)})=${fmt(sxy, 2)}$, luego $b_1=${fmt(b1, 3)}$.`,
        trampa: T`Observa que para $x=(1,2,3)$, $b_1$ simplifica a $(y_3-y_1)/2$.`,
        tutor: [
          {
            regla: T`$S_{xx}=(1-2)^2+(2-2)^2+(3-2)^2$.`,
            pregunta: T`¿Cuánto vale $S_{xx}$?`,
            opciones: ['2', '6'],
            correcta: 0,
            exito: '¡Bien! $S_{xx} = 1 + 0 + 1 = 2$.',
            trampa: 'Calcula $(-1)^2 + 0^2 + 1^2$.',
            revelacion: T`Con $S_{xy}=${fmt(sxy, 2)}$ y $S_{xx}=2$, $b_1=${fmt(b1, 3)}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Interpretación de R²',
        tipo: 'opcion',
        enunciado: 'Si el coeficiente de determinación es R² = 0.98, ¿qué nos indica sobre el ajuste lineal?',
        opciones: [
          'Que la recta explica el 98 % de la variabilidad observada en y respecto a su media',
          'Que el error en cada punto vale 0.98',
          'Que el polinomio es de grado 98',
        ],
        correctaOpcion: 0,
        explicacion: 'R² = 1 − SSE/SST mide la proporción de varianza explicada por el modelo lineal.',
        trampa: 'R² es adimensional en [0, 1]; no mide el error en las unidades de y.',
        tutor: [
          {
            regla: T`La fórmula es $R^2 = 1 - \dfrac{SSE}{SST}$.`,
            pregunta: T`Cuando los residuos $SSE$ son muy pequeños comparados con $SST$, ¿hacia qué valor tiende $R^2$?`,
            opciones: ['Hacia 1', 'Hacia 0'],
            correcta: 0,
            exito: '¡Correcto! Cuanto más cerca de 1, mejor explica la recta la tendencia.',
            trampa: 'Si SSE ≈ 0, entonces 1 − 0 = 1.',
            revelacion: 'R² = 0.98 indica 98 % de variabilidad explicada.',
          },
        ],
      },
    ],
  }
}

/* ==================== 5. INTEGRACIÓN Y DERIVACIÓN (M4) ==================== */

const igSimpsonGuiado: GenGuiado = (r) => {
  const b = r.elegir([2, 4])
  const n = r.elegir([2, 4])
  const h = b / n
  const f = (t: number) => t * t + 1
  let s = f(0) + f(b)
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(i * h)
  const approx = (h / 3) * s

  return {
    titulo: 'Regla de Simpson 1/3 compuesto y orden del error',
    contexto: T`Aproximar $I=\displaystyle\int_0^{${b}}(t^2+1)\,dt$ con Simpson 1/3 compuesto y $n=${n}$ subintervalos.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Requisito de paridad y paso h',
        tipo: 'opcion',
        enunciado: T`¿Por qué es válido $n=${n}$ en Simpson 1/3 y cuánto vale el paso $h=\dfrac{b-a}{n}$?`,
        opciones: [
          T`Es válido porque $n=${n}$ es par (arcos parabólicos de a 2 subintervalos) y $h=${fmt(h, 2)}$`,
          T`No es válido porque Simpson exige $n$ impar`,
          T`Es válido para cualquier $n$, y $h=${b * n}$`,
        ],
        correctaOpcion: 0,
        explicacion: T`Simpson 1/3 une grupos de 2 subintervalos (3 nodos) con parábolas, por eso requiere $n$ par; $h=(${b}-0)/${n}=${fmt(h, 2)}$.`,
        trampa: T`Divide $(b-a)=${b}$ entre $n=${n}$ y recuerda que cada parábola consume 2 subintervalos.`,
        tutor: [
          {
            regla: T`Una parábola necesita 3 puntos consecutivos, que abarcan 2 subintervalos de ancho $h$.`,
            pregunta: T`Por tanto, el número total de subintervalos $n$ en Simpson 1/3 debe ser siempre…`,
            opciones: ['Par (múltiplo de 2)', 'Impar'],
            correcta: 0,
            exito: T`¡Correcto! Y $h=${b}/${n}=${fmt(h, 2)}$.`,
            trampa: T`Para encajar un número entero de parábolas de 2 subintervalos cada una, $n=2k$.`,
            revelacion: T`$n=${n}$ es par y $h=${fmt(h, 2)}$.`,
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Cálculo de la integral',
        tipo: 'numerica',
        enunciado: T`Calcula $S_{${n}}$ con los pesos $1,4,2,\dots,4,1$ (4 decimales).`,
        correctaNumero: approx,
        tolerancia: 0.005,
        explicacion: T`$S_{${n}}=\dfrac{${fmt(h, 2)}}{3}\sum w_i f(t_i)=${fmt(approx, 4)}$ (coincide con el valor exacto por ser grado 2).`,
        trampa: T`Multiplica por $h/3 = ${fmt(h / 3, 4)}$, no por $h/2$.`,
        tutor: [
          {
            regla: T`Como $t^2+1$ es un polinomio de grado 2 ($\le 3$), Simpson 1/3 es exacto.`,
            pregunta: T`¿Cuál es el valor exacto $\left[\frac{t^3}{3}+t\right]_0^{${b}}$?`,
            opciones: [fmt(b ** 3 / 3 + b, 4), fmt(b ** 2 + b, 4)],
            correcta: 0,
            exito: T`¡Bien! Y Simpson reproduce exactamente ${fmt(approx, 4)}.`,
            trampa: T`Evalúa $\frac{${b}^3}{3}+${b}$.`,
            revelacion: T`$S_{${n}}=${fmt(approx, 4)}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Reducción del error al duplicar n',
        tipo: 'opcion',
        enunciado: 'Para una función general suave (grado ≥ 4), si duplicas n (divides h entre 2), ¿entre cuánto se divide el error de Simpson vs el del Trapecio?',
        opciones: [
          'Simpson entre 16 (O(h⁴)) y Trapecio entre 4 (O(h²))',
          'Ambos entre 2',
          'Simpson entre 4 y Trapecio entre 16',
        ],
        correctaOpcion: 0,
        explicacion: 'Al partir h a la mitad, h⁴ baja 2⁴ = 16 veces en Simpson y h² baja 2² = 4 veces en el trapecio.',
        trampa: 'Eleva 2 al orden respectivo del error global: 2⁴ = 16 para Simpson, 2² = 4 para el trapecio.',
        tutor: [
          {
            regla: T`El error del trapecio es $O(h^2)$ y el de Simpson es $O(h^4)$.`,
            pregunta: T`Si $h$ se sustituye por $h/2$, ¿cuánto vale $(1/2)^4$?`,
            opciones: ['1/16', '1/8'],
            correcta: 0,
            exito: '¡Exacto! Se divide entre 16.',
            trampa: T`$2 \times 2 \times 2 \times 2 = 16$.`,
            revelacion: 'Simpson mejora ×16; el trapecio, ×4.',
          },
        ],
      },
    ],
  }
}

const igDerivacionGuiado: GenGuiado = (r) => {
  const x0 = r.entero(1, 3)
  const h = r.elegir([0.1, 0.2])
  const f = (x: number) => x ** 3
  const central = (f(x0 + h) - f(x0 - h)) / (2 * h)

  return {
    titulo: 'Derivación numérica y compromiso truncamiento-redondeo',
    contexto: T`Estimar $f'(${x0})$ para $f(x)=x^3$ usando paso $h=${h}$.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Orden de truncamiento',
        tipo: 'opcion',
        enunciado: '¿Qué diferencia finita cancela el término de segundo orden y alcanza error de truncamiento O(h²)?',
        opciones: [
          T`Diferencia central $\dfrac{f(x_0+h)-f(x_0-h)}{2h}$`,
          T`Diferencia progresiva $\dfrac{f(x_0+h)-f(x_0)}{h}$`,
          T`Diferencia regresiva $\dfrac{f(x_0)-f(x_0-h)}{h}$`,
        ],
        correctaOpcion: 0,
        explicacion: 'Al restar las series de Taylor en x₀+h y x₀−h, los términos pares (incluido h²) se cancelan y el error queda O(h²).',
        trampa: 'Las diferencias progresiva y regresiva tienen error O(h) porque no cancelan el término de segunda derivada.',
        tutor: [
          {
            regla: T`En $f(x_0+h)-f(x_0-h)$, el término $\frac{h^2}{2}f''(x_0)$ aparece con el mismo signo en ambos desarrollos y se anula al restar.`,
            pregunta: T`¿Qué cociente divide entre $2h$ usando ambos lados de $x_0$?`,
            opciones: ['Diferencia central', 'Diferencia progresiva'],
            correcta: 0,
            exito: '¡Correcto! La simetría respecto a x₀ da orden O(h²).',
            trampa: 'Progresiva usa solo x₀ y x₀ + h.',
            revelacion: 'Diferencia central es O(h²).',
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Evaluación de la central',
        tipo: 'numerica',
        enunciado: T`Calcula la diferencia central $\dfrac{f(${x0}+${h})-f(${x0}-${h})}{2\cdot ${h}}$ para $f(x)=x^3$ (4 decimales).`,
        correctaNumero: central,
        tolerancia: 0.002,
        explicacion: T`$\dfrac{(${fmt(x0 + h, 1)})^3-(${fmt(x0 - h, 1)})^3}{${fmt(2 * h, 1)}}=${fmt(central, 4)}$ (exacta $3\cdot${x0}^2=${3 * x0 * x0}$, error $h^2=${fmt(h * h, 4)}$).`,
        trampa: T`No olvides el factor 2 en el denominador: divide entre $2h=${fmt(2 * h, 1)}$.`,
        tutor: [
          {
            regla: T`Calculamos $f(${fmt(x0 + h, 1)})=${fmt(f(x0 + h), 4)}$ y $f(${fmt(x0 - h, 1)})=${fmt(f(x0 - h), 4)}$.`,
            pregunta: T`¿Por cuánto dividimos la resta $f(x_0+h)-f(x_0-h)$?`,
            opciones: [T`$2h=${fmt(2 * h, 1)}$`, T`$h=${h}$`],
            correcta: 0,
            exito: T`¡Bien! Al dividir entre ${fmt(2 * h, 1)} resulta ${fmt(central, 4)}.`,
            trampa: T`La distancia total entre $x_0-h$ y $x_0+h$ es $2h$.`,
            revelacion: T`Estimación central $= ${fmt(central, 4)}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Peligro de h diminuto',
        tipo: 'opcion',
        enunciado: 'Si bajas demasiado el paso hasta h = 10⁻¹², ¿por qué empeora dramáticamente el error?',
        opciones: [
          'Porque f(x₀+h) y f(x₀−h) casi coinciden, se cancelan cifras al restar y domina el error de redondeo dividido entre 2h',
          'Porque la fórmula de Taylor deja de existir',
          'Porque h debe ser mayor que 10',
        ],
        correctaOpcion: 0,
        explicacion: 'El error total suma truncamiento O(h²) y redondeo O(ε/h): para h muy pequeño, ε/h crece explosivamente.',
        trampa: 'Aunque el error de truncamiento baje con h², el de redondeo crece como 1/h.',
        tutor: [
          {
            regla: T`El error de redondeo en diferencias finitas escala como $\varepsilon_{\text{máq}} / h$.`,
            pregunta: T`Si $h=10^{-12}$ y $\varepsilon\approx 2\times 10^{-16}$, ¿qué magnitud tiene $\varepsilon/h$?`,
            opciones: [T`$\sim 10^{-4}$ (enorme frente al mínimo óptimo)`, T`$10^{-28}$`],
            correcta: 0,
            exito: T`¡Exacto! El óptimo suele estar cerca de $h \sim 10^{-5}$.`,
            trampa: T`Divide $10^{-16}$ entre $10^{-12}$: $10^{-16 - (-12)} = 10^{-4}$.`,
            revelacion: 'Con h muy pequeño domina el redondeo por cancelación.',
          },
        ],
      },
    ],
  }
}

const igRefinamientoGuiado: GenGuiado = (r) => {
  const errBase = r.elegir([0.32, 0.48, 0.8])
  const errRefinado = errBase / 4
  return {
    titulo: 'Refinamiento de malla e interpretación física',
    contexto: T`Al integrar una tasa $r(t)$ con la regla del trapecio y $n=4$ subintervalos obtenemos un error de ${errBase} MB.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Ley de escala del trapecio',
        tipo: 'opcion',
        enunciado: 'Al duplicar subintervalos de n = 4 a n = 8 (h se parte a la mitad), ¿qué factor multiplica al error del trapecio?',
        opciones: ['1/4 (se divide entre 4)', '1/2', '1/16'],
        correctaOpcion: 0,
        explicacion: 'El error global del trapecio compuesto es proporcional a h², por lo que (h/2)² = h²/4.',
        trampa: '1/16 corresponde a Simpson O(h⁴); el trapecio es de orden O(h²).',
        tutor: [
          {
            regla: T`El error del trapecio cumple $E \propto h^2 = \left(\frac{b-a}{n}\right)^2$.`,
            pregunta: T`Si $n$ pasa de $4$ a $8$ (el doble), ¿qué le ocurre a $1/n^2$?`,
            opciones: ['Se divide entre 4', 'Se divide entre 2'],
            correcta: 0,
            exito: '¡Exacto! $2^2 = 4$.',
            trampa: 'Eleva el factor de refinamiento (2) al cuadrado.',
            revelacion: 'El error baja en un factor 4.',
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Error esperado con n = 8',
        tipo: 'numerica',
        enunciado: T`Estima el nuevo error del trapecio al refinar de $n=4$ (${errBase} MB) a $n=8$ (3 decimales).`,
        correctaNumero: errRefinado,
        tolerancia: 0.005,
        explicacion: T`$${errBase}/4 = ${fmt(errRefinado, 3)}$ MB.`,
        trampa: T`Divide ${errBase} entre 4.`,
        tutor: [
          {
            regla: T`Aplicamos el factor $1/4$ al error previo.`,
            pregunta: T`¿Cuánto es ${errBase} dividido entre 4?`,
            opciones: [fmt(errRefinado, 3), fmt(errBase / 2, 3)],
            correcta: 0,
            exito: T`¡Bien! Queda ${fmt(errRefinado, 3)} MB.`,
            trampa: T`Dividir entre 2 daría ${fmt(errBase / 2, 3)}; vuelve a dividir entre 2.`,
            revelacion: T`Error estimado $\approx ${fmt(errRefinado, 3)}$ MB.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Significado físico de tasa negativa',
        tipo: 'opcion',
        enunciado: 'Si r(t) toma valores negativos en parte del intervalo [a, b], ¿qué representa la integral numérica?',
        opciones: [
          'El balance neto (las zonas negativas restan); ya no es simplemente volumen físico positivo acumulado',
          'Siempre da un error matemático y no se puede calcular',
          'La integral suma los valores absolutos automáticamente',
        ],
        correctaOpcion: 0,
        explicacion: 'La integral calcula áreas con signo: si la tasa es negativa el portal calcula el neto pero avisa que pierde la interpretación física positiva.',
        trampa: 'El cálculo numérico sigue siendo válido matemáticamente, pero su lectura física cambia.',
        tutor: [
          {
            regla: T`La integral de Riemann suma rectángulos de altura $r(t_i)$.`,
            pregunta: T`Si $r(t_i)<0$ en un tramo, su contribución $r(t_i)\cdot h$ al total es…`,
            opciones: ['Negativa (resta del acumulado)', 'Siempre positiva'],
            correcta: 0,
            exito: '¡Exacto! Por eso el portal emite una advertencia de interpretación física.',
            trampa: 'Una altura negativa multiplicada por h > 0 da producto negativo.',
            revelacion: 'Representa flujo o cambio neto, no volumen estrictamente positivo.',
          },
        ],
      },
    ],
  }
}

/* ==================== 6. ECUACIONES DIFERENCIALES (M5) ==================== */

const edEstabilidadGuiado: GenGuiado = (r) => {
  const k = r.elegir([0.5, 1, 2])
  const modoOsc = r.elegir([true, false])
  // Si modoOsc: kh = 1.5 (estable pero oscilatorio, -1 < R < 0)
  // Si no: kh = 2.5 (inestable, R = -1.5, |R| > 1)
  const kh = modoOsc ? 1.5 : 2.5
  const h = kh / k
  const R = 1 - kh

  return {
    titulo: 'Estabilidad numérica vs validez física en Euler',
    contexto: T`Para el enfriamiento $T'=-${k}(T-20)$ con $T(0)=80$ °C usamos Euler explícito con paso $h=${fmt(h, 2)}$ min.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Régimen según |1 − kh|',
        tipo: 'opcion',
        enunciado: T`El límite de estabilidad absoluta de Euler es $0<h<\dfrac{2}{k}=${fmt(2 / k, 2)}$. Con $k=${k}$ y $h=${fmt(h, 2)}$, ¿en qué régimen está Euler?`,
        opciones: [
          'Estable pero oscilatorio (−1 < 1 − kh < 0)',
          'Inestable (|1 − kh| > 1: las oscilaciones crecen sin límite)',
          'Monótonamente decreciente y físico (0 < 1 − kh < 1)',
        ],
        correctaOpcion: modoOsc ? 0 : 1,
        explicacion: modoOsc
          ? T`$kh=${kh} \in (1, 2)$, así que $R=${fmt(R, 2)}$ cumple $|R|<1$ (estable) pero es negativo (oscila).`
          : T`$kh=${kh} > 2$, así que $|R|=|${fmt(R, 2)}|>1$: cada paso amplifica el error y diverge oscilando.`,
        trampa: T`Calcula $kh = ${k}\cdot ${fmt(h, 2)} = ${kh}$ y compáralo con los umbrales $1$ y $2$.`,
        tutor: [
          {
            regla: T`Para Euler en $y'=-ky$, la recurrencia es $y_{n+1}=(1-kh)y_n$.`,
            pregunta: T`¿Cuánto vale el producto adimensional $k\cdot h = ${k}\cdot ${fmt(h, 2)}$?`,
            opciones: [String(kh), String(k + h)],
            correcta: 0,
            exito: T`¡Bien! $kh = ${kh}$.`,
            trampa: T`Multiplica ${k} por ${fmt(h, 2)}.`,
            revelacion: T`Como $kh=${kh}$ ${kh < 2 ? 'está entre 1 y 2' : 'supera 2'}, el factor $R=1-${kh}$ es ${kh < 2 ? 'negativo con $|R|<1$' : 'menor que $-1$ (inestable)'}.`,
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Factor de amplificación R',
        tipo: 'numerica',
        enunciado: T`Calcula el factor por paso $R = 1 - k\cdot h$ (2 decimales).`,
        correctaNumero: R,
        tolerancia: 0.01,
        explicacion: T`$R = 1 - ${k}\cdot ${fmt(h, 2)} = ${fmt(R, 2)}$.`,
        trampa: T`No olvides el signo negativo: $1 - ${kh} = ${fmt(R, 2)}$.`,
        tutor: [
          {
            regla: T`Sustituye $k\cdot h=${kh}$ en $R = 1 - kh$.`,
            pregunta: T`¿El signo de $R = 1 - ${kh}$ es positivo o negativo?`,
            opciones: ['Negativo', 'Positivo'],
            correcta: 0,
            exito: T`¡Correcto! $R = ${fmt(R, 2)}$, por eso la desviación cambia de signo en cada paso.`,
            trampa: T`Como $${kh} > 1$, al restárselo a 1 da negativo.`,
            revelacion: T`$R = ${fmt(R, 2)}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Lectura física de la trayectoria',
        tipo: 'opcion',
        enunciado: 'Con R < 0 la temperatura simulada salta por debajo y por encima de la temperatura ambiente (20 °C). ¿Es físicamente válida?',
        opciones: [
          'No es físicamente válida: un cuerpo enfriándose en aire a 20 °C no puede bajar a menos de 20 °C y rebotar hacia arriba',
          'Sí, siempre que |R| < 1 la curva es físicamente exacta',
          'Solo es inválida si h = 0',
        ],
        correctaOpcion: 0,
        explicacion: 'Estabilidad numérica (acotada) no equivale a validez física ni precisión: se necesita kh < 1 (h < 1/k) para evitar oscilaciones no físicas.',
        trampa: 'Recuerda el lema del módulo: estable ≠ preciso ≠ físicamente válido.',
        tutor: [
          {
            regla: T`La solución exacta $T(t)=20+60e^{-kt}$ siempre se mantiene por encima de 20 °C.`,
            pregunta: T`Si $T_0 - 20 = +60$ y $R = ${fmt(R, 2)} < 0$, ¿cuánto da $T_1 = 20 + 60R$?`,
            opciones: ['Menor que 20 °C (cruza la temperatura ambiente)', 'Mayor que 80 °C'],
            correcta: 0,
            exito: '¡Exacto! Cruzar 20 °C en un enfriamiento pasivo viola la física del problema.',
            trampa: 'Sumar un número negativo a 20 da menos de 20.',
            revelacion: 'Trayectoria no física aunque |R| < 1.',
          },
        ],
      },
    ],
  }
}

const edEulerGuiado: GenGuiado = (r) => {
  const k = r.elegir([0.5, 1])
  const T0 = r.elegir([60, 80, 100])
  const Ta = 20
  const h = r.elegir([0.25, 0.5])
  const f0 = -k * (T0 - Ta)
  const T1 = T0 + h * f0

  return {
    titulo: 'Euler explícito paso a paso y orden global',
    contexto: T`Ley de enfriamiento $T'=-${k}(T-${Ta})$ con $T(0)=${T0}$ °C y paso $h=${h}$ min.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Pendiente inicial',
        tipo: 'numerica',
        enunciado: T`Calcula la pendiente inicial $T'(0) = -${k}(${T0}-${Ta})$ en °C/min (2 decimales).`,
        correctaNumero: f0,
        tolerancia: 0.01,
        explicacion: T`$T'(0)=-${k}\cdot ${T0 - Ta}=${fmt(f0, 2)}$ °C/min (negativa porque se enfría).`,
        trampa: T`Conserva el signo menos: si $T_0 > ${Ta}$, la temperatura baja y la derivada es negativa.`,
        tutor: [
          {
            regla: T`La diferencia respecto al ambiente es $T_0 - T_a = ${T0} - ${Ta} = ${T0 - Ta}$.`,
            pregunta: T`Al multiplicar por $-k=-${k}$, la pendiente es…`,
            opciones: [T`${fmt(f0, 2)} °C/min`, T`${fmt(-f0, 2)} °C/min`],
            correcta: 0,
            exito: T`¡Bien! El signo negativo indica enfriamiento.`,
            trampa: T`No olvides el signo menos delante de ${k}.`,
            revelacion: T`Pendiente inicial $= ${fmt(f0, 2)}$ °C/min.`,
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Primer paso de Euler',
        tipo: 'numerica',
        enunciado: T`Calcula $T_1 = T_0 + h\cdot T'(0)$ con $h=${h}$ (3 decimales).`,
        correctaNumero: T1,
        tolerancia: 0.01,
        explicacion: T`$T_1=${T0}+${h}\cdot(${fmt(f0, 2)})=${fmt(T1, 3)}$ °C.`,
        trampa: T`Multiplica el paso $h=${h}$ por la pendiente ${fmt(f0, 2)} y súmalo a ${T0}.`,
        tutor: [
          {
            regla: T`El incremento es $\Delta T = h \cdot f(0, T_0) = ${h}\cdot(${fmt(f0, 2)})$.`,
            pregunta: T`¿Cuánto vale $\Delta T$?`,
            opciones: [fmt(h * f0, 3), fmt(h + f0, 3)],
            correcta: 0,
            exito: T`¡Exacto! $\Delta T = ${fmt(h * f0, 3)}$ °C.`,
            trampa: T`Multiplica $h=${h}$ por ${fmt(f0, 2)}.`,
            revelacion: T`$T_1 = ${T0} + (${fmt(h * f0, 3)}) = ${fmt(T1, 3)}$ °C.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Orden del error global',
        tipo: 'opcion',
        enunciado: 'Si repites la simulación partiendo el paso h a la mitad (h/2), ¿cómo cambia aproximadamente el error global de Euler en t_f?',
        opciones: [
          'Se reduce aproximadamente a la mitad (÷ 2), porque Euler es de orden 1',
          'Se divide entre 16 (orden 4)',
          'Se duplica',
        ],
        correctaOpcion: 0,
        explicacion: 'Euler tiene error local O(h²) que se acumula en N = t_f/h pasos, dando error global O(h) de orden 1.',
        trampa: 'Dividir entre 16 es propio de RK4; Euler explícito es de orden 1.',
        tutor: [
          {
            regla: T`El error global de Euler escala proporcionalmente a $h^1$.`,
            pregunta: T`Si cambias $h$ por $h/2$, ¿qué ocurre con el error global?`,
            opciones: ['Baja a la mitad (÷ 2)', 'Baja a la cuarta parte (÷ 4)'],
            correcta: 0,
            exito: '¡Exacto! Orden 1 significa relación lineal con h.',
            trampa: 'El exponente de h en el error global es 1, no 2.',
            revelacion: 'El error global se divide entre ≈ 2.',
          },
        ],
      },
    ],
  }
}

const edRK4Guiado: GenGuiado = (r) => {
  const a = r.elegir([-1, 1])
  const y0 = r.elegir([1, 2])
  const h = r.elegir([0.2, 0.4, 0.5])
  const k1 = a * y0
  const k2 = a * (y0 + (h / 2) * k1)

  return {
    titulo: 'Estructura y precisión de Runge-Kutta 4 (RK4)',
    contexto: T`Para $y'=${a === 1 ? '' : '-'}y$ con $y(0)=${y0}$ damos un paso de RK4 con $h=${h}$.`,
    pasos: [
      {
        numero: 1,
        etiqueta: 'Paso 1 · Evaluaciones y pesos',
        tipo: 'opcion',
        enunciado: '¿Cuántas evaluaciones de f(t, y) realiza RK4 por paso y con qué pesos las promedia?',
        opciones: [
          '4 evaluaciones (k₁, k₂, k₃, k₄) con pesos (1, 2, 2, 1)/6',
          '2 evaluaciones con pesos (1, 1)/2',
          '4 evaluaciones con pesos iguales (1, 1, 1, 1)/4',
        ],
        correctaOpcion: 0,
        explicacion: 'RK4 evalúa una vez al inicio (k₁), dos en el punto medio (k₂, k₃) y una al final (k₄), dando doble peso al punto medio.',
        trampa: 'Los pesos suman 1+2+2+1 = 6; por eso la fórmula divide entre 6.',
        tutor: [
          {
            regla: T`La fórmula de RK4 es $y_{n+1}=y_n+\frac{h}{6}(k_1+2k_2+2k_3+k_4)$.`,
            pregunta: T`¿Qué evaluaciones tienen peso doble en el promedio?`,
            opciones: [T`Las del punto medio $k_2$ y $k_3$`, T`Los extremos $k_1$ y $k_4$`],
            correcta: 0,
            exito: '¡Bien! Como en la regla de Simpson, el punto medio pesa más.',
            trampa: 'Mira los coeficientes delante de k₂ y k₃ en la suma.',
            revelacion: '4 evaluaciones con pesos (1, 2, 2, 1)/6.',
          },
        ],
      },
      {
        numero: 2,
        etiqueta: 'Paso 2 · Pendiente intermedia k₂',
        tipo: 'numerica',
        enunciado: T`Con $k_1 = ${fmt(k1, 2)}$, calcula $k_2 = f\!\left(\frac{h}{2},\,y_0+\frac{h}{2}k_1\right)$ (4 decimales).`,
        correctaNumero: k2,
        tolerancia: 0.002,
        explicacion: T`$y_0+\frac{${h}}{2}(${fmt(k1, 2)})=${fmt(y0 + (h / 2) * k1, 4)}$, luego $k_2=${a}\cdot ${fmt(y0 + (h / 2) * k1, 4)}=${fmt(k2, 4)}$.`,
        trampa: T`En $k_2$ solo avanzas medio paso ($h/2=${h / 2}$) usando la pendiente inicial $k_1=${fmt(k1, 2)}$.`,
        tutor: [
          {
            regla: T`Primero estima $y$ en la mitad del paso: $y_{\text{med}} = y_0 + \frac{h}{2}k_1$.`,
            pregunta: T`¿Cuánto vale $y_{\text{med}} = ${y0} + ${h / 2}\cdot(${fmt(k1, 2)})$?`,
            opciones: [fmt(y0 + (h / 2) * k1, 4), fmt(y0 + h * k1, 4)],
            correcta: 0,
            exito: T`¡Correcto! Multiplicando por ${a} resulta $k_2=${fmt(k2, 4)}$.`,
            trampa: T`Usa $h/2=${h / 2}$, no $h=${h}$.`,
            revelacion: T`$k_2=${fmt(k2, 4)}$.`,
          },
        ],
      },
      {
        numero: 3,
        etiqueta: 'Paso 3 · Eficiencia de orden 4',
        tipo: 'opcion',
        enunciado: 'Al reducir h a la mitad en RK4, ¿entre cuánto se divide aproximadamente su error global y cuándo compensa sus 4 evaluaciones por paso?',
        opciones: [
          'Se divide entre 16 (2⁴); compensa cuando se busca alta precisión o evaluar f es caro',
          'Se divide entre 4; solo sirve para pasos iguales a 1',
          'No cambia con el paso h',
        ],
        correctaOpcion: 0,
        explicacion: 'Al ser de orden 4 (O(h⁴)), RK4 logra errores minúsculos con pasos mucho mayores que Euler, reduciendo evaluaciones totales.',
        trampa: 'Eleva 2 a la potencia 4 del orden del método: 2⁴ = 16.',
        tutor: [
          {
            regla: T`El error global de RK4 es $O(h^4)$.`,
            pregunta: T`Si divides $h$ entre 2, ¿entre cuánto baja el error global?`,
            opciones: ['Entre 16 (2⁴)', 'Entre 2 (2¹)'],
            correcta: 0,
            exito: '¡Exacto! Por eso RK4 alcanza errores de 10⁻⁴ donde Euler necesitaría cientos de pasos.',
            trampa: T`Calcula $2^4 = 2\cdot 2\cdot 2\cdot 2$.`,
            revelacion: 'Baja ×16 y ahorra evaluaciones totales para precisión alta.',
          },
        ],
      },
    ],
  }
}

export const BANCO_GUIADO: Record<TemaId, GenGuiado[]> = {
  errores: [errCorteRedondeo, errTaylorTrunc, errCancelacionGuiado],
  ecuaciones: [ecNewtonGuiado, ecSecanteGuiado, ecPolinomioGuiado],
  sistemas: [sisDominanciaGuiado, sisEliminacionGuiado, sisResiduoGuiado],
  interpolacion: [intEleccionGuiado, intLagrangeGuiado, intAjusteGuiado],
  integracion: [igSimpsonGuiado, igDerivacionGuiado, igRefinamientoGuiado],
  diferenciales: [edEstabilidadGuiado, edEulerGuiado, edRK4Guiado],
}

/** Mezcla los pasos generados para que la respuesta correcta no ocupe siempre el primer lugar. */
function mezclarPaso(p: PasoEncadenado, r: Azar): PasoEncadenado {
  const tutor = p.tutor.map((m) => {
    if (m.correcta !== 0 || m.opciones.length < 2) return m
    const ord = ordenarOpciones(m.opciones, r)
    return { ...m, opciones: ord.opciones, correcta: ord.correcta }
  })
  if (p.tipo === 'opcion' && p.opciones && p.opciones.length >= 2 && p.correctaOpcion !== undefined) {
    const corr = p.opciones[p.correctaOpcion]
    const restantes = p.opciones.filter((_, idx) => idx !== p.correctaOpcion)
    const ord = ordenarOpciones([corr, ...restantes], r)
    return { ...p, opciones: ord.opciones, correctaOpcion: ord.correcta, tutor }
  }
  return { ...p, tutor }
}

/** Genera una ronda dinámica de ejercicios guiados de 3 pasos encadenados para un tema. */
export function generarRondaGuiada(tema: TemaId, semilla: number, cantidad = 3): EjercicioGuiado[] {
  const gens = BANCO_GUIADO[tema]
  const r = crearAzar(semilla * 65537 + tema.length * 97)
  const inicio = r.entero(0, gens.length - 1)
  return Array.from({ length: cantidad }, (_, i) => {
    const gen = gens[(inicio + i) % gens.length]
    const subSemilla = semilla * 104729 + i * 7919 + tema.charCodeAt(0) * 131
    const azarEj = crearAzar(subSemilla)
    const bruto = gen(azarEj)
    const pasos = bruto.pasos.map((paso) => mezclarPaso(paso, azarEj)) as [PasoEncadenado, PasoEncadenado, PasoEncadenado]
    return {
      ...bruto,
      pasos,
      id: `guiado-${tema}-${semilla}-${i}`,
      tema,
    }
  })
}

const PREFIJO_A_TEMA: Record<string, TemaId> = {
  err: 'errores',
  dec: 'ecuaciones',
  cer: 'ecuaciones',
  abi: 'ecuaciones',
  pol: 'ecuaciones',
  sis: 'sistemas',
  m2: 'sistemas',
  int: 'interpolacion',
  m3: 'interpolacion',
  reg: 'interpolacion',
  ig: 'integracion',
  m4: 'integracion',
  sim: 'integracion',
  der: 'integracion',
  ed: 'diferenciales',
  eu: 'diferenciales',
  rk: 'diferenciales',
  es: 'diferenciales',
}

/** Mapea el prefijo de ID de las preguntas existentes al tema correspondiente del banco dinámico. */
export function inferirTemaDesdePreguntas(preguntas: Pregunta[]): TemaId {
  const id = preguntas[0]?.id ?? ''
  const prefijo = id.split('-')[0] ?? ''
  return PREFIJO_A_TEMA[prefijo] ?? 'errores'
}

function posDeterminista(clave: string, n: number): number {
  let h = 0
  for (let i = 0; i < clave.length; i++) h = (h * 31 + clave.charCodeAt(i)) >>> 0
  return h % n
}

function ubicarMicro(m: MicroPasoSocratico, clave: string): MicroPasoSocratico {
  if (m.correcta !== 0 || m.opciones.length < 2) return m
  const pos = posDeterminista(clave, m.opciones.length)
  if (pos === 0) return m
  const copia = [...m.opciones]
  ;[copia[0], copia[pos]] = [copia[pos], copia[0]]
  return { ...m, opciones: copia, correcta: pos }
}

/** Crea un tutor socrático de 2 micro-pasos a partir de una pregunta de autoevaluación existente sin revelar la respuesta final de golpe. */
export function crearTutorDesdePregunta(p: Pregunta): MicroPasoSocratico[] {
  if (p.tipo === 'opcion') {
    const descartada = p.correcta === 0 ? 1 : 0
    return [
      ubicarMicro({
        regla: 'Paso 1 · Descarte razonado: antes de elegir la respuesta final, identifica por qué una de las opciones es incompatible con la definición o condición del método.',
        pregunta: `Observa la opción «${p.opciones[descartada]}». ¿Por qué podemos descartarla?`,
        opciones: [
          p.porOpcion?.[descartada] ?? 'Contradice la hipótesis o definición del método.',
          'No se puede descartar: es equivalente a todas las demás.',
        ],
        correcta: 0,
        exito: '¡Bien razonado! Descartar distractores conceptuales evita responder por intuición.',
        trampa: 'Revisa los supuestos del método en el enunciado: esa opción falla justo en una condición clave.',
        revelacion: p.porOpcion?.[descartada] ?? 'Opción descartada con fundamento teórico.',
      }, `${p.id}-1`),
      ubicarMicro({
        regla: 'Paso 2 · Verificación del criterio: elige la afirmación que sí respeta la condición matemática del tema.',
        pregunta: `De las alternativas válidas, ¿cuál describe correctamente la propiedad buscada en: «${p.enunciado}»?`,
        opciones: [
          p.opciones[p.correcta],
          p.opciones[(p.correcta + 1) % p.opciones.length] ?? 'Ninguna de las anteriores',
        ],
        correcta: 0,
        exito: '¡Excelente! Ya tienes todo el razonamiento completo.',
        trampa: 'Vuelve a leer la definición clave: recuerda qué exige el método para funcionar.',
        revelacion: p.explicacion,
      }, `${p.id}-2`),
    ]
  }

  if (p.tipo === 'vf') {
    return [
      ubicarMicro({
        regla: 'Paso 1 · Búsqueda de contraejemplos: en enunciados de Verdadero/Falso, verifica si la propiedad vale siempre o si existe un caso donde falle.',
        pregunta: `Al analizar: «${p.enunciado}», ¿qué postura metodológica debemos verificar primero?`,
        opciones: [
          p.correcta
            ? 'Verificar si se cumplen todas las hipótesis que garantizan la afirmación'
            : 'Buscar un caso límite o contraejemplo donde la hipótesis falle',
          'Responder al azar sin revisar casos límite',
        ],
        correcta: 0,
        exito: '¡Muy bien! Ese análisis evita caer en generalizaciones falsas.',
        trampa: 'Siempre contrasta la frase contra sus hipótesis y casos límite.',
        revelacion: p.profundiza ?? p.explicacion,
      }, `${p.id}-1`),
      ubicarMicro({
        regla: 'Paso 2 · Conclusión fundamentada.',
        pregunta: 'Con base en el análisis anterior, la afirmación resulta:',
        opciones: [p.correcta ? 'Verdadera' : 'Falsa', p.correcta ? 'Falsa' : 'Verdadera'],
        correcta: 0,
        exito: '¡Correcto! Ahora ya puedes justificar tu respuesta sin dudas.',
        trampa: 'Revisa la pista desbloqueada en el paso anterior.',
        revelacion: p.explicacion,
      }, `${p.id}-2`),
    ]
  }

  return [
    ubicarMicro({
      regla: 'Paso 1 · Identificación de fórmula y datos: antes de operar, asegura qué magnitud se pide y con qué fórmula se calcula.',
      pregunta: `En «${p.enunciado}», ¿cuál es el primer paso seguro antes de ingresar el número?`,
      opciones: [
        'Identificar los datos dados, sustituir en la fórmula del método y respetar la tolerancia',
        'Aproximar mentalmente sin escribir la fórmula ni verificar signos',
      ],
      correcta: 0,
      exito: '¡Exacto! Sustituir ordenadamente evita errores de signo y orden de operaciones.',
      trampa: 'Un error de signo o de escala suele arruinar el cálculo numérico.',
      revelacion: `Recuerda que se acepta margen ± ${p.tolerancia}.`,
    }, `${p.id}-1`),
    ubicarMicro({
      regla: 'Paso 2 · Control del orden de magnitud: comprueba el resultado paso a paso.',
      pregunta: '¿Qué referencia confirma que tu cálculo va por buen camino?',
      opciones: [p.explicacion, 'El resultado siempre debe ser negativo'],
      correcta: 0,
      exito: '¡Listo! Revisa el desarrollo y comprueba tu respuesta numérica.',
      trampa: 'Contrasta tu operación con la expresión matemática del método.',
      revelacion: p.profundiza ?? p.explicacion,
    }, `${p.id}-2`),
  ]
}

/** Construye un tutor socrático de 2 micro-pasos para problemas paramétricos de PracticaGenerada. */
export function crearTutorDesdeProblema(p: Problema): MicroPasoSocratico[] {
  if (p.tutor?.length) return p.tutor
  const paso1 = p.pasos[0] ?? 'Identifica la fórmula del método.'
  const paso2 = p.pasos[1] ?? paso1
  const ultimo = p.pasos[p.pasos.length - 1] ?? paso2
  return [
    ubicarMicro({
      regla: `Paso 1 · Planteamiento de «${p.titulo}»: antes de calcular los campos (${p.campos.map((c) => c.etiqueta).join(', ')}), identifica el principio del método.`,
      pregunta: '¿Qué paso inicial debes ejecutar primero según el enunciado?',
      opciones: [
        paso1,
        'Omitir la definición del método y promediar los datos directamente',
      ],
      correcta: 0,
      exito: '¡Muy bien! Partir de la definición correcta encarrila todo el ejercicio.',
      trampa: 'Revisa qué fórmula pide exactamente el enunciado.',
      revelacion: paso2,
    }, `${p.id}-1`),
    ubicarMicro({
      regla: 'Paso 2 · Verificación intermedia: revisa cómo se combinan los valores antes del resultado final.',
      pregunta: '¿Cuál de estas relaciones guía la comprobación final del cálculo?',
      opciones: [
        ultimo,
        'El error siempre es cero sin importar el método',
      ],
      correcta: 0,
      exito: '¡Excelente! Ahora ingresa los valores calculados y verifica tu resultado.',
      trampa: 'Presta atención al paso intermedio revelado arriba.',
      revelacion: p.pasos.slice(2).join(' · ') || ultimo,
    }, `${p.id}-2`),
  ]
}
