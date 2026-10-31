import Matematica from '../../components/Matematica'
import type { Ejercicio } from '../../components/Ejercicios'
import type { Pregunta } from '../../core/autoevaluacion'

const M = Matematica

export const EJERCICIOS_ABIERTOS: Ejercicio[] = [
  {
    id: 'abi-e1', nivel: 'Intermedio', titulo: 'Newton a mano para √2',
    enunciado: <p>Aplica Newton a <M tex="f(x)=x^2-2" /> con <M tex="x_0=1" /> y calcula <M tex="x_1,x_2,x_3" />. ¿Cuántas cifras correctas gana cada paso aproximadamente?</p>,
    solucion: <>
      <p><M tex="x_{n+1}=x_n-\frac{x_n^2-2}{2x_n}=\frac{x_n}{2}+\frac{1}{x_n}" />.</p>
      <p><M tex="x_1=1.5,\; x_2=1.4166667,\; x_3=1.4142157" /> (y <M tex="x_4=1.4142136" />, ya igual a <M tex="\sqrt2" /> en 8 cifras).</p>
      <p>Los errores son aproximadamente <M tex="0.086,\;0.0025,\;2\times10^{-6}" />: el número de cifras correctas casi se duplica en cada paso, la señal de la convergencia cuadrática.</p>
    </>,
  },
  {
    id: 'abi-e2', nivel: 'Intermedio', titulo: 'La secante a mano',
    enunciado: <p>Aplica tres iteraciones de la secante a <M tex="f(x)=x^2-2" /> con <M tex="x_0=1" /> y <M tex="x_1=2" />. Compara con Newton: ¿qué dato no necesitaste?</p>,
    verificar: <>Compruébalo en la calculadora con el método «Secante», polinomio <code>1, 0, -2</code>, x₀ = 1, x₁ = 2.</>,
    solucion: <>
      <p><M tex="x_2=2-2\cdot\dfrac{2-1}{2-(-1)}=\dfrac43\approx1.3333" />. Luego <M tex="f(4/3)=-\dfrac29" /> y <M tex="x_3=\dfrac{7}{5}=1.4" />; y <M tex="x_4=\dfrac{58}{41}\approx1.41463" />.</p>
      <p>No se necesitó <strong>la derivada</strong> <M tex="f'(x)=2x" />: la pendiente se aproxima con dos valores de <M tex="f" />. Tras 3 pasos el error es <M tex="\approx4.2\times10^{-4}" />; Newton desde 1 habría dado <M tex="1.5,\,1.41667,\,1.41422" />: un poco más rápido por iteración, pero exige derivar.</p>
    </>,
  },
  {
    id: 'abi-e3', nivel: 'Avanzado', titulo: 'Newton que no converge: un ciclo',
    enunciado: <p>Para <M tex="f(x)=x^3-2x+2" /> aplica Newton desde <M tex="x_0=0" /> durante tres pasos. ¿Qué observas y por qué el criterio <M tex="|x_{n+1}-x_n|\le\text{tol}" /> nunca se cumple?</p>,
    plan: {
      pregunta: 'al ver que Newton cicla, ¿qué harías?',
      opciones: [
        { id: 'subir', texto: 'Subir el máximo de iteraciones a 10 000', veredicto: 'inadecuado', razon: 'En un ciclo de periodo 2 el cambio es siempre 1: más iteraciones solo repiten el ciclo.' },
        { id: 'x0', texto: 'Cambiar el punto inicial a −2', veredicto: 'adecuado', razon: 'Desde −2 (más cerca de la única raíz real ≈ −1.77) Newton converge.', preset: { herramienta: 'raices', valores: { metodo: 'newton', modelo: 'polinomio', coef: '1, 0, -2, 2', x0: '-2' } } },
        { id: 'cerrado', texto: 'Acotar con bisección en [−3, −1] y refinar', veredicto: 'adecuado', razon: 'p(−3) = −19 < 0 < p(−1) = 3: hay cambio de signo y la bisección lo garantiza.', preset: { herramienta: 'raices', valores: { metodo: 'biseccion', modelo: 'polinomio', coef: '1, 0, -2, 2', a: '-3', b: '-1' } } },
      ],
    },
    verificar: <>Prueba Newton con polinomio <code>1, 0, -2, 2</code> y x₀ = 0: se informa «sin convergencia».</>,
    solucion: <>
      <p><M tex="f'(x)=3x^2-2" />. <M tex="x_1=0-\frac{2}{-2}=1" />, <M tex="x_2=1-\frac{1}{1}=0" />, <M tex="x_3=1" />…</p>
      <p>Las iteraciones <strong>alternan 0 ↔ 1</strong> (ciclo de periodo 2). El cambio es siempre 1, así que nunca baja de la tolerancia y el programa agota el máximo de iteraciones, que se informa como «sin convergencia», no como éxito. Remedio: otro <M tex="x_0" /> o bisección en un intervalo con cambio de signo (la raíz real está cerca de <M tex="-1.77" />).</p>
    </>,
  },
  {
    id: 'abi-e4', nivel: 'Avanzado', titulo: 'Mal punto inicial: ¿Newton o un plan híbrido?',
    enunciado: <p>Con <M tex="f(x)=x^3-x-2" /> aplica Newton desde <M tex="x_0=0" /> (cuatro pasos) y compáralo con partir de <M tex="x_0=1.5" />. Concluye qué harías si no conoces un buen <M tex="x_0" />.</p>,
    plan: {
      pregunta: 'sin un buen x₀, ¿cuál es tu plan?',
      opciones: [
        { id: 'n0', texto: 'Newton desde x₀ = 0 y confiar', veredicto: 'inadecuado', razon: 'Converge, pero tras un recorrido errático (31 iteraciones frente a 3): el punto inicial está cerca de donde f′ casi se anula.', preset: { herramienta: 'raices', valores: { metodo: 'newton', x0: '0' } } },
        { id: 'hibrido', texto: 'Unas bisecciones en [1, 2] y luego Newton', veredicto: 'adecuado', razon: 'La bisección garantiza acotar la raíz; Newton desde ahí converge en pocos pasos: seguridad y velocidad.', preset: { herramienta: 'raices', valores: { metodo: 'biseccion', a: '1', b: '2', tol: '0.01' } } },
        { id: 'sec', texto: 'Secante con 1 y 2', veredicto: 'adecuado', razon: 'Sin derivada y con puntos que rodean la raíz converge rápido.', preset: { herramienta: 'raices', valores: { metodo: 'secante', p0: '1', p1: '2' } } },
      ],
    },
    verificar: <>Prueba la calculadora con Newton: x₀ = 0 y x₀ = 1.5.</>,
    solucion: <>
      <p>Desde <M tex="x_0=0" />: <M tex="x_1=-2,\; x_2=-1.2727,\; x_3=-0.5501,\; x_4=-18.10" />. La derivada <M tex="f'(x)=3x^2-1" /> es negativa en 0 y casi se anula cerca de <M tex="x=\pm0.577" />, lo que lanza la iteración lejos de la raíz (que está en 1.5214). Con tolerancia 10⁻⁶ necesita <strong>31 iteraciones</strong> en total.</p>
      <p>Desde <M tex="x_0=1.5" /> converge en <strong>3 iteraciones</strong>.</p>
      <p><strong>Conclusión:</strong> sin un buen <M tex="x_0" /> conviene acotar con bisección o secante en un intervalo con cambio de signo (garantizada, lenta) y refinar con Newton desde ahí.</p>
    </>,
  },
]

