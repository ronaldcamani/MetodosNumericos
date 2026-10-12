import Calculadora from '../../components/Calculadora'
import Campo from '../../components/Campo'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora, type Errores } from '../../components/useCalculadora'
import { parseEntero, parseNumero } from '../../core/entrada'
import { fmt } from '../../core/formato'
import { eliminacionGauss, gaussSeidel, normaInf } from '../../core/m2'
import type { Data } from 'plotly.js'
import Selector from '../../components/Selector'
import { CASO_SISTEMA, EditorSistema, leerSistema, SISTEMA_SINGULAR } from './sistema'

const CASO = { ...CASO_SISTEMA, tol: '0.000001', maxIter: '100', orden: 'tal_cual' }
type F = typeof CASO
type Salida = { g: ReturnType<typeof eliminacionGauss>; s: ReturnType<typeof gaussSeidel> }

function ejecutar(v: F) {
  const sis = leerSistema(v)
  const errores: Errores<F> = 'errores' in sis ? { ...sis.errores } : {}
  const tol = parseNumero(v.tol)
  const maxIter = parseEntero(v.maxIter)
  if (tol === null) errores.tol = 'Ingresa un número.'
  if (maxIter === null) errores.maxIter = 'Ingresa un entero.'
  if ('errores' in sis || tol === null || maxIter === null) return { errores }
  // Los dos métodos son independientes: el fallo de uno no oculta el resultado del otro.
  return { salida: { g: eliminacionGauss(sis), s: gaussSeidel({ ...sis, tol, maxIter, reordenar: v.orden === 'reordenar' }) } }
}

export default function Comparacion() {
  const c = useCalculadora<F, Salida>(CASO, ejecutar)
  const sal = c.salida
  const xg = sal?.g.resultado?.x
  const xs = sal?.s.resultado?.x
  const diferencia = xg && xs ? normaInf(xg.map((v, i) => v - xs[i])) : null
  const filas = sal && [
    { metodo: 'Eliminación con pivoteo', res: sal.g, x: xg, res_: sal.g.resultado?.residuoInf, it: '—' as string | number },
    { metodo: 'Gauss-Seidel', res: sal.s, x: xs, res_: sal.s.resultado?.residuoInf, it: sal.s.resultado?.iteraciones ?? sal.s.pasos.length },
  ]
  const datosBarras: Data[] = xg || xs ? [
    ...(xg ? [{ x: xg.map((_, i) => `x${i + 1}`), y: xg, type: 'bar' as const, name: 'Eliminación con pivoteo' }] : []),
    ...(xs ? [{ x: xs.map((_, i) => `x${i + 1}`), y: xs, type: 'bar' as const, name: 'Gauss-Seidel', marker: { pattern: { shape: '/' as const } } }] : []),
  ] : []
  return (
    <Calculadora
      titulo="Comparación: método directo vs iterativo"
      onCalcular={c.calcular}
      onCargarCaso={c.cargarCaso}
      onRestablecer={c.restablecer}
      extras={<button type="button" onClick={() => c.cargarYCalcular({ ...CASO, ...SISTEMA_SINGULAR })}>Probar fallo: sistema singular</button>}
      salida={sal && filas && (
        <>
          {filas.map((f) => <div key={f.metodo}><strong>{f.metodo}</strong><MensajeEstado estado={f.res.estado} mensaje={f.res.mensaje} /></div>)}
          <TablaPasos titulo="Comparación de soluciones y residuos" archivoCSV="comparacion-m2.csv" pasos={filas} columnas={[
            { clave: 'm', titulo: 'método', valor: (f) => f.metodo },
            { clave: 'e', titulo: 'estado', valor: (f) => f.res.estado },
            { clave: 'x', titulo: 'solución', valor: (f) => (f.x ? f.x.map((v) => fmt(v, 8)).join(' ; ') : '—') },
            { clave: 'r', titulo: 'residuo ‖b−Ax‖∞', valor: (f) => f.res_ },
            { clave: 'i', titulo: 'iteraciones', valor: (f) => f.it },
          ]} />
          {diferencia !== null && (
            <p className="aviso">Diferencia entre ambas soluciones ‖x_directo − x_GS‖∞ = {fmt(diferencia, 6)}. El método directo da la solución en un número fijo de operaciones y su exactitud depende de los pivotes; Gauss-Seidel aproxima por iteraciones y su calidad se controla con el residuo y la tolerancia, siempre que converja.</p>
          )}
          {datosBarras.length > 0 && (
            <Grafico titulo="Solución por método" ejeX="Incógnita" ejeY="valor (índice normalizado de demanda)" datos={datosBarras} layout={{ barmode: 'group' }}
              descripcion="Barras agrupadas por incógnita: si ambos métodos coinciden, las barras tienen la misma altura. Las rayas distinguen a Gauss-Seidel sin depender solo del color." />
          )}
        </>
      )}
    >
      <EditorSistema valores={c.valores} errores={c.errores} set={c.set} />
      <Selector etiqueta="Orden de las ecuaciones (Gauss-Seidel)" valor={c.valores.orden} onChange={(x) => c.set('orden', x)} opciones={[{ valor: 'tal_cual', texto: 'Tal como se escribieron' }, { valor: 'reordenar', texto: 'Reordenar para dominancia diagonal (si existe)' }]} />
      <Campo etiqueta="Tolerancia (Gauss-Seidel)" valor={c.valores.tol} onChange={(x) => c.set('tol', x)} error={c.errores.tol} />
      <Campo etiqueta="Máximo de iteraciones" valor={c.valores.maxIter} onChange={(x) => c.set('maxIter', x)} error={c.errores.maxIter} />
    </Calculadora>
  )
}
