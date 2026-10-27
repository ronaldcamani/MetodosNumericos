import type { Herramienta } from '../../components/PanelCalculadora'
import type { EnlaceTema } from '../../components/SubNavegacion'
import CalculadoraRaices, { type IdMetodo } from './CalculadoraRaices'

/** Páginas del tema «Ecuaciones no lineales». */
export const PAGINAS_M1: EnlaceTema[] = [
  { ruta: '/ecuaciones', titulo: 'Planteo y decisión' },
  { ruta: '/ecuaciones/cerrados', titulo: 'Métodos cerrados' },
  { ruta: '/ecuaciones/abiertos', titulo: 'Métodos abiertos' },
  { ruta: '/ecuaciones/polinomios', titulo: 'Raíces de polinomios' },
]

/** Calculadora lateral de raíces con los métodos que corresponden a cada página. */
export const herramientasRaices = (metodos: IdMetodo[]): Herramienta[] => [
  { id: 'raices', nombre: 'Calculadora de raíces', render: (preset) => <CalculadoraRaices id="raices" metodos={metodos} preset={preset} /> },
]
