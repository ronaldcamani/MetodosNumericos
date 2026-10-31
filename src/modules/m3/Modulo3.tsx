import PracticaGenerada from "../../components/PracticaGenerada";
import Autoevaluacion from "../../components/Autoevaluacion";
import Decisor, { type ProblemaPlanteado } from "../../components/Decisor";
import Ejercicios from "../../components/Ejercicios";
import Grafico from "../../components/Grafico";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import { ConPanelCalculadora } from "../../components/PanelCalculadora";
import SubNavegacion from "../../components/SubNavegacion";
import { Link } from "react-router-dom";
import Comparacion from "./Comparacion";
import { INICIAL_DATOS, PREGUNTAS_DATOS, recomendarDatos, type RespuestasDatos } from "./decision";
import { EJE_X, EJE_Y, trazaDatos } from "./graficos";
import { herramientasInterpolacion, PAGINAS_INTERPOLACION, presetDatos } from "./paginas";
import { EJERCICIOS_DECISION_INTERP, PREGUNTAS_DECISION_INTERP } from "./practica";

const M = Matematica;
const SECCIONES = [
  ["problema", "El problema"],
  ["decide", "Analiza y decide"],
  ["mapa", "Mapa de métodos"],
  ["comparacion", "Comparación de los modelos"],
  ["cuidados", "Cuidados"],
  ["ejercicios", "Ejercicios: elige tu modelo"],
  ["autoevaluacion", "Autoevaluación"],
  ["practica", "Práctica por niveles"],
] as const;

const PROBLEMAS: ProblemaPlanteado<RespuestasDatos>[] = [
  {
    id: "carga",
    titulo: "Carga y latencia de un servicio",
    enunciado: (
      <p>
        La carga normalizada <M tex="x" /> toma los valores 0, 1, 2 y 3 y la latencia <M tex="y" /> mide 1, 2, 2 y 4 ms. Se pregunta
        qué latencia esperar con carga <M tex="x=1.5" />.
      </p>
    ),
    analisis: (
      <p>
        Son cuatro datos sintéticos dentro del intervalo [0, 3]. Si se tratan como exactos, se interpola con Lagrange (1.9375 ms); si
        se interpretan como mediciones con ruido, se ajusta una recta (2.25 ms). Los dos valores no coinciden y esa diferencia es el
        punto del tema: <em>pasar por los datos</em> no es lo mismo que <em>aproximar la tendencia</em>.
      </p>
    ),
    respuestas: { datos: "exactos", pasar: "si", cantidad: "pocos", consulta: "dentro", repetidas: "no" },
  },
  {
    id: "ruido",
    titulo: "Mediciones ruidosas para predecir",
    enunciado: (
      <p>
        Se miden 6 cargas distintas con ruido y se quiere predecir la latencia con una carga mayor que todas las medidas.
      </p>
    ),
    analisis: (
      <p>
        Hay ruido, se busca la tendencia y la consulta cae fuera del intervalo. Interpolar con un polinomio de grado 5 reproduciría el
        ruido y se alejaría rápido al extrapolar; una recta por mínimos cuadrados es la opción razonable, con aviso de extrapolación.
      </p>
    ),
    respuestas: { datos: "ruido", pasar: "no", cantidad: "muchos", consulta: "fuera", repetidas: "no" },
    valores: presetDatos("regresion", [0, 1, 2, 3, 4, 5], [1, 2.5, 2, 4, 3.5, 6], 6).valores,
  },
  {
    id: "tabla",
    titulo: "Una tabla exacta de calibración",
    enunciado: (
      <p>
        Un instrumento calibrado entrega seis valores exactos (sin error) de una respuesta suave y se necesita el valor en un punto
        intermedio entre dos de ellos.
      </p>
    ),
    analisis: (
      <p>
        Datos exactos, consulta dentro del intervalo y necesidad de pasar por los puntos: interpolar es lo natural. Con seis nodos
        equiespaciados hay que vigilar la oscilación (Runge); a menudo basta interpolar con los nodos cercanos.
      </p>
    ),
    respuestas: { datos: "exactos", pasar: "si", cantidad: "muchos", consulta: "dentro", repetidas: "no" },
    valores: presetDatos("lagrange", [0, 1, 2, 3, 4, 5], [1, 2.5, 2, 4, 3.5, 6], 2.5).valores,
  },
];

