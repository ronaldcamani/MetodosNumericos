import { biseccion, crearModelo, newton } from '.'
import referencia from './referencia.json'

const base = crearModelo('calibracion', 2)
const TOL = 1e-6
const RAIZ = 1.5213797068

describe('Bisección — valores de la guía', () => {
  const r = biseccion({ f: base.f, a: 1, b: 2, tol: TOL, maxIter: 100 })
  it('primer punto medio 1.5, f = −0.125, nuevo intervalo [1.5, 2]', () => {
    expect(r.pasos[0].medio).toBe(1.5)
    expect(r.pasos[0].fMedio).toBe(-0.125)
    expect(r.pasos[1].a).toBe(1.5)
    expect(r.pasos[1].b).toBe(2)
  })
  it('converge a la raíz dentro de la cota declarada', () => {
    expect(r.estado).toBe('convergio')
    expect(r.resultado!.raiz).toBeCloseTo(RAIZ, 5)
    expect(Math.abs(r.resultado!.raiz - RAIZ)).toBeLessThanOrEqual(r.resultado!.cotaError)
  })
  it('usa 20 iteraciones: ceil(log2((b−a)/tol))', () => {
    expect(r.resultado!.iteraciones).toBe(20)
  })
  it('la cota se reduce a la mitad en cada iteración', () => {
    r.pasos.slice(1).forEach((p, i) => expect(p.cota).toBeCloseTo(r.pasos[i].cota / 2, 15))
  })
})

describe('Newton — valores de la guía', () => {
  const r = newton({ f: base.f, df: base.df, x0: 1.5, tol: TOL, maxIter: 100 })
  it('primer paso 1.5217391304 (= 35/23)', () => {
    expect(r.pasos[0].siguiente).toBeCloseTo(1.5217391304, 10)
    expect(r.pasos[0].fx).toBe(-0.125)
  })
  it('converge a la raíz en pocas iteraciones', () => {
    expect(r.estado).toBe('convergio')
    expect(r.resultado!.raiz).toBeCloseTo(RAIZ, 9)
    expect(r.resultado!.iteraciones).toBeLessThanOrEqual(4)
  })
  it('residuo y cambio son magnitudes distintas', () => {
    const p = r.pasos[0]
    expect(p.residuo).not.toBe(p.cambio)
    expect(p.cambio).toBeCloseTo(Math.abs(p.siguiente - p.x), 15)
  })
})

describe('Fallos controlados', () => {
  it('bisección en [2, 3]: sin cambio de signo y sin raíz', () => {
    const r = biseccion({ f: base.f, a: 2, b: 3, tol: TOL, maxIter: 100 })
    expect(r.estado).toBe('sin_cambio_signo')
    expect(r.resultado).toBeNull()
  })
  it('Newton con x³ − 1 y x0 = 0: derivada nula', () => {
    const m = crearModelo('cubo', 1)
    const r = newton({ f: m.f, df: m.df, x0: 0, tol: TOL, maxIter: 100 })
    expect(r.estado).toBe('derivada_nula')
    expect(r.resultado).toBeNull()
  })
  it('agotar el límite NO es convergencia', () => {
    const r = biseccion({ f: base.f, a: 1, b: 2, tol: TOL, maxIter: 5 })
    expect(r.estado).toBe('max_iter')
    expect(r.resultado).toBeNull()
    expect(r.pasos).toHaveLength(5)
    const n = newton({ f: base.f, df: base.df, x0: 1.5, tol: 1e-15, maxIter: 1 })
    expect(n.estado).toBe('max_iter')
  })
  it('valores no finitos en la función', () => {
    expect(biseccion({ f: () => NaN, a: 0, b: 1, tol: TOL, maxIter: 10 }).estado).toBe('no_finito')
    expect(newton({ f: () => Infinity, df: () => 1, x0: 0, tol: TOL, maxIter: 10 }).estado).toBe('no_finito')
  })
  it('Newton divergente por overflow se detecta', () => {
    const r = newton({ f: (x) => Math.cbrt(x), df: (x) => 1 / (3 * Math.cbrt(x) ** 2), x0: 1, tol: TOL, maxIter: 1000 })
    expect(['no_finito', 'max_iter', 'derivada_nula']).toContain(r.estado)
    expect(r.estado).not.toBe('convergio')
  })
})

