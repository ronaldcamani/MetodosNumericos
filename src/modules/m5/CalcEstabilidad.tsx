import type { Data } from 'plotly.js'
import Calculadora from '../../components/Calculadora'
import Campo from '../../components/Campo'
import Grafico from '../../components/Grafico'
import { useAplicarPreset, type PresetActivo } from '../../components/PanelCalculadora'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora, type Errores } from '../../components/useCalculadora'
import { parseNumero } from '../../core/entrada'
import { fmt } from '../../core/formato'
import { comportamientoEuler, DESCRIPCION_EULER, factorEuler, factorRK4, limiteEuler, limiteRK4, LIMITES_M5 } from '../../core/m5'
import { muestrear } from '../../core/muestreo'

const CASO = { k: '0.5', h: '5' }
type F = typeof CASO

function ejecutar(v: F) {
  const errores: Errores<F> = {}
  const k = parseNumero(v.k)
  const h = parseNumero(v.h)
  if (k === null) errores.k = 'Ingresa un número.'
  else if (!(k > 0) || k > LIMITES_M5.kMax) errores.k = `Debe cumplir 0 < k ≤ ${LIMITES_M5.kMax}.`
  if (h === null) errores.h = 'Ingresa un número.'
  else if (!(h > 0) || h > 1000) errores.h = 'Debe cumplir 0 < h ≤ 1000.'
  if (Object.keys(errores).length) return { errores }
  return { salida: { k: k!, h: h! } }
}

/** Herramienta didáctica: ¿qué le pasa a cada método con este paso? (modelo lineal T′ = −k (T − Tₐ)). */
export default function CalcEstabilidad({ preset = null }: { preset?: PresetActivo | null }) {
  const c = useCalculadora<F, { k: number; h: number }>(CASO, ejecutar)
  useAplicarPreset('estabilidad', preset, (valores) => c.cargarYCalcular({ ...CASO, ...valores }))
  const s = c.salida
  const lE = s ? limiteEuler(s.k) : 0
  const lR = s ? limiteRK4(s.k) : 0
  const hs = s ? [0.25, 0.5, 1, 2, 3, 4, 5, 6].map((x) => x * (0.5 / s.k)) : []
  const hMax = lE * 2
  const datos: Data[] = s ? (() => {
    const mE = muestrear((h) => Math.abs(factorEuler(s.k, h)), 0, hMax, 200)
    const mR = muestrear((h) => Math.abs(factorRK4(s.k, h)), 0, hMax, 200)
    return [
      { x: mE.x, y: mE.y, type: 'scatter', mode: 'lines', name: 'Euler: |1 − k·h|', line: { width: 2.5 } },
      { x: mR.x, y: mR.y, type: 'scatter', mode: 'lines', name: 'RK4: |R(−k·h)|', line: { width: 2.5, dash: 'dash' } },
      { x: [0, hMax], y: [1, 1], type: 'scatter', mode: 'lines', name: 'Frontera |factor| = 1', line: { width: 1.5, dash: 'dot', color: '#b3261e' } },
      { x: [s.h], y: [Math.abs(factorEuler(s.k, s.h))], type: 'scatter', mode: 'markers', name: 'Tu h (Euler)', marker: { size: 12, symbol: 'diamond' } },
      { x: [s.h], y: [Math.abs(factorRK4(s.k, s.h))], type: 'scatter', mode: 'markers', name: 'Tu h (RK4)', marker: { size: 12, symbol: 'square' } },
    ]
  })() : []
  return (
    <Calculadora titulo="Explorador de estabilidad" onCalcular={c.calcular} onCargarCaso={c.cargarCaso} onRestablecer={c.restablecer}
      extras={
        <>
          <button type="button" onClick={() => c.cargarYCalcular({ k: '0.5', h: '0.5' })}>h = 0.5 (estable)</button>
          <button type="button" onClick={() => c.cargarYCalcular({ k: '0.5', h: '3' })}>h = 3 (oscila)</button>
          <button type="button" onClick={() => c.cargarYCalcular({ k: '0.5', h: '5' })}>h = 5 (inestable)</button>
        </>
      }
      salida={s && (() => {
        const fe = factorEuler(s.k, s.h)
        const fr = factorRK4(s.k, s.h)
        const estE = Math.abs(fe) < 1
        const estR = Math.abs(fr) < 1
        return (
          <>
            <div className={`estado ${estE ? 'estado-ok' : 'estado-error'}`} role={estE ? 'status' : 'alert'}>
              <strong>Euler: {estE ? '✔ estable' : '✖ inestable'}</strong> — factor 1 − k·h = {fmt(fe, 6)}. {DESCRIPCION_EULER[comportamientoEuler(s.k, s.h)]}
            </div>
            <div className={`estado ${estR ? 'estado-ok' : 'estado-error'}`} role={estR ? 'status' : 'alert'}>
              <strong>RK4: {estR ? '✔ estable' : '✖ inestable'}</strong> — factor R(−k·h) = {fmt(fr, 6)}. {estR ? 'Decae sin oscilar' : 'Crece en cada paso'}{estR && fr < 0 ? ' (con oscilación)' : ''}.
            </div>
            <dl className="resumen">
              <dt>Condición de Euler</dt><dd>0 &lt; h &lt; 2/k = {fmt(lE, 6)} min</dd>
              <dt>Condición de RK4</dt><dd>0 &lt; h &lt; {fmt(lR, 6)} min (k·h &lt; 2.7853)</dd>
              <dt>Aviso</dt><dd>Estable no significa preciso: RK4 puede ser estable y aun así muy inexacto con un paso grande.</dd>
            </dl>
            <TablaPasos titulo="Factor por paso para distintos h" pasos={hs} columnas={[
              { clave: 'h', titulo: 'h (min)', valor: (h) => h }, { clave: 'kh', titulo: 'k·h', valor: (h) => s.k * h },
              { clave: 'fe', titulo: 'Euler: 1 − k·h', valor: (h) => factorEuler(s.k, h) }, { clave: 'ce', titulo: 'comportamiento de Euler', valor: (h) => comportamientoEuler(s.k, h) === 'diverge' ? 'diverge' : comportamientoEuler(s.k, h) === 'monotono' ? 'baja monótono' : comportamientoEuler(s.k, h) === 'oscila' ? 'oscila y decae' : comportamientoEuler(s.k, h) === 'marginal' ? 'oscila sin decaer' : 'llega a Tₐ de golpe' },
              { clave: 'fr', titulo: 'RK4: R(−k·h)', valor: (h) => factorRK4(s.k, h) }, { clave: 'cr', titulo: 'RK4', valor: (h) => (Math.abs(factorRK4(s.k, h)) < 1 ? 'estable' : 'inestable') },
            ]} />
            <Grafico titulo="Factor de amplificación por paso" ejeX="Paso h (min)" ejeY="|factor por paso|" datos={datos} layout={{ yaxis: { range: [0, 3] } }}
              descripcion="Si la curva está por debajo de la línea roja (|factor| < 1), el error se reduce en cada paso y el método es estable; por encima, se amplifica. Euler cruza la línea en h = 2/k; RK4, un poco más allá." />
          </>
        )
      })()}>
      <Campo etiqueta="Constante de enfriamiento k" unidad="1/min" valor={c.valores.k} onChange={(x) => c.set('k', x)} error={c.errores.k} />
      <Campo etiqueta="Paso h a probar" unidad="min" valor={c.valores.h} onChange={(x) => c.set('h', x)} error={c.errores.h} ayuda="Prueba valores por encima y por debajo de 4." />
    </Calculadora>
  )
}
