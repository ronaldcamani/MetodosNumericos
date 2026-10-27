import { useMemo, useState } from 'react'
import type { Data } from 'plotly.js'
import Grafico from '../../components/Grafico'
import Selector from '../../components/Selector'
import { fmt } from '../../core/formato'
import { CASO_ENFRIAMIENTO, derivada, exacta, integrarEnfriamiento } from '../../core/m5'
import { EJE_T, EJE_TEMP, trazaExacta } from './graficos'

const P = CASO_ENFRIAMIENTO

/** Euler «paso a paso»: cada clic añade un paso y muestra qué pendiente se usó y cuánto avanzó la temperatura. */
export function ExploradorEuler() {
  const [h, setH] = useState('0.5')
  const [paso, setPaso] = useState(0)
  const pasos = useMemo(() => integrarEnfriamiento('euler', P, Number(h)).pasos, [h])
  const n = pasos.length - 1
  const i = Math.min(paso, n)
  const q = pasos[i]
  const sig = pasos[i + 1]
  const pendiente = derivada(P, q.T)
  const datos: Data[] = [
    trazaExacta(P),
    { x: pasos.slice(0, i + 1).map((x) => x.t), y: pasos.slice(0, i + 1).map((x) => x.T), type: 'scatter', mode: 'lines+markers', name: 'Euler hasta ahora', marker: { size: 9 }, line: { width: 2.5 } },
    ...(sig ? [{ x: [q.t, sig.t], y: [q.T, sig.T], type: 'scatter' as const, mode: 'lines+markers' as const, name: 'Próximo paso (recta con la pendiente actual)', line: { dash: 'dash' as const, width: 2, color: '#b3261e' }, marker: { size: 7, color: '#b3261e' } }] : []),
  ]
  return (
    <section className="explorador" aria-label="Euler paso a paso">
      <h3>Pruébalo: Euler paso a paso</h3>
      <p>Elige el tamaño del paso y pulsa «Dar un paso». Mira cómo en cada nodo se calcula la pendiente y se avanza en línea recta.</p>
      <div className="acciones">
        <Selector etiqueta="Paso h (min)" valor={h} onChange={(x) => { setH(x); setPaso(0) }} opciones={[{ valor: '1', texto: '1' }, { valor: '0.5', texto: '0.5' }, { valor: '0.25', texto: '0.25' }]} />
        <button type="button" onClick={() => setPaso(Math.min(i + 1, n))} disabled={i >= n}>Dar un paso</button>
        <button type="button" onClick={() => setPaso(Math.max(i - 1, 0))} disabled={i <= 0}>Retroceder</button>
        <button type="button" onClick={() => setPaso(0)}>Reiniciar</button>
      </div>
      <div className="idea" aria-live="polite">
        {i === 0 && sig && (
          <p><strong>Estado inicial.</strong> En t = 0 la temperatura es 80 °C. Si pulsas «Dar un paso», se calculará la pendiente f = −k·(T − Tₐ) = −0.5·(80 − 20) = <strong>−30 °C/min</strong> y se avanzará h minutos siguiendo esa recta.</p>
        )}
        {i > 0 && (
          <p>
            <strong>Paso {i}.</strong> En el nodo anterior (t = {fmt(pasos[i - 1].t, 6)}, T = {fmt(pasos[i - 1].T, 6)}) la pendiente era f = {fmt(derivada(P, pasos[i - 1].T), 6)} °C/min. Se avanzó h = {fmt(q.h, 6)} min:
            ΔT = h · f = {fmt(q.incremento, 6)} °C, y ahora T = <strong>{fmt(q.T, 6)} °C</strong> en t = {fmt(q.t, 6)} min. La solución exacta ahí vale {fmt(exacta(P, q.t), 6)} °C: el error es <strong>{fmt(q.error, 4)} °C</strong>.
          </p>
        )}
        {i > 0 && sig && <p>Siguiente: la nueva pendiente es {fmt(pendiente, 6)} °C/min (más suave, porque T está más cerca de la ambiente).</p>}
        {!sig && <p>Se llegó al tiempo final (t = {fmt(P.tf, 4)} min). Reinicia y prueba otro paso: ¿qué pasa con el error?</p>}
      </div>
      <Grafico titulo="Euler construyendo la solución" ejeX={EJE_T} ejeY={EJE_TEMP} datos={datos}
        descripcion="La curva negra es la solución exacta (que Euler no conoce). Los puntos son lo que calcula; la recta roja punteada es el próximo tramo: sigue la pendiente del último punto, por eso se despega un poco de la curva." />
    </section>
  )
}

