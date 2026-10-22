import Campo from '../../components/Campo'
import Selector from '../../components/Selector'
import { parseNumero } from '../../core/entrada'
import type { Errores } from '../../components/useCalculadora'
import { LIMITES_M3 } from '../../core/m3'

/** Caso de partida de la guía: carga normalizada x y latencia y (ms). Las filas 5 y 6 están ocultas con tam = 4. */
export const CASO_DATOS = {
  tam: '4',
  x1: '0', x2: '1', x3: '2', x4: '3', x5: '4', x6: '5',
  y1: '1', y2: '2', y3: '2', y4: '4', y5: '4', y6: '5',
  consulta: '1.5',
}
export type FDatos = typeof CASO_DATOS

/** Construye el formulario a partir de listas de puntos (2 a 6) y una consulta. */
export function crearFDatos(x: number[], y: number[], consulta: number): FDatos {
  const f: Record<string, string> = { ...CASO_DATOS, tam: String(x.length), consulta: String(consulta) }
  x.forEach((v, i) => {
    f[`x${i + 1}`] = String(v)
    f[`y${i + 1}`] = String(y[i])
  })
  return f as FDatos
}

/** Prueba de fallo de la guía: la abscisa 1 aparece con dos valores de y. */
export const DATOS_REPETIDOS = crearFDatos([0, 1, 1, 3], [1, 2, 5, 4], 1.5)
/** Prueba de fallo de la guía: todas las x iguales (no hay variación para ajustar). */
export const DATOS_X_IGUALES = crearFDatos([2, 2, 2, 2], [1, 2, 3, 4], 2)
/** Runge: y = 1/(1+25x²) con 6 nodos equiespaciados; el polinomio oscila y toma valores negativos. */
export const DATOS_RUNGE = crearFDatos([-1, -0.6, -0.2, 0.2, 0.6, 1], [0.0385, 0.1, 0.5, 0.5, 0.1, 0.0385], 0.8)

export interface DatosLeidos {
  x: number[]
  y: number[]
  consulta: number
}

export function leerDatos(v: FDatos): DatosLeidos | { errores: Errores<FDatos> } {
  const n = Number(v.tam)
  const errores: Errores<FDatos> = {}
  const x: number[] = []
  const y: number[] = []
  for (let i = 1; i <= n; i++) {
    const xi = parseNumero(v[`x${i}` as keyof FDatos])
    const yi = parseNumero(v[`y${i}` as keyof FDatos])
    if (xi === null) errores[`x${i}` as keyof FDatos] = 'Número inválido.'
    if (yi === null) errores[`y${i}` as keyof FDatos] = 'Número inválido.'
    x.push(xi ?? 0)
    y.push(yi ?? 0)
  }
  const consulta = parseNumero(v.consulta)
  if (consulta === null) errores.consulta = 'Ingresa un número.'
  return Object.keys(errores).length ? { errores } : { x, y, consulta: consulta as number }
}

interface Props {
  valores: FDatos
  errores: Errores<FDatos>
  set: (k: keyof FDatos, v: string) => void
}

const OPCIONES_TAM = Array.from({ length: LIMITES_M3.maxNodos - LIMITES_M3.minNodos + 1 }, (_, i) => {
  const n = i + LIMITES_M3.minNodos
  return { valor: String(n), texto: `${n} puntos` }
})

export function EditorDatos({ valores, errores, set }: Props) {
  const n = Number(valores.tam)
  const filas = Array.from({ length: n }, (_, i) => i + 1)
  const hayError = Object.values(errores).some(Boolean)
  return (
    <>
      <Selector etiqueta="Cantidad de puntos" valor={valores.tam} onChange={(v) => set('tam', v)} opciones={OPCIONES_TAM} />
      <Campo etiqueta="Consulta x" valor={valores.consulta} onChange={(v) => set('consulta', v)} error={errores.consulta} ayuda="Punto donde se evalúa cada modelo." />
      <fieldset style={{ gridColumn: '1 / -1' }}>
        <legend>Datos (carga normalizada x, latencia y en ms)</legend>
        <div className="matriz-editor" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          {filas.map((i) => {
            const kx = `x${i}` as keyof FDatos
            const ky = `y${i}` as keyof FDatos
            return (
              <div key={i} style={{ display: 'contents' }}>
                <Campo etiqueta={`x${i}`} valor={valores[kx]} onChange={(v) => set(kx, v)} error={errores[kx] ? ' ' : null} />
                <Campo etiqueta={`y${i}`} valor={valores[ky]} onChange={(v) => set(ky, v)} error={errores[ky] ? ' ' : null} />
              </div>
            )
          })}
        </div>
        {hayError && <p className="campo-error" role="alert">✖ Revisa los valores marcados: deben ser números.</p>}
      </fieldset>
    </>
  )
}
