import type { Data } from 'plotly.js'
import Calculadora from '../../components/Calculadora'
import Campo from '../../components/Campo'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import { useAplicarPreset, type PresetActivo } from '../../components/PanelCalculadora'
import Selector from '../../components/Selector'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora, type Errores } from '../../components/useCalculadora'
import { parseEntero, parseNumero } from '../../core/entrada'
import { erroresAproximacion, operarConPrecision, serieExponencial, sumaConPrecision, type ModoRedondeo, type Operacion } from '../../core/errores'
import { fmt } from '../../core/formato'

const MODOS = [{ valor: 'redondeo', texto: 'Redondeo (mitad hacia arriba)' }, { valor: 'truncamiento', texto: 'Truncamiento (cortar)' }]
const OPERACIONES = ['+', '−', '×', '÷'].map((o) => ({ valor: o, texto: o }))
const pct = (x: number | null) => (x === null ? 'no definido' : `${fmt(x, 6)} %`)

/* ---------- 1. Error de una aproximación ---------- */
const CASO_APROX = { verdadero: '3.14159265358979', aproximado: '3.1416' }
type FAprox = typeof CASO_APROX

function ejecutarAprox(v: FAprox) {
  const errores: Errores<FAprox> = {}
  const verdadero = parseNumero(v.verdadero)
  const aproximado = parseNumero(v.aproximado)
  if (verdadero === null) errores.verdadero = 'Ingresa un número.'
  if (aproximado === null) errores.aproximado = 'Ingresa un número.'
  if (verdadero === null || aproximado === null) return { errores }
  return { salida: { res: erroresAproximacion({ verdadero, aproximado }), verdadero, aproximado } }
}

export function CalcAproximacion({ preset }: { preset: PresetActivo | null }) {
  const c = useCalculadora<FAprox, NonNullable<ReturnType<typeof ejecutarAprox>['salida']>>(CASO_APROX, ejecutarAprox)
  useAplicarPreset('aprox', preset, (valores) => c.cargarYCalcular({ ...CASO_APROX, ...valores }))
  const r = c.salida?.res.resultado
  return (
    <Calculadora titulo="Calculadora de error de una aproximación" onCalcular={c.calcular} onCargarCaso={c.cargarCaso} onRestablecer={c.restablecer}
      extras={<button type="button" onClick={() => c.cargarYCalcular({ verdadero: '100', aproximado: '99.5' })}>Ejemplo: 100 y 99.5</button>}
      salida={c.salida && (
        <>
          <MensajeEstado estado={c.salida.res.estado} mensaje={c.salida.res.mensaje} />
          {r?.advertencias.map((a) => <p key={a} className="advertencia" role="note">⚠ {a}</p>)}
          {r && (
            <dl className="resumen">
              <dt>Error absoluto |x − x̃|</dt><dd>{fmt(r.absoluto, 8)}</dd>
              <dt>Error relativo |x − x̃| / |x|</dt><dd>{r.relativo === null ? 'no definido' : fmt(r.relativo, 8)}</dd>
              <dt>Error porcentual</dt><dd>{pct(r.porcentual)}</dd>
              <dt>Cifras significativas correctas</dt><dd>{r.cifras === null ? 'no definido' : r.cifras === Infinity ? 'todas (valor exacto)' : r.cifras}</dd>
            </dl>
          )}
        </>
      )}>
      <Campo etiqueta="Valor verdadero x" valor={c.valores.verdadero} onChange={(x) => c.set('verdadero', x)} error={c.errores.verdadero} />
      <Campo etiqueta="Valor aproximado x̃" valor={c.valores.aproximado} onChange={(x) => c.set('aproximado', x)} error={c.errores.aproximado} />
    </Calculadora>
  )
}

/* ---------- 2. Aritmética de t cifras ---------- */
const CASO_OP = { a: '0.12345', op: '−', b: '0.12341', t: '4', modo: 'redondeo' }
type FOp = typeof CASO_OP

function ejecutarOp(v: FOp) {
  const errores: Errores<FOp> = {}
  const a = parseNumero(v.a)
  const b = parseNumero(v.b)
  const t = parseEntero(v.t)
  if (a === null) errores.a = 'Ingresa un número.'
  if (b === null) errores.b = 'Ingresa un número.'
  if (t === null) errores.t = 'Ingresa un entero.'
  if (a === null || b === null || t === null) return { errores }
  return { salida: { res: operarConPrecision({ a, op: v.op as Operacion, b, t, modo: v.modo as ModoRedondeo }), a, b, t } }
}

