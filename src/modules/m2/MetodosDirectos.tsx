import { Link } from "react-router-dom";
import AbrirCalculadora from "../../components/AbrirCalculadora";
import Autoevaluacion from "../../components/Autoevaluacion";
import Ejercicios from "../../components/Ejercicios";
import ModuloConIndice from "../../components/IndiceLateral";
import Matematica from "../../components/Matematica";
import { ConPanelCalculadora } from "../../components/PanelCalculadora";
import SubNavegacion from "../../components/SubNavegacion";
import { fmt } from "../../core/formato";
import { descomposicionLU, eliminacionGauss, eliminacionGaussJordan, matrizHilbert, numeroCondicionInf } from "../../core/m2";
import { EJERCICIOS_DIRECTOS, PREGUNTAS_DIRECTOS } from "./practica";
import { herramientasSistemas, PAGINAS_SISTEMAS, presetSistema } from "./paginas";
import { MatrizTabla } from "./sistema";

const M = Matematica;
const A = [[4, 1, 1], [1, 5, 1], [1, 1, 6]];
const b = [9, 14, 21];
const H4 = matrizHilbert(4);
const SECCIONES = [
  ["idea", "La idea: triangular y factorizar"],
  ["teoria", "Teoría (Gauss, Gauss-Jordan, LU y κ∞)"],
  ["ejemplos", "Ejemplos resueltos"],
  ["pivotes", "Pivotes, singularidad y condicionamiento"],
  ["ejercicios", "Ejercicios propuestos"],
  ["autoevaluacion", "Autoevaluación"],
] as const;

