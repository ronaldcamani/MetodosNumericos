import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Autoevaluacion from '../components/Autoevaluacion'
import Ejercicios from '../components/Ejercicios'
import { borrarProgreso } from '../components/useProgreso'
import { biseccion, crearModelo, crearModeloPolinomio, deflacionar, falsaPosicion, newton, raicesPolinomio, secante } from '../core/m1'
import { cifrasSignificativas, erroresAproximacion, operarConPrecision, serieExponencial, sumaConPrecision } from '../core/errores'
import { eliminacionGauss, gaussSeidel, normaInf, residuo } from '../core/m2'
import { EJERCICIOS_CERRADOS, PREGUNTAS_CERRADOS } from './m1/practicaCerrados'
import { EJERCICIOS_ABIERTOS, PREGUNTAS_ABIERTOS } from './m1/practicaAbiertos'
import { EJERCICIOS_POLINOMIOS, PREGUNTAS_POLINOMIOS } from './m1/practicaPolinomios'
import { EJERCICIOS_DECISION, PREGUNTAS_DECISION } from './m1/practicaDecision'
import { EJERCICIOS_ERRORES, PREGUNTAS_ERRORES } from './errores/practica'
import { EJERCICIOS_DECISION_SISTEMAS, PREGUNTAS_DECISION_SISTEMAS, EJERCICIOS_DIRECTOS, PREGUNTAS_DIRECTOS, EJERCICIOS_ITERATIVOS, PREGUNTAS_ITERATIVOS } from './m2/practica'
import { EJERCICIO_3 } from './m2/ejercicios'
import { EJERCICIOS_DECISION_INTERP, PREGUNTAS_DECISION_INTERP, EJERCICIOS_LAGRANGE, PREGUNTAS_LAGRANGE, EJERCICIOS_REGRESION, PREGUNTAS_REGRESION } from './m3/practica'
import { lagrange, regresionLineal } from '../core/m3'
import { EJERCICIOS_DECISION_INTEGRAL, PREGUNTAS_DECISION_INTEGRAL, EJERCICIOS_TRAPECIO, PREGUNTAS_TRAPECIO, EJERCICIOS_SIMPSON, PREGUNTAS_SIMPSON, EJERCICIOS_DERIVACION, PREGUNTAS_DERIVACION } from './m4/practica'
import { EJERCICIOS_DECISION_EDO, PREGUNTAS_DECISION_EDO, EJERCICIOS_EULER, PREGUNTAS_EULER, EJERCICIOS_RK4, PREGUNTAS_RK4, EJERCICIOS_ESTABILIDAD, PREGUNTAS_ESTABILIDAD } from './m5/practica'
import { integrarEnfriamiento, CASO_ENFRIAMIENTO, factorEuler, factorRK4, limiteEuler } from '../core/m5'
import { aproximarDerivada, crearDerivable, integrarTasa, reglaCompuesta, derivacionCentral } from '../core/m4'

describe('respuestas de práctica verificadas con los motores', () => {
  const f = crearModelo('calibracion', 2)
  it('M1: iteraciones de bisección (e1, q3) y Newton desde 0 / 1.5 (e4)', () => {
    expect(biseccion({ f: f.f, a: 1, b: 2, tol: 1e-3, maxIter: 100 }).resultado?.iteraciones).toBe(10)
    expect(biseccion({ f: crearModelo('calibracion', 2).f, a: 1, b: 2, tol: 1e-6, maxIter: 100 }).resultado?.iteraciones).toBe(20)
    expect(newton({ f: f.f, df: f.df, x0: 0, tol: 1e-6, maxIter: 100 }).resultado?.iteraciones).toBe(31)
    expect(newton({ f: f.f, df: f.df, x0: 1.5, tol: 1e-6, maxIter: 100 }).resultado?.iteraciones).toBe(3)
  })
  it('M1: Newton cicla en x³−2x+2 desde 0 y no se declara convergencia', () => {
    const r = newton({ f: (x) => x ** 3 - 2 * x + 2, df: (x) => 3 * x * x - 2, x0: 0, tol: 1e-8, maxIter: 50 })
    expect(r.estado).toBe('max_iter')
  })
  it('M2: ejercicios 1, 2, 3 y 4', () => {
    const e1 = eliminacionGauss({ A: [[0.0001, 1], [1, 1]], b: [1, 2] }).resultado!.x
    expect(e1[0]).toBeCloseTo(1.00010001, 7)
    expect(e1[1]).toBeCloseTo(0.99989999, 7)
    const it1 = gaussSeidel({ A: [[4, 1], [2, 5]], b: [9, 13], tol: 1e-12, maxIter: 1 })
    expect(it1.pasos[0].x).toEqual([2.25, 1.7])
    const dado = gaussSeidel({ A: [[1, 3], [4, 1]], b: [4, 5], tol: 1e-6, maxIter: 50 })
    expect(dado.estado).not.toBe('convergio')
    const orden = gaussSeidel({ A: [[1, 3], [4, 1]], b: [4, 5], tol: 1e-6, maxIter: 50, reordenar: true })
    expect(orden.estado).toBe('convergio')
    expect(eliminacionGauss({ A: [[1, 2], [2, 4]], b: [3, 6] }).estado).toBe('singular')
    expect(eliminacionGauss({ A: [[1, 2], [2, 4]], b: [3, 7] }).estado).toBe('singular')
  })
})

