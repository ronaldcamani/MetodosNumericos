import Calculadora from '../../components/Calculadora'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora } from '../../components/useCalculadora'
import { fmt } from '../../core/formato'
import { integrarTasa, type EntradaIntegral } from '../../core/m4'
import { EJE_R, EJE_T, trazaNodos, trazaSimpson, trazaTasa, trazaTrapecio } from './graficos'
import { CASO_TASA, EditorTasa, leerEntrada, TASA_N0, TASA_N3, TASA_NEGATIVA, type FTasa } from './tasa'

const REFINAMIENTO = [2, 4, 8]
const ERRORES_N = [2, 4, 8, 16, 32]

type Salida = { trap: ReturnType<typeof integrarTasa>; simp: ReturnType<typeof integrarTasa>; e: EntradaIntegral }

function ejecutar(v: FTasa) {
  const e = leerEntrada(v)
  if ('errores' in e) return { errores: e.errores }
  // Los dos métodos son independientes: el fallo de uno (p. ej. n impar en Simpson) no oculta el otro.
  return { salida: { trap: integrarTasa('trapecio', e), simp: integrarTasa('simpson', e), e } }
}

export default function Comparacion() {
  const c = useCalculadora<FTasa, Salida>(CASO_TASA, ejecutar)
  const s = c.salida
  const t = s?.trap.resultado
  const p = s?.simp.resultado
  const exacta = t?.exacta ?? p?.exacta
  const filas = s && [
    { m: 'Trapecio compuesto', res: s.trap, r: t },
    { m: 'Simpson 1/3 compuesto', res: s.simp, r: p },
  ]
  const refinamiento = s && REFINAMIENTO.map((n) => ({
    n,
    trap: integrarTasa('trapecio', { ...s.e, n }).resultado,
    simp: integrarTasa('simpson', { ...s.e, n }).resultado,
  }))
  const curvaError = s && ERRORES_N.map((n) => ({ n, trap: integrarTasa('trapecio', { ...s.e, n }).resultado?.errorAbs ?? null, simp: integrarTasa('simpson', { ...s.e, n }).resultado?.errorAbs ?? null }))
  return (
    <Calculadora
      titulo="Comparación: trapecio vs Simpson"
      onCalcular={c.calcular}
      onCargarCaso={c.cargarCaso}
      onRestablecer={c.restablecer}
      extras={
        <>
          <button type="button" onClick={() => c.cargarYCalcular(TASA_N3)}>Probar fallo: n = 3 (impar)</button>
          <button type="button" onClick={() => c.cargarYCalcular(TASA_N0)}>Probar fallo: n = 0</button>
          <button type="button" onClick={() => c.cargarYCalcular(TASA_NEGATIVA)}>Ejemplo: tasa negativa</button>
        </>
      }
      salida={s && filas && refinamiento && curvaError && (
        <>
          {filas.map((f) => <div key={f.m}><strong>{f.m}</strong><MensajeEstado estado={f.res.estado} mensaje={f.res.mensaje} /></div>)}
          {[...new Set([...(t?.advertencias ?? []), ...(p?.advertencias ?? [])])].map((a) => <p key={a} className="advertencia" role="note">⚠ {a}</p>)}
          <TablaPasos titulo={`Resultados con n = ${s.e.n}`} archivoCSV="comparacion-m4.csv" pasos={filas} columnas={[
            { clave: 'm', titulo: 'método', valor: (f) => f.m },
            { clave: 'e', titulo: 'estado', valor: (f) => f.res.estado },
            { clave: 'v', titulo: 'volumen (MB)', valor: (f) => f.r?.integral },
            { clave: 'x', titulo: 'exacta (MB)', valor: (f) => f.r?.exacta },
            { clave: 'a', titulo: 'error absoluto (MB)', valor: (f) => f.r?.errorAbs },
          ]} />
          {exacta !== undefined && (
            <TablaPasos titulo={`Refinar la partición (exacta ${fmt(exacta, 10)} MB)`} archivoCSV="refinamiento-m4.csv" pasos={refinamiento} columnas={[
              { clave: 'n', titulo: 'n', valor: (f) => f.n },
              { clave: 'h', titulo: 'h (s)', valor: (f) => f.trap?.h },
              { clave: 't', titulo: 'trapecio (MB)', valor: (f) => f.trap?.integral },
              { clave: 'te', titulo: 'error trapecio', valor: (f) => f.trap?.errorAbs },
              { clave: 's', titulo: 'Simpson (MB)', valor: (f) => f.simp?.integral },
              { clave: 'se', titulo: 'error Simpson', valor: (f) => f.simp?.errorAbs },
            ]} />
          )}
          <p className="aviso">
            Al duplicar n el error del trapecio se divide aproximadamente entre 4 (error ∝ h²). Simpson da un error de redondeo (~10⁻¹⁵) porque la tasa es un polinomio de grado ≤ 3, para el que la regla es exacta; <strong>no</strong> significa que Simpson sea exacto en general: con otras funciones su error es ∝ h⁴, no cero.
          </p>
          <Grafico titulo="Tasa y áreas aproximadas" ejeX={EJE_T} ejeY={EJE_R}
            datos={[trazaTasa(s.e.tasa, s.e.inicio, s.e.fin), ...(t ? [trazaTrapecio(s.trap.pasos, false)] : []), ...(p ? [trazaSimpson(s.simp.pasos, false)] : []), ...(t ? [trazaNodos(s.trap.pasos)] : [])]}
            descripcion="Curva negra: la tasa. Línea azul continua: poligonal del trapecio. Línea naranja discontinua: arcos parabólicos de Simpson. El área bajo cada aproximación es el volumen estimado en MB; los estilos de línea distinguen los métodos sin depender solo del color." />
          <Grafico titulo="Error absoluto frente al número de subintervalos" ejeX="Subintervalos n" ejeY="Error absoluto (MB)"
            datos={[
              { x: curvaError.map((f) => f.n), y: curvaError.map((f) => f.trap), type: 'scatter', mode: 'lines+markers', name: 'Trapecio', marker: { symbol: 'circle' } },
              { x: curvaError.map((f) => f.n), y: curvaError.map((f) => f.simp), type: 'scatter', mode: 'lines+markers', name: 'Simpson', line: { dash: 'dash' }, marker: { symbol: 'square' } },
            ]}
            descripcion="El error del trapecio decrece como 1/n²; el de Simpson es prácticamente cero aquí porque la tasa es cuadrática. Con una función de grado mayor, Simpson también tendría error (decreciendo como 1/n⁴)." />
        </>
      )}
    >
      <EditorTasa valores={c.valores} errores={c.errores} set={c.set} />
    </Calculadora>
  )
}
