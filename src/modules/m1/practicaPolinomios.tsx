import Matematica from '../../components/Matematica'
import type { Ejercicio } from '../../components/Ejercicios'
import type { Pregunta } from '../../core/autoevaluacion'

const M = Matematica

export const EJERCICIOS_POLINOMIOS: Ejercicio[] = [
  {
    id: 'pol-e1', nivel: 'Intermedio', titulo: 'Horner a mano',
    enunciado: <p>Con el esquema de Horner calcula <M tex="p(3)" /> y <M tex="p'(3)" /> para <M tex="p(x)=2x^3-6x^2+2x-1" />. ¿Qué polinomio es el cociente al dividir por <M tex="(x-3)" />?</p>,
    solucion: <>
      <p>Primera división sintética (coeficientes 2, −6, 2, −1): <M tex="b=(2,\;-6+3\cdot2=0,\;2+3\cdot0=2,\;-1+3\cdot2=5)" />. Luego <strong>p(3) = 5</strong>.</p>
      <p>Segunda (sobre 2, 0, 2): <M tex="c=(2,\;0+3\cdot2=6,\;2+3\cdot6=20)" />. Luego <strong>p′(3) = 20</strong> (comprobación: <M tex="6\cdot9-12\cdot3+2=20" />).</p>
      <p>El cociente es <M tex="2x^2+0x+2=2x^2+2" /> con resto 5: <M tex="p(x)=(x-3)(2x^2+2)+5" />. Horner hizo 3 multiplicaciones por cada evaluación, sin calcular potencias.</p>
    </>,
  },
  {
    id: 'pol-e2', nivel: 'Intermedio', titulo: 'Deflación y fórmula cuadrática',
    enunciado: <p>Se sabe que <M tex="r=1" /> es raíz de <M tex="p(x)=x^3-6x^2+11x-6" />. Deflaciona y halla las otras raíces.</p>,
    verificar: <>Compruébalo en la calculadora con el método «Todas las raíces» y coeficientes <code>1, -6, 11, -6</code>.</>,
    solucion: <>
      <p>Horner con <M tex="r=1" />: <M tex="(1,\;-6+1=-5,\;11-5=6,\;-6+6=0)" />. El resto es 0 (confirma que 1 es raíz) y el cociente es <M tex="x^2-5x+6" />.</p>
      <p>Fórmula cuadrática: <M tex="x=\dfrac{5\pm\sqrt{25-24}}{2}=\dfrac{5\pm1}{2}" />, es decir <M tex="x=2" /> y <M tex="x=3" />. Las raíces son <M tex="1,\,2,\,3" />.</p>
    </>,
  },
  {
    id: 'pol-e3', nivel: 'Avanzado', titulo: 'Cuántas raíces reales tiene x³ − x − 2',
    enunciado: <p>Para <M tex="p(x)=x^3-x-2" /> acota las raíces con Cauchy, justifica que hay exactamente una raíz real y calcula las otras dos con la deflación.</p>,
    verificar: <>Usa «Todas las raíces» con <code>1, 0, -1, -2</code>.</>,
    solucion: <>
      <p><strong>Cota:</strong> <M tex="|r|\le1+\max(0,1,2)=3" />: todas las raíces están en el disco de radio 3.</p>
      <p><strong>Raíces reales:</strong> <M tex="p(1)=-2<0<p(2)=4" />, hay al menos una en <M tex="(1,2)" />. El discriminante <M tex="-4(-1)^3-27(-2)^2=4-108=-104<0" /> indica una raíz real y un par de complejas conjugadas.</p>
      <p><strong>Deflación:</strong> con <M tex="r\approx1.5214" /> el cociente es <M tex="x^2+1.5214x+1.3146" /> y su fórmula cuadrática da <M tex="-0.7607\pm0.8579\,i" /> (módulo <M tex="1.147\le3" />, dentro de la cota).</p>
    </>,
  },
  {
    id: 'pol-e4', nivel: 'Avanzado', titulo: 'Raíz doble: Newton se vuelve lento',
    enunciado: <p>Sea <M tex="p(x)=(x-1)^2(x-2)=x^3-4x^2+5x-2" />. Aplica Newton desde <M tex="x_0=0.5" /> (tolerancia <M tex="10^{-10}" />) y compara el número de iteraciones con partir de <M tex="x_0=3" /> hacia la raíz simple. Explica la diferencia.</p>,
    plan: {
      pregunta: 'para obtener las tres raíces de p(x), ¿qué plan elegirías?',
      opciones: [
        { id: 'newton', texto: 'Newton desde 0.5 y desde 3', veredicto: 'posible', razon: 'Funciona, pero hacia la raíz doble la convergencia es lineal (decenas de iteraciones) y no te dice que x = 1 es doble.', preset: { herramienta: 'raices', valores: { metodo: 'newton', modelo: 'polinomio', coef: '1, -4, 5, -2', x0: '0.5', tol: '1e-10' } } },
        { id: 'horner', texto: 'Newton–Horner con deflación', veredicto: 'adecuado', razon: 'Halla las tres raíces (1 dos veces y 2) y muestra la deflación; la multiplicidad aparece como raíz repetida.', preset: { herramienta: 'raices', valores: { metodo: 'todas', modelo: 'polinomio', coef: '1, -4, 5, -2', tol: '1e-10' } } },
        { id: 'biseccion', texto: 'Bisección buscando cambios de signo', veredicto: 'inadecuado', razon: 'En x = 1 el polinomio toca el eje sin cambiar de signo: la bisección no la detecta.', preset: { herramienta: 'raices', valores: { metodo: 'biseccion', modelo: 'polinomio', coef: '1, -4, 5, -2', a: '0.5', b: '1.5' } } },
      ],
    },
    solucion: <>
      <p>Desde <M tex="x_0=3" /> (raíz simple en 2) Newton necesita <strong>8</strong> iteraciones; desde <M tex="x_0=0.5" /> (raíz doble en 1) necesita <strong>unas treinta</strong>, y el cambio entre iteraciones se reduce solo a la mitad en cada paso.</p>
      <p>En una raíz doble <M tex="p(1)=p'(1)=0" />: Newton pierde la convergencia cuadrática y se vuelve <strong>lineal</strong> (razón 1/2). Además p no cambia de signo en x = 1, por lo que la bisección tampoco sirve para esa raíz.</p>
      <p>Para una raíz de multiplicidad <M tex="m" /> existe el Newton modificado <M tex="x_{n+1}=x_n-m\,p/p'" /> que recupera la velocidad. Aquí la deflación halla <M tex="1,1,2" /> y la verificación con el residuo relativo confirma cada raíz.</p>
    </>,
  },
]

