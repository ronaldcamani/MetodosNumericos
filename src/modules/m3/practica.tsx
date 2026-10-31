import Matematica from '../../components/Matematica'
import type { Ejercicio } from '../../components/Ejercicios'
import type { Pregunta } from '../../core/autoevaluacion'
import { presetDatos } from './paginas'

const M = Matematica

/* ---------- Planteo y decisión ---------- */
export const EJERCICIOS_DECISION_INTERP: Ejercicio[] = [
  {
    id: 'int-d1', nivel: 'Intermedio', titulo: 'Predecir la latencia con mediciones ruidosas',
    enunciado: (
      <p>
        Se midió la latencia (ms) de un servicio con cargas <M tex="x=1,2,3,4" />: <M tex="y=2.1,\;3.9,\;6.2,\;7.8" />. Las mediciones tienen ruido. Se quiere predecir la latencia con carga <M tex="x=5" />. Decide tu plan.
      </p>
    ),
    plan: {
      pregunta: '¿qué modelo usarás?',
      opciones: [
        { id: 'lagrange', texto: 'Interpolación de Lagrange con los cuatro puntos', veredicto: 'inadecuado', razon: 'Pasa por todos los puntos, ruido incluido, y al extrapolar un polinomio de grado 3 se aleja: predice 7.5 ms, menos que la última medición, aunque la carga sube.', preset: presetDatos('lagrange', [1, 2, 3, 4], [2.1, 3.9, 6.2, 7.8], 5) },
        { id: 'regresion', texto: 'Regresión lineal por mínimos cuadrados', veredicto: 'adecuado', razon: 'Resume la tendencia sin reproducir el ruido: y = 0.15 + 1.94x predice 9.85 ms en x = 5 (hay aviso de extrapolación, pero es coherente con los datos).', preset: presetDatos('regresion', [1, 2, 3, 4], [2.1, 3.9, 6.2, 7.8], 5) },
      ],
    },
    solucion: (
      <>
        <p><strong>Análisis.</strong> Los datos tienen ruido y se busca una tendencia para <em>predecir</em>; además <M tex="x=5" /> está fuera de <M tex="[1,4]" /> (extrapolación).</p>
        <p><strong>Plan.</strong> Regresión: <M tex="\bar x=2.5,\;\bar y=5,\;S_{xx}=5,\;S_{xy}=9.7" />, luego <M tex="b_1=1.94,\;b_0=0.15" /> y <M tex="\hat y(5)=9.85" /> ms. Lagrange da 7.5 ms: la cúbica «dobla» después de la última medición, un artefacto de forzar el paso por puntos con ruido.</p>
        <p>Aun así, extrapolar exige prudencia: el portal calcula pero avisa.</p>
      </>
    ),
  },
  {
    id: 'int-d2', nivel: 'Avanzado', titulo: 'Datos exactos de un proceso cuadrático',
    enunciado: (
      <p>
        Un proceso, medido sin error, da <M tex="(0,2),\;(1,1),\;(3,5)" /> (corresponden a <M tex="y=x^2-2x+2" />). Se quiere el valor en <M tex="x=2" />. ¿Cómo lo obtendrías?
      </p>
    ),
    plan: {
      pregunta: '¿qué método elegirás?',
      opciones: [
        { id: 'lagrange', texto: 'Interpolación de Lagrange', veredicto: 'adecuado', razon: 'Los datos son exactos y la consulta está dentro del intervalo: el polinomio de grado 2 recupera la parábola y da exactamente 2.', preset: presetDatos('lagrange', [0, 1, 3], [2, 1, 5], 2) },
        { id: 'regresion', texto: 'Regresión lineal', veredicto: 'posible', razon: 'Una recta no puede reproducir una parábola: predice 3.43 en lugar de 2 (error de 1.43) porque ignora la curvatura.', preset: presetDatos('regresion', [0, 1, 3], [2, 1, 5], 2) },
      ],
    },
    solucion: (
      <>
        <p>Con datos exactos y consulta dentro del rango, la interpolación es la herramienta natural: tres nodos determinan un polinomio de grado 2 que, aquí, coincide con el proceso real, así que <M tex="P(2)=2" /> (= 4 − 4 + 2).</p>
        <p>La recta de mínimos cuadrados es <M tex="y\approx1.143+1.143x" /> y da 3.43: el modelo lineal es inadecuado para esta curvatura. El residuo no es ruido sino <em>error de modelo</em>.</p>
      </>
    ),
  },
  {
    id: 'int-d3', nivel: 'Avanzado', titulo: 'Réplicas: una abscisa repetida',
    enunciado: (
      <p>
        Se midió dos veces con carga <M tex="x=1" />: <M tex="(1,2),\,(1,2.4)" />, y además <M tex="(2,3),\,(3,5)" />. Se quiere el valor en <M tex="x=2.5" />. Un compañero propone «quitar uno de los dos puntos repetidos». ¿Qué plan seguirías?
      </p>
    ),
    plan: {
      pregunta: '¿cómo tratarías las réplicas?',
      opciones: [
        { id: 'lagrange', texto: 'Interpolar con Lagrange tal como están', veredicto: 'inadecuado', razon: 'Una abscisa repetida con valores distintos no define una función: Lagrange rechaza la entrada.', preset: presetDatos('lagrange', [1, 1, 2, 3], [2, 2.4, 3, 5], 2.5) },
        { id: 'quitar', texto: 'Quitar un punto al azar y luego interpolar', veredicto: 'inadecuado', razon: 'Descartar un dato sin criterio altera la información en silencio; el portal no lo hace.' },
        { id: 'regresion', texto: 'Ajustar una recta a todos los puntos', veredicto: 'adecuado', razon: 'La regresión admite réplicas: usa los cuatro datos y estima la tendencia (≈ 4.11 en x = 2.5).', preset: presetDatos('regresion', [1, 1, 2, 3], [2, 2.4, 3, 5], 2.5) },
      ],
    },
    solucion: (
      <>
        <p>Las réplicas son legítimas en una regresión (varias mediciones con el mismo <M tex="x" />) pero no en una interpolación. Lagrange <strong>no elimina nodos en silencio</strong>: rechaza la entrada y explica el motivo.</p>
        <p>Si se quisiera interpolar, la decisión de promediar las réplicas (2.2 en <M tex="x=1" />) debe ser del usuario y quedar documentada. La regresión usa todos los datos: <M tex="\hat y(2.5)\approx4.11" />.</p>
      </>
    ),
  },
]

