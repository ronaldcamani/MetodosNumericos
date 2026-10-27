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
import { CASO_ENFRIAMIENTO, integrarEnfriamiento } from "../../core/m5";
import { PendientesRK4 } from "./Exploradores";
import { herramientasEdo, PAGINAS_EDO } from "./paginas";
import { EJERCICIOS_RK4, PREGUNTAS_RK4 } from "./practica";

const M = Matematica;
const SECCIONES = [
  ["idea", "La idea: promediar pendientes"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplo resuelto"],
  ["explorar", "Pruébalo"],
  ["errores", "Errores comunes"],
  ["resumen", "Para recordar"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function PaginaRK4() {
  const P = CASO_ENFRIAMIENTO;
  const rk = integrarEnfriamiento("rk4", P, 0.5);
  const rk2 = integrarEnfriamiento("rk4", P, 0.25);
  const eu = integrarEnfriamiento("euler", P, 0.5);
  return (
    <ConPanelCalculadora herramientas={herramientasEdo("rk4")}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Ecuaciones diferenciales · Runge-Kutta 4</h1>
          <SubNavegacion enlaces={PAGINAS_EDO} etiqueta="Páginas de ecuaciones diferenciales" />
          <p>
            <strong>Objetivo:</strong> mejorar enormemente la precisión de Euler tomando cuatro pendientes dentro de cada paso y combinándolas con pesos, y entender cuánto cuesta y cuánto gana.
          </p>
          <div className="idea">
            <p><strong>Antes de empezar</strong> repasa <Link to="/diferenciales/euler">Euler explícito</Link>: RK4 es Euler hecho con más cuidado.</p>
          </div>
          <p className="aviso">
            La calculadora está en el panel lateral: <AbrirCalculadora preset={{ herramienta: "rk4" }}>Abrir calculadora</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">La idea: promediar pendientes</h2>
            <p>
              Euler se equivoca porque usa <em>una sola</em> pendiente, la del inicio, durante todo el paso. Pero la pendiente cambia dentro del paso. RK4 hace «pruebas» para saber cómo cambia: mide la pendiente al inicio, dos veces en el centro y una al
              final, y avanza con un <strong>promedio</strong> de ellas (el centro cuenta doble, porque es la estimación más representativa).
            </p>
            <p>
              Es como estimar la velocidad media de un tramo de carretera: en vez de fiarte del velocímetro al salir, lo miras al inicio, en medio (dos veces, con precauciones distintas) y al final, y haces el promedio.
            </p>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <M bloque tex="\begin{aligned}k_1&=f(T_n)\\k_2&=f\!\left(T_n+\tfrac h2k_1\right)\\k_3&=f\!\left(T_n+\tfrac h2k_2\right)\\k_4&=f\!\left(T_n+h\,k_3\right)\end{aligned}\qquad T_{n+1}=T_n+\frac h6\,(k_1+2k_2+2k_3+k_4)" />
            <dl className="glosario">
              <dt><M tex="k_1" /></dt><dd>La pendiente al <em>inicio</em> del paso (la misma que usaría Euler).</dd>
              <dt><M tex="k_2" /></dt><dd>La pendiente en el <em>centro</em>, llegando hasta allí con la pendiente <M tex="k_1" />.</dd>
              <dt><M tex="k_3" /></dt><dd>Otra pendiente en el centro, pero llegando con <M tex="k_2" />: corrige la estimación anterior.</dd>
              <dt><M tex="k_4" /></dt><dd>La pendiente al <em>final</em>, llegando hasta allí con <M tex="k_3" />.</dd>
              <dt><M tex="\tfrac16(k_1+2k_2+2k_3+k_4)" /></dt><dd>El promedio ponderado: las del centro pesan el doble.</dd>
            </dl>
            <ol className="algoritmo">
              <li>Calcular <M tex="k_1" /> con la temperatura actual.</li>
              <li>Con <M tex="k_1" /> estimar la temperatura en el centro y calcular <M tex="k_2" />.</li>
              <li>Con <M tex="k_2" /> volver a estimarla y calcular <M tex="k_3" />.</li>
              <li>Con <M tex="k_3" /> estimar la temperatura al final y calcular <M tex="k_4" />.</li>
              <li>Avanzar con el promedio ponderado y repetir.</li>
            </ol>
            <p>
              <strong>Error.</strong> El error global es proporcional a <M tex="h^4" /> (<strong>orden 4</strong>): partir el paso a la mitad divide el error por <M tex="2^4=16" />. Cuesta <strong>4 evaluaciones</strong> de la derivada por paso.
            </p>
            <div className="dos-columnas">
              <div>
                <h4>Cuándo usarlo</h4>
                <ul>
                  <li>Se necesita buena precisión.</li>
                  <li>El paso es grande o se quiere pocos pasos.</li>
                  <li>No se sabe cuánta precisión hará falta (es la opción robusta).</li>
                </ul>
              </div>
              <div>
                <h4>Cuándo no</h4>
                <ul>
                  <li>Solo se quiere una idea rápida de la forma de la curva.</li>
                  <li>Con <M tex="k\,h" /> grande también puede ser inestable (límite ≈ 2.785).</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplo resuelto: el primer paso con h = 0.5</h2>
            <p>Mismo problema que en Euler: <M tex="T'=-0.5(T-20)" />, <M tex="T(0)=80" />, <M tex="h=0.5" />. Ahora hay cuatro pendientes:</p>
            <ol className="algoritmo">
              <li><M tex="k_1=f(80)=-0.5\,(80-20)=-30" />. (Euler se quedaría aquí.)</li>
              <li>Temperatura estimada en el centro con <M tex="k_1" />: <M tex="80+0.25\cdot(-30)=72.5" />. Entonces <M tex="k_2=f(72.5)=-26.25" />.</li>
              <li>Con <M tex="k_2" />: <M tex="80+0.25\cdot(-26.25)=73.4375" />, y <M tex="k_3=f(73.4375)=-26.71875" />.</li>
              <li>Con <M tex="k_3" /> estimamos el final: <M tex="80+0.5\cdot(-26.71875)=66.640625" />, y <M tex="k_4=f(66.640625)=-23.3203125" />.</li>
              <li>Promedio ponderado: <M tex="\tfrac16(-30+2(-26.25)+2(-26.71875)-23.3203125)=-26.54296875" /> °C/min.</li>
              <li>Nueva temperatura: <M tex="T_1=80+0.5\cdot(-26.54296875)=66.728515625" /> °C.</li>
            </ol>
            <p>
              La exacta es 66.7280469843 °C: el error es solo <strong>4.7·10⁻⁴ °C</strong>, frente a 1.728 °C de Euler con el mismo paso. Es más de 3000 veces más preciso.
            </p>
            <TablaPasos titulo="RK4, h = 0.5" pasos={rk.pasos} columnas={[
              { clave: "t", titulo: "t (min)", valor: (q) => q.t }, { clave: "T", titulo: "T calculada (°C)", valor: (q) => q.T }, { clave: "e", titulo: "T exacta (°C)", valor: (q) => q.exacta }, { clave: "er", titulo: "error (°C)", valor: (q) => q.error },
            ]} />
            <div className="tabla-wrap">
              <table>
                <caption>Error máximo sobre los nodos hasta t = 2 min</caption>
                <thead><tr><th scope="col">Método</th><th scope="col">h = 0.5</th><th scope="col">h = 0.25</th><th scope="col">Cociente</th><th scope="col">Evaluaciones de f (h = 0.5)</th></tr></thead>
                <tbody>
                  <tr><th scope="row" className="txt">Euler</th><td>{fmt(eu.resultado?.errorMaximo, 5)}</td><td>{fmt(integrarEnfriamiento("euler", P, 0.25).resultado?.errorMaximo, 5)}</td><td>≈ 2.1</td><td>4</td></tr>
                  <tr><th scope="row" className="txt">RK4</th><td>{fmt(rk.resultado?.errorMaximo, 5)}</td><td>{fmt(rk2.resultado?.errorMaximo, 5)}</td><td>≈ 17.8</td><td>16</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              <AbrirCalculadora preset={{ herramienta: "rk4" }}>Reproducir en la calculadora</AbrirCalculadora>: la tabla «Las cuatro pendientes del primer paso» muestra los cuatro valores de arriba.
            </p>
          </section>

          <section id="explorar" aria-labelledby="h-explorar">
            <h2 id="h-explorar">Pruébalo</h2>
            <PendientesRK4 />
          </section>

          <section id="errores" aria-labelledby="h-erroc">
            <h2 id="h-erroc">Errores comunes</h2>
            <ul>
              <li><strong>Calcular <M tex="k_2" /> y <M tex="k_3" /> con la misma pendiente.</strong> <M tex="k_3" /> usa <M tex="k_2" />, no <M tex="k_1" />.</li>
              <li><strong>Usar <M tex="h" /> donde va <M tex="h/2" />.</strong> Las estimaciones de <M tex="k_2" /> y <M tex="k_3" /> avanzan <em>medio</em> paso.</li>
              <li><strong>Olvidar el factor 2</strong> de <M tex="k_2" /> y <M tex="k_3" /> en el promedio (y el <M tex="1/6" />: 1 + 2 + 2 + 1 = 6).</li>
              <li><strong>Creer que RK4 nunca falla.</strong> Con un paso muy grande también es inestable (<M tex="k\,h>2.785" />) o, aun siendo estable, muy inexacto.</li>
              <li><strong>Comparar solo por coste por paso.</strong> RK4 hace 4 evaluaciones por paso, pero necesita muchos menos pasos.</li>
            </ul>
          </section>

          <section id="resumen" aria-labelledby="h-resumen">
            <h2 id="h-resumen">Para recordar</h2>
            <div className="resumen-clave">
              <ul>
                <li>RK4 promedia cuatro pendientes (<M tex="k_1" /> inicio, <M tex="k_2" /> y <M tex="k_3" /> centro, <M tex="k_4" /> final) con pesos 1, 2, 2, 1.</li>
                <li>Error global ∝ <M tex="h^4" />: partir el paso a la mitad divide el error por ≈ 16.</li>
                <li>Cuesta 4 evaluaciones por paso, pero admite pasos mucho mayores: casi siempre es más barato para una precisión dada.</li>
                <li>Es estable para <M tex="0<k\,h<2.785" /> (h &lt; 5.57 min con k = 0.5).</li>
              </ul>
            </div>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio antes de abrir la pista o la solución. Uno es intermedio y otro avanzado.</p>
            <Ejercicios items={EJERCICIOS_RK4} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Tres preguntas con explicación; abre «Profundiza» para el porqué.</p>
            <Autoevaluacion preguntas={PREGUNTAS_RK4} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
