import { describe, expect, it } from 'vitest'
import {
  descomposicionLU,
  eliminacionGauss,
  eliminacionGaussJordan,
  invertirMatriz,
  matrizHilbert,
  normaMatrizInf,
  numeroCondicionInf,
} from '.'

const A = [
  [4, 1, 1],
  [1, 5, 1],
  [1, 1, 6],
]
const b = [9, 14, 21]

describe('Tema 06 (Cap. III): Gauss-Jordan, Descomposición LU y Número de Condición κ∞(A)', () => {
  it('Gauss-Jordan resuelve el caso base a (1, 2, 3) y alcanza [I | x]', () => {
    const r = eliminacionGaussJordan({ A, b })
    expect(r.estado).toBe('ok')
    expect(r.resultado).not.toBeNull()
    r.resultado!.x.forEach((v, i) => expect(v).toBeCloseTo([1, 2, 3][i], 12))
    expect(r.resultado!.residuoInf).toBeLessThan(1e-12)

    const ultima = r.pasos[r.pasos.length - 1].matriz
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(ultima[i][j]).toBeCloseTo(i === j ? 1 : 0, 12)
      }
    }
    expect(r.resultado!.condicion).not.toBeNull()
    expect(r.resultado!.condicion!.malCondicionado).toBe(false)
  })

  it('Gauss-Jordan resuelve sistema con ceros en la diagonal mediante pivoteo parcial', () => {
    const r = eliminacionGaussJordan({
      A: [
        [0, 1, 2],
        [2, 3, 1],
        [1, 0, -1],
      ],
      b: [5, 8, -2],
    })
    const ref = eliminacionGauss({
      A: [
        [0, 1, 2],
        [2, 3, 1],
        [1, 0, -1],
      ],
      b: [5, 8, -2],
    })
    expect(r.estado).toBe('ok')
    r.resultado!.x.forEach((v, i) => expect(v).toBeCloseTo(ref.resultado!.x[i], 11))
  })

  it('Descomposición LU (PA = LU) produce L triangular inferior unitaria, U superior y y, x exactos', () => {
    const r = descomposicionLU({
      A: [
        [0.001, 2, 1],
        [3, 1, 1],
        [1, 1, 5],
      ],
      b: [4, 5, 7],
    })
    expect(r.estado).toBe('ok')
    const res = r.resultado!
    expect(res.intercambios).toBeGreaterThanOrEqual(1)
    expect(res.errorFactorizacionInf).toBeLessThan(1e-12)
    expect(res.residuoInf).toBeLessThan(1e-12)
    for (let i = 0; i < 3; i++) {
      expect(res.L[i][i]).toBe(1)
      for (let j = i + 1; j < 3; j++) expect(res.L[i][j]).toBe(0)
      for (let j = 0; j < i; j++) expect(res.U[i][j]).toBe(0)
    }
    const gauss = eliminacionGauss({
      A: [
        [0.001, 2, 1],
        [3, 1, 1],
        [1, 1, 5],
      ],
      b: [4, 5, 7],
    })
    res.x.forEach((v, i) => expect(v).toBeCloseTo(gauss.resultado!.x[i], 11))
  })

  it('detecta sistemas singulares e inválidos en Gauss-Jordan y LU', () => {
    expect(eliminacionGaussJordan({ A: [[1, 2], [2, 4]], b: [3, 6] }).estado).toBe('singular')
    expect(descomposicionLU({ A: [[1, 2], [2, 4]], b: [3, 6] }).estado).toBe('singular')
    expect(eliminacionGaussJordan({ A: [[1]], b: [1] }).estado).toBe('invalido')
    expect(descomposicionLU({ A: [[1, Number.NaN], [0, 1]], b: [1, 1] }).estado).toBe('invalido')
  })

  it('calcula A⁻¹, ‖A‖∞ y κ∞(A) en matrices bien condicionadas y de Hilbert 3×3 y 4×4', () => {
    expect(normaMatrizInf([[1, -2], [3, 4]])).toBe(7)
    const inv = invertirMatriz(A)
    expect(inv).not.toBeNull()

    const condH3 = numeroCondicionInf(matrizHilbert(3))
    expect(condH3).not.toBeNull()
    expect(condH3!.kappaInf).toBeCloseTo(748, 0)
    expect(condH3!.malCondicionado).toBe(false)

    const H4 = matrizHilbert(4)
    const condH4 = numeroCondicionInf(H4)
    expect(condH4).not.toBeNull()
    expect(condH4!.kappaInf).toBeCloseTo(28375, 0)
    expect(condH4!.malCondicionado).toBe(true)

    const rLU = descomposicionLU({ A: H4, b: [1, 0, 0, 0] })
    expect(rLU.estado).toBe('ok')
    expect(rLU.resultado!.advertencias.join(' ')).toMatch(/mal condicionado|κ∞/i)
  })
})
