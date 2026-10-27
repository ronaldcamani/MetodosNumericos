import { biseccion, crearModelo, cotaCauchy, crearModeloPolinomio, deflacionar, falsaPosicion, horner, newton, polinomioTexto, raicesPolinomio, secante, validarPolinomio } from '.'
import referencia from './referencia.json'

const base = crearModelo('calibracion', 2)
const TOL = 1e-6
const RAIZ = 1.5213797068

describe('Falsa posición', () => {
  const r = falsaPosicion({ f: base.f, a: 1, b: 2, tol: TOL, maxIter: 100 })
  it('primer corte exacto 4/3 (recta entre (1, −2) y (2, 4))', () => {
    expect(r.pasos[0].c).toBeCloseTo(4 / 3, 14)
  })
  it('converge a la raíz con menos iteraciones que la bisección', () => {
    expect(r.estado).toBe('convergio')
    expect(r.resultado!.raiz).toBeCloseTo(RAIZ, 5)
    expect(r.resultado!.iteraciones).toBeLessThan(20)
  })
  it('un extremo se queda fijo: el intervalo no se reduce a cero', () => {
    expect(r.pasos[r.pasos.length - 1].ancho).toBeGreaterThan(0.1)
  })
  it('sin cambio de signo no calcula', () => {
    const f = falsaPosicion({ f: base.f, a: 2, b: 3, tol: TOL, maxIter: 100 })
    expect(f.estado).toBe('sin_cambio_signo')
    expect(f.resultado).toBeNull()
  })
  it('agotar iteraciones no es convergencia', () => {
    expect(falsaPosicion({ f: base.f, a: 1, b: 2, tol: TOL, maxIter: 3 }).estado).toBe('max_iter')
  })
  it('un polo con cambio de signo (1/x en [−1, 2]) no se declara raíz', () => {
    const p = falsaPosicion({ f: (x) => 1 / x, a: -1, b: 2, tol: TOL, maxIter: 100 })
    expect(p.estado).not.toBe('convergio')
  })
  it('un extremo que es raíz se devuelve sin dividir entre cero', () => {
    const e = falsaPosicion({ f: (x) => x * (x - 3), a: 0, b: 1, tol: TOL, maxIter: 50 })
    expect(Number.isNaN(e.pasos[0].c)).toBe(false)
  })
  it.each([
    ['a ≥ b', { a: 2, b: 1, tol: TOL, maxIter: 10 }],
    ['tol ≤ 0', { a: 1, b: 2, tol: 0, maxIter: 10 }],
    ['maxIter 0', { a: 1, b: 2, tol: TOL, maxIter: 0 }],
    ['NaN', { a: NaN, b: 2, tol: TOL, maxIter: 10 }],
  ])('entrada inválida: %s', (_n, e) => {
    expect(falsaPosicion({ f: base.f, ...e }).estado).toBe('invalido')
  })
})

describe('Secante', () => {
  const r = secante({ f: base.f, x0: 1, x1: 2, tol: TOL, maxIter: 100 })
  it('converge a 1.5213797068 sin usar derivada', () => {
    expect(r.estado).toBe('convergio')
    expect(r.resultado!.raiz).toBeCloseTo(RAIZ, 8)
  })
  it('no exige cambio de signo: parte de [2, 3] y converge', () => {
    const s = secante({ f: base.f, x0: 2, x1: 3, tol: TOL, maxIter: 100 })
    expect(s.estado).toBe('convergio')
  })
  it('pendiente nula: f(x₀) = f(x₁)', () => {
    const s = secante({ f: (x) => x * x - 1, x0: -2, x1: 2, tol: TOL, maxIter: 50 })
    expect(s.estado).toBe('derivada_nula')
    expect(s.resultado).toBeNull()
  })
  it('puntos iniciales iguales son inválidos', () => {
    expect(secante({ f: base.f, x0: 1, x1: 1, tol: TOL, maxIter: 10 }).estado).toBe('invalido')
  })
  it('sin raíz real (x² + 1) no se declara convergencia', () => {
    const s = secante({ f: (x) => x * x + 1, x0: 0.5, x1: 1, tol: TOL, maxIter: 100 })
    expect(s.estado).not.toBe('convergio')
  })
  it('residuo y cambio se reportan por separado', () => {
    expect(r.pasos[0].cambio).not.toBe(r.pasos[0].residuo)
  })
})

