import { useMemo } from "react";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import TablaPasos from "../../components/TablaPasos";
import { fmt } from "../../core/formato";
import { derivacionCentral, evaluarTasa, integralExacta, integrarTasa } from "../../core/m4";
import CalcIntegral from "./CalcIntegral";
import Comparacion from "./Comparacion";
import { EJERCICIOS_M4, PREGUNTAS_M4 } from "./practica";

const tasa = { a: 1, b: 0, c: 1 };
const entrada = { tasa, inicio: 0, fin: 2, n: 4 };
const r = (t: number) => evaluarTasa(tasa, t);
const V = (t: number) => integralExacta(tasa, 0, t);
const SECCIONES = [
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplos resueltos"],
  ["trapecio", "Calculadora: trapecio"],
  ["simpson", "Calculadora: Simpson"],
  ["comparacion", "Caso aplicado y comparación"],
  ["derivacion", "Ficha: derivación central"],
  ["limites", "Restricciones y cuidados"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

const columnas = (f: string) => [
  { clave: "i", titulo: "i", valor: (p: { i: number }) => p.i },
  { clave: "t", titulo: "tᵢ (s)", valor: (p: { t: number }) => p.t },
  { clave: "r", titulo: "r(tᵢ) (MB/s)", valor: (p: { r: number }) => p.r },
  { clave: "w", titulo: "peso", valor: (p: { peso: number }) => p.peso },
  { clave: "c", titulo: `${f}·peso·r (MB)`, valor: (p: { contribucion: number }) => p.contribucion },
  { clave: "s", titulo: "suma parcial (MB)", valor: (p: { sumaParcial: number }) => p.sumaParcial },
];

export default function Modulo4() {
  const trap = useMemo(() => integrarTasa("trapecio", entrada), []);
  const simp = useMemo(() => integrarTasa("simpson", entrada), []);
  const derivadas = useMemo(
    () => [0.5, 0.1, 0.01].map((h) => ({ h, d: derivacionCentral(r, 1, h) })),
    [],
  );
  const dV = derivacionCentral(V, 2, 0.1);
  return (
    <ModuloConIndice secciones={SECCIONES}>
      <article className="modulo">
        <h1>Módulo 4: Integración numérica</h1>
        <p>
          <strong>Objetivo:</strong> estimar una cantidad acumulada a partir de
          una tasa y comparar el efecto de refinar la partición.
        </p>
        <p> Métodos: trapecio compuesto y Simpson 1/3 compuesto.</p>

        <section id="teoria" aria-labelledby="h-teoria">
          <h2 id="h-teoria">Teoría</h2>
          <p>
            <strong>Caso aplicado (datos sintéticos).</strong> La tasa de
            transferencia de un servicio es{" "}
            <Matematica tex="r(t)=t^2+1" /> MB/s durante <Matematica tex="t\in[0,2]" />{" "}
            s. El volumen transferido es la integral
          </p>
          <Matematica bloque tex="V=\int_0^2 r(t)\,dt\quad[\text{MB}]=\bigl[\tfrac{\text{MB}}{\text{s}}\bigr]\cdot[\text{s}]" />
          <p>
            Su valor exacto es <Matematica tex="\tfrac{14}{3}\approx4.6666666667" /> MB.
            Los métodos numéricos reemplazan la integral por una suma sobre
            una malla uniforme de <Matematica tex="n" /> subintervalos con paso{" "}
            <Matematica tex="h=(b-a)/n" /> y nodos <Matematica tex="t_i=a+ih" />.
          </p>
          <h3>Trapecio compuesto</h3>
          <Matematica bloque tex="T_n=\frac h2\Bigl(r_0+2r_1+\dots+2r_{n-1}+r_n\Bigr),\qquad E\approx-\frac{(b-a)h^2}{12}\,r''(\xi)" />
          <p>
            Sustituye la curva por segmentos (trapecios). Funciona con cualquier{" "}
            <Matematica tex="n\ge1" />; su error es proporcional a{" "}
            <Matematica tex="h^2" />.
          </p>
          <h3>Simpson 1/3 compuesto</h3>
          <Matematica bloque tex="S_n=\frac h3\Bigl(r_0+4r_1+2r_2+4r_3+\dots+4r_{n-1}+r_n\Bigr),\qquad E\approx-\frac{(b-a)h^4}{180}\,r^{(4)}(\xi)" />
          <p>
            Ajusta una parábola por cada tres nodos consecutivos, por lo que{" "}
            <strong>n debe ser par</strong>. Es exacto para polinomios de grado
            ≤ 3 y su error crece con la cuarta derivada: para otras funciones
            converge más rápido que el trapecio (<Matematica tex="h^4" />) pero
            <strong> no es exacto en general</strong>.
          </p>
          <p className="aviso">
            <strong>Dominio y tasa negativa.</strong> El dominio es{" "}
            <Matematica tex="[a,b]" /> con <Matematica tex="a<b" /> y rango de
            valores declarado. Si <Matematica tex="r(t)<0" /> en parte del
            intervalo, la integral es un acumulado neto y deja de representar un
            volumen físico transferido; la calculadora lo advierte.
          </p>
        </section>

        <section id="ejemplos" aria-labelledby="h-ejemplos">
          <h2 id="h-ejemplos">Ejemplos resueltos</h2>
          <h3>Ejemplo 1: trapecio con n = 4</h3>
          <p>
            <Matematica tex="h=0.5" />. Nodos, pesos y sumas parciales
            (calculados por el motor):
          </p>
          <TablaPasos titulo="Trapecio compuesto, n = 4" pasos={trap.pasos} columnas={columnas("h/2")} />
          <p>
            Resultado: <strong>{fmt(trap.resultado?.integral, 10)} MB</strong>; error
            absoluto {fmt(trap.resultado?.errorAbs, 10)} MB (= 1/12).
          </p>
          <h3>Ejemplo 2: Simpson con n = 4</h3>
          <TablaPasos titulo="Simpson 1/3 compuesto, n = 4" pasos={simp.pasos} columnas={columnas("h/3")} />
          <p>
            Resultado: <strong>{fmt(simp.resultado?.integral, 10)} MB</strong>; el error
            ({fmt(simp.resultado?.errorAbs, 3)}) es solo redondeo porque la tasa
            es cuadrática.
          </p>
        </section>

        <section id="trapecio" aria-labelledby="h-trap">
          <h2 id="h-trap">Calculadora: trapecio compuesto</h2>
          <CalcIntegral metodo="trapecio" />
        </section>
        <section id="simpson" aria-labelledby="h-simp">
          <h2 id="h-simp">Calculadora: Simpson 1/3 compuesto</h2>
          <CalcIntegral metodo="simpson" />
        </section>
        <section id="comparacion" aria-labelledby="h-c">
          <h2 id="h-c">Caso aplicado y comparación</h2>
          <p>
            Con <Matematica tex="n=2,4,8" /> el trapecio da errores de 1/3,
            1/12 y 1/48 MB: cada duplicación divide el error entre 4. Simpson
            reproduce 14/3 MB, pero eso se debe a que{" "}
            <Matematica tex="r" /> es un polinomio de grado 2; no debe
            interpretarse como exactitud general.
          </p>
          <Comparacion />
        </section>

        <section id="derivacion" aria-labelledby="h-der">
          <h2 id="h-der">Ficha: derivación numérica central</h2>
          <p>
            La integral acumula la tasa; la derivada mide cómo cambia. Para
            aproximar <Matematica tex="r'(t)" /> con valores equidistantes a
            ambos lados del punto se usa la <strong>diferencia central</strong>:
          </p>
          <Matematica bloque tex="r'(t)\approx\frac{r(t+h)-r(t-h)}{2h},\qquad\text{error}\propto h^2" />
          <p>
            Con <Matematica tex="r(t)=t^2+1" />, <Matematica tex="t=1" /> y{" "}
            <Matematica tex="h=0.1" />:{" "}
            <Matematica tex="\dfrac{r(1.1)-r(0.9)}{0.2}=\dfrac{2.21-1.81}{0.2}=2" />{" "}
            MB/s² (coincide con <Matematica tex="r'(1)=2" /> porque{" "}
            <Matematica tex="r" /> es cuadrática).
          </p>
          <TablaPasos titulo="Diferencia central de r en t = 1" pasos={derivadas} columnas={[
            { clave: "h", titulo: "h (s)", valor: (p) => p.h },
            { clave: "d", titulo: "(r(1+h) − r(1−h)) / 2h (MB/s²)", valor: (p) => p.d },
          ]} />
          <p>
            <strong>Tasa y acumulación.</strong> Como <Matematica tex="V(T)=\int_0^T r" />,
            se cumple <Matematica tex="V'(T)=r(T)" />. Con la misma fórmula:{" "}
            <Matematica tex={`\\dfrac{V(2.1)-V(1.9)}{0.2}\\approx${fmt(dV, 6)}`} />{" "}
            MB/s, cercano a <Matematica tex={`r(2)=${fmt(r(2))}`} /> MB/s: derivar
            el acumulado recupera la tasa.
          </p>
        </section>

        <section id="limites" aria-labelledby="h-l">
          <h2 id="h-l">Restricciones y cuidados</h2>
          <ul>
            <li>
              <strong>n entero positivo.</strong> <Matematica tex="n=0" />,
              negativo o fraccionario se rechazan: no definen una partición.
            </li>
            <li>
              <strong>Simpson exige n par.</strong> Con <Matematica tex="n=3" />{" "}
              se explica la restricción y se sugiere 2 o 4; el trapecio sí
              acepta n impar.
            </li>
            <li>
              <strong>Intervalo válido.</strong> <Matematica tex="a<b" />; valores
              finitos y de magnitud acotada.
            </li>
            <li>
              <strong>Tasa negativa.</strong> Se calcula, pero con aviso: ya no
              es un volumen físico.
            </li>
            <li>
              <strong>Exactitud.</strong> Que Simpson sea exacto en el caso base
              es una propiedad de los polinomios de grado ≤ 3, no de la regla.
            </li>
          </ul>
        </section>

        <section id="ejercicios" aria-labelledby="h-ejer">
          <h2 id="h-ejer">Ejercicios propuestos</h2>
          <p>
            Intenta cada ejercicio antes de abrir su solución. Dos son de nivel
            intermedio y dos avanzados.
          </p>
          <Ejercicios items={EJERCICIOS_M4} />
        </section>

        <section id="autoevaluacion" aria-labelledby="h-auto">
          <h2 id="h-auto">Autoevaluación</h2>
          <p>
            Seis preguntas: opción múltiple, verdadero/falso y numéricas con
            tolerancia. La corrección y su explicación aparecen al pulsar
            «Comprobar».
          </p>
          <Autoevaluacion preguntas={PREGUNTAS_M4} />
        </section>
      </article>
    </ModuloConIndice>
  );
}