describe('M3: respuestas de práctica verificadas con los motores', () => {
  it('ejercicio 1: P(2) = 10/3 y bases (−1/3, 1, 1/3)', () => {
    const r = lagrange({ x: [0, 1, 3], y: [1, 3, 2], consulta: 2 })
    expect(r.resultado!.valor).toBeCloseTo(10 / 3, 12)
    r.pasos.forEach((p, i) => expect(p.base).toBeCloseTo([-1 / 3, 1, 1 / 3][i], 12))
  })
  it('ejercicio 2: y = 0.5 + 1.4x, SSE 0.2, predicción 7.5 con aviso de extrapolación', () => {
    const r = regresionLineal({ x: [1, 2, 3, 4], y: [2, 3, 5, 6], consulta: 5 })
    expect(r.resultado!.intercepto).toBeCloseTo(0.5, 12)
    expect(r.resultado!.pendiente).toBeCloseTo(1.4, 12)
    expect(r.resultado!.sse).toBeCloseTo(0.2, 12)
    expect(r.resultado!.prediccion).toBeCloseTo(7.5, 12)
    expect(r.resultado!.fueraDeIntervalo).toBe(true)
  })
  it('ejercicio 3: Runge, P(0.8) ≈ −0.0481 y P(0) ≈ 0.567', () => {
    const x = [-1, -0.6, -0.2, 0.2, 0.6, 1]
    const y = [0.0385, 0.1, 0.5, 0.5, 0.1, 0.0385]
    expect(lagrange({ x, y, consulta: 0.8 }).resultado!.valor).toBeCloseTo(-0.0481, 3)
    expect(lagrange({ x, y, consulta: 0 }).resultado!.valor).toBeCloseTo(0.567, 3)
  })
  it('preguntas 3 y 5', () => {
    expect(lagrange({ x: [0, 1, 2, 3], y: [1, 2, 2, 4], consulta: 1.5 }).pasos[1].base).toBeCloseTo(0.5625, 12)
    expect(regresionLineal({ x: [0, 1, 2, 3], y: [1, 2, 2, 4], consulta: 3.5 }).resultado!.prediccion).toBeCloseTo(4.05, 12)
  })
})

describe('M4: respuestas de práctica verificadas con los motores', () => {
  const t = { a: 1, b: 0, c: 1 }
  it('ejercicio 1: trapecio n = 4 → 4.75 MB, error 1/12', () => {
    const r = integrarTasa('trapecio', { tasa: t, inicio: 0, fin: 2, n: 4 }).resultado!
    expect(r.integral).toBeCloseTo(4.75, 12)
    expect(r.errorAbs).toBeCloseTo(1 / 12, 12)
  })
  it('ejercicio 2: Simpson 36, trapecio 37, exacta 36', () => {
    const e = { tasa: { a: 3, b: 2, c: 1 }, inicio: 1, fin: 3, n: 2 }
    expect(integrarTasa('simpson', e).resultado!.integral).toBeCloseTo(36, 12)
    expect(integrarTasa('trapecio', e).resultado!.integral).toBeCloseTo(37, 12)
    expect(integrarTasa('trapecio', e).resultado!.exacta).toBeCloseTo(36, 12)
  })
  it('ejercicio 3: t⁴ con Simpson n = 2 y 4 (0.208333, 0.200521; cociente 16)', () => {
    const f = (x: number) => x ** 4
    const s2 = reglaCompuesta('simpson', f, 0, 1, 2).integral
    const s4 = reglaCompuesta('simpson', f, 0, 1, 4).integral
    expect(s2).toBeCloseTo(0.208333, 6)
    expect(s4).toBeCloseTo(0.200521, 6)
    expect((s2 - 0.2) / (s4 - 0.2)).toBeCloseTo(16, 8)
    expect(reglaCompuesta('trapecio', f, 0, 1, 2).integral).toBeCloseTo(0.28125, 12)
  })
  it('ejercicio 4: n = 116 es el menor con error ≤ 1e-4', () => {
    const err = (n: number) => integrarTasa('trapecio', { tasa: t, inicio: 0, fin: 2, n }).resultado!.errorAbs
    expect(err(116)).toBeLessThanOrEqual(1e-4)
    expect(err(115)).toBeGreaterThan(1e-4)
  })
  it('preguntas 3 y 5', () => {
    expect(integrarTasa('trapecio', { tasa: t, inicio: 0, fin: 2, n: 2 }).resultado!.integral).toBeCloseTo(5, 12)
    expect(derivacionCentral((x) => x * x + 1, 1, 0.1)).toBeCloseTo(2, 10)
  })
})