describe('Modelo con polo: un cambio de signo no garantiza una raíz', () => {
  const polo = crearModelo('polo', 0)
  it('bisección en [0, 3] converge a x = 1 pero no es raíz: no_converge', () => {
    const r = biseccion({ f: polo.f, a: 0, b: 3, tol: TOL, maxIter: 100 })
    expect(r.estado).toBe('no_converge')
    expect(r.resultado).toBeNull()
  })
  it('falsa posición también lo detecta o no declara convergencia', () => {
    expect(falsaPosicion({ f: polo.f, a: 0, b: 3, tol: TOL, maxIter: 100 }).estado).not.toBe('convergio')
  })
  it('con objetivo 1/2 sí hay raíz (x = 3) y se verifica', () => {
    const r = biseccion({ f: crearModelo('polo', 0.5).f, a: 2.5, b: 4, tol: TOL, maxIter: 100 })
    expect(r.estado).toBe('convergio')
    expect(r.resultado!.raiz).toBeCloseTo(3, 5)
  })
})

describe('Falsa posición se estanca con x⁶ − 1 en [0, 1.5]', () => {
  const m = crearModeloPolinomio([1, 0, 0, 0, 0, 0, -1])
  it('necesita más iteraciones que la bisección (43 frente a 21)', () => {
    const fp = falsaPosicion({ f: m.f, a: 0, b: 1.5, tol: TOL, maxIter: 200 }).resultado!.iteraciones
    const bi = biseccion({ f: m.f, a: 0, b: 1.5, tol: TOL, maxIter: 200 }).resultado!.iteraciones
    expect([fp, bi]).toEqual([43, 21])
  })
})

describe('Newton en una raíz doble (x−1)²(x−2) converge de forma lineal', () => {
  const m = crearModeloPolinomio([1, -4, 5, -2])
  it('unas treinta iteraciones hacia la raíz doble frente a 8 hacia la simple', () => {
    // el conteo exacto depende del redondeo cerca de p′ ≈ 0, por eso se prueba un rango
    const doble = newton({ f: m.f, df: m.df, x0: 0.5, tol: 1e-10, maxIter: 200 }).resultado!.iteraciones
    expect(doble).toBeGreaterThanOrEqual(20)
    expect(doble).toBeLessThanOrEqual(35)
    expect(newton({ f: m.f, df: m.df, x0: 3, tol: 1e-10, maxIter: 200 }).resultado!.iteraciones).toBe(8)
  })
})

describe('Ejemplos a mano de los ejercicios', () => {
  it('falsa posición en [1, 2]: c₁ = 4/3, f(c₁) = −26/27 y c₂ = 98/67', () => {
    const r = falsaPosicion({ f: base.f, a: 1, b: 2, tol: TOL, maxIter: 5 })
    expect(r.pasos[0].c).toBeCloseTo(4 / 3, 14)
    expect(r.pasos[0].fc).toBeCloseTo(-26 / 27, 14)
    expect(r.pasos[1].c).toBeCloseTo(98 / 67, 14)
  })
  it('secante en x² − 2 con x₀ = 1, x₁ = 2: 4/3, 7/5, 58/41', () => {
    const r = secante({ f: (x) => x * x - 2, x0: 1, x1: 2, tol: 1e-12, maxIter: 5 })
    expect(r.pasos.map((p) => p.siguiente).slice(0, 3)).toEqual([expect.closeTo(4 / 3, 14), expect.closeTo(1.4, 14), expect.closeTo(58 / 41, 14)])
  })
  it('Horner de 2x³ − 6x² + 2x − 1 en 3: p = 5, p′ = 20, cociente 2x² + 0x + 2', () => {
    const h = horner([2, -6, 2, -1], 3)
    expect([h.valor, h.derivada, h.b.slice(0, -1)]).toEqual([5, 20, [2, 0, 2]])
  })
})

