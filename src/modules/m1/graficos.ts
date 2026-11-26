import type { Data } from 'plotly.js'
import { muestrear } from '../../core/muestreo'
import type { Modelo, ModeloPuntoFijo, PasoBiseccion, PasoFalsaPosicion, PasoNewton, PasoPuntoFijo, PasoSecante, RaizPolinomio } from '../../core/m1'

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

export function datosFalsaPosicion(m: Modelo, a: number, b: number, pasos: PasoFalsaPosicion[]): Data[] {
  const pad = (b - a) * 0.25
  const cuerdas: Data = {
    x: pasos.flatMap((p) => [p.a, p.b, null]),
    y: pasos.flatMap((p) => [m.f(p.a), m.f(p.b), null]),
    type: 'scatter', mode: 'lines', name: 'Cuerdas (a, f(a)) – (b, f(b))', line: { dash: 'dot', width: 1.5 },
  }
  return [
    curva(m, a - pad, b + pad),
    ejeCero(a - pad, b + pad),
    cuerdas,
    { x: pasos.map((p) => p.c), y: pasos.map((p) => p.fc), type: 'scatter', mode: 'text+markers', text: pasos.map((p) => (p.n <= 6 ? String(p.n) : '')), textposition: 'top center', name: 'Cortes cₙ (n)', marker: { size: 8, symbol: 'diamond' } },
  ]
}

export function datosSecante(m: Modelo, x0: number, x1: number, pasos: PasoSecante[]): Data[] {
  const xs = [x0, x1, ...pasos.map((p) => p.siguiente)].filter(Number.isFinite)
  const lo = Math.min(...xs)
  const hi = Math.max(...xs)
  const pad = Math.max((hi - lo) * 0.3, 0.5)
  const secantes: Data = {
    x: pasos.flatMap((p) => [p.x0, p.x1, p.siguiente, null]),
    y: pasos.flatMap((p) => [p.f0, p.f1, 0, null]),
    type: 'scatter', mode: 'lines', name: 'Secantes', line: { dash: 'dot', width: 1.5 },
  }
  return [
    curva(m, lo - pad, hi + pad),
    ejeCero(lo - pad, hi + pad),
    secantes,
    { x: pasos.map((p) => p.siguiente), y: pasos.map((p) => m.f(p.siguiente)), type: 'scatter', mode: 'text+markers', text: pasos.map((p) => String(p.n)), textposition: 'top right', name: 'Iterados (n)', marker: { size: 8, symbol: 'diamond' } },
  ]
}

/** Polinomio con sus raíces reales sobre el eje x (las complejas no se dibujan en el plano real). */
export function datosPolinomio(m: Modelo, raices: RaizPolinomio[], cota: number): Data[] {
  const reales = raices.filter((r) => r.im === 0).map((r) => r.re)
  const lim = reales.length ? Math.max(...reales.map(Math.abs)) : cota
  const pad = Math.max(lim * 0.3, 1)
  const lo = (reales.length ? Math.min(...reales) : -lim) - pad
  const hi = (reales.length ? Math.max(...reales) : lim) + pad
  return [
    curva(m, lo, hi),
    ejeCero(lo, hi),
    { x: reales, y: reales.map(() => 0), type: 'scatter', mode: 'markers', name: 'Raíces reales', marker: { size: 12, symbol: 'diamond', line: { width: 2, color: '#fff' } } },
  ]
}

/** Gráfico de telaraña (cobweb) y = x vs y = g(x) para la Iteración de Punto Fijo. */
export function datosPuntoFijoCobweb(modelo: ModeloPuntoFijo, x0: number, pasos: PasoPuntoFijo[]): Data[] {
  const finitos = [x0, ...pasos.flatMap((p) => [p.x, p.gx])].filter((v) => Number.isFinite(v) && Math.abs(v) <= 50)
  const xs = finitos.length > 0 ? finitos : [x0 - 1, x0 + 1]
  const loRaw = Math.min(...xs)
  const hiRaw = Math.max(...xs)
  const span = Math.max(hiRaw - loRaw, 1)
  const pad = span * 0.25
  const lo = loRaw - pad
  const hi = hiRaw + pad

  const { x: gxX, y: gxY } = muestrear(modelo.g, lo, hi)
  const cobX: number[] = []
  const cobY: number[] = []
  if (pasos.length > 0) {
    cobX.push(pasos[0].x)
    cobY.push(0)
    for (const p of pasos.slice(0, 20)) {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.gx) || Math.abs(p.gx) > 50) break
      cobX.push(p.x, p.gx)
      cobY.push(p.gx, p.gx)
    }
  }

  return [
    { x: gxX, y: gxY, type: 'scatter', mode: 'lines', name: `y = ${modelo.expresionG}`, line: { width: 2.5 } },
    { x: [lo, hi], y: [lo, hi], type: 'scatter', mode: 'lines', name: 'y = x', line: { dash: 'dash', width: 1.8, color: '#64748b' } },
    { x: cobX, y: cobY, type: 'scatter', mode: 'lines', name: 'Telaraña (cobweb)', line: { dash: 'dot', width: 1.8 } },
    {
      x: pasos.slice(0, 12).map((p) => p.x),
      y: pasos.slice(0, 12).map((p) => p.gx),
      type: 'scatter',
      mode: 'text+markers',
      text: pasos.slice(0, 12).map((p) => (p.k <= 6 ? String(p.k) : '')),
      textposition: 'top left',
      name: '(xₖ, g(xₖ))',
      marker: { size: 8, symbol: 'diamond' },
    },
  ]
}
