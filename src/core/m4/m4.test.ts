import { derivacionCentral, evaluarTasa, integrarTasa, integralExacta, minimoTasa, pesos, reglaCompuesta, type EntradaIntegral } from '.'
import referencia from './referencia.json'

const tasa = { a: 1, b: 0, c: 1 }
const base = (n: number): EntradaIntegral => ({ tasa, inicio: 0, fin: 2, n })

describe('Caso base de la guía: r(t) = t² + 1 en [0, 2]', () => {
  it('integral exacta 14/3 MB', () => {
    expect(integralExacta(tasa, 0, 2)).toBeCloseTo(14 / 3, 12)
  })
  it('trapecio n = 4: 4.75 MB, error 1/12', () => {
    const r = integrarTasa('trapecio', base(4))
    expect(r.estado).toBe('ok')
    expect(r.resultado!.integral).toBeCloseTo(4.75, 12)
    expect(r.resultado!.errorAbs).toBeCloseTo(1 / 12, 12)
  })
  it('Simpson n = 4: 14/3 salvo redondeo', () => {
    const r = integrarTasa('simpson', base(4))
    expect(r.resultado!.integral).toBeCloseTo(14 / 3, 12)
    expect(r.resultado!.errorAbs).toBeLessThan(1e-12)
  })
  it('refinar: el error del trapecio con n = 2, 4, 8 es 1/3, 1/12, 1/48 (se divide entre 4)', () => {
    const e = [2, 4, 8].map((n) => integrarTasa('trapecio', base(n)).resultado!.errorAbs)
    ;[1 / 3, 1 / 12, 1 / 48].forEach((v, i) => expect(e[i]).toBeCloseTo(v, 12))
  })
  it('Simpson es exacto con n = 2, 4 y 8 solo porque el integrando es de grado ≤ 3', () => {
    ;[2, 4, 8].forEach((n) => expect(integrarTasa('simpson', base(n)).resultado!.errorAbs).toBeLessThan(1e-12))
  })
})

describe('Pesos, nodos y sumas parciales', () => {
  it('pesos del trapecio 1,2,…,2,1 y de Simpson 1,4,2,4,…,4,1', () => {
    expect(pesos('trapecio', 4)).toEqual([1, 2, 2, 2, 1])
    expect(pesos('simpson', 4)).toEqual([1, 4, 2, 4, 1])
    expect(pesos('simpson', 2)).toEqual([1, 4, 1])
  })
  it('trapecio n = 4: nodos 0, 0.5, 1, 1.5, 2 y tasas 1, 1.25, 2, 3.25, 5', () => {
    const r = integrarTasa('trapecio', base(4))
    expect(r.pasos.map((p) => p.t)).toEqual([0, 0.5, 1, 1.5, 2])
    expect(r.pasos.map((p) => p.r)).toEqual([1, 1.25, 2, 3.25, 5])
  })
  it('la última suma parcial es el resultado y las contribuciones suman lo mismo', () => {
    const r = integrarTasa('simpson', base(4))
    expect(r.pasos[4].sumaParcial).toBeCloseTo(r.resultado!.integral, 12)
    expect(r.pasos.reduce((s, p) => s + p.contribucion, 0)).toBeCloseTo(r.resultado!.integral, 12)
  })
  it('el último nodo es exactamente el extremo superior', () => {
    expect(integrarTasa('trapecio', { tasa, inicio: 0, fin: 0.3, n: 3 }).pasos[3].t).toBe(0.3)
  })
})

describe('Restricciones de n', () => {
  it('Simpson con n = 3 se rechaza y explica la paridad', () => {
    const r = integrarTasa('simpson', base(3))
    expect(r.estado).toBe('invalido')
    expect(r.resultado).toBeNull()
    expect(r.mensaje).toMatch(/n par/)
  })
  it('el trapecio sí admite n impar', () => {
    expect(integrarTasa('trapecio', base(3)).estado).toBe('ok')
  })
  it.each(['trapecio', 'simpson'] as const)('n = 0 se rechaza en %s', (m) => {
    const r = integrarTasa(m, base(0))
    expect(r.estado).toBe('invalido')
    expect(r.mensaje).toMatch(/entero positivo/)
  })
  it.each([
    ['n negativo', { ...base(4), n: -2 }],
    ['n fraccionario', { ...base(4), n: 2.5 }],
    ['n = NaN', { ...base(4), n: NaN }],
    ['n excesivo', { ...base(4), n: 1002 }],
    ['extremos invertidos', { ...base(4), inicio: 2, fin: 0 }],
    ['extremos iguales', { ...base(4), inicio: 1, fin: 1 }],
    ['coeficiente NaN', { ...base(4), tasa: { a: NaN, b: 0, c: 1 } }],
    ['extremo infinito', { ...base(4), fin: Infinity }],
    ['valor enorme', { ...base(4), tasa: { a: 1e7, b: 0, c: 1 } }],
  ])('entrada inválida: %s', (_n, e) => {
    expect(integrarTasa('trapecio', e).estado).toBe('invalido')
  })
})

