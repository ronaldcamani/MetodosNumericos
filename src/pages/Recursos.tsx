import { useState } from "react";
import { Link } from "react-router-dom";
import { borrarProgreso } from "../components/useProgreso";
import { MODULOS } from "../modules/registro";

const INTEGRANTES: [string, string][] = [
  ["A", "Ponce Llerena, Renato Xavier"],
  ["B", "Chavez Cuno, Deivick Paul Eddi"],
  ["C", "Carpio Coa, Massiel Evagelina"],
  ["D", "Camani Chambi, Ronald Rodrigo"],
];

/** Guía para estudiantes, código de referencia, fuentes y equipo (sección 3 de la guía: «fuentes, instrucciones de ejecución, código de referencia»). */
function BorrarAvance() {
  const [seguro, setSeguro] = useState(false);
  const [hecho, setHecho] = useState(false);
  return (
    <div className="acciones">
      {!seguro ? (
        <button type="button" onClick={() => { setSeguro(true); setHecho(false); }}>Borrar mi avance</button>
      ) : (
        <>
          <button type="button" onClick={() => { borrarProgreso(); setSeguro(false); setHecho(true); }}>Sí, borrar todo mi avance</button>
          <button type="button" onClick={() => setSeguro(false)}>Cancelar</button>
        </>
      )}
      <span role="status">{hecho ? "Avance borrado." : ""}</span>
    </div>
  );
}

