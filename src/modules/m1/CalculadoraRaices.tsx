import Calculadora from '../../components/Calculadora'
import Campo from '../../components/Campo'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import { useAplicarPreset, type PresetActivo } from '../../components/PanelCalculadora'
import Selector from '../../components/Selector'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora, type Errores } from '../../components/useCalculadora'
import { parseEntero, parseNumero } from '../../core/entrada'
import { fmt } from '../../core/formato'
import {
  biseccion, falsaPosicion, newton, polinomioTexto, raicesPolinomio, secante, UMBRAL_DERIVADA,
  type Modelo, type PasoBiseccion, type PasoFalsaPosicion, type PasoNewton, type PasoPolinomio, type PasoSecante,
  type SalidaBiseccion, type SalidaFalsaPosicion, type SalidaNewton, type SalidaPolinomio, type SalidaSecante, type VerificacionRaiz,
} from '../../core/m1'
import type { ResultadoMetodo } from '../../core/tipos'
import { CASO_FUNCION, EditorFuncion, leerCoeficientes, leerFuncion } from './funcion'
import { datosBiseccion, datosFalsaPosicion, datosNewton, datosPolinomio, datosSecante } from './graficos'

export type IdMetodo = 'biseccion' | 'falsa' | 'newton' | 'secante' | 'todas'

export const METODOS: Record<IdMetodo, { nombre: string; familia: string }> = {
  biseccion: { nombre: 'Bisección', familia: 'cerrado' },
  falsa: { nombre: 'Falsa posición', familia: 'cerrado' },
  newton: { nombre: 'Newton', familia: 'abierto' },
  secante: { nombre: 'Secante', familia: 'abierto' },
  todas: { nombre: 'Todas las raíces (Newton–Horner)', familia: 'polinomio' },
}

export const CASO_RAICES = { ...CASO_FUNCION, metodo: 'biseccion', a: '1', b: '2', x0: '1.5', p0: '1', p1: '2', tol: '0.000001', maxIter: '100' }
export type FRaices = typeof CASO_RAICES

type Salida =
  | { m: 'biseccion'; modelo: Modelo; a: number; b: number; res: ResultadoMetodo<SalidaBiseccion, PasoBiseccion> }
  | { m: 'falsa'; modelo: Modelo; a: number; b: number; res: ResultadoMetodo<SalidaFalsaPosicion, PasoFalsaPosicion> }
  | { m: 'newton'; modelo: Modelo; x0: number; res: ResultadoMetodo<SalidaNewton, PasoNewton> }
  | { m: 'secante'; modelo: Modelo; x0: number; x1: number; res: ResultadoMetodo<SalidaSecante, PasoSecante> }
  | { m: 'todas'; modelo: Modelo; res: ResultadoMetodo<SalidaPolinomio, PasoPolinomio> }

