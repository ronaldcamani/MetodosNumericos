import type { AnalisisDecision, PreguntaDecision, Recomendacion } from '../../components/Decisor'

export type RespuestasDatos = {
  datos: 'exactos' | 'ruido'
  pasar: 'si' | 'no'
  cantidad: 'pocos' | 'muchos'
  consulta: 'dentro' | 'fuera'
  repetidas: 'no' | 'si'
}

export const INICIAL_DATOS: RespuestasDatos = { datos: 'exactos', pasar: 'si', cantidad: 'pocos', consulta: 'dentro', repetidas: 'no' }

export const PREGUNTAS_DATOS: PreguntaDecision<RespuestasDatos>[] = [
  { clave: 'datos', texto: '¿Cómo son los datos?', opciones: [['exactos', 'Exactos (sin error de medición)'], ['ruido', 'Con ruido de medición']] },
  { clave: 'pasar', texto: '¿Necesitas que la curva pase por todos los puntos?', opciones: [['si', 'Sí'], ['no', 'No: busco la tendencia']] },
  { clave: 'cantidad', texto: '¿Cuántos puntos hay?', opciones: [['pocos', '2 a 4'], ['muchos', '5 o 6']] },
  { clave: 'consulta', texto: '¿Dónde está el valor que consultas?', opciones: [['dentro', 'Dentro del intervalo de los datos'], ['fuera', 'Fuera del intervalo']] },
  { clave: 'repetidas', texto: '¿Hay abscisas x repetidas?', opciones: [['no', 'No'], ['si', 'Sí (réplicas)']] },
]

const ORDEN = { recomendado: 0, posible: 1, no: 2 } as const

/** Análisis del problema: interpolación de Lagrange frente a regresión lineal. */
export function recomendarDatos(r: RespuestasDatos): AnalisisDecision {
  const lag: Recomendacion = { id: 'lagrange', nombre: 'Interpolación de Lagrange', nivel: 'recomendado', razones: [], preset: { herramienta: 'lagrange' } }
  const reg: Recomendacion = { id: 'regresion', nombre: 'Regresión lineal', nivel: 'recomendado', razones: [], preset: { herramienta: 'regresion' } }

  if (r.repetidas === 'si') {
    lag.nivel = 'no'
    lag.razones.push('Una abscisa repetida con valores distintos no define una función: Lagrange rechaza la entrada (no elimina nodos en silencio).')
  } else if (r.datos === 'ruido') {
    lag.nivel = r.pasar === 'si' ? 'posible' : 'no'
    lag.razones.push('Pasa por todos los puntos, ruido de medición incluido: interpolar no elimina el error de medición.')
  } else if (r.pasar === 'no') {
    lag.nivel = 'posible'
    lag.razones.push('Los datos son exactos, pero no necesitas pasar por todos: un ajuste resume la tendencia con menos riesgo.')
  } else {
    lag.nivel = r.cantidad === 'pocos' && r.consulta === 'dentro' ? 'recomendado' : 'posible'
    lag.razones.push('Datos exactos y necesidad de pasar por ellos: es exactamente lo que hace la interpolación.')
    if (r.cantidad === 'muchos') lag.razones.push('Con 5 o 6 nodos el polinomio es de grado alto y puede oscilar entre los nodos (fenómeno de Runge).')
  }
  if (r.consulta === 'fuera') lag.razones.push('La consulta está fuera del intervalo: es una extrapolación y un polinomio se aleja muy rápido.')

  if (r.datos === 'ruido' || r.pasar === 'no') {
    reg.nivel = 'recomendado'
    reg.razones.push('Estima la tendencia con la menor suma de cuadrados de residuos sin reproducir el ruido.')
  } else {
    reg.nivel = 'posible'
    reg.razones.push('Los datos son exactos y se quiere pasar por ellos: la recta no pasa por los puntos (deja residuos) y solo sirve si la relación es casi lineal.')
  }
  if (r.repetidas === 'si') {
    reg.nivel = 'recomendado'
    reg.razones.push('Admite abscisas repetidas (réplicas de la medición): es la opción que usa todos los datos.')
  }
  if (r.consulta === 'fuera') reg.razones.push('Fuera del intervalo es una extrapolación: el portal calcula pero avisa de que nada en los datos la respalda.')

  const recomendaciones = [lag, reg].sort((p, q) => ORDEN[p.nivel] - ORDEN[q.nivel])
  let plan: string
  if (r.repetidas === 'si') plan = 'Ajuste una recta por mínimos cuadrados (admite réplicas) o promedie conscientemente las réplicas antes de interpolar; no elimine nodos sin avisar.'
  else if (r.datos === 'ruido') plan = 'Ajuste una recta, revise los residuos y la suma de cuadrados, y use la predicción solo dentro del intervalo de los datos.'
  else if (r.cantidad === 'muchos') plan = 'Interpole con pocos nodos cercanos a la consulta (grado bajo) o ajuste una tendencia: un polinomio de grado alto puede oscilar.'
  else plan = 'Interpole con Lagrange, compruebe que la consulta está dentro del intervalo y compare con la recta para ver cuánto difieren.'
  return { recomendaciones, plan }
}
