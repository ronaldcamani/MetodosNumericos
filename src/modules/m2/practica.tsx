import Matematica from '../../components/Matematica'
import type { Ejercicio } from '../../components/Ejercicios'
import type { Pregunta } from '../../core/autoevaluacion'
import { EJERCICIO_3 } from './ejercicios'
import { presetSistema } from './paginas'

const M = Matematica

/* ---------- Planteo y decisión ---------- */
export const EJERCICIOS_DECISION_SISTEMAS: Ejercicio[] = [
  {
    id: 'sis-d1', nivel: 'Intermedio', titulo: 'Elegir el método para el sistema de demanda',
    enunciado: (
      <p>
        Se estima la demanda de tres servicios con <M tex="A=\begin{pmatrix}4&1&1\\1&5&1\\1&1&6\end{pmatrix}" /> y <M tex="b=(9,14,21)" />. Antes de calcular, decide cómo lo resolverás.
      </p>
    ),
    plan: {
      pregunta: '¿qué método usarás?',
      opciones: [
        { id: 'gauss', texto: 'Eliminación con pivoteo parcial', veredicto: 'adecuado', razon: 'Sistema pequeño y no singular: la eliminación da la solución exacta (salvo redondeo) en un número fijo de pasos.', preset: presetSistema('gauss', [[4, 1, 1], [1, 5, 1], [1, 1, 6]], [9, 14, 21]) },
        { id: 'gs', texto: 'Gauss-Seidel', veredicto: 'adecuado', razon: 'La matriz es diagonalmente dominante (4 > 2, 5 > 2, 6 > 2): converge para cualquier vector inicial. Para n = 3 no ahorra nada, pero sirve de contraste.', preset: presetSistema('gs', [[4, 1, 1], [1, 5, 1], [1, 1, 6]], [9, 14, 21]) },
        { id: 'inversa', texto: 'Calcular A⁻¹ y multiplicar por b', veredicto: 'inadecuado', razon: 'Calcular la inversa cuesta más que resolver el sistema y acumula más error de redondeo: no es necesario para obtener x.' },
      ],
    },
    solucion: (
      <>
        <p><strong>Análisis.</strong> Es un sistema pequeño, no singular y diagonalmente dominante por filas. Ambos métodos sirven.</p>
        <p><strong>Plan.</strong> Eliminación con pivoteo parcial; contraste con Gauss-Seidel (tolerancia 10⁻⁶). Ambos dan <M tex="x=(1,2,3)" />; la primera iteración de Gauss-Seidel es <M tex="(2.25,\,2.35,\,2.7333)" />.</p>
        <p>La inversa no se calcula: resolver <M tex="Ax=b" /> directamente es más barato y más preciso.</p>
      </>
    ),
  },
  {
    id: 'sis-d2', nivel: 'Avanzado', titulo: 'Un sistema que no es dominante',
    enunciado: (
      <p>
        Para <M tex="A=\begin{pmatrix}0.4&1.1&3.1\\4&0.15&0.25\\2&5.6&3.1\end{pmatrix}" /> y <M tex="b=(7.5,\,4.45,\,0.1)" />, un compañero propone Gauss-Seidel desde <M tex="x_0=(1,1,1)" /> «porque converge más rápido». Decide tu plan.
      </p>
    ),
    plan: {
      pregunta: '¿cómo lo resolverías?',
      opciones: [
        { id: 'tal', texto: 'Gauss-Seidel con las ecuaciones tal como están', veredicto: 'inadecuado', razon: 'En ninguna fila el elemento diagonal domina: no hay garantía y aquí el método diverge.', preset: { herramienta: 'gs', valores: { ...EJERCICIO_3.sistema, tol: '0.0001', x01: '1', x02: '1', x03: '1', orden: 'tal_cual' } } },
        { id: 'reordenar', texto: 'Gauss-Seidel reordenando las ecuaciones', veredicto: 'adecuado', razon: 'Existe un orden de filas con dominancia diagonal estricta (filas 2, 3, 1): reordenar la hace converger a (1, −2, 3).', preset: { herramienta: 'gs', valores: { ...EJERCICIO_3.sistema, tol: '0.0001', x01: '1', x02: '1', x03: '1', orden: 'reordenar' } } },
        { id: 'gauss', texto: 'Eliminación con pivoteo parcial', veredicto: 'adecuado', razon: 'No depende de la dominancia: resuelve el sistema directamente.', preset: { herramienta: 'gauss', valores: { ...EJERCICIO_3.sistema } } },
      ],
    },
    solucion: (
      <>
        <p>Tal como está, ninguna fila es dominante (por ejemplo, la fila 1 tiene diagonal 0.4 frente a 1.1 + 3.1). Gauss-Seidel diverge.</p>
        <p>Reordenando las filas como (2, 3, 1) se obtiene dominancia diagonal estricta y el método converge a <M tex="(1,-2,3)" /> con tolerancia 10⁻⁴. La eliminación con pivoteo da la misma solución sin necesitar la dominancia.</p>
        <p><strong>Moral:</strong> la dominancia es una condición suficiente y no necesaria, pero conviene comprobarla <em>antes</em> de elegir un método iterativo.</p>
      </>
    ),
  },
  {
    id: 'sis-d3', nivel: 'Avanzado', titulo: 'Mediciones que se repiten: ¿singular?',
    enunciado: (
      <p>
        Dos ecuaciones del sistema provienen de la misma medición escalada: <M tex="x+2y=3" /> y <M tex="2x+4y=6" />. Alguien propone ejecutar Gauss-Seidel y «aceptar lo que dé». ¿Qué plan seguirías?
      </p>
    ),
    plan: {
      pregunta: '¿cómo trataría este sistema?',
      opciones: [
        { id: 'gs', texto: 'Gauss-Seidel y aceptar el resultado', veredicto: 'inadecuado', razon: 'Con det A = 0 no hay solución única; un método iterativo podría devolver «una» solución entre infinitas ocultando que no es única. El portal lo detecta antes de iterar.', preset: presetSistema('gs', [[1, 2], [2, 4]], [3, 6]) },
        { id: 'gauss', texto: 'Eliminación y analizar el pivote nulo', veredicto: 'adecuado', razon: 'El segundo pivote vale 0: el sistema es singular. El portal no entrega solución y tú analizas si es incompatible o tiene infinitas.', preset: presetSistema('gauss', [[1, 2], [2, 4]], [3, 6]) },
        { id: 'residuo', texto: 'Dar por buena cualquier solución con residuo cero', veredicto: 'inadecuado', razon: 'El residuo cero no distingue entre una solución única y una entre infinitas.' },
      ],
    },
    solucion: (
      <>
        <p>La segunda ecuación es el doble de la primera: <M tex="\det A=0" />. Con <M tex="b_2=6" /> hay <strong>infinitas soluciones</strong> (toda la recta <M tex="x+2y=3" />); con <M tex="b_2=7" /> no hay ninguna.</p>
        <p>La eliminación detecta el pivote nulo y el portal informa «singular» sin dar solución; el análisis posterior (compatible o no) lo hace quien resuelve.</p>
      </>
    ),
  },
]