describe('Comparación de órdenes de convergencia', () => {
  const nb = biseccion({ f: base.f, a: 1, b: 2, tol: TOL, maxIter: 100 }).resultado!.iteraciones
  const nf = falsaPosicion({ f: base.f, a: 1, b: 2, tol: TOL, maxIter: 100 }).resultado!.iteraciones
  const ns = secante({ f: base.f, x0: 1, x1: 2, tol: TOL, maxIter: 100 }).resultado!.iteraciones
  const nn = newton({ f: base.f, df: base.df, x0: 1.5, tol: TOL, maxIter: 100 }).resultado!.iteraciones
  it('bisección 20 > falsa posición > secante > Newton desde 1.5', () => {
    expect([nb, nf > ns, ns > nn]).toEqual([20, true, true])
  })
})

describe('Horner', () => {
  const p = [1, 0, -1, -2]
  it('p(2) = 4 y p′(2) = 11 con las filas de la división sintética', () => {
    const h = horner(p, 2)
    expect(h.valor).toBe(4)
    expect(h.derivada).toBe(11)
    expect(h.b).toEqual([1, 2, 3, 4])
    expect(h.c).toEqual([1, 4, 11])
  })
  it('deflación por una raíz exacta deja resto 0', () => {
    const { cociente, resto } = deflacionar([1, -6, 11, -6], 1)
    expect(resto).toBe(0)
    expect(cociente).toEqual([1, -5, 6])
  })
  it('texto legible', () => {
    expect(polinomioTexto(p)).toBe('x³ − x − 2')
    expect(polinomioTexto([2, -3, -5])).toBe('2x² − 3x − 5')
    expect(polinomioTexto([-1, 0, 1])).toBe('−x² + 1')
  })
  it('cota de Cauchy contiene a todas las raíces', () => {
    expect(cotaCauchy([1, -6, 11, -6])).toBe(12)
  })
  it('el modelo polinómico funciona con Newton y bisección', () => {
    const m = crearModeloPolinomio(p)
    expect(newton({ f: m.f, df: m.df, x0: 1.5, tol: TOL, maxIter: 50 }).resultado!.raiz).toBeCloseTo(RAIZ, 9)
    expect(biseccion({ f: m.f, a: 1, b: 2, tol: TOL, maxIter: 50 }).estado).toBe('convergio')
  })
  it.each([
    ['1 coeficiente', [5]],
    ['grado 7', [1, 0, 0, 0, 0, 0, 0, 1]],
    ['principal 0', [0, 1, 2]],
    ['NaN', [1, NaN, 2]],
    ['enorme', [1, 1e7, 2]],
  ])('validación: %s', (_n, c) => {
    expect(validarPolinomio(c)).not.toBeNull()
  })
})

