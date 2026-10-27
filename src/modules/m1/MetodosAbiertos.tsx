import { Link } from "react-router-dom";
import AbrirCalculadora from "../../components/AbrirCalculadora";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import { ConPanelCalculadora } from "../../components/PanelCalculadora";
import SubNavegacion from "../../components/SubNavegacion";
import TablaPasos from "../../components/TablaPasos";
import { crearModelo, newton, secante } from "../../core/m1";
import { herramientasRaices, PAGINAS_M1 } from "./paginas";
import { EJERCICIOS_ABIERTOS, PREGUNTAS_ABIERTOS } from "./practicaAbiertos";

const M = Matematica;
const SECCIONES = [
  ["idea", "La idea: seguir la tangente"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplos resueltos"],
  ["fallos", "Cuándo fallan"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function MetodosAbiertos() {
  const base = crearModelo("calibracion", 2);
  const nw = newton({ f: base.f, df: base.df, x0: 1.5, tol: 1e-6, maxIter: 100 });
  const sec = secante({ f: base.f, x0: 1, x1: 2, tol: 1e-6, maxIter: 100 });
  return (
    <ConPanelCalculadora herramientas={herramientasRaices(["newton", "secante"])}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Ecuaciones no lineales · Métodos abiertos</h1>
          <SubNavegacion enlaces={PAGINAS_M1} etiqueta="Páginas de ecuaciones no lineales" />
          <p>
            <strong>Objetivo:</strong> hallar raíces con Newton y secante, que no
            necesitan un intervalo con cambio de signo, y reconocer cuándo su
            velocidad se paga con falta de garantía.
          </p>
          <p className="aviso">
            ¿Dudas entre un método abierto y uno cerrado? Revisa{" "}
            <Link to="/ecuaciones">Planteo y decisión</Link>. La calculadora está en el
            panel lateral: <AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "newton" } }}>Abrir calculadora</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">La idea: seguir la tangente</h2>
            <p>
              Un método abierto parte de uno o dos puntos y construye una recta
              que aproxima a <M tex="f" />; el siguiente iterado es donde esa
              recta corta el eje x. No encierra la raíz, así que{" "}
              <strong>no hay garantía de convergencia</strong>, pero cerca de una
              raíz simple es muy rápido.
            </p>
            <div className="dos-columnas">
              <div>
                <h3>Newton</h3>
                <p>Usa la <em>tangente</em> en <M tex="x_n" />: necesita <M tex="f'" />. Convergencia cuadrática: las cifras correctas se duplican.</p>
              </div>
              <div>
                <h3>Secante</h3>
                <p>Usa la recta por los <em>dos últimos puntos</em>: reemplaza <M tex="f'" /> por una pendiente aproximada. Orden ≈ 1.62.</p>
              </div>
            </div>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <p>
              <strong>Caso aplicado.</strong> Calibrar <M tex="x" /> con{" "}
              <M tex="f(x)=x^3-x-2" />, <M tex="f'(x)=3x^2-1" /> (datos sintéticos).
            </p>
            <h3>Newton</h3>
            <p><em>Supuestos:</em> <M tex="f" /> derivable, <M tex="f'(x_n)\ne0" /> y un <M tex="x_0" /> suficientemente cercano a la raíz.</p>
            <M bloque tex="x_{n+1}=x_n-\frac{f(x_n)}{f'(x_n)}" />
            <ol className="algoritmo">
              <li>Evaluar <M tex="f(x_n)" /> y <M tex="f'(x_n)" />; si <M tex="|f'(x_n)|" /> es casi 0, detenerse.</li>
              <li>Calcular <M tex="x_{n+1}" /> con la fórmula.</li>
              <li>Parar si <M tex="|x_{n+1}-x_n|\le\text{tol}" />; si no, repetir.</li>
              <li>Verificar que el resultado es una raíz (mínimo local de <M tex="|f|" /> con cruce del cero).</li>
            </ol>
            <h3>Secante</h3>
            <p><em>Supuestos:</em> dos puntos iniciales distintos; <strong>no</strong> se exige cambio de signo ni derivada.</p>
            <M bloque tex="x_{n+1}=x_n-f(x_n)\,\frac{x_n-x_{n-1}}{f(x_n)-f(x_{n-1})}" />
            <p>El algoritmo es igual al de Newton cambiando <M tex="f'(x_n)" /> por la pendiente <M tex="\frac{f(x_n)-f(x_{n-1})}{x_n-x_{n-1}}" />.</p>
            <div className="dos-columnas">
              <div>
                <h3>Cuándo usarlos</h3>
                <ul>
                  <li>Hay un buen punto inicial (o ya se acotó la raíz).</li>
                  <li>Se busca velocidad.</li>
                  <li>Newton: se puede derivar. Secante: derivar es difícil o caro.</li>
                </ul>
              </div>
              <div>
                <h3>Cuándo no</h3>
                <ul>
                  <li>No se tiene idea de dónde está la raíz.</li>
                  <li>f′ se anula cerca de la raíz (raíces dobles).</li>
                  <li>Se necesita garantía: usa un método cerrado.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplos resueltos</h2>
            <h3>Ejemplo 1: Newton desde x₀ = 1.5</h3>
            <p>
              <M tex="f(1.5)=-0.125" />, <M tex="f'(1.5)=5.75" />, por tanto{" "}
              <M tex="x_1=1.5+\frac{0.125}{5.75}=\frac{35}{23}\approx1.5217391304" />.
            </p>
            <TablaPasos titulo="Newton: iteraciones" pasos={nw.pasos} columnas={[
              { clave: "n", titulo: "n", valor: (p) => p.n }, { clave: "x", titulo: "xₙ", valor: (p) => p.x }, { clave: "s", titulo: "xₙ₊₁", valor: (p) => p.siguiente },
              { clave: "c", titulo: "cambio", valor: (p) => p.cambio }, { clave: "r", titulo: "residuo", valor: (p) => p.residuo },
            ]} />
            <p>
              Converge en {nw.resultado?.iteraciones} iteraciones. Observa cómo
              el cambio se eleva al cuadrado en cada paso.{" "}
              <AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "newton" } }}>Reproducir en la calculadora</AbrirCalculadora>
            </p>
            <h3>Ejemplo 2: secante con x₀ = 1 y x₁ = 2</h3>
            <TablaPasos titulo="Secante: iteraciones" pasos={sec.pasos} columnas={[
              { clave: "n", titulo: "n", valor: (p) => p.n }, { clave: "a", titulo: "xₙ₋₁", valor: (p) => p.x0 }, { clave: "b", titulo: "xₙ", valor: (p) => p.x1 },
              { clave: "s", titulo: "xₙ₊₁", valor: (p) => p.siguiente }, { clave: "c", titulo: "cambio", valor: (p) => p.cambio },
            ]} />
            <p>
              Necesita {sec.resultado?.iteraciones} iteraciones (Newton desde 1.5 usó {nw.resultado?.iteraciones}): un poco más, pero sin derivar.{" "}
              <AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "secante" } }}>Reproducir en la calculadora</AbrirCalculadora>
            </p>
          </section>

          <section id="fallos" aria-labelledby="h-fallos">
            <h2 id="h-fallos">Cuándo fallan</h2>
            <p>Los métodos abiertos fallan de formas distintas; el portal las detecta, las explica y <strong>no</strong> las presenta como convergencia:</p>
            <ul>
              <li><strong>Derivada nula.</strong> <M tex="x^3-1" /> con <M tex="x_0=0" />: <M tex="f'(0)=0" />.{" "}<AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "newton", modelo: "cubo", objetivo: "1", x0: "0" } }}>Probar</AbrirCalculadora></li>
              <li><strong>Ciclos.</strong> <M tex="x^3-2x+2" /> con <M tex="x_0=0" /> alterna entre 0 y 1: «sin convergencia».{" "}<AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "newton", modelo: "polinomio", coef: "1, 0, -2, 2", x0: "0" } }}>Probar</AbrirCalculadora></li>
              <li><strong>Mal punto inicial.</strong> <M tex="x^3-x-2" /> desde <M tex="x_0=0" /> da saltos erráticos y tarda 31 iteraciones.{" "}<AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "newton", x0: "0" } }}>Probar</AbrirCalculadora></li>
              <li><strong>Pendiente nula en la secante.</strong> <M tex="x^2-1" /> con <M tex="x_0=-2,\,x_1=2" />: <M tex="f(x_0)=f(x_1)" />.{" "}<AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "secante", modelo: "polinomio", coef: "1, 0, -1", p0: "-2", p1: "2" } }}>Probar</AbrirCalculadora></li>
              <li><strong>Sin raíz real.</strong> <M tex="x^2+1" />: el cambio puede ser pequeño sin que <M tex="f" /> se anule; la verificación lo detecta y responde «no converge».</li>
            </ul>
            <p className="cuidado">
              <strong>Regla práctica.</strong> Si no conoces un buen punto inicial, acota primero con un método cerrado (<Link to="/ecuaciones/cerrados">bisección o falsa posición</Link>) y refina con Newton o la secante.
            </p>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio antes de abrir la pista o la solución. Dos son intermedios y dos avanzados; en los que tienen «Tu plan», decide primero el método.</p>
            <Ejercicios items={EJERCICIOS_ABIERTOS} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Seis preguntas con explicación; abre «Profundiza» para el porqué detrás de cada respuesta.</p>
            <Autoevaluacion preguntas={PREGUNTAS_ABIERTOS} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
