import Matematica from '../../components/Matematica'
import type { Ejercicio } from '../../components/Ejercicios'
import type { Pregunta } from '../../core/autoevaluacion'
import { presetEdo } from './paginas'

const M = Matematica

/* ---------- Planteo y decisión ---------- */
export const EJERCICIOS_DECISION_EDO: Ejercicio[] = [
  {
    id: 'ed-d1', nivel: 'Intermedio', titulo: 'Una precisión de 0.01 °C',
    enunciado: (
      <p>
        Se simula el enfriamiento <M tex="T'=-0.5(T-20)" />, <M tex="T(0)=80" /> °C, hasta <M tex="t=2" /> min y se necesita que la temperatura calculada difiera de la exacta en <strong>menos de 0.01 °C</strong> en todos los nodos. Decide qué método y qué paso usarás.
      </p>
    ),
    plan: {
      pregunta: '¿qué método y paso eliges?',
      opciones: [
        { id: 'e05', texto: 'Euler con h = 0.5', veredicto: 'inadecuado', razon: 'El error máximo es ≈ 3.09 °C: más de 300 veces el permitido.', preset: presetEdo('euler', { h: '0.5' }) },
        { id: 'e001', texto: 'Euler con h = 0.01', veredicto: 'inadecuado', razon: 'Exige 200 pasos y aun así el error máximo es ≈ 0.055 °C: Euler solo mejora proporcionalmente a h (necesitaría h ≈ 0.0018, unos 1100 pasos).', preset: presetEdo('euler', { h: '0.01' }) },
        { id: 'rk05', texto: 'RK4 con h = 0.5', veredicto: 'adecuado', razon: 'Con solo 4 pasos (16 evaluaciones de f) el error máximo es ≈ 0.00089 °C: cumple de sobra.', preset: presetEdo('rk4', { h: '0.5' }) },
      ],
    },
    pista: <>Euler reduce el error a la mitad al partir <M tex="h" /> por la mitad; RK4, unas 16 veces. ¿Cuál de los dos llega a 0.01 con menos esfuerzo?</>,
    solucion: (
      <>
        <p><strong>Análisis.</strong> Se pide una precisión alta con una ecuación sencilla y paso libre: es el caso típico de RK4.</p>
        <p><strong>Plan.</strong> RK4 con <M tex="h=0.5" />: error máximo <M tex="\approx8.9\times10^{-4}" /> °C con 16 evaluaciones. Para igualarlo, Euler tendría que usar <M tex="h\approx1.6\times10^{-4}" /> (más de 12 000 pasos).</p>
        <p><strong>Verificación.</strong> En la calculadora, la columna «error» de la tabla de nodos muestra que ningún nodo supera 0.01.</p>
      </>
    ),
  },
  {
    id: 'ed-d2', nivel: 'Avanzado', titulo: 'Un paso grande y 20 minutos',
    enunciado: (
      <p>
        Se quiere simular <strong>20 minutos</strong> del mismo enfriamiento usando <M tex="h=5" /> min «para ir rápido». ¿Qué plan seguirías? Recuerda separar lo que <em>calcula</em> el método de lo que <em>ocurre</em> físicamente.
      </p>
    ),
    plan: {
      pregunta: '¿cómo lo harías?',
      opciones: [
        { id: 'euler5', texto: 'Euler con h = 5', veredicto: 'inadecuado', razon: 'El factor por paso es 1 − 0.5·5 = −1.5: |factor| > 1, las oscilaciones crecen (80, −70, 155, −182.5, …). Es inestable y físicamente imposible.', preset: presetEdo('euler', { tf: '20', h: '5' }) },
        { id: 'rk5', texto: 'RK4 con h = 5', veredicto: 'posible', razon: 'RK4 es estable aquí (|factor| ≈ 0.65 < 1) y no oscila, pero el error llega a ≈ 34 °C: estable no significa preciso.', preset: presetEdo('rk4', { tf: '20', h: '5' }) },
        { id: 'euler05', texto: 'Euler con h = 0.5', veredicto: 'adecuado', razon: 'El factor 0.75 es estable y monótono; 40 pasos baratos y el error máximo ≈ 3.1 °C (al inicio).', preset: presetEdo('euler', { tf: '20', h: '0.5' }) },
        { id: 'rk1', texto: 'RK4 con h = 1', veredicto: 'adecuado', razon: 'Solo 20 pasos y error máximo ≈ 0.017 °C: lo mejor en precisión por esfuerzo.', preset: presetEdo('rk4', { tf: '20', h: '1' }) },
      ],
    },
    pista: <>Calcula el factor por paso de Euler, <M tex="1-kh" />, y comprueba si su valor absoluto es menor que 1. Luego mira el gráfico: ¿la temperatura puede ser negativa si el ambiente es 20 °C?</>,
    solucion: (
      <>
        <p><strong>Euler con h = 5.</strong> <M tex="T_{n+1}-20=(1-0.5\cdot5)(T_n-20)=-1.5\,(T_n-20)" />: la distancia a la ambiente se multiplica por −1.5 en cada paso, así que la trayectoria <em>calculada</em> es 80, −70, 155, −182.5, 323.75… <strong>No es una trayectoria física</strong>: un servidor no baja de la temperatura ambiente ni oscila cada vez más.</p>
        <p><strong>RK4 con h = 5</strong> es estable (factor ≈ 0.648) pero muy inexacto en los primeros pasos (58.9 °C frente a 24.9 °C reales en t = 5). El paso grande no se arregla cambiando de método: se reduce <M tex="h" />.</p>
        <p><strong>Plan:</strong> Euler con <M tex="h\le1" /> o RK4 con <M tex="h=1" />; verificar siempre la condición de estabilidad <M tex="0<h<2/k=4" /> antes de interpretar resultados.</p>
      </>
    ),
  },
  {
    id: 'ed-d3', nivel: 'Avanzado', titulo: 'Un paso que no divide el intervalo',
    enunciado: (
      <p>
        Quieres la temperatura en <M tex="t=2" /> min con paso <M tex="h=0.3" /> min. Como <M tex="2/0.3=6.67" /> no es entero, ¿cómo lo resolverías?
      </p>
    ),
    plan: {
      pregunta: '¿qué harías?',
      opciones: [
        { id: 'siete', texto: 'Dar 7 pasos de 0.3 y quedarse con el resultado', veredicto: 'inadecuado', razon: '7 pasos de 0.3 llegan a t = 2.1 min, no a 2: la respuesta corresponde a otro instante.' },
        { id: 'corto', texto: 'Dar 6 pasos de 0.3 y un último paso más corto de 0.2', veredicto: 'adecuado', razon: 'Llega exactamente a t = 2 min y el portal registra y marca el último paso corto.', preset: presetEdo('euler', { h: '0.3' }) },
        { id: 'recortar', texto: 'Cambiar el horizonte a 1.8 min', veredicto: 'inadecuado', razon: 'Resuelve otro problema: ya no se responde la pregunta pedida.' },
        { id: 'divide', texto: 'Elegir un h que sí divide (0.25)', veredicto: 'adecuado', razon: 'Si puedes elegir el paso, un h que divide el intervalo evita el paso corto y además es más preciso.', preset: presetEdo('euler', { h: '0.25' }) },
      ],
    },
    solucion: (
      <>
        <p>La malla es <M tex="0,\,0.3,\,0.6,\,0.9,\,1.2,\,1.5,\,1.8" /> y el último nodo <M tex="2.0" />: ocho nodos y siete pasos, el último de <M tex="2-1.8=0.2" /> min. En ese paso se usa <M tex="h=0.2" /> en la fórmula (no 0.3), y el portal lo marca como «último paso más corto».</p>
        <p>Si no se hiciera así, el error y la comparación con la solución exacta se evaluarían en un instante equivocado.</p>
      </>
    ),
  },
]

