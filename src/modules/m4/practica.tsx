import Matematica from '../../components/Matematica'
import type { Ejercicio } from '../../components/Ejercicios'
import type { Pregunta } from '../../core/autoevaluacion'
import { presetIntegral } from './paginas'

const M = Matematica

/* ---------- Planteo y decisión ---------- */
export const EJERCICIOS_DECISION_INTEGRAL: Ejercicio[] = [
  {
    id: 'ig-d1', nivel: 'Intermedio', titulo: 'Elegir la regla para una tasa cuadrática',
    enunciado: (
      <p>
        La tasa de transferencia es <M tex="r(t)=2t^2+t+3" /> MB/s en <M tex="[0,3]" /> s y solo puedes evaluar <M tex="r" /> en 3 puntos (2 subintervalos). Decide cómo estimar el volumen.
      </p>
    ),
    plan: {
      pregunta: '¿qué regla usarás con n = 2?',
      opciones: [
        { id: 'trapecio', texto: 'Trapecio compuesto', veredicto: 'posible', razon: 'Funciona, pero con solo 2 trapecios da 33.75 MB y sobrestima en 2.25 MB: la tasa es convexa y las cuerdas quedan por encima de la curva.', preset: presetIntegral('trapecio', 2, 1, 3, 0, 3, 2) },
        { id: 'simpson', texto: 'Simpson 1/3 compuesto', veredicto: 'adecuado', razon: 'La tasa es un polinomio de grado ≤ 3: Simpson es exacto y da 31.5 MB con los mismos 3 puntos.', preset: presetIntegral('simpson', 2, 1, 3, 0, 3, 2) },
        { id: 'muchos', texto: 'Trapecio con n = 100', veredicto: 'posible', razon: 'Reduce el error, pero exige 101 evaluaciones para acercarse a lo que Simpson logra exactamente con 3.', preset: presetIntegral('trapecio', 2, 1, 3, 0, 3, 100) },
      ],
    },
    solucion: (
      <>
        <p>La integral exacta es <M tex="\int_0^3(2t^2+t+3)\,dt=18+4.5+9=31.5" /> MB.</p>
        <p>Simpson con <M tex="n=2" /> (<M tex="h=1.5" />): <M tex="\frac{1.5}{3}(3+4\cdot9+24)=31.5" /> MB, exacto. El trapecio da <M tex="\frac{1.5}{2}(3+2\cdot9+24)=33.75" /> MB (error 2.25 MB).</p>
        <p><strong>Plan:</strong> Simpson, porque la tasa es suave (de hecho polinómica) y n puede ser par.</p>
      </>
    ),
  },
  {
    id: 'ig-d2', nivel: 'Avanzado', titulo: 'Cinco intervalos de medición',
    enunciado: (
      <p>
        Para <M tex="r(t)=t^2+1" /> en <M tex="[0,2]" /> se tomaron datos en una malla uniforme de <strong>5 subintervalos</strong> (no se puede cambiar). Un compañero propone aplicar Simpson. ¿Qué plan seguirías?
      </p>
    ),
    plan: {
      pregunta: '¿cómo estimarías el volumen?',
      opciones: [
        { id: 'simpson5', texto: 'Simpson con n = 5', veredicto: 'inadecuado', razon: 'Simpson 1/3 exige n par: el portal lo rechaza y sugiere 4 o 6.', preset: presetIntegral('simpson', 1, 0, 1, 0, 2, 5) },
        { id: 'trapecio5', texto: 'Trapecio con n = 5', veredicto: 'adecuado', razon: 'Acepta cualquier n: da 4.72 MB frente a 14/3 ≈ 4.6667 (error 0.0533 MB).', preset: presetIntegral('trapecio', 1, 0, 1, 0, 2, 5) },
        { id: 'simpson4', texto: 'Rediscretizar con n = 4 y usar Simpson', veredicto: 'adecuado', razon: 'Si se pueden volver a evaluar los puntos, Simpson con n = 4 (o 6) es exacto para esta tasa cuadrática.', preset: presetIntegral('simpson', 1, 0, 1, 0, 2, 4) },
      ],
    },
    solucion: (
      <>
        <p>Con <M tex="n=5" /> la regla de Simpson 1/3 no es aplicable porque agrupa subintervalos de dos en dos. El portal lo informa y propone <M tex="n=4" /> o <M tex="n=6" />.</p>
        <p>El trapecio sí puede usarse: <M tex="h=0.4" /> y <M tex="T_5=4.72" /> MB; el error <M tex="\approx0.0533" /> MB coincide con la estimación <M tex="\frac{(b-a)h^2}{12}r''=\frac{2\cdot0.16\cdot2}{12}" />. Si es posible rediscretizar, Simpson con <M tex="n=4" /> da <M tex="14/3" /> exacto.</p>
      </>
    ),
  },
  {
    id: 'ig-d3', nivel: 'Avanzado', titulo: 'Una tasa que se vuelve negativa',
    enunciado: (
      <p>
        La «tasa» <M tex="r(t)=t^2-3t+1" /> MB/s se evalúa en <M tex="[0,3]" /> con <M tex="n=6" />. La integral exacta es <M tex="-1.5" />. Un compañero informa «se transfirieron −1.5 MB». ¿Qué plan seguirías?
      </p>
    ),
    plan: {
      pregunta: '¿cómo interpretarías y presentarías el resultado?',
      opciones: [
        { id: 'volumen', texto: 'Informarlo como volumen transferido: −1.5 MB', veredicto: 'inadecuado', razon: 'Un volumen transferido no puede ser negativo: r < 0 en parte del intervalo y la integral es un acumulado neto, no un volumen físico.', preset: presetIntegral('trapecio', 1, -3, 1, 0, 3, 6) },
        { id: 'neto', texto: 'Informarlo como acumulado neto, con el aviso del portal', veredicto: 'adecuado', razon: 'Es lo que la integral calcula: positivo donde r > 0 y negativo donde r < 0. El portal advierte de la tasa negativa.', preset: presetIntegral('simpson', 1, -3, 1, 0, 3, 6) },
        { id: 'tramos', texto: 'Partir en las raíces de r e integrar |r|', veredicto: 'adecuado', razon: 'Si lo que interesa es el volumen total movido (sin signo), se integra |r| por tramos donde r no cambia de signo.' },
      ],
    },
    solucion: (
      <>
        <p>La tasa cambia de signo en <M tex="t=\frac{3\pm\sqrt5}{2}\approx0.38,\,2.62" />. La integral resta las zonas negativas de las positivas: es un <strong>acumulado neto</strong>. Simpson con <M tex="n=6" /> da <M tex="-1.5" /> exacto (tasa cuadrática); el trapecio da <M tex="-1.375" />.</p>
        <p>Según la pregunta que se quiera responder se presenta el neto (con su interpretación) o se integra <M tex="|r|" /> por tramos. En ningún caso un volumen transferido «negativo» tiene sentido físico: el portal lo advierte.</p>
      </>
    ),
  },
]

