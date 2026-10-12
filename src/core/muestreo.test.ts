import { muestrear } from './muestreo'

describe('muestrear', () => {
  it('incluye ambos extremos y n+1 puntos', () => {
    const { x, y } = muestrear((t) => t * t, 0, 2, 4)
    expect(x).toEqual([0, 0.5, 1, 1.5, 2])
    expect(y).toEqual([0, 0.25, 1, 2.25, 4])
  })
  it('convierte valores no finitos en null', () => {
    expect(muestrear((t) => 1 / t, 0, 1, 2).y[0]).toBeNull()
  })
})
