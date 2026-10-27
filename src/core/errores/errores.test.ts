import { cifrasCorrectas, cifrasSignificativas, epsilonMaquina, erroresAproximacion, operarConPrecision, serieExponencial, sumaConPrecision } from '.'
import referencia from './referencia.json'

describe('Redondeo y truncamiento a t cifras', () => {
  it('mitad hacia arriba sobre la cifra escrita: 1.005 a 3 cifras → 1.01', () => {
    expect(cifrasSignificativas(1.005, 3, 'redondeo')).toBe(1.01)
  })
  it('empates y signo: 2.5 → 3, −2.5 → −3; truncar 2.5 → 2', () => {
    expect(cifrasSignificativas(2.5, 1, 'redondeo')).toBe(3)
    expect(cifrasSignificativas(-2.5, 1, 'redondeo')).toBe(-3)
    expect(cifrasSignificativas(2.5, 1, 'truncamiento')).toBe(2)
  })
  it('el acarreo cambia el orden de magnitud: 9.99 a 2 cifras → 10', () => {
    expect(cifrasSignificativas(9.99, 2, 'redondeo')).toBe(10)
    expect(cifrasSignificativas(9.99, 2, 'truncamiento')).toBe(9.9)
  })
  it('números pequeños, grandes y con notación científica', () => {
    expect(cifrasSignificativas(0.000123456, 3, 'redondeo')).toBe(0.000123)
    expect(cifrasSignificativas(123456, 3, 'redondeo')).toBe(123000)
    expect(cifrasSignificativas(1.23456e25, 3, 'redondeo')).toBe(1.23e25)
  })
  it('0, no finitos y números con menos cifras que t se devuelven iguales', () => {
    expect(cifrasSignificativas(0, 3, 'redondeo')).toBe(0)
    expect(cifrasSignificativas(1.5, 5, 'redondeo')).toBe(1.5)
    expect(cifrasSignificativas(Infinity, 3, 'redondeo')).toBe(Infinity)
  })
  it('0.3 truncado a 1 cifra es 0.3 (no 0.2 por el error binario)', () => {
    expect(cifrasSignificativas(0.3, 1, 'truncamiento')).toBe(0.3)
  })
})

describe('Errores de una aproximación', () => {
  it('π ≈ 3.1416: E_abs ≈ 7.35e−6, 5 cifras correctas', () => {
    const r = erroresAproximacion({ verdadero: Math.PI, aproximado: 3.1416 })
    expect(r.resultado!.absoluto).toBeCloseTo(7.3464e-6, 9)
    expect(r.resultado!.relativo).toBeCloseTo(2.3384e-6, 9)
    expect(r.resultado!.porcentual).toBeCloseTo(2.3384e-4, 8)
    expect(r.resultado!.cifras).toBe(5)
  })
  it('valor verdadero 0: relativo no definido, con advertencia', () => {
    const r = erroresAproximacion({ verdadero: 0, aproximado: 0.001 })
    expect(r.resultado!.relativo).toBeNull()
    expect(r.resultado!.cifras).toBeNull()
    expect(r.resultado!.advertencias.join(' ')).toMatch(/no están definidos/)
  })
  it('aproximación exacta: cifras infinitas', () => {
    expect(erroresAproximacion({ verdadero: 1, aproximado: 1 }).resultado!.cifras).toBe(Infinity)
  })
  it('error absoluto igual con otra escala no implica el mismo error relativo', () => {
    const a = erroresAproximacion({ verdadero: 10, aproximado: 9 }).resultado!
    const b = erroresAproximacion({ verdadero: 1000, aproximado: 999 }).resultado!
    expect(a.absoluto).toBe(b.absoluto)
    expect(a.relativo!).toBeGreaterThan(b.relativo! * 50)
  })
  it.each([[NaN, 1], [1, Infinity], [1e13, 1]])('inválido: %s, %s', (v, a) => {
    expect(erroresAproximacion({ verdadero: v, aproximado: a }).estado).toBe('invalido')
  })
})

describe('Aritmética de t cifras', () => {
  it('resta de números casi iguales (cancelación): error relativo grande', () => {
    const r = operarConPrecision({ a: 0.12345, op: '−', b: 0.12341, t: 4, modo: 'redondeo' }).resultado!
    expect(r.aRed).toBe(0.1235)
    expect(r.bRed).toBe(0.1234)
    expect(r.calculado).toBeCloseTo(0.0001, 12)
    expect(r.exacto).toBeCloseTo(0.00004, 12)
    expect(r.relativo!).toBeCloseTo(1.5, 6)
  })
  it('truncar ambos operandos puede borrar la diferencia (resultado 0, error 100 %)', () => {
    const r = operarConPrecision({ a: 0.12345, op: '−', b: 0.12341, t: 4, modo: 'truncamiento' }).resultado!
    expect(r.calculado).toBe(0)
    expect(r.relativo).toBeCloseTo(1, 12)
  })
  it('suma, producto y cociente', () => {
    expect(operarConPrecision({ a: 1.5, op: '+', b: 2.25, t: 3, modo: 'redondeo' }).resultado!.calculado).toBe(3.75)
    expect(operarConPrecision({ a: 3.14159, op: '×', b: 2.71828, t: 4, modo: 'redondeo' }).resultado!.calculado).toBe(8.54)
    expect(operarConPrecision({ a: 1, op: '÷', b: 3, t: 4, modo: 'truncamiento' }).resultado!.calculado).toBe(0.3333)
  })
  it.each([
    ['t = 0', { a: 1, op: '+' as const, b: 1, t: 0, modo: 'redondeo' as const }],
    ['t no entero', { a: 1, op: '+' as const, b: 1, t: 2.5, modo: 'redondeo' as const }],
    ['t = 13', { a: 1, op: '+' as const, b: 1, t: 13, modo: 'redondeo' as const }],
    ['división entre 0', { a: 1, op: '÷' as const, b: 0, t: 4, modo: 'redondeo' as const }],
    ['NaN', { a: NaN, op: '+' as const, b: 1, t: 4, modo: 'redondeo' as const }],
  ])('inválido: %s', (_n, e) => {
    expect(operarConPrecision(e).estado).toBe('invalido')
  })
})