describe('Raíces de polinomios', () => {
  const ordenar = (zs: { re: number; im: number }[]) => [...zs].sort((p, q) => p.re - q.re || p.im - q.im)
  it('x³ − 6x² + 11x − 6 → 1, 2, 3 (todas reales)', () => {
    const r = raicesPolinomio({ coef: [1, -6, 11, -6], tol: 1e-10, maxIter: 100 })
    expect(r.estado).toBe('ok')
    expect(r.resultado!.raices.map((z) => z.re)).toEqual(expect.arrayContaining([expect.closeTo(1, 8), expect.closeTo(2, 8), expect.closeTo(3, 8)]))
    expect(r.resultado!.raices.every((z) => z.im === 0 && z.verificada)).toBe(true)
  })
  it('x³ − x − 2: una raíz real y un par complejo conjugado', () => {
    const r = raicesPolinomio({ coef: [1, 0, -1, -2], tol: 1e-10, maxIter: 100 })
    const z = ordenar(r.resultado!.raices)
    expect(z[2].re).toBeCloseTo(1.5213797068, 9)
    expect(z[0].im).toBeCloseTo(-z[1].im, 12)
    expect(z[1].im).toBeCloseTo(0.8578736266, 9)
  })
  it('muestra el cociente de cada deflación', () => {
    const r = raicesPolinomio({ coef: [1, -6, 11, -6], tol: 1e-10, maxIter: 100 })
    expect(r.pasos).toHaveLength(1)
    expect(r.pasos[0].cociente).toHaveLength(3)
    expect(Math.abs(r.pasos[0].resto)).toBeLessThan(1e-8)
  })
  it('sin raíces reales (x⁴ + 4): usa Durand–Kerner y avisa', () => {
    const r = raicesPolinomio({ coef: [1, 0, 0, 0, 4], tol: 1e-10, maxIter: 100 })
    expect(r.estado).toBe('ok')
    expect(r.resultado!.advertencias.join(' ')).toMatch(/Durand/)
    r.resultado!.raices.forEach((z) => {
      expect(Math.abs(z.re)).toBeCloseTo(1, 8)
      expect(Math.abs(z.im)).toBeCloseTo(1, 8)
    })
  })
  it('grado 2 y 1 se resuelven sin iterar', () => {
    const q = raicesPolinomio({ coef: [2, -3, -5], tol: 1e-10, maxIter: 100 })
    expect(q.resultado!.raices.map((z) => z.re)).toEqual([-1, 2.5])
    expect(raicesPolinomio({ coef: [3, -6], tol: 1e-10, maxIter: 100 }).resultado!.raices[0].re).toBe(2)
  })
  it('raíz doble (x−1)²(x−2) se encuentra con sus dos copias', () => {
    const r = raicesPolinomio({ coef: [1, -4, 5, -2], tol: 1e-10, maxIter: 1000 })
    expect(r.estado).toBe('ok')
    const re = r.resultado!.raices.map((z) => z.re).sort()
    expect(re[0]).toBeCloseTo(1, 4)
    expect(re[1]).toBeCloseTo(1, 4)
    expect(re[2]).toBeCloseTo(2, 8)
  })
  it('polinomio inválido: se rechaza', () => {
    expect(raicesPolinomio({ coef: [0, 1, 2], tol: 1e-8, maxIter: 50 }).estado).toBe('invalido')
  })
  it('tolerancia o iteraciones inválidas', () => {
    expect(raicesPolinomio({ coef: [1, -1], tol: 0, maxIter: 50 }).estado).toBe('invalido')
    expect(raicesPolinomio({ coef: [1, -1], tol: 1e-8, maxIter: 0 }).estado).toBe('invalido')
  })
})

describe('Contraste con la referencia independiente', () => {
  it('falsa posición: iteraciones, raíz y primer corte', () => {
    const r = falsaPosicion({ f: base.f, a: 1, b: 2, tol: TOL, maxIter: 100 })
    expect(r.resultado!.iteraciones).toBe(referencia.falsa_posicion.iteraciones)
    expect(r.resultado!.raiz).toBeCloseTo(referencia.falsa_posicion.raiz, 10)
    expect(r.pasos[0].c).toBeCloseTo(referencia.falsa_posicion.primer_c, 14)
  })
  it('secante: iteraciones y raíz', () => {
    const r = secante({ f: base.f, x0: 1, x1: 2, tol: TOL, maxIter: 100 })
    expect(r.resultado!.iteraciones).toBe(referencia.secante.iteraciones)
    expect(r.resultado!.raiz).toBeCloseTo(referencia.secante.raiz, 10)
  })
  for (const [nombre, p] of Object.entries(referencia.polinomios)) {
    it(`polinomio «${nombre}»: Horner y raíces coinciden con numpy`, () => {
      const h = horner(p.coef, 2)
      expect(h.valor).toBeCloseTo(p.valor_en_2, 9)
      if (p.coef.length > 2) expect(h.derivada).toBeCloseTo(p.derivada_en_2, 9)
      const r = raicesPolinomio({ coef: p.coef, tol: 1e-12, maxIter: 1000 })
      expect(r.estado).toBe('ok')
      const mias = [...r.resultado!.raices].sort((a, b) => a.re - b.re || a.im - b.im)
      const tolRaiz = nombre === 'doble' ? 1e-4 : 1e-7
      mias.forEach((z, i) => {
        expect(z.re).toBeCloseTo(p.raices[i][0], -Math.log10(tolRaiz) - 1)
        expect(Math.abs(z.im)).toBeCloseTo(Math.abs(p.raices[i][1]), -Math.log10(tolRaiz) - 1)
      })
    })
  }
})