describe('Validación de entradas', () => {
  it.each([
    ['a ≥ b', { a: 2, b: 1, tol: TOL, maxIter: 10 }],
    ['tolerancia cero', { a: 1, b: 2, tol: 0, maxIter: 10 }],
    ['tolerancia negativa', { a: 1, b: 2, tol: -1, maxIter: 10 }],
    ['NaN', { a: NaN, b: 2, tol: TOL, maxIter: 10 }],
    ['maxIter decimal', { a: 1, b: 2, tol: TOL, maxIter: 2.5 }],
    ['maxIter cero', { a: 1, b: 2, tol: TOL, maxIter: 0 }],
    ['fuera de rango', { a: -1e9, b: 2, tol: TOL, maxIter: 10 }],
  ])('bisección rechaza %s', (_n, e) => {
    const r = biseccion({ f: base.f, ...e })
    expect(r.estado).toBe('invalido')
    expect(r.pasos).toHaveLength(0)
  })
  it('Newton rechaza x0 no finito y tolerancia inválida', () => {
    expect(newton({ f: base.f, df: base.df, x0: Infinity, tol: TOL, maxIter: 10 }).estado).toBe('invalido')
    expect(newton({ f: base.f, df: base.df, x0: 1, tol: 0, maxIter: 10 }).estado).toBe('invalido')
  })
})

describe('Casos límite', () => {
  it('raíz exacta en el punto medio detiene la bisección', () => {
    const r = biseccion({ f: (x) => x - 1.5, a: 1, b: 2, tol: TOL, maxIter: 100 })
    expect(r.estado).toBe('convergio')
    expect(r.resultado!.iteraciones).toBe(1)
    expect(r.resultado!.raiz).toBe(1.5)
  })
  it('Newton cuando x0 ya es la raíz', () => {
    const r = newton({ f: (x) => x - 3, df: () => 1, x0: 3, tol: TOL, maxIter: 10 })
    expect(r.estado).toBe('convergio')
    expect(r.resultado!.iteraciones).toBe(1)
  })
  it('modelo con objetivo negativo muestra el signo correcto', () => {
    expect(crearModelo('calibracion', -1).expresion).toBe('x³ − x + 1')
    expect(crearModelo('calibracion', 2).expresion).toBe('x³ − x − 2')
  })
})

describe('Contraste con la referencia independiente (Python: numpy/scipy)', () => {
  it.each(referencia.casos)('modelo $modelo, objetivo $objetivo', (c) => {
    const m = crearModelo(c.modelo as 'calibracion' | 'cubo', c.objetivo)
    const [a, b] = c.intervalo
    const bis = biseccion({ f: m.f, a, b, tol: TOL, maxIter: 100 })
    expect(bis.estado).toBe('convergio')
    expect(Math.abs(bis.resultado!.raiz - c.raiz)).toBeLessThanOrEqual(TOL)
    // La referencia da el máximo teórico; solo un acierto exacto de f(medio) = 0 permite parar antes.
    const maxTeorico = c['iter_biseccion_tol1e-6']
    expect(bis.resultado!.iteraciones).toBeLessThanOrEqual(maxTeorico)
    if (bis.resultado!.residuo !== 0) expect(bis.resultado!.iteraciones).toBe(maxTeorico)
    const x0 = (a + b) / 2 + 0.25
    const nw = newton({ f: m.f, df: m.df, x0, tol: TOL, maxIter: 100 })
    expect(nw.estado).toBe('convergio')
    expect(Math.abs(nw.resultado!.raiz - c.raiz)).toBeLessThan(1e-9)
  })
  it('primer paso de Newton coincide con la fracción exacta 35/23', () => {
    const r = newton({ f: base.f, df: base.df, x0: 1.5, tol: TOL, maxIter: 100 })
    expect(r.pasos[0].siguiente).toBeCloseTo(referencia.newton_primer_paso, 14)
    expect(referencia.newton_primer_paso_fraccion).toBe('35/23')
  })
})