export const PREGUNTAS_DECISION_SISTEMAS: Pregunta[] = [
  {
    id: 'sis-q1', tipo: 'opcion', enunciado: 'Un sistema 3 × 3 no es diagonalmente dominante. ¿Qué método es el más seguro?',
    opciones: ['Gauss-Seidel tal como está', 'Eliminación con pivoteo parcial', 'Gauss-Seidel con muchas iteraciones', 'Calcular la inversa a mano'], correcta: 1,
    explicacion: 'La eliminación con pivoteo no depende de la dominancia y resuelve el sistema en un número fijo de pasos.',
    porOpcion: ['Sin dominancia puede divergir.', 'Correcto.', 'Más iteraciones no arreglan una iteración que diverge.', 'La inversa es más cara y menos precisa que resolver el sistema.'],
    profundiza: 'La condición necesaria y suficiente para Gauss-Seidel es que el radio espectral de su matriz de iteración sea menor que 1; la dominancia diagonal es solo una forma fácil de garantizarlo.',
  },
  {
    id: 'sis-q2', tipo: 'vf', enunciado: 'Para sistemas grandes un método iterativo es siempre preferible a uno directo.', correcta: false,
    explicacion: 'Depende de que converja y de la estructura de la matriz: sin convergencia no sirve de nada.',
    profundiza: 'Los iterativos brillan con matrices grandes, dispersas y con buena convergencia (por ejemplo, dominantes). Con matrices densas o mal condicionadas un método directo bien implementado es más seguro.',
  },
  {
    id: 'sis-q3', tipo: 'opcion', enunciado: 'Si en la eliminación aparece un pivote nulo (o casi nulo) tras el pivoteo, el portal debe…',
    opciones: ['dividir de todos modos', 'declarar el sistema singular y no mostrar solución', 'cambiar los datos del usuario', 'devolver x = 0'], correcta: 1,
    explicacion: 'Un pivote nulo tras el pivoteo indica dependencia entre ecuaciones: no hay solución única.',
    porOpcion: ['Dividir entre cero produce valores no finitos.', 'Correcto.', 'No se modifican los datos del usuario sin avisar.', 'x = 0 no es solución en general.'],
    profundiza: 'Un pivote muy pequeño pero no nulo no se rechaza; se avisa de pérdida de precisión. Lo que importa es el tamaño del pivote relativo a la escala de los coeficientes.',
  },
  {
    id: 'sis-q4', tipo: 'numerica', enunciado: 'Residuo ‖b − Ax‖∞ para A = [[2,1],[1,3]], b = (3,5) y x = (1,1).', correcta: 1, tolerancia: 0.000001,
    explicacion: 'Ax = (3, 4), luego b − Ax = (0, 1) y su norma infinito es 1.',
    profundiza: 'La norma infinito es el mayor valor absoluto de las componentes. Un residuo distinto de cero indica que x no resuelve el sistema; uno pequeño solo asegura un error pequeño si la matriz está bien condicionada.',
  },
]

