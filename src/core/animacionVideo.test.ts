import { describe, expect, it } from 'vitest'
import { Easing, clamp, interpolate, progresoAFrame, spring } from './animacionVideo'

describe('animacionVideo (motor 60 FPS estilo Remotion)', () => {
  it('clamp limita valores dentro del rango', () => {
    expect(clamp(-2, 0, 1)).toBe(0)
    expect(clamp(0.42, 0, 1)).toBe(0.42)
    expect(clamp(5, 0, 1)).toBe(1)
  })

  it('interpolate maneja rangos crecientes, decrecientes, clamp y extend', () => {
    expect(interpolate(0.5, [0, 1], [10, 50])).toBe(30)
    expect(interpolate(-1, [0, 1], [10, 50])).toBe(10)
    expect(interpolate(2, [0, 1], [10, 50])).toBe(50)
    expect(
      interpolate(2, [0, 1], [10, 50], { extrapolateRight: 'extend' }),
    ).toBe(90)
    expect(
      interpolate(-0.5, [0, 1], [10, 50], { extrapolateLeft: 'extend' }),
    ).toBe(-10)
    expect(interpolate(0.25, [0, 1], [100, 0])).toBe(75)
  })

  it('interpolate aplica easing sin salirse en los extremos', () => {
    const medio = interpolate(0.5, [0, 1], [0, 100], {
      easing: Easing.easeOutExpo,
    })
    expect(medio).toBeGreaterThan(95)
    expect(
      interpolate(1, [0, 1], [0, 100], { easing: Easing.easeOutExpo }),
    ).toBe(100)
    expect(
      interpolate(0, [0, 1], [0, 100], { easing: Easing.easeOutCubic }),
    ).toBe(0)
  })

  it('spring parte en 0, respeta delay y converge suavemente a 1', () => {
    expect(spring({ frame: 0, fps: 60 })).toBe(0)
    expect(spring({ frame: 10, fps: 60, delay: 15 })).toBe(0)
    const intermedio = spring({ frame: 18, fps: 60 })
    expect(intermedio).toBeGreaterThan(0.2)
    expect(spring({ frame: 240, fps: 60 })).toBe(1)
    // Sobreamortiguado nunca rebota sobre 1
    const sinRebote = spring({
      frame: 25,
      fps: 60,
      config: { damping: 40, stiffness: 120, mass: 1 },
    })
    expect(sinRebote).toBeGreaterThan(0)
    expect(sinRebote).toBeLessThanOrEqual(1)
  })

  it('progresoAFrame convierte progreso [0, 1] a frame a 60 FPS', () => {
    expect(progresoAFrame(0, 8, 60)).toBe(0)
    expect(progresoAFrame(0.5, 8, 60)).toBe(240)
    expect(progresoAFrame(1, 8, 60)).toBe(480)
  })
})
