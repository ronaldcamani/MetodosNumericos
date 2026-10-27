import type { Data } from 'plotly.js'
import Calculadora from '../../components/Calculadora'
import Campo from '../../components/Campo'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora, type Errores } from '../../components/useCalculadora'
import { parseEntero, parseNumero } from '../../core/entrada'
import { biseccion, falsaPosicion, newton, secante } from '../../core/m1'
import type { ResultadoMetodo } from '../../core/tipos'
import { CASO_FUNCION, EditorFuncion, leerFuncion } from './funcion'

const CASO = { ...CASO_FUNCION, a: '1', b: '2', x0: '1.5', tol: '0.000001', maxIter: '100' }
type F = typeof CASO

interface Fila {
  metodo: string
  familia: string
  res: ResultadoMetodo<{ raiz: number; iteraciones: number; residuo: number }, unknown>
  /** Residuo |f| tras cada iteración, para comparar la velocidad. */
  residuos: number[]
}

function ejecutar(v: F) {
  const fn = leerFuncion(v)
  const errores: Errores<F> = 'errores' in fn ? { ...fn.errores } : {}
  const a = parseNumero(v.a)
  const b = parseNumero(v.b)
  const x0 = parseNumero(v.x0)
  const tol = parseNumero(v.tol)
  const maxIter = parseEntero(v.maxIter)
  if (a === null) errores.a = 'Ingresa un número.'
  if (b === null) errores.b = 'Ingresa un número.'
  if (x0 === null) errores.x0 = 'Ingresa un número.'
  if (tol === null) errores.tol = 'Ingresa un número.'
  if (maxIter === null) errores.maxIter = 'Ingresa un entero.'
  if ('errores' in fn || Object.keys(errores).length) return { errores }
  const { modelo } = fn
  const [A, B, X0, T, N] = [a!, b!, x0!, tol!, maxIter!]
  // Cada método se ejecuta de forma independiente: si uno falla, la salida de los demás se conserva.
  const bis = biseccion({ f: modelo.f, a: A, b: B, tol: T, maxIter: N })
  const fal = falsaPosicion({ f: modelo.f, a: A, b: B, tol: T, maxIter: N })
  const new_ = newton({ f: modelo.f, df: modelo.df, x0: X0, tol: T, maxIter: N })
  const sec = secante({ f: modelo.f, x0: A, x1: B, tol: T, maxIter: N })
  const filas: Fila[] = [
    { metodo: 'Bisección', familia: 'cerrado', res: bis, residuos: bis.pasos.map((p) => Math.abs(p.fMedio)) },
    { metodo: 'Falsa posición', familia: 'cerrado', res: fal, residuos: fal.pasos.map((p) => Math.abs(p.fc)) },
    { metodo: 'Newton', familia: 'abierto', res: new_, residuos: new_.pasos.map((p) => p.residuo) },
    { metodo: 'Secante', familia: 'abierto', res: sec, residuos: sec.pasos.map((p) => p.residuo) },
  ]
  return { salida: { filas, modelo: modelo.expresion } }
}

type Salida = { filas: Fila[]; modelo: string }

const SIMBOLOS = ['square', 'triangle-up', 'diamond', 'x'] as const
const TRAZOS = ['solid', 'dash', 'dot', 'dashdot'] as const

export default function Comparacion() {
  const c = useCalculadora<F, Salida>(CASO, ejecutar)
  const s = c.salida
  const datos: Data[] = s
    ? s.filas.filter((f) => f.residuos.length).map((f, i) => ({
        x: f.residuos.map((_, k) => k + 1), y: f.residuos.map((r) => Math.max(r, 1e-17)), type: 'scatter', mode: 'lines+markers', name: f.metodo,
        marker: { symbol: SIMBOLOS[s.filas.indexOf(f) % 4] }, line: { dash: TRAZOS[s.filas.indexOf(f) % 4] }, legendrank: i,
      }))
    : []
  return (
    <Calculadora
      titulo="Comparación de los cuatro métodos"
      onCalcular={c.calcular}
      onCargarCaso={c.cargarCaso}
      onRestablecer={c.restablecer}
      extras={<button type="button" onClick={() => c.cargarYCalcular({ ...CASO, a: '2', b: '3', x0: '1.5' })}>Probar fallo: [2, 3]</button>}
      salida={s && (
        <>
          {s.filas.map((f) => <div key={f.metodo}><strong>{f.metodo}</strong><MensajeEstado estado={f.res.estado} mensaje={f.res.mensaje} /></div>)}
          <TablaPasos titulo="Resumen comparativo" archivoCSV="comparacion-raices.csv" pasos={s.filas} columnas={[
            { clave: 'm', titulo: 'método', valor: (f) => f.metodo }, { clave: 'f', titulo: 'familia', valor: (f) => f.familia }, { clave: 'e', titulo: 'estado', valor: (f) => f.res.estado },
            { clave: 'r', titulo: 'raíz', valor: (f) => f.res.resultado?.raiz }, { clave: 'i', titulo: 'iteraciones', valor: (f) => f.res.resultado?.iteraciones }, { clave: 'res', titulo: 'residuo |f(r)|', valor: (f) => f.res.resultado?.residuo },
          ]} />
          <p className="aviso">
            Bisección y falsa posición usan el intervalo [a, b]; la secante parte de a y b como puntos iniciales; Newton parte de x₀. El residuo no es el error de la raíz: sirve aquí para comparar la <em>velocidad</em> con la que cada método se acerca. Si un método falla, los demás conservan su resultado.
          </p>
          {datos.length > 0 && (
            <Grafico titulo="Residuo |f| por iteración (escala logarítmica)" ejeX="Iteración" ejeY="|f(xₙ)|" datos={datos} layout={{ yaxis: { type: 'log' } }}
              descripcion="Cuanto más rápido baja la curva, más rápido converge el método. Newton y la secante caen de forma casi vertical cerca de la raíz; la bisección baja a un ritmo constante y la falsa posición se frena si un extremo queda fijo. Los marcadores distinguen cada método sin depender solo del color." />
          )}
        </>
      )}
    >
      <EditorFuncion valores={c.valores} errores={c.errores} set={c.set} />
      <Campo etiqueta="Extremo a (también 1.er punto de la secante)" valor={c.valores.a} onChange={(x) => c.set('a', x)} error={c.errores.a} />
      <Campo etiqueta="Extremo b (también 2.º punto de la secante)" valor={c.valores.b} onChange={(x) => c.set('b', x)} error={c.errores.b} />
      <Campo etiqueta="Punto inicial x₀ (Newton)" valor={c.valores.x0} onChange={(x) => c.set('x0', x)} error={c.errores.x0} />
      <Campo etiqueta="Tolerancia" valor={c.valores.tol} onChange={(x) => c.set('tol', x)} error={c.errores.tol} />
      <Campo etiqueta="Máximo de iteraciones" valor={c.valores.maxIter} onChange={(x) => c.set('maxIter', x)} error={c.errores.maxIter} />
    </Calculadora>
  )
}
