/** Modelos predefinidos: la guía evita evaluar expresiones arbitrarias escritas por el usuario. */
export type IdModelo = 'calibracion' | 'cubo'

export interface Modelo {
  id: IdModelo
  nombre: string
  /** Texto de f(x) con el objetivo ya sustituido. */
  expresion: string
  f: (x: number) => number
  df: (x: number) => number
}

export const NOMBRES_MODELO: Record<IdModelo, string> = {
  calibracion: 'Calibración: g(x) = x³ − x',
  cubo: 'Alternativo: g(x) = x³',
}

/** f(x) = g(x) − objetivo, con g según el modelo. */
export function crearModelo(id: IdModelo, objetivo: number): Modelo {
  const signo = objetivo < 0 ? '+' : '−'
  const obj = Math.abs(objetivo)
  if (id === 'cubo') {
    return { id, nombre: NOMBRES_MODELO[id], expresion: `x³ ${signo} ${obj}`, f: (x) => x ** 3 - objetivo, df: (x) => 3 * x * x }
  }
  return { id, nombre: NOMBRES_MODELO[id], expresion: `x³ − x ${signo} ${obj}`, f: (x) => x ** 3 - x - objetivo, df: (x) => 3 * x * x - 1 }
}

export const LIMITES = { maxAbs: 1e6, maxIter: 1000, tolMin: 1e-15 } as const