export const PREGUNTAS_DECISION_INTEGRAL: Pregunta[] = [
  {
    id: 'ig-q1', tipo: 'opcion', enunciado: 'Los datos vienen en una malla uniforme de 5 subintervalos y no puedes cambiarla. ¿Qué regla puedes aplicar directamente?',
    opciones: ['Simpson 1/3 compuesto', 'Trapecio compuesto', 'Ninguna', 'Simpson con n = 2.5'], correcta: 1,
    explicacion: 'El trapecio acepta cualquier n entero positivo; Simpson 1/3 exige n par.',
    porOpcion: ['Con n = 5 (impar) Simpson 1/3 no es aplicable.', 'Correcto.', 'Sí hay opción: el trapecio.', 'n debe ser un entero positivo.'],
    profundiza: 'Si se puede volver a medir, se rediscretiza con n par. También existe la regla de Simpson 3/8, que cubre tres subintervalos y permite combinarla con la 1/3 cuando n es impar, pero queda fuera de este portal.',
  },
  {
    id: 'ig-q2', tipo: 'vf', enunciado: 'Simpson 1/3 es siempre más preciso que el trapecio con el mismo n.', correcta: false,
    explicacion: 'Su ventaja (error ∝ h⁴) requiere una función suave; con saltos o picos puede no mejorar al trapecio.',
    profundiza: 'El error de Simpson depende de la cuarta derivada y el del trapecio de la segunda. Con una tasa con picos o discontinuidades esas derivadas son grandes o no existen y el orden teórico no se alcanza.',
  },
  {
    id: 'ig-q3', tipo: 'opcion', enunciado: 'Si la tasa r(t) es negativa en parte del intervalo, ∫ r(t) dt representa…',
    opciones: ['un volumen transferido siempre positivo', 'un acumulado neto (las zonas negativas restan)', 'un error', 'la derivada de r'], correcta: 1,
    explicacion: 'La integral suma con signo: las zonas con r < 0 restan, así que deja de ser un volumen físico.',
    porOpcion: ['Con r < 0 la integral puede incluso ser negativa.', 'Correcto: es un acumulado neto.', 'No es un error: es el comportamiento correcto de la integral.', 'La derivada es otra operación.'],
    profundiza: 'Por eso el portal calcula pero avisa. Para el volumen total movido, sin signo, hay que integrar |r|, partiendo el intervalo en las raíces de r.',
  },
  {
    id: 'ig-q4', tipo: 'numerica', enunciado: 'Error absoluto (en MB) del trapecio compuesto con n = 8 para r(t) = t² + 1 en [0, 2]. Indica el valor con 4 decimales.', correcta: 0.0208, tolerancia: 0.00005,
    explicacion: 'El error es 4/(3n²) = 4/192 = 1/48 ≈ 0.0208 MB.',
    profundiza: 'Con n = 2, 4, 8 los errores son 1/3, 1/12 y 1/48: cada duplicación de n divide el error entre 4, la firma de un método de orden 2.',
  },
]

