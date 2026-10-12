import type { Data } from 'plotly.js'
import { muestrear } from '../../core/muestreo'
import type { Modelo } from '../../core/m1'
import type { PasoBiseccion, PasoNewton } from '../../core/m1'

const curva = (m: Modelo, x0: number, x1: number): Data => {
  const { x, y } = muestrear(m.f, x0, x1)
  return { x, y, type: 'scatter', mode: 'lines', name: `f(x) = ${m.expresion}`, line: { width: 2 } }
}
const ejeCero = (x0: number, x1: number): Data => ({ x: [x0, x1], y: [0, 0], type: 'scatter', mode: 'lines', name: 'y = 0', line: { dash: 'dash', width: 1, color: '#888' } })

export function datosProblema(m: Modelo, a: number, b: number): Data[] {
  const pad = (b - a) * 0.25
  return [curva(m, a - pad, b + pad), ejeCero(a - pad, b + pad)]
}

export function datosBiseccion(m: Modelo, a: number, b: number, pasos: PasoBiseccion[]): Data[] {
  const pad = (b - a) * 0.25
  return [
    curva(m, a - pad, b + pad),
    ejeCero(a - pad, b + pad),
    { x: [a, b], y: [m.f(a), m.f(b)], type: 'scatter', mode: 'markers', name: 'Extremos a, b', marker: { size: 11, symbol: 'square' } },
    { x: pasos.map((p) => p.medio), y: pasos.map((p) => p.fMedio), type: 'scatter', mode: 'text+markers', text: pasos.map((p) => (p.n <= 6 ? String(p.n) : '')), textposition: 'top center', name: 'Puntos medios (n)', marker: { size: 8, symbol: 'diamond' } },
  ]
}

export function datosNewton(m: Modelo, x0: number, pasos: PasoNewton[]): Data[] {
  const xs = [x0, ...pasos.map((p) => p.siguiente)].filter(Number.isFinite)
  const lo = Math.min(...xs)
  const hi = Math.max(...xs)
  const pad = Math.max((hi - lo) * 0.3, 0.5)
  const tangentes: Data = {
    x: pasos.flatMap((p) => [p.x, p.siguiente, null]),
    y: pasos.flatMap((p) => [p.fx, 0, null]),
    type: 'scatter',
    mode: 'lines',
    name: 'Tangentes',
    line: { dash: 'dot', width: 1.5 },
  }
  return [
    curva(m, lo - pad, hi + pad),
    ejeCero(lo - pad, hi + pad),
    tangentes,
    { x: pasos.map((p) => p.x), y: pasos.map((p) => p.fx), type: 'scatter', mode: 'text+markers', text: pasos.map((p) => String(p.n)), textposition: 'top right', name: 'Iterados (n)', marker: { size: 8, symbol: 'diamond' } },
  ]
}
