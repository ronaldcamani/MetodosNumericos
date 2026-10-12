import { eliminacionGauss, gaussSeidel, dominanciaDiagonalEstricta, determinante, permutacionDominante } from '.'
import referencia from './referencia.json'

const A = [[4, 1, 1], [1, 5, 1], [1, 1, 6]]
const b = [9, 14, 21]
const TOL = 1e-6

describe('Eliminación gaussiana — caso base', () => {
  const r = eliminacionGauss({ A, b })
  it('solución exacta (1, 2, 3)', () => {
    expect(r.estado).toBe('ok')
    r.resultado!.x.forEach((v, i) => expect(v).toBeCloseTo([1, 2, 3][i], 12))
  })
  it('sustituyendo en las tres ecuaciones el residuo es ~0', () => {
    expect(r.resultado!.residuoInf).toBeLessThan(1e-12)
  })
  it('muestra una matriz intermedia por columna eliminada, triangular al final', () => {
    expect(r.pasos).toHaveLength(2)
    const ultima = r.pasos[1].matriz
    expect(ultima[1][0]).toBe(0)
    expect(ultima[2][0]).toBe(0)
    expect(ultima[2][1]).toBe(0)
  })
})

describe('Eliminación gaussiana — pivoteo parcial', () => {
  it('intercambia filas cuando el pivote es pequeño', () => {
    const r = eliminacionGauss({ A: [[0.001, 2, 1], [3, 1, 1], [1, 1, 5]], b: [4, 5, 7] })
    expect(r.estado).toBe('ok')
    expect(r.pasos[0].intercambio).toEqual([0, 1])
    expect(r.resultado!.intercambios).toBeGreaterThanOrEqual(1)
  })
  it('un cero en la diagonal se resuelve con intercambio', () => {
    const r = eliminacionGauss({ A: [[0, 1], [1, 0]], b: [2, 3] })
    expect(r.estado).toBe('ok')
    expect(r.resultado!.x).toEqual([3, 2])
  })
  it('advierte de pivotes pequeños sin detener el cálculo', () => {
    const r = eliminacionGauss({ A: [[1, 1], [1, 1 + 1e-9]], b: [2, 2] })
    expect(r.estado).toBe('ok')
    expect(r.resultado!.advertencias.length).toBeGreaterThan(0)
  })
})

describe('Eliminación gaussiana — fallos', () => {
  it('filas (1,2) y (2,4) con b=(3,6): singular, sin solución', () => {
    const r = eliminacionGauss({ A: [[1, 2], [2, 4]], b: [3, 6] })
    expect(r.estado).toBe('singular')
    expect(r.resultado).toBeNull()
    expect(r.mensaje).toMatch(/singular/i)
  })
  it('matriz nula es singular', () => {
    expect(eliminacionGauss({ A: [[0, 0], [0, 0]], b: [0, 0] }).estado).toBe('singular')
  })
  it.each([
    ['tamaño 1', { A: [[1]], b: [1] }],
    ['tamaño 5', { A: Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 }, (_, j) => (i === j ? 1 : 0))), b: [1, 1, 1, 1, 1] }],
    ['no cuadrada', { A: [[1, 2, 3], [4, 5, 6]], b: [1, 2] }],
    ['b de otro tamaño', { A: [[1, 0], [0, 1]], b: [1] }],
    ['NaN', { A: [[1, NaN], [0, 1]], b: [1, 1] }],
    ['fuera de rango', { A: [[1e9, 0], [0, 1]], b: [1, 1] }],
  ])('rechaza %s', (_n, e) => {
    expect(eliminacionGauss(e).estado).toBe('invalido')
  })
})

