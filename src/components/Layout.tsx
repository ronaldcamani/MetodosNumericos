import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { MODULOS } from '../modules/registro'

export default function Layout() {
  const { pathname } = useLocation()
  const enModulo = pathname !== '/'
  return (
    <>
      <a className="saltar" href="#contenido">Saltar al contenido</a>
      <header className="cabecera">
        <Link to="/" className="marca">Métodos Numéricos</Link>
        <nav aria-label="Módulos">
          <ul className="nav-lista">
            {MODULOS.map((m) => (
              <li key={m.id}>
                <NavLink to={m.ruta}>M{m.equipo}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="contenido" tabIndex={-1}>
        {enModulo && (
          <p>
            <Link className="retorno" to="/">← Volver al portal</Link>
          </p>
        )}
        <Outlet />
      </main>
      <footer className="pie">UNSA · Ingeniería de Sistemas · Laboratorio de Métodos Numéricos</footer>
    </>
  )
}
