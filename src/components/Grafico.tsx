import { lazy, Suspense } from 'react'
import { useOscuro } from './SelectorTema'
import type { Data, Layout } from 'plotly.js'

const Plot = lazy(() => import('./PlotlyLazy'))

interface Props {
  titulo: string
  ejeX: string
  ejeY: string
  datos: Data[]
  /** Explicación obligatoria: qué muestra el gráfico y cómo leerlo. */
  descripcion: string
  layout?: Partial<Layout>
}

export default function Grafico({ titulo, ejeX, ejeY, datos, descripcion, layout }: Props) {
  const oscuro = useOscuro()
  const tinta = oscuro ? '#ececec' : '#1a1a1a'
  const rejilla = oscuro ? '#3a4048' : '#dcdcdc'
  const eje = { gridcolor: rejilla, zerolinecolor: oscuro ? '#6b7480' : '#9a9a9a', linecolor: rejilla }
  return (
    <figure className="grafico">
      <Suspense fallback={<p>Cargando gráfico…</p>}>
        <Plot
          data={datos}
          layout={{ title: { text: titulo }, xaxis: { title: { text: ejeX }, ...eje }, yaxis: { title: { text: ejeY }, ...eje }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: tinta }, autosize: true, margin: { t: 40, r: 20, b: 60, l: 60 }, legend: { orientation: 'h', y: -0.3 }, ...layout }}
          useResizeHandler
          style={{ width: '100%', height: '360px' }}
          config={{ responsive: true, displaylogo: false }}
        />
      </Suspense>
      <figcaption>{descripcion}</figcaption>
    </figure>
  )
}
