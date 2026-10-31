import { MAX_ESTRELLAS } from '../core/practica/progreso'

/** ★★☆: el significado va en el texto accesible, no solo en el símbolo. */
export default function Estrellas({ n }: { n: number }) {
  return (
    <span className="estrellas" role="img" aria-label={`${n} de ${MAX_ESTRELLAS} estrellas`}>
      {Array.from({ length: MAX_ESTRELLAS }, (_, i) => (i < n ? '★' : '☆')).join('')}
    </span>
  )
}
