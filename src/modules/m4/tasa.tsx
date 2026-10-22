import Campo from '../../components/Campo'
import type { Errores } from '../../components/useCalculadora'
import { parseNumero } from '../../core/entrada'
import type { EntradaIntegral } from '../../core/m4'

/** Caso de partida de la guía: r(t) = t² + 1 MB/s durante 0 a 2 s, con n = 4. */
export const CASO_TASA = { a: '1', b: '0', c: '1', inicio: '0', fin: '2', n: '4' }
export type FTasa = typeof CASO_TASA

export const TASA_N0: FTasa = { ...CASO_TASA, n: '0' }
export const TASA_N3: FTasa = { ...CASO_TASA, n: '3' }
/** r(t) = t² − 3t + 1 es negativa en parte de [0, 3]: invalida la lectura física de volumen. */
export const TASA_NEGATIVA: FTasa = { a: '1', b: '-3', c: '1', inicio: '0', fin: '3', n: '6' }

export function leerEntrada(v: FTasa): EntradaIntegral | { errores: Errores<FTasa> } {
  const n = { a: parseNumero(v.a), b: parseNumero(v.b), c: parseNumero(v.c), inicio: parseNumero(v.inicio), fin: parseNumero(v.fin), n: parseNumero(v.n) }
  const errores: Errores<FTasa> = {}
  ;(Object.keys(n) as (keyof FTasa)[]).forEach((k) => {
    if (n[k] === null) errores[k] = 'Ingresa un número.'
  })
  if (Object.keys(errores).length) return { errores }
  const x = n as { [K in keyof typeof n]: number }
  return { tasa: { a: x.a, b: x.b, c: x.c }, inicio: x.inicio, fin: x.fin, n: x.n }
}

interface Props {
  valores: FTasa
  errores: Errores<FTasa>
  set: (k: keyof FTasa, v: string) => void
}

export function EditorTasa({ valores, errores, set }: Props) {
  return (
    <>
      <fieldset style={{ gridColumn: '1 / -1' }}>
        <legend>Tasa de transferencia r(t) = a·t² + b·t + c (MB/s, con t en segundos)</legend>
        <div className="matriz-editor" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <Campo etiqueta="a" unidad="MB/s³" valor={valores.a} onChange={(v) => set('a', v)} error={errores.a} />
          <Campo etiqueta="b" unidad="MB/s²" valor={valores.b} onChange={(v) => set('b', v)} error={errores.b} />
          <Campo etiqueta="c" unidad="MB/s" valor={valores.c} onChange={(v) => set('c', v)} error={errores.c} />
        </div>
      </fieldset>
      <Campo etiqueta="Inicio" unidad="s" valor={valores.inicio} onChange={(v) => set('inicio', v)} error={errores.inicio} />
      <Campo etiqueta="Fin" unidad="s" valor={valores.fin} onChange={(v) => set('fin', v)} error={errores.fin} />
      <Campo etiqueta="Subintervalos n" valor={valores.n} onChange={(v) => set('n', v)} error={errores.n} ayuda="Entero positivo; par para Simpson." />
    </>
  )
}
