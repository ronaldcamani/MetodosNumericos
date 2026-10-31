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
import { regresionLineal } from "../../core/m3";
import { DATOS_X_IGUALES } from "./datos";
import { herramientasInterpolacion, PAGINAS_INTERPOLACION, presetDatos } from "./paginas";
import { EJERCICIOS_REGRESION, PREGUNTAS_REGRESION } from "./practica";

const M = Matematica;
const SECCIONES = [
  ["idea", "La idea: la tendencia"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplo resuelto"],
  ["cuidados", "Cuidados"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function PaginaRegresion() {
  const reg = regresionLineal({ x: [0, 1, 2, 3], y: [1, 2, 2, 4], consulta: 1.5 });
  const r = reg.resultado;
  return (
    <ConPanelCalculadora herramientas={herramientasInterpolacion()}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Interpolación y ajuste de curvas · Ajuste por regresión</h1>
          <SubNavegacion enlaces={PAGINAS_INTERPOLACION} etiqueta="Páginas de interpolación y ajuste de curvas" />
          <p>
            <strong>Objetivo:</strong> ajustar una recta por mínimos cuadrados, interpretar pendiente, intercepto, residuos y R², y entender por qué no pasa por los datos.
          </p>
          <p className="aviso">
            ¿Interpolar o ajustar? Revisa <Link to="/interpolacion">Planteo y decisión</Link>. La calculadora está en el panel lateral:{" "}
            <AbrirCalculadora preset={{ herramienta: "regresion" }}>Abrir calculadora</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">La idea: la tendencia</h2>
            <p>
              Cuando los datos tienen ruido, obligar a la curva a pasar por todos los puntos reproduce el ruido. La regresión busca la recta que mejor
              resume la tendencia: la que minimiza la suma de los <strong>cuadrados</strong> de las distancias verticales (residuos) a los datos.
            </p>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <p>Se busca <M tex="\hat y=b_0+b_1x" /> que minimice <M tex="\mathrm{SSE}=\sum r_i^2" /> con <M tex="r_i=y_i-\hat y_i" />:</p>
            <M bloque tex="b_1=\frac{S_{xy}}{S_{xx}}=\frac{\sum(x_i-\bar x)(y_i-\bar y)}{\sum(x_i-\bar x)^2},\qquad b_0=\bar y-b_1\bar x" />
            <ol className="algoritmo">
              <li>Calcular las medias <M tex="\bar x" /> y <M tex="\bar y" />.</li>
              <li>Calcular <M tex="S_{xx}" /> y <M tex="S_{xy}" />; si <M tex="S_{xx}=0" /> (todas las x iguales) no hay recta.</li>
              <li>Obtener <M tex="b_1" />, <M tex="b_0" />, los valores ajustados y los residuos.</li>
              <li>Evaluar <M tex="\mathrm{SSE}" /> y <M tex="R^2=1-\mathrm{SSE}/\sum(y_i-\bar y)^2" />, y la predicción en la consulta.</li>
            </ol>
            <div className="dos-columnas">
              <div>
                <h3>Cuándo usarla</h3>
                <ul>
                  <li>Datos con ruido y tendencia aproximadamente lineal.</li>
                  <li>Hay abscisas repetidas (réplicas).</li>
                  <li>Se busca predecir, no reproducir cada dato.</li>
                </ul>
              </div>
              <div>
                <h3>Cuándo no</h3>
                <ul>
                  <li>La relación claramente no es lineal.</li>
                  <li>Se necesita pasar exactamente por los datos.</li>
                  <li>Se extrapola lejos de los datos sin justificación.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplo resuelto: regresión lineal</h2>
            {r && (
              <>
                <p>
                  <M tex={`\\bar x=${fmt(r.xMedia)},\\;\\bar y=${fmt(r.yMedia)},\\;S_{xx}=${fmt(r.sxx)},\\;S_{xy}=${fmt(r.sxy)}`} />, luego{" "}
                  <M tex={`b_1=${fmt(r.pendiente)}`} /> y <M tex={`b_0=${fmt(r.intercepto)}`} />: la recta es{" "}
                  <M tex={`\\hat y=${fmt(r.intercepto)}+${fmt(r.pendiente)}x`} />. En <M tex="x=1.5" /> predice <M tex={`\\hat y=${fmt(r.prediccion)}`} />.
                </p>
                <TablaPasos titulo="Residuos de la recta" pasos={reg.pasos} columnas={[
                  { clave: "x", titulo: "xᵢ", valor: (p) => p.x }, { clave: "y", titulo: "yᵢ", valor: (p) => p.y }, { clave: "a", titulo: "ŷᵢ", valor: (p) => p.yAjustada },
                  { clave: "r", titulo: "residuo", valor: (p) => p.residuo }, { clave: "r2", titulo: "residuo²", valor: (p) => p.residuo2 },
                ]} />
                <p>
                  Suma de cuadrados de los residuos: {fmt(r.sse, 10)}; <M tex={`R^2=${fmt(r.r2, 4)}`} />. Los residuos suman 0 y la recta pasa por <M tex="(\bar x,\bar y)" />.{" "}
                  <AbrirCalculadora preset={{ herramienta: "regresion" }}>Reproducir en la calculadora</AbrirCalculadora>
                </p>
              </>
            )}
          </section>

          <section id="cuidados" aria-labelledby="h-cui">
            <h2 id="h-cui">Cuidados</h2>
            <ul>
              <li>
                <strong>Sin variación en x.</strong> Si todas las <M tex="x" /> son iguales, <M tex="S_{xx}=0" />: no hay recta.{" "}
                <AbrirCalculadora preset={{ herramienta: "regresion", valores: DATOS_X_IGUALES }}>Probar fallo</AbrirCalculadora>
              </li>
              <li>
                <strong>Réplicas.</strong> Se admiten abscisas repetidas si hay variación en otras:{" "}
                <AbrirCalculadora preset={presetDatos("regresion", [0, 0, 1, 1], [1, 3, 3, 5], 0.5)}>probar (0,1),(0,3),(1,3),(1,5)</AbrirCalculadora>.
              </li>
              <li>
                <strong>Extrapolación.</strong> Fuera del intervalo no hay respaldo:{" "}
                <AbrirCalculadora preset={{ herramienta: "regresion", valores: { consulta: "3.5" } }}>probar x = 3.5</AbrirCalculadora>.
              </li>
              <li><strong>Dos puntos.</strong> La recta pasa por ambos (SSE = 0): no hay información para juzgar el ajuste.</li>
              <li><strong>Un R² alto no prueba linealidad</strong>: mira también los residuos y el gráfico.</li>
            </ul>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio por tu cuenta antes de revelar los pasos de la solución (se muestran uno a uno). Uno es intermedio y otro avanzado.</p>
            <Ejercicios items={EJERCICIOS_REGRESION} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Tres preguntas con explicación; abre «Profundiza» para el porqué.</p>
            <Autoevaluacion preguntas={PREGUNTAS_REGRESION} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
