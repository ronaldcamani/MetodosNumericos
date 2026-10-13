import Matematica from '../../components/Matematica'
import type { Ejercicio } from '../../components/Ejercicios'
import type { Pregunta } from '../../core/autoevaluacion'

const M = Matematica

export const EJERCICIOS_M2: Ejercicio[] = [
  {
    id: 'm2-e1', nivel: 'Intermedio', titulo: 'Pivote pequeño',
    enunciado: <p>Resuelve por eliminación con pivoteo parcial <M tex="\begin{cases}0.0001x+y=1\\ x+y=2\end{cases}" /> (a mano, con pivoteo). ¿Por qué se intercambian las filas?</p>,
    verificar: <>Compruébalo con la calculadora de eliminación (tamaño 2 × 2).</>,
    solucion: <>
      <p>El mayor valor absoluto de la columna 1 es 1 (fila 2), no 0.0001: se intercambian filas. Con el pivote 1 el multiplicador es <M tex="m=0.0001" /> y queda <M tex="(1-0.0001)y=1-0.0002" />, es decir <M tex="y=\frac{0.9998}{0.9999}\approx0.99989999" />.</p>
      <p>Luego <M tex="x=2-y\approx1.00010001" />. Dividir entre un pivote pequeño habría producido multiplicadores enormes y amplificado el error de redondeo.</p>
    </>,
  },
  {
    id: 'm2-e2', nivel: 'Intermedio', titulo: 'Una iteración de Gauss-Seidel',
    enunciado: <p>Para <M tex="\begin{cases}4x+y=9\\ 2x+5y=13\end{cases}" /> haz dos iteraciones de Gauss-Seidel desde <M tex="x_0=(0,0)" /> y calcula el residuo <M tex="\|b-Ax\|_\infty" /> tras la primera.</p>,
    solucion: <>
      <p>Iteración 1: <M tex="x=9/4=2.25" />; <M tex="y=(13-2\cdot2.25)/5=1.7" />. Residuo: <M tex="b-Ax=(9-(4\cdot2.25+1.7),\;13-(2\cdot2.25+5\cdot1.7))=(-1.7,\,0)" />, luego <M tex="\|\cdot\|_\infty=1.7" />.</p>
      <p>Iteración 2: <M tex="x=(9-1.7)/4=1.825" />; <M tex="y=(13-2\cdot1.825)/5=1.87" />. (La solución exacta es <M tex="(16/9,\;17/9)\approx(1.7778,\,1.8889)" />: las iteraciones se acercan.)</p>
    </>,
  },
  {
    id: 'm2-e3', nivel: 'Avanzado', titulo: 'El orden de las ecuaciones decide la convergencia',
    enunciado: <p>Sea <M tex="\begin{cases}x+3y=4\\ 4x+y=5\end{cases}" /> (solución <M tex="(1,1)" />). Aplica dos iteraciones de Gauss-Seidel desde el origen en el orden dado y luego con las ecuaciones intercambiadas. Justifica con dominancia diagonal.</p>,
    verificar: <>En la calculadora de Gauss-Seidel compara «Tal como se escribió» y «Reordenar para dominancia diagonal».</>,
    solucion: <>
      <p><strong>Orden dado</strong> (no dominante: 1 &lt; 3 y 1 &lt; 4): <M tex="x=4-3y=4,\;y=5-4x=-11" />; después <M tex="x=37,\;y=-143" />. Diverge.</p>
      <p><strong>Intercambiando</strong> (<M tex="4x+y=5,\;x+3y=4" />, dominante: 4 &gt; 1 y 3 &gt; 1): <M tex="x=1.25,\;y=0.91667" />; luego <M tex="x=1.02083,\;y=0.99306" />. Converge a <M tex="(1,1)" />.</p>
      <p>La dominancia diagonal estricta es condición <em>suficiente</em>, no necesaria: si no se cumple no se puede asegurar nada, como aquí, donde el orden dado diverge.</p>
    </>,
  },
  {
    id: 'm2-e4', nivel: 'Avanzado', titulo: 'Sistemas singulares: sin solución o infinitas',
    enunciado: <p>Analiza <M tex="\begin{cases}x+2y=3\\ 2x+4y=b_2\end{cases}" /> para <M tex="b_2=6" /> y para <M tex="b_2=7" />. ¿Qué dicen la eliminación y Gauss-Seidel? ¿Basta mirar el residuo?</p>,
    verificar: <>Prueba ambos casos en las dos calculadoras: deben avisar de singularidad.</>,
    solucion: <>
      <p>La fila 2 es 2 × la fila 1 en los coeficientes, así que <M tex="\det A=0" />. Eliminando: el segundo pivote es 0.</p>
      <p>Con <M tex="b_2=6" /> la segunda ecuación es la primera multiplicada por 2: <strong>infinitas soluciones</strong> (toda la recta <M tex="x+2y=3" />). Con <M tex="b_2=7" /> es contradictoria: <strong>ninguna solución</strong>.</p>
      <p>El portal informa «singular» en ambos casos y no presenta un vector solución. El residuo no basta: en el primer caso Gauss-Seidel podría anularlo y devolver «una» solución entre infinitas, ocultando que no es única; por eso se comprueba el determinante antes de iterar.</p>
    </>,
  },
]

export const PREGUNTAS_M2: Pregunta[] = [
  { id: 'm2-q1', tipo: 'opcion', enunciado: '¿Para qué sirve el pivoteo parcial?',
    opciones: ['Para que el sistema sea simétrico', 'Para evitar pivotes nulos o pequeños que amplifican el error', 'Para que Gauss-Seidel converja siempre', 'Para reducir el tamaño del sistema'], correcta: 1,
    explicacion: 'Se elige el mayor |aᵢⱼ| de la columna como pivote, lo que evita dividir entre cero y limita multiplicadores grandes.' },
  { id: 'm2-q2', tipo: 'vf', enunciado: 'La dominancia diagonal estricta es condición necesaria para que Gauss-Seidel converja.', correcta: false,
    explicacion: 'Es suficiente, no necesaria: pueden existir sistemas no dominantes en los que igualmente converge.' },
  { id: 'm2-q3', tipo: 'numerica', enunciado: 'Para A = [[4,1,1],[1,5,1],[1,1,6]], b = (9,14,21), x₀ = 0: valor de x₂ tras la primera iteración de Gauss-Seidel.', correcta: 2.35, tolerancia: 0.0001,
    explicacion: 'x₁ = 9/4 = 2.25 y x₂ = (14 − 2.25)/5 = 2.35.' },
  { id: 'm2-q4', tipo: 'opcion', enunciado: '¿Qué criterio de parada usa Gauss-Seidel en este portal?',
    opciones: ['Que cambie el signo de x', '‖b − Ax‖∞ ≤ tolerancia', 'Que det(A) = 1', 'Un número fijo de 10 iteraciones'], correcta: 1,
    explicacion: 'Se usa el residuo en norma infinito, y agotar el máximo de iteraciones no se considera convergencia.' },
  { id: 'm2-q5', tipo: 'numerica', enunciado: 'Resuelve 2x + y = 5, x + 3y = 10. Indica el valor de y.', correcta: 3, tolerancia: 0.000001,
    explicacion: 'det = 5, x = (15 − 10)/5 = 1 y y = (20 − 5)/5 = 3.' },
  { id: 'm2-q6', tipo: 'vf', enunciado: 'Un sistema singular (det A = 0) nunca tiene solución.', correcta: false,
    explicacion: 'Puede no tener solución o tener infinitas, según el vector b.' },
]
