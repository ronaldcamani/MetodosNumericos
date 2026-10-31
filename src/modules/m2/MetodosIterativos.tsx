import { Link } from "react-router-dom";
import AbrirCalculadora from "../../components/AbrirCalculadora";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import { ConPanelCalculadora } from "../../components/PanelCalculadora";
import SubNavegacion from "../../components/SubNavegacion";
import TablaPasos from "../../components/TablaPasos";
import { gaussSeidel } from "../../core/m2";
import { columnasGS } from "./CalcGaussSeidel";
import { EJERCICIO_3 } from "./ejercicios";
import { EJERCICIOS_ITERATIVOS, PREGUNTAS_ITERATIVOS } from "./practica";
import { herramientasSistemas, PAGINAS_SISTEMAS, presetSistema } from "./paginas";

const M = Matematica;
const A = [[4, 1, 1], [1, 5, 1], [1, 1, 6]];
const b = [9, 14, 21];
const SECCIONES = [
  ["idea", "La idea: aproximar"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplo resuelto"],
  ["fallos", "Cuándo falla"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function MetodosIterativos() {
  const gs = gaussSeidel({ A, b, tol: 1e-6, maxIter: 100 });
  return (
    <ConPanelCalculadora herramientas={herramientasSistemas()}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Sistemas de ecuaciones lineales · Métodos iterativos</h1>
          <SubNavegacion enlaces={PAGINAS_SISTEMAS} etiqueta="Páginas de sistemas de ecuaciones lineales" />
          <p>
            <strong>Objetivo:</strong> aproximar la solución con Gauss-Seidel, controlar el error con el residuo y saber cuándo converge.
          </p>
          <p className="aviso">
            ¿Dudas sobre qué método usar? Revisa <Link to="/sistemas">Planteo y decisión</Link>. La calculadora está en el panel lateral:{" "}
            <AbrirCalculadora preset={{ herramienta: "gs" }}>Abrir calculadora</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">La idea: aproximar</h2>
            <p>
              Un método iterativo parte de un vector inicial y lo mejora paso a paso. No da la solución en un número fijo de operaciones, pero cada
              iteración es barata y se detiene cuando el residuo es suficientemente pequeño. A cambio, <strong>solo funciona si converge</strong>.
            </p>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <h3>Gauss-Seidel</h3>
            <M bloque tex="x_i^{(k+1)}=\frac{1}{a_{ii}}\Bigl(b_i-\sum_{j<i}a_{ij}x_j^{(k+1)}-\sum_{j>i}a_{ij}x_j^{(k)}\Bigr)" />
            <ol className="algoritmo">
              <li>Partir del vector inicial (por defecto, el vector cero).</li>
              <li>Recorrer las ecuaciones en orden y usar de inmediato los valores ya actualizados.</li>
              <li>Calcular el residuo <M tex="\|b-Ax^{(k)}\|_\infty" />.</li>
              <li>Parar si es ≤ tolerancia (aquí <M tex="10^{-6}" />); si se agota el máximo (100) <strong>no</strong> se declara convergencia.</li>
            </ol>
            <p className="idea">
              <strong>Convergencia.</strong> Si <M tex="|a_{ii}|>\sum_{j\ne i}|a_{ij}|" /> en cada fila (dominancia diagonal estricta), Gauss-Seidel converge para cualquier vector inicial: es una condición <em>suficiente</em>, <strong>no necesaria</strong>. En el caso base: 4 &gt; 2, 5 &gt; 2 y 6 &gt; 2. Un sistema sin esa propiedad puede o no converger: a veces basta <em>reordenar las ecuaciones</em> (la calculadora ofrece esa opción y muestra el orden usado).
            </p>
            <div className="dos-columnas">
              <div>
                <h3>Cuándo usarlo</h3>
                <ul>
                  <li>Sistemas grandes y con diagonal dominante.</li>
                  <li>Una aproximación con residuo pequeño es suficiente.</li>
                </ul>
              </div>
              <div>
                <h3>Cuándo no</h3>
                <ul>
                  <li>No se sabe si converge y no se puede comprobar la dominancia.</li>
                  <li>El sistema es singular o casi singular.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplo resuelto</h2>
            <p>
              Primera iteración desde el vector cero: <M tex="x_1=(9-0-0)/4=2.25" />, <M tex="x_2=(14-2.25-0)/5=2.35" />,{" "}
              <M tex="x_3=(21-2.25-2.35)/6\approx2.7333333333" />.
            </p>
            <TablaPasos titulo="Primeras iteraciones de Gauss-Seidel" pasos={gs.pasos.slice(0, 4)} columnas={columnasGS(3)} />
            <p>
              Con tolerancia <M tex="10^{-6}" /> converge en {gs.resultado?.iteraciones} iteraciones.{" "}
              <AbrirCalculadora preset={{ herramienta: "gs" }}>Reproducir en la calculadora</AbrirCalculadora>
            </p>
          </section>

          <section id="fallos" aria-labelledby="h-fallos">
            <h2 id="h-fallos">Cuándo falla</h2>
            <ul>
              <li>
                <strong>Sin dominancia.</strong> El sistema del ejercicio 3 tal como está escrito diverge:{" "}
                <AbrirCalculadora preset={{ herramienta: "gs", valores: { ...EJERCICIO_3.sistema, tol: "0.0001", x01: "1", x02: "1", x03: "1", orden: "tal_cual" } }}>probar sin reordenar</AbrirCalculadora>.
                Reordenando converge a (1, −2, 3):{" "}
                <AbrirCalculadora preset={{ herramienta: "gs", valores: { ...EJERCICIO_3.sistema, tol: "0.0001", x01: "1", x02: "1", x03: "1", orden: "reordenar" } }}>probar reordenando</AbrirCalculadora>.
              </li>
              <li>
                <strong>Máximo de iteraciones.</strong> Si se agota, el portal informa «sin convergencia» y no un éxito:{" "}
                <AbrirCalculadora preset={{ herramienta: "gs", valores: { maxIter: "2" } }}>probar con 2 iteraciones</AbrirCalculadora>.
              </li>
              <li>
                <strong>Sistema singular.</strong> Se detecta antes de iterar:{" "}
                <AbrirCalculadora preset={presetSistema("gs", [[1, 2], [2, 4]], [3, 6])}>probar fallo</AbrirCalculadora>.
              </li>
            </ul>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio por tu cuenta antes de revelar los pasos de la solución (se muestran uno a uno). Uno es intermedio y otro avanzado; en los que tienen «Tu plan», decide primero.</p>
            <Ejercicios items={EJERCICIOS_ITERATIVOS} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Tres preguntas con explicación; abre «Profundiza» para el porqué.</p>
            <Autoevaluacion preguntas={PREGUNTAS_ITERATIVOS} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