export function CalcOperacion({ preset }: { preset: PresetActivo | null }) {
  const c = useCalculadora<FOp, NonNullable<ReturnType<typeof ejecutarOp>['salida']>>(CASO_OP, ejecutarOp)
  useAplicarPreset('operacion', preset, (valores) => c.cargarYCalcular({ ...CASO_OP, ...valores }))
  const r = c.salida?.res.resultado
  return (
    <Calculadora titulo="Calculadora de aritmética de t cifras" onCalcular={c.calcular} onCargarCaso={c.cargarCaso} onRestablecer={c.restablecer}
      extras={<button type="button" onClick={() => c.cargarYCalcular({ ...CASO_OP, modo: 'truncamiento' })}>Mismo caso con truncamiento</button>}
      salida={c.salida && (
        <>
          <MensajeEstado estado={c.salida.res.estado} mensaje={c.salida.res.mensaje} />
          {r && (
            <>
              <TablaPasos titulo="Operandos y resultado" pasos={[{ n: 'a', v: c.salida.a, r: r.aRed }, { n: 'b', v: c.salida.b, r: r.bRed }, { n: `resultado (${c.valores.modo})`, v: r.exacto, r: r.calculado }]}
                columnas={[{ clave: 'n', titulo: 'cantidad', valor: (p) => p.n }, { clave: 'v', titulo: 'valor exacto', valor: (p) => p.v }, { clave: 'r', titulo: `con t = ${c.salida!.t} cifras`, valor: (p) => p.r }]} />
              <dl className="resumen">
                <dt>Error absoluto</dt><dd>{fmt(r.absoluto, 8)}</dd>
                <dt>Error relativo</dt><dd>{r.relativo === null ? 'no definido' : fmt(r.relativo, 8)}</dd>
              </dl>
              {r.relativo !== null && r.relativo > 0.1 && (
                <p className="advertencia" role="note">⚠ El error relativo supera el 10 %: se perdieron casi todas las cifras significativas. Es la <strong>cancelación catastrófica</strong>: al restar números casi iguales desaparecen las cifras en común y solo quedan las inexactas.</p>
              )}
            </>
          )}
        </>
      )}>
      <Campo etiqueta="Primer número a" valor={c.valores.a} onChange={(x) => c.set('a', x)} error={c.errores.a} />
      <Selector etiqueta="Operación" valor={c.valores.op} onChange={(x) => c.set('op', x)} opciones={OPERACIONES} />
      <Campo etiqueta="Segundo número b" valor={c.valores.b} onChange={(x) => c.set('b', x)} error={c.errores.b} />
      <Campo etiqueta="Cifras significativas t" valor={c.valores.t} onChange={(x) => c.set('t', x)} error={c.errores.t} ayuda="Entero de 1 a 12." />
      <Selector etiqueta="Modo" valor={c.valores.modo} onChange={(x) => c.set('modo', x)} opciones={MODOS} />
    </Calculadora>
  )
}

/* ---------- 3. Orden de la suma ---------- */
const CASO_SUMA = { lista: '1000, 0.4, 0.4', t: '4', modo: 'redondeo' }
type FSuma = typeof CASO_SUMA

function ejecutarSuma(v: FSuma) {
  const errores: Errores<FSuma> = {}
  const partes = v.lista.split(/[\s,;]+/).filter(Boolean)
  const valores = partes.map(parseNumero)
  const t = parseEntero(v.t)
  if (!partes.length || valores.some((x) => x === null)) errores.lista = 'Escribe números separados por comas.'
  if (t === null) errores.t = 'Ingresa un entero.'
  if (errores.lista || errores.t) return { errores }
  return { salida: { res: sumaConPrecision({ valores: valores as number[], t: t!, modo: v.modo as ModoRedondeo }) } }
}

export function CalcSuma({ preset }: { preset: PresetActivo | null }) {
  const c = useCalculadora<FSuma, NonNullable<ReturnType<typeof ejecutarSuma>['salida']>>(CASO_SUMA, ejecutarSuma)
  useAplicarPreset('suma', preset, (valores) => c.cargarYCalcular({ ...CASO_SUMA, ...valores }))
  const r = c.salida?.res.resultado
  const datos: Data[] = r ? [
    { x: r.orden.map((p) => p.k), y: r.orden.map((p) => p.parcial), type: 'scatter', mode: 'lines+markers', name: 'Orden dado', marker: { symbol: 'square' } },
    { x: r.ordenCreciente.map((p) => p.k), y: r.ordenCreciente.map((p) => p.parcial), type: 'scatter', mode: 'lines+markers', name: 'Orden creciente', marker: { symbol: 'diamond' }, line: { dash: 'dash' } },
    { x: [1, r.orden.length], y: [r.exacta, r.exacta], type: 'scatter', mode: 'lines', name: 'Suma exacta', line: { dash: 'dot', width: 1.5 } },
  ] : []
  return (
    <Calculadora titulo="Calculadora de orden de la suma" onCalcular={c.calcular} onCargarCaso={c.cargarCaso} onRestablecer={c.restablecer}
      extras={<button type="button" onClick={() => c.cargarYCalcular({ lista: '1, 0.0004, 0.0004, 0.0004', t: '4', modo: 'truncamiento' })}>Ejemplo con truncamiento</button>}
      salida={c.salida && (
        <>
          <MensajeEstado estado={c.salida.res.estado} mensaje={c.salida.res.mensaje} />
          {r && (
            <>
              <TablaPasos titulo="Sumas parciales con t cifras" pasos={r.orden.map((p, i) => ({ k: p.k, a: p.parcial, b: r.ordenCreciente[i].parcial, sa: p.sumando, sb: r.ordenCreciente[i].sumando }))}
                columnas={[{ clave: 'k', titulo: 'paso', valor: (p) => p.k }, { clave: 'sa', titulo: 'sumando (orden dado)', valor: (p) => p.sa }, { clave: 'a', titulo: 'parcial (orden dado)', valor: (p) => p.a }, { clave: 'sb', titulo: 'sumando (creciente)', valor: (p) => p.sb }, { clave: 'b', titulo: 'parcial (creciente)', valor: (p) => p.b }]} />
              <dl className="resumen">
                <dt>Suma exacta</dt><dd>{fmt(r.exacta, 10)}</dd>
                <dt>Error en el orden dado</dt><dd>{fmt(r.errorOrden, 8)}</dd>
                <dt>Error en orden creciente</dt><dd>{fmt(r.errorCreciente, 8)}</dd>
              </dl>
              <Grafico titulo="Sumas parciales según el orden" ejeX="Número de sumandos" ejeY="Suma parcial" datos={datos}
                descripcion="Cada punto es una suma parcial redondeada a t cifras. Cuando un sumando pequeño se suma a una cantidad grande, queda por debajo de la última cifra conservada y se pierde: sumar de menor a mayor lo evita." />
            </>
          )}
        </>
      )}>
      <Campo etiqueta="Números a sumar (2 a 6)" valor={c.valores.lista} onChange={(x) => c.set('lista', x)} error={c.errores.lista} ayuda="Separados por comas, en el orden dado." />
      <Campo etiqueta="Cifras significativas t" valor={c.valores.t} onChange={(x) => c.set('t', x)} error={c.errores.t} />
      <Selector etiqueta="Modo" valor={c.valores.modo} onChange={(x) => c.set('modo', x)} opciones={MODOS} />
    </Calculadora>
  )
}

