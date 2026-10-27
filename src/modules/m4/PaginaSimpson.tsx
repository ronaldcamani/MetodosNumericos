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
import { integrarTasa } from "../../core/m4";
import { herramientasIntegracion, PAGINAS_INTEGRACION } from "./paginas";
import { EJERCICIOS_SIMPSON, PREGUNTAS_SIMPSON } from "./practica";
import { TASA_N3 } from "./tasa";

const M = Matematica;
const entrada = { tasa: { a: 1, b: 0, c: 1 }, inicio: 0, fin: 2, n: 4 };
const SECCIONES = [
  ["idea", "La idea: parábolas"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplo resuelto"],
  ["cuidados", "Cuidados"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function PaginaSimpson() {
  const simp = integrarTasa("simpson", entrada);
  return (
    <ConPanelCalculadora herramientas={herramientasIntegracion("simpson")}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Integración y derivación numérica · Simpson compuesto</h1>
          <SubNavegacion enlaces={PAGINAS_INTEGRACION} etiqueta="Páginas de integración y derivación numérica" />
          <p>
            <strong>Objetivo:</strong> aproximar una integral con arcos de parábola, entender por qué exige n par y cuándo es exacto.
          </p>
          <p className="aviso">
            ¿Trapecio o Simpson? Revisa <Link to="/integracion">Planteo y decisión</Link>. La calculadora está en el panel lateral:{" "}
            <AbrirCalculadora preset={{ herramienta: "simpson" }}>Abrir calculadora</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">La idea: parábolas</h2>
            <p>
              En lugar de segmentos, Simpson ajusta una <strong>parábola</strong> por cada tres nodos consecutivos y suma el área bajo ellas. Como cada parábola cubre dos subintervalos,{" "}
              <strong>n debe ser par</strong>. Captura la curvatura que el trapecio ignora.
            </p>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <M bloque tex="S_n=\frac h3\Bigl(r_0+4r_1+2r_2+4r_3+\dots+4r_{n-1}+r_n\Bigr),\qquad E\approx-\frac{(b-a)h^4}{180}\,r^{(4)}(\xi)" />
            <ol className="algoritmo">
              <li>Fijar <M tex="n" /> par y calcular <M tex="h=(b-a)/n" />.</li>
              <li>Evaluar la tasa en los nodos <M tex="t_i=a+ih" />.</li>
              <li>Aplicar los pesos 1, 4, 2, 4, …, 4, 1 y multiplicar por <M tex="h/3" />.</li>
              <li>Duplicar <M tex="n" /> y comprobar que el error baja unas 16 veces.</li>
            </ol>
            <p>
              Es exacto para polinomios de grado ≤ 3 y su error crece con la cuarta derivada: converge más rápido que el trapecio (<M tex="h^4" />) pero{" "}
              <strong>no es exacto en general</strong>.
            </p>
            <div className="dos-columnas">
              <div>
                <h4>Cuándo usarlo</h4>
                <ul>
                  <li>Tasa suave y n par.</li>
                  <li>Alta precisión con pocos nodos.</li>
                  <li>Evaluar la tasa es costoso.</li>
                </ul>
              </div>
              <div>
                <h4>Cuándo no</h4>
                <ul>
                  <li>n impar impuesto.</li>
                  <li>Tasa con saltos o picos (la cuarta derivada es grande).</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplo resuelto: Simpson con n = 4</h2>
            <TablaPasos titulo="Simpson 1/3 compuesto, n = 4" pasos={simp.pasos} columnas={[
              { clave: "i", titulo: "i", valor: (p) => p.i }, { clave: "t", titulo: "tᵢ (s)", valor: (p) => p.t }, { clave: "r", titulo: "r(tᵢ) (MB/s)", valor: (p) => p.r },
              { clave: "w", titulo: "peso", valor: (p) => p.peso }, { clave: "c", titulo: "h/3·peso·r (MB)", valor: (p) => p.contribucion }, { clave: "s", titulo: "suma parcial (MB)", valor: (p) => p.sumaParcial },
            ]} />
            <p>
              Resultado: <strong>{fmt(simp.resultado?.integral, 10)} MB</strong>; el error ({fmt(simp.resultado?.errorAbs, 3)}) es solo redondeo porque la tasa es cuadrática.{" "}
              <AbrirCalculadora preset={{ herramienta: "simpson" }}>Reproducir en la calculadora</AbrirCalculadora>
            </p>
          </section>

          <section id="cuidados" aria-labelledby="h-cui">
            <h2 id="h-cui">Cuidados</h2>
            <ul>
              <li>
                <strong>n impar.</strong> Se rechaza y se sugiere 2 o 4.{" "}
                <AbrirCalculadora preset={{ herramienta: "simpson", valores: TASA_N3 }}>Probar n = 3</AbrirCalculadora>
              </li>
              <li><strong>Exactitud.</strong> Que Simpson sea exacto en el caso base es una propiedad de los polinomios de grado ≤ 3, no de la regla (ejercicio 2).</li>
              <li><strong>Suavidad.</strong> Con saltos o picos pierde su ventaja sobre el trapecio.</li>
            </ul>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio antes de abrir la pista o la solución. Uno es intermedio y otro avanzado.</p>
            <Ejercicios items={EJERCICIOS_SIMPSON} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Tres preguntas con explicación; abre «Profundiza» para el porqué.</p>
            <Autoevaluacion preguntas={PREGUNTAS_SIMPSON} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
