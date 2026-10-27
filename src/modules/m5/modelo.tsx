import Campo from '../../components/Campo'
import type { Errores } from '../../components/useCalculadora'
import { parseNumero } from '../../core/entrada'
import type { Enfriamiento } from '../../core/m5'

/** Caso de partida de la guía: enfriamiento de un servidor, T′ = −0.5 (T − 20), T(0) = 80 °C, 2 min, paso 0.5 min. */
export const CASO_EDO = { T0: '80', Ta: '20', k: '0.5', tf: '2', h: '0.5' }
export type FEdo = typeof CASO_EDO

/** Prueba de la guía: paso demasiado grande con el horizonte ampliado a 20 minutos. */
export const EDO_H5: FEdo = { ...CASO_EDO, tf: '20', h: '5' }
/** Prueba de fallo de la guía: paso cero. */
export const EDO_H0: FEdo = { ...CASO_EDO, h: '0' }
/** El paso no divide el intervalo: el último paso es más corto. */
export const EDO_H03: FEdo = { ...CASO_EDO, h: '0.3' }

export interface EdoLeido extends Enfriamiento {
  h: number
}

export function leerEdo(v: FEdo): EdoLeido | { errores: Errores<FEdo> } {
  const n = { T0: parseNumero(v.T0), Ta: parseNumero(v.Ta), k: parseNumero(v.k), tf: parseNumero(v.tf), h: parseNumero(v.h) }
  const errores: Errores<FEdo> = {}
  ;(Object.keys(n) as (keyof FEdo)[]).forEach((k) => {
    if (n[k] === null) errores[k] = 'Ingresa un número.'
  })
  if (Object.keys(errores).length) return { errores }
  return n as EdoLeido
}

interface Props {
  valores: FEdo
  errores: Errores<FEdo>
  set: (k: keyof FEdo, v: string) => void
  /** Oculta el campo del paso (p. ej. cuando el paso viene de otra entrada). */
  sinPaso?: boolean
}

export function EditorEdo({ valores, errores, set, sinPaso }: Props) {
  return (
    <>
      <Campo etiqueta="Temperatura inicial T(0)" unidad="°C" valor={valores.T0} onChange={(x) => set('T0', x)} error={errores.T0} ayuda="El servidor empieza a esta temperatura." />
      <Campo etiqueta="Temperatura ambiente Tₐ" unidad="°C" valor={valores.Ta} onChange={(x) => set('Ta', x)} error={errores.Ta} ayuda="Hacia ella tiende la temperatura." />
      <Campo etiqueta="Constante de enfriamiento k" unidad="1/min" valor={valores.k} onChange={(x) => set('k', x)} error={errores.k} ayuda="Positiva: más grande, enfría más rápido." />
      <Campo etiqueta="Tiempo final" unidad="min" valor={valores.tf} onChange={(x) => set('tf', x)} error={errores.tf} />
      {!sinPaso && <Campo etiqueta="Paso h" unidad="min" valor={valores.h} onChange={(x) => set('h', x)} error={errores.h} ayuda="Cuánto avanza el tiempo en cada paso." />}
    </>
  )
}