/* ---------- 4. Truncamiento de la serie de eˣ ---------- */
const CASO_SERIE = { x: '1', terminos: '8' }
type FSerie = typeof CASO_SERIE

function ejecutarSerie(v: FSerie) {
  const errores: Errores<FSerie> = {}
  const x = parseNumero(v.x)
  const terminos = parseEntero(v.terminos)
  if (x === null) errores.x = 'Ingresa un número.'
  if (terminos === null) errores.terminos = 'Ingresa un entero.'
  if (x === null || terminos === null) return { errores }
  return { salida: { res: serieExponencial({ x, terminos }), x } }
}

export function CalcSerie({ preset }: { preset: PresetActivo | null }) {
  const c = useCalculadora<FSerie, NonNullable<ReturnType<typeof ejecutarSerie>['salida']>>(CASO_SERIE, ejecutarSerie)
  useAplicarPreset('serie', preset, (valores) => c.cargarYCalcular({ ...CASO_SERIE, ...valores }))
  const r = c.salida?.res.resultado
  const datos: Data[] = r ? [
    { x: r.pasos.map((p) => p.terminos), y: r.pasos.map((p) => Math.max(p.error, 1e-17)), type: 'scatter', mode: 'lines+markers', name: 'Error real |eˣ − Sₙ|', marker: { symbol: 'square' } },
    { x: r.pasos.map((p) => p.terminos), y: r.pasos.map((p) => Math.max(p.cota, 1e-17)), type: 'scatter', mode: 'lines', name: 'Cota de Lagrange', line: { dash: 'dash' } },
  ] : []
  return (
    <Calculadora titulo="Calculadora de truncamiento de series" onCalcular={c.calcular} onCargarCaso={c.cargarCaso} onRestablecer={c.restablecer}
      salida={c.salida && (
        <>
          <MensajeEstado estado={c.salida.res.estado} mensaje={c.salida.res.mensaje} />
          {r && (
            <>
              <TablaPasos titulo={`Aproximación de e^${c.salida.x} por su serie de Maclaurin`} archivoCSV="serie-exp.csv" pasos={r.pasos}
                columnas={[{ clave: 'n', titulo: 'términos n', valor: (p) => p.terminos }, { clave: 's', titulo: 'suma Sₙ', valor: (p) => p.suma }, { clave: 'e', titulo: 'error de truncamiento', valor: (p) => p.error }, { clave: 'c', titulo: 'cota de Lagrange', valor: (p) => p.cota }]} />
              <Grafico titulo="Error de truncamiento (escala logarítmica)" ejeX="Términos n" ejeY="Error" datos={datos} layout={{ yaxis: { type: 'log' } }}
                descripcion="El error baja de forma casi exponencial al añadir términos y nunca supera la cota de Lagrange. Este es error de truncamiento (cortar una serie infinita), distinto del error de redondeo." />
            </>
          )}
        </>
      )}>
      <Campo etiqueta="Valor de x" valor={c.valores.x} onChange={(v) => c.set('x', v)} error={c.errores.x} ayuda="Entre −20 y 20." />
      <Campo etiqueta="Número de términos n" valor={c.valores.terminos} onChange={(v) => c.set('terminos', v)} error={c.errores.terminos} ayuda="Entero de 1 a 30." />
    </Calculadora>
  )
}
