import { useId } from 'react'

interface Props {
  etiqueta: string
  valor: string
  onChange: (v: string) => void
  opciones: { valor: string; texto: string }[]
}

export default function Selector({ etiqueta, valor, onChange, opciones }: Props) {
  const id = useId()
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <select id={id} value={valor} onChange={(e) => onChange(e.target.value)}>
        {opciones.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
      </select>
    </div>
  )
}
