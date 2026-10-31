import Matematica from '../../components/Matematica'
import type { Ejercicio } from '../../components/Ejercicios'
import type { Pregunta } from '../../core/autoevaluacion'

const M = Matematica

export const EJERCICIOS_ERRORES: Ejercicio[] = [
  {
    id: 'err-e1', nivel: 'Intermedio', titulo: 'Error absoluto, relativo y cifras correctas',
    enunciado: <p>Se aproxima <M tex="\pi=3.14159265\ldots" /> por <M tex="22/7\approx3.142857" />. Calcula el error absoluto, el relativo (en %) y las cifras significativas correctas. ¿Y si se hubiera aproximado 100 por 99.5?</p>,
    verificar: <>Compruébalo con la herramienta «Error de una aproximación».</>,
    solucion: <>
      <p><M tex="E_{abs}=|3.14159265-3.14285714|\approx1.2645\times10^{-3}" />; <M tex="E_{rel}=1.2645\times10^{-3}/3.14159\approx4.025\times10^{-4}" />, es decir <strong>0.04025 %</strong>.</p>
      <p>Cifras: <M tex="m=0" /> y <M tex="E_{abs}=0.0012645<0.5\cdot10^{0-n+1}" /> se cumple para <M tex="n=3" /> (<M tex="0.005" />) pero no para <M tex="n=4" /> (<M tex="0.0005" />): <strong>3 cifras correctas</strong>, «3.14».</p>
      <p>Con 100 y 99.5: <M tex="E_{abs}=0.5" /> y <M tex="E_{rel}=0.5\%" />. Un error absoluto de 0.5 es pequeño en relación con 100 pero sería enorme si el valor verdadero fuera 1 (50 %): <em>el error relativo da la escala</em>.</p>
    </>,
  },
  {
    id: 'err-e2', nivel: 'Intermedio', titulo: 'Redondeo frente a truncamiento',
    enunciado: <p>Expresa <M tex="8/3=2.6666\ldots" /> con 3 cifras significativas por redondeo y por truncamiento. Calcula el error absoluto de cada uno y explica cuál suele ser menor.</p>,
    verificar: <>Prueba «Aritmética de t cifras»: a = 8, op ÷, b = 3, t = 3, en ambos modos.</>,
    solucion: <>
      <p>Redondeo: <M tex="2.67" />, con <M tex="E_{abs}\approx3.3\times10^{-3}" />. Truncamiento: <M tex="2.66" />, con <M tex="E_{abs}\approx6.7\times10^{-3}" />.</p>
      <p>El truncamiento descarta cifras sin mirar la siguiente y su error puede llegar a una unidad de la última cifra conservada (<M tex="10^{-2}" />); el redondeo se equivoca a lo sumo la mitad (<M tex="0.5\cdot10^{-2}" />) y no tiene sesgo sistemático. Por eso el error del truncamiento es en promedio el doble.</p>
    </>,
  },
  {
    id: 'err-e3', nivel: 'Avanzado', titulo: 'Cancelación catastrófica: √(x+1) − √x',
    enunciado: <p>Con <M tex="x=10000" /> y aritmética de 4 cifras significativas, calcula <M tex="\sqrt{x+1}-\sqrt{x}" /> usando <M tex="\sqrt{10001}=100.004999875" /> y <M tex="\sqrt{10000}=100" />. El valor verdadero es <M tex="0.0049999875" />. Decide cómo lo calcularías con precisión.</p>,
    plan: {
      pregunta: '¿cómo calcularías √(x+1) − √x para x grande?',
      opciones: [
        { id: 'directo', texto: 'Restar directamente las dos raíces', veredicto: 'inadecuado', razon: 'Son casi iguales: con 4 cifras ambas valen 100.0 y la resta da 0, error relativo del 100 %. Es la cancelación catastrófica.', preset: { herramienta: 'operacion', valores: { a: '100.00499987500625', op: '−', b: '100', t: '4', modo: 'redondeo' } } },
        { id: 'conjugado', texto: 'Multiplicar y dividir por el conjugado: 1 / (√(x+1) + √x)', veredicto: 'adecuado', razon: 'La suma de dos números positivos no cancela; el resultado conserva casi todas las cifras.', preset: { herramienta: 'operacion', valores: { a: '1', op: '÷', b: '200.00499987500625', t: '4', modo: 'redondeo' } } },
        { id: 'mas', texto: 'Usar más cifras (t = 12)', veredicto: 'posible', razon: 'Mejora el resultado, pero solo posterga el problema: con x mayor la cancelación reaparece. Es mejor reformular la expresión.', preset: { herramienta: 'operacion', valores: { a: '100.00499987500625', op: '−', b: '100', t: '12', modo: 'redondeo' } } },
      ],
    },
    solucion: <>
      <p><strong>Directo.</strong> Con 4 cifras, <M tex="\sqrt{10001}\to100.0" /> y <M tex="\sqrt{10000}=100.0" />: la resta da <M tex="0" />, error relativo <strong>100 %</strong>. Se perdieron todas las cifras significativas.</p>
      <p><strong>Reformulado.</strong> <M tex="\sqrt{x+1}-\sqrt x=\dfrac{1}{\sqrt{x+1}+\sqrt x}" />. Con 4 cifras el denominador es <M tex="100.0+100.0=200.0" /> y el resultado <M tex="1/200.0=0.005000" />, con error relativo <M tex="\approx2.5\times10^{-5}" />: <strong>cuatro cifras correctas</strong> en lugar de ninguna.</p>
      <p>Las dos expresiones son idénticas matemáticamente; solo cambia su <em>estabilidad numérica</em>. Restar números casi iguales es lo que hay que evitar.</p>
    </>,
  },
  {
    id: 'err-e4', nivel: 'Avanzado', titulo: 'El orden de una suma cambia el error',
    enunciado: <p>Se suman 1 y tres veces <M tex="0.0004" /> en aritmética de 4 cifras con truncamiento. Compara el resultado al sumar en el orden dado y de menor a mayor.</p>,
    plan: {
      pregunta: '¿en qué orden sumarías?',
      opciones: [
        { id: 'mayor', texto: 'De mayor a menor (1 primero)', veredicto: 'inadecuado', razon: 'Al sumar 0.0004 a 1 el resultado supera la última cifra conservada y el sumando pequeño se pierde, tres veces seguidas.', preset: { herramienta: 'suma', valores: { lista: '1, 0.0004, 0.0004, 0.0004', t: '4', modo: 'truncamiento' } } },
        { id: 'menor', texto: 'De menor a mayor', veredicto: 'adecuado', razon: 'Los pequeños se acumulan entre sí (0.0012) antes de sumarse al grande, y su contribución sobrevive.', preset: { herramienta: 'suma', valores: { lista: '1, 0.0004, 0.0004, 0.0004', t: '4', modo: 'truncamiento' } } },
        { id: 'cualquiera', texto: 'Da igual: la suma es asociativa', veredicto: 'inadecuado', razon: 'La suma es asociativa en los reales, no en aritmética de precisión finita.' },
      ],
    },
    solucion: <>
      <p><strong>Orden dado:</strong> <M tex="1+0.0004=1.0004\to1.000" /> (4 cifras, truncado), y lo mismo en las otras dos sumas: resultado <M tex="1.000" />, error <M tex="0.0012" />.</p>
      <p><strong>De menor a mayor:</strong> <M tex="0.0004+0.0004=0.0008" />, <M tex="+0.0004=0.0012" />, <M tex="+1=1.0012\to1.001" />: error <M tex="0.0002" />, seis veces menor.</p>
      <p>En aritmética de precisión finita la suma <strong>no es asociativa</strong>: el orden importa. Para listas largas se usan además algoritmos compensados (suma de Kahan).</p>
    </>,
  },
]

