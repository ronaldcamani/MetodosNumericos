import { Link } from "react-router-dom";
import AbrirCalculadora from "../../components/AbrirCalculadora";
import PracticaGenerada from "../../components/PracticaGenerada";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import { ConPanelCalculadora, type Herramienta } from "../../components/PanelCalculadora";
import TablaPasos from "../../components/TablaPasos";
import { epsilonMaquina, erroresAproximacion, operarConPrecision, sumaConPrecision } from "../../core/errores";
import { fmt } from "../../core/formato";
import { CalcAproximacion, CalcOperacion, CalcSerie, CalcSuma } from "./Calculadoras";
import { EJERCICIOS_ERRORES, PREGUNTAS_ERRORES } from "./practica";

const M = Matematica;
const SECCIONES = [
  ["problema", "El problema"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplos resueltos"],
  ["tolerancia", "Tolerancia, residuo y error"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
  ["practica", "Práctica por niveles"],
] as const;

const HERRAMIENTAS: Herramienta[] = [
  { id: "aprox", nombre: "Error de una aproximación", render: (p) => <CalcAproximacion preset={p} /> },
  { id: "operacion", nombre: "Aritmética de t cifras", render: (p) => <CalcOperacion preset={p} /> },
  { id: "suma", nombre: "Orden de la suma", render: (p) => <CalcSuma preset={p} /> },
  { id: "serie", nombre: "Truncamiento de series", render: (p) => <CalcSerie preset={p} /> },
];

export default function ModuloErrores() {
  const pi = erroresAproximacion({ verdadero: Math.PI, aproximado: 22 / 7 }).resultado!;
  const canc = operarConPrecision({ a: 0.12345, op: "−", b: 0.12341, t: 4, modo: "redondeo" }).resultado!;
  const suma = sumaConPrecision({ valores: [1000, 0.4, 0.4], t: 4, modo: "redondeo" }).resultado!;
  const eps = epsilonMaquina();
  return (
    <ConPanelCalculadora herramientas={HERRAMIENTAS}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Fundamentos: Errores y aritmética de computador</h1>
          <p>
            <strong>Objetivo:</strong> distinguir los tipos de error, medirlos
            con el error absoluto y relativo, y reconocer cómo la aritmética de
            precisión finita los produce y los amplifica. Es la ficha común que
            usan todos los módulos (<Link to="/ecuaciones">ecuaciones no lineales</Link>,{" "}
            <Link to="/sistemas">sistemas</Link>, <Link to="/interpolacion">interpolación</Link>,{" "}
            <Link to="/integracion">integración</Link>…).
          </p>
          <p className="aviso">
            Las herramientas están en el panel lateral:{" "}
            <AbrirCalculadora preset={{ herramienta: "aprox" }}>Abrir calculadora</AbrirCalculadora>
          </p>

          <section id="problema" aria-labelledby="h-problema">
            <h2 id="h-problema">El problema</h2>
            <p>Tres situaciones que parecen inocentes y producen resultados engañosos. ¿Qué tipo de error es cada una y cómo se mide?</p>
            <div className="dos-columnas">
              <div className="problema">
                <span className="etiqueta">Situación 1</span>
                <h3>La suma que no cuadra</h3>
                <p>En doble precisión <code>0.1 + 0.2</code> da <code>{String(0.1 + 0.2)}</code>, no 0.3. ¿Es un error del programa?</p>
              </div>
              <div className="problema">
                <span className="etiqueta">Situación 2</span>
                <h3>La resta que lo pierde todo</h3>
                <p>Al restar <M tex="0.12345-0.12341" /> con 4 cifras significativas se obtiene {fmt(canc.calculado, 4)}, pero el valor correcto es 0.00004. ¿Qué pasó?</p>
              </div>
              <div className="problema">
                <span className="etiqueta">Situación 3</span>
                <h3>La serie que se corta</h3>
                <p>Se estima <M tex="e" /> con los primeros 5 términos de su serie y sale 2.7083, no 2.7183. ¿De dónde viene la diferencia?</p>
              </div>
            </div>
            <p>Responderlas exige separar <strong>de dónde viene el error</strong> y <strong>cuánto vale</strong>. Los ejercicios te piden decidir qué tipo de error es y cómo evitarlo.</p>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <h3>Tipos de error según su origen</h3>
            <div className="dos-columnas">
              <div><h3>De entrada (inherente)</h3><p>Los datos ya vienen con incertidumbre (mediciones, constantes aproximadas).</p></div>
              <div><h3>De redondeo</h3><p>Un número no cabe en las cifras disponibles (<M tex="0.1" /> no es exacto en binario).</p></div>
              <div><h3>De truncamiento</h3><p>Se corta un proceso infinito: una serie, una iteración que se detiene, un paso de integración.</p></div>
              <div><h3>De propagación</h3><p>Los errores previos se arrastran y pueden amplificarse en las operaciones siguientes.</p></div>
            </div>
            <h3>Cómo se mide el error</h3>
            <p>Si <M tex="x" /> es el valor verdadero y <M tex="\tilde x" /> su aproximación:</p>
            <M bloque tex="E_{abs}=|x-\tilde x|,\qquad E_{rel}=\frac{|x-\tilde x|}{|x|}\ (x\ne0),\qquad E_{\%}=100\,E_{rel}" />
            <p>
              El error absoluto tiene las unidades de <M tex="x" />; el relativo
              no tiene unidades y compara el error con el tamaño de la cantidad.
              Si <M tex="x=0" /> el relativo no está definido.
            </p>
            <h3>Cifras significativas correctas</h3>
            <p>
              <M tex="\tilde x" /> tiene <M tex="n" /> cifras significativas
              correctas si <M tex="E_{abs}<0.5\cdot10^{\,m-n+1}" />, donde{" "}
              <M tex="m" /> es el exponente de la primera cifra significativa de{" "}
              <M tex="x" />.
            </p>
            <h3>Aritmética de t cifras: redondeo y truncamiento</h3>
            <p>
              Con <M tex="t" /> cifras significativas, un número se <strong>trunca</strong>{" "}
              descartando las cifras sobrantes o se <strong>redondea</strong> mirando la
              primera descartada (aquí, mitad hacia arriba). El error relativo del
              redondeo está acotado por <M tex="0.5\cdot10^{1-t}" /> y el del truncamiento por <M tex="10^{1-t}" />.
              En doble precisión el épsilon de máquina es <M tex="\varepsilon\approx2.22\times10^{-16}" /> (calculado aquí: {String(eps)}).
            </p>
            <div className="cuidado">
              <p><strong>Dos trampas clásicas.</strong></p>
              <ul>
                <li><strong>Cancelación catastrófica:</strong> restar números casi iguales elimina las cifras en común y deja solo las inexactas.</li>
                <li><strong>Orden de las operaciones:</strong> con precisión finita la suma no es asociativa; sumar de menor a mayor reduce la pérdida.</li>
              </ul>
            </div>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplos resueltos</h2>
            <h3>Ejemplo 1: π ≈ 22/7</h3>
            <TablaPasos titulo="Errores de 22/7 como aproximación de π" pasos={[
              { m: "Error absoluto", v: pi.absoluto }, { m: "Error relativo", v: pi.relativo }, { m: "Error porcentual (%)", v: pi.porcentual }, { m: "Cifras significativas correctas", v: pi.cifras },
            ]} columnas={[{ clave: "m", titulo: "medida", valor: (p) => p.m }, { clave: "v", titulo: "valor", valor: (p) => p.v }]} />
            <p>
              Las dos primeras cifras decimales coinciden (3.14): 22/7 es una
              aproximación con 3 cifras correctas.{" "}
              <AbrirCalculadora preset={{ herramienta: "aprox", valores: { verdadero: "3.14159265358979", aproximado: "3.14285714285714" } }}>Reproducir en la calculadora</AbrirCalculadora>
            </p>
            <h3>Ejemplo 2: cancelación en 0.12345 − 0.12341 (4 cifras, redondeo)</h3>
            <p>
              Los operandos se redondean a <M tex={`${canc.aRed}`} /> y <M tex={`${canc.bRed}`} />;
              su diferencia es <M tex={`${fmt(canc.calculado, 4)}`} /> mientras que el
              valor correcto es <M tex="0.00004" />: el error relativo es{" "}
              {fmt(canc.relativo, 3)} ({fmt((canc.relativo ?? 0) * 100, 3)} %). No quedó ninguna cifra correcta.{" "}
              <AbrirCalculadora preset={{ herramienta: "operacion", valores: { a: "0.12345", op: "−", b: "0.12341", t: "4", modo: "redondeo" } }}>Reproducir</AbrirCalculadora>
            </p>
            <h3>Ejemplo 3: 1000 + 0.4 + 0.4 con 4 cifras</h3>
            <p>
              En el orden dado, 1000 + 0.4 = 1000.4 → 1000 (se pierde el 0.4) y otra
              vez: resultado <strong>{suma.resultadoOrden}</strong>. Sumando primero
              los pequeños: 0.4 + 0.4 = 0.8 y 0.8 + 1000 → <strong>{suma.resultadoCreciente}</strong>. El
              valor exacto es {fmt(suma.exacta, 4)}: el segundo orden comete un error de{" "}
              {fmt(suma.errorCreciente, 3)} y el primero de {fmt(suma.errorOrden, 3)}.{" "}
              <AbrirCalculadora preset={{ herramienta: "suma", valores: { lista: "1000, 0.4, 0.4", t: "4", modo: "redondeo" } }}>Reproducir</AbrirCalculadora>
            </p>
            <h3>Ejemplo 4: truncamiento de la serie de eˣ</h3>
            <p>
              Con 5 términos y <M tex="x=1" />, <M tex="S_5=2.7083" /> y el error de truncamiento es 0.00995, menor que la cota de Lagrange{" "}
              <M tex="e/5!\approx0.0227" />. Al añadir términos el error baja muy rápido: de 5 a 6 términos se divide por más de 6.{" "}
              <AbrirCalculadora preset={{ herramienta: "serie", valores: { x: "1", terminos: "8" } }}>Ver la serie</AbrirCalculadora>
            </p>
          </section>

          <section id="tolerancia" aria-labelledby="h-tol">
            <h2 id="h-tol">Tolerancia, residuo y error</h2>
            <p>Estos tres conceptos se confunden con facilidad en los métodos iterativos:</p>
            <ul>
              <li><strong>Tolerancia:</strong> el umbral que fija el usuario para el criterio de parada.</li>
              <li><strong>Error:</strong> la distancia real a la solución, normalmente desconocida (se acota o se estima).</li>
              <li><strong>Residuo:</strong> cuánto falla la ecuación en el valor actual, p. ej. <M tex="|f(\tilde r)|" /> o <M tex="\|b-A\tilde x\|" />. Puede ser pequeño con un error grande.</li>
            </ul>
            <p>
              Por eso el portal distingue «cota del error», «cambio entre iteraciones» y «residuo», y verifica las raíces antes de declararlas.
              Aplicación directa en <Link to="/ecuaciones">Ecuaciones no lineales</Link>.
            </p>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio por tu cuenta antes de revelar los pasos de la solución (se muestran uno a uno). En los que tienen «Tu plan», decide primero cómo lo harías.</p>
            <Ejercicios items={EJERCICIOS_ERRORES} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Seis preguntas con explicación; abre «Profundiza» para el porqué detrás de cada respuesta.</p>
            <Autoevaluacion preguntas={PREGUNTAS_ERRORES} />
          </section>

          <section id="practica" aria-labelledby="h-practica">
            <h2 id="h-practica">Práctica por niveles</h2>
            <p>
              Elige un nivel, resuelve los problemas por tu cuenta y comprueba tu
              respuesta. Cada vez que pulses «Generar problemas nuevos» aparecen
              otros distintos: practica hasta dominar el tema. Tu avance (puntos,
              estrellas y dominio) se guarda en este navegador.
            </p>
            <PracticaGenerada tema="errores" />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