describe('Orden de la suma', () => {
  it('1000 + 0.4 + 0.4 en 4 cifras: 1000 en el orden dado y 1001 en orden creciente', () => {
    const r = sumaConPrecision({ valores: [1000, 0.4, 0.4], t: 4, modo: 'redondeo' }).resultado!
    expect(r.resultadoOrden).toBe(1000)
    expect(r.resultadoCreciente).toBe(1001)
    expect(r.exacta).toBeCloseTo(1000.8, 12)
    expect(r.errorCreciente).toBeLessThan(r.errorOrden)
  })
  it('muestra cada suma parcial redondeada', () => {
    const r = sumaConPrecision({ valores: [1000, 0.4, 0.4], t: 4, modo: 'redondeo' }).resultado!
    expect(r.orden.map((p) => p.parcial)).toEqual([1000, 1000, 1000])
    expect(r.ordenCreciente.map((p) => p.parcial)).toEqual([0.4, 0.8, 1001])
  })
  it.each([[[1]], [[1, 2, 3, 4, 5, 6, 7]], [[1, NaN]]])('lista inválida %j', (v) => {
    expect(sumaConPrecision({ valores: v, t: 4, modo: 'redondeo' }).estado).toBe('invalido')
  })
})

describe('Truncamiento de la serie de eˣ', () => {
  it('el error baja al aumentar los términos y no supera la cota de Lagrange', () => {
    const r = serieExponencial({ x: 1, terminos: 10 }).resultado!
    r.pasos.slice(1).forEach((p, i) => expect(p.error).toBeLessThan(r.pasos[i].error))
    r.pasos.forEach((p) => expect(p.error).toBeLessThanOrEqual(p.cota * (1 + 1e-12)))
  })
  it('con 5 términos S₅ = 2.708333… y error ≈ 0.0099', () => {
    const p = serieExponencial({ x: 1, terminos: 5 }).resultado!.pasos[4]
    expect(p.suma).toBeCloseTo(2.7083333333, 9)
    expect(p.error).toBeCloseTo(0.0099485, 6)
  })
  it.each([[Infinity, 5], [21, 5], [1, 0], [1, 31], [1, 2.5]])('inválido: x=%s, n=%s', (x, n) => {
    expect(serieExponencial({ x, terminos: n }).estado).toBe('invalido')
  })
  it('épsilon de máquina 2.22e−16', () => {
    expect(epsilonMaquina()).toBe(Number.EPSILON)
  })
})

describe('Contraste con la referencia independiente (decimal)', () => {
  referencia.redondeos.forEach((c) => {
    it(`redondeos: ${c.x} a ${c.t} cifras (${c.modo}) = ${c.valor}`, () => {
      expect(cifrasSignificativas(c.x, c.t, c.modo as 'redondeo')).toBe(c.valor)
    })
  })
  referencia.operaciones.forEach((c) => {
    it(`operaciones: ${c.a} ${c.op} ${c.b}, t=${c.t} (${c.modo})`, () => {
      const r = operarConPrecision({ a: c.a, op: c.op as '+', b: c.b, t: c.t, modo: c.modo as 'redondeo' }).resultado!
      expect(r.aRed).toBe(c.aRed)
      expect(r.bRed).toBe(c.bRed)
      expect(r.calculado).toBeCloseTo(c.calculado, 12)
      expect(r.exacto).toBeCloseTo(c.exacto, 12)
    })
  })
  referencia.sumas.forEach((c) => {
    it(`sumas ${JSON.stringify(c.valores)} t=${c.t}`, () => {
      const r = sumaConPrecision({ valores: c.valores, t: c.t, modo: c.modo as 'redondeo' }).resultado!
      expect(r.resultadoOrden).toBeCloseTo(c.orden, 12)
      expect(r.resultadoCreciente).toBeCloseTo(c.creciente, 12)
      expect(r.exacta).toBeCloseTo(c.exacta, 12)
    })
  })
  referencia.aproximaciones.forEach((c) => {
    it(`cifras correctas de ${c.aproximado} respecto de ${c.verdadero}`, () => {
      const abs = Math.abs(c.verdadero - c.aproximado)
      expect(cifrasCorrectas(c.verdadero, abs)).toBe(c.cifras === 'inf' ? Infinity : c.cifras)
    })
  })
  it('sumas parciales de la serie de e', () => {
    const r = serieExponencial({ x: referencia.serie_exp.x, terminos: 10 }).resultado!
    r.pasos.forEach((p, i) => expect(p.suma).toBeCloseTo(referencia.serie_exp.sumas[i], 12))
    expect(r.exacto).toBeCloseTo(referencia.serie_exp.exacto, 14)
  })
})
