import type { Data } from 'plotly.js'
import { evaluarLagrange } from '../../core/m3'
import { evaluarTasa, type PasoNodo, type Tasa } from '../../core/m4'
import { muestrear } from '../../core/muestreo'

export const EJE_T = 'Tiempo t (s)'
export const EJE_R = 'Tasa r(t) (MB/s)'

export function trazaTasa(tasa: Tasa, inicio: number, fin: number): Data {
  const m = muestrear((t) => evaluarTasa(tasa, t), inicio, fin, 200)
  return { x: m.x, y: m.y, type: 'scatter', mode: 'lines', name: 'Tasa r(t)', line: { width: 3, color: '#1b1b1b' } }
}

/** Trapecio: la poligonal que une los nodos; el área bajo ella es la aproximación. */
export function trazaTrapecio(pasos: PasoNodo[], relleno = true): Data {
  return { x: pasos.map((p) => p.t), y: pasos.map((p) => p.r), type: 'scatter', mode: 'lines+markers', name: 'Trapecio (poligonal)', fill: relleno ? 'tozeroy' : 'none', fillcolor: 'rgba(30,120,200,0.22)', line: { width: 2, color: '#1e78c8' }, marker: { size: 7, symbol: 'circle' } }
}

/** Simpson: una parábola por cada terna de nodos consecutivos (subintervalos de dos en dos). */
export function trazaSimpson(pasos: PasoNodo[], relleno = true): Data {
  const x: number[] = []
  const y: number[] = []
  for (let k = 0; k + 2 < pasos.length; k += 2) {
    const d = { x: [pasos[k].t, pasos[k + 1].t, pasos[k + 2].t], y: [pasos[k].r, pasos[k + 1].r, pasos[k + 2].r] }
    for (let j = 0; j <= 20; j++) {
      const t = d.x[0] + ((d.x[2] - d.x[0]) * j) / 20
      x.push(t)
      y.push(evaluarLagrange(d, t))
    }
  }
  return { x, y, type: 'scatter', mode: 'lines', name: 'Simpson (arcos parabólicos)', fill: relleno ? 'tozeroy' : 'none', fillcolor: 'rgba(220,120,20,0.22)', line: { width: 2, dash: 'dash', color: '#d97a14' } }
}

export const trazaNodos = (pasos: PasoNodo[]): Data => ({ x: pasos.map((p) => p.t), y: pasos.map((p) => p.r), type: 'scatter', mode: 'markers', name: 'Nodos', marker: { size: 8, color: '#1b1b1b', symbol: 'diamond' } })
