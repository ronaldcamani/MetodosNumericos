import type { Herramienta } from '../../components/PanelCalculadora'
import type { EnlaceTema } from '../../components/SubNavegacion'
import CalcDerivacion from './CalcDerivacion'
import CalcIntegral from './CalcIntegral'
import { CASO_TASA } from './tasa'

export const PAGINAS_INTEGRACION: EnlaceTema[] = [
  { ruta: '/integracion', titulo: 'Planteo y decisión' },
  { ruta: '/integracion/trapecio', titulo: 'Trapecio compuesto' },
  { ruta: '/integracion/simpson', titulo: 'Simpson compuesto' },
  { ruta: '/integracion/derivacion', titulo: 'Derivación numérica' },
]

const TODAS: Herramienta[] = [
  { id: 'trapecio', nombre: 'Trapecio compuesto', render: (preset) => <CalcIntegral metodo="trapecio" preset={preset} /> },
  { id: 'simpson', nombre: 'Simpson 1/3 compuesto', render: (preset) => <CalcIntegral metodo="simpson" preset={preset} /> },
  { id: 'derivacion', nombre: 'Derivación numérica', render: (preset) => <CalcDerivacion preset={preset} /> },
]

/** Calculadora lateral con las tres herramientas; la de la página actual aparece seleccionada al abrir. */
export const herramientasIntegracion = (primera: 'trapecio' | 'simpson' | 'derivacion'): Herramienta[] => [...TODAS].sort((p, q) => Number(q.id === primera) - Number(p.id === primera))

/** Preset de integración: coeficientes de la tasa, intervalo y n. */
export const presetIntegral = (herramienta: 'trapecio' | 'simpson', a: number, b: number, c: number, inicio: number, fin: number, n: number) => ({
  herramienta,
  valores: { ...CASO_TASA, a: String(a), b: String(b), c: String(c), inicio: String(inicio), fin: String(fin), n: String(n) },
})
