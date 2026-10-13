import { createContext, useContext } from 'react'
import { useTema, type PrefTema } from './tema'

const OPCIONES: [PrefTema, string][] = [['auto', 'Auto'], ['claro', 'Claro'], ['oscuro', 'Oscuro']]

interface Ctx { pref: PrefTema; setPref: (p: PrefTema) => void; oscuro: boolean }
const TemaContexto = createContext<Ctx>({ pref: 'auto', setPref: () => {}, oscuro: false })
export const useOscuro = () => useContext(TemaContexto).oscuro

export function ProveedorTema({ children }: { children: React.ReactNode }) {
  const t = useTema()
  return <TemaContexto.Provider value={t}>{children}</TemaContexto.Provider>
}

export default function SelectorTema() {
  const { pref, setPref } = useContext(TemaContexto)
  return (
    <div className="tema" role="group" aria-label="Tema de color">
      {OPCIONES.map(([v, t]) => (
        <button key={v} type="button" aria-pressed={pref === v} onClick={() => setPref(v)}>{t}</button>
      ))}
    </div>
  )
}