export const PREGUNTAS_DECISION_EDO: Pregunta[] = [
  {
    id: 'ed-q1', tipo: 'opcion', enunciado: 'Con el mismo paso h = 0.5 min en el enfriamiento, ¿qué método da el menor error?',
    opciones: ['Euler explícito', 'Runge-Kutta 4', 'Ambos igual', 'Depende solo de la temperatura inicial'], correcta: 1,
    explicacion: 'RK4 (≈ 0.0009 °C) es unas 3500 veces más preciso que Euler (≈ 3.09 °C) con el mismo paso.',
    porOpcion: ['Euler usa una sola pendiente por paso y su error es proporcional a h.', 'Correcto: su error es proporcional a h⁴.', 'Los errores son de órdenes muy distintos.', 'La temperatura inicial no cambia el orden de los métodos.'],
    profundiza: 'La ventaja cuesta 4 evaluaciones de la derivada por paso en vez de 1; aun así RK4 suele ser más barato para una misma precisión porque admite pasos mucho mayores.',
  },
  {
    id: 'ed-q2', tipo: 'vf', enunciado: 'Si un método es estable con cierto paso h, la trayectoria que calcula es siempre físicamente válida.', correcta: false,
    explicacion: 'Euler con h = 3 (k = 0.5) es estable pero oscila alrededor de la temperatura ambiente, algo que un enfriamiento real nunca hace.',
    profundiza: 'La estabilidad solo dice que los errores no crecen. Para que la trayectoria sea físicamente válida (aquí: monótona y sin cruzar la ambiente) hace falta además k·h < 1 en Euler.',
  },
  {
    id: 'ed-q3', tipo: 'opcion', enunciado: 'Si el paso h no divide el intervalo [0, t_f], el portal…',
    opciones: ['rechaza la entrada', 'usa un último paso más corto hasta llegar a t_f y lo registra', 'avanza hasta pasarse de t_f', 'cambia t_f al múltiplo de h más cercano'], correcta: 1,
    explicacion: 'El último paso se acorta para terminar exactamente en t_f y se marca en la tabla.',
    porOpcion: ['No es un error de entrada: es un caso normal.', 'Correcto.', 'Pasarse de t_f respondería a otro instante.', 'Cambiar t_f alteraría el problema sin avisar.'],
    profundiza: 'El error también se mide en el último nodo, con el paso corto, por eso conviene que la tabla indique cuál fue el h realmente usado en cada fila.',
  },
  {
    id: 'ed-q4', tipo: 'numerica', enunciado: 'Euler con h = 0.5 para T′ = −0.5(T − 20), T(0) = 80: calcula T(0.5) en °C.', correcta: 65, tolerancia: 0.000001,
    explicacion: 'Pendiente −0.5·(80 − 20) = −30 °C/min; ΔT = 0.5·(−30) = −15; T = 80 − 15 = 65 °C.',
    profundiza: 'El valor exacto es 66.728 °C: Euler subestima la temperatura porque usa la pendiente del inicio (la más pronunciada) durante todo el paso.',
  },
]

