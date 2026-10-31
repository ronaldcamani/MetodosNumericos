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
import { INICIAL_SISTEMA, PREGUNTAS_SISTEMA, recomendarSistema, type RespuestasSistema } from "./decision";
import { herramientasSistemas, PAGINAS_SISTEMAS, presetSistema } from "./paginas";
import { EJERCICIOS_DECISION_SISTEMAS, PREGUNTAS_DECISION_SISTEMAS } from "./practica";

const M = Matematica;
const SECCIONES = [
  ["problema", "El problema"],
  ["decide", "Analiza y decide"],
  ["mapa", "Mapa de métodos"],
  ["comparacion", "Comparación de los métodos"],
  ["residuo", "Residuo y verificación"],
  ["ejercicios", "Ejercicios: elige tu método"],
  ["autoevaluacion", "Autoevaluación"],
  ["practica", "Práctica por niveles"],
] as const;

const PROBLEMAS: ProblemaPlanteado<RespuestasSistema>[] = [
  {
    id: "demanda",
    titulo: "Demanda de tres servicios",
    enunciado: (
      <p>
        Tres mediciones agregadas relacionan la demanda de tres servicios:{" "}
        <M tex="A=\begin{pmatrix}4&1&1\\1&5&1\\1&1&6\end{pmatrix}" />,{" "}
        <M tex="b=(9,14,21)" />. Se quiere <M tex="x" /> con <M tex="Ax=b" />.
      </p>
    ),
    analisis: (
      <p>
        Es un sistema pequeño; cada diagonal domina a su fila (4 &gt; 2, 5 &gt; 2, 6 &gt; 2) y no es singular. Un método directo lo resuelve
        con seguridad y Gauss-Seidel converge: sirven los dos y el contraste es instructivo.
      </p>
    ),
    respuestas: { tamano: "pequeno", dominante: "si", singular: "no", prioridad: "pasos" },
  },
  {
    id: "red",
    titulo: "Una red de 500 servicios",
    enunciado: (
      <p>
        Cada servicio depende sobre todo de sí mismo y solo de unos pocos vecinos: el sistema tiene 500 incógnitas, la diagonal domina
        cada fila y se aceptan aproximaciones con residuo pequeño. <em>(En la calculadora se usa el caso de 3 incógnitas como modelo reducido.)</em>
      </p>
    ),
    analisis: (
      <p>
        Con cientos de incógnitas y dominancia diagonal conviene un método iterativo: cada iteración es barata, converge
        garantizadamente y se controla con el residuo. La eliminación crecería como <M tex="n^3" /> y llenaría la matriz.
      </p>
    ),
    respuestas: { tamano: "grande", dominante: "si", singular: "no", prioridad: "aproximar" },
  },
  {
    id: "repetidas",
    titulo: "Mediciones repetidas",
    enunciado: (
      <p>
        Dos ecuaciones provienen de la misma medición escalada: <M tex="x+2y=3" /> y <M tex="2x+4y=6" />. ¿Hay una solución única?
      </p>
    ),
    analisis: (
      <p>
        La segunda ecuación es el doble de la primera: <M tex="\det A=0" />. No hay solución única. Un método directo lo detecta con
        un pivote nulo; un iterativo no tiene nada que aproximar.
      </p>
    ),
    respuestas: { tamano: "pequeno", dominante: "no", singular: "si", prioridad: "pasos" },
    valores: presetSistema("gauss", [[1, 2], [2, 4]], [3, 6]).valores,
  },
];

// Rectas del sistema 4x + y = 9 y 2x + 5y = 13 (solución exacta (16/9, 17/9))
const xs = [0, 4];
const datosGrafico = [
  { x: xs, y: xs.map((x) => 9 - 4 * x), type: "scatter" as const, mode: "lines" as const, name: "4x + y = 9" },
  { x: xs, y: xs.map((x) => (13 - 2 * x) / 5), type: "scatter" as const, mode: "lines" as const, name: "2x + 5y = 13", line: { dash: "dash" as const } },
  { x: [16 / 9], y: [17 / 9], type: "scatter" as const, mode: "markers" as const, name: "Solución (16/9, 17/9)", marker: { size: 12, symbol: "diamond" as const } },
];

