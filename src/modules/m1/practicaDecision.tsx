import Matematica from '../../components/Matematica'
import type { Ejercicio } from '../../components/Ejercicios'
import type { Pregunta } from '../../core/autoevaluacion'

const M = Matematica

export const EJERCICIOS_DECISION: Ejercicio[] = [
  {
    id: 'dec-e1', nivel: 'Intermedio', titulo: 'Calibrar la capacidad con una simulación costosa',
    enunciado: (
      <p>
        El tiempo de respuesta <M tex="T(c)" /> de un servicio solo se conoce ejecutando una simulación de 2 minutos para cada capacidad <M tex="c" />. Se busca <M tex="c" /> tal que <M tex="T(c)=200" /> ms. Ya se simuló <M tex="T(100)=120" /> y <M tex="T(400)=310" />. No hay fórmula de <M tex="T" /> ni de su derivada. Con <M tex="f(c)=T(c)-200" /> tienes <M tex="f(100)=-80" /> y <M tex="f(400)=110" />. Antes de calcular, decide cómo lo resolverás. <em>(En la calculadora la función del caso base hace de sustituto de T.)</em>
      </p>
    ),
    plan: {
      pregunta: '¿qué método usarás para encontrar c?',
      opciones: [
        { id: 'newton', texto: 'Newton: iterar desde c = 250', veredicto: 'inadecuado', razon: 'Newton necesita T′(c), que no se conoce; aproximarla con diferencias costaría simulaciones extra.' },
        { id: 'biseccion', texto: 'Bisección en [100, 400]', veredicto: 'posible', razon: 'Hay cambio de signo y está garantizada, pero con tolerancia de 1 ms necesita ⌈log₂(300/1)⌉ = 9 simulaciones de 2 minutos.', preset: { herramienta: 'raices', valores: { metodo: 'biseccion' } } },
        { id: 'falsa', texto: 'Falsa posición en [100, 400]', veredicto: 'adecuado', razon: 'Aprovecha el cambio de signo y también los valores de T: el primer corte ya cae en c ≈ 226 sin simular nada nuevo, y suele necesitar menos simulaciones que la bisección.', preset: { herramienta: 'raices', valores: { metodo: 'falsa' } } },
        { id: 'secante', texto: 'Secante con c₀ = 100 y c₁ = 400', veredicto: 'adecuado', razon: 'No necesita derivada y reutiliza las dos simulaciones ya hechas. Es rápida, pero sin la garantía del intervalo: verifique al final con una simulación en el valor encontrado.', preset: { herramienta: 'raices', valores: { metodo: 'secante' } } },
      ],
    },
    solucion: (
      <>
        <p><strong>Análisis.</strong> Hay cambio de signo (<M tex="f(100)f(400)<0" />) y no hay derivada; cada evaluación cuesta mucho. Eso descarta Newton y favorece los métodos que reutilizan lo que ya se simuló.</p>
        <p><strong>Plan.</strong> Falsa posición: <M tex="c_1=\dfrac{100\cdot110-400\cdot(-80)}{110-(-80)}=\dfrac{43000}{190}\approx226.3" />. Se simula <M tex="T(226.3)" />, se conserva el subintervalo con cambio de signo y se repite hasta que el cambio entre cortes sea menor que la tolerancia (1 ms). La secante da el mismo primer paso y suele terminar en similar número de simulaciones.</p>
        <p><strong>Verificación.</strong> Al final se simula una vez más en <M tex="c^*" /> y se comprueba que <M tex="|T(c^*)-200|" /> es compatible con la precisión de la simulación. La bisección también serviría; es la opción más segura pero la más cara.</p>
      </>
    ),
  },
  {
    id: 'dec-e2', nivel: 'Avanzado', titulo: 'Todas las raíces de un polinomio característico',
    enunciado: (
      <p>
        Un sistema de control tiene polinomio característico <M tex="p(s)=s^4-10s^2+9" />. Para estudiar su estabilidad necesitas <strong>todas</strong> sus raíces (reales o complejas). ¿Cómo planeas obtenerlas?
      </p>
    ),
    plan: {
      pregunta: '¿qué estrategia seguirás?',
      opciones: [
        { id: 'biseccion', texto: 'Bisección: buscar un cambio de signo para cada raíz', veredicto: 'posible', razon: 'Sirve para cada raíz real, pero tendrías que adivinar los intervalos y no encuentra raíces complejas; no te dice cuántas faltan.', preset: { herramienta: 'raices', valores: { metodo: 'biseccion', modelo: 'polinomio', coef: '1, 0, -10, 0, 9', a: '0', b: '2' } } },
        { id: 'newton', texto: 'Newton desde un único x₀', veredicto: 'inadecuado', razon: 'Cada ejecución devuelve una sola raíz (la que quede cerca de x₀) y no informa de las demás.', preset: { herramienta: 'raices', valores: { metodo: 'newton', modelo: 'polinomio', coef: '1, 0, -10, 0, 9', x0: '5' } } },
        { id: 'horner', texto: 'Newton–Horner con deflación', veredicto: 'adecuado', razon: 'Evalúa p y p′ con Horner (pocas operaciones), reduce el grado tras cada raíz y obtiene todas, incluso complejas, con la fórmula cuadrática al final.', preset: { herramienta: 'raices', valores: { metodo: 'todas', modelo: 'polinomio', coef: '1, 0, -10, 0, 9' } } },
        { id: 'secante', texto: 'Secante con dos puntos iniciales', veredicto: 'inadecuado', razon: 'Igual que Newton, produce una raíz por ejecución y depende de los puntos iniciales.' },
      ],
    },
    solucion: (
      <>
        <p><strong>Análisis.</strong> Es un polinomio de grado 4 y se piden todas las raíces: el problema pide una estrategia que las encuentre en bloque.</p>
        <p><strong>Plan.</strong> (1) Cota de Cauchy: <M tex="|r|\le11" />. (2) Newton–Horner desde 11 converge a <M tex="s=3" />; la deflación deja <M tex="s^3+3s^2-s-3" />. (3) Se repite hasta quedar un polinomio de grado 2 y se resuelve con la fórmula cuadrática. (4) Se verifican todas las raíces con el residuo relativo.</p>
        <p><strong>Resultado.</strong> Las raíces son <M tex="-3,\,-1,\,1,\,3" />. Como <M tex="1" /> y <M tex="3" /> tienen parte real positiva, el sistema es <strong>inestable</strong>. Observa que <M tex="p(s)=(s^2-1)(s^2-9)" />, lo que confirma el resultado.</p>
      </>
    ),
  },
  {
    id: 'dec-e3', nivel: 'Avanzado', titulo: 'Un punto inicial «sencillo» que falla',
    enunciado: (
      <p>
        Se quiere resolver <M tex="x^3=1" /> (es decir, <M tex="f(x)=x^3-1" />). Un compañero propone Newton desde <M tex="x_0=0" /> «porque cero es un número sencillo». Decide qué plan seguirías y justifícalo.
      </p>
    ),
    plan: {
      pregunta: '¿cómo resolverías x³ = 1?',
      opciones: [
        { id: 'n0', texto: 'Newton desde x₀ = 0', veredicto: 'inadecuado', razon: "f′(0) = 3·0² = 0: Newton divide entre cero. El portal lo informa como derivada_nula y no produce raíz.", preset: { herramienta: 'raices', valores: { metodo: 'newton', modelo: 'cubo', objetivo: '1', x0: '0' } } },
        { id: 'n2', texto: 'Newton desde x₀ = 2', veredicto: 'adecuado', razon: "f′(2) = 12 ≠ 0 y el punto está del lado correcto de la raíz: converge a 1 en pocas iteraciones.", preset: { herramienta: 'raices', valores: { metodo: 'newton', modelo: 'cubo', objetivo: '1', x0: '2' } } },
        { id: 'bis', texto: 'Bisección en [0, 2]', veredicto: 'adecuado', razon: 'f(0) = −1 < 0 < f(2) = 7: cambio de signo, convergencia garantizada (más lenta).', preset: { herramienta: 'raices', valores: { metodo: 'biseccion', modelo: 'cubo', objetivo: '1', a: '0', b: '2' } } },
        { id: 'sec', texto: 'Secante con x₀ = 0 y x₁ = 2', veredicto: 'posible', razon: 'No usa derivada, así que no falla en x = 0; no garantiza convergencia, pero aquí los dos puntos rodean la raíz.', preset: { herramienta: 'raices', valores: { metodo: 'secante', modelo: 'cubo', objetivo: '1', p0: '0', p1: '2' } } },
      ],
    },
    solucion: (
      <>
        <p>Newton necesita <M tex="f'(x_0)\ne0" />. Con <M tex="f'(x)=3x^2" /> y <M tex="x_0=0" /> la derivada es nula: el método no puede ni dar el primer paso. Es un fallo del <em>método con ese punto inicial</em>, no del problema: <M tex="x^3=1" /> tiene la raíz simple <M tex="x=1" />.</p>
        <p>Remedios: cambiar <M tex="x_0" />, acotar con bisección (hay cambio de signo en <M tex="[0,2]" />) o usar la secante, que no deriva. Elegir el método <em>después</em> de mirar sus supuestos evita este tipo de fallos.</p>
      </>
    ),
  },
]

