import type { Data } from 'plotly.js'
import { exacta, type Enfriamiento, type PasoEDO } from '../../core/m5'
import { muestrear } from '../../core/muestreo'

export const EJE_T = 'Tiempo t (min)'
export const EJE_TEMP = 'Temperatura T (°C)'

export const trazaExacta = (p: Enfriamiento, tf = p.tf): Data => {
  const m = muestrear((t) => exacta(p, t), 0, tf, 200)
  return { x: m.x, y: m.y, type: 'scatter', mode: 'lines', name: 'Solución exacta', line: { width: 3, color: '#1b1b1b' } }
}

export const trazaNodos = (pasos: PasoEDO[], nombre: string, simbolo: 'circle' | 'square' | 'diamond' = 'circle', dash: 'solid' | 'dash' | 'dot' = 'solid'): Data => ({
  x: pasos.map((q) => q.t), y: pasos.map((q) => q.T), type: 'scatter', mode: 'lines+markers', name: nombre, marker: { size: 8, symbol: simbolo }, line: { width: 2, dash },
})

export const trazaError = (pasos: PasoEDO[], nombre: string, simbolo: 'circle' | 'square' | 'diamond' = 'circle'): Data => ({
  x: pasos.map((q) => q.t), y: pasos.map((q) => Math.max(q.error, 1e-17)), type: 'scatter', mode: 'lines+markers', name: nombre, marker: { size: 7, symbol: simbolo },
})
