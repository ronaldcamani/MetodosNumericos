import { CASO_ENFRIAMIENTO, advertenciasEDO, comportamientoEuler, derivada, exacta, factorEuler, factorRK4, integrarEnfriamiento, KH_LIMITE_RK4, limiteEuler, limiteRK4, validarEnfriamiento } from '.'
import referencia from './referencia.json'

const P = CASO_ENFRIAMIENTO

describe('Solución exacta y modelo', () => {
  it('T(t) = 20 + 60 e^(−0.5t): T(0) = 80 y T(0.5) ≈ 66.7280469843', () => {
    expect(exacta(P, 0)).toBe(80)
    expect(exacta(P, 0.5)).toBeCloseTo(66.7280469843, 9)
  })
  it('la derivada es −k (T − Tₐ): −30 en T = 80', () => {
    expect(derivada(P, 80)).toBe(-30)
  })
  it('a temperatura ambiente la derivada es 0', () => {
    expect(Math.abs(derivada(P, 20))).toBe(0)
  })
})

describe('Euler explícito — valores de la guía', () => {
  const r = integrarEnfriamiento('euler', P, 0.5)
  it('primer paso: T(0.5) = 65 °C con incremento −15', () => {
    expect(r.pasos[1].T).toBe(65)
    expect(r.pasos[1].incremento).toBe(-15)
  })
  it('error del primer paso frente a la exacta ≈ 1.728 °C', () => {
    expect(r.pasos[1].error).toBeCloseTo(1.7280469843, 9)
  })
  it('5 nodos hasta t = 2 y error máximo ≈ 3.088 en el último', () => {
    expect(r.pasos).toHaveLength(5)
    expect(r.resultado!.errorMaximo).toBeCloseTo(3.08839147, 7)
    expect(r.resultado!.errorFinal).toBeCloseTo(r.resultado!.errorMaximo, 12)
  })
  it('el factor por paso es 1 − k h = 0.75', () => {
    expect(r.resultado!.factor).toBe(0.75)
    r.pasos.slice(1).forEach((p, i) => expect(p.T - 20).toBeCloseTo((r.pasos[i].T - 20) * 0.75, 12))
  })
  it('con h = 0.25 el error máximo cae a la mitad (≈ 1.456)', () => {
    const fino = integrarEnfriamiento('euler', P, 0.25).resultado!.errorMaximo
    expect(fino).toBeCloseTo(1.45623152, 7)
    expect(r.resultado!.errorMaximo / fino).toBeCloseTo(2.12, 1)
  })
})

describe('Runge-Kutta 4 — valores de la guía', () => {
  const r = integrarEnfriamiento('rk4', P, 0.5)
  it('primer paso: T(0.5) = 66.728515625', () => {
    expect(r.pasos[1].T).toBeCloseTo(66.728515625, 12)
  })
  it('muestra las cuatro pendientes del primer paso: −30, −26.25, −26.71875, −23.3203125', () => {
    expect(r.pasos[1].k).toEqual([-30, -26.25, -26.71875, -23.3203125])
    expect(r.pasos[0].k).toBeUndefined()
  })
  it('error del primer paso ≈ 4.7·10⁻⁴ (el de Euler era 1.7)', () => {
    expect(r.pasos[1].error).toBeCloseTo(4.6864e-4, 7)
  })
  it('error máximo con h = 0.5: ≈ 8.85·10⁻⁴; con h = 0.25: ≈ 4.98·10⁻⁵ (razón ≈ 17.8, orden 4)', () => {
    const e1 = r.resultado!.errorMaximo
    const e2 = integrarEnfriamiento('rk4', P, 0.25).resultado!.errorMaximo
    expect(e1).toBeCloseTo(8.855e-4, 6)
    expect(e2).toBeCloseTo(4.9845e-5, 8)
    expect(e1 / e2).toBeGreaterThan(15)
  })
  it('es mucho más preciso que Euler con el mismo paso', () => {
    expect(integrarEnfriamiento('euler', P, 0.5).resultado!.errorMaximo / r.resultado!.errorMaximo).toBeGreaterThan(3000)
  })
})