describe('M1 (cerrados, abiertos, polinomios, decisión): respuestas verificadas con los motores', () => {
  const calib = crearModelo('calibracion', 2)
  it('decisión e1: primer corte 226.3 y ⌈log₂ 300⌉ = 9 simulaciones en bisección', () => {
    expect((100 * 110 - 400 * -80) / (110 + 80)).toBeCloseTo(226.3158, 4)
    expect(Math.ceil(Math.log2(300))).toBe(9)
  })
  it('decisión e2: x⁴ − 10x² + 9 → raíces −3, −1, 1, 3; cota 11; primera deflación s³ + 3s² − s − 3', () => {
    const r = raicesPolinomio({ coef: [1, 0, -10, 0, 9], tol: 1e-10, maxIter: 100 })
    expect(r.resultado!.raices.map((z) => Math.round(z.re * 1e6) / 1e6)).toEqual([-3, -1, 1, 3])
    expect(r.resultado!.cota).toBe(11)
    expect(r.pasos[0].raiz).toBeCloseTo(3, 8)
    r.pasos[0].cociente.forEach((c, i) => expect(c).toBeCloseTo([1, 3, -1, -3][i], 6))
  })
  it('decisión e3: x³ − 1 con x₀ = 0 falla; x₀ = 2, bisección [0, 2] y secante (0, 2) convergen', () => {
    const m = crearModelo('cubo', 1)
    expect(newton({ f: m.f, df: m.df, x0: 0, tol: 1e-6, maxIter: 100 }).estado).toBe('derivada_nula')
    expect(newton({ f: m.f, df: m.df, x0: 2, tol: 1e-6, maxIter: 100 }).estado).toBe('convergio')
    expect(biseccion({ f: m.f, a: 0, b: 2, tol: 1e-6, maxIter: 100 }).estado).toBe('convergio')
    expect(secante({ f: m.f, x0: 0, x1: 2, tol: 1e-6, maxIter: 100 }).estado).toBe('convergio')
  })
  it('cerrados e2 y e3: falsa posición a mano y el polo no se declara raíz', () => {
    const r = falsaPosicion({ f: calib.f, a: 1, b: 2, tol: 1e-6, maxIter: 5 })
    expect(r.pasos[0].fc).toBeCloseTo(-26 / 27, 12)
    expect(r.pasos[1].c).toBeCloseTo(98 / 67, 12)
    expect(r.pasos[1].fc).toBeCloseTo(-0.3333, 4)
    expect(biseccion({ f: crearModelo('polo', 0).f, a: 0, b: 3, tol: 1e-6, maxIter: 100 }).estado).toBe('no_converge')
  })
  it('cerrados e4: x⁶ − 1 en [0, 1.5]: 43 frente a 21 y el extremo b queda fijo', () => {
    const m = crearModeloPolinomio([1, 0, 0, 0, 0, 0, -1])
    const fp = falsaPosicion({ f: m.f, a: 0, b: 1.5, tol: 1e-6, maxIter: 200 })
    expect(fp.resultado!.iteraciones).toBe(43)
    expect(biseccion({ f: m.f, a: 0, b: 1.5, tol: 1e-6, maxIter: 200 }).resultado!.iteraciones).toBe(21)
    expect(fp.pasos.every((p) => p.b === 1.5)).toBe(true)
  })
  it('abiertos e2: secante 4/3, 7/5, 58/41 y e3: ciclo 0 ↔ 1 con remedios', () => {
    const s = secante({ f: (x) => x * x - 2, x0: 1, x1: 2, tol: 1e-12, maxIter: 3 })
    expect(s.pasos.map((p) => p.siguiente)).toEqual([expect.closeTo(4 / 3, 12), expect.closeTo(1.4, 12), expect.closeTo(58 / 41, 12)])
    const m = crearModeloPolinomio([1, 0, -2, 2])
    expect(newton({ f: m.f, df: m.df, x0: 0, tol: 1e-8, maxIter: 50 }).estado).toBe('max_iter')
    expect(newton({ f: m.f, df: m.df, x0: -2, tol: 1e-8, maxIter: 50 }).estado).toBe('convergio')
    expect(biseccion({ f: m.f, a: -3, b: -1, tol: 1e-8, maxIter: 100 }).estado).toBe('convergio')
  })
  it('abiertos e4: x³ − x − 2 desde 0 necesita 31 iteraciones; secante (1, 2) converge', () => {
    expect(newton({ f: calib.f, df: calib.df, x0: 0, tol: 1e-6, maxIter: 100 }).resultado!.iteraciones).toBe(31)
    expect(secante({ f: calib.f, x0: 1, x1: 2, tol: 1e-6, maxIter: 100 }).estado).toBe('convergio')
  })
  it('polinomios e2 y e4: deflación de x³ − 6x² + 11x − 6 y raíz doble sin cambio de signo', () => {
    expect(deflacionar([1, -6, 11, -6], 1)).toEqual({ cociente: [1, -5, 6], resto: 0 })
    const m = crearModeloPolinomio([1, -4, 5, -2])
    expect(biseccion({ f: m.f, a: 0.5, b: 1.5, tol: 1e-6, maxIter: 100 }).estado).toBe('sin_cambio_signo')
    const r = raicesPolinomio({ coef: [1, -4, 5, -2], tol: 1e-10, maxIter: 1000 })
    expect(r.resultado!.raices.map((z) => Math.round(z.re * 1e3) / 1e3)).toEqual([1, 1, 2])
  })
  it('polinomios e3: x³ − x − 2 tiene cociente x² + 1.5214x + 1.3146 y par complejo −0.7607 ± 0.8579i', () => {
    const r = raicesPolinomio({ coef: [1, 0, -1, -2], tol: 1e-10, maxIter: 100 })
    ;[1, 1.5214, 1.3146].forEach((c, i) => expect(r.pasos[0].cociente[i]).toBeCloseTo(c, 4))
    const z = r.resultado!.raices.filter((x) => x.im !== 0)
    expect(z[0].re).toBeCloseTo(-0.7607, 4)
    expect(Math.abs(z[0].im)).toBeCloseTo(0.8579, 4)
  })
})

