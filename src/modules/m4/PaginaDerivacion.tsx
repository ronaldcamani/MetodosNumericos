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
import { aproximarDerivada, crearDerivable, derivacionCentral, evaluarTasa, integralExacta } from "../../core/m4";
import { herramientasIntegracion, PAGINAS_INTEGRACION } from "./paginas";
import { EJERCICIOS_DERIVACION, PREGUNTAS_DERIVACION } from "./practica";

const M = Matematica;
const tasa = { a: 1, b: 0, c: 1 };
const SECCIONES = [
  ["idea", "La idea: diferencias finitas"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplos resueltos"],
  ["cuidados", "Cuidados"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function PaginaDerivacion() {
  const r = (t: number) => evaluarTasa(tasa, t);
  const V = (t: number) => integralExacta(tasa, 0, t);
  const derivadas = [0.5, 0.1, 0.01].map((h) => ({ h, d: derivacionCentral(r, 1, h) }));
  const dV = derivacionCentral(V, 2, 0.1);
  const exp = aproximarDerivada({ derivable: crearDerivable("exponencial"), t: 1, h: 0.5 });
  return (
    <ConPanelCalculadora herramientas={herramientasIntegracion("derivacion")}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Integración y derivación numérica · Derivación numérica</h1>
          <SubNavegacion enlaces={PAGINAS_INTEGRACION} etiqueta="Páginas de integración y derivación numérica" />
          <p>
            <strong>Objetivo:</strong> aproximar la derivada con valores de la función, comparar diferencias progresiva, regresiva y central, y entender por qué reducir <M tex="h" /> no siempre mejora.
          </p>
          <p className="aviso">
            La integral acumula la tasa y la derivada mide cómo cambia: ver <Link to="/integracion">Planteo y decisión</Link>. La calculadora está en el panel lateral:{" "}
            <AbrirCalculadora preset={{ herramienta: "derivacion" }}>Abrir calculadora</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">La idea: diferencias finitas</h2>
            <p>
              La derivada es el límite de un cociente incremental. Si se toma un <M tex="h" /> pequeño pero finito, el cociente aproxima <M tex="f'(t)" /> con valores de <M tex="f" /> solamente: no hace falta la fórmula de la derivada.
            </p>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <M bloque tex="f'(t)\approx\frac{f(t+h)-f(t)}{h}\ [O(h)],\qquad f'(t)\approx\frac{f(t)-f(t-h)}{h}\ [O(h)],\qquad f'(t)\approx\frac{f(t+h)-f(t-h)}{2h}\ [O(h^2)]" />
            <ol className="algoritmo">
              <li>Elegir el punto <M tex="t" /> y un paso <M tex="h" />.</li>
              <li>Evaluar <M tex="f" /> en <M tex="t-h" />, <M tex="t" /> y <M tex="t+h" />.</li>
              <li>Aplicar la diferencia central (más exacta) o una lateral si falta un lado de datos.</li>
              <li>Reducir <M tex="h" /> a la mitad y comprobar que el error baja ≈ 4 veces (central) o ≈ 2 veces (lateral).</li>
            </ol>
            <p className="cuidado">
              <strong>Dos errores que compiten.</strong> El error de <em>truncamiento</em> baja con <M tex="h" />; el de <em>redondeo</em> sube cuando <M tex="h" /> es diminuto porque <M tex="f(t+h)" /> y <M tex="f(t-h)" /> casi coinciden y su resta pierde cifras. Existe un <M tex="h" /> óptimo (≈ <M tex="10^{-5}" /> para la central en doble precisión).
            </p>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplos resueltos</h2>
            <h3>Ejemplo 1: r(t) = t² + 1 en t = 1</h3>
            <p>
              Con <M tex="h=0.1" />: <M tex="\dfrac{r(1.1)-r(0.9)}{0.2}=\dfrac{2.21-1.81}{0.2}=2" /> MB/s² (coincide con <M tex="r'(1)=2" /> porque <M tex="r" /> es cuadrática).
            </p>
            <TablaPasos titulo="Diferencia central de r en t = 1" pasos={derivadas} columnas={[
              { clave: "h", titulo: "h (s)", valor: (p) => p.h }, { clave: "d", titulo: "(r(1+h) − r(1−h)) / 2h (MB/s²)", valor: (p) => p.d },
            ]} />
            <p>
              <strong>Tasa y acumulación.</strong> Como <M tex="V(T)=\int_0^T r" />, se cumple <M tex="V'(T)=r(T)" />. Con la misma fórmula: <M tex={`\\dfrac{V(2.1)-V(1.9)}{0.2}\\approx${fmt(dV, 6)}`} /> MB/s, cercano a{" "}
              <M tex={`r(2)=${fmt(r(2))}`} /> MB/s: derivar el acumulado recupera la tasa.
            </p>
            <h3>Ejemplo 2: eᵗ en t = 1 (el orden se ve)</h3>
            <TablaPasos titulo="Efecto de reducir h (h = 0.5, 0.25, …)" pasos={exp.pasos} columnas={[
              { clave: "h", titulo: "h", valor: (p) => p.h }, { clave: "ec", titulo: "error central", valor: (p) => p.errorCentral }, { clave: "rc", titulo: "cociente (central)", valor: (p) => p.razonCentral },
              { clave: "ep", titulo: "error progresiva", valor: (p) => p.errorProgresiva }, { clave: "rp", titulo: "cociente (progresiva)", valor: (p) => p.razonProgresiva },
            ]} />
            <p>
              Los cocientes tienden a 4 (central, orden 2) y a 2 (progresiva, orden 1).{" "}
              <AbrirCalculadora preset={{ herramienta: "derivacion", valores: { funcion: "exponencial", t: "1", h: "0.5" } }}>Reproducir en la calculadora</AbrirCalculadora>
            </p>
          </section>

          <section id="cuidados" aria-labelledby="h-cui">
            <h2 id="h-cui">Cuidados</h2>
            <ul>
              <li>
                <strong>h demasiado pequeño.</strong> Domina el redondeo por cancelación.{" "}
                <AbrirCalculadora preset={{ herramienta: "derivacion", valores: { funcion: "exponencial", t: "1", h: "1e-12" } }}>Probar h = 10⁻¹²</AbrirCalculadora>
              </li>
              <li><strong>Datos con ruido.</strong> Derivar amplifica el ruido: el cociente divide por <M tex="h" />. Conviene suavizar antes (ver el tema de ajuste de curvas).</li>
              <li><strong>Bordes.</strong> En el extremo de una tabla solo hay un lado: se usa una diferencia lateral y se pierde un orden.</li>
            </ul>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio por tu cuenta antes de revelar los pasos de la solución (se muestran uno a uno). Uno es intermedio y otro avanzado.</p>
            <Ejercicios items={EJERCICIOS_DERIVACION} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Tres preguntas con explicación; abre «Profundiza» para el porqué.</p>
            <Autoevaluacion preguntas={PREGUNTAS_DERIVACION} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
