import katex from 'katex'
import { describe, expect, it } from 'vitest'
import {
  analizarConvergenciaBiseccion,
  analizarConvergenciaFalsa,
  analizarConvergenciaNewton,
  analizarConvergenciaSecante,
  biseccion,
  crearModelo,
  crearModeloPolinomio,
  falsaPosicion,
  FICHAS_CONVERGENCIA,
  newton,
  secante,
} from '.'

describe('Análisis y criterios de convergencia (M1)', () => {
  const base = crearModelo('calibracion', 2)

  it('todas las fichas de convergencia compilan sus fórmulas en KaTeX sin errores', () => {
    for (const f of Object.values(FICHAS_CONVERGENCIA)) {
      expect(() => katex.renderToString(f.formulaOrdenTex, { throwOnError: true })).not.toThrow()
      expect(() => katex.renderToString(f.condicionTex, { throwOnError: true })).not.toThrow()
    }
  })

  it('Newton en raíz simple estima orden empírico cuadrático p ≈ 2 y factor asintótico finito', () => {
    const r = newton({ f: base.f, df: base.df, x0: 1.5, tol: 1e-6, maxIter: 100 })
    const an = analizarConvergenciaNewton(r)
    expect(an.ordenEmpirico).not.toBeNull()
    expect(an.ordenEmpirico!).toBeGreaterThan(1.85)
    expect(an.ordenEmpirico!).toBeLessThan(2.15)
    expect(an.factorAsintotico).not.toBeNull()
    expect(Number.isFinite(an.factorAsintotico!)).toBe(true)
    expect(an.alertas).toHaveLength(0)
  })

  it('Newton en raíz doble detecta degradación a convergencia lineal y emite alerta', () => {
    const m = crearModeloPolinomio([1, -4, 5, -2]) // (x − 1)²(x − 2)
    const r = newton({ f: m.f, df: m.df, x0: 0.5, tol: 1e-8, maxIter: 200 })
    const an = analizarConvergenciaNewton(r)
    expect(an.ordenEmpirico).not.toBeNull()
    expect(an.ordenEmpirico!).toBeLessThan(1.2)
    expect(an.alertas.join(' ')).toMatch(/raíz múltiple|lineal/i)
  })

  it('Newton con derivada inicial casi nula emite alerta de sensibilidad', () => {
    const r = newton({ f: base.f, df: base.df, x0: 0.577, tol: 1e-6, maxIter: 100 })
    const an = analizarConvergenciaNewton(r)
    expect(an.alertas.join(' ')).toMatch(/Sensibilidad inicial|f′\(x₀\)/i)
  })

  it('Secante en raíz simple estima orden superlineal cercano a φ ≈ 1.618', () => {
    const r = secante({ f: base.f, x0: 1, x1: 2, tol: 1e-8, maxIter: 100 })
    const an = analizarConvergenciaSecante(r)
    expect(an.ordenEmpirico).not.toBeNull()
    expect(an.ordenEmpirico!).toBeGreaterThan(1.35)
    expect(an.ordenEmpirico!).toBeLessThan(1.9)
    expect(an.ordenTeorico).toBeCloseTo((1 + Math.sqrt(5)) / 2, 6)
  })

  it('Secante horizontal detecta la pendiente nula', () => {
    const r = secante({ f: (x) => x * x - 1, x0: -2, x1: 2, tol: 1e-6, maxIter: 50 })
    const an = analizarConvergenciaSecante(r)
    expect(an.alertas.join(' ')).toMatch(/horizontal|pendiente/i)
  })

  it('Bisección estima orden lineal p = 1 y razón 0.5', () => {
    const r = biseccion({ f: base.f, a: 1, b: 2, tol: 1e-6, maxIter: 100 })
    const an = analizarConvergenciaBiseccion(r)
    expect(an.ordenEmpirico!).toBeCloseTo(1, 6)
    expect(an.razonLineal!).toBeCloseTo(0.5, 6)
  })

  it('Falsa posición detecta estancamiento unilateral en x⁶ − 1', () => {
    const m = crearModeloPolinomio([1, 0, 0, 0, 0, 0, -1])
    const r = falsaPosicion({ f: m.f, a: 0, b: 1.5, tol: 1e-6, maxIter: 200 })
    const an = analizarConvergenciaFalsa(r)
    expect(an.alertas.join(' ')).toMatch(/Estancamiento unilateral/)
  })
})