describe('Tasa negativa', () => {
  const e: EntradaIntegral = { tasa: { a: 1, b: -3, c: 1 }, inicio: 0, fin: 3, n: 6 }
  it('avisa de que la interpretación física deja de valer, pero calcula', () => {
    const r = integrarTasa('trapecio', e)
    expect(r.estado).toBe('ok')
    expect(r.resultado!.advertencias[0]).toMatch(/negativa/)
  })
  it('el mínimo se encuentra en el vértice interior', () => {
    expect(minimoTasa(e.tasa, 0, 3)).toBeCloseTo(-1.25, 12)
  })
  it('una tasa positiva no genera aviso', () => {
    expect(integrarTasa('simpson', base(4)).resultado!.advertencias).toEqual([])
  })
})

describe('Simpson no es exacto en general', () => {
  const f = (t: number) => t ** 4
  it('∫₀¹ t⁴: Simpson n = 2 da 0.208333 (error 1/120) y n = 4 divide el error entre 16', () => {
    const s2 = reglaCompuesta('simpson', f, 0, 1, 2).integral
    const s4 = reglaCompuesta('simpson', f, 0, 1, 4).integral
    expect(s2 - 0.2).toBeCloseTo(1 / 120, 12)
    expect((s2 - 0.2) / (s4 - 0.2)).toBeCloseTo(16, 8)
  })
  it('el trapecio n = 2 da 0.28125', () => {
    expect(reglaCompuesta('trapecio', f, 0, 1, 2).integral).toBeCloseTo(0.28125, 12)
  })
})

describe('Derivación central', () => {
  const r = (t: number) => evaluarTasa(tasa, t)
  it('t = 1, h = 0.1: 2 MB/s² (exacta en cuadráticas)', () => {
    expect(derivacionCentral(r, 1, 0.1)).toBeCloseTo(2, 10)
  })
  it('con una función no cuadrática el error cae con h² (sin t³)', () => {
    const e = (h: number) => Math.abs(derivacionCentral(Math.sin, 1, h) - Math.cos(1))
    expect(e(0.1) / e(0.05)).toBeCloseTo(4, 1)
  })
  it('paso no positivo → NaN', () => {
    expect(derivacionCentral(r, 1, 0)).toBeNaN()
  })
})

describe('Contraste con la referencia independiente (numpy/scipy)', () => {
  for (const [nombre, c] of Object.entries(referencia.casos)) {
    it(`caso «${nombre}»`, () => {
      const e: EntradaIntegral = { tasa: { a: c.a, b: c.b, c: c.c }, inicio: c.alfa, fin: c.beta, n: c.n }
      expect(integralExacta(e.tasa, e.inicio, e.fin)).toBeCloseTo(c.exacta, 10)
      expect(integrarTasa('trapecio', e).resultado!.integral).toBeCloseTo(c.trapecio, 10)
      if (c.simpson !== null) expect(integrarTasa('simpson', e).resultado!.integral).toBeCloseTo(c.simpson, 10)
      expect(minimoTasa(e.tasa, e.inicio, e.fin)).toBeCloseTo(c.min_tasa, 6)
    })
  }
  it('cuártica: coincide con scipy', () => {
    for (const n of ['2', '4'] as const) {
      expect(reglaCompuesta('trapecio', (t) => t ** 4, 0, 1, Number(n)).integral).toBeCloseTo(referencia.cuartica[n].trapecio, 12)
      expect(reglaCompuesta('simpson', (t) => t ** 4, 0, 1, Number(n)).integral).toBeCloseTo(referencia.cuartica[n].simpson, 12)
    }
  })
})
