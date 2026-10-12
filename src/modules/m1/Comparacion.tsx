import Calculadora from '../../components/Calculadora'
import Campo from '../../components/Campo'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import Selector from '../../components/Selector'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora, type Errores } from '../../components/useCalculadora'
import { parseEntero, parseNumero } from '../../core/entrada'
import { fmt } from '../../core/formato'
import { biseccion, crearModelo, newton, type IdModelo, type Modelo } from '../../core/m1'
import { OPCIONES_MODELO } from './CalcBiseccion'
import { datosProblema } from './graficos'
import type { Data } from 'plotly.js'

const CASO = { modelo: 'calibracion', objetivo: '2', a: '1', b: '2', x0: '1.5', tol: '0.000001', maxIter: '100' }
type F = typeof CASO

function ejecutar(v: F) {
  const errores: Errores<F> = {}
  const n = { objetivo: parseNumero(v.objetivo), a: parseNumero(v.a), b: parseNumero(v.b), x0: parseNumero(v.x0), tol: parseNumero(v.tol), maxIter: parseEntero(v.maxIter) }
  ;(Object.keys(n) as (keyof typeof n)[]).forEach((k) => {
    if (n[k] === null) errores[k] = k === 'maxIter' ? 'Ingresa un entero.' : 'Ingresa un número.'
  })
  if (Object.keys(errores).length) return { errores }
  const { objetivo, a, b, x0, tol, maxIter } = n as { [K in keyof typeof n]: number }
  const modelo = crearModelo(v.modelo as IdModelo, objetivo)
  // Cada método se ejecuta de forma independiente: si uno falla, la salida del otro se conserva.
  return { salida: { modelo, a, b, bis: biseccion({ f: modelo.f, a, b, tol, maxIter }), new: newton({ f: modelo.f, df: modelo.df, x0, tol, maxIter }) } }
}

type Salida = { modelo: Modelo; a: number; b: number; bis: ReturnType<typeof biseccion>; new: ReturnType<typeof newton> }

function graficoResiduo(s: Salida): Data[] {
  return [
    { x: s.bis.pasos.map((p) => p.n), y: s.bis.pasos.map((p) => Math.abs(p.fMedio)), type: 'scatter', mode: 'lines+markers', name: 'Bisección', marker: { symbol: 'square' } },
    { x: s.new.pasos.map((p) => p.n), y: s.new.pasos.map((p) => p.residuo), type: 'scatter', mode: 'lines+markers', name: 'Newton', marker: { symbol: 'diamond' }, line: { dash: 'dash' } },
  ]
}

export default function Comparacion() {
  const c = useCalculadora<F, Salida>(CASO, ejecutar)
  const s = c.salida
  const filas = s && [
    { metodo: 'Bisección', res: s.bis, extra: s.bis.resultado ? `cota ${fmt(s.bis.resultado.cotaError, 6)}` : '—' },
    { metodo: 'Newton', res: s.new, extra: s.new.resultado ? `último cambio ${fmt(s.new.resultado.ultimoCambio, 6)}` : '—' },
  ]
  const ib = s?.bis.resultado?.iteraciones
  const inw = s?.new.resultado?.iteraciones
  return (
    <Calculadora
      titulo="Comparación bisección vs Newton"
      onCalcular={c.calcular}
      onCargarCaso={c.cargarCaso}
      onRestablecer={c.restablecer}
      salida={s && filas && (
        <>
          {filas.map((f) => <div key={f.metodo}><strong>{f.metodo}</strong><MensajeEstado estado={f.res.estado} mensaje={f.res.mensaje} /></div>)}
          <TablaPasos
            titulo="Resumen comparativo"
            archivoCSV="comparacion.csv"
            pasos={filas}
            columnas={[
              { clave: 'm', titulo: 'método', valor: (f) => f.metodo },
              { clave: 'e', titulo: 'estado', valor: (f) => f.res.estado },
              { clave: 'r', titulo: 'raíz', valor: (f) => f.res.resultado?.raiz },
              { clave: 'i', titulo: 'iteraciones', valor: (f) => f.res.resultado?.iteraciones ?? f.res.pasos.length },
              { clave: 'res', titulo: 'residuo |f(raíz)|', valor: (f) => f.res.resultado?.residuo },
              { clave: 'x', titulo: 'medida de parada', valor: (f) => f.extra },
            ]}
          />
          {ib !== undefined && inw !== undefined && (
            <p className="aviso">Con esta tolerancia, Newton necesitó {inw} iteraciones y la bisección {ib}. La bisección exige un cambio de signo y reduce la cota a la mitad en cada paso; Newton usa la derivada y puede converger muy rápido, pero depende del punto inicial. El residuo mide cuánto vale f en la raíz aproximada, no la distancia a la raíz verdadera.</p>
          )}
          <Grafico titulo="Residuo |f(xₙ)| por iteración" ejeX="Iteración n" ejeY="|f(xₙ)| (escala logarítmica)" datos={graficoResiduo(s)} layout={{ yaxis: { type: 'log', title: { text: '|f(xₙ)| (escala logarítmica)' } } }}
            descripcion="Compara cuán rápido cada método reduce el residuo. Un residuo pequeño no garantiza un error pequeño en la raíz si la función es muy plana cerca de ella." />
          <Grafico titulo="Problema: f(x) = g(x) − objetivo" ejeX="x (parámetro normalizado)" ejeY="f(x)" datos={datosProblema(s.modelo, s.a, s.b)}
            descripcion="La raíz es el punto donde la curva cruza y = 0: el valor del parámetro que alcanza la respuesta objetivo." />
        </>
      )}
    >
      <Selector etiqueta="Modelo" valor={c.valores.modelo} onChange={(x) => c.set('modelo', x)} opciones={OPCIONES_MODELO} />
      <Campo etiqueta="Respuesta objetivo" valor={c.valores.objetivo} onChange={(x) => c.set('objetivo', x)} error={c.errores.objetivo} />
      <Campo etiqueta="Extremo a" valor={c.valores.a} onChange={(x) => c.set('a', x)} error={c.errores.a} />
      <Campo etiqueta="Extremo b" valor={c.valores.b} onChange={(x) => c.set('b', x)} error={c.errores.b} />
      <Campo etiqueta="Punto inicial x₀" valor={c.valores.x0} onChange={(x) => c.set('x0', x)} error={c.errores.x0} />
      <Campo etiqueta="Tolerancia" valor={c.valores.tol} onChange={(x) => c.set('tol', x)} error={c.errores.tol} />
      <Campo etiqueta="Máximo de iteraciones" valor={c.valores.maxIter} onChange={(x) => c.set('maxIter', x)} error={c.errores.maxIter} />
    </Calculadora>
  )
}
