import type { Data } from 'plotly.js'
import Calculadora from '../../components/Calculadora'
import Campo from '../../components/Campo'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import { useAplicarPreset, type PresetActivo } from '../../components/PanelCalculadora'
import Selector from '../../components/Selector'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora, type Errores } from '../../components/useCalculadora'
import { parseNumero } from '../../core/entrada'
import { fmt } from '../../core/formato'
import { aproximarDerivada, crearDerivable, NOMBRES_DERIVABLE, type IdDerivable } from '../../core/m4'

const CASO = { funcion: 'tasa', a: '1', b: '0', c: '1', t: '1', h: '0.1' }
type F = typeof CASO

function ejecutar(v: F) {
  const errores: Errores<F> = {}
  const num = (k: keyof F) => {
    const x = parseNumero(v[k])
    if (x === null) errores[k] = 'Ingresa un número.'
    return x
  }
  const t = num('t')
  const h = num('h')
  const [a, b, c] = v.funcion === 'tasa' ? [num('a'), num('b'), num('c')] : [1, 0, 1]
  if (Object.keys(errores).length) return { errores }
  const derivable = crearDerivable(v.funcion as IdDerivable, { a: a!, b: b!, c: c! })
  return { salida: { res: aproximarDerivada({ derivable, t: t!, h: h! }), derivable, t: t! } }
}

export default function CalcDerivacion({ preset = null }: { preset?: PresetActivo | null }) {
  const c = useCalculadora<F, NonNullable<ReturnType<typeof ejecutar>['salida']>>(CASO, ejecutar)
  useAplicarPreset('derivacion', preset, (valores) => c.cargarYCalcular({ ...CASO, ...valores }))
  const s = c.salida
  const r = s?.res.resultado
  const datos: Data[] = s && r ? [
    { x: s.res.pasos.map((p) => p.h), y: s.res.pasos.map((p) => Math.max(p.errorCentral, 1e-17)), type: 'scatter', mode: 'lines+markers', name: 'Diferencia central (O(h²))', marker: { symbol: 'square' } },
    { x: s.res.pasos.map((p) => p.h), y: s.res.pasos.map((p) => Math.max(p.errorProgresiva, 1e-17)), type: 'scatter', mode: 'lines+markers', name: 'Diferencia progresiva (O(h))', marker: { symbol: 'diamond' }, line: { dash: 'dash' } },
  ] : []
  return (
    <Calculadora titulo="Calculadora de derivación numérica" onCalcular={c.calcular} onCargarCaso={c.cargarCaso} onRestablecer={c.restablecer}
      extras={
        <>
          <button type="button" onClick={() => c.cargarYCalcular({ ...CASO, funcion: 'exponencial', h: '0.1' })}>Ejemplo: eᵗ en t = 1</button>
          <button type="button" onClick={() => c.cargarYCalcular({ ...CASO, funcion: 'exponencial', h: '1e-12' })}>Ejemplo: h demasiado pequeño</button>
        </>
      }
      salida={s && (
        <>
          <MensajeEstado estado={s.res.estado} mensaje={s.res.mensaje} />
          {r?.advertencias.map((a) => <p key={a} className="advertencia" role="note">⚠ {a}</p>)}
          {r && (
            <>
              <dl className="resumen">
                <dt>Derivada exacta f′({fmt(s.t, 6)})</dt><dd>{fmt(r.exacta, 10)}</dd>
                <dt>Central (f(t+h) − f(t−h))/2h</dt><dd>{fmt(r.central, 10)} (error {fmt(r.errorCentral, 4)})</dd>
                <dt>Progresiva (f(t+h) − f(t))/h</dt><dd>{fmt(r.progresiva, 10)} (error {fmt(r.errorProgresiva, 4)})</dd>
                <dt>Regresiva (f(t) − f(t−h))/h</dt><dd>{fmt(r.regresiva, 10)} (error {fmt(r.errorRegresiva, 4)})</dd>
              </dl>
              <TablaPasos titulo="Efecto de reducir el paso h" archivoCSV="derivacion.csv" pasos={s.res.pasos} columnas={[
                { clave: 'h', titulo: 'h', valor: (p) => p.h }, { clave: 'c', titulo: 'central', valor: (p) => p.central }, { clave: 'ec', titulo: 'error central', valor: (p) => p.errorCentral },
                { clave: 'rc', titulo: 'cociente (central)', valor: (p) => p.razonCentral }, { clave: 'p', titulo: 'progresiva', valor: (p) => p.progresiva }, { clave: 'ep', titulo: 'error progresiva', valor: (p) => p.errorProgresiva }, { clave: 'rp', titulo: 'cociente (progresiva)', valor: (p) => p.razonProgresiva },
              ]} />
              <Grafico titulo="Error frente al paso h (escalas logarítmicas)" ejeX="Paso h" ejeY="Error absoluto" datos={datos} layout={{ xaxis: { type: 'log' }, yaxis: { type: 'log' } }}
                descripcion="Al reducir h el error de truncamiento baja: con pendiente 2 en la central y 1 en la progresiva. El cociente entre errores consecutivos (≈ 4 y ≈ 2) lo confirma. Si h se vuelve demasiado pequeño el error de redondeo por cancelación lo hace subir de nuevo." />
            </>
          )}
        </>
      )}>
      <Selector etiqueta="Función" valor={c.valores.funcion} onChange={(x) => c.set('funcion', x)} opciones={(Object.keys(NOMBRES_DERIVABLE) as IdDerivable[]).map((k) => ({ valor: k, texto: NOMBRES_DERIVABLE[k] }))} />
      {c.valores.funcion === 'tasa' && (
        <>
          <Campo etiqueta="a" unidad="MB/s³" valor={c.valores.a} onChange={(x) => c.set('a', x)} error={c.errores.a} />
          <Campo etiqueta="b" unidad="MB/s²" valor={c.valores.b} onChange={(x) => c.set('b', x)} error={c.errores.b} />
          <Campo etiqueta="c" unidad="MB/s" valor={c.valores.c} onChange={(x) => c.set('c', x)} error={c.errores.c} />
        </>
      )}
      <Campo etiqueta="Punto t" unidad="s" valor={c.valores.t} onChange={(x) => c.set('t', x)} error={c.errores.t} />
      <Campo etiqueta="Paso h" unidad="s" valor={c.valores.h} onChange={(x) => c.set('h', x)} error={c.errores.h} ayuda="Entre 10⁻¹² y 10." />
    </Calculadora>
  )
}
