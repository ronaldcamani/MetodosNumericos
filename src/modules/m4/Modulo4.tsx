import { Link } from "react-router-dom";
import PracticaGenerada from "../../components/PracticaGenerada";
import Autoevaluacion from "../../components/Autoevaluacion";
import Decisor, { type ProblemaPlanteado } from "../../components/Decisor";
import Ejercicios from "../../components/Ejercicios";
import Grafico from "../../components/Grafico";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import { ConPanelCalculadora } from "../../components/PanelCalculadora";
import SubNavegacion from "../../components/SubNavegacion";
import Comparacion from "./Comparacion";
import { INICIAL_INTEGRAL, PREGUNTAS_INTEGRAL, recomendarIntegral, type RespuestasIntegral } from "./decision";
import { EJE_R, EJE_T, trazaTasa } from "./graficos";
import { herramientasIntegracion, PAGINAS_INTEGRACION, presetIntegral } from "./paginas";
import { EJERCICIOS_DECISION_INTEGRAL, PREGUNTAS_DECISION_INTEGRAL } from "./practica";

const M = Matematica;
const SECCIONES = [
  ["problema", "El problema"],
  ["decide", "Analiza y decide"],
  ["mapa", "Mapa de métodos"],
  ["comparacion", "Comparación de las reglas"],
  ["limites", "Restricciones y cuidados"],
  ["ejercicios", "Ejercicios: elige tu regla"],
  ["autoevaluacion", "Autoevaluación"],
  ["practica", "Práctica por niveles"],
] as const;

const PROBLEMAS: ProblemaPlanteado<RespuestasIntegral>[] = [
  {
    id: "volumen",
    titulo: "Volumen transferido por un servicio",
    enunciado: (
      <p>
        La tasa de transferencia es <M tex="r(t)=t^2+1" /> MB/s durante <M tex="t\in[0,2]" /> s. Se quiere el volumen total y se puede elegir el número de subintervalos.
      </p>
    ),
    analisis: (
      <p>
        La tasa es suave (de hecho polinómica) y <M tex="n" /> es libre: Simpson da el valor exacto con pocos nodos (14/3 MB) y el trapecio
        converge con error <M tex="\propto h^2" />. Conviene usar Simpson y contrastar con el trapecio.
      </p>
    ),
    respuestas: { n: "par", suave: "si", costo: "barato", precision: "alta" },
  },
  {
    id: "malla",
    titulo: "Una malla de 5 intervalos",
    enunciado: (
      <p>
        Los datos de tasa se registraron en una malla uniforme de 5 subintervalos y no puede repetirse la medición.
      </p>
    ),
    analisis: (
      <p>
        Con n = 5 (impar) Simpson 1/3 no es aplicable. El trapecio acepta cualquier n; si fuera posible volver a medir, se pasaría a n = 4 o 6 para usar Simpson.
      </p>
    ),
    respuestas: { n: "impar", suave: "si", costo: "barato", precision: "moderada" },
    valores: presetIntegral("trapecio", 1, 0, 1, 0, 2, 5).valores,
  },
  {
    id: "picos",
    titulo: "Una tasa con picos y evaluación costosa",
    enunciado: (
      <p>
        La tasa viene de una simulación de 1 minuto por punto, con ráfagas bruscas. Se puede elegir n pero cada nodo cuesta.
      </p>
    ),
    analisis: (
      <p>
        La tasa no es suave: Simpson pierde su ventaja teórica y el trapecio es más predecible. Como cada nodo es caro, se empieza con un n pequeño y se
        duplica comprobando que el error baje (≈ ÷4 en el trapecio).
      </p>
    ),
    respuestas: { n: "par", suave: "no", costo: "caro", precision: "moderada" },
  },
];

