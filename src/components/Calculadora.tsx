import type { FormEvent, ReactNode } from 'react'

interface Props {
  titulo: string
  children: ReactNode // campos del formulario
  onCalcular: () => void
  onCargarCaso: () => void
  onRestablecer: () => void
  salida?: ReactNode
  /** Botones adicionales (p. ej. cargar una prueba de fallo). */
  extras?: ReactNode
}

/** Estructura común: datos precargados editables, calcular, cargar caso base y restablecer. */
export default function Calculadora({ titulo, children, onCalcular, onCargarCaso, onRestablecer, salida, extras }: Props) {
  const enviar = (e: FormEvent) => {
    e.preventDefault()
    onCalcular()
  }
  return (
    <section className="calculadora" aria-label={titulo}>
      <h3>{titulo}</h3>
      <form onSubmit={enviar} noValidate>
        <div className="campos">{children}</div>
        <div className="acciones">
          <button type="submit">Calcular</button>
          <button type="button" onClick={onCargarCaso}>Cargar caso base</button>
          <button type="button" onClick={onRestablecer}>Restablecer</button>
          {extras}
        </div>
      </form>
      <div className="salida" aria-live="polite">{salida}</div>
    </section>
  )
}
