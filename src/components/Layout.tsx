import { useLayoutEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import ErrorBoundary from './ErrorBoundary'
import SelectorTema, { ProveedorTema } from './SelectorTema'
import { MODULOS } from '../modules/registro'

export default function Layout() {
  const { pathname } = useLocation()
  const enModulo = pathname !== '/'

  useLayoutEffect(() => {
    const irArriba = () => {
      if (typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    irArriba()
    let raf2 = 0
    const raf1 = window.requestAnimationFrame(() => {
      irArriba()
      raf2 = window.requestAnimationFrame(irArriba)
    })
    return () => {
      window.cancelAnimationFrame(raf1)
      window.cancelAnimationFrame(raf2)
    }
  }, [pathname])

  return (
    <ProveedorTema>
      <a className="saltar" href="#contenido">Saltar al contenido</a>
      <header className="cabecera">
        <Link to="/" className="marca">
          <span className="marca-icono" aria-hidden="true">∫</span>
          <span>Métodos Numéricos</span>
        </Link>
        <nav aria-label="Temas">
          <ul className="nav-lista">
            {MODULOS.map((m) => (
              <li key={m.id}>
                <NavLink to={m.ruta}>{m.etiqueta}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <SelectorTema />
      </header>
      <main id="contenido" className="contenido-principal" tabIndex={-1}>
        {enModulo && (
          <p className="retorno-wrap">
            <Link className="retorno" to="/">← Volver al portal</Link>
          </p>
        )}
        <ErrorBoundary key={pathname} titulo="No se pudo cargar esta sección">
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="pie">UNSA · Ingeniería de Sistemas · Laboratorio de Métodos Numéricos · <Link to="/recursos">Cómo usar el portal, código de referencia y fuentes</Link></footer>
    </ProveedorTema>
  )
}
