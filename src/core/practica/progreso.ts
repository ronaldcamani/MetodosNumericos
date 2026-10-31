import { NIVELES, PUNTOS_NIVEL, type Nivel } from './base'

/** Avance de un tema: se guarda en el navegador del estudiante (nunca sale de su equipo). */
export interface ProgresoTema {
  puntos: number
  correctas: Record<Nivel, number>
  intentos: Record<Nivel, number>
  /** Problemas generados ya resueltos sin ver la solución (para no contarlos dos veces). */
  resueltos: string[]
  /** Ejemplos resueltos cuyos pasos se revelaron completos. */
  estudiados: string[]
}

export const PROGRESO_VACIO = (): ProgresoTema => ({
  puntos: 0,
  correctas: { basico: 0, intermedio: 0, avanzado: 0 },
  intentos: { basico: 0, intermedio: 0, avanzado: 0 },
  resueltos: [],
  estudiados: [],
})

/** Problemas correctos por estrella y estrellas máximas por nivel. */
export const POR_ESTRELLA = 2
export const MAX_ESTRELLAS = 3
const META_NIVEL = POR_ESTRELLA * MAX_ESTRELLAS
const PESO: Record<Nivel, number> = { basico: 0.3, intermedio: 0.35, avanzado: 0.35 }
const MAX_GUARDADOS = 400

export const estrellas = (correctas: number) => Math.min(MAX_ESTRELLAS, Math.floor(correctas / POR_ESTRELLA))

/** Dominio del tema (0–100): cada nivel aporta según cuántos problemas resolvió, hasta la meta de 3 estrellas. */
export function dominio(p: ProgresoTema): number {
  return Math.round(100 * NIVELES.reduce((s, n) => s + PESO[n] * (Math.min(p.correctas[n], META_NIVEL) / META_NIVEL), 0))
}

export function etiquetaDominio(pct: number): string {
  if (pct >= 80) return 'Dominado'
  if (pct >= 50) return 'Competente'
  if (pct >= 20) return 'En práctica'
  return 'Explorando'
}

export interface Resultado {
  id: string
  nivel: Nivel
  correcto: boolean
  /** Si ya había visto el desarrollo, la respuesta no suma puntos. */
  vioSolucion: boolean
}

export function registrarIntento(p: ProgresoTema, r: Resultado): ProgresoTema {
  const sig: ProgresoTema = { ...p, correctas: { ...p.correctas }, intentos: { ...p.intentos }, resueltos: p.resueltos }
  sig.intentos[r.nivel] += 1
  if (r.correcto && !r.vioSolucion && !p.resueltos.includes(r.id)) {
    sig.correctas[r.nivel] += 1
    sig.puntos += PUNTOS_NIVEL[r.nivel]
    sig.resueltos = [...p.resueltos, r.id].slice(-MAX_GUARDADOS)
  }
  return sig
}

export function marcarEstudiado(p: ProgresoTema, id: string): ProgresoTema {
  return p.estudiados.includes(id) ? p : { ...p, estudiados: [...p.estudiados, id] }
}

/** Lee un valor guardado y descarta lo que no tenga la forma esperada. */
export function normalizar(crudo: unknown): ProgresoTema {
  const base = PROGRESO_VACIO()
  if (typeof crudo !== 'object' || crudo === null) return base
  const c = crudo as Partial<ProgresoTema>
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0)
  const lista = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
  for (const n of NIVELES) {
    base.correctas[n] = num(c.correctas?.[n])
    base.intentos[n] = num(c.intentos?.[n])
  }
  base.puntos = num(c.puntos)
  base.resueltos = lista(c.resueltos).slice(-MAX_GUARDADOS)
  base.estudiados = lista(c.estudiados)
  return base
}