export default function Modulo3() {
  return (
    <ConPanelCalculadora herramientas={herramientasInterpolacion()}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Interpolación y ajuste de curvas</h1>
          <SubNavegacion enlaces={PAGINAS_INTERPOLACION} etiqueta="Páginas de interpolación y ajuste de curvas" />
          <p>
            <strong>Objetivo:</strong> distinguir <em>pasar por los datos</em> de <em>aproximar una tendencia</em> y{" "}
            <em>decidir</em> entre interpolación y regresión según el propósito.
          </p>

          <section id="problema" aria-labelledby="h-problema">
            <h2 id="h-problema">El problema</h2>
            <p>
              <strong>Caso aplicado (datos sintéticos).</strong> Carga y latencia de un servicio: la carga normalizada <M tex="x" /> (sin unidades) toma
              los valores 0, 1, 2 y 3 y la latencia <M tex="y" /> mide 1, 2, 2 y 4 milisegundos. Se pregunta qué latencia esperar con carga{" "}
              <M tex="x=1.5" />.
            </p>
            <Grafico titulo="El problema: latencia frente a carga" ejeX={EJE_X} ejeY={EJE_Y} datos={[trazaDatos({ x: [0, 1, 2, 3], y: [1, 2, 2, 4] })]}
              descripcion="Cuatro mediciones sintéticas. ¿Qué curva dibujarías para estimar la latencia en x = 1.5: una que pase por los cuatro puntos o una que resuma su tendencia?" />
            <div className="idea">
              <p><strong>Antes de elegir un modelo, pregúntate:</strong></p>
              <ul>
                <li>¿Los datos son exactos o tienen ruido de medición?</li>
                <li>¿Necesito que la curva pase por todos los puntos o busco la tendencia?</li>
                <li>¿Cuántos puntos hay y qué tan grande sería el grado del polinomio?</li>
                <li>¿El valor consultado está dentro del intervalo de los datos?</li>
                <li>¿Hay abscisas repetidas (réplicas)?</li>
              </ul>
            </div>
          </section>

          <section id="decide" aria-labelledby="h-decide">
            <h2 id="h-decide">Analiza y decide</h2>
            <p>
              Elige uno de los problemas planteados para ver cómo se analiza, o describe el tuyo. El portal explica qué modelo
              conviene y por qué; tú decides cuál probar en la calculadora lateral.
            </p>
            <Decisor problemas={PROBLEMAS} preguntas={PREGUNTAS_DATOS} inicial={INICIAL_DATOS} recomendar={recomendarDatos} />
          </section>

          <section id="mapa" aria-labelledby="h-mapa">
            <h2 id="h-mapa">Mapa de métodos</h2>
            <div className="tabla-wrap" tabIndex={0}>
              <table className="tabla-metodos">
                <caption>Resumen de los modelos</caption>
                <thead><tr><th scope="col">Modelo</th><th scope="col">Pasa por los datos</th><th scope="col">Necesita</th><th scope="col">Útil cuando</th><th scope="col">Riesgo principal</th></tr></thead>
                <tbody>
                  <tr><th scope="row"><Link to="/interpolacion/lagrange">Interpolación de Lagrange</Link></th><td>Sí, exactamente</td><td>2 a 6 abscisas distintas</td><td>Datos exactos y valor entre nodos</td><td>Oscila con grado alto; reproduce el ruido; extrapola mal</td></tr>
                  <tr><th scope="row"><Link to="/interpolacion/regresion">Regresión lineal</Link></th><td>No (deja residuos)</td><td>Variación en x</td><td>Datos con ruido y tendencia lineal</td><td>Supone linealidad; extrapolar no tiene respaldo</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="comparacion" aria-labelledby="h-c">
            <h2 id="h-c">Comparación de los modelos</h2>
            <p>
              Con la carga en <M tex="x=1.5" />, Lagrange estima <strong>1.9375 ms</strong> y la recta <strong>2.25 ms</strong>. No coinciden porque
              Lagrange obliga a la curva a pasar por los cuatro puntos (residuo 0), mientras que la recta acepta una suma de cuadrados de 0.70 a
              cambio de una tendencia estable. Si los datos tienen ruido, la interpolación reproduce ese ruido.
            </p>
            <Comparacion />
          </section>

          <section id="cuidados" aria-labelledby="h-l">
            <h2 id="h-l">Cuidados</h2>
            <ul>
              <li><strong>Nodos repetidos.</strong> Lagrange rechaza una abscisa repetida con valores distintos y no elimina ningún nodo en silencio; la regresión sí admite réplicas.</li>
              <li><strong>Sin variación en x.</strong> Si todas las <M tex="x" /> son iguales, <M tex="S_{xx}=0" /> y no hay recta que ajustar.</li>
              <li><strong>Fuera del intervalo.</strong> Es extrapolación; el portal calcula pero avisa.</li>
              <li><strong>Grado alto.</strong> Con 5 o 6 nodos el polinomio puede oscilar.</li>
              <li><strong>Interpolar no elimina el error de medición</strong>: lo traslada a la curva. Ver <Link to="/errores">Errores y aritmética de computador</Link>.</li>
            </ul>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios: elige tu modelo</h2>
            <p>
              Cada ejercicio parte de un problema: <strong>decide primero cómo lo resolverás</strong> y recibe retroalimentación sobre tu plan.
              Después puedes probarlo en la calculadora y desarrollarlo en el espacio de cada ejercicio; la solución aparece en tarjetas que revelas paso a paso.
            </p>
            <Ejercicios items={EJERCICIOS_DECISION_INTERP} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Cuatro preguntas: opción múltiple, verdadero/falso y numérica con tolerancia. Al comprobar verás la explicación y, si quieres, «Profundiza».</p>
            <Autoevaluacion preguntas={PREGUNTAS_DECISION_INTERP} />
          </section>

          <section id="practica" aria-labelledby="h-practica">
            <h2 id="h-practica">Práctica por niveles</h2>
            <p>
              Elige un nivel, resuelve los problemas por tu cuenta y comprueba tu
              respuesta. Cada vez que pulses «Generar problemas nuevos» aparecen
              otros distintos: practica hasta dominar el tema. Tu avance (puntos,
              estrellas y dominio) se guarda en este navegador.
            </p>
            <PracticaGenerada tema="interpolacion" />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
