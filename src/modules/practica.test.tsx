import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Autoevaluacion from '../components/Autoevaluacion'
import Ejercicios from '../components/Ejercicios'
import { biseccion, crearModelo, newton } from '../core/m1'
import { eliminacionGauss, gaussSeidel } from '../core/m2'
import { PREGUNTAS_M1, EJERCICIOS_M1 } from './m1/practica'
import { PREGUNTAS_M2, EJERCICIOS_M2 } from './m2/practica'
import { PREGUNTAS_M3, EJERCICIOS_M3 } from './m3/practica'
import { lagrange, regresionLineal } from '../core/m3'

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

describe('componentes', () => {
  it('cada módulo tiene 4 ejercicios y 6 preguntas de los tres tipos', () => {
    for (const [e, q] of [[EJERCICIOS_M1, PREGUNTAS_M1], [EJERCICIOS_M2, PREGUNTAS_M2], [EJERCICIOS_M3, PREGUNTAS_M3]] as const) {
      expect(e).toHaveLength(4)
      expect(e.filter((x) => x.nivel === 'Intermedio')).toHaveLength(2)
      expect(q).toHaveLength(6)
      expect(new Set(q.map((p) => p.tipo))).toEqual(new Set(['opcion', 'vf', 'numerica']))
    }
  })
  it('la solución del ejercicio queda oculta hasta pulsar su botón', async () => {
    render(<Ejercicios items={[{ id: 'x', nivel: 'Intermedio', titulo: 't', enunciado: <p>enun</p>, solucion: <p>SOL</p> }]} />)
    expect(screen.queryByText('SOL')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /ver solución/i }))
    expect(screen.getByText('SOL')).toBeVisible()
  })
  it('autoevaluación: califica numérica con tolerancia y muestra puntaje', async () => {
    render(<Autoevaluacion preguntas={PREGUNTAS_M1} />)
    await userEvent.type(screen.getAllByRole('textbox')[1], '3,7504')
    await userEvent.type(screen.getAllByRole('textbox')[0], '19')
    await userEvent.click(screen.getByRole('button', { name: /comprobar/i }))
    expect(screen.getByText(/Puntaje: 1 de 6/)).toBeVisible()
    expect(screen.getByText(/x₁ = 6 − 27\/12/)).toBeVisible()
  })
})
