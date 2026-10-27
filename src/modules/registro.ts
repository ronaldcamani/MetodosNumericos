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
  /** Páginas del tema: planteo y decisión, una por familia de métodos… */
  subpaginas?: { ruta: string; titulo: string }[];
}

/** El portal se presenta por temas, no por módulos numerados. */
export const MODULOS: InfoModulo[] = [
  {
    id: "errores",
    equipo: 1,
    etiqueta: "Errores",
    ruta: "/errores",
    titulo: "Errores y aritmética de computador",
    descripcion:
      "Mide el error absoluto y relativo y descubre cómo el redondeo, el truncamiento y la cancelación afectan un cálculo.",
    metodos: ["Error absoluto y relativo", "Aritmética de t cifras"],
    disponible: true,
  },
  {
    id: "ecuaciones",
    equipo: 1,
    etiqueta: "Ecuaciones",
    ruta: "/ecuaciones",
    titulo: "Ecuaciones no lineales",
    descripcion:
      "Plantea el problema, decide el método y calibra un parámetro resolviendo f(x)=0 con métodos cerrados, abiertos y para polinomios.",
    metodos: ["Bisección", "Falsa posición", "Newton", "Secante", "Raíces de polinomios"],
    subpaginas: [
      { ruta: "/ecuaciones", titulo: "Planteo y decisión" },
      { ruta: "/ecuaciones/cerrados", titulo: "Métodos cerrados" },
      { ruta: "/ecuaciones/abiertos", titulo: "Métodos abiertos" },
      { ruta: "/ecuaciones/polinomios", titulo: "Raíces de polinomios" },
    ],
    disponible: true,
  },
  {
    id: "sistemas",
    equipo: 2,
    etiqueta: "Sistemas",
    ruta: "/sistemas",
    titulo: "Sistemas de ecuaciones lineales",
    descripcion:
      "Resuelve sistemas pequeños y decide entre un método directo y uno iterativo comparando el residuo.",
    metodos: ["Eliminación con pivoteo parcial", "Gauss-Seidel"],
    subpaginas: [
      { ruta: "/sistemas", titulo: "Planteo y decisión" },
      { ruta: "/sistemas/directos", titulo: "Métodos directos" },
      { ruta: "/sistemas/iterativos", titulo: "Métodos iterativos" },
    ],
    disponible: true,
  },
  {
    id: "interpolacion",
    equipo: 3,
    etiqueta: "Interpolación",
    ruta: "/interpolacion",
    titulo: "Interpolación y ajuste de curvas",
    descripcion:
      "Distingue pasar por los datos de aproximar una tendencia y elige entre interpolar y ajustar.",
    metodos: ["Interpolación de Lagrange", "Regresión lineal"],
    subpaginas: [
      { ruta: "/interpolacion", titulo: "Planteo y decisión" },
      { ruta: "/interpolacion/lagrange", titulo: "Interpolación de Lagrange" },
      { ruta: "/interpolacion/regresion", titulo: "Ajuste por regresión" },
    ],
    disponible: true,
  },
  {
    id: "integracion",
    equipo: 4,
    etiqueta: "Integración",
    ruta: "/integracion",
    titulo: "Integración y derivación numérica",
    descripcion:
      "Estima una cantidad acumulada a partir de una tasa y observa el efecto de refinar la partición.",
    metodos: ["Trapecio compuesto", "Simpson compuesto", "Derivación central"],
    subpaginas: [
      { ruta: "/integracion", titulo: "Planteo y decisión" },
      { ruta: "/integracion/trapecio", titulo: "Trapecio compuesto" },
      { ruta: "/integracion/simpson", titulo: "Simpson compuesto" },
      { ruta: "/integracion/derivacion", titulo: "Derivación numérica" },
    ],
    disponible: true,
  },
  {
    id: "diferenciales",
    equipo: 5,
    etiqueta: "Diferenciales",
    ruta: "/diferenciales",
    titulo: "Ecuaciones diferenciales",
    descripcion:
      "Simula la evolución temporal de un sistema y el efecto del tamaño de paso.",
    metodos: ["Euler explícito", "Runge-Kutta 4", "Estabilidad"],
    subpaginas: [
      { ruta: "/diferenciales", titulo: "Planteo y decisión" },
      { ruta: "/diferenciales/euler", titulo: "Euler explícito" },
      { ruta: "/diferenciales/rk4", titulo: "Runge-Kutta 4" },
      { ruta: "/diferenciales/estabilidad", titulo: "Estabilidad y tamaño de paso" },
    ],
    disponible: true,
  },
];
