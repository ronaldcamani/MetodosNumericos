import Calculadora from '../../components/Calculadora'
import Campo from '../../components/Campo'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import Selector from '../../components/Selector'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora, type Errores } from '../../components/useCalculadora'
import { parseEntero, parseNumero } from '../../core/entrada'
import { fmt } from '../../core/formato'
import { crearModelo, newton, UMBRAL_DERIVADA, type IdModelo, type Modelo, type PasoNewton, type SalidaNewton } from '../../core/m1'
import type { ResultadoMetodo } from '../../core/tipos'
import { datosNewton } from './graficos'
import { OPCIONES_MODELO } from './CalcBiseccion'

const CASO = { modelo: 'calibracion', objetivo: '2', x0: '1.5', tol: '0.000001', maxIter: '100' }
type F = typeof CASO
interface Salida { res: ResultadoMetodo<SalidaNewton, PasoNewton>; modelo: Modelo; x0: number }

function ejecutar(v: F) {
  const errores: Errores<F> = {}
  const objetivo = parseNumero(v.objetivo)
  const x0 = parseNumero(v.x0)
  const tol = parseNumero(v.tol)
  const maxIter = parseEntero(v.maxIter)
  if (objetivo === null) errores.objetivo = 'Ingresa un número.'
  if (x0 === null) errores.x0 = 'Ingresa un número.'
  if (tol === null) errores.tol = 'Ingresa un número.'
  if (maxIter === null) errores.maxIter = 'Ingresa un entero.'
  if (objetivo === null || x0 === null || tol === null || maxIter === null) return { errores }
  const modelo = crearModelo(v.modelo as IdModelo, objetivo)
  return { salida: { res: newton({ f: modelo.f, df: modelo.df, x0, tol, maxIter }), modelo, x0 } satisfies Salida }
}

export default function CalcNewton() {
  const c = useCalculadora<F, Salida>(CASO, ejecutar)
  const s = c.salida
  const r = s?.res.resultado
  return (
    <Calculadora
      titulo="Calculadora de Newton"
      onCalcular={c.calcular}
      onCargarCaso={c.cargarCaso}
      onRestablecer={c.restablecer}
      extras={<button type="button" onClick={() => c.cargarYCalcular({ ...CASO, modelo: 'cubo', objetivo: '1', x0: '0' })}>Probar fallo: x³ − 1, x₀ = 0</button>}
      salida={s && (
        <>
          <MensajeEstado estado={s.res.estado} mensaje={s.res.mensaje} />
          {r && (
            <dl className="resumen">
              <dt>Raíz aproximada</dt><dd>{fmt(r.raiz, 10)}</dd>
              <dt>Iteraciones</dt><dd>{r.iteraciones}</dd>
              <dt>Último cambio</dt><dd>{fmt(r.ultimoCambio, 8)}</dd>
              <dt>Residuo |f(raíz)|</dt><dd>{fmt(r.residuo, 8)} (no es el error de la raíz)</dd>
              <dt>Criterio de parada</dt><dd>{r.criterio}</dd>
            </dl>
          )}
          {s.res.pasos.length > 0 && (
            <>
              <TablaPasos
                titulo="Iteraciones de Newton"
                archivoCSV="newton.csv"
                pasos={s.res.pasos}
                columnas={[
                  { clave: 'n', titulo: 'n', valor: (p) => p.n },
                  { clave: 'x', titulo: 'xₙ', valor: (p) => p.x },
                  { clave: 'fx', titulo: 'f(xₙ)', valor: (p) => p.fx },
                  { clave: 'dfx', titulo: "f'(xₙ)", valor: (p) => p.dfx },
                  { clave: 's', titulo: 'xₙ₊₁', valor: (p) => p.siguiente },
                  { clave: 'c', titulo: 'cambio |xₙ₊₁−xₙ|', valor: (p) => p.cambio },
                  { clave: 'r', titulo: 'residuo |f(xₙ₊₁)|', valor: (p) => p.residuo },
                ]}
              />
              <Grafico titulo="Newton sobre f(x)" ejeX="x (parámetro normalizado)" ejeY="f(x)" datos={datosNewton(s.modelo, s.x0, s.res.pasos)}
                descripcion="Cada tangente punteada parte de (xₙ, f(xₙ)) y corta el eje y = 0 en xₙ₊₁. Los rombos numerados son los iterados." />
            </>
          )}
        </>
      )}
    >
      <Selector etiqueta="Modelo" valor={c.valores.modelo} onChange={(x) => c.set('modelo', x)} opciones={OPCIONES_MODELO} />
      <Campo etiqueta="Respuesta objetivo" valor={c.valores.objetivo} onChange={(x) => c.set('objetivo', x)} error={c.errores.objetivo} />
      <Campo etiqueta="Punto inicial x₀" valor={c.valores.x0} onChange={(x) => c.set('x0', x)} error={c.errores.x0} ayuda={`Se detiene si |f'(x)| < ${UMBRAL_DERIVADA}.`} />
      <Campo etiqueta="Tolerancia" valor={c.valores.tol} onChange={(x) => c.set('tol', x)} error={c.errores.tol} />
      <Campo etiqueta="Máximo de iteraciones" valor={c.valores.maxIter} onChange={(x) => c.set('maxIter', x)} error={c.errores.maxIter} />
    </Calculadora>
  )
}