/** RK4: dibuja las cuatro pendientes del primer paso y el promedio ponderado frente a la pendiente de Euler. */
export function PendientesRK4() {
  const [h, setH] = useState('0.5')
  const hh = Number(h)
  const r = integrarEnfriamiento('rk4', P, hh)
  const k = r.pasos[1].k!
  const [k1, k2, k3, k4] = k
  const T0 = P.T0
  const puntos = [
    { nombre: 'k₁ (inicio)', t: 0, T: T0, m: k1 },
    { nombre: 'k₂ (centro, con k₁)', t: hh / 2, T: T0 + (hh / 2) * k1, m: k2 },
    { nombre: 'k₃ (centro, con k₂)', t: hh / 2, T: T0 + (hh / 2) * k2, m: k3 },
    { nombre: 'k₄ (final, con k₃)', t: hh, T: T0 + hh * k3, m: k4 },
  ]
  const promedio = (k1 + 2 * k2 + 2 * k3 + k4) / 6
  // Cada pendiente se dibuja como un segmento que pasa por su punto de evaluación, dentro de [0, h].
  const tramos: [number, number][] = [[0, hh / 2], [hh / 4, (3 * hh) / 4], [hh / 4, (3 * hh) / 4], [hh / 2, hh]]
  const datos: Data[] = [
    trazaExacta(P, hh),
    ...puntos.map((p, i): Data => ({ x: tramos[i], y: tramos[i].map((x) => p.T + p.m * (x - p.t)), type: 'scatter', mode: 'lines', name: p.nombre, line: { width: 3 } })),
    { x: puntos.map((p) => p.t), y: puntos.map((p) => p.T), type: 'scatter', mode: 'markers', name: 'Dónde se evalúa cada pendiente', marker: { size: 9, symbol: 'circle-open', line: { width: 2 } } },
    { x: [0, hh], y: [T0, T0 + hh * promedio], type: 'scatter', mode: 'lines+markers', name: 'RK4: promedio ponderado', line: { width: 3, dash: 'dash', color: '#146c2e' }, marker: { size: 9, symbol: 'star' } },
    { x: [0, hh], y: [T0, T0 + hh * k1], type: 'scatter', mode: 'lines+markers', name: 'Euler: solo k₁', line: { width: 2, dash: 'dot', color: '#b3261e' }, marker: { size: 8, symbol: 'triangle-up' } },
  ]
  return (
    <section className="explorador" aria-label="Las cuatro pendientes de RK4">
      <h3>Mira las cuatro pendientes</h3>
      <div className="acciones">
        <Selector etiqueta="Paso h (min)" valor={h} onChange={setH} opciones={[{ valor: '1', texto: '1' }, { valor: '0.5', texto: '0.5' }, { valor: '0.25', texto: '0.25' }]} />
      </div>
      <Grafico titulo="Primer paso de RK4: cuatro pendientes y su promedio" ejeX={EJE_T} ejeY={EJE_TEMP} datos={datos}
        descripcion="Cada segmento corto es una pendiente (k₁ a k₄) dibujada en el punto donde se evalúa. RK4 no sigue una sola de ellas: toma un promedio ponderado (la recta verde), que cae mucho más cerca de la curva negra que la recta roja de Euler, que solo usa k₁." />
      <p>
        Con h = {fmt(hh, 4)}: k₁ = {fmt(k1, 8)}, k₂ = {fmt(k2, 8)}, k₃ = {fmt(k3, 8)}, k₄ = {fmt(k4, 8)} °C/min. Promedio (k₁ + 2k₂ + 2k₃ + k₄)/6 = <strong>{fmt(promedio, 8)}</strong>, frente a la pendiente
        de Euler k₁ = {fmt(k1, 8)}. La pendiente verdadera media del tramo es ≈ {fmt((exacta(P, hh) - T0) / hh, 8)} °C/min.
      </p>
    </section>
  )
}