export const PREGUNTAS_ERRORES: Pregunta[] = [
  {
    id: 'err-q1', tipo: 'opcion', enunciado: 'Una medición de 78 ms se compara con el valor real de 80 ms. ¿Qué agrega el error relativo (2.5 %) al error absoluto (2 ms)?',
    opciones: ['Nada: son lo mismo', 'La escala: compara el error con el tamaño de la cantidad medida', 'Siempre es mayor que el absoluto', 'Permite calcular la raíz de f'], correcta: 1,
    explicacion: 'Un error de 2 ms es pequeño si se mide 1 s y enorme si se mide 4 ms; el error relativo expresa esa proporción.',
    porOpcion: ['Son distintos: el absoluto tiene unidades, el relativo no.', 'Correcto: es adimensional y permite comparar mediciones de escalas diferentes.', 'Puede ser menor o mayor según el valor verdadero (mayor si |x| < 1).', 'No tiene relación con las raíces.'],
    profundiza: 'Si el valor verdadero es 0 el error relativo no está definido; en ese caso se usa solo el error absoluto. El error porcentual es el relativo multiplicado por 100.',
  },
  {
    id: 'err-q2', tipo: 'vf', enunciado: 'Si |f(x̃)| es muy pequeño, entonces x̃ está necesariamente muy cerca de la raíz.', correcta: false,
    explicacion: 'Depende de la pendiente: con f muy plana, un residuo pequeño puede convivir con un error grande en x.',
    profundiza: 'Ejemplo: f(x) = (x − 1)¹⁰. En x = 1.5 vale 0.00098, pequeño, y sin embargo x dista 0.5 de la raíz. Por eso las calculadoras de raíces distinguen el residuo del error y verifican la raíz.',
  },
  {
    id: 'err-q3', tipo: 'numerica', enunciado: 'Error relativo porcentual (en %) al aproximar 10 por 9.9.', correcta: 1, tolerancia: 0.000001,
    explicacion: '|10 − 9.9| / 10 = 0.01, es decir 1 %.',
    profundiza: 'Se divide entre el valor verdadero (10), no entre el aproximado. Si dividieras entre 9.9 obtendrías 1.0101 %, un resultado ligeramente distinto.',
  },
  {
    id: 'err-q4', tipo: 'opcion', enunciado: 'Aproximar eˣ con los primeros 5 términos de su serie de Maclaurin introduce principalmente un error de…',
    opciones: ['redondeo', 'truncamiento', 'de entrada (datos inexactos)', 'ninguno: la serie es exacta'], correcta: 1,
    explicacion: 'Se corta una serie infinita: es error de truncamiento, y baja al añadir términos.',
    porOpcion: ['El redondeo proviene de representar números con cifras finitas, no de cortar una serie.', 'Correcto.', 'Los datos (x) pueden ser exactos; el error aquí no viene de ellos.', 'Solo la serie completa (infinitos términos) es exacta.'],
    profundiza: 'El error de truncamiento se acota con el término de Lagrange (cota ≈ eˣ·|x|ⁿ/n!). A la vez, al sumar en doble precisión aparece un error de redondeo, minúsculo comparado con el de truncamiento hasta que n es grande.',
  },
  {
    id: 'err-q5', tipo: 'numerica', enunciado: '¿Cuántas cifras significativas correctas tiene 3.1416 como aproximación de π? (entero)', correcta: 5, tolerancia: 0,
    explicacion: 'E_abs ≈ 7.3·10⁻⁶ < 0.5·10⁻⁴ (n = 5) pero no < 0.5·10⁻⁵ (n = 6), luego 5 cifras.',
    profundiza: 'Hay que contar cifras correctas, no cifras escritas: 3.1416 tiene 5 cifras y las 5 son correctas, mientras que 3.1415 tendría 4 cifras correctas porque su error (9.3·10⁻⁵) supera 0.5·10⁻⁴.',
  },
  {
    id: 'err-q6', tipo: 'vf', enunciado: 'En aritmética de t cifras la suma es asociativa: (a + b) + c da siempre lo mismo que a + (b + c).', correcta: false,
    explicacion: 'Cada suma parcial se redondea; el orden decide qué cifras se pierden (p. ej. 1000 + 0.4 + 0.4 con 4 cifras).',
    profundiza: 'Con 4 cifras (redondeo): (1000 + 0.4) + 0.4 = 1000, pero 1000 + (0.4 + 0.4) = 1001. Valor exacto: 1000.8. Sumar de menor a mayor suele reducir el error.',
  },
]