export const PREGUNTAS_DECISION_INTERP: Pregunta[] = [
  {
    id: 'm3-q1', tipo: 'opcion', enunciado: 'Los datos vienen de mediciones con ruido y se busca la tendencia general. ¿Qué modelo conviene?',
    opciones: ['Interpolación de Lagrange con todos los puntos', 'Regresión lineal por mínimos cuadrados', 'Ninguno: no se puede estimar nada', 'Lagrange del mayor grado posible'], correcta: 1,
    explicacion: 'La regresión resume la tendencia sin obligar a la curva a reproducir el ruido; Lagrange pasa por cada punto, error de medición incluido.',
    porOpcion: ['Reproduce el ruido: pasa por todos los puntos medidos, errores incluidos.', 'Correcto: estima la tendencia sin forzar la curva a pasar por cada dato.', 'Sí se puede: la regresión justamente estima la tendencia.', 'Un grado alto oscila más y reproduce más ruido, no menos.'],
    profundiza: 'Interpolar responde «¿qué valor toma la curva que pasa por estos datos?» y ajustar responde «¿cuál es la tendencia que explica estos datos?». Con datos exactos tiene sentido interpolar; con mediciones, ajustar.',
  },
  {
    id: 'int-q2', tipo: 'vf', enunciado: 'Con datos ruidosos, que la curva pase por todos los puntos garantiza la mejor predicción.', correcta: false,
    explicacion: 'Pasar por todos los puntos significa reproducir también su ruido; la mejor predicción suele venir de una curva más simple.',
    profundiza: 'Es el problema del sobreajuste: un modelo muy flexible explica perfectamente los datos que ya se tienen y predice mal los nuevos. En el ejercicio 1 la cúbica predice 7.5 ms y la recta 9.85 ms para una carga mayor.',
  },
  {
    id: 'int-q3', tipo: 'opcion', enunciado: 'Si el valor consultado está fuera del intervalo de los datos, el portal…',
    opciones: ['se niega a calcular', 'calcula y avisa de que es una extrapolación', 'calcula sin avisar', 'usa el nodo más cercano'], correcta: 1,
    explicacion: 'Calcula, pero avisa: nada en los datos respalda ese valor.',
    porOpcion: ['Extrapolar no es un error de entrada: puede ser útil, siempre con cuidado.', 'Correcto: el aviso protege de confiar en un valor sin respaldo.', 'Sin aviso el usuario podría tomarlo por una interpolación fiable.', 'Cambiar el valor consultado alteraría el problema sin decirlo.'],
    profundiza: 'Los polinomios de interpolación se alejan rápidamente fuera de los nodos (el de grado 3 del ejercicio 1 predice una latencia decreciente), y la recta supone que la tendencia continúa. En ambos casos conviene justificar la extrapolación.',
  },
  {
    id: 'int-q4', tipo: 'numerica', enunciado: 'Residuo de la recta y = 0.9 + 0.9x en el punto (2, 2): yᵢ − ŷᵢ.', correcta: -0.7, tolerancia: 0.000001,
    explicacion: 'ŷ(2) = 0.9 + 1.8 = 2.7, luego el residuo es 2 − 2.7 = −0.7.',
    profundiza: 'El signo importa: un residuo negativo indica que la recta está por encima del dato. Los residuos de toda la recta ajustada suman 0 y la suma de sus cuadrados (0.70 en los datos de la guía) es lo que se minimiza.',
  },
]