/* ---------- Trapecio compuesto ---------- */
export const EJERCICIOS_TRAPECIO: Ejercicio[] = [
  {
    id: 'm4-e1', nivel: 'Intermedio', titulo: 'Trapecio con n = 4 a mano',
    enunciado: <p>Para <M tex="r(t)=t^2+1" /> MB/s en <M tex="[0,2]" /> s calcula el volumen con trapecio compuesto y <M tex="n=4" />, y su error absoluto frente a la integral exacta. ¿En qué unidades está el resultado?</p>,
    verificar: <>Compruébalo en la calculadora de trapecio (caso base).</>,
    solucion: <>
      <p><M tex="h=0.5" />; tasas <M tex="r(0),\dots,r(2)=1,\,1.25,\,2,\,3.25,\,5" />. Con pesos <M tex="1,2,2,2,1" />:</p>
      <p><M tex="T_4=\frac{0.5}{2}\,(1+2\cdot1.25+2\cdot2+2\cdot3.25+5)=0.25\cdot19=4.75\ \text{MB}" />.</p>
      <p>La integral exacta es <M tex="\int_0^2(t^2+1)\,dt=\frac83+2=\frac{14}{3}\approx4.6667" /> MB, así que el error es <M tex="4.75-4.6667=\frac1{12}\approx0.0833" /> MB. Unidades: (MB/s)·s = MB.</p>
    </>,
  },
  {
    id: 'm4-e4', nivel: 'Avanzado', titulo: '¿Cuántos subintervalos hacen falta?',
    enunciado: <p>Para <M tex="r(t)=t^2+1" /> en <M tex="[0,2]" /> el error del trapecio compuesto es <M tex="\frac{(b-a)h^2}{12}\,r''" />. ¿Cuál es el menor <M tex="n" /> que garantiza un error absoluto menor o igual que <M tex="10^{-4}" /> MB? Verifícalo con la calculadora.</p>,
    plan: {
      pregunta: 'para lograr un error ≤ 10⁻⁴ MB, ¿qué harías?',
      opciones: [
        { id: 'trapecio', texto: 'Trapecio aumentando n hasta cumplirlo', veredicto: 'posible', razon: 'Funciona: hacen falta n = 116 (117 evaluaciones). Es válido pero costoso.', preset: presetIntegral('trapecio', 1, 0, 1, 0, 2, 116) },
        { id: 'simpson', texto: 'Cambiar a Simpson', veredicto: 'adecuado', razon: 'La tasa es cuadrática: Simpson con n = 2 ya es exacto (error de redondeo), con solo 3 evaluaciones.', preset: presetIntegral('simpson', 1, 0, 1, 0, 2, 2) },
      ],
    },
    verificar: <>Prueba n = 115 y n = 116 en la calculadora de trapecio y mira el error absoluto.</>,
    solucion: <>
      <p>Como <M tex="r''=2" /> y <M tex="h=2/n" />: error <M tex="=\frac{2h^2\cdot2}{12}=\frac{h^2}3=\frac4{3n^2}" />. Se exige <M tex="\frac4{3n^2}\le10^{-4}" />, es decir <M tex="n^2\ge13333.3" /> y <M tex="n\ge115.47" />.</p>
      <p>El menor entero es <strong>n = 116</strong> (error <M tex="\approx9.9\times10^{-5}" />); con n = 115 el error es <M tex="\approx1.008\times10^{-4}" />, que no cumple. Simpson, en cambio, ya es exacto con n = 2 para esta tasa.</p>
    </>,
  },
]

