import { useMemo } from "react";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import TablaPasos from "../../components/TablaPasos";
import { eliminacionGauss, gaussSeidel } from "../../core/m2";
import { fmt } from "../../core/formato";
import CalcGauss from "./CalcGauss";
import CalcGaussSeidel, { columnasGS } from "./CalcGaussSeidel";
import Comparacion from "./Comparacion";
import { EJERCICIOS_M2, PREGUNTAS_M2 } from "./practica";
import { MatrizTabla } from "./sistema";

const A = [
  [4, 1, 1],
  [1, 5, 1],
  [1, 1, 6],
];
const b = [9, 14, 21];
const SECCIONES = [
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplos resueltos"],
  ["gauss", "Calculadora: eliminación"],
  ["gs", "Calculadora: Gauss-Seidel"],
  ["comparacion", "Caso aplicado y comparación"],
  ["limites", "Pivotes y singularidad"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function Modulo2() {
  const g = useMemo(() => eliminacionGauss({ A, b }), []);
  const gs = useMemo(() => gaussSeidel({ A, b, tol: 1e-6, maxIter: 100 }), []);
  return (
    <ModuloConIndice secciones={SECCIONES}>
      <article className="modulo">
        <h1>Módulo 2: Sistemas de ecuaciones lineales</h1>
        <p>
          <strong>Objetivo:</strong> resolver sistemas pequeños (de 2 × 2 a 4 ×
          4) y comparar un método directo con uno iterativo a través del
          residuo.
        </p>
        <p> Métodos: eliminación con pivoteo parcial y Gauss-Seidel.</p>

        <section id="teoria" aria-labelledby="h-teoria">
          <h2 id="h-teoria">Teoría</h2>
          <p>
            <strong>Caso aplicado (datos sintéticos).</strong> Estimación de la
            demanda de tres servicios a partir de mediciones agregadas. Las
            incógnitas <Matematica tex="x_1,x_2,x_3" /> son índices normalizados
            de demanda (sin unidades) y cada ecuación es una medición agregada:
          </p>
          <Matematica
            bloque
            tex="\begin{pmatrix}4&1&1\\1&5&1\\1&1&6\end{pmatrix}\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}=\begin{pmatrix}9\\14\\21\end{pmatrix}"
          />
          <h3>Eliminación gaussiana con pivoteo parcial</h3>
          <p>
            En cada columna <Matematica tex="k" /> se elige como pivote la fila
            con mayor <Matematica tex="|a_{ik}|" /> entre las restantes, se
            intercambia, se anulan las entradas inferiores con{" "}
            <Matematica tex="m_{ik}=a_{ik}/a_{kk}" /> y se resuelve por
            sustitución hacia atrás:
          </p>
          <Matematica
            bloque
            tex="x_i=\frac{1}{a_{ii}}\Bigl(b_i-\sum_{j>i}a_{ij}x_j\Bigr)"
          />
          <p>
            <em>Limitaciones:</em> un pivote pequeño amplifica los errores de
            redondeo y un pivote nulo indica un sistema singular. Aquí un pivote
            se declara nulo si{" "}
            <Matematica tex="|p|\le 10^{-12}\cdot\max|a_{ij}|" /> y se advierte
            si <Matematica tex="|p|<10^{-6}\cdot\max|a_{ij}|" />.
          </p>
          <h3>Gauss-Seidel</h3>
          <Matematica
            bloque
            tex="x_i^{(k+1)}=\frac{1}{a_{ii}}\Bigl(b_i-\sum_{j<i}a_{ij}x_j^{(k+1)}-\sum_{j>i}a_{ij}x_j^{(k)}\Bigr)"
          />
          <p>
            Se parte del vector cero y se usan de inmediato los valores ya
            actualizados. Parada:{" "}
            <Matematica tex="\|b-Ax^{(k)}\|_\infty\le\text{tol}" />, con
            tolerancia <Matematica tex="10^{-6}" /> y máximo 100 iteraciones.
          </p>
          <p className="aviso">
            <strong>Convergencia.</strong> Si{" "}
            <Matematica tex="|a_{ii}|>\sum_{j\ne i}|a_{ij}|" /> en cada fila
            (dominancia diagonal estricta), Gauss-Seidel converge para cualquier
            vector inicial: es una condición <em>suficiente</em>,{" "}
            <strong>no necesaria</strong>. En el caso base: 4 &gt; 2, 5 &gt; 2 y
            6 &gt; 2, y por eso converge. Un sistema sin esa propiedad puede o
            no converger: a veces basta <em>reordenar las ecuaciones</em> para
            obtenerla (la calculadora ofrece esa opción y muestra el orden
            usado).
          </p>
        </section>

        <section id="ejemplos" aria-labelledby="h-ejemplos">
          <h2 id="h-ejemplos">Ejemplos resueltos</h2>
          <h3>Ejemplo 1: eliminación con pivoteo</h3>
          <p>
            Matriz aumentada inicial y matriz triangular final (calculadas por
            el motor). La solución es <Matematica tex="(1,2,3)" />; al
            sustituir: <Matematica tex="4+2+3=9" />,{" "}
            <Matematica tex="1+10+3=14" />, <Matematica tex="1+2+18=21" />.
          </p>
          <MatrizTabla
            titulo="Matriz aumentada inicial"
            M={A.map((f, i) => [...f, b[i]])}
          />
          {g.pasos.length > 0 && (
            <MatrizTabla
              titulo="Matriz triangular superior tras la eliminación"
              M={g.pasos[g.pasos.length - 1].matriz}
            />
          )}
          <p>
            Solución:{" "}
            {g.resultado?.x
              .map((v, i) => `x${i + 1} = ${fmt(v, 10)}`)
              .join(", ")}
            .
          </p>
          <h3>Ejemplo 2: Gauss-Seidel desde el vector cero</h3>
          <p>
            Primera iteración: <Matematica tex="x_1=(9-0-0)/4=2.25" />,{" "}
            <Matematica tex="x_2=(14-2.25-0)/5=2.35" />,{" "}
            <Matematica tex="x_3=(21-2.25-2.35)/6\approx 2.7333333333" />.
          </p>
          <TablaPasos
            titulo="Primeras iteraciones de Gauss-Seidel"
            pasos={gs.pasos.slice(0, 4)}
            columnas={columnasGS(3)}
          />
          <p>
            Con tolerancia <Matematica tex="10^{-6}" /> converge en{" "}
            {gs.resultado?.iteraciones} iteraciones.
          </p>
        </section>

        <section id="gauss" aria-labelledby="h-g">
          <h2 id="h-g">Calculadora: eliminación con pivoteo</h2>
          <CalcGauss />
        </section>
        <section id="gs" aria-labelledby="h-gs">
          <h2 id="h-gs">Calculadora: Gauss-Seidel</h2>
          <CalcGaussSeidel />
        </section>
        <section id="comparacion" aria-labelledby="h-c">
          <h2 id="h-c">Caso aplicado y comparación</h2>
          <p>
            Compara la solución, el residuo y el procedimiento de ambos métodos
            con el mismo sistema. Si uno falla, se muestra su estado sin ocultar
            la salida del otro.
          </p>
          <Comparacion />
        </section>
        <section id="limites" aria-labelledby="h-l">
          <h2 id="h-l">Pivotes pequeños y sistemas singulares</h2>
          <p>
            Un sistema es singular cuando <Matematica tex="\det A=0" />: no hay
            solución única (o no hay solución, o hay infinitas). Ejemplo: filas{" "}
            <Matematica tex="(1,2)" /> y <Matematica tex="(2,4)" /> con{" "}
            <Matematica tex="b=(3,6)" /> son proporcionales. El programa lo
            detecta con el criterio de pivote (eliminación) y con el
            determinante relativo (Gauss-Seidel) y{" "}
            <strong>no muestra ninguna solución</strong>. Use el botón «Probar
            fallo» de cada calculadora.
          </p>
        </section>

        <section id="ejercicios" aria-labelledby="h-ejer">
          <h2 id="h-ejer">Ejercicios propuestos</h2>
          <p>
            Intenta cada ejercicio antes de abrir su solución. Dos son de nivel
            intermedio y dos avanzados.
          </p>
          <Ejercicios items={EJERCICIOS_M2} />
        </section>

        <section id="autoevaluacion" aria-labelledby="h-auto">
          <h2 id="h-auto">Autoevaluación</h2>
          <p>
            Seis preguntas: opción múltiple, verdadero/falso y numéricas con
            tolerancia. La corrección y su explicación aparecen al pulsar
            «Comprobar».
          </p>
          <Autoevaluacion preguntas={PREGUNTAS_M2} />
        </section>
      </article>
    </ModuloConIndice>
  );
}