/* ---------- Euler explícito ---------- */
export const EJERCICIOS_EULER: Ejercicio[] = [
  {
    id: 'eu-e1', nivel: 'Intermedio', titulo: 'Dos pasos de Euler a mano',
    enunciado: <p>Para <M tex="T'=-0.5(T-20)" />, <M tex="T(0)=80" />, calcula con <M tex="h=0.5" /> las temperaturas en <M tex="t=0.5" /> y <M tex="t=1" />, y sus errores frente a <M tex="T(t)=20+60e^{-0.5t}" />.</p>,
    pista: <>Cada paso: <M tex="T_{n+1}=T_n+h\cdot f(T_n)" /> con <M tex="f(T)=-0.5(T-20)" />.</>,
    verificar: <>Compruébalo en la calculadora de Euler (caso base): las filas 1 y 2 de la tabla.</>,
    solucion: (
      <>
        <p><M tex="f(80)=-30" />, <M tex="T_1=80+0.5\cdot(-30)=65" />. Error: <M tex="|65-66.7280|=1.7280" />.</p>
        <p><M tex="f(65)=-0.5\cdot45=-22.5" />, <M tex="T_2=65+0.5\cdot(-22.5)=53.75" />. Exacta: <M tex="20+60e^{-0.5}=56.3918" />; error <M tex="2.6418" />.</p>
        <p>Observa que el error crece de un paso a otro: se <em>acumula</em>. Cada paso hereda el error anterior y añade el suyo.</p>
      </>
    ),
  },
  {
    id: 'eu-e2', nivel: 'Avanzado', titulo: 'Predecir el error al cambiar el paso',
    enunciado: <p>Con <M tex="h=0.5" /> el error máximo de Euler hasta <M tex="t=2" /> es ≈ 3.088 °C y con <M tex="h=0.25" /> es ≈ 1.456 °C. Predice el error con <M tex="h=0.125" /> y el paso aproximado necesario para bajar de 0.01 °C. ¿Qué dice esto del orden del método?</p>,
    pista: <>Calcula el cociente 3.088/1.456 y úsalo para el siguiente. Si el error es proporcional a <M tex="h" />, ¿cuánto vale la constante <M tex="C" /> en <M tex="E\approx C\,h" />?</>,
    verificar: <>Prueba h = 0.125 y h = 0.0018 en la calculadora de Euler.</>,
    solucion: (
      <>
        <p>El cociente es <M tex="3.088/1.456\approx2.1" />: al partir <M tex="h" /> por la mitad, el error se divide aproximadamente entre 2. Eso es <strong>orden 1</strong>: <M tex="E\approx C\,h" />.</p>
        <p>Con <M tex="C\approx3.088/0.5\approx6.2" />, para <M tex="h=0.125" /> se predice ≈ 0.77 (el valor real es 0.708). Para <M tex="E<0.01" /> hace falta <M tex="h\approx0.01/5.5\approx0.0018" />, unos 1100 pasos para llegar a 2 minutos.</p>
        <p>Moraleja: Euler mejora «despacio»: para ganar un dígito decimal hay que multiplicar por 10 el número de pasos.</p>
      </>
    ),
  },
]

