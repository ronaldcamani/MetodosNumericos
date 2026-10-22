export interface InfoModulo {
  id: string;
  equipo: number;
  ruta: string;
  titulo: string;
  descripcion: string;
  metodos: [string, string];
  disponible: boolean;
}

export const MODULOS: InfoModulo[] = [
  {
    id: "m1",
    equipo: 1,
    ruta: "/m1",
    titulo: "Ecuaciones no lineales y errores",
    descripcion:
      "Calibra un parámetro resolviendo f(x)=0 y compara cuándo converge cada método.",
    metodos: ["Bisección", "Newton"],
    disponible: true,
  },
  {
    id: "m2",
    equipo: 2,
    ruta: "/m2",
    titulo: "Sistemas de ecuaciones lineales",
    descripcion:
      "Resuelve sistemas pequeños y compara un método directo con uno iterativo mediante el residuo.",
    metodos: ["Eliminación con pivoteo parcial", "Gauss-Seidel"],
    disponible: true,
  },
  {
    id: "m3",
    equipo: 3,
    ruta: "/m3",
    titulo: "Interpolación y ajuste de curvas",
    descripcion: "Distingue pasar por los datos de aproximar una tendencia.",
    metodos: ["Interpolación de Lagrange", "Regresión lineal"],
    disponible: true,
  },
  {
    id: "m4",
    equipo: 4,
    ruta: "/m4",
    titulo: "Integración numérica",
    descripcion:
      "Estima una cantidad acumulada y observa el efecto de refinar la partición.",
    metodos: ["Trapecio compuesto", "Simpson compuesto"],
    disponible: true,
  },
  {
    id: "m5",
    equipo: 5,
    ruta: "/m5",
    titulo: "Ecuaciones diferenciales",
    descripcion:
      "Simula la evolución temporal de un sistema y el efecto del tamaño de paso.",
    metodos: ["Euler explícito", "Runge-Kutta 4"],
    disponible: false,
  },
];
