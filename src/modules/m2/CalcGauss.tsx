import Calculadora from '../../components/Calculadora'
import MensajeEstado from '../../components/MensajeEstado'
import TablaPasos from '../../components/TablaPasos'
import { useAplicarPreset, type PresetActivo } from '../../components/PanelCalculadora'
import { useCalculadora } from '../../components/useCalculadora'
import { fmt } from '../../core/formato'
import { eliminacionGauss } from '../../core/m2'
import { EJERCICIO_1, EJERCICIO_2 } from './ejercicios'
import { CASO_SISTEMA, EditorSistema, leerSistema, MatrizTabla, SISTEMA_SINGULAR, type FSistema } from './sistema'

type Salida = { res: ReturnType<typeof eliminacionGauss>; A: number[][]; b: number[] }

function ejecutar(v: FSistema) {
  const s = leerSistema(v)
  if ('errores' in s) return { errores: s.errores }
  return { salida: { res: eliminacionGauss(s), A: s.A, b: s.b } }
}

export default function CalcGauss({ preset = null }: { preset?: PresetActivo | null }) {
  const c = useCalculadora<FSistema, Salida>(CASO_SISTEMA, ejecutar)
  useAplicarPreset('gauss', preset, (valores) => c.cargarYCalcular({ ...CASO_SISTEMA, ...valores }))
  const s = c.salida
  const r = s?.res.resultado
  return (
    <Calculadora
      titulo="Calculadora de eliminación con pivoteo parcial"
      onCalcular={c.calcular}
      onCargarCaso={c.cargarCaso}
      onRestablecer={c.restablecer}
      extras={
        <>
          <button type="button" onClick={() => c.cargarYCalcular(EJERCICIO_1)}>Ejercicio 1 (3×3)</button>
          <button type="button" onClick={() => c.cargarYCalcular(EJERCICIO_2)} title="a, b, c, d se identifican con x1, x2, x3, x4">Ejercicio 2 (4×4)</button>
          <button type="button" onClick={() => c.cargarYCalcular(SISTEMA_SINGULAR)}>Probar fallo: sistema singular</button>
        </>
      }
      salida={s && (
        <>
          <MensajeEstado estado={s.res.estado} mensaje={s.res.mensaje} />
          {r?.advertencias.map((a) => <p key={a} className="advertencia" role="note">⚠ {a}</p>)}
          {r && (
            <>
              <TablaPasos titulo="Solución (índices normalizados de demanda)" archivoCSV="gauss-solucion.csv" pasos={r.x.map((x, i) => ({ i: i + 1, x }))}
                columnas={[{ clave: 'i', titulo: 'incógnita', valor: (p) => `x${p.i}` }, { clave: 'x', titulo: 'valor', valor: (p) => p.x }]} />
              <p>Residuo ‖b − Ax‖∞ = {fmt(r.residuoInf, 6)}. Criterio de pivote: {r.criterio}.</p>
            </>
          )}
          {s.res.pasos.length > 0 && (
            <>
              <MatrizTabla titulo="Matriz aumentada inicial [A | b]" M={s.A.map((f, i) => [...f, s.b[i]])} />
              {s.res.pasos.map((p) => (
                <div key={p.k}>
                  <p>
                    <strong>Paso {p.k}:</strong>{' '}
                    {p.intercambio ? `intercambio de las filas ${p.intercambio[0] + 1} y ${p.intercambio[1] + 1} (pivote mayor en valor absoluto); ` : 'sin intercambio; '}
                    pivote {fmt(p.pivote, 8)}; multiplicadores {p.multiplicadores.map((m) => fmt(m, 6)).join(', ')}.
                  </p>
                  <MatrizTabla titulo={`Matriz tras el paso ${p.k}`} M={p.matriz} />
                </div>
              ))}
            </>
          )}
        </>
      )}
    >
      <EditorSistema valores={c.valores} errores={c.errores} set={c.set} />
    </Calculadora>
  )
}
