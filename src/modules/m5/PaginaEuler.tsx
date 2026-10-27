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
import { ExploradorEuler } from "./Exploradores";
import { EDO_H0, EDO_H03 } from "./modelo";
import { herramientasEdo, PAGINAS_EDO } from "./paginas";
import { EJERCICIOS_EULER, PREGUNTAS_EULER } from "./practica";

const M = Matematica;
const SECCIONES = [
  ["idea", "La idea: seguir la pendiente"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplo resuelto"],
  ["explorar", "Pruébalo"],
  ["errores", "Errores comunes"],
  ["resumen", "Para recordar"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function PaginaEuler() {
  const r = integrarEnfriamiento("euler", CASO_ENFRIAMIENTO, 0.5);
  return (
    <ConPanelCalculadora herramientas={herramientasEdo("euler")}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Ecuaciones diferenciales · Euler explícito</h1>
          <SubNavegacion enlaces={PAGINAS_EDO} etiqueta="Páginas de ecuaciones diferenciales" />
          <p>
            <strong>Objetivo:</strong> calcular la evolución de un sistema avanzando paso a paso con la pendiente actual, medir su error y entender por qué es simple pero poco preciso.
          </p>
          <div className="idea">
            <p><strong>Antes de empezar necesitas saber</strong> qué es una derivada como «velocidad de cambio» (¿cuántos grados por minuto cambia la temperatura ahora?) y leer una ecuación como <M tex="T'=-0.5(T-20)" />. Si no lo tienes claro, vuelve a <Link to="/diferenciales">Planteo y decisión</Link>.</p>
          </div>
          <p className="aviso">
            La calculadora está en el panel lateral: <AbrirCalculadora preset={{ herramienta: "euler" }}>Abrir calculadora</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">La idea: seguir la pendiente</h2>
            <p>
              Imagina que conduces de noche con los faros apagados y solo puedes mirar el velocímetro. Sabes dónde estás y a qué velocidad vas ahora; la idea más sencilla es <em>suponer que seguirás a esa velocidad un ratito</em> (un paso)
              y, al terminar, mirar de nuevo el velocímetro. Eso es Euler: <strong>usar la pendiente de ahora para avanzar en línea recta un paso</strong>.
            </p>
            <p>
              Funciona bien si el paso es corto (la pendiente casi no cambia durante él) y mal si es largo (la curva se aparta de la recta). Como la temperatura se curva hacia la ambiente, la recta siempre «se pasa» un poco: por eso Euler
              da temperaturas algo más altas que las reales (queda por encima de la curva).
            </p>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <p>Dada la ecuación <M tex="T'=f(T)" /> con <M tex="f(T)=-k(T-T_a)" /> y la condición inicial <M tex="T(0)=T_0" />:</p>
            <M bloque tex="T_{n+1}=T_n+h\,f(T_n),\qquad t_{n+1}=t_n+h" />
            <p>Léelo así: <em>nueva temperatura = temperatura actual + paso × pendiente actual</em>. Cada símbolo:</p>
            <dl className="glosario">
              <dt><M tex="T_n" /></dt><dd>La temperatura calculada en el instante <M tex="t_n" />.</dd>
              <dt><M tex="h" /></dt><dd>El paso, en minutos.</dd>
              <dt><M tex="f(T_n)=-k(T_n-T_a)" /></dt><dd>La pendiente en °C/min; negativa si <M tex="T_n>T_a" />.</dd>
              <dt><M tex="h\,f(T_n)" /></dt><dd>El incremento <M tex="\Delta T" /> de este paso, en °C.</dd>
            </dl>
            <ol className="algoritmo">
              <li>Partir de <M tex="t_0=0" /> y <M tex="T_0" /> (la condición inicial).</li>
              <li>Calcular la pendiente <M tex="f(T_n)" /> con la temperatura actual.</li>
              <li>Avanzar: <M tex="T_{n+1}=T_n+h\,f(T_n)" /> y <M tex="t_{n+1}=t_n+h" />.</li>
              <li>Si el paso no divide el intervalo, el <strong>último paso se acorta</strong> para terminar exactamente en <M tex="t_f" />.</li>
              <li>Comparar con la solución exacta (si se conoce) para medir el error.</li>
            </ol>
            <p>
              <strong>Error.</strong> Cada paso comete un error local proporcional a <M tex="h^2" />; como hacen falta <M tex="1/h" /> pasos, el error global es proporcional a <M tex="h" /> (<strong>orden 1</strong>): partir el paso a la mitad divide el error por 2.
            </p>
            <div className="dos-columnas">
              <div>
                <h4>Cuándo usarlo</h4>
                <ul>
                  <li>Para entender el problema o hacer una primera exploración.</li>
                  <li>Precisión moderada con un paso pequeño.</li>
                  <li>La derivada es costosa y se acepta menos precisión.</li>
                </ul>
              </div>
              <div>
                <h4>Cuándo no</h4>
                <ul>
                  <li>Se necesita un error muy pequeño (hacen falta miles de pasos).</li>
                  <li>El paso es grande o <M tex="k\,h\ge2" />: inestable.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplo resuelto: el enfriamiento con h = 0.5</h2>
            <p>Datos: <M tex="T'=-0.5(T-20)" />, <M tex="T(0)=80" />, <M tex="h=0.5" />, hasta <M tex="t=2" />. Veamos el primer paso con todos los números:</p>
            <ol className="algoritmo">
              <li>Pendiente inicial: <M tex="f(80)=-0.5\,(80-20)=-30" /> °C/min. (Baja 30 grados por minuto.)</li>
              <li>Incremento: <M tex="\Delta T=h\,f=0.5\cdot(-30)=-15" /> °C.</li>
              <li>Nueva temperatura: <M tex="T_1=80-15=65" /> °C en <M tex="t=0.5" /> min.</li>
              <li>Comparación: la exacta es <M tex="20+60e^{-0.25}=66.728" /> °C. Error: <strong>1.728 °C</strong>. Euler baja demasiado rápido porque mantuvo la pendiente de −30 (la del inicio) todo el paso.</li>
            </ol>
            <p>El resto de la tabla, calculada por el motor:</p>
            <TablaPasos titulo="Euler explícito, h = 0.5" pasos={r.pasos} columnas={[
              { clave: "t", titulo: "t (min)", valor: (q) => q.t }, { clave: "T", titulo: "T calculada (°C)", valor: (q) => q.T }, { clave: "d", titulo: "ΔT (°C)", valor: (q) => (q.i === 0 ? null : q.incremento) },
              { clave: "e", titulo: "T exacta (°C)", valor: (q) => q.exacta }, { clave: "er", titulo: "error (°C)", valor: (q) => q.error },
            ]} />
            <p>
              El error máximo es {fmt(r.resultado?.errorMaximo, 6)} °C y crece paso a paso: los errores <em>se acumulan</em>.{" "}
              <AbrirCalculadora preset={{ herramienta: "euler" }}>Reproducir en la calculadora</AbrirCalculadora>
            </p>
          </section>

          <section id="explorar" aria-labelledby="h-explorar">
            <h2 id="h-explorar">Pruébalo</h2>
            <ExploradorEuler />
            <p>
              Con la calculadora puedes además <AbrirCalculadora preset={{ herramienta: "euler", valores: { h: "0.25" } }}>probar h = 0.25</AbrirCalculadora>,{" "}
              <AbrirCalculadora preset={{ herramienta: "euler", valores: EDO_H03 }}>h = 0.3 (último paso corto)</AbrirCalculadora> y{" "}
              <AbrirCalculadora preset={{ herramienta: "euler", valores: EDO_H0 }}>h = 0 (se rechaza)</AbrirCalculadora>.
            </p>
          </section>

          <section id="errores" aria-labelledby="h-erroc">
            <h2 id="h-erroc">Errores comunes</h2>
            <ul>
              <li><strong>Usar h en el último paso aunque sea más corto.</strong> Si el intervalo no es múltiplo de <M tex="h" />, el último paso usa <M tex="t_f-t_{n}" />, no <M tex="h" />.</li>
              <li><strong>Confundir error local y global.</strong> El error en un solo paso es pequeño; el que importa es el acumulado.</li>
              <li><strong>Creer que un paso más pequeño siempre arregla todo.</strong> Mejora el error, pero también hay más pasos (y más redondeo).</li>
              <li><strong>Olvidar las unidades.</strong> <M tex="h" /> en minutos, <M tex="k" /> en 1/min; <M tex="k\,h" /> no tiene unidades.</li>
              <li><strong>Fiarse de una trayectoria sin comprobar la estabilidad.</strong> Con <M tex="k\,h\ge2" /> Euler calcula números sin sentido físico.</li>
            </ul>
          </section>

          <section id="resumen" aria-labelledby="h-resumen">
            <h2 id="h-resumen">Para recordar</h2>
            <div className="resumen-clave">
              <ul>
                <li>Euler avanza con la pendiente <em>del inicio</em> del paso: <M tex="T_{n+1}=T_n+h\,f(T_n)" />.</li>
                <li>Error global ∝ <M tex="h" />: partir el paso a la mitad divide el error por ≈ 2.</li>
                <li>Es estable solo si <M tex="0<k\,h<2" /> (aquí <M tex="h<4" /> min); trayectoria monótona si <M tex="k\,h<1" />.</li>
                <li>Si <M tex="h" /> no divide el intervalo, el último paso se acorta y se registra.</li>
              </ul>
            </div>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio antes de abrir la pista o la solución. Uno es intermedio y otro avanzado.</p>
            <Ejercicios items={EJERCICIOS_EULER} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Tres preguntas con explicación; abre «Profundiza» para el porqué.</p>
            <Autoevaluacion preguntas={PREGUNTAS_EULER} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
