import { Link } from 'react-router-dom'
import { dominio, estrellas, etiquetaDominio } from '../core/practica/progreso'
import Estrellas from '../components/Estrellas'
import { useProgreso } from '../components/useProgreso'
import { NIVELES } from '../core/practica/base'
import { MODULOS } from '../modules/registro'

/** Avance del estudiante en el tema: se llena al resolver la práctica por niveles. */
function AvanceTema({ tema }: { tema: string }) {
  const { progreso: p } = useProgreso(tema)
  const pct = dominio(p)
  const total = NIVELES.reduce((s, n) => s + estrellas(p.correctas[n]), 0)
  return (
    <p className="avance-tarjeta">
      <span className="barra" role="progressbar" aria-label={`Dominio de ${tema}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><span style={{ width: `${pct}%` }} /></span>
      {etiquetaDominio(pct)} · {pct} % · <Estrellas n={Math.min(3, Math.round(total / 3))} /> · {p.puntos} puntos
    </p>
  )
}

export default function Inicio() {
  return (
    <>
      <h1>Portal de Métodos Numéricos</h1>
      <p>Estudia cada método, ejecútalo con datos editables y comprueba su precisión con problemas de Ingeniería de Sistemas. Los datos de los casos son sintéticos. ¿Primera vez? Mira <Link to="/recursos">cómo estudiar un tema</Link>.</p>
      <ul className="tarjetas">
        {MODULOS.map((m) => (
          <li key={m.id} className="tarjeta">
            <h2>{m.titulo}</h2>
            <p>{m.descripcion}</p>
            <p className="metodos">{m.metodos.join(' · ')}</p>
            {m.disponible && <AvanceTema tema={m.id} />}
            {m.disponible ? <Link to={m.ruta}>Abrir tema</Link> : <span className="pendiente">Próximamente</span>}
            {m.subpaginas && (
              <ul className="metodos" aria-label={`Páginas de ${m.titulo}`}>
                {m.subpaginas.map((p) => <li key={p.ruta}><Link to={p.ruta}>{p.titulo}</Link></li>)}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