/* ---------- Métodos directos ---------- */
export const EJERCICIOS_DIRECTOS: Ejercicio[] = [
  {
    id: 'm2-e1', nivel: 'Intermedio', titulo: 'Pivote pequeño',
    enunciado: <p>Resuelve por eliminación con pivoteo parcial <M tex="\begin{cases}0.0001x+y=1\\ x+y=2\end{cases}" /> (a mano, con pivoteo). ¿Por qué se intercambian las filas?</p>,
    plan: {
      pregunta: 'con una máquina de pocas cifras, ¿cómo eliminarías?',
      opciones: [
        { id: 'sin', texto: 'Usar 0.0001 como pivote sin intercambiar', veredicto: 'inadecuado', razon: 'El multiplicador sería 10⁴: amplifica el error de redondeo y puede destruir las cifras de la solución.' },
        { id: 'con', texto: 'Intercambiar filas para pivotar con 1', veredicto: 'adecuado', razon: 'El mayor valor absoluto de la columna es 1; el multiplicador pasa a 10⁻⁴ y el error no se amplifica.', preset: presetSistema('gauss', [[0.0001, 1], [1, 1]], [1, 2]) },
      ],
    },
    verificar: <>Compruébalo con la calculadora de eliminación (tamaño 2 × 2).</>,
    solucion: <>
      <p>El mayor valor absoluto de la columna 1 es 1 (fila 2), no 0.0001: se intercambian filas. Con el pivote 1 el multiplicador es <M tex="m=0.0001" /> y queda <M tex="(1-0.0001)y=1-0.0002" />, es decir <M tex="y=\frac{0.9998}{0.9999}\approx0.99989999" />.</p>
      <p>Luego <M tex="x=2-y\approx1.00010001" />. Dividir entre un pivote pequeño habría producido multiplicadores enormes y amplificado el error de redondeo.</p>
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

export const PREGUNTAS_DIRECTOS: Pregunta[] = [
  {
    id: 'm2-q1', tipo: 'opcion', enunciado: '¿Para qué sirve el pivoteo parcial?',
    opciones: ['Para que el sistema sea simétrico', 'Para evitar pivotes nulos o pequeños que amplifican el error', 'Para que Gauss-Seidel converja siempre', 'Para reducir el tamaño del sistema'], correcta: 1,
    explicacion: 'Se elige el mayor |aᵢⱼ| de la columna como pivote, lo que evita dividir entre cero y limita multiplicadores grandes.',
    porOpcion: ['La simetría no depende del pivoteo: este solo reordena filas.', 'Correcto: evita dividir entre cero y limita los multiplicadores.', 'Gauss-Seidel es otro método y su convergencia no depende del pivoteo.', 'El tamaño del sistema no cambia al intercambiar filas.'],
    profundiza: 'Ejemplo: 0.0001x + y = 1, x + y = 2. Sin pivoteo el multiplicador es 10⁴ y con pocas cifras se pierde información; intercambiando filas el multiplicador es 10⁻⁴ y la solución sale bien. El pivoteo parcial es barato y hace al algoritmo prácticamente estable.',
  },
  {
    id: 'm2-q5', tipo: 'numerica', enunciado: 'Resuelve 2x + y = 5, x + 3y = 10. Indica el valor de y.', correcta: 3, tolerancia: 0.000001,
    explicacion: 'det = 5, x = (15 − 10)/5 = 1 y y = (20 − 5)/5 = 3.',
    profundiza: 'Comprueba sustituyendo: 2·1 + 3 = 5 y 1 + 3·3 = 10. Verificar el resultado en las ecuaciones originales es la forma más rápida de detectar un error de cálculo a mano.',
  },
  {
    id: 'm2-q6', tipo: 'vf', enunciado: 'Un sistema singular (det A = 0) nunca tiene solución.', correcta: false,
    explicacion: 'Puede no tener solución o tener infinitas, según el vector b.',
    profundiza: 'Ejemplo: x + 2y = 3 y 2x + 4y = 6 tienen infinitas soluciones (la segunda es el doble de la primera); con 2x + 4y = 7 son incompatibles. Por eso el portal comprueba la singularidad antes de iterar: un residuo cero no distingue una solución única de una entre infinitas.',
  },
]

/* ---------- Métodos iterativos ---------- */
export const EJERCICIOS_ITERATIVOS: Ejercicio[] = [
  {
    id: 'm2-e2', nivel: 'Intermedio', titulo: 'Una iteración de Gauss-Seidel',
    enunciado: <p>Para <M tex="\begin{cases}4x+y=9\\ 2x+5y=13\end{cases}" /> haz dos iteraciones de Gauss-Seidel desde <M tex="x_0=(0,0)" /> y calcula el residuo <M tex="\|b-Ax\|_\infty" /> tras la primera.</p>,
    verificar: <>Compruébalo en la calculadora de Gauss-Seidel (2 × 2, tolerancia pequeña).</>,
    solucion: <>
      <p>Iteración 1: <M tex="x=9/4=2.25" />; <M tex="y=(13-2\cdot2.25)/5=1.7" />. Residuo: <M tex="b-Ax=(9-(4\cdot2.25+1.7),\;13-(2\cdot2.25+5\cdot1.7))=(-1.7,\,0)" />, luego <M tex="\|\cdot\|_\infty=1.7" />.</p>
      <p>Iteración 2: <M tex="x=(9-1.7)/4=1.825" />; <M tex="y=(13-2\cdot1.825)/5=1.87" />. (La solución exacta es <M tex="(16/9,\;17/9)\approx(1.7778,\,1.8889)" />: las iteraciones se acercan.)</p>
    </>,
  },
  {
    id: 'm2-e3', nivel: 'Avanzado', titulo: 'El orden de las ecuaciones decide la convergencia',
    enunciado: <p>Sea <M tex="\begin{cases}x+3y=4\\ 4x+y=5\end{cases}" /> (solución <M tex="(1,1)" />). Aplica dos iteraciones de Gauss-Seidel desde el origen en el orden dado y luego con las ecuaciones intercambiadas. Justifica con dominancia diagonal.</p>,
    plan: {
      pregunta: 'antes de iterar, ¿qué harías con el sistema?',
      opciones: [
        { id: 'tal', texto: 'Iterar con las ecuaciones tal como están', veredicto: 'inadecuado', razon: 'No es dominante (1 < 3 y 1 < 4): las iteraciones se alejan de la solución.', preset: presetSistema('gs', [[1, 3], [4, 1]], [4, 5], { tol: '0.000001', maxIter: '100', orden: 'tal_cual', x01: '0', x02: '0' }) },
        { id: 'reordenar', texto: 'Intercambiar las ecuaciones y luego iterar', veredicto: 'adecuado', razon: 'Con 4x + y = 5 primero, el sistema es dominante (4 > 1 y 3 > 1) y converge a (1, 1).', preset: presetSistema('gs', [[1, 3], [4, 1]], [4, 5], { tol: '0.000001', maxIter: '100', orden: 'reordenar', x01: '0', x02: '0' }) },
        { id: 'gauss', texto: 'Eliminación con pivoteo parcial', veredicto: 'adecuado', razon: 'Resuelve directamente y no depende del orden.', preset: presetSistema('gauss', [[1, 3], [4, 1]], [4, 5]) },
      ],
    },
    verificar: <>En la calculadora de Gauss-Seidel compara «Tal como se escribió» y «Reordenar para dominancia diagonal».</>,
    solucion: <>
      <p><strong>Orden dado</strong> (no dominante: 1 &lt; 3 y 1 &lt; 4): <M tex="x=4-3y=4,\;y=5-4x=-11" />; después <M tex="x=37,\;y=-143" />. Diverge.</p>
      <p><strong>Intercambiando</strong> (<M tex="4x+y=5,\;x+3y=4" />, dominante: 4 &gt; 1 y 3 &gt; 1): <M tex="x=1.25,\;y=0.91667" />; luego <M tex="x=1.02083,\;y=0.99306" />. Converge a <M tex="(1,1)" />.</p>
      <p>La dominancia diagonal estricta es condición <em>suficiente</em>, no necesaria: si no se cumple no se puede asegurar nada, como aquí, donde el orden dado diverge.</p>
    </>,
  },
]

export const PREGUNTAS_ITERATIVOS: Pregunta[] = [
  {
    id: 'm2-q2', tipo: 'vf', enunciado: 'La dominancia diagonal estricta es condición necesaria para que Gauss-Seidel converja.', correcta: false,
    explicacion: 'Es suficiente, no necesaria: pueden existir sistemas no dominantes en los que igualmente converge.',
    profundiza: 'La condición necesaria y suficiente es que el radio espectral de la matriz de iteración sea menor que 1. La dominancia diagonal es solo una forma fácil de garantizarlo; por eso un sistema no dominante puede converger o no, y a veces basta reordenar las ecuaciones.',
  },
  {
    id: 'm2-q3', tipo: 'numerica', enunciado: 'Para A = [[4,1,1],[1,5,1],[1,1,6]], b = (9,14,21), x₀ = 0: valor de x₂ tras la primera iteración de Gauss-Seidel.', correcta: 2.35, tolerancia: 0.0001,
    explicacion: 'x₁ = 9/4 = 2.25 y x₂ = (14 − 2.25)/5 = 2.35.',
    profundiza: 'Gauss-Seidel usa de inmediato el x₁ recién calculado para obtener x₂. Jacobi, en cambio, usaría el x₁ anterior (0) y daría x₂ = 14/5 = 2.8. Esa reutilización es la diferencia entre ambos métodos.',
  },
  {
    id: 'm2-q4', tipo: 'opcion', enunciado: '¿Qué criterio de parada usa Gauss-Seidel en este portal?',
    opciones: ['Que cambie el signo de x', '‖b − Ax‖∞ ≤ tolerancia', 'Que det(A) = 1', 'Un número fijo de 10 iteraciones'], correcta: 1,
    explicacion: 'Se usa el residuo en norma infinito, y agotar el máximo de iteraciones no se considera convergencia.',
    porOpcion: ['El signo de x no tiene relación con la convergencia.', 'Correcto: es un criterio computable sin conocer la solución.', 'det(A) = 1 no es un criterio de parada.', 'Un número fijo de iteraciones no controla la calidad de la solución.'],
    profundiza: 'El residuo se calcula sin conocer la solución, por eso sirve de criterio de parada; el error ‖x − x*‖ no se conoce. Con una matriz mal condicionada un residuo pequeño puede convivir con un error grande, igual que en las ecuaciones no lineales.',
  },
]
