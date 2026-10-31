/** Problemas de práctica generados al azar: enunciado, campos de respuesta numérica y desarrollo paso a paso. */
export type Nivel = 'basico' | 'intermedio' | 'avanzado'
export const NIVELES: Nivel[] = ['basico', 'intermedio', 'avanzado']
export const ROTULO_NIVEL: Record<Nivel, string> = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' }
export const PUNTOS_NIVEL: Record<Nivel, number> = { basico: 10, intermedio: 20, avanzado: 30 }

export interface Campo {
  etiqueta: string
  valor: number
  /** Diferencia absoluta máxima aceptada: absorbe los redondeos intermedios del estudiante. */
  tol: number
}

export interface Problema {
  id: string
  tema: string
  nivel: Nivel
  titulo: string
  /** Texto con fórmulas entre signos de dólar: «$x^2$». */
  enunciado: string
  campos: Campo[]
  /** Desarrollo: cada elemento es una tarjeta que el estudiante revela por separado. */
  pasos: string[]
}

export type Borrador = Omit<Problema, 'id' | 'tema' | 'nivel'>

export interface Azar {
  entero(a: number, b: number): number
  decimal(a: number, b: number, d: number): number
  elegir<T>(xs: readonly T[]): T
  signo(): 1 | -1
}

/** Generador pseudoaleatorio con semilla (mulberry32): misma semilla, mismos problemas. */
export function crearAzar(semilla: number): Azar {
  let s = semilla >>> 0
  const u = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const entero = (a: number, b: number) => a + Math.floor(u() * (b - a + 1))
  return {
    entero,
    decimal: (a, b, d) => Number((a + u() * (b - a)).toFixed(d)),
    elegir: (xs) => xs[Math.floor(u() * xs.length)],
    signo: () => (u() < 0.5 ? -1 : 1),
  }
}

/** Número como texto para el enunciado: sin ceros sobrantes y con signo ASCII (apto para LaTeX). */
export function fmt(x: number, d = 4): string {
  const t = Number(x.toFixed(d))
  return Object.is(t, -0) ? '0' : String(t)
}

/** Campo con tolerancia 1.5·10⁻ᵈ: «redondea a d decimales». */
export const campo = (etiqueta: string, valor: number, decimales: number): Campo => ({ etiqueta, valor, tol: 1.5 * 10 ** -decimales })

export type Veredicto = 'correcto' | 'incorrecto' | 'invalido'

export function evaluarCampo(c: Campo, entrada: number | null): Veredicto {
  if (entrada === null) return 'invalido'
  return Math.abs(entrada - c.valor) <= c.tol + 1e-12 ? 'correcto' : 'incorrecto'
}

export type Generador = (r: Azar) => Borrador
export type CatalogoTema = Record<Nivel, Generador[]>

/** Elige `n` problemas del nivel recorriendo los generadores desde un punto aleatorio, con parámetros distintos. */
export function generarProblemas(tema: string, nivel: Nivel, catalogo: CatalogoTema, semilla: number, n = 3): Problema[] {
  const gens = catalogo[nivel]
  const r = crearAzar(semilla * 7919 + NIVELES.indexOf(nivel))
  const inicio = r.entero(0, gens.length - 1)
  return Array.from({ length: n }, (_, i) => {
    const g = gens[(inicio + i) % gens.length]
    return { ...g(crearAzar(semilla * 104729 + i * 31 + NIVELES.indexOf(nivel))), id: `${tema}-${nivel}-${semilla}-${i}`, tema, nivel }
  })
}
