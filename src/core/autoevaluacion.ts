import { parseNumero } from './entrada'

export type Pregunta =
  | { id: string; tipo: 'opcion'; enunciado: string; opciones: string[]; correcta: number; explicacion: string }
  | { id: string; tipo: 'vf'; enunciado: string; correcta: boolean; explicacion: string }
  | { id: string; tipo: 'numerica'; enunciado: string; correcta: number; tolerancia: number; explicacion: string }

export type Respuesta = number | boolean | string | undefined

export interface Veredicto {
  /** 'sin_responder' y 'invalida' no cuentan como acierto ni como error de concepto. */
  estado: 'correcta' | 'incorrecta' | 'sin_responder' | 'invalida'
  detalle?: string
}

/** Califica una respuesta. En las numéricas se acepta |respuesta − correcta| ≤ tolerancia. */
export function calificar(p: Pregunta, r: Respuesta): Veredicto {
  if (r === undefined || r === '') return { estado: 'sin_responder' }
  if (p.tipo === 'opcion') return { estado: r === p.correcta ? 'correcta' : 'incorrecta' }
  if (p.tipo === 'vf') return { estado: r === p.correcta ? 'correcta' : 'incorrecta' }
  const v = parseNumero(String(r))
  if (v === null) return { estado: 'invalida', detalle: 'Escribe un número (por ejemplo 1.5 o 1,5).' }
  return { estado: Math.abs(v - p.correcta) <= p.tolerancia ? 'correcta' : 'incorrecta' }
}

export function puntaje(preguntas: Pregunta[], respuestas: Record<string, Respuesta>): number {
  return preguntas.filter((p) => calificar(p, respuestas[p.id]).estado === 'correcta').length
}