export const PREGUNTAS_EULER: Pregunta[] = [
  {
    id: 'eu-q1', tipo: 'numerica', enunciado: 'Incremento ΔT (en °C) del primer paso de Euler con h = 0.5 para T′ = −0.5(T − 20), T(0) = 80.', correcta: -15, tolerancia: 0.000001,
    explicacion: 'ΔT = h · f(T₀) = 0.5 · (−30) = −15 °C.',
    profundiza: 'El signo negativo indica que la temperatura baja. Comprueba la unidad: (°C/min)·min = °C.',
  },
  {
    id: 'eu-q2', tipo: 'opcion', enunciado: 'Euler explícito calcula el siguiente valor usando la pendiente evaluada…',
    opciones: ['en el punto final del paso', 'en el punto medio del paso', 'al inicio del paso', 'como promedio de cuatro pendientes'], correcta: 2,
    explicacion: 'Solo usa f(tₙ, Tₙ): la pendiente del punto donde ya está, y avanza en línea recta.',
    porOpcion: ['Usar la pendiente final sería el método de Euler implícito, que no se estudia aquí.', 'El punto medio es la idea del método del punto medio y de RK4.', 'Correcto.', 'Eso es Runge-Kutta 4.'],
    profundiza: 'Por eso es «explícito»: el nuevo valor se obtiene directamente del anterior, sin resolver ninguna ecuación. A cambio, en una curva que se curva hacia arriba o hacia abajo siempre se queda corto o largo.',
  },
  {
    id: 'eu-q3', tipo: 'vf', enunciado: 'Si reduces el paso de Euler a la mitad, el error global se reduce aproximadamente a la mitad.', correcta: true,
    explicacion: 'Euler es de orden 1: el error global es proporcional a h.',
    profundiza: 'El error de un solo paso (local) es proporcional a h², pero al dar 1/h pasos se acumula y queda proporcional a h. Se comprueba en la tabla: 3.09 → 1.46 → 0.71 para h = 0.5, 0.25, 0.125.',
  },
]

