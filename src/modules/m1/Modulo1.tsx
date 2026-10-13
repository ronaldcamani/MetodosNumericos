import { useMemo } from "react";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import TablaPasos from "../../components/TablaPasos";
import { biseccion, crearModelo, newton } from "../../core/m1";
import CalcBiseccion from "./CalcBiseccion";
import CalcNewton from "./CalcNewton";
import Comparacion from "./Comparacion";
import { EJERCICIOS_M1, PREGUNTAS_M1 } from "./practica";

const SECCIONES = [
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplos resueltos"],
  ["biseccion", "Calculadora: bisección"],
  ["newton", "Calculadora: Newton"],
  ["comparacion", "Caso aplicado y comparación"],
  ["errores", "Errores y tolerancia"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function Modulo1() {
  const base = useMemo(() => crearModelo("calibracion", 2), []);
  const bis = useMemo(
    () => biseccion({ f: base.f, a: 1, b: 2, tol: 1e-6, maxIter: 100 }),
    [base],
  );
  const nw = useMemo(
    () => newton({ f: base.f, df: base.df, x0: 1.5, tol: 1e-6, maxIter: 100 }),
    [base],
  );
  return (
    <ModuloConIndice secciones={SECCIONES}>
      <article className="modulo">
        <h1>Módulo 1: Ecuaciones no lineales y errores</h1>
        <p>
          <strong>Objetivo:</strong> determinar un parámetro de configuración a
          partir de una ecuación no lineal y explicar cuándo converge cada
          método.
        </p>
        <p>Métodos: bisección y Newton.</p>

        <section id="teoria" aria-labelledby="h-teoria">
          <h2 id="h-teoria">Teoría</h2>
          <p>
            <strong>Caso aplicado (datos sintéticos).</strong> Una respuesta
            normalizada se modela con <Matematica tex="g(x)=x^3-x" />. Se busca
            el <Matematica tex="x>0" /> que alcanza la respuesta objetivo 2, es
            decir, la raíz de <Matematica tex="f(x)=x^3-x-2" />. Las variables
            son adimensionales y el modelo no representa mediciones reales.
          </p>
          <h3>Bisección</h3>
          <p>
            <em>Supuestos:</em> <Matematica tex="f" /> continua en{" "}
            <Matematica tex="[a,b]" /> y <Matematica tex="f(a)f(b)<0" />{" "}
            (teorema del valor intermedio).
          </p>
          <Matematica
            bloque
            tex="c_n=\frac{a_n+b_n}{2},\qquad |c_n-r|\le\frac{b_n-a_n}{2}=\frac{b-a}{2^{n}}"
          />
          <ol>
            <li>
              Calcular el punto medio <Matematica tex="c_n" /> y{" "}
              <Matematica tex="f(c_n)" />.
            </li>
            <li>
              Conservar el subintervalo donde <Matematica tex="f" /> cambia de
              signo.
            </li>
            <li>
              Parar si <Matematica tex="(b_n-a_n)/2\le \text{tol}" /> o{" "}
              <Matematica tex="f(c_n)=0" />.
            </li>
          </ol>
          <p>
            <em>Limitaciones:</em> convergencia lenta (una cifra binaria por
            iteración), no detecta raíces donde <Matematica tex="f" /> toca el
            eje sin cambiar de signo y requiere un intervalo válido.
          </p>
          <h3>Newton</h3>
          <p>
            <em>Supuestos:</em> <Matematica tex="f" /> derivable,{" "}
            <Matematica tex="f'(x_n)\ne 0" /> y un <Matematica tex="x_0" />{" "}
            suficientemente cercano a la raíz.
          </p>
          <Matematica
            bloque
            tex="x_{n+1}=x_n-\frac{f(x_n)}{f'(x_n)},\qquad f'(x)=3x^2-1"
          />
          <p>
            Parada: <Matematica tex="|x_{n+1}-x_n|\le \text{tol}" />. Cerca de
            una raíz simple la convergencia es cuadrática.{" "}
            <em>Limitaciones:</em> falla si la derivada es nula o muy pequeña,
            puede divergir o saltar a otra raíz según <Matematica tex="x_0" />,
            y requiere la derivada.
          </p>
          <p className="aviso">
            Agotar el máximo de iteraciones <strong>no</strong> es convergencia:
            el programa lo informa como «sin convergencia».
          </p>
        </section>

        <section id="ejemplos" aria-labelledby="h-ejemplos">
          <h2 id="h-ejemplos">Ejemplos resueltos</h2>
          <h3>Ejemplo 1: bisección en [1, 2]</h3>
          <p>
            <Matematica tex="f(1)=-2<0" /> y <Matematica tex="f(2)=4>0" />: hay
            cambio de signo. Primer punto medio <Matematica tex="c_1=1.5" />,{" "}
            <Matematica tex="f(1.5)=-0.125<0" />, así que la raíz está en{" "}
            <Matematica tex="[1.5,\,2]" />. Primeras iteraciones (calculadas por
            el motor):
          </p>
          <TablaPasos
            titulo="Bisección: iteraciones 1 a 4"
            pasos={bis.pasos.slice(0, 4)}
            columnas={[
              { clave: "n", titulo: "n", valor: (p) => p.n },
              { clave: "a", titulo: "a", valor: (p) => p.a },
              { clave: "b", titulo: "b", valor: (p) => p.b },
              { clave: "m", titulo: "medio", valor: (p) => p.medio },
              { clave: "f", titulo: "f(medio)", valor: (p) => p.fMedio },
              { clave: "c", titulo: "cota", valor: (p) => p.cota },
            ]}
          />
          <p>
            Con tolerancia <Matematica tex="10^{-6}" /> se requieren{" "}
            <Matematica tex="\lceil\log_2((b-a)/\text{tol})\rceil=20" />{" "}
            iteraciones; la raíz es ≈ {bis.resultado?.raiz.toFixed(7)}{" "}
            (referencia: 1.5213797068).
          </p>
          <h3>Ejemplo 2: Newton desde x₀ = 1.5</h3>
          <p>
            <Matematica tex="f(1.5)=-0.125" />,{" "}
            <Matematica tex="f'(1.5)=5.75" />, por tanto{" "}
            <Matematica tex="x_1=1.5+\frac{0.125}{5.75}=\frac{35}{23}\approx 1.5217391304" />
            .
          </p>
          <TablaPasos
            titulo="Newton: iteraciones"
            pasos={nw.pasos}
            columnas={[
              { clave: "n", titulo: "n", valor: (p) => p.n },
              { clave: "x", titulo: "xₙ", valor: (p) => p.x },
              { clave: "s", titulo: "xₙ₊₁", valor: (p) => p.siguiente },
              { clave: "c", titulo: "cambio", valor: (p) => p.cambio },
              { clave: "r", titulo: "residuo", valor: (p) => p.residuo },
            ]}
          />
        </section>

        <section id="biseccion" aria-labelledby="h-bis">
          <h2 id="h-bis">Calculadora: bisección</h2>
          <CalcBiseccion />
        </section>
        <section id="newton" aria-labelledby="h-new">
          <h2 id="h-new">Calculadora: Newton</h2>
          <CalcNewton />
        </section>
        <section id="comparacion" aria-labelledby="h-cmp">
          <h2 id="h-cmp">Caso aplicado y comparación</h2>
          <p>
            Variar la respuesta objetivo y el punto inicial muestra la
            diferencia entre robustez (bisección, siempre que haya cambio de
            signo) y velocidad (Newton, sensible a <Matematica tex="x_0" />
            ). Si un método falla, el otro conserva su salida.
          </p>
          <Comparacion />
        </section>

        <section id="errores" aria-labelledby="h-err">
          <h2 id="h-err">Errores y tolerancia</h2>
          <p>
            Si <Matematica tex="r" /> es la raíz y <Matematica tex="\tilde r" />{" "}
            su aproximación:
          </p>
          <Matematica
            bloque
            tex="E_{abs}=|r-\tilde r|,\qquad E_{rel}=\frac{|r-\tilde r|}{|r|}\ (r\ne0)"
          />
          <p>
            La <strong>tolerancia</strong> es el umbral del criterio de parada.
            El <strong>residuo</strong> <Matematica tex="|f(\tilde r)|" /> no es
            el error: con una función muy plana puede ser pequeño aun estando
            lejos de la raíz. La ficha común de errores del portal se ampliará
            con el resto de equipos.
          </p>
        </section>

        <section id="ejercicios" aria-labelledby="h-ejer">
          <h2 id="h-ejer">Ejercicios propuestos</h2>
          <p>
            Intenta cada ejercicio antes de abrir su solución. Dos son de nivel
            intermedio y dos avanzados.
          </p>
          <Ejercicios items={EJERCICIOS_M1} />
        </section>

        <section id="autoevaluacion" aria-labelledby="h-auto">
          <h2 id="h-auto">Autoevaluación</h2>
          <p>
            Seis preguntas: opción múltiple, verdadero/falso y numéricas con
            tolerancia. La corrección y su explicación aparecen al pulsar
            «Comprobar».
          </p>
          <Autoevaluacion preguntas={PREGUNTAS_M1} />
        </section>
      </article>
    </ModuloConIndice>
  );
}
