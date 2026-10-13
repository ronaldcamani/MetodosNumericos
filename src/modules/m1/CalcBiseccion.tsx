import Calculadora from '../../components/Calculadora'
import Campo from '../../components/Campo'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import Selector from '../../components/Selector'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora, type Errores } from '../../components/useCalculadora'
import { parseEntero, parseNumero } from '../../core/entrada'
import { fmt } from '../../core/formato'
import { NOMBRES_MODELO, biseccion, crearModelo, type IdModelo, type Modelo } from '../../core/m1'
import type { ResultadoMetodo } from '../../core/tipos'
import type { PasoBiseccion, SalidaBiseccion } from '../../core/m1'
import { datosBiseccion } from './graficos'

const CASO = { modelo: 'calibracion', objetivo: '2', a: '1', b: '2', tol: '0.000001', maxIter: '100' }
type F = typeof CASO
interface Salida { res: ResultadoMetodo<SalidaBiseccion, PasoBiseccion>; modelo: Modelo; a: number; b: number }

export const OPCIONES_MODELO = (Object.keys(NOMBRES_MODELO) as IdModelo[]).map((v) => ({ valor: v, texto: NOMBRES_MODELO[v] }))

function ejecutar(v: F) {
  const errores: Errores<F> = {}
  const objetivo = parseNumero(v.objetivo)
  const a = parseNumero(v.a)
  const b = parseNumero(v.b)
  const tol = parseNumero(v.tol)
  const maxIter = parseEntero(v.maxIter)
  if (objetivo === null) errores.objetivo = 'Ingresa un número.'
  if (a === null) errores.a = 'Ingresa un número.'
  if (b === null) errores.b = 'Ingresa un número.'
  if (tol === null) errores.tol = 'Ingresa un número.'
  if (maxIter === null) errores.maxIter = 'Ingresa un entero.'
  if (objetivo === null || a === null || b === null || tol === null || maxIter === null) return { errores }
  const modelo = crearModelo(v.modelo as IdModelo, objetivo)
  return { salida: { res: biseccion({ f: modelo.f, a, b, tol, maxIter }), modelo, a, b } satisfies Salida }
}

export default function CalcBiseccion() {
  const c = useCalculadora<F, Salida>(CASO, ejecutar)
  const s = c.salida
  const r = s?.res.resultado
  return (
    <Calculadora
      titulo="Calculadora de bisección"
      onCalcular={c.calcular}
      onCargarCaso={c.cargarCaso}
      onRestablecer={c.restablecer}
      extras={<button type="button" onClick={() => c.cargarYCalcular({ ...CASO, a: '2', b: '3' })}>Probar fallo: [2, 3]</button>}
      salida={s && (
        <>
          <MensajeEstado estado={s.res.estado} mensaje={s.res.mensaje} />
          {r && (
            <dl className="resumen">
              <dt>Raíz aproximada</dt><dd>{fmt(r.raiz, 10)}</dd>
              <dt>Iteraciones</dt><dd>{r.iteraciones}</dd>
              <dt>Cota del error</dt><dd>{fmt(r.cotaError, 8)}</dd>
              <dt>Residuo |f(raíz)|</dt><dd>{fmt(r.residuo, 8)} (no es el error de la raíz)</dd>
              <dt>Verificación de la raíz</dt><dd>{r.verificacion.verificada ? '✔ ' : '✖ '}|f(r)| = {fmt(r.verificacion.fRaiz, 3)} frente a f(r−δ) = {fmt(r.verificacion.fMenos, 3)} y f(r+δ) = {fmt(r.verificacion.fMas, 3)} (δ = {fmt(r.verificacion.delta, 3)}): f cruza el cero y |f| es mínimo en r</dd>
              <dt>Criterio de parada</dt><dd>{r.criterio}</dd>
            </dl>
          )}
          {s.res.pasos.length > 0 && (
            <>
              <TablaPasos
                titulo="Iteraciones de la bisección"
                archivoCSV="biseccion.csv"
                pasos={s.res.pasos}
                columnas={[
                  { clave: 'n', titulo: 'n', valor: (p) => p.n },
                  { clave: 'a', titulo: 'a', valor: (p) => p.a },
                  { clave: 'b', titulo: 'b', valor: (p) => p.b },
                  { clave: 'm', titulo: 'punto medio', valor: (p) => p.medio },
                  { clave: 'f', titulo: 'f(medio)', valor: (p) => p.fMedio },
                  { clave: 'c', titulo: 'cota (b−a)/2', valor: (p) => p.cota },
                ]}
              />
              <Grafico titulo="Bisección sobre f(x)" ejeX="x (parámetro normalizado)" ejeY="f(x)" datos={datosBiseccion(s.modelo, s.a, s.b, s.res.pasos)}
                descripcion="La curva cruza el eje y = 0 dentro de [a, b]. Los cuadrados son los extremos con signos opuestos; los rombos numerados son los puntos medios, que se acercan a la raíz." />
            </>
          )}
        </>
      )}
    >
      <Selector etiqueta="Modelo" valor={c.valores.modelo} onChange={(x) => c.set('modelo', x)} opciones={OPCIONES_MODELO} />
      <Campo etiqueta="Respuesta objetivo" valor={c.valores.objetivo} onChange={(x) => c.set('objetivo', x)} error={c.errores.objetivo} />
      <Campo etiqueta="Extremo a" valor={c.valores.a} onChange={(x) => c.set('a', x)} error={c.errores.a} />
      <Campo etiqueta="Extremo b" valor={c.valores.b} onChange={(x) => c.set('b', x)} error={c.errores.b} ayuda="Debe cumplirse a < b y f(a)·f(b) < 0." />
      <Campo etiqueta="Tolerancia" valor={c.valores.tol} onChange={(x) => c.set('tol', x)} error={c.errores.tol} />
      <Campo etiqueta="Máximo de iteraciones" valor={c.valores.maxIter} onChange={(x) => c.set('maxIter', x)} error={c.errores.maxIter} />
    </Calculadora>
  )
}
