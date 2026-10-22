import type { Data } from 'plotly.js'
import { evaluarLagrange, intervaloDe, type Datos, type PasoResiduo } from '../../core/m3'
import { muestrear } from '../../core/muestreo'

export const EJE_X = 'Carga normalizada x (sin unidades)'
export const EJE_Y = 'Latencia y (ms)'

/** Intervalo de dibujo: el de los datos (y la consulta) con un margen del 15 %. */
export function intervaloDibujo(x: number[], consulta: number): [number, number] {
  const [a, b] = intervaloDe([...x, consulta])
  const margen = (b - a) * 0.15 || 1
  return [a - margen, b + margen]
}

export const trazaDatos = (d: Datos): Data => ({ x: d.x, y: d.y, type: 'scatter', mode: 'markers', name: 'Datos', marker: { size: 10, color: '#1b1b1b', line: { width: 2, color: '#fff' } } })

export function trazaLagrange(d: Datos, rango: [number, number]): Data {
  const m = muestrear((t) => evaluarLagrange(d, t), rango[0], rango[1], 240)
  return { x: m.x, y: m.y, type: 'scatter', mode: 'lines', name: 'Lagrange (pasa por los datos)', line: { width: 2.5 } }
}

export function trazaRecta(b0: number, b1: number, rango: [number, number]): Data {
  return { x: rango, y: rango.map((t) => b0 + b1 * t), type: 'scatter', mode: 'lines', name: 'Recta de mínimos cuadrados', line: { width: 2.5, dash: 'dash' } }
}

export const trazaConsulta = (nombre: string, x: number, y: number, simbolo: 'diamond' | 'square' = 'diamond'): Data => ({ x: [x], y: [y], type: 'scatter', mode: 'markers', name: nombre, marker: { size: 13, symbol: simbolo, line: { width: 2, color: '#fff' } } })

/** Segmentos verticales de cada punto a la recta (los residuos). */
export function trazaResiduos(pasos: PasoResiduo[]): Data {
  const x: (number | null)[] = []
  const y: (number | null)[] = []
  for (const p of pasos) {
    x.push(p.x, p.x, null)
    y.push(p.y, p.yAjustada, null)
  }
  return { x, y, type: 'scatter', mode: 'lines', name: 'Residuos', line: { width: 1.5, color: '#b3261e', dash: 'dot' } }
}
