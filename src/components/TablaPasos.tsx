import { aCSV, descargarCSV } from '../core/csv'
import { fmt } from '../core/formato'

export interface Columna<P> {
  clave: string
  titulo: string
  valor: (p: P) => number | string | null | undefined
}

interface Props<P> {
  titulo: string
  columnas: Columna<P>[]
  pasos: P[]
  archivoCSV?: string
}

export default function TablaPasos<P>({ titulo, columnas, pasos, archivoCSV }: Props<P>) {
  const exportar = () =>
    descargarCSV(archivoCSV ?? 'resultados.csv', aCSV(columnas.map((c) => c.titulo), pasos.map((p) => columnas.map((c) => c.valor(p)))))
  return (
    <div className="tabla-wrap">
      <table>
        <caption>{titulo}</caption>
        <thead>
          <tr>{columnas.map((c) => <th key={c.clave} scope="col">{c.titulo}</th>)}</tr>
        </thead>
        <tbody>
          {pasos.map((p, i) => (
            <tr key={i}>
              {columnas.map((c) => {
                const v = c.valor(p)
                return <td key={c.clave}>{typeof v === 'number' ? fmt(v, 10) : v ?? '—'}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {archivoCSV && <button type="button" onClick={exportar}>Exportar CSV</button>}
    </div>
  )
}
