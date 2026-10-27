import type { AnalisisDecision, PreguntaDecision, Recomendacion } from '../../components/Decisor'

export type RespuestasIntegral = {
  n: 'par' | 'impar'
  suave: 'si' | 'no' | 'nose'
  costo: 'barato' | 'caro'
  precision: 'moderada' | 'alta'
}

export const INICIAL_INTEGRAL: RespuestasIntegral = { n: 'par', suave: 'si', costo: 'barato', precision: 'alta' }

export const PREGUNTAS_INTEGRAL: PreguntaDecision<RespuestasIntegral>[] = [
  { clave: 'n', texto: '¿Cuántos subintervalos puedes usar?', opciones: [['par', 'Un número par (o puedo elegirlo)'], ['impar', 'Un número impar (viene impuesto)']] },
  { clave: 'suave', texto: '¿La tasa es suave (sin saltos ni picos)?', opciones: [['si', 'Sí'], ['no', 'No'], ['nose', 'No lo sé']] },
  { clave: 'costo', texto: '¿Evaluar la tasa r(t) es costoso?', opciones: [['barato', 'No'], ['caro', 'Sí']] },
  { clave: 'precision', texto: '¿Qué precisión necesitas?', opciones: [['moderada', 'Moderada'], ['alta', 'Alta']] },
]

const ORDEN = { recomendado: 0, posible: 1, no: 2 } as const

/** Análisis del problema: trapecio compuesto frente a Simpson 1/3 compuesto. */
export function recomendarIntegral(r: RespuestasIntegral): AnalisisDecision {
  const trap: Recomendacion = { id: 'trapecio', nombre: 'Trapecio compuesto', nivel: 'posible', razones: ['Funciona con cualquier n y es muy robusto; su error es proporcional a h².'], preset: { herramienta: 'trapecio' } }
  const simp: Recomendacion = { id: 'simpson', nombre: 'Simpson 1/3 compuesto', nivel: 'posible', razones: [], preset: { herramienta: 'simpson' } }

  if (r.n === 'impar') {
    simp.nivel = 'no'
    simp.razones.push('Exige un número par de subintervalos (cada parábola cubre dos): con n impar el portal lo rechaza y sugiere n − 1 o n + 1.')
    trap.nivel = 'recomendado'
    trap.razones.push('Acepta n impar sin problema.')
  } else if (r.suave === 'si') {
    simp.nivel = r.precision === 'alta' || r.costo === 'caro' ? 'recomendado' : 'posible'
    simp.razones.push('Con una tasa suave su error decrece como h⁴ y es exacto para polinomios de grado ≤ 3: más precisión por evaluación.')
    if (r.costo === 'caro') simp.razones.push('Como evaluar r es caro, interesa la mayor precisión con menos nodos.')
    if (simp.nivel === 'posible') trap.nivel = 'recomendado'
    if (simp.nivel === 'recomendado') trap.razones.push('Necesitaría muchos más nodos para igualar la precisión de Simpson.')
  } else {
    trap.nivel = 'recomendado'
    trap.razones.push('Si la tasa tiene saltos o picos, la cuarta derivada es grande o no existe y Simpson pierde su ventaja; el trapecio es más predecible.')
    simp.razones.push(r.suave === 'nose' ? 'Compruebe primero la suavidad: sin ella no hay garantía de mejora sobre el trapecio.' : 'Con una tasa no suave su mejora teórica (h⁴) no se cumple.')
  }
  const recomendaciones = [trap, simp].sort((p, q) => ORDEN[p.nivel] - ORDEN[q.nivel])
  let plan: string
  if (r.n === 'impar') plan = 'Use el trapecio con el n impuesto, o rediscretice con n par para poder usar Simpson; compare ambos y verifique con una malla más fina.'
  else if (r.suave === 'si' && (r.precision === 'alta' || r.costo === 'caro')) plan = 'Aplique Simpson con n par pequeño y duplique n para comprobar que el error baja unas 16 veces; contraste con el trapecio.'
  else plan = 'Aplique el trapecio con un n moderado y duplíquelo: el error debería bajar unas 4 veces; si no lo hace, revise la suavidad de la tasa.'
  return { recomendaciones, plan }
}
