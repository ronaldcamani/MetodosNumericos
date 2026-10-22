import { evaluarLagrange, lagrange, regresionLineal, abscisaRepetida } from '.'
import referencia from './referencia.json'

const x = [0, 1, 2, 3]
const y = [1, 2, 2, 4]

describe('Lagrange — caso base de la guía', () => {
  const r = lagrange({ x, y, consulta: 1.5 })
  it('P(1.5) = 1.9375 con los cuatro nodos', () => {
    expect(r.estado).toBe('ok')
    expect(r.resultado!.valor).toBeCloseTo(1.9375, 12)
  })
  it('muestra la contribución yᵢ·Lᵢ de cada nodo y suman el valor', () => {
    expect(r.pasos).toHaveLength(4)
    expect(r.pasos.map((p) => p.base)).toEqual([-0.0625, 0.5625, 0.5625, -0.0625])
    expect(r.pasos.reduce((s, p) => s + p.contribucion, 0)).toBeCloseTo(1.9375, 12)
  })
  it('las bases suman 1 y la curva pasa por cada nodo', () => {
    expect(r.pasos.reduce((s, p) => s + p.base, 0)).toBeCloseTo(1, 12)
    x.forEach((xi, i) => expect(evaluarLagrange({ x, y }, xi)).toBeCloseTo(y[i], 12))
  })
  it('grado = nodos − 1 y sin advertencias dentro del intervalo', () => {
    expect(r.resultado!.grado).toBe(3)
    expect(r.resultado!.advertencias).toEqual([])
  })
})

describe('Lagrange — avisos', () => {
  it('consulta fuera del intervalo avisa de extrapolación pero calcula', () => {
    const r = lagrange({ x, y, consulta: 5 })
    expect(r.estado).toBe('ok')
    expect(r.resultado!.fueraDeIntervalo).toBe(true)
    expect(r.resultado!.advertencias[0]).toMatch(/extrapolación/)
  })
  it('los extremos del intervalo no son extrapolación', () => {
    expect(lagrange({ x, y, consulta: 3 }).resultado!.fueraDeIntervalo).toBe(false)
  })
  it('5 o más nodos avisan del riesgo de oscilación', () => {
    const r = lagrange({ x: [0, 1, 2, 3, 4], y: [1, 2, 2, 4, 3], consulta: 2 })
    expect(r.resultado!.advertencias.join(' ')).toMatch(/oscil/)
  })
  it('2 nodos: es la recta que une los puntos', () => {
    expect(lagrange({ x: [1, 3], y: [2, 6], consulta: 2 }).resultado!.valor).toBeCloseTo(4, 12)
  })
})

describe('Lagrange — fallos', () => {
  it('abscisa 1 repetida con dos valores de y: se rechaza y no se elimina ningún nodo', () => {
    const r = lagrange({ x: [0, 1, 1, 3], y: [1, 2, 5, 4], consulta: 1.5 })
    expect(r.estado).toBe('invalido')
    expect(r.resultado).toBeNull()
    expect(r.mensaje).toMatch(/x = 1/)
    expect(r.mensaje).toMatch(/no se elimina/)
  })
  it('abscisas que difieren por ruido de redondeo también se consideran repetidas', () => {
    expect(abscisaRepetida([1, 1 + 1e-15, 3])).toBe(1)
  })
  it.each([
    ['1 nodo', { x: [1], y: [1], consulta: 1 }],
    ['7 nodos', { x: [0, 1, 2, 3, 4, 5, 6], y: [0, 0, 0, 0, 0, 0, 0], consulta: 1 }],
    ['tamaños distintos', { x: [0, 1, 2], y: [0, 1], consulta: 1 }],
    ['NaN en y', { x: [0, 1], y: [0, NaN], consulta: 1 }],
    ['Infinity en x', { x: [0, Infinity], y: [0, 1], consulta: 1 }],
    ['valor enorme', { x: [0, 1e7], y: [0, 1], consulta: 1 }],
    ['consulta NaN', { x: [0, 1], y: [0, 1], consulta: NaN }],
  ])('entrada inválida: %s', (_n, entrada) => {
    const r = lagrange(entrada)
    expect(r.estado).toBe('invalido')
    expect(r.resultado).toBeNull()
  })
})

