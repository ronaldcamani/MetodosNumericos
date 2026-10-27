import type { ResultadoMetodo } from '../tipos'
import { derivada, exacta, LIMITES_M5, validarEnfriamiento, type Enfriamiento, type MetodoEDO } from './comun'
import { factorEuler, factorRK4, limiteEuler, limiteRK4 } from './estabilidad'

export interface PasoEDO {
  /** Índice del nodo (0 es la condición inicial). */
  i: number
  t: number
  /** Longitud del paso que llevó a este nodo (0 en el nodo inicial). */
  h: number
  T: number
  /** Cambio de temperatura en este paso: Tᵢ − Tᵢ₋₁. */
  incremento: number
  exacta: number
  error: number
  /** Solo RK4: las cuatro pendientes k₁, k₂, k₃, k₄ de este paso. */
  k?: [number, number, number, number]
  /** True si es el último paso acortado para llegar justo al tiempo final. */
  corto: boolean
}

export interface SalidaEDO {
  metodo: MetodoEDO
  n: number
  h: number
  errorMaximo: number
  errorFinal: number
  /** Longitud del último paso si fue más corto que h; null si h divide el intervalo. */
  ultimoPasoCorto: number | null
  /** Factor de amplificación por paso del método en este modelo. */
  factor: number
  fisicamenteValida: boolean
  advertencias: string[]
}

export const NOMBRE_EDO: Record<MetodoEDO, string> = { euler: 'Euler explícito', rk4: 'Runge-Kutta 4' }

const falla = (estado: ResultadoMetodo<never, never>['estado'], mensaje: string, pasos: PasoEDO[] = []): ResultadoMetodo<SalidaEDO, PasoEDO> => ({ estado, mensaje, resultado: null, pasos })

/**
 * Integra T′ = −k (T − Tₐ) de 0 a t_f con paso h. Si h no divide el intervalo, el último paso es más corto y se registra.
 * Devuelve siempre los nodos; si el método es inestable con ese h el estado es `no_converge` y no se afirma ninguna solución.
 */
