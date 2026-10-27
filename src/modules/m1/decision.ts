import type { AnalisisDecision, PreguntaDecision, Recomendacion } from '../../components/Decisor'
import { METODOS, type IdMetodo } from './CalculadoraRaices'

/** Lo que se sabe del problema antes de elegir el método. */
export type Respuestas = {
  /** ¿Se conoce un intervalo [a, b] donde f cambia de signo? */
  signo: 'si' | 'no' | 'nose'
  /** ¿Se puede escribir f′(x) sin mucho esfuerzo? */
  derivada: 'si' | 'no'
  /** ¿Hay una estimación inicial cercana a la raíz? */
  inicial: 'si' | 'no'
  /** ¿f es un polinomio y se quieren todas sus raíces? */
  polinomio: 'si' | 'no'
  prioridad: 'garantia' | 'velocidad'
}

const ORDEN: Record<Recomendacion['nivel'], number> = { recomendado: 0, posible: 1, no: 2 }

/** Análisis del problema: cada método recibe un nivel y las razones que lo justifican. */
export const INICIAL: Respuestas = { signo: 'si', derivada: 'si', inicial: 'si', polinomio: 'no', prioridad: 'garantia' }

export const PREGUNTAS: PreguntaDecision<Respuestas>[] = [
  { clave: 'signo', texto: '¿Conoces un intervalo [a, b] donde f cambia de signo?', opciones: [['si', 'Sí'], ['no', 'No'], ['nose', 'No lo sé']] },
  { clave: 'derivada', texto: '¿Puedes escribir f′(x) con facilidad?', opciones: [['si', 'Sí'], ['no', 'No']] },
  { clave: 'inicial', texto: '¿Tienes una estimación inicial cercana a la raíz?', opciones: [['si', 'Sí'], ['no', 'No']] },
  { clave: 'polinomio', texto: '¿Es un polinomio y quieres todas sus raíces?', opciones: [['si', 'Sí'], ['no', 'No']] },
  { clave: 'prioridad', texto: '¿Qué prefieres?', opciones: [['garantia', 'Garantía de convergencia'], ['velocidad', 'Velocidad']] },
]

type Borrador = { metodo: IdMetodo; nivel: Recomendacion['nivel']; razones: string[] }

export function recomendarMetodos(r: Respuestas): AnalisisDecision {
  const rec: Borrador[] = []

  // Bisección
  if (r.signo === 'si') rec.push({ metodo: 'biseccion', nivel: r.prioridad === 'garantia' ? 'recomendado' : 'posible', razones: ['Hay cambio de signo y f es continua: converge siempre.', r.prioridad === 'garantia' ? 'Prioriza la garantía: es el método más seguro.' : 'Es lenta: una cifra binaria por iteración.'] })
  else if (r.signo === 'nose') rec.push({ metodo: 'biseccion', nivel: 'posible', razones: ['Necesita un intervalo con cambio de signo: primero tantea f en varios puntos (tabla o gráfico) para encontrarlo.'] })
  else rec.push({ metodo: 'biseccion', nivel: 'no', razones: ['Sin un intervalo con cambio de signo no hay garantía de raíz; el método no puede arrancar.'] })

  // Falsa posición
  if (r.signo === 'si') rec.push({ metodo: 'falsa', nivel: r.prioridad === 'velocidad' ? 'recomendado' : 'posible', razones: ['Conserva el intervalo con cambio de signo, como la bisección, pero usa la cuerda: suele ser más rápida.', 'Reserva: un extremo puede quedarse fijo y la convergencia se vuelve lenta.'] })
  else rec.push({ metodo: 'falsa', nivel: 'no', razones: ['Igual que la bisección, exige un intervalo con cambio de signo.'] })

  // Newton
  if (r.derivada === 'no') rec.push({ metodo: 'newton', nivel: 'no', razones: ['Necesita f′(x); si no se puede escribir o es costosa, use la secante.'] })
  else if (r.inicial === 'si') rec.push({ metodo: 'newton', nivel: r.prioridad === 'velocidad' ? 'recomendado' : 'posible', razones: ['Hay derivada y un buen punto inicial: convergencia cuadrática cerca de una raíz simple.', ...(r.prioridad === 'garantia' ? ['No ofrece garantía global: puede divergir, ciclar o saltar a otra raíz.'] : [])] })
  else rec.push({ metodo: 'newton', nivel: 'posible', razones: ['Hay derivada, pero sin buen punto inicial puede divergir o ciclar: acote antes la raíz (p. ej. con bisecciones).'] })

  // Secante
  if (r.derivada === 'no') rec.push({ metodo: 'secante', nivel: r.inicial === 'si' ? 'recomendado' : 'posible', razones: ['No necesita derivada: la aproxima con dos puntos.', r.inicial === 'si' ? 'Con buenos puntos iniciales converge rápido (orden ≈ 1.62).' : 'Sin buenos puntos iniciales puede divergir; acote antes la raíz.'] })
  else rec.push({ metodo: 'secante', nivel: 'posible', razones: ['Como hay derivada, Newton es más rápido por iteración; la secante evita calcular f′ a costa de un poco más de iteraciones.'] })

  // Polinomios
  if (r.polinomio === 'si') rec.push({ metodo: 'todas', nivel: 'recomendado', razones: ['Es un polinomio: Horner evalúa p y p′ con pocas operaciones, y la deflación permite hallar todas las raíces, incluso las complejas.'] })
  else rec.push({ metodo: 'todas', nivel: 'no', razones: ['Solo aplica a polinomios (usa la regla de Horner y la deflación).'] })

  rec.sort((p, q) => ORDEN[p.nivel] - ORDEN[q.nivel])

  let plan: string
  if (r.polinomio === 'si') plan = 'Acote las raíces con la cota de Cauchy, aplique Newton–Horner con deflación para las reales y la fórmula cuadrática (o Durand–Kerner) para el resto; verifique cada raíz con el residuo relativo.'
  else if (r.signo === 'si' && r.prioridad === 'velocidad' && r.derivada === 'si') plan = 'Método híbrido: unas pocas bisecciones para acotar la raíz y luego Newton (o secante) desde ese punto, que converge muy rápido; verifique la raíz al final.'
  else if (r.signo === 'si' && r.prioridad === 'velocidad') plan = 'Sin derivada, use el intervalo con cambio de signo: falsa posición o secante (a partir de los extremos) para necesitar pocas evaluaciones, y verifique la raíz al final.'
  else if (r.signo === 'si') plan = 'Aplique bisección en el intervalo con cambio de signo hasta la tolerancia pedida y verifique que el punto final es una raíz y no un polo.'
  else if (r.derivada === 'si' && r.inicial === 'si') plan = 'Aplique Newton desde el punto inicial y vigile derivada nula, ciclos y saltos a otra raíz; si falla, busque un cambio de signo y use un método cerrado.'
  else if (r.derivada === 'no' && r.inicial === 'si') plan = 'Aplique la secante con dos puntos cercanos a la raíz; si diverge, busque primero un intervalo con cambio de signo.'
  else plan = 'Todavía falta información: grafique o tabule f para localizar un cambio de signo antes de elegir el método.'
  const recomendaciones: Recomendacion[] = rec.map((x) => ({ id: x.metodo, nombre: METODOS[x.metodo].nombre, nivel: x.nivel, razones: x.razones, preset: { herramienta: 'raices', valores: { metodo: x.metodo, ...(x.metodo === 'todas' ? { modelo: 'polinomio' } : {}) } } }))
  return { recomendaciones, plan }
}
