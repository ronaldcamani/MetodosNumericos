import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

/** Datos que un ejercicio o recomendación envía a una herramienta: qué herramienta abrir y con qué valores precargados. */
export interface PresetCalculadora {
  herramienta: string
  valores?: Record<string, string>
}
export type PresetActivo = PresetCalculadora & { n: number }

export interface Herramienta {
  id: string
  nombre: string
  render: (preset: PresetActivo | null) => ReactNode
}

interface Ctx {
  abrir: (p: PresetCalculadora) => void
}
const Contexto = createContext<Ctx | null>(null)
/** null cuando la página no tiene panel de calculadora. */
export const useCalculadoraLateral = () => useContext(Contexto)

const ANCHO_ACOPLADO = '(min-width: 1500px)'
const hayAcople = () => {
  try {
    return window.matchMedia(ANCHO_ACOPLADO).matches
  } catch {
    return false
  }
}

/**
 * Calculadora al lado del contenido. En pantallas anchas se acopla como segunda columna y en las demás es un cajón que se
 * abre sobre el contenido. Las herramientas permanecen montadas para conservar sus datos al cambiar de una a otra.
 */
export function ConPanelCalculadora({ herramientas, children }: { herramientas: Herramienta[]; children: ReactNode }) {
  const [abierto, setAbierto] = useState(hayAcople)
  const [activa, setActiva] = useState(herramientas[0].id)
  const [preset, setPreset] = useState<PresetActivo | null>(null)
  const panel = useRef<HTMLElement>(null)
  const boton = useRef<HTMLButtonElement>(null)

  /** Cierra y devuelve el foco al botón (cuando ya es visible: se oculta mientras el panel está abierto). */
  const cerrar = useCallback(() => {
    setAbierto(false)
    requestAnimationFrame(() => boton.current?.focus())
  }, [])

  const abrir = useCallback((p?: PresetCalculadora) => {
    if (p) {
      setActiva(p.herramienta)
      setPreset((previo) => ({ ...p, n: (previo?.n ?? 0) + 1 }))
    }
    setAbierto(true)
    // el foco pasa al panel para que teclado y lector de pantalla encuentren el resultado
    requestAnimationFrame(() => panel.current?.focus())
  }, [])

  useEffect(() => {
    if (!abierto) return
    const alEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !hayAcople() && panel.current?.contains(document.activeElement)) cerrar()
    }
    document.addEventListener('keydown', alEscape)
    return () => document.removeEventListener('keydown', alEscape)
  }, [abierto, cerrar])

  return (
    <Contexto.Provider value={{ abrir: (p) => abrir(p) }}>
      <div className="con-panel" data-abierto={abierto}>
        <div className="con-panel-contenido">{children}</div>
        <aside ref={panel} id="panel-calculadora" className="panel-calculadora" aria-label="Panel de calculadora" tabIndex={-1} aria-hidden={!abierto} inert={!abierto}>
          <header className="panel-cabecera">
            <h2>Calculadora</h2>
            {herramientas.length > 1 && (
              <label className="panel-selector">
                <span>Herramienta</span>
                <select value={activa} onChange={(e) => setActiva(e.target.value)}>
                  {herramientas.map((h) => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                </select>
              </label>
            )}
            <button type="button" className="panel-cerrar" onClick={cerrar}>Cerrar</button>
          </header>
          {herramientas.map((h) => (
            <div key={h.id} hidden={h.id !== activa}>{h.render(preset)}</div>
          ))}
        </aside>
        <button ref={boton} type="button" className="panel-boton" aria-expanded={abierto} aria-controls="panel-calculadora" onClick={() => (abierto ? cerrar() : abrir())}>
          {abierto ? 'Ocultar calculadora' : 'Abrir calculadora'}
        </button>
      </div>
    </Contexto.Provider>
  )
}

/** Cada herramienta se precarga cuando llega un preset suyo: la función recibe el estado para cargar y calcular. */
export function useAplicarPreset(id: string, preset: PresetActivo | null, aplicar: (valores: Record<string, string>) => void) {
  const aplicarRef = useRef(aplicar)
  useEffect(() => {
    aplicarRef.current = aplicar
  })
  const n = preset?.herramienta === id ? preset.n : 0
  const valores = preset?.valores
  useEffect(() => {
    if (n > 0) aplicarRef.current(valores ?? {})
    // solo reacciona a un preset nuevo (n); los valores van incluidos en ese mismo preset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])
}