export const PREGUNTAS_TRAPECIO: Pregunta[] = [
  {
    id: 'm4-q3', tipo: 'numerica', enunciado: 'Para r(t) = t² + 1 en [0, 2], ¿cuánto vale el trapecio compuesto con n = 2 (en MB)?', correcta: 5, tolerancia: 0.000001,
    explicacion: 'h = 1 y T = (1/2)(r(0) + 2r(1) + r(2)) = (1/2)(1 + 4 + 5) = 5 MB (error 1/3).',
    profundiza: 'El valor exacto es ∫(t² + 1)dt = 8/3 + 2 = 14/3 ≈ 4.6667, así que el trapecio (5) sobrestima en 1/3: r es convexa (r″ > 0) y las cuerdas quedan por encima de la curva.',
  },
  {
    id: 'm4-q4', tipo: 'opcion', enunciado: 'Si r(t) se mide en MB/s y t en s, ¿en qué unidad queda ∫ r(t) dt?',
    opciones: ['MB/s', 'MB', 'MB·s', 's'], correcta: 1,
    explicacion: '(MB/s)·s = MB: es el volumen acumulado.',
    porOpcion: ['MB/s es la unidad de la tasa, no de la integral.', 'Correcto: integrar una tasa en el tiempo da la cantidad acumulada.', 'MB·s sería multiplicar MB por segundos, y no es lo que hace la integral de una tasa.', 'Los segundos son la unidad del tiempo, no del volumen acumulado.'],
    profundiza: 'Revisar unidades es una forma barata de detectar errores: la integral de una tasa en el tiempo da la cantidad acumulada y, al revés, la derivada de una cantidad da su tasa.',
  },
  {
    id: 'm4-q6', tipo: 'vf', enunciado: 'Al duplicar n, el error del trapecio compuesto se divide aproximadamente entre 4.', correcta: true,
    explicacion: 'El error es proporcional a h², y al duplicar n el paso h se reduce a la mitad.',
    profundiza: 'Por la misma razón Simpson mejora unas 16 veces al duplicar n (error ∝ h⁴). Comprobarlo en la calculadora es una manera práctica de verificar el orden de un método.',
  },
]

/* ---------- Simpson compuesto ---------- */
export const EJERCICIOS_SIMPSON: Ejercicio[] = [
  {
    id: 'm4-e2', nivel: 'Intermedio', titulo: 'Simpson con n = 2',
    enunciado: <p>Con <M tex="r(t)=3t^2+2t+1" /> en <M tex="[1,3]" /> calcula el volumen con Simpson 1/3 (<M tex="n=2" />) y con trapecio (<M tex="n=2" />). Compara con la integral exacta.</p>,
    verificar: <>Edita los coeficientes (a = 3, b = 2, c = 1) y los extremos (1 y 3) en la calculadora.</>,
    solucion: <>
      <p><M tex="h=1" />; <M tex="r(1)=6,\;r(2)=17,\;r(3)=34" />.</p>
      <p>Simpson: <M tex="\frac13(6+4\cdot17+34)=\frac{108}3=36" /> MB. Trapecio: <M tex="\frac12(6+2\cdot17+34)=37" /> MB.</p>
      <p>Exacta: <M tex="[t^3+t^2+t]_1^3=39-3=36" /> MB. Simpson es exacto (la tasa es un polinomio de grado ≤ 3); el trapecio sobrestima en 1 MB.</p>
    </>,
  },
  {
    id: 'm4-e3', nivel: 'Avanzado', titulo: 'Simpson no es exacto en general',
    enunciado: <p>Calcula <M tex="\int_0^1t^4\,dt" /> con Simpson 1/3 usando <M tex="n=2" /> y <M tex="n=4" />, y con trapecio <M tex="n=2" />. ¿Cuánto vale el cociente entre los errores de Simpson al duplicar <M tex="n" />? ¿Qué orden de convergencia sugiere?</p>,
    solucion: <>
      <p>Exacta: <M tex="0.2" />. Simpson <M tex="n=2" /> (<M tex="h=0.5" />): <M tex="\frac{0.5}3(0+4\cdot0.0625+1)=0.208333" />, error <M tex="\frac1{120}\approx0.00833" />.</p>
      <p>Simpson <M tex="n=4" /> (<M tex="h=0.25" />): <M tex="\frac{0.25}3(0+4\cdot0.00390625+2\cdot0.0625+4\cdot0.31640625+1)=0.200521" />, error <M tex="\frac1{1920}\approx0.000521" />.</p>
      <p>El cociente es <M tex="16=2^4" />: error <M tex="\propto h^4" />. El trapecio <M tex="n=2" /> da <M tex="0.28125" /> (error 0.08125, 10 veces mayor). Con un integrando de grado 4, Simpson ya no es exacto: su ventaja es la rapidez de convergencia, no la exactitud general.</p>
    </>,
  },
]

