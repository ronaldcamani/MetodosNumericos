export const LIMITES_M3 = { minNodos: 2, maxNodos: 6, maxAbs: 1e6 } as const

export interface Datos {
  x: number[]
  y: number[]
}

/** Dos abscisas se consideran iguales si difieren en menos de 1e-12 en escala relativa. */
const EPS_ABSCISA = 1e-12
const iguales = (a: number, b: number) => Math.abs(a - b) <= EPS_ABSCISA * Math.max(1, Math.abs(a), Math.abs(b))

/** Devuelve el mensaje de error o null si los datos son válidos (tamaño, finitud y rango declarado). */
export function validarDatos({ x, y }: Datos): string | null {
  if (x.length !== y.length) return 'Debe haber tantos valores de y como de x.'
  if (x.length < LIMITES_M3.minNodos || x.length > LIMITES_M3.maxNodos) return `Se requieren entre ${LIMITES_M3.minNodos} y ${LIMITES_M3.maxNodos} puntos.`
  const valores = [...x, ...y]
  if (!valores.every(Number.isFinite)) return 'Todos los valores deben ser números finitos.'
  if (valores.some((v) => Math.abs(v) > LIMITES_M3.maxAbs)) return `Los valores deben estar en [−${LIMITES_M3.maxAbs}, ${LIMITES_M3.maxAbs}].`
  return null
}

/** Primera abscisa que aparece más de una vez, o null si todas son distintas. */
export function abscisaRepetida(x: number[]): number | null {
  for (let i = 0; i < x.length; i++) for (let j = i + 1; j < x.length; j++) if (iguales(x[i], x[j])) return x[i]
  return null
}

/** True si todas las abscisas coinciden (no hay variación en x). */
export function sinVariacionEnX(x: number[]): boolean {
  return x.every((v) => iguales(v, x[0]))
}

export function intervaloDe(x: number[]): [number, number] {
  return [Math.min(...x), Math.max(...x)]
}

export function fueraDeIntervalo(x: number[], consulta: number): boolean {
  const [a, b] = intervaloDe(x)
  return consulta < a || consulta > b
}

export const avisoExtrapolacion = (consulta: number, x: number[]) => {
  const [a, b] = intervaloDe(x)
  return `x = ${consulta} está fuera del intervalo de los datos [${a}, ${b}]: es una extrapolación y su valor no está respaldado por los datos.`
}
