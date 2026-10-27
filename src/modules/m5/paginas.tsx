import type { Herramienta, PresetCalculadora } from '../../components/PanelCalculadora'
import type { EnlaceTema } from '../../components/SubNavegacion'
import type { MetodoEDO } from '../../core/m5'
import CalcEDO from './CalcEDO'
import CalcEstabilidad from './CalcEstabilidad'
import { CASO_EDO } from './modelo'

export const PAGINAS_EDO: EnlaceTema[] = [
  { ruta: '/diferenciales', titulo: 'Planteo y decisión' },
  { ruta: '/diferenciales/euler', titulo: 'Euler explícito' },
  { ruta: '/diferenciales/rk4', titulo: 'Runge-Kutta 4' },
  { ruta: '/diferenciales/estabilidad', titulo: 'Estabilidad y tamaño de paso' },
]

const TODAS: Herramienta[] = [
  { id: 'euler', nombre: 'Euler explícito', render: (preset) => <CalcEDO metodo="euler" preset={preset} /> },
  { id: 'rk4', nombre: 'Runge-Kutta 4', render: (preset) => <CalcEDO metodo="rk4" preset={preset} /> },
  { id: 'estabilidad', nombre: 'Explorador de estabilidad', render: (preset) => <CalcEstabilidad preset={preset} /> },
]

/** Calculadora lateral con las tres herramientas; la de la página actual aparece seleccionada al abrir. */
export const herramientasEdo = (primera: 'euler' | 'rk4' | 'estabilidad'): Herramienta[] => [...TODAS].sort((p, q) => Number(q.id === primera) - Number(p.id === primera))

/** Preset de la calculadora: parámetros del modelo y paso. */
export const presetEdo = (herramienta: MetodoEDO | 'estabilidad', valores: Partial<typeof CASO_EDO> | { k: string; h: string }): PresetCalculadora => ({ herramienta, valores: valores as Record<string, string> })