function ejecutar(v: FRaices) {
  const fn = leerFuncion(v)
  const errores: Errores<FRaices> = 'errores' in fn ? { ...fn.errores } : {}
  const m = v.metodo as IdMetodo
  const num = (k: keyof FRaices, etiqueta = 'Ingresa un número.') => {
    const x = parseNumero(v[k])
    if (x === null) errores[k] = etiqueta
    return x
  }
  const tol = num('tol')
  const maxIter = parseEntero(v.maxIter)
  if (maxIter === null) errores.maxIter = 'Ingresa un entero.'
  const a = m === 'biseccion' || m === 'falsa' ? num('a') : 0
  const b = m === 'biseccion' || m === 'falsa' ? num('b') : 0
  const x0 = m === 'newton' ? num('x0') : 0
  const p0 = m === 'secante' ? num('p0') : 0
  const p1 = m === 'secante' ? num('p1') : 0
  if ('errores' in fn || Object.keys(errores).length || tol === null || maxIter === null) return { errores }
  const { modelo } = fn
  const T = tol
  const N = maxIter
  if (m === 'todas') {
    if (v.modelo !== 'polinomio') return { errores: { modelo: 'Esta herramienta requiere elegir «Polinomio (coeficientes)».' } as Errores<FRaices> }
    return { salida: { m, modelo, res: raicesPolinomio({ coef: leerCoeficientes(v.coef)!, tol: T, maxIter: N }) } satisfies Salida }
  }
  const salida: Salida =
    m === 'biseccion' ? { m, modelo, a: a!, b: b!, res: biseccion({ f: modelo.f, a: a!, b: b!, tol: T, maxIter: N }) }
    : m === 'falsa' ? { m, modelo, a: a!, b: b!, res: falsaPosicion({ f: modelo.f, a: a!, b: b!, tol: T, maxIter: N }) }
    : m === 'newton' ? { m, modelo, x0: x0!, res: newton({ f: modelo.f, df: modelo.df, x0: x0!, tol: T, maxIter: N }) }
    : { m: 'secante', modelo, x0: p0!, x1: p1!, res: secante({ f: modelo.f, x0: p0!, x1: p1!, tol: T, maxIter: N }) }
  return { salida }
}

function Verificacion({ v }: { v: VerificacionRaiz }) {
  return (
    <>
      <dt>Verificación de la raíz</dt>
      <dd>{v.verificada ? '✔ ' : '✖ '}|f(r)| = {fmt(v.fRaiz, 3)} frente a f(r−δ) = {fmt(v.fMenos, 3)} y f(r+δ) = {fmt(v.fMas, 3)} (δ = {fmt(v.delta, 3)}): f cruza el cero y |f| es mínimo en r</dd>
    </>
  )
}

type Raiz = { raiz: number; iteraciones: number; residuo: number; criterio: string; verificacion: VerificacionRaiz }
function Resumen({ r, extra }: { r: Raiz; extra?: [string, string][] }) {
  return (
    <dl className="resumen">
      <dt>Raíz aproximada</dt><dd>{fmt(r.raiz, 10)}</dd>
      <dt>Iteraciones</dt><dd>{r.iteraciones}</dd>
      {extra?.map(([k, val]) => (<div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{val}</dd></div>))}
      <dt>Residuo |f(raíz)|</dt><dd>{fmt(r.residuo, 8)} (no es el error de la raíz)</dd>
      <Verificacion v={r.verificacion} />
      <dt>Criterio de parada</dt><dd>{r.criterio}</dd>
    </dl>
  )
}

const EJE_X = 'x'
const EJE_Y = 'f(x)'