export function integrarEnfriamiento(metodo: MetodoEDO, p: Enfriamiento, h: number): ResultadoMetodo<SalidaEDO, PasoEDO> {
  const error = validarEnfriamiento(p)
  if (error) return falla('invalido', error)
  if (!Number.isFinite(h) || h <= 0) return falla('invalido', 'El paso h debe ser un número positivo: con h ≤ 0 el tiempo no avanza.')
  if (h < LIMITES_M5.hMin) return falla('invalido', `El paso h debe ser ≥ ${LIMITES_M5.hMin} min.`)
  const n = Math.ceil(p.tf / h - 1e-9)
  if (n > LIMITES_M5.maxPasos) return falla('invalido', `Con h = ${h} harían falta ${n} pasos; el máximo es ${LIMITES_M5.maxPasos}. Aumenta h o reduce el tiempo final.`)

  const pasos: PasoEDO[] = [{ i: 0, t: 0, h: 0, T: p.T0, incremento: 0, exacta: p.T0, error: 0, corto: false }]
  let T = p.T0
  let tPrevio = 0
  for (let i = 1; i <= n; i++) {
    const t = i === n ? p.tf : i * h
    const hh = t - tPrevio
    let k: [number, number, number, number] | undefined
    let siguiente: number
    if (metodo === 'euler') {
      siguiente = T + hh * derivada(p, T)
    } else {
      const k1 = derivada(p, T)
      const k2 = derivada(p, T + (hh / 2) * k1)
      const k3 = derivada(p, T + (hh / 2) * k2)
      const k4 = derivada(p, T + hh * k3)
      k = [k1, k2, k3, k4]
      siguiente = T + (hh / 6) * (k1 + 2 * k2 + 2 * k3 + k4)
    }
    if (!Number.isFinite(siguiente)) return falla('no_finito', `La temperatura calculada dejó de ser finita en t = ${t} min.`, pasos)
    const ex = exacta(p, t)
    pasos.push({ i, t, h: hh, T: siguiente, incremento: siguiente - T, exacta: ex, error: Math.abs(siguiente - ex), k, corto: hh < h * (1 - 1e-9) })
    T = siguiente
    tPrevio = t
  }

  const errorMaximo = Math.max(...pasos.map((q) => q.error))
  const factor = metodo === 'euler' ? factorEuler(p.k, h) : factorRK4(p.k, h)
  const ultimo = pasos[pasos.length - 1]
  const ultimoPasoCorto = ultimo.corto ? ultimo.h : null

  // Validez física: la temperatura debe acercarse monótonamente a Tₐ sin cruzarla.
  const tol = 1e-9 * Math.max(1, Math.abs(p.T0 - p.Ta))
  const fisicamenteValida = pasos.every((q, i) => {
    const d = q.T - p.Ta
    const lado = Math.sign(p.T0 - p.Ta)
    return lado === 0 ? Math.abs(d) <= tol : d * lado >= -tol && (i === 0 || Math.abs(d) <= Math.abs(pasos[i - 1].T - p.Ta) + tol)
  })

  const advertencias: string[] = []
  const limite = metodo === 'euler' ? limiteEuler(p.k) : limiteRK4(p.k)
  const inestable = Math.abs(factor) > 1 + 1e-12
  if (h > p.tf) advertencias.push(`El paso (${h} min) es mayor que el horizonte (${p.tf} min): se da un único paso de ${p.tf} min.`)
  if (ultimoPasoCorto !== null) advertencias.push(`h = ${h} no divide el intervalo: el último paso es más corto (${ultimoPasoCorto.toPrecision(6).replace(/\.?0+$/, '')} min) para llegar exactamente a t = ${p.tf} min.`)
  if (inestable) {
    advertencias.push(`${NOMBRE_EDO[metodo]} es inestable con h = ${h} min: |factor por paso| = ${Math.abs(factor).toPrecision(5)} > 1 (la condición es 0 < h < ${limite.toPrecision(4)} min con k = ${p.k}). El error se amplifica en cada paso.`)
  }
  if (!fisicamenteValida) advertencias.push('La trayectoria calculada NO es físicamente válida: la temperatura real baja sin cruzar la ambiente ni oscilar. Es solo lo que produce el método con este paso.')
  else if (metodo === 'euler' && p.k * h > 1) advertencias.push('El método converge pero con oscilaciones: revisa la validez física de la trayectoria.')

  if (inestable) {
    return { estado: 'no_converge', mensaje: `${NOMBRE_EDO[metodo]} es inestable con h = ${h} min: la trayectoria calculada se aleja de la solución en lugar de acercarse.`, resultado: null, pasos }
  }
  return {
    estado: 'ok',
    mensaje: `${NOMBRE_EDO[metodo]} con h = ${h} min (${n} paso${n === 1 ? '' : 's'}): T(${p.tf}) ≈ ${ultimo.T}. Error máximo sobre los nodos: ${errorMaximo}.`,
    resultado: { metodo, n, h, errorMaximo, errorFinal: ultimo.error, ultimoPasoCorto, factor, fisicamenteValida, advertencias },
    pasos,
  }
}

/** Advertencias de una ejecución inestable (el motor no entrega resultado en ese caso, pero la interfaz las muestra). */
export function advertenciasEDO(metodo: MetodoEDO, p: Enfriamiento, h: number): string[] {
  const r = integrarEnfriamiento(metodo, p, h)
  if (r.resultado) return r.resultado.advertencias
  const factor = metodo === 'euler' ? factorEuler(p.k, h) : factorRK4(p.k, h)
  const limite = metodo === 'euler' ? limiteEuler(p.k) : limiteRK4(p.k)
  return Math.abs(factor) > 1
    ? [`${NOMBRE_EDO[metodo]} es inestable con h = ${h} min: |factor por paso| = ${Math.abs(factor).toPrecision(5)} > 1 (la condición es 0 < h < ${limite.toPrecision(4)} min con k = ${p.k}).`, 'La trayectoria calculada NO es físicamente válida: la temperatura real baja sin cruzar la ambiente ni oscilar.']
    : []
}
