import Matematica from '../../components/Matematica'
import type { Ejercicio } from '../../components/Ejercicios'
import type { Pregunta } from '../../core/autoevaluacion'

const M = Matematica

export const EJERCICIOS_M3: Ejercicio[] = [
  {
    id: 'm3-e1', nivel: 'Intermedio', titulo: 'Lagrange con tres nodos',
    enunciado: <p>Con los nodos <M tex="(0,1),\;(1,3),\;(3,2)" /> calcula a mano <M tex="P(2)" /> con las bases de Lagrange y comprueba que las bases suman 1.</p>,
    verificar: <>Compruébalo en la calculadora de Lagrange con 3 puntos y consulta 2.</>,
    solucion: <>
      <p><M tex="L_0(2)=\frac{(2-1)(2-3)}{(0-1)(0-3)}=-\frac13,\quad L_1(2)=\frac{(2-0)(2-3)}{(1-0)(1-3)}=1,\quad L_2(2)=\frac{(2-0)(2-1)}{(3-0)(3-1)}=\frac13." /></p>
      <p>Suman <M tex="-\tfrac13+1+\tfrac13=1" />, como debe ocurrir. Entonces <M tex="P(2)=1\cdot(-\tfrac13)+3\cdot1+2\cdot\tfrac13=\tfrac{10}{3}\approx3.3333" />.</p>
    </>,
  },
  {
    id: 'm3-e2', nivel: 'Intermedio', titulo: 'Recta de mínimos cuadrados',
    enunciado: <p>Ajusta una recta a <M tex="(1,2),\;(2,3),\;(3,5),\;(4,6)" />. Calcula pendiente, intercepto, la suma de cuadrados de los residuos y la predicción en <M tex="x=5" />. ¿Es una interpolación o una extrapolación?</p>,
    verificar: <>Compruébalo en la calculadora de regresión (4 puntos, consulta 5).</>,
    solucion: <>
      <p><M tex="\bar x=2.5,\;\bar y=4,\;S_{xx}=5,\;S_{xy}=(-1.5)(-2)+(-0.5)(-1)+(0.5)(1)+(1.5)(2)=7" />.</p>
      <p><M tex="b_1=7/5=1.4,\quad b_0=4-1.4\cdot2.5=0.5" />, es decir <M tex="y=0.5+1.4x" />.</p>
      <p>Ajustados <M tex="(1.9,\,3.3,\,4.7,\,6.1)" />; residuos <M tex="(0.1,\,-0.3,\,0.3,\,-0.1)" /> (suman 0) y <M tex="\mathrm{SSE}=0.01+0.09+0.09+0.01=0.2" />.</p>
      <p>En <M tex="x=5" />: <M tex="\hat y=0.5+1.4\cdot5=7.5" />. Como <M tex="5>4" /> es una <strong>extrapolación</strong>: el portal lo avisa porque nada en los datos respalda ese valor.</p>
    </>,
  },
  {
    id: 'm3-e3', nivel: 'Avanzado', titulo: 'Más nodos no siempre es mejor (Runge)',
    enunciado: <p>Se toman 6 nodos equiespaciados de <M tex="f(x)=\dfrac1{1+25x^2}" /> en <M tex="x=-1,-0.6,-0.2,0.2,0.6,1" /> (con 4 decimales). Interpola en <M tex="x=0.8" /> y compara con <M tex="f(0.8)" />. ¿Qué observas y por qué ocurre?</p>,
    verificar: <>Usa el botón «Ejemplo de oscilación (6 nodos)» de la calculadora de Lagrange.</>,
    solucion: <>
      <p><M tex="f(0.8)=1/17\approx0.0588" /> (positivo), pero el polinomio de grado 5 da <M tex="P(0.8)\approx-0.0481" />: un valor negativo, imposible para esta función. En el centro también falla: <M tex="P(0)\approx0.567" /> frente a <M tex="f(0)=1" />.</p>
      <p>Es el <strong>fenómeno de Runge</strong>: con nodos equiespaciados, un polinomio de grado alto pasa por todos los datos pero oscila entre ellos, sobre todo cerca de los extremos. Pasar por los puntos no garantiza acercarse a la función; para funciones suaves y con ruido conviene un grado bajo o una regresión.</p>
    </>,
  },
  {
    id: 'm3-e4', nivel: 'Avanzado', titulo: 'Propiedades de los residuos',
    enunciado: <p>Demuestra que en la recta de mínimos cuadrados <M tex="\sum_i r_i=0" /> y que la recta pasa por <M tex="(\bar x,\bar y)" />. Verifícalo con los datos de la guía <M tex="(0,1),(1,2),(2,2),(3,4)" />.</p>,
    solucion: <>
      <p>Se minimiza <M tex="S(b_0,b_1)=\sum(y_i-b_0-b_1x_i)^2" />. La condición <M tex="\partial S/\partial b_0=-2\sum(y_i-b_0-b_1x_i)=0" /> dice exactamente <M tex="\sum r_i=0" />.</p>
      <p>De ahí <M tex="n\bar y-nb_0-nb_1\bar x=0" />, o sea <M tex="b_0=\bar y-b_1\bar x" />: al evaluar en <M tex="\bar x" /> se obtiene <M tex="\bar y" />, así que la recta pasa por el centro de masa de los datos.</p>
      <p>Con los datos de la guía: <M tex="\bar x=1.5,\;\bar y=2.25" />, la recta es <M tex="y=0.9+0.9x" /> y <M tex="0.9+0.9\cdot1.5=2.25" /> ✔. Residuos <M tex="0.1,\,0.2,\,-0.7,\,0.4" />, con suma 0 y SSE = 0.70.</p>
    </>,
  },
]