function Vista({ s }: { s: Salida }) {
  const aviso = <MensajeEstado estado={s.res.estado} mensaje={s.res.mensaje} />
  if (s.m === 'biseccion') {
    const r = s.res.resultado
    return (
      <>
        {aviso}
        {r && <Resumen r={r} extra={[['Cota del error', fmt(r.cotaError, 8)]]} />}
        {s.res.pasos.length > 0 && (
          <>
            <TablaPasos titulo="Iteraciones de la bisección" archivoCSV="biseccion.csv" pasos={s.res.pasos} columnas={[
              { clave: 'n', titulo: 'n', valor: (p) => p.n }, { clave: 'a', titulo: 'a', valor: (p) => p.a }, { clave: 'b', titulo: 'b', valor: (p) => p.b },
              { clave: 'm', titulo: 'punto medio', valor: (p) => p.medio }, { clave: 'f', titulo: 'f(medio)', valor: (p) => p.fMedio }, { clave: 'c', titulo: 'cota (b−a)/2', valor: (p) => p.cota },
            ]} />
            <Grafico titulo="Bisección sobre f(x)" ejeX={EJE_X} ejeY={EJE_Y} datos={datosBiseccion(s.modelo, s.a, s.b, s.res.pasos)}
              descripcion="La curva cruza el eje y = 0 dentro de [a, b]. Los cuadrados son los extremos con signos opuestos; los rombos numerados son los puntos medios, que se acercan a la raíz." />
          </>
        )}
      </>
    )
  }
  if (s.m === 'falsa') {
    const r = s.res.resultado
    return (
      <>
        {aviso}
        {r && <Resumen r={r} extra={[['Último cambio', fmt(r.ultimoCambio, 8)]]} />}
        {s.res.pasos.length > 0 && (
          <>
            <TablaPasos titulo="Iteraciones de la falsa posición" archivoCSV="falsa-posicion.csv" pasos={s.res.pasos} columnas={[
              { clave: 'n', titulo: 'n', valor: (p) => p.n }, { clave: 'a', titulo: 'a', valor: (p) => p.a }, { clave: 'b', titulo: 'b', valor: (p) => p.b },
              { clave: 'c', titulo: 'corte c', valor: (p) => p.c }, { clave: 'f', titulo: 'f(c)', valor: (p) => p.fc }, { clave: 'd', titulo: 'cambio |cₙ−cₙ₋₁|', valor: (p) => p.cambio }, { clave: 'w', titulo: 'ancho b−a', valor: (p) => p.ancho },
            ]} />
            <Grafico titulo="Falsa posición sobre f(x)" ejeX={EJE_X} ejeY={EJE_Y} datos={datosFalsaPosicion(s.modelo, s.a, s.b, s.res.pasos)}
              descripcion="Cada cuerda une (a, f(a)) con (b, f(b)) y corta el eje y = 0 en cₙ. Fíjate en que un extremo suele quedarse fijo: por eso el ancho del intervalo no tiende a 0." />
          </>
        )}
      </>
    )
  }
  if (s.m === 'newton') {
    const r = s.res.resultado
    return (
      <>
        {aviso}
        {r && <Resumen r={r} extra={[['Último cambio', fmt(r.ultimoCambio, 8)]]} />}
        {s.res.pasos.length > 0 && (
          <>
            <TablaPasos titulo="Iteraciones de Newton" archivoCSV="newton.csv" pasos={s.res.pasos} columnas={[
              { clave: 'n', titulo: 'n', valor: (p) => p.n }, { clave: 'x', titulo: 'xₙ', valor: (p) => p.x }, { clave: 'fx', titulo: 'f(xₙ)', valor: (p) => p.fx }, { clave: 'dfx', titulo: "f'(xₙ)", valor: (p) => p.dfx },
              { clave: 's', titulo: 'xₙ₊₁', valor: (p) => p.siguiente }, { clave: 'c', titulo: 'cambio |xₙ₊₁−xₙ|', valor: (p) => p.cambio }, { clave: 'r', titulo: 'residuo |f(xₙ₊₁)|', valor: (p) => p.residuo },
            ]} />
            <Grafico titulo="Newton sobre f(x)" ejeX={EJE_X} ejeY={EJE_Y} datos={datosNewton(s.modelo, s.x0, s.res.pasos)}
              descripcion="Cada tangente punteada parte de (xₙ, f(xₙ)) y corta el eje y = 0 en xₙ₊₁. Los rombos numerados son los iterados." />
          </>
        )}
      </>
    )
  }
  if (s.m === 'secante') {
    const r = s.res.resultado
    return (
      <>
        {aviso}
        {r && <Resumen r={r} extra={[['Último cambio', fmt(r.ultimoCambio, 8)]]} />}
        {s.res.pasos.length > 0 && (
          <>
            <TablaPasos titulo="Iteraciones de la secante" archivoCSV="secante.csv" pasos={s.res.pasos} columnas={[
              { clave: 'n', titulo: 'n', valor: (p) => p.n }, { clave: 'x0', titulo: 'xₙ₋₁', valor: (p) => p.x0 }, { clave: 'x1', titulo: 'xₙ', valor: (p) => p.x1 },
              { clave: 'f0', titulo: 'f(xₙ₋₁)', valor: (p) => p.f0 }, { clave: 'f1', titulo: 'f(xₙ)', valor: (p) => p.f1 }, { clave: 's', titulo: 'xₙ₊₁', valor: (p) => p.siguiente },
              { clave: 'c', titulo: 'cambio', valor: (p) => p.cambio }, { clave: 'r', titulo: 'residuo |f(xₙ₊₁)|', valor: (p) => p.residuo },
            ]} />
            <Grafico titulo="Secante sobre f(x)" ejeX={EJE_X} ejeY={EJE_Y} datos={datosSecante(s.modelo, s.x0, s.x1, s.res.pasos)}
              descripcion="Cada recta punteada pasa por los dos últimos puntos de la curva y corta el eje y = 0 en el siguiente iterado: es Newton con la derivada reemplazada por una pendiente aproximada." />
          </>
        )}
      </>
    )
  }
  const r = s.res.resultado
  return (
    <>
      {aviso}
      {r?.advertencias.map((a) => <p key={a} className="advertencia" role="note">⚠ {a}</p>)}
      {r && (
        <>
          <dl className="resumen">
            <dt>Polinomio</dt><dd>p(x) = {s.modelo.expresion}</dd>
            <dt>Cota de Cauchy</dt><dd>todas las raíces cumplen |r| ≤ {fmt(r.cota, 6)}</dd>
            <dt>Criterio</dt><dd>{r.criterio}</dd>
          </dl>
          <TablaPasos titulo="Raíces del polinomio" archivoCSV="raices-polinomio.csv" pasos={r.raices} columnas={[
            { clave: 're', titulo: 'parte real', valor: (z) => z.re }, { clave: 'im', titulo: 'parte imaginaria', valor: (z) => z.im }, { clave: 'm', titulo: 'método', valor: (z) => z.metodo },
            { clave: 'i', titulo: 'iteraciones', valor: (z) => z.iteraciones }, { clave: 'r', titulo: 'residuo relativo', valor: (z) => z.residuoRelativo }, { clave: 'v', titulo: 'verificada', valor: (z) => (z.verificada ? 'sí' : 'no') },
          ]} />
          <Grafico titulo="Polinomio y raíces reales" ejeX={EJE_X} ejeY="p(x)" datos={datosPolinomio(s.modelo, r.raices, r.cota)}
            descripcion="Los rombos del eje horizontal son las raíces reales. Las raíces complejas no aparecen en el plano real: están en la tabla, siempre por pares conjugados." />
        </>
      )}
      {s.res.pasos.length > 0 && (
        <TablaPasos titulo="Deflación: cociente tras cada raíz real" pasos={s.res.pasos} columnas={[
          { clave: 'k', titulo: 'k', valor: (p) => p.k }, { clave: 'x0', titulo: 'x₀ inicial', valor: (p) => p.x0 }, { clave: 'r', titulo: 'raíz', valor: (p) => p.raiz }, { clave: 'i', titulo: 'iteraciones', valor: (p) => p.iteraciones },
          { clave: 'q', titulo: 'cociente q(x)', valor: (p) => polinomioTexto(p.cociente) }, { clave: 'res', titulo: 'resto de la división', valor: (p) => p.resto },
        ]} />
      )}
    </>
  )
}

