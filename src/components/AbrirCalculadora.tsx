import { useCalculadoraLateral, type PresetCalculadora } from './PanelCalculadora'

/** Botón que abre la calculadora lateral con datos precargados; no se muestra si la página no tiene panel. */
export default function AbrirCalculadora({ preset, children }: { preset: PresetCalculadora; children: React.ReactNode }) {
  const panel = useCalculadoraLateral()
  if (!panel) return null
  return <button type="button" onClick={() => panel.abrir(preset)}>{children}</button>
}
