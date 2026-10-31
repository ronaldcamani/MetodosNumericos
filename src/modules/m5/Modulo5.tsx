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
import { CASO_ENFRIAMIENTO } from "../../core/m5";
import Comparacion from "./Comparacion";
import { INICIAL_EDO, PREGUNTAS_EDO, recomendarEdo, type RespuestasEdo } from "./decision";
import { EJE_T, EJE_TEMP, trazaExacta } from "./graficos";
import { herramientasEdo, PAGINAS_EDO, presetEdo } from "./paginas";
import { EJERCICIOS_DECISION_EDO, PREGUNTAS_DECISION_EDO } from "./practica";

const M = Matematica;
const SECCIONES = [
  ["problema", "El problema"],
  ["glosario", "Glosario rápido"],
  ["decide", "Analiza y decide"],
  ["mapa", "Mapa de métodos"],
  ["comparacion", "Comparación de los métodos"],
  ["cuidados", "Cuidados"],
  ["ejercicios", "Ejercicios: elige tu método"],
  ["autoevaluacion", "Autoevaluación"],
  ["practica", "Práctica por niveles"],
] as const;

const PROBLEMAS: ProblemaPlanteado<RespuestasEdo>[] = [
  {
    id: "servidor",
    titulo: "Enfriamiento de un servidor",
    enunciado: (
      <p>
        Un servidor a 80 °C se enfría en una sala a 20 °C con <M tex="T'=-0.5(T-20)" />. Quieres ver cómo evoluciona en 2 minutos y puedes elegir el paso.
      </p>
    ),
    analisis: (
      <p>
        Precisión moderada, paso libre y una constante pequeña (<M tex="k\cdot h<2" /> para pasos razonables): Euler basta para ver la forma de la curva y es fácil de entender. Si quieres un
        error de 0.01 °C o menos, RK4 es más eficiente.
      </p>
    ),
    respuestas: { precision: "moderada", costo: "barato", paso: "libre", rigidez: "no" },
  },
  {
    id: "paso-grande",
    titulo: "Simulación larga con paso grande",
    enunciado: (
      <p>
        Quieres simular 20 minutos del mismo enfriamiento con un paso de 5 minutos para ir rápido. ¿Funcionará?
      </p>
    ),
    analisis: (
      <p>
        Con <M tex="k=0.5" /> y <M tex="h=5" />, <M tex="k\cdot h=2.5>2" />: Euler es inestable (80, −70, 155…) y la trayectoria no es física. RK4 es estable pero muy inexacto. La solución
        es reducir el paso; aquí la estabilidad manda sobre la elección de método.
      </p>
    ),
    respuestas: { precision: "moderada", costo: "barato", paso: "impuesto", rigidez: "si" },
    valores: presetEdo("euler", { tf: "20", h: "5" }).valores,
  },
  {
    id: "simulacion-cara",
    titulo: "Una derivada muy costosa",
    enunciado: (
      <p>
        Cada evaluación de la derivada exige una simulación de 1 minuto y necesitas un error muy pequeño. Puedes elegir el paso.
      </p>
    ),
    analisis: (
      <p>
        Cuatro evaluaciones por paso parecen caras, pero RK4 alcanza la precisión con pasos grandes: unas decenas de evaluaciones frente a miles con Euler. Cuando evaluar es caro, importa el
        número total de evaluaciones, no el coste por paso.
      </p>
    ),
    respuestas: { precision: "alta", costo: "caro", paso: "libre", rigidez: "no" },
  },
];

const P = CASO_ENFRIAMIENTO;
const ambiente = { x: [0, 12], y: [20, 20], type: "scatter" as const, mode: "lines" as const, name: "Temperatura ambiente (20 °C)", line: { dash: "dash" as const, width: 1.5 } };