export const PREGUNTAS_SIMPSON: Pregunta[] = [
  {
    id: 'm4-q1', tipo: 'opcion', enunciado: '¿Por qué Simpson 1/3 compuesto exige un número par de subintervalos?',
    opciones: ['Porque el trapecio lo exige también', 'Porque ajusta una parábola por cada tres nodos, o sea, agrupa los subintervalos de dos en dos', 'Para que h sea entero', 'Para que la tasa sea positiva'], correcta: 1,
    explicacion: 'Cada parábola necesita tres nodos consecutivos y cubre dos subintervalos; con n impar sobraría uno.',
    porOpcion: ['El trapecio admite cualquier n; la exigencia es de Simpson.', 'Correcto: cada parábola cubre dos subintervalos.', 'h no necesita ser entero.', 'El signo de la tasa no interviene en la paridad de n.'],
    profundiza: 'Con n impar podría aplicarse Simpson 1/3 a los primeros n − 1 subintervalos y el trapecio al último, pero el error global se degrada a orden h²; lo habitual es exigir n par.',
  },
  {
    id: 'm4-q2', tipo: 'vf', enunciado: 'Simpson 1/3 da el valor exacto de la integral de cualquier función suave.', correcta: false,
    explicacion: 'Solo es exacto para polinomios de grado ≤ 3. En general su error es proporcional a h⁴ y f⁗, no cero.',
    profundiza: 'El error de Simpson compuesto es −(b − a)·h⁴·f⁗(ξ)/180: se anula si f⁗ ≡ 0 (polinomios de grado ≤ 3, y por eso es exacto para esos) y en otro caso decrece como h⁴.',
  },
  {
    id: 'sim-q3', tipo: 'numerica', enunciado: 'Simpson 1/3 con n = 2 para r(t) = 3t² + 2t + 1 en [1, 3]: valor en MB.', correcta: 36, tolerancia: 0.000001,
    explicacion: 'h = 1: (1/3)(6 + 4·17 + 34) = 108/3 = 36 MB, igual a la integral exacta.',
    profundiza: 'Es exacto porque r es un polinomio de grado 2 ≤ 3. Compara con el trapecio (37): con los mismos tres puntos, Simpson aprovecha la curvatura que el trapecio ignora.',
  },
]