describe('Errores: respuestas verificadas con el motor', () => {
  it('e1: π ≈ 22/7 → 1.2645e−3, 0.04025 %, 3 cifras; 100 frente a 99.5 → 0.5 %', () => {
    const r = erroresAproximacion({ verdadero: Math.PI, aproximado: 22 / 7 }).resultado!
    expect(r.absoluto).toBeCloseTo(1.2645e-3, 6)
    expect(r.porcentual).toBeCloseTo(0.04025, 4)
    expect(r.cifras).toBe(3)
    expect(erroresAproximacion({ verdadero: 100, aproximado: 99.5 }).resultado!.porcentual).toBeCloseTo(0.5, 12)
  })
  it('e2: 8/3 con 3 cifras: redondeo 2.67 (3.3e−3), truncamiento 2.66 (6.7e−3)', () => {
    expect(cifrasSignificativas(8 / 3, 3, 'redondeo')).toBe(2.67)
    expect(cifrasSignificativas(8 / 3, 3, 'truncamiento')).toBe(2.66)
    expect(Math.abs(8 / 3 - 2.67)).toBeCloseTo(0.003333, 5)
    expect(Math.abs(8 / 3 - 2.66)).toBeCloseTo(0.006667, 5)
  })
  it('e3: √10001 − √10000 con 4 cifras da 0 (100 %); con el conjugado, error 2.5e−5', () => {
    const resta = operarConPrecision({ a: Math.sqrt(10001), op: '−', b: 100, t: 4, modo: 'redondeo' }).resultado!
    expect(resta.calculado).toBe(0)
    expect(resta.relativo).toBeCloseTo(1, 12)
    const den = operarConPrecision({ a: Math.sqrt(10001), op: '+', b: 100, t: 4, modo: 'redondeo' }).resultado!
    expect(den.calculado).toBe(200)
    const cociente = operarConPrecision({ a: 1, op: '÷', b: Math.sqrt(10001) + 100, t: 4, modo: 'redondeo' }).resultado!
    expect(cociente.calculado).toBe(0.005)
    expect(cociente.relativo!).toBeCloseTo(2.5e-5, 6)
  })
  it('e4: 1 + 3·0.0004 con 4 cifras y truncamiento: 1 frente a 1.001 (exacta 1.0012)', () => {
    const r = sumaConPrecision({ valores: [1, 0.0004, 0.0004, 0.0004], t: 4, modo: 'truncamiento' }).resultado!
    expect(r.resultadoOrden).toBe(1)
    expect(r.resultadoCreciente).toBe(1.001)
    expect(r.exacta).toBeCloseTo(1.0012, 12)
    expect(r.errorOrden).toBeCloseTo(0.0012, 12)
    expect(r.errorCreciente).toBeCloseTo(0.0002, 12)
  })
  it('teoría y preguntas: serie de e con 5 términos, 3.1416 tiene 5 cifras, 1000 + 0.4 + 0.4', () => {
    const p = serieExponencial({ x: 1, terminos: 6 }).resultado!.pasos
    expect(p[4].error).toBeLessThan(p[4].cota)
    expect(p[4].error / p[5].error).toBeGreaterThan(6)
    expect(erroresAproximacion({ verdadero: Math.PI, aproximado: 3.1416 }).resultado!.cifras).toBe(5)
    expect(erroresAproximacion({ verdadero: Math.PI, aproximado: 3.1415 }).resultado!.cifras).toBe(4)
    expect(sumaConPrecision({ valores: [1000, 0.4, 0.4], t: 4, modo: 'redondeo' }).resultado!.resultadoCreciente).toBe(1001)
  })
})

describe('Sistemas: respuestas de los ejercicios nuevos verificadas', () => {
  it('d2: el sistema del ejercicio 3 diverge tal cual y converge reordenado a (1, −2, 3)', () => {
    const A = [[0.4, 1.1, 3.1], [4, 0.15, 0.25], [2, 5.6, 3.1]]
    const b = [7.5, 4.45, 0.1]
    expect(gaussSeidel({ A, b, tol: 1e-4, maxIter: 100, x0: [1, 1, 1] }).estado).not.toBe('convergio')
    const r = gaussSeidel({ A, b, tol: 1e-4, maxIter: 100, x0: [1, 1, 1], reordenar: true })
    expect(r.estado).toBe('convergio')
    expect(r.resultado!.permutacion).toEqual([1, 2, 0])
    expect(eliminacionGauss({ A, b }).resultado!.x.map((v) => Math.round(v * 1e6) / 1e6)).toEqual([1, -2, 3])
    expect(EJERCICIO_3.sistema.tam).toBe('3')
  })
  it('d1 y e3: sistema dominante converge; (1,3;4,1) tal cual diverge y reordenado converge', () => {
    expect(gaussSeidel({ A: [[4, 1, 1], [1, 5, 1], [1, 1, 6]], b: [9, 14, 21], tol: 1e-6, maxIter: 100 }).estado).toBe('convergio')
    expect(gaussSeidel({ A: [[1, 3], [4, 1]], b: [4, 5], tol: 1e-6, maxIter: 50 }).estado).not.toBe('convergio')
    expect(gaussSeidel({ A: [[1, 3], [4, 1]], b: [4, 5], tol: 1e-6, maxIter: 50, reordenar: true }).estado).toBe('convergio')
  })
  it('d3: el sistema con filas proporcionales es singular para ambos métodos', () => {
    expect(eliminacionGauss({ A: [[1, 2], [2, 4]], b: [3, 6] }).estado).toBe('singular')
    expect(gaussSeidel({ A: [[1, 2], [2, 4]], b: [3, 6], tol: 1e-6, maxIter: 100 }).estado).toBe('singular')
  })
  it('sis-q4: residuo de x = (1,1) en A = [[2,1],[1,3]], b = (3,5) vale 1', () => {
    expect(normaInf(residuo([[2, 1], [1, 3]], [3, 5], [1, 1]))).toBe(1)
  })
})

