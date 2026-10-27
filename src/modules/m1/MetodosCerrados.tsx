import { Link } from "react-router-dom";
import AbrirCalculadora from "../../components/AbrirCalculadora";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import { ConPanelCalculadora } from "../../components/PanelCalculadora";
import SubNavegacion from "../../components/SubNavegacion";
import TablaPasos from "../../components/TablaPasos";
import { biseccion, crearModelo, falsaPosicion } from "../../core/m1";
import { herramientasRaices, PAGINAS_M1 } from "./paginas";
import { EJERCICIOS_CERRADOS, PREGUNTAS_CERRADOS } from "./practicaCerrados";

const M = Matematica;
const SECCIONES = [
  ["idea", "La idea: encerrar la raíz"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplos resueltos"],
  ["verificacion", "Parada y verificación"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function MetodosCerrados() {
  const base = crearModelo("calibracion", 2);
  const bis = biseccion({ f: base.f, a: 1, b: 2, tol: 1e-6, maxIter: 100 });
  const fal = falsaPosicion({ f: base.f, a: 1, b: 2, tol: 1e-6, maxIter: 100 });
  return (
    <ConPanelCalculadora herramientas={herramientasRaices(["biseccion", "falsa"])}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Ecuaciones no lineales · Métodos cerrados</h1>
          <SubNavegacion enlaces={PAGINAS_M1} etiqueta="Páginas de ecuaciones no lineales" />
          <p>
            <strong>Objetivo:</strong> encontrar una raíz atrapándola en un
            intervalo con cambio de signo, con bisección y falsa posición, y
            saber cuándo esa garantía deja de valer.
          </p>
          <p className="aviso">
            ¿No sabes si necesitas un método cerrado? Empieza por{" "}
            <Link to="/ecuaciones">Planteo y decisión</Link>. La calculadora está en el
            panel lateral: <AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "biseccion" } }}>Abrir calculadora</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">La idea: encerrar la raíz</h2>
            <p>
              Si una función <strong>continua</strong> cambia de signo en{" "}
              <M tex="[a,b]" />, el teorema del valor intermedio asegura que hay
              una raíz dentro. Los métodos cerrados mantienen siempre un
              intervalo con cambio de signo y lo reducen: la raíz nunca se
              pierde. Se diferencian en <em>cómo</em> eligen el nuevo punto.
            </p>
            <div className="dos-columnas">
              <div>
                <h4>Bisección</h4>
                <p>Toma el punto medio. Ignora los valores de <M tex="f" />: es lenta pero totalmente predecible.</p>
              </div>
              <div>
                <h4>Falsa posición</h4>
                <p>Toma el corte de la cuerda que une los extremos. Usa los valores de <M tex="f" />, así que suele ser más rápida, pero puede estancarse.</p>
              </div>
            </div>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <p>
              <strong>Caso aplicado.</strong> Calibrar <M tex="x" /> para que{" "}
              <M tex="g(x)=x^3-x" /> alcance 2: se resuelve{" "}
              <M tex="f(x)=x^3-x-2=0" /> en <M tex="[1,2]" /> (datos sintéticos).
            </p>
            <h3>Bisección</h3>
            <p><em>Supuestos:</em> <M tex="f" /> continua en <M tex="[a,b]" /> y <M tex="f(a)f(b)<0" />.</p>
            <M bloque tex="c_n=\frac{a_n+b_n}{2},\qquad |c_n-r|\le\frac{b_n-a_n}{2}=\frac{b-a}{2^{n}}" />
            <ol className="algoritmo">
              <li>Calcular el punto medio <M tex="c_n" /> y <M tex="f(c_n)" />.</li>
              <li>Conservar el subintervalo donde <M tex="f" /> cambia de signo.</li>
              <li>Parar si <M tex="(b_n-a_n)/2\le\text{tol}" /> o <M tex="f(c_n)=0" />; si no, repetir.</li>
            </ol>
            <p>El número de iteraciones se conoce de antemano: <M tex="n\ge\log_2\dfrac{b-a}{\text{tol}}" />.</p>
            <h3>Falsa posición (regula falsi)</h3>
            <p><em>Supuestos:</em> los mismos que la bisección.</p>
            <M bloque tex="c_n=\frac{a_n\,f(b_n)-b_n\,f(a_n)}{f(b_n)-f(a_n)}" />
            <ol className="algoritmo">
              <li>Trazar la cuerda entre <M tex="(a_n,f(a_n))" /> y <M tex="(b_n,f(b_n))" /> y hallar donde corta el eje x: ese es <M tex="c_n" />.</li>
              <li>Reemplazar el extremo cuyo valor de <M tex="f" /> tiene el mismo signo que <M tex="f(c_n)" />.</li>
              <li>Parar si <M tex="|c_n-c_{n-1}|\le\text{tol}" /> o <M tex="f(c_n)=0" />.</li>
            </ol>
            <div className="dos-columnas">
              <div>
                <h4>Cuándo usarlos</h4>
                <ul>
                  <li>Conoces un intervalo con cambio de signo.</li>
                  <li>Necesitas una garantía de convergencia.</li>
                  <li>No tienes la derivada.</li>
                  <li>Quieres acotar la raíz antes de usar un método rápido.</li>
                </ul>
              </div>
              <div>
                <h4>Cuándo no</h4>
                <ul>
                  <li>No hay cambio de signo (raíces dobles, <M tex="f" /> que solo toca el eje).</li>
                  <li><M tex="f" /> es discontinua en el intervalo.</li>
                  <li>Se necesita máxima velocidad y hay buen x₀: un método abierto gana.</li>
                </ul>
              </div>
            </div>
            <p className="cuidado">
              <strong>Limitación de la falsa posición.</strong> Si <M tex="f" /> es muy convexa, un extremo se queda fijo y los cortes se acercan solo por un lado: la convergencia se vuelve lineal y puede ser peor que la bisección (ejercicio 4).
            </p>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplos resueltos</h2>
            <h3>Ejemplo 1: bisección en [1, 2]</h3>
            <p>
              <M tex="f(1)=-2<0" /> y <M tex="f(2)=4>0" />: hay cambio de signo.
              Primer punto medio <M tex="c_1=1.5" />, <M tex="f(1.5)=-0.125<0" />,
              así que la raíz está en <M tex="[1.5,\,2]" />. Iteraciones
              (calculadas por el motor):
            </p>
            <TablaPasos titulo="Bisección: iteraciones 1 a 4" pasos={bis.pasos.slice(0, 4)} columnas={[
              { clave: "n", titulo: "n", valor: (p) => p.n }, { clave: "a", titulo: "a", valor: (p) => p.a }, { clave: "b", titulo: "b", valor: (p) => p.b },
              { clave: "m", titulo: "medio", valor: (p) => p.medio }, { clave: "f", titulo: "f(medio)", valor: (p) => p.fMedio }, { clave: "c", titulo: "cota", valor: (p) => p.cota },
            ]} />
            <p>
              Con tolerancia <M tex="10^{-6}" /> se requieren{" "}
              <M tex="\lceil\log_2((b-a)/\text{tol})\rceil=20" /> iteraciones; la
              raíz es ≈ {bis.resultado?.raiz.toFixed(7)} (referencia: 1.5213797068).{" "}
              <AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "biseccion" } }}>Reproducir en la calculadora</AbrirCalculadora>
            </p>
            <h3>Ejemplo 2: falsa posición en [1, 2]</h3>
            <p>
              <M tex="c_1=\dfrac{1\cdot4-2\cdot(-2)}{4-(-2)}=\dfrac43\approx1.3333" />;{" "}
              <M tex="f(c_1)=-26/27<0" />, se reemplaza <M tex="a" />. Tras pocas
              iteraciones ya está cerca de la raíz:
            </p>
            <TablaPasos titulo="Falsa posición: iteraciones 1 a 4" pasos={fal.pasos.slice(0, 4)} columnas={[
              { clave: "n", titulo: "n", valor: (p) => p.n }, { clave: "a", titulo: "a", valor: (p) => p.a }, { clave: "b", titulo: "b", valor: (p) => p.b },
              { clave: "c", titulo: "corte c", valor: (p) => p.c }, { clave: "f", titulo: "f(c)", valor: (p) => p.fc },
            ]} />
            <p>
              Con la misma tolerancia converge en {fal.resultado?.iteraciones} iteraciones
              frente a {bis.resultado?.iteraciones} de la bisección: aquí la cuerda
              acierta más que el punto medio. Observa que <M tex="b=2" /> no se
              mueve.{" "}
              <AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "falsa" } }}>Reproducir en la calculadora</AbrirCalculadora>
            </p>
          </section>

          <section id="verificacion" aria-labelledby="h-ver">
            <h2 id="h-ver">Parada y verificación</h2>
            <div className="idea">
              <p><strong>Tres ideas que no se deben confundir</strong></p>
              <ul>
                <li><strong>Cota del error</strong> (<M tex="(b-a)/2^n" />): dice cuánto puede distar el punto medio de la raíz.</li>
                <li><strong>Residuo</strong> <M tex="|f(c)|" />: valor de la función; con una función plana puede ser pequeño aun estando lejos de la raíz.</li>
                <li><strong>Verificación</strong>: tras parar se comprueba que <M tex="|f|" /> es mínimo local y que <M tex="f" /> cruza el cero.</li>
              </ul>
            </div>
            <p>
              <strong>Un cambio de signo no siempre es una raíz.</strong> Con{" "}
              <M tex="f(x)=1/(x-1)" /> en <M tex="[0,3]" /> hay cambio de signo,
              pero en <M tex="x=1" /> hay un polo. La bisección se acerca a 1 y el
              portal responde «no converge» porque <M tex="|f|" /> crece en lugar de
              anularse.{" "}
              <AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "biseccion", modelo: "polo", objetivo: "0", a: "0", b: "3" } }}>Probar el polo</AbrirCalculadora>
            </p>
            <p>
              Otros fallos que el portal detecta y explica: intervalo sin cambio
              de signo (<AbrirCalculadora preset={{ herramienta: "raices", valores: { metodo: "falsa", a: "2", b: "3" } }}>probar [2, 3]</AbrirCalculadora>),
              valores no finitos y agotamiento del máximo de iteraciones, que{" "}
              <strong>no</strong> se presenta como convergencia.
            </p>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio antes de abrir la pista o la solución. Dos son intermedios y dos avanzados; en los que tienen «Tu plan», decide primero el método.</p>
            <Ejercicios items={EJERCICIOS_CERRADOS} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Seis preguntas con explicación; abre «Profundiza» para el porqué detrás de cada respuesta.</p>
            <Autoevaluacion preguntas={PREGUNTAS_CERRADOS} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
