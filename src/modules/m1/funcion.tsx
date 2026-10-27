import Campo from '../../components/Campo'
import Selector from '../../components/Selector'
import type { Errores } from '../../components/useCalculadora'
import { parseNumero } from '../../core/entrada'
import { NOMBRES_MODELO, crearModelo, crearModeloPolinomio, validarPolinomio, type IdModelo, type Modelo } from '../../core/m1'

/** Campos que describen la función f(x) de la que se busca la raíz. */
export const CASO_FUNCION = { modelo: 'calibracion', objetivo: '2', coef: '1, 0, -1, -2' }
export type FFuncion = typeof CASO_FUNCION

export const OPCIONES_MODELO = (Object.keys(NOMBRES_MODELO) as IdModelo[]).map((v) => ({ valor: v, texto: NOMBRES_MODELO[v] }))

/** «1, 0, -1, -2» → [1, 0, −1, −2]; null si algún valor no es un número. */
export function leerCoeficientes(texto: string): number[] | null {
  const partes = texto.split(/[\s,;]+/).filter(Boolean)
  const n = partes.map(parseNumero)
  return partes.length && n.every((x) => x !== null) ? (n as number[]) : null
}

export function leerFuncion(v: FFuncion): { modelo: Modelo } | { errores: Errores<FFuncion> } {
  if (v.modelo === 'polinomio') {
    const c = leerCoeficientes(v.coef)
    if (!c) return { errores: { coef: 'Escribe números separados por comas, de mayor a menor grado.' } }
    const err = validarPolinomio(c)
    return err ? { errores: { coef: err } } : { modelo: crearModeloPolinomio(c) }
  }
  const objetivo = parseNumero(v.objetivo)
  return objetivo === null ? { errores: { objetivo: 'Ingresa un número.' } } : { modelo: crearModelo(v.modelo as IdModelo, objetivo) }
}

interface Props {
  valores: FFuncion
  errores: Errores<FFuncion>
  set: (k: keyof FFuncion, v: string) => void
}

export function EditorFuncion({ valores, errores, set }: Props) {
  return (
    <>
      <Selector etiqueta="Función" valor={valores.modelo} onChange={(x) => set('modelo', x)} opciones={OPCIONES_MODELO} />
      {valores.modelo === 'polinomio' ? (
        <Campo etiqueta="Coeficientes (de mayor a menor grado)" valor={valores.coef} onChange={(x) => set('coef', x)} error={errores.coef} ayuda="Ejemplo: 1, 0, −1, −2 es x³ − x − 2. Grado de 1 a 6." />
      ) : (
        <Campo etiqueta="Respuesta objetivo" valor={valores.objetivo} onChange={(x) => set('objetivo', x)} error={errores.objetivo} />
      )}
    </>
  )
}
