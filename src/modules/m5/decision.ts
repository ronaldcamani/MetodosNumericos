import type { AnalisisDecision, PreguntaDecision, Recomendacion } from '../../components/Decisor'

export type RespuestasEdo = {
  precision: 'moderada' | 'alta'
  costo: 'barato' | 'caro'
  paso: 'libre' | 'impuesto'
  rigidez: 'no' | 'si' | 'nose'
}

export const INICIAL_EDO: RespuestasEdo = { precision: 'moderada', costo: 'barato', paso: 'libre', rigidez: 'no' }

export const PREGUNTAS_EDO: PreguntaDecision<RespuestasEdo>[] = [
  { clave: 'precision', texto: '¿Qué precisión necesitas?', opciones: [['moderada', 'Moderada (una idea de la forma de la curva)'], ['alta', 'Alta (error muy pequeño)']] },
  { clave: 'costo', texto: '¿Evaluar la derivada f(t, y) es costoso?', opciones: [['barato', 'No, es una fórmula simple'], ['caro', 'Sí (una simulación, una consulta lenta…)']] },
  { clave: 'paso', texto: '¿Puedes elegir el paso h?', opciones: [['libre', 'Sí, lo elijo yo'], ['impuesto', 'No, viene impuesto y es grande']] },
  { clave: 'rigidez', texto: '¿El modelo tiene una constante grande (k·h cerca o por encima de 2)?', opciones: [['no', 'No'], ['si', 'Sí'], ['nose', 'No lo sé']] },
]

const ORDEN = { recomendado: 0, posible: 1, no: 2 } as const

/** Análisis del problema: Euler explícito frente a Runge-Kutta 4. */
export function recomendarEdo(r: RespuestasEdo): AnalisisDecision {
  const euler: Recomendacion = { id: 'euler', nombre: 'Euler explícito', nivel: 'posible', razones: [], preset: { herramienta: 'euler' } }
  const rk4: Recomendacion = { id: 'rk4', nombre: 'Runge-Kutta 4', nivel: 'posible', razones: [], preset: { herramienta: 'rk4' } }

  euler.razones.push('Es el más simple: una evaluación de f por paso, fácil de programar y de explicar. Su error global es proporcional a h.')
  rk4.razones.push('Usa cuatro pendientes por paso: error global proporcional a h⁴, mucho más preciso con el mismo h.')

  if (r.precision === 'moderada' && r.paso === 'libre' && r.rigidez === 'no') {
    euler.nivel = 'recomendado'
    euler.razones.push('Con precisión moderada y un paso pequeño a tu alcance, basta para ver la forma de la solución.')
    if (r.costo === 'caro') rk4.razones.push('Cuesta 4 evaluaciones por paso: con f cara conviene si con él puedes usar menos pasos.')
  } else if (r.precision === 'alta') {
    euler.nivel = 'no'
    euler.razones.push('Para precisión alta necesitaría un paso diminuto (miles de pasos): ineficiente.')
    rk4.nivel = 'recomendado'
    rk4.razones.push('Alcanza la precisión con pasos relativamente grandes: casi siempre gasta menos evaluaciones en total.')
  } else {
    rk4.nivel = 'recomendado'
    rk4.razones.push(r.paso === 'impuesto' ? 'Con un paso impuesto y grande, su error es mucho menor que el de Euler.' : 'Es la opción robusta cuando no se sabe cuánta precisión hará falta.')
  }

  if (r.rigidez === 'si' || r.paso === 'impuesto') {
    const dato = r.rigidez === 'si' ? 'Con una constante grande' : 'Con un paso impuesto grande'
    euler.razones.push(`${dato}, Euler puede ser inestable: la condición es 0 < h < 2/k (4 min con k = 0.5). Compruébalo antes de fiarte del resultado.`)
    rk4.razones.push('RK4 también tiene límite de estabilidad (k·h < 2.785, algo mayor que el de Euler): estable no significa preciso.')
    if (r.rigidez === 'si' && r.paso === 'impuesto') euler.nivel = 'no'
  } else if (r.rigidez === 'nose') {
    euler.razones.push('Comprueba la estabilidad con el explorador: la condición de Euler es k·h < 2.')
  }
  if (r.costo === 'caro' && rk4.nivel === 'recomendado') rk4.razones.push('Aunque evaluar f es caro, 4 evaluaciones con pasos grandes suelen costar menos que miles con Euler.')

  const recomendaciones = [euler, rk4].sort((p, q) => ORDEN[p.nivel] - ORDEN[q.nivel])
  let plan: string
  if (r.rigidez === 'si' && r.paso === 'impuesto') plan = 'Primero comprueba la estabilidad: si k·h supera el límite, reduce h o cambia de método; solo entonces compara con la solución exacta (si existe) y no confundas una trayectoria calculada con una física.'
  else if (r.precision === 'alta' || r.paso === 'impuesto') plan = 'Aplique RK4 con el paso disponible, compruebe la estabilidad y compare con un paso a la mitad: el error debería bajar unas 16 veces.'
  else plan = 'Aplique Euler con un paso pequeño y compárelo con el de la mitad: el error debería bajar unas 2 veces; si necesita más precisión, pase a RK4.'
  return { recomendaciones, plan }
}