/* ---------- Interpolación de Lagrange ---------- */
export const EJERCICIOS_LAGRANGE: Ejercicio[] = [
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
    id: 'm3-e3', nivel: 'Avanzado', titulo: 'Más nodos no siempre es mejor (Runge)',
    enunciado: <p>Se toman 6 nodos equiespaciados de <M tex="f(x)=\dfrac1{1+25x^2}" /> en <M tex="x=-1,-0.6,-0.2,0.2,0.6,1" /> (con 4 decimales). Interpola en <M tex="x=0.8" /> y compara con <M tex="f(0.8)" />. ¿Qué observas y por qué ocurre?</p>,
    plan: {
      pregunta: 'para estimar f(0.8), ¿qué harías?',
      opciones: [
        { id: 'seis', texto: 'Interpolar con los 6 nodos', veredicto: 'posible', razon: 'Es válido, pero con 6 nodos equiespaciados el polinomio oscila: da −0.048 en x = 0.8 cuando f(0.8) = 0.0588 (error ≈ 0.107, y con signo equivocado).', preset: presetDatos('lagrange', [-1, -0.6, -0.2, 0.2, 0.6, 1], [0.0385, 0.1, 0.5, 0.5, 0.1, 0.0385], 0.8) },
        { id: 'tres', texto: 'Interpolar solo con los 3 nodos más cercanos (0.2, 0.6, 1)', veredicto: 'adecuado', razon: 'Un grado bajo cerca de la consulta oscila menos: da 0.0269 (error ≈ 0.032, tres veces menor, y con el signo correcto).', preset: presetDatos('lagrange', [0.2, 0.6, 1], [0.5, 0.1, 0.0385], 0.8) },
        { id: 'recta', texto: 'Ajustar una recta a los 6 puntos', veredicto: 'inadecuado', razon: 'La función es una campana simétrica, muy lejos de lineal: la recta es horizontal (pendiente 0) y no captura la forma.', preset: presetDatos('regresion', [-1, -0.6, -0.2, 0.2, 0.6, 1], [0.0385, 0.1, 0.5, 0.5, 0.1, 0.0385], 0.8) },
      ],
    },
    verificar: <>Usa el botón «Ejemplo de oscilación (6 nodos)» de la calculadora de Lagrange.</>,
    solucion: <>
      <p><M tex="f(0.8)=1/17\approx0.0588" /> (positivo), pero el polinomio de grado 5 da <M tex="P(0.8)\approx-0.0481" />: un valor negativo, imposible para esta función. En el centro también falla: <M tex="P(0)\approx0.567" /> frente a <M tex="f(0)=1" />.</p>
      <p>Es el <strong>fenómeno de Runge</strong>: con nodos equiespaciados, un polinomio de grado alto pasa por todos los datos pero oscila entre ellos, sobre todo cerca de los extremos. Pasar por los puntos no garantiza acercarse a la función; para funciones suaves y con ruido conviene un grado bajo o una regresión.</p>
      <p>Con solo los tres nodos cercanos el resultado mejora (0.0269), aunque sigue sin ser exacto.</p>
    </>,
  },
]

