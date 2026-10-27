import Calculadora from '../../components/Calculadora'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import { useAplicarPreset, type PresetActivo } from '../../components/PanelCalculadora'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora } from '../../components/useCalculadora'
import { fmt } from '../../core/formato'
import { advertenciasEDO, integrarEnfriamiento, NOMBRE_EDO, type MetodoEDO } from '../../core/m5'
import { EJE_T, EJE_TEMP, trazaError, trazaExacta, trazaNodos } from './graficos'
import { CASO_EDO, EDO_H0, EDO_H03, EDO_H5, EditorEdo, leerEdo, type EdoLeido, type FEdo } from './modelo'

type Salida = { res: ReturnType<typeof integrarEnfriamiento>; p: EdoLeido; metodo: MetodoEDO }

const TITULO: Record<MetodoEDO, string> = { euler: 'Calculadora de Euler explícito', rk4: 'Calculadora de Runge-Kutta 4' }

export default function CalcEDO({ metodo, preset = null }: { metodo: MetodoEDO; preset?: PresetActivo | null }) {
  const c = useCalculadora<FEdo, Salida>(CASO_EDO, (v) => {
    const e = leerEdo(v)
    if ('errores' in e) return { errores: e.errores }
    return { salida: { res: integrarEnfriamiento(metodo, e, e.h), p: e, metodo } }
  })
  useAplicarPreset(metodo, preset, (valores) => c.cargarYCalcular({ ...CASO_EDO, ...valores }))
  const s = c.salida
  const r = s?.res.resultado
  const adv = s ? (r ? r.advertencias : advertenciasEDO(metodo, s.p, s.p.h)) : []
  const pasos = s?.res.pasos ?? []
  const ultimo = pasos[pasos.length - 1]
  const primero = pasos[1]
  return (
    <Calculadora titulo={TITULO[metodo]} onCalcular={c.calcular} onCargarCaso={c.cargarCaso} onRestablecer={c.restablecer}
      extras={
        <>
          <button type="button" onClick={() => c.cargarYCalcular({ ...CASO_EDO, h: '0.25' })}>Paso 0.25</button>
          <button type="button" onClick={() => c.cargarYCalcular(EDO_H03)} title="0.3 no divide 2: el último paso es más corto">Paso 0.3 (no divide)</button>
          <button type="button" onClick={() => c.cargarYCalcular(EDO_H5)} title="Paso 5 con horizonte de 20 minutos">Paso 5 en 20 min</button>
          <button type="button" onClick={() => c.cargarYCalcular(EDO_H0)}>Probar fallo: h = 0</button>
        </>
      }
      salida={s && (
        <>
          <MensajeEstado estado={s.res.estado} mensaje={s.res.mensaje} />
          {adv.map((a) => <p key={a} className="advertencia" role="note">⚠ {a}</p>)}
          {pasos.length > 1 && ultimo && (
            <>
              <dl className="resumen">
                <dt>Método</dt><dd>{NOMBRE_EDO[metodo]}, h = {fmt(s.p.h, 6)} min</dd>
                <dt>T({fmt(s.p.tf, 6)}) calculada</dt><dd>{fmt(ultimo.T, 10)} °C</dd>
                <dt>T({fmt(s.p.tf, 6)}) exacta</dt><dd>{fmt(ultimo.exacta, 10)} °C</dd>
                <dt>Error en el último nodo</dt><dd>{fmt(ultimo.error, 6)} °C</dd>
                {r && <><dt>Error máximo sobre los nodos</dt><dd>{fmt(r.errorMaximo, 6)} °C</dd></>}
                {r && <><dt>Factor por paso (modelo lineal)</dt><dd>{fmt(r.factor, 8)} {Math.abs(r.factor) < 1 ? '(|factor| < 1: estable)' : '(|factor| ≥ 1: inestable)'}</dd></>}
                <dt>Evaluaciones de f</dt><dd>{(pasos.length - 1) * (metodo === 'euler' ? 1 : 4)} ({metodo === 'euler' ? '1' : '4'} por paso)</dd>
              </dl>
              <TablaPasos titulo={`Nodos de ${NOMBRE_EDO[metodo]}`} archivoCSV={`${metodo}-nodos.csv`} pasos={pasos} columnas={[
                { clave: 'i', titulo: 'i', valor: (q) => q.i },
                { clave: 't', titulo: 't (min)', valor: (q) => q.t },
                { clave: 'h', titulo: 'h usado (min)', valor: (q) => (q.i === 0 ? null : q.h) },
                { clave: 'T', titulo: 'T calculada (°C)', valor: (q) => q.T },
                { clave: 'd', titulo: 'incremento ΔT (°C)', valor: (q) => (q.i === 0 ? null : q.incremento) },
                { clave: 'e', titulo: 'T exacta (°C)', valor: (q) => q.exacta },
                { clave: 'er', titulo: 'error (°C)', valor: (q) => q.error },
                { clave: 'n', titulo: 'nota', valor: (q) => (q.corto ? 'último paso más corto' : q.i === 0 ? 'condición inicial' : '') },
              ]} />
              {metodo === 'rk4' && primero?.k && (
                <>
                  <TablaPasos titulo="Las cuatro pendientes del primer paso de RK4" pasos={[
                    { k: 'k₁', donde: `inicio del paso: t = 0, T = ${fmt(s.p.T0, 6)}`, v: primero.k[0], que: 'pendiente con la que empezaría Euler' },
                    { k: 'k₂', donde: 'punto medio, avanzando con k₁ media paso', v: primero.k[1], que: 'primera estimación en el centro' },
                    { k: 'k₃', donde: 'punto medio, avanzando con k₂ media paso', v: primero.k[2], que: 'corrige la estimación del centro' },
                    { k: 'k₄', donde: 'final, avanzando con k₃ un paso entero', v: primero.k[3], que: 'pendiente al final del paso' },
                  ]} columnas={[
                    { clave: 'k', titulo: 'pendiente', valor: (q) => q.k }, { clave: 'v', titulo: 'valor (°C/min)', valor: (q) => q.v },
                    { clave: 'd', titulo: 'dónde se evalúa', valor: (q) => q.donde }, { clave: 'q', titulo: 'idea', valor: (q) => q.que },
                  ]} />
                  <p>
                    Promedio ponderado (k₁ + 2k₂ + 2k₃ + k₄)/6 = <strong>{fmt((primero.k[0] + 2 * primero.k[1] + 2 * primero.k[2] + primero.k[3]) / 6, 10)}</strong> °C/min;
                    {' '}ΔT = h · promedio = <strong>{fmt(primero.incremento, 10)}</strong> °C, así que T(h) = <strong>{fmt(primero.T, 10)}</strong> °C.
                  </p>
                </>
              )}
              <Grafico titulo="Temperatura: solución exacta y nodos calculados" ejeX={EJE_T} ejeY={EJE_TEMP} datos={[trazaExacta(s.p), trazaNodos(pasos, NOMBRE_EDO[metodo], metodo === 'euler' ? 'circle' : 'square')]}
                descripcion="La curva negra es la solución exacta; los puntos unidos son lo que calcula el método. Cuanto más pegados a la curva, mejor. Con un paso demasiado grande los puntos pueden oscilar o alejarse: eso es inestabilidad, no física." />
              <Grafico titulo="Error en cada nodo (escala logarítmica)" ejeX={EJE_T} ejeY="Error absoluto (°C)" datos={[trazaError(pasos, NOMBRE_EDO[metodo], metodo === 'euler' ? 'circle' : 'square')]} layout={{ yaxis: { type: 'log' } }}
                descripcion="Distancia entre lo calculado y la solución exacta en cada nodo. El error del primer nodo es el error de un solo paso; después se va acumulando (error global)." />
            </>
          )}
        </>
      )}>
      <EditorEdo valores={c.valores} errores={c.errores} set={c.set} />
    </Calculadora>
  )
}