export const PREGUNTAS_POLINOMIOS: Pregunta[] = [
  {
    id: 'pol-q1', tipo: 'opcion', enunciado: '¿Para qué sirve el esquema de Horner?',
    opciones: ['Para resolver sistemas lineales', 'Para evaluar p(x) y p′(x) con pocas multiplicaciones, y dividir por (x − r)', 'Para acotar el error de bisección', 'Para derivar numéricamente cualquier función'], correcta: 1,
    explicacion: 'Con n multiplicaciones evalúa un polinomio de grado n; la segunda pasada da p′ y la primera fila contiene el cociente de la deflación.',
    porOpcion: ['Los sistemas lineales se resuelven con eliminación gaussiana (tema «Sistemas de ecuaciones lineales»).', 'Correcto: evaluación, derivada y división sintética en un solo esquema.', 'La cota de la bisección es (b − a)/2ⁿ y no usa Horner.', 'Solo sirve para polinomios.'],
    profundiza: 'Evaluar aₙxⁿ + … sumando potencias requiere ~n²/2 multiplicaciones; Horner reduce a n y además es más estable numéricamente al no calcular potencias grandes.',
  },
  {
    id: 'pol-q2', tipo: 'vf', enunciado: 'Un polinomio de coeficientes reales con una raíz compleja a + bi (b ≠ 0) tiene también la raíz a − bi.', correcta: true,
    explicacion: 'Las raíces complejas de un polinomio real aparecen en pares conjugados.',
    profundiza: 'Por eso un polinomio de grado impar con coeficientes reales siempre tiene al menos una raíz real: las complejas no pueden ser un número impar.',
  },
  {
    id: 'pol-q3', tipo: 'numerica', enunciado: 'Con Horner, calcula p(2) para p(x) = x³ − x − 2.', correcta: 4, tolerancia: 0.000001,
    explicacion: 'b = (1, 0 + 2·1 = 2, −1 + 2·2 = 3, −2 + 2·3 = 4): p(2) = 4.',
    profundiza: 'Los coeficientes (1, 2, 3) de la primera fila son el cociente x² + 2x + 3 al dividir por (x − 2); el resto es 4. La segunda pasada da p′(2) = 11.',
  },
  {
    id: 'pol-q4', tipo: 'opcion', enunciado: '¿Qué es la deflación?',
    opciones: ['Reducir el grado del polinomio dividiéndolo por (x − r) una vez hallada una raíz r', 'Disminuir la tolerancia', 'Evaluar el polinomio en un número menor', 'Cambiar el punto inicial de Newton'], correcta: 0,
    explicacion: 'Tras hallar r, se busca en el cociente, de grado menor, que conserva las demás raíces.',
    porOpcion: ['Correcto.', 'La tolerancia es un parámetro de parada, sin relación.', 'No se trata de evaluar.', 'Es independiente del punto inicial.'],
    profundiza: 'Riesgo: el error de cada raíz se arrastra a los cocientes. Por eso el portal pule cada raíz sobre el polinomio original y verifica con el residuo relativo.',
  },
  {
    id: 'pol-q5', tipo: 'numerica', enunciado: 'Cota de Cauchy para las raíces de x³ − 6x² + 11x − 6: valor de 1 + máx|aᵢ/aₙ|.', correcta: 12, tolerancia: 0,
    explicacion: 'Los cocientes |aᵢ/aₙ| son 6, 11 y 6: el máximo es 11 y la cota es 12.',
    profundiza: 'La cota es holgada (las raíces son 1, 2 y 3), pero es segura y barata: sirve como punto de partida para Newton–Horner y como intervalo de búsqueda.',
  },
  {
    id: 'pol-q6', tipo: 'vf', enunciado: 'Newton conserva la convergencia cuadrática en una raíz doble.', correcta: false,
    explicacion: 'En una raíz doble p′ también se anula y la convergencia se vuelve lineal.',
    profundiza: 'Se reconoce porque el cambio entre iteraciones se reduce solo a la mitad en cada paso. El Newton modificado xₙ − m·p/p′ (con m la multiplicidad) recupera el orden cuadrático.',
  },
]
