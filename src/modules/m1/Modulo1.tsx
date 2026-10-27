import { Link } from "react-router-dom";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import Grafico from "../../components/Grafico";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import { ConPanelCalculadora } from "../../components/PanelCalculadora";
import SubNavegacion from "../../components/SubNavegacion";
import { crearModelo } from "../../core/m1";
import Comparacion from "./Comparacion";
import Decisor, { type ProblemaPlanteado } from "../../components/Decisor";
import { INICIAL, PREGUNTAS, recomendarMetodos, type Respuestas } from "./decision";
import { datosProblema } from "./graficos";
import { herramientasRaices, PAGINAS_M1 } from "./paginas";
import { EJERCICIOS_DECISION, PREGUNTAS_DECISION } from "./practicaDecision";

const SECCIONES = [
  ["problema", "El problema"],
  ["decide", "Analiza y decide"],
  ["mapa", "Mapa de métodos"],
  ["comparacion", "Comparación de los métodos"],
  ["errores", "Errores y verificación"],
  ["ejercicios", "Ejercicios: elige tu método"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

const M = Matematica;

const PROBLEMAS: ProblemaPlanteado<Respuestas>[] = [
  {
    id: "calibracion",
    titulo: "Calibrar un parámetro",
    enunciado: (
      <p>
        Una respuesta normalizada se modela con <M tex="g(x)=x^3-x" />. Se busca
        el <M tex="x>0" /> para el que <M tex="g(x)=2" />. Se conoce la fórmula
        de <M tex="g" /> y es fácil de derivar.
      </p>
    ),
    analisis: (
      <>
        <p>
          Se resuelve <M tex="f(x)=x^3-x-2=0" />. Observamos: <M tex="f(1)=-2<0" />{" "}
          y <M tex="f(2)=4>0" /> (hay cambio de signo y f es continua), la
          derivada <M tex="f'(x)=3x^2-1" /> se escribe sin esfuerzo y x₀ = 1.5 es
          un buen punto inicial.
        </p>
        <p>
          Con todo eso cualquiera de los cuatro métodos sirve. Si lo importante
          es la seguridad, bisección; si es la velocidad, Newton desde 1.5.
        </p>
      </>
    ),
    respuestas: { signo: "si", derivada: "si", inicial: "si", polinomio: "no", prioridad: "garantia" },
    valores: { modelo: "calibracion", objetivo: "2" },
  },
  {
    id: "simulacion",
    titulo: "Una simulación costosa",
    enunciado: (
      <p>
        El tiempo de respuesta <M tex="T(c)" /> de un servicio solo se obtiene
        ejecutando una simulación de 2 minutos; no hay fórmula ni derivada. Se
        quiere <M tex="c" /> con <M tex="T(c)=200" /> ms y ya se tienen dos
        simulaciones que dan valores a ambos lados de 200.
      </p>
    ),
    analisis: (
      <>
        <p>
          Hay cambio de signo en <M tex="f(c)=T(c)-200" /> (un valor por debajo
          y otro por encima), pero <strong>no hay derivada</strong> y cada
          evaluación es cara. Newton queda descartado; interesan los métodos que
          reutilizan lo ya simulado y necesitan pocas evaluaciones: falsa
          posición o secante, con una verificación final.
        </p>
        <p>(En la calculadora la función del caso base hace de sustituto de T.)</p>
      </>
    ),
    respuestas: { signo: "si", derivada: "no", inicial: "si", polinomio: "no", prioridad: "velocidad" },
    valores: { modelo: "calibracion", objetivo: "2" },
  },
  {
    id: "polinomio",
    titulo: "Estabilidad de un sistema",
    enunciado: (
      <p>
        El polinomio característico de un sistema de control es{" "}
        <M tex="p(s)=s^4-10s^2+9" />. Para saber si es estable hay que conocer{" "}
        <strong>todas</strong> sus raíces, no solo una.
      </p>
    ),
    analisis: (
      <>
        <p>
          Es un polinomio y se piden todas las raíces (reales o complejas). Un
          método de uno en uno exigiría adivinar intervalos o puntos iniciales;
          la estrategia adecuada es Newton–Horner con deflación, que evalúa p y
          p′ con Horner y reduce el grado tras cada raíz.
        </p>
        <p>
          Aquí <M tex="p(s)=(s^2-1)(s^2-9)" />: raíces ±1 y ±3. Las positivas
          indican un sistema inestable.
        </p>
      </>
    ),
    respuestas: { signo: "si", derivada: "si", inicial: "no", polinomio: "si", prioridad: "garantia" },
    valores: { modelo: "polinomio", coef: "1, 0, -10, 0, 9", a: "0", b: "2", x0: "5", p0: "0", p1: "2" },
  },
];

export default function Modulo1() {
  const base = crearModelo("calibracion", 2);
  const grafico = [
    ...datosProblema(base, 1, 2),
    { x: [1, 2], y: [base.f(1), base.f(2)], type: "scatter" as const, mode: "markers" as const, name: "f(1) = −2, f(2) = 4", marker: { size: 11, symbol: "square" as const } },
  ];
  return (
    <ConPanelCalculadora herramientas={herramientasRaices(["biseccion", "falsa", "newton", "secante"])}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Ecuaciones no lineales</h1>
          <SubNavegacion enlaces={PAGINAS_M1} etiqueta="Páginas de ecuaciones no lineales" />
          <p>
            <strong>Objetivo:</strong> determinar un parámetro de configuración
            a partir de una ecuación no lineal, <em>decidir con qué método
            resolverlo</em> y explicar cuándo converge cada uno.
          </p>

          <section id="problema" aria-labelledby="h-problema">
            <h2 id="h-problema">El problema</h2>
            <p>
              <strong>Caso aplicado (datos sintéticos).</strong> Una respuesta
              normalizada se modela con <M tex="g(x)=x^3-x" />. Se busca el{" "}
              <M tex="x>0" /> que alcanza la respuesta objetivo 2, es decir, la
              raíz de <M tex="f(x)=x^3-x-2" />. Las variables son adimensionales
              y el modelo no representa mediciones reales.
            </p>
            <Grafico titulo="El problema: f(x) = x³ − x − 2" ejeX="x (parámetro normalizado)" ejeY="f(x)" datos={grafico}
              descripcion="La curva cambia de signo entre x = 1 (f = −2) y x = 2 (f = 4): ahí está la raíz. Plantear el problema significa mirar este tipo de pistas antes de elegir un método." />
            <div className="idea">
              <p><strong>Antes de elegir un método, pregúntate:</strong></p>
              <ul>
                <li>¿Conozco un intervalo donde <M tex="f" /> cambie de signo?</li>
                <li>¿Puedo escribir <M tex="f'(x)" /> con facilidad?</li>
                <li>¿Tengo una estimación inicial cercana a la raíz?</li>
                <li>¿<M tex="f" /> es un polinomio y quiero todas sus raíces?</li>
                <li>¿Qué me importa más: garantía de convergencia o velocidad?</li>
              </ul>
              <p>Las respuestas determinan el método. La sección siguiente las convierte en un análisis.</p>
            </div>
          </section>

          <section id="decide" aria-labelledby="h-decide">
            <h2 id="h-decide">Analiza y decide</h2>
            <p>
              Elige uno de los problemas planteados para ver cómo se analiza, o
              describe el tuyo. El portal explica qué métodos convienen y por qué;
              tú decides cuál probar en la calculadora lateral.
            </p>
            <Decisor problemas={PROBLEMAS} preguntas={PREGUNTAS} inicial={INICIAL} recomendar={recomendarMetodos} />
          </section>

          <section id="mapa" aria-labelledby="h-mapa">
            <h2 id="h-mapa">Mapa de métodos</h2>
            <p>Cada familia tiene su página con teoría, ejemplos y ejercicios.</p>
            <div className="tabla-wrap" tabIndex={0}>
              <table className="tabla-metodos">
                <caption>Resumen de los métodos del módulo</caption>
                <thead>
                  <tr><th scope="col">Método</th><th scope="col">Familia</th><th scope="col">Necesita</th><th scope="col">Convergencia</th><th scope="col">Riesgo principal</th></tr>
                </thead>
                <tbody>
                  <tr><th scope="row"><Link to="/ecuaciones/cerrados">Bisección</Link></th><td>Cerrado</td><td>Intervalo con cambio de signo</td><td>Garantizada, lineal (÷2 por paso)</td><td>Lenta; un polo parece raíz</td></tr>
                  <tr><th scope="row"><Link to="/ecuaciones/cerrados">Falsa posición</Link></th><td>Cerrado</td><td>Intervalo con cambio de signo</td><td>Garantizada, suele ser más rápida</td><td>Un extremo se queda fijo y se estanca</td></tr>
                  <tr><th scope="row"><Link to="/ecuaciones/abiertos">Newton</Link></th><td>Abierto</td><td>f′ y un x₀ cercano</td><td>Cuadrática cerca de una raíz simple</td><td>Derivada nula, ciclos, divergencia</td></tr>
                  <tr><th scope="row"><Link to="/ecuaciones/abiertos">Secante</Link></th><td>Abierto</td><td>Dos puntos iniciales</td><td>Superlineal (≈ 1.62)</td><td>Pendiente nula; sin garantía</td></tr>
                  <tr><th scope="row"><Link to="/ecuaciones/polinomios">Newton–Horner</Link></th><td>Polinomios</td><td>Coeficientes</td><td>Todas las raíces, con deflación</td><td>Raíces múltiples; error acumulado</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="comparacion" aria-labelledby="h-cmp">
            <h2 id="h-cmp">Comparación de los métodos</h2>
            <p>
              Ejecuta los cuatro métodos sobre el mismo problema y observa la
              diferencia entre robustez y velocidad. Cambia el objetivo, el
              intervalo o x₀ y mira qué método falla y cuál se mantiene. Si un
              método falla, los demás conservan su resultado.
            </p>
            <Comparacion />
          </section>

          <section id="errores" aria-labelledby="h-err">
            <h2 id="h-err">Errores y verificación</h2>
            <p>
              Si <M tex="r" /> es la raíz y <M tex="\tilde r" /> su aproximación,
              el error absoluto es <M tex="|r-\tilde r|" />. La <strong>tolerancia</strong>{" "}
              es el umbral del criterio de parada y el <strong>residuo</strong>{" "}
              <M tex="|f(\tilde r)|" /> <em>no es</em> el error. Antes de declarar una
              raíz, el portal la <strong>verifica</strong>: debe ser un mínimo local
              de <M tex="|f|" /> y f debe cruzar el cero; si no, informa «no
              converge».
            </p>
            <p className="aviso">
              Los conceptos de error absoluto, relativo, cifras significativas,
              redondeo y truncamiento tienen su propio módulo:{" "}
              <Link to="/errores">Errores y aritmética de computador</Link>.
            </p>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios: elige tu método</h2>
            <p>
              Cada ejercicio parte de un problema: <strong>decide primero cómo
              lo resolverás</strong> y recibe retroalimentación sobre tu plan.
              Después puedes pedir una pista, probarlo en la calculadora y, al
              final, ver la solución.
            </p>
            <Ejercicios items={EJERCICIOS_DECISION} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>
              Cuatro preguntas: opción múltiple, verdadero/falso y numérica con
              tolerancia. Al comprobar verás la explicación, un comentario sobre
              tu elección y, si quieres, un apartado «Profundiza».
            </p>
            <Autoevaluacion preguntas={PREGUNTAS_DECISION} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