/* ---------- Runge-Kutta 4 ---------- */
export const EJERCICIOS_RK4: Ejercicio[] = [
  {
    id: 'rk-e1', nivel: 'Intermedio', titulo: 'El primer paso de RK4 a mano',
    enunciado: <p>Para <M tex="T'=-0.5(T-20)" />, <M tex="T(0)=80" /> y <M tex="h=0.5" />, calcula <M tex="k_1,k_2,k_3,k_4" /> y <M tex="T_1" />. Compara con la solución exacta <M tex="T(0.5)=66.7280" />.</p>,
    pista: <><M tex="k_1=f(T_0)" />; <M tex="k_2=f(T_0+\tfrac h2k_1)" />; <M tex="k_3=f(T_0+\tfrac h2k_2)" />; <M tex="k_4=f(T_0+h\,k_3)" />; <M tex="T_1=T_0+\tfrac h6(k_1+2k_2+2k_3+k_4)" />.</>,
    verificar: <>La calculadora de RK4 muestra la tabla «Las cuatro pendientes del primer paso».</>,
    solucion: (
      <>
        <p><M tex="k_1=-0.5(80-20)=-30" />.</p>
        <p><M tex="k_2=f(80+0.25\cdot(-30))=f(72.5)=-26.25" />.</p>
        <p><M tex="k_3=f(80+0.25\cdot(-26.25))=f(73.4375)=-26.71875" />.</p>
        <p><M tex="k_4=f(80+0.5\cdot(-26.71875))=f(66.640625)=-23.3203125" />.</p>
        <p><M tex="T_1=80+\frac{0.5}{6}\bigl(-30+2(-26.25)+2(-26.71875)-23.3203125\bigr)=66.728515625" />. Error: <M tex="4.7\times10^{-4}" /> °C, frente a 1.73 °C de Euler con el mismo paso.</p>
      </>
    ),
  },
  {
    id: 'rk-e2', nivel: 'Avanzado', titulo: '¿Cuánto cuesta igualar a RK4 con Euler?',
    enunciado: <p>RK4 con <M tex="h=0.5" /> hasta <M tex="t=2" /> da un error máximo ≈ <M tex="8.9\times10^{-4}" /> °C con 16 evaluaciones de <M tex="f" />. Estima el paso y el número de pasos que necesitaría Euler para igualar ese error (usa <M tex="E_{Euler}\approx5.5\,h" />). ¿Qué concluyes sobre el coste?</p>,
    pista: <>Iguala <M tex="5.5\,h=8.9\times10^{-4}" /> y despeja <M tex="h" />; el número de pasos es <M tex="2/h" />.</>,
    solucion: (
      <>
        <p><M tex="h\approx8.9\times10^{-4}/5.5\approx1.6\times10^{-4}" /> min, es decir <M tex="2/1.6\times10^{-4}\approx12\,500" /> pasos y otras tantas evaluaciones de <M tex="f" />.</p>
        <p>RK4 usa 16: <strong>unas 800 veces menos</strong>. Aunque cada paso de RK4 cuesta 4 evaluaciones, su orden 4 lo compensa de sobra. (El portal limita a 10 000 pasos, así que Euler ni siquiera podría alcanzarlo.)</p>
      </>
    ),
  },
]

