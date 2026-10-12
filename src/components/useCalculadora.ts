import { useState } from 'react'

export type Errores<F> = Partial<Record<keyof F, string>>
export interface Ejecucion<F, S> {
  errores?: Errores<F>
  salida?: S
}

/**
 * Estado de una calculadora: valores del formulario (texto), errores por campo y salida.
 * Cualquier edición descarta la salida anterior para no mostrar resultados obsoletos.
 */
export function useCalculadora<F extends Record<string, string>, S>(caso: F, ejecutar: (v: F) => Ejecucion<F, S>) {
  const [valores, setValores] = useState<F>(caso)
  const [errores, setErrores] = useState<Errores<F>>({})
  const [salida, setSalida] = useState<S | null>(null)

  const aplicar = (v: F) => {
    const r = ejecutar(v)
    setErrores(r.errores ?? {})
    setSalida(r.salida ?? null)
  }
  return {
    valores,
    errores,
    salida,
    set: (k: keyof F, v: string) => {
      setValores((p) => ({ ...p, [k]: v }))
      setSalida(null)
      setErrores((e) => ({ ...e, [k]: undefined }))
    },
    calcular: () => aplicar(valores),
    /** Carga valores arbitrarios (p. ej. una prueba de fallo) y calcula. */
    cargarYCalcular: (v: F) => {
      setValores(v)
      aplicar(v)
    },
    cargarCaso: () => {
      setValores(caso)
      aplicar(caso)
    },
    restablecer: () => {
      setValores(caso)
      setErrores({})
      setSalida(null)
    },
  }
}
