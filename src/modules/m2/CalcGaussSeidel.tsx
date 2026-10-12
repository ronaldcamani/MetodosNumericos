import Calculadora from '../../components/Calculadora'
import Campo from '../../components/Campo'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import TablaPasos, { type Columna } from '../../components/TablaPasos'
import { useCalculadora, type Errores } from '../../components/useCalculadora'
import { parseEntero, parseNumero } from '../../core/entrada'
import { fmt } from '../../core/formato'
import { gaussSeidel, type PasoGaussSeidel } from '../../core/m2'
import Selector from '../../components/Selector'
import { EJERCICIO_3 } from './ejercicios'
import { CASO_SISTEMA, EditorSistema, leerSistema, SISTEMA_SINGULAR } from './sistema'
import { datosComponentes, datosResiduo } from './graficosGS'

const CASO = { ...CASO_SISTEMA, tol: '0.000001', maxIter: '100', orden: 'tal_cual', x01: '0', x02: '0', x03: '0', x04: '0' }
type F = typeof CASO
type Salida = { res: ReturnType<typeof gaussSeidel>; x0: number[] }

function ejecutar(v: F) {
  const s = leerSistema(v)
  const errores: Errores<F> = 'errores' in s ? { ...s.errores } : {}
  const tol = parseNumero(v.tol)
  const maxIter = parseEntero(v.maxIter)
  if (tol === null) errores.tol = 'Ingresa un número.'
  if (maxIter === null) errores.maxIter = 'Ingresa un entero.'
  const n = Number(v.tam)
  const x0: number[] = []
  for (let i = 1; i <= n; i++) {
    const xi = parseNumero(v[`x0${i}` as keyof F])
    if (xi === null) errores[`x0${i}` as keyof F] = 'Ingresa un número.'
    x0.push(xi ?? 0)
  }
  if ('errores' in s || tol === null || maxIter === null || Object.keys(errores).length) return { errores }
  return { salida: { res: gaussSeidel({ A: s.A, b: s.b, tol, maxIter, x0, reordenar: v.orden === 'reordenar' }), x0 } }
}

export function columnasGS(n: number): Columna<PasoGaussSeidel>[] {
  return [
    { clave: 'n', titulo: 'n', valor: (p) => p.n },
    ...Array.from({ length: n }, (_, i) => ({ clave: `x${i}`, titulo: `x${i + 1}`, valor: (p: PasoGaussSeidel) => p.x[i] })),
    { clave: 'c', titulo: 'cambio ‖Δx‖∞', valor: (p) => p.cambioInf },
    { clave: 'r', titulo: 'residuo ‖b−Ax‖∞', valor: (p) => p.residuoInf },
  ]
}

export default function CalcGaussSeidel() {
  const c = useCalculadora<F, Salida>(CASO, ejecutar)
  const s = c.salida
  const r = s?.res.resultado
  const pasos = s?.res.pasos ?? []
  return (
    <Calculadora
      titulo="Calculadora de Gauss-Seidel"
      onCalcular={c.calcular}
      onCargarCaso={c.cargarCaso}
      onRestablecer={c.restablecer}
      extras={
        <>
          <button type="button" onClick={() => c.cargarYCalcular({ ...CASO, ...EJERCICIO_3.sistema, tol: String(EJERCICIO_3.tol), orden: 'reordenar', x01: '1', x02: '1', x03: '1' })} title="x₀ = (1, 1, 1), tolerancia 10⁻⁴, con reordenamiento de ecuaciones">Ejercicio 3 (x₀ = (1,1,1), tol 10⁻⁴)</button>
          <button type="button" onClick={() => c.cargarYCalcular({ ...CASO, ...EJERCICIO_3.sistema, tol: String(EJERCICIO_3.tol), x01: '1', x02: '1', x03: '1' })} title="Mismo sistema sin reordenar: Gauss-Seidel diverge">Ejercicio 3 sin reordenar</button>
          <button type="button" onClick={() => c.cargarYCalcular({ ...CASO, ...SISTEMA_SINGULAR })}>Probar fallo: sistema singular</button>
        </>
      }
      salida={s && (
        <>
          <MensajeEstado estado={s.res.estado} mensaje={s.res.mensaje} />
          {r && (
            <dl className="resumen">
              <dt>Solución</dt><dd>{r.x.map((v, i) => `x${i + 1} = ${fmt(v, 8)}`).join(', ')}</dd>
              <dt>Iteraciones</dt><dd>{r.iteraciones}</dd>
              <dt>Residuo ‖b − Ax‖∞</dt><dd>{fmt(r.residuoInf, 8)}</dd>
              {r.permutacion && <><dt>Orden de ecuaciones</dt><dd>filas {r.permutacion.map((i) => i + 1).join(', ')} del sistema original</dd></>}
              <dt>Dominancia diagonal estricta</dt><dd>{r.dominanciaEstricta ? 'Sí (condición suficiente de convergencia)' : 'No (la convergencia no está garantizada, aunque puede ocurrir)'}</dd>
              <dt>Criterio de parada</dt><dd>{r.criterio}</dd>
            </dl>
          )}
          {pasos.length > 0 && (
            <>
              <TablaPasos titulo={`Iteraciones de Gauss-Seidel (desde x₀ = (${s.x0.map((v) => fmt(v, 6)).join(', ')}))`} archivoCSV="gauss-seidel.csv" pasos={pasos} columnas={columnasGS(pasos[0].x.length)} />
              <Grafico titulo="Componentes de x por iteración" ejeX="Iteración n" ejeY="valor de xᵢ (índice normalizado)" datos={datosComponentes(pasos, s.x0)}
                descripcion="Cada línea muestra cómo se acerca a su valor final una componente de la solución; la iteración 0 es el vector inicial." />
              <Grafico titulo="Residuo por iteración" ejeX="Iteración n" ejeY="‖b − Ax‖∞ (escala logarítmica)" datos={datosResiduo(pasos)} layout={{ yaxis: { type: 'log', title: { text: '‖b − Ax‖∞ (escala logarítmica)' } } }}
                descripcion="El residuo decrece de forma regular cuando el método converge; la tolerancia indica cuándo se detiene." />
            </>
          )}
        </>
      )}
    >
      <EditorSistema valores={c.valores} errores={c.errores} set={(k, v) => c.set(k, v)} />
      <Selector etiqueta="Orden de las ecuaciones" valor={c.valores.orden} onChange={(x) => c.set('orden', x)} opciones={[{ valor: 'tal_cual', texto: 'Tal como se escribieron' }, { valor: 'reordenar', texto: 'Reordenar para dominancia diagonal (si existe)' }]} />
      {Array.from({ length: Number(c.valores.tam) }, (_, i) => {
        const k = `x0${i + 1}` as keyof F
        return <Campo key={k} etiqueta={`Valor inicial de x${i + 1}`} valor={c.valores[k]} onChange={(x) => c.set(k, x)} error={c.errores[k]} />
      })}
      <Campo etiqueta="Tolerancia" valor={c.valores.tol} onChange={(x) => c.set('tol', x)} error={c.errores.tol} />
      <Campo etiqueta="Máximo de iteraciones" valor={c.valores.maxIter} onChange={(x) => c.set('maxIter', x)} error={c.errores.maxIter} />
    </Calculadora>
  )
}
