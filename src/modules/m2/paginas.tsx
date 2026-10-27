import type { Herramienta, PresetCalculadora } from '../../components/PanelCalculadora'
import type { EnlaceTema } from '../../components/SubNavegacion'
import CalcGauss from './CalcGauss'
import CalcGaussSeidel from './CalcGaussSeidel'
import { crearFSistema } from './sistema'

export const PAGINAS_SISTEMAS: EnlaceTema[] = [
  { ruta: '/sistemas', titulo: 'Planteo y decisión' },
  { ruta: '/sistemas/directos', titulo: 'Métodos directos' },
  { ruta: '/sistemas/iterativos', titulo: 'Métodos iterativos' },
]

/** Calculadora lateral: eliminación con pivoteo y Gauss-Seidel, con selector de herramienta. */
export const herramientasSistemas = (): Herramienta[] => [
  { id: 'gauss', nombre: 'Eliminación con pivoteo parcial', render: (preset) => <CalcGauss preset={preset} /> },
  { id: 'gs', nombre: 'Gauss-Seidel', render: (preset) => <CalcGaussSeidel preset={preset} /> },
]

/** Preset de la calculadora a partir de una matriz y un vector (y valores adicionales de la herramienta). */
export const presetSistema = (herramienta: 'gauss' | 'gs', A: number[][], b: number[], extra: Record<string, string> = {}): PresetCalculadora => ({
  herramienta,
  valores: { ...crearFSistema(A, b), ...extra },
})
