import Matematica from '../../components/Matematica'
import type { Ejercicio } from '../../components/Ejercicios'
import type { Pregunta } from '../../core/autoevaluacion'

const M = Matematica

export const EJERCICIOS_CERRADOS: Ejercicio[] = [
  {
    id: 'cer-e1', nivel: 'Intermedio', titulo: 'Iteraciones necesarias en bisección',
    enunciado: <p>Para <M tex="f(x)=x^3-x-2" /> en <M tex="[1,2]" />, ¿cuántas iteraciones de bisección garantizan una cota de error <M tex="\le 10^{-3}" />? Después, ¿cuál es la cota tras 5 iteraciones?</p>,
    verificar: <>Compruébalo en la calculadora (método bisección) con tolerancia 0.001.</>,
    solucion: <>
      <p>La cota tras <M tex="n" /> iteraciones es <M tex="(b-a)/2^n" />. Se exige <M tex="1/2^n\le 10^{-3}" />, es decir <M tex="n\ge\log_2 1000\approx 9.97" />, así que <strong>n = 10</strong>.</p>
      <p>Tras 5 iteraciones: <M tex="1/2^5=0.03125" />.</p>
    </>,
  },
  {
    id: 'cer-e2', nivel: 'Intermedio', titulo: 'Falsa posición a mano',
    enunciado: <p>Aplica dos iteraciones de falsa posición a <M tex="f(x)=x^3-x-2" /> en <M tex="[1,2]" />. Calcula <M tex="c_1" />, <M tex="f(c_1)" />, decide qué extremo se reemplaza y calcula <M tex="c_2" />.</p>,
    verificar: <>Compruébalo en la calculadora (falsa posición, a = 1, b = 2) mirando las dos primeras filas.</>,
    solucion: <>
      <p><M tex="c_1=\dfrac{1\cdot4-2\cdot(-2)}{4-(-2)}=\dfrac{8}{6}=\dfrac43\approx1.3333" />. Entonces <M tex="f(c_1)=\dfrac{64}{27}-\dfrac43-2=-\dfrac{26}{27}\approx-0.9630<0" />, igual signo que <M tex="f(1)" />: se reemplaza <strong>a</strong> y el intervalo pasa a <M tex="[4/3,\,2]" />.</p>
      <p><M tex="c_2=\dfrac{\frac43\cdot4-2\cdot(-\frac{26}{27})}{4+\frac{26}{27}}=\dfrac{196/27}{134/27}=\dfrac{98}{67}\approx1.4627" />, con <M tex="f(c_2)\approx-0.3333" />. El extremo <M tex="b=2" /> no se movió.</p>
    </>,
  },
  {
    id: 'cer-e3', nivel: 'Avanzado', titulo: 'El cambio de signo que engaña',
    enunciado: <p>Sea <M tex="f(x)=\dfrac1{x-1}" /> en <M tex="[0,3]" />: <M tex="f(0)=-1<0" /> y <M tex="f(3)=0.5>0" />. Un compañero aplica bisección y acepta el resultado. ¿Qué plan seguirías tú?</p>,
    plan: {
      pregunta: '¿qué harías con este intervalo?',
      opciones: [
        { id: 'aceptar', texto: 'Bisección y aceptar el valor final como raíz', veredicto: 'inadecuado', razon: 'La bisección «converge» a x = 1, que es un polo, no una raíz: f no es continua en [0, 3].', preset: { herramienta: 'raices', valores: { metodo: 'biseccion', modelo: 'polo', objetivo: '0', a: '0', b: '3' } } },
        { id: 'verificar', texto: 'Bisección y verificar el resultado con |f(r)|', veredicto: 'adecuado', razon: 'El valor |f(r)| enorme y creciente delata el polo: la verificación descarta la falsa raíz y el portal responde «no converge».', preset: { herramienta: 'raices', valores: { metodo: 'biseccion', modelo: 'polo', objetivo: '0', a: '0', b: '3' } } },
        { id: 'newton', texto: 'Newton desde x₀ = 2', veredicto: 'inadecuado', razon: 'f no tiene raíz (1/(x − 1) nunca vale 0): Newton se aleja del polo sin converger.', preset: { herramienta: 'raices', valores: { metodo: 'newton', modelo: 'polo', objetivo: '0', x0: '2' } } },
      ],
    },
    solucion: <>
      <p><M tex="f" /> es discontinua en <M tex="x=1\in[0,3]" />: el cambio de signo se produce por el polo, no por un cruce del eje. La bisección encierra el polo: los puntos medios se acercan a 1 y <M tex="|f|" /> crece sin límite.</p>
      <p>El portal aplica un criterio de verificación independiente: una raíz <M tex="r" /> debe ser un mínimo local de <M tex="|f|" /> y cruzar el cero. Aquí <M tex="|f(r)|" /> es enorme comparado con sus vecinos, así que informa <strong>«no converge»</strong> en lugar de entregar <M tex="r\approx1" /> como raíz.</p>
      <p><strong>Moral:</strong> «cambio de signo» es condición suficiente solo si <M tex="f" /> es continua; verifica siempre la raíz.</p>
    </>,
  },
  {
    id: 'cer-e4', nivel: 'Avanzado', titulo: 'Cuando la falsa posición es más lenta que la bisección',
    enunciado: <p>Con <M tex="f(x)=x^6-1" /> en <M tex="[0,\,1.5]" /> y tolerancia <M tex="10^{-6}" />, compara las iteraciones de bisección y falsa posición. ¿Qué extremo se queda fijo en la falsa posición y por qué?</p>,
    verificar: <>En la calculadora elige «Polinomio», coeficientes <code>1, 0, 0, 0, 0, 0, -1</code>, a = 0, b = 1.5 y compara ambos métodos.</>,
    solucion: <>
      <p>La bisección necesita <strong>21</strong> iteraciones (<M tex="1.5/2^{21}\le10^{-6}" />); la falsa posición, <strong>43</strong>. Aquí la falsa posición es más lenta.</p>
      <p>En <M tex="[0,1.5]" /> la función es creciente y convexa, de modo que la cuerda queda siempre <em>por encima</em> de la curva: su corte cae a la izquierda de la raíz, <M tex="f(c)<0" /> y se reemplaza siempre <M tex="a" />. El extremo <M tex="b=1.5" /> permanece fijo y los cortes se acercan a 1 solo por un lado, con convergencia lineal y razón cercana a 1.</p>
      <p>Por eso su criterio de parada (cambio entre cortes) puede engañar con pasos pequeños: hay variantes (Illinois) que corrigen el estancamiento. Si quieres garantía de tiempo, la bisección es predecible; si hay curvatura marcada, la falsa posición puede perder su ventaja.</p>
    </>,
  },
]

