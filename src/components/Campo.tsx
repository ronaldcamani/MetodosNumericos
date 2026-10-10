import { useId } from 'react'

interface Props {
  etiqueta: string
  valor: string
  onChange: (v: string) => void
  error?: string | null
  ayuda?: string
  unidad?: string
}

export default function Campo({ etiqueta, valor, onChange, error, ayuda, unidad }: Props) {
  const id = useId()
  const desc = [ayuda && `${id}-a`, error && `${id}-e`].filter(Boolean).join(' ') || undefined
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}{unidad ? ` (${unidad})` : ''}</label>
      <input id={id} type="text" inputMode="decimal" value={valor} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={desc} />
      {ayuda && <small id={`${id}-a`}>{ayuda}</small>}
      {error && <small id={`${id}-e`} className="campo-error">✖ {error}</small>}
    </div>
  )
}
