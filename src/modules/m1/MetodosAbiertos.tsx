import { Link } from "react-router-dom";
import AbrirCalculadora from "../../components/AbrirCalculadora";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import Grafico from "../../components/Grafico";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import { ConPanelCalculadora } from "../../components/PanelCalculadora";
import SubNavegacion from "../../components/SubNavegacion";
import TablaPasos from "../../components/TablaPasos";
import { fmt } from "../../core/formato";
import { crearModelo, MODELOS_PUNTO_FIJO, newton, puntoFijo, secante } from "../../core/m1";
import { SeccionConvergenciaAbiertos } from "./AnalisisConvergenciaUI";
import { datosPuntoFijoCobweb } from "./graficos";
import { herramientasRaices, PAGINAS_M1 } from "./paginas";
import { EJERCICIOS_ABIERTOS, PREGUNTAS_ABIERTOS } from "./practicaAbiertos";

const M = Matematica;
const SECCIONES = [
  ["idea", "La idea: tangente y punto fijo"],
  ["teoria", "Teoría (Newton, Secante y Punto Fijo)"],
  ["convergencia", "Análisis y criterios de convergencia"],
  ["ejemplos", "Ejemplos resueltos"],
  ["fallos", "Cuándo fallan"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function MetodosAbiertos() {
  const base = crearModelo("calibracion", 2);
  const nw = newton({ f: base.f, df: base.df, x0: 1.5, tol: 1e-6, maxIter: 100 });
  const sec = secante({ f: base.f, x0: 1, x1: 2, tol: 1e-6, maxIter: 100 });
  const modeloPF = MODELOS_PUNTO_FIJO.calibracion_cbrt;
  const pf = puntoFijo({ g: modeloPF.g, dg: modeloPF.dg, x0: 1.5, tol: 1e-6, maxIter: 100 });
  return (
    <ConPanelCalculadora herramientas={herramientasRaices(["newton", "secante", "punto_fijo"])}>
      <ModuloConIndice secciones={SECCIONES} moduloId="ecuaciones">
        <article className="modulo">
          <p className="silabo-etiqueta">Unidad II · Cap. II · Tema 04: Métodos Abiertos (Punto Fijo, Newton-Raphson, Secante)</p>
          <h1>Ecuaciones no lineales · Métodos abiertos</h1>
          <SubNavegacion enlaces={PAGINAS_M1} etiqueta="Páginas de ecuaciones no lineales" />
          <p>
            <strong>Objetivo:</strong> hallar raíces con Iteración de Punto Fijo, Newton-Raphson y secante, que no
            necesitan un intervalo con cambio de signo, y evaluar sus criterios locales de convergencia.
          </p>
          <p className="aviso">
            ¿Dudas entre un método abierto y uno cerrado? Revisa{" "}
            <Link to="/ecuaciones">Planteo y decisión</Link>. La calculadora está en el
            panel lateral: <AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "newton" } }}>Abrir calculadora</AbrirCalculadora>{" "}
            · <AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "punto_fijo", modeloPF: "calibracion_cbrt", x0: "1.5" } }}>Probar Punto Fijo</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">La idea: tangente y punto fijo</h2>
            <p>
              Un método abierto parte de uno o dos puntos y construye una iteración que aproxima la raíz sin encerrarla en un intervalo. No hay garantía global de convergencia, pero cerca de una raíz que cumpla el criterio local el avance es directo.
            </p>
            <div className="dos-columnas">
              <div>
                <h3>Iteración de Punto Fijo</h3>
                <p>Reescribe <M tex="f(x)=0" /> como <M tex="x=g(x)" /> y repite <M tex="x_{k+1}=g(x_k)" />. Converge linealmente si <M tex="|g'(x)|<1" />.</p>
              </div>
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
            <h3>Iteración de Punto Fijo (Tema 04)</h3>
            <p>
              Se transforma <M tex="f(x)=0" /> en una ecuación equivalente <M tex="x=g(x)" /> y se genera la sucesión <M tex="x_{k+1}=g(x_k)" />.
              El <strong>criterio suficiente de convergencia</strong> establece que si <M tex="g" /> y <M tex="g'" /> son continuas y{" "}
              <M tex="|g'(x)|\le L < 1" /> en un entorno de la raíz, la sucesión converge desde cualquier <M tex="x_0" /> en dicho entorno:
            </p>
            <M bloque tex="x_{k+1} = g(x_k), \qquad |e_{k+1}| \approx |g'(r)|\,|e_k| \quad\text{(converge si } |g'(r)|<1\text{)}" />
            <ul>
              <li><strong>Convergencia monótona</strong> si <M tex="0 \le g'(r) < 1" /> (aproximación tipo escalera desde un solo lado).</li>
              <li><strong>Convergencia oscilatoria</strong> si <M tex="-1 < g'(r) < 0" /> (aproximación en espiral / telaraña).</li>
              <li><strong>Divergencia</strong> si <M tex="|g'(r)| \ge 1" /> (el despeje elegido amplifica el error en cada paso).</li>
            </ul>
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

          <section id="convergencia" aria-labelledby="h-conv">
            <SeccionConvergenciaAbiertos />
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
            <h3>Ejemplo 3: Iteración de Punto Fijo con <M tex="g(x) = \sqrt[3]{x + 2}" /> desde x₀ = 1.5</h3>
            <p>
              Para <M tex="x^3 - x - 2 = 0" />, el despeje <M tex="g(x) = \sqrt[3]{x+2}" /> tiene derivada{" "}
              <M tex="g'(x) = \frac{1}{3(x+2)^{2/3}}" />. En la raíz <M tex="r \approx 1.52138" />,{" "}
              <M tex="g'(r) \approx {fmt(pf.resultado?.pendienteDg ?? 0.144, 4)} \in (0, 1)" />, garantizando convergencia lineal monótona.
            </p>
            <TablaPasos titulo="Punto Fijo: iteraciones con g(x) = ∛(x + 2)" pasos={pf.pasos} columnas={[
              { clave: "k", titulo: "k", valor: (p) => p.k },
              { clave: "x", titulo: "xₖ", valor: (p) => p.x },
              { clave: "gx", titulo: "g(xₖ)", valor: (p) => p.gx },
              { clave: "err", titulo: "|g(xₖ) − xₖ|", valor: (p) => p.errorAbs },
              { clave: "dg", titulo: "g′(xₖ)", valor: (p) => p.pendienteDg },
            ]} />
            <Grafico
              titulo="Diagrama de telaraña (cobweb) de g(x) = ∛(x + 2)"
              ejeX="x"
              ejeY="y"
              datos={datosPuntoFijoCobweb(modeloPF, 1.5, pf.pasos)}
              descripcion="La curva y = ∛(x + 2) corta a la identidad y = x con pendiente menor a 1, atrayendo los iterados en pocos pasos."
            />
            <p>
              Converge en {pf.resultado?.iteraciones} iteraciones con razón |g′(r)| ≈ {fmt(pf.resultado?.pendienteDg ?? 0.144, 4)}.{" "}
              <AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "punto_fijo", modeloPF: "calibracion_cbrt", x0: "1.5" } }}>Reproducir en la calculadora</AbrirCalculadora>
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
              <li><strong>Despeje divergente en Punto Fijo (<M tex="|g'(x)| \ge 1" />).</strong> <M tex="g(x)=x^3-2" /> con <M tex="x_0=1.5" /> tiene <M tex="|g'(1.5)|=6.75 \ge 1" /> y diverge.{" "}<AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "punto_fijo", modeloPF: "divergente", x0: "1.5" } }}>Probar</AbrirCalculadora></li>
            </ul>
            <p className="cuidado">
              <strong>Regla práctica.</strong> Si no conoces un buen punto inicial, acota primero con un método cerrado (<Link to="/ecuaciones/cerrados">bisección o falsa posición</Link>) y refina con Newton o la secante.
            </p>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio por tu cuenta antes de revelar los pasos de la solución (se muestran uno a uno). Dos son intermedios y dos avanzados; en los que tienen «Tu plan», decide primero el método.</p>
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