export const PREGUNTAS_CERRADOS: Pregunta[] = [
  {
    id: 'cer-q1', tipo: 'opcion', enunciado: '¿Qué condición debe cumplir el intervalo [a, b] para poder aplicar bisección?',
    opciones: ['f(a)·f(b) > 0', 'f(a)·f(b) < 0 con f continua', 'f′(a) ≠ 0', 'b − a < 1'], correcta: 1,
    explicacion: 'El cambio de signo con f continua garantiza una raíz (teorema del valor intermedio).',
    porOpcion: ['Si f(a) y f(b) tienen el mismo signo no hay garantía de raíz en el intervalo.', 'Correcto: cambio de signo y continuidad.', 'La bisección no usa derivada.', 'El ancho del intervalo no es una condición: solo afecta el número de iteraciones.'],
    profundiza: 'Si f(a)·f(b) > 0 puede haber 0, 2, 4… raíces (número par) dentro; el cambio de signo sólo asegura un número impar. Por eso un intervalo sin cambio de signo no prueba que no haya raíz, solo que el método no puede garantizarla.',
  },
  {
    id: 'cer-q2', tipo: 'numerica', enunciado: 'Número de iteraciones de bisección en [1, 2] para garantizar cota ≤ 10⁻⁶ (entero).', correcta: 20, tolerancia: 0,
    explicacion: 'n ≥ log₂(10⁶) ≈ 19.93, luego n = 20.',
    profundiza: 'Se redondea hacia arriba porque la cota debe cumplirse: con n = 19 la cota es 1/2¹⁹ ≈ 1.9·10⁻⁶ > 10⁻⁶, con n = 20 es ≈ 9.5·10⁻⁷.',
  },
  {
    id: 'cer-q3', tipo: 'vf', enunciado: 'Si f(a)·f(b) < 0 entonces siempre hay una raíz de f en (a, b).', correcta: false,
    explicacion: 'Falso si f no es continua: f(x) = 1/x cambia de signo en [−1, 2] y no tiene raíz.',
    profundiza: 'La hipótesis de continuidad es parte del teorema. El portal protege al usuario: tras terminar la bisección comprueba que el punto es mínimo local de |f| y que f cruza el cero; si no, declara «no converge».',
  },
  {
    id: 'cer-q4', tipo: 'opcion', enunciado: 'En la falsa posición, ¿por qué el ancho b − a puede no tender a 0?',
    opciones: ['Porque la fórmula del corte es incorrecta', 'Porque un extremo puede quedarse fijo y solo el otro se mueve', 'Porque necesita derivada', 'Porque no usa el cambio de signo'], correcta: 1,
    explicacion: 'Si f es convexa (o cóncava) en el intervalo, el corte de la cuerda cae siempre del mismo lado de la raíz y se reemplaza el mismo extremo.',
    porOpcion: ['La fórmula es correcta; lo que ocurre es una propiedad geométrica de la cuerda.', 'Correcto: es el estancamiento típico de la regula falsi.', 'No usa derivada.', 'Sí lo usa: es un método cerrado como la bisección.'],
    profundiza: 'Por eso su criterio de parada no puede basarse en (b − a) como en la bisección y se usa el cambio entre cortes consecutivos. Variantes como Illinois reducen a la mitad el valor de f del extremo fijo para evitarlo.',
  },
  {
    id: 'cer-q5', tipo: 'numerica', enunciado: 'Primer corte de la falsa posición para f(x) = x² − 2 en [1, 2].', correcta: 1.3333, tolerancia: 0.001,
    explicacion: 'f(1) = −1 y f(2) = 2: c = (1·2 − 2·(−1))/(2 − (−1)) = 4/3 ≈ 1.3333.',
    profundiza: 'Compara con el punto medio de la bisección (1.5): la falsa posición pondera por los valores de f y se acerca más a √2 ≈ 1.4142 porque f(1) es pequeño en valor absoluto frente a f(2).',
  },
  {
    id: 'cer-q6', tipo: 'vf', enunciado: 'En la bisección, la cota del error del punto medio tras n iteraciones es (b − a)/2ⁿ.', correcta: true,
    explicacion: 'Cada iteración reduce a la mitad el intervalo y el punto medio dista de la raíz a lo sumo la mitad del ancho.',
    profundiza: 'Esto da el número de iteraciones antes de empezar, sin evaluar f. Es una cota del error de la raíz, a diferencia del residuo |f(c)|, que no mide el error en x.',
  },
]