describe('Último paso más corto', () => {
  it('h = 0.3 hasta t = 2: nodos 0, 0.3, …, 1.8 y 2.0, con el último paso de 0.2 registrado', () => {
    const r = integrarEnfriamiento('euler', P, 0.3)
    expect(r.pasos.map((p) => Number(p.t.toFixed(9)))).toEqual([0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2])
    expect(r.pasos[7].h).toBeCloseTo(0.2, 12)
    expect(r.pasos[7].corto).toBe(true)
    expect(r.pasos.slice(1, 7).every((p) => !p.corto)).toBe(true)
    expect(r.resultado!.ultimoPasoCorto).toBeCloseTo(0.2, 12)
    expect(r.resultado!.advertencias.join(' ')).toMatch(/último paso es más corto/)
  })
  it('si h divide el intervalo no hay paso corto', () => {
    expect(integrarEnfriamiento('rk4', P, 0.5).resultado!.ultimoPasoCorto).toBeNull()
  })
  it('h mayor que el horizonte: un único paso de longitud t_f', () => {
    const r = integrarEnfriamiento('euler', P, 5)
    expect(r.pasos).toHaveLength(2)
    expect(r.pasos[1].h).toBe(2)
  })
  it('el último nodo cae exactamente en t_f', () => {
    expect(integrarEnfriamiento('rk4', { ...P, tf: 1.7 }, 0.4).pasos.at(-1)!.t).toBe(1.7)
  })
})

describe('Estabilidad de Euler en este modelo', () => {
  it('la condición es 0 < h < 2/k = 4 para k = 0.5', () => {
    expect(limiteEuler(0.5)).toBe(4)
  })
  it('factor 1 − k h: 0.75, 0.5, 0, −0.5, −1, −1.5 para h = 0.5, 1, 2, 3, 4, 5', () => {
    expect([0.5, 1, 2, 3, 4, 5].map((h) => factorEuler(0.5, h))).toEqual([0.75, 0.5, 0, -0.5, -1, -1.5])
  })
  it('h = 5 con horizonte 20 min: Euler diverge oscilando (80, −70, 155, −182.5, 323.75) y no se afirma solución', () => {
    const r = integrarEnfriamiento('euler', { ...P, tf: 20 }, 5)
    expect(r.estado).toBe('no_converge')
    expect(r.resultado).toBeNull()
    expect(r.pasos.map((p) => p.T)).toEqual([80, -70, 155, -182.5, 323.75])
    expect(r.mensaje).toMatch(/inestable/)
  })
  it('la trayectoria inestable se marca como físicamente inválida', () => {
    const adv = advertenciasEDO('euler', { ...P, tf: 20 }, 5).join(' ')
    expect(adv).toMatch(/NO es físicamente válida/)
    expect(adv).toMatch(/0 < h < 4/)
  })
  it('h = 3 es estable pero oscila: converge con aviso de trayectoria no física', () => {
    const r = integrarEnfriamiento('euler', { ...P, tf: 12 }, 3)
    expect(r.estado).toBe('ok')
    expect(r.resultado!.fisicamenteValida).toBe(false)
    expect(r.pasos[1].T).toBe(-10)
    expect(r.resultado!.advertencias.join(' ')).toMatch(/NO es físicamente válida/)
  })
  it('h = 0.5 es físicamente válida y monótona', () => {
    expect(integrarEnfriamiento('euler', P, 0.5).resultado!.fisicamenteValida).toBe(true)
  })
  it('h = 4 (marginal): oscila sin decaer y no es físicamente válida', () => {
    const r = integrarEnfriamiento('euler', { ...P, tf: 16 }, 4)
    expect(r.pasos.map((p) => p.T)).toEqual([80, -40, 80, -40, 80])
    expect(r.estado).toBe('ok')
    expect(r.resultado!.fisicamenteValida).toBe(false)
  })
  it('clasificación según k h', () => {
    expect([0.5, 2, 3, 4, 5].map((h) => comportamientoEuler(0.5, h))).toEqual(['monotono', 'inmediato', 'oscila', 'marginal', 'diverge'])
  })
})

describe('Estabilidad de RK4', () => {
  it('con h = 5 es estable (|factor| = 0.648) aunque muy inexacto; la trayectoria no oscila', () => {
    const r = integrarEnfriamiento('rk4', { ...P, tf: 20 }, 5)
    expect(r.estado).toBe('ok')
    expect(r.resultado!.factor).toBeCloseTo(0.6484375, 10)
    expect(r.pasos[1].T).toBeCloseTo(58.906, 3)
    expect(r.resultado!.errorMaximo).toBeGreaterThan(30)
  })
  it('el límite es k h ≈ 2.7853, es decir h ≈ 5.57 min con k = 0.5', () => {
    expect(KH_LIMITE_RK4).toBeCloseTo(2.7852935634, 8)
    expect(limiteRK4(0.5)).toBeCloseTo(5.5705871, 6)
  })
  it('más allá del límite RK4 también es inestable', () => {
    const r = integrarEnfriamiento('rk4', { ...P, tf: 60 }, 6)
    expect(factorRK4(0.5, 6)).toBeGreaterThan(1)
    expect(r.estado).toBe('no_converge')
  })
})