describe('Interpolación: respuestas de los ejercicios nuevos verificadas', () => {
  it('d1: con mediciones ruidosas Lagrange predice 7.5 y la recta 9.85 (y = 0.15 + 1.94x)', () => {
    const x = [1, 2, 3, 4]
    const y = [2.1, 3.9, 6.2, 7.8]
    expect(lagrange({ x, y, consulta: 5 }).resultado!.valor).toBeCloseTo(7.5, 10)
    const r = regresionLineal({ x, y, consulta: 5 }).resultado!
    expect(r.intercepto).toBeCloseTo(0.15, 10)
    expect(r.pendiente).toBeCloseTo(1.94, 10)
    expect(r.prediccion).toBeCloseTo(9.85, 10)
  })
  it('d2: tres nodos exactos de x² − 2x + 2: Lagrange da 2 en x = 2; la recta, 3.43', () => {
    expect(lagrange({ x: [0, 1, 3], y: [2, 1, 5], consulta: 2 }).resultado!.valor).toBeCloseTo(2, 12)
    expect(regresionLineal({ x: [0, 1, 3], y: [2, 1, 5], consulta: 2 }).resultado!.prediccion).toBeCloseTo(3.4286, 4)
  })
  it('d3: abscisa repetida: Lagrange rechaza y la regresión predice 4.11 en x = 2.5', () => {
    expect(lagrange({ x: [1, 1, 2, 3], y: [2, 2.4, 3, 5], consulta: 2.5 }).estado).toBe('invalido')
    expect(regresionLineal({ x: [1, 1, 2, 3], y: [2, 2.4, 3, 5], consulta: 2.5 }).resultado!.prediccion).toBeCloseTo(4.1091, 4)
  })
  it('Runge: 3 nodos cercanos dan 0.0269 (error 0.032) y 6 nodos, −0.0481 (error 0.107)', () => {
    const f = 1 / 17
    const seis = lagrange({ x: [-1, -0.6, -0.2, 0.2, 0.6, 1], y: [0.0385, 0.1, 0.5, 0.5, 0.1, 0.0385], consulta: 0.8 }).resultado!.valor
    const tres = lagrange({ x: [0.2, 0.6, 1], y: [0.5, 0.1, 0.0385], consulta: 0.8 }).resultado!.valor
    expect(tres).toBeCloseTo(0.0269, 4)
    expect(Math.abs(tres - f)).toBeCloseTo(0.032, 3)
    expect(Math.abs(seis - f)).toBeCloseTo(0.107, 3)
    const recta = regresionLineal({ x: [-1, -0.6, -0.2, 0.2, 0.6, 1], y: [0.0385, 0.1, 0.5, 0.5, 0.1, 0.0385], consulta: 0.8 }).resultado!
    expect(recta.pendiente).toBeCloseTo(0, 10)
  })
  it('preguntas: R² = 0.853 y residuo −0.7', () => {
    const r = regresionLineal({ x: [0, 1, 2, 3], y: [1, 2, 2, 4], consulta: 1 }).resultado!
    expect(r.r2!).toBeCloseTo(0.853, 3)
    const p = regresionLineal({ x: [0, 1, 2, 3], y: [1, 2, 2, 4], consulta: 1 }).pasos[2]
    expect(p.residuo).toBeCloseTo(-0.7, 10)
  })
})

describe('Integración y derivación: respuestas de los ejercicios nuevos verificadas', () => {
  const tasa = (a: number, b: number, c: number, inicio: number, fin: number, n: number) => ({ tasa: { a, b, c }, inicio, fin, n })
  it('d1: 2t² + t + 3 en [0, 3] con n = 2: Simpson 31.5 (exacto) y trapecio 33.75', () => {
    expect(integrarTasa('simpson', tasa(2, 1, 3, 0, 3, 2)).resultado!.integral).toBeCloseTo(31.5, 12)
    expect(integrarTasa('trapecio', tasa(2, 1, 3, 0, 3, 2)).resultado!.integral).toBeCloseTo(33.75, 12)
    expect(integrarTasa('simpson', tasa(2, 1, 3, 0, 3, 2)).resultado!.exacta).toBeCloseTo(31.5, 12)
  })
  it('d2: n = 5: Simpson se rechaza, el trapecio da 4.72 (error 0.0533) y Simpson n = 4 es exacto', () => {
    expect(integrarTasa('simpson', tasa(1, 0, 1, 0, 2, 5)).estado).toBe('invalido')
    const t = integrarTasa('trapecio', tasa(1, 0, 1, 0, 2, 5)).resultado!
    expect(t.integral).toBeCloseTo(4.72, 12)
    expect(t.errorAbs).toBeCloseTo(0.05333, 4)
    expect(integrarTasa('simpson', tasa(1, 0, 1, 0, 2, 4)).resultado!.errorAbs).toBeLessThan(1e-12)
  })
  it('d3: t² − 3t + 1 en [0, 3], n = 6: Simpson −1.5, trapecio −1.375 y aviso de tasa negativa', () => {
    const s = integrarTasa('simpson', tasa(1, -3, 1, 0, 3, 6)).resultado!
    expect(s.integral).toBeCloseTo(-1.5, 12)
    expect(integrarTasa('trapecio', tasa(1, -3, 1, 0, 3, 6)).resultado!.integral).toBeCloseTo(-1.375, 12)
    expect(s.advertencias.join(' ')).toMatch(/negativa/)
  })
  it('preguntas: error del trapecio n = 8 es 1/48; Simpson n = 2 de 3t² + 2t + 1 en [1, 3] da 36', () => {
    expect(integrarTasa('trapecio', tasa(1, 0, 1, 0, 2, 8)).resultado!.errorAbs).toBeCloseTo(1 / 48, 12)
    expect(integrarTasa('simpson', tasa(3, 2, 1, 1, 3, 2)).resultado!.integral).toBeCloseTo(36, 12)
  })
  it('derivación: t² + 1 en t = 1, h = 0.1 → central 2, progresiva 2.1, regresiva 1.9', () => {
    const r = aproximarDerivada({ derivable: crearDerivable('tasa', { a: 1, b: 0, c: 1 }), t: 1, h: 0.1 }).resultado!
    expect([r.central, r.progresiva, r.regresiva].map((v) => Math.round(v * 1e9) / 1e9)).toEqual([2, 2.1, 1.9])
  })
  it('derivación: errores de e^t en t = 1 con h = 0.5, 10⁻⁵ y 10⁻¹² (las magnitudes citadas en el ejercicio)', () => {
    const err = (h: number) => aproximarDerivada({ derivable: crearDerivable('exponencial'), t: 1, h }).resultado!.errorCentral
    expect(err(0.5)).toBeCloseTo(0.115, 3)
    expect(err(1e-5)).toBeLessThan(1e-9)
    expect(err(1e-12)).toBeGreaterThan(1e-5)
    expect(err(1e-12)).toBeLessThan(1e-3)
  })
})