describe('Gauss-Seidel — caso base', () => {
  const r = gaussSeidel({ A, b, tol: TOL, maxIter: 100 })
  it('primera iteración desde cero ≈ (2.25, 2.35, 2.7333333333)', () => {
    const [x1, x2, x3] = r.pasos[0].x
    expect(x1).toBe(2.25)
    expect(x2).toBeCloseTo(2.35, 12)
    expect(x3).toBeCloseTo(2.7333333333, 9)
  })
  it('converge a (1, 2, 3) con residuo ≤ tolerancia', () => {
    expect(r.estado).toBe('convergio')
    expect(r.resultado!.residuoInf).toBeLessThanOrEqual(TOL)
    r.resultado!.x.forEach((v, i) => expect(v).toBeCloseTo([1, 2, 3][i], 5))
  })
  it('detecta la dominancia diagonal estricta del caso base', () => {
    expect(r.resultado!.dominanciaEstricta).toBe(true)
    expect(dominanciaDiagonalEstricta([[1, 2], [2, 1]])).toBe(false)
  })
  it('el residuo decrece en cada iteración', () => {
    r.pasos.slice(1).forEach((p, i) => expect(p.residuoInf).toBeLessThan(r.pasos[i].residuoInf))
  })
})

describe('Gauss-Seidel — fallos y límites', () => {
  it('diagonal nula: singular, sin dividir por cero', () => {
    const r = gaussSeidel({ A: [[0, 1], [1, 0]], b: [1, 1], tol: TOL, maxIter: 10 })
    expect(r.estado).toBe('singular')
  })
  it('agotar el límite no es convergencia', () => {
    const r = gaussSeidel({ A, b, tol: TOL, maxIter: 2 })
    expect(r.estado).toBe('max_iter')
    expect(r.resultado).toBeNull()
    expect(r.pasos).toHaveLength(2)
  })
  it('sistema no dominante que diverge no se presenta como solución', () => {
    const r = gaussSeidel({ A: [[1, 3], [4, 1]], b: [1, 1], tol: TOL, maxIter: 1000 })
    expect(r.estado).not.toBe('convergio')
  })
  it('singular (1,2),(2,4): se advierte y no se muestra una solución única', () => {
    const r = gaussSeidel({ A: [[1, 2], [2, 4]], b: [3, 6], tol: TOL, maxIter: 100 })
    expect(r.estado).toBe('singular')
    expect(r.resultado).toBeNull()
    expect(r.pasos).toHaveLength(0)
  })
  it.each([
    ['tolerancia 0', { tol: 0, maxIter: 10 }],
    ['maxIter 0', { tol: TOL, maxIter: 0 }],
    ['maxIter decimal', { tol: TOL, maxIter: 1.5 }],
    ['tolerancia NaN', { tol: NaN, maxIter: 10 }],
  ])('rechaza %s', (_n, e) => {
    expect(gaussSeidel({ A, b, ...e }).estado).toBe('invalido')
  })
})

describe('Contraste con la referencia independiente (Python: numpy)', () => {
  const casos = Object.entries(referencia.casos) as [string, { A: number[][]; b: number[]; solucion: number[]; gs_iteraciones?: number; gs_x?: number[] }][]
  it.each(casos)('Gauss: %s coincide con numpy.linalg.solve', (_n, c) => {
    const r = eliminacionGauss({ A: c.A, b: c.b })
    expect(r.estado).toBe('ok')
    r.resultado!.x.forEach((v, i) => expect(v).toBeCloseTo(c.solucion[i], 10))
  })
  it.each(casos.filter(([, c]) => c.gs_iteraciones))('Gauss-Seidel: %s mismas iteraciones y solución', (_n, c) => {
    const r = gaussSeidel({ A: c.A, b: c.b, tol: TOL, maxIter: 100 })
    expect(r.estado).toBe('convergio')
    expect(r.resultado!.iteraciones).toBe(c.gs_iteraciones)
    r.resultado!.x.forEach((v, i) => expect(v).toBeCloseTo(c.gs_x![i], 10))
  })
  it('el sistema singular de la referencia tiene rango 1 y el motor lo rechaza', () => {
    expect(referencia.singular.rango).toBe(1)
    expect(eliminacionGauss({ A: referencia.singular.A, b: referencia.singular.b }).estado).toBe('singular')
  })
})