export default function Modulo4() {
  return (
    <ConPanelCalculadora herramientas={herramientasIntegracion("trapecio")}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Integración y derivación numérica</h1>
          <SubNavegacion enlaces={PAGINAS_INTEGRACION} etiqueta="Páginas de integración y derivación numérica" />
          <p>
            <strong>Objetivo:</strong> estimar una cantidad acumulada a partir de una tasa, <em>decidir la regla</em> y comparar el efecto de refinar la partición.
          </p>

          <section id="problema" aria-labelledby="h-problema">
            <h2 id="h-problema">El problema</h2>
            <p>
              <strong>Caso aplicado (datos sintéticos).</strong> La tasa de transferencia de un servicio es <M tex="r(t)=t^2+1" /> MB/s durante{" "}
              <M tex="t\in[0,2]" /> s. El volumen transferido es la integral
            </p>
            <M bloque tex="V=\int_0^2 r(t)\,dt\quad[\text{MB}]=\bigl[\tfrac{\text{MB}}{\text{s}}\bigr]\cdot[\text{s}]" />
            <p>
              Su valor exacto es <M tex="\tfrac{14}{3}\approx4.6666666667" /> MB. Los métodos numéricos reemplazan la integral por una suma sobre una malla
              uniforme de <M tex="n" /> subintervalos con paso <M tex="h=(b-a)/n" /> y nodos <M tex="t_i=a+ih" />.
            </p>
            <Grafico titulo="El problema: la tasa de transferencia r(t)" ejeX={EJE_T} ejeY={EJE_R} datos={[trazaTasa({ a: 1, b: 0, c: 1 }, 0, 2)]}
              descripcion="El volumen transferido es el área bajo la curva entre t = 0 y t = 2. Integrar numéricamente es aproximar esa área con figuras sencillas (trapecios o arcos de parábola)." />
            <div className="idea">
              <p><strong>Antes de elegir una regla, pregúntate:</strong></p>
              <ul>
                <li>¿Puedo elegir el número de subintervalos, y es par?</li>
                <li>¿La tasa es suave o tiene saltos y picos?</li>
                <li>¿Cuánto cuesta evaluar <M tex="r(t)" />?</li>
                <li>¿Qué precisión necesito?</li>
              </ul>
            </div>
          </section>

          <section id="decide" aria-labelledby="h-decide">
            <h2 id="h-decide">Analiza y decide</h2>
            <p>
              Elige uno de los problemas planteados para ver cómo se analiza, o describe el tuyo. El portal explica qué regla conviene y por qué; tú decides cuál
              probar en la calculadora lateral.
            </p>
            <Decisor problemas={PROBLEMAS} preguntas={PREGUNTAS_INTEGRAL} inicial={INICIAL_INTEGRAL} recomendar={recomendarIntegral} />
          </section>

          <section id="mapa" aria-labelledby="h-mapa">
            <h2 id="h-mapa">Mapa de métodos</h2>
            <div className="tabla-wrap" tabIndex={0}>
              <table className="tabla-metodos">
                <caption>Resumen de las reglas</caption>
                <thead><tr><th scope="col">Regla</th><th scope="col">Aproxima con</th><th scope="col">Necesita</th><th scope="col">Error</th><th scope="col">Riesgo principal</th></tr></thead>
                <tbody>
                  <tr><th scope="row"><Link to="/integracion/trapecio">Trapecio compuesto</Link></th><td>Segmentos</td><td>Cualquier n ≥ 1</td><td>∝ h² (÷4 al duplicar n)</td><td>Sobrestima en funciones convexas</td></tr>
                  <tr><th scope="row"><Link to="/integracion/simpson">Simpson 1/3 compuesto</Link></th><td>Parábolas</td><td>n par</td><td>∝ h⁴ (÷16 al duplicar n); exacto hasta grado 3</td><td>Pierde ventaja sin suavidad</td></tr>
                  <tr><th scope="row"><Link to="/integracion/derivacion">Diferencia central</Link></th><td>Valores a ambos lados</td><td>h pequeño</td><td>∝ h²; el redondeo domina si h es diminuto</td><td>Cancelación al restar</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="comparacion" aria-labelledby="h-c">
            <h2 id="h-c">Comparación de las reglas</h2>
            <p>
              Con <M tex="n=2,4,8" /> el trapecio da errores de 1/3, 1/12 y 1/48 MB: cada duplicación divide el error entre 4. Simpson reproduce 14/3 MB, pero eso se debe a que{" "}
              <M tex="r" /> es un polinomio de grado 2; no debe interpretarse como exactitud general.
            </p>
            <Comparacion />
          </section>

          <section id="limites" aria-labelledby="h-l">
            <h2 id="h-l">Restricciones y cuidados</h2>
            <ul>
              <li><strong>n entero positivo.</strong> <M tex="n=0" />, negativo o fraccionario se rechazan: no definen una partición.</li>
              <li><strong>Simpson exige n par.</strong> Con <M tex="n=3" /> se explica la restricción y se sugiere 2 o 4; el trapecio sí acepta n impar.</li>
              <li><strong>Intervalo válido.</strong> <M tex="a<b" />; valores finitos y de magnitud acotada.</li>
              <li><strong>Tasa negativa.</strong> Se calcula, pero con aviso: ya no es un volumen físico.</li>
              <li><strong>Exactitud.</strong> Que Simpson sea exacto en el caso base es una propiedad de los polinomios de grado ≤ 3, no de la regla.</li>
              <li><strong>Unidades.</strong> (MB/s)·s = MB. Ver <Link to="/errores">Errores y aritmética de computador</Link> para el error absoluto y relativo.</li>
            </ul>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios: elige tu regla</h2>
            <p>
              Cada ejercicio parte de un problema: <strong>decide primero cómo lo resolverás</strong> y recibe retroalimentación sobre tu plan. Después puedes probarlo en la calculadora y desarrollarlo en el espacio de cada ejercicio; la solución aparece en tarjetas que revelas paso a paso.
            </p>
            <Ejercicios items={EJERCICIOS_DECISION_INTEGRAL} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Cuatro preguntas: opción múltiple, verdadero/falso y numérica con tolerancia. Al comprobar verás la explicación y, si quieres, «Profundiza».</p>
            <Autoevaluacion preguntas={PREGUNTAS_DECISION_INTEGRAL} />
          </section>

          <section id="practica" aria-labelledby="h-practica">
            <h2 id="h-practica">Práctica por niveles</h2>
            <p>
              Elige un nivel, resuelve los problemas por tu cuenta y comprueba tu
              respuesta. Cada vez que pulses «Generar problemas nuevos» aparecen
              otros distintos: practica hasta dominar el tema. Tu avance (puntos,
              estrellas y dominio) se guarda en este navegador.
            </p>
            <PracticaGenerada tema="integracion" />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