describe('Ecuaciones diferenciales: respuestas de los ejercicios verificadas', () => {
  const P = CASO_ENFRIAMIENTO
  const err = (m: 'euler' | 'rk4', h: number, tf = 2) => integrarEnfriamiento(m, { ...P, tf }, h).resultado!.errorMaximo
  it('d1: Euler h = 0.5 → 3.09; Euler h = 0.01 → 0.055 (200 pasos); RK4 h = 0.5 → 8.9e−4 (16 evaluaciones)', () => {
    expect(err('euler', 0.5)).toBeCloseTo(3.088, 2)
    expect(err('euler', 0.01)).toBeCloseTo(0.0553, 3)
    expect(integrarEnfriamiento('euler', P, 0.01).pasos).toHaveLength(201)
    expect(err('rk4', 0.5)).toBeCloseTo(8.85e-4, 5)
    expect(err('euler', 0.0018)).toBeLessThan(0.01)
    expect(err('euler', 0.0022)).toBeGreaterThan(0.01)
  })
  it('d1/rk-e2: Euler necesitaría h ≈ 1.6e−4 (más de 12 000 pasos, fuera del límite del portal)', () => {
    expect(integrarEnfriamiento('euler', P, 1.6e-4).estado).toBe('invalido')
    expect(err('euler', 0.0002)).toBeGreaterThan(err('rk4', 0.5))
    expect(2 / 1.6e-4).toBeGreaterThan(12000)
  })
  it('d2: h = 5, 20 min: Euler diverge; RK4 estable con error ≈ 34; Euler h = 0.5 → 3.09; RK4 h = 1 → 0.017', () => {
    expect(integrarEnfriamiento('euler', { ...P, tf: 20 }, 5).estado).toBe('no_converge')
    const r = integrarEnfriamiento('rk4', { ...P, tf: 20 }, 5)
    expect(r.estado).toBe('ok')
    expect(r.resultado!.errorMaximo).toBeCloseTo(33.98, 1)
    expect(r.pasos[1].T).toBeCloseTo(58.906, 3)
    expect(r.pasos[1].exacta).toBeCloseTo(24.925, 3)
    expect(err('euler', 0.5, 20)).toBeCloseTo(3.088, 2)
    expect(err('rk4', 1, 20)).toBeCloseTo(0.0175, 3)
  })
  it('d3: h = 0.3 hasta 2: 7 pasos y el último de 0.2; h = 0.25 divide el intervalo', () => {
    const r = integrarEnfriamiento('euler', P, 0.3)
    expect(r.pasos).toHaveLength(8)
    expect(r.pasos[7].h).toBeCloseTo(0.2, 12)
    expect(7 * 0.3).toBeCloseTo(2.1, 12)
    expect(integrarEnfriamiento('euler', P, 0.25).resultado!.ultimoPasoCorto).toBeNull()
  })
  it('eu-e1: T₁ = 65 (error 1.728) y T₂ = 53.75 (error 2.642)', () => {
    const r = integrarEnfriamiento('euler', P, 0.5)
    expect(r.pasos[1].T).toBe(65)
    expect(r.pasos[1].error).toBeCloseTo(1.728, 3)
    expect(r.pasos[2].T).toBe(53.75)
    expect(r.pasos[2].error).toBeCloseTo(2.6418, 3)
  })
  it('eu-e2: cocientes 2.1 y error con h = 0.125 ≈ 0.708; Euler logra < 0.01 con h ≈ 0.0018', () => {
    expect(err('euler', 0.5) / err('euler', 0.25)).toBeCloseTo(2.12, 1)
    expect(err('euler', 0.125)).toBeCloseTo(0.708, 2)
  })
  it('rk-e1: k₁…k₄ y T₁ = 66.728515625; promedio −26.54296875; error 4.7e−4', () => {
    const q = integrarEnfriamiento('rk4', P, 0.5).pasos[1]
    expect(q.k).toEqual([-30, -26.25, -26.71875, -23.3203125])
    expect(q.T).toBeCloseTo(66.728515625, 12)
    expect((q.k![0] + 2 * q.k![1] + 2 * q.k![2] + q.k![3]) / 6).toBeCloseTo(-26.54296875, 10)
    expect(q.error).toBeCloseTo(4.7e-4, 5)
  })
  it('rk-q3: el error de RK4 baja ≈ 17.8 y ≈ 16.9 al partir h', () => {
    expect(err('rk4', 0.5) / err('rk4', 0.25)).toBeCloseTo(17.8, 0)
    expect(err('rk4', 0.25) / err('rk4', 0.125)).toBeCloseTo(16.9, 0)
  })
  it('es-e1 y es-q: límites 4 y 1; factor −1 con k = 2, h = 1; factor −1.5 con h = 5; RK4 h = 3 → 0.273', () => {
    expect([limiteEuler(0.5), limiteEuler(2)]).toEqual([4, 1])
    expect(factorEuler(2, 1)).toBe(-1)
    expect(factorEuler(0.5, 5)).toBe(-1.5)
    expect(factorRK4(0.5, 3)).toBeCloseTo(0.2734, 3)
  })
  it('es-e2: h = 3 → 80, −10, 35, 12.5, 23.75; RK4 h = 3 da T(3) ≈ 36.4 frente a 33.4', () => {
    expect(integrarEnfriamiento('euler', { ...P, tf: 12 }, 3).pasos.map((p) => p.T).slice(0, 5)).toEqual([80, -10, 35, 12.5, 23.75])
    const r = integrarEnfriamiento('rk4', { ...P, tf: 12 }, 3).pasos[1]
    expect(r.T).toBeCloseTo(36.4, 1)
    expect(r.exacta).toBeCloseTo(33.39, 1)
  })
  it('ed-q1: la razón de errores RK4/Euler con h = 0.5 es ≈ 3500', () => {
    expect(err('euler', 0.5) / err('rk4', 0.5)).toBeGreaterThan(3400)
  })
})

