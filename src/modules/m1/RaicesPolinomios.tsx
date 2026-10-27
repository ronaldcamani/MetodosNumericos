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
import { cotaCauchy, horner, polinomioTexto, raicesPolinomio } from "../../core/m1";
import { herramientasRaices, PAGINAS_M1 } from "./paginas";
import { EJERCICIOS_POLINOMIOS, PREGUNTAS_POLINOMIOS } from "./practicaPolinomios";

const M = Matematica;
const SECCIONES = [
  ["idea", "Por qué los polinomios son especiales"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplos resueltos"],
  ["cuidados", "Cuidados"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

const COEF_BASE = [1, 0, -1, -2];
const COEF_TRES = [1, -6, 11, -6];

export default function RaicesPolinomios() {
  const h = horner(COEF_BASE, 2);
  const r3 = raicesPolinomio({ coef: COEF_TRES, tol: 1e-10, maxIter: 100 });
  const r1 = raicesPolinomio({ coef: COEF_BASE, tol: 1e-10, maxIter: 100 });
  return (
    <ConPanelCalculadora herramientas={herramientasRaices(["todas", "biseccion", "falsa", "newton", "secante"])}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Ecuaciones no lineales · Raíces de polinomios</h1>
          <SubNavegacion enlaces={PAGINAS_M1} etiqueta="Páginas de ecuaciones no lineales" />
          <p>
            <strong>Objetivo:</strong> hallar <em>todas</em> las raíces de un
            polinomio (reales y complejas) con el esquema de Horner, Newton y la
            deflación, y verificar cada una.
          </p>
          <p className="aviso">
            Para una sola raíz de una función cualquiera, usa los{" "}
            <Link to="/ecuaciones/cerrados">métodos cerrados</Link> o{" "}
            <Link to="/ecuaciones/abiertos">abiertos</Link>. La calculadora está en el panel lateral:{" "}
            <AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "todas", modelo: "polinomio", coef: "1, 0, -1, -2" } }}>Abrir calculadora</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">Por qué los polinomios son especiales</h2>
            <p>
              Un polinomio de grado <M tex="n" /> tiene exactamente{" "}
              <M tex="n" /> raíces contando multiplicidades y complejas (teorema
              fundamental del álgebra). Si sus coeficientes son reales, las
              complejas vienen en pares conjugados. Eso permite una estrategia
              que no existe para funciones generales: <strong>encontrar una raíz,
              reducir el grado y repetir</strong>.
            </p>
            <div className="idea">
              <p>
                <strong>Tres herramientas.</strong> (1) <em>Horner</em> evalúa
                el polinomio y su derivada con pocas operaciones; (2){" "}
                <em>Newton</em> aprovecha esa derivada para converger rápido; (3){" "}
                la <em>deflación</em> divide por <M tex="(x-r)" /> y deja un
                polinomio de menor grado con las raíces restantes.
              </p>
            </div>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <h3>Esquema de Horner</h3>
            <p>Para <M tex="p(x)=a_nx^n+\dots+a_1x+a_0" /> y un punto <M tex="r" />:</p>
            <M bloque tex="b_n=a_n,\qquad b_k=a_k+r\,b_{k+1}\ (k=n-1,\dots,0),\qquad p(r)=b_0" />
            <p>
              Los <M tex="b_n,\dots,b_1" /> son los coeficientes del cociente al
              dividir por <M tex="(x-r)" /> y <M tex="b_0" /> es el resto. Repetir
              el esquema sobre los <M tex="b_k" /> da <M tex="p'(r)" />.
            </p>
            <h3>Cota de Cauchy</h3>
            <M bloque tex="|r|\le 1+\max_{i<n}\left|\frac{a_i}{a_n}\right|" />
            <p>Todas las raíces, reales o complejas, están dentro de ese disco: sirve como punto de partida de Newton.</p>
            <h3>Newton–Horner con deflación</h3>
            <ol className="algoritmo">
              <li>Calcular la cota de Cauchy y partir de ella (o de otros puntos) con Newton, evaluando <M tex="p" /> y <M tex="p'" /> con Horner.</li>
              <li>Al converger a una raíz real <M tex="r" />, pulirla sobre el polinomio original para no arrastrar error.</li>
              <li>Deflacionar: reemplazar <M tex="p" /> por el cociente de dividir por <M tex="(x-r)" />.</li>
              <li>Repetir mientras el grado sea ≥ 3.</li>
              <li>Con grado 2 usar la fórmula cuadrática (da reales o complejas conjugadas); con grado 1, despejar.</li>
              <li>Verificar cada raíz con el residuo relativo <M tex="|p(r)|/\sum|a_i||r|^i\le10^{-8}" />.</li>
            </ol>
            <p>
              Si queda un factor de grado ≥ 3 sin raíces reales (por ejemplo{" "}
              <M tex="x^4+4" />), el portal usa Durand–Kerner, que obtiene todas
              las raíces complejas a la vez, y lo avisa.
            </p>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplos resueltos</h2>
            <h3>Ejemplo 1: Horner de x³ − x − 2 en x = 2</h3>
            <div className="tabla-wrap" tabIndex={0}>
              <table>
                <caption>Esquema de Horner para p(x) = {polinomioTexto(COEF_BASE)} en r = 2</caption>
                <thead>
                  <tr><th scope="col">fila</th>{COEF_BASE.map((_, i) => <th key={i} scope="col">x{COEF_BASE.length - 1 - i === 0 ? "⁰" : COEF_BASE.length - 1 - i === 1 ? "¹" : COEF_BASE.length - 1 - i === 2 ? "²" : "³"}</th>)}</tr>
                </thead>
                <tbody>
                  <tr><th scope="row">coeficientes a</th>{COEF_BASE.map((c, i) => <td key={i}>{c}</td>)}</tr>
                  <tr><th scope="row">1.ª pasada b</th>{h.b.map((c, i) => <td key={i}>{c}</td>)}</tr>
                  <tr><th scope="row">2.ª pasada c</th>{h.c.map((c, i) => <td key={i}>{c}</td>)}<td>—</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              <M tex={`p(2)=${h.valor}`} /> (último b) y <M tex={`p'(2)=${h.derivada}`} /> (último c). El cociente es{" "}
              <M tex={`${polinomioTexto(h.b.slice(0, -1))}`} /> con resto {h.valor}: solo 3 multiplicaciones por pasada.
            </p>
            <h3>Ejemplo 2: x³ − 6x² + 11x − 6, todas las raíces reales</h3>
            <p>
              La cota de Cauchy es <M tex={`${cotaCauchy(COEF_TRES)}`} />. Newton–Horner encuentra una raíz, deflaciona y resuelve el cuadrático restante:
            </p>
            {r3.resultado && (
              <>
                <TablaPasos titulo="Deflación del ejemplo 2" pasos={r3.pasos} columnas={[
                  { clave: "k", titulo: "k", valor: (p) => p.k }, { clave: "x0", titulo: "x₀ inicial", valor: (p) => p.x0 }, { clave: "r", titulo: "raíz", valor: (p) => p.raiz },
                  { clave: "q", titulo: "cociente q(x)", valor: (p) => polinomioTexto(p.cociente) }, { clave: "res", titulo: "resto", valor: (p) => p.resto },
                ]} />
                <p>Raíces: {r3.resultado.raices.map((z) => fmt(z.re, 6)).join(", ")}. Todas verificadas.</p>
              </>
            )}
            <h3>Ejemplo 3: x³ − x − 2, una raíz real y dos complejas</h3>
            {r1.resultado && (
              <>
                <TablaPasos titulo="Raíces de x³ − x − 2" pasos={r1.resultado.raices} columnas={[
                  { clave: "re", titulo: "parte real", valor: (z) => z.re }, { clave: "im", titulo: "parte imaginaria", valor: (z) => z.im }, { clave: "m", titulo: "método", valor: (z) => z.metodo },
                ]} />
                <p>
                  La raíz real es la del caso base (1.5213797…). Las otras dos son un par conjugado,{" "}
                  <M tex={`${fmt(r1.resultado.raices[0].re, 4)}\\pm${fmt(Math.abs(r1.resultado.raices[0].im), 4)}\\,i`} />, obtenido con la fórmula cuadrática del cociente.{" "}
                  <AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "todas", modelo: "polinomio", coef: "1, 0, -1, -2" } }}>Reproducir en la calculadora</AbrirCalculadora>
                </p>
              </>
            )}
          </section>

          <section id="cuidados" aria-labelledby="h-cui">
            <h2 id="h-cui">Cuidados</h2>
            <ul>
              <li><strong>Raíces múltiples.</strong> En una raíz doble <M tex="p'" /> también se anula: Newton converge solo de forma lineal y la bisección no la ve (no hay cambio de signo). <AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "todas", modelo: "polinomio", coef: "1, -4, 5, -2" } }}>Probar (x−1)²(x−2)</AbrirCalculadora></li>
              <li><strong>Error acumulado en la deflación.</strong> Cada raíz aproximada contamina el cociente; por eso se pule sobre el polinomio original y se verifica.</li>
              <li><strong>Mal condicionamiento.</strong> En polinomios de grado alto, pequeños cambios en los coeficientes mueven mucho las raíces; el límite del portal es grado 6.</li>
              <li><strong>Raíces complejas.</strong> No aparecen en el gráfico del eje real: están en la tabla, siempre por pares conjugados.</li>
            </ul>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio antes de abrir la pista o la solución. Dos son intermedios y dos avanzados.</p>
            <Ejercicios items={EJERCICIOS_POLINOMIOS} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Seis preguntas con explicación; abre «Profundiza» para el porqué detrás de cada respuesta.</p>
            <Autoevaluacion preguntas={PREGUNTAS_POLINOMIOS} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