export const PREGUNTAS_DECISION: Pregunta[] = [
  {
    id: 'dec-q1', tipo: 'opcion', enunciado: 'No tienes la derivada, cada evaluación de f es muy cara y conoces un intervalo con cambio de signo. ¿Qué método es más razonable?',
    opciones: ['Newton', 'Falsa posición (o secante)', 'Bisección con tolerancia 10⁻¹⁵', 'Ninguno: el problema no tiene solución'], correcta: 1,
    explicacion: 'Aprovecha los valores de f sin necesitar derivada, y con el intervalo se conserva una garantía.',
    porOpcion: ['Newton necesita f′, que aquí no se tiene.', 'Correcto: usa los valores de f (no la derivada) y, con cambio de signo, la falsa posición mantiene el intervalo.', 'La bisección funcionaría, pero exigir 10⁻¹⁵ multiplica evaluaciones caras sin necesidad.', 'Sí tiene solución: hay cambio de signo.'],
    profundiza: 'Elegir el método es equilibrar tres cosas: lo que necesita (derivada, intervalo), lo que garantiza (convergencia) y lo que cuesta (evaluaciones de f). Cuando evaluar f es lo más caro, importa el número de evaluaciones, no las operaciones por iteración.',
  },
  {
    id: 'dec-q2', tipo: 'vf', enunciado: 'Un método abierto (Newton, secante) necesita un intervalo con cambio de signo para arrancar.', correcta: false,
    explicacion: 'Los métodos abiertos solo necesitan puntos iniciales; es justamente lo que los distingue de los cerrados.',
    profundiza: 'La contrapartida es que, al no encerrar la raíz, no tienen convergencia garantizada: pueden divergir, ciclar o saltar a otra raíz. Por eso es habitual acotar primero con un método cerrado.',
  },
  {
    id: 'dec-q3', tipo: 'opcion', enunciado: '¿Cuál es la principal ventaja de un método cerrado?',
    opciones: ['Siempre es más rápido que uno abierto', 'Converge siempre si f es continua y hay cambio de signo', 'No requiere evaluar f', 'Encuentra todas las raíces a la vez'], correcta: 1,
    explicacion: 'Encierra la raíz en un intervalo que no se pierde, por el teorema del valor intermedio.',
    porOpcion: ['Suele ser al revés: los abiertos son más rápidos cerca de la raíz.', 'Correcto: es su garantía, a costa de velocidad.', 'Todos los métodos evalúan f.', 'Cada ejecución encuentra una sola raíz de las que haya en el intervalo.'],
    profundiza: 'La garantía exige continuidad: si f tiene un polo en el intervalo (como 1/x), el cambio de signo no implica raíz. Por eso el portal verifica el resultado antes de declararlo raíz.',
  },
  {
    id: 'dec-q4', tipo: 'numerica', enunciado: '¿Cuántas iteraciones de bisección garantizan una cota ≤ 10⁻³ en el intervalo [0, 4]? (entero)', correcta: 12, tolerancia: 0,
    explicacion: 'Se exige 4/2ⁿ ≤ 10⁻³, es decir n ≥ log₂(4000) ≈ 11.97, luego n = 12.',
    profundiza: 'Error común: redondear 11.97 hacia abajo. La cota debe cumplirse, así que se redondea siempre hacia arriba. Comprueba: 4/2¹¹ = 0.00195 > 10⁻³, pero 4/2¹² = 0.000977 ≤ 10⁻³.',
  },
]
