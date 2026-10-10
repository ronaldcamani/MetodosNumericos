/** Contrato común de todos los motores numéricos del portal (guía §3). */
export type Estado =
  | 'ok' // método directo terminado correctamente
  | 'convergio' // método iterativo alcanzó el criterio de parada
  | 'max_iter' // se agotó el límite: NO implica convergencia
  | 'invalido' // entrada inválida
  | 'singular'
  | 'no_finito'
  | 'derivada_nula'
  | 'sin_cambio_signo'

export interface ResultadoMetodo<R, P> {
  estado: Estado
  mensaje: string
  /** null cuando el método no produjo un resultado válido. */
  resultado: R | null
  pasos: P[]
}

export const esExito = (e: Estado): boolean => e === 'ok' || e === 'convergio'