export default function MetodosDirectos() {
  const g = eliminacionGauss({ A, b });
  const gj = eliminacionGaussJordan({ A, b });
  const lu = descomposicionLU({ A, b });
  const condBase = numeroCondicionInf(A);
  const condH4 = numeroCondicionInf(H4);
  return (
    <ConPanelCalculadora herramientas={herramientasSistemas()}>
      <ModuloConIndice secciones={SECCIONES} moduloId="sistemas">
        <article className="modulo">
          <p className="silabo-etiqueta">Unidad II · Cap. III · Tema 06: Métodos Directos (Gauss, Gauss-Jordan, LU, Inversión y κ∞)</p>
          <h1>Sistemas de ecuaciones lineales · Métodos directos</h1>
          <SubNavegacion enlaces={PAGINAS_SISTEMAS} etiqueta="Páginas de sistemas de ecuaciones lineales" />
          <p>
            <strong>Objetivo:</strong> resolver <M tex="Ax=b" /> por Eliminación de Gauss, Gauss-Jordan (<M tex="[I\mid x]" />) y Descomposición LU (<M tex="PA=LU" />), y diagnosticar la estabilidad mediante el número de condición <M tex="\kappa_\infty(A)" />.
          </p>
          <p className="aviso">
            ¿Dudas sobre qué método usar? Revisa <Link to="/sistemas">Planteo y decisión</Link>. En la calculadora lateral puedes alternar entre Gauss, Gauss-Jordan y LU:{" "}
            <AbrirCalculadora preset={{ herramienta: "gauss", valores: { metodoDirecto: "gauss" } }}>Abrir Gauss</AbrirCalculadora>{" "}
            · <AbrirCalculadora preset={{ herramienta: "gauss", valores: { metodoDirecto: "gauss_jordan" } }}>Abrir Gauss-Jordan</AbrirCalculadora>{" "}
            · <AbrirCalculadora preset={{ herramienta: "gauss", valores: { metodoDirecto: "lu" } }}>Abrir Descomposición LU</AbrirCalculadora>
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
            <h3>Eliminación de Gauss-Jordan e Inversión</h3>
            <p>
              Normaliza cada fila pivote dividiéndola entre <M tex="a_{kk}" /> y elimina tanto por debajo como por encima de la diagonal hasta obtener{" "}
              <M tex="[I\mid x]" />. Aplicado sobre <M tex="[A\mid I]" /> calcula simultáneamente <M tex="A^{-1}" />.
            </p>
            <h3>Descomposición LU (Doolittle con pivoteo parcial)</h3>
            <p>
              Factoriza <M tex="PA = LU" /> donde <M tex="L" /> es triangular inferior con diagonal unitaria y <M tex="U" /> es triangular superior. Luego resuelve cualquier vector{" "}
              <M tex="b" /> en dos barridos rápidos (<M tex="\mathcal{O}(n^2)" />): primero <M tex="Ly = Pb" /> y después <M tex="Ux = y" />.
            </p>
            <M bloque tex="PA = LU \;\Longrightarrow\; Ly = Pb \;\text{ (hacia adelante)},\quad Ux = y \;\text{ (hacia atrás)}" />
            <h3>Número de condición <M tex="\kappa_\infty(A)" /></h3>
            <M bloque tex="\kappa_\infty(A) = \|A\|_\infty\,\|A^{-1}\|_\infty, \qquad \|A\|_\infty = \max_i \sum_{j=1}^n |a_{ij}|" />
            <p>
              Mide la amplificación máxima de errores relativos. Si <M tex="\kappa_\infty(A) \approx 1" /> el sistema está bien condicionado; si{" "}
              <M tex="\kappa_\infty(A) > 10^4" /> (como en las matrices de Hilbert), pequeños errores de redondeo contaminan fuertemente la solución.
            </p>
          </section>

          <section id="ejemplos" aria-labelledby="h-ejemplos">
            <h2 id="h-ejemplos">Ejemplos resueltos</h2>
            <p>
              Matriz aumentada inicial y matriz triangular final (calculadas por el motor). La solución es <M tex="(1,2,3)" />; al sustituir:{" "}
              <M tex="4+2+3=9" />, <M tex="1+10+3=14" />, <M tex="1+2+18=21" />.
            </p>
            <MatrizTabla titulo="Matriz aumentada inicial" M={A.map((f, i) => [...f, b[i]])} />
            {g.pasos.length > 0 && <MatrizTabla titulo="Gauss: matriz triangular superior tras la eliminación" M={g.pasos[g.pasos.length - 1].matriz} />}
            {gj.pasos.length > 0 && <MatrizTabla titulo="Gauss-Jordan: forma escalonada reducida [I | x]" M={gj.pasos[gj.pasos.length - 1].matriz} />}
            {lu.resultado && (
              <div className="dos-columnas">
                <div>
                  <h3>Factorización LU (Doolittle)</h3>
                  <p>
                    Error de factorización <M tex="\|PA - LU\|_\infty" /> = {fmt(lu.resultado.errorFactorizacionInf, 12)}. Vector intermedio{" "}
                    <M tex={`y = (${lu.resultado.y.map((v) => fmt(v, 4)).join(', ')})`} />.
                  </p>
                  <MatrizTabla titulo="Factor L | columna y" M={lu.resultado.L.map((f, i) => [...f, lu.resultado!.y[i]])} />
                </div>
                <div>
                  <h3>Factor U y verificación κ∞(A)</h3>
                  <p>
                    Para el caso base, <M tex={String.raw`\kappa_\infty(A) \approx ${fmt(condBase?.kappaInf ?? 0, 4)}`} /> (bien condicionado).
                    En contraste, la matriz de Hilbert 4×4 alcanza <M tex={String.raw`\kappa_\infty(H_4) \approx ${fmt(condH4?.kappaInf ?? 0, 2)}`} /> (&gt; 10⁴).
                  </p>
                  <MatrizTabla titulo="Factor U | solución x" M={lu.resultado.U.map((f, i) => [...f, lu.resultado!.x[i]])} />
                </div>
              </div>
            )}
            <p>
              Solución: {g.resultado?.x.map((v, i) => `x${i + 1} = ${fmt(v, 10)}`).join(", ")}.{" "}
              <AbrirCalculadora preset={{ herramienta: "gauss", valores: { metodoDirecto: "lu" } }}>Reproducir LU en la calculadora</AbrirCalculadora>{" "}
              · <AbrirCalculadora preset={{ herramienta: "gauss", valores: { ...presetSistema("gauss", H4, [1, 0, 0, 0]).valores, metodoDirecto: "lu" } }}>Probar Hilbert 4×4 (κ∞ &gt; 10⁴)</AbrirCalculadora>
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
