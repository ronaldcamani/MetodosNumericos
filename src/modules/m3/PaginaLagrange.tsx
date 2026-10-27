import { Link } from "react-router-dom";
import AbrirCalculadora from "../../components/AbrirCalculadora";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import { ConPanelCalculadora } from "../../components/PanelCalculadora";
import SubNavegacion from "../../components/SubNavegacion";
import TablaPasos from "../../components/TablaPasos";
import { fmt } from "../../core/formato";
import { lagrange } from "../../core/m3";
import { DATOS_REPETIDOS, DATOS_RUNGE } from "./datos";
import { herramientasInterpolacion, PAGINAS_INTERPOLACION } from "./paginas";
import { EJERCICIOS_LAGRANGE, PREGUNTAS_LAGRANGE } from "./practica";

const M = Matematica;
const SECCIONES = [
  ["idea", "La idea: pasar por los datos"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplo resuelto"],
  ["cuidados", "Cuidados"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function PaginaLagrange() {
  const lag = lagrange({ x: [0, 1, 2, 3], y: [1, 2, 2, 4], consulta: 1.5 });
  return (
    <ConPanelCalculadora herramientas={herramientasInterpolacion()}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Interpolación y ajuste de curvas · Interpolación de Lagrange</h1>
          <SubNavegacion enlaces={PAGINAS_INTERPOLACION} etiqueta="Páginas de interpolación y ajuste de curvas" />
          <p>
            <strong>Objetivo:</strong> construir el polinomio que pasa exactamente por 2 a 6 nodos, ver la contribución de cada base y saber cuándo no fiarse de él.
          </p>
          <p className="aviso">
            ¿Interpolar o ajustar? Revisa <Link to="/interpolacion">Planteo y decisión</Link>. La calculadora está en el panel lateral:{" "}
            <AbrirCalculadora preset={{ herramienta: "lagrange" }}>Abrir calculadora</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">La idea: pasar por los datos</h2>
            <p>
              Dados <M tex="n" /> puntos con abscisas distintas hay un único polinomio de grado <M tex="\le n-1" /> que pasa por todos. Se construye como suma de
              «bases» que valen 1 en un nodo y 0 en los demás, ponderadas por los valores <M tex="y_i" />. Interpolar es la herramienta cuando los datos son
              exactos y se necesita un valor <em>entre</em> los nodos.
            </p>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <p><strong>Caso aplicado.</strong> Latencia (ms) frente a carga normalizada: <M tex="(0,1),(1,2),(2,2),(3,4)" />; se consulta <M tex="x=1.5" />.</p>
            <M bloque tex="P(x)=\sum_{i=0}^{n-1}y_i\,L_i(x),\qquad L_i(x)=\prod_{j\ne i}\frac{x-x_j}{x_i-x_j}" />
            <ol className="algoritmo">
              <li>Comprobar que las abscisas son distintas (si no, rechazar la entrada).</li>
              <li>Para cada nodo <M tex="i" /> calcular la base <M tex="L_i(x)" /> en el punto consultado.</li>
              <li>Multiplicar cada base por <M tex="y_i" /> y sumar las contribuciones.</li>
              <li>Avisar si la consulta está fuera del intervalo de los datos o si el grado es alto.</li>
            </ol>
            <p>Cada base cumple <M tex="L_i(x_k)=1" /> si <M tex="k=i" /> y <M tex="0" /> en los demás nodos, y <M tex="\sum_iL_i(x)=1" />.</p>
            <div className="dos-columnas">
              <div>
                <h3>Cuándo usarla</h3>
                <ul>
                  <li>Datos exactos y valor entre nodos.</li>
                  <li>Pocos nodos (grado bajo).</li>
                  <li>Se necesita que la curva pase por los puntos.</li>
                </ul>
              </div>
              <div>
                <h3>Cuándo no</h3>
                <ul>
                  <li>Datos con ruido de medición.</li>
                  <li>Muchos nodos equiespaciados (oscilación).</li>
                  <li>Consultas fuera del intervalo.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplo resuelto: Lagrange en x = 1.5</h2>
            <p>
              Por ejemplo, <M tex="L_1(1.5)=\dfrac{(1.5-0)(1.5-2)(1.5-3)}{(1-0)(1-2)(1-3)}=\dfrac{1.125}{2}=0.5625" />. Las cuatro bases y sus contribuciones (calculadas por el motor):
            </p>
            <TablaPasos titulo="Bases de Lagrange en x = 1.5" pasos={lag.pasos} columnas={[
              { clave: "i", titulo: "i", valor: (p) => p.i }, { clave: "x", titulo: "xᵢ", valor: (p) => p.xi }, { clave: "y", titulo: "yᵢ", valor: (p) => p.yi },
              { clave: "L", titulo: "Lᵢ(1.5)", valor: (p) => p.base }, { clave: "c", titulo: "yᵢ · Lᵢ(1.5)", valor: (p) => p.contribucion },
            ]} />
            <p>
              Suma: <M tex="P(1.5)=" /> {fmt(lag.resultado?.valor, 10)} (las bases suman 1).{" "}
              <AbrirCalculadora preset={{ herramienta: "lagrange" }}>Reproducir en la calculadora</AbrirCalculadora>
            </p>
          </section>

          <section id="cuidados" aria-labelledby="h-cui">
            <h2 id="h-cui">Cuidados</h2>
            <ul>
              <li>
                <strong>Abscisas repetidas.</strong> Se rechazan: no define una función y no se elimina ningún nodo en silencio.{" "}
                <AbrirCalculadora preset={{ herramienta: "lagrange", valores: DATOS_REPETIDOS }}>Probar fallo</AbrirCalculadora>
              </li>
              <li>
                <strong>Grado alto (Runge).</strong> Con 6 nodos de <M tex="1/(1+25x^2)" /> el polinomio oscila y toma valores negativos.{" "}
                <AbrirCalculadora preset={{ herramienta: "lagrange", valores: DATOS_RUNGE }}>Ver la oscilación</AbrirCalculadora>
              </li>
              <li>
                <strong>Extrapolación.</strong> Fuera de <M tex="[\min x,\max x]" /> se calcula con aviso.{" "}
                <AbrirCalculadora preset={{ herramienta: "lagrange", valores: { consulta: "5" } }}>Probar x = 5</AbrirCalculadora>
              </li>
              <li><strong>Interpolar no elimina el error de medición</strong>: lo reproduce.</li>
            </ul>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio antes de abrir la pista o la solución. Uno es intermedio y otro avanzado; en los que tienen «Tu plan», decide primero.</p>
            <Ejercicios items={EJERCICIOS_LAGRANGE} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Tres preguntas con explicación; abre «Profundiza» para el porqué.</p>
            <Autoevaluacion preguntas={PREGUNTAS_LAGRANGE} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