export const PREGUNTAS_RK4: Pregunta[] = [
  {
    id: 'rk-q1', tipo: 'numerica', enunciado: 'En el primer paso de RK4 con h = 0.5 (T′ = −0.5(T − 20), T(0) = 80), ¿cuánto vale k₄ en °C/min?', correcta: -23.3203125, tolerancia: 0.0001,
    explicacion: 'k₃ = −26.71875 → T = 80 + 0.5·(−26.71875) = 66.640625 → k₄ = −0.5·(66.640625 − 20) = −23.3203125.',
    profundiza: 'k₄ es la pendiente al final del paso, usando la estimación k₃ para saber dónde está T. Por eso es la menos pronunciada: la temperatura ya se acercó a la ambiente.',
  },
  {
    id: 'rk-q2', tipo: 'opcion', enunciado: '¿Cuántas evaluaciones de f(t, T) hace RK4 en cada paso?',
    opciones: ['1', '2', '4', '16'], correcta: 2,
    explicacion: 'Las cuatro pendientes k₁, k₂, k₃ y k₄.',
    porOpcion: ['Una evaluación por paso es Euler.', 'Dos serían el método del punto medio o de Heun.', 'Correcto.', '16 es el factor en que baja el error al partir h por la mitad, no el número de evaluaciones.'],
    profundiza: 'El coste de RK4 es 4 veces el de Euler por paso, pero como admite pasos mucho mayores, suele costar menos en total para una misma precisión.',
  },
  {
    id: 'rk-q3', tipo: 'vf', enunciado: 'Al reducir el paso de RK4 a la mitad, el error máximo se divide aproximadamente entre 16.', correcta: true,
    explicacion: 'RK4 es de orden 4: el error global es proporcional a h⁴ y 2⁴ = 16.',
    profundiza: 'En el enfriamiento: 8.9·10⁻⁴ → 5.0·10⁻⁵ → 3.0·10⁻⁶ para h = 0.5, 0.25, 0.125 (cocientes 17.8 y 16.9, cerca de 16).',
  },
]

/* ---------- Estabilidad ---------- */
export const EJERCICIOS_ESTABILIDAD: Ejercicio[] = [
  {
    id: 'es-e1', nivel: 'Intermedio', titulo: 'Límites de estabilidad para dos valores de k',
    enunciado: <p>Calcula para <M tex="k=0.5" /> y para <M tex="k=2" /> el paso máximo para el que Euler es estable y el factor por paso con <M tex="h=1" />. ¿Qué pasa con el paso permitido cuando el sistema enfría más rápido?</p>,
    pista: <>Euler es estable si <M tex="|1-kh|<1" />, es decir <M tex="0<kh<2" />.</>,
    verificar: <>Usa el «Explorador de estabilidad» con k = 0.5 y k = 2.</>,
    solucion: (
      <>
        <p>Para <M tex="k=0.5" />: <M tex="h<2/k=4" /> min; con <M tex="h=1" /> el factor es <M tex="1-0.5=0.5" /> (estable, monótono).</p>
        <p>Para <M tex="k=2" />: <M tex="h<1" /> min; con <M tex="h=1" /> el factor es <M tex="1-2=-1" /> (marginal: oscila sin decaer).</p>
        <p>Cuanto más rápido es el fenómeno (<M tex="k" /> grande), <strong>más pequeño debe ser el paso</strong>: el paso tiene que ser corto frente a la escala de tiempo <M tex="1/k" /> del sistema.</p>
      </>
    ),
  },
  {
    id: 'es-e2', nivel: 'Avanzado', titulo: 'Estable, pero ¿correcto?',
    enunciado: <p>Con Euler, <M tex="k=0.5" /> y <M tex="h=3" /> la temperatura calculada es 80, −10, 35, 12.5, 23.75… Un compañero dice «como h = 3 &lt; 4 es estable, el resultado es bueno». ¿Estás de acuerdo?</p>,
    plan: {
      pregunta: '¿qué concluyes?',
      opciones: [
        { id: 'bueno', texto: 'Es estable, así que la trayectoria es correcta', veredicto: 'inadecuado', razon: 'Estable solo significa que el error no crece. La trayectoria cruza la temperatura ambiente (−10 °C primero) y oscila, algo físicamente imposible.', preset: presetEdo('euler', { tf: '12', h: '3' }) },
        { id: 'oscila', texto: 'Converge pero oscila: no es físicamente válida; hay que reducir h', veredicto: 'adecuado', razon: 'Para que sea monótona hace falta k·h < 1, es decir h < 2 min. Con h = 1 o 0.5 la trayectoria es válida.', preset: presetEdo('euler', { tf: '12', h: '1' }) },
        { id: 'rk3', texto: 'Cambiar a RK4 con h = 3', veredicto: 'posible', razon: 'RK4 es estable y monótono aquí (factor ≈ 0.27), pero impreciso: T(3) ≈ 36.4 °C frente a 33.4 °C reales.', preset: presetEdo('rk4', { tf: '12', h: '3' }) },
      ],
    },
    solucion: (
      <>
        <p>El factor de Euler es <M tex="1-0.5\cdot3=-0.5" />: en cada paso la distancia a la ambiente se multiplica por <M tex="-0.5" />. Como <M tex="|-0.5|<1" /> el error decae (<strong>estable</strong>), pero el signo negativo hace que la temperatura <strong>cruce la ambiente</strong>: 80 → −10 → 35 → 12.5 → 23.75…</p>
        <p>Un enfriamiento real nunca baja de la temperatura ambiente. La trayectoria calculada converge a 20 °C, sí, pero por un camino que no es el físico. Para que además sea válida se exige <M tex="0<kh<1" />.</p>
      </>
    ),
  },
]

