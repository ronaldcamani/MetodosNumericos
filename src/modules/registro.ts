export type EstadoTemaSilabo = 'implementado' | 'en_progreso' | 'planificado';

export interface TemaSilabo {
  numero: string;
  titulo: string;
  estado: EstadoTemaSilabo;
}

export interface InfoSilabo {
  unidad: string;
  unidadCorta: string;
  capitulo: string;
  capituloCorto: string;
  temas: TemaSilabo[];
}

export interface InfoModulo {
  id: string;
  /** Equipo de la guía responsable del tema (no se muestra en el portal). */
  equipo: number;
  /** Etiqueta corta del menú superior. */
  etiqueta: string;
  ruta: string;
  titulo: string;
  descripcion: string;
  metodos: string[];
  disponible: boolean;
  /** Estructura oficial del Sílabo UNSA 2026-B (METODOS NUMERICOS - 1703244). */
  silabo: InfoSilabo;
  /** Páginas del tema: planteo y decisión, una por familia de métodos… */
  subpaginas?: { ruta: string; titulo: string }[];
}

export const ETIQUETA_ESTADO_SILABO: Record<EstadoTemaSilabo, string> = {
  implementado: "Implementado",
  en_progreso: "En progreso",
  planificado: "Planificado",
};

/** El portal mantiene las 6 rutas activas y las organiza según las 5 Unidades, 6 Capítulos y 16 Temas del Sílabo UNSA 2026-B. */
export const MODULOS: InfoModulo[] = [
  {
    id: "errores",
    equipo: 1,
    etiqueta: "Errores",
    ruta: "/errores",
    titulo: "Errores y aritmética de computador",
    descripcion:
      "Mide el error absoluto y relativo y descubre cómo el redondeo, la serie de Taylor, el truncamiento y la cancelación afectan un cálculo.",
    metodos: ["Error absoluto y relativo", "Aritmética de t cifras", "Serie de Taylor"],
    disponible: true,
    silabo: {
      unidad: "Primera Unidad",
      unidadCorta: "Unidad I",
      capitulo: "Capítulo I: Teoría de Errores",
      capituloCorto: "Cap. I · Teoría de Errores",
      temas: [
        { numero: "Tema 01", titulo: "Idea intuitiva de aproximación, exactitud, precisión y redondeo", estado: "implementado" },
        { numero: "Tema 02", titulo: "La serie de Taylor, errores de truncamiento y orden de aproximación", estado: "implementado" },
      ],
    },
  },
  {
    id: "ecuaciones",
    equipo: 1,
    etiqueta: "Ecuaciones",
    ruta: "/ecuaciones",
    titulo: "Ecuaciones no lineales",
    descripcion:
      "Plantea el problema, decide el método y calibra un parámetro resolviendo f(x)=0 con métodos cerrados, abiertos (incluyendo Punto Fijo) y raíces de polinomios.",
    metodos: ["Bisección", "Falsa posición", "Punto fijo", "Newton", "Secante", "Raíces de polinomios"],
    subpaginas: [
      { ruta: "/ecuaciones", titulo: "Planteo y decisión" },
      { ruta: "/ecuaciones/cerrados", titulo: "Métodos cerrados" },
      { ruta: "/ecuaciones/abiertos", titulo: "Métodos abiertos" },
      { ruta: "/ecuaciones/polinomios", titulo: "Raíces de polinomios" },
    ],
    disponible: true,
    silabo: {
      unidad: "Segunda Unidad",
      unidadCorta: "Unidad II",
      capitulo: "Capítulo II: Solución de Ecuaciones No Lineales",
      capituloCorto: "Cap. II · Ecuaciones No Lineales",
      temas: [
        { numero: "Tema 03", titulo: "Métodos gráficos, separación analítica y métodos cerrados (Bisección, Falsa Posición)", estado: "implementado" },
        { numero: "Tema 04", titulo: "Métodos abiertos (Iteración de Punto Fijo, Newton-Raphson, Secante)", estado: "implementado" },
        { numero: "Tema 05", titulo: "Raíces de polinomios (Horner, deflación, Durand-Kerner)", estado: "implementado" },
      ],
    },
  },
  {
    id: "sistemas",
    equipo: 2,
    etiqueta: "Sistemas",
    ruta: "/sistemas",
    titulo: "Sistemas de ecuaciones lineales",
    descripcion:
      "Resuelve sistemas mediante métodos directos (Eliminación de Gauss, Gauss-Jordan, Descomposición LU e inversión/κ∞) e iterativos (Gauss-Seidel).",
    metodos: ["Eliminación de Gauss", "Gauss-Jordan", "Descomposición LU (κ∞)", "Gauss-Seidel"],
    subpaginas: [
      { ruta: "/sistemas", titulo: "Planteo y decisión" },
      { ruta: "/sistemas/directos", titulo: "Métodos directos" },
      { ruta: "/sistemas/iterativos", titulo: "Métodos iterativos" },
    ],
    disponible: true,
    silabo: {
      unidad: "Segunda Unidad",
      unidadCorta: "Unidad II",
      capitulo: "Capítulo III: Solución de Sistemas de Ecuaciones",
      capituloCorto: "Cap. III · Sistemas de Ecuaciones",
      temas: [
        { numero: "Tema 06", titulo: "Métodos directos (Eliminación de Gauss, Gauss-Jordan, LU e inversión/condicionamiento)", estado: "implementado" },
        { numero: "Tema 07", titulo: "Métodos iterativos, matrices especiales y Gauss-Seidel", estado: "implementado" },
      ],
    },
  },
  {
    id: "interpolacion",
    equipo: 3,
    etiqueta: "Interpolación",
    ruta: "/interpolacion",
    titulo: "Interpolación y ajuste de curvas",
    descripcion:
      "Distingue pasar por los datos de aproximar una tendencia y elige entre regresión por mínimos cuadrados e interpolación polinómica.",
    metodos: ["Regresión por mínimos cuadrados", "Interpolación de Lagrange"],
    subpaginas: [
      { ruta: "/interpolacion", titulo: "Planteo y decisión" },
      { ruta: "/interpolacion/lagrange", titulo: "Interpolación de Lagrange" },
      { ruta: "/interpolacion/regresion", titulo: "Ajuste por regresión" },
    ],
    disponible: true,
    silabo: {
      unidad: "Tercera Unidad",
      unidadCorta: "Unidad III",
      capitulo: "Capítulo IV: Ajuste de Curvas e Interpolación",
      capituloCorto: "Cap. IV · Ajuste e Interpolación",
      temas: [
        { numero: "Tema 08", titulo: "Regresión por mínimos cuadrados", estado: "implementado" },
        { numero: "Tema 09", titulo: "Interpolación polinómica (diferencias finitas / divididas)", estado: "en_progreso" },
        { numero: "Tema 10", titulo: "Polinomios de interpolación de Lagrange (Splines planificado)", estado: "implementado" },
        { numero: "Tema 11", titulo: "Aproximación de Fourier", estado: "planificado" },
      ],
    },
  },
  {
    id: "integracion",
    equipo: 4,
    etiqueta: "Integración",
    ruta: "/integracion",
    titulo: "Integración y derivación numérica",
    descripcion:
      "Estima una cantidad acumulada con Trapecio y Simpson, calcula derivadas numéricas y observa el efecto de refinar la partición.",
    metodos: ["Trapecio compuesto", "Simpson compuesto", "Derivación central"],
    subpaginas: [
      { ruta: "/integracion", titulo: "Planteo y decisión" },
      { ruta: "/integracion/trapecio", titulo: "Trapecio compuesto" },
      { ruta: "/integracion/simpson", titulo: "Simpson compuesto" },
      { ruta: "/integracion/derivacion", titulo: "Derivación numérica" },
    ],
    disponible: true,
    silabo: {
      unidad: "Cuarta Unidad",
      unidadCorta: "Unidad IV",
      capitulo: "Capítulo V: Integración y Derivación Numérica",
      capituloCorto: "Cap. V · Integración y Derivación",
      temas: [
        { numero: "Tema 12", titulo: "Reglas de Simpson y Trapezoidal (Romberg planificado)", estado: "implementado" },
        { numero: "Tema 13", titulo: "Derivación numérica y evaluación de derivadas", estado: "implementado" },
      ],
    },
  },
  {
    id: "diferenciales",
    equipo: 5,
    etiqueta: "Diferenciales",
    ruta: "/diferenciales",
    titulo: "Ecuaciones diferenciales",
    descripcion:
      "Simula la evolución temporal de un sistema con Euler y Runge-Kutta 4 (RK4) analizando estabilidad y tamaño de paso.",
    metodos: ["Euler explícito", "Runge-Kutta 4", "Estabilidad"],
    subpaginas: [
      { ruta: "/diferenciales", titulo: "Planteo y decisión" },
      { ruta: "/diferenciales/euler", titulo: "Euler explícito" },
      { ruta: "/diferenciales/rk4", titulo: "Runge-Kutta 4" },
      { ruta: "/diferenciales/estabilidad", titulo: "Estabilidad y tamaño de paso" },
    ],
    disponible: true,
    silabo: {
      unidad: "Quinta Unidad",
      unidadCorta: "Unidad V",
      capitulo: "Capítulo VI: Ecuaciones Diferenciales",
      capituloCorto: "Cap. VI · Ecuaciones Diferenciales",
      temas: [
        { numero: "Tema 14", titulo: "EDO — Método de Euler (Euler Modificado planificado)", estado: "implementado" },
        { numero: "Tema 15", titulo: "Métodos de Runge-Kutta (RK4)", estado: "implementado" },
        { numero: "Tema 16", titulo: "Introducción a solución de EDP", estado: "planificado" },
      ],
    },
  },
];

export const TOTAL_TEMAS_SILABO = MODULOS.reduce((acc, m) => acc + m.silabo.temas.length, 0);

export function obtenerModuloPorId(id: string): InfoModulo | undefined {
  return MODULOS.find((m) => m.id === id);
}
