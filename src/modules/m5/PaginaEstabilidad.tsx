import { Link } from "react-router-dom";
import AbrirCalculadora from "../../components/AbrirCalculadora";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import { ConPanelCalculadora } from "../../components/PanelCalculadora";
import SubNavegacion from "../../components/SubNavegacion";
import { EDO_H5 } from "./modelo";
import { herramientasEdo, PAGINAS_EDO, presetEdo } from "./paginas";
import { EJERCICIOS_ESTABILIDAD, PREGUNTAS_ESTABILIDAD } from "./practica";

const M = Matematica;
const SECCIONES = [
  ["idea", "La idea: errores que crecen"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplos resueltos"],
  ["explorar", "Pruébalo"],
  ["fisica", "Calculado ≠ físico"],
  ["resumen", "Para recordar"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function PaginaEstabilidad() {
  return (
    <ConPanelCalculadora herramientas={herramientasEdo("estabilidad")}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Ecuaciones diferenciales · Estabilidad y tamaño de paso</h1>
          <SubNavegacion enlaces={PAGINAS_EDO} etiqueta="Páginas de ecuaciones diferenciales" />
          <p>
            <strong>Objetivo:</strong> entender por qué un paso demasiado grande puede arruinar un método, calcular el límite de estabilidad y distinguir una trayectoria <em>calculada</em> de una <em>físicamente válida</em>.
          </p>
          <div className="idea">
            <p><strong>Antes de empezar</strong> conviene haber visto <Link to="/diferenciales/euler">Euler</Link> y <Link to="/diferenciales/rk4">RK4</Link>.</p>
          </div>
          <p className="aviso">
            El explorador está en el panel lateral: <AbrirCalculadora preset={{ herramienta: "estabilidad" }}>Abrir explorador</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">La idea: errores que crecen</h2>
            <p>
              Todo cálculo numérico comete un pequeño error en cada paso. La pregunta es: <em>¿ese error se amortigua o se amplifica en el paso siguiente?</em> Si se amortigua, el método es <strong>estable</strong> con ese paso; si se amplifica, el
              error crece como una bola de nieve y el resultado se vuelve absurdo, por muy buena que fuera la fórmula.
            </p>
            <p>
              Imagina que haces una curva en bici: si giras un poco el manillar y la bici corrige sola, es estable; si cada pequeño giro se hace mayor en el siguiente, terminas en el suelo. El «tamaño de giro» aquí es el paso <M tex="h" />.
            </p>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <p>
              Para el enfriamiento <M tex="T'=-k(T-T_a)" />, escribe <M tex="y=T-T_a" /> (la <em>distancia</em> a la ambiente): <M tex="y'=-k\,y" /> y la solución exacta <M tex="y(t)=y_0e^{-kt}" /> decae. Un paso de Euler multiplica <M tex="y" /> por un
              <strong> factor</strong>:
            </p>
            <M bloque tex="y_{n+1}=(1-k\,h)\,y_n\quad\Rightarrow\quad |1-k\,h|<1\ \Leftrightarrow\ 0<k\,h<2\ \Leftrightarrow\ h<\frac2k" />
            <p>Con <M tex="k=0.5" />, la condición es <M tex="0<h<4" /> min. Según el valor de <M tex="k\,h" /> hay cuatro comportamientos:</p>
            <div className="tabla-wrap">
              <table className="tabla-metodos">
                <caption>Comportamiento de Euler según k·h</caption>
                <thead><tr><th scope="col">k·h</th><th scope="col">h (k = 0.5)</th><th scope="col">Factor 1 − k·h</th><th scope="col">Qué ocurre</th><th scope="col">¿Físicamente válida?</th></tr></thead>
                <tbody>
                  <tr><td>0 &lt; k·h &lt; 1</td><td>0 &lt; h &lt; 2</td><td>entre 0 y 1</td><td>Baja monótonamente hacia Tₐ</td><td>Sí</td></tr>
                  <tr><td>1 &lt; k·h &lt; 2</td><td>2 &lt; h &lt; 4</td><td>entre −1 y 0</td><td>Oscila alrededor de Tₐ y converge</td><td>No (cruza Tₐ)</td></tr>
                  <tr><td>k·h = 2</td><td>h = 4</td><td>−1</td><td>Oscila sin decaer</td><td>No</td></tr>
                  <tr><td>k·h &gt; 2</td><td>h &gt; 4</td><td>menor que −1</td><td>Oscilaciones crecientes: inestable</td><td>No</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              <strong>RK4</strong> multiplica por <M tex="R(-kh)=1-kh+\tfrac{(kh)^2}{2}-\tfrac{(kh)^3}{6}+\tfrac{(kh)^4}{24}" />, un polinomio que aproxima a <M tex="e^{-kh}" />. Su límite es <M tex="k\,h<2.7853" /> (<M tex="h<5.57" /> con <M tex="k=0.5" />), un poco más generoso que el de Euler.
            </p>
            <div className="cuidado">
              <p><strong>Tres preguntas distintas.</strong> <em>Estable</em>: ¿los errores no crecen? <em>Preciso</em>: ¿se parece a la exacta? <em>Físico</em>: ¿se comporta como el fenómeno real? Una respuesta afirmativa a una no implica las otras.</p>
            </div>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplos resueltos</h2>
            <h3>Ejemplo 1: h = 5 en 20 minutos (el caso de la guía)</h3>
            <p>
              Factor de Euler: <M tex="1-0.5\cdot5=-1.5" />. Como <M tex="|-1.5|>1" />, la distancia a la ambiente se multiplica por −1.5 en cada paso: <M tex="y_0=60" />, <M tex="y_1=-90" />, <M tex="y_2=135" />, <M tex="y_3=-202.5" />…
              Las temperaturas calculadas son <strong>80, −70, 155, −182.5, 323.75</strong>. Cada número es el resultado correcto de la fórmula, pero <strong>ninguno es una temperatura real</strong> del servidor.{" "}
              <AbrirCalculadora preset={{ herramienta: "euler", valores: EDO_H5 }}>Verlo en la calculadora de Euler</AbrirCalculadora>
            </p>
            <h3>Ejemplo 2: el mismo paso con RK4</h3>
            <p>
              Factor de RK4: <M tex="R(-2.5)\approx0.648" />, menor que 1 en valor absoluto: <strong>estable</strong>, y positivo, así que no oscila. Pero el paso es tan grande que la temperatura calculada en <M tex="t=5" /> es 58.9 °C frente a 24.9 °C reales: estable, sí; preciso, no.{" "}
              <AbrirCalculadora preset={presetEdo("rk4", { tf: "20", h: "5" })}>Verlo en la calculadora de RK4</AbrirCalculadora>
            </p>
            <h3>Ejemplo 3: h = 3, estable pero oscilante</h3>
            <p>
              Factor de Euler: <M tex="1-0.5\cdot3=-0.5" />, estable (|−0.5| &lt; 1) pero negativo: 80 → <strong>−10</strong> → 35 → 12.5 → 23.75… converge a 20 °C pero cruzando la ambiente.{" "}
              <AbrirCalculadora preset={presetEdo("euler", { tf: "12", h: "3" })}>Verlo en la calculadora</AbrirCalculadora>
            </p>
          </section>

          <section id="explorar" aria-labelledby="h-explorar">
            <h2 id="h-explorar">Pruébalo</h2>
            <p>
              Abre el explorador del panel lateral y prueba distintos valores de <M tex="h" />. El gráfico muestra el factor por paso de ambos métodos: mientras la curva esté por debajo de la línea roja, el método es estable. Cambia también <M tex="k" /> y comprueba que el límite
              se mueve: <M tex="h<2/k" />.
            </p>
            <p>
              <AbrirCalculadora preset={presetEdo("estabilidad", { k: "0.5", h: "0.5" })}>h = 0.5</AbrirCalculadora>{" "}
              <AbrirCalculadora preset={presetEdo("estabilidad", { k: "0.5", h: "3" })}>h = 3</AbrirCalculadora>{" "}
              <AbrirCalculadora preset={presetEdo("estabilidad", { k: "0.5", h: "5" })}>h = 5</AbrirCalculadora>{" "}
              <AbrirCalculadora preset={presetEdo("estabilidad", { k: "2", h: "1" })}>k = 2, h = 1</AbrirCalculadora>
            </p>
          </section>

          <section id="fisica" aria-labelledby="h-fisica">
            <h2 id="h-fisica">Calculado ≠ físico</h2>
            <p>
              Una trayectoria calculada es una <em>secuencia de números</em> producida por una fórmula. Es físicamente válida solo si además se comporta como lo haría el fenómeno real. Para el enfriamiento, la temperatura debe bajar monótonamente, sin
              cruzar la ambiente y sin crecer. El portal lo comprueba y, si no se cumple, lo dice con un aviso. <strong>Ante una trayectoria inestable no se muestra una «solución»</strong>: se muestran los números junto con la explicación de por qué no deben interpretarse.
            </p>
            <ul>
              <li><strong>Antes de interpretar</strong>: calcula <M tex="k\,h" /> y compáralo con los límites.</li>
              <li><strong>Después de calcular</strong>: mira el gráfico y los signos (¿la temperatura cruza la ambiente?).</li>
              <li><strong>Ante la duda</strong>: reduce <M tex="h" /> a la mitad y comprueba que el error baja como se espera.</li>
            </ul>
          </section>

          <section id="resumen" aria-labelledby="h-resumen">
            <h2 id="h-resumen">Para recordar</h2>
            <div className="resumen-clave">
              <ul>
                <li>El factor por paso de Euler es <M tex="1-k\,h" />; es estable si <M tex="0<h<2/k" /> (4 min con k = 0.5).</li>
                <li>Entre <M tex="h=2" /> y <M tex="h=4" /> Euler converge pero oscila: no es físicamente válido; el límite para ser monótono es <M tex="h<1/k" />.</li>
                <li>RK4 es estable hasta <M tex="k\,h\approx2.785" />, pero estable no significa preciso.</li>
                <li>Cuanto más rápido es el fenómeno (<M tex="k" /> grande), más pequeño debe ser el paso.</li>
              </ul>
            </div>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio antes de abrir la pista o la solución. Uno es intermedio y otro avanzado; en el que tiene «Tu plan», decide primero.</p>
            <Ejercicios items={EJERCICIOS_ESTABILIDAD} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Tres preguntas con explicación; abre «Profundiza» para el porqué.</p>
            <Autoevaluacion preguntas={PREGUNTAS_ESTABILIDAD} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
