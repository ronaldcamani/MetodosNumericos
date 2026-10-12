import Campo from '../../components/Campo'
import Selector from '../../components/Selector'
import { parseNumero } from '../../core/entrada'
import { fmt } from '../../core/formato'
import type { Errores } from '../../components/useCalculadora'
import type { Matriz } from '../../core/m2'

/** Caso base de la guía: demanda de tres servicios, solución exacta (1, 2, 3). */
export const CASO_SISTEMA = {
  tam: '3',
  a11: '4', a12: '1', a13: '1', a14: '0',
  a21: '1', a22: '5', a23: '1', a24: '0',
  a31: '1', a32: '1', a33: '6', a34: '0',
  a41: '0', a42: '0', a43: '0', a44: '1',
  b1: '9', b2: '14', b3: '21', b4: '0',
}
export type FSistema = typeof CASO_SISTEMA

/** Construye el estado del formulario a partir de una matriz y un vector (tamaño 2 a 4). */
export function crearFSistema(A: number[][], b: number[]): FSistema {
  const f: Record<string, string> = { ...CASO_SISTEMA, tam: String(A.length) }
  A.forEach((fila, i) => {
    fila.forEach((v, j) => (f[`a${i + 1}${j + 1}`] = String(v)))
    f[`b${i + 1}`] = String(b[i])
  })
  return f as FSistema
}

/** Prueba de fallo de la guía: filas (1,2) y (2,4) con b = (3,6). */
export const SISTEMA_SINGULAR: FSistema = crearFSistema([[1, 2], [2, 4]], [3, 6])

export function leerSistema(v: FSistema): { A: Matriz; b: number[] } | { errores: Errores<FSistema> } {
  const n = Number(v.tam)
  const errores: Errores<FSistema> = {}
  const A: Matriz = []
  const b: number[] = []
  for (let i = 1; i <= n; i++) {
    const fila: number[] = []
    for (let j = 1; j <= n; j++) {
      const x = parseNumero(v[`a${i}${j}` as keyof FSistema])
      if (x === null) errores[`a${i}${j}` as keyof FSistema] = 'Número inválido.'
      fila.push(x ?? 0)
    }
    A.push(fila)
    const bi = parseNumero(v[`b${i}` as keyof FSistema])
    if (bi === null) errores[`b${i}` as keyof FSistema] = 'Número inválido.'
    b.push(bi ?? 0)
  }
  return Object.keys(errores).length ? { errores } : { A, b }
}

interface Props {
  valores: FSistema
  errores: Errores<FSistema>
  set: (k: keyof FSistema, v: string) => void
}

export function EditorSistema({ valores, errores, set }: Props) {
  const n = Number(valores.tam)
  const idx = Array.from({ length: n }, (_, i) => i + 1)
  const mensajes = Object.values(errores).filter(Boolean)
  return (
    <>
      <Selector etiqueta="Tamaño del sistema" valor={valores.tam} onChange={(x) => set('tam', x)} opciones={[{ valor: '2', texto: '2 × 2' }, { valor: '3', texto: '3 × 3' }, { valor: '4', texto: '4 × 4' }]} />
      <fieldset style={{ gridColumn: '1 / -1' }}>
        <legend>Matriz A y vector b (A·x = b)</legend>
        <div className="matriz-editor" style={{ gridTemplateColumns: `repeat(${n + 1}, minmax(0, 1fr))` }}>
          {idx.map((i) => (
            <FilaEditor key={i} i={i} idx={idx} valores={valores} errores={errores} set={set} />
          ))}
        </div>
        {mensajes.length > 0 && <p className="campo-error" role="alert">✖ Revisa los coeficientes marcados: deben ser números.</p>}
      </fieldset>
    </>
  )
}

function FilaEditor({ i, idx, valores, errores, set }: Props & { i: number; idx: number[] }) {
  return (
    <>
      {idx.map((j) => {
        const k = `a${i}${j}` as keyof FSistema
        return <Campo key={k} etiqueta={`a${i}${j}`} valor={valores[k]} onChange={(x) => set(k, x)} error={errores[k] ? ' ' : null} />
      })}
      <Campo etiqueta={`b${i}`} valor={valores[`b${i}` as keyof FSistema]} onChange={(x) => set(`b${i}` as keyof FSistema, x)} error={errores[`b${i}` as keyof FSistema] ? ' ' : null} />
    </>
  )
}

/** Matriz aumentada [A | b] como tabla accesible. */
export function MatrizTabla({ titulo, M }: { titulo: string; M: Matriz }) {
  const n = M.length
  return (
    <div className="tabla-wrap">
      <table>
        <caption>{titulo}</caption>
        <thead>
          <tr>{Array.from({ length: n }, (_, j) => <th key={j} scope="col">x{j + 1}</th>)}<th scope="col">b</th></tr>
        </thead>
        <tbody>
          {M.map((fila, i) => <tr key={i}>{fila.map((v, j) => <td key={j}>{fmt(v, 8)}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  )
}
