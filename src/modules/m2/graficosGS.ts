import type { Data } from 'plotly.js'
import type { PasoGaussSeidel } from '../../core/m2'

export function datosComponentes(pasos: PasoGaussSeidel[], x0: number[], exacta?: number[]): Data[] {
  const n = pasos[0]?.x.length ?? 0
  const trazas: Data[] = Array.from({ length: n }, (_, i) => ({
    x: [0, ...pasos.map((p) => p.n)], y: [x0[i], ...pasos.map((p) => p.x[i])], type: 'scatter', mode: 'lines+markers', name: `x${i + 1}`,
    marker: { symbol: (['circle', 'square', 'diamond'] as const)[i] }, line: { dash: (['solid', 'dash', 'dot'] as const)[i] },
  }))
  if (exacta) exacta.forEach((v, i) => trazas.push({ x: [0, pasos.length], y: [v, v], type: 'scatter', mode: 'lines', name: `x${i + 1} (Gauss)`, line: { width: 1, color: '#888' }, showlegend: i === 0 }))
  return trazas
}

export function datosResiduo(pasos: PasoGaussSeidel[]): Data[] {
  return [{ x: pasos.map((p) => p.n), y: pasos.map((p) => p.residuoInf), type: 'scatter', mode: 'lines+markers', name: 'Gauss-Seidel ‖b − Ax‖∞', marker: { symbol: 'square' } }]
}