export const PREGUNTAS_LAGRANGE: Pregunta[] = [
  {
    id: 'm3-q2', tipo: 'vf', enunciado: 'Aumentar el grado del polinomio interpolante siempre reduce el error entre los nodos.', correcta: false,
    explicacion: 'Falso: con nodos equiespaciados puede aumentar y aparecen oscilaciones (fenómeno de Runge).',
    profundiza: 'Con 6 nodos equiespaciados de 1/(1+25x²) el polinomio da −0.048 en x = 0.8 cuando la función vale 0.0588 (ejercicio 2). Elegir los nodos de Chebyshev, o interpolar por tramos, evita esa oscilación.',
  },
  {
    id: 'm3-q3', tipo: 'numerica', enunciado: 'Para los nodos x = 0, 1, 2, 3, calcula la base de Lagrange L₁(1.5).', correcta: 0.5625, tolerancia: 0.0001,
    explicacion: 'L₁(1.5) = (1.5−0)(1.5−2)(1.5−3) / ((1−0)(1−2)(1−3)) = 1.125 / 2 = 0.5625.',
    profundiza: 'Las cuatro bases en 1.5 son −0.0625, 0.5625, 0.5625 y −0.0625, y suman 1. Que haya pesos negativos muestra que el valor interpolado no es un promedio ponderado de los y: puede salirse del rango de los datos cercanos.',
  },
  {
    id: 'm3-q4', tipo: 'opcion', enunciado: 'Dos nodos tienen la misma abscisa pero distinto valor de y. ¿Qué debe hacer la interpolación de Lagrange?',
    opciones: ['Eliminar uno de los dos en silencio', 'Promediar los valores de y automáticamente', 'Rechazar la entrada e informar el motivo', 'Usar solo el primero'], correcta: 2,
    explicacion: 'Una función no puede tomar dos valores en el mismo x y las bases se indeterminan (división entre 0); no se modifican los datos sin avisar.',
    porOpcion: ['Eliminar un nodo en silencio altera los datos sin que el usuario lo sepa.', 'Promediar es una decisión de modelado que debe tomar el usuario, no el programa.', 'Correcto: se informa del motivo y no se modifica nada.', 'Usar solo el primero también descarta información sin avisar.'],
    profundiza: 'Las abscisas repetidas son legítimas en una regresión (réplicas de la medición) pero no en una interpolación: en ella el sistema de Vandermonde es singular y las bases de Lagrange dividen entre cero.',
  },
]

/* ---------- Ajuste por regresión ---------- */
export const EJERCICIOS_REGRESION: Ejercicio[] = [
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
    id: 'm3-e4', nivel: 'Avanzado', titulo: 'Propiedades de los residuos',
    enunciado: <p>Demuestra que en la recta de mínimos cuadrados <M tex="\sum_i r_i=0" /> y que la recta pasa por <M tex="(\bar x,\bar y)" />. Verifícalo con los datos de la guía <M tex="(0,1),(1,2),(2,2),(3,4)" />.</p>,
    solucion: <>
      <p>Se minimiza <M tex="S(b_0,b_1)=\sum(y_i-b_0-b_1x_i)^2" />. La condición <M tex="\partial S/\partial b_0=-2\sum(y_i-b_0-b_1x_i)=0" /> dice exactamente <M tex="\sum r_i=0" />.</p>
      <p>De ahí <M tex="n\bar y-nb_0-nb_1\bar x=0" />, o sea <M tex="b_0=\bar y-b_1\bar x" />: al evaluar en <M tex="\bar x" /> se obtiene <M tex="\bar y" />, así que la recta pasa por el centro de masa de los datos.</p>
      <p>Con los datos de la guía: <M tex="\bar x=1.5,\;\bar y=2.25" />, la recta es <M tex="y=0.9+0.9x" /> y <M tex="0.9+0.9\cdot1.5=2.25" /> ✔. Residuos <M tex="0.1,\,0.2,\,-0.7,\,0.4" />, con suma 0 y SSE = 0.70.</p>
    </>,
  },
]

export const PREGUNTAS_REGRESION: Pregunta[] = [
  {
    id: 'm3-q5', tipo: 'numerica', enunciado: 'Con la recta y = 0.9 + 0.9x, ¿cuánto predice en x = 3.5?', correcta: 4.05, tolerancia: 0.000001,
    explicacion: '0.9 + 0.9 · 3.5 = 4.05. Como 3.5 está fuera de [0, 3], es una extrapolación y el portal lo advierte.',
    profundiza: 'Fuera del intervalo de los datos el modelo no tiene respaldo: la recta sigue creciendo aunque la latencia real pueda saturarse. El portal calcula pero avisa; la decisión de confiar en ese valor es de quien lo usa.',
  },
  {
    id: 'm3-q6', tipo: 'vf', enunciado: 'La recta de mínimos cuadrados siempre pasa por el punto (x̄, ȳ).', correcta: true,
    explicacion: 'Verdadero: la condición para b₀ implica b₀ = ȳ − b₁·x̄.',
    profundiza: 'Sale de ∂S/∂b₀ = 0, la misma condición que da Σrᵢ = 0 (ejercicio 2). Sirve para comprobar a mano una recta ajustada: ȳ debe coincidir con b₀ + b₁·x̄.',
  },
  {
    id: 'reg-q3', tipo: 'numerica', enunciado: 'Coeficiente de determinación R² = 1 − SSE/SST para los datos de la guía (SSE = 0.70, SST = 4.75). Indica el valor con tres decimales.', correcta: 0.853, tolerancia: 0.001,
    explicacion: 'R² = 1 − 0.70/4.75 ≈ 0.8526.',
    profundiza: 'R² mide qué fracción de la variación de y explica la recta: 1 sería un ajuste perfecto y 0 que no mejora a la media. Un R² alto no prueba que la relación sea lineal; hay que mirar también los residuos.',
  },
]