/* ---------- Derivación numérica ---------- */
export const EJERCICIOS_DERIVACION: Ejercicio[] = [
  {
    id: 'der-e1', nivel: 'Intermedio', titulo: 'Tres diferencias para r′(1)',
    enunciado: <p>Para <M tex="r(t)=t^2+1" /> estima <M tex="r'(1)" /> con <M tex="h=0.1" /> usando la diferencia central, la progresiva y la regresiva. Compara con la derivada exacta e indica cuál es más exacta y por qué.</p>,
    verificar: <>Compruébalo en la herramienta «Derivación numérica» (t = 1, h = 0.1).</>,
    solucion: <>
      <p><M tex="r(0.9)=1.81,\;r(1)=2,\;r(1.1)=2.21" />. Central: <M tex="(2.21-1.81)/0.2=2" />; progresiva: <M tex="(2.21-2)/0.1=2.1" />; regresiva: <M tex="(2-1.81)/0.1=1.9" />. La derivada exacta es <M tex="r'(1)=2" />.</p>
      <p>La central es exacta aquí: sus errores se compensan a ambos lados y para un polinomio de grado ≤ 2 el error de truncamiento <M tex="O(h^2)" /> se anula. Las laterales tienen error <M tex="O(h)" />: ±0.1, el signo según el lado.</p>
    </>,
  },
  {
    id: 'der-e2', nivel: 'Avanzado', titulo: '¿Cuál es el mejor paso h?',
    enunciado: <p>Se estima <M tex="(e^t)'" /> en <M tex="t=1" /> (valor exacto <M tex="e\approx2.71828" />) con la diferencia central. Decide qué paso <M tex="h" /> usarías y explica qué ocurre si se toma <M tex="h" /> muy pequeño.</p>,
    plan: {
      pregunta: '¿qué paso h elegirías?',
      opciones: [
        { id: 'grande', texto: 'h = 0.5', veredicto: 'posible', razon: 'El error de truncamiento domina: ≈ 0.115, que es un 4 % del valor.', preset: { herramienta: 'derivacion', valores: { funcion: 'exponencial', t: '1', h: '0.5' } } },
        { id: 'medio', texto: 'h = 10⁻⁵', veredicto: 'adecuado', razon: 'Equilibra truncamiento y redondeo: el error baja a ≈ 6·10⁻¹¹.', preset: { herramienta: 'derivacion', valores: { funcion: 'exponencial', t: '1', h: '0.00001' } } },
        { id: 'minimo', texto: 'h = 10⁻¹² (lo más pequeño posible)', veredicto: 'inadecuado', razon: 'f(t + h) y f(t − h) casi coinciden: la resta pierde cifras (cancelación) y el error sube a ≈ 2·10⁻⁴.', preset: { herramienta: 'derivacion', valores: { funcion: 'exponencial', t: '1', h: '1e-12' } } },
      ],
    },
    solucion: <>
      <p>Errores de la diferencia central para <M tex="e^t" /> en <M tex="t=1" />: <M tex="h=0.5\to0.115" />, <M tex="h=0.1\to4.5\times10^{-3}" />, <M tex="h=10^{-5}\to5.9\times10^{-11}" />, <M tex="h=10^{-12}\to2.1\times10^{-4}" />.</p>
      <p>El error de truncamiento es <M tex="\propto h^2" /> y el de redondeo <M tex="\propto\varepsilon/h" /> (con <M tex="\varepsilon\approx10^{-16}" />). Su suma es mínima para <M tex="h\sim\varepsilon^{1/3}\approx10^{-5}" />. <strong>Reducir h no siempre mejora</strong>: es el mismo fenómeno de cancelación del tema de errores.</p>
    </>,
  },
]

export const PREGUNTAS_DERIVACION: Pregunta[] = [
  {
    id: 'm4-q5', tipo: 'numerica', enunciado: 'Con r(t) = t² + 1, estima r′(1) con diferencia central y h = 0.1, en MB/s².', correcta: 2, tolerancia: 0.000001,
    explicacion: '(r(1.1) − r(0.9)) / 0.2 = (2.21 − 1.81) / 0.2 = 2. Es exacta porque r es cuadrática.',
    profundiza: 'La diferencia central tiene error O(h²) y es exacta para polinomios de grado ≤ 2. La diferencia progresiva (r(1.1) − r(1))/0.1 daría 2.1: su error es O(h).',
  },
  {
    id: 'der-q2', tipo: 'vf', enunciado: 'La diferencia progresiva (f(t+h) − f(t))/h tiene error de truncamiento O(h²).', correcta: false,
    explicacion: 'Su error es O(h); la que tiene O(h²) es la diferencia central.',
    profundiza: 'Se ve en el cociente entre errores al partir h por la mitad: ≈ 2 en la progresiva (orden 1) y ≈ 4 en la central (orden 2). La herramienta de derivación lo muestra en la columna de cocientes.',
  },
  {
    id: 'der-q3', tipo: 'numerica', enunciado: 'Diferencia progresiva de r(t) = t² + 1 en t = 1 con h = 0.1, en MB/s².', correcta: 2.1, tolerancia: 0.000001,
    explicacion: '(r(1.1) − r(1)) / 0.1 = (2.21 − 2) / 0.1 = 2.1.',
    profundiza: 'El error es 0.1 = h·r″/2 = 0.1·2/2: proporcional a h. Con h = 0.05 sería 2.05.',
  },
]
