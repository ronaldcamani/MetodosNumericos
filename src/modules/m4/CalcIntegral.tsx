import Calculadora from '../../components/Calculadora'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora } from '../../components/useCalculadora'
import { fmt } from '../../core/formato'
import { integrarTasa, type EntradaIntegral, type MetodoIntegral } from '../../core/m4'
import { EJE_R, EJE_T, trazaNodos, trazaSimpson, trazaTasa, trazaTrapecio } from './graficos'
import { CASO_TASA, EditorTasa, leerEntrada, TASA_N0, TASA_N3, TASA_NEGATIVA, type FTasa } from './tasa'

type Salida = { res: ReturnType<typeof integrarTasa>; e: EntradaIntegral }

const TITULO = { trapecio: 'Calculadora de trapecio compuesto', simpson: 'Calculadora de Simpson 1/3 compuesto' } as const

export default function CalcIntegral({ metodo }: { metodo: MetodoIntegral }) {
  const c = useCalculadora<FTasa, Salida>(CASO_TASA, (v) => {
    const e = leerEntrada(v)
    if ('errores' in e) return { errores: e.errores }
    return { salida: { res: integrarTasa(metodo, e), e } }
  })
  const s = c.salida
  const r = s?.res.resultado
  const f = metodo === 'trapecio' ? 'h/2' : 'h/3'
  return (
    <Calculadora
      titulo={TITULO[metodo]}
      onCalcular={c.calcular}
      onCargarCaso={c.cargarCaso}
      onRestablecer={c.restablecer}
      extras={
        <>
          {metodo === 'simpson' && <button type="button" onClick={() => c.cargarYCalcular(TASA_N3)}>Probar fallo: n = 3 (impar)</button>}
          <button type="button" onClick={() => c.cargarYCalcular(TASA_N0)}>Probar fallo: n = 0</button>
          <button type="button" onClick={() => c.cargarYCalcular(TASA_NEGATIVA)}>Ejemplo: tasa negativa</button>
        </>
      }
      salida={s && (
        <>
          <MensajeEstado estado={s.res.estado} mensaje={s.res.mensaje} />
          {r?.advertencias.map((a) => <p key={a} className="advertencia" role="note">⚠ {a}</p>)}
          {r && (
            <>
              <dl className="resumen">
                <dt>Volumen acumulado (aproximación)</dt><dd>{fmt(r.integral, 10)} MB</dd>
                <dt>Integral exacta</dt><dd>{fmt(r.exacta, 10)} MB</dd>
                <dt>Error absoluto</dt><dd>{fmt(r.errorAbs, 6)} MB</dd>
                <dt>Error relativo</dt><dd>{r.errorRel === null ? 'no definido (exacta = 0)' : fmt(r.errorRel, 6)}</dd>
                <dt>Paso h = (fin − inicio)/n</dt><dd>{fmt(r.h, 10)} s</dd>
                <dt>Factor común {f}</dt><dd>{fmt(r.factor, 10)} s</dd>
              </dl>
              <p>Unidades: la tasa se mide en MB/s y el tiempo en s, así que el acumulado r·t se expresa en <strong>MB</strong>. El resultado es {f} · Σ (peso · r(tᵢ)).</p>
              <TablaPasos titulo={`Nodos, pesos y sumas parciales (${metodo === 'trapecio' ? 'trapecio' : 'Simpson 1/3'})`} archivoCSV={`${metodo}-nodos.csv`} pasos={s.res.pasos} columnas={[
                { clave: 'i', titulo: 'i', valor: (p) => p.i },
                { clave: 't', titulo: 'tᵢ (s)', valor: (p) => p.t },
                { clave: 'r', titulo: 'r(tᵢ) (MB/s)', valor: (p) => p.r },
                { clave: 'w', titulo: 'peso', valor: (p) => p.peso },
                { clave: 'c', titulo: `${f}·peso·r (MB)`, valor: (p) => p.contribucion },
                { clave: 's', titulo: 'suma parcial (MB)', valor: (p) => p.sumaParcial },
              ]} />
              <Grafico titulo={metodo === 'trapecio' ? 'Área bajo la poligonal (trapecio)' : 'Área bajo los arcos parabólicos (Simpson)'} ejeX={EJE_T} ejeY={EJE_R}
                datos={[trazaTasa(s.e.tasa, s.e.inicio, s.e.fin), metodo === 'trapecio' ? trazaTrapecio(s.res.pasos) : trazaSimpson(s.res.pasos), trazaNodos(s.res.pasos)]}
                descripcion={metodo === 'trapecio'
                  ? 'La curva negra es la tasa; la región azul es el área de los trapecios, que aproxima el volumen acumulado. En una tasa convexa los trapecios quedan por encima de la curva (sobrestiman); al aumentar n la poligonal se pega a la curva.'
                  : 'La curva negra es la tasa; la región naranja es el área bajo una parábola por cada tres nodos. Aquí coincide con la curva porque la tasa es cuadrática; en una función cualquiera Simpson no es exacto, solo converge más rápido (error ∝ h⁴).'} />
            </>
          )}
        </>
      )}
    >
      <EditorTasa valores={c.valores} errores={c.errores} set={c.set} />
    </Calculadora>
  )
}