export const PREGUNTAS_ABIERTOS: Pregunta[] = [
  {
    id: 'abi-q1', tipo: 'opcion', enunciado: '¿Cuál de estas situaciones hace fallar a Newton de forma directa?',
    opciones: ['f′(xₙ) = 0', 'f(xₙ) < 0', 'x₀ negativo siempre', 'tolerancia demasiado grande'], correcta: 0,
    explicacion: 'Se divide entre f′(xₙ); el programa lo informa como derivada nula.',
    porOpcion: ['Correcto: la fórmula xₙ − f/f′ no está definida.', 'El signo de f no importa: Newton funciona con f negativa o positiva.', 'No hay restricción de signo en x₀.', 'Una tolerancia grande solo detiene antes la iteración; no provoca un fallo del método.'],
    profundiza: 'Además de f′ = 0 exacta, el portal rechaza |f′| < 10⁻¹²: dividir entre algo tan pequeño produce saltos enormes. Cerca de esa situación Newton es inestable aunque no falle del todo.',
  },
  {
    id: 'abi-q2', tipo: 'numerica', enunciado: 'Newton para f(x) = x² − 9 con x₀ = 6: calcula x₁.', correcta: 3.75, tolerancia: 0.001,
    explicacion: 'x₁ = 6 − 27/12 = 3.75.',
    profundiza: 'f(6) = 27 y f′(6) = 12, así que el paso es 27/12 = 2.25. Observa que el siguiente iterado, 3.75, ya está mucho más cerca de la raíz 3 y que en cada paso el error se reduce más o menos al cuadrado.',
  },
  {
    id: 'abi-q3', tipo: 'vf', enunciado: 'Newton converge más rápido que bisección para cualquier valor inicial x₀.', correcta: false,
    explicacion: 'Es rápido solo cerca de una raíz simple; con mal x₀ puede divergir, ciclar o saltar a otra raíz.',
    profundiza: 'La «velocidad» de Newton es local. En el ejercicio 4 desde x₀ = 0 necesita 31 iteraciones frente a 20 de la bisección: peor que el método «lento».',
  },
  {
    id: 'abi-q4', tipo: 'vf', enunciado: 'La secante necesita calcular la derivada f′(x).', correcta: false,
    explicacion: 'Reemplaza f′(xₙ) por la pendiente de la recta que pasa por los dos últimos puntos.',
    profundiza: 'Ese es su atractivo: sirve cuando f′ no existe o es costosa. A cambio converge con orden ≈ 1.62 (la razón áurea) en lugar de 2, y necesita dos puntos iniciales.',
  },
  {
    id: 'abi-q5', tipo: 'opcion', enunciado: 'Que Newton tenga convergencia cuadrática significa que…',
    opciones: ['en cada iteración el error se reduce a la mitad', 'el número de cifras correctas se duplica aproximadamente en cada iteración', 'siempre converge en 2 iteraciones', 'el método usa una parábola'], correcta: 1,
    explicacion: 'Cerca de una raíz simple, el error eₙ₊₁ ≈ C·eₙ²: de 10⁻³ pasa a ~10⁻⁶ y luego a ~10⁻¹².',
    porOpcion: ['Reducir el error a la mitad es convergencia lineal (como la bisección).', 'Correcto: es el sentido práctico de «error al cuadrado».', 'No hay un número fijo de iteraciones; depende de x₀ y de la tolerancia.', 'El nombre habla del orden de convergencia, no de la forma del modelo (usa una recta tangente).'],
    profundiza: 'Esa propiedad vale para raíces simples. En una raíz doble (como x = 1 en (x−1)²(x−2)), f′ también se anula y la convergencia degrada a lineal.',
  },
  {
    id: 'abi-q6', tipo: 'numerica', enunciado: 'Secante para f(x) = x² − 2 con x₀ = 1 y x₁ = 2: calcula x₂.', correcta: 1.3333, tolerancia: 0.001,
    explicacion: 'x₂ = 2 − 2·(2 − 1)/(2 − (−1)) = 2 − 2/3 = 4/3 ≈ 1.3333.',
    profundiza: 'Observa que este primer paso coincide con el primer corte de la falsa posición en [1, 2]: la fórmula es la misma. La diferencia es qué puntos se conservan después: la secante usa siempre los dos últimos; la falsa posición, los que mantienen el cambio de signo.',
  },
]
