import { useEffect, useState } from 'react'

export type Seccion = readonly [id: string, titulo: string]

/** Contenedor de módulo: índice lateral fijo (en móvil, desplegable) + contenido. */
export default function ModuloConIndice({ secciones, children }: { secciones: readonly Seccion[]; children: React.ReactNode }) {
  const [activa, setActiva] = useState(secciones[0]?.[0] ?? '')
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const visibles = new Set<string>()
    const obs = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) visibles.add(e.target.id)
        else visibles.delete(e.target.id)
      }
      const primera = secciones.find(([id]) => visibles.has(id))
      if (primera) setActiva(primera[0])
    }, { rootMargin: '-10% 0px -70% 0px' })
    for (const [id] of secciones) {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    }
    return () => obs.disconnect()
  }, [secciones])

  function ir(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    setActiva(id)
    setAbierto(false)
  }

  return (
    <div className="modulo-grid">
      <aside className="indice-lateral">
        <button type="button" className="indice-toggle" aria-expanded={abierto} aria-controls="indice-lista" onClick={() => setAbierto(!abierto)}>
          Secciones del módulo {abierto ? '▲' : '▼'}
        </button>
        <nav aria-label="Secciones del módulo" id="indice-lista" data-abierto={abierto}>
          <ol>
            {secciones.map(([id, t]) => (
              <li key={id}>
                <a href={`#${id}`} aria-current={activa === id ? 'location' : undefined}
                   onClick={(e) => { e.preventDefault(); ir(id) }}>{t}</a>
              </li>
            ))}
          </ol>
          <button type="button" className="arriba" onClick={() => window.scrollTo({ top: 0 })}>↑ Inicio de la página</button>
        </nav>
      </aside>
      <div className="modulo-contenido">{children}</div>
    </div>
  )
}
