import type { Herramienta, PresetCalculadora } from '../../components/PanelCalculadora'
import type { EnlaceTema } from '../../components/SubNavegacion'
import CalcLagrange from './CalcLagrange'
import CalcRegresion from './CalcRegresion'
import { crearFDatos } from './datos'

export const PAGINAS_INTERPOLACION: EnlaceTema[] = [
  { ruta: '/interpolacion', titulo: 'Planteo y decisión' },
  { ruta: '/interpolacion/lagrange', titulo: 'Interpolación de Lagrange' },
  { ruta: '/interpolacion/regresion', titulo: 'Ajuste por regresión' },
]

/** Calculadora lateral: interpolación de Lagrange y regresión lineal, con selector de herramienta. */
export const herramientasInterpolacion = (): Herramienta[] => [
  { id: 'lagrange', nombre: 'Interpolación de Lagrange', render: (preset) => <CalcLagrange preset={preset} /> },
  { id: 'regresion', nombre: 'Regresión lineal', render: (preset) => <CalcRegresion preset={preset} /> },
]

/** Preset de la calculadora a partir de listas de puntos (2 a 6) y una consulta. */
export const presetDatos = (herramienta: 'lagrange' | 'regresion', x: number[], y: number[], consulta: number): PresetCalculadora => ({
  herramienta,
  valores: crearFDatos(x, y, consulta),
})
