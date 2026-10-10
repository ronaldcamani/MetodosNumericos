import { Link } from 'react-router-dom'
import { MODULOS } from '../modules/registro'

export default function Inicio() {
  return (
    <>
      <h1>Portal de Métodos Numéricos</h1>
      <p>Estudia cada método, ejecútalo con datos editables y comprueba su precisión con problemas de Ingeniería de Sistemas. Los datos de los casos son sintéticos.</p>
      <ul className="tarjetas">
        {MODULOS.map((m) => (
          <li key={m.id} className="tarjeta">
            <h2>Módulo {m.equipo}: {m.titulo}</h2>
            <p>{m.descripcion}</p>
            <p className="metodos">{m.metodos.join(' · ')}</p>
            {m.disponible ? <Link to={m.ruta}>Abrir módulo</Link> : <span className="pendiente">Próximamente</span>}
          </li>
        ))}
      </ul>
    </>
  )
}