describe('Ejercicios de práctica (referencia numpy)', () => {
  const { ejercicio1: e1, ejercicio2: e2, ejercicio3: e3 } = referencia.ejercicios
  it('ejercicio 1: eliminación gaussiana 3×3 da (7, 7, 25)', () => {
    const r = eliminacionGauss({ A: e1.A, b: e1.b })
    expect(r.estado).toBe('ok')
    r.resultado!.x.forEach((v, i) => expect(v).toBeCloseTo([7, 7, 25][i], 8))
    expect(r.resultado!.residuoInf).toBeLessThan(1e-10)
  })
  it('ejercicio 2: sistema 4×4 con ceros en la diagonal da (31, 37, −34, 19)', () => {
    const r = eliminacionGauss({ A: e2.A, b: e2.b })
    expect(r.estado).toBe('ok')
    r.resultado!.x.forEach((v, i) => expect(v).toBeCloseTo([31, 37, -34, 19][i], 8))
    expect(r.resultado!.intercambios).toBeGreaterThan(0)
    expect(r.pasos).toHaveLength(3)
  })
  it('ejercicio 3 tal como está escrito: no es dominante y Gauss-Seidel no converge', () => {
    expect(dominanciaDiagonalEstricta(e3.A)).toBe(false)
    const r = gaussSeidel({ A: e3.A, b: e3.b, tol: e3.tol, maxIter: 100, x0: e3.x0 })
    expect(r.estado).not.toBe('convergio')
    expect(r.resultado).toBeNull()
    expect(r.mensaje).toMatch(/reordenar/i)
  })
  it('ejercicio 3 reordenado: x0 = (1,1,1), tol 1e-4, mismas iteraciones que la referencia', () => {
    expect(permutacionDominante(e3.A)).toEqual(e3.permutacion)
    const r = gaussSeidel({ A: e3.A, b: e3.b, tol: e3.tol, maxIter: 100, x0: e3.x0, reordenar: true })
    expect(r.estado).toBe('convergio')
    expect(r.resultado!.permutacion).toEqual([1, 2, 0])
    expect(r.resultado!.iteraciones).toBe(e3.gs_iteraciones)
    expect(r.pasos[0].x[0]).toBeCloseTo(e3.gs_primera[0], 12)
    r.resultado!.x.forEach((v, i) => expect(v).toBeCloseTo(e3.gs_x[i], 12))
    r.resultado!.x.forEach((v, i) => expect(Math.abs(v - e3.solucion[i])).toBeLessThan(1e-4))
    expect(r.mensaje).toMatch(/filas 2, 3, 1/)
  })
  it('reordenar sin solución posible lo informa y no inventa un orden', () => {
    const r = gaussSeidel({ A: [[1, 1], [1, 1.5]], b: [2, 3], tol: 1e-6, maxIter: 5, reordenar: true })
    expect(r.mensaje).toMatch(/No existe un reordenamiento/)
  })
  it('reordenar no altera un sistema ya dominante', () => {
    const r = gaussSeidel({ A, b, tol: TOL, maxIter: 100, reordenar: true })
    expect(r.resultado!.permutacion).toBeNull()
    expect(r.resultado!.iteraciones).toBe(gaussSeidel({ A, b, tol: TOL, maxIter: 100 }).resultado!.iteraciones)
  })
  it('vector inicial inválido se rechaza', () => {
    expect(gaussSeidel({ A, b, tol: TOL, maxIter: 5, x0: [1, 1] }).estado).toBe('invalido')
    expect(gaussSeidel({ A, b, tol: TOL, maxIter: 5, x0: [1, NaN, 1] }).estado).toBe('invalido')
  })
})

describe('determinante', () => {
  it('2×2, 3×3 y 4×4', () => {
    expect(determinante([[1, 2], [3, 4]])).toBe(-2)
    expect(determinante([[2, 0, 0], [0, 3, 0], [0, 0, 4]])).toBe(24)
    expect(determinante([[1, -1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 2], [2, 0, 0, -3]])).toBeCloseTo(1, 12)
  })
})