export default function Modulo2() {
  return (
    <ConPanelCalculadora herramientas={herramientasSistemas()}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Sistemas de ecuaciones lineales</h1>
          <SubNavegacion enlaces={PAGINAS_SISTEMAS} etiqueta="Páginas de sistemas de ecuaciones lineales" />
          <p>
            <strong>Objetivo:</strong> resolver sistemas pequeños (de 2 × 2 a 4 × 4),{" "}
            <em>decidir entre un método directo y uno iterativo</em> y verificar el resultado con el residuo.
          </p>

          <section id="problema" aria-labelledby="h-problema">
            <h2 id="h-problema">El problema</h2>
            <p>
              <strong>Caso aplicado (datos sintéticos).</strong> Estimación de la demanda de tres servicios a partir de
              mediciones agregadas. Las incógnitas <M tex="x_1,x_2,x_3" /> son índices normalizados de demanda (sin
              unidades) y cada ecuación es una medición agregada:
            </p>
            <M bloque tex="\begin{pmatrix}4&1&1\\1&5&1\\1&1&6\end{pmatrix}\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}=\begin{pmatrix}9\\14\\21\end{pmatrix}" />
            <Grafico titulo="Geometría de un sistema 2 × 2" ejeX="x" ejeY="y" datos={datosGrafico}
              descripcion="Cada ecuación es una recta y la solución es su punto de corte. Si las rectas fueran paralelas (sistema singular sin solución) o coincidieran (infinitas soluciones) no habría un corte único: esa es la singularidad." />
            <div className="idea">
              <p><strong>Antes de elegir un método, pregúntate:</strong></p>
              <ul>
                <li>¿Qué tan grande es el sistema?</li>
                <li>¿La matriz es diagonalmente dominante por filas?</li>
                <li>¿Podría ser singular o casi singular?</li>
                <li>¿Quiero una solución en pasos fijos o aproximaciones controladas por el residuo?</li>
              </ul>
            </div>
          </section>

          <section id="decide" aria-labelledby="h-decide">
            <h2 id="h-decide">Analiza y decide</h2>
            <p>
              Elige uno de los problemas planteados para ver cómo se analiza, o describe el tuyo. El portal explica qué
              método conviene y por qué; tú decides cuál probar en la calculadora lateral.
            </p>
            <Decisor problemas={PROBLEMAS} preguntas={PREGUNTAS_SISTEMA} inicial={INICIAL_SISTEMA} recomendar={recomendarSistema} />
          </section>

          <section id="mapa" aria-labelledby="h-mapa">
            <h2 id="h-mapa">Mapa de métodos</h2>
            <div className="tabla-wrap" tabIndex={0}>
              <table className="tabla-metodos">
                <caption>Resumen de los métodos</caption>
                <thead><tr><th scope="col">Método</th><th scope="col">Familia</th><th scope="col">Necesita</th><th scope="col">Garantía</th><th scope="col">Riesgo principal</th></tr></thead>
                <tbody>
                  <tr><th scope="row"><Link to="/sistemas/directos">Eliminación con pivoteo parcial</Link></th><td>Directo</td><td>Matriz cuadrada no singular</td><td>Solución en un número fijo de pasos (≈ 2n³/3)</td><td>Pivotes pequeños o nulos; costo en sistemas grandes</td></tr>
                  <tr><th scope="row"><Link to="/sistemas/iterativos">Gauss-Seidel</Link></th><td>Iterativo</td><td>Diagonal no nula; conviene dominancia</td><td>Converge si hay dominancia diagonal estricta</td><td>Diverge sin dominancia; agotar iteraciones no es convergencia</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="comparacion" aria-labelledby="h-c">
            <h2 id="h-c">Comparación de los métodos</h2>
            <p>
              Compara la solución, el residuo y el procedimiento de ambos métodos con el mismo sistema. Si uno falla, se
              muestra su estado sin ocultar la salida del otro.
            </p>
            <Comparacion />
          </section>

          <section id="residuo" aria-labelledby="h-r">
            <h2 id="h-r">Residuo y verificación</h2>
            <p>
              El <strong>residuo</strong> <M tex="\|b-A\tilde x\|_\infty" /> mide cuánto falla la ecuación y se calcula sin conocer la solución;
              el <strong>error</strong> <M tex="\|x-\tilde x\|" /> no se conoce. Un residuo pequeño asegura un error pequeño solo si la matriz
              está bien condicionada. Antes de dar un resultado por bueno, el portal lo verifica y no presenta ninguna solución de un sistema singular.
            </p>
            <p className="aviso">
              La diferencia entre tolerancia, residuo y error se explica en <Link to="/errores">Errores y aritmética de computador</Link>.
            </p>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios: elige tu método</h2>
            <p>
              Cada ejercicio parte de un problema: <strong>decide primero cómo lo resolverás</strong> y recibe retroalimentación sobre tu plan.
              Después puedes probarlo en la calculadora y desarrollarlo en el espacio de cada ejercicio; la solución aparece en tarjetas que revelas paso a paso.
            </p>
            <Ejercicios items={EJERCICIOS_DECISION_SISTEMAS} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Cuatro preguntas: opción múltiple, verdadero/falso y numérica con tolerancia. Al comprobar verás la explicación y, si quieres, «Profundiza».</p>
            <Autoevaluacion preguntas={PREGUNTAS_DECISION_SISTEMAS} />
          </section>

          <section id="practica" aria-labelledby="h-practica">
            <h2 id="h-practica">Práctica por niveles</h2>
            <p>
              Elige un nivel, resuelve los problemas por tu cuenta y comprueba tu
              respuesta. Cada vez que pulses «Generar problemas nuevos» aparecen
              otros distintos: practica hasta dominar el tema. Tu avance (puntos,
              estrellas y dominio) se guarda en este navegador.
            </p>
            <PracticaGenerada tema="sistemas" />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