export default function Modulo5() {
  return (
    <ConPanelCalculadora herramientas={herramientasEdo("euler")}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Ecuaciones diferenciales</h1>
          <SubNavegacion enlaces={PAGINAS_EDO} etiqueta="Páginas de ecuaciones diferenciales" />
          <p>
            <strong>Objetivo:</strong> simular cómo cambia un sistema con el tiempo, <em>decidir entre Euler y Runge-Kutta 4</em> y entender por qué el tamaño del paso importa tanto como el método.
          </p>
          <div className="idea">
            <p><strong>En una frase.</strong> Una ecuación diferencial dice <em>cuánto cambia</em> algo en cada instante; los métodos numéricos reconstruyen su evolución avanzando en el tiempo paso a paso.</p>
          </div>

          <section id="problema" aria-labelledby="h-problema">
            <h2 id="h-problema">El problema</h2>
            <p>
              <strong>Caso aplicado (datos sintéticos).</strong> Un servidor se calienta por su trabajo y se enfría por contacto con el aire. Si la temperatura ambiente es <M tex="T_a" />, la temperatura del servidor <M tex="T" /> cambia más
              rápido cuanto más lejos está de ella (ley de enfriamiento de Newton):
            </p>
            <M bloque tex="\frac{dT}{dt}=-k\,(T-T_a),\qquad T(0)=T_0" />
            <ul>
              <li><strong>La ecuación</strong> <M tex="T'=-k(T-T_a)" /> dice a qué velocidad cambia <M tex="T" />: si <M tex="T>T_a" /> es negativa (se enfría); a mayor diferencia, mayor velocidad.</li>
              <li><strong>La condición inicial</strong> <M tex="T(0)=80" /> °C: de dónde se parte. Sin ella hay infinitas soluciones.</li>
              <li><strong>La temperatura ambiente</strong> <M tex="T_a=20" /> °C: hacia donde tiende la temperatura.</li>
              <li><strong>La constante de enfriamiento</strong> <M tex="k=0.5" /> 1/min: qué tan rápido se acerca a <M tex="T_a" />. Su inverso <M tex="1/k=2" /> min es la escala de tiempo del fenómeno.</li>
            </ul>
            <p>
              Este problema tiene solución exacta, <M tex="T(t)=20+60\,e^{-0.5t}" />, y por eso lo usamos: podemos comprobar qué tan bien lo hace cada método. En problemas reales, la solución exacta no existe y los métodos numéricos son la única opción.
            </p>
            <Grafico titulo="El problema: enfriamiento del servidor" ejeX={EJE_T} ejeY={EJE_TEMP} datos={[trazaExacta(P, 12), ambiente]}
              descripcion="La temperatura baja rápido al principio (la diferencia con la ambiente es grande) y cada vez más despacio. En 2 minutos pasa de 80 °C a unos 42 °C. Los métodos numéricos intentarán reconstruir esta curva sin conocerla, solo con la ecuación y el punto de partida." />
            <div className="idea">
              <p><strong>Antes de elegir un método, pregúntate:</strong></p>
              <ul>
                <li>¿Qué precisión necesito?</li>
                <li>¿Es costoso evaluar la derivada?</li>
                <li>¿Puedo elegir el paso <M tex="h" />, o me lo imponen grande?</li>
                <li>¿El producto <M tex="k\cdot h" /> es pequeño? (si no, hay riesgo de inestabilidad)</li>
              </ul>
            </div>
          </section>

          <section id="glosario" aria-labelledby="h-glosario">
            <h2 id="h-glosario">Glosario rápido</h2>
            <dl className="glosario">
              <dt>Paso <M tex="h" /></dt><dd>Cuánto avanza el tiempo entre un cálculo y el siguiente (aquí en minutos).</dd>
              <dt>Nodo</dt><dd>Cada instante <M tex="t_i=i\,h" /> en el que se calcula la temperatura. Hay un nodo por paso, más el inicial.</dd>
              <dt>Pendiente</dt><dd>El valor de <M tex="T'" /> en un punto: cuántos grados por minuto cambia la temperatura <em>ahora</em>.</dd>
              <dt>Error local</dt><dd>Lo que se equivoca un solo paso.</dd>
              <dt>Error global</dt><dd>La distancia a la solución exacta después de muchos pasos: los errores locales se acumulan.</dd>
              <dt>Orden de un método</dt><dd>Si al partir <M tex="h" /> por la mitad el error global se divide por <M tex="2^p" />, el método es de orden <M tex="p" /> (Euler: 1, RK4: 4).</dd>
              <dt>Estabilidad</dt><dd>Un método es estable con cierto <M tex="h" /> si los errores no se amplifican de un paso a otro.</dd>
              <dt>Trayectoria físicamente válida</dt><dd>La que se comporta como el fenómeno real (aquí, que baje sin cruzar la temperatura ambiente). Un método puede ser estable y aun así no cumplirlo.</dd>
            </dl>
          </section>

          <section id="decide" aria-labelledby="h-decide">
            <h2 id="h-decide">Analiza y decide</h2>
            <p>
              Elige uno de los problemas planteados para ver cómo se analiza, o describe el tuyo. El portal explica qué método conviene y por qué; tú decides cuál probar en la calculadora lateral.
            </p>
            <Decisor problemas={PROBLEMAS} preguntas={PREGUNTAS_EDO} inicial={INICIAL_EDO} recomendar={recomendarEdo} />
          </section>

          <section id="mapa" aria-labelledby="h-mapa">
            <h2 id="h-mapa">Mapa de métodos</h2>
            <div className="tabla-wrap" tabIndex={0}>
              <table className="tabla-metodos">
                <caption>Resumen de los métodos</caption>
                <thead><tr><th scope="col">Método</th><th scope="col">Idea</th><th scope="col">Evaluaciones por paso</th><th scope="col">Orden (error global)</th><th scope="col">Estable si (k = 0.5)</th></tr></thead>
                <tbody>
                  <tr><th scope="row"><Link to="/diferenciales/euler">Euler explícito</Link></th><td>Avanzar en línea recta con la pendiente del inicio</td><td>1</td><td>1 (∝ h)</td><td>h &lt; 4 min</td></tr>
                  <tr><th scope="row"><Link to="/diferenciales/rk4">Runge-Kutta 4</Link></th><td>Promediar cuatro pendientes dentro del paso</td><td>4</td><td>4 (∝ h⁴)</td><td>h &lt; 5.57 min</td></tr>
                </tbody>
              </table>
            </div>
            <p>Estabilidad y paso se estudian a fondo en <Link to="/diferenciales/estabilidad">Estabilidad y tamaño de paso</Link>.</p>
          </section>

          <section id="comparacion" aria-labelledby="h-c">
            <h2 id="h-c">Comparación de los métodos</h2>
            <p>
              Ejecuta ambos métodos con dos pasos (0.5 y 0.25 min) y compara los errores. Fíjate en tres cosas: cuánto baja el error al partir el paso, cuánto mejor es RK4 con el mismo paso y cuántas evaluaciones de la derivada cuesta cada uno.
            </p>
            <Comparacion />
          </section>

          <section id="cuidados" aria-labelledby="h-cuid">
            <h2 id="h-cuid">Cuidados</h2>
            <ul>
              <li><strong>Paso cero o negativo.</strong> No avanza el tiempo: se rechaza.</li>
              <li><strong>Paso que no divide el intervalo.</strong> El último paso es más corto y se registra.</li>
              <li><strong>Paso demasiado grande.</strong> Euler puede ser inestable y su trayectoria no ser física. <Link to="/diferenciales/estabilidad">Ver el caso h = 5 en 20 min</Link>.</li>
              <li><strong>Estable ≠ preciso ≠ físico.</strong> Son tres preguntas distintas.</li>
              <li><strong>Unidades.</strong> Minutos, °C y 1/min: <M tex="k\cdot h" /> es adimensional. Ver <Link to="/errores">Errores y aritmética de computador</Link>.</li>
            </ul>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios: elige tu método</h2>
            <p>
              Cada ejercicio parte de un problema: <strong>decide primero cómo lo resolverás</strong> y recibe retroalimentación sobre tu plan. Después puedes probarlo en la calculadora y desarrollarlo en el espacio de cada ejercicio; la solución aparece en tarjetas que revelas paso a paso.
            </p>
            <Ejercicios items={EJERCICIOS_DECISION_EDO} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Cuatro preguntas: opción múltiple, verdadero/falso y numérica con tolerancia. Al comprobar verás la explicación y, si quieres, «Profundiza».</p>
            <Autoevaluacion preguntas={PREGUNTAS_DECISION_EDO} />
          </section>

          <section id="practica" aria-labelledby="h-practica">
            <h2 id="h-practica">Práctica por niveles</h2>
            <p>
              Elige un nivel, resuelve los problemas por tu cuenta y comprueba tu
              respuesta. Cada vez que pulses «Generar problemas nuevos» aparecen
              otros distintos: practica hasta dominar el tema. Tu avance (puntos,
              estrellas y dominio) se guarda en este navegador.
            </p>
            <PracticaGenerada tema="diferenciales" />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