export default function Recursos() {
  return (
    <article className="modulo">
      <h1>Cómo usar el portal, código de referencia y fuentes</h1>
      <p>
        Esta página está pensada para que otros estudiantes aprovechen el portal
        y puedan comprobar por sí mismos que los resultados son correctos.
      </p>

      <section aria-labelledby="h-estudiar">
        <h2 id="h-estudiar">Cómo estudiar un tema</h2>
        <p>
          Todos los temas siguen el mismo recorrido, para que no tengas que
          aprender una forma nueva de usarlos:
        </p>
        <ol className="algoritmo">
          <li>
            <strong>Lee el problema.</strong> Cada tema empieza con un caso
            aplicado (datos sintéticos) y las preguntas que debes hacerte antes
            de elegir un método.
          </li>
          <li>
            <strong>Analiza y decide.</strong> Describe tu problema y mira qué
            métodos conviene usar, cuáles no y por qué. La decisión final es
            tuya.
          </li>
          <li>
            <strong>Estudia la familia de métodos</strong> que elegiste: idea,
            teoría, algoritmo paso a paso, cuándo usarlo y cuándo no.
          </li>
          <li>
            <strong>Reproduce el ejemplo resuelto</strong> en la calculadora
            lateral y compara con la tabla.
          </li>
          <li>
            <strong>Provoca los fallos a propósito.</strong> Cada calculadora
            tiene botones «Probar fallo»: entender cuándo un método falla enseña
            más que verlo funcionar.
          </li>
          <li>
            <strong>Resuelve los ejercicios</strong>: primero tu plan y tu
            desarrollo; la solución se revela en tarjetas, paso a paso.
          </li>
          <li>
            <strong>Practica por niveles</strong> al final de cada tema: tres
            problemas nuevos cada vez en nivel básico, intermedio o avanzado. Si
            fallas, la respuesta no se revela; el desarrollo paso a paso está
            en tarjetas ocultas. Tus puntos, estrellas y dominio del tema se
            guardan solo en este navegador.
          </li>
          <li>
            <strong>Comprueba lo aprendido</strong> en la autoevaluación y abre
            «Profundiza» en cada pregunta.
          </li>
        </ol>
        <p className="aviso">
          Los datos y los modelos son <strong>sintéticos</strong> y no
          representan sistemas reales; no se usan para tomar decisiones sobre
          equipos reales.
        </p>
      </section>

      <section aria-labelledby="h-avance">
        <h2 id="h-avance">Tu avance</h2>
        <p>
          El avance (puntos, estrellas y dominio de cada tema) vive en tu
          navegador: no se envía a ningún servidor. Si compartes el equipo,
          puedes borrarlo.
        </p>
        <BorrarAvance />
      </section>

      <section aria-labelledby="h-mapa">
        <h2 id="h-mapa">Mapa del portal</h2>
        <div className="tabla-wrap" tabIndex={0}>
          <table className="tabla-metodos">
            <caption>Temas, métodos y páginas</caption>
            <thead>
              <tr>
                <th scope="col">Tema</th>
                <th scope="col">Métodos</th>
                <th scope="col">Páginas</th>
              </tr>
            </thead>
            <tbody>
              {MODULOS.map((m) => (
                <tr key={m.id}>
                  <th scope="row">
                    <Link to={m.ruta}>{m.titulo}</Link>
                  </th>
                  <td>{m.metodos.join(", ")}</td>
                  <td>
                    {m.subpaginas
                      ? m.subpaginas.map((p, i) => (
                          <span key={p.ruta}>
                            {i > 0 && " · "}
                            <Link to={p.ruta}>{p.titulo}</Link>
                          </span>
                        ))
                      : "Una página"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="h-ref">
        <h2 id="h-ref">Código de referencia independiente</h2>
        <p>
          Los cálculos del portal se contrastan con un código{" "}
          <strong>escrito aparte</strong> en Python (NumPy y SciPy), que no
          comparte fórmulas con el motor del portal. Cada script genera un
          archivo con los valores esperados y una prueba comprueba que el motor
          coincide con ellos.
        </p>
        <div className="tabla-wrap" tabIndex={0}>
          <table className="tabla-metodos">
            <caption>
              Scripts de referencia (carpeta <code>referencia/</code>)
            </caption>
            <thead>
              <tr>
                <th scope="col">Script</th>
                <th scope="col">Contrasta</th>
                <th scope="col">Con</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  <code>generar_errores.py</code>
                </th>
                <td>
                  Redondeo y truncamiento a t cifras, cifras correctas, suma,
                  serie de eˣ
                </td>
                <td>
                  Módulo <code>decimal</code> (aritmética exacta) y{" "}
                  <code>math</code>
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <code>generar_m1.py</code>
                </th>
                <td>Bisección, falsa posición, secante, Newton, polinomios</td>
                <td>
                  <code>scipy.optimize</code>, <code>numpy.roots</code>,
                  fracciones exactas
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <code>generar_m2.py</code>
                </th>
                <td>Sistemas lineales y Gauss-Seidel</td>
                <td>
                  <code>numpy.linalg.solve</code>
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <code>generar_m3.py</code>
                </th>
                <td>Lagrange y regresión</td>
                <td>
                  Matriz de Vandermonde y <code>numpy.polyfit</code>
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <code>generar_m4.py</code>
                </th>
                <td>Trapecio, Simpson y derivación</td>
                <td>
                  <code>numpy.trapezoid</code>,{" "}
                  <code>scipy.integrate.simpson</code>
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <code>generar_m5.py</code>
                </th>
                <td>Euler, RK4 y estabilidad</td>
                <td>
                  Implementación propia y <code>scipy.integrate.solve_ivp</code>{" "}
                  (DOP853)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          La carpeta <code>referencia/</code> también contiene una prueba por
          script (<code>test_*.py</code>). La matriz de pruebas con ocho o más
          casos por tema está en <code>docs/matriz-pruebas.md</code>. Si
          dispones de GNU Octave o MATLAB, puedes repetir cualquiera de estos
          cálculos como tercera comprobación.
        </p>
      </section>

      <section aria-labelledby="h-ejecutar">
        <h2 id="h-ejecutar">Cómo ejecutarlo</h2>
        <p>
          El portal funciona{" "}
          <strong>sin servidor, cuenta ni base de datos</strong> y sin conexión
          a Internet (las fórmulas y los gráficos van incluidos).
        </p>
        <ol>
          <li>
            Instala las dependencias una vez: <code>npm install</code>.
          </li>
          <li>
            Genera la copia ejecutable: <code>npm run build</code>. Se crea{" "}
            <code>dist/index.html</code>, que se abre con doble clic en el
            navegador.
          </li>
          <li>
            Para desarrollar: <code>npm run dev</code>. Para las pruebas:{" "}
            <code>npm test</code> (motores y componentes),{" "}
            <code>npm run test:e2e</code> (navegador) y{" "}
            <code>npm run test:ref</code> (código de referencia).
          </li>
        </ol>
        <p>
          Dependencias de conexión: ninguna en tiempo de ejecución. La
          instalación inicial de paquetes sí necesita conexión.
        </p>
      </section>

      <section aria-labelledby="h-fuentes">
        <h2 id="h-fuentes">Fuentes</h2>
        <ul>
          <li>
            UNSA, Ingeniería de Sistemas.{" "}
            <em>Guía de trabajo del Laboratorio de Métodos Numéricos</em> (casos
            aplicados, valores de verificación y requisitos).
          </li>
          <li>
            [1] MDN Web Docs. <em>Learn web development</em>.{" "}
            <a href="https://developer.mozilla.org/en-US/docs/Learn_web_development">
              developer.mozilla.org/en-US/docs/Learn_web_development
            </a>
          </li>
          <li>
            [2] GNU Octave. <em>Manual oficial</em>.{" "}
            <a href="https://docs.octave.org/latest/">docs.octave.org/latest</a>
          </li>
          <li>
            [3] GitHub Docs. <em>What is GitHub Pages</em>.{" "}
            <a href="https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages">
              docs.github.com
            </a>
          </li>
          <li>
            NumPy y SciPy, documentación oficial (
            <a href="https://numpy.org/doc/">numpy.org/doc</a>,{" "}
            <a href="https://docs.scipy.org/doc/scipy/">docs.scipy.org</a>),
            para el código de referencia.
          </li>
          <li>
            KaTeX (<a href="https://katex.org/">katex.org</a>) para las fórmulas
            y Plotly.js (
            <a href="https://plotly.com/javascript/">plotly.com/javascript</a>)
            para los gráficos; ambos se distribuyen incluidos en el portal.
          </li>
          <li>
            Textos de referencia habituales del curso: R. L. Burden y J. D.
            Faires, <em>Análisis numérico</em>; S. C. Chapra y R. P. Canale,{" "}
            <em>Métodos numéricos para ingenieros</em>.
          </li>
        </ul>
        <p>
          Los gráficos del portal se generan en el navegador a partir de los
          cálculos; no se usan imágenes de terceros.
        </p>
      </section>

      <section aria-labelledby="h-equipo">
        <h2 id="h-equipo">Equipo</h2>
        <div className="tabla-wrap" tabIndex={0}>
          <table className="tabla-metodos">
            <caption>Integrantes del equipo</caption>
            <thead>
              <tr>
                <th scope="col">Integrante</th>
                <th scope="col">Nombre</th>
              </tr>
            </thead>
            <tbody>
              {INTEGRANTES.map(([letra, nombre]) => (
                <tr key={letra}>
                  <th scope="row">{letra}</th>
                  <td>{nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
