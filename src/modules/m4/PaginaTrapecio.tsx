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
import { EJERCICIOS_TRAPECIO, PREGUNTAS_TRAPECIO } from "./practica";
import { TASA_NEGATIVA } from "./tasa";

const M = Matematica;
const entrada = { tasa: { a: 1, b: 0, c: 1 }, inicio: 0, fin: 2, n: 4 };
const SECCIONES = [
  ["idea", "La idea: trapecios"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplo resuelto"],
  ["cuidados", "Cuidados"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function PaginaTrapecio() {
  const trap = integrarTasa("trapecio", entrada);
  return (
    <ConPanelCalculadora herramientas={herramientasIntegracion("trapecio")}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Integración y derivación numérica · Trapecio compuesto</h1>
          <SubNavegacion enlaces={PAGINAS_INTEGRACION} etiqueta="Páginas de integración y derivación numérica" />
          <p>
            <strong>Objetivo:</strong> aproximar una integral con trapecios, controlar su error con el paso <M tex="h" /> y reconocer sus límites.
          </p>
          <p className="aviso">
            ¿Trapecio o Simpson? Revisa <Link to="/integracion">Planteo y decisión</Link>. La calculadora está en el panel lateral:{" "}
            <AbrirCalculadora preset={{ herramienta: "trapecio" }}>Abrir calculadora</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">La idea: trapecios</h2>
            <p>
              Se divide <M tex="[a,b]" /> en <M tex="n" /> subintervalos iguales y en cada uno se reemplaza la curva por el segmento que une sus extremos: el área bajo cada segmento es un
              trapecio. La suma de todos aproxima la integral.
            </p>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <p>
              <strong>Caso aplicado.</strong> <M tex="r(t)=t^2+1" /> MB/s en <M tex="[0,2]" /> s; volumen exacto <M tex="14/3" /> MB.
            </p>
            <M bloque tex="T_n=\frac h2\Bigl(r_0+2r_1+\dots+2r_{n-1}+r_n\Bigr),\qquad E\approx-\frac{(b-a)h^2}{12}\,r''(\xi)" />
            <ol className="algoritmo">
              <li>Fijar <M tex="n\ge1" /> y calcular <M tex="h=(b-a)/n" />.</li>
              <li>Evaluar la tasa en los nodos <M tex="t_i=a+ih" />.</li>
              <li>Aplicar los pesos 1, 2, 2, …, 2, 1 y multiplicar por <M tex="h/2" />.</li>
              <li>Comparar con una malla más fina: el error debería bajar unas 4 veces al duplicar <M tex="n" />.</li>
            </ol>
            <div className="dos-columnas">
              <div>
                <h3>Cuándo usarlo</h3>
                <ul>
                  <li>Se impone un n impar.</li>
                  <li>La tasa no es suave.</li>
                  <li>Se busca un método simple y predecible.</li>
                </ul>
              </div>
              <div>
                <h3>Cuándo no</h3>
                <ul>
                  <li>La tasa es suave y se quiere alta precisión con pocos nodos: Simpson rinde más.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplo resuelto: trapecio con n = 4</h2>
            <p><M tex="h=0.5" />. Nodos, pesos y sumas parciales (calculados por el motor):</p>
            <TablaPasos titulo="Trapecio compuesto, n = 4" pasos={trap.pasos} columnas={[
              { clave: "i", titulo: "i", valor: (p) => p.i }, { clave: "t", titulo: "tᵢ (s)", valor: (p) => p.t }, { clave: "r", titulo: "r(tᵢ) (MB/s)", valor: (p) => p.r },
              { clave: "w", titulo: "peso", valor: (p) => p.peso }, { clave: "c", titulo: "h/2·peso·r (MB)", valor: (p) => p.contribucion }, { clave: "s", titulo: "suma parcial (MB)", valor: (p) => p.sumaParcial },
            ]} />
            <p>
              Resultado: <strong>{fmt(trap.resultado?.integral, 10)} MB</strong>; error absoluto {fmt(trap.resultado?.errorAbs, 10)} MB (= 1/12). Con n = 2, 4, 8 los errores son 1/3, 1/12 y 1/48:{" "}
              cada duplicación divide el error entre 4.{" "}
              <AbrirCalculadora preset={{ herramienta: "trapecio" }}>Reproducir en la calculadora</AbrirCalculadora>
            </p>
          </section>

          <section id="cuidados" aria-labelledby="h-cui">
            <h2 id="h-cui">Cuidados</h2>
            <ul>
              <li>
                <strong>n entero positivo.</strong> <M tex="n=0" /> se rechaza.{" "}
                <AbrirCalculadora preset={{ herramienta: "trapecio", valores: { n: "0" } }}>Probar n = 0</AbrirCalculadora>
              </li>
              <li>
                <strong>Tasa negativa.</strong> Se calcula con aviso: es un acumulado neto, no un volumen.{" "}
                <AbrirCalculadora preset={{ herramienta: "trapecio", valores: TASA_NEGATIVA }}>Ver el aviso</AbrirCalculadora>
              </li>
              <li><strong>Funciones convexas.</strong> Los trapecios quedan por encima de la curva y sobrestiman; en funciones cóncavas ocurre lo contrario.</li>
            </ul>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio antes de abrir la pista o la solución. Uno es intermedio y otro avanzado; en los que tienen «Tu plan», decide primero.</p>
            <Ejercicios items={EJERCICIOS_TRAPECIO} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Tres preguntas con explicación; abre «Profundiza» para el porqué.</p>
            <Autoevaluacion preguntas={PREGUNTAS_TRAPECIO} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
