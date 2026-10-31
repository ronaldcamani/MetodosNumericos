import { Link } from "react-router-dom";
import AbrirCalculadora from "../../components/AbrirCalculadora";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import { ConPanelCalculadora } from "../../components/PanelCalculadora";
import SubNavegacion from "../../components/SubNavegacion";
import { fmt } from "../../core/formato";
import { eliminacionGauss } from "../../core/m2";
import { EJERCICIOS_DIRECTOS, PREGUNTAS_DIRECTOS } from "./practica";
import { herramientasSistemas, PAGINAS_SISTEMAS, presetSistema } from "./paginas";
import { MatrizTabla } from "./sistema";

const M = Matematica;
const A = [[4, 1, 1], [1, 5, 1], [1, 1, 6]];
const b = [9, 14, 21];
const SECCIONES = [
  ["idea", "La idea: triangular"],
  ["teoria", "Teoría"],
  ["ejemplos", "Ejemplo resuelto"],
  ["pivotes", "Pivotes y singularidad"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function MetodosDirectos() {
  const g = eliminacionGauss({ A, b });
  return (
    <ConPanelCalculadora herramientas={herramientasSistemas()}>
      <ModuloConIndice secciones={SECCIONES}>
        <article className="modulo">
          <h1>Sistemas de ecuaciones lineales · Métodos directos</h1>
          <SubNavegacion enlaces={PAGINAS_SISTEMAS} etiqueta="Páginas de sistemas de ecuaciones lineales" />
          <p>
            <strong>Objetivo:</strong> resolver <M tex="Ax=b" /> por eliminación con pivoteo parcial, entender por qué se pivota y reconocer un sistema singular.
          </p>
          <p className="aviso">
            ¿Dudas sobre qué método usar? Revisa <Link to="/sistemas">Planteo y decisión</Link>. La calculadora está en el panel lateral:{" "}
            <AbrirCalculadora preset={{ herramienta: "gauss" }}>Abrir calculadora</AbrirCalculadora>
          </p>

          <section id="idea" aria-labelledby="h-idea">
            <h2 id="h-idea">La idea: triangular</h2>
            <p>
              Un método directo transforma el sistema en otro equivalente <strong>triangular superior</strong>, que se resuelve de abajo hacia
              arriba por sustitución. Con aritmética exacta la solución sale en un número finito de pasos; con precisión finita, la calidad
              depende de elegir bien los pivotes.
            </p>
          </section>

          <section id="teoria" aria-labelledby="h-teoria">
            <h2 id="h-teoria">Teoría</h2>
            <p>
              <strong>Caso aplicado.</strong> <M tex="A=\begin{pmatrix}4&1&1\\1&5&1\\1&1&6\end{pmatrix}" />, <M tex="b=(9,14,21)" /> (índices
              normalizados de demanda, datos sintéticos).
            </p>
            <h3>Eliminación gaussiana con pivoteo parcial</h3>
            <ol className="algoritmo">
              <li>En la columna <M tex="k" /> elegir como pivote la fila con mayor <M tex="|a_{ik}|" /> entre las restantes e intercambiarla a la posición <M tex="k" />.</li>
              <li>Anular las entradas inferiores con los multiplicadores <M tex="m_{ik}=a_{ik}/a_{kk}" />.</li>
              <li>Repetir para <M tex="k=1,\dots,n-1" /> hasta obtener una matriz triangular superior.</li>
              <li>Resolver por sustitución hacia atrás.</li>
              <li>Verificar con el residuo <M tex="\|b-Ax\|_\infty" />.</li>
            </ol>
            <M bloque tex="x_i=\frac{1}{a_{ii}}\Bigl(b_i-\sum_{j>i}a_{ij}x_j\Bigr)" />
            <div className="dos-columnas">
              <div>
                <h3>Cuándo usarlo</h3>
                <ul>
                  <li>Sistemas pequeños o medianos y densos.</li>
                  <li>No se sabe si la matriz es dominante.</li>
                  <li>Hay duda sobre singularidad: lo detecta.</li>
                </ul>
              </div>
              <div>
                <h3>Cuándo no</h3>
                <ul>
                  <li>Sistemas enormes y dispersos: el costo <M tex="\sim\tfrac23n^3" /> y el relleno pesan.</li>
                  <li>Cuando basta una aproximación y la convergencia está garantizada.</li>
                </ul>
              </div>
            </div>
            <p className="cuidado">
              <strong>Limitaciones.</strong> Un pivote pequeño amplifica los errores de redondeo y un pivote nulo indica un sistema singular. Aquí un pivote se declara nulo si{" "}
              <M tex="|p|\le10^{-12}\cdot\max|a_{ij}|" /> y se advierte si <M tex="|p|<10^{-6}\cdot\max|a_{ij}|" />.
            </p>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplo resuelto</h2>
            <p>
              Matriz aumentada inicial y matriz triangular final (calculadas por el motor). La solución es <M tex="(1,2,3)" />; al sustituir:{" "}
              <M tex="4+2+3=9" />, <M tex="1+10+3=14" />, <M tex="1+2+18=21" />.
            </p>
            <MatrizTabla titulo="Matriz aumentada inicial" M={A.map((f, i) => [...f, b[i]])} />
            {g.pasos.length > 0 && <MatrizTabla titulo="Matriz triangular superior tras la eliminación" M={g.pasos[g.pasos.length - 1].matriz} />}
            <p>
              Solución: {g.resultado?.x.map((v, i) => `x${i + 1} = ${fmt(v, 10)}`).join(", ")}.{" "}
              <AbrirCalculadora preset={{ herramienta: "gauss" }}>Reproducir en la calculadora</AbrirCalculadora>
            </p>
          </section>

          <section id="pivotes" aria-labelledby="h-l">
            <h2 id="h-l">Pivotes y singularidad</h2>
            <p>
              Un sistema es singular cuando <M tex="\det A=0" />: no hay solución única (o no hay solución, o hay infinitas). Ejemplo: filas{" "}
              <M tex="(1,2)" /> y <M tex="(2,4)" /> con <M tex="b=(3,6)" /> son proporcionales. El programa lo detecta con el criterio de pivote y{" "}
              <strong>no muestra ninguna solución</strong>.{" "}
              <AbrirCalculadora preset={presetSistema("gauss", [[1, 2], [2, 4]], [3, 6])}>Probar fallo: sistema singular</AbrirCalculadora>
            </p>
            <p>
              Un pivote pequeño <em>no</em> es un error, pero sí una advertencia:{" "}
              <AbrirCalculadora preset={presetSistema("gauss", [[1, 1], [1, 1 + 1e-9]], [2, 2])}>probar un pivote pequeño</AbrirCalculadora>.
            </p>
          </section>

          <section id="ejercicios" aria-labelledby="h-ejer">
            <h2 id="h-ejer">Ejercicios propuestos</h2>
            <p>Intenta cada ejercicio por tu cuenta antes de revelar los pasos de la solución (se muestran uno a uno). Uno es intermedio y otro avanzado; en los que tienen «Tu plan», decide primero.</p>
            <Ejercicios items={EJERCICIOS_DIRECTOS} />
          </section>

          <section id="autoevaluacion" aria-labelledby="h-auto">
            <h2 id="h-auto">Autoevaluación</h2>
            <p>Tres preguntas con explicación; abre «Profundiza» para el porqué.</p>
            <Autoevaluacion preguntas={PREGUNTAS_DIRECTOS} />
          </section>
        </article>
      </ModuloConIndice>
    </ConPanelCalculadora>
  );
}