export const PREGUNTAS_M3: Pregunta[] = [
  { id: 'm3-q1', tipo: 'opcion', enunciado: 'Los datos vienen de mediciones con ruido y se busca la tendencia general. ¿Qué modelo conviene?',
    opciones: ['Interpolación de Lagrange con todos los puntos', 'Regresión lineal por mínimos cuadrados', 'Ninguno: no se puede estimar nada', 'Lagrange del mayor grado posible'], correcta: 1,
    explicacion: 'La regresión resume la tendencia sin obligar a la curva a reproducir el ruido; Lagrange pasa por cada punto, error de medición incluido.' },
  { id: 'm3-q2', tipo: 'vf', enunciado: 'Aumentar el grado del polinomio interpolante siempre reduce el error entre los nodos.', correcta: false,
    explicacion: 'Falso: con nodos equiespaciados puede aumentar y aparecen oscilaciones (fenómeno de Runge).' },
  { id: 'm3-q3', tipo: 'numerica', enunciado: 'Para los nodos x = 0, 1, 2, 3, calcula la base de Lagrange L₁(1.5).', correcta: 0.5625, tolerancia: 0.0001,
    explicacion: 'L₁(1.5) = (1.5−0)(1.5−2)(1.5−3) / ((1−0)(1−2)(1−3)) = 1.125 / 2 = 0.5625.' },
  { id: 'm3-q4', tipo: 'opcion', enunciado: 'Dos nodos tienen la misma abscisa pero distinto valor de y. ¿Qué debe hacer la interpolación de Lagrange?',
    opciones: ['Eliminar uno de los dos en silencio', 'Promediar los valores de y automáticamente', 'Rechazar la entrada e informar el motivo', 'Usar solo el primero'], correcta: 2,
    explicacion: 'Una función no puede tomar dos valores en el mismo x y las bases se indeterminan (división entre 0); no se modifican los datos sin avisar.' },
  { id: 'm3-q5', tipo: 'numerica', enunciado: 'Con la recta y = 0.9 + 0.9x, ¿cuánto predice en x = 3.5?', correcta: 4.05, tolerancia: 0.000001,
    explicacion: '0.9 + 0.9 · 3.5 = 4.05. Como 3.5 está fuera de [0, 3], es una extrapolación y el portal lo advierte.' },
  { id: 'm3-q6', tipo: 'vf', enunciado: 'La recta de mínimos cuadrados siempre pasa por el punto (x̄, ȳ).', correcta: true,
    explicacion: 'Verdadero: la condición para b₀ implica b₀ = ȳ − b₁·x̄.' },
]
