import type { AnalisisDecision, PreguntaDecision, Recomendacion } from '../../components/Decisor'

export type RespuestasSistema = {
  tamano: 'pequeno' | 'grande'
  dominante: 'si' | 'no' | 'nose'
  singular: 'si' | 'no'
  prioridad: 'pasos' | 'aproximar'
}

export const INICIAL_SISTEMA: RespuestasSistema = { tamano: 'pequeno', dominante: 'si', singular: 'no', prioridad: 'pasos' }

export const PREGUNTAS_SISTEMA: PreguntaDecision<RespuestasSistema>[] = [
  { clave: 'tamano', texto: '¿Qué tan grande es el sistema?', opciones: [['pequeno', 'Pequeño (hasta unas decenas de incógnitas)'], ['grande', 'Grande (cientos o más)']] },
  { clave: 'dominante', texto: '¿La matriz es diagonalmente dominante?', opciones: [['si', 'Sí'], ['no', 'No'], ['nose', 'No lo sé']] },
  { clave: 'singular', texto: '¿Podría ser singular o casi singular?', opciones: [['si', 'Sí'], ['no', 'No']] },
  { clave: 'prioridad', texto: '¿Qué prefieres?', opciones: [['pasos', 'Solución en un número fijo de pasos'], ['aproximar', 'Aproximaciones con control del residuo']] },
]

const ORDEN = { recomendado: 0, posible: 1, no: 2 } as const

/** Análisis del problema: eliminación con pivoteo parcial frente a Gauss-Seidel. */
export function recomendarSistema(r: RespuestasSistema): AnalisisDecision {
  const directo: Recomendacion = { id: 'gauss', nombre: 'Eliminación con pivoteo parcial', nivel: 'recomendado', razones: [], preset: { herramienta: 'gauss' } }
  const iterativo: Recomendacion = { id: 'gs', nombre: 'Gauss-Seidel', nivel: 'posible', razones: [], preset: { herramienta: 'gs' } }

  directo.razones.push('Resuelve en un número fijo de operaciones y no necesita dominancia diagonal.')
  if (r.singular === 'si') directo.razones.push('Detecta un pivote nulo y declara «singular» antes de dar una solución: lo que se necesita si hay duda.')
  if (r.tamano === 'grande') {
    directo.nivel = r.dominante === 'si' && r.prioridad === 'aproximar' ? 'posible' : 'recomendado'
    directo.razones.push('El costo crece como n³ y la matriz se llena durante la eliminación: en sistemas muy grandes puede ser costoso.')
  }

  if (r.singular === 'si') directo.nivel = 'recomendado'

  if (r.singular === 'si') {
    iterativo.nivel = 'no'
    iterativo.razones.push('Si el sistema es singular no hay solución única: iterar no tiene sentido (el portal lo detecta antes de empezar).')
  } else if (r.dominante === 'si') {
    iterativo.nivel = r.tamano === 'grande' || r.prioridad === 'aproximar' ? 'recomendado' : 'posible'
    iterativo.razones.push('Con dominancia diagonal estricta converge para cualquier vector inicial.')
    iterativo.razones.push(iterativo.nivel === 'recomendado' ? 'Cada iteración es barata y se controla con el residuo.' : 'Para un sistema pequeño un método directo es igual de simple.')
  } else if (r.dominante === 'nose') {
    iterativo.razones.push('Primero comprueba la dominancia diagonal: sin ella no hay garantía de convergencia (se puede intentar reordenar las ecuaciones).')
  } else {
    iterativo.razones.push('Sin dominancia diagonal puede divergir tal como está escrito; a veces basta reordenar las ecuaciones, y si no, use un método directo.')
  }

  const recomendaciones = [directo, iterativo].sort((p, q) => ORDEN[p.nivel] - ORDEN[q.nivel])
  let plan: string
  if (r.singular === 'si') plan = 'Aplique eliminación con pivoteo parcial; si aparece un pivote nulo, informe «singular» y analice si el sistema es incompatible o tiene infinitas soluciones.'
  else if (r.tamano === 'grande' && r.dominante === 'si') plan = 'Use Gauss-Seidel con tolerancia sobre el residuo ‖b − Ax‖∞, verifique el residuo final y vigile el máximo de iteraciones (agotarlo no es convergencia).'
  else if (r.dominante !== 'si') plan = 'Compruebe o reordene para lograr dominancia y entonces use Gauss-Seidel; si no es posible, resuelva con eliminación con pivoteo parcial y verifique el residuo.'
  else plan = 'Resuelva con eliminación con pivoteo parcial y verifique el residuo ‖b − Ax‖∞; Gauss-Seidel sirve de contraste.'
  return { recomendaciones, plan }
}
