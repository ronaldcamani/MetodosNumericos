export type ModoExtrapolacion = 'clamp' | 'extend'

export interface OpcionesInterpolacion {
  extrapolateLeft?: ModoExtrapolacion
  extrapolateRight?: ModoExtrapolacion
  easing?: (t: number) => number
}

export interface ConfigResorte {
  damping?: number
  stiffness?: number
  mass?: number
}

export interface OpcionesResorte {
  frame: number
  fps?: number
  config?: ConfigResorte
  delay?: number
}

export const clamp = (valor: number, min: number, max: number): number =>
  Math.min(Math.max(valor, min), max)

export const Easing = {
  linear: (t: number): number => t,
  easeOutExpo: (t: number): number => {
    const x = clamp(t, 0, 1)
    return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)
  },
  easeOutCubic: (t: number): number => {
    const x = clamp(t, 0, 1)
    return 1 - Math.pow(1 - x, 3)
  },
  easeInOutCubic: (t: number): number => {
    const x = clamp(t, 0, 1)
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
  },
  easeOutBack: (t: number): number => {
    const x = clamp(t, 0, 1)
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
  },
} as const

/**
 * Interpola un valor de entrada sobre [inMin, inMax] hacia [outMin, outMax] estilo Remotion,
 * aplicando easing opcional y clamping seguro por defecto para coordenadas vectoriales.
 */
export function interpolate(
  input: number,
  inputRange: readonly [number, number],
  outputRange: readonly [number, number],
  options: OpcionesInterpolacion = {},
): number {
  const [inMin, inMax] = inputRange
  const [outMin, outMax] = outputRange
  const {
    extrapolateLeft = 'clamp',
    extrapolateRight = 'clamp',
    easing = Easing.linear,
  } = options

  if (inMax === inMin) {
    return input >= inMax ? outMax : outMin
  }

  let t = (input - inMin) / (inMax - inMin)
  if (t < 0 && extrapolateLeft === 'clamp') t = 0
  if (t > 1 && extrapolateRight === 'clamp') t = 1

  const eased = t >= 0 && t <= 1 ? easing(t) : t
  return outMin + eased * (outMax - outMin)
}

/**
 * Oscilador armónico amortiguado en forma cerrada (determinista cuadro a cuadro a 60 FPS).
 */
export function spring({
  frame,
  fps = 60,
  config = {},
  delay = 0,
}: OpcionesResorte): number {
  const damping = config.damping ?? 14
  const stiffness = config.stiffness ?? 140
  const mass = Math.max(0.1, config.mass ?? 1)
  const safeFps = Math.max(1, fps)
  const t = Math.max(0, (frame - delay) / safeFps)

  if (t <= 0) return 0

  const w0 = Math.sqrt(stiffness / mass)
  const zeta = damping / (2 * Math.sqrt(stiffness * mass))
  const env = Math.exp(-zeta * w0 * t)

  let valor: number
  if (Math.abs(zeta - 1) < 1e-6) {
    valor = 1 - Math.exp(-w0 * t) * (1 + w0 * t)
  } else if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta)
    valor =
      1 -
      env *
        (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t))
  } else {
    const root = Math.sqrt(zeta * zeta - 1)
    const g1 = w0 * (zeta - root)
    const g2 = w0 * (zeta + root)
    valor = 1 - (g2 * Math.exp(-g1 * t) - g1 * Math.exp(-g2 * t)) / (g2 - g1)
  }

  if (env < 5e-4 && Math.abs(1 - valor) < 5e-4) return 1
  return valor
}

export function progresoAFrame(
  progreso: number,
  duracionSeg: number,
  fps = 60,
): number {
  return Math.max(0, clamp(progreso, 0, 1) * Math.max(0, duracionSeg) * fps)
}