interface Props {
  /** Métodos que ofrece el selector en esta página. */
  metodos?: IdMetodo[]
  metodoInicial?: IdMetodo
  preset?: PresetActivo | null
  id?: string
}

const FALLOS: Record<IdMetodo, { texto: string; valores: Partial<FRaices> }> = {
  biseccion: { texto: 'Probar fallo: [2, 3]', valores: { modelo: 'calibracion', objetivo: '2', a: '2', b: '3' } },
  falsa: { texto: 'Probar fallo: [2, 3]', valores: { modelo: 'calibracion', objetivo: '2', a: '2', b: '3' } },
  newton: { texto: 'Probar fallo: x³ − 1, x₀ = 0', valores: { modelo: 'cubo', objetivo: '1', x0: '0' } },
  secante: { texto: 'Probar fallo: x² − 1 con x₀ = −2, x₁ = 2', valores: { modelo: 'polinomio', coef: '1, 0, -1', p0: '-2', p1: '2' } },
  todas: { texto: 'Probar fallo: coeficiente principal 0', valores: { modelo: 'polinomio', coef: '0, 1, 2' } },
}

/** Calculadora única de raíces: se elige la función y el método; los campos cambian según el método. */
export default function CalculadoraRaices({ metodos = ['biseccion', 'falsa', 'newton', 'secante'], metodoInicial, preset = null, id = 'raices' }: Props) {
  const inicial: FRaices = { ...CASO_RAICES, metodo: metodoInicial ?? metodos[0], ...(metodos[0] === 'todas' && !metodoInicial ? { modelo: 'polinomio' } : {}) }
  const c = useCalculadora<FRaices, Salida>(inicial, ejecutar)
  useAplicarPreset(id, preset, (valores) => c.cargarYCalcular({ ...inicial, ...valores }))
  const m = c.valores.metodo as IdMetodo
  const fallo = FALLOS[m]
  const cerrado = m === 'biseccion' || m === 'falsa'
  return (
    <Calculadora
      titulo="Calculadora de raíces"
      onCalcular={c.calcular}
      onCargarCaso={() => c.cargarYCalcular({ ...inicial, metodo: m, ...(m === 'todas' ? { modelo: 'polinomio' } : {}) })}
      onRestablecer={() => c.reiniciar({ ...inicial, metodo: m })}
      extras={<button type="button" onClick={() => c.cargarYCalcular({ ...inicial, metodo: m, ...fallo.valores })}>{fallo.texto}</button>}
      salida={c.salida && <Vista s={c.salida} />}
    >
      <Selector etiqueta="Método" valor={c.valores.metodo} onChange={(x) => c.set('metodo', x)} opciones={metodos.map((k) => ({ valor: k, texto: `${METODOS[k].nombre}${METODOS[k].familia === 'polinomio' ? '' : ` (${METODOS[k].familia})`}` }))} />
      <EditorFuncion valores={c.valores} errores={c.errores} set={c.set} />
      {m === 'todas' && c.errores.modelo && <p className="campo-error" role="alert">✖ {c.errores.modelo}</p>}
      {cerrado && (
        <>
          <Campo etiqueta="Extremo a" valor={c.valores.a} onChange={(x) => c.set('a', x)} error={c.errores.a} />
          <Campo etiqueta="Extremo b" valor={c.valores.b} onChange={(x) => c.set('b', x)} error={c.errores.b} ayuda="Debe cumplirse a < b y f(a)·f(b) < 0." />
        </>
      )}
      {m === 'newton' && <Campo etiqueta="Punto inicial x₀" valor={c.valores.x0} onChange={(x) => c.set('x0', x)} error={c.errores.x0} ayuda={`Se detiene si |f'(x)| < ${UMBRAL_DERIVADA}.`} />}
      {m === 'secante' && (
        <>
          <Campo etiqueta="Primer punto x₀" valor={c.valores.p0} onChange={(x) => c.set('p0', x)} error={c.errores.p0} />
          <Campo etiqueta="Segundo punto x₁" valor={c.valores.p1} onChange={(x) => c.set('p1', x)} error={c.errores.p1} ayuda="Deben ser distintos; no se exige cambio de signo." />
        </>
      )}
      <Campo etiqueta="Tolerancia" valor={c.valores.tol} onChange={(x) => c.set('tol', x)} error={c.errores.tol} />
      <Campo etiqueta="Máximo de iteraciones" valor={c.valores.maxIter} onChange={(x) => c.set('maxIter', x)} error={c.errores.maxIter} />
    </Calculadora>
  )
}