export const PREGUNTAS_ESTABILIDAD: Pregunta[] = [
  {
    id: 'es-q1', tipo: 'numerica', enunciado: 'Con k = 0.5 1/min, ¿cuál es el límite de h (en minutos) por debajo del cual Euler es estable?', correcta: 4, tolerancia: 0.000001,
    explicacion: '|1 − k·h| < 1 ⇔ 0 < h < 2/k = 4 min.',
    profundiza: 'Con h = 4 exactamente el factor es −1: oscila sin decaer (marginal). Por encima de 4 las oscilaciones crecen.',
  },
  {
    id: 'es-q2', tipo: 'opcion', enunciado: 'Con k = 0.5 y h = 5, el factor por paso de Euler es −1.5. ¿Qué ocurre?',
    opciones: ['Converge monótonamente', 'Converge oscilando', 'Las oscilaciones crecen en cada paso (inestable)', 'Se queda constante'], correcta: 2,
    explicacion: '|−1.5| > 1: la distancia a la ambiente se multiplica por −1.5 en cada paso, creciendo y cambiando de signo.',
    porOpcion: ['Un factor negativo implica cambios de signo, no descenso monótono.', 'Oscilaría y decaería solo si |factor| < 1.', 'Correcto: 80, −70, 155, −182.5…', 'Constante sería factor igual a 1.'],
    profundiza: 'Las cifras que se obtienen son «correctas» como cálculo pero sin sentido físico: por eso la tabla de la calculadora lo señala con un aviso en vez de presentarlo como resultado.',
  },
  {
    id: 'es-q3', tipo: 'vf', enunciado: 'Un método estable siempre produce una trayectoria físicamente válida.', correcta: false,
    explicacion: 'Euler con k = 0.5 y h entre 2 y 4 es estable pero oscila alrededor de la ambiente.',
    profundiza: 'Hay dos preguntas distintas: ¿crece el error? (estabilidad) y ¿se parece la curva calculada a lo que ocurre en la realidad? (validez física/calidad). Responder la primera no responde la segunda.',
  },
]
