export type ModuloVideoId =
  | 'errores'
  | 'ecuaciones'
  | 'sistemas'
  | 'interpolacion'
  | 'integracion'
  | 'diferenciales'

export interface FilaTablaVideo {
  umbral: number
  celdas: string[]
  destacada?: boolean
}

export interface TablaVideo {
  titulo: string
  columnas: string[]
  filas: FilaTablaVideo[]
}

export interface EscenaVideo {
  id: string
  titulo: string
  duracion: number
  formulaTex: string
  pasosTex: string[]
  narracion: string
  notaClave: string
  visual: string
  tabla: TablaVideo
}

export interface LeccionVideo {
  modulo: ModuloVideoId
  titulo: string
  subtitulo: string
  escenas: EscenaVideo[]
}

const T = String.raw

export const LECCIONES_VIDEO: Record<ModuloVideoId, LeccionVideo> = {
  errores: {
    modulo: 'errores',
    titulo: 'Errores numéricos y aritmética de precisión finita',
    subtitulo: 'De la medición del error absoluto/relativo al truncamiento de Taylor y la cancelación',
    escenas: [
      {
        id: 'err-v1',
        titulo: '1. Planteo: medir la aproximación π ≈ 22/7',
        duracion: 18,
        formulaTex: T`x=\pi\approx 3.14159265,\qquad \tilde x=\frac{22}{7}\approx 3.14285714`,
        pasosTex: [
          T`\text{Problema: representar } \pi \text{ con fracción simple en memoria acotada}`,
          T`\text{Diferencia directa: } x-\tilde x = 3.14159265 - 3.14285714 = -0.00126449`,
          T`E_{abs}=|x-\tilde x|\approx 1.2645\times 10^{-3}\text{ (tiene las mismas unidades que } x\text{)}`,
        ],
        narracion:
          'Si un sistema con poca memoria aproxima el número pi mediante veintidós séptimos, medimos primero su distancia directa con el error absoluto, obteniendo uno punto dos seis cuatro cinco por diez elevado a la menos tres, es decir, cero punto cero cero uno dos seis cuatro cinco.',
        notaClave: 'El error absoluto conserva las unidades físicas del problema; por sí solo no indica si el fallo es grande o pequeño.',
        visual: 'err-medida',
        tabla: {
          titulo: 'Comparación inicial π vs 22/7',
          columnas: ['Magnitud', 'Expresión', 'Valor'],
          filas: [
            { umbral: 0, celdas: ['Exacto (π)', '3.14159265…', 'Referencia'] },
            { umbral: 0.3, celdas: ['Aproximado', '22 / 7', '3.14285714'] },
            { umbral: 0.65, celdas: ['E_abs', '|π − 22/7|', '1.2645×10⁻³'], destacada: true },
          ],
        },
      },
      {
        id: 'err-v2',
        titulo: '2. Error relativo, porcentual y cifras correctas',
        duracion: 20,
        formulaTex: T`E_{rel}=\frac{|x-\tilde x|}{|x|},\qquad E_{\%}=100\cdot E_{rel},\qquad E_{abs}<0.5\cdot 10^{m-n+1}`,
        pasosTex: [
          T`E_{rel}=\frac{1.2645\times 10^{-3}}{3.14159265}\approx 4.025\times 10^{-4}\;\Rightarrow\; E_{\%}\approx 0.04025\,\%`,
          T`\text{Criterio de Scarborough con } m=0:\; 0.0012645 < 0.5\cdot 10^{0-3+1}=0.005`,
          T`\text{Para } n=4:\; 0.0012645 \not< 0.0005 \;\Rightarrow\; 3\text{ cifras significativas correctas}`,
        ],
        narracion:
          'Como un milímetro importa distinto en un puente que en un microchip, dividimos el error absoluto entre el valor verdadero para hallar el error relativo, cercano a cero punto cero cuatro por ciento. Aplicando el criterio de Scarborough con cota cero punto cero cero cinco, confirmamos tres cifras significativas correctas.',
        notaClave: 'Si el valor verdadero es cero, el error relativo no existe y solo se reporta el error absoluto.',
        visual: 'err-medida',
        tabla: {
          titulo: 'Criterio de cifras correctas en π ≈ 22/7',
          columnas: ['n cifras', 'Cota 0.5·10^(1−n)', '¿Cumple E_abs?'],
          filas: [
            { umbral: 0, celdas: ['E_%', '0.04025 %', 'Escala relativa'] },
            { umbral: 0.35, celdas: ['n = 3', '0.00500', '✔ Sí (0.00126 < 0.005)'], destacada: true },
            { umbral: 0.7, celdas: ['n = 4', '0.00050', '✖ No (0.00126 > 0.0005)'] },
          ],
        },
      },
      {
        id: 'err-v3',
        titulo: '3. Primer paso numérico: truncar frente a redondear 8/3',
        duracion: 22,
        formulaTex: T`\text{Truncar: }\varepsilon_{rel}\le 10^{1-t},\qquad \text{Redondear: }\varepsilon_{rel}\le 0.5\cdot 10^{1-t}`,
        pasosTex: [
          T`x=\frac{8}{3}=2.66666\dots \quad (t=3\text{ cifras significativas})`,
          T`\text{Corte (truncar): conserva 3 cifras } \to 2.66 \;\Rightarrow\; E_{abs}=0.00667`,
          T`\text{Redondeo (cuarta cifra } 6\ge 5\text{): sube a } 2.67 \;\Rightarrow\; E_{abs}=0.00333`,
        ],
        narracion:
          'Ahora guardemos la fracción ocho tercios en una máquina decimal de solo tres cifras significativas. Si aplicamos truncamiento por corte, eliminamos los decimales sobrantes y queda dos punto sesenta y seis. En cambio, al redondear observamos que la cuarta cifra es seis, subimos a dos punto sesenta y siete y reducimos el error a la mitad.',
        notaClave: 'Truncar siempre subestima la magnitud e introduce sesgo sistemático; redondear divide a la mitad la cota máxima.',
        visual: 'err-corte',
        tabla: {
          titulo: 'Corte vs redondeo en 8/3 con t = 3',
          columnas: ['Regla', 'Resultado', 'E_abs', 'E_rel'],
          filas: [
            { umbral: 0, celdas: ['Exacto', '2.66667…', '0', '0 %'] },
            { umbral: 0.32, celdas: ['Corte', '2.66', '0.00667', '0.25 %'] },
            { umbral: 0.68, celdas: ['Redondeo', '2.67', '0.00333', '0.125 %'], destacada: true },
          ],
        },
      },
      {
        id: 'err-v4',
        titulo: '4. Truncamiento analítico: serie de Taylor de eˣ',
        duracion: 21,
        formulaTex: T`e^x \approx S_n(x)=\sum_{k=0}^{n-1}\frac{x^k}{k!},\qquad |R_n|\le \frac{e^{\max(0,x)}|x|^n}{n!}`,
        pasosTex: [
          T`x=1:\; S_1=1,\; S_2=2,\; S_3=1+1+\tfrac{1}{2}=2.5 \quad (E_{abs}\approx 0.2183)`,
          T`S_4=2.5+\tfrac{1}{6}=2.6667,\quad S_5=2.6667+\tfrac{1}{24}=2.7083\quad (E_{abs}\approx 0.00995)`,
          T`\text{Cota de Lagrange para } n=5:\; |R_5|\le\frac{e^1\cdot 1^5}{120}\approx 0.02265`,
        ],
        narracion:
          'Además del redondeo en registros, existe el error de truncamiento al cortar una serie infinita. Evaluando la serie de Taylor de la exponencial en uno, tres términos dan dos punto cinco y cinco términos alcanzan dos punto siete cero ocho tres. El error real baja a menos de una centésima y cumple la cota de Lagrange.',
        notaClave: 'Cada término factorial agregado reduce el error de truncamiento exponencialmente sin aumentar el error de entrada.',
        visual: 'err-taylor',
        tabla: {
          titulo: 'Sumas parciales de e¹ (exacto 2.71828)',
          columnas: ['n', 'S_n(1)', 'Error real', 'Cota Lagrange'],
          filas: [
            { umbral: 0, celdas: ['1', '1.0000', '1.7183', '2.7183'] },
            { umbral: 0.25, celdas: ['3', '2.5000', '0.2183', '0.4530'] },
            { umbral: 0.55, celdas: ['4', '2.6667', '0.0516', '0.1133'] },
            { umbral: 0.8, celdas: ['5', '2.7083', '0.00995', '0.02265'], destacada: true },
          ],
        },
      },
      {
        id: 'err-v5',
        titulo: '5. Trampa clásica: cancelación catastrófica',
        duracion: 15,
        formulaTex: T`a=0.12345,\quad b=0.12341 \quad (t=4\text{ cifras con redondeo})`,
        pasosTex: [
          T`\tilde a = 0.1235,\qquad \tilde b = 0.1234 \quad (\text{ambos válidos a 4 cifras})`,
          T`\tilde a - \tilde b = 0.0001 \quad \text{frente al valor exacto } a-b=0.00004`,
          T`E_{rel}=\frac{|0.00004-0.0001|}{0.00004}=1.5 \;\Rightarrow\; 150\,\%\text{ de error relativo}`,
        ],
        narracion:
          'Al restar dos números casi iguales redondeados a cuatro cifras, como cero punto uno dos tres cinco menos cero punto uno dos tres cuatro, se cancelan las cifras iniciales y el error relativo salta a ciento cincuenta por ciento.',
        notaClave: 'Reformula expresiones como √(x+1)−1 multiplicando por su conjugado para evitar restas casi nulas.',
        visual: 'err-cancelacion',
        tabla: {
          titulo: 'Cancelación en aritmética t = 4',
          columnas: ['Operando', 'Exacto', 'Redondeado t=4'],
          filas: [
            { umbral: 0, celdas: ['a', '0.12345', '0.1235'] },
            { umbral: 0.28, celdas: ['b', '0.12341', '0.1234'] },
            { umbral: 0.58, celdas: ['a − b', '0.00004', '0.0001'] },
            { umbral: 0.82, celdas: ['Error rel.', '0 %', '150 % (catastrófico)'], destacada: true },
          ],
        },
      },
      {
        id: 'err-v6',
        titulo: '6. Absorción y orden de la suma en coma flotante',
        duracion: 20,
        formulaTex: T`(1000+0.4)+0.4 \;\neq\; 1000+(0.4+0.4)\quad (t=4)`,
        pasosTex: [
          T`\text{Orden dado: } 1000+0.4=1000.4\xrightarrow{t=4} 1000 \;\Rightarrow\; 1000+0.4\to 1000`,
          T`\text{Orden creciente: } 0.4+0.4=0.8 \;\text{ y }\; 1000+0.8=1000.8\xrightarrow{t=4} 1001`,
          T`\text{Valor exacto } 1000.8:\; E_{crec}=0.2 \;\ll\; E_{dado}=0.8\text{ (4 veces menor)}`,
        ],
        narracion:
          'En el computador la suma deja de ser asociativa. Si sumamos mil más cero punto cuatro y luego otro cero punto cuatro con cuatro cifras, cada término pequeño es absorbido y el resultado queda clavado en mil. Sumando de menor a mayor, los pequeños se acumulan en cero punto ocho y el error cae cuatro veces.',
        notaClave: 'Ordenar sumandos por magnitud creciente o usar suma compensada de Kahan evita perder términos pequeños.',
        visual: 'err-suma',
        tabla: {
          titulo: 'No asociatividad de la suma (t = 4)',
          columnas: ['Estrategia', 'Calculado', 'Error absoluto'],
          filas: [
            { umbral: 0, celdas: ['Referencia exacta', '1000.8', '0.0'] },
            { umbral: 0.35, celdas: ['(1000 + 0.4) + 0.4', '1000', '0.8'] },
            { umbral: 0.72, celdas: ['1000 + (0.4 + 0.4)', '1001', '0.2 (4× menor)'], destacada: true },
          ],
        },
      },
      {
        id: 'err-v7',
        titulo: '7. Síntesis de estabilidad y consejos para el examen',
        duracion: 22,
        formulaTex: T`\varepsilon_{\text{máq}}\approx 2.22\times 10^{-16}\text{ (IEEE 754)},\qquad E_{\text{total}}\approx E_{\text{trunc}}+E_{\text{red}}`,
        pasosTex: [
          T`\text{Error de truncamiento: } \text{reduce al aumentar } n \text{ o afinar el paso } h`,
          T`\text{Error de redondeo: } \text{crece con } \text{operaciones mal condicionadas o } h\to 0`,
          T`\text{Regla de oro: } \text{sumar menor}\to\text{mayor, evitar } a-b\approx 0 \text{ y vigilar cifras}`,
        ],
        narracion:
          'Para cerrar el tema, recuerda distinguir las dos fuentes de error en todo algoritmo numérico. El truncamiento viene del modelo matemático aproximado y disminuye al refinar, mientras el redondeo nace de la precisión finita del hardware. En tu examen verifica siempre cifras correctas, evita restas casi iguales y suma de menor a mayor.',
        notaClave: 'Incluso en doble precisión de dieciséis dígitos, una mala formulación algebraica puede destruir todas las cifras válidas.',
        visual: 'err-taylor',
        tabla: {
          titulo: 'Diagnóstico rápido de errores',
          columnas: ['Síntoma', 'Causa probable', 'Solución'],
          filas: [
            { umbral: 0, celdas: ['Sesgo constante', 'Truncamiento / corte', 'Usar redondeo y mayor orden'] },
            { umbral: 0.35, celdas: ['Pérdida súbita de cifras', 'Cancelación a − b ≈ 0', 'Racionalizar o usar Taylor'] },
            { umbral: 0.7, celdas: ['Términos ignorados', 'Absorción en sumas', 'Ordenar de menor a mayor'], destacada: true },
          ],
        },
      },
    ],
  },

  ecuaciones: {
    modulo: 'ecuaciones',
    titulo: 'Ecuaciones no lineales y convergencia de métodos abiertos',
    subtitulo: 'De la garantía de Bisección a la velocidad de Newton-Raphson y Secante',
    escenas: [
      {
        id: 'ec-v1',
        titulo: '1. Planteamiento: calibrar f(x) = x³ − x − 2 = 0',
        duracion: 14,
        formulaTex: T`f(x)=x^3-x-2=0,\qquad \text{tolerancia }=10^{-6},\qquad x>0`,
        pasosTex: [
          T`\text{Contexto: despejar un parámetro no lineal donde no sirve despeje directo}`,
          T`\text{Polinomio continuo en } \mathbb{R}:\; f'(x)=3x^2-1`,
          T`\text{Meta: hallar la raíz positiva } r \text{ con error menor que } 10^{-6}`,
        ],
        narracion:
          'Para calibrar un parámetro sin despeje elemental resolvemos la ecuación cúbica efe de equis igual a equis al cubo menos equis menos dos igual a cero, buscando su raíz positiva con tolerancia de diez elevado a la menos seis.',
        notaClave: 'Toda búsqueda de raíces comienza escribiendo el problema en la forma estándar f(x) = 0.',
        visual: 'm1-problema',
        tabla: {
          titulo: 'Ficha del ejercicio de raíces',
          columnas: ['Elemento', 'Expresión / Valor', 'Propósito'],
          filas: [
            { umbral: 0, celdas: ['Ecuación', 'f(x) = x³ − x − 2', 'Función continua'] },
            { umbral: 0.35, celdas: ['Derivada', 'f′(x) = 3x² − 1', 'Pendiente para Newton'] },
            { umbral: 0.7, celdas: ['Tolerancia', '10⁻⁶', 'Criterio de parada'], destacada: true },
          ],
        },
      },
      {
        id: 'ec-v2',
        titulo: '2. Teorema de Bolzano: cambio de signo en [1, 2]',
        duracion: 22,
        formulaTex: T`f(1)=-2<0,\qquad f(2)=4>0 \;\Longrightarrow\; f(1)\cdot f(2)=-8<0`,
        pasosTex: [
          T`\text{Evaluamos extremo izquierdo: } f(1)=1^3-1-2=-2`,
          T`\text{Evaluamos extremo derecho: } f(2)=2^3-2-2=4`,
          T`\text{En } [1,2]\text{ la derivada } f'(x)=3x^2-1\ge 2>0 \text{ (raíz única)}`,
        ],
        narracion:
          'Antes de iterar verificamos las condiciones matemáticas. Evaluando en uno obtenemos menos dos, y al evaluar en dos resulta cuatro positivo. Como la función es continua y cambia de signo entre uno y dos, el teorema de Bolzano garantiza una raíz. Además su derivada es positiva en todo el tramo, asegurando unicidad.',
        notaClave: 'Nunca arranques un método cerrado sin comprobar continuidad y signo opuesto f(a)·f(b) < 0.',
        visual: 'm1-problema',
        tabla: {
          titulo: 'Exploración de signo en [1, 2]',
          columnas: ['x', 'f(x)', 'f′(x)', 'Lectura'],
          filas: [
            { umbral: 0, celdas: ['1.0', '−2.000', '+2.00', 'Extremo negativo'] },
            { umbral: 0.4, celdas: ['2.0', '+4.000', '+11.00', 'Extremo positivo'] },
            { umbral: 0.72, celdas: ['f(1)·f(2)', '−8 < 0', 'Monótona > 0', '✔ Raíz única en [1,2]'], destacada: true },
          ],
        },
      },
      {
        id: 'ec-v3',
        titulo: '3. Bisección: primera iteración y cota de pasos',
        duracion: 14,
        formulaTex: T`c_1=\frac{a_1+b_1}{2}=\frac{1+2}{2}=1.5,\qquad n\ge\left\lceil\log_2\!\left(\frac{b-a}{\text{tol}}\right)\right\rceil`,
        pasosTex: [
          T`k=1:\; c_1=1.5,\quad f(1.5)=1.5^3-1.5-2=-0.125<0`,
          T`f(1.5)<0 \text{ y } f(2)>0 \;\Rightarrow\; \text{nuevo intervalo } [1.5,\; 2]`,
          T`\text{Cota teórica para } 10^{-6}:\; n=\lceil\log_2(10^6)\rceil=20\text{ iteraciones}`,
        ],
        narracion:
          'En bisección dividimos el intervalo uno a dos por la mitad y hallamos uno punto cinco con valor negativo. Conservamos el tramo de uno punto cinco a dos y garantizamos convergencia segura en veinte iteraciones exactas.',
        notaClave: 'En bisección siempre sabes de antemano cuántas iteraciones exactas requiere una tolerancia dada.',
        visual: 'm1-biseccion',
        tabla: {
          titulo: 'Bisección: arranque en [1, 2]',
          columnas: ['k', '[a_k, b_k]', 'c_k', 'f(c_k)'],
          filas: [
            { umbral: 0, celdas: ['1', '[1.000, 2.000]', '1.5000', '−0.1250 (< 0)'] },
            { umbral: 0.45, celdas: ['2', '[1.500, 2.000]', '1.7500', '+1.6094 (> 0)'] },
            { umbral: 0.8, celdas: ['3', '[1.500, 1.750]', '1.6250', '+0.6660 (> 0)'], destacada: true },
          ],
        },
      },
      {
        id: 'ec-v4',
        titulo: '4. Newton-Raphson: primera tangente desde x₀ = 1.5',
        duracion: 23,
        formulaTex: T`x_1 = x_0 - \frac{f(x_0)}{f'(x_0)} = 1.5 - \frac{-0.125}{5.75}`,
        pasosTex: [
          T`\text{Partimos de } x_0=1.5:\; f(1.5)=-0.125`,
          T`\text{Calculamos la derivada: } f'(1.5)=3(1.5)^2-1=5.75`,
          T`x_1 = 1.5 + \frac{0.125}{5.75} = 1.5 + 0.0217391 = 1.5217391`,
        ],
        narracion:
          'Ahora aceleramos con Newton-Raphson partiendo desde equis sub cero igual a uno punto cinco. Evaluamos la función en menos cero punto ciento veinticinco y su derivada efe prima de equis en tres por uno punto cinco al cuadrado menos uno, igual a cinco punto setenta y cinco. Trazando la recta tangente cruzamos el eje equis en uno punto cinco dos uno siete tres nueve.',
        notaClave: 'Geométricamente, Newton reemplaza la curva por su recta tangente local en el punto actual.',
        visual: 'm1-newton',
        tabla: {
          titulo: 'Paso 1 de Newton-Raphson (x₀ = 1.5)',
          columnas: ['Cantidad', 'Cálculo', 'Valor'],
          filas: [
            { umbral: 0, celdas: ['x₀', 'Punto inicial', '1.5000000'] },
            { umbral: 0.3, celdas: ['f(x₀)', '1.5³ − 1.5 − 2', '−0.1250000'] },
            { umbral: 0.58, celdas: ['f′(x₀)', '3(1.5)² − 1', '5.7500000'] },
            { umbral: 0.82, celdas: ['x₁', '1.5 − (−0.125)/5.75', '1.5217391'], destacada: true },
          ],
        },
      },
      {
        id: 'ec-v5',
        titulo: '5. Iteraciones 2 y 3 de Newton: explosión cuadrática',
        duracion: 19,
        formulaTex: T`x_2=1.5213798,\qquad x_3=1.5213797,\qquad e_{k+1}\approx C\,e_k^2`,
        pasosTex: [
          T`k=2:\; f(x_1)=0.0021369,\; f'(x_1)=5.94707 \;\Rightarrow\; x_2=1.5213798`,
          T`|\Delta x_2|=|x_2-x_1|=3.59\times 10^{-4}\text{ (ya gana casi 4 cifras)}`,
          T`k=3:\; f(x_2)=5.89\times 10^{-7} \;\Rightarrow\; x_3=1.5213797,\; |\Delta x_3|=9.92\times 10^{-8}`,
        ],
        narracion:
          'En la segunda iteración de Newton, el residuo cae a dos milésimas y equis sub dos salta a uno punto cinco dos uno tres siete nueve ocho. Apenas en el tercer paso el cambio entre aproximaciones es menor a diez elevado a la menos siete, cumpliendo sobradamente la tolerancia al duplicar cifras correctas por paso.',
        notaClave: 'En raíces múltiples donde también f′(r) = 0, Newton pierde el orden cuadrático y baja a orden lineal p = 1.',
        visual: 'm1-newton',
        tabla: {
          titulo: 'Tabla completa de Newton-Raphson',
          columnas: ['k', 'x_k', 'f(x_k)', '|Δx_k|'],
          filas: [
            { umbral: 0, celdas: ['0', '1.5000000', '−0.1250000', '—'] },
            { umbral: 0.28, celdas: ['1', '1.5217391', '+2.14×10⁻³', '2.17×10⁻²'] },
            { umbral: 0.58, celdas: ['2', '1.5213798', '+5.89×10⁻⁷', '3.59×10⁻⁴'] },
            { umbral: 0.82, celdas: ['3', '1.5213797', '+4.53×10⁻¹⁴', '9.92×10⁻⁸'], destacada: true },
          ],
        },
      },
      {
        id: 'ec-v6',
        titulo: '6. Método de la Secante sin calcular derivadas',
        duracion: 23,
        formulaTex: T`x_{k+1}=x_k-f(x_k)\frac{x_k-x_{k-1}}{f(x_k)-f(x_{k-1})},\qquad p=\phi\approx 1.618`,
        pasosTex: [
          T`n=1\;(x_0=1,\; x_1=2):\; x_2=2-4\cdot\frac{2-1}{4-(-2)}=\frac{4}{3}\approx 1.33333`,
          T`n=2:\; x_3\approx 1.46269,\quad n=3:\; x_4\approx 1.53117\;\;(f(x_4)\approx 0.05863)`,
          T`n=7:\; x_8\approx 1.5213797,\; |\Delta x_7|=1.18\times 10^{-9}\le 10^{-6}\text{ (sin derivar } f'\text{)}`,
        ],
        narracion:
          '¿Qué hacemos si la derivada es imposible o muy costosa de calcular? El método de la secante reemplaza la tangente por una recta entre los dos puntos previos. Partiendo de equis sub cero igual a uno y equis sub uno igual a dos, la primera secante cae en cuatro tercios y alcanza la tolerancia en siete iteraciones con orden áureo uno punto seiscientos dieciocho.',
        notaClave: 'Si en algún paso f(xₖ) ≈ f(xₖ₋₁), la secante se vuelve casi horizontal y puede dispararse o dividir por cero.',
        visual: 'm1-secante',
        tabla: {
          titulo: 'Iteraciones de la Secante desde x₀=1, x₁=2',
          columnas: ['n', 'xₙ₊₁', 'f(xₙ₊₁)'],
          filas: [
            { umbral: 0, celdas: ['1', '1.33333', '−0.96296'] },
            { umbral: 0.28, celdas: ['2', '1.46269', '−0.33334'] },
            { umbral: 0.56, celdas: ['3', '1.53117', '+0.05863'] },
            { umbral: 0.82, celdas: ['7', '1.52138', '−1.84×10⁻¹⁴'], destacada: true },
          ],
        },
      },
      {
        id: 'ec-v7',
        titulo: '7. Orden de convergencia y estrategia híbrida final',
        duracion: 21,
        formulaTex: T`p\approx\frac{\ln(|\Delta x_k|/|\Delta x_{k-1}|)}{\ln(|\Delta x_{k-1}|/|\Delta x_{k-2}|)},\qquad r\approx 1.5213797`,
        pasosTex: [
          T`\text{Bisección: } p=1\text{ (20 pasos)} \;\;|\;\; \text{Secante: } p\approx 1.618\text{ (7 pasos)}`,
          T`\text{Newton-Raphson: } p=2\text{ (3 pasos, solo si } f'(x)\neq 0\text{)}`,
          T`\text{Práctica profesional: acotar con bisección } \to \text{ refinar con Newton}`,
        ],
        narracion:
          'Al comparar la caída logarítmica del error confirmamos tres velocidades: bisección avanza linealmente en veinte pasos, secante logra orden superlineal en siete y Newton alcanza orden cuadrático en tres. Para un examen o proyecto real, combina ambas fortalezas: acota la raíz con bisección y remata con Newton.',
        notaClave: 'Verificar tanto |Δx_k| ≤ tol como |f(x_k)| ≤ tol evita falsas paradas en pendientes muy planas o empinadas.',
        visual: 'm1-convergencia',
        tabla: {
          titulo: 'Balance final en f(x) = x³ − x − 2',
          columnas: ['Método', 'Orden p', 'Pasos (10⁻⁶)', 'Requisito'],
          filas: [
            { umbral: 0, celdas: ['Bisección', '1.000', '20', 'Cambio de signo'] },
            { umbral: 0.35, celdas: ['Secante', '1.618', '7', 'Dos puntos sin derivar'] },
            { umbral: 0.7, celdas: ['Newton', '2.000', '3', 'Buen x₀ y f′(x) ≠ 0'], destacada: true },
          ],
        },
      },
    ],
  },

  sistemas: {
    modulo: 'sistemas',
    titulo: 'Sistemas de ecuaciones lineales: directos vs iterativos',
    subtitulo: 'Pivoteo parcial, dominancia diagonal en Gauss-Seidel y control por residuo',
    escenas: [
      {
        id: 'sis-v1',
        titulo: '1. Planteamiento: sistema 3×3 de red de flujos Ax = b',
        duracion: 19,
        formulaTex: T`\begin{pmatrix}4&1&1\\1&5&1\\1&1&6\end{pmatrix}\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}=\begin{pmatrix}9\\14\\21\end{pmatrix}`,
        pasosTex: [
          T`\text{Modelo de equilibrio con 3 incógnitas: } x=(x_1, x_2, x_3)^T`,
          T`\text{Por qué NO usar } x=A^{-1}b:\text{ cuesta más operaciones y amplifica redondeo}`,
          T`\text{Solución de control: } x^*=(1,\;2,\;3)`,
        ],
        narracion:
          'Al balancear caudales en una red de tres nodos aparece un sistema lineal de tres ecuaciones con tres incógnitas en forma matricial A por equis igual a be. Aunque en teoría despejamos multiplicando por la matriz inversa, en cálculo numérico jamás la invertimos porque multiplica el costo y el error de redondeo.',
        notaClave: 'Resolver Ax = b mediante factorización o iteración siempre es más rápido y estable que calcular A⁻¹.',
        visual: 'm2-planteo',
        tabla: {
          titulo: 'Verificación de la solución exacta',
          columnas: ['Fila', 'Ecuación', 'Evaluación en (1, 2, 3)'],
          filas: [
            { umbral: 0, celdas: ['F₁', '4x₁ + x₂ + x₃ = 9', '4(1) + 2 + 3 = 9'] },
            { umbral: 0.35, celdas: ['F₂', 'x₁ + 5x₂ + x₃ = 14', '1 + 5(2) + 3 = 14'] },
            { umbral: 0.7, celdas: ['F₃', 'x₁ + x₂ + 6x₃ = 21', '1 + 2 + 6(3) = 21'], destacada: true },
          ],
        },
      },
      {
        id: 'sis-v2',
        titulo: '2. Eliminación gaussiana y pivoteo parcial en columna 1',
        duracion: 21,
        formulaTex: T`m_{i1}=\frac{a_{i1}}{a_{11}}=0.25,\qquad F_i\leftarrow F_i-m_{i1}F_1\quad (i=2,3)`,
        pasosTex: [
          T`\text{Pivoteo parcial: }\max(|4|,|1|,|1|)=4\text{ ya está en fila 1 (}|m_{i1}|\le 1\text{)}`,
          T`F_2\leftarrow F_2-0.25F_1 = [0,\; 4.75,\; 0.75 \mid 11.75]`,
          T`F_3\leftarrow F_3-0.25F_1 = [0,\; 0.75,\; 5.75 \mid 18.75]`,
        ],
        narracion:
          'Iniciamos la eliminación gaussiana inspeccionando la primera columna. El pivoteo parcial selecciona la fila con mayor coeficiente en valor absoluto, aquí cuatro, garantizando multiplicadores menores o iguales a uno. Con multiplicador cero punto veinticinco anulamos la primera incógnita en las filas dos y tres de forma limpia.',
        notaClave: 'Acotar los multiplicadores con |m_ik| ≤ 1 impide que pequeños errores de redondeo exploten durante la eliminación.',
        visual: 'm2-gauss',
        tabla: {
          titulo: 'Matriz tras eliminar columna 1',
          columnas: ['Fila', 'x₁', 'x₂', 'x₃ | b'],
          filas: [
            { umbral: 0, celdas: ['F₁ (pivote 4)', '4.00', '1.00', '1.00 | 9.00'] },
            { umbral: 0.4, celdas: ['F₂ − 0.25 F₁', '0', '4.75', '0.75 | 11.75'] },
            { umbral: 0.75, celdas: ['F₃ − 0.25 F₁', '0', '0.75', '5.75 | 18.75'], destacada: true },
          ],
        },
      },
      {
        id: 'sis-v3',
        titulo: '3. Columna 2 y sustitución hacia atrás hasta (1, 2, 3)',
        duracion: 20,
        formulaTex: T`m_{32}=\frac{0.75}{4.75}=\frac{3}{19},\qquad \frac{107}{19}x_3=\frac{321}{19}\;\Rightarrow\; x_3=3`,
        pasosTex: [
          T`\text{Pivote en } F_2:\; 4.75 > 0.75 \;\Rightarrow\; F_3\leftarrow F_3-\tfrac{3}{19}F_2`,
          T`\text{Sistema triangular } U:\; x_3=\frac{321/19}{107/19}=3`,
          T`\text{Atrás: } 4.75x_2=11.75-0.75(3)=9.5\Rightarrow x_2=2;\quad x_1=\tfrac{9-2-3}{4}=1`,
        ],
        narracion:
          'En la segunda columna cuatro punto setenta y cinco supera a cero punto setenta y cinco, así que el multiplicador vale tres diecinueveavos. Tras anular debajo de la diagonal obtenemos una matriz triangular superior y resolvemos hacia atrás: equis sub tres da tres, equis sub dos resulta dos y equis sub uno queda en uno.',
        notaClave: 'Si tras intercambiar filas un pivote diagonal resulta cero, el sistema es singular y no tiene solución única.',
        visual: 'm2-gauss',
        tabla: {
          titulo: 'Sustitución hacia atrás en Ux = c',
          columnas: ['Paso', 'Ecuación triangular', 'Resultado'],
          filas: [
            { umbral: 0, celdas: ['x₃', '(107/19) x₃ = 321/19', 'x₃ = 3.000'] },
            { umbral: 0.38, celdas: ['x₂', '4.75 x₂ + 0.75(3) = 11.75', 'x₂ = 2.000'] },
            { umbral: 0.75, celdas: ['x₁', '4 x₁ + 2 + 3 = 9', 'x₁ = 1.000'], destacada: true },
          ],
        },
      },
      {
        id: 'sis-v4',
        titulo: '4. Dominancia diagonal estricta y reordenamiento',
        duracion: 16,
        formulaTex: T`|a_{ii}| > \sum_{j\neq i}|a_{ij}| \quad \forall i=1,2,3`,
        pasosTex: [
          T`\text{Fila 1: } |4| > |1|+|1|=2 \;\checkmark,\qquad \text{Fila 2: } |5| > |1|+|1|=2 \;\checkmark`,
          T`\text{Fila 3: } |6| > |1|+|1|=2 \;\checkmark \;\Rightarrow\; \text{Gauss-Seidel converge siempre}`,
          T`\text{Si llegan desordenadas, intercambiar filas restaura la dominancia}`,
        ],
        narracion:
          'Antes de usar Gauss-Seidel comprobamos la dominancia diagonal estricta en cada fila: cuatro supera a dos, cinco supera a dos y seis supera a dos. Si las filas llegan desordenadas, permutarlas permite asegurar convergencia.',
        notaClave: 'La dominancia diagonal estricta es condición suficiente (no necesaria) para garantizar convergencia desde cualquier inicio.',
        visual: 'm2-dominancia',
        tabla: {
          titulo: 'Chequeo de dominancia diagonal',
          columnas: ['Fila', '|a_ii|', 'Σ|a_ij| (j≠i)', 'Diagnóstico'],
          filas: [
            { umbral: 0, celdas: ['1', '4', '1 + 1 = 2', '✔ 4 > 2'] },
            { umbral: 0.35, celdas: ['2', '5', '1 + 1 = 2', '✔ 5 > 2'] },
            { umbral: 0.7, celdas: ['3', '6', '1 + 1 = 2', '✔ 6 > 2'], destacada: true },
          ],
        },
      },
      {
        id: 'sis-v5',
        titulo: '5. Primera iteración de Gauss-Seidel desde (0, 0, 0)',
        duracion: 16,
        formulaTex: T`x_i^{(k+1)}=\frac{b_i-\sum_{j<i}a_{ij}x_j^{(k+1)}-\sum_{j>i}a_{ij}x_j^{(k)}}{a_{ii}}`,
        pasosTex: [
          T`\text{Partimos de } x^{(0)}=(0,0,0):\; x_1^{(1)}=\frac{9-0-0}{4}=2.2500`,
          T`\text{Actualiza al instante: } x_2^{(1)}=\frac{14-2.25-0}{5}=2.3500`,
          T`\text{Usa ambos nuevos: } x_3^{(1)}=\frac{21-2.25-2.35}{6}=2.7333`,
        ],
        narracion:
          'Partiendo desde el vector cero, Gauss-Seidel despeja equis sub uno igual a dos punto veinticinco y lo sustituye enseguida en la misma iteración para obtener equis sub dos igual a dos punto treinta y cinco y equis sub tres igual a dos punto siete tres tres tres.',
        notaClave: 'Reutilizar de inmediato cada componente recién calculada duplica típicamente la velocidad frente a Jacobi.',
        visual: 'm2-gs',
        tabla: {
          titulo: 'Cálculo detallado de la iteración k = 1',
          columnas: ['Variable', 'Valores usados', 'Resultado'],
          filas: [
            { umbral: 0, celdas: ['x₁⁽¹⁾', 'x₂⁽⁰⁾=0, x₃⁽⁰⁾=0', '2.2500'] },
            { umbral: 0.38, celdas: ['x₂⁽¹⁾', 'x₁⁽¹⁾=2.25, x₃⁽⁰⁾=0', '2.3500'] },
            { umbral: 0.75, celdas: ['x₃⁽¹⁾', 'x₁⁽¹⁾=2.25, x₂⁽¹⁾=2.35', '2.7333'], destacada: true },
          ],
        },
      },
      {
        id: 'sis-v6',
        titulo: '6. Iteraciones 2 y 3 y caída geométrica del error',
        duracion: 19,
        formulaTex: T`x^{(2)}=(0.9792,\;2.0575,\;2.9939),\qquad x^{(3)}=(0.9872,\;2.0038,\;3.0015)`,
        pasosTex: [
          T`k=2:\; x_1^{(2)}=\tfrac{9-2.35-2.7333}{4}=0.9792,\; x_2^{(2)}=2.0575,\; x_3^{(2)}=2.9939`,
          T`k=3:\; x_1^{(3)}=0.9872,\; x_2^{(3)}=2.0038,\; x_3^{(3)}=3.0015`,
          T`k=4:\; (0.9987,\; 2.0000,\; 3.0002) \;\to\; \text{converge hacia }(1,2,3)`,
        ],
        narracion:
          'Al repetir el barrido en la segunda iteración, el vector salta a cero punto noventa y siete noventa y dos, dos punto cero cinco siete cinco y dos punto noventa y nueve treinta y nueve. En la tercera iteración todas las componentes quedan ya a menos de dos centésimas de la solución exacta uno, dos, tres.',
        notaClave: 'Observa en la gráfica cómo la trayectoria en escalera se cierra en espiral hacia la intersección.',
        visual: 'm2-gs',
        tabla: {
          titulo: 'Evolución de las iteraciones Gauss-Seidel',
          columnas: ['k', 'x₁', 'x₂', 'x₃'],
          filas: [
            { umbral: 0, celdas: ['0', '0.0000', '0.0000', '0.0000'] },
            { umbral: 0.25, celdas: ['1', '2.2500', '2.3500', '2.7333'] },
            { umbral: 0.55, celdas: ['2', '0.9792', '2.0575', '2.9939'] },
            { umbral: 0.8, celdas: ['3', '0.9872', '2.0038', '3.0015'], destacada: true },
          ],
        },
      },
      {
        id: 'sis-v7',
        titulo: '7. Control por residuo, equilibrado y decisión de método',
        duracion: 21,
        formulaTex: T`\|r^{(k)}\|_\infty=\|b-Ax^{(k)}\|_\infty=\max_i |b_i-(Ax^{(k)})_i|\le \text{tol}`,
        pasosTex: [
          T`\|r^{(1)}\|_\infty=5.0833 \;\to\; \|r^{(2)}\|_\infty=0.2606 \;\to\; \|r^{(4)}\|_\infty=0.0051`,
          T`\text{Con tolerancia } 10^{-6}\text{ se detiene en } k=8\text{ sin conocer } x^*`,
          T`\text{Equilibrar filas por }\|\text{fila}\|_\infty\text{ antes de }\det\text{ evita falsos singulares}`,
        ],
        narracion:
          'En la práctica no conocemos la solución exacta para medir el error, así que controlamos la parada con la norma infinito del residuo be menos A por equis, que cae de cinco punto cero ocho a cinco milésimas en cuatro pasos. Para matrices pequeñas o mal condicionadas usa eliminación con pivoteo; para grandes dominantes, Gauss-Seidel.',
        notaClave: 'Normalizar cada fila por su máximo absoluto evita diagnosticar como singular una matriz bien condicionada de coeficientes pequeños.',
        visual: 'm2-residuo',
        tabla: {
          titulo: 'Decaimiento del residuo ||b − Ax⁽ᵏ⁾||_∞',
          columnas: ['k', '||r||_∞', 'Estado'],
          filas: [
            { umbral: 0, celdas: ['0', '21.0000', 'Vector inicial'] },
            { umbral: 0.28, celdas: ['1', '5.0833', 'Primer barrido'] },
            { umbral: 0.56, celdas: ['2', '0.2606', 'Cae ~20×'] },
            { umbral: 0.82, celdas: ['8', '< 10⁻⁶', '✔ Parada por residuo'], destacada: true },
          ],
        },
      },
    ],
  },

  interpolacion: {
    modulo: 'interpolacion',
    titulo: 'Interpolación de Lagrange y ajuste por mínimos cuadrados',
    subtitulo: 'Cuándo pasar exactamente por los datos y cuándo capturar la tendencia lineal',
    escenas: [
      {
        id: 'int-v1',
        titulo: '1. Planteo: cuatro mediciones de carga vs latencia',
        duracion: 19,
        formulaTex: T`\text{Datos: }(0,1),\;(1,2),\;(2,2),\;(3,4),\qquad \text{consultar } x=1.5`,
        pasosTex: [
          T`\text{Datos exactos sin ruido (tablas físicas)} \;\Rightarrow\; \text{Lagrange pasa por todos}`,
          T`\text{Mediciones experimentales con ruido} \;\Rightarrow\; \text{Regresión captura tendencia}`,
          T`\text{En } x=1.5\text{ ambos modelos darán predicciones distintas}`,
        ],
        narracion:
          'Medimos la latencia de un servidor en cuatro niveles de carga: cero con uno, uno con dos, dos con dos y tres con cuatro, y deseamos estimar el valor en uno punto cinco. Antes de aplicar fórmulas debemos decidir si los datos son exactos para interpolarlos o si tienen ruido experimental para ajustarlos.',
        notaClave: 'La interpolación obliga a la curva a pasar por cada punto; si hay ruido, copiará también el error de medición.',
        visual: 'm3-datos',
        tabla: {
          titulo: 'Tabla de mediciones experimentales',
          columnas: ['Nodo i', 'Carga x_i', 'Latencia y_i'],
          filas: [
            { umbral: 0, celdas: ['0', '0', '1'] },
            { umbral: 0.28, celdas: ['1', '1', '2'] },
            { umbral: 0.56, celdas: ['2', '2', '2'] },
            { umbral: 0.8, celdas: ['3', '3', '4'], destacada: true },
          ],
        },
      },
      {
        id: 'int-v2',
        titulo: '2. Bases L₀(1.5) y L₁(1.5) del polinomio de Lagrange',
        duracion: 15,
        formulaTex: T`L_i(x)=\prod_{j\neq i}\frac{x-x_j}{x_i-x_j},\qquad P(x)=\sum_{i=0}^{3}y_i\,L_i(x)`,
        pasosTex: [
          T`L_0(1.5)=\frac{(1.5-1)(1.5-2)(1.5-3)}{(0-1)(0-2)(0-3)}=\frac{0.375}{-6}=-0.0625`,
          T`L_1(1.5)=\frac{(1.5-0)(1.5-2)(1.5-3)}{(1-0)(1-2)(1-3)}=\frac{1.125}{2}=0.5625`,
          T`\text{Cada base } L_i \text{ actúa como peso: vale } 1 \text{ en } x_i \text{ y } 0 \text{ en los demás}`,
        ],
        narracion:
          'Para armar el polinomio cúbico de Lagrange evaluamos sus bases en uno punto cinco excluyendo cada nodo. Así, ele sub cero vale menos cero punto cero seis dos cinco y ele sub uno vale cero punto cinco seis dos cinco.',
        notaClave: 'Cada base Lᵢ(x) cumple la propiedad delta: Lᵢ(xᵢ) = 1 y Lᵢ(xⱼ) = 0 para todo j ≠ i.',
        visual: 'm3-lagrange',
        tabla: {
          titulo: 'Cálculo de las dos primeras bases en x = 1.5',
          columnas: ['Base', 'Numerador / Denominador', 'L_i(1.5)'],
          filas: [
            { umbral: 0, celdas: ['L₀(1.5)', '(0.5)(−0.5)(−1.5) / (−6)', '−0.0625'] },
            { umbral: 0.5, celdas: ['L₁(1.5)', '(1.5)(−0.5)(−1.5) / (+2)', '+0.5625'], destacada: true },
          ],
        },
      },
      {
        id: 'int-v3',
        titulo: '3. Bases L₂, L₃, comprobación ΣLᵢ = 1 y P(1.5)',
        duracion: 16,
        formulaTex: T`L_2(1.5)=0.5625,\quad L_3(1.5)=-0.0625 \;\Longrightarrow\; P(1.5)=1.9375`,
        pasosTex: [
          T`\text{Comprobación obligatoria: } -0.0625+0.5625+0.5625-0.0625=1.0000`,
          T`P(1.5)=1(-0.0625)+2(0.5625)+2(0.5625)+4(-0.0625)`,
          T`P(1.5)=-0.0625+1.125+1.125-0.25=1.9375`,
        ],
        narracion:
          'Por simetría, ele sub dos vale cero punto cinco seis dos cinco y ele sub tres menos cero punto cero seis dos cinco. Comprobamos que las bases suman uno y al combinarlas con las alturas obtenemos exactamente uno punto nueve tres siete cinco.',
        notaClave: 'La identidad ∑Lᵢ(x) = 1 para todo x es tu mejor detector de errores aritméticos en un examen.',
        visual: 'm3-lagrange',
        tabla: {
          titulo: 'Combinación lineal P(1.5) = Σ y_i·L_i(1.5)',
          columnas: ['i', '(x_i, y_i)', 'L_i(1.5)', 'Aporte y_i·L_i'],
          filas: [
            { umbral: 0, celdas: ['0', '(0, 1)', '−0.0625', '−0.0625'] },
            { umbral: 0.25, celdas: ['1', '(1, 2)', '+0.5625', '+1.1250'] },
            { umbral: 0.5, celdas: ['2', '(2, 2)', '+0.5625', '+1.1250'] },
            { umbral: 0.78, celdas: ['3', '(3, 4)', '−0.0625', '−0.2500 → Σ = 1.9375'], destacada: true },
          ],
        },
      },
      {
        id: 'int-v4',
        titulo: '4. Peligros: fenómeno de Runge y abscisas repetidas',
        duracion: 20,
        formulaTex: T`f(x)=\frac{1}{1+25x^2},\qquad x_i\neq x_j \quad \forall i\neq j`,
        pasosTex: [
          T`\text{6 nodos equiespaciados en Runge: } P_5(0.8)\approx -0.0481 < 0`,
          T`\text{Si se repite una abscisa } x_i=x_j:\; \text{denominador } (x_i-x_j)=0\text{ (falla)}`,
          T`\text{Evita polinomios de grado alto global; prefiere pocos nodos locales}`,
        ],
        narracion:
          'Aunque Lagrange parece perfecto, aumentar demasiado los nodos equiespaciados genera oscilaciones violentas en los extremos, como muestra la función de Runge donde el polinomio cae incluso a valores negativos falsos. Además, si dos mediciones repiten el mismo valor de equis, la fórmula divide entre cero y falla.',
        notaClave: 'Si tienes muchos datos ordenados, interpola por tramos locales o usa splines cúbicos en lugar de un único grado alto.',
        visual: 'm3-runge',
        tabla: {
          titulo: 'Límites estructurales de Lagrange',
          columnas: ['Situación', 'Causa matemática', 'Consecuencia'],
          filas: [
            { umbral: 0, celdas: ['Grado alto uniforme', 'Fenómeno de Runge', 'P(0.8) = −0.0481 falso'] },
            { umbral: 0.38, celdas: ['Abscisa repetida x_i=x_j', 'División por x_i−x_j=0', 'Polinomio indefinido'] },
            { umbral: 0.72, celdas: ['x fuera de [0, 3]', 'Extrapolación polinómica', 'Divergencia cúbica'], destacada: true },
          ],
        },
      },
      {
        id: 'int-v5',
        titulo: '5. Mínimos cuadrados: medias y sumas Sₓₓ y Sₓᵧ',
        duracion: 23,
        formulaTex: T`\bar x=\frac{1}{n}\sum x_i,\qquad S_{xx}=\sum (x_i-\bar x)^2,\qquad S_{xy}=\sum (x_i-\bar x)(y_i-\bar y)`,
        pasosTex: [
          T`\bar x = \frac{0+1+2+3}{4}=1.5,\qquad \bar y = \frac{1+2+2+4}{4}=2.25`,
          T`S_{xx} = (-1.5)^2+(-0.5)^2+(0.5)^2+(1.5)^2 = 5.0`,
          T`S_{xy} = (-1.5)(-1.25)+(-0.5)(-0.25)+(0.5)(-0.25)+(1.5)(1.75) = 4.5`,
        ],
        narracion:
          'Si los cuatro puntos contienen ruido de medición, cambiamos a regresión lineal por mínimos cuadrados para minimizar la suma de errores verticales al cuadrado. Calculamos las medias: equis barra es uno punto cinco y ye barra dos punto veinticinco. Luego acumulamos las sumas centradas: ese equis equis vale cinco y ese equis ye cuatro punto cinco.',
        notaClave: 'Centrar respecto a las medias (xᵢ − x̄) evita pérdida numérica de precisión frente a usar ∑xᵢ² directamente.',
        visual: 'm3-regresion',
        tabla: {
          titulo: 'Tabla de sumas centradas',
          columnas: ['(x_i, y_i)', 'x_i − x̄', 'y_i − ȳ', 'Producto'],
          filas: [
            { umbral: 0, celdas: ['(0, 1)', '−1.5', '−1.25', '+1.875'] },
            { umbral: 0.25, celdas: ['(1, 2)', '−0.5', '−0.25', '+0.125'] },
            { umbral: 0.55, celdas: ['(2, 2)', '+0.5', '−0.25', '−0.125'] },
            { umbral: 0.8, celdas: ['(3, 4)', '+1.5', '+1.75', '+2.625 → S_xy=4.5'], destacada: true },
          ],
        },
      },
      {
        id: 'int-v6',
        titulo: '6. Recta ajustada ŷ = 0.9 + 0.9x, SSE y bondad R²',
        duracion: 17,
        formulaTex: T`b_1=\frac{S_{xy}}{S_{xx}}=0.9,\quad b_0=\bar y-b_1\bar x=0.9,\quad R^2=1-\frac{SSE}{SST}`,
        pasosTex: [
          T`\hat y = 0.9 + 0.9x \;\Longrightarrow\; \hat y(1.5) = 0.9 + 0.9(1.5) = 2.25`,
          T`SSE = (1-0.9)^2+(2-1.8)^2+(2-2.7)^2+(4-3.6)^2 = 0.70`,
          T`SST = 4.75 \;\Longrightarrow\; R^2 = 1 - \frac{0.70}{4.75} \approx 0.8526\text{ (85.3 \% explicado)}`,
        ],
        narracion:
          'Dividiendo ese equis ye entre ese equis equis obtenemos la recta cero punto nueve más cero punto nueve por equis. En uno punto cinco predice dos punto veinticinco, con error cuadrático cero punto siete y erre cuadrado de cero punto ochenta y cinco veintiséis.',
        notaClave: 'La recta de regresión siempre pasa exactamente por el centroide (x̄, ȳ) de la nube de puntos.',
        visual: 'm3-regresion',
        tabla: {
          titulo: 'Residuos de ŷ = 0.9 + 0.9x',
          columnas: ['x_i', 'y_i', 'ŷ_i', '(y_i − ŷ_i)²'],
          filas: [
            { umbral: 0, celdas: ['0', '1', '0.9', '0.01'] },
            { umbral: 0.25, celdas: ['1', '2', '1.8', '0.04'] },
            { umbral: 0.55, celdas: ['2', '2', '2.7', '0.49'] },
            { umbral: 0.8, celdas: ['3', '4', '3.6', '0.16 → SSE=0.70'], destacada: true },
          ],
        },
      },
      {
        id: 'int-v7',
        titulo: '7. Criterio final de decisión y riesgo de extrapolación',
        duracion: 22,
        formulaTex: T`P_{\text{Lagrange}}(1.5)=1.9375 \quad\neq\quad \hat y_{\text{Regresión}}(1.5)=2.25`,
        pasosTex: [
          T`\text{Datos deterministas + consulta interior} \;\Rightarrow\; \text{Lagrange}`,
          T`\text{Datos con ruido o abscisas repetidas} \;\Rightarrow\; \text{Mínimos cuadrados}`,
          T`\text{Nunca extrapoles lejos de } [x_{\min}, x_{\max}] \text{ sin respaldo físico}`,
        ],
        narracion:
          'Observa por qué ambos métodos arrojan respuestas distintas en uno punto cinco: Lagrange respeta al milímetro cada punto asumiendo cero ruido, mientras la regresión suaviza la tendencia global ignorando fluctuaciones locales. Para el examen verifica primero si hay ruido o abscisas repetidas, y desconfía siempre de cualquier extrapolación fuera del rango observado.',
        notaClave: 'Un R² cercano a 1 no valida el modelo si la gráfica de residuos muestra una curva sistemática no lineal.',
        visual: 'm3-decision',
        tabla: {
          titulo: 'Guía de elección del modelo',
          columnas: ['Escenario', 'Método', 'Motivo'],
          filas: [
            { umbral: 0, celdas: ['Tabla exacta, x interior', 'Lagrange', 'Error nodal nulo'] },
            { umbral: 0.38, celdas: ['Medición con ruido', 'Regresión', 'Filtra error aleatorio'] },
            { umbral: 0.72, celdas: ['Consulta fuera de rango', 'Precaución', 'Error de extrapolación'], destacada: true },
          ],
        },
      },
    ],
  },

  integracion: {
    modulo: 'integracion',
    titulo: 'Integración y derivación numérica',
    subtitulo: 'Reglas compuestas del Trapecio y Simpson 1/3, orden del error y diferencias finitas',
    escenas: [
      {
        id: 'ig-v1',
        titulo: '1. Planteo: acumular la tasa r(t) = t² + 1 en [0, 2]',
        duracion: 19,
        formulaTex: T`V=\int_0^2 (t^2+1)\,dt=\left[\frac{t^3}{3}+t\right]_0^2=\frac{14}{3}\approx 4.6667\text{ MB}`,
        pasosTex: [
          T`\text{Tasa en MB/s sobre } [a,b]=[0,2]\text{ con } n=4\text{ subintervalos}`,
          T`\text{Paso uniforme: } h=\frac{2-0}{4}=0.5\text{ s},\quad t_i=(0,\;0.5,\;1.0,\;1.5,\;2.0)`,
          T`\text{Evaluaciones: } r(t_i)=(1.00,\;1.25,\;2.00,\;3.25,\;5.00)\text{ MB/s}`,
        ],
        narracion:
          'Si medimos la tasa de transferencia de un servicio en megabytes por segundo, el volumen total transmitido entre cero y dos segundos es la integral definida. Usaremos la función te al cuadrado más uno cuyo valor exacto es catorce tercios, particionando el intervalo en cuatro tramos de paso cero punto cinco.',
        notaClave: 'Integrar una tasa en unidades por segundo respecto al tiempo entrega la cantidad total acumulada en el intervalo.',
        visual: 'm4-area',
        tabla: {
          titulo: 'Nodos de malla para n = 4 (h = 0.5)',
          columnas: ['i', 't_i (s)', 'r(t_i) = t_i² + 1'],
          filas: [
            { umbral: 0, celdas: ['0', '0.0', '1.00'] },
            { umbral: 0.25, celdas: ['1', '0.5', '1.25'] },
            { umbral: 0.5, celdas: ['2 / 3', '1.0 / 1.5', '2.00 / 3.25'] },
            { umbral: 0.8, celdas: ['4', '2.0', '5.00 (∫ = 14/3 ≈ 4.6667)'], destacada: true },
          ],
        },
      },
      {
        id: 'ig-v2',
        titulo: '2. Trapecio compuesto: cálculo tramo a tramo con n = 4',
        duracion: 16,
        formulaTex: T`T_n=\frac{h}{2}\left[f(t_0)+2\sum_{i=1}^{n-1}f(t_i)+f(t_n)\right]`,
        pasosTex: [
          T`\text{Pesos del Trapecio compuesto: } (1,\; 2,\; 2,\; 2,\; 1)`,
          T`T_4=\frac{0.5}{2}\bigl[1+2(1.25)+2(2.00)+2(3.25)+5\bigr]`,
          T`T_4=0.25\,(1+2.5+4+6.5+5)=0.25\times 19=4.75\text{ MB}`,
        ],
        narracion:
          'El trapecio compuesto une nodos consecutivos con rectas y sirve para cualquier ene. Damos peso uno a los extremos y dos al interior, sumando diecinueve, que por cero punto veinticinco arroja cuatro punto setenta y cinco megabytes.',
        notaClave: 'Todo nodo interior comparte dos trapecios adyacentes; por eso recibe peso 2 en la fórmula compuesta.',
        visual: 'm4-trapecio',
        tabla: {
          titulo: 'Áreas parciales del Trapecio (h = 0.5)',
          columnas: ['Tramo', 'Base', 'Área del trapecio'],
          filas: [
            { umbral: 0, celdas: ['1', '[0.0, 0.5]', '0.5625'] },
            { umbral: 0.28, celdas: ['2', '[0.5, 1.0]', '0.8125'] },
            { umbral: 0.56, celdas: ['3', '[1.0, 1.5]', '1.3125'] },
            { umbral: 0.8, celdas: ['4', '[1.5, 2.0]', '2.0625 → Σ = 4.7500'], destacada: true },
          ],
        },
      },
      {
        id: 'ig-v3',
        titulo: '3. Error de convexidad y cota O(h²) del Trapecio',
        duracion: 20,
        formulaTex: T`E_T = -\frac{(b-a)}{12}h^2 f''(\xi),\qquad |E_T|=\left|\frac{14}{3}-4.75\right|=\frac{1}{12}\approx 0.0833`,
        pasosTex: [
          T`\text{Como } r''(t)=2>0\text{ (convexa), la secante queda por encima de la curva}`,
          T`\text{Cota teórica exacta: } |E_T|=\frac{(2-0)}{12}(0.5)^2(2)=\frac{1}{12}\approx 0.0833\text{ MB}`,
          T`\text{Orden } O(h^2):\text{ reducir } h \text{ a la mitad divide el error entre } 4`,
        ],
        narracion:
          '¿Por qué cuatro punto setenta y cinco sobreestima el resultado exacto? Como la segunda derivada es positiva, la curva es convexa y cada cuerda recta pasa por encima de la parábola. La diferencia exacta es un doceavo, coincidiendo milimétricamente con la fórmula teórica de error de orden hache al cuadrado.',
        notaClave: 'En funciones convexas (f″ > 0) el trapecio siempre sobreestima; en cóncavas (f″ < 0) subestima.',
        visual: 'm4-trapecio',
        tabla: {
          titulo: 'Verificación de la cota del Trapecio',
          columnas: ['Métrica', 'Fórmula', 'Resultado'],
          filas: [
            { umbral: 0, celdas: ['Exacta', '14 / 3', '4.6667'] },
            { umbral: 0.35, celdas: ['Trapecio T₄', '(h/2)·19', '4.7500'] },
            { umbral: 0.7, celdas: ['Error |E_T|', '2·(0.5)²·2 / 12', '0.0833 (1/12)'], destacada: true },
          ],
        },
      },
      {
        id: 'ig-v4',
        titulo: '4. Regla de Simpson 1/3 compuesto: pesos (1, 4, 2, 4, 1)',
        duracion: 19,
        formulaTex: T`S_n=\frac{h}{3}\left[f(t_0)+4f(t_1)+2f(t_2)+\dots+4f(t_{n-1})+f(t_n)\right]\quad (n\text{ par})`,
        pasosTex: [
          T`\text{Requisito estricto: } n\text{ debe ser par (cada parábola abarca 2 tramos)}`,
          T`S_4=\frac{0.5}{3}\bigl[1+4(1.25)+2(2.00)+4(3.25)+5\bigr]`,
          T`S_4=\frac{0.5}{3}(1+5+4+13+5)=\frac{14}{3}\approx 4.6667\text{ MB}\quad (E=0)`,
        ],
        narracion:
          'Simpson un tercio reemplaza cada par de subintervalos por un arco parabólico, lo que exige que ene sea obligatoriamente par. Aplicando los pesos uno, cuatro, dos, cuatro, uno sobre los mismos nodos obtenemos veintiocho por un sexto, igual a catorce tercios exactos con error nulo al ser cuadrática.',
        notaClave: 'Simpson 1/3 integra de forma exacta cualquier polinomio hasta grado 3 inclusive, aunque se construya con parábolas de grado 2.',
        visual: 'm4-simpson',
        tabla: {
          titulo: 'Evaluación de Simpson 1/3 con n = 4',
          columnas: ['t_i', 'r(t_i)', 'Peso w_i', 'w_i·r(t_i)'],
          filas: [
            { umbral: 0, celdas: ['0.0', '1.00', '1', '1.00'] },
            { umbral: 0.25, celdas: ['0.5', '1.25', '4', '5.00'] },
            { umbral: 0.55, celdas: ['1.0 / 1.5', '2.00 / 3.25', '2 / 4', '4.00 / 13.00'] },
            { umbral: 0.8, celdas: ['2.0', '5.00', '1', '5.00 → S₄ = 14/3'], destacada: true },
          ],
        },
      },
      {
        id: 'ig-v5',
        titulo: '5. Refinamiento en grados altos: O(h²) vs O(h⁴)',
        duracion: 18,
        formulaTex: T`\int_0^1 t^4\,dt = 0.2:\qquad \text{Trapecio }\div 4 \quad\text{vs}\quad \text{Simpson }\div 16`,
        pasosTex: [
          T`\text{Con } n=2:\; |E_{\text{Trap}}|=0.08125,\qquad |E_{\text{Simp}}|=0.008333`,
          T`\text{Duplicando a } n=4:\; |E_{\text{Trap}}|=0.02070\;(\div 3.9),\quad |E_{\text{Simp}}|=0.000521\;(\div 16)`,
          T`\text{Con } n=8:\; |E_{\text{Trap}}|=0.00520\;(\div 4.0),\quad |E_{\text{Simp}}|=0.000033\;(\div 16)`,
        ],
        narracion:
          'Probemos una función de cuarto grado donde Simpson ya no es exacto, como integrar te a la cuarta entre cero y uno. Al duplicar los subintervalos de dos a cuatro y luego a ocho, el error del trapecio cae cada vez entre cuatro, mientras el de Simpson se desploma dieciséis veces.',
        notaClave: 'La ventaja O(h⁴) de Simpson exige que f sea cuatro veces derivable; ante picos bruscos pierde esa aceleración.',
        visual: 'm4-ordenes',
        tabla: {
          titulo: 'Convergencia al duplicar n en ∫₀¹ t⁴ dt = 0.2',
          columnas: ['n', 'Error Trapecio', 'Error Simpson'],
          filas: [
            { umbral: 0, celdas: ['2', '0.081250', '0.008333'] },
            { umbral: 0.35, celdas: ['4', '0.020703 (÷3.9)', '0.000521 (÷16)'] },
            { umbral: 0.72, celdas: ['8', '0.005200 (÷4.0)', '0.000033 (÷16)'], destacada: true },
          ],
        },
      },
      {
        id: 'ig-v6',
        titulo: '6. Derivación numérica: progresiva vs central O(h²)',
        duracion: 16,
        formulaTex: T`D_+=\frac{f(t+h)-f(t)}{h}\;O(h),\qquad D_c=\frac{f(t+h)-f(t-h)}{2h}\;O(h^2)`,
        pasosTex: [
          T`\text{Ejemplo } f(t)=e^t\text{ en } t=1\text{ (exacta } e\approx 2.7182818\text{) con } h=0.1`,
          T`D_+=\frac{e^{1.1}-e^1}{0.1}=2.85884 \quad (E\approx 0.1406\text{ lineal } O(h))`,
          T`D_c=\frac{e^{1.1}-e^{0.9}}{0.2}=2.72281 \quad (E\approx 0.00453\text{ cuadrático } O(h^2))`,
        ],
        narracion:
          'En derivación estimamos la pendiente en un punto. Para la exponencial en uno con paso cero punto uno, la diferencia progresiva falla por cero punto catorce, mientras la diferencia central cancela términos pares y logra orden cuadrático.',
        notaClave: 'La simetría alrededor de t hace que la diferencia central cancele el término de segundo grado en la serie de Taylor.',
        visual: 'm4-derivacion',
        tabla: {
          titulo: 'Derivada de eᵗ en t = 1 (h = 0.1)',
          columnas: ['Esquema', 'Aproximación', 'Error absoluto'],
          filas: [
            { umbral: 0, celdas: ['Exacta e¹', '2.71828', '0'] },
            { umbral: 0.38, celdas: ['Progresiva O(h)', '2.85884', '0.14056'] },
            { umbral: 0.72, celdas: ['Central O(h²)', '2.72281', '0.00453 (31× menor)'], destacada: true },
          ],
        },
      },
      {
        id: 'ig-v7',
        titulo: '7. Curva en «U» truncamiento vs redondeo y paso óptimo',
        duracion: 21,
        formulaTex: T`E_{\text{total}}(h)\sim C_1 h^2 + \frac{C_2\,\varepsilon_{\text{máq}}}{h},\qquad h_{\text{ópt}}\sim \varepsilon^{1/3}\approx 10^{-5}`,
        pasosTex: [
          T`h=10^{-1}\to E=4.53\times 10^{-3}\text{ (domina truncamiento)}`,
          T`h=10^{-5}\to E\approx 5.86\times 10^{-11}\text{ (óptimo de compromiso)}`,
          T`h=10^{-12}\to E\approx 2.10\times 10^{-4}\text{ (cancelación al restar y dividir por } 2h\text{)}`,
        ],
        narracion:
          '¡Atención a esta trampa clásica! Al achicar el paso hache en una derivada, el truncamiento baja pero la cancelación al restar valores casi iguales dividida entre dos hache crece. Por eso el error dibuja una curva en U con un mínimo óptimo cerca de diez elevado a la menos cinco; pasos diminutos empeoran el resultado.',
        notaClave: 'Integrar suaviza errores de redondeo; derivar los amplifica dividiendo por h.',
        visual: 'm4-derivacion',
        tabla: {
          titulo: 'Regímenes de error en diferencia central',
          columnas: ['Paso h', 'Error aprox.', 'Régimen dominante'],
          filas: [
            { umbral: 0, celdas: ['10⁻¹', '4.53×10⁻³', 'Truncamiento O(h²)'] },
            { umbral: 0.38, celdas: ['10⁻⁵', '5.86×10⁻¹¹', '✔ Óptimo numérico'], destacada: true },
            { umbral: 0.72, celdas: ['10⁻¹²', '2.10×10⁻⁴', 'Cancelación + redondeo'] },
          ],
        },
      },
    ],
  },

  diferenciales: {
    modulo: 'diferenciales',
    titulo: 'Ecuaciones diferenciales ordinarias: Euler, RK4 y estabilidad',
    subtitulo: 'Reconstrucción paso a paso de un sistema dinámico y límites del tamaño de paso',
    escenas: [
      {
        id: 'ed-v1',
        titulo: '1. Planteo: enfriamiento de servidor y solución exacta',
        duracion: 20,
        formulaTex: T`\frac{dT}{dt}=-k(T-T_a),\quad T(0)=80\,^\circ\text{C},\; T_a=20\,^\circ\text{C},\; k=0.5\text{ min}^{-1}`,
        pasosTex: [
          T`\text{Problema de valor inicial (PVI): } T'=-0.5(T-20),\; T(0)=80`,
          T`\text{Solución analítica de control: } T(t)=20+60\,e^{-0.5t}`,
          T`\text{Referencia en } t=0.5\text{ min}:\; T(0.5)=20+60\,e^{-0.25}=66.7280\,^\circ\text{C}`,
        ],
        narracion:
          'Modelamos el enfriamiento de un servidor desde ochenta grados Celsius en una sala a veinte grados con constante cero punto cinco por minuto. Esta ecuación diferencial define la pendiente en cada instante, y usaremos su solución exacta en medio minuto, sesenta y seis punto setenta y tres grados, como referencia.',
        notaClave: 'La constante de tiempo 1/k = 2 minutos marca el ritmo natural al que el sistema se acerca al equilibrio.',
        visual: 'm5-modelo',
        tabla: {
          titulo: 'Curva analítica T(t) = 20 + 60e^(−0.5t)',
          columnas: ['t (min)', 'T(t) exacta (°C)', 'Pendiente T′ (°C/min)'],
          filas: [
            { umbral: 0, celdas: ['0.0', '80.0000', '−30.000'] },
            { umbral: 0.35, celdas: ['0.5', '66.7280', '−23.364'] },
            { umbral: 0.7, celdas: ['1.0', '56.3918', '−18.196'], destacada: true },
          ],
        },
      },
      {
        id: 'ed-v2',
        titulo: '2. Euler explícito: primer paso h = 0.5 min',
        duracion: 21,
        formulaTex: T`T_{n+1}=T_n + h\,f(t_n, T_n),\qquad f(t,T)=-0.5(T-20)`,
        pasosTex: [
          T`\text{Pendiente inicial: } f(0,80)=-0.5(80-20)=-30\,^\circ\text{C/min}`,
          T`\text{Avance recto con } h=0.5:\; T_1 = 80 + 0.5(-30) = 65.000\,^\circ\text{C}`,
          T`\text{Error tras 1 paso: } |66.7280 - 65.000| = 1.7280\,^\circ\text{C}`,
        ],
        narracion:
          'El método de Euler explícito supone que la pendiente inicial se mantiene congelada durante todo el paso. En te igual a cero la razón de cambio vale menos cero punto cinco por sesenta, es decir menos treinta grados por minuto. Avanzando medio minuto multiplicamos menos treinta por cero punto cinco y caemos a sesenta y cinco grados.',
        notaClave: 'Como el enfriamiento es más lento conforme baja la temperatura, congelar la pendiente inicial siempre subestima T.',
        visual: 'm5-euler',
        tabla: {
          titulo: 'Primer paso de Euler (h = 0.5)',
          columnas: ['Magnitud', 'Sustitución', 'Valor'],
          filas: [
            { umbral: 0, celdas: ['f(0, 80)', '−0.5·(80 − 20)', '−30.000 °C/min'] },
            { umbral: 0.4, celdas: ['T₁', '80 + 0.5·(−30)', '65.000 °C'] },
            { umbral: 0.75, celdas: ['Error', '|66.7280 − 65|', '1.7280 °C'], destacada: true },
          ],
        },
      },
      {
        id: 'ed-v3',
        titulo: '3. Euler pasos 2 y 3: acumulación de error O(h)',
        duracion: 20,
        formulaTex: T`T_2=53.750\,^\circ\text{C},\qquad T_3=45.3125\,^\circ\text{C},\qquad E_{\text{global}}=O(h)`,
        pasosTex: [
          T`t=1.0:\; f(0.5, 65)=-0.5(45)=-22.5 \;\Rightarrow\; T_2=65+0.5(-22.5)=53.750\,^\circ\text{C}`,
          T`t=1.5:\; f(1.0, 53.75)=-16.875 \;\Rightarrow\; T_3=53.75+0.5(-16.875)=45.3125\,^\circ\text{C}`,
          T`\text{El error global crece de } 1.728 \text{ a } 2.642 \text{ y } 3.029\,^\circ\text{C}\text{ (orden 1)}`,
        ],
        narracion:
          'Continuamos con dos pasos más de Euler. Desde sesenta y cinco grados la nueva pendiente baja a menos veintidós punto cinco, llevando te sub dos a cincuenta y tres punto setenta y cinco grados. En el tercer paso llegamos a cuarenta y cinco punto tres uno dos cinco y el error supera los tres grados por ser de orden uno.',
        notaClave: 'Para reducir a la mitad el error global de Euler en t = 1.5 min hay que reducir h a la mitad y duplicar evaluaciones.',
        visual: 'm5-euler',
        tabla: {
          titulo: 'Trayectoria de Euler con h = 0.5',
          columnas: ['t_n', 'Euler T_n', 'Exacta', 'Error'],
          filas: [
            { umbral: 0, celdas: ['0.0', '80.0000', '80.0000', '0.0000'] },
            { umbral: 0.28, celdas: ['0.5', '65.0000', '66.7280', '1.7280'] },
            { umbral: 0.56, celdas: ['1.0', '53.7500', '56.3918', '2.6418'] },
            { umbral: 0.8, celdas: ['1.5', '45.3125', '48.3420', '3.0295'], destacada: true },
          ],
        },
      },
      {
        id: 'ed-v4',
        titulo: '4. Runge-Kutta 4 (RK4): las cuatro pendientes k₁..k₄',
        duracion: 20,
        formulaTex: T`k_1=f(t_n,T_n),\quad k_2=f\!\left(t_n+\tfrac{h}{2},T_n+\tfrac{h}{2}k_1\right),\quad k_3=f\!\left(t_n+\tfrac{h}{2},T_n+\tfrac{h}{2}k_2\right),\quad k_4=f(t_n+h,T_n+hk_3)`,
        pasosTex: [
          T`k_1=-30.00000\quad (\text{inicio});\qquad k_2=-0.5(80+0.25(-30)-20)=-26.25000`,
          T`k_3=-0.5(80+0.25(-26.25)-20)=-26.71875\quad (\text{punto medio corregido})`,
          T`k_4=-0.5(80+0.5(-26.71875)-20)=-23.32031\quad (\text{extremo derecho})`,
        ],
        narracion:
          'Runge-Kutta de cuarto orden mejora el avance muestreando cuatro pendientes dentro del paso hache igual a cero punto cinco. La inicial ka sub uno vale menos treinta; en el punto medio obtenemos ka sub dos igual a menos veintiséis punto veinticinco y ka sub tres en menos veintiséis punto setenta y dos, terminando con ka sub cuatro.',
        notaClave: 'k₂ y k₃ capturan la curvatura en el centro del intervalo tₙ + h/2, equivalente a los pesos de Simpson.',
        visual: 'm5-rk4',
        tabla: {
          titulo: 'Pendientes de RK4 en el paso [0, 0.5]',
          columnas: ['Etapa', 'Ubicación', 'Valor (°C/min)'],
          filas: [
            { umbral: 0, celdas: ['k₁', 't = 0.00', '−30.00000'] },
            { umbral: 0.25, celdas: ['k₂', 't = 0.25 (con k₁)', '−26.25000'] },
            { umbral: 0.55, celdas: ['k₃', 't = 0.25 (con k₂)', '−26.71875'] },
            { umbral: 0.8, celdas: ['k₄', 't = 0.50 (con k₃)', '−23.32031'], destacada: true },
          ],
        },
      },
      {
        id: 'ed-v5',
        titulo: '5. Promedio ponderado RK4: precisión de orden O(h⁴)',
        duracion: 17,
        formulaTex: T`T_1 = T_0 + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4) = 66.728516\,^\circ\text{C}`,
        pasosTex: [
          T`\text{Suma ponderada: } -30 + 2(-26.25) + 2(-26.71875) - 23.32031 = -159.25781`,
          T`T_1 = 80 + \frac{0.5}{6}(-159.25781) = 66.728516\,^\circ\text{C}`,
          T`\text{Error RK4: } 4.69\times 10^{-4}\,^\circ\text{C}\;\ll\;\text{Euler } 1.728\,^\circ\text{C}\;(\sim 3687\times\text{ menor})`,
        ],
        narracion:
          'Promediamos las cuatro pendientes con pesos uno, dos, dos, uno y multiplicamos por hache sextos. Resulta sesenta y seis punto siete dos ocho cinco grados, con error miles de veces menor que Euler usando exactamente el mismo paso.',
        notaClave: 'Con RK4 (O(h⁴)), dividir h entre 2 divide el error global entre 16.',
        visual: 'm5-rk4',
        tabla: {
          titulo: 'Comparación directa en t = 0.5 (h = 0.5)',
          columnas: ['Método', 'T₁ (°C)', 'Error absoluto'],
          filas: [
            { umbral: 0, celdas: ['Exacta', '66.728047', '0'] },
            { umbral: 0.35, celdas: ['Euler (orden 1)', '65.000000', '1.728047'] },
            { umbral: 0.72, celdas: ['RK4 (orden 4)', '66.728516', '0.000469 (3687× mejor)'], destacada: true },
          ],
        },
      },
      {
        id: 'ed-v6',
        titulo: '6. Límite de estabilidad numérica: explosión con h = 5',
        duracion: 17,
        formulaTex: T`T_{n}-T_a = R^n(T_0-T_a),\qquad R=1-kh,\qquad |R|<1\;\Longleftrightarrow\; h<\frac{2}{k}=4\text{ min}`,
        pasosTex: [
          T`\text{Con } k=0.5\text{ y } h=5\text{ min}:\; R = 1 - 0.5(5) = -1.5`,
          T`|R|=1.5>1 \;\Rightarrow\; \text{las potencias } (-1.5)^n \text{ crecen sin cota}`,
          T`\text{Secuencia: } 80 \;\to\; -70 \;\to\; +155 \;\to\; -182.5\,^\circ\text{C}\text{ (explosión)}`,
        ],
        narracion:
          'Si exageramos el paso, Euler puede explotar. El factor multiplicador erre igual a uno menos ka por hache exige módulo menor que uno. Con paso cinco minutos frente al límite de cuatro, erre vale menos uno punto cinco y diverge.',
        notaClave: 'En problemas rígidos donde k es enorme, los métodos explícitos requieren pasos diminutos para no diverger.',
        visual: 'm5-estabilidad',
        tabla: {
          titulo: 'Divergencia oscilatoria con h = 5 min (R = −1.5)',
          columnas: ['n', 't (min)', 'T_n (°C)', 'Diagnóstico'],
          filas: [
            { umbral: 0, celdas: ['0', '0', '80.0', 'Inicial'] },
            { umbral: 0.25, celdas: ['1', '5', '−70.0', 'Salto negativo'] },
            { umbral: 0.55, celdas: ['2', '10', '+155.0', 'Amplifica 1.5×'] },
            { umbral: 0.8, celdas: ['3', '15', '−182.5', '✖ Inestable (|R| > 1)'], destacada: true },
          ],
        },
      },
      {
        id: 'ed-v7',
        titulo: '7. Estable no equivale a físicamente válido (h = 3 min)',
        duracion: 20,
        formulaTex: T`h=3\text{ min}:\; R=1-0.5(3)=-0.5,\qquad |R|<1 \;\text{ pero }\; R<0`,
        pasosTex: [
          T`\text{Trayectoria: } 80 \;\to\; -10 \;\to\; +35 \;\to\; +12.5 \;\to\; +23.75\,^\circ\text{C}`,
          T`\text{Converge a } 20\,^\circ\text{C}\text{ (estable), pero cae bajo la sala }( -10\,^\circ\text{C})`,
          T`\text{Monotonía física exige } R>0 \;\Longleftrightarrow\; kh<1 \;\Longleftrightarrow\; h<2\text{ min}`,
        ],
        narracion:
          'Incluso dentro del límite estable puede fallar la física. Con paso de tres minutos el factor erre vale menos cero punto cinco: la solución converge hacia veinte grados pero en el primer paso cae a diez grados bajo cero, lo cual es imposible enfriando con aire a veinte. Exige siempre ka por hache menor que uno.',
        notaClave: 'Separa siempre tres criterios en tu examen: estabilidad (no explota), validez física (R > 0) y precisión (orden en h).',
        visual: 'm5-fisica',
        tabla: {
          titulo: 'Regímenes del paso h en T′ = −0.5(T − 20)',
          columnas: ['Rango de h', 'Factor R', 'Comportamiento'],
          filas: [
            { umbral: 0, celdas: ['0 < h < 2 min', '0 < R < 1', '✔ Estable, monótono y físico'], destacada: true },
            { umbral: 0.35, celdas: ['2 ≤ h < 4 min', '−1 < R ≤ 0', '⚠ Estable pero oscila bajo T_a'] },
            { umbral: 0.72, celdas: ['h ≥ 4 min', '|R| ≥ 1', '✖ Inestable (explota)'] },
          ],
        },
      },
    ],
  },
}