describe('Regresión lineal — caso base de la guía', () => {
  const r = regresionLineal({ x, y, consulta: 1.5 })
  it('recta y = 0.9 + 0.9x', () => {
    expect(r.estado).toBe('ok')
    expect(r.resultado!.pendiente).toBeCloseTo(0.9, 12)
    expect(r.resultado!.intercepto).toBeCloseTo(0.9, 12)
  })
  it('predice 2.25 en x = 1.5 y SSE = 0.70', () => {
    expect(r.resultado!.prediccion).toBeCloseTo(2.25, 12)
    expect(r.resultado!.sse).toBeCloseTo(0.7, 12)
  })
  it('residuos (0.1, 0.2, −0.7, 0.4) que suman 0', () => {
    const res = r.pasos.map((p) => p.residuo)
    ;[0.1, 0.2, -0.7, 0.4].forEach((v, i) => expect(res[i]).toBeCloseTo(v, 12))
    expect(res.reduce((s, v) => s + v, 0)).toBeCloseTo(0, 12)
  })
  it('la recta pasa por (x̄, ȳ)', () => {
    const { intercepto, pendiente, xMedia, yMedia } = r.resultado!
    expect(intercepto + pendiente * xMedia).toBeCloseTo(yMedia, 12)
  })
  it('R² = 1 − SSE/SST', () => {
    expect(r.resultado!.r2).toBeCloseTo(1 - 0.7 / 4.75, 12)
  })
})

describe('Regresión lineal — fallos y avisos', () => {
  it('todas las x iguales: singular, sin recta', () => {
    const r = regresionLineal({ x: [2, 2, 2, 2], y: [1, 2, 3, 4], consulta: 2 })
    expect(r.estado).toBe('singular')
    expect(r.resultado).toBeNull()
    expect(r.mensaje).toMatch(/variación en x/)
  })
  it('x repetidas con variación en otras: sí se ajusta (réplicas)', () => {
    const r = regresionLineal({ x: [0, 0, 1, 1], y: [1, 3, 3, 5], consulta: 0.5 })
    expect(r.estado).toBe('ok')
    expect(r.resultado!.pendiente).toBeCloseTo(2, 12)
    expect(r.resultado!.intercepto).toBeCloseTo(1.0 + 1, 12)
  })
  it('consulta fuera del intervalo avisa', () => {
    expect(regresionLineal({ x, y, consulta: -2 }).resultado!.advertencias[0]).toMatch(/extrapolación/)
  })
  it('todas las y iguales: recta horizontal y R² no definido', () => {
    const r = regresionLineal({ x, y: [3, 3, 3, 3], consulta: 1 })
    expect(r.resultado!.pendiente).toBeCloseTo(0, 12)
    expect(r.resultado!.r2).toBeNull()
  })
  it('2 puntos: ajuste exacto con aviso', () => {
    const r = regresionLineal({ x: [1, 3], y: [2, 6], consulta: 2 })
    expect(r.resultado!.sse).toBeCloseTo(0, 12)
    expect(r.resultado!.advertencias.join(' ')).toMatch(/2 puntos/)
  })
  it.each([
    ['1 punto', { x: [1], y: [1], consulta: 1 }],
    ['NaN', { x: [0, 1], y: [NaN, 1], consulta: 1 }],
    ['consulta no finita', { x: [0, 1], y: [0, 1], consulta: Infinity }],
  ])('entrada inválida: %s', (_n, entrada) => {
    expect(regresionLineal(entrada).estado).toBe('invalido')
  })
})

describe('Diferencia entre interpolar y ajustar', () => {
  it('con los datos de la guía no coinciden: 1.9375 frente a 2.25', () => {
    const l = lagrange({ x, y, consulta: 1.5 }).resultado!.valor
    const r = regresionLineal({ x, y, consulta: 1.5 }).resultado!.prediccion
    expect(l).not.toBeCloseTo(r, 2)
  })
  it('Lagrange tiene residuo 0 en los nodos; la recta no', () => {
    const reg = regresionLineal({ x, y, consulta: 0 })
    expect(reg.resultado!.sse).toBeGreaterThan(0)
    x.forEach((xi, i) => expect(Math.abs(evaluarLagrange({ x, y }, xi) - y[i])).toBeLessThan(1e-12))
  })
  it('Runge: con 6 nodos el polinomio toma un valor negativo donde la función es positiva', () => {
    const c = referencia.casos.runge
    expect(lagrange({ x: c.x, y: c.y, consulta: 0.8 }).resultado!.valor).toBeLessThan(0)
  })
})

describe('Contraste con la referencia independiente (numpy)', () => {
  for (const [nombre, c] of Object.entries(referencia.casos)) {
    it(`caso «${nombre}»`, () => {
      const l = lagrange({ x: c.x, y: c.y, consulta: c.xq })
      expect(l.resultado!.valor).toBeCloseTo(c.lagrange.valor, 9)
      l.pasos.forEach((p, i) => expect(p.base).toBeCloseTo(c.lagrange.bases[i], 10))
      const r = regresionLineal({ x: c.x, y: c.y, consulta: c.xq }).resultado!
      expect(r.pendiente).toBeCloseTo(c.regresion.pendiente, 10)
      expect(r.intercepto).toBeCloseTo(c.regresion.intercepto, 10)
      expect(r.sse).toBeCloseTo(c.regresion.sse, 10)
      expect(r.prediccion).toBeCloseTo(c.regresion.prediccion, 10)
      if (c.regresion.r2 !== null) expect(r.r2!).toBeCloseTo(c.regresion.r2, 10)
    })
  }
})
