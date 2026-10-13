import { useState } from 'react'

export interface Ejercicio {
  id: string
  nivel: 'Intermedio' | 'Avanzado'
  titulo: string
  enunciado: React.ReactNode
  /** Verificación opcional con la calculadora del módulo. */
  verificar?: React.ReactNode
  solucion: React.ReactNode
}

/** Cada solución se oculta tras su propio botón para poder intentarlo primero. */
export default function Ejercicios({ items }: { items: Ejercicio[] }) {
  const [visibles, setVisibles] = useState<Record<string, boolean>>({})
  return (
    <ol className="ejercicios">
      {items.map((e, i) => {
        const abierto = !!visibles[e.id]
        const idSol = `sol-${e.id}`
        return (
          <li key={e.id} className="ejercicio">
            <h3>Ejercicio {i + 1} · <span className="nivel">{e.nivel}</span>: {e.titulo}</h3>
            <div>{e.enunciado}</div>
            {e.verificar && <p className="aviso">{e.verificar}</p>}
            <button type="button" aria-expanded={abierto} aria-controls={idSol}
              onClick={() => setVisibles({ ...visibles, [e.id]: !abierto })}>
              {abierto ? `Ocultar solución del ejercicio ${i + 1}` : `Ver solución del ejercicio ${i + 1}`}
            </button>
            {abierto && <div id={idSol} className="solucion">{e.solucion}</div>}
          </li>
        )
      })}
    </ol>
  )
}
