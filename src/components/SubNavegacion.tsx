import { NavLink } from 'react-router-dom'

export interface EnlaceTema {
  ruta: string
  titulo: string
}

/** Páginas de un mismo tema (p. ej. métodos cerrados, abiertos y polinomios): la actual queda marcada con aria-current. */
export default function SubNavegacion({ enlaces, etiqueta }: { enlaces: EnlaceTema[]; etiqueta: string }) {
  return (
    <nav aria-label={etiqueta}>
      <ul className="subnav">
        {enlaces.map((e) => (
          <li key={e.ruta}><NavLink to={e.ruta} end>{e.titulo}</NavLink></li>
        ))}
      </ul>
    </nav>
  )
}
