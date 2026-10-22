import Matematica from '../../components/Matematica'
import type { Ejercicio } from '../../components/Ejercicios'
import type { Pregunta } from '../../core/autoevaluacion'

const M = Matematica

export const EJERCICIOS_M4: Ejercicio[] = [
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
  {
    id: 'm4-e4', nivel: 'Avanzado', titulo: '¿Cuántos subintervalos hacen falta?',
    enunciado: <p>Para <M tex="r(t)=t^2+1" /> en <M tex="[0,2]" /> el error del trapecio compuesto es <M tex="\frac{(b-a)h^2}{12}\,r''" />. ¿Cuál es el menor <M tex="n" /> que garantiza un error absoluto menor o igual que <M tex="10^{-4}" /> MB? Verifícalo con la calculadora.</p>,
    verificar: <>Prueba n = 115 y n = 116 en la calculadora de trapecio y mira el error absoluto.</>,
    solucion: <>
      <p>Como <M tex="r''=2" /> y <M tex="h=2/n" />: error <M tex="=\frac{2h^2\cdot2}{12}=\frac{h^2}3=\frac4{3n^2}" />. Se exige <M tex="\frac4{3n^2}\le10^{-4}" />, es decir <M tex="n^2\ge13333.3" /> y <M tex="n\ge115.47" />.</p>
      <p>El menor entero es <strong>n = 116</strong> (error <M tex="\approx9.9\times10^{-5}" />); con n = 115 el error es <M tex="\approx1.008\times10^{-4}" />, que no cumple. Simpson, en cambio, ya es exacto con n = 2 para esta tasa.</p>
    </>,
  },
]

export const PREGUNTAS_M4: Pregunta[] = [
  { id: 'm4-q1', tipo: 'opcion', enunciado: '¿Por qué Simpson 1/3 compuesto exige un número par de subintervalos?',
    opciones: ['Porque el trapecio lo exige también', 'Porque ajusta una parábola por cada tres nodos, o sea, agrupa los subintervalos de dos en dos', 'Para que h sea entero', 'Para que la tasa sea positiva'], correcta: 1,
    explicacion: 'Cada parábola necesita tres nodos consecutivos y cubre dos subintervalos; con n impar sobraría uno.' },
  { id: 'm4-q2', tipo: 'vf', enunciado: 'Simpson 1/3 da el valor exacto de la integral de cualquier función suave.', correcta: false,
    explicacion: 'Solo es exacto para polinomios de grado ≤ 3. En general su error es proporcional a h⁴ y f⁗, no cero.' },
  { id: 'm4-q3', tipo: 'numerica', enunciado: 'Para r(t) = t² + 1 en [0, 2], ¿cuánto vale el trapecio compuesto con n = 2 (en MB)?', correcta: 5, tolerancia: 0.000001,
    explicacion: 'h = 1 y T = (1/2)(r(0) + 2r(1) + r(2)) = (1/2)(1 + 4 + 5) = 5 MB (error 1/3).' },
  { id: 'm4-q4', tipo: 'opcion', enunciado: 'Si r(t) se mide en MB/s y t en s, ¿en qué unidad queda ∫ r(t) dt?',
    opciones: ['MB/s', 'MB', 'MB·s', 's'], correcta: 1,
    explicacion: '(MB/s)·s = MB: es el volumen acumulado.' },
  { id: 'm4-q5', tipo: 'numerica', enunciado: 'Con r(t) = t² + 1, estima r′(1) con diferencia central y h = 0.1, en MB/s².', correcta: 2, tolerancia: 0.000001,
    explicacion: '(r(1.1) − r(0.9)) / 0.2 = (2.21 − 1.81) / 0.2 = 2. Es exacta porque r es cuadrática.' },
  { id: 'm4-q6', tipo: 'vf', enunciado: 'Al duplicar n, el error del trapecio compuesto se divide aproximadamente entre 4.', correcta: true,
    explicacion: 'El error es proporcional a h², y al duplicar n el paso h se reduce a la mitad.' },
]
