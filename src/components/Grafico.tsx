import { lazy, Suspense } from 'react'
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
  return (
    <figure className="grafico">
      <Suspense fallback={<p>Cargando gráfico…</p>}>
        <Plot
          data={datos}
          layout={{ title: { text: titulo }, xaxis: { title: { text: ejeX } }, yaxis: { title: { text: ejeY } }, autosize: true, margin: { t: 40, r: 20, b: 50, l: 60 }, legend: { orientation: 'h' }, ...layout }}
          useResizeHandler
          style={{ width: '100%', height: '360px' }}
          config={{ responsive: true, displaylogo: false }}
        />
      </Suspense>
      <figcaption>{descripcion}</figcaption>
    </figure>
  )
}