describe('componentes', () => {
  const TEMAS = {
    Errores: [[EJERCICIOS_ERRORES], [PREGUNTAS_ERRORES]],
    Ecuaciones: [[EJERCICIOS_DECISION, EJERCICIOS_CERRADOS, EJERCICIOS_ABIERTOS, EJERCICIOS_POLINOMIOS], [PREGUNTAS_DECISION, PREGUNTAS_CERRADOS, PREGUNTAS_ABIERTOS, PREGUNTAS_POLINOMIOS]],
    Sistemas: [[EJERCICIOS_DECISION_SISTEMAS, EJERCICIOS_DIRECTOS, EJERCICIOS_ITERATIVOS], [PREGUNTAS_DECISION_SISTEMAS, PREGUNTAS_DIRECTOS, PREGUNTAS_ITERATIVOS]],
    Interpolación: [[EJERCICIOS_DECISION_INTERP, EJERCICIOS_LAGRANGE, EJERCICIOS_REGRESION], [PREGUNTAS_DECISION_INTERP, PREGUNTAS_LAGRANGE, PREGUNTAS_REGRESION]],
    Integración: [[EJERCICIOS_DECISION_INTEGRAL, EJERCICIOS_TRAPECIO, EJERCICIOS_SIMPSON, EJERCICIOS_DERIVACION], [PREGUNTAS_DECISION_INTEGRAL, PREGUNTAS_TRAPECIO, PREGUNTAS_SIMPSON, PREGUNTAS_DERIVACION]],
    Diferenciales: [[EJERCICIOS_DECISION_EDO, EJERCICIOS_EULER, EJERCICIOS_RK4, EJERCICIOS_ESTABILIDAD], [PREGUNTAS_DECISION_EDO, PREGUNTAS_EULER, PREGUNTAS_RK4, PREGUNTAS_ESTABILIDAD]],
  } as const
  it.each(Object.entries(TEMAS))('tema %s: ≥ 4 ejercicios (≥ 2 intermedios, ≥ 2 avanzados) y ≥ 6 preguntas de los tres tipos', (_n, [ejs, qs]) => {
    const e = (ejs as readonly (readonly { nivel: string }[])[]).flat()
    const q = (qs as readonly (readonly { tipo: string }[])[]).flat()
    expect(e.length).toBeGreaterThanOrEqual(4)
    expect(e.filter((x) => x.nivel === 'Intermedio').length).toBeGreaterThanOrEqual(2)
    expect(e.filter((x) => x.nivel === 'Avanzado').length).toBeGreaterThanOrEqual(2)
    expect(q.length).toBeGreaterThanOrEqual(6)
    expect(new Set(q.map((p) => p.tipo))).toEqual(new Set(['opcion', 'vf', 'numerica']))
  })
  it('cada página de método tiene al menos 2 ejercicios y 3 preguntas; las de decisión, 3 ejercicios con plan y 4 preguntas', () => {
    for (const [e, q] of [[EJERCICIOS_CERRADOS, PREGUNTAS_CERRADOS], [EJERCICIOS_ABIERTOS, PREGUNTAS_ABIERTOS], [EJERCICIOS_POLINOMIOS, PREGUNTAS_POLINOMIOS], [EJERCICIOS_DIRECTOS, PREGUNTAS_DIRECTOS], [EJERCICIOS_ITERATIVOS, PREGUNTAS_ITERATIVOS], [EJERCICIOS_LAGRANGE, PREGUNTAS_LAGRANGE], [EJERCICIOS_REGRESION, PREGUNTAS_REGRESION], [EJERCICIOS_TRAPECIO, PREGUNTAS_TRAPECIO], [EJERCICIOS_SIMPSON, PREGUNTAS_SIMPSON], [EJERCICIOS_DERIVACION, PREGUNTAS_DERIVACION], [EJERCICIOS_EULER, PREGUNTAS_EULER], [EJERCICIOS_RK4, PREGUNTAS_RK4], [EJERCICIOS_ESTABILIDAD, PREGUNTAS_ESTABILIDAD]] as const) {
      expect(e.length).toBeGreaterThanOrEqual(2)
      expect(q.length).toBeGreaterThanOrEqual(3)
    }
    for (const [e, q] of [[EJERCICIOS_DECISION, PREGUNTAS_DECISION], [EJERCICIOS_DECISION_SISTEMAS, PREGUNTAS_DECISION_SISTEMAS], [EJERCICIOS_DECISION_INTERP, PREGUNTAS_DECISION_INTERP], [EJERCICIOS_DECISION_INTEGRAL, PREGUNTAS_DECISION_INTEGRAL], [EJERCICIOS_DECISION_EDO, PREGUNTAS_DECISION_EDO]] as const) {
      expect(e).toHaveLength(3)
      expect(e.every((x) => x.plan && x.plan.opciones.some((o) => o.veredicto === 'adecuado') && x.plan.opciones.some((o) => o.veredicto === 'inadecuado' || o.veredicto === 'posible'))).toBe(true)
      expect(q).toHaveLength(4)
    }
  })
  it('los identificadores de ejercicios y preguntas son únicos en todo el portal', () => {
    const ids = Object.values(TEMAS).flatMap(([ejs, qs]) => [...(ejs as readonly (readonly { id: string }[])[]).flat(), ...(qs as readonly (readonly { id: string }[])[]).flat()].map((x) => x.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('todas las preguntas de todos los módulos tienen explicación adicional («profundiza») y las de opción, un comentario por opción', () => {
    for (const q of [...PREGUNTAS_CERRADOS, ...PREGUNTAS_ABIERTOS, ...PREGUNTAS_POLINOMIOS, ...PREGUNTAS_ERRORES, ...PREGUNTAS_DECISION, ...PREGUNTAS_DECISION_SISTEMAS, ...PREGUNTAS_DIRECTOS, ...PREGUNTAS_ITERATIVOS, ...PREGUNTAS_DECISION_INTERP, ...PREGUNTAS_LAGRANGE, ...PREGUNTAS_REGRESION, ...PREGUNTAS_DECISION_INTEGRAL, ...PREGUNTAS_TRAPECIO, ...PREGUNTAS_SIMPSON, ...PREGUNTAS_DERIVACION, ...PREGUNTAS_DECISION_EDO, ...PREGUNTAS_EULER, ...PREGUNTAS_RK4, ...PREGUNTAS_ESTABILIDAD]) {
      expect(q.profundiza, q.id).toBeTruthy()
      if (q.tipo === 'opcion') expect(q.porOpcion, q.id).toHaveLength(q.opciones.length)
    }
  })
  it('el plan de solución da retroalimentación según el método elegido', async () => {
    render(<Ejercicios items={EJERCICIOS_DECISION.slice(2)} />)
    await userEvent.click(screen.getByRole('radio', { name: /Newton desde x₀ = 0/ }))
    expect(screen.getByRole('status')).toHaveTextContent('No recomendado')
    await userEvent.click(screen.getByRole('radio', { name: /Bisección en \[0, 2\]/ }))
    expect(screen.getByRole('status')).toHaveTextContent('Adecuado')
  })
  it('los ejercicios ya no ofrecen pista', () => {
    render(<Ejercicios items={EJERCICIOS_CERRADOS.slice(0, 1)} />)
    expect(screen.queryByRole('button', { name: /pista/i })).toBeNull()
  })
  it('la solución se revela en tarjetas, un paso cada vez, y se puede volver a ocultar', async () => {
    render(<Ejercicios items={[{ id: 'x', nivel: 'Intermedio', titulo: 't', enunciado: <p>enun</p>, solucion: <><p>PASO-A</p><p>PASO-B</p></> }]} />)
    expect(screen.queryByText('PASO-A')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /mostrar siguiente paso \(1 de 2\)/i }))
    expect(screen.getByText('PASO-A')).toBeVisible()
    expect(screen.queryByText('PASO-B')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /mostrar siguiente paso \(2 de 2\)/i }))
    expect(screen.getByText('PASO-B')).toBeVisible()
    expect(screen.queryByRole('button', { name: /mostrar siguiente/i })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /ocultar los pasos/i }))
    expect(screen.queryByText('PASO-A')).toBeNull()
  })
  it('«Mostrar todos los pasos» revela el desarrollo completo y el ejemplo queda como estudiado', async () => {
    borrarProgreso()
    render(<Ejercicios items={[{ id: 'y', nivel: 'Intermedio', titulo: 't', enunciado: <p>enun</p>, solucion: <><p>UNO</p><p>DOS</p><p>TRES</p></> }]} />)
    await userEvent.click(screen.getByRole('button', { name: /mostrar todos los pasos/i }))
    for (const t of ['UNO', 'DOS', 'TRES']) expect(screen.getByText(t)).toBeVisible()
    expect(Object.values(JSON.parse(window.localStorage.getItem('portal-mn-progreso-v1')!)).some((v) => (v as { estudiados: string[] }).estudiados.includes('y'))).toBe(true)
  })
  it('cada ejercicio tiene un espacio para que el estudiante escriba su propio desarrollo', async () => {
    render(<Ejercicios items={EJERCICIOS_CERRADOS.slice(0, 1)} />)
    await userEvent.type(screen.getByRole('textbox', { name: /tu desarrollo del ejercicio 1/i }), 'f(1)=-2')
    expect(screen.getByRole('textbox', { name: /tu desarrollo/i })).toHaveValue('f(1)=-2')
  })
  it('autoevaluación: califica numérica con tolerancia y muestra puntaje', async () => {
    render(<Autoevaluacion preguntas={PREGUNTAS_ABIERTOS} />)
    await userEvent.type(screen.getAllByRole('textbox')[0], '3,7504')
    await userEvent.type(screen.getAllByRole('textbox')[1], '9')
    await userEvent.click(screen.getByRole('button', { name: /comprobar/i }))
    expect(screen.getByText(/Puntaje: 1 de 6/)).toBeVisible()
    expect(screen.getByText(/x₁ = 6 − 27\/12/)).toBeVisible()
  })
  it('autoevaluación: muestra comentario sobre la opción elegida y un apartado «Profundiza» desplegable', async () => {
    render(<Autoevaluacion preguntas={PREGUNTAS_DECISION.slice(0, 1)} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Newton' }))
    await userEvent.click(screen.getByRole('button', { name: /comprobar/i }))
    expect(screen.getByText(/Newton necesita f′, que aquí no se tiene/)).toBeVisible()
    const resumen = screen.getByText('Profundiza')
    expect(resumen.closest('details')).not.toHaveAttribute('open')
    await userEvent.click(resumen)
    expect(resumen.closest('details')).toHaveAttribute('open')
  })
})