describe('Entradas inválidas', () => {
  it.each([[0], [-0.5], [NaN], [Infinity], [1e-9]])('paso h = %s se rechaza', (h) => {
    const r = integrarEnfriamiento('euler', P, h)
    expect(r.estado).toBe('invalido')
    expect(r.resultado).toBeNull()
  })
  it('el mensaje de h = 0 explica que el tiempo no avanza', () => {
    expect(integrarEnfriamiento('euler', P, 0).mensaje).toMatch(/no avanza/)
  })
  it.each([
    ['k = 0', { ...P, k: 0 }],
    ['k negativa', { ...P, k: -1 }],
    ['k enorme', { ...P, k: 100 }],
    ['t_f = 0', { ...P, tf: 0 }],
    ['t_f enorme', { ...P, tf: 5000 }],
    ['T₀ = NaN', { ...P, T0: NaN }],
    ['temperatura enorme', { ...P, Ta: 1e6 }],
  ])('parámetros inválidos: %s', (_n, p) => {
    expect(validarEnfriamiento(p)).not.toBeNull()
    expect(integrarEnfriamiento('rk4', p, 0.5).estado).toBe('invalido')
  })
  it('demasiados pasos se rechazan con mensaje claro', () => {
    expect(integrarEnfriamiento('euler', { ...P, tf: 1000 }, 0.01).mensaje).toMatch(/máximo/)
  })
})

describe('Otros datos', () => {
  it('ambiente más caliente que el servidor: la temperatura sube hacia Tₐ sin cruzarla', () => {
    const r = integrarEnfriamiento('euler', { T0: 10, Ta: 30, k: 0.5, tf: 4 }, 0.5)
    expect(r.resultado!.fisicamenteValida).toBe(true)
    expect(r.pasos.at(-1)!.T).toBeGreaterThan(10)
    expect(r.pasos.at(-1)!.T).toBeLessThan(30)
  })
  it('T₀ = Tₐ: la temperatura no cambia', () => {
    const r = integrarEnfriamiento('rk4', { T0: 20, Ta: 20, k: 0.5, tf: 2 }, 0.5)
    expect(r.pasos.every((p) => p.T === 20)).toBe(true)
    expect(r.resultado!.fisicamenteValida).toBe(true)
  })
  it('error exacto de RK4 con k grande: aun así acotado mientras sea estable', () => {
    expect(integrarEnfriamiento('rk4', { ...P, k: 2 }, 0.5).estado).toBe('ok')
  })
})

describe('Contraste con la referencia independiente (Python/scipy)', () => {
  for (const [nombre, c] of Object.entries(referencia.casos)) {
    it(`caso «${nombre}»: Euler y RK4 coinciden nodo a nodo`, () => {
      const p = { ...P, tf: c.tf }
      const e = integrarEnfriamiento('euler', p, c.h)
      const r = integrarEnfriamiento('rk4', p, c.h)
      expect(e.pasos.map((q) => q.t)).toHaveLength(c.t.length)
      e.pasos.forEach((q, i) => {
        expect(q.t).toBeCloseTo(c.t[i], 9)
        expect(q.T).toBeCloseTo(c.euler[i], 8)
      })
      r.pasos.forEach((q, i) => expect(q.T).toBeCloseTo(c.rk4[i], 8))
      if (e.resultado) expect(e.resultado.errorMaximo).toBeCloseTo(c.error_max_euler, 7)
      if (r.resultado) expect(r.resultado.errorMaximo).toBeCloseTo(c.error_max_rk4, 7)
      expect(r.pasos[1].k).toEqual(c.k_primer_paso)
    })
  }
  it('la solución exacta coincide con scipy (DOP853) y con la fórmula', () => {
    expect(exacta(P, 2)).toBeCloseTo(referencia.exacta_t2_scipy, 8)
    expect(exacta(P, 0.5)).toBeCloseTo(referencia.exacta_t0_5, 12)
  })
  it('factores de estabilidad y límites', () => {
    referencia.estabilidad.factores.forEach((f) => {
      expect(factorEuler(0.5, f.h)).toBeCloseTo(f.euler, 12)
      expect(factorRK4(0.5, f.h)).toBeCloseTo(f.rk4, 12)
    })
    expect(KH_LIMITE_RK4).toBeCloseTo(referencia.estabilidad.limite_rk4_kh, 9)
    expect(limiteEuler(0.5)).toBe(referencia.estabilidad.limite_euler_h)
  })
})
