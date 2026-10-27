import Calculadora from '../../components/Calculadora'
import Campo from '../../components/Campo'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora, type Errores } from '../../components/useCalculadora'
import { parseNumero } from '../../core/entrada'
import { fmt } from '../../core/formato'
import { integrarEnfriamiento, NOMBRE_EDO, type MetodoEDO } from '../../core/m5'
import { EJE_T, EJE_TEMP, trazaExacta, trazaNodos } from './graficos'
import { CASO_EDO, EditorEdo, leerEdo, type FEdo } from './modelo'

const CASO = { ...CASO_EDO, h2: '0.25' }
type F = typeof CASO

type Fila = { metodo: MetodoEDO; h: number; res: ReturnType<typeof integrarEnfriamiento> }

function ejecutar(v: F) {
  const e = leerEdo(v)
  const errores: Errores<F> = 'errores' in e ? { ...e.errores } : {}
  const h2 = parseNumero(v.h2)
  if (h2 === null) errores.h2 = 'Ingresa un número.'
  if ('errores' in e || h2 === null) return { errores }
  // Cada combinación se ejecuta por separado: si una falla (p. ej. h = 0), las demás se conservan.
  const filas: Fila[] = ([['euler', e.h], ['euler', h2], ['rk4', e.h], ['rk4', h2]] as const).map(([metodo, h]) => ({ metodo, h, res: integrarEnfriamiento(metodo, e, h) }))
  return { salida: { filas, p: e } }
}

type Salida = NonNullable<ReturnType<typeof ejecutar>['salida']>

export default function Comparacion() {
  const c = useCalculadora<F, Salida>(CASO, ejecutar)
  const s = c.salida
  const ok = s?.filas.filter((f) => f.res.pasos.length > 1) ?? []
  const [eA, eB, rA, rB] = s?.filas.map((f) => f.res.resultado) ?? []
  return (
    <Calculadora titulo="Comparación: Euler frente a RK4" onCalcular={c.calcular} onCargarCaso={c.cargarCaso} onRestablecer={c.restablecer}
      extras={<button type="button" onClick={() => c.cargarYCalcular({ ...CASO, h: '0', h2: '0.25' })}>Probar fallo: h = 0</button>}
      salida={s && (
        <>
          {s.filas.map((f) => <div key={`${f.metodo}-${f.h}`}><strong>{NOMBRE_EDO[f.metodo]}, h = {fmt(f.h, 6)}</strong><MensajeEstado estado={f.res.estado} mensaje={f.res.mensaje} /></div>)}
          <TablaPasos titulo="Error máximo sobre los nodos" archivoCSV="comparacion-edo.csv" pasos={s.filas} columnas={[
            { clave: 'm', titulo: 'método', valor: (f) => NOMBRE_EDO[f.metodo] }, { clave: 'h', titulo: 'h (min)', valor: (f) => f.h },
            { clave: 'n', titulo: 'pasos', valor: (f) => f.res.resultado?.n }, { clave: 'ev', titulo: 'evaluaciones de f', valor: (f) => (f.res.resultado ? f.res.resultado.n * (f.metodo === 'euler' ? 1 : 4) : null) },
            { clave: 'T', titulo: `T(${fmt(s.p.tf, 6)}) (°C)`, valor: (f) => f.res.pasos[f.res.pasos.length - 1]?.T }, { clave: 'e', titulo: 'error máximo (°C)', valor: (f) => f.res.resultado?.errorMaximo },
          ]} />
          {eA && eB && rA && rB && eB.errorMaximo > 0 && rB.errorMaximo > 0 && (
            <p className="aviso">
              Al reducir el paso a la mitad, el error de Euler se divide por <strong>{fmt(eA.errorMaximo / eB.errorMaximo, 4)}</strong> (≈ 2: orden 1) y el de RK4 por{' '}
              <strong>{fmt(rA.errorMaximo / rB.errorMaximo, 4)}</strong> (≈ 16: orden 4). Con el mismo paso, RK4 es unas {fmt(eA.errorMaximo / rA.errorMaximo, 3)} veces más preciso que Euler a cambio de 4 evaluaciones por paso en vez de 1.
            </p>
          )}
          {ok.length > 0 && (
            <Grafico titulo="Curvas calculadas frente a la solución exacta" ejeX={EJE_T} ejeY={EJE_TEMP}
              datos={[trazaExacta(s.p), ...ok.map((f, i) => trazaNodos(f.res.pasos, `${NOMBRE_EDO[f.metodo]} (h = ${fmt(f.h, 4)})`, (['circle', 'diamond', 'square', 'circle'] as const)[i % 4], (['solid', 'dash', 'solid', 'dash'] as const)[i % 4]))]}
              descripcion="La curva negra es la exacta. Las curvas de RK4 son prácticamente indistinguibles de ella; las de Euler quedan por encima porque cada paso usa una pendiente demasiado optimista (la temperatura baja menos de lo real). Marcadores y trazos distintos separan cada curva sin depender solo del color." />
          )}
        </>
      )}>
      <EditorEdo valores={c.valores} errores={c.errores} set={c.set} />
      <Campo etiqueta="Segundo paso h₂" unidad="min" valor={c.valores.h2} onChange={(x) => c.set('h2', x)} error={c.errores.h2} ayuda="Se comparan el paso h y este." />
    </Calculadora>
  )
}

export type { FEdo }
