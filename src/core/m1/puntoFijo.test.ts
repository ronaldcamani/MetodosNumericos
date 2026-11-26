import katex from 'katex'
import { describe, expect, it } from 'vitest'
import {
  analizarConvergenciaPuntoFijo,
  FICHAS_CONVERGENCIA,
  MODELOS_PUNTO_FIJO,
  puntoFijo,
} from '.'

describe('Iteración de Punto Fijo (Tema 04 — Cap. II)', () => {
  it('calibracion_cbrt g(x)=∛(x+2) converge de forma monótona a ~1.5213797 con |g′(r)| < 1', () => {
    const m = MODELOS_PUNTO_FIJO.calibracion_cbrt
    const res = puntoFijo({ g: m.g, dg: m.dg, x0: 1.5, tol: 1e-8, maxIter: 100 })
    expect(res.estado).toBe('convergio')
    expect(res.resultado).not.toBeNull()
    expect(res.resultado!.raiz).toBeCloseTo(1.5213797068, 7)
    expect(res.resultado!.diagnostico.cumpleCriterio).toBe(true)
    expect(res.resultado!.diagnostico.tipo).toBe('monotona')
    expect(res.resultado!.pendienteDg).toBeGreaterThan(0)
    expect(res.resultado!.pendienteDg).toBeLessThan(1)
  })

  it('coseno g(x)=cos(x) converge de forma oscilatoria al punto fijo de Dottie (~0.739085)', () => {
    const m = MODELOS_PUNTO_FIJO.coseno
    const res = puntoFijo({ g: m.g, dg: m.dg, x0: 0.5, tol: 1e-8, maxIter: 150 })
    expect(res.estado).toBe('convergio')
    expect(res.resultado!.raiz).toBeCloseTo(0.7390851332, 7)
    expect(res.resultado!.diagnostico.cumpleCriterio).toBe(true)
    expect(res.resultado!.diagnostico.tipo).toBe('oscilatoria')
    expect(res.resultado!.pendienteDg).toBeLessThan(0)
    expect(Math.abs(res.resultado!.pendienteDg)).toBeLessThan(1)
  })

  it('exponencial g(x)=e⁻ˣ converge de forma oscilatoria a ~0.567143', () => {
    const m = MODELOS_PUNTO_FIJO.exponencial
    const res = puntoFijo({ g: m.g, dg: m.dg, x0: 0.5, tol: 1e-8, maxIter: 150 })
    expect(res.estado).toBe('convergio')
    expect(res.resultado!.raiz).toBeCloseTo(0.5671432904, 7)
    expect(res.resultado!.diagnostico.tipo).toBe('oscilatoria')
  })

  it('despeje divergente g(x)=x³−2 falla con no_finito cuando |g′(x)| ≥ 1', () => {
    const m = MODELOS_PUNTO_FIJO.divergente
    const res = puntoFijo({ g: m.g, dg: m.dg, x0: 1.5, tol: 1e-6, maxIter: 50 })
    expect(res.estado).toBe('no_finito')
    expect(res.resultado).toBeNull()
    expect(res.mensaje).toMatch(/\|g′\(x\)\| < 1/)
  })

  it('rechaza entradas inválidas (NaN, tol < min, maxIter fuera de rango)', () => {
    const m = MODELOS_PUNTO_FIJO.calibracion_cbrt
    expect(puntoFijo({ g: m.g, dg: m.dg, x0: Number.NaN, tol: 1e-6, maxIter: 50 }).estado).toBe('invalido')
    expect(puntoFijo({ g: m.g, dg: m.dg, x0: 1.5, tol: 1e-20, maxIter: 50 }).estado).toBe('invalido')
    expect(puntoFijo({ g: m.g, dg: m.dg, x0: 1.5, tol: 1e-6, maxIter: 0 }).estado).toBe('invalido')
  })

  it('analizarConvergenciaPuntoFijo reporta orden lineal y alertas coherentes + KaTeX válido', () => {
    const m = MODELOS_PUNTO_FIJO.calibracion_cbrt
    const ok = analizarConvergenciaPuntoFijo(puntoFijo({ g: m.g, dg: m.dg, x0: 1.5, tol: 1e-8, maxIter: 100 }))
    expect(ok.ordenTeorico).toBe(1)
    expect(ok.clasificacion).toMatch(/Lineal/)
    expect(ok.alertas).toHaveLength(0)

    const div = MODELOS_PUNTO_FIJO.divergente
    const fail = analizarConvergenciaPuntoFijo(puntoFijo({ g: div.g, dg: div.dg, x0: 1.5, tol: 1e-6, maxIter: 50 }))
    expect(fail.alertas.length).toBeGreaterThan(0)

    const ficha = FICHAS_CONVERGENCIA.punto_fijo
    expect(() => katex.renderToString(ficha.formulaOrdenTex, { throwOnError: true })).not.toThrow()
    expect(() => katex.renderToString(ficha.condicionTex, { throwOnError: true })).not.toThrow()
  })
})
