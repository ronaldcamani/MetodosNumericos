import { useMemo } from "react";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import TablaPasos from "../../components/TablaPasos";
import { fmt } from "../../core/formato";
import { lagrange, regresionLineal } from "../../core/m3";
import CalcLagrange from "./CalcLagrange";
import CalcRegresion from "./CalcRegresion";
import Comparacion from "./Comparacion";
import { EJERCICIOS_M3, PREGUNTAS_M3 } from "./practica";

const x = [0, 1, 2, 3];
const y = [1, 2, 2, 4];
const SECCIONES = [
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplos resueltos"],
  ["lagrange", "Calculadora: Lagrange"],
  ["regresion", "Calculadora: regresión"],
  ["comparacion", "Caso aplicado y comparación"],
  ["limites", "Cuidados al usar cada modelo"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function Modulo3() {
  const lag = useMemo(() => lagrange({ x, y, consulta: 1.5 }), []);
  const reg = useMemo(() => regresionLineal({ x, y, consulta: 1.5 }), []);
  const r = reg.resultado;
  return (
    <ModuloConIndice secciones={SECCIONES}>
      <article className="modulo">
        <h1>Módulo 3: Interpolación y ajuste de curvas</h1>
        <p>
          <strong>Objetivo:</strong> distinguir <em>pasar por los datos</em> de{" "}
          <em>aproximar una tendencia</em>, y elegir entre interpolación y
          regresión según el propósito.
        </p>
        <p> Métodos: interpolación de Lagrange y regresión lineal.</p>

        <section id="teoria" aria-labelledby="h-teoria">
          <h2 id="h-teoria">Teoría</h2>
          <p>
            <strong>Caso aplicado (datos sintéticos).</strong> Carga y latencia
            de un servicio: la carga normalizada <Matematica tex="x" /> (sin
            unidades) toma los valores 0, 1, 2 y 3 y la latencia{" "}
            <Matematica tex="y" /> mide 1, 2, 2 y 4 milisegundos. Se pregunta
            qué latencia esperar con carga <Matematica tex="x=1.5" />.
          </p>
          <h3>Interpolación de Lagrange</h3>
          <p>
            Dados <Matematica tex="n" /> nodos con abscisas{" "}
            <strong>distintas</strong> (entre 2 y 6), existe un único polinomio
            de grado <Matematica tex="\le n-1" /> que pasa por todos:
          </p>
          <Matematica
            bloque
            tex="P(x)=\sum_{i=0}^{n-1}y_i\,L_i(x),\qquad L_i(x)=\prod_{j\ne i}\frac{x-x_j}{x_i-x_j}"
          />
          <p>
            Cada base cumple <Matematica tex="L_i(x_k)=1" /> si{" "}
            <Matematica tex="k=i" /> y <Matematica tex="0" /> en los demás
            nodos, y <Matematica tex="\sum_iL_i(x)=1" />. La calculadora
            muestra la contribución <Matematica tex="y_iL_i(x)" /> de cada nodo.
          </p>
          <p>
            <em>Limitaciones:</em> exige abscisas distintas (si no, aparece una
            división entre cero); reproduce también el ruido de medición; y un
            grado alto puede oscilar entre los nodos (fenómeno de Runge).
          </p>
          <h3>Regresión lineal por mínimos cuadrados</h3>
          <p>
            Se busca la recta <Matematica tex="\hat y=b_0+b_1x" /> que minimiza
            la suma de cuadrados de los residuos{" "}
            <Matematica tex="r_i=y_i-\hat y_i" />:
          </p>
          <Matematica
            bloque
            tex="b_1=\frac{S_{xy}}{S_{xx}}=\frac{\sum(x_i-\bar x)(y_i-\bar y)}{\sum(x_i-\bar x)^2},\qquad b_0=\bar y-b_1\bar x,\qquad \mathrm{SSE}=\sum r_i^2"
          />
          <p>
            <em>Limitaciones:</em> necesita variación en <Matematica tex="x" />{" "}
            (si <Matematica tex="S_{xx}=0" /> la pendiente no existe) y supone
            una tendencia lineal; extrapolar fuera de los datos no está
            respaldado. El coeficiente{" "}
            <Matematica tex="R^2=1-\mathrm{SSE}/\sum(y_i-\bar y)^2" /> mide qué
            parte de la variación explica la recta.
          </p>
          <p className="aviso">
            <strong>¿Cuál elegir?</strong> Si los datos son exactos y se
            necesita un valor <em>entre</em> nodos, interpolar. Si los datos
            tienen ruido y se busca la tendencia o predecir, ajustar. En el
            caso base ambos dan resultados distintos, y eso es esperable.
          </p>
        </section>

        <section id="ejemplos" aria-labelledby="h-ejemplos">
          <h2 id="h-ejemplos">Ejemplos resueltos</h2>
          <h3>Ejemplo 1: Lagrange en x = 1.5</h3>
          <p>
            Con nodos <Matematica tex="0,1,2,3" />, por ejemplo{" "}
            <Matematica tex="L_1(1.5)=\dfrac{(1.5-0)(1.5-2)(1.5-3)}{(1-0)(1-2)(1-3)}=\dfrac{1.125}{2}=0.5625" />
            . Las cuatro bases y sus contribuciones (calculadas por el motor):
          </p>
          <TablaPasos
            titulo="Bases de Lagrange en x = 1.5"
            pasos={lag.pasos}
            columnas={[
              { clave: "i", titulo: "i", valor: (p) => p.i },
              { clave: "x", titulo: "xᵢ", valor: (p) => p.xi },
              { clave: "y", titulo: "yᵢ", valor: (p) => p.yi },
              { clave: "L", titulo: "Lᵢ(1.5)", valor: (p) => p.base },
              { clave: "c", titulo: "yᵢ · Lᵢ(1.5)", valor: (p) => p.contribucion },
            ]}
          />
          <p>
            Suma: <Matematica tex="P(1.5)=" /> {fmt(lag.resultado?.valor, 10)}{" "}
            (las bases suman 1).
          </p>
          <h3>Ejemplo 2: regresión lineal</h3>
          {r && (
            <>
              <p>
                <Matematica
                  tex={`\\bar x=${fmt(r.xMedia)},\\;\\bar y=${fmt(r.yMedia)},\\;S_{xx}=${fmt(r.sxx)},\\;S_{xy}=${fmt(r.sxy)}`}
                />
                , luego <Matematica tex={`b_1=${fmt(r.pendiente)}`} /> y{" "}
                <Matematica tex={`b_0=${fmt(r.intercepto)}`} />: la recta es{" "}
                <Matematica
                  tex={`\\hat y=${fmt(r.intercepto)}+${fmt(r.pendiente)}x`}
                />
                . En <Matematica tex="x=1.5" /> predice{" "}
                <Matematica tex={`\\hat y=${fmt(r.prediccion)}`} />.
              </p>
              <TablaPasos
                titulo="Residuos de la recta"
                pasos={reg.pasos}
                columnas={[
                  { clave: "x", titulo: "xᵢ", valor: (p) => p.x },
                  { clave: "y", titulo: "yᵢ", valor: (p) => p.y },
                  { clave: "a", titulo: "ŷᵢ", valor: (p) => p.yAjustada },
                  { clave: "r", titulo: "residuo", valor: (p) => p.residuo },
                  { clave: "r2", titulo: "residuo²", valor: (p) => p.residuo2 },
                ]}
              />
              <p>
                Suma de cuadrados de los residuos: {fmt(r.sse, 10)}. Los
                residuos suman 0 y la recta pasa por{" "}
                <Matematica tex="(\bar x,\bar y)" />.
              </p>
            </>
          )}
        </section>

        <section id="lagrange" aria-labelledby="h-lag">
          <h2 id="h-lag">Calculadora: interpolación de Lagrange</h2>
          <CalcLagrange />
        </section>
        <section id="regresion" aria-labelledby="h-reg">
          <h2 id="h-reg">Calculadora: regresión lineal</h2>
          <CalcRegresion />
        </section>
        <section id="comparacion" aria-labelledby="h-c">
          <h2 id="h-c">Caso aplicado y comparación</h2>
          <p>
            Con la carga en <Matematica tex="x=1.5" />, Lagrange estima{" "}
            <strong>{fmt(lag.resultado?.valor, 4)} ms</strong> y la recta{" "}
            <strong>{fmt(r?.prediccion, 4)} ms</strong>. No coinciden porque
            Lagrange obliga a la curva a pasar por los cuatro puntos (residuo
            0), mientras que la recta acepta una suma de cuadrados de{" "}
            {fmt(r?.sse, 2)} a cambio de una tendencia estable. Si los datos
            tienen ruido, la interpolación reproduce ese ruido.
          </p>
          <Comparacion />
        </section>
        <section id="limites" aria-labelledby="h-l">
          <h2 id="h-l">Cuidados al usar cada modelo</h2>
          <ul>
            <li>
              <strong>Nodos repetidos.</strong> Si una abscisa se repite con
              valores distintos, Lagrange rechaza la entrada y no elimina
              ningún nodo en silencio. La regresión sí admite réplicas en{" "}
              <Matematica tex="x" />.
            </li>
            <li>
              <strong>Sin variación en x.</strong> Si todas las{" "}
              <Matematica tex="x" /> son iguales, <Matematica tex="S_{xx}=0" /> y
              no hay recta que ajustar.
            </li>
            <li>
              <strong>Fuera del intervalo.</strong> Una consulta fuera de{" "}
              <Matematica tex="[\min x,\max x]" /> es extrapolación; el portal
              calcula pero muestra un aviso.
            </li>
            <li>
              <strong>Grado alto.</strong> Con 5 o 6 nodos el polinomio puede
              oscilar; el botón «Ejemplo de oscilación» lo muestra con{" "}
              <Matematica tex="1/(1+25x^2)" />.
            </li>
            <li>
              <strong>Interpolar no elimina el error de medición</strong>: lo
              traslada a la curva.
            </li>
          </ul>
        </section>

        <section id="ejercicios" aria-labelledby="h-ejer">
          <h2 id="h-ejer">Ejercicios propuestos</h2>
          <p>
            Intenta cada ejercicio antes de abrir su solución. Dos son de nivel
            intermedio y dos avanzados.
          </p>
          <Ejercicios items={EJERCICIOS_M3} />
        </section>

        <section id="autoevaluacion" aria-labelledby="h-auto">
          <h2 id="h-auto">Autoevaluación</h2>
          <p>
            Seis preguntas: opción múltiple, verdadero/falso y numéricas con
            tolerancia. La corrección y su explicación aparecen al pulsar
            «Comprobar».
          </p>
          <Autoevaluacion preguntas={PREGUNTAS_M3} />
        </section>
      </article>
    </ModuloConIndice>
  );
}
